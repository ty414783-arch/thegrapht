/**
 * build-frontend.mjs
 * 
 * Generates the static Tauri frontend bundle from the live website source.
 * Output goes to dist/renderer/ which is then packaged into the EXE by electron-builder.
 * 
 * Usage: node build-frontend.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── paths ──────────────────────────────────────────────────────────────────
const FRONTEND_SRC = path.resolve(__dirname, "../frontend/src/server");
const RES_DIR = path.resolve(__dirname, "../../res");
const OUT_DIR = path.resolve(__dirname, "dist/renderer");
const ASSETS_DIR = path.join(OUT_DIR, "assets");

console.log("🔧 Building desktop frontend from website source...");
console.log("   Source:", FRONTEND_SRC);
console.log("   Res:   ", RES_DIR);
console.log("   Output:", OUT_DIR);

// ── helpers ─────────────────────────────────────────────────────────────────
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}
function readBuffer(relPath) {
  return fs.readFileSync(path.join(RES_DIR, relPath));
}
function toDataUrl(mime, buf) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

ensureDir(ASSETS_DIR);
ensureDir(path.join(ASSETS_DIR, "fonts"));
ensureDir(path.join(ASSETS_DIR, "emoji", "apple-64"));
ensureDir(path.join(ASSETS_DIR, "sounds"));

// ── asset urls (served from /assets/) ───────────────────────────────────────
const logoUrl = "assets/logo.jpg";
const wallpaperUrl = toDataUrl("image/webp", readBuffer("wallpaper-optimized.webp"));
const emojiIconUrl = toDataUrl("image/webp", readBuffer("emoji-icon.webp"));
const settingsKeyboardIconUrl = toDataUrl("image/webp", readBuffer("settings-icon-keyboard.webp"));
const sendButtonIconUrl = "assets/send-button.png";
const appleEmojiAssetBaseUrl = "assets/emoji/apple-64/";
const inter400Url = "assets/fonts/inter-400.ttf";
const inter500Url = "assets/fonts/inter-500.ttf";
const inter600Url = "assets/fonts/inter-600.ttf";
const inter700Url = "assets/fonts/inter-700.ttf";
const inter800Url = "assets/fonts/inter-800.ttf";
const materialSymbolsRounded400Url = "";
const materialSymbolsRounded500Url = "";
const materialSymbolsRounded600Url = "";
const materialSymbolsRounded700Url = "";
const messageSoundUrl = "assets/sounds/message-sound.mp3";
const sendLocalSoundUrl = "assets/sounds/send-local.mp3";
const outgoingCallRingtoneUrl = "assets/sounds/cell-phone-ring.mp3";
const incomingCallRingtoneUrl = "assets/sounds/telegram-zvonok-pk.mp3";
const searchEmptyVideoUrl = "assets/search-empty.mp4";
const manifestUrl = "manifest.json";
const serviceWorkerUrl = "sw.js";
const apiBaseUrl = "https://api.thegrapht.su";
const wsBaseUrl = "wss://ws.thegrapht.su";

// ── import website modules ───────────────────────────────────────────────────
const { buildHtml } = await import(`${FRONTEND_SRC}/page-template.js`);
const { buildClientScript } = await import(`${FRONTEND_SRC}/client-script.js`);
const { manifestJson, serviceWorkerScript } = await import(`${FRONTEND_SRC}/pwa.js`);

const uiFlags = {
  telegramTopBar: true,
  desktopInterFont: true,
  desktopSideGuttersOnly: false,
  sidebarAccountCardHidden: true
};

// ── build the app JS ─────────────────────────────────────────────────────────
let compiledScript = "";
const compiledAppPath = path.resolve(__dirname, "../frontend/dist/app.js");
try {
  if (fs.existsSync(compiledAppPath)) {
    compiledScript = fs.readFileSync(compiledAppPath, "utf8");
    console.log("Loaded compiled Preact client script from ../frontend/dist/app.js");
  } else {
    console.warn("Compiled Preact client script NOT found at:", compiledAppPath);
  }
} catch (err) {
  console.warn("Failed to read compiled client script:", err);
}

const fallbackScript = buildClientScript({
  apiBaseUrl,
  appleEmojiAssetBaseUrl,
  outgoingCallRingtoneUrl,
  incomingCallRingtoneUrl,
  rtcIceServers: "",
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
const clientScriptFilename = `app.${clientScriptHash}.js`;
const clientScriptUrl = `${clientScriptFilename}`;

// ── build the HTML ───────────────────────────────────────────────────────────
const html = buildHtml({
  clientScriptUrl,
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  materialSymbolsRounded400Url,
  materialSymbolsRounded500Url,
  materialSymbolsRounded600Url,
  materialSymbolsRounded700Url,
  manifestUrl,
  logoDataUrl: logoUrl,
  wallpaperDataUrl: wallpaperUrl,
  emojiIconDataUrl: emojiIconUrl,
  settingsKeyboardIconDataUrl: settingsKeyboardIconUrl,
  sendButtonIconDataUrl: sendButtonIconUrl,
  uiFlags
});

// ── inject desktop titlebar styles into the HTML ─────────────────────────────
const TITLEBAR_CSS = `<style id="desktop-titlebar-css">
:root { --border-subtle: rgba(255,255,255,0.06); }
.native-titlebar {
  height: 38px; display: flex; align-items: center;
  justify-content: space-between;
  background: rgba(16,19,27,0.97);
  border-bottom: 1px solid var(--border-subtle);
  -webkit-app-region: drag; -webkit-user-select: none;
  user-select: none; flex-shrink: 0; z-index: 999999;
  position: fixed; top: 0; left: 0; right: 0;
}
.titlebar-title-container {
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: drag;
  flex-shrink: 0;
}
.tb-discord-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #5865F2;
  flex-shrink: 0;
}
.tb-avatar-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
/* Style overrides for standard avatars placed inside titlebar */
.tb-avatar-container .dialog-avatar {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
  font-size: 8px !important;
  border-radius: 50% !important;
  margin: 0 !important;
  box-shadow: none !important;
  border: none !important;
}
.tb-avatar-container .dialog-avatar img,
.tb-avatar-container .dialog-avatar svg {
  width: 18px !important;
  height: 18px !important;
}
.tb-avatar-container .dialog-avatar .dialog-avatar-presence,
.tb-avatar-container .dialog-avatar .dialog-avatar-secret {
  display: none !important;
}
.tb-title-text {
  color: #eff4ff;
  font-weight: 700;
  font-size: 12px;
  font-family: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.titlebar-drag-zone { flex: 1; height: 100%; }
.titlebar-controls {
  display: flex; align-items: stretch; height: 100%;
  -webkit-app-region: no-drag;
}
.titlebar-btn {
  width: 46px; border: none; background: transparent;
  color: rgba(160,185,230,0.7); cursor: pointer;
  display: grid; place-items: center;
  transition: background .15s, color .15s;
}
.titlebar-btn:hover { background: rgba(255,255,255,0.08); color: #e8eeff; }
.titlebar-btn.close:hover { background: #e81123; color: #fff; }
body { padding-top: 38px; }
#page-root { height: calc(100vh - 38px) !important; }
 
/* Desktop-specific overrides */
.auth-faq-link { display: none !important; }
 
.page.workspace-mode .view {
  height: calc(100vh - 38px) !important;
  max-height: calc(100vh - 38px) !important;
  width: 100vw !important;
  max-width: 100vw !important;
}

.composer {
  margin-bottom: 12px !important;
}

.sidebar-update-container {
  margin: 12px 16px 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: calc(100% - 32px);
  transform: translateY(30px);
  opacity: 0;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
}

.sidebar-update-container.show {
  transform: translateY(0);
  opacity: 1;
}

.sidebar-update-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 2;
}

.sidebar-update-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.sidebar-update-title {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 13px;
}

.sidebar-update-subtitle {
  color: #94a3b8;
  font-size: 11px;
}

.sidebar-update-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar-update-action-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: inherit;
}

.sidebar-update-action-btn.download {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.sidebar-update-action-btn.download:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.sidebar-update-action-btn.cancel {
  background: rgba(244, 63, 94, 0.1);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.sidebar-update-action-btn.cancel:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.2);
}

.sidebar-update-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.sidebar-update-progress-wrap {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
  display: none;
  width: 100%;
  z-index: 2;
}

.sidebar-update-progress-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  transition: width 0.1s ease;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

*:not(input):not(textarea):not([contenteditable]):not([contenteditable] *) {
  -webkit-user-select: none !important;
  user-select: none !important;
}
</style>`;

// inject titlebar CSS before </head> and replace the title tag to match premium casing
// Also inject __THEGRAPHT_CONFIG__ so bootstrap.ts can read appleEmojiAssetBaseUrl
const DESKTOP_CONFIG_SCRIPT = `<script>window.__THEGRAPHT_CONFIG__ = {
  apiBaseUrl: ${JSON.stringify(apiBaseUrl)},
  appleEmojiAssetBaseUrl: ${JSON.stringify(appleEmojiAssetBaseUrl)},
  outgoingCallRingtoneUrl: ${JSON.stringify(outgoingCallRingtoneUrl)},
  incomingCallRingtoneUrl: ${JSON.stringify(incomingCallRingtoneUrl)},
  logoDataUrl: ${JSON.stringify(logoUrl)},
  messageSoundUrl: ${JSON.stringify(messageSoundUrl)},
  searchEmptyVideoUrl: ${JSON.stringify(searchEmptyVideoUrl)},
  sendLocalSoundUrl: ${JSON.stringify(sendLocalSoundUrl)},
  serviceWorkerUrl: ${JSON.stringify(serviceWorkerUrl)},
  uiFlags: ${JSON.stringify(uiFlags)},
  wsBaseUrl: ${JSON.stringify(wsBaseUrl)}
};</script>`;

const htmlWithTitlebar = html
  .replace("<title>TheGraphT Web</title>", "<title>TheGraphT</title>")
  .replace("</head>", `${TITLEBAR_CSS}\n${DESKTOP_CONFIG_SCRIPT}\n</head>`);

// inject titlebar HTML at start of body
const TITLEBAR_HTML = `
<div class="native-titlebar" data-tauri-drag-region="true" aria-label="Window controls">
  <div class="titlebar-title-container" id="tb-title-container" data-tauri-drag-region="true">
    <span class="tb-title-text" style="color: #eff4ff; font-weight: 700; font-size: 12px; font-family: inherit;">TheGraphT</span>
  </div>
  <div class="titlebar-drag-zone" data-tauri-drag-region="true"></div>
  <div class="titlebar-controls">
    <button class="titlebar-btn" id="tb-min" title="Minimize" aria-label="Minimize">
      <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1" rx="0.5"/></svg>
    </button>
    <button class="titlebar-btn" id="tb-max" title="Maximize" aria-label="Maximize">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><rect x="0.5" y="0.5" width="9" height="9" rx="1"/></svg>
    </button>
    <button class="titlebar-btn close" id="tb-close" title="Close" aria-label="Close">
      <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
        <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
      </svg>
    </button>
  </div>
</div>
<script>
(function() {
  window.onerror = function(message, source, lineno, colno, error) {
    var errDiv = document.createElement("div");
    errDiv.style.position = "fixed";
    errDiv.style.top = "40px";
    errDiv.style.left = "10px";
    errDiv.style.right = "10px";
    errDiv.style.background = "#e81123";
    errDiv.style.color = "white";
    errDiv.style.padding = "20px";
    errDiv.style.zIndex = "9999999";
    errDiv.style.overflow = "auto";
    errDiv.style.fontFamily = "monospace";
    errDiv.style.borderRadius = "8px";
    errDiv.style.border = "2px solid white";
    errDiv.style.maxHeight = "80vh";
    errDiv.innerHTML = "<h3>[DEATH SCREEN] Unhandled Runtime Error</h3>" +
      "<p><b>Message:</b> " + message + "</p>" +
      "<p><b>Source:</b> " + source + "</p>" +
      "<p><b>Line:</b> " + lineno + ":" + colno + "</p>" +
      "<pre>" + (error && error.stack ? error.stack : "") + "</pre>";
    document.body.appendChild(errDiv);
    return false;
  };
  window.onunhandledrejection = function(event) {
    var errDiv = document.createElement("div");
    errDiv.style.position = "fixed";
    errDiv.style.top = "40px";
    errDiv.style.left = "10px";
    errDiv.style.right = "10px";
    errDiv.style.background = "#ff5722";
    errDiv.style.color = "white";
    errDiv.style.padding = "20px";
    errDiv.style.zIndex = "9999999";
    errDiv.style.overflow = "auto";
    errDiv.style.fontFamily = "monospace";
    errDiv.style.borderRadius = "8px";
    errDiv.style.border = "2px solid white";
    errDiv.style.maxHeight = "80vh";
    errDiv.innerHTML = "<h3>[DEATH SCREEN] Unhandled Promise Rejection</h3>" +
      "<p><b>Reason:</b> " + event.reason + "</p>" +
      "<pre>" + (event.reason && event.reason.stack ? event.reason.stack : "") + "</pre>";
    document.body.appendChild(errDiv);
  };

  function isTauri() { return typeof window !== "undefined" && !!window.__TAURI_INTERNALS__; }
  function isElectron() { return typeof window !== "undefined" && !!window.tgDesktop; }

  // Enforce copy blocks globally
  document.addEventListener('copy', function(e) {
    var activeEl = document.activeElement;
    var isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.hasAttribute('contenteditable'));
    if (!isInput) {
      e.preventDefault();
    }
  });

  // Enforce keyboard hotkey blocks
  document.addEventListener('keydown', function(e) {
    var key = e.key.toLowerCase();
    if (
      e.key === 'F5' || 
      (e.ctrlKey && key === 'r') || 
      (e.metaKey && key === 'r') ||
      (e.ctrlKey && e.shiftKey && key === 'r') ||
      (e.metaKey && e.shiftKey && key === 'r')
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // Enforce update check
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (isElectron() && window.tgDesktop && window.tgDesktop.config) {
        var currentVersion = window.tgDesktop.config.version;
        fetch("https://web.thegrapht.su/download/release/desktop/latest.yml", { cache: "no-store" })
          .then(function(res) {
            if (res.ok) return res.text();
          })
          .then(function(text) {
            if (!text) return;
            var match = text.match(/version:\s*([0-9.]+)/i);
            if (!match) return;
            var latestVersion = match[1];
            if (latestVersion !== currentVersion) {
              var container = document.getElementById("sidebar-update-container");
              if (container) return;

              container = document.createElement("div");
              container.id = "sidebar-update-container";
              container.className = "sidebar-update-container";
              
              container.innerHTML = 
                '<div class="sidebar-update-content">' +
                  '<div class="sidebar-update-info">' +
                    '<span class="sidebar-update-title">Доступно обновление v' + latestVersion + '</span>' +
                    '<span class="sidebar-update-subtitle" id="sidebar-update-status">Нажмите для загрузки и установки</span>' +
                  '</div>' +
                  '<div class="sidebar-update-actions">' +
                    '<button class="sidebar-update-action-btn download" id="sidebar-update-download-btn">Обновить</button>' +
                    '<button class="sidebar-update-action-btn cancel" id="sidebar-update-cancel-btn" style="display: none;">Отмена</button>' +
                  '</div>' +
                '</div>' +
                '<div class="sidebar-update-progress-wrap" id="sidebar-update-progress-wrap">' +
                  '<div class="sidebar-update-progress-bar" id="sidebar-update-progress-bar"></div>' +
                '</div>';

              const sidebar = document.querySelector(".workspace-sidebar");
              if (sidebar) {
                sidebar.appendChild(container);
                // Trigger sliding animation with a small timeout
                setTimeout(function() {
                  container.classList.add("show");
                }, 100);
              }

              var downloadBtn = container.querySelector("#sidebar-update-download-btn");
              var cancelBtn = container.querySelector("#sidebar-update-cancel-btn");
              var progressWrap = container.querySelector("#sidebar-update-progress-wrap");
              var progressBar = container.querySelector("#sidebar-update-progress-bar");
              var statusText = container.querySelector("#sidebar-update-status");

              downloadBtn.addEventListener("click", function() {
                downloadBtn.style.display = "none";
                cancelBtn.style.display = "block";
                progressWrap.style.display = "block";
                progressBar.style.width = "0%";
                statusText.textContent = "Подготовка к загрузке...";
                window.tgDesktop.window.updateApp();
              });

              cancelBtn.addEventListener("click", function() {
                cancelBtn.disabled = true;
                statusText.textContent = "Отмена обновления...";
                window.tgDesktop.window.cancelUpdate();
              });

              window.tgDesktop.onUpdateProgress(function(percent) {
                progressBar.style.width = percent + "%";
                statusText.textContent = "Загрузка: " + percent + "%";
              });

              window.tgDesktop.onUpdateCancelled(function() {
                downloadBtn.style.display = "block";
                downloadBtn.disabled = false;
                cancelBtn.style.display = "none";
                cancelBtn.disabled = false;
                progressWrap.style.display = "none";
                progressBar.style.width = "0%";
                statusText.textContent = "Нажмите для загрузки и установки";
              });

              window.tgDesktop.onUpdateError(function(message) {
                downloadBtn.style.display = "block";
                downloadBtn.disabled = false;
                cancelBtn.style.display = "none";
                cancelBtn.disabled = false;
                progressWrap.style.display = "none";
                progressBar.style.width = "0%";
                statusText.textContent = "Ошибка: " + (message || "не удалось загрузить");
              });
            }
          })
          .catch(function(err) {
            console.error("Update check failed", err);
          });
      }
    }, 2000);
  });

  document.addEventListener("DOMContentLoaded", function() {
    if (!isTauri() && !isElectron()) {
      var tb = document.querySelector(".native-titlebar");
      if (tb) tb.style.display = "none";
      document.body.style.paddingTop = "0";
      var pr = document.getElementById("page-root");
      if (pr) pr.style.height = "100vh";
      return;
    }
    document.getElementById("tb-min").addEventListener("click", function() {
      if (isTauri() && window.__TAURI__ && window.__TAURI__.window) {
        window.__TAURI__.window.getCurrentWindow().minimize();
      } else if (isElectron()) {
        window.tgDesktop.window.minimize();
      }
    });
    document.getElementById("tb-max").addEventListener("click", function() {
      if (isTauri() && window.__TAURI__ && window.__TAURI__.window) {
        var w = window.__TAURI__.window.getCurrentWindow();
        w.isMaximized().then(function(maxed) {
          if (maxed) { w.unmaximize(); } else { w.maximize(); }
        });
      } else if (isElectron()) {
        window.tgDesktop.window.toggleMaximize();
      }
    });
    document.getElementById("tb-close").addEventListener("click", function() {
      if (isTauri() && window.__TAURI__ && window.__TAURI__.window) {
        window.__TAURI__.window.getCurrentWindow().close();
      } else if (isElectron()) {
        window.tgDesktop.window.close();
      }
    });
  });
})();
</script>`;

const finalHtml = htmlWithTitlebar.replace("<body>", `<body>\n${TITLEBAR_HTML}`);

// ── write files ───────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(OUT_DIR, "index.html"), finalHtml, "utf8");
console.log("✓ index.html written");

fs.writeFileSync(path.join(OUT_DIR, clientScriptFilename), clientScript, "utf8");
console.log(`✓ ${clientScriptFilename} written`);

fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), manifestJson, "utf8");
console.log("✓ manifest.json written");

if (serviceWorkerScript) {
  fs.writeFileSync(path.join(OUT_DIR, "sw.js"), serviceWorkerScript, "utf8");
  console.log("✓ sw.js written");
}

// ── copy binary assets ────────────────────────────────────────────────────────
const fontFiles = [
  "fonts/inter-400.ttf",
  "fonts/inter-500.ttf",
  "fonts/inter-600.ttf",
  "fonts/inter-700.ttf",
  "fonts/inter-800.ttf",
  "fonts/lucide.ttf",
  "fonts/lucide.css"
];
for (const f of fontFiles) {
  const dest = path.join(ASSETS_DIR, f);
  ensureDir(path.dirname(dest));
  copyFile(path.join(RES_DIR, f), dest);
}
console.log(`✓ ${fontFiles.length} fonts copied`);

copyFile(path.join(RES_DIR, "logo.jpg"), path.join(ASSETS_DIR, "logo.jpg"));
copyFile(path.join(RES_DIR, "send button.png"), path.join(ASSETS_DIR, "send-button.png"));
copyFile(path.join(RES_DIR, "utyasearch.gif.mp4"), path.join(ASSETS_DIR, "search-empty.mp4"));
console.log("✓ static images/video copied");

const soundMap = {
  "sounds/message sound.mp3": "sounds/message-sound.mp3",
  "sounds/send local.mp3": "sounds/send-local.mp3",
  "sounds/cell phone ring.mp3": "sounds/cell-phone-ring.mp3",
  "sounds/telegram-zvonok-pk.mp3": "sounds/telegram-zvonok-pk.mp3"
};
for (const [src, dest] of Object.entries(soundMap)) {
  ensureDir(path.join(ASSETS_DIR, "sounds"));
  copyFile(path.join(RES_DIR, src), path.join(ASSETS_DIR, dest));
}
console.log("✓ sounds copied");

// copy emoji apple-64 directory
const emojiSrc = path.join(RES_DIR, "emoji/apple-64");
const emojiDest = path.join(ASSETS_DIR, "emoji/apple-64");
ensureDir(emojiDest);
const emojiFiles = fs.readdirSync(emojiSrc);
for (const ef of emojiFiles) {
  copyFile(path.join(emojiSrc, ef), path.join(emojiDest, ef));
}
console.log(`✓ ${emojiFiles.length} emoji files copied`);

console.log("\n✅ Desktop frontend build complete →", OUT_DIR);
