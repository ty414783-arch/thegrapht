import crypto from "node:crypto";

import { queryMany, queryOne } from "../db/client.js";

const mediaUrlSqlByMessageId = (messageIdSql) =>
  `'https://cdn.thegrapht.su/v/' || translate(trim(trailing '=' from encode(convert_to(${messageIdSql}, 'UTF8'), 'base64')), '+/', '-_')`;

const messageSelectProjection = `
  SELECT
    msg.id,
    msg.body,
    msg.ciphertext,
    msg.nonce,
    msg.envelope_version AS "envelopeVersion",
    msg.sender_key_id AS "senderKeyId",
    msg.type,
    msg.album_id AS "albumId",
    msg.album_index AS "albumIndex",
    msg.album_size AS "albumSize",
    CASE
      WHEN msg.attachment_path IS NOT NULL THEN ${mediaUrlSqlByMessageId("msg.id")}
      ELSE NULL
    END AS "mediaUrl",
    msg.attachment_mime AS "attachmentMime",
    msg.attachment_name AS "attachmentName",
    msg.attachment_size AS "attachmentSize",
    msg.attachment_duration_seconds AS "attachmentDurationSeconds",
    msg.created_at AS "createdAt",
    msg.sender_id AS "senderId",
    u.name AS "senderName",
    CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.id ELSE NULL END AS "replyToMessageId",
    CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.sender_id ELSE NULL END AS "replyToSenderId",
    CASE WHEN reply_deleted.message_id IS NULL THEN reply_user.name ELSE NULL END AS "replyToSenderName",
    CASE WHEN reply_deleted.message_id IS NULL AND dialog_ctx.encryption_mode <> 'e2e_v1' THEN reply_msg.body ELSE NULL END AS "replyToBody",
    CASE WHEN reply_deleted.message_id IS NULL AND dialog_ctx.encryption_mode <> 'e2e_v1' THEN reply_msg.type ELSE NULL END AS "replyToType",
    CASE
      WHEN reply_deleted.message_id IS NULL AND dialog_ctx.encryption_mode <> 'e2e_v1' AND reply_msg.attachment_path IS NOT NULL THEN ${mediaUrlSqlByMessageId("reply_msg.id")}
      ELSE NULL
    END AS "replyToMediaUrl"
`;

const messageJoinProjection = `
  FROM messages msg
  JOIN dialogs dialog_ctx ON dialog_ctx.id = msg.dialog_id
  JOIN users u ON u.id = msg.sender_id
  LEFT JOIN message_deletions self_deleted
    ON self_deleted.message_id = msg.id
   AND self_deleted.user_id = $1
  LEFT JOIN messages reply_msg
    ON reply_msg.id = msg.reply_to_message_id
  LEFT JOIN message_deletions reply_deleted
    ON reply_deleted.message_id = reply_msg.id
   AND reply_deleted.user_id = $1
  LEFT JOIN users reply_user
    ON reply_user.id = reply_msg.sender_id
`;

export const getMessagesForDialog = async (userId, dialogId, beforeDate, beforeId, executor) => {
  const params = [userId, dialogId];
  let beforeCondition = "";
  if (beforeDate && beforeId) {
    params.push(beforeDate, beforeId);
    beforeCondition = `AND (msg.created_at, msg.id) < ($3::timestamptz, $4)`;
  } else if (beforeDate) {
    params.push(beforeDate);
    beforeCondition = `AND msg.created_at < $3::timestamptz`;
  }
  
  console.log(`[getMessagesForDialog] REQUEST userId=${userId}, dialogId=${dialogId}, beforeDate=${beforeDate}, beforeId=${beforeId}`);
  
  const result = await queryMany(
    `
      SELECT * FROM (
        ${messageSelectProjection}
        ${messageJoinProjection}
        WHERE msg.dialog_id = $2
          AND self_deleted.message_id IS NULL
          ${beforeCondition}
        ORDER BY msg.created_at DESC, msg.id DESC
        LIMIT 500
      ) sub
      ORDER BY sub."createdAt" ASC, sub.id ASC
    `,
    params,
    executor
  );
  
  console.log(`[getMessagesForDialog] RESULT count=${result.length}`);
  return result;
};

