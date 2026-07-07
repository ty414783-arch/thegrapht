import { queryMany, queryOne } from "../db/client.js";

export const getAllUsers = () =>
  queryMany(
    `
      SELECT id, name, username, email
      FROM users
      WHERE is_system = FALSE
      ORDER BY created_at ASC, id ASC
    `
  );

export const getUserByEmail = (email, executor) =>
  queryOne(
    `
      SELECT
        id,
        name,
        username,
        email,
        is_system AS "isSystem",
        password_hash AS "passwordHash",
        telegram_id AS "telegramId",
        telegram_username AS "telegramUsername",
        avatar_url AS "avatarUrl"
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
    executor
  );

export const getUserById = (userId, executor) =>
  queryOne(
    `
      SELECT id, name, username, email, avatar_url AS "avatarUrl"
      FROM users
      WHERE id = $1
        AND is_system = FALSE
      LIMIT 1
    `,
    [userId],
    executor
  );

export const updateUserAvatar = (userId, avatarUrl, executor) =>
  queryOne(
    `
      UPDATE users
      SET avatar_url = $2
      WHERE id = $1
      RETURNING id, name, username, email, avatar_url AS "avatarUrl"
    `,
    [userId, avatarUrl],
    executor
  );

export const searchUsersByUsername = ({ query, excludeUserId }, executor) =>
  queryMany(
    `
      SELECT id, name, username
      FROM users
      WHERE id <> $1
        AND is_system = FALSE
        AND username ILIKE $2
      ORDER BY
        CASE WHEN username ILIKE $3 THEN 0 ELSE 1 END,
        username ASC
      LIMIT 12
    `,
    [excludeUserId, `${query}%`, query],
    executor
  );

export const getUserKeyBundleById = (userId, executor) =>
  queryOne(
    `
      SELECT
        id,
        e2e_public_key AS "publicKey",
        e2e_key_algorithm AS algorithm,
        e2e_key_uploaded_at AS "uploadedAt"
      FROM users
      WHERE id = $1
        AND is_system = FALSE
        AND e2e_public_key IS NOT NULL
      LIMIT 1
    `,
    [userId],
    executor
  );

export const upsertUserKeyBundle = ({ userId, publicKey, algorithm }, executor) =>
  queryOne(
    `
      UPDATE users
      SET
        e2e_public_key = $2,
        e2e_key_algorithm = $3,
        e2e_key_uploaded_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        e2e_public_key AS "publicKey",
        e2e_key_algorithm AS algorithm,
        e2e_key_uploaded_at AS "uploadedAt"
    `,
    [userId, publicKey, algorithm],
    executor
  );

export const createUser = ({ id, name, username, email, passwordHash, telegramId, telegramUsername }, executor) =>
  queryOne(
    `
      INSERT INTO users (id, name, username, email, password_hash, telegram_id, telegram_username)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, username, email
    `,
    [id, name, username, email, passwordHash, telegramId || null, telegramUsername || null],
    executor
  );

export const touchUserLastSeen = (userId, executor) =>
  queryOne(
    `
      UPDATE users
      SET last_seen_at = NOW()
      WHERE id = $1
      RETURNING last_seen_at AS "lastSeenAt"
    `,
    [userId],
    executor
  );
