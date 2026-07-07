import { buildComposerMarkup } from "./components/composer.js";
import { buildStyles } from "./components/styles.js";
import { iconMap, lucideSvgs } from "./icons.js";

export const getIconHtml = (name, extraClasses = "", attrs = "") => {
  const lucideName = iconMap[name] || name;
  const svgContent = lucideSvgs[lucideName];
  if (!svgContent) {
    console.warn("Icon not found: " + name);
    return "";
  }
  const attrStr = attrs ? " " + attrs : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-svg icon-${lucideName} ${extraClasses}"${attrStr}>${svgContent}</svg>`;
};

export const buildHtml = ({
  clientScriptUrl,
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  manifestUrl,
  logoDataUrl,
  wallpaperDataUrl,
  emojiIconDataUrl,
  settingsKeyboardIconDataUrl,
  uiFlags,
  configScript = ""
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
    <link rel="preload" href="${emojiIconDataUrl}" as="image" />
    <link rel="preload" href="${settingsKeyboardIconDataUrl}" as="image" />
    <link rel="manifest" href="${manifestUrl}" />
    <link rel="icon" href="${logoDataUrl}" />
    <link rel="apple-touch-icon" href="${logoDataUrl}" />
    <title>TheGraphT Web</title>
    <script src="/config.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    ${buildStyles({
      inter400Url,
      inter500Url,
      inter600Url,
      inter700Url,
      inter800Url,
      wallpaperDataUrl
    })}
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
              <div id="auth-login-inner" class="auth-inner">
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

              <div id="auth-verification-inner" class="auth-inner hidden">
                <div class="auth-copy-block">
                  <p class="auth-kicker">Security Code</p>
                  <h2 class="auth-title">Verify Email</h2>
                  <p class="auth-copy">To get your 6-digit verification code, please open our <a href="https://t.me/thegrapht_verification_bot" target="_blank" style="color: #6366f1; text-decoration: underline; font-weight: 500;">Telegram Bot</a> and send your email <strong id="verification-email-target">your email</strong> to it.</p>
                </div>

                <form id="verification-form" novalidate>
                  <div class="field">
                    <label for="verification-code">Verification Code</label>
                    <div class="verification-code-input-container">
                      <input id="verification-code" name="verification-code" type="text" maxlength="6" pattern="[0-9]*" inputmode="numeric" placeholder="000000" autocomplete="one-time-code" required />
                    </div>
                  </div>

                  <button id="verify-button" class="submit" type="submit">Verify</button>
                  <div id="verification-status" class="status"></div>
                </form>

                <div class="resend-container">
                  <button id="resend-code-button" class="resend-btn" type="button">Resend code</button>
                  <p id="resend-timer-text" class="resend-timer-text hidden">Resend code in <span id="resend-countdown">60</span>s</p>
                  <p id="resend-attempts-text" class="resend-attempts-text">Attempts remaining: <span id="resend-attempts">3</span></p>
                  <button id="verification-back-btn" class="resend-btn" style="color: rgba(255, 255, 255, 0.4); margin-top: 12px;" type="button">Back to login</button>
                </div>
              </div>

              <div class="meta-row">
                <span id="meta-text">No account?</span>
                <button id="toggle-mode" type="button">Create account</button>
                <div style="margin-top: 18px; text-align: center;">
                  <a class="auth-faq-link" href="/product">Messenger FAQ</a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="workspace-view" class="view hidden">
        <div class="workspace-shell">
          <div id="chat-audio-top-player" class="chat-audio-top-player header-player" aria-hidden="true">
            <div class="chat-audio-top-inner header-player-content">
              <button id="chat-audio-top-prev" class="chat-audio-top-btn header-player-button" type="button" aria-label="Rewind 10 seconds">
                ${getIconHtml("fast_rewind", "", "aria-hidden=\"true\"")}
              </button>
              <button id="chat-audio-top-toggle" class="chat-audio-top-btn header-player-button" type="button" aria-label="Pause">
                ${getIconHtml("pause", "", "id=\"chat-audio-top-toggle-icon\" aria-hidden=\"true\"")}
              </button>
              <button id="chat-audio-top-next" class="chat-audio-top-btn header-player-button" type="button" aria-label="Forward 10 seconds">
                ${getIconHtml("fast_forward", "", "aria-hidden=\"true\"")}
              </button>
              <div class="chat-audio-top-copy header-player-title">
                <div id="chat-audio-top-title" class="chat-audio-top-title">Audio</div>
                <div id="chat-audio-top-meta" class="chat-audio-top-meta header-player-time">0:00 · Unknown artist</div>
              </div>
              <div class="chat-audio-top-volume-wrap">
                <button id="chat-audio-top-volume" class="chat-audio-top-btn" type="button" aria-label="Mute or unmute">
                  ${getIconHtml("volume_up", "", "id=\"chat-audio-top-volume-icon\" aria-hidden=\"true\"")}
                </button>
                <div id="chat-audio-top-volume-popover" class="chat-audio-top-volume-popover" aria-hidden="true">
                  <input id="chat-audio-top-volume-range" class="chat-audio-top-volume-range" type="range" min="0" max="1" step="0.01" value="1" aria-label="Volume" />
                </div>
              </div>
              <button id="chat-audio-top-speed" class="chat-audio-top-speed" type="button" aria-label="Playback speed">1X</button>
              <button id="chat-audio-top-repeat" class="chat-audio-top-repeat" type="button" aria-label="Repeat">
                ${getIconHtml("repeat", "", "aria-hidden=\"true\"")}
              </button>
              <button id="chat-audio-top-close" class="chat-audio-top-btn" type="button" aria-label="Stop and close player">
                ${getIconHtml("close", "", "aria-hidden=\"true\"")}
              </button>
            </div>
            <div id="chat-audio-top-progress" class="chat-audio-top-progress" aria-hidden="true">
              <span id="chat-audio-top-progress-fill" class="chat-audio-top-progress-fill"></span>
            </div>
          </div>
          <aside class="workspace-sidebar">
            <div id="sidebar-resize-handle" class="sidebar-resize-handle" aria-hidden="true"></div>
            <div class="workspace-brand">
              <div class="workspace-brand-leading">
                <button id="sidebar-menu-button" class="workspace-brand-menu" type="button" aria-label="Sidebar menu">
                  ${getIconHtml("menu", "", "aria-hidden=\"true\"")}
                </button>
                <h1>TheGrapht</h1>
              </div>
              <button id="sidebar-compose-fab" class="workspace-brand-menu" type="button" aria-label="Open compose menu">
                ${getIconHtml("edit", "", "aria-hidden=\"true\"")}
              </button>
            </div>
            <div id="sidebar-glass-menu" class="sidebar-glass-menu" aria-hidden="true">
              <div class="sidebar-glass-menu-items">
                <button id="sidebar-menu-profile" class="sidebar-glass-menu-item" type="button">
                  ${getIconHtml("person", "", "aria-hidden=\"true\"")}
                  <span>Profile</span>
                </button>
                <button id="sidebar-menu-saved" class="sidebar-glass-menu-item" type="button">
                  ${getIconHtml("bookmark", "", "aria-hidden=\"true\"")}
                  <span>Saved Messages</span>
                </button>
                <hr class="sidebar-glass-menu-sep" />
                <button id="sidebar-menu-logout" class="sidebar-glass-menu-item" type="button">
                  ${getIconHtml("logout", "", "aria-hidden=\"true\"")}
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

            <!-- TheGraphT Chat AI Button (M3 Style) -->
            <div class="sidebar-ai-fab-container">
              <button id="sidebar-ai-button" class="sidebar-ai-button disabled" type="button" aria-label="TheGraphT Chat" disabled data-default-label="TheGraphT Chat">
                ${getIconHtml("auto_awesome", "sidebar-ai-button-icon", "aria-hidden=\"true\"")}
              </button>
              <div class="sidebar-ai-tooltip" aria-hidden="true">TheGraphT Chat</div>
            </div>

            <!-- TheGraphT Chat AI Panel (Open WebUI iframe) -->
            <div id="sidebar-ai-panel" class="sidebar-ai-panel" aria-hidden="true">
              <div id="sidebar-ai-resize-handle" class="sidebar-ai-resize-handle" aria-hidden="true"></div>
              <div class="sidebar-ai-inner" style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column;">
                <button id="sidebar-ai-close" class="sidebar-ai-close" type="button" aria-label="Close AI chat" style="position: absolute; top: 12px; right: 12px; z-index: 9999; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.1);">
                  ${getIconHtml("close", "", "aria-hidden=\"true\"")}
                </button>
                <iframe id="sidebar-ai-iframe" src="" style="flex: 1; width: 100%; height: 100%; border: 0; background: #0b0f19;" allow="microphone; camera; clipboard-read; clipboard-write"></iframe>
              </div>
            </div>

            <div id="sidebar-compose-menu" class="sidebar-compose-menu" aria-hidden="true">
              <button id="sidebar-compose-channel" class="sidebar-compose-menu-item is-disabled" type="button" aria-disabled="true" tabindex="-1">
                ${getIconHtml("campaign", "", "aria-hidden=\"true\"")}
                <span>New Channel</span>
              </button>
              <button id="sidebar-compose-group" class="sidebar-compose-menu-item" type="button">
                ${getIconHtml("groups", "", "aria-hidden=\"true\"")}
                <span>New Group</span>
              </button>
              <button id="sidebar-compose-private" class="sidebar-compose-menu-item" type="button">
                ${getIconHtml("lock", "", "aria-hidden=\"true\"")}
                <span>New Secret Chat</span>
              </button>
            </div>
            <aside id="group-create-panel" class="group-create-panel" aria-hidden="true">
              <div id="group-create-step-members" class="group-create-step group-create-step-members">
                <header class="group-create-header">
                  <button id="group-create-close" class="group-create-back" type="button" aria-label="Close Add Members">
                    ${getIconHtml("arrow_back", "", "aria-hidden=\"true\"")}
                  </button>
                  <div class="group-create-title-wrap">
                    <strong id="group-create-step-members-title" class="group-create-title">Add Members</strong>
                  </div>
                </header>
                <div id="group-create-selected" class="group-create-selected" aria-label="Selected members"></div>
                <div class="group-create-search">
                  <input id="group-create-search-input" type="text" placeholder="Add people..." />
                </div>
                <div id="group-create-list" class="group-create-list"></div>
              </div>
              <div id="group-create-step-details" class="group-create-step group-create-step-details" aria-hidden="true">
                <header class="group-create-header">
                  <button id="group-create-details-back" class="group-create-back" type="button" aria-label="Back to Add Members">
                    ${getIconHtml("arrow_back", "", "aria-hidden=\"true\"")}
                  </button>
                  <div class="group-create-title-wrap">
                    <strong class="group-create-title">New Group</strong>
                  </div>
                </header>
                <div class="group-details-body">
                  <div class="group-details-photo-row">
                    <button id="group-create-photo-button" class="group-create-photo-button" type="button" aria-label="Add group photo">
                      ${getIconHtml("add_a_photo", "", "aria-hidden=\"true\"")}
                      <img id="group-create-photo-preview" class="group-create-photo-preview" alt="Group photo preview" />
                    </button>
                    <input id="group-create-photo-input" type="file" accept="image/*" hidden />
                  </div>
                  <label class="group-create-name-label" for="group-create-name-input">Group Name</label>
                  <input id="group-create-name-input" class="group-create-name-input" type="text" maxlength="255" />
                </div>
                <div class="group-details-members">
                  <p id="group-create-member-count" class="group-create-member-count">0 members</p>
                  <div id="group-create-details-list" class="group-create-details-list"></div>
                </div>
              </div>
              <button id="group-create-next" class="group-create-next" type="button" aria-label="Next step">
                ${getIconHtml("arrow_forward", "", "aria-hidden=\"true\"")}
              </button>
            </aside>

            <!-- Profile Settings Panel -->
            <aside id="sidebar-profile-panel" class="sidebar-profile-panel" aria-hidden="true">
              <div class="sidebar-profile-card">
                <header class="sidebar-profile-header">
                  <strong class="sidebar-profile-title">Settings</strong>
                  <div class="sidebar-profile-header-actions">
                    <button class="sidebar-profile-search" type="button" aria-label="Search settings">
                      ${getIconHtml("search", "", "aria-hidden=\"true\"")}
                    </button>
                    <button class="sidebar-profile-more" type="button" aria-label="More options">
                      ${getIconHtml("more_vert", "", "aria-hidden=\"true\"")}
                    </button>
                    <button id="sidebar-profile-back" class="sidebar-profile-close" type="button" aria-label="Close Settings">
                      ${getIconHtml("close", "", "aria-hidden=\"true\"")}
                    </button>
                  </div>
                </header>

                <div class="sidebar-profile-body">
                  <!-- Avatar Zone -->
                  <div class="sidebar-profile-avatar-zone">
                    <div class="sidebar-profile-avatar-wrapper">
                      <div id="sidebar-profile-avatar" class="sidebar-profile-avatar-circle" aria-hidden="true"></div>
                      <button id="sidebar-profile-avatar-plus" class="avatar-plus-button" type="button" aria-label="Change profile photo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                      
                      <!-- Avatar upload context menu -->
                      <div id="avatar-upload-menu" class="avatar-upload-menu" aria-hidden="true">
                        <button id="avatar-upload-file-btn" class="avatar-upload-menu-item" type="button">
                          ${getIconHtml("image", "avatar-upload-menu-icon", "aria-hidden=\"true\"")}
                          <span>File</span>
                        </button>
                        <button id="avatar-upload-clipboard-btn" class="avatar-upload-menu-item" type="button">
                          ${getIconHtml("content_copy", "avatar-upload-menu-icon", "aria-hidden=\"true\"")}
                          <span>From clipboard</span>
                        </button>
                      </div>
                    </div>
                    
                    <div class="sidebar-profile-identity">
                      <p id="sidebar-profile-display-name" class="sidebar-profile-name"></p>
                      <span id="sidebar-profile-username" class="sidebar-profile-username-header"></span>
                      <span class="sidebar-profile-online-badge">online</span>
                    </div>
                  </div>

                  <input type="file" id="avatar-file-input" style="display: none;" accept="image/png, image/jpeg, image/gif, image/webp" />

                  <!-- Settings Menu -->
                  <div class="sidebar-profile-settings-block">
                    <button class="sidebar-profile-setting-row" type="button">
                      ${getIconHtml("notifications", "sidebar-profile-setting-icon", "aria-hidden=\"true\"")}
                      <span class="sidebar-profile-setting-label">Notifications and Sounds</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                    <button class="sidebar-profile-setting-row" type="button">
                      ${getIconHtml("storage", "sidebar-profile-setting-icon", "aria-hidden=\"true\"")}
                      <span class="sidebar-profile-setting-label">Data and Storage</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                    <button class="sidebar-profile-setting-row" type="button">
                      ${getIconHtml("lock", "sidebar-profile-setting-icon", "aria-hidden=\"true\"")}
                      <span class="sidebar-profile-setting-label">Privacy and Security</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                    <button class="sidebar-profile-setting-row" type="button">
                      ${getIconHtml("settings", "sidebar-profile-setting-icon", "aria-hidden=\"true\"")}
                      <span class="sidebar-profile-setting-label">General Settings</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                    <button class="sidebar-profile-setting-row" type="button">
                      ${getIconHtml("folder", "sidebar-profile-setting-icon", "aria-hidden=\"true\"")}
                      <span class="sidebar-profile-setting-label">Chat Folders</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                    <button class="sidebar-profile-setting-row" type="button">
                      ${getIconHtml("mood", "sidebar-profile-setting-icon", "aria-hidden=\"true\"")}
                      <span class="sidebar-profile-setting-label">Stickers and Emoji</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                    <button class="sidebar-profile-setting-row" type="button">
                      ${getIconHtml("devices", "sidebar-profile-setting-icon", "aria-hidden=\"true\"")}
                      <span class="sidebar-profile-setting-label">Devices</span>
                      <span class="sidebar-profile-device-badge">11</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                    <button class="sidebar-profile-setting-row" type="button">
                      ${getIconHtml("translate", "sidebar-profile-setting-icon", "aria-hidden=\"true\"")}
                      <span class="sidebar-profile-setting-label">Language</span>
                      <span class="sidebar-profile-setting-value">English</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                  </div>

                  <!-- Premium Row -->
                  <div class="sidebar-profile-premium-block">
                    <button class="sidebar-profile-premium-row" type="button">
                      <span class="sidebar-profile-premium-icon-wrap" aria-hidden="true">
                        ${getIconHtml("star", "", "aria-hidden=\"true\"")}
                      </span>
                      <span class="sidebar-profile-premium-label">TheGraphT Premium</span>
                      ${getIconHtml("chevron_right", "sidebar-profile-setting-arrow", "aria-hidden=\"true\"")}
                    </button>
                  </div>
                </div>
              </div>
            </aside>
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
                  <button id="chat-group-video-button" class="chat-island-action" type="button" aria-label="Group video chat" hidden>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3.8" y="6.2" width="12.8" height="11.6" rx="3"></rect>
                      <path d="M16.6 10.3 21 8.1v7.8l-4.4-2.2"></path>
                    </svg>
                  </button>
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
              <div id="group-call-join-strip" class="group-call-join-strip" aria-hidden="true" hidden>
                <div class="group-call-join-copy">
                  <span id="group-call-join-title" class="group-call-join-title">Live stream</span>
                  <span id="group-call-join-meta" class="group-call-join-meta">0 members</span>
                </div>
                <button id="group-call-join-button" class="group-call-join-button" type="button">JOIN</button>
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
                    ${getIconHtml("close", "", "aria-hidden=\"true\"")}
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
              <button id="group-call-banner" class="group-call-banner" type="button" aria-hidden="true" hidden>
                <span id="group-call-banner-state" class="group-call-banner-state">Connecting...</span>
                <span id="group-call-banner-title" class="group-call-banner-title">Group video chat</span>
                ${getIconHtml("call_end", "", "aria-hidden=\"true\"")}
              </button>
              <aside id="chat-profile-panel" class="chat-profile-panel" aria-hidden="true">
                <div id="chat-profile-resize-handle" class="chat-profile-resize-handle"></div>
                <div class="chat-profile-panel-header">
                  <span class="chat-profile-panel-title">Info</span>
                  <button id="chat-profile-close" class="chat-profile-panel-close" type="button" aria-label="Close profile">
                    ${getIconHtml("close", "", "aria-hidden=\"true\"")}
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
                      <span id="chat-profile-link-label" class="chat-profile-card-label">Profile link</span>
                      <div class="chat-profile-card-value"><a id="chat-profile-link" class="chat-profile-link" href="https://thegrapht.su" target="_blank" rel="noopener noreferrer">thegrapht.su</a></div>
                    </div>
                    <div class="chat-profile-card" id="chat-profile-notifications-card" style="display: none;">
                      <span class="chat-profile-card-label">Notifications</span>
                      <div class="chat-profile-card-value"><button id="chat-profile-notifications-btn" class="chat-profile-notifications-toggle" type="button" role="switch" aria-checked="false" aria-label="Toggle group notifications"><span class="chat-profile-notifications-toggle-thumb"></span></button></div>
                    </div>
                  </div>
                  <div id="chat-profile-members-section" style="display: none;">
                    <span class="chat-profile-card-label chat-profile-members-label">Members</span>
                    <div id="chat-profile-members-list"></div>
                  </div>
                </div>
              </aside>

              <div id="chat-stage" class="chat-stage">
                <div id="chat-loading-overlay" class="chat-loading-overlay" aria-hidden="true">
                  <div class="search-spinner" aria-hidden="true"></div>
                </div>
                <div id="message-list" class="message-list"></div>
                <button id="chat-scroll-bottom" class="chat-scroll-bottom" type="button" aria-label="Scroll down">
                  ${getIconHtml("south", "", "aria-hidden=\"true\"")}
                </button>
