import { buildClientScript } from "./src/server/client-script.js";
import fs from "node:fs";

const uiFlags = Object.freeze({
  telegramTopBar: true,
  desktopInterFont: true,
  desktopSideGuttersOnly: true,
  sidebarAccountCardHidden: true
});

const script = buildClientScript({
  apiBaseUrl: "",
  wsBaseUrl: "",
  appleEmojiAssetBaseUrl: "/assets/emoji/apple-64/",
  outgoingCallRingtoneUrl: "/outgoing.mp3",
  incomingCallRingtoneUrl: "/incoming.mp3",
  rtcIceServers: "",
  logoDataUrl: "/logo.jpg",
  messageSoundUrl: "/message.mp3",
  searchEmptyVideoUrl: "/search.mp4",
  sendLocalSoundUrl: "/send.mp3",
  serviceWorkerUrl: "/service-worker.js",
  uiFlags
});

fs.writeFileSync("generated-script.js", script);
console.log("Wrote generated-script.js");

try {
  // Let's run a syntax check using vm or a small file load
  import("node:vm").then(({ Script }) => {
    try {
      new Script(script, { filename: "generated-script.js" });
      console.log("Parse OK");
    } catch (e) {
      console.error("Syntax Error Details:");
      console.error(e.stack);
    }
  });
} catch (e) {
  console.error("Parse Error:", e);
}
