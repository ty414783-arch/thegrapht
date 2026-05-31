import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolveResDir = () => {
  const candidates = [
    path.resolve(__dirname, "../../../../res"),
    path.resolve(__dirname, "../../res"),
    process.resourcesPath ? path.join(process.resourcesPath, "embedded-frontend", "res") : null,
    process.resourcesPath ? path.join(process.resourcesPath, "res") : null
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  return path.resolve(__dirname, "../../../../res");
};

const resDir = resolveResDir();
const appleEmojiDir = path.join(resDir, "emoji/apple-64");
const desktopReleaseDir = path.join(resDir, "download/release/desktop");
const gzipTextCache = new Map();
const GZIP_TEXT_CACHE_LIMIT = 24;

const getGzipTextBuffer = (body) => {
  const key = String(body || "");
  const cached = gzipTextCache.get(key);
  if (cached) {
    return cached;
  }

  const compressedBody = zlib.gzipSync(Buffer.from(key));
  gzipTextCache.set(key, compressedBody);

  if (gzipTextCache.size > GZIP_TEXT_CACHE_LIMIT) {
    const firstKey = gzipTextCache.keys().next().value;
    if (firstKey !== undefined) {
      gzipTextCache.delete(firstKey);
    }
  }

  return compressedBody;
};

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

  const compressedBody = getGzipTextBuffer(body);

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
  landingSecurityHeaders,
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

  const requestHost = request.headers.host || "";
  if (requestHost.includes("dl.thegrapht.su")) {
    let apkFilename = "thegrapht-android-alpha.apk";
    const decodedUrl = decodeURIComponent(request.url || "");
    const parsedUrl = decodedUrl.split("?")[0];

    if (parsedUrl.startsWith("/release/")) {
      apkFilename = parsedUrl.substring("/release/".length);
    } else if (parsedUrl.startsWith("/realease/")) {
      apkFilename = parsedUrl.substring("/realease/".length);
    } else if (parsedUrl.startsWith("/downloads/")) {
      apkFilename = parsedUrl.substring("/downloads/".length);
    } else if (parsedUrl !== "/" && parsedUrl !== "/index.html" && parsedUrl !== "/thegrapht-android-alpha.apk") {
      apkFilename = parsedUrl.replace(/^\/+/, "");
    }

    const safeApkNamePattern = /^[a-zA-Z0-9_.-]+\.apk$/;
    if (!safeApkNamePattern.test(apkFilename)) {
      response.writeHead(400, {
        "Content-Type": "text/plain; charset=utf-8",
        ...baseSecurityHeaders
      });
      response.end("Invalid file request");
      return;
    }

    const apkPath = path.join(resDir, "downloads", apkFilename);
    try {
      if (fs.existsSync(apkPath) && fs.statSync(apkPath).isFile()) {
        const stat = fs.statSync(apkPath);
        response.writeHead(200, {
          "Content-Type": "application/vnd.android.package-archive",
          "Content-Disposition": `attachment; filename="${apkFilename}"`,
          "Content-Length": String(stat.size),
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          ...baseSecurityHeaders
        });
        const readStream = fs.createReadStream(apkPath);
        readStream.pipe(response);
        return;
      } else {
        response.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8",
          ...baseSecurityHeaders
        });
        response.end(`File not found: ${apkFilename}`);
        return;
      }
    } catch (err) {
      response.writeHead(500, {
        "Content-Type": "text/plain; charset=utf-8",
        ...baseSecurityHeaders
      });
      response.end("Internal server error");
      return;
    }
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

  if (request.url.startsWith("/download/release/desktop/")) {
    const fileName = path.basename(request.url);
    const filePath = path.join(desktopReleaseDir, fileName);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        ...baseSecurityHeaders
      });
      response.end("Not found");
      return;
    }

    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === ".exe"
      ? "application/vnd.microsoft.portable-executable"
      : (ext === ".blockmap" ? "application/octet-stream" : "application/octet-stream");

    response.writeHead(200, {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename=\"${fileName}\"`,
      "Cache-Control": "no-store",
      ...baseSecurityHeaders
    });
    fs.createReadStream(filePath).pipe(response);
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
    const apkPath = path.join(resDir, "downloads", "thegrapht-android-alpha.apk");
    try {
      if (fs.existsSync(apkPath) && fs.statSync(apkPath).isFile()) {
        const stat = fs.statSync(apkPath);
        response.writeHead(200, {
          "Content-Type": "application/vnd.android.package-archive",
          "Content-Disposition": 'attachment; filename="thegrapht-android-alpha.apk"',
          "Content-Length": String(stat.size),
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          ...baseSecurityHeaders
        });
        const readStream = fs.createReadStream(apkPath);
        readStream.pipe(response);
        return;
      }
    } catch (err) {
      // Fallback
    }
    response.writeHead(200, {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="thegrapht-android-alpha.apk"',
      "Content-Length": String(androidAlphaApkBuffer.byteLength),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      ...baseSecurityHeaders
    });
    response.end(androidAlphaApkBuffer);
    return;
  }

  if (request.url === androidAlphaApkVersionedUrl) {
    const apkPath = path.join(resDir, "downloads", "thegrapht-android-alpha-0.1.2.apk");
    try {
      if (fs.existsSync(apkPath) && fs.statSync(apkPath).isFile()) {
        const stat = fs.statSync(apkPath);
        response.writeHead(200, {
          "Content-Type": "application/vnd.android.package-archive",
          "Content-Disposition": 'attachment; filename="thegrapht-android-alpha-0.1.2.apk"',
          "Content-Length": String(stat.size),
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          ...baseSecurityHeaders
        });
        const readStream = fs.createReadStream(apkPath);
        readStream.pipe(response);
        return;
      }
    } catch (err) {
      // Fallback
    }
    response.writeHead(200, {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="thegrapht-android-alpha-0.1.2.apk"',
      "Content-Length": String(androidAlphaApkVersionedBuffer.byteLength),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      ...baseSecurityHeaders
    });
    response.end(androidAlphaApkVersionedBuffer);
    return;
  }

  const hostHeader = request.headers.host || "";
  const isWebDomain = hostHeader.startsWith("web.") || hostHeader.startsWith("dev.");

  if (!isWebDomain && (request.url === "/" || request.url === "/index.html")) {
    sendTextResponse(request, response, 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
      ...landingSecurityHeaders
    }, homeHtml);
    return;
  }

  const isDocRoute = request.url === "/faq" ||
                     request.url === "/product" ||
                     request.url === "/security" ||
                     request.url === "/technologies" ||
                     request.url.startsWith("/faq/");

  if (!isWebDomain && isDocRoute) {
    sendTextResponse(request, response, 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
      ...landingSecurityHeaders
    }, faqHtml);
    return;
  }

  if (!isWebDomain && request.url === "/privacy") {
    sendTextResponse(request, response, 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
      ...landingSecurityHeaders
    }, privacyHtml);
    return;
  }

  if (!isWebDomain && hostHeader.includes("thegrapht.su")) {
    response.writeHead(302, {
      "Location": `https://web.thegrapht.su${request.url}`,
      ...baseSecurityHeaders
    });
    response.end();
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
