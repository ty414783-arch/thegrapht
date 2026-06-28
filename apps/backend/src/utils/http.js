import { Readable, Transform } from "node:stream";

import { config } from "../config.js";

const resolveOrigin = (originHeader) => {
  if (!originHeader) {
    return null;
  }

  const normalized = String(originHeader).trim().toLowerCase();

  // Trust Electron and Tauri native production/dev webview origins
  if (
    normalized === "null" ||
    normalized.startsWith("file://") ||
    normalized.startsWith("tauri://") ||
    normalized.startsWith("https://tauri.") ||
    normalized.startsWith("http://tauri.")
  ) {
    return originHeader;
  }

  if (config.corsAllowedOrigins.includes(originHeader)) {
    return originHeader;
  }

  return null;
};

export const isAllowedOrigin = (originHeader) => Boolean(resolveOrigin(originHeader));

export const hasTrustedOrigin = (request) => {
  if (!request.headers.origin) {
    return true;
  }

  return isAllowedOrigin(request.headers.origin);
};

const hasCookieCredentials = (request) => Boolean(request.headers.cookie);

export const hasTrustedBrowserOrigin = (request) => {
  if (request.headers["x-thegrapht-client"] === "android") {
    return true;
  }
  if (request.headers.origin) {
    return isAllowedOrigin(request.headers.origin);
  }

  return !hasCookieCredentials(request);
};

const createSecurityHeaders = () => ({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
});

export const createCorsHeaders = (request) => {
  const allowedOrigin = resolveOrigin(request.headers.origin);
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
    ...createSecurityHeaders()
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
};

export const sendJson = (request, response, statusCode, payload, extraHeaders = {}) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...createCorsHeaders(request),
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
};

export const sendOptions = (request, response) => {
  response.writeHead(204, createCorsHeaders(request));
  response.end();
};

export const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;

      if (Buffer.byteLength(rawBody) > config.maxJsonBodyBytes) {
        reject(new Error("Body too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });

export const readFormDataBody = async (request) => {
  const maxFormBytes = config.maxUploadBytes + 64 * 1024;
  const contentLengthHeader = request.headers["content-length"];
  const contentLength = Number(Array.isArray(contentLengthHeader) ? contentLengthHeader[0] : contentLengthHeader);

  if (Number.isFinite(contentLength) && contentLength > maxFormBytes) {
    throw new Error("Uploaded file is too large.");
  }

  let receivedBytes = 0;
  const byteLimitStream = new Transform({
    transform(chunk, encoding, callback) {
      receivedBytes += chunk.length;

      if (receivedBytes > maxFormBytes) {
        callback(new Error("Uploaded file is too large."));
        request.destroy();
        return;
      }

      callback(null, chunk);
    }
  });

  const formRequest = new Request(`http://${request.headers.host ?? "localhost"}${request.url ?? "/"}`, {
    method: request.method,
    headers: request.headers,
    body: Readable.toWeb(request.pipe(byteLimitStream)),
    duplex: "half"
  });

  return formRequest.formData();
};
