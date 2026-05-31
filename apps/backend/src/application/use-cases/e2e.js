import { withTransaction } from "../../db/client.js";
import { config } from "../../config.js";
import {
  createSecureDirectDialogId,
  createDirectDialogId,
  ensureSecureDirectDialogBetweenUsers,
  getDialogByIdForUser,
  getDialogByPublicIdForUser,
  getSecureDialogBootstrapForUser
} from "../../services/dialogs.js";
import { getUserById, getUserKeyBundleById, upsertUserKeyBundle } from "../../services/users.js";
import { readJsonBody, sendJson } from "../../utils/http.js";
import { e2eKeyBundleSchema, secureDirectDialogSchema } from "../../validation/schemas.js";

const ensureSecureChatsEnabled = (request, response) => {
  if (config.secureDirectChatsEnabled) {
    return true;
  }

  sendJson(request, response, 404, { error: "Secure direct chats are disabled." });
  return false;
};

export const handlePublishOwnKeyBundle = async (request, response, context) => {
  if (!ensureSecureChatsEnabled(request, response)) {
    return;
  }

  await context.withAuthorizedUser(request, response, async (user) => {
    if (!context.ensureRateLimit(request, response, context.rateLimiters.general, `e2e-key:${user.id}`)) {
      return;
    }

    const body = context.parseWithSchema(e2eKeyBundleSchema, await readJsonBody(request));
    const bundle = await upsertUserKeyBundle({
      userId: user.id,
      publicKey: body.publicKey,
      algorithm: body.algorithm
    });

    sendJson(request, response, 200, {
      userId: bundle.id,
      publicKey: bundle.publicKey,
      algorithm: bundle.algorithm,
      uploadedAt: bundle.uploadedAt
    });
  });
};

export const handleGetUserKeyBundle = async (request, response, userId, context) => {
  if (!ensureSecureChatsEnabled(request, response)) {
    return;
  }

  await context.withAuthorizedUser(request, response, async (user) => {
    if (!context.ensureRateLimit(request, response, context.rateLimiters.general, `e2e-key-read:${user.id}`)) {
      return;
    }

    const bundle = await getUserKeyBundleById(userId);

    if (!bundle) {
      sendJson(request, response, 404, { error: "User key bundle not found." });
      return;
    }

    sendJson(request, response, 200, bundle);
  });
};

export const handleCreateSecureDirectDialog = async (request, response, context) => {
  if (!ensureSecureChatsEnabled(request, response)) {
    return;
  }

  await context.withAuthorizedUser(request, response, async (user) => {
    if (!context.ensureRateLimit(request, response, context.rateLimiters.general, `secure-dialog:${user.id}`)) {
      return;
    }

    try {
      const body = context.parseWithSchema(secureDirectDialogSchema, await readJsonBody(request));
      if (!body.explicit) {
        sendJson(request, response, 400, { error: "Explicit secret chat action is required." });
        return;
      }

      if (body.targetUserId === user.id) {
        sendJson(request, response, 400, { error: "Target user is required." });
        return;
      }

      const [targetUser, initiatorBundle, targetBundle] = await Promise.all([
        getUserById(body.targetUserId),
        getUserKeyBundleById(user.id),
        getUserKeyBundleById(body.targetUserId)
      ]);

      if (!targetUser) {
        sendJson(request, response, 404, { error: "User not found." });
        return;
      }

      if (!initiatorBundle || !targetBundle) {
        sendJson(request, response, 409, { error: "Both users must publish secure key bundles first." });
        return;
      }

      const dialogId = createDirectDialogId(user.id, targetUser.id);
      const legacyDialog = await getDialogByIdForUser(user.id, dialogId);

      if (legacyDialog?.encryptionMode === "e2e_v1") {
        sendJson(request, response, 409, { error: "Secure dialog already exists." });
        return;
      }

      const secureDialogId = createSecureDirectDialogId(user.id, targetUser.id);
      const existingSecureDialog = await getDialogByIdForUser(user.id, secureDialogId);
      if (existingSecureDialog?.encryptionMode === "e2e_v1") {
        sendJson(request, response, 200, {
          dialog: existingSecureDialog,
          messages: []
        });
        return;
      }

      const createdSecureDialog = await withTransaction(async (client) => {
        return ensureSecureDirectDialogBetweenUsers(
          user,
          targetUser,
          {
            creatorKeyEnvelope: body.creatorKeyEnvelope,
            recipientKeyEnvelope: body.recipientKeyEnvelope,
            keyAlgorithm: body.keyAlgorithm,
            encryptionVersion: body.encryptionVersion
          },
          client
        );
      });

      const dialog = await getDialogByIdForUser(user.id, createdSecureDialog.id);

      sendJson(request, response, 201, {
        dialog,
        messages: []
      });
    } catch (error) {
      sendJson(request, response, 400, {
        error: error instanceof Error ? error.message : "Secure direct dialog creation failed."
      });
    }
  });
};

export const handleGetSecureDialogBootstrap = async (request, response, publicId, context) => {
  if (!ensureSecureChatsEnabled(request, response)) {
    return;
  }

  await context.withAuthorizedUser(request, response, async (user) => {
    const dialog = await getDialogByPublicIdForUser(user.id, publicId);

    if (!dialog || dialog.encryptionMode !== "e2e_v1") {
      sendJson(request, response, 404, { error: "Secure dialog not found." });
      return;
    }

    const bootstrap = await getSecureDialogBootstrapForUser(user.id, publicId);

    if (!bootstrap?.keyEnvelope) {
      sendJson(request, response, 404, { error: "Secure dialog bootstrap unavailable." });
      return;
    }

    sendJson(request, response, 200, {
      dialog,
      keyEnvelope: bootstrap.keyEnvelope,
      keyAlgorithm: bootstrap.keyAlgorithm,
      peer: bootstrap.peerUserId
        ? {
            userId: bootstrap.peerUserId,
            name: bootstrap.peerName,
            publicKey: bootstrap.peerPublicKey,
            algorithm: bootstrap.peerKeyAlgorithm
          }
        : null
    });
  });
};