export const createMessageForDialog = ({ dialogId, senderId, body, replyToMessageId = null }, executor) =>
  queryOne(
    `
      WITH inserted AS (
        INSERT INTO messages (id, dialog_id, sender_id, body, reply_to_message_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, dialog_id, sender_id, body, ciphertext, nonce, envelope_version, sender_key_id, type, album_id, album_index, album_size, attachment_path, attachment_mime, attachment_name, attachment_size, attachment_duration_seconds, created_at, reply_to_message_id
      )
      SELECT
        inserted.id,
        inserted.body,
        inserted.ciphertext,
        inserted.nonce,
        inserted.envelope_version AS "envelopeVersion",
        inserted.sender_key_id AS "senderKeyId",
        inserted.type,
        inserted.album_id AS "albumId",
        inserted.album_index AS "albumIndex",
        inserted.album_size AS "albumSize",
        CASE
          WHEN inserted.attachment_path IS NOT NULL THEN ${mediaUrlSqlByMessageId("inserted.id")}
          ELSE NULL
        END AS "mediaUrl",
        inserted.attachment_mime AS "attachmentMime",
        inserted.attachment_name AS "attachmentName",
        inserted.attachment_size AS "attachmentSize",
        inserted.attachment_duration_seconds AS "attachmentDurationSeconds",
        inserted.created_at AS "createdAt",
        inserted.sender_id AS "senderId",
        u.name AS "senderName",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.id ELSE NULL END AS "replyToMessageId",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.sender_id ELSE NULL END AS "replyToSenderId",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_user.name ELSE NULL END AS "replyToSenderName",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.body ELSE NULL END AS "replyToBody",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.type ELSE NULL END AS "replyToType",
        CASE
          WHEN reply_deleted.message_id IS NULL AND reply_msg.attachment_path IS NOT NULL THEN ${mediaUrlSqlByMessageId("reply_msg.id")}
          ELSE NULL
        END AS "replyToMediaUrl"
      FROM inserted
      JOIN users u ON u.id = inserted.sender_id
      LEFT JOIN messages reply_msg
        ON reply_msg.id = inserted.reply_to_message_id
      LEFT JOIN message_deletions reply_deleted
        ON reply_deleted.message_id = reply_msg.id
       AND reply_deleted.user_id = inserted.sender_id
      LEFT JOIN users reply_user
        ON reply_user.id = reply_msg.sender_id
      LIMIT 1
    `,
    [`msg_${crypto.randomUUID()}`, dialogId, senderId, body, replyToMessageId],
    executor
  );

export const createImageMessageForDialog = ({
  dialogId,
  senderId,
  body,
  storedRelativePath,
  mimeType,
  originalName,
  size,
  albumId = null,
  albumIndex = null,
  albumSize = null,
  replyToMessageId = null
}, executor) =>
  queryOne(
    `
      WITH inserted AS (
        INSERT INTO messages (id, dialog_id, sender_id, body, type, album_id, album_index, album_size, attachment_path, attachment_mime, attachment_name, attachment_size, ciphertext, nonce, envelope_version, sender_key_id, reply_to_message_id)
        VALUES ($1, $2, $3, $4, 'image', $5, $6, $7, $8, $9, $10, $11, NULL, NULL, NULL, NULL, $12)
        RETURNING id, dialog_id, sender_id, body, ciphertext, nonce, envelope_version, sender_key_id, type, album_id, album_index, album_size, attachment_path, attachment_mime, attachment_name, attachment_size, attachment_duration_seconds, created_at, reply_to_message_id
      )
      SELECT
        inserted.id,
        inserted.body,
        inserted.ciphertext,
        inserted.nonce,
        inserted.envelope_version AS "envelopeVersion",
        inserted.sender_key_id AS "senderKeyId",
        inserted.type,
        inserted.album_id AS "albumId",
        inserted.album_index AS "albumIndex",
        inserted.album_size AS "albumSize",
        ${mediaUrlSqlByMessageId("inserted.id")} AS "mediaUrl",
        inserted.attachment_mime AS "attachmentMime",
        inserted.attachment_name AS "attachmentName",
        inserted.attachment_size AS "attachmentSize",
        inserted.attachment_duration_seconds AS "attachmentDurationSeconds",
        inserted.created_at AS "createdAt",
        inserted.sender_id AS "senderId",
        u.name AS "senderName",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.id ELSE NULL END AS "replyToMessageId",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.sender_id ELSE NULL END AS "replyToSenderId",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_user.name ELSE NULL END AS "replyToSenderName",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.body ELSE NULL END AS "replyToBody",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.type ELSE NULL END AS "replyToType",
        CASE
          WHEN reply_deleted.message_id IS NULL AND reply_msg.attachment_path IS NOT NULL THEN ${mediaUrlSqlByMessageId("reply_msg.id")}
          ELSE NULL
        END AS "replyToMediaUrl"
      FROM inserted
      JOIN users u ON u.id = inserted.sender_id
      LEFT JOIN messages reply_msg
        ON reply_msg.id = inserted.reply_to_message_id
      LEFT JOIN message_deletions reply_deleted
        ON reply_deleted.message_id = reply_msg.id
       AND reply_deleted.user_id = inserted.sender_id
      LEFT JOIN users reply_user
        ON reply_user.id = reply_msg.sender_id
      LIMIT 1
    `,
    [`msg_${crypto.randomUUID()}`, dialogId, senderId, body, albumId, albumIndex, albumSize, storedRelativePath, mimeType, originalName, size, replyToMessageId],
    executor
  );

