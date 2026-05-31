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

const readBuffer = (relativePath) => fs.readFileSync(path.join(resDir, relativePath));

export const logoUrl = "/assets/logo.jpg";
export const sendButtonIconUrl = "/assets/send-button.png";

const emojiIconWebpBuffer = readBuffer("emoji-icon.webp");
export const emojiIconUrl = "data:image/webp;base64," + emojiIconWebpBuffer.toString("base64");

const settingsKeyboardIconWebpBuffer = readBuffer("settings-icon-keyboard.webp");
export const settingsKeyboardIconUrl = "data:image/webp;base64," + settingsKeyboardIconWebpBuffer.toString("base64");
export const searchEmptyVideoUrl = "/assets/search-empty.mp4";
export const sendLocalSoundUrl = "/assets/send-local.mp3";
export const outgoingCallRingtoneUrl = "/assets/cell-phone-ring.mp3";
export const incomingCallRingtoneUrl = "/assets/telegram-zvonok-pk.mp3";
export const appleEmojiAssetBaseUrl = "/assets/emoji/apple-64/";
export const inter400Url = "/assets/fonts/inter-400.ttf";
export const inter500Url = "/assets/fonts/inter-500.ttf";
export const inter600Url = "/assets/fonts/inter-600.ttf";
export const inter700Url = "/assets/fonts/inter-700.ttf";
export const inter800Url = "/assets/fonts/inter-800.ttf";
export const materialSymbolsRounded400Url = "/assets/fonts/material-symbols-rounded-400.ttf";
export const materialSymbolsRounded500Url = "/assets/fonts/material-symbols-rounded-500.ttf";
export const materialSymbolsRounded600Url = "/assets/fonts/material-symbols-rounded-600.ttf";
export const materialSymbolsRounded700Url = "/assets/fonts/material-symbols-rounded-700.ttf";
export const androidAlphaApkUrl = "/downloads/thegrapht-android-alpha.apk";
export const androidAlphaApkVersionedUrl = "/downloads/thegrapht-android-alpha-0.1.2.apk";

export const logoBuffer = readBuffer("logo.jpg");
export const emojiIconBuffer = emojiIconWebpBuffer;
export const sendButtonIconBuffer = readBuffer("send button.png");
export const settingsKeyboardIconBuffer = settingsKeyboardIconWebpBuffer;
export const searchEmptyVideoBuffer = readBuffer("utyasearch.gif.mp4");
export const wallpaperBuffer = readBuffer("wallpaper.png");

// Optimized WebP (112KB vs 1.4MB PNG) — inlined as base64 to prevent progressive chunk loading
const wallpaperWebpBuffer = readBuffer("wallpaper-optimized.webp");
export const wallpaperUrl = "data:image/webp;base64," + wallpaperWebpBuffer.toString("base64");

export const messageSoundUrl = "/assets/message-sound.mp3";
export const messageSoundBuffer = readBuffer("sounds/message sound.mp3");
export const sendLocalSoundBuffer = readBuffer("sounds/send local.mp3");
export const outgoingCallRingtoneBuffer = readBuffer("sounds/cell phone ring.mp3");
export const incomingCallRingtoneBuffer = readBuffer("sounds/telegram-zvonok-pk.mp3");
export const inter400Buffer = readBuffer("fonts/inter-400.ttf");
export const inter500Buffer = readBuffer("fonts/inter-500.ttf");
export const inter600Buffer = readBuffer("fonts/inter-600.ttf");
export const inter700Buffer = readBuffer("fonts/inter-700.ttf");
export const inter800Buffer = readBuffer("fonts/inter-800.ttf");
export const materialSymbolsRounded400Buffer = readBuffer("fonts/material-symbols-rounded-400.ttf");
export const materialSymbolsRounded500Buffer = readBuffer("fonts/material-symbols-rounded-500.ttf");
export const materialSymbolsRounded600Buffer = readBuffer("fonts/material-symbols-rounded-600.ttf");
export const materialSymbolsRounded700Buffer = readBuffer("fonts/material-symbols-rounded-700.ttf");
export const androidAlphaApkBuffer = readBuffer("downloads/thegrapht-android-alpha.apk");
export const androidAlphaApkVersionedBuffer = readBuffer("downloads/thegrapht-android-alpha-0.1.2.apk");
