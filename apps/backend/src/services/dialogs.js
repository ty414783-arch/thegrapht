import crypto from "node:crypto";

import { config } from "../config.js";
import { query, queryMany, queryOne } from "../db/client.js";

export const createPublicId = (seed) => {
  const digest = crypto.createHash("sha256").update(seed).digest();
  let digits = "";

  for (const byte of digest) {
    digits += String(byte % 10);

    if (digits.length >= 7) {
      break;
    }
  }

  return `-100${digits.padEnd(7, "0")}`;
};

export const createDirectDialogId = (userA, userB) => {
  const [first, second] = [userA, userB].sort();
  return `dlg_direct_${first}_${second}`;
};

export const createSecureDirectDialogId = (userA, userB) => {
  const [first, second] = [userA, userB].sort();
  return `dlg_secure_${first}_${second}`;
};

const dialogProjection = `
  SELECT
    d.id,
    CASE
      WHEN d.type = 'saved' THEN $2
      ELSE d.public_id
    END AS "publicId",
    d.type,
    d.avatar_url AS "avatarUrl",
    d.encryption_mode AS "encryptionMode",
    d.encryption_version AS "encryptionVersion",
    (d.encryption_mode = 'e2e_v1') AS "isSecureSupported",
    CASE
      WHEN d.type = 'direct' THEN COALESCE(peer.name, d.title)
      ELSE d.title
    END AS title,
    peer.user_id AS "peerUserId",
    peer.username AS "peerUsername",
    peer.last_seen_at AS "peerLastSeenAt",
    CASE
      WHEN d.type = 'saved' THEN 'Only for you'
      WHEN d.type = 'direct' THEN CASE WHEN peer.username IS NOT NULL THEN '@' || peer.username ELSE NULL END
      WHEN d.type = 'group' THEN 'Group'
      WHEN d.type = 'channel' THEN 'Channel'
      WHEN d.type = 'secret' THEN 'Secret chat'
      WHEN d.type = 'private' THEN 'Private chat'
      ELSE NULL
    END AS subtitle,
    CASE
      WHEN d.type IN ('direct', 'private', 'secret') THEN (
        SELECT MAX(other_membership.last_read_at)
        FROM memberships other_membership
        WHERE other_membership.dialog_id = d.id
          AND other_membership.user_id <> $1
      )
      ELSE NULL
    END AS "peerReadAt",
    CASE
      WHEN d.type = 'saved' THEN 1
      ELSE COALESCE(member_counts.participants, 0)
    END AS participants,
    CASE
      WHEN d.type = 'group' THEN COALESCE(group_members.members, '[]'::json)
      ELSE NULL
    END AS "groupMembers",
    COALESCE(unread_counts.unread_count, 0) AS "unreadCount"
  FROM dialogs d
  JOIN memberships self_membership ON self_membership.dialog_id = d.id
  LEFT JOIN LATERAL (
    SELECT other_user.id AS user_id, other_user.name, other_user.username, other_user.last_seen_at
    FROM memberships other_membership
    JOIN users other_user ON other_user.id = other_membership.user_id
    WHERE other_membership.dialog_id = d.id
      AND other_membership.user_id <> $1
    ORDER BY other_membership.joined_at ASC, other_membership.user_id ASC
    LIMIT 1
  ) peer ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS participants
    FROM memberships membership_count
    WHERE membership_count.dialog_id = d.id
  ) member_counts ON true
  LEFT JOIN LATERAL (
    SELECT JSON_AGG(
      JSON_BUILD_OBJECT(
        'userId', membership.user_id,
        'name', member_user.name,
        'username', member_user.username,
        'role', membership.role,
        'lastSeenAt', member_user.last_seen_at,
        'joinedAt', membership.joined_at
      )
      ORDER BY
        CASE membership.role
          WHEN 'owner' THEN 0
          WHEN 'admin' THEN 1
          ELSE 2
        END,
        membership.joined_at ASC,
        membership.user_id ASC
    ) AS members
    FROM memberships membership
    JOIN users member_user ON member_user.id = membership.user_id
    WHERE membership.dialog_id = d.id
      AND d.type = 'group'
  ) group_members ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS unread_count
    FROM messages unread_message
    LEFT JOIN message_deletions unread_deleted
      ON unread_deleted.message_id = unread_message.id
     AND unread_deleted.user_id = $1
    WHERE unread_message.dialog_id = d.id
      AND unread_message.sender_id <> $1
      AND unread_deleted.message_id IS NULL
      AND (
        self_membership.last_read_at IS NULL
        OR unread_message.created_at > self_membership.last_read_at
      )
  ) unread_counts ON true
`;