export const createSecureMessageForDialog = ({
  dialogId,
  senderId,
  ciphertext,
  nonce,
  envelopeVersion = 1,
  senderKeyId = null,
  replyToMessageId = null
}, executor) =>
  queryOne(
    `
      WITH inserted AS (
        INSERT INTO messages (id, dialog_id, sender_id, body, ciphertext, nonce, envelope_version, sender_key_id, type, reply_to_message_id)
        VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, 'text', $8)
        RETURNING id, dialog_id, sender_id, body, ciphertext, nonce, envelope_version, sender_key_id, type, album_id, album_index, album_size, attachment_path, attachment_mime, attachment_name, attachment_size, attachment_duration_seconds, created_at, reply_to_message_id
      )
      SELECT
        inserted.id,
        inserted.body,
        inserted.ciphertext,
        inserted.nonce,
        inserted.envelope_version AS "envelopeVersion",
        inserted.sender_key_id AS "senderKeyId",
        inserted.type,
        inserted.album_id AS "albumId",
        inserted.album_index AS "albumIndex",
        inserted.album_size AS "albumSize",
        NULL AS "mediaUrl",
        inserted.attachment_mime AS "attachmentMime",
        inserted.attachment_name AS "attachmentName",
        inserted.attachment_size AS "attachmentSize",
        inserted.attachment_duration_seconds AS "attachmentDurationSeconds",
        inserted.created_at AS "createdAt",
        inserted.sender_id AS "senderId",
        u.name AS "senderName",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.id ELSE NULL END AS "replyToMessageId",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.sender_id ELSE NULL END AS "replyToSenderId",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_user.name ELSE NULL END AS "replyToSenderName",
        NULL AS "replyToBody",
        NULL AS "replyToType",
        NULL AS "replyToMediaUrl"
      FROM inserted
      JOIN users u ON u.id = inserted.sender_id
      LEFT JOIN messages reply_msg
        ON reply_msg.id = inserted.reply_to_message_id
      LEFT JOIN message_deletions reply_deleted
        ON reply_deleted.message_id = reply_msg.id
       AND reply_deleted.user_id = inserted.sender_id
      LEFT JOIN users reply_user
        ON reply_user.id = reply_msg.sender_id
      LIMIT 1
    `,
    [`msg_${crypto.randomUUID()}`, dialogId, senderId, ciphertext, nonce, envelopeVersion, senderKeyId, replyToMessageId],
    executor
  );

