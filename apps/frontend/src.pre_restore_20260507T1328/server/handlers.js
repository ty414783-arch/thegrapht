import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../../");
const resDir = path.join(rootDir, "res");
const appleEmojiDir = path.join(resDir, "emoji/apple-64");

const sendTextResponse = (request, response, statusCode, headers, body) => {
  const acceptsGzip = /\bgzip\b/i.test(String(request.headers["accept-encoding"] || ""));

  if (!acceptsGzip) {
    response.writeHead(statusCode, {
      ...headers,
      "Content-Length": String(Buffer.byteLength(body))
    });
    response.end(body);
    return;
  }

  const compressedBody = zlib.gzipSync(Buffer.from(body));

  response.writeHead(statusCode, {
    ...headers,
    "Content-Encoding": "gzip",
    "Content-Length": String(compressedBody.byteLength),
    Vary: "Accept-Encoding"
  });
  response.end(compressedBody);
};

export const createRequestHandler = ({
  html,
  homeHtml,
  faqHtml,
  privacyHtml,
  clientScript,
  clientScriptUrl,
  baseSecurityHeaders,
  htmlSecurityHeaders,
  manifestJson,
  manifestUrl,
  serviceWorkerScript,
  serviceWorkerUrl,
  inter400Url,
  inter400Buffer,
  inter500Url,
  inter500Buffer,
  inter600Url,
  inter600Buffer,
  inter700Url,
  inter700Buffer,
  inter800Url,
  inter800Buffer,
  materialSymbolsRounded400Url,
  materialSymbolsRounded400Buffer,
  materialSymbolsRounded500Url,
  materialSymbolsRounded500Buffer,
  materialSymbolsRounded600Url,
  materialSymbolsRounded600Buffer,
  materialSymbolsRounded700Url,
  materialSymbolsRounded700Buffer,
  logoUrl,
  logoBuffer,
  emojiIconUrl,
  emojiIconBuffer,
  sendButtonIconUrl,
  sendButtonIconBuffer,
  settingsKeyboardIconUrl,
  settingsKeyboardIconBuffer,
  searchEmptyVideoUrl,
  searchEmptyVideoBuffer,
  wallpaperUrl,
  wallpaperBuffer,
  messageSoundUrl,
  messageSoundBuffer,
  sendLocalSoundUrl,
  sendLocalSoundBuffer,
  outgoingCallRingtoneUrl,
  outgoingCallRingtoneBuffer,
  incomingCallRingtoneUrl,
  incomingCallRingtoneBuffer,
  androidAlphaApkUrl,
  androidAlphaApkBuffer,
  androidAlphaApkVersionedUrl,
  androidAlphaApkVersionedBuffer
}) => (request, response) => {
  if (!request.url) {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      ...baseSecurityHeaders
    });
    response.end("Not found");
    return;
  }

  if (request.url === "/health") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...baseSecurityHeaders
    });
    response.end(JSON.stringify({
      service: "frontend",
      status: "ok",
      mode: "ui-only"
    }));
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      ...baseSecurityHeaders
    });
    response.end("Not found");
    return;
  }

  if (request.url.endsWith(".map")) {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...baseSecurityHeaders
    });
    response.end("Not found");
    return;
  }

  if (request.url === clientScriptUrl || request.url === "/app.js") {
    const isVersionedClientScript = request.url === clientScriptUrl;

    sendTextResponse(request, response, 200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": isVersionedClientScript
        ? "public, max-age=31536000, immutable"
        : "no-store",
      ...baseSecurityHeaders
    }, clientScript);
    return;
  }

  if (request.url === logoUrl) {
    response.writeHead(200, {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(logoBuffer);
    return;
  }

  if (request.url === emojiIconUrl) {
    response.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(emojiIconBuffer);
    return;
  }

  if (request.url === sendButtonIconUrl) {
    response.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(sendButtonIconBuffer);
    return;
  }

  if (request.url === settingsKeyboardIconUrl) {
    response.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(settingsKeyboardIconBuffer);
    return;
  }

  if (request.url === searchEmptyVideoUrl) {
    response.writeHead(200, {
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(searchEmptyVideoBuffer);
    return;
  }

  if (request.url === wallpaperUrl) {
    response.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(wallpaperBuffer);
    return;
  }

  if (request.url === messageSoundUrl) {
    response.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(messageSoundBuffer);
    return;
  }

  if (request.url === sendLocalSoundUrl) {
    response.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(sendLocalSoundBuffer);
    return;
  }

  if (request.url === outgoingCallRingtoneUrl) {
    response.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(outgoingCallRingtoneBuffer);
    return;
  }

  if (request.url === incomingCallRingtoneUrl) {
    response.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(incomingCallRingtoneBuffer);
    return;
  }

  if (request.url === manifestUrl) {
    response.writeHead(200, {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "no-store",
      ...baseSecurityHeaders
    });
    response.end(manifestJson);
    return;
  }

  if (request.url === serviceWorkerUrl) {
    response.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
      ...baseSecurityHeaders
    });
    response.end(serviceWorkerScript);
    return;
  }

  const fontResponses = new Map([
    [inter400Url, inter400Buffer],
    [inter500Url, inter500Buffer],
    [inter600Url, inter600Buffer],
    [inter700Url, inter700Buffer],
    [inter800Url, inter800Buffer],
    [materialSymbolsRounded400Url, materialSymbolsRounded400Buffer],
    [materialSymbolsRounded500Url, materialSymbolsRounded500Buffer],
    [materialSymbolsRounded600Url, materialSymbolsRounded600Buffer],
    [materialSymbolsRounded700Url, materialSymbolsRounded700Buffer]
  ]);

  if (fontResponses.has(request.url)) {
    response.writeHead(200, {
      "Content-Type": "font/ttf",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(fontResponses.get(request.url));
    return;
  }

  if (request.url.startsWith("/assets/emoji/apple-64/")) {
    const relativeEmojiPath = request.url.slice("/assets/emoji/apple-64/".length);
    const safeEmojiFileName = path.basename(relativeEmojiPath);

    if (!/^[0-9a-f-]+\.png$/i.test(safeEmojiFileName)) {
      response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
        ...baseSecurityHeaders
      });
      response.end("Not found");
      return;
    }

    const emojiFilePath = path.join(appleEmojiDir, safeEmojiFileName);

    if (!fs.existsSync(emojiFilePath)) {
      response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
        ...baseSecurityHeaders
      });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...baseSecurityHeaders
    });
    response.end(fs.readFileSync(emojiFilePath));
    return;
  }

  if (request.url === androidAlphaApkUrl) {
    response.writeHead(200, {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="thegrapht-android-alpha.apk"',
      "Content-Length": String(androidAlphaApkBuffer.byteLength),
      "Cache-Control": "public, max-age=3600",
      ...baseSecurityHeaders
    });
    response.end(androidAlphaApkBuffer);
    return;
  }

  if (request.url === androidAlphaApkVersionedUrl) {
    response.writeHead(200, {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="thegrapht-android-alpha-0.1.2.apk"',
      "Content-Length": String(androidAlphaApkVersionedBuffer.byteLength),
      "Cache-Control": "no-store",
      ...baseSecurityHeaders
    });
    response.end(androidAlphaApkVersionedBuffer);
    return;
  }

  const hostHeader = request.headers.host || "";
  const isWebDomain = hostHeader.startsWith("web.");

  if (!isWebDomain && (request.url === "/" || request.url === "/index.html")) {
    sendTextResponse(request, response, 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
      ...htmlSecurityHeaders
    }, homeHtml);
    return;
  }

  if (!isWebDomain && request.url === "/faq") {
    sendTextResponse(request, response, 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
      ...htmlSecurityHeaders
    }, faqHtml);
    return;
  }

  if (!isWebDomain && request.url === "/privacy") {
    sendTextResponse(request, response, 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
      ...htmlSecurityHeaders
    }, privacyHtml);
    return;
  }

  sendTextResponse(request, response, 200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    ...htmlSecurityHeaders
  }, html);
};