export const getDialogsForUser = (userId, limit = config.dialogListLimit, executor) =>
  queryMany(
    `
      SELECT
        d.id,
        CASE
          WHEN d.type = 'saved' THEN $2
          ELSE d.public_id
        END AS "publicId",
        d.type,
        d.avatar_url AS "avatarUrl",
        d.encryption_mode AS "encryptionMode",
        d.encryption_version AS "encryptionVersion",
        (d.encryption_mode = 'e2e_v1') AS "isSecureSupported",
        CASE
          WHEN d.type = 'direct' THEN COALESCE(peer.name, d.title)
          ELSE d.title
        END AS title,
        peer.user_id AS "peerUserId",
        peer.username AS "peerUsername",
        peer.last_seen_at AS "peerLastSeenAt",
        CASE
          WHEN d.type = 'saved' THEN 'Only for you'
          WHEN d.type = 'direct' THEN CASE WHEN peer.username IS NOT NULL THEN '@' || peer.username ELSE NULL END
          WHEN d.type = 'group' THEN 'Group'
          WHEN d.type = 'channel' THEN 'Channel'
          WHEN d.type = 'secret' THEN 'Secret chat'
          WHEN d.type = 'private' THEN 'Private chat'
          ELSE NULL
        END AS subtitle,
        CASE
          WHEN d.type = 'saved' THEN 1
          ELSE COALESCE(member_counts.participants, 0)
        END AS participants,
        COALESCE(
        CASE
          WHEN d.encryption_mode = 'e2e_v1' AND last_message.id IS NOT NULL THEN 'Encrypted message'
          WHEN d.encryption_mode = 'e2e_v1' THEN 'Secure messages'
          WHEN last_message.type = 'image' AND COALESCE(NULLIF(last_message.body, ''), '') <> '' THEN 'Photo: ' || last_message.body
          WHEN last_message.type = 'image' THEN 'Photo'
          WHEN last_message.type = 'audio' AND COALESCE(NULLIF(last_message.body, ''), '') <> '' THEN 'Audio: ' || last_message.body
          WHEN last_message.type = 'audio' THEN 'Audio'
          ELSE NULLIF(last_message.body, '')
          END,
          CASE
            WHEN d.type = 'saved' THEN 'Your personal space'
            WHEN d.type = 'direct' THEN 'Direct messages'
            WHEN d.type = 'group' THEN 'Group conversation'
            WHEN d.type = 'channel' THEN 'Channel is waiting for posts'
            WHEN d.type = 'secret' THEN 'Secure dialog'
            WHEN d.type = 'private' THEN 'Private chat'
            ELSE 'Empty chat'
          END
        ) AS "lastMessagePreview",
        CASE
          WHEN last_message.sender_id = $1 THEN 'You'
          ELSE last_message.sender_name
        END AS "lastMessageSenderName",
        last_message.id AS "lastMessageId",
        last_message.type AS "lastMessageType",
        CASE
          WHEN d.encryption_mode = 'e2e_v1' THEN last_message.ciphertext
          ELSE NULL
        END AS "lastMessageCiphertext",
        CASE
          WHEN d.encryption_mode = 'e2e_v1' THEN last_message.nonce
          ELSE NULL
        END AS "lastMessageNonce",
        CASE
          WHEN d.encryption_mode = 'e2e_v1' THEN last_message.sender_key_id
          ELSE NULL
        END AS "lastMessageSenderKeyId",
        COALESCE(last_message.created_at, d.created_at) AS "lastMessageCreatedAt",
        COALESCE(unread_counts.unread_count, 0) AS "unreadCount"
      FROM memberships self_membership
      JOIN dialogs d ON d.id = self_membership.dialog_id
      LEFT JOIN LATERAL (
        SELECT other_user.id AS user_id, other_user.name, other_user.username, other_user.last_seen_at
        FROM memberships other_membership
        JOIN users other_user ON other_user.id = other_membership.user_id
        WHERE other_membership.dialog_id = d.id
          AND other_membership.user_id <> $1
        ORDER BY other_membership.joined_at ASC, other_membership.user_id ASC
        LIMIT 1
      ) peer ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS participants
        FROM memberships membership_count
        WHERE membership_count.dialog_id = d.id
      ) member_counts ON true
      LEFT JOIN LATERAL (
        SELECT
          msg.id,
          msg.body,
          msg.ciphertext,
          msg.nonce,
          msg.sender_key_id,
          msg.type,
          msg.created_at,
          msg.sender_id,
          sender_user.name AS sender_name
        FROM messages msg
        JOIN users sender_user ON sender_user.id = msg.sender_id
        LEFT JOIN message_deletions self_deleted
          ON self_deleted.message_id = msg.id
         AND self_deleted.user_id = $1
        WHERE msg.dialog_id = d.id
          AND self_deleted.message_id IS NULL
        ORDER BY msg.created_at DESC, msg.id DESC
        LIMIT 1
      ) last_message ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS unread_count
        FROM messages unread_message
        LEFT JOIN message_deletions unread_deleted
          ON unread_deleted.message_id = unread_message.id
         AND unread_deleted.user_id = $1
        WHERE unread_message.dialog_id = d.id
          AND unread_message.sender_id <> $1
          AND unread_deleted.message_id IS NULL
          AND (
            self_membership.last_read_at IS NULL
            OR unread_message.created_at > self_membership.last_read_at
          )
      ) unread_counts ON true
      WHERE self_membership.user_id = $1
      ORDER BY
        CASE WHEN d.type = 'saved' THEN 0 ELSE 1 END,
        COALESCE(last_message.created_at, d.created_at) DESC,
        d.title ASC
      LIMIT $3
    `,
    [userId, config.savedMessagesPublicId, Math.max(20, Number(limit) || config.dialogListLimit)],
    executor
  );

