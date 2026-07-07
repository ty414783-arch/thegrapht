import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { config } from "../config.js";
import { query, queryOne } from "../db/client.js";

const PASSWORD_HASH_VERSION = "s2";
const SCRYPT_PARAMS = {
  N: 1 << 15,
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024
};

const withPepper = (password) => String(password) + String(config.passwordPepper || "");
const deriveScryptHex = (password, salt, params = SCRYPT_PARAMS) =>
  crypto.scryptSync(
    password,
    salt,
    64,
    {
      N: Number(params.N),
      r: Number(params.r),
      p: Number(params.p),
      maxmem: Number(params.maxmem) || (256 * 1024 * 1024)
    }
  ).toString("hex");

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = deriveScryptHex(withPepper(password), salt, SCRYPT_PARAMS);
  return `${PASSWORD_HASH_VERSION}$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${hash}`;
};

export const verifyPassword = (password, passwordHash) => {
  const normalizedHash = String(passwordHash || "");
  if (!normalizedHash) {
    return false;
  }

  try {
    if (normalizedHash.startsWith(`${PASSWORD_HASH_VERSION}$`)) {
      const [, nRaw, rRaw, pRaw, salt, storedHash] = normalizedHash.split("$");
      const n = Number(nRaw);
      const r = Number(rRaw);
      const p = Number(pRaw);

      if (!salt || !storedHash || !Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) {
        return false;
      }

      const computedHash = deriveScryptHex(withPepper(password), salt, { N: n, r, p });
      const storedBuffer = Buffer.from(storedHash, "hex");
      const computedBuffer = Buffer.from(computedHash, "hex");

      if (
        storedBuffer.length === 0
        || computedBuffer.length === 0
        || storedBuffer.length !== computedBuffer.length
      ) {
        return false;
      }

      return crypto.timingSafeEqual(storedBuffer, computedBuffer);
    }

    // Legacy format compatibility: "<salt>:<hash>".
    const [salt, storedHash] = normalizedHash.split(":");
    if (!salt || !storedHash) {
      return false;
    }

    const candidates = [String(password)];
    const peppered = withPepper(password);
    if (peppered !== String(password)) {
      candidates.push(peppered);
    }

    const storedBuffer = Buffer.from(storedHash, "hex");
    if (storedBuffer.length === 0) {
      return false;
    }

    for (const candidate of candidates) {
      const computedHash = crypto.scryptSync(candidate, salt, 64).toString("hex");
      const computedBuffer = Buffer.from(computedHash, "hex");

      if (computedBuffer.length !== storedBuffer.length) {
        continue;
      }

      if (crypto.timingSafeEqual(storedBuffer, computedBuffer)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export const sanitizeUser = (user) => ({
  id: user.id,
  displayName: user.name,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatarUrl || null,
  isSecureSupported: config.secureDirectChatsEnabled
});

export const buildUsernameCandidate = (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || "user";
  return `${base}${crypto.randomBytes(3).toString("hex")}`;
};

export const createUserId = () => `u_${crypto.randomUUID()}`;

const parseCookies = (cookieHeader) => {
  if (!cookieHeader) {
    return {};
  }

  const entries = String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf("=");
      const key = separatorIndex === -1 ? part : part.slice(0, separatorIndex);
      const value = separatorIndex === -1 ? "" : part.slice(separatorIndex + 1);
      return [key, decodeURIComponent(value)];
    });

  const result = {};
  // Keep first value when duplicate cookie names are present.
  entries.forEach(([key, value]) => {
    if (result[key] === undefined) {
      result[key] = value;
    }
  });
  return result;
};

const getCookieValuesByName = (cookieHeader, name) => {
  if (!cookieHeader || !name) {
    return [];
  }

  return String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf("=");
      const key = separatorIndex === -1 ? part : part.slice(0, separatorIndex);
      const value = separatorIndex === -1 ? "" : part.slice(separatorIndex + 1);
      return [key, decodeURIComponent(value)];
    })
    .filter(([key]) => key === name)
    .map(([, value]) => value)
    .filter(Boolean);
};

const serializeCookie = (name, value, options = {}) => {
  const segments = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    segments.push(`Path=${options.path}`);
  }

  if (options.domain) {
    segments.push(`Domain=${options.domain}`);
  }

  if (options.httpOnly) {
    segments.push("HttpOnly");
  }

  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    segments.push("Secure");
  }

  if (options.priority) {
    segments.push(`Priority=${options.priority}`);
  }

  return segments.join("; ");
};

