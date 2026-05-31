/**
 * Load test helpers for TheGraphT messenger.
 * Pure Node.js — no external dependencies.
 */
import http from "node:http";
import crypto from "node:crypto";
import { WebSocket } from "ws";
import pg from "pg";

const API_BASE = process.env.LOAD_TEST_API_BASE || "http://127.0.0.1:3001";
const WS_BASE = process.env.LOAD_TEST_WS_BASE || "ws://127.0.0.1:3001/ws";

// Initialize PostgreSQL client pool to fetch verification codes
const pgPool = new pg.Pool({
  host: process.env.POSTGRES_HOST || "127.0.0.1",
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  database: process.env.POSTGRES_DB || "thegrapht_dev",
  user: process.env.POSTGRES_USER || "thegrapht_dev",
  password: process.env.POSTGRES_PASSWORD || "",
});

export const closeHelpers = async () => {
  await pgPool.end();
};

const getVerificationCode = async (email) => {
  // Retry querying the verification code a few times in case database write takes a microsecond
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await pgPool.query(
      "SELECT code FROM email_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
      [email]
    );
    if (res.rows[0]?.code) {
      return res.rows[0].code;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Verification code not found for email ${email}`);
};

export const getOriginHeader = () => {
  const dbName = process.env.POSTGRES_DB || "thegrapht_dev";
  if (dbName.includes("dev")) {
    return "http://localhost:5185";
  }
  return "http://localhost:5175";
};

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

const jsonRequest = (method, path, body = null, headers = {}) =>
  new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        accept: "application/json",
        ...headers,
        ...(body && typeof body === "string" ? { "content-type": "application/json" } : {})
      }
    };

    const request = http.request(options, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        try {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: JSON.parse(raw)
          });
        } catch {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: raw
          });
        }
      });
    });

    request.on("error", reject);
    request.setTimeout(15000, () => {
      request.destroy(new Error("Request timeout"));
    });

    if (body && typeof body === "string") {
      request.write(body);
    }
    request.end();
  });

// ---------------------------------------------------------------------------
// User lifecycle
// ---------------------------------------------------------------------------

const generateUniqueSuffix = () =>
  crypto.randomBytes(6).toString("hex");

/**
 * Register a new test user. Returns { userId, token, cookie, username, email }.
 */
export const registerUser = async (prefix = "loadtest") => {
  const suffix = generateUniqueSuffix();
  const username = `${prefix}_${suffix}`;
  const email = `${username}@loadtest.local`;
  const password = "LoadTest_" + suffix + "!";
  const name = `Load User ${suffix.slice(0, 4)}`;

  // Step 1: POST to register
  const registerResult = await jsonRequest(
    "POST",
    "/api/v1/auth/register",
    JSON.stringify({ name, username, email, password }),
    { origin: getOriginHeader() }
  );

  if (registerResult.status !== 200 && registerResult.status !== 201) {
    throw new Error(
      `Register failed (${registerResult.status}): ${JSON.stringify(registerResult.body)}`
    );
  }

  // If registration bypassed verification and returned user/token immediately
  if (registerResult.body?.token) {
    const setCookie = registerResult.headers["set-cookie"];
    const cookie = Array.isArray(setCookie)
      ? setCookie.map((c) => c.split(";")[0]).join("; ")
      : (setCookie || "").split(";")[0];
    const token = registerResult.body?.token || "";

    return {
      userId: registerResult.body?.user?.id || registerResult.body?.userId || "",
      token,
      cookie,
      username,
      email,
      name,
      password
    };
  }

  // Step 2: Retrieve the verification code from DB
  const code = await getVerificationCode(email);

  // Step 3: POST to verify
  const verifyResult = await jsonRequest(
    "POST",
    "/api/v1/auth/verify",
    JSON.stringify({ email, code }),
    { origin: getOriginHeader() }
  );

  if (verifyResult.status !== 200) {
    throw new Error(
      `Verify failed (${verifyResult.status}): ${JSON.stringify(verifyResult.body)}`
    );
  }

  const setCookie = verifyResult.headers["set-cookie"];
  const cookie = Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(";")[0]).join("; ")
    : (setCookie || "").split(";")[0];
  const token = verifyResult.body?.token || "";

  return {
    userId: verifyResult.body?.user?.id || verifyResult.body?.userId || "",
    token,
    cookie,
    username,
    email,
    name,
    password
  };
};

/**
 * Login with existing credentials. Returns { userId, token, cookie }.
 */
export const loginUser = async (email, password) => {
  // Step 1: POST to login
  const loginResult = await jsonRequest(
    "POST",
    "/api/v1/auth/login",
    JSON.stringify({ email, password }),
    { origin: getOriginHeader() }
  );

  if (loginResult.status !== 200) {
    throw new Error(
      `Login failed (${loginResult.status}): ${JSON.stringify(loginResult.body)}`
    );
  }

  // If login bypassed verification and returned user/token immediately
  if (loginResult.body?.token) {
    const setCookie = loginResult.headers["set-cookie"];
    const cookie = Array.isArray(setCookie)
      ? setCookie.map((c) => c.split(";")[0]).join("; ")
      : (setCookie || "").split(";")[0];

    return {
      userId: loginResult.body?.user?.id || loginResult.body?.userId || "",
      token: loginResult.body?.token || "",
      cookie
    };
  }

  // Step 2: Retrieve verification code from DB
  const code = await getVerificationCode(email);

  // Step 3: POST to verify
  const verifyResult = await jsonRequest(
    "POST",
    "/api/v1/auth/verify",
    JSON.stringify({ email, code }),
    { origin: getOriginHeader() }
  );

  if (verifyResult.status !== 200) {
    throw new Error(
      `Login verify failed (${verifyResult.status}): ${JSON.stringify(verifyResult.body)}`
    );
  }

  const setCookie = verifyResult.headers["set-cookie"];
  const cookie = Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(";")[0]).join("; ")
    : (setCookie || "").split(";")[0];

  return {
    userId: verifyResult.body?.user?.id || verifyResult.body?.userId || "",
    token: verifyResult.body?.token || "",
    cookie
  };
};

// ---------------------------------------------------------------------------
// Dialog helpers
// ---------------------------------------------------------------------------

/**
 * Create a direct dialog between the authenticated user and a peer.
 */
export const createDirectDialog = async (cookie, targetUserId) => {
  const result = await jsonRequest(
    "POST",
    "/api/v1/dialogs/direct",
    JSON.stringify({ targetUserId }),
    { origin: getOriginHeader(), cookie }
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(
      `Create dialog failed (${result.status}): ${JSON.stringify(result.body)}`
    );
  }

  return result.body;
};

/**
 * Create a group dialog.
 */
export const createGroupDialog = async (cookie, title, memberUserIds = []) => {
  const result = await jsonRequest(
    "POST",
    "/api/v1/dialogs/group",
    JSON.stringify({ title, memberUserIds }),
    { origin: getOriginHeader(), cookie }
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(
      `Create group failed (${result.status}): ${JSON.stringify(result.body)}`
    );
  }

  return result.body;
};

/**
 * Send a text message to a dialog.
 */
export const sendMessage = async (cookie, dialogPublicId, body) => {
  const result = await jsonRequest(
    "POST",
    `/api/v1/dialogs/by-public-id/${encodeURIComponent(dialogPublicId)}/messages`,
    JSON.stringify({ body }),
    { origin: getOriginHeader(), cookie }
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(
      `Send message failed (${result.status}): ${JSON.stringify(result.body)}`
    );
  }

  return result.body;
};

// ---------------------------------------------------------------------------
// WebSocket helpers
// ---------------------------------------------------------------------------

/**
 * Open an authenticated WebSocket connection. Returns { ws, closePromise }.
 */
export const connectWebSocket = (cookie) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_BASE, {
      headers: {
        cookie,
        origin: getOriginHeader()
      }
    });

    const timeout = setTimeout(() => {
      ws.terminate();
      reject(new Error("WebSocket connect timeout"));
    }, 10000);

    ws.on("open", () => {
      clearTimeout(timeout);

      const closePromise = new Promise((closeResolve) => {
        ws.on("close", (code, reason) => {
          closeResolve({ code, reason: reason?.toString() || "" });
        });
      });

      resolve({ ws, closePromise });
    });

    ws.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });

/**
 * Wait for a specific WS event type. Returns the parsed payload.
 */
export const waitForEvent = (ws, eventType, timeoutMs = 10000) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout waiting for event: ${eventType}`));
    }, timeoutMs);

    const handler = (data) => {
      try {
        const payload = JSON.parse(data.toString("utf8"));
        if (payload.type === eventType) {
          cleanup();
          resolve(payload);
        }
      } catch {
        // ignore parse errors
      }
    };

    const cleanup = () => {
      clearTimeout(timeout);
      ws.off("message", handler);
    };

    ws.on("message", handler);
  });

