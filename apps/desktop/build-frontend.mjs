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
const materialSymbolsRounded400Url = "assets/fonts/material-symbols-rounded-400.ttf";
const materialSymbolsRounded500Url = "assets/fonts/material-symbols-rounded-500.ttf";
const materialSymbolsRounded600Url = "assets/fonts/material-symbols-rounded-600.ttf";
const materialSymbolsRounded700Url = "assets/fonts/material-symbols-rounded-700.ttf";
const messageSoundUrl = "assets/sounds/message-sound.mp3";
const sendLocalSoundUrl = "assets/sounds/send-local.mp3";
const outgoingCallRingtoneUrl = "assets/sounds/cell-phone-ring.mp3";
const incomingCallRingtoneUrl = "assets/sounds/telegram-zvonok-pk.mp3";
const searchEmptyVideoUrl = "assets/search-empty.mp4";
const manifestUrl = "manifest.json";
const serviceWorkerUrl = "sw.js";

// API always points to the live backend (works online; offline is gracefully handled by the app itself)
const apiBaseUrl = "https://web.thegrapht.su/api";
const wsBaseUrl = "wss://web.thegrapht.su/ws";

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
const clientScript = buildClientScript({
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
  height: 32px; display: flex; align-items: center;
  justify-content: space-between;
  background: rgba(16,19,27,0.97);
  border-bottom: 1px solid var(--border-subtle);
  -webkit-app-region: drag; -webkit-user-select: none;
  user-select: none; flex-shrink: 0; z-index: 999999;
  position: fixed; top: 0; left: 0; right: 0;
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
body { padding-top: 32px; }
#page-root { height: calc(100vh - 32px) !important; }

/* Desktop-specific overrides */
.auth-faq-link { display: none !important; }

.page.workspace-mode .view {
  height: calc(100vh - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  width: 100vw !important;
  max-width: 100vw !important;
}

.composer {
  margin-bottom: 12px !important;
}

.sidebar-update-btn {
  margin: 12px 16px 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid rgba(88, 101, 242, 0.4);
  background: rgba(88, 101, 242, 0.1);
  color: #eff4ff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s, border-color .15s;
  width: calc(100% - 32px);
  box-sizing: border-box;
}

.sidebar-update-btn:hover:not(:disabled) {
  background: rgba(88, 101, 242, 0.2);
  border-color: rgba(88, 101, 242, 0.6);
}

.sidebar-update-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
const htmlWithTitlebar = html
  .replace("<title>TheGraphT Web</title>", "<title>TheGraphT</title>")
  .replace("</head>", `${TITLEBAR_CSS}\n</head>`);

// inject titlebar HTML at start of body
const TITLEBAR_HTML = `
<div class="native-titlebar" data-tauri-drag-region="true" aria-label="Window controls">
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
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
      e.preventDefault();
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
              var btn = document.getElementById("sidebar-update-btn");
              if (btn) return;

              btn = document.createElement("button");
              btn.id = "sidebar-update-btn";
              btn.className = "sidebar-update-btn";
              btn.type = "button";
              btn.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true" style="font-size: 16px;">download</span><span>Update to v' + latestVersion + '</span>';

              const sidebar = document.querySelector(".workspace-sidebar");
              if (sidebar) {
                sidebar.appendChild(btn);
              }

              btn.addEventListener("click", function() {
                btn.disabled = true;
                btn.innerHTML = '<span class="material-symbols-rounded animate-spin" aria-hidden="true" style="font-size: 16px;">autorenew</span><span>Updating...</span>';
                window.tgDesktop.window.updateApp();
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
  "fonts/material-symbols-rounded-400.ttf",
  "fonts/material-symbols-rounded-500.ttf",
  "fonts/material-symbols-rounded-600.ttf",
  "fonts/material-symbols-rounded-700.ttf"
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