export const getDialogByIdForUser = (userId, dialogId, executor) =>
  queryOne(
    `
      ${dialogProjection}
      WHERE self_membership.user_id = $1
        AND d.id = $3
      LIMIT 1
    `,
    [userId, config.savedMessagesPublicId, dialogId],
    executor
  );

export const getDialogByPublicIdForUser = (userId, publicId, executor) =>
  queryOne(
    `
      ${dialogProjection}
      WHERE self_membership.user_id = $1
        AND (
          d.public_id = $3
          OR (d.type = 'saved' AND $3 = $2)
        )
      LIMIT 1
    `,
    [userId, config.savedMessagesPublicId, publicId],
    executor
  );

export const getUserIdsForDialog = async (dialogId, executor) => {
  const rows = await queryMany(
    `
      SELECT user_id AS "userId"
      FROM memberships
      WHERE dialog_id = $1
      ORDER BY user_id ASC
    `,
    [dialogId],
    executor
  );

  return rows.map((row) => row.userId);
};

export const getRelatedUserIdsForUser = async (userId, executor) => {
  const rows = await queryMany(
    `
      SELECT DISTINCT other_membership.user_id AS "userId"
      FROM memberships self_membership
      JOIN memberships other_membership
        ON other_membership.dialog_id = self_membership.dialog_id
       AND other_membership.user_id <> self_membership.user_id
      WHERE self_membership.user_id = $1
      ORDER BY "userId" ASC
    `,
    [userId],
    executor
  );

  return rows.map((row) => row.userId);
};

