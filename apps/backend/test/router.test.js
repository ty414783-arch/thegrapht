import test from "node:test";
import assert from "node:assert/strict";

import { createHttpRouter } from "../src/transport/http/router.js";

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

test("router serves bootstrap contract without database dependencies", async () => {
  const handler = createHttpRouter({
    ensureRateLimit: () => true,
    rateLimiters: { general: {} }
  });

  const request = {
    url: "/api/v1/bootstrap",
    method: "GET",
    headers: {}
  };
  const response = createResponseRecorder();

  await handler(request, response);

  const payload = JSON.parse(response.state.body);
  assert.equal(response.state.statusCode, 200);
  assert.equal(payload.app, "TheGraphT");
  assert.equal(payload.capabilities.mtproto, "session-frame-v1");
  assert.equal(payload.capabilities.mtprotoProductionReady, false);
  assert.equal(typeof payload.capabilities.secureDirectChats, "boolean");
});