const isSecureRequest = (request) => {
  const forwardedProto = String(request.headers["x-forwarded-proto"] ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();

  return forwardedProto === "https" || Boolean(request.socket.encrypted);
};

const signSessionToken = ({ userId, sessionId, sessionToken }) =>
  jwt.sign(
    {
      sub: userId,
      sid: sessionId,
      st: sessionToken
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience
    }
  );

export const createSession = async (userId, executor) => {
  const sessionId = `sess_${crypto.randomUUID()}`;
  const sessionToken = `stk_${crypto.randomBytes(24).toString("hex")}`;

  await query(
    `
      WITH created_session AS (
        INSERT INTO sessions (id, user_id, token)
        VALUES ($1, $2, $3)
        RETURNING user_id
      )
      UPDATE users
      SET last_seen_at = NOW()
      WHERE id IN (SELECT user_id FROM created_session)
    `,
    [sessionId, userId, sessionToken],
    executor
  );

  return signSessionToken({ userId, sessionId, sessionToken });
};

const verifySessionToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, config.jwtSecret, {
      issuer: config.jwtIssuer,
      audience: config.jwtAudience
    });
  } catch {
    return null;
  }
};

export const getTokenFromRequest = (request) => {
  const authorization = request.headers.authorization ?? "";

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  const cookies = parseCookies(request.headers.cookie);
  return cookies[config.sessionCookieName] ?? "";
};

export const getUserFromToken = (token, executor) => {
  const claims = verifySessionToken(token);

  if (!claims || typeof claims.sub !== "string" || typeof claims.sid !== "string" || typeof claims.st !== "string") {
    return null;
  }

  return queryOne(
    `
      WITH matched_session AS (
        UPDATE sessions
        SET last_seen_at = NOW()
        WHERE id = $1
          AND user_id = $2
          AND token = $3
        RETURNING user_id
      ),
      touched_user AS (
        UPDATE users
        SET last_seen_at = NOW()
        WHERE id IN (SELECT user_id FROM matched_session)
        RETURNING id
      )
      SELECT u.id, u.name, u.username, u.email, u.is_system AS "isSystem", u.avatar_url AS "avatarUrl"
      FROM touched_user
      JOIN users u ON u.id = touched_user.id
      LIMIT 1
    `,
    [claims.sid, claims.sub, claims.st],
    executor
  );
};

export const getUserFromRequest = async (request, executor) => {
  const authorization = request.headers.authorization ?? "";

  if (authorization.startsWith("Bearer ")) {
    const bearerUser = await getUserFromToken(authorization.slice(7), executor);
    if (bearerUser) {
      return bearerUser;
    }
  }

  // Support token in query parameter (crucial for WebSocket authentication)
  if (request.url) {
    try {
      const parsedUrl = new URL(request.url, "http://localhost");
      const queryToken = parsedUrl.searchParams.get("token");
      if (queryToken) {
        const queryUser = await getUserFromToken(queryToken, executor);
        if (queryUser) {
          return queryUser;
        }
      }
    } catch {
      // ignore URL parsing errors
    }
  }

  const cookieHeader = request.headers.cookie;
  const cookieCandidates = getCookieValuesByName(cookieHeader, config.sessionCookieName);
  if (cookieCandidates.length > 0) {
    for (const candidate of cookieCandidates) {
      // Try each duplicate session cookie value; browsers can send stale + fresh.
      // First valid token wins.
      const cookieUser = await getUserFromToken(candidate, executor);
      if (cookieUser) {
        return cookieUser;
      }
    }
  }

  return null;
};

export const deleteSessionFromToken = async (token, executor) => {
  const claims = verifySessionToken(token);

  if (!claims || typeof claims.sid !== "string" || typeof claims.sub !== "string" || typeof claims.st !== "string") {
    return false;
  }

  const result = await query(
    `
      WITH touched_user AS (
        UPDATE users
        SET last_seen_at = NOW()
        WHERE id = $2
        RETURNING id
      )
      DELETE FROM sessions
      WHERE id = $1
        AND user_id IN (SELECT id FROM touched_user)
        AND token = $3
    `,
    [claims.sid, claims.sub, claims.st],
    executor
  );

  return result.rowCount > 0;
};

export const createSessionCookie = (request, token) =>
  serializeCookie(config.sessionCookieName, token, {
    path: "/",
    domain: config.sessionCookieDomain || undefined,
    httpOnly: true,
    sameSite: "Lax",
    secure: isSecureRequest(request),
    maxAge: 60 * 60 * 24 * 30,
    priority: "High"
  });

export const createClearedSessionCookie = (request) =>
  serializeCookie(config.sessionCookieName, "", {
    path: "/",
    domain: config.sessionCookieDomain || undefined,
    httpOnly: true,
    sameSite: "Lax",
    secure: isSecureRequest(request),
    maxAge: 0,
    priority: "High"
  });
