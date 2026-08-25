import test from "node:test";
import assert from "node:assert/strict";

import { resolveClientAssets, loadClientManifest, resolveDistDir } from "../src/server/client-manifest.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("vite manifest resolves hashed entry assets", () => {
  const distDir = resolveDistDir(path.join(__dirname, "../src"));
  const manifest = loadClientManifest(distDir);
  const assets = resolveClientAssets(manifest);
  assert.ok(assets);
  assert.match(assets.entryUrl, /^\/assets\/main-/);
  assert.match(assets.buildId, /^main-/);
});

test("buildHtml accepts manifest-driven asset lists", async () => {
  const { buildHtml } = await import("../src/server/page-template.js");
  const html = buildHtml({
    clientScriptUrl: "/assets/main-deadbeef.js",
    clientPreloadUrls: ["/assets/vendor-deadbeef.js"],
    clientCssUrls: [],
    clientBuildId: "main-deadbeef",
    manifestUrl: "/manifest.webmanifest",
    logoDataUrl: "/logo.jpg",
    wallpaperDataUrl: "/wallpaper.png",
    emojiIconDataUrl: "/emoji.png",
    settingsKeyboardIconDataUrl: "/attach.png",
    uiFlags: {
      telegramTopBar: true,
      desktopInterFont: true,
      desktopSideGuttersOnly: true,
      sidebarAccountCardHidden: false,
      newChatUi: false,
      newSidebar: false,
      newAuthUi: false
    }
  });

  assert.match(html, /src="\/assets\/main-deadbeef.js"/);
  assert.match(html, /rel="modulepreload" href="\/assets\/vendor-deadbeef.js"/);
  assert.match(html, /name="tg-build" content="main-deadbeef"/);
  assert.match(html, /id="app-root"/);
});

test("buildHtml serves thin shell when new UI flags are enabled", async () => {
  const { buildHtml } = await import("../src/server/page-template.js");
  const html = buildHtml({
    clientScriptUrl: "/assets/main-deadbeef.js",
    clientPreloadUrls: [],
    clientCssUrls: [],
    clientBuildId: "main-deadbeef",
    manifestUrl: "/manifest.webmanifest",
    logoDataUrl: "/logo.jpg",
    wallpaperDataUrl: "/wallpaper.png",
    emojiIconDataUrl: "/emoji.png",
    settingsKeyboardIconDataUrl: "/attach.png",
    uiFlags: {
      telegramTopBar: true,
      desktopInterFont: true,
      desktopSideGuttersOnly: true,
      sidebarAccountCardHidden: false,
      newChatUi: true,
      newSidebar: true,
      newAuthUi: true
    }
  });

  assert.match(html, /id="app-root"/);
  assert.doesNotMatch(html, /id="composer-input"/);
  assert.doesNotMatch(html, /id="chat-island"/);
});
