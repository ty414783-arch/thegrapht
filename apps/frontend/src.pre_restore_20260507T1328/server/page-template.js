import { buildComposerMarkup, composerStyles } from "./components/composer.js";

export const buildHtml = ({
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
  logoDataUrl,
  wallpaperDataUrl,
  emojiIconDataUrl,
  settingsKeyboardIconDataUrl,
  sendButtonIconDataUrl,
  uiFlags
}) => {
  const pageClassNames = [
    "page",
    "booting",
    uiFlags.telegramTopBar ? "ui-telegram-topbar" : "ui-legacy-chat-island",
    uiFlags.desktopInterFont ? "ui-inter-font" : "ui-system-font",
    uiFlags.desktopSideGuttersOnly ? "ui-side-gutters-only" : "ui-full-bleed-shell"
  ].join(" ");

  const workspaceAccountClassName = uiFlags.sidebarAccountCardHidden
    ? "workspace-account is-hidden"
    : "workspace-account";

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#171b22" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="preload" href="${clientScriptUrl}" as="script" />
    <link rel="preload" href="${inter400Url}" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="${inter500Url}" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="${inter600Url}" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="${inter700Url}" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="${inter800Url}" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="${materialSymbolsRounded500Url}" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="${wallpaperDataUrl}" as="image" />
    <link rel="preload" href="${emojiIconDataUrl}" as="image" />
    <link rel="preload" href="${settingsKeyboardIconDataUrl}" as="image" />
    <link rel="preload" href="${sendButtonIconDataUrl}" as="image" />
    <link rel="manifest" href="${manifestUrl}" />
    <link rel="icon" href="${logoDataUrl}" />
    <link rel="apple-touch-icon" href="${logoDataUrl}" />
    <title>TheGraphT Web</title>
    <style>
      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 400;
        font-display: block;
        src: url("${inter400Url}") format("truetype");
      }
      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 500;
        font-display: block;
        src: url("${inter500Url}") format("truetype");
      }
      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 600;
        font-display: block;
        src: url("${inter600Url}") format("truetype");
      }
      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 700;
        font-display: block;
        src: url("${inter700Url}") format("truetype");
      }
      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 800;
        font-display: block;
        src: url("${inter800Url}") format("truetype");
      }
      @font-face {
        font-family: "Material Symbols Rounded";
        font-style: normal;
        font-weight: 400;
        font-display: block;
        src: url("${materialSymbolsRounded400Url}") format("truetype");
      }
      @font-face {
        font-family: "Material Symbols Rounded";
        font-style: normal;
        font-weight: 500;
        font-display: block;
        src: url("${materialSymbolsRounded500Url}") format("truetype");
      }
      @font-face {
        font-family: "Material Symbols Rounded";
        font-style: normal;
        font-weight: 600;
        font-display: block;
        src: url("${materialSymbolsRounded600Url}") format("truetype");
      }
      @font-face {
        font-family: "Material Symbols Rounded";
        font-style: normal;
        font-weight: 700;
        font-display: block;
        src: url("${materialSymbolsRounded700Url}") format("truetype");
      }
      :root {
        color: #eef2fb;
        font-family: "Segoe UI", "Trebuchet MS", sans-serif;
        --motion-standard: cubic-bezier(0.2, 0, 0, 1);
        --motion-emphasized: cubic-bezier(0.2, 0, 0, 1);
        --motion-spring: cubic-bezier(0.2, 0, 0, 1);
        --m3-primary: #d0bcff;
        --m3-secondary: #ccc2dc;
        --m3-tertiary: #efb8c8;
        --m3-surface: #14171f;
      }
      .material-symbols-rounded {
        font-family: "Material Symbols Rounded";
        font-weight: 500;
        font-style: normal;
        font-size: 22px;
        line-height: 1;
        letter-spacing: 0;
        text-transform: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-feature-settings: "liga";
        -webkit-font-smoothing: antialiased;
        font-variation-settings: "FILL" 0, "wght" 520, "GRAD" 0, "opsz" 24;
        pointer-events: none;
        user-select: none;
      }
      .page.ui-inter-font {
        font-family: "Inter", "Segoe UI", sans-serif;
      }
      .workspace-mode #workspace-view {
        font-family: "Inter", "Segoe UI", sans-serif;
      }
      html {
        height: 100%;
        overflow: hidden;
      }
      * {
        box-sizing: border-box;
      }
      button,
      a,
      input,
      [role="button"],
      [tabindex] {
        -webkit-tap-highlight-color: transparent;
      }
      button:focus,
      button:focus-visible,
      a:focus,
      a:focus-visible,
      [role="button"]:focus,
      [role="button"]:focus-visible,
      [tabindex]:focus,
      [tabindex]:focus-visible {
        outline: none;
      }
      body {
        margin: 0;
        height: 100%;
        overflow: hidden;
        background:
          radial-gradient(circle at 15% 15%, rgba(87, 114, 255, 0.12), transparent 28%),
          radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.05), transparent 20%),
          linear-gradient(180deg, #15181f 0%, #12161d 100%);
      }
      .page {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        position: relative;
        overflow: hidden;
      }
      .app-progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        z-index: 120;
        pointer-events: none;
        opacity: 0;
        transform: translateY(-2px);
        transition: opacity 0.12s var(--motion-standard), transform 0.12s var(--motion-standard);
        --app-progress-value: 0;
      }
      .app-progress.active {
        opacity: 1;
        transform: translateY(0);
      }
      .app-progress.finishing {
        opacity: 0;
        transform: translateY(0);
      }
      .app-progress-track {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: rgba(255,255,255,0.08);
      }
      .app-progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0 999px 999px 0;
        background: rgba(238, 242, 251, 0.72);
        box-shadow: none;
        transform: scaleX(var(--app-progress-value));
        transform-origin: left center;
        transition: transform 0.22s linear;
      }
      .page.workspace-mode {
        --desktop-shell-gutter: clamp(12px, 2vw, 28px);
        align-items: stretch;
        justify-content: center;
        padding: 0;
        background: #181c25;
      }
      .page.ui-side-gutters-only.workspace-mode {
        padding: 0 var(--desktop-shell-gutter);
        background:
          linear-gradient(90deg, #151922 0%, #181c25 14%, #1b1f27 50%, #181c25 86%, #151922 100%);
      }
      .page.booting {
        opacity: 0;
      }
      .page:not(.booting) {
        animation: pageReveal 0.16s var(--motion-standard) both;
      }
      @keyframes pageReveal {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .view {
        width: min(1420px, 100%);
        max-height: 100%;
      }
      .page.workspace-mode .view {
        width: min(100%, 1720px);
        max-width: calc(100vw - (var(--desktop-shell-gutter) * 2));
        height: 100dvh;
        max-height: 100dvh;
      }
      .view.hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        position: absolute;
      }
      .auth-shell {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 28px;
      }
      .panel {
        border-radius: 32px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background: linear-gradient(180deg, rgba(37, 41, 50, 0.96), rgba(29, 33, 41, 0.98));
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.32);
      }
      .brand-panel {
        min-height: 760px;
        padding: 56px 58px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      .brand-panel::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 60% 35%, rgba(255, 255, 255, 0.06), transparent 18%),
          radial-gradient(circle at 50% 75%, rgba(95, 116, 255, 0.15), transparent 24%);
        pointer-events: none;
      }
      .brand-stack {
        position: relative;
        z-index: 1;
        max-width: 520px;
        margin: 0 auto;
        text-align: center;
      }
      .logo-mark {
        width: 206px;
        height: 206px;
        margin: 0 auto 28px;
        border-radius: 42px;
        overflow: hidden;
        box-shadow: 0 30px 70px rgba(0,0,0,0.28);
      }
      .logo-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .overline {
        margin: 0 0 14px;
        color: rgba(221, 225, 239, 0.65);
        font-size: 13px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }
      .brand-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 18px;
        font-weight: 700;
        color: #f6f8ff;
        margin-bottom: 26px;
      }
      .brand-title {
        margin: 0;
        font-size: clamp(58px, 6vw, 90px);
        line-height: 0.95;
        letter-spacing: -0.05em;
        font-weight: 800;
      }
      .auth-panel {
        min-height: 760px;
        padding: 30px;
      }
      .auth-card {
        height: 100%;
        border-radius: 30px;
        border: 1px solid rgba(255,255,255,0.05);
        background: linear-gradient(180deg, #1a1e25 0%, #191d24 100%);
        padding: 34px 30px 28px;
        display: flex;
        flex-direction: column;
      }
      .auth-inner {
        max-width: 520px;
      }
      .auth-copy-block {
        transition: opacity 0.22s ease, transform 0.22s ease;
      }
      .auth-copy-block.switching {
        opacity: 0;
        transform: translateY(12px);
      }
      .auth-kicker {
        margin: 0 0 14px;
        color: rgba(221, 225, 239, 0.62);
        font-size: 13px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
      }
      .auth-title {
        margin: 0 0 14px;
        font-size: clamp(42px, 4vw, 58px);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }
      .auth-copy {
        margin: 0 0 28px;
        color: #9da5b4;
        font-size: 17px;
        line-height: 1.6;
        max-width: 420px;
      }
      .brand-title {
        min-height: 2.05em;
      }
      .brand-title-dynamic-line {
        position: relative;
        display: block;
        min-height: 1.02em;
      }
      .brand-title-dynamic-placeholder {
        visibility: hidden;
      }
      .brand-title-dynamic-wrap {
        position: absolute;
        inset: 0;
        display: inline-flex;
        align-items: baseline;
        justify-content: center;
        white-space: nowrap;
      }
      .brand-title-dynamic {
        display: inline;
      }
      .brand-title-cursor {
        display: inline-block;
        width: 0.05em;
        height: 0.88em;
        margin-left: 0.04em;
        background: currentColor;
        border-radius: 999px;
        vertical-align: -0.04em;
        animation: authCursorBlink 1s steps(1, end) infinite;
      }
      @keyframes authCursorBlink {
        0%, 46% {
          opacity: 1;
        }
        47%, 100% {
          opacity: 0;
        }
      }
      .toggle-field {
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transform: translateY(-12px);
        transition: max-height 0.32s ease, opacity 0.28s ease, transform 0.28s ease, margin-bottom 0.28s ease;
        margin-bottom: 0;
      }
      .toggle-field.open {
        max-height: 140px;
        opacity: 1;
        transform: translateY(0);
        margin-bottom: 18px;
      }
      .field label {
        display: block;
        margin-bottom: 10px;
        color: #9da5b4;
        font-size: 15px;
      }
      .field input {
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: #252a33;
        color: #eef2fb;
        border-radius: 20px;
        padding: 19px 18px;
        font-size: 18px;
        outline: none;
        transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
      }
      .field input:focus {
        border-color: rgba(255,255,255,0.16);
        box-shadow: 0 0 0 4px rgba(255,255,255,0.03);
        transform: translateY(-1px);
      }
      .field input.invalid,
      .field input[aria-invalid="true"] {
        border-color: rgba(255, 96, 96, 0.78);
        box-shadow: 0 0 0 4px rgba(255, 96, 96, 0.12);
        background: linear-gradient(180deg, rgba(72, 34, 34, 0.96), rgba(44, 25, 25, 0.96));
      }
      .field input.invalid:focus,
      .field input[aria-invalid="true"]:focus {
        border-color: rgba(255, 120, 120, 0.96);
        box-shadow: 0 0 0 4px rgba(255, 96, 96, 0.16);
      }
      .field {
        margin-bottom: 18px;
      }
      .submit {
        width: 100%;
        border: 0;
        border-radius: 20px;
        padding: 18px 20px;
        font-size: 18px;
        font-weight: 800;
        color: #1b1f26;
        background: linear-gradient(180deg, #ffffff 0%, #ebedf3 100%);
        cursor: pointer;
        margin-top: 8px;
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
      }
      .submit:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(255,255,255,0.08);
      }
      .submit:disabled {
        opacity: 0.72;
        cursor: wait;
      }
      .meta-row {
        margin-top: auto;
        padding-top: 28px;
        color: #8f97a5;
        font-size: 16px;
      }
      .meta-row button {
        border: 0;
        background: transparent;
        color: #f1f4fd;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        padding: 0;
      }
      .auth-faq-link {
        color: #9da5b4;
        font-size: 14px;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.16s ease;
      }
      .auth-faq-link:hover {
        color: #c8d0e0;
      }
      .status {
        min-height: 24px;
        margin: 12px 0 4px;
        font-size: 15px;
      }
      .status.error {
        color: #ff9090;
      }
      .status.success {
        color: #8bf0b2;
      }
      .workspace-shell {
        --sidebar-width: 360px;
        position: relative;
        inset: auto;
        width: 100%;
        height: 100%;
        min-height: 0;
        display: grid;
        grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
        gap: 0;
        overflow: hidden;
      }
      .workspace-sidebar,
      .workspace-main {
        border-radius: 0;
        border: 0;
        box-shadow: none;
      }
      .workspace-sidebar {
        background: linear-gradient(180deg, rgba(37, 41, 50, 0.98), rgba(29, 33, 41, 0.99));
        padding: 18px 16px 18px 18px;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
        min-width: 320px;
        border-right: 1px solid rgba(255,255,255,0.06);
      }
      .sidebar-resize-handle {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 12px;
        cursor: col-resize;
        z-index: 4;
        touch-action: none;
      }
      .sidebar-resize-handle::before {
        content: "";
        position: absolute;
        top: 24px;
        bottom: 24px;
        right: 3px;
        width: 2px;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(132, 154, 192, 0.3) 30%, rgba(132, 154, 192, 0.3) 70%, rgba(255,255,255,0.03) 100%);
        opacity: 0;
        transition: opacity 0.18s ease, background 0.18s ease;
      }
      .workspace-sidebar:hover .sidebar-resize-handle::before,
      .workspace-shell.sidebar-resizing .sidebar-resize-handle::before {
        opacity: 1;
      }
      .workspace-shell.sidebar-resizing {
        cursor: col-resize;
        user-select: none;
      }
      .workspace-shell.sidebar-resizing * {
        cursor: col-resize !important;
      }
      .workspace-main {
        padding: 0;
        height: 100%;
        overflow: hidden;
        background: transparent;
        border: 0;
        box-shadow: none;
        position: relative;
      }
      .workspace-main::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 0;
        background:
          linear-gradient(180deg, rgba(12, 16, 24, 0.54) 0%, rgba(14, 18, 26, 0.68) 100%),
          url("${wallpaperDataUrl}") center center / cover no-repeat;
        opacity: 0.9;
        pointer-events: none;
      }
      .workspace-main > * {
        position: relative;
        z-index: 1;
      }
      .multi-tab-blocker {
        position: absolute;
        inset: 0;
        z-index: 60;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
        background: rgba(9, 13, 21, 0.9);
        backdrop-filter: blur(4px);
      }
      .multi-tab-blocker.visible {
        display: flex;
      }
      .multi-tab-blocker-card {
        width: min(520px, 100%);
        padding: 18px 20px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(22, 28, 40, 0.95);
        color: #eff4ff;
      }
      .multi-tab-blocker-title {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 800;
      }
      .multi-tab-blocker-copy {
        margin: 0;
        color: #c3cee3;
        line-height: 1.4;
        font-size: 14px;
      }
      .workspace-main.open-chat {
        display: flex;
        align-items: stretch;
      }
      .workspace-main.empty-chat {
        border: 0;
        background: transparent;
        box-shadow: none;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .workspace-brand {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 48px;
        margin: 12px 0 18px;
        padding: 0 6px;
      }
      .workspace-brand-leading {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      .workspace-brand-menu {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.06);
        color: #e8edf9;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
      }
      .workspace-brand-menu:hover {
        background: rgba(117, 154, 207, 0.2);
        border-color: rgba(173, 202, 243, 0.28);
      }
      .workspace-brand-menu:active {
        transform: scale(0.96);
      }
      .workspace-brand-menu .material-symbols-rounded {
        font-size: 23px;
      }
      .workspace-brand h1 {
        margin: 0;
        font-size: 27px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.035em;
        color: #f3f6fd;
      }
      .sidebar-glass-menu {
        position: absolute;
        top: 72px;
        left: 14px;
        width: 248px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.1);
        background: linear-gradient(170deg, rgba(34, 44, 61, 0.8), rgba(20, 26, 38, 0.72));
        box-shadow: 0 16px 34px rgba(3, 8, 16, 0.42);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
        pointer-events: none;
        transition: opacity 0.16s ease, transform 0.18s ease;
        z-index: 12;
        overflow: hidden;
      }
      .workspace-sidebar.menu-open .sidebar-glass-menu {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .sidebar-glass-menu-items {
        display: grid;
        padding: 10px;
      }
      .sidebar-glass-menu-item {
        border: 0;
        background: transparent;
        color: #e8edf9;
        border-radius: 12px;
        min-height: 42px;
        padding: 0 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.16s ease, transform 0.16s ease;
      }
      .sidebar-glass-menu-item:hover {
        background: rgba(255,255,255,0.08);
      }
      .sidebar-glass-menu-item:active {
        transform: scale(0.98);
      }
      .sidebar-glass-menu-item .material-symbols-rounded {
        font-size: 20px;
      }
      .sidebar-glass-menu-sep {
        border: 0;
        height: 1px;
        margin: 8px 0;
        background: rgba(255,255,255,0.08);
      }
      .workspace-account {
        margin: 4px 4px 12px;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.045);
      }
      .workspace-account.is-hidden {
        display: none;
      }
      .workspace-account-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .workspace-account-label {
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #9da5b4;
      }
      .workspace-account-name {
        font-size: 15px;
        font-weight: 800;
        color: #f3f6fd;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .workspace-account-logout {
        flex-shrink: 0;
        border: 0;
        border-radius: 999px;
        background: rgba(132, 82, 102, 0.72);
        color: #ffffff;
        min-height: 38px;
        padding: 0 18px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.16s ease, transform 0.16s ease, opacity 0.16s ease;
      }
      .workspace-account-logout:hover {
        background: rgba(150, 90, 114, 0.84);
      }
      .workspace-account-logout:active {
        transform: scale(0.97);
      }
      .workspace-account-logout:disabled {
        opacity: 0.66;
        cursor: default;
      }
      .chat-subtitle {
        margin: 0;
        color: #9da5b4;
        display: block;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chat-subtitle .typing-preview {
        color: inherit;
        max-width: 100%;
        vertical-align: top;
      }
      .dialog-list {
        display: grid;
        gap: 8px;
        margin-top: 14px;
        overflow-y: auto;
        padding-right: 4px;
        min-height: 0;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .dialog-list::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }
      .dialog-list.search-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 10px 26px;
      }
      .search-loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 180px;
        opacity: 0;
        animation: searchEmptyIn 0.12s ease forwards;
      }
      .search-spinner {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 3px solid rgba(238, 242, 251, 0.16);
        border-top-color: rgba(238, 242, 251, 0.86);
        animation: searchSpin 0.78s linear infinite;
      }
      .dialog-list.search-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 10px 26px;
      }
      .dialog-section {
        display: grid;
        gap: 8px;
      }
      .dialog-section-label {
        margin: 6px 4px 2px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #7f8897;
      }
      .search-empty-state {
        width: 100%;
        max-width: 250px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        text-align: center;
        opacity: 0;
        transform: translateY(6px);
        animation: searchEmptyIn 0.14s ease forwards;
      }
      .search-empty-state video {
        width: 100%;
        max-width: 170px;
        border-radius: 24px;
        display: block;
        background: transparent;
        mix-blend-mode: screen;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
      }
      .search-empty-title {
        margin: 0;
        font-size: 22px;
        line-height: 1.1;
        font-weight: 800;
        color: #eef2fb;
        letter-spacing: 0.01em;
      }
      .search-empty-copy {
        margin: 0;
        font-size: 14px;
        line-height: 1.45;
        color: #93a0b7;
      }
      @keyframes searchEmptyIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes searchSpin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .sidebar-search {
        margin: 14px 0 20px;
      }
      .sidebar-search input {
        width: 100%;
        height: 44px;
        border: 1px solid rgba(255,255,255,0.06);
        outline: none;
        border-radius: 999px;
        background: #1c2129;
        color: #e7ebf5;
        padding: 0 18px;
        font-size: 16px;
      }
      .sidebar-search input::placeholder {
        color: #7f8897;
      }
      .dialog-item {
        width: 100%;
        text-align: left;
        border: 1px solid transparent;
        background: transparent;
        color: #eef2fb;
        border-radius: 18px;
        padding: 12px 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 14px;
        position: relative;
        overflow: hidden;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        transform: translateZ(0);
        transition: background 0.18s var(--motion-standard), border-color 0.18s var(--motion-standard), box-shadow 0.18s var(--motion-standard), transform 0.18s var(--motion-standard);
      }
      .dialog-item:focus,
      .dialog-item:focus-visible {
        outline: none;
        box-shadow: none;
      }
      .dialog-item.saved-item {
        border-radius: 18px;
      }
      .dialog-item:hover {
        background: linear-gradient(180deg, rgba(121, 144, 182, 0.26), rgba(94, 116, 152, 0.3));
        border-color: rgba(184, 204, 233, 0.2);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
        transform: translateX(1px) scale(1.005);
      }
      .dialog-item.active {
        background: linear-gradient(180deg, rgba(77, 150, 235, 0.92), rgba(53, 122, 214, 0.94));
        border-color: rgba(158, 213, 255, 0.24);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
        transform: translateX(2px) scale(1.01);
      }
      .ripple-host {
        position: relative;
        overflow: hidden;
      }
      .ripple-host::after {
        content: "";
        position: absolute;
        left: var(--ripple-x, 50%);
        top: var(--ripple-y, 50%);
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0.34) 30%, rgba(255,255,255,0.14) 54%, rgba(255,255,255,0) 78%);
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
        pointer-events: none;
      }
      .ripple-host.ripple::after {
        animation: uiRippleExpand 0.66s cubic-bezier(0.16, 0.68, 0.2, 1) forwards;
      }
      .dialog-item.ripple-host::after {
        width: 14px;
        height: 14px;
        background: radial-gradient(circle, rgba(255,255,255,0.74) 0%, rgba(186,223,255,0.56) 28%, rgba(118,181,255,0.28) 54%, rgba(118,181,255,0) 80%);
      }
      .dialog-item.ripple-host.ripple::after {
        animation: uiRippleExpandDialog 0.74s cubic-bezier(0.16, 0.68, 0.2, 1) forwards;
      }
      @keyframes uiRippleExpand {
        0% {
          opacity: 0.62;
          transform: translate(-50%, -50%) scale(0);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(24);
        }
      }
      @keyframes uiRippleExpandDialog {
        0% {
          opacity: 0.8;
          transform: translate(-50%, -50%) scale(0);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(28);
        }
      }
      .dialog-item:hover .dialog-line,
      .dialog-item:hover .dialog-meta,
      .dialog-item:hover .dialog-preview {
        color: #dce6f4;
      }
      .dialog-item.active .dialog-line,
      .dialog-item.active .dialog-meta,
      .dialog-item.active .dialog-preview {
        color: #f6fbff;
      }
      .dialog-avatar {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: linear-gradient(180deg, #6cb5ff 0%, #4a8fe9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
        overflow: visible;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
      }
      .dialog-avatar.user-avatar {
        background: linear-gradient(180deg, var(--avatar-start, #6cb5ff) 0%, var(--avatar-end, #4a8fe9) 100%);
      }
      .dialog-avatar-presence {
        position: absolute;
        left: -2px;
        bottom: -2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: rgba(124, 136, 151, 0.52);
        border: 2px solid rgba(29, 33, 41, 0.98);
        opacity: 0;
        transform: scale(0.45);
        box-shadow: 0 0 0 0 rgba(102, 184, 255, 0);
        transition: opacity 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
        pointer-events: none;
      }
      .dialog-avatar-presence.online {
        opacity: 1;
        transform: scale(1);
        background: #66b8ff;
        box-shadow: 0 0 0 4px rgba(102, 184, 255, 0.16);
      }
      .dialog-avatar svg {
        width: 22px;
        height: 22px;
        stroke: #ffffff;
        stroke-width: 2.2;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .dialog-avatar-text {
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        line-height: 1;
      }
      .dialog-avatar.user-avatar .dialog-avatar-text {
        display: none;
      }
      .generated-avatar-photo {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: inherit;
        object-fit: cover;
        pointer-events: none;
        user-select: none;
      }
      .dialog-body {
        min-width: 0;
        flex: 1;
      }
      .dialog-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: #dde5f2;
      }
      .dialog-line strong {
        font-size: 18px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dialog-line.only-title {
        justify-content: flex-start;
      }
      .dialog-title-wrap {
        display: inline-flex;
        align-items: center;
        min-width: 0;
      }
      .dialog-meta {
        color: #8d96a7;
        font-size: 13px;
        flex-shrink: 0;
        transition: color 0.24s ease;
      }
      .dialog-preview-row {
        margin-top: 6px;
        display: flex;
        align-items: center;
        min-width: 0;
      }
      .dialog-preview-copy {
        min-width: 0;
        flex: 1;
      }
      .typing-preview {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        max-width: 100%;
        color: #9fd1ff;
        font-weight: 500;
      }
      .typing-preview-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .typing-preview-dots {
        display: inline-flex;
        align-items: flex-end;
        gap: 3px;
        flex-shrink: 0;
        height: 12px;
        padding-top: 1px;
      }
      .typing-preview-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.34;
        animation: dialogTypingBounce 1s infinite ease-in-out;
      }
      .typing-preview-dot:nth-child(2) {
        animation-delay: 0.15s;
      }
      .typing-preview-dot:nth-child(3) {
        animation-delay: 0.3s;
      }
      .dialog-item:hover .typing-preview {
        color: #dce6f4;
      }
      .dialog-item.active .typing-preview {
        color: #f6fbff;
      }
      @keyframes dialogTypingBounce {
        0%, 80%, 100% {
          transform: translateY(0);
          opacity: 0.34;
        }
        40% {
          transform: translateY(-3px);
          opacity: 1;
        }
      }
      .dialog-preview {
        margin: 4px 0 0;
        color: #cfd7e4;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.24s ease;
      }
      .chat-window {
        --chat-day-indicator-top: 88px;
        --chat-profile-panel-width: min(560px, 46%);
        width: 100%;
        height: 100%;
        min-height: 0;
        border-radius: 0;
        border: 0;
        background: rgba(10, 14, 20, 0.18);
        backdrop-filter: blur(1.5px);
        box-shadow: none;
        padding: 0;
        padding-right: 0;
        position: relative;
        overflow: hidden;
        transition: opacity 0.14s ease, background 0.14s ease, padding-right 0.34s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      .chat-window.profile-panel-open {
        padding-right: var(--chat-profile-panel-width);
      }
      .chat-window.dialog-switching .chat-stage {
        opacity: 0.92;
      }
      .chat-window.dialog-switching .chat-island,
      .chat-window.dialog-switching .composer {
        opacity: 0.94;
      }
      .chat-window.dialog-switching .chat-loading-overlay {
        opacity: 0.54;
        transform: translate(-50%, -50%);
      }
      .chat-window.motion-enter {
        animation: chatSurfaceEnter 0.14s var(--motion-standard) both;
      }
      @keyframes chatSurfaceEnter {
        from {
          opacity: 0.82;
        }
        to {
          opacity: 1;
        }
      }
      .chat-island {
        position: absolute;
        top: 12px;
        left: 50%;
        right: auto;
        transform: translateX(-50%) translateY(0);
        z-index: 10;
        min-width: 240px;
        max-width: 540px;
        width: fit-content;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 18px 12px 24px;
        border-radius: 999px;
        background: rgba(18, 22, 30, 0.95);
        border: 1px solid rgba(255,255,255,0.07);
        box-shadow: none;
        transition:
          opacity 0.24s ease,
          transform 0.24s ease,
          right 0.34s cubic-bezier(0.22, 0.61, 0.36, 1),
          width 0.34s cubic-bezier(0.22, 0.61, 0.36, 1),
          left 0.34s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      .chat-window.profile-panel-open .chat-island {
        right: var(--chat-profile-panel-width);
      }
      .page.ui-telegram-topbar .chat-window.profile-panel-open .chat-island {
        left: 0;
        right: auto;
        width: calc(100% - var(--chat-profile-panel-width));
        min-width: 0;
        max-width: none;
        transform: none;
      }
      .chat-window.search-open .chat-island {
        transform: translateX(-50%) translateY(0);
      }
      .chat-island-copy {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 1;
        cursor: pointer;
        border-radius: 18px;
        transition: opacity 0.16s ease, transform 0.16s ease;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }
      .chat-island-copy:focus,
      .chat-island-copy:focus-visible {
        outline: none;
        box-shadow: none;
      }
      .chat-header-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: visible;
        color: #ffffff;
      }
      .chat-header-avatar .dialog-avatar {
        width: 100%;
        height: 100%;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
      }
      .chat-header-avatar .dialog-avatar svg {
        width: 18px;
        height: 18px;
      }
      .chat-header-avatar .dialog-avatar-presence {
        width: 11px;
        height: 11px;
        left: -1px;
        bottom: -1px;
        border-width: 2px;
      }
      .chat-island-text {
        min-width: 0;
        flex: 1;
        text-align: center;
      }
      .chat-island-copy:hover {
        opacity: 0.92;
      }
      .chat-island-copy:active {
        transform: scale(0.985);
      }
      .chat-island strong {
        display: block;
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chat-island span {
        display: block;
        margin-top: 4px;
        font-size: 13px;
        color: #97a0ae;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chat-island-actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .page.ui-telegram-topbar .chat-island {
        top: 0;
        left: 0;
        right: 0;
        transform: none;
        width: 100%;
        max-width: none;
        min-width: 0;
        gap: 18px;
        min-height: 72px;
        padding: 12px 22px;
        border-radius: 0;
        border: 0;
        border-bottom: 0;
        background: rgba(34, 37, 43, 0.97);
        transition: right 0.34s cubic-bezier(0.22, 0.61, 0.36, 1), padding 0.34s cubic-bezier(0.22, 0.61, 0.36, 1), min-height 0.34s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      .page.ui-telegram-topbar .chat-window.search-open .chat-island {
        transform: none;
      }
      .page.ui-telegram-topbar .chat-island-copy {
        text-align: left;
      }
      .page.ui-telegram-topbar .chat-header-avatar {
        display: inline-flex;
      }
      .page.ui-telegram-topbar .chat-island-text {
        text-align: left;
      }
      .page.ui-telegram-topbar .chat-island strong {
        font-size: 17px;
        line-height: 1.05;
      }
      .page.ui-telegram-topbar .chat-island span {
        margin-top: 5px;
        font-size: 13px;
      }
      .page.ui-telegram-topbar .chat-island-actions {
        margin-left: auto;
      }
      .page.ui-telegram-topbar .chat-search-panel {
        top: 80px;
      }
      .page.ui-telegram-topbar .chat-call-chip {
        top: 84px;
      }
      .page.ui-telegram-topbar .chat-stage {
        padding-top: 76px;
      }
      .page.ui-telegram-topbar .workspace-main.empty-chat .chat-island {
        transform: translateY(-14px);
      }
      .chat-island-action {
        width: 48px;
        height: 48px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: #c8d4e8;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s ease, color 0.16s ease, opacity 0.16s ease, transform 0.16s ease;
      }
      .chat-island-action .material-symbols-rounded,
      .chat-search-close .material-symbols-rounded,
      .chat-profile-panel-close .material-symbols-rounded,
      .chat-scroll-bottom .material-symbols-rounded,
      .attach-menu-item .material-symbols-rounded {
        color: currentColor;
      }
      .chat-island-action .material-symbols-rounded {
        font-size: 28px;
        font-variation-settings: "FILL" 0, "wght" 560, "GRAD" 0, "opsz" 28;
      }
      .chat-island-action[hidden] {
        display: none;
      }
      .chat-island-action:hover {
        background: rgba(255,255,255,0.06);
        color: #f2f5fd;
      }
      .chat-island-action:active {
        transform: scale(0.94);
      }
      .chat-island-action svg {
        width: 28px;
        height: 28px;
        stroke: currentColor;
        fill: none;
        stroke-width: 1.85;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .chat-search-backdrop {
        position: absolute;
        inset: 0;
        z-index: 15;
        background: rgba(8, 10, 16, 0.38);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.26s ease;
      }
      .chat-window.search-open .chat-search-backdrop {
        opacity: 1;
        pointer-events: auto;
      }
      .chat-search-panel {
        position: absolute;
        top: 72px;
        left: 50%;
        transform: translateX(-50%) translateY(-14px) scale(0.96);
        z-index: 16;
        width: min(660px, calc(100% - 48px));
        display: flex;
        flex-direction: column;
        background: rgba(20, 23, 32, 0.88);
        backdrop-filter: blur(28px) saturate(1.6);
        -webkit-backdrop-filter: blur(28px) saturate(1.6);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 22px;
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.52),
          0 2px 8px rgba(0, 0, 0, 0.28),
          inset 0 1px 0 rgba(255, 255, 255, 0.07);
        opacity: 0;
        pointer-events: none;
        transition:
          opacity 0.28s cubic-bezier(0.34, 1.36, 0.64, 1),
          transform 0.28s cubic-bezier(0.34, 1.36, 0.64, 1);
        overflow: hidden;
      }
      .chat-search-panel.open {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
        pointer-events: auto;
      }
      .chat-profile-panel {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: auto;
        width: var(--chat-profile-panel-width);
        max-width: 100%;
        z-index: 18;
        border-radius: 0;
        border: 0;
        background: linear-gradient(180deg, rgba(34, 38, 46, 0.995) 0%, rgba(28, 31, 39, 0.998) 100%);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        box-shadow: none;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        transform: translateX(100%);
        pointer-events: none;
        transition: opacity 0.38s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.38s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      .chat-profile-panel.open {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }
      .chat-profile-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 24px 26px 18px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .chat-profile-panel-title {
        font-size: 28px;
        font-weight: 800;
        color: #f4f7ff;
      }
      .chat-profile-panel-close {
        width: 38px;
        height: 38px;
        border: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.05);
        color: #dce6f8;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s ease, transform 0.16s ease;
      }
      .chat-profile-panel-close:hover {
        background: rgba(255,255,255,0.1);
      }
      .chat-profile-panel-close:active {
        transform: scale(0.94);
      }
      .chat-profile-panel-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 34px 28px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .chat-profile-summary {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: min(100%, 620px);
      }
      .chat-profile-avatar {
        width: 128px;
        height: 128px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 22px 50px rgba(44, 61, 98, 0.28);
        overflow: visible;
      }
      .chat-profile-avatar .dialog-avatar { width: 100%; height: 100%; }
      .chat-profile-avatar .dialog-avatar svg { width: 48px; height: 48px; }
      .chat-profile-avatar .dialog-avatar-presence { width: 20px; height: 20px; left: 6px; bottom: 6px; border-width: 3px; }
      .chat-profile-name {
        margin-top: 20px;
        font-size: 36px;
        font-weight: 800;
        color: #f7f9ff;
        line-height: 1.08;
      }
      .chat-profile-status { margin-top: 10px; font-size: 17px; color: #99a9c2; }
      .chat-profile-meta-grid { width: min(100%, 620px); margin-top: 28px; display: grid; gap: 14px; }
      .chat-profile-card {
        padding: 18px 18px 20px;
        border-radius: 24px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
      }
      .chat-profile-card-label {
        display: block;
        margin-bottom: 6px;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8c98ad;
      }
      .chat-profile-card-value { font-size: 15px; line-height: 1.45; color: #edf2fb; word-break: break-word; }
      .chat-profile-link { color: #7db9ff; text-decoration: underline; text-underline-offset: 2px; }
      .chat-profile-link:hover { color: #b8dbff; }
      .chat-search-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px 12px 14px;
        background: transparent;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        flex-shrink: 0;
      }
      .chat-search-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(145deg, var(--avatar-start, #8b6ee8) 0%, var(--avatar-end, #5b41c8) 100%);
        box-shadow: 0 4px 14px rgba(100, 70, 220, 0.38);
        overflow: hidden;
      }
      .chat-search-avatar .dialog-avatar {
        width: 100%;
        height: 100%;
      }
      .chat-search-avatar .dialog-avatar svg {
        width: 18px;
        height: 18px;
      }
      .chat-search-field {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
        background: rgba(255,255,255,0.04);
        border: 1.5px solid rgba(255,255,255,0.07);
        border-radius: 12px;
        padding: 9px 13px;
        transition: border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
      }
      .chat-search-field:focus-within {
        border-color: rgba(141, 115, 240, 0.55);
        background: rgba(141, 115, 240, 0.07);
        box-shadow: 0 0 0 3px rgba(141, 115, 240, 0.12);
      }
      .chat-search-field svg {
        width: 16px;
        height: 16px;
        stroke: #6b5fa0;
        fill: none;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
        flex-shrink: 0;
        transition: stroke 0.22s ease;
      }
      .chat-search-field:focus-within svg {
        stroke: #b09ef8;
      }
      .chat-search-input {
        width: 100%;
        border: 0;
        outline: none;
        background: transparent;
        color: #eef2fb;
        font-size: 15px;
        font-family: inherit;
        letter-spacing: 0.01em;
      }
      .chat-search-input::placeholder {
        color: #4d5870;
      }
      .chat-search-close {
        width: 32px;
        height: 32px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.05);
        color: #8090a8;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
      }
      .chat-search-close:hover {
        color: #eef2fb;
        background: rgba(255,255,255,0.1);
      }
      .chat-search-close:active {
        transform: scale(0.9);
      }
      .chat-search-close .material-symbols-rounded {
        font-size: 20px;
      }
      .chat-search-close svg {
        width: 16px;
        height: 16px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .chat-search-results {
        max-height: min(480px, 60vh);
        overflow-y: auto;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.1) transparent;
      }
      .chat-search-results::-webkit-scrollbar {
        width: 4px;
      }
      .chat-search-results::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.08);
        border-radius: 4px;
      }
      .chat-search-result,
      .chat-search-empty {
        border-radius: 16px;
      }
      .chat-search-result {
        padding: 12px 14px;
        display: grid;
        grid-template-columns: 38px minmax(0, 1fr);
        gap: 12px;
        cursor: pointer;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s cubic-bezier(0.22, 0.61, 0.36, 1);
        animation: searchResultAppear 0.28s cubic-bezier(0.22, 0.61, 0.36, 1) both;
      }
      @keyframes searchResultAppear {
        from {
          opacity: 0;
          transform: translateX(18px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .chat-search-result:nth-child(1) { animation-delay: 0.03s; }
      .chat-search-result:nth-child(2) { animation-delay: 0.07s; }
      .chat-search-result:nth-child(3) { animation-delay: 0.11s; }
      .chat-search-result:nth-child(4) { animation-delay: 0.15s; }
      .chat-search-result:nth-child(5) { animation-delay: 0.18s; }
      .chat-search-result:hover {
        background: rgba(141, 115, 240, 0.08);
        border-color: rgba(141, 115, 240, 0.18);
      }
      .chat-search-result:active {
        transform: scale(0.98);
      }
      .chat-search-result-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(145deg, var(--avatar-start, #8b6ee8) 0%, var(--avatar-end, #5b41c8) 100%);
        flex-shrink: 0;
      }
      .chat-search-result-avatar .dialog-avatar {
        width: 100%;
        height: 100%;
      }
      .chat-search-result-avatar .dialog-avatar svg {
        width: 18px;
        height: 18px;
      }
      .chat-search-result-copy {
        min-width: 0;
      }
      .chat-search-result-line {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }
      .chat-search-result-name {
        font-size: 14px;
        font-weight: 700;
        color: #e8edf8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chat-search-result-time {
        font-size: 11px;
        color: #6070880;
        color: #607088;
        flex-shrink: 0;
      }
      .chat-search-result-text {
        margin-top: 3px;
        font-size: 13px;
        color: #8090a8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chat-search-empty {
        padding: 32px 20px;
        color: #5c687a;
        font-size: 14px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .message-search-hit {
        animation: messageSearchHit 1.35s cubic-bezier(0.18, 0.82, 0.28, 1) both;
      }
      @keyframes messageSearchHit {
        0% {
          box-shadow: 0 12px 26px rgba(104, 82, 203, 0.22), inset 0 0 0 999px rgba(60, 169, 255, 0);
        }
        12% {
          box-shadow: 0 16px 34px rgba(44, 156, 255, 0.24), inset 0 0 0 999px rgba(60, 169, 255, 0.62);
        }
        100% {
          box-shadow: 0 12px 26px rgba(104, 82, 203, 0.22), inset 0 0 0 999px rgba(60, 169, 255, 0);
        }
      }
      .message.incoming.message-search-hit {
        animation: messageSearchHitIncoming 1.35s cubic-bezier(0.18, 0.82, 0.28, 1) both;
      }
      @keyframes messageSearchHitIncoming {
        0% {
          box-shadow: inset 0 0 0 999px rgba(60, 169, 255, 0);
        }
        12% {
          box-shadow: 0 14px 30px rgba(44, 156, 255, 0.16), inset 0 0 0 999px rgba(60, 169, 255, 0.58);
        }
        100% {
          box-shadow: inset 0 0 0 999px rgba(60, 169, 255, 0);
        }
      }
      .chat-call-chip {
        position: absolute;
        top: 12px;
        left: 24px;
        z-index: 15;
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 46px;
        padding: 10px 14px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(18, 22, 30, 0.96);
        box-shadow: 0 18px 38px rgba(0,0,0,0.22);
        opacity: 0;
        transform: translateY(-8px);
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
      }
      .chat-call-chip.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      .chat-call-chip-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #68d86f;
        box-shadow: 0 0 0 6px rgba(104, 216, 111, 0.12);
        flex-shrink: 0;
      }
      .chat-call-chip-copy {
        min-width: 0;
      }
      .chat-call-chip-title {
        display: block;
        font-size: 14px;
        font-weight: 700;
        color: #f3f6fd;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chat-call-chip-time {
        display: block;
        margin-top: 3px;
        font-size: 12px;
        color: #9cadc7;
      }
      .chat-audio-top-player {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 16;
        height: 56px;
        opacity: 0;
        transform: translateY(-56px);
        pointer-events: none;
        border-top: 1px solid rgba(151, 108, 245, 0.28);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: rgba(24, 27, 34, 0.98);
        transition: opacity 0.24s ease, transform 0.24s ease;
        overflow: hidden;
      }
      .chat-audio-top-player.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      .chat-audio-top-inner {
        height: 100%;
        display: grid;
        grid-template-columns: auto auto auto minmax(0, 1fr) auto auto auto auto;
        align-items: center;
        gap: 10px;
        padding: 8px 14px 8px 16px;
      }
      .chat-audio-top-btn {
        width: 28px;
        height: 28px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: #9f88ff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
      }
      .chat-audio-top-btn:hover {
        background: rgba(255,255,255,0.08);
      }
      .chat-audio-top-btn .material-symbols-rounded {
        font-size: 20px;
        font-variation-settings: "FILL" 1, "wght" 530, "GRAD" 0, "opsz" 24;
      }
      .chat-audio-top-copy {
        min-width: 0;
      }
      .chat-audio-top-title {
        font-size: 14px;
        line-height: 1.15;
        font-weight: 700;
        color: #f3f5fd;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chat-audio-top-meta {
        font-size: 12px;
        line-height: 1.15;
        color: #a9b0bd;
        white-space: nowrap;
      }
      .chat-audio-top-progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 8px;
        cursor: pointer;
        background: transparent;
        touch-action: none;
      }
      .chat-audio-top-progress-fill {
        display: block;
        width: var(--audio-top-progress, 0%);
        height: 2px;
        margin-top: 6px;
        background: #8e6af6;
        transition: width 0.14s linear, height 0.16s ease, margin-top 0.16s ease;
      }
      .chat-audio-top-progress:hover .chat-audio-top-progress-fill {
        height: 3px;
        margin-top: 4px;
      }
      .chat-audio-top-progress:active .chat-audio-top-progress-fill {
        height: 4px;
        margin-top: 2px;
      }
      .chat-audio-top-speed,
      .chat-audio-top-repeat {
        border: 0;
        background: transparent;
        color: #c3cad8;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        padding: 0 6px;
        height: 28px;
      }
      .chat-audio-top-speed:hover,
      .chat-audio-top-repeat:hover {
        color: #f0f3fc;
      }
      .chat-audio-top-repeat.is-active {
        color: #9f88ff;
      }
      .chat-audio-top-volume-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .chat-audio-top-volume-popover {
        position: absolute;
        top: calc(100% + 8px);
        right: -4px;
        width: 34px;
        height: 124px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(20, 23, 30, 0.98);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateY(-4px) scale(0.96);
        pointer-events: none;
        transition: opacity 0.16s ease, transform 0.16s ease;
      }
      .chat-audio-top-volume-wrap:hover .chat-audio-top-volume-popover,
      .chat-audio-top-volume-wrap:focus-within .chat-audio-top-volume-popover,
      .chat-audio-top-volume-popover.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .chat-audio-top-volume-range {
        width: 100px;
        height: 22px;
        transform: rotate(-90deg);
        transform-origin: center;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
      }
      .chat-audio-top-volume-range::-webkit-slider-runnable-track {
        height: 4px;
        border-radius: 999px;
        background: rgba(255,255,255,0.22);
      }
      .chat-audio-top-volume-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        margin-top: -4px;
        border: 0;
        border-radius: 50%;
        background: #8e6af6;
      }
      .chat-audio-top-volume-range::-moz-range-track {
        height: 4px;
        border-radius: 999px;
        background: rgba(255,255,255,0.22);
        border: 0;
      }
      .chat-audio-top-volume-range::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border: 0;
        border-radius: 50%;
        background: #8e6af6;
      }
      .page.ui-telegram-topbar .chat-audio-top-player {
        top: 0;
      }
      .page.ui-telegram-topbar .chat-window.audio-top-player-visible .chat-island {
        transform: translateY(56px);
      }
      .page.ui-telegram-topbar .chat-window.audio-top-player-visible .chat-stage {
        padding-top: 132px;
      }
      .page.ui-telegram-topbar .chat-window.audio-top-player-visible .chat-search-panel {
        top: 136px;
      }
      .page.ui-telegram-topbar .chat-window.audio-top-player-visible .chat-call-chip {
        top: 140px;
      }
      .page.ui-telegram-topbar .chat-window.audio-top-player-visible {
        --chat-day-indicator-top: 144px;
      }
      .call-overlay {
        position: absolute;
        inset: 0;
        z-index: 22;
        pointer-events: none;
      }
      .call-modal {
        position: absolute;
        left: 50%;
        top: 50%;
        width: min(560px, calc(100% - 72px));
        min-height: 560px;
        padding: 18px 18px 22px;
        border-radius: 34px;
        border: 1px solid rgba(255,255,255,0.08);
        background:
          radial-gradient(circle at 24% 18%, rgba(115, 103, 255, 0.42) 0%, transparent 34%),
          radial-gradient(circle at 78% 26%, rgba(50, 196, 255, 0.34) 0%, transparent 36%),
          radial-gradient(circle at 50% 85%, rgba(69, 227, 154, 0.28) 0%, transparent 38%),
          linear-gradient(180deg, rgba(19, 23, 31, 0.98) 0%, rgba(14, 17, 24, 0.98) 100%);
        box-shadow: 0 28px 70px rgba(0,0,0,0.34);
        transform: translate(-50%, -50%) scale(0.96);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.22s ease, transform 0.22s ease;
        overflow: hidden;
        --call-voice-level: 0;
        background-size: 160% 160%;
        animation: callGradientFlow 10s ease-in-out infinite;
      }
      @keyframes callGradientFlow {
        0% { background-position: 0% 30%; }
        50% { background-position: 100% 70%; }
        100% { background-position: 0% 30%; }
      }
      .call-modal::before,
      .call-mini-card::before {
        content: "";
        position: absolute;
        inset: -18%;
        background:
          radial-gradient(circle at 20% 25%, rgba(111, 96, 255, 0.22), transparent 28%),
          radial-gradient(circle at 78% 32%, rgba(48, 198, 255, 0.18), transparent 24%),
          radial-gradient(circle at 52% 82%, rgba(68, 229, 154, 0.14), transparent 28%);
        filter: blur(22px);
        opacity: 0.72;
        pointer-events: none;
      }
      .call-modal.ringing::before,
      .call-mini-card.ringing::before {
        animation: callAuraFlow 4.8s linear infinite;
      }
      @keyframes callAuraFlow {
        0% { transform: translate3d(-2%, -1%, 0) scale(1); }
        50% { transform: translate3d(2%, 2%, 0) scale(1.04); }
        100% { transform: translate3d(-2%, -1%, 0) scale(1); }
      }
      .call-modal.open {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
        pointer-events: auto;
      }
      .call-modal.minimized {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.94);
        pointer-events: none;
      }
      .call-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .call-modal-top-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .call-icon-button {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 0;
        background: rgba(255,255,255,0.14);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .call-icon-button:hover {
        background: rgba(255,255,255,0.22);
      }
      .call-icon-button svg {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .call-icon-button .material-symbols-rounded,
      .call-action-button .material-symbols-rounded {
        font-size: 22px;
        line-height: 1;
        font-variation-settings: "FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24;
      }
      .call-modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 430px;
        padding: 10px 24px 0;
      }
      .call-fingerprint {
        width: min(420px, 96%);
        margin: 4px auto 14px;
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(4, 14, 36, 0.48);
      }
      .call-fingerprint-emojis {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 28px;
      }
      .call-fingerprint-emoji {
        width: 25px;
        height: 25px;
        object-fit: contain;
        display: inline-block;
      }
      .call-fingerprint-copy {
        margin-top: 6px;
        text-align: center;
        font-size: 12px;
        line-height: 1.35;
        color: rgba(235,243,255,0.86);
      }
      .call-peer-avatar {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(180deg, var(--avatar-start, #6cb5ff) 0%, var(--avatar-end, #4a8fe9) 100%);
        box-shadow: 0 18px 36px rgba(0,0,0,0.18);
        position: relative;
        z-index: 2;
      }
      .call-peer-avatar-shell {
        position: relative;
        width: 132px;
        height: 132px;
        display: grid;
        place-items: center;
      }
      .call-voice-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.26);
        opacity: 0.35;
        transform-origin: center;
        transition: transform 0.14s linear, opacity 0.14s linear;
        pointer-events: none;
      }
      .call-voice-ring.r1 {
        transform: scale(calc(1 + (var(--call-voice-level, 0) * 0.24)));
        opacity: calc(0.2 + (var(--call-voice-level, 0) * 0.55));
      }
      .call-voice-ring.r2 {
        transform: scale(calc(1.1 + (var(--call-voice-level, 0) * 0.36)));
        opacity: calc(0.14 + (var(--call-voice-level, 0) * 0.44));
      }
      .call-voice-ring.r3 {
        transform: scale(calc(1.22 + (var(--call-voice-level, 0) * 0.5)));
        opacity: calc(0.08 + (var(--call-voice-level, 0) * 0.34));
      }
      .call-peer-name {
        margin-top: 18px;
        font-size: 44px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.03em;
      }
      .call-peer-status {
        margin-top: 10px;
        font-size: 28px;
        color: rgba(255,255,255,0.94);
        transition: transform 0.24s ease, opacity 0.24s ease;
        will-change: transform, opacity;
      }
      .call-peer-substatus {
        margin-top: 12px;
        font-size: 18px;
        color: rgba(255,255,255,0.85);
        max-width: 92%;
        line-height: 1.35;
        word-break: break-word;
        transition: transform 0.24s ease, opacity 0.24s ease;
        will-change: transform, opacity;
      }
      .call-actions {
        margin-top: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        flex-wrap: wrap;
      }
      .call-actions[data-call-layout="outgoing"] {
        gap: 20px;
      }
      .call-action {
        width: 76px;
        display: grid;
        gap: 8px;
        justify-items: center;
      }
      .call-action[hidden] {
        display: none;
      }
      .call-action-button {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        border: 0;
        background: rgba(255,255,255,0.16);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.16s ease, background 0.16s ease, opacity 0.16s ease;
      }
      .call-action-button.muted {
        background: rgba(255, 115, 115, 0.28);
        animation: micMutedPulse 1.2s ease-in-out infinite;
      }
      @keyframes micMutedPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.07); }
      }
      .call-action-button:hover {
        background: rgba(255,255,255,0.22);
      }
      .call-action-button:active {
        transform: scale(0.95);
      }
      .call-action-button.end {
        background: #ff5f68;
      }
      .call-action-button.accept {
        background: #4dcc5f;
      }
      .call-action-button.muted {
        background: rgba(22, 29, 38, 0.32);
      }
      .call-action-button.muted .material-symbols-rounded {
        font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
      }
      .call-action-button svg {
        width: 22px;
        height: 22px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .call-action-label {
        font-size: 13px;
        color: rgba(255,255,255,0.92);
      }
      .call-devices-panel {
        position: absolute;
        left: 50%;
        bottom: 122px;
        width: min(420px, calc(100% - 44px));
        padding: 14px 14px 12px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.12);
        background:
          linear-gradient(180deg, rgba(18, 26, 42, 0.96) 0%, rgba(13, 19, 33, 0.96) 100%);
        box-shadow: 0 22px 48px rgba(0,0,0,0.32);
        transform: translateX(-50%) translateY(12px) scale(0.97);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
        z-index: 25;
      }
      .call-devices-panel.open {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
        pointer-events: auto;
      }
      .call-devices-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }
      .call-devices-title {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: #d7e2f5;
        text-transform: uppercase;
      }
      .call-device-field + .call-device-field {
        margin-top: 10px;
      }
      .call-device-label {
        display: block;
        margin-bottom: 7px;
        font-size: 13px;
        color: #b3c1d8;
      }
      .call-device-select {
        width: 100%;
        min-height: 44px;
        border-radius: 12px;
        border: 1px solid rgba(167, 192, 233, 0.28);
        background:
          linear-gradient(180deg, rgba(35, 49, 74, 0.6) 0%, rgba(20, 30, 48, 0.7) 100%);
        color: #eef3ff;
        padding: 0 36px 0 12px;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        color-scheme: dark;
        font-size: 16px;
      }
      .call-device-select:focus {
        outline: none;
        border-color: rgba(113, 184, 255, 0.85);
        box-shadow: 0 0 0 2px rgba(67, 159, 255, 0.28);
      }
      .call-device-select option {
        background: #131f33;
        color: #ecf3ff;
      }
      .call-mini-card {
        position: absolute;
        right: 22px;
        bottom: 22px;
        z-index: 23;
        width: 260px;
        padding: 12px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(18, 22, 30, 0.98);
        box-shadow: 0 18px 36px rgba(0,0,0,0.22);
        opacity: 0;
        transform: translateY(10px) scale(0.96);
        pointer-events: none;
        --call-voice-level: 0;
        transition: opacity 0.18s ease, transform 0.18s ease;
      }
      .call-mini-card.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .call-mini-card.dragging {
        cursor: grabbing;
        transition: none;
        user-select: none;
      }
      .call-mini-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        cursor: grab;
        touch-action: none;
      }
      .call-mini-title {
        font-size: 12px;
        color: #9fb0c9;
      }
      .call-mini-name {
        margin-top: 2px;
        font-size: 22px;
        font-weight: 800;
        color: #f5f7ff;
      }
      .call-mini-subtitle {
        margin-top: 4px;
        font-size: 14px;
        color: #c8d3e6;
      }
      .call-mini-cover {
        margin-top: 12px;
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 14px;
        overflow: hidden;
        background:
          radial-gradient(circle at 24% 18%, rgba(115, 103, 255, 0.42) 0%, transparent 34%),
          radial-gradient(circle at 78% 26%, rgba(50, 196, 255, 0.34) 0%, transparent 36%),
          radial-gradient(circle at 50% 85%, rgba(69, 227, 154, 0.28) 0%, transparent 38%),
          linear-gradient(180deg, rgba(19, 23, 31, 0.98) 0%, rgba(14, 17, 24, 0.98) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .call-mini-cover .call-peer-avatar {
        width: 88px;
        height: 88px;
        font-size: 34px;
      }
      .call-mini-cover .call-peer-avatar-shell {
        width: 124px;
        height: 124px;
      }
      .call-mini-actions {
        margin-top: 12px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }
      .workspace-main.empty-chat .chat-window {
        height: 100%;
        min-height: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
        opacity: 1;
        transform: none;
      }
      .workspace-main.empty-chat .chat-island {
        opacity: 0;
        transform: translateX(-50%) translateY(-14px);
        pointer-events: none;
      }
      .workspace-main.empty-chat .chat-window.audio-top-player-visible {
        display: block;
        align-items: stretch;
        justify-content: flex-start;
        opacity: 1;
        transform: none;
        border-radius: 0;
        background: rgba(10, 14, 20, 0.18);
      }
      .workspace-main.empty-chat .chat-window.audio-top-player-visible .chat-island {
        opacity: 0;
        pointer-events: none;
      }
      .workspace-main.empty-chat .chat-window.audio-top-player-visible .chat-stage {
        align-items: stretch;
        justify-content: flex-start;
      }
      .workspace-main.empty-chat .chat-stage {
        display: flex;
        width: 100%;
        height: 100%;
        min-height: 0;
        align-items: center;
        justify-content: center;
        border: 0;
        background: transparent;
        padding: 0;
      }
      .workspace-main.empty-chat .composer {
        display: none;
      }
      .workspace-main.empty-chat .message-list {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .chat-head h2 {
        margin: 0 0 6px;
        font-size: 34px;
      }
      .chat-stage {
        position: relative;
        z-index: 1;
        border-radius: 0;
        border: 0;
        background: transparent;
        min-height: 0;
        height: 100%;
        padding: 78px 22px 18px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: background 0.28s ease, border-color 0.28s ease, transform 0.28s ease, opacity 0.28s ease;
      }
      .chat-scroll-bottom {
        position: absolute;
        right: 28px;
        bottom: 114px;
        z-index: 14;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(45, 49, 58, 0.96);
        color: #eef2fb;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 18px 34px rgba(0,0,0,0.22);
        cursor: pointer;
        opacity: 0;
        transform: translateY(14px) scale(0.9);
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease, background 0.18s ease;
      }
      .chat-scroll-bottom.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .chat-scroll-bottom:hover {
        background: rgba(57, 62, 74, 0.98);
      }
      .chat-scroll-bottom svg {
        width: 24px;
        height: 24px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .chat-stage::before,
      .chat-stage::after {
        display: none;
      }
      .chat-stage::before {
        left: 0;
        background: linear-gradient(90deg, rgba(52, 84, 142, 0.24) 0%, rgba(52, 84, 142, 0.14) 38%, rgba(52, 84, 142, 0) 100%);
      }
      .chat-stage::after {
        right: 0;
        background: linear-gradient(270deg, rgba(118, 98, 210, 0.24) 0%, rgba(118, 98, 210, 0.14) 38%, rgba(118, 98, 210, 0) 100%);
      }
      .chat-loading-overlay {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 8;
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: transparent;
        border: 0;
        box-shadow: none;
        opacity: 0;
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: opacity 0.1s ease;
      }
      .chat-loading-overlay::before {
        display: none;
      }
      @keyframes m3SpinnerGlow {
        to {
          transform: rotate(360deg);
        }
      }
      .chat-loading-overlay .search-spinner {
        width: 36px;
        height: 36px;
      }
      .chat-stage.empty {
        min-height: 0;
        padding: 0;
        border: 0;
        background: transparent;
      }
      .message-list {
        display: grid;
        gap: 14px;
        flex: 1;
        overflow-y: auto;
        align-content: start;
        padding-right: 8px;
        padding-bottom: 12px;
        scrollbar-width: thin;
        scrollbar-color: rgba(189, 197, 214, 0.65) transparent;
        background: transparent;
      }
      #workspace-view,
      #workspace-view * {
        user-select: none;
        -webkit-user-select: none;
      }
      #workspace-view input,
      #workspace-view textarea,
      #workspace-view [contenteditable="true"],
      #workspace-view [contenteditable="plaintext-only"] {
        user-select: text;
        -webkit-user-select: text;
      }
      #workspace-view .message-body,
      #workspace-view .message-body *,
      #workspace-view .message-reply-text,
      #workspace-view .message-reply-text * {
        user-select: text;
        -webkit-user-select: text;
      }
      .message-list.preparing-bottom {
        visibility: hidden;
      }
      .message-list::-webkit-scrollbar {
        width: 10px;
      }
      .message-list::-webkit-scrollbar-track {
        background: transparent;
      }
      .message-list::-webkit-scrollbar-thumb {
        background: rgba(189, 197, 214, 0.62);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      .message-list::-webkit-scrollbar-thumb:hover {
        background: rgba(214, 220, 232, 0.82);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      .message-list.saved-empty {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .message {
        max-width: 76%;
        padding: 12px 14px 10px;
        border-radius: 20px 20px 8px 20px;
        background: linear-gradient(180deg, #8878f1 0%, #7c6be7 100%);
        color: #ffffff;
        justify-self: end;
        box-shadow: 0 12px 26px rgba(104, 82, 203, 0.22);
        transform-origin: right bottom;
        max-height: 1400px;
        transition: transform 0.22s var(--motion-standard), opacity 0.22s var(--motion-standard), max-height 0.32s ease, margin 0.32s ease, padding 0.32s ease, filter 0.26s ease;
        scroll-margin-top: 116px;
        scroll-margin-bottom: 132px;
      }
      .message:hover {
        transform: translateY(-1px);
      }
      .message.message-media {
        width: fit-content;
        max-width: min(360px, calc(46vw + 28px));
        padding: 10px 10px 8px;
      }
      .message.incoming {
        justify-self: start;
        border-radius: 20px 20px 20px 8px;
        background: rgba(255,255,255,0.06);
        color: #eef2fb;
        box-shadow: none;
        transform-origin: left bottom;
      }
      .message.message-launch {
        animation: messageBubbleEnter 0.24s cubic-bezier(0.2, 0.85, 0.2, 1) both;
      }
      @keyframes messageBubbleEnter {
        0% {
          opacity: 0;
          transform: translateY(10px) scale(0.985);
        }
        65% {
          opacity: 1;
          transform: translateY(-1px) scale(1.003);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .message-body {
        font-size: 17px;
        line-height: 1.45;
        word-break: break-word;
        white-space: pre-wrap;
      }
      .message-call-card {
        min-width: 194px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 18px;
        background: rgba(16, 20, 27, 0.72);
      }
      .message.incoming .message-call-card {
        background: rgba(35, 39, 48, 0.94);
      }
      .message-call-card.missed,
      .message-call-card.declined {
        background: rgba(32, 22, 24, 0.88);
      }
      .message-call-icon {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.11);
        color: #f5f7ff;
        font-size: 19px;
        line-height: 1;
        flex-shrink: 0;
      }
      .message-call-card.missed .message-call-icon,
      .message-call-card.declined .message-call-icon {
        color: #ff9ca6;
      }
      .message-call-copy {
        min-width: 0;
        display: grid;
        gap: 2px;
      }
      .message-call-title {
        font-size: 15px;
        font-weight: 700;
        line-height: 1.15;
        color: #f7f9ff;
      }
      .message-call-subtitle {
        font-size: 13px;
        line-height: 1.15;
        color: rgba(255,255,255,0.76);
      }
      .message-audio-wrap {
        display: grid;
        gap: 8px;
      }
      .message-audio-card {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 10px;
        align-items: center;
        min-width: 250px;
        max-width: min(420px, 62vw);
        padding: 8px 10px;
        border-radius: 16px;
        background: rgba(255,255,255,0.14);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
      }
      .message.incoming .message-audio-card {
        background: rgba(255,255,255,0.08);
      }
      .message-audio-toggle {
        width: 44px;
        height: 44px;
        border: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.92);
        color: #7d6be8;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.16s ease, filter 0.16s ease;
      }
      .message-audio-toggle:hover {
        filter: brightness(1.04);
      }
      .message-audio-toggle:active {
        transform: scale(0.98);
      }
      .message-audio-toggle-icon {
        font-size: 30px;
        line-height: 1;
        transition: opacity 0.16s ease, transform 0.16s ease;
      }
      .message-audio-card.is-playing .message-audio-toggle-icon {
        transform: scale(1.05);
      }
      .message-audio-main {
        min-width: 0;
        display: grid;
        gap: 3px;
      }
      .message-audio-name {
        font-size: 15px;
        font-weight: 700;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #f8f9ff;
      }
      .message-audio-meta-line {
        font-size: 13px;
        line-height: 1.2;
        color: rgba(255,255,255,0.82);
      }
      .message.incoming .message-audio-meta-line {
        color: rgba(225,232,245,0.82);
      }
      .message-audio-progress {
        --audio-progress-pct: 0%;
        width: 100%;
        margin: 0;
        height: 16px;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        outline: none;
        cursor: pointer;
        opacity: 0;
        max-height: 0;
        overflow: hidden;
        transform: translateY(-3px);
        pointer-events: none;
        transition: opacity 0.2s ease, max-height 0.2s ease, margin 0.2s ease, transform 0.2s ease;
      }
      .message-audio-card.is-playing .message-audio-progress,
      .message-audio-card.is-seeking .message-audio-progress {
        margin-top: 1px;
        opacity: 1;
        max-height: 16px;
        transform: translateY(0);
        pointer-events: auto;
      }
      .message-audio-progress::-webkit-slider-runnable-track {
        height: 3px;
        border-radius: 999px;
        background:
          linear-gradient(to right, rgba(255,255,255,0.96), rgba(255,255,255,0.96)) 0 50% / var(--audio-progress-pct) 100% no-repeat,
          rgba(255,255,255,0.32);
      }
      .message-audio-progress::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        margin-top: -4px;
        border-radius: 50%;
        border: 0;
        background: #ffffff;
        box-shadow: 0 0 0 2px rgba(124, 107, 231, 0.28);
        transition: transform 0.14s ease;
      }
      .message-audio-card.is-seeking .message-audio-progress::-webkit-slider-thumb {
        transform: scale(1.08);
      }
      .message-audio-progress::-moz-range-track {
        height: 3px;
        border-radius: 999px;
        border: 0;
        background: rgba(255,255,255,0.32);
      }
      .message-audio-progress::-moz-range-progress {
        height: 3px;
        border-radius: 999px;
        border: 0;
        background: rgba(255,255,255,0.96);
      }
      .message-audio-progress::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 0;
        background: #ffffff;
        box-shadow: 0 0 0 2px rgba(124, 107, 231, 0.28);
        transition: transform 0.14s ease;
      }
      .message-audio-card.is-seeking .message-audio-progress::-moz-range-thumb {
        transform: scale(1.08);
      }
      .message-reply {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 10px;
        padding: 8px 10px;
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.16);
        border-left: 3px solid rgba(255, 196, 92, 0.95);
        cursor: pointer;
        transition: background 0.18s ease, transform 0.18s ease, opacity 0.18s ease;
      }
      .message.incoming .message-reply {
        background: rgba(255,255,255,0.05);
      }
      .message-reply:hover {
        background: rgba(255,255,255,0.12);
      }
      .message-reply-author {
        font-size: 13px;
        font-weight: 800;
        color: #ffcf7d;
        line-height: 1.2;
      }
      .message.incoming .message-reply-author {
        color: #8fd4ff;
      }
      .message-reply-text {
        font-size: 13px;
        line-height: 1.3;
        color: rgba(255,255,255,0.92);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .message.incoming .message-reply-text {
        color: #dbe3f2;
      }
      .message-jump-highlight {
        animation: messageJumpHighlight 3s ease both;
      }
      @keyframes messageJumpHighlight {
        0% {
          box-shadow: inset 0 0 0 0 rgba(255, 214, 120, 0);
          background-color: inherit;
        }
        12% {
          box-shadow: inset 0 0 0 2px rgba(255, 214, 120, 0.82);
          background-color: rgba(255, 214, 120, 0.18);
        }
        100% {
          box-shadow: inset 0 0 0 0 rgba(255, 214, 120, 0);
          background-color: inherit;
        }
      }
      .message.message-removing {
        opacity: 0;
        transform: scale(0.965) translateY(8px);
        filter: blur(0.9px);
        max-height: 0 !important;
        margin: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        overflow: hidden;
        pointer-events: none;
      }
      .inline-emoji {
        display: inline-block;
        width: 1.18em;
        height: 1.18em;
        margin: 0 0.04em;
        vertical-align: -0.22em;
        object-fit: contain;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
      }
      .composer-inline-emoji {
        width: 1.08em;
        height: 1.08em;
        margin: 0;
        vertical-align: -0.16em;
      }
      .composer-emoji-slot {
        display: inline-flex;
        width: auto;
        align-items: center;
        justify-content: flex-start;
        vertical-align: -0.16em;
        margin-right: 0.04em;
      }
      .message-visual {
        display: block;
        margin: -2px -2px 0;
      }
      .message.message-media .message-visual {
        display: grid;
        gap: 10px;
        margin: 0;
      }
      .message.message-media .message-audio-wrap {
        margin: 0;
      }
      .message-album {
        display: grid;
        gap: 2px;
        width: min(300px, 40vw);
        max-width: 100%;
        max-height: min(420px, 58vh);
        overflow: hidden;
        border-radius: 18px;
        background: rgba(255,255,255,0.03);
        transition: height 0.24s ease, max-height 0.24s ease, transform 0.18s ease;
      }
      .message-album.count-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .message-album.count-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        aspect-ratio: 1 / 1;
      }
      .message-album.count-3 {
        grid-template-columns: 1.2fr 0.8fr;
        grid-template-rows: repeat(2, minmax(0, 1fr));
        aspect-ratio: 1 / 1;
      }
      .message-album.count-3 .message-album-item:first-child {
        grid-row: 1 / span 2;
      }
      .message-album.count-5 {
        grid-template-columns: repeat(6, minmax(0, 1fr));
        grid-template-rows: repeat(2, minmax(0, 1fr));
        aspect-ratio: 1.25 / 1;
      }
      .message-album.count-5 .message-album-item:nth-child(1),
      .message-album.count-5 .message-album-item:nth-child(2) {
        grid-column: span 3;
      }
      .message-album.count-5 .message-album-item:nth-child(n+3) {
        grid-column: span 2;
      }
      .message-album-item {
        position: relative;
        display: block;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        background: rgba(255,255,255,0.04);
      }
      .message-album.count-1 .message-album-item,
      .message-album.count-2 .message-album-item,
      .message-album.count-4 .message-album-item {
        aspect-ratio: 1 / 1;
      }
      .message-image-link {
        display: block;
        width: fit-content;
        border: 0;
        background: transparent;
        padding: 0;
        cursor: pointer;
        border-radius: 16px;
        overflow: hidden;
        max-width: 100%;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }
      .message-image-link:focus,
      .message-image-link:focus-visible,
      .message-image-link:active {
        outline: none;
        box-shadow: none;
      }
      .message-album-item .message-image-link {
        width: 100%;
        max-width: none;
        height: 100%;
        border-radius: 0;
      }
      .message-image-shell {
        --message-image-box-size: min(280px, 42vw);
        position: relative;
        display: block;
        width: var(--message-image-box-size);
        height: var(--message-image-box-size);
        max-width: 100%;
        min-width: 180px;
        min-height: 180px;
        border-radius: 16px;
        overflow: hidden;
        background: linear-gradient(100deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.1) 44%, rgba(255,255,255,0.055) 88%);
        background-size: 220% 100%;
        animation: messageImageSkeleton 1.05s ease-in-out infinite;
      }
      .message.message-media .message-image-shell {
        min-width: 160px;
        min-height: 160px;
      }
      .message-album-item .message-image-shell {
        width: 100% !important;
        height: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        border-radius: 0;
      }
      .message-album-item .message-image {
        object-fit: cover;
      }
      .message-image-shell::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 48%, transparent 100%),
          rgba(255,255,255,0.035);
        transform: translateX(-120%);
        animation: messageImageSkeletonSweep 1.15s ease-in-out infinite;
        z-index: 1;
      }
      .message-image-shell.loaded::before {
        opacity: 0;
        transition: opacity 0.22s ease;
        animation: none;
      }
      .message-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: rgba(0, 0, 0, 0.18);
        opacity: 0;
        transition: opacity 0.18s ease;
        position: relative;
        z-index: 2;
      }
      .message-image-shell.loaded .message-image {
        opacity: 1;
      }
      .message-image-shell.loaded {
        animation: none;
        background: rgba(0, 0, 0, 0.18);
      }
      @keyframes messageImageSkeleton {
        0% {
          background-position: 160% 0;
        }
        100% {
          background-position: -60% 0;
        }
      }
      @keyframes messageImageSkeletonSweep {
        0% {
          transform: translateX(-120%);
        }
        100% {
          transform: translateX(120%);
        }
      }
      .message-caption {
        margin-top: 10px;
      }
      .message-link {
        color: #9fd0ff;
        text-decoration: underline;
        text-underline-offset: 2px;
        text-decoration-thickness: 1px;
        transition: color 0.16s ease, opacity 0.16s ease;
      }
      .message-link:hover {
        color: #c6e3ff;
      }
      .message.incoming .message-link {
        color: #69b5ff;
      }
      .message-meta {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 8px;
        font-size: 13px;
        color: rgba(255,255,255,0.8);
      }
      .message.incoming .message-meta {
        color: #99a2b2;
      }
      .message-day-separator {
        display: flex;
        justify-content: center;
        margin: 10px 0 14px;
      }
      .message-day-separator span {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        color: #dbe4f6;
        background: rgba(35, 43, 58, 0.66);
        border: 1px solid rgba(255,255,255,0.08);
      }
      .chat-scroll-day-indicator {
        position: absolute;
        top: var(--chat-day-indicator-top, 88px);
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
        z-index: 12;
        pointer-events: none;
        opacity: 0;
        transition: top 0.24s ease, opacity 0.22s ease, transform 0.22s ease;
      }
      .chat-scroll-day-indicator.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      .chat-scroll-day-indicator span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 88px;
        min-height: 30px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        color: #eef3ff;
        background: rgba(45, 51, 66, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(4px);
      }
      .chat-scroll-day-indicator.text-swap span {
        animation: dayIndicatorTextSwap 0.2s ease;
      }
      @keyframes dayIndicatorTextSwap {
        0% {
          opacity: 0.64;
          transform: translateY(3px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .message-checks {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        width: 20px;
        min-width: 20px;
        height: 20px;
        line-height: 1;
        transform: translateY(2px);
      }
      .message-checks.message-checks-single svg {
        width: 20px;
        height: 20px;
      }
      .message-checks svg {
        width: 20px;
        height: 20px;
        stroke: currentColor;
        fill: none;
        stroke-width: 1.75;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .message-state {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        width: 20px;
        min-width: 20px;
        height: 20px;
        line-height: 1;
        transform: translateY(2px);
      }
      .message-state svg {
        width: 20px;
        height: 20px;
        stroke: currentColor;
        fill: none;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .message-status-failed .message-meta {
        color: #ffd7dc;
      }
      .message-status-failed .message-state {
        color: #ff6d7d;
        font-size: 18px;
        font-weight: 800;
        line-height: 1;
        transform: translateY(-1px);
      }
${composerStyles}
      .chat-stage.drag-active {
        outline: 2px dashed rgba(122, 182, 255, 0.6);
        outline-offset: -14px;
        border-radius: 28px;
        background: rgba(23, 30, 42, 0.72);
      }
      .media-modal {
        position: fixed;
        inset: 0;
        z-index: 90;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.24s ease;
      }
      .media-modal.open {
        opacity: 1;
        pointer-events: auto;
      }
      .message-context-menu {
        position: fixed;
        z-index: 80;
        min-width: 220px;
        padding: 10px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(29, 31, 37, 0.98);
        box-shadow: 0 26px 48px rgba(0,0,0,0.3);
        backdrop-filter: blur(16px);
        opacity: 0;
        transform: translateY(8px) scale(0.98);
        pointer-events: none;
        transition: opacity 0.16s ease, transform 0.16s ease;
      }
      .message-context-menu.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .dialog-context-menu {
        position: fixed;
        z-index: 82;
        min-width: 244px;
        padding: 10px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(29, 31, 37, 0.98);
        box-shadow: 0 26px 48px rgba(0,0,0,0.3);
        backdrop-filter: blur(16px);
        opacity: 0;
        transform: translateY(8px) scale(0.98);
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
      }
      .dialog-context-menu.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .dialog-context-menu-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .dialog-context-menu-item {
        width: 100%;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: #f1f4fb;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 12px;
        font-size: 15px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: background 0.16s ease, transform 0.12s ease;
      }
      .dialog-context-menu-item:hover {
        background: rgba(255,255,255,0.06);
      }
      .dialog-context-menu-item .material-symbols-rounded {
        font-size: 21px;
        line-height: 1;
        font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        flex-shrink: 0;
      }
      .message-context-menu-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .message-context-menu-item {
        width: 100%;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: #f1f4fb;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 12px;
        font-size: 15px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: background 0.16s ease, transform 0.12s ease;
      }
      .message-context-menu-item:hover {
        background: rgba(255,255,255,0.06);
      }
      .message-context-menu-item.danger {
        color: #ff7c86;
      }
      .message-context-menu-item svg {
        width: 19px;
        height: 19px;
        stroke: currentColor;
        fill: none;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
        flex-shrink: 0;
      }
      .message-context-menu-item .material-symbols-rounded {
        font-size: 20px;
        line-height: 1;
        font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        flex-shrink: 0;
      }
      .media-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(7, 9, 13, 0.88);
        backdrop-filter: blur(10px);
      }
      .delete-message-modal-shell {
        position: absolute;
        left: 50%;
        top: 50%;
        width: min(460px, calc(100vw - 32px));
        border-radius: 28px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(27, 29, 36, 0.98);
        box-shadow: 0 28px 64px rgba(0,0,0,0.32);
        padding: 26px 26px 22px;
        font-family: "Inter", "Segoe UI", sans-serif;
        transform: translate(-50%, -50%) translateY(10px) scale(0.98);
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .media-modal.open .delete-message-modal-shell {
        transform: translate(-50%, -50%) translateY(0) scale(1);
      }
      .delete-message-title {
        margin: 0 0 14px;
        font-size: 30px;
        font-weight: 800;
      }
      .delete-message-copy {
        margin: 0 0 18px;
        color: #d4dae6;
        font-size: 17px;
        line-height: 1.5;
      }
      .delete-message-checkbox {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 22px;
        color: #f2f4fb;
        font-size: 16px;
      }
      .delete-message-checkbox[hidden] {
        display: none !important;
      }
      .delete-message-checkbox input {
        width: 18px;
        height: 18px;
        accent-color: #8b7df3;
      }
      .delete-message-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
      }
      .delete-message-button {
        border: 0;
        background: transparent;
        color: #a788ff;
        font-size: 17px;
        font-weight: 800;
        text-transform: uppercase;
        cursor: pointer;
        padding: 10px 4px;
      }
      .delete-message-button.danger {
        color: #ff4f58;
      }
      .attachment-modal-shell {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(560px, calc(100vw - 24px));
        max-height: min(86vh, 860px);
        display: flex;
        flex-direction: column;
        padding: 0;
        border-radius: 14px;
        overflow: hidden;
        background: rgba(32, 34, 40, 0.98);
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 28px 64px rgba(0,0,0,0.44);
      }
      .attachment-modal-shell.is-multi {
        height: min(86vh, 860px);
      }
      .attachment-modal-header,
      .viewer-modal-header {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }
      .attachment-modal-title {
        margin: 0;
        font-size: 42px;
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: #f5f7ff;
        padding: 16px 18px 8px;
      }
      .media-modal-close {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        border: 0;
        background: transparent;
        color: #f5f7ff;
        font-size: 30px;
        line-height: 1;
        cursor: pointer;
        margin-right: 8px;
      }
      .attachment-modal-stage {
        position: relative;
        z-index: 1;
        flex: 0 0 auto;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .attachment-modal-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        flex: 0 0 auto;
        gap: 8px;
        min-height: auto;
        overflow: visible;
        padding: 0 10px 0;
      }
      .attachment-modal-shell.is-multi .attachment-modal-content {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-gutter: stable;
      }
      .attachment-modal-shell.is-multi .attachment-modal-content::-webkit-scrollbar { width: 8px; }
      .attachment-modal-shell.is-multi .attachment-modal-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 999px; }
      .attachment-modal-content::-webkit-scrollbar {
        width: 8px;
      }
      .attachment-modal-content::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.18);
        border-radius: 999px;
      }
      .attachment-modal-main {
        position: relative;
        width: 100%;
        max-width: none;
        max-height: min(40vh, 360px);
        min-width: 0;
        min-height: min(220px, 32vh);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 8px 26px rgba(0,0,0,0.28);
        background: rgba(255,255,255,0.04);
      }
      .attachment-modal-main::before {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(255,255,255,0.055);
        opacity: 0;
        transition: opacity 0.18s ease;
      }
      .attachment-modal-main.loading::before {
        opacity: 1;
      }
      .attachment-modal-main img {
        display: block;
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: min(40vh, 360px);
        object-fit: cover;
        background: rgba(0, 0, 0, 0.24);
        opacity: 1;
        transition: opacity 0.18s ease;
      }
      .attachment-modal-main.loading img {
        opacity: 0;
      }
      .attachment-modal-nav {
        display: none !important;
      }
      .attachment-modal-nav[hidden] {
        display: none;
      }
      .attachment-modal-nav.prev {
        left: -58px;
      }
      .attachment-modal-nav.next {
        right: -58px;
      }
      .attachment-modal-strip {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-auto-rows: 116px;
        grid-auto-flow: row;
        align-content: start;
        gap: 2px;
        margin: 0;
        padding: 0;
        border-radius: 8px;
        background: rgba(15, 18, 25, 0.52);
        overflow: hidden;
      }
      .attachment-modal-shell.is-multi .attachment-modal-strip {
        flex: 0 0 auto;
        min-height: auto;
        overflow: visible;
        margin-bottom: 4px;
      }
      .attachment-modal-strip[hidden] { display: none; }
      .attachment-modal-shell.is-file-mode {
        width: min(560px, calc(100vw - 20px));
        max-height: min(86vh, 760px);
      }
      .attachment-modal-shell.is-file-mode .attachment-modal-content {
        flex: 0 0 auto;
        min-height: auto;
        max-height: min(46vh, 420px);
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0 12px 0;
      }
      .attachment-modal-shell.is-file-mode.is-multi .attachment-modal-content {
        flex: 1 1 auto;
        min-height: 0;
        max-height: none;
      }
      .attachment-modal-shell.is-file-mode .attachment-modal-stage {
        display: none;
      }
      .attachment-modal-shell.is-file-mode .attachment-modal-strip {
        display: flex;
        flex-direction: column;
        gap: 8px;
        grid-template-columns: none;
        grid-auto-rows: auto;
        background: transparent;
        border-radius: 0;
        overflow: visible;
      }
      .attachment-modal-file-item {
        width: 100%;
        border: 0;
        border-radius: 14px;
        padding: 10px 12px;
        background: rgba(255,255,255,0.06);
        display: flex;
        align-items: center;
        gap: 12px;
        color: #eef2fb;
        cursor: pointer;
        text-align: left;
      }
      .attachment-modal-file-item.active {
        background: rgba(132,114,241,0.2);
        box-shadow: inset 0 0 0 1px rgba(132,114,241,0.42);
      }
      .attachment-modal-file-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #8472f1;
        color: #ffffff;
        font-size: 16px;
        flex-shrink: 0;
        padding-left: 2px;
      }
      .attachment-modal-file-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .attachment-modal-file-name {
        font-size: 16px;
        font-weight: 600;
        line-height: 1.2;
        color: #eef2fb;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .attachment-modal-file-meta {
        margin-top: 2px;
        font-size: 13px;
        color: #9ea8bc;
        line-height: 1.2;
      }
      .attachment-modal-thumb {
        display: block;
        width: 100%;
        height: 100%;
        aspect-ratio: auto;
        padding: 0;
        border-radius: 0;
        overflow: hidden;
        border: 0;
        background: rgba(255,255,255,0.06);
        cursor: pointer;
        font-size: 0;
        line-height: 0;
        opacity: 1;
        transform: scale(1);
        transition: opacity 0.18s ease, box-shadow 0.18s ease;
      }
      .attachment-modal-thumb.active {
        opacity: 1;
        box-shadow: inset 0 0 0 2px rgba(133, 116, 242, 0.95);
      }
      .attachment-modal-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .attachment-modal-thumb:focus,
      .attachment-modal-thumb:focus-visible,
      .attachment-modal-nav:focus,
      .attachment-modal-nav:focus-visible,
      .attachment-modal-send:focus,
      .attachment-modal-send:focus-visible,
      .media-modal-close:focus,
      .media-modal-close:focus-visible {
        outline: none;
      }
      .attachment-modal-footer {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 10px;
        flex-shrink: 0;
      }
      .attachment-modal-composer {
        position: relative;
        flex: 1;
        min-width: 0;
        min-height: 56px;
        display: flex;
        align-items: center;
        gap: 0;
        padding: 6px 14px;
        border-radius: 14px;
        background: rgba(18, 22, 30, 0.95);
        border: 1px solid rgba(255,255,255,0.07);
      }
      .attachment-modal-composer:focus-within {
        border-color: rgba(255,255,255,0.08);
        background: rgba(18, 22, 30, 0.98);
      }
      .attachment-modal-emoji-picker {
        left: 0;
        right: auto;
        bottom: calc(100% + 16px);
        z-index: 18;
      }
      .attachment-modal-caption-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        min-height: 40px;
      }
      .attachment-modal-caption {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: 0;
        outline: none;
        color: #eef2fb;
        -webkit-text-fill-color: #eef2fb;
        caret-color: #eef2fb;
        font-family: inherit;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.25;
      }
      .attachment-modal-caption::placeholder {
        color: #8e96a4;
        -webkit-text-fill-color: #8e96a4;
      }
      .attachment-modal-send {
        min-width: 76px;
        height: 48px;
        padding: 0 18px;
        border-radius: 12px;
        border: 0;
        background: #8472f1;
        color: #ffffff;
        font-size: 27px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0;
        text-transform: uppercase;
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        cursor: pointer;
        flex-shrink: 0;
      }
      .attachment-modal-send:hover {
        filter: brightness(1.04);
      }
      .attachment-modal-send:active {
        transform: translateY(1px);
      }
      .attachment-modal-send:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .attachment-modal-send img {
        display: none;
      }
      .attachment-modal-send-label {
        display: inline-block;
      }
      @media (max-width: 860px) {
        .attachment-modal-send {
          min-width: 70px;
          height: 44px;
          padding: 0 16px;
          font-size: 24px;
        }
      }
      .viewer-modal-shell {
        position: absolute;
        inset: 0;
        padding: 16px 20px 22px;
      }
      @media (max-width: 860px) {
        .message-audio-card {
          max-width: min(88vw, 420px);
        }
        .message-audio-name {
          font-size: 14px;
        }
        .message-audio-meta-line {
          font-size: 12px;
        }
        .attachment-modal-shell {
          width: calc(100vw - 10px);
          max-height: min(92vh, 860px);
          padding: 0;
        }
        .attachment-modal-title {
          font-size: 36px;
        }
        .attachment-modal-main {
          min-width: 0;
          width: 100%;
          min-height: min(200px, 30vh);
          max-height: min(38vh, 330px);
        }
        .attachment-modal-file-name {
          font-size: 15px;
        }
        .attachment-modal-file-meta {
          font-size: 12px;
        }
      }
      .viewer-author {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      .viewer-author-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        flex-shrink: 0;
        background: linear-gradient(180deg, var(--avatar-start, #6cb5ff) 0%, var(--avatar-end, #4a8fe9) 100%);
      }
      .viewer-author-copy {
        min-width: 0;
      }
      .viewer-author-name {
        display: block;
        font-size: 16px;
        font-weight: 700;
        color: #f5f7ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .viewer-author-meta {
        display: block;
        margin-top: 3px;
        font-size: 14px;
        color: #98a6bc;
      }
      .viewer-modal-stage {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .viewer-zoom-chip {
        position: absolute;
        left: 50%;
        bottom: 24px;
        z-index: 12;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        border-radius: 999px;
        background: rgba(34, 24, 20, 0.84);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 16px 32px rgba(0,0,0,0.26);
        transform: translateX(-50%);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
      }
      .media-modal.open .viewer-zoom-chip {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0);
      }
      .viewer-zoom-button {
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: #f6f0eb;
        font-size: 24px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s ease, transform 0.16s ease;
      }
      .viewer-zoom-button:hover {
        background: rgba(255,255,255,0.08);
      }
      .viewer-zoom-button:active {
        transform: scale(0.96);
      }
      .viewer-zoom-value {
        min-width: 68px;
        text-align: center;
        font-size: 16px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: #ffffff;
        letter-spacing: 0.01em;
      }
      .viewer-modal-image {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) scale(1);
        transform-origin: center center;
        border-radius: 24px;
        box-shadow: 0 30px 80px rgba(0,0,0,0.38);
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
        cursor: zoom-in;
        max-width: none;
        max-height: none;
        transition: left 0.28s ease, top 0.28s ease, width 0.28s ease, height 0.28s ease, border-radius 0.28s ease, transform 0.2s ease;
      }
      .viewer-modal-image.zoomed {
        cursor: zoom-out;
      }
      .empty-chat-copy {
        margin-top: 8px;
        color: #9da5b4;
        font-size: 18px;
      }
      .empty-chat-state {
        text-align: center;
        max-width: 520px;
        margin: 0 auto;
      }
      .empty-chat-state p {
        margin: 0;
        color: #aeb6c5;
        font-size: 24px;
        line-height: 1.6;
      }
      .empty-chat-state p + p {
        margin-top: 10px;
        font-size: 20px;
        color: #8f97a5;
      }
      .saved-empty-state {
        max-width: 540px;
        text-align: center;
      }
      .saved-empty-state h3 {
        margin: 0 0 16px;
        font-size: 30px;
        color: #eef2fb;
      }
      .saved-empty-state p {
        margin: 0;
        font-size: 20px;
        line-height: 1.7;
        color: #9da5b4;
      }
      .saved-empty-state p + p {
        margin-top: 8px;
      }
      .direct-empty-state {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 22px 18px;
        animation: directEmptyFade 0.26s ease both;
      }
      .direct-empty-card {
        max-width: 420px;
        padding: 22px 24px;
        border-radius: 26px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(18, 22, 30, 0.82);
        text-align: center;
        box-shadow: 0 18px 40px rgba(0,0,0,0.18);
      }
      .direct-empty-card h3 {
        margin: 0 0 10px;
        font-size: 22px;
        color: #f2f5fd;
      }
      .direct-empty-card p {
        margin: 0;
        font-size: 15px;
        line-height: 1.5;
        color: #aab5c8;
      }
      @keyframes directEmptyFade {
        0% {
          opacity: 0;
          transform: translateY(12px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .toolbar-button {
        border: 0;
        border-radius: 999px;
        background: rgba(255,255,255,0.06);
        color: #eef2fb;
        padding: 12px 16px;
        cursor: pointer;
        transition: background 0.16s ease, opacity 0.16s ease, transform 0.16s ease;
      }
      .toolbar-button:hover {
        background: rgba(255,255,255,0.1);
      }
      .toolbar-button:active {
        transform: scale(0.97);
      }
      .toolbar-button.danger {
        background: rgba(255, 112, 124, 0.14);
        color: #ffd8dc;
      }
      .toolbar-button.danger:hover {
        background: rgba(255, 112, 124, 0.22);
      }
      .toast-stack {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 40;
        display: grid;
        gap: 10px;
        width: min(340px, calc(100vw - 32px));
      }
      .toast {
        padding: 14px 16px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(16, 20, 27, 0.96);
        color: #eef2fb;
        box-shadow: 0 18px 36px rgba(0,0,0,0.28);
        font-size: 14px;
        line-height: 1.45;
        animation: toastIn 0.22s ease both;
      }
      .toast.success {
        border-color: rgba(117, 226, 165, 0.24);
      }
      .toast.error {
        border-color: rgba(255, 116, 126, 0.24);
      }
      .toast.info {
        border-color: rgba(121, 169, 255, 0.24);
      }
      @keyframes toastIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @media (max-width: 1120px) {
        .auth-shell {
          grid-template-columns: 1fr;
        }
        .brand-panel,
        .auth-panel {
          min-height: auto;
        }
      }
      @media (max-width: 900px) {
        .page.workspace-mode {
          padding: 0;
        }
        .sidebar-resize-handle {
          display: none;
        }
        .workspace-shell {
          position: relative;
          display: block;
          height: 100dvh;
          min-height: 100dvh;
          gap: 0;
        }
        .workspace-sidebar,
        .workspace-main {
          position: absolute;
          inset: 0;
          height: 100dvh;
          min-height: 100dvh;
          border-radius: 0;
          transition: transform 0.34s cubic-bezier(0.22, 0.9, 0.24, 1), opacity 0.22s ease;
          will-change: transform, opacity;
        }
        .workspace-sidebar {
          z-index: 3;
          padding: 18px 14px 16px;
          transform: translateX(0);
        }
        .workspace-main,
        .workspace-main.empty-chat {
          z-index: 4;
          padding: 0;
          opacity: 0;
          pointer-events: none;
          transform: translateX(104%);
        }
        .page.mobile-chat-open .workspace-sidebar {
          transform: translateX(-106%);
          opacity: 0.76;
          pointer-events: none;
        }
        .page.mobile-chat-open .workspace-main,
        .page.mobile-chat-open .workspace-main.empty-chat {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
        }
        .chat-window,
        .workspace-main.empty-chat .chat-window {
          --chat-profile-panel-width: 100%;
          min-height: 100dvh;
          border-radius: 0;
          padding-right: 0;
        }
        .chat-window.profile-panel-open {
          padding-right: 0;
        }
        .workspace-main.empty-chat {
          justify-content: stretch;
        }
        .page.mobile-chat-open .chat-window {
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
        }
      }
      @media (max-width: 680px) {
        .page {
          padding: 18px;
        }
        .page.workspace-mode {
          padding: 0;
        }
        .brand-panel,
        .auth-panel,
        .workspace-sidebar,
        .workspace-main {
          padding: 20px;
        }
        .auth-card {
          padding: 24px 18px;
        }
        .brand-title {
          font-size: 56px;
        }
        .workspace-sidebar {
          padding: 18px 12px 14px;
        }
        .workspace-brand img {
          width: 58px;
          height: 58px;
          border-radius: 16px;
        }
        .workspace-brand h1 {
          font-size: 30px;
        }
        .chat-island {
          top: 12px;
          width: min(calc(100vw - 34px), 280px);
        }
        .page.ui-telegram-topbar .chat-island {
          top: 0;
          width: 100%;
          min-height: 68px;
          padding: 11px 14px;
        }
        .page.ui-telegram-topbar .chat-header-avatar {
          width: 38px;
          height: 38px;
        }
        .chat-search-panel {
          top: 68px;
          width: min(calc(100vw - 24px), 100%);
        }
        .page.ui-telegram-topbar .chat-search-panel {
          top: 74px;
          width: min(calc(100vw - 24px), 100%);
        }
        .chat-stage {
          padding: 78px 10px 14px;
        }
        .page.ui-telegram-topbar .chat-stage {
          padding: 82px 10px 14px;
        }
        .composer {
          margin-top: 10px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
          transition-duration: 0.001ms !important;
        }
        .page:not(.booting),
        .chat-window.motion-enter,
        .message.message-launch {
          animation: none !important;
        }
        .app-progress {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <div id="app-progress" class="app-progress active" aria-hidden="true">
      <div class="app-progress-track">
        <div class="app-progress-bar"></div>
      </div>
    </div>
    <main id="page-root" class="${pageClassNames}">
      <section id="auth-view" class="view hidden">
        <div class="auth-shell">
          <article class="panel brand-panel">
            <div class="brand-stack">
              <div class="logo-mark">
                <img class="logo-image" src="${logoDataUrl}" alt="TheGraphT logo" />
              </div>
              <p class="overline">Thegrapht Messenger</p>
              <div class="brand-chip">Thegrapht</div>
              <h1 class="brand-title">Your new<br /><span class="brand-title-dynamic-line"><span class="brand-title-dynamic-placeholder">messenger</span><span class="brand-title-dynamic-wrap"><span id="brand-title-dynamic" class="brand-title-dynamic"></span><span id="brand-title-cursor" class="brand-title-cursor" aria-hidden="true"></span></span></span></h1>
            </div>
          </article>
          <article class="panel auth-panel">
            <div class="auth-card">
              <div class="auth-inner">
                <div id="auth-copy-block" class="auth-copy-block">
                  <p id="auth-kicker" class="auth-kicker">Sign in</p>
                  <h2 id="auth-title" class="auth-title">Log In</h2>
                  <p id="auth-copy" class="auth-copy">Enter your email and password to continue to Thegrapht.</p>
                </div>

                <form id="auth-form" novalidate>
                  <div id="name-field" class="toggle-field">
                    <div class="field">
                      <label for="name">Name</label>
                      <input id="name" name="name" type="text" autocomplete="name" placeholder="galyachupachups" />
                    </div>
                  </div>

                  <div class="field">
                    <label for="email">Email</label>
                    <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
                  </div>

                  <div class="field">
                    <label for="password">Password</label>
                    <input id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••••••" required />
                  </div>

                  <button id="submit-button" class="submit" type="submit">Log In</button>
                  <div id="status" class="status"></div>
                </form>
              </div>

              <div class="meta-row">
                <span id="meta-text">No account?</span>
                <button id="toggle-mode" type="button">Create account</button>
                <div style="margin-top: 18px; text-align: center;">
                  <a class="auth-faq-link" href="https://thegrapht.su/faq">Messenger FAQ</a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="workspace-view" class="view hidden">
        <div class="workspace-shell">
          <aside class="workspace-sidebar">
            <div id="sidebar-resize-handle" class="sidebar-resize-handle" aria-hidden="true"></div>
            <div class="workspace-brand">
              <div class="workspace-brand-leading">
                <button id="sidebar-menu-button" class="workspace-brand-menu" type="button" aria-label="Sidebar menu">
                  <span class="material-symbols-rounded" aria-hidden="true">menu</span>
                </button>
                <h1>TheGrapht</h1>
              </div>
            </div>
            <div id="sidebar-glass-menu" class="sidebar-glass-menu" aria-hidden="true">
              <div class="sidebar-glass-menu-items">
                <button id="sidebar-menu-profile" class="sidebar-glass-menu-item" type="button">
                  <span class="material-symbols-rounded" aria-hidden="true">person</span>
                  <span>Profile</span>
                </button>
                <button id="sidebar-menu-saved" class="sidebar-glass-menu-item" type="button">
                  <span class="material-symbols-rounded" aria-hidden="true">bookmark</span>
                  <span>Saved Messages</span>
                </button>
                <hr class="sidebar-glass-menu-sep" />
                <button id="sidebar-menu-logout" class="sidebar-glass-menu-item" type="button">
                  <span class="material-symbols-rounded" aria-hidden="true">logout</span>
                  <span>Log out</span>
                </button>
              </div>
            </div>
            <div class="${workspaceAccountClassName}">
              <div class="workspace-account-copy">
                <span class="workspace-account-label">Account</span>
                <strong id="workspace-user-name" class="workspace-account-name">Guest</strong>
              </div>
              <button id="logout-button" class="workspace-account-logout" type="button">Log out</button>
            </div>

            <div class="sidebar-search">
              <input id="sidebar-search" type="text" placeholder="Search" />
            </div>

            <div id="dialog-list" class="dialog-list"></div>
          </aside>

          <section class="workspace-main">
            <div id="multi-tab-blocker" class="multi-tab-blocker" aria-hidden="true">
              <div class="multi-tab-blocker-card">
                <p class="multi-tab-blocker-title">Another tab is active</p>
                <p class="multi-tab-blocker-copy">Close other TheGraphT tabs. This tab will become active automatically.</p>
              </div>
            </div>
            <div id="chat-window" class="chat-window">
              <div id="chat-island" class="chat-island">
                <div class="chat-island-copy" role="button" tabindex="0" aria-label="Open profile info">
                  <div id="chat-header-avatar" class="chat-header-avatar" aria-hidden="true"></div>
                  <div class="chat-island-text">
                    <strong id="chat-title">Saved Messages</strong>
                    <span id="chat-subtitle">Only for you</span>
                  </div>
                </div>
                <div class="chat-island-actions">
                  <button id="chat-search-toggle" class="chat-island-action" type="button" aria-label="Search messages">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="10.5" cy="10.5" r="4.75"></circle>
                      <path d="M15 15L19 19"></path>
                    </svg>
                  </button>
                  <button id="chat-call-button" class="chat-island-action" type="button" aria-label="Call">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.9 16.9V19a1.7 1.7 0 0 1-1.9 1.7 16.7 16.7 0 0 1-7.3-2.6 16.4 16.4 0 0 1-5-5 16.7 16.7 0 0 1-2.6-7.3A1.7 1.7 0 0 1 3.8 4h2.1a1.7 1.7 0 0 1 1.7 1.5l.3 2.2a1.7 1.7 0 0 1-.5 1.4l-1 1a13.4 13.4 0 0 0 5.5 5.5l1-1a1.7 1.7 0 0 1 1.4-.5l2.2.3a1.7 1.7 0 0 1 1.5 1.7Z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div id="chat-search-backdrop" class="chat-search-backdrop" aria-hidden="true"></div>
              <div id="chat-search-panel" class="chat-search-panel" aria-hidden="true">
                <div class="chat-search-bar">
                  <div id="chat-search-avatar" class="chat-search-avatar">T</div>
                  <div class="chat-search-field">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
                    <input id="chat-search-input" class="chat-search-input" type="text" placeholder="Search" />
                  </div>
                  <button id="chat-search-close" class="chat-search-close" type="button" aria-label="Close search">
                    <span class="material-symbols-rounded" aria-hidden="true">close</span>
                  </button>
                </div>
                <div id="chat-search-results" class="chat-search-results"></div>
              </div>
              <div id="chat-call-chip" class="chat-call-chip" aria-hidden="true">
                <span class="chat-call-chip-dot" aria-hidden="true"></span>
                <div class="chat-call-chip-copy">
                  <span id="chat-call-chip-title" class="chat-call-chip-title">Call</span>
                  <span id="chat-call-chip-time" class="chat-call-chip-time">00:00</span>
                </div>
              </div>
              <div id="chat-audio-top-player" class="chat-audio-top-player" aria-hidden="true">
                <div class="chat-audio-top-inner">
                  <button id="chat-audio-top-prev" class="chat-audio-top-btn" type="button" aria-label="Rewind 10 seconds">
                    <span class="material-symbols-rounded" aria-hidden="true">fast_rewind</span>
                  </button>
                  <button id="chat-audio-top-toggle" class="chat-audio-top-btn" type="button" aria-label="Pause">
                    <span id="chat-audio-top-toggle-icon" class="material-symbols-rounded" aria-hidden="true">pause</span>
                  </button>
                  <button id="chat-audio-top-next" class="chat-audio-top-btn" type="button" aria-label="Forward 10 seconds">
                    <span class="material-symbols-rounded" aria-hidden="true">fast_forward</span>
                  </button>
                  <div class="chat-audio-top-copy">
                    <div id="chat-audio-top-title" class="chat-audio-top-title">Audio</div>
                    <div id="chat-audio-top-meta" class="chat-audio-top-meta">0:00 · Unknown artist</div>
                  </div>
                  <div class="chat-audio-top-volume-wrap">
                    <button id="chat-audio-top-volume" class="chat-audio-top-btn" type="button" aria-label="Mute or unmute">
                      <span id="chat-audio-top-volume-icon" class="material-symbols-rounded" aria-hidden="true">volume_up</span>
                    </button>
                    <div id="chat-audio-top-volume-popover" class="chat-audio-top-volume-popover" aria-hidden="true">
                      <input id="chat-audio-top-volume-range" class="chat-audio-top-volume-range" type="range" min="0" max="1" step="0.01" value="1" aria-label="Volume" />
                    </div>
                  </div>
                  <button id="chat-audio-top-speed" class="chat-audio-top-speed" type="button" aria-label="Playback speed">1X</button>
                  <button id="chat-audio-top-repeat" class="chat-audio-top-repeat" type="button" aria-label="Repeat">
                    <span class="material-symbols-rounded" aria-hidden="true">repeat</span>
                  </button>
                  <button id="chat-audio-top-close" class="chat-audio-top-btn" type="button" aria-label="Stop and close player">
                    <span class="material-symbols-rounded" aria-hidden="true">close</span>
                  </button>
                </div>
                <div id="chat-audio-top-progress" class="chat-audio-top-progress" aria-hidden="true">
                  <span id="chat-audio-top-progress-fill" class="chat-audio-top-progress-fill"></span>
                </div>
              </div>
              <aside id="chat-profile-panel" class="chat-profile-panel" aria-hidden="true">
                <div class="chat-profile-panel-header">
                  <span class="chat-profile-panel-title">Info</span>
                  <button id="chat-profile-close" class="chat-profile-panel-close" type="button" aria-label="Close profile">
                    <span class="material-symbols-rounded" aria-hidden="true">close</span>
                  </button>
                </div>
                <div class="chat-profile-panel-body">
                  <div class="chat-profile-summary">
                    <div id="chat-profile-avatar" class="chat-profile-avatar">T</div>
                    <div id="chat-profile-name" class="chat-profile-name">TheGrapht</div>
                    <div id="chat-profile-status" class="chat-profile-status">online</div>
                  </div>
                  <div class="chat-profile-meta-grid">
                    <div class="chat-profile-card">
                      <span class="chat-profile-card-label">Username</span>
                      <div id="chat-profile-username" class="chat-profile-card-value">@thegrapht</div>
                    </div>
                    <div class="chat-profile-card">
                      <span class="chat-profile-card-label">Profile link</span>
                      <div class="chat-profile-card-value"><a id="chat-profile-link" class="chat-profile-link" href="https://thegrapht.su" target="_blank" rel="noopener noreferrer">thegrapht.su</a></div>
                    </div>
                  </div>
                </div>
              </aside>

              <div id="chat-stage" class="chat-stage">
                <div id="chat-loading-overlay" class="chat-loading-overlay" aria-hidden="true">
                  <div class="search-spinner" aria-hidden="true"></div>
                </div>
                <div id="chat-scroll-day-indicator" class="chat-scroll-day-indicator" aria-hidden="true">
                  <span id="chat-scroll-day-indicator-text">Today</span>
                </div>
                <div id="message-list" class="message-list"></div>
                <button id="chat-scroll-bottom" class="chat-scroll-bottom" type="button" aria-label="Scroll down">
                  <span class="material-symbols-rounded" aria-hidden="true">south</span>
                </button>
${buildComposerMarkup({
  emojiIconDataUrl,
  settingsKeyboardIconDataUrl,
  sendButtonIconDataUrl
})}
              </div>
              <div id="call-overlay" class="call-overlay" aria-hidden="true">
                <div id="call-modal" class="call-modal">
                  <div class="call-modal-header">
                    <span aria-hidden="true"></span>
                    <button id="call-close-button" class="call-icon-button" type="button" aria-label="Minimize call">
                      <span class="material-symbols-rounded" aria-hidden="true">close</span>
                    </button>
                  </div>
                  <div class="call-modal-content">
                    <div class="call-fingerprint">
                      <div id="call-fingerprint-emojis" class="call-fingerprint-emojis">🍎 🐱 🚀 🔥</div>
                      <div class="call-fingerprint-copy">Compare these 6 Apple emojis with your contact. Matching values help detect call tampering.</div>
                    </div>
                    <div class="call-peer-avatar-shell" aria-hidden="true">
                      <span class="call-voice-ring r3"></span>
                      <span class="call-voice-ring r2"></span>
                      <span class="call-voice-ring r1"></span>
                      <div id="call-peer-avatar" class="call-peer-avatar">T</div>
                    </div>
                    <div id="call-peer-name" class="call-peer-name">TheGraphT</div>
                    <div id="call-peer-status" class="call-peer-status">requesting...</div>
                    <div id="call-peer-substatus" class="call-peer-substatus">Setting up call</div>
                    <div class="call-actions">
                      <div class="call-action">
                        <button id="call-mute-button" class="call-action-button" type="button" aria-label="Mute microphone">
                          <span class="material-symbols-rounded" aria-hidden="true">mic</span>
                        </button>
                        <span id="call-mute-label" class="call-action-label">microphone</span>
                      </div>
                      <div class="call-action">
                        <button id="call-devices-button" class="call-action-button" type="button" aria-label="Audio devices">
                          <span class="material-symbols-rounded" aria-hidden="true">volume_up</span>
                        </button>
                        <span class="call-action-label">audio</span>
                      </div>
                      <div id="call-accept-wrap" class="call-action" hidden>
                        <button id="call-accept-button" class="call-action-button accept" type="button" aria-label="Accept call">
                          <span class="material-symbols-rounded" aria-hidden="true">call</span>
                        </button>
                        <span class="call-action-label">accept</span>
                      </div>
                      <div class="call-action">
                        <button id="call-end-button" class="call-action-button end" type="button" aria-label="End call">
                          <span class="material-symbols-rounded" aria-hidden="true">call_end</span>
                        </button>
                        <span id="call-end-label" class="call-action-label">end</span>
                      </div>
                    </div>
                  </div>
                  <div id="call-devices-panel" class="call-devices-panel" aria-hidden="true">
                    <div class="call-devices-header">
                      <div class="call-devices-title">Call audio devices</div>
                      <button id="call-devices-close" class="call-icon-button" type="button" aria-label="Close devices panel">
                        <span class="material-symbols-rounded" aria-hidden="true">close</span>
                      </button>
                    </div>
                    <div class="call-device-field">
                      <label class="call-device-label" for="call-input-device">Microphone</label>
                      <select id="call-input-device" class="call-device-select"></select>
                    </div>
                    <div class="call-device-field">
                      <label class="call-device-label" for="call-output-device">Output</label>
                      <select id="call-output-device" class="call-device-select"></select>
                    </div>
                  </div>
                </div>
                <div id="call-mini-card" class="call-mini-card" aria-hidden="true">
                  <div id="call-mini-drag-handle" class="call-mini-header">
                    <div>
                      <div class="call-mini-title">TheGraphT call</div>
                      <div id="call-mini-name" class="call-mini-name">TheGraphT</div>
                      <div id="call-mini-subtitle" class="call-mini-subtitle">connecting...</div>
                    </div>
                    <button id="call-mini-close" class="call-icon-button" type="button" aria-label="Close mini call">
                      <span class="material-symbols-rounded" aria-hidden="true">close</span>
                    </button>
                  </div>
                  <div class="call-mini-cover">
                    <div class="call-peer-avatar-shell" aria-hidden="true">
                      <span class="call-voice-ring r3"></span>
                      <span class="call-voice-ring r2"></span>
                      <span class="call-voice-ring r1"></span>
                      <div id="call-mini-avatar" class="call-peer-avatar">T</div>
                    </div>
                  </div>
                  <div class="call-mini-actions">
                    <button id="call-mini-open" class="call-icon-button" type="button" aria-label="Open call">
                      <span class="material-symbols-rounded" aria-hidden="true">open_in_full</span>
                    </button>
                    <button id="call-mini-end" class="call-icon-button" type="button" aria-label="End call">
                      <span class="material-symbols-rounded" aria-hidden="true">call_end</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
    <div id="attachment-modal" class="media-modal" aria-hidden="true">
      <div class="media-modal-backdrop"></div>
      <div class="attachment-modal-shell">
        <div class="attachment-modal-header">
          <h2 id="attachment-modal-title" class="attachment-modal-title">1 photo</h2>
          <button id="attachment-modal-close" class="media-modal-close" type="button" aria-label="Close">&times;</button>
        </div>
        <div class="attachment-modal-content">
          <div class="attachment-modal-stage">
            <button id="attachment-modal-prev" class="attachment-modal-nav prev" type="button" aria-label="Previous photo" hidden>&lsaquo;</button>
            <div class="attachment-modal-main">
              <img id="attachment-modal-image" src="" alt="" />
            </div>
            <button id="attachment-modal-next" class="attachment-modal-nav next" type="button" aria-label="Next photo" hidden>&rsaquo;</button>
          </div>
          <div id="attachment-modal-strip" class="attachment-modal-strip"></div>
        </div>
        <div class="attachment-modal-footer">
          <div class="attachment-modal-composer">
            <div id="attachment-modal-emoji-picker" class="emoji-picker attachment-modal-emoji-picker" aria-hidden="true">
              <div id="attachment-modal-emoji-picker-head" class="emoji-picker-head"></div>
              <div id="attachment-modal-emoji-picker-body" class="emoji-picker-body"></div>
              <div class="emoji-picker-foot">
                <span class="emoji-picker-hint">Hover or click to pick an emoji</span>
              </div>
            </div>
            <div class="attachment-modal-caption-wrap">
              <input id="attachment-modal-caption" class="attachment-modal-caption" type="text" placeholder="Add a caption..." />
            </div>
          </div>
          <button id="attachment-modal-send" class="attachment-modal-send" type="button" aria-label="Send">
            <span class="attachment-modal-send-label">SEND</span>
          </button>
        </div>
      </div>
    </div>
    <div id="viewer-modal" class="media-modal" aria-hidden="true">
      <div class="media-modal-backdrop"></div>
      <div class="viewer-modal-shell">
        <div class="viewer-modal-header">
          <div class="viewer-author">
            <div id="viewer-author-avatar" class="viewer-author-avatar">?</div>
            <div class="viewer-author-copy">
              <span id="viewer-author-name" class="viewer-author-name">TheGraphT</span>
              <span id="viewer-author-meta" class="viewer-author-meta">Today, 00:00</span>
            </div>
          </div>
          <button id="viewer-modal-close" class="media-modal-close" type="button" aria-label="Close">&times;</button>
        </div>
        <div id="viewer-modal-stage" class="viewer-modal-stage">
          <img id="viewer-modal-image" class="viewer-modal-image" src="" alt="" />
        </div>
        <div id="viewer-zoom-chip" class="viewer-zoom-chip" aria-hidden="true">
          <button id="viewer-zoom-out" class="viewer-zoom-button" type="button" aria-label="Zoom out">−</button>
          <span id="viewer-zoom-value" class="viewer-zoom-value">100%</span>
          <button id="viewer-zoom-in" class="viewer-zoom-button" type="button" aria-label="Zoom in">+</button>
        </div>
      </div>
    </div>
    <div id="message-context-menu" class="message-context-menu" aria-hidden="true">
      <div id="message-context-menu-body" class="message-context-menu-body"></div>
    </div>
    <div id="dialog-context-menu" class="dialog-context-menu" aria-hidden="true">
      <div id="dialog-context-menu-body" class="dialog-context-menu-body"></div>
    </div>
    <div id="delete-message-modal" class="media-modal" aria-hidden="true">
      <div class="media-modal-backdrop"></div>
      <div class="delete-message-modal-shell">
        <h2 class="delete-message-title">Delete message</h2>
        <p class="delete-message-copy">Are you sure you want to delete this message?</p>
        <label id="delete-message-for-everyone-wrap" class="delete-message-checkbox">
          <input id="delete-message-for-everyone" type="checkbox" checked />
          <span id="delete-message-for-everyone-label">Also delete for everyone</span>
        </label>
        <div class="delete-message-actions">
          <button id="delete-message-cancel" class="delete-message-button" type="button">Cancel</button>
          <button id="delete-message-confirm" class="delete-message-button danger" type="button">Delete</button>
        </div>
      </div>
    </div>
    <div id="toast-stack" class="toast-stack" aria-live="polite" aria-atomic="true"></div>
    <script src="${clientScriptUrl}" defer></script>
  </body>
</html>`;
};