export const markDialogRead = (userId, dialogId, executor) =>
  queryOne(
    `
      UPDATE memberships
      SET last_read_at = NOW()
      WHERE user_id = $1
        AND dialog_id = $2
      RETURNING last_read_at AS "readAt"
    `,
    [userId, dialogId],
    executor
  );

export const ensurePublicIds = async () => {
  const rows = await queryMany(
    `
      SELECT id
      FROM dialogs
      WHERE public_id IS NULL
      ORDER BY id ASC
    `
  );

  for (const row of rows) {
    await query(
      `
        UPDATE dialogs
        SET public_id = $2
        WHERE id = $1
      `,
      [row.id, createPublicId(row.id)]
    );
  }
};

export const ensureSavedMessagesDialogForUser = async (user, executor) => {
  const dialogId = `dlg_saved_${user.id}`;

  await query(
    `
      INSERT INTO dialogs (id, public_id, type, title, created_by)
      VALUES ($1, $2, 'saved', 'Saved Messages', $3)
      ON CONFLICT (id) DO NOTHING
    `,
    [dialogId, createPublicId(dialogId), user.id],
    executor
  );

  await query(
    `
      INSERT INTO memberships (id, dialog_id, user_id, role)
      VALUES ($1, $2, $3, 'owner')
      ON CONFLICT (dialog_id, user_id) DO NOTHING
    `,
    [`mem_saved_${user.id}`, dialogId, user.id],
    executor
  );
};

export const ensureDirectDialogBetweenUsers = async (initiatorUser, targetUser, executor) => {
  const dialogId = createDirectDialogId(initiatorUser.id, targetUser.id);
  const publicId = createPublicId(dialogId);

  await query(
    `
      INSERT INTO dialogs (id, public_id, type, title, created_by)
      VALUES ($1, $2, 'direct', $3, $4)
      ON CONFLICT (id) DO NOTHING
    `,
    [dialogId, publicId, `${initiatorUser.name}, ${targetUser.name}`, initiatorUser.id],
    executor
  );

  await query(
    `
      INSERT INTO memberships (id, dialog_id, user_id, role)
      VALUES
        ($1, $2, $3, 'member'),
        ($4, $2, $5, 'member')
      ON CONFLICT (dialog_id, user_id) DO NOTHING
    `,
    [
      `mem_${dialogId}_${initiatorUser.id}`,
      dialogId,
      initiatorUser.id,
      `mem_${dialogId}_${targetUser.id}`,
      targetUser.id
    ],
    executor
  );

  return { id: dialogId, publicId };
};

export const ensureSecureDirectDialogBetweenUsers = async (
  initiatorUser,
  targetUser,
  {
    creatorKeyEnvelope,
    recipientKeyEnvelope,
    keyAlgorithm = "X25519",
    encryptionVersion = 1
  },
  executor
) => {
  const dialogId = createSecureDirectDialogId(initiatorUser.id, targetUser.id);
  const publicId = createPublicId(dialogId);

  await query(
    `
      INSERT INTO dialogs (id, public_id, type, title, created_by, encryption_mode, encryption_version)
      VALUES ($1, $2, 'direct', $3, $4, 'e2e_v1', $5)
      ON CONFLICT (id) DO UPDATE
      SET
        encryption_mode = EXCLUDED.encryption_mode,
        encryption_version = EXCLUDED.encryption_version
    `,
    [dialogId, publicId, `${initiatorUser.name}, ${targetUser.name}`, initiatorUser.id, encryptionVersion],
    executor
  );

  await query(
    `
      INSERT INTO memberships (id, dialog_id, user_id, role, secure_key_envelope, secure_key_algorithm)
      VALUES
        ($1, $2, $3, 'member', $4, $6),
        ($5, $2, $7, 'member', $8, $6)
      ON CONFLICT (dialog_id, user_id) DO UPDATE
      SET
        secure_key_envelope = COALESCE(memberships.secure_key_envelope, EXCLUDED.secure_key_envelope),
        secure_key_algorithm = COALESCE(memberships.secure_key_algorithm, EXCLUDED.secure_key_algorithm)
    `,
    [
      `mem_${dialogId}_${initiatorUser.id}`,
      dialogId,
      initiatorUser.id,
      creatorKeyEnvelope,
      `mem_${dialogId}_${targetUser.id}`,
      keyAlgorithm,
      targetUser.id,
      recipientKeyEnvelope
    ],
    executor
  );

  return { id: dialogId, publicId };
};

