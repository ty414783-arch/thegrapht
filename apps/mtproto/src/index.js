import http from "node:http";
import { config } from "./config.js";
import { protocol } from "./protocol.js";
import { sessions, cleanupExpiredState } from "./session.js";
import { ensureRateLimit } from "./security.js";
import { sendJson, createSession, confirmSession, getSessionStatus, handleTransportFrame } from "./handlers.js";

const confirmSessionPattern = /^\/api\/v1\/sessions\/([^/]+)\/confirm$/;
const getSessionStatusPattern = /^\/api\/v1\/sessions\/([^/]+)$/;

const routeRequest = async (request, response) => {
  if (!request.url) {
    sendJson(request, response, 400, { error: "Missing URL" });
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-TheGraphT-Client, X-TheGraphT-MTP-Session, X-TheGraphT-MTP-Seq",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": request.headers.origin || "*"
    });
    response.end();
    return;
  }

  if (!ensureRateLimit(request)) {
    sendJson(request, response, 429, { error: "Too many requests. Please try again later." });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  if (url.pathname === "/health" && request.method === "GET") {
    sendJson(request, response, 200, {
      service: "thg-protocol",
      status: "ok",
      phase: protocol.phase,
      productionReady: protocol.productionReady,
      activeSessions: sessions.size
    });
    return;
  }

  if (url.pathname === "/api/v1/status" && request.method === "GET") {
    sendJson(request, response, 200, {
      service: protocol.service,
      phase: protocol.phase,
      protocolVersion: protocol.protocolVersion,
      productionReady: protocol.productionReady,
      transportMode: "modular-http-binary-frame",
      activeSessions: sessions.size
    });
    return;
  }

  if (url.pathname === "/api/v1/capabilities" && request.method === "GET") {
    sendJson(request, response, 200, {
      service: protocol.service,
      capabilities: {
        activeTransports: protocol.activeTransports,
        frameContentType: protocol.frameContentType,
        protocolVersion: protocol.protocolVersion,
        maxFrameBytes: config.maxFrameBytes,
        maxJsonBodyBytes: config.maxJsonBodyBytes,
        sessionTtlMs: config.sessionTtlMs,
        challengeTtlMs: config.challengeTtlMs,
        productionReady: protocol.productionReady,
        thgCompatibleTransport: protocol.thgCompatibleTransport
      }
    });
    return;
  }

  if ((url.pathname === "/api/v1/sessions" || url.pathname === "/api/v1/session") && request.method === "POST") {
    await createSession(request, response);
    return;
  }

  const confirmMatch = url.pathname.match(confirmSessionPattern);
  if (confirmMatch && request.method === "POST") {
    await confirmSession(request, response, decodeURIComponent(confirmMatch[1]));
    return;
  }

  const sessionStatusMatch = url.pathname.match(getSessionStatusPattern);
  if (sessionStatusMatch && request.method === "GET") {
    getSessionStatus(request, response, decodeURIComponent(sessionStatusMatch[1]));
    return;
  }

  if ((url.pathname === "/api/v1/transport/frame" || url.pathname === "/mtproto") && request.method === "POST") {
    await handleTransportFrame(request, response);
    return;
  }

  sendJson(request, response, 404, { error: "Not found" });
};

const server = http.createServer(async (request, response) => {
  try {
    await routeRequest(request, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "THG Protocol request failed";
    const statusCode = message.includes("too large") ? 413 : 400;
    sendJson(request, response, statusCode, { error: message });
  }
});

server.keepAliveTimeout = Math.max(1_000, config.keepAliveTimeoutMs);
server.headersTimeout = Math.max(server.keepAliveTimeout + 1_000, config.headersTimeoutMs);
server.requestTimeout = Math.max(server.keepAliveTimeout, config.requestBodyTimeoutMs * 2);

const cleanupTimer = setInterval(cleanupExpiredState, 10 * 1000);
cleanupTimer.unref();

server.listen(config.port, config.host, () => {
  console.log(`${protocol.service} listening on ${config.host}:${config.port}`);
});