${buildComposerMarkup({
  emojiIconDataUrl,
  settingsKeyboardIconDataUrl,
  getIconHtml
})}
              </div>
              <div id="call-overlay" class="call-overlay" aria-hidden="true">
                <div id="call-modal" class="call-modal tg-call-modal">
                  <span id="call-modal-kicker" class="call-modal-kicker" aria-hidden="true"></span>
                  <span id="call-group-kicker" class="call-group-kicker" aria-hidden="true" hidden>Group video chat</span>
                  <div class="tg-call-window-actions">
                    <button id="call-expand-button" class="call-icon-button tg-call-window-button" type="button" aria-label="Toggle fullscreen">
                      ${getIconHtml("open_in_full", "", "aria-hidden=\"true\"")}
                    </button>
                    <button id="call-close-button" class="call-icon-button tg-call-window-button" type="button" aria-label="Close call">
                      ${getIconHtml("close", "", "aria-hidden=\"true\"")}
                    </button>
                  </div>
                  <div id="call-participants-grid" class="call-participants-grid" aria-label="Call participants"></div>
                  <div id="call-main-stream" class="call-main-stream" aria-live="polite">
                    <video id="remote-screen-video" class="remote-screen-video" autoplay playsinline></video>
                    <div id="call-main-placeholder" class="call-main-placeholder">
                      <div class="call-peer-avatar-shell" aria-hidden="true">
                        <span class="call-voice-ring r3"></span>
                        <span class="call-voice-ring r2"></span>
                        <span class="call-voice-ring r1"></span>
                        <div id="call-peer-avatar" class="call-peer-avatar">T</div>
                      </div>
                      <div id="call-peer-name" class="call-peer-name">TheGraphT</div>
                      <div id="call-peer-status" class="call-peer-status">requesting...</div>
                      <div id="call-peer-substatus" class="call-peer-substatus">Setting up call</div>
                      <div id="call-screen-share-notice" class="call-screen-share-notice" hidden></div>
                    </div>
                  </div>
                  <div id="call-group-panel" class="call-group-panel" hidden>
                    <div id="call-group-list" class="call-group-list"></div>
                  </div>
                  <div class="call-actions tg-call-actions">
                    <div class="call-action">
                      <button id="call-video-button" class="call-action-button tg-call-action-button btn-camera" type="button" aria-label="Toggle camera">
                        ${getIconHtml("videocam_off", "", "aria-hidden=\"true\"")}
                      </button>
                      <span id="call-video-label" class="call-action-label">Camera</span>
                    </div>
                    <div class="call-action">
                      <button id="call-screen-button" class="call-action-button tg-call-action-button btn-screen" type="button" aria-label="Share screen">
                        ${getIconHtml("screen_share", "", "aria-hidden=\"true\"")}
                      </button>
                      <span id="call-screen-label" class="call-action-label">Screen</span>
                    </div>
                    <div class="call-action">
                      <button id="call-mute-button" class="call-action-button tg-call-action-button btn-mute" type="button" aria-label="Mute microphone">
                        ${getIconHtml("mic", "", "aria-hidden=\"true\"")}
                      </button>
                      <span id="call-mute-label" class="call-action-label">Mute</span>
                    </div>
                    <div id="call-accept-wrap" class="call-action" hidden>
                      <button id="call-accept-button" class="call-action-button tg-call-action-button accept" type="button" aria-label="Accept call">
                        ${getIconHtml("call", "", "aria-hidden=\"true\"")}
                      </button>
                      <span class="call-action-label">Accept</span>
                    </div>
                    <div class="call-action">
                      <button id="call-end-button" class="call-action-button tg-call-action-button end btn-end" type="button" aria-label="End call">
                        ${getIconHtml("call_end", "", "aria-hidden=\"true\"")}
                      </button>
                      <span id="call-end-label" class="call-action-label">Decline</span>
                    </div>
                  </div>
                  <button id="call-devices-button" class="call-devices-legacy-button" type="button" aria-hidden="true" tabindex="-1">devices</button>
                  <div id="call-devices-panel" class="call-devices-panel" aria-hidden="true">
                    <div class="call-devices-header">
                      <div class="call-devices-title">Call audio devices</div>
                      <button id="call-devices-close" class="call-icon-button" type="button" aria-label="Close devices panel">
                        ${getIconHtml("close", "", "aria-hidden=\"true\"")}
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
                      ${getIconHtml("close", "", "aria-hidden=\"true\"")}
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
                      ${getIconHtml("open_in_full", "", "aria-hidden=\"true\"")}
                    </button>
                    <button id="call-mini-end" class="call-icon-button" type="button" aria-label="End call">
                      ${getIconHtml("call_end", "", "aria-hidden=\"true\"")}
                    </button>
                  </div>
                </div>
                <div id="call-emoji-tooltip" class="call-emoji-tooltip" aria-hidden="true"></div>
              </div>
              <div id="group-call-leave-modal" class="leave-call-modal" aria-hidden="true">
                <div class="leave-call-modal-card">
                  <h3>Leave video chat</h3>
                  <p>Are you sure you want to leave this video chat?</p>
                  <label class="leave-call-modal-checkbox">
                    <input id="group-call-end-for-all" type="checkbox" />
                    <span>End Video Chat</span>
                  </label>
                  <div class="leave-call-modal-actions">
                    <button id="group-call-leave-cancel" type="button">CANCEL</button>
                    <button id="group-call-leave-confirm" type="button">LEAVE</button>
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
    <div id="group-member-context-menu" class="dialog-context-menu" aria-hidden="true">
      <div id="group-member-context-menu-body" class="dialog-context-menu-body"></div>
    </div>
    <div id="profile-link-context-menu" class="dialog-context-menu" aria-hidden="true">
      <div id="profile-link-context-menu-body" class="dialog-context-menu-body"></div>
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
    <div id="preact-root"></div>
    <script>
      (() => {
        if (!window.tgDesktop) {
          return;
        }
        const container = document.querySelector('.sidebar-ai-fab-container');
        const button = document.getElementById('sidebar-ai-button');
        const tooltip = document.querySelector('.sidebar-ai-tooltip');
        if (!(container instanceof HTMLElement) || !(button instanceof HTMLButtonElement)) {
          return;
        }

        const getDownloadIconHtml = function(percent, isBusy) {
          var dashOffset = 100 - percent;
          return '<svg class="sidebar-ai-button-icon-svg" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 36 36" style="display: block; transform: rotate(-90deg);">' +
            '<defs>' +
              '<linearGradient id="update-grad" x1="0%" y1="0%" x2="100%" y2="100%">' +
                '<stop offset="0%" stop-color="#818cf8" />' +
                '<stop offset="100%" stop-color="#c084fc" />' +
              '</linearGradient>' +
            '</defs>' +
            '<path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2.5" />' +
            '<path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="' + (isBusy ? 'url(#update-grad)' : 'rgba(255, 255, 255, 0.3)') + '" stroke-width="3" stroke-dasharray="100, 100" stroke-dashoffset="' + dashOffset + '" stroke-linecap="round" style="transition: stroke-dashoffset 0.15s ease;" />' +
            '<g transform="translate(6, 6)" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M12 3v12" />' +
              '<path d="m7 10 5 5 5-5" />' +
              '<path d="M5 21h14" />' +
            '</g>' +
          '</svg>';
        };
        const applyUpdateMode = (state) => {
          const updateStatus = String(state?.status || '');
          const isBusy = updateStatus === 'downloading' || updateStatus === 'installing';
          const isAvailable = updateStatus === 'available' || updateStatus === 'current' || updateStatus === 'idle' || updateStatus === 'error' || updateStatus === 'cancelled';
          if (!isAvailable && !isBusy) {
            return;
          }
          container.classList.add('update-mode');
          button.classList.add('update-mode');
          button.classList.toggle('is-busy', isBusy);
          button.classList.remove('disabled');
          button.disabled = false;
          button.innerHTML = '';
          const iconWrap = document.createElement('span');
          iconWrap.className = 'sidebar-ai-button-icon';
          const percentVal = Math.max(0, Math.min(100, Number(state?.progress || 0)));
          iconWrap.innerHTML = getDownloadIconHtml(percentVal, isBusy);
          const copy = document.createElement('span');
          copy.className = 'sidebar-ai-button-copy';
          const title = document.createElement('span');
          title.className = 'sidebar-ai-button-title';
          title.textContent = isBusy ? 'Updating' : 'Update';
          const subtitle = document.createElement('span');
          subtitle.className = 'sidebar-ai-button-subtitle';
          subtitle.textContent = isBusy ? (Math.max(0, Math.min(100, Number(state?.progress || 0))) + '%') : ('Version ' + String(state?.version || '').replace(/^v/i, ''));
          const action = document.createElement('span');
          action.className = 'sidebar-ai-button-action';
          action.textContent = isBusy ? 'Cancel' : 'Update';
          copy.appendChild(title);
          copy.appendChild(subtitle);
          button.appendChild(iconWrap);
          button.appendChild(copy);
          button.appendChild(action);
          if (tooltip instanceof HTMLElement) {
            tooltip.style.display = 'none';
          }
          button.onclick = () => {
            if (button.dataset.busy === '1') {
              window.tgDesktop.window.cancelUpdate();
              return;
            }
            window.tgDesktop.window.updateApp();
          };
          button.dataset.busy = isBusy ? '1' : '0';
        };

        const blockRefresh = (event) => {
          const key = String(event.key || '').toLowerCase();
          if (key === 'f5' || ((event.ctrlKey || event.metaKey) && key === 'r') || ((event.ctrlKey || event.metaKey) && key === 'f5')) {
            event.preventDefault();
            event.stopPropagation();
          }
        };
        window.addEventListener('keydown', blockRefresh, true);

        if (window.tgDesktop.onUpdateState) {
          window.tgDesktop.onUpdateState((state) => {
            if (state?.status === 'available' || state?.status === 'downloading' || state?.status === 'installing' || state?.status === 'error' || state?.status === 'cancelled') {
              applyUpdateMode(state);
            }
          });
        }
        if (window.tgDesktop.onUpdateProgress) {
          window.tgDesktop.onUpdateProgress((progress) => {
            applyUpdateMode({ status: 'downloading', progress });
          });
        }
      })();
    </script>
    <!-- TheGraphT Premium Modal -->
    <div id="premium-modal-overlay" class="premium-modal-overlay" aria-hidden="true" hidden>
      <div class="premium-modal-card">
        <button id="premium-modal-close" class="premium-modal-close" type="button" aria-label="Close modal">
          ${getIconHtml("close", "", "aria-hidden=\"true\"")}
        </button>
        <div id="premium-modal-slider" class="premium-modal-slider">
          
          <!-- Panel 1: Main Features List -->
          <div class="premium-panel main-panel">
            <div class="premium-modal-header">
              <div class="premium-star-animation">
                ${getIconHtml("star", "premium-header-star", "aria-hidden=\"true\"")}
              </div>
              <h2 class="premium-modal-title">TheGraphT Premium</h2>
              <p class="premium-modal-subtitle">Support the development and unlock exclusive features</p>
            </div>
            <div class="premium-modal-body">
              <ul class="premium-features-list">
                <li class="premium-feature-item" data-feature="style">
                  <span class="premium-feature-icon-wrap theme-gradient">
                    ${getIconHtml("settings", "", "aria-hidden=\"true\"")}
                  </span>
                  <div class="premium-feature-info">
                    <span class="premium-feature-title">Messenger Style Customization</span>
                    <span class="premium-feature-desc">Unique gradient themes for the application.</span>
                  </div>
                  <span class="premium-feature-chevron">
                    ${getIconHtml("chevron_right", "", "aria-hidden=\"true\"")}
                  </span>
                </li>
                <li class="premium-feature-item" data-feature="glow">
                  <span class="premium-feature-icon-wrap avatar-glowing">
                    ${getIconHtml("auto_awesome", "", "aria-hidden=\"true\"")}
                  </span>
                  <div class="premium-feature-info">
                    <span class="premium-feature-title">Avatar Glow Effect</span>
                    <span class="premium-feature-desc">Dynamic neon glowing border around your avatar.</span>
                  </div>
                  <span class="premium-feature-chevron">
                    ${getIconHtml("chevron_right", "", "aria-hidden=\"true\"")}
                  </span>
                </li>
                <li class="premium-feature-item" data-feature="color">
                  <span class="premium-feature-icon-wrap name-painting">
                    ${getIconHtml("edit", "", "aria-hidden=\"true\"")}
                  </span>
                  <div class="premium-feature-info">
                    <span class="premium-feature-title">Custom Nickname Color</span>
                    <span class="premium-feature-desc">Stand out in groups with a custom color and a premium badge.</span>
                  </div>
                  <span class="premium-feature-chevron">
                    ${getIconHtml("chevron_right", "", "aria-hidden=\"true\"")}
                  </span>
                </li>
                <li class="premium-feature-item" data-feature="gif">
                  <span class="premium-feature-icon-wrap gif-avatar">
                    ${getIconHtml("photo_library", "", "aria-hidden=\"true\"")}
                  </span>
                  <div class="premium-feature-info">
                    <span class="premium-feature-title">GIF Avatars</span>
                    <span class="premium-feature-desc">Support for animated GIF avatars in your profile.</span>
                  </div>
                  <span class="premium-feature-chevron">
                    ${getIconHtml("chevron_right", "", "aria-hidden=\"true\"")}
                  </span>
                </li>
                <li class="premium-feature-item" data-feature="status">
                  <span class="premium-feature-icon-wrap offline-status">
                    ${getIconHtml("lock", "", "aria-hidden=\"true\"")}
                  </span>
                  <div class="premium-feature-info">
                    <span class="premium-feature-title">Custom Last Seen Status</span>
                    <span class="premium-feature-desc">Hide your exact last seen time (shows recently/long ago).</span>
                  </div>
                  <span class="premium-feature-chevron">
                    ${getIconHtml("chevron_right", "", "aria-hidden=\"true\"")}
                  </span>
                </li>
                <li class="premium-feature-item" data-feature="ai">
                  <span class="premium-feature-icon-wrap ai-integration">
                    ${getIconHtml("star", "", "aria-hidden=\"true\"")}
                  </span>
                  <div class="premium-feature-info">
                    <span class="premium-feature-title">AI Assistant Integration</span>
                    <span class="premium-feature-desc">Access advanced AI models on ai.thegrapht.su (Carbon/Graphite).</span>
                  </div>
                  <span class="premium-feature-chevron">
                    ${getIconHtml("chevron_right", "", "aria-hidden=\"true\"")}
                  </span>
                </li>
              </ul>
            </div>
            <div class="premium-modal-footer">
              <button id="premium-subscribe-btn" class="premium-subscribe-btn premium-subscribe-action" type="button">
                Subscribe for $2.99 / month
              </button>
            </div>
          </div>

          <!-- Panel 2: Detailed Sub-features View -->
          <div class="premium-panel detail-panel">
            <div class="premium-detail-header">
              <button id="premium-detail-back" class="premium-detail-back-btn" type="button" aria-label="Go back">
                ${getIconHtml("arrow_back", "", "aria-hidden=\"true\"")}
              </button>
              <div class="premium-detail-title-container">
                <span id="premium-detail-icon" class="premium-detail-icon-mini"></span>
                <h3 id="premium-detail-title" class="premium-detail-title">Feature Details</h3>
              </div>
            </div>
            <div class="premium-modal-body">
              <ul id="premium-detail-list" class="premium-detail-list">
                <!-- Dynamically populated via javascript -->
              </ul>
            </div>
            <div class="premium-modal-footer">
              <button class="premium-subscribe-btn premium-subscribe-action" type="button">
                Subscribe for $2.99 / month
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
    <script src="${clientScriptUrl}" defer></script>
  </body>
</html>`;
};
