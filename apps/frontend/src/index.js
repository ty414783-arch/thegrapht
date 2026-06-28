import crypto from "node:crypto";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  androidAlphaApkBuffer,
  androidAlphaApkUrl,
  androidAlphaApkVersionedBuffer,
  androidAlphaApkVersionedUrl,
  inter400Buffer,
  inter400Url,
  inter500Buffer,
  inter500Url,
  inter600Buffer,
  inter600Url,
  inter700Buffer,
  inter700Url,
  inter800Buffer,
  inter800Url,
  emojiIconBuffer,
  emojiIconUrl,
  outgoingCallRingtoneBuffer,
  outgoingCallRingtoneUrl,
  incomingCallRingtoneBuffer,
  incomingCallRingtoneUrl,
  appleEmojiAssetBaseUrl,
  logoBuffer,
  logoUrl,
  messageSoundBuffer,
  messageSoundUrl,
  searchEmptyVideoBuffer,
  searchEmptyVideoUrl,
  sendButtonIconBuffer,
  sendButtonIconUrl,
  sendLocalSoundBuffer,
  sendLocalSoundUrl,
  settingsKeyboardIconBuffer,
  settingsKeyboardIconUrl,
  wallpaperBuffer,
  wallpaperUrl
} from "./server/assets.js";
import { buildClientScript } from "./server/client-script.js";
import { createRequestHandler } from "./server/handlers.js";
import { buildFaqHtml } from "./server/page-faq.js";
import { buildHomeHtml } from "./server/page-home.js";
import { buildPrivacyHtml } from "./server/page-privacy.js";
import { buildHtml } from "./server/page-template.js";
import { manifestJson, manifestUrl, serviceWorkerScript, serviceWorkerUrl } from "./server/pwa.js";
import { baseSecurityHeaders, createHtmlSecurityHeaders } from "./server/security.js";
import { uiFlags } from "./server/ui-flags.js";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 5173);
const apiBaseUrl = process.env.VITE_API_BASE_URL || "https://api.thegrapht.su";
const wsBaseUrl = process.env.VITE_WS_BASE_URL || "wss://ws.thegrapht.su";
const mtprotoBaseUrl = process.env.VITE_MTPROTO_BASE_URL ?? "";
const rtcIceServers = process.env.VITE_WEBRTC_ICE_SERVERS ?? "";
const htmlSecurityHeaders = createHtmlSecurityHeaders({
  apiBaseUrl,
  wsBaseUrl,
  mtprotoBaseUrl,
  isLanding: false
});

const landingSecurityHeaders = createHtmlSecurityHeaders({
  apiBaseUrl,
  wsBaseUrl,
  mtprotoBaseUrl,
  isLanding: true
});


let compiledScript = "";
const compiledAppPath = path.resolve(__dirname, "../dist/app.js");
try {
  if (fs.existsSync(compiledAppPath)) {
    compiledScript = fs.readFileSync(compiledAppPath, "utf8");
    console.log("Loaded compiled Preact client script from dist/app.js");
  }
} catch (err) {
  console.warn("Failed to read compiled client script:", err);
}

const configScriptJs = `window.__THEGRAPHT_CONFIG__ = {
  apiBaseUrl: ${JSON.stringify(apiBaseUrl)},
  appleEmojiAssetBaseUrl: ${JSON.stringify(appleEmojiAssetBaseUrl)},
  outgoingCallRingtoneUrl: ${JSON.stringify(outgoingCallRingtoneUrl)},
  incomingCallRingtoneUrl: ${JSON.stringify(incomingCallRingtoneUrl)},
  rtcIceServers: ${JSON.stringify(rtcIceServers)},
  logoDataUrl: ${JSON.stringify(logoUrl)},
  messageSoundUrl: ${JSON.stringify(messageSoundUrl)},
  searchEmptyVideoUrl: ${JSON.stringify(searchEmptyVideoUrl)},
  sendLocalSoundUrl: ${JSON.stringify(sendLocalSoundUrl)},
  serviceWorkerUrl: ${JSON.stringify(serviceWorkerUrl)},
  uiFlags: ${JSON.stringify(uiFlags)},
  wsBaseUrl: ${JSON.stringify(wsBaseUrl)}
};`;

const fallbackScript = buildClientScript({
  apiBaseUrl,
  appleEmojiAssetBaseUrl,
  outgoingCallRingtoneUrl,
  incomingCallRingtoneUrl,
  rtcIceServers,
  logoDataUrl: logoUrl,
  messageSoundUrl,
  searchEmptyVideoUrl,
  sendLocalSoundUrl,
  serviceWorkerUrl,
  uiFlags,
  wsBaseUrl
});

const clientScript = compiledScript ? compiledScript + "\n" + fallbackScript : fallbackScript;
const clientScriptHash = crypto.createHash("sha256").update(clientScript).digest("hex").slice(0, 12);
const clientScriptUrl = `/app.${clientScriptHash}.js`;

const html = buildHtml({
  clientScriptUrl,
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  manifestUrl,
  logoDataUrl: logoUrl,
  wallpaperDataUrl: wallpaperUrl,
  emojiIconDataUrl: emojiIconUrl,
  settingsKeyboardIconDataUrl: settingsKeyboardIconUrl,
  uiFlags,
  configScript: ""
});

const faqHtml = buildFaqHtml({
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  logoDataUrl: logoUrl
});

const homeHtml = buildHomeHtml({
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  logoDataUrl: logoUrl
});

const privacyHtml = buildPrivacyHtml({
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  logoDataUrl: logoUrl
});

const requestHandler = createRequestHandler({
  html,
  homeHtml,
  faqHtml,
  privacyHtml,
  clientScript,
  clientScriptUrl,
  configScriptJs,
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
});

const server = http.createServer(requestHandler);

server.listen(port, host, () => {
  console.log(`TheGraphT frontend listening on ${host}:${port}`);
});