export const createGroupDialog = async (creatorUser, title, memberUserIds = [], avatarUrl = null, executor) => {
  const uniqueMemberIds = Array.from(new Set((memberUserIds || []).filter((id) => id && id !== creatorUser.id)));
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const dialogId = `dlg_group_${Date.now()}_${randomSuffix}`;
  const publicId = createPublicId(dialogId);

  await query(
    `
      INSERT INTO dialogs (id, public_id, type, title, created_by)
      VALUES ($1, $2, 'group', $3, $4)
    `,
    [dialogId, publicId, title, creatorUser.id],
    executor
  );

  if (avatarUrl) {
    await query(
      `
        UPDATE dialogs
        SET avatar_url = $2
        WHERE id = $1
      `,
      [dialogId, avatarUrl],
      executor
    );
  }

  await query(
    `
      INSERT INTO groups (dialog_id, description)
      VALUES ($1, '')
      ON CONFLICT (dialog_id) DO NOTHING
    `,
    [dialogId],
    executor
  );

  await query(
    `
      INSERT INTO memberships (id, dialog_id, user_id, role)
      VALUES ($1, $2, $3, 'owner')
    `,
    [`mem_${dialogId}_${creatorUser.id}`, dialogId, creatorUser.id],
    executor
  );

  for (const memberUserId of uniqueMemberIds) {
    await query(
      `
        INSERT INTO memberships (id, dialog_id, user_id, role)
        VALUES ($1, $2, $3, 'member')
        ON CONFLICT (dialog_id, user_id) DO NOTHING
      `,
      [`mem_${dialogId}_${memberUserId}`, dialogId, memberUserId],
      executor
    );
  }

  return { id: dialogId, publicId };
};

export const getSecureDialogBootstrapForUser = (userId, publicId, executor) =>
  queryOne(
    `
      SELECT
        d.id,
        d.public_id AS "publicId",
        d.type,
        d.encryption_mode AS "encryptionMode",
        d.encryption_version AS "encryptionVersion",
        self_membership.secure_key_envelope AS "keyEnvelope",
        self_membership.secure_key_algorithm AS "keyAlgorithm",
        peer_user.id AS "peerUserId",
        peer_user.name AS "peerName",
        peer_user.e2e_public_key AS "peerPublicKey",
        peer_user.e2e_key_algorithm AS "peerKeyAlgorithm"
      FROM dialogs d
      JOIN memberships self_membership
        ON self_membership.dialog_id = d.id
       AND self_membership.user_id = $1
      LEFT JOIN memberships peer_membership
        ON peer_membership.dialog_id = d.id
       AND peer_membership.user_id <> $1
      LEFT JOIN users peer_user
        ON peer_user.id = peer_membership.user_id
      WHERE d.public_id = $2
        AND d.encryption_mode = 'e2e_v1'
      LIMIT 1
    `,
    [userId, publicId],
    executor
  );

export const seedUserWorkspace = async (user, executor) => {
  void user;
  void executor;
};
