import test from "node:test";
import assert from "node:assert/strict";

import { buildClientScript } from "../src/server/client-script.js";

const uiFlags = Object.freeze({
  telegramTopBar: true,
  desktopInterFont: true,
  desktopSideGuttersOnly: true,
  sidebarAccountCardHidden: true
});

test("generated client script is syntactically valid", () => {
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

  assert.doesNotThrow(() => {
    // Parse-only guard for generated browser script.
    // eslint-disable-next-line no-new-func
    new Function(script);
  });
});
