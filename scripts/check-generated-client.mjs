import vm from "node:vm";

import { buildClientScript } from "../apps/frontend/src/server/client-script.js";

const clientScript = buildClientScript({
  apiBaseUrl: "/api",
  logoDataUrl: "/assets/logo.jpg",
  messageSoundUrl: "/assets/message.mp3",
  searchEmptyVideoUrl: "/assets/search-empty.mp4",
  sendLocalSoundUrl: "/assets/send-local.mp3",
  serviceWorkerUrl: "/sw.js",
  uiFlags: Object.freeze({
    telegramTopBar: true,
    desktopInterFont: true,
    desktopSideGuttersOnly: true,
    sidebarAccountCardHidden: true
  }),
  wsBaseUrl: "/ws"
});

try {
  new vm.Script(clientScript, {
    filename: "thegrapht-generated-client.js"
  });
} catch (error) {
  console.error("Generated frontend client script is not valid JavaScript.");
  throw error;
}

console.log("Generated frontend client script syntax is valid.");
