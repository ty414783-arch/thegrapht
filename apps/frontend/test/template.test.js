import test from "node:test";
import assert from "node:assert/strict";

import { buildHtml } from "../src/server/page-template.js";

test("workspace html includes modular composer shell and secure-ready controls", () => {
  const html = buildHtml({
    clientScriptUrl: "/app.test.js",
    manifestUrl: "/manifest.webmanifest",
    logoDataUrl: "/logo.jpg",
    wallpaperDataUrl: "/wallpaper.png",
    emojiIconDataUrl: "/emoji.png",
    settingsKeyboardIconDataUrl: "/attach.png",
    sendButtonIconDataUrl: "/send.png",
    uiFlags: {
      telegramTopBar: true,
      desktopInterFont: true,
      desktopSideGuttersOnly: true,
      sidebarAccountCardHidden: false
    }
  });

  assert.match(html, /class="composer-shell"/);
  assert.match(html, /id="composer-input"/);
  assert.match(html, /id="composer-attach-button"/);
  assert.match(html, /id="composer-send"/);
  assert.match(html, /min-height: 46px/);
});
