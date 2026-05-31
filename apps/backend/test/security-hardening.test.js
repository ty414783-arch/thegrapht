import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createRealtimeHub } from "../src/realtime/index.js";
import { createHttpRouter } from "../src/transport/http/router.js";
import { hasTrustedBrowserOrigin } from "../src/utils/http.js";
import { createRateLimiter } from "../src/utils/rate-limit.js";
import { buildHtml } from "../../frontend/src/server/page-template.js";
import { htmlSecurityHeaders } from "../../frontend/src/server/security.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const createResponseRecorder = () => {
  const state = {
    statusCode: null,
    headers: null,
    body: ""
  };

  return {
    state,
    writeHead(statusCode, headers) {
      state.statusCode = statusCode;
      state.headers = headers;
    },
    end(chunk = "") {
      state.body += chunk;
    }
  };
};

const createSocketRecorder = () => {
  const socket = new EventEmitter();
  socket.output = "";
  socket.destroyed = false;
  socket.write = (chunk) => {
    socket.output += String(chunk);
  };
  socket.destroy = () => {
    socket.destroyed = true;
  };
  return socket;
};

const uiFlags = Object.freeze({
  telegramTopBar: true,
  desktopInterFont: true,
  desktopSideGuttersOnly: true,
  sidebarAccountCardHidden: true
});

test("frontend CSP does not allow inline scripts", () => {
  const csp = htmlSecurityHeaders["Content-Security-Policy"];

  assert.match(csp, /script-src 'self'/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
});

test("frontend html loads external client script instead of inline script", () => {
  const html = buildHtml({
    clientScriptUrl: "/app.js",
    manifestUrl: "/manifest.webmanifest",
    logoDataUrl: "data:image/jpeg;base64,",
    wallpaperDataUrl: "data:image/png;base64,",
    emojiIconDataUrl: "data:image/png;base64,",
    settingsKeyboardIconDataUrl: "data:image/png;base64,",
    sendButtonIconDataUrl: "data:image/png;base64,",
    uiFlags
  });

  assert.match(html, /<script src="\/app\.js" defer><\/script>/);
  assert.doesNotMatch(html, /<script>\s*const explicitApiBase/);
  assert.match(html, /id="app-progress"/);
  assert.match(html, /Material Symbols Rounded/);
  assert.match(html, /material-symbols-rounded/);
});

test("frontend render templates escape user-controlled attributes and text", () => {
  const sidebarSource = fs.readFileSync(path.join(rootDir, "apps/frontend/src/server/client/sidebar.js"), "utf8");
  const searchSource = fs.readFileSync(path.join(rootDir, "apps/frontend/src/server/client/search.js"), "utf8");
  const mediaSource = fs.readFileSync(path.join(rootDir, "apps/frontend/src/server/client/media.js"), "utf8");
  const secureUseCaseSource = fs.readFileSync(path.join(rootDir, "apps/backend/src/application/use-cases/e2e.js"), "utf8");
  const dialogsServiceSource = fs.readFileSync(path.join(rootDir, "apps/backend/src/services/dialogs.js"), "utf8");
  const handlersSource = fs.readFileSync(path.join(rootDir, "apps/frontend/src/server/handlers.js"), "utf8");

  assert.match(sidebarSource, /data-search-user-id="' \+ escapeHtml\(user\.id\)/);
  assert.match(sidebarSource, /data-dialog-id="' \+ escapeHtml\(dialog\.id\)/);
  assert.match(sidebarSource, /data-public-id="' \+ escapeHtml\(dialog\.publicId\)/);
  assert.match(searchSource, /CSS\.escape\(messageId\)/);
  assert.match(mediaSource, /renderEmojiAwareTextHtml\(formatDialogPreview\(dialog\)\)/);
  assert.match(mediaSource, /linkifyMessageBody\(message\.body\)/);
  assert.match(secureUseCaseSource, /createSecureDirectDialogId/);
  assert.match(secureUseCaseSource, /existingSecureDialog/);
  assert.match(dialogsServiceSource, /COALESCE\(memberships\.secure_key_envelope, EXCLUDED\.secure_key_envelope\)/);
  assert.match(handlersSource, /request\.url\.endsWith\("\.map"\)/);
});

test("cookie-auth mutating requests need a trusted browser origin", () => {
  assert.equal(hasTrustedBrowserOrigin({
    headers: {
      cookie: "thegrapht_session=token"
    }
  }), false);

  assert.equal(hasTrustedBrowserOrigin({
    headers: {
      cookie: "thegrapht_session=token",
      "x-thegrapht-client": "android"
    }
  }), false);

  assert.equal(hasTrustedBrowserOrigin({
    headers: {
      authorization: "Bearer token"
    }
  }), true);
});

test("router rejects cookie-auth mutating requests without origin", async () => {
  const handler = createHttpRouter({
    ensureRateLimit: () => true,
    rateLimiters: { general: {}, auth: {} }
  });
  const request = {
    url: "/api/v1/auth/logout",
    method: "POST",
    headers: {
      cookie: "thegrapht_session=token"
    }
  };
  const response = createResponseRecorder();

  await handler(request, response);

  assert.equal(response.state.statusCode, 403);
  assert.deepEqual(JSON.parse(response.state.body), { error: "Origin is not allowed." });
});

test("websocket upgrade rejects untrusted browser origins before auth", async () => {
  const hub = createRealtimeHub({
    getUserFromRequest: async () => ({ id: "u_1" }),
    getUserIdsForDialog: async () => [],
    getRelatedUserIdsForUser: async () => [],
    touchUserLastSeen: async () => null
  });
  const socket = createSocketRecorder();

  await hub.handleUpgrade({
    url: "/ws",
    headers: {
      host: "localhost",
      origin: "https://evil.example",
      "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ=="
    }
  }, socket);

  assert.equal(socket.destroyed, true);
  assert.match(socket.output, /^HTTP\/1\.1 403 Forbidden/);
});

test("websocket upgrade rejects cookie-auth without origin", async () => {
  const hub = createRealtimeHub({
    getUserFromRequest: async () => ({ id: "u_1" }),
    getUserIdsForDialog: async () => [],
    getRelatedUserIdsForUser: async () => [],
    touchUserLastSeen: async () => null
  });
  const socket = createSocketRecorder();

  await hub.handleUpgrade({
    url: "/ws",
    headers: {
      host: "localhost",
      cookie: "thegrapht_session=token",
      "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ=="
    }
  }, socket);

  assert.equal(socket.destroyed, true);
  assert.match(socket.output, /^HTTP\/1\.1 403 Forbidden/);
});

test("rate limiter does not trust spoofed x-forwarded-for on non-loopback sockets", () => {
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 1,
    keyPrefix: "test"
  });

  const request = {
    headers: {
      "x-forwarded-for": "203.0.113.11"
    },
    socket: {
      remoteAddress: "198.51.100.10"
    }
  };

  const first = limiter(request, "scope");
  const second = limiter(request, "scope");

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, false);
});
