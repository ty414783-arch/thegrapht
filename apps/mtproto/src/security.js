import { config } from "./config.js";

export const rateBuckets = new Map();

export const normalizeIp = (rawValue) => {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }
  if (value.startsWith("::ffff:")) {
    return value.slice("::ffff:".length);
  }
  return value;
};

export const isLoopbackIp = (rawValue) => {
  const value = normalizeIp(rawValue).toLowerCase();
  return value === "127.0.0.1" || value === "::1" || value === "localhost";
};

export const resolveForwardedAddress = (forwardedForHeader) => {
  if (typeof forwardedForHeader !== "string" || !forwardedForHeader.trim()) {
    return "";
  }
  const candidates = forwardedForHeader
    .split(",")
    .map((item) => normalizeIp(item))
    .filter(Boolean);
  return candidates.length ? candidates[candidates.length - 1] : "";
};

export const getRequestIp = (request) => {
  const socketAddress = normalizeIp(request.socket.remoteAddress);
  if (isLoopbackIp(socketAddress)) {
    const forwardedAddress = resolveForwardedAddress(request.headers["x-forwarded-for"]);
    if (forwardedAddress) {
      return forwardedAddress;
    }
  }
  return socketAddress || "unknown";
};

export const ensureRateLimit = (request) => {
  const now = Date.now();
  const key = getRequestIp(request);
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + config.rateLimitWindowMs });
    return true;
  }

  current.count += 1;
  return current.count <= config.rateLimitMax;
};

export const resolveOrigin = (origin) => {
  if (!origin) {
    return null;
  }
  return config.corsAllowedOrigins.includes(origin) ? origin : null;
};

export const hasTrustedNativeClientHeader = (request) => {
  const value = request.headers["x-thegrapht-client"];
  return typeof value === "string" && /^(android|api|cli)$/i.test(value.trim());
};

export const hasTrustedBrowserOrigin = (request) => {
  if (request.headers.origin) {
    return Boolean(resolveOrigin(request.headers.origin));
  }
  if (typeof request.headers.authorization === "string" || hasTrustedNativeClientHeader(request)) {
    return true;
  }
  return !request.headers.cookie;
};

export const createSecurityHeaders = (request) => {
  const allowedOrigin = resolveOrigin(request.headers.origin);
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-TheGraphT-Client, X-TheGraphT-MTP-Session, X-TheGraphT-MTP-Seq",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": "no-store"
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
};
