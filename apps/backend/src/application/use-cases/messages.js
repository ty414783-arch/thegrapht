import fs from "node:fs";

import {
  createAudioMessageForDialog,
  createImageMessageForDialog,
  createMessageForDialog,
  createSecureMessageForDialog,
  deleteMessageForEveryone,
  getMessageByIdForUser,
  getMessageMediaByIdForUser,
  getMessagesForDialog,
  getReplyTargetForDialog,
  hideMessageForUser
} from "../../services/messages.js";
import { getDialogByIdForUser, getDialogByPublicIdForUser } from "../../services/dialogs.js";
import { resolveUploadPath, saveUploadedAudio, saveUploadedImage } from "../../services/media.js";
import { readFormDataBody, readJsonBody, sendJson } from "../../utils/http.js";
import { deleteMessageSchema, mediaMessageSchema, messageSchema, secureMessageSchema } from "../../validation/schemas.js";
import { withTransaction } from "../../db/client.js";

export const handleCreateMessage = async (request, response, publicId, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    try {
      if (!context.ensureRateLimit(request, response, context.rateLimiters.message, user.id)) {
        return;
      }

      const dialog = await getDialogByPublicIdForUser(user.id, publicId);

      if (!dialog) {
        sendJson(request, response, 404, { error: "Dialog not found" });
        return;
      }

      const contentType = String(request.headers["content-type"] || "");
      let message = null;

      if (dialog.encryptionMode === "e2e_v1" && !contentType.includes("multipart/form-data")) {
        const body = context.parseWithSchema(secureMessageSchema, await readJsonBody(request));
        const replyTarget = body.replyToMessageId
          ? await getReplyTargetForDialog(user.id, dialog.id, body.replyToMessageId)
          : null;

        if (body.replyToMessageId && !replyTarget) {
          sendJson(request, response, 404, { error: "Сообщение для ответа не найдено." });
          return;
        }

        message = await createSecureMessageForDialog({
          dialogId: dialog.id,
          senderId: user.id,
          ciphertext: body.ciphertext,
          nonce: body.nonce,
          envelopeVersion: body.envelopeVersion,
          senderKeyId: body.senderKeyId ?? null,
          replyToMessageId: replyTarget?.id ?? null
        });
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await readFormDataBody(request);
        const parsed = context.parseWithSchema(mediaMessageSchema, {
          body: String(formData.get("body") ?? ""),
          albumId: formData.get("albumId") ? String(formData.get("albumId")) : undefined,
          albumIndex: formData.get("albumIndex") ? String(formData.get("albumIndex")) : undefined,
          albumSize: formData.get("albumSize") ? String(formData.get("albumSize")) : undefined,
          replyToMessageId: formData.get("replyToMessageId") ? String(formData.get("replyToMessageId")) : undefined
        });
        const replyTarget = parsed.replyToMessageId
          ? await getReplyTargetForDialog(user.id, dialog.id, parsed.replyToMessageId)
          : null;

        if (parsed.replyToMessageId && !replyTarget) {
          sendJson(request, response, 404, { error: "Сообщение для ответа не найдено." });
          return;
        }

        const file = formData.get("file");
        const normalizedMime = String(file?.type || "").toLowerCase();

        if (normalizedMime.startsWith("image/")) {
          const uploadedImage = await saveUploadedImage(file);
          message = await createImageMessageForDialog({
            dialogId: dialog.id,
            senderId: user.id,
            body: parsed.body,
            storedRelativePath: uploadedImage.storedRelativePath,
            mimeType: uploadedImage.mimeType,
            originalName: uploadedImage.originalName,
            size: uploadedImage.size,
            albumId: parsed.albumId ?? null,
            albumIndex: parsed.albumIndex ?? null,
            albumSize: parsed.albumSize ?? null,
            replyToMessageId: replyTarget?.id ?? null
          });
        } else if (normalizedMime.startsWith("audio/")) {
          const uploadedAudio = await saveUploadedAudio(file);
          message = await createAudioMessageForDialog({
            dialogId: dialog.id,
            senderId: user.id,
            body: parsed.body,
            storedRelativePath: uploadedAudio.storedRelativePath,
            mimeType: uploadedAudio.mimeType,
            originalName: uploadedAudio.originalName,
            size: uploadedAudio.size,
            durationSeconds: parsed.attachmentDurationSeconds ?? null,
            replyToMessageId: replyTarget?.id ?? null
          });
        } else {
          throw new Error("Only image or audio files are supported.");
        }
      } else {
        const body = context.parseWithSchema(messageSchema, await readJsonBody(request));
        const replyTarget = body.replyToMessageId
          ? await getReplyTargetForDialog(user.id, dialog.id, body.replyToMessageId)
          : null;

        if (body.replyToMessageId && !replyTarget) {
          sendJson(request, response, 404, { error: "Сообщение для ответа не найдено." });
          return;
        }

        message = await createMessageForDialog({
          dialogId: dialog.id,
          senderId: user.id,
          body: body.body,
          replyToMessageId: replyTarget?.id ?? null
        });
      }

      await context.realtimeHub.broadcastMessageCreated({ dialog, message });

      sendJson(request, response, 201, {
        dialog,
        message
      });
    } catch (error) {
      sendJson(request, response, 400, {
        error: error instanceof Error ? error.message : "Message sending failed."
      });
    }
  });
};

