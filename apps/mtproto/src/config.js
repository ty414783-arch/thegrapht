import crypto from "node:crypto";

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 3100),
  maxJsonBodyBytes: Number(process.env.MTPROTO_MAX_JSON_BODY_BYTES ?? 64 * 1024),
  maxFrameBytes: Number(process.env.MTPROTO_MAX_FRAME_BYTES ?? 1024 * 1024),
  sessionTtlMs: Number(process.env.MTPROTO_SESSION_TTL_MS ?? 15 * 60 * 1000),
  challengeTtlMs: Number(process.env.MTPROTO_CHALLENGE_TTL_MS ?? 60 * 1000),
  requestBodyTimeoutMs: Number(process.env.MTPROTO_REQUEST_BODY_TIMEOUT_MS ?? 25 * 1000),
  keepAliveTimeoutMs: Number(process.env.MTPROTO_KEEPALIVE_TIMEOUT_MS ?? 65 * 1000),
  headersTimeoutMs: Number(process.env.MTPROTO_HEADERS_TIMEOUT_MS ?? 70 * 1000),
  rateLimitWindowMs: Number(process.env.MTPROTO_RATE_LIMIT_WINDOW_MS ?? 60 * 1000),
  rateLimitMax: Number(process.env.MTPROTO_RATE_LIMIT_MAX ?? 120),
  serverSecret:
    process.env.MTPROTO_SERVER_SECRET ||
    process.env.JWT_SECRET ||
    crypto.randomBytes(32).toString("hex"),
  corsAllowedOrigins: String(
    process.env.CORS_ALLOWED_ORIGINS ??
      "http://localhost,http://127.0.0.1,http://localhost:80,http://127.0.0.1:80,http://localhost:5173,http://127.0.0.1:5173,https://thegrapht.su,https://www.thegrapht.su,https://web.thegrapht.su"
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
};
