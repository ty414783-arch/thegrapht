import crypto from "node:crypto";
import { config } from "./config.js";

export const sessions = new Map();

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");
export const hashToken = (value) => crypto.createHash("sha256").update(value).digest("base64url");

export const sanitizeAccountId = (value) => {
  if (typeof value !== "string") {
    return "guest";
  }
  const trimmed = value.trim();
  return /^[a-zA-Z0-9_.:@-]{1,160}$/.test(trimmed) ? trimmed : "guest";
};

export const createChallenge = ({ sessionId, accountId, clientNonce, serverNonce, expiresAt }) =>
  crypto
    .createHmac("sha256", config.serverSecret)
    .update(`${sessionId}.${accountId}.${clientNonce}.${serverNonce}.${expiresAt}`)
    .digest("base64url");

export const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const cleanupExpiredState = () => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAtMs <= now || (session.challengeExpiresAtMs <= now && session.state !== "ready")) {
      sessions.delete(sessionId);
    }
  }
};