export const createAudioMessageForDialog = ({
  dialogId,
  senderId,
  body,
  storedRelativePath,
  mimeType,
  originalName,
  size,
  durationSeconds = null,
  replyToMessageId = null
}, executor) =>
  queryOne(
    `
      WITH inserted AS (
        INSERT INTO messages (id, dialog_id, sender_id, body, type, attachment_path, attachment_mime, attachment_name, attachment_size, attachment_duration_seconds, ciphertext, nonce, envelope_version, sender_key_id, reply_to_message_id)
        VALUES ($1, $2, $3, $4, 'audio', $5, $6, $7, $8, $9, NULL, NULL, NULL, NULL, $10)
        RETURNING id, dialog_id, sender_id, body, ciphertext, nonce, envelope_version, sender_key_id, type, album_id, album_index, album_size, attachment_path, attachment_mime, attachment_name, attachment_size, attachment_duration_seconds, created_at, reply_to_message_id
      )
      SELECT
        inserted.id,
        inserted.body,
        inserted.ciphertext,
        inserted.nonce,
        inserted.envelope_version AS "envelopeVersion",
        inserted.sender_key_id AS "senderKeyId",
        inserted.type,
        inserted.album_id AS "albumId",
        inserted.album_index AS "albumIndex",
        inserted.album_size AS "albumSize",
        ${mediaUrlSqlByMessageId("inserted.id")} AS "mediaUrl",
        inserted.attachment_mime AS "attachmentMime",
        inserted.attachment_name AS "attachmentName",
        inserted.attachment_size AS "attachmentSize",
        inserted.attachment_duration_seconds AS "attachmentDurationSeconds",
        inserted.created_at AS "createdAt",
        inserted.sender_id AS "senderId",
        u.name AS "senderName",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.id ELSE NULL END AS "replyToMessageId",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.sender_id ELSE NULL END AS "replyToSenderId",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_user.name ELSE NULL END AS "replyToSenderName",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.body ELSE NULL END AS "replyToBody",
        CASE WHEN reply_deleted.message_id IS NULL THEN reply_msg.type ELSE NULL END AS "replyToType",
        CASE
          WHEN reply_deleted.message_id IS NULL AND reply_msg.attachment_path IS NOT NULL THEN ${mediaUrlSqlByMessageId("reply_msg.id")}
          ELSE NULL
        END AS "replyToMediaUrl"
      FROM inserted
      JOIN users u ON u.id = inserted.sender_id
      LEFT JOIN messages reply_msg
        ON reply_msg.id = inserted.reply_to_message_id
      LEFT JOIN message_deletions reply_deleted
        ON reply_deleted.message_id = reply_msg.id
       AND reply_deleted.user_id = inserted.sender_id
      LEFT JOIN users reply_user
        ON reply_user.id = reply_msg.sender_id
      LIMIT 1
    `,
    [
      `msg_${crypto.randomUUID()}`,
      dialogId,
      senderId,
      body,
      storedRelativePath,
      mimeType,
      originalName,
      size,
      durationSeconds,
      replyToMessageId
    ],
    executor
  );

export const getReplyTargetForDialog = (userId, dialogId, messageId, executor) =>
  queryOne(
    `
      SELECT
        msg.id,
        msg.dialog_id AS "dialogId"
      FROM messages msg
      JOIN memberships membership
        ON membership.dialog_id = msg.dialog_id
       AND membership.user_id = $1
      LEFT JOIN message_deletions self_deleted
        ON self_deleted.message_id = msg.id
       AND self_deleted.user_id = $1
      WHERE msg.id = $2
        AND msg.dialog_id = $3
        AND self_deleted.message_id IS NULL
      LIMIT 1
    `,
    [userId, messageId, dialogId],
    executor
  );

export const getMessageByIdForUser = (userId, messageId, executor) =>
  queryOne(
    `
      SELECT
        msg.id,
        msg.dialog_id AS "dialogId",
        msg.sender_id AS "senderId",
        msg.type,
        msg.attachment_path AS "attachmentPath",
        msg.attachment_name AS "attachmentName"
      FROM messages msg
      JOIN memberships membership
        ON membership.dialog_id = msg.dialog_id
       AND membership.user_id = $1
      LEFT JOIN message_deletions self_deleted
        ON self_deleted.message_id = msg.id
       AND self_deleted.user_id = $1
      WHERE msg.id = $2
        AND self_deleted.message_id IS NULL
      LIMIT 1
    `,
    [userId, messageId],
    executor
  );

export const hideMessageForUser = (messageId, userId, executor) =>
  queryOne(
    `
      INSERT INTO message_deletions (message_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (message_id, user_id) DO UPDATE
      SET created_at = NOW()
      RETURNING message_id AS "messageId", user_id AS "userId"
    `,
    [messageId, userId],
    executor
  );

export const deleteMessageForEveryone = (messageId, executor) =>
  queryOne(
    `
      DELETE FROM messages
      WHERE id = $1
      RETURNING
        id,
        dialog_id AS "dialogId",
        sender_id AS "senderId",
        attachment_path AS "attachmentPath",
        attachment_name AS "attachmentName"
    `,
    [messageId],
    executor
  );

export const getMessageMediaByIdForUser = (userId, messageId, executor) =>
  queryOne(
    `
      SELECT
        msg.id,
        msg.dialog_id AS "dialogId",
        msg.attachment_path AS "attachmentPath",
        msg.attachment_mime AS "attachmentMime",
        msg.attachment_name AS "attachmentName"
      FROM messages msg
      JOIN memberships membership
        ON membership.dialog_id = msg.dialog_id
       AND membership.user_id = $1
      LEFT JOIN message_deletions self_deleted
        ON self_deleted.message_id = msg.id
       AND self_deleted.user_id = $1
      WHERE msg.id = $2
        AND msg.attachment_path IS NOT NULL
        AND self_deleted.message_id IS NULL
      LIMIT 1
    `,
    [userId, messageId],
    executor
  );
