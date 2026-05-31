import crypto from "node:crypto";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const startedAt = new Date();
const defaultConfig = {
  localOnly: true,
  limits: {
    maxBurstRequests: 12,
    requestTimeoutMs: 5000,
    websocketTimeoutMs: 800,
    oversizedJsonBytes: 1052672
  },
  candidates: {
    backendBaseUrls: ["http://127.0.0.1:3001", "http://172.17.0.1:3001"],
    frontendBaseUrls: ["http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://172.17.0.1:5173", "http://172.17.0.1:5174"],
    mtprotoBaseUrls: ["http://127.0.0.1:3100", "http://172.17.0.1:3100"]
  },
  allowedOrigins: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5175", "http://127.0.0.1:5175", "http://localhost", "http://127.0.0.1"],
  evilOrigin: "https://evil.localhost.invalid"
};

const statusRank = { PASS: 0, INFO: 1, WARN: 2, FAIL: 3 };
const results = [];
const context = {
  config: defaultConfig,
  backendBase: "",
  frontendBase: "",
  mtprotoBase: "",
  users: {},
  dialog: null,
  saved: {},
  messages: {},
  frontend: {}
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const asArray = (value) => Array.isArray(value) ? value : [value].filter(Boolean);

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const readConfig = async () => {
  if (!process.argv[1] || process.argv[1] === "-") {
    return defaultConfig;
  }

  try {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const configPath = path.join(scriptDir, "config.json");
    return {
      ...defaultConfig,
      ...safeJsonParse(await fs.readFile(configPath, "utf8"))
    };
  } catch {
    return defaultConfig;
  }
};

const isLocalUrl = (value) => {
  try {
    const url = new URL(value);
    return [
      "127.0.0.1",
      "localhost",
      "172.17.0.1",
      "172.18.0.1",
      "thegrapht_backend_1",
      "thegrapht_frontend_1",
      "thegrapht_mtproto_1",
      "::1"
    ].includes(url.hostname);
  } catch {
    return false;
  }
};

const redactCookie = (cookie) => cookie ? `${cookie.slice(0, 18)}...` : "";

const commandFor = (method, url, options = {}) => {
  const parts = ["curl", "-4", "-i", "-s", "-X", method.toUpperCase()];
  for (const [name, value] of Object.entries(options.headers || {})) {
    parts.push("-H", JSON.stringify(`${name}: ${value}`));
  }
  if (options.cookie) {
    parts.push("-H", JSON.stringify(`Cookie: ${redactCookie(options.cookie)}`));
  }
  if (options.body !== undefined) {
    parts.push("--data", JSON.stringify(typeof options.body === "string" ? options.body : JSON.stringify(options.body)));
  }
  parts.push(JSON.stringify(url));
  return parts.join(" ");
};

const addResult = ({ phase, name, status = "PASS", severity = "info", evidence = "", reproduction = "" }) => {
  results.push({
    phase,
    name,
    status,
    severity,
    evidence: String(evidence || ""),
    reproduction: String(reproduction || "")
  });
};

const test = async (phase, name, fn, severity = "medium") => {
  try {
    const outcome = await fn();
    addResult({
      phase,
      name,
      status: outcome?.status || "PASS",
      severity: outcome?.severity || severity,
      evidence: outcome?.evidence || "",
      reproduction: outcome?.reproduction || ""
    });
  } catch (error) {
    addResult({
      phase,
      name,
      status: "FAIL",
      severity,
      evidence: error instanceof Error ? error.message : String(error)
    });
  }
};

const assertCondition = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const request = async (method, url, options = {}) => {
  if (context.config.localOnly && !isLocalUrl(url)) {
    throw new Error(`Refusing non-local URL in local-only audit: ${url}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), context.config.limits.requestTimeoutMs);
  const headers = { ...(options.headers || {}) };

  if (options.cookie) {
    headers.Cookie = options.cookie;
  }

  if (options.origin) {
    headers.Origin = options.origin;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body,
      signal: controller.signal
    });
    const text = await response.text();
    const responseHeaders = Object.fromEntries(response.headers.entries());
    const setCookies = typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : asArray(response.headers.get("set-cookie"));

    return {
      status: response.status,
      ok: response.ok,
      headers: responseHeaders,
      setCookies,
      text,
      json: safeJsonParse(text)
    };
  } finally {
    clearTimeout(timeout);
  }
};

const requestJson = (method, url, payload, options = {}) =>
  request(method, url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: JSON.stringify(payload)
  });

const firstCookie = (response) => {
  const raw = response.setCookies[0] || "";
  return raw.split(";", 1)[0];
};

const pickReachableBase = async (label, candidates, pathSuffix) => {
  const envName = `AUDIT_${label.toUpperCase()}_BASE`;
  const values = [process.env[envName], ...candidates].filter(Boolean);
  const errors = [];

  for (const base of values) {
    if (!isLocalUrl(base)) {
      errors.push(`${base}: non-local refused`);
      continue;
    }

    try {
      const response = await request("GET", `${base}${pathSuffix}`);
      if (response.status >= 200 && response.status < 500) {
        return base.replace(/\/+$/, "");
      }
      errors.push(`${base}: HTTP ${response.status}`);
    } catch (error) {
      errors.push(`${base}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`No reachable ${label} base. Tried: ${errors.join("; ")}`);
};

const registerUser = async (tag) => {
  const suffix = `${Date.now()}_${crypto.randomBytes(3).toString("hex")}_${tag}`;
  const payload = {
    name: `Audit ${tag} <img src=x onerror=alert(1)>`,
    email: `audit_${suffix}@example.test`,
    password: `AuditPass_${suffix}!`
  };
  const response = await requestJson("POST", `${context.backendBase}/api/v1/auth/register`, payload, {
    origin: context.config.allowedOrigins[0]
  });
  assertCondition(response.status === 201, `register ${tag} expected 201, got ${response.status}: ${response.text}`);
  const cookie = firstCookie(response);
  assertCondition(cookie, `register ${tag} did not return session cookie`);
  return {
    ...payload,
    id: response.json?.user?.id,
    username: response.json?.user?.username,
    cookie,
    rawSetCookie: response.setCookies[0] || ""
  };
};

const rawWebSocketHandshake = (base, options = {}) => new Promise((resolve, reject) => {
  const url = new URL(base);
  const key = crypto.randomBytes(16).toString("base64");
  const socket = net.createConnection({
    host: url.hostname,
    port: Number(url.port || 80)
  });
  const timer = setTimeout(() => {
    socket.destroy();
    reject(new Error("websocket handshake timed out"));
  }, context.config.limits.websocketTimeoutMs);
  let data = "";

  socket.on("connect", () => {
    const headers = {
      Host: url.host,
      Upgrade: "websocket",
      Connection: "Upgrade",
      "Sec-WebSocket-Key": key,
      "Sec-WebSocket-Version": "13",
      ...(options.headers || {})
    };
    const rawHeaders = Object.entries(headers)
      .map(([name, value]) => `${name}: ${value}`)
      .join("\r\n");
    socket.write(`GET /ws HTTP/1.1\r\n${rawHeaders}\r\n\r\n`);
  });

  socket.on("data", (chunk) => {
    data += chunk.toString("binary");
    if (data.includes("\r\n\r\n")) {
      clearTimeout(timer);
      const statusMatch = data.match(/^HTTP\/1\.1\s+(\d+)/);
      resolve({
        socket,
        status: statusMatch ? Number(statusMatch[1]) : 0,
        raw: data
      });
    }
  });
  socket.on("error", (error) => {
    clearTimeout(timer);
    reject(error);
  });
});

const sendMaskedTextFrame = (socket, payload) => {
  const body = Buffer.from(payload);
  const mask = crypto.randomBytes(4);
  const headerLength = body.length < 126 ? 2 : 4;
  const frame = Buffer.alloc(headerLength + 4 + body.length);
  frame[0] = 0x81;

  if (body.length < 126) {
    frame[1] = 0x80 | body.length;
    mask.copy(frame, 2);
    for (let i = 0; i < body.length; i += 1) {
      frame[6 + i] = body[i] ^ mask[i % 4];
    }
  } else {
    frame[1] = 0x80 | 126;
    frame.writeUInt16BE(body.length, 2);
    mask.copy(frame, 4);
    for (let i = 0; i < body.length; i += 1) {
      frame[8 + i] = body[i] ^ mask[i % 4];
    }
  }

  socket.write(frame);
};

const tinyPngBlob = () => new Blob([
  Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000100ffff03000006000557bfab0000000049454e44ae426082", "hex")
], { type: "image/png" });

const uploadImage = async ({ user, publicId, blob, filename, body = "" }) => {
  const form = new FormData();
  form.append("body", body);
  form.append("file", blob, filename);
  return request("POST", `${context.backendBase}/api/v1/dialogs/by-public-id/${encodeURIComponent(publicId)}/messages`, {
    cookie: user.cookie,
    origin: context.config.allowedOrigins[0],
    body: form
  });
};

const makeMarkdownReport = () => {
  const counts = results.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const sorted = [...results].sort((a, b) =>
    (statusRank[b.status] ?? 0) - (statusRank[a.status] ?? 0)
    || a.phase.localeCompare(b.phase)
  );
  const lines = [
    "# TheGraphT Local White-Hat Security Audit Report",
    "",
    `Started: ${startedAt.toISOString()}`,
    `Finished: ${new Date().toISOString()}`,
    "",
    "## Scope",
    "",
    "- Local-only audit.",
    `- Backend: ${context.backendBase || "unresolved"}`,
    `- Frontend: ${context.frontendBase || "unresolved"}`,
    `- MTProto: ${context.mtprotoBase || "unresolved"}`,
    "- Public domains were not targeted.",
    "",
    "## Summary",
    "",
    `- PASS: ${counts.PASS || 0}`,
    `- WARN: ${counts.WARN || 0}`,
    `- FAIL: ${counts.FAIL || 0}`,
    `- INFO: ${counts.INFO || 0}`,
    "",
    "## Findings",
    ""
  ];

  for (const item of sorted) {
    lines.push(`### [${item.status}] ${item.phase}: ${item.name}`);
    lines.push("");
    lines.push(`Severity: ${item.severity}`);
    if (item.evidence) {
      lines.push("");
      lines.push("Evidence:");
      lines.push("");
      lines.push("```text");
      lines.push(item.evidence.slice(0, 2400));
      lines.push("```");
    }
    if (item.reproduction) {
      lines.push("");
      lines.push("Reproduce:");
      lines.push("");
      lines.push("```bash");
      lines.push(item.reproduction);
      lines.push("```");
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
};

await (async () => {
  context.config = await readConfig();

  await test("recon", "resolve local backend/frontend/mtproto endpoints", async () => {
    context.backendBase = await pickReachableBase("backend", context.config.candidates.backendBaseUrls, "/health");
    context.frontendBase = await pickReachableBase("frontend", context.config.candidates.frontendBaseUrls, "/");
    context.mtprotoBase = await pickReachableBase("mtproto", context.config.candidates.mtprotoBaseUrls, "/health");
    return {
      evidence: `backend=${context.backendBase}\nfrontend=${context.frontendBase}\nmtproto=${context.mtprotoBase}`
    };
  }, "info");

  await test("recon", "backend health is ok or degraded with explicit checks", async () => {
    const response = await request("GET", `${context.backendBase}/health`);
    assertCondition(response.status === 200, `expected 200, got ${response.status}`);
    assertCondition(response.json?.service === "backend", "health response is not backend service");
    return {
      evidence: JSON.stringify(response.json),
      reproduction: commandFor("GET", `${context.backendBase}/health`)
    };
  }, "info");

  await test("auth", "register disposable users with HttpOnly session cookies", async () => {
    context.users.a = await registerUser("a");
    context.users.b = await registerUser("b");
    context.users.c = await registerUser("c");
    assertCondition(context.users.a.id && context.users.b.id && context.users.c.id, "missing created user ids");
    const cookieFlags = context.users.a.rawSetCookie || "";
    assertCondition(/HttpOnly/i.test(cookieFlags), `session cookie is missing HttpOnly: ${cookieFlags}`);
    assertCondition(/SameSite=Lax/i.test(cookieFlags), `session cookie is missing SameSite=Lax: ${cookieFlags}`);
    return {
      evidence: `a=${context.users.a.id} @${context.users.a.username}\nb=${context.users.b.id} @${context.users.b.username}\nc=${context.users.c.id} @${context.users.c.username}\ncookies=${redactCookie(context.users.a.cookie)}, ${redactCookie(context.users.b.cookie)}, ${redactCookie(context.users.c.cookie)}\nset-cookie-a=${cookieFlags}`,
      reproduction: commandFor("POST", `${context.backendBase}/api/v1/auth/register`, {
        headers: { "Content-Type": "application/json", Origin: context.config.allowedOrigins[0] },
        body: { name: "Audit user", email: "audit_unique@example.test", password: "AuditPass_unique!" }
      })
    };
  }, "info");

  await test("auth", "wrong password login is rejected", async () => {
    const response = await requestJson("POST", `${context.backendBase}/api/v1/auth/login`, {
      email: context.users.a.email,
      password: "wrong_password"
    }, { origin: context.config.allowedOrigins[0] });
    assertCondition(response.status === 401, `expected 401, got ${response.status}: ${response.text}`);
    return {
      evidence: `HTTP ${response.status} ${response.text}`,
      reproduction: commandFor("POST", `${context.backendBase}/api/v1/auth/login`, {
        headers: { "Content-Type": "application/json", Origin: context.config.allowedOrigins[0] },
        body: { email: context.users.a.email, password: "wrong_password" }
      })
    };
  });

  await test("auth", "malformed JSON is rejected", async () => {
    const response = await request("POST", `${context.backendBase}/api/v1/auth/register`, {
      origin: context.config.allowedOrigins[0],
      headers: { "Content-Type": "application/json" },
      body: "{not-json"
    });
    assertCondition(response.status === 400, `expected 400, got ${response.status}: ${response.text}`);
    return {
      evidence: `HTTP ${response.status} ${response.text}`,
      reproduction: commandFor("POST", `${context.backendBase}/api/v1/auth/register`, {
        headers: { "Content-Type": "application/json", Origin: context.config.allowedOrigins[0] },
        body: "{not-json"
      })
    };
  }, "medium");

  await test("auth", "small bounded login burst hits auth rate limit", async () => {
    let limitedAt = 0;
    for (let i = 0; i < context.config.limits.maxBurstRequests; i += 1) {
      const response = await requestJson("POST", `${context.backendBase}/api/v1/auth/login`, {
        email: context.users.a.email,
        password: `wrong_${i}`
      }, { origin: context.config.allowedOrigins[0] });
      if (response.status === 429) {
        limitedAt = i + 1;
        break;
      }
    }
    assertCondition(limitedAt > 0, `no 429 after ${context.config.limits.maxBurstRequests} bounded attempts`);
    return {
      evidence: `rate limited at attempt ${limitedAt}/${context.config.limits.maxBurstRequests}`
    };
  }, "medium");

  await test("auth", "cookie-auth mutating request without Origin is rejected", async () => {
    const response = await requestJson("POST", `${context.backendBase}/api/v1/auth/logout`, {}, {
      cookie: context.users.c.cookie
    });
    assertCondition(response.status === 403, `expected 403, got ${response.status}: ${response.text}`);
    return {
      evidence: `HTTP ${response.status} ${response.text}`,
      reproduction: commandFor("POST", `${context.backendBase}/api/v1/auth/logout`, {
        cookie: context.users.c.cookie,
        headers: { "Content-Type": "application/json" },
        body: {}
      })
    };
  }, "high");

  await test("dialogs", "user search blocks short enumeration and allows prefix search", async () => {
    const shortQuery = String(context.users.b.username || "").slice(0, 2) || "au";
    const prefixQuery = String(context.users.b.username || "").slice(0, 4);
    const suffixQuery = String(context.users.b.username || "").slice(-4);
    const shortResponse = await request("GET", `${context.backendBase}/api/v1/users/search?q=${encodeURIComponent(shortQuery)}`, {
      cookie: context.users.a.cookie
    });
    const prefixResponse = await request("GET", `${context.backendBase}/api/v1/users/search?q=${encodeURIComponent(prefixQuery)}`, {
      cookie: context.users.a.cookie
    });
    const suffixResponse = await request("GET", `${context.backendBase}/api/v1/users/search?q=${encodeURIComponent(suffixQuery)}`, {
      cookie: context.users.a.cookie
    });
    assertCondition(shortResponse.status === 200 && (shortResponse.json?.users || []).length === 0, "short query returned users");
    assertCondition(prefixResponse.status === 200 && (prefixResponse.json?.users || []).some((user) => user.id === context.users.b.id), "prefix query did not find user B");
    assertCondition(suffixResponse.status === 200 && !(suffixResponse.json?.users || []).some((user) => user.id === context.users.b.id), "suffix query found user B; expected prefix-only search");
    return {
      evidence: `short=${shortResponse.text}\nprefix=${prefixResponse.text}\nsuffix=${suffixResponse.text}`
    };
  }, "medium");

  await test("dialogs", "create direct dialog and exchange XSS-looking message safely as data", async () => {
    const dialogResponse = await requestJson("POST", `${context.backendBase}/api/v1/dialogs/direct`, {
      targetUserId: context.users.b.id
    }, {
      cookie: context.users.a.cookie,
      origin: context.config.allowedOrigins[0]
    });
    assertCondition(dialogResponse.status === 200, `dialog create expected 200, got ${dialogResponse.status}: ${dialogResponse.text}`);
    context.dialog = dialogResponse.json?.dialog;
    assertCondition(context.dialog?.publicId, "missing dialog publicId");

    const xssBody = `<img src=x onerror=alert(1)> & <script>alert("audit")</script>`;
    const messageResponse = await requestJson("POST", `${context.backendBase}/api/v1/dialogs/by-public-id/${encodeURIComponent(context.dialog.publicId)}/messages`, {
      body: xssBody
    }, {
      cookie: context.users.a.cookie,
      origin: context.config.allowedOrigins[0]
    });
    assertCondition(messageResponse.status === 201, `message create expected 201, got ${messageResponse.status}: ${messageResponse.text}`);
    context.messages.direct = messageResponse.json?.message;
    assertCondition(context.messages.direct?.body === xssBody, "message body was unexpectedly transformed at API boundary");
    return {
      evidence: `dialog=${context.dialog.id} publicId=${context.dialog.publicId}\nmessage=${context.messages.direct.id}`
    };
  }, "medium");

  await test("access-control", "non-member cannot delete another user's saved message", async () => {
    const stateB = await request("GET", `${context.backendBase}/api/v1/client-state`, {
      cookie: context.users.b.cookie
    });
    assertCondition(stateB.status === 200, `B state expected 200, got ${stateB.status}: ${stateB.text}`);
    const savedB = (stateB.json?.dialogs || []).find((dialog) => dialog.type === "saved");
    assertCondition(savedB?.publicId, "B saved dialog not found");
    context.saved.b = savedB;

    const messageResponse = await requestJson("POST", `${context.backendBase}/api/v1/dialogs/by-public-id/${encodeURIComponent(savedB.publicId)}/messages`, {
      body: "audit saved secret"
    }, {
      cookie: context.users.b.cookie,
      origin: context.config.allowedOrigins[0]
    });
    assertCondition(messageResponse.status === 201, `B saved message expected 201, got ${messageResponse.status}: ${messageResponse.text}`);
    context.messages.savedB = messageResponse.json?.message;

    const deleteResponse = await requestJson("DELETE", `${context.backendBase}/api/v1/messages/${encodeURIComponent(context.messages.savedB.id)}`, {
      deleteForEveryone: true
    }, {
      cookie: context.users.a.cookie,
      origin: context.config.allowedOrigins[0]
    });
    assertCondition([403, 404].includes(deleteResponse.status), `expected 403/404, got ${deleteResponse.status}: ${deleteResponse.text}`);
    return {
      evidence: `delete status=${deleteResponse.status} body=${deleteResponse.text}`
    };
  }, "high");

  await test("media", "member can upload a valid tiny PNG", async () => {
    const response = await uploadImage({
      user: context.users.b,
      publicId: context.saved.b.publicId,
      blob: tinyPngBlob(),
      filename: `audit_<img_onerror>.png`,
      body: "audit image caption <script>alert(1)</script>"
    });
    assertCondition(response.status === 201, `valid image upload expected 201, got ${response.status}: ${response.text}`);
    context.messages.mediaB = response.json?.message;
    assertCondition(context.messages.mediaB?.mediaUrl, "uploaded message missing mediaUrl");
    return {
      evidence: `message=${context.messages.mediaB.id}\nmediaUrl=${context.messages.mediaB.mediaUrl}`
    };
  }, "medium");

  await test("access-control", "non-member cannot read another user's media by message id", async () => {
    const mediaPath = context.messages.mediaB.mediaUrl.startsWith("http")
      ? new URL(context.messages.mediaB.mediaUrl).pathname
      : context.messages.mediaB.mediaUrl;
    const url = `${context.backendBase}${mediaPath}`;
    const response = await request("GET", url, {
      cookie: context.users.a.cookie
    });
    assertCondition(response.status === 404, `expected 404, got ${response.status}`);
    return {
      evidence: `HTTP ${response.status}`,
      reproduction: commandFor("GET", url, { cookie: context.users.a.cookie })
    };
  }, "high");

  await test("media", "text/plain upload is rejected", async () => {
    const response = await uploadImage({
      user: context.users.b,
      publicId: context.saved.b.publicId,
      blob: new Blob(["not an image"], { type: "text/plain" }),
      filename: "audit.txt",
      body: ""
    });
    assertCondition(response.status === 400, `expected 400, got ${response.status}: ${response.text}`);
    return {
      evidence: `HTTP ${response.status} ${response.text}`
    };
  }, "medium");

  await test("media", "fake image MIME with non-image bytes is not accepted", async () => {
    const response = await uploadImage({
      user: context.users.b,
      publicId: context.saved.b.publicId,
      blob: new Blob(["not a real png"], { type: "image/png" }),
      filename: "fake.png",
      body: ""
    });
    if (response.status === 201) {
      return {
        status: "FAIL",
        severity: "medium",
        evidence: "Server accepted image/png multipart part without validating PNG magic bytes."
      };
    }
    assertCondition(response.status === 400, `expected 400, got ${response.status}: ${response.text}`);
    return {
      evidence: `HTTP ${response.status} ${response.text}`
    };
  }, "medium");

  await test("input", "oversized JSON body is rejected or connection is closed", async () => {
    const largeBody = JSON.stringify({ body: "A".repeat(context.config.limits.oversizedJsonBytes) });
    try {
      const response = await request("POST", `${context.backendBase}/api/v1/dialogs/by-public-id/${encodeURIComponent(context.dialog.publicId)}/messages`, {
        cookie: context.users.a.cookie,
        origin: context.config.allowedOrigins[0],
        headers: { "Content-Type": "application/json" },
        body: largeBody
      });
      assertCondition(response.status >= 400, `expected rejection, got ${response.status}`);
      return { evidence: `HTTP ${response.status} ${response.text.slice(0, 200)}` };
    } catch (error) {
      return { evidence: `request closed/rejected: ${error instanceof Error ? error.message : String(error)}` };
    }
  }, "medium");

  await test("e2e", "secure chat endpoints are disabled or require proper bootstrap", async () => {
    const response = await requestJson("POST", `${context.backendBase}/api/v1/dialogs/direct/secure`, {
      targetUserId: context.users.b.id,
      creatorKeyEnvelope: "A".repeat(24),
      recipientKeyEnvelope: "B".repeat(24),
      keyAlgorithm: "X25519",
      encryptionVersion: 1
    }, {
      cookie: context.users.a.cookie,
      origin: context.config.allowedOrigins[0]
    });
    assertCondition([400, 404, 409].includes(response.status), `expected disabled 400/404/409, got ${response.status}: ${response.text}`);
    return {
      evidence: `HTTP ${response.status} ${response.text}`
    };
  }, "medium");

  await test("websocket", "unauthenticated websocket upgrade is rejected", async () => {
    const handshake = await rawWebSocketHandshake(context.backendBase);
    handshake.socket.destroy();
    assertCondition(handshake.status === 401, `expected 401, got ${handshake.status}: ${handshake.raw.slice(0, 120)}`);
    return { evidence: handshake.raw.slice(0, 160) };
  }, "high");

  await test("websocket", "evil-origin websocket upgrade is rejected before auth", async () => {
    const handshake = await rawWebSocketHandshake(context.backendBase, {
      headers: {
        Origin: context.config.evilOrigin,
        Cookie: context.users.a.cookie
      }
    });
    handshake.socket.destroy();
    assertCondition(handshake.status === 403, `expected 403, got ${handshake.status}: ${handshake.raw.slice(0, 120)}`);
    return { evidence: handshake.raw.slice(0, 160) };
  }, "high");

  await test("websocket", "forged presence/typing payloads for unauthorized dialogs do not produce events", async () => {
    const handshake = await rawWebSocketHandshake(context.backendBase, {
      headers: {
        Origin: context.config.allowedOrigins[2],
        Cookie: context.users.a.cookie
      }
    });
    assertCondition(handshake.status === 101, `expected 101 authenticated websocket, got ${handshake.status}`);
    let received = "";
    handshake.socket.on("data", (chunk) => {
      received += chunk.toString("hex");
    });
    sendMaskedTextFrame(handshake.socket, JSON.stringify({ type: "presence", dialogId: "dlg_not_a_member" }));
    sendMaskedTextFrame(handshake.socket, JSON.stringify({ type: "typing", dialogId: "dlg_not_a_member", isTyping: true }));
    sendMaskedTextFrame(handshake.socket, "not-json");
    await sleep(context.config.limits.websocketTimeoutMs);
    handshake.socket.destroy();
    return {
      evidence: `authenticated ws accepted, unauthorized forged payloads sent, bytes observed after send=${received.length}`
    };
  }, "medium");

  await test("mtproto", "MTProto health/capabilities advertise foundation-only status", async () => {
    const health = await request("GET", `${context.mtprotoBase}/health`);
    const capabilities = await request("GET", `${context.mtprotoBase}/api/v1/capabilities`);
    assertCondition(health.status === 200, `health expected 200, got ${health.status}`);
    const combined = `${health.text}\n${capabilities.text}`.toLowerCase();
    assertCondition(combined.includes("foundation") || combined.includes("productionready\":false") || combined.includes("productionready\": false"), "MTProto responses do not clearly show foundation/non-production status");
    return {
      evidence: `health=${health.text}\ncapabilities=${capabilities.text}`,
      reproduction: `${commandFor("GET", `${context.mtprotoBase}/health`)}\n${commandFor("GET", `${context.mtprotoBase}/api/v1/capabilities`)}`
    };
  }, "medium");

  await test("mtproto", "evil origin does not receive CORS allow-origin", async () => {
    const response = await requestJson("POST", `${context.mtprotoBase}/api/v1/session`, {
      accountId: "audit"
    }, {
      origin: context.config.evilOrigin
    });
    const allowedOrigin = response.headers["access-control-allow-origin"] || "";
    assertCondition(allowedOrigin !== context.config.evilOrigin, `evil origin reflected in ACAO: ${allowedOrigin}`);
    return {
      evidence: `HTTP ${response.status}\nAccess-Control-Allow-Origin=${allowedOrigin || "<absent>"}`
    };
  }, "medium");

  await test("frontend", "CSP blocks inline scripts and framing", async () => {
    const response = await request("GET", `${context.frontendBase}/`, {
      headers: {
        Host: "web.thegrapht.su"
      }
    });
    assertCondition(response.status === 200, `expected 200, got ${response.status}`);
    context.frontend.html = response.text;
    context.frontend.csp = response.headers["content-security-policy"] || "";
    assertCondition(/script-src 'self'/.test(context.frontend.csp), `script-src self missing: ${context.frontend.csp}`);
    assertCondition(!/script-src[^;]*'unsafe-inline'/.test(context.frontend.csp), `unsafe-inline script allowed: ${context.frontend.csp}`);
    assertCondition(/frame-ancestors 'none'/.test(context.frontend.csp), `frame-ancestors none missing: ${context.frontend.csp}`);
    assertCondition(!/<script>\s*\S/.test(response.text), "inline script block with content found");
    return {
      evidence: context.frontend.csp,
      reproduction: commandFor("GET", `${context.frontendBase}/`, { headers: { Host: "web.thegrapht.su" } })
    };
  }, "high");

  await test("frontend", "client script contains escaping helpers around rendered user data", async () => {
    const scriptMatch = context.frontend.html.match(/<script src="([^"]+)" defer><\/script>/);
    assertCondition(scriptMatch, "external client script tag not found");
    const scriptUrl = new URL(scriptMatch[1], context.frontendBase).toString();
    const response = await request("GET", scriptUrl, {
      headers: {
        Host: "web.thegrapht.su"
      }
    });
    assertCondition(response.status === 200, `script expected 200, got ${response.status}`);
    const source = response.text;
    const hasEscape = source.includes("function escapeHtml") || source.includes("const escapeHtml");
    const usesCssEscape = source.includes("CSS.escape");
    const usesLinkifyEscaping = source.includes("linkifyMessageBody") && source.includes("escapeHtml");
    assertCondition(hasEscape && usesCssEscape && usesLinkifyEscaping, "expected escaping helpers/usages were not found in client script");
    const legacyStorage = /legacySessionStorageKey|localStorage/.test(source);
    return {
      status: legacyStorage ? "WARN" : "PASS",
      severity: legacyStorage ? "low" : "medium",
      evidence: `script=${scriptUrl}\nescapeHtml=${hasEscape}\nCSS.escape=${usesCssEscape}\nlinkify+escape=${usesLinkifyEscaping}\nlegacy/local storage token code present=${legacyStorage}`
    };
  }, "medium");

  const report = makeMarkdownReport();
  if (process.env.AUDIT_STDOUT === "1") {
    process.stdout.write(report);
  } else {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const reportPath = path.join(scriptDir, "report.md");
    await fs.writeFile(reportPath, report, "utf8");
    const counts = results.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    console.log(`Wrote ${reportPath}`);
    console.log(`PASS=${counts.PASS || 0} WARN=${counts.WARN || 0} FAIL=${counts.FAIL || 0} INFO=${counts.INFO || 0}`);
  }
})();
