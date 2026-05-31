import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const waitForPort = async (port, attempts = 40) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.connect({ host: "127.0.0.1", port }, () => {
          socket.end();
          resolve();
        });
        socket.once("error", reject);
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  throw new Error("Timed out waiting for MTProto test server.");
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const payload = await response.json();
  return {
    status: response.status,
    payload,
    headers: response.headers
  };
};

test("mtproto session flow accepts confirmed binary frames end-to-end", async () => {
  const port = 33107;
  const child = spawn(process.execPath, ["src/index.js"], {
    cwd: join(__dirname, ".."),
    env: {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      JWT_SECRET: "mtproto-test-secret-mtproto-test-secret",
      CORS_ALLOWED_ORIGINS: "http://localhost:5175"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForPort(port);

    const createResponse = await requestJson(`http://127.0.0.1:${port}/api/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5175"
      },
      body: JSON.stringify({
        accountId: "u_test",
        clientNonce: "client_nonce_for_mtproto_test"
      })
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.payload.state, "challenge-issued");
    assert.equal(typeof createResponse.payload.sessionId, "string");

    const confirmResponse = await requestJson(
      `http://127.0.0.1:${port}${createResponse.payload.confirmUrl}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5175"
        },
        body: JSON.stringify({
          challenge: createResponse.payload.challenge,
          clientProof: createResponse.payload.challenge
        })
      }
    );

    assert.equal(confirmResponse.status, 200);
    assert.equal(confirmResponse.payload.state, "ready");

    const statusUnauthorized = await requestJson(
      `http://127.0.0.1:${port}/api/v1/sessions/${encodeURIComponent(createResponse.payload.sessionId)}`,
      {
        method: "GET",
        headers: {
          Origin: "http://localhost:5175"
        }
      }
    );
    assert.equal(statusUnauthorized.status, 401);

    const statusAuthorized = await requestJson(
      `http://127.0.0.1:${port}/api/v1/sessions/${encodeURIComponent(createResponse.payload.sessionId)}`,
      {
        method: "GET",
        headers: {
          Origin: "http://localhost:5175",
          "X-TheGraphT-MTP-Session": createResponse.payload.sessionId
        }
      }
    );
    assert.equal(statusAuthorized.status, 200);
    assert.equal(statusAuthorized.payload.sessionId, createResponse.payload.sessionId);

    const frameResponse = await fetch(`http://127.0.0.1:${port}/api/v1/transport/frame`, {
      method: "POST",
      headers: {
        Origin: "http://localhost:5175",
        "Content-Type": "application/x-thegrapht-mtproto-frame",
        "X-TheGraphT-MTP-Session": createResponse.payload.sessionId,
        "X-TheGraphT-MTP-Seq": "1"
      },
      body: Buffer.from("thegrapht-mtproto-frame")
    });
    const frameBody = await frameResponse.json();

    assert.equal(frameResponse.status, 202);
    assert.equal(frameBody.ok, true);
    assert.equal(frameBody.seq, "1");
    assert.equal(frameBody.receivedBytes, 23);

    const replayResponse = await fetch(`http://127.0.0.1:${port}/api/v1/transport/frame`, {
      method: "POST",
      headers: {
        Origin: "http://localhost:5175",
        "Content-Type": "application/x-thegrapht-mtproto-frame",
        "X-TheGraphT-MTP-Session": createResponse.payload.sessionId,
        "X-TheGraphT-MTP-Seq": "1"
      },
      body: Buffer.from("replay")
    });
    const replayBody = await replayResponse.json();

    assert.equal(replayResponse.status, 409);
    assert.match(replayBody.error, /Replay or invalid sequence number/);
  } finally {
    child.kill("SIGTERM");
    if (child.exitCode === null && child.signalCode === null) {
      await once(child, "exit");
    }
  }
});
