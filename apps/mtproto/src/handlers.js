import crypto from "node:crypto";
import { config } from "./config.js";
import { protocol } from "./protocol.js";
import { sessions, randomToken, hashToken, sanitizeAccountId, createChallenge, safeEqual } from "./session.js";
import { createSecurityHeaders, hasTrustedBrowserOrigin } from "./security.js";

const nowIso = () => new Date().toISOString();

export const readRequestBody = (request, limitBytes, timeoutMs = config.requestBodyTimeoutMs) => {
  const contentLengthHeader = request.headers["content-length"];
  const contentLength = Number(Array.isArray(contentLengthHeader) ? contentLengthHeader[0] : contentLengthHeader);

  if (Number.isFinite(contentLength) && contentLength > limitBytes) {
    request.destroy();
    return Promise.reject(new Error("Body too large"));
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let receivedBytes = 0;
    let settled = false;
    let bodyTimeout = null;

    const fail = (error) => {
      if (settled) return;
      settled = true;
      if (bodyTimeout) {
        clearTimeout(bodyTimeout);
        bodyTimeout = null;
      }
      reject(error);
      request.destroy();
    };

    if (timeoutMs > 0) {
      bodyTimeout = setTimeout(() => {
        fail(new Error("Body read timeout"));
      }, timeoutMs);
    }

    request.on("data", (chunk) => {
      receivedBytes += chunk.length;
      if (receivedBytes > limitBytes) {
        fail(new Error("Body too large"));
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      if (settled) return;
      settled = true;
      if (bodyTimeout) {
        clearTimeout(bodyTimeout);
        bodyTimeout = null;
      }
      resolve(Buffer.concat(chunks));
    });

    request.on("error", fail);
  });
};

export const readJsonBody = async (request) => {
  const rawBody = await readRequestBody(request, config.maxJsonBodyBytes);
  if (rawBody.length === 0) {
    return {};
  }
  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new Error("Invalid JSON body");
  }
};

export const sendJson = (request, response, statusCode, payload, extraHeaders = {}) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...createSecurityHeaders(request),
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
};

export const sendBinaryFrame = (request, response, statusCode, payload) => {
  const body = Buffer.from(JSON.stringify(payload));
  response.writeHead(statusCode, {
    "Content-Type": protocol.frameContentType,
    "Content-Length": String(body.length),
    ...createSecurityHeaders(request)
  });
  response.end(body);
};

export const createSession = async (request, response) => {
  if (!hasTrustedBrowserOrigin(request)) {
    sendJson(request, response, 403, { error: "Origin is not allowed." });
    return;
  }

  const body = await readJsonBody(request);
  const accountId = sanitizeAccountId(body.accountId);
  const clientNonce = typeof body.clientNonce === "string" && body.clientNonce.length >= 16
    ? body.clientNonce.slice(0, 256)
    : randomToken(24);
  const sessionId = `thg_${crypto.randomUUID()}`;
  const serverNonce = randomToken(24);
  const createdAtMs = Date.now();
  const expiresAtMs = createdAtMs + config.sessionTtlMs;
  const challengeExpiresAtMs = createdAtMs + config.challengeTtlMs;
  const expiresAt = new Date(challengeExpiresAtMs).toISOString();
  const challenge = createChallenge({
    sessionId,
    accountId,
    clientNonce,
    serverNonce,
    expiresAt
  });

  sessions.set(sessionId, {
    id: sessionId,
    accountId,
    clientNonceHash: hashToken(clientNonce),
    serverNonceHash: hashToken(serverNonce),
    challengeHash: hashToken(challenge),
    state: "challenge-issued",
    createdAtMs,
    expiresAtMs,
    challengeExpiresAtMs,
    lastSeq: 0n,
    frameCount: 0,
    authKeyId: null
  });

  sendJson(request, response, 201, {
    sessionId,
    accountId,
    protocolVersion: protocol.protocolVersion,
    transport: "http-binary-frame",
    state: "challenge-issued",
    clientNonce,
    serverNonce,
    challenge,
    challengeExpiresAt: expiresAt,
    sessionExpiresAt: new Date(expiresAtMs).toISOString(),
    confirmUrl: `/api/v1/sessions/${encodeURIComponent(sessionId)}/confirm`,
    frameUrl: "/api/v1/transport/frame"
  });
};

