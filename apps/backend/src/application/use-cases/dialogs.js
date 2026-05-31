import { createDirectDialogId, createGroupDialog, ensureDirectDialogBetweenUsers, getDialogByIdForUser, getDialogByPublicIdForUser, getDialogsForUser } from "../../services/dialogs.js";
import { sanitizeUser } from "../../services/auth.js";
import { getUserById, searchUsersByUsername } from "../../services/users.js";
import { readJsonBody, sendJson } from "../../utils/http.js";
import { withTransaction } from "../../db/client.js";
import { directDialogSchema, groupDialogSchema, searchUsersQuerySchema } from "../../validation/schemas.js";
import { getMessagesForDialog } from "../../services/messages.js";
import { config } from "../../config.js";
import { logger } from "../../utils/logger.js";

export const handleClientState = async (request, response, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
    const requestedPublicId = url.searchParams.get("publicId");
    const routeUsername = String(url.searchParams.get("routeUsername") || "").trim().toLowerCase().replace(/^@+/, "");
    const routeKind = String(url.searchParams.get("routeKind") || "").trim().toLowerCase();
    const routeKindNormalized = routeKind === "secret" ? "secret" : (routeKind === "cloud" ? "cloud" : "");
    const dialogs = await getDialogsForUser(user.id, config.dialogListLimit);
    const matchesRouteKind = (dialog) => {
      if (!dialog) {
        return false;
      }
      const isSecret = dialog.encryptionMode === "e2e_v1"
        && ["direct", "private", "secret"].includes(dialog.type);
      if (routeKindNormalized === "secret") {
        return isSecret;
      }
      if (routeKindNormalized === "cloud") {
        return ["direct", "private"].includes(dialog.type) && !isSecret;
      }
      return true;
    };
    let initialDialog = null;
    if (requestedPublicId) {
      const dialogByPublicId = await getDialogByPublicIdForUser(user.id, requestedPublicId);
      initialDialog = matchesRouteKind(dialogByPublicId) ? dialogByPublicId : null;
    } else if (routeUsername && routeKindNormalized) {
      initialDialog = dialogs.find((dialog) => (
        String(dialog.peerUsername || "").trim().toLowerCase() === routeUsername
        && matchesRouteKind(dialog)
      )) || null;
    }
    const selectedDialog = await context.markDirectDialogRead(user.id, initialDialog, context.realtimeHub);
    const messages = selectedDialog ? await getMessagesForDialog(user.id, selectedDialog.id) : [];

    sendJson(request, response, 200, {
      user: sanitizeUser(user),
      dialogs,
      selectedDialog,
      messages
    });
  });
};

export const handleUserSearch = async (request, response, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    if (!context.ensureRateLimit(request, response, context.rateLimiters.search, user.id)) {
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
    const query = context.parseWithSchema(searchUsersQuerySchema, {
      q: url.searchParams.get("q") || ""
    }).q;

    if (query.length < config.minUserSearchQueryLength) {
      sendJson(request, response, 200, { users: [] });
      return;
    }

    const users = await searchUsersByUsername({
      query,
      excludeUserId: user.id
    });

    logger.info({
      event: "user_search",
      userId: user.id,
      queryLength: query.length,
      matchedUsers: users.length
    }, "Processed user search request");

    sendJson(request, response, 200, { users });
  });
};

export const handleCreateDirectDialog = async (request, response, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    try {
      if (!context.ensureRateLimit(request, response, context.rateLimiters.general, user.id)) {
        return;
      }

      const body = context.parseWithSchema(directDialogSchema, await readJsonBody(request));
      const targetUserId = body.targetUserId;

      if (targetUserId === user.id) {
        sendJson(request, response, 400, { error: "Target user is required." });
        return;
      }

      const targetUser = await getUserById(targetUserId);

      if (!targetUser) {
        sendJson(request, response, 404, { error: "User not found." });
        return;
      }

      const dialogId = createDirectDialogId(user.id, targetUser.id);

      await withTransaction(async (client) => {
        await ensureDirectDialogBetweenUsers(user, targetUser, client);
      });

      const dialog = await getDialogByIdForUser(user.id, dialogId);

      sendJson(request, response, 200, {
        dialog,
        messages: await getMessagesForDialog(user.id, dialog.id)
      });
    } catch (error) {
      sendJson(request, response, 400, {
        error: error instanceof Error ? error.message : "Direct dialog creation failed."
      });
    }
  });
};

export const handleCreateGroupDialog = async (request, response, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    try {
      if (!context.ensureRateLimit(request, response, context.rateLimiters.general, user.id)) {
        return;
      }

      const body = context.parseWithSchema(groupDialogSchema, await readJsonBody(request));
      const normalizedMemberIds = Array.from(new Set((body.memberUserIds || []).filter((id) => id && id !== user.id)));

      const resolvedMembers = [];
      for (const memberUserId of normalizedMemberIds) {
        const targetUser = await getUserById(memberUserId);
        if (!targetUser) {
          sendJson(request, response, 404, { error: `User not found: ${memberUserId}` });
          return;
        }
        resolvedMembers.push(targetUser);
      }

      let createdDialogId = "";
      await withTransaction(async (client) => {
        const created = await createGroupDialog(
          user,
          body.title,
          resolvedMembers.map((member) => member.id),
          body.avatarDataUrl || null,
          client
        );
        createdDialogId = created.id;
      });

      const dialog = await getDialogByIdForUser(user.id, createdDialogId);
      await context.realtimeHub.broadcastDialogCreated({
        dialogId: createdDialogId,
        actorUserId: user.id
      });

      sendJson(request, response, 201, {
        dialog,
        messages: []
      });
    } catch (error) {
      sendJson(request, response, 400, {
        error: error instanceof Error ? error.message : "Group creation failed."
      });
    }
  });
};

export const handleGetDialogMessages = async (request, response, publicId, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    const initialDialog = await getDialogByPublicIdForUser(user.id, publicId);

    if (!initialDialog) {
      sendJson(request, response, 404, { error: "Dialog not found" });
      return;
    }

    const dialog = await context.markDirectDialogRead(user.id, initialDialog, context.realtimeHub);

    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
    const beforeDate = url.searchParams.get("beforeDate");
    const beforeId = url.searchParams.get("beforeId");

    logger.info({ userId: user.id, dialogId: dialog.id, beforeDate, beforeId }, "Fetching messages for dialog");

    const messages = await getMessagesForDialog(user.id, dialog.id, beforeDate, beforeId);
    
    logger.info({ count: messages.length }, "Fetched messages count");

    sendJson(request, response, 200, {
      dialog,
      messages
    });
  });
};

export const handleMarkDialogRead = async (request, response, publicId, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    const dialog = await getDialogByPublicIdForUser(user.id, publicId);

    if (!dialog) {
      sendJson(request, response, 404, { error: "Dialog not found" });
      return;
    }

    await context.markDirectDialogRead(user.id, dialog, context.realtimeHub);
    sendJson(request, response, 200, { ok: true });
  });
};
