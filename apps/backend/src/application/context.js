import { config } from "../config.js";
import {
  createClearedSessionCookie,
  getUserFromRequest
} from "../services/auth.js";
import { markDialogRead, getDialogByIdForUser } from "../services/dialogs.js";
import { sendJson } from "../utils/http.js";
import { createRateLimiter } from "../utils/rate-limit.js";

const authRateLimiter = createRateLimiter({
  windowMs: config.authWindowMs,
  max: config.authMaxRequests,
  keyPrefix: "auth"
});

const searchRateLimiter = createRateLimiter({
  windowMs: config.searchWindowMs,
  max: config.searchMaxRequests,
  keyPrefix: "search"
});

const messageRateLimiter = createRateLimiter({
  windowMs: config.messageWindowMs,
  max: config.messageMaxRequests,
  keyPrefix: "message"
});

const generalRateLimiter = createRateLimiter({
  windowMs: config.generalWindowMs,
  max: config.generalMaxRequests,
  keyPrefix: "general"
});

export const parseWithSchema = (schema, payload) => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    throw new Error(firstIssue?.message || "Invalid request payload.");
  }

  return result.data;
};

export const ensureRateLimit = (request, response, limiter, scope) => {
  const limitState = limiter(request, scope);

  if (limitState.allowed) {
    return true;
  }

  sendJson(
    request,
    response,
    429,
    { error: "Too many requests. Please try again later." },
    { "Retry-After": String(Math.ceil(limitState.retryAfterMs / 1000)) }
  );

  return false;
};

export const withAuthorizedUser = async (request, response, handler) => {
  const user = await getUserFromRequest(request);

  if (!user || user.isSystem) {
    sendJson(request, response, 401, { error: "Unauthorized" }, {
      "Set-Cookie": createClearedSessionCookie(request)
    });
    return;
  }

  await handler(user);
};

export const markDirectDialogRead = async (userId, dialog, realtimeHub) => {
  if (!dialog || !["direct", "private", "secret", "group"].includes(dialog.type)) {
    return dialog;
  }

  const readState = await markDialogRead(userId, dialog.id);

  if (readState?.readAt) {
    await realtimeHub.broadcastDialogRead({
      dialogId: dialog.id,
      readerUserId: userId,
      readAt: readState.readAt
    });
  }

  return getDialogByIdForUser(userId, dialog.id);
};

export const rateLimiters = {
  auth: authRateLimiter,
  search: searchRateLimiter,
  message: messageRateLimiter,
  general: generalRateLimiter
};