// ---------------------------------------------------------------------------
// Metrics / reporting
// ---------------------------------------------------------------------------

export class Metrics {
  constructor(name) {
    this.name = name;
    this.values = [];
    this.errors = 0;
    this.startTime = Date.now();
  }

  record(value) {
    this.values.push(value);
  }

  recordError() {
    this.errors++;
  }

  get elapsed() {
    return Date.now() - this.startTime;
  }

  percentile(p) {
    if (!this.values.length) return 0;
    const sorted = [...this.values].sort((a, b) => a - b);
    const index = Math.min(
      sorted.length - 1,
      Math.ceil((p / 100) * sorted.length) - 1
    );
    return sorted[Math.max(0, index)];
  }

  summary() {
    const count = this.values.length;
    return {
      name: this.name,
      count,
      errors: this.errors,
      elapsedMs: this.elapsed,
      min: count ? Math.min(...this.values) : 0,
      max: count ? Math.max(...this.values) : 0,
      avg: count ? Math.round(this.values.reduce((a, b) => a + b, 0) / count) : 0,
      p50: this.percentile(50),
      p95: this.percentile(95),
      p99: this.percentile(99)
    };
  }

  print() {
    const s = this.summary();
    console.log(`\n📊 ${s.name}`);
    console.log(`   Samples: ${s.count} | Errors: ${s.errors} | Elapsed: ${s.elapsedMs}ms`);
    if (s.count > 0) {
      console.log(`   Min: ${s.min}ms | Avg: ${s.avg}ms | Max: ${s.max}ms`);
      console.log(`   p50: ${s.p50}ms | p95: ${s.p95}ms | p99: ${s.p99}ms`);
    }
  }
}

/**
 * Run N async tasks with concurrency limit.
 */
export const runConcurrent = async (count, concurrency, fn) => {
  const results = [];
  let index = 0;

  const worker = async () => {
    while (index < count) {
      const currentIndex = index++;
      try {
        results.push(await fn(currentIndex));
      } catch (error) {
        results.push({ error: error.message, index: currentIndex });
      }
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, count) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
};

/**
 * Register N users in parallel. Returns array of user objects.
 */
export const registerUsers = async (count, concurrency = 20) => {
  console.log(`\n🔑 Registering ${count} test users (concurrency: ${concurrency})...`);
  const startMs = Date.now();
  const users = await runConcurrent(count, concurrency, async (i) => {
    const user = await registerUser(`lt${i}`);
    if ((i + 1) % 50 === 0) {
      process.stdout.write(`  ${i + 1}/${count} registered\r`);
    }
    return user;
  });

  const validUsers = users.filter((u) => u.userId);
  const failedCount = users.length - validUsers.length;
  console.log(
    `   ✅ ${validUsers.length} users registered in ${Date.now() - startMs}ms` +
    (failedCount ? ` (${failedCount} failed)` : "")
  );
  return validUsers;
};

export { API_BASE, WS_BASE };