export const confirmSession = async (request, response, sessionId) => {
  if (!hasTrustedBrowserOrigin(request)) {
    sendJson(request, response, 403, { error: "Origin is not allowed." });
    return;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    sendJson(request, response, 404, { error: "THG Protocol session not found." });
    return;
  }

  if (session.challengeExpiresAtMs <= Date.now()) {
    sessions.delete(sessionId);
    sendJson(request, response, 410, { error: "THG Protocol session challenge expired." });
    return;
  }

  const body = await readJsonBody(request);
  const challenge = typeof body.challenge === "string" ? body.challenge : "";
  const clientProof = typeof body.clientProof === "string" ? body.clientProof : challenge;

  if (!safeEqual(hashToken(challenge), session.challengeHash) || !safeEqual(hashToken(clientProof), session.challengeHash)) {
    sendJson(request, response, 401, { error: "Invalid THG Protocol session proof." });
    return;
  }

  session.state = "ready";
  session.authKeyId = crypto
    .createHash("sha256")
    .update(`${session.id}.${session.accountId}.${session.challengeHash}.${config.serverSecret}`)
    .digest("hex")
    .slice(0, 16);

  sendJson(request, response, 200, {
    sessionId: session.id,
    accountId: session.accountId,
    state: session.state,
    authKeyId: session.authKeyId,
    sessionExpiresAt: new Date(session.expiresAtMs).toISOString(),
    frameUrl: "/api/v1/transport/frame"
  });
};

export const getSessionStatus = (request, response, sessionId) => {
  if (!hasTrustedBrowserOrigin(request)) {
    sendJson(request, response, 403, { error: "Origin is not allowed." });
    return;
  }

  const sessionHeader = request.headers["x-thegrapht-mtp-session"];
  if (typeof sessionHeader !== "string" || sessionHeader !== sessionId) {
    sendJson(request, response, 401, { error: "Missing or invalid THG Protocol session header." });
    return;
  }

  const session = sessions.get(sessionId);
  if (!session || session.expiresAtMs <= Date.now()) {
    if (session) sessions.delete(sessionId);
    sendJson(request, response, 404, { error: "THG Protocol session not found." });
    return;
  }

  sendJson(request, response, 200, {
    sessionId: session.id,
    accountId: session.accountId,
    state: session.state,
    authKeyId: session.authKeyId,
    frameCount: session.frameCount,
    lastSeq: session.lastSeq.toString(),
    sessionExpiresAt: new Date(session.expiresAtMs).toISOString()
  });
};

export const handleTransportFrame = async (request, response) => {
  if (!hasTrustedBrowserOrigin(request)) {
    sendJson(request, response, 403, { error: "Origin is not allowed." });
    return;
  }

  const contentType = String(request.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
  if (![protocol.frameContentType, "application/x-thegrapht-mtproto-frame", "application/octet-stream"].includes(contentType)) {
    sendBinaryFrame(request, response, 415, {
      ok: false,
      error: `Unsupported frame content type. Use ${protocol.frameContentType}.`
    });
    return;
  }

  const sessionId = request.headers["x-thegrapht-mtp-session"];
  if (typeof sessionId !== "string") {
    sendJson(request, response, 401, { error: "Missing session header." });
    return;
  }

  const session = sessions.get(sessionId);
  if (!session || session.expiresAtMs <= Date.now() || session.state !== "ready") {
    sendJson(request, response, 401, { error: "Session invalid or expired." });
    return;
  }

  const rawSeq = request.headers["x-thegrapht-mtp-seq"];
  const seq = typeof rawSeq === "string" && /^\d+$/.test(rawSeq) ? BigInt(rawSeq) : null;

  if (seq === null || seq <= session.lastSeq) {
    sendBinaryFrame(request, response, 409, {
      ok: false,
      error: "Replay or invalid sequence number.",
      expectedSeqGreaterThan: session.lastSeq.toString()
    });
    return;
  }

  const frame = await readRequestBody(request, config.maxFrameBytes);
  if (frame.length === 0) {
    sendBinaryFrame(request, response, 400, { ok: false, error: "Empty THG Protocol frame." });
    return;
  }

  session.lastSeq = seq;
  session.frameCount += 1;
  session.expiresAtMs = Math.max(session.expiresAtMs, Date.now() + config.sessionTtlMs);

  const frameHash = crypto.createHash("sha256").update(frame).digest("hex");

  sendBinaryFrame(request, response, 202, {
    ok: true,
    sessionId: session.id,
    authKeyId: session.authKeyId,
    seq: seq.toString(),
    receivedBytes: frame.length,
    frameHash,
    acceptedAt: nowIso(),
    note: "Frame accepted by TheGraphT Protocol (THG Protocol) transport layer."
  });
};