export const handleGetMessageMedia = async (request, response, messageId, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    const media = await getMessageMediaByIdForUser(user.id, messageId);

    if (!media?.attachmentPath || !media.attachmentMime) {
      sendJson(request, response, 404, { error: "Media not found" });
      return;
    }

    const filePath = resolveUploadPath(media.attachmentPath);

    if (!filePath) {
      sendJson(request, response, 404, { error: "Media not found" });
      return;
    }

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch {
      sendJson(request, response, 404, { error: "Media not found" });
      return;
    }

    let stats;
    try {
      stats = await fs.promises.stat(filePath);
    } catch {
      sendJson(request, response, 404, { error: "Media not found" });
      return;
    }

    const totalSize = Number(stats?.size) || 0;
    if (totalSize <= 0) {
      sendJson(request, response, 404, { error: "Media not found" });
      return;
    }

    const baseHeaders = {
      "Content-Type": media.attachmentMime,
      "Cache-Control": "private, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${encodeURIComponent(media.attachmentName || "file")}"`,
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes"
    };

    const rangeHeader = String(request.headers.range || "").trim();
    if (rangeHeader.startsWith("bytes=")) {
      const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/i);
      if (!match) {
        response.writeHead(416, {
          "Content-Range": `bytes */${totalSize}`,
          "Accept-Ranges": "bytes"
        });
        response.end();
        return;
      }

      const startRaw = match[1];
      const endRaw = match[2];
      let start = startRaw ? Number(startRaw) : NaN;
      let end = endRaw ? Number(endRaw) : NaN;

      if (!Number.isFinite(start) && Number.isFinite(end)) {
        const suffixLength = Math.max(0, end);
        start = Math.max(0, totalSize - suffixLength);
        end = totalSize - 1;
      } else {
        if (!Number.isFinite(start)) {
          start = 0;
        }
        if (!Number.isFinite(end)) {
          end = totalSize - 1;
        }
      }

      start = Math.floor(start);
      end = Math.floor(end);

      if (start < 0 || end < start || start >= totalSize) {
        response.writeHead(416, {
          "Content-Range": `bytes */${totalSize}`,
          "Accept-Ranges": "bytes"
        });
        response.end();
        return;
      }

      end = Math.min(end, totalSize - 1);
      const chunkSize = end - start + 1;

      response.writeHead(206, {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Content-Length": String(chunkSize)
      });

      fs.createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, {
      ...baseHeaders,
      "Content-Length": String(totalSize)
    });

    fs.createReadStream(filePath).pipe(response);
  });
};

export const handleDeleteMessage = async (request, response, messageId, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    try {
      if (!context.ensureRateLimit(request, response, context.rateLimiters.message, user.id)) {
        return;
      }

      const body = context.parseWithSchema(deleteMessageSchema, await readJsonBody(request));
      const message = await getMessageByIdForUser(user.id, messageId);

      if (!message) {
        sendJson(request, response, 404, { error: "Сообщение не найдено." });
        return;
      }

      const dialog = await getDialogByIdForUser(user.id, message.dialogId);

      if (!dialog) {
        sendJson(request, response, 404, { error: "Диалог не найден." });
        return;
      }

      let deletedForEveryone = false;

      await withTransaction(async (client) => {
        if (body.deleteForEveryone) {
          if (message.senderId !== user.id) {
            throw new Error("FORBIDDEN_DELETE_FOR_EVERYONE");
          }

          const deleted = await deleteMessageForEveryone(messageId, client);

          if (!deleted) {
            throw new Error("MESSAGE_NOT_FOUND");
          }

          deletedForEveryone = true;
          return;
        }

        await hideMessageForUser(messageId, user.id, client);
      });

      const nextDialog = await getDialogByIdForUser(user.id, dialog.id);

      await context.realtimeHub.broadcastMessageDeleted({
        dialog,
        messageId,
        deletedForEveryone,
        actorUserId: user.id,
        targetUserIds: deletedForEveryone ? [] : [user.id]
      });

      sendJson(request, response, 200, {
        ok: true,
        messageId,
        deletedForEveryone,
        dialog: nextDialog
      });
    } catch (error) {
      if (error instanceof Error && error.message === "FORBIDDEN_DELETE_FOR_EVERYONE") {
        sendJson(request, response, 403, { error: "Удаление у всех доступно только автору сообщения." });
        return;
      }

      if (error instanceof Error && error.message === "MESSAGE_NOT_FOUND") {
        sendJson(request, response, 404, { error: "Сообщение не найдено." });
        return;
      }

      sendJson(request, response, 400, {
        error: error instanceof Error ? error.message : "Удаление сообщения не удалось."
      });
    }
  });
};
