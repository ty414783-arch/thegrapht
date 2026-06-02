import { buildComposerMarkup } from "./components/composer.js";
import { buildStyles } from "./components/styles.js";

export const buildHtml = ({
  clientScriptUrl,
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  lucideUrl,
  lucideCss,
  manifestUrl,
  logoDataUrl,
  wallpaperDataUrl,
  emojiIconDataUrl,
  settingsKeyboardIconDataUrl,
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
    <link rel="preload" href="${lucideUrl}" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="${emojiIconDataUrl}" as="image" />
    <link rel="preload" href="${settingsKeyboardIconDataUrl}" as="image" />
    <link rel="manifest" href="${manifestUrl}" />
    <link rel="icon" href="${logoDataUrl}" />
    <link rel="apple-touch-icon" href="${logoDataUrl}" />
    <title>TheGraphT Web</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script>
      (function() {
        const iconMap = {
          'menu': 'icon-menu',
          'edit': 'icon-edit-2',
          'edit-2': 'icon-edit-2',
          'person': 'icon-user',
          'bookmark': 'icon-bookmark',
          'logout': 'icon-log-out',
          'auto_awesome': 'icon-sparkles',
          'keyboard_arrow_down': 'icon-chevron-down',
          'close': 'icon-x',
          'mode_fan': 'icon-wind',
          'check': 'icon-check',
          'lock': 'icon-lock',
          'arrow_upward': 'icon-arrow-up',
          'campaign': 'icon-megaphone',
          'groups': 'icon-users',
          'arrow_back': 'icon-arrow-left',
          'add_a_photo': 'icon-camera',
          'arrow_forward': 'icon-arrow-right',
          'more_vert': 'icon-more-vertical',
          'alternate_email': 'icon-at-sign',
          'notifications': 'icon-bell',
          'chevron_right': 'icon-chevron-right',
          'storage': 'icon-database',
          'settings': 'icon-settings',
          'folder': 'icon-folder',
          'mood': 'icon-smile',
          'devices': 'icon-laptop',
          'translate': 'icon-languages',
          'star': 'icon-star',
          'call_end': 'icon-phone-off',
          'fast_rewind': 'icon-rewind',
          'pause': 'icon-pause',
          'play_arrow': 'icon-play',
          'fast_forward': 'icon-fast-forward',
          'volume_up': 'icon-volume-2',
          'volume_off': 'icon-volume-x',
          'mic': 'icon-mic',
          'mic_off': 'icon-mic-off',
          'screen_share': 'icon-monitor-up',
          'open_in_new': 'icon-external-link',
          'reply': 'icon-corner-up-left',
          'download': 'icon-download',
          'delete': 'icon-trash-2',
          'error': 'icon-alert-triangle',
          'gif_box': 'icon-file-image',
          'autorenew': 'icon-refresh-cw',
          'search': 'icon-search',
          'send': 'icon-send',
          'volume_mute': 'icon-volume-x',
          'open_in_full': 'icon-expand',
          'close_fullscreen': 'icon-shrink',
          'south': 'icon-arrow-down',
          'volume_down': 'icon-volume-1',
          'videocam_off': 'icon-video-off',
          'videocam': 'icon-video',
          'call': 'icon-phone',
          'stop_screen_share': 'icon-monitor-off',
          'repeat': 'icon-repeat'
        };

        const processIconElement = (el) => {
          const text = el.textContent.trim();
          if (text && iconMap[text]) {
            for (const cls of Array.from(el.classList)) {
              if (cls.startsWith('icon-')) {
                el.classList.remove(cls);
              }
            }
            el.classList.add(iconMap[text]);
            el.textContent = '';
          }
        };

        const init = () => {
          document.querySelectorAll('.lucide, .lucide').forEach(processIconElement);
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', init);
        } else {
          init();
        }

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  if (node.classList.contains('lucide') || node.classList.contains('lucide')) {
                    processIconElement(node);
                  }
                  node.querySelectorAll('.lucide, .lucide').forEach(processIconElement);
                }
              });
            } else if (mutation.type === 'characterData') {
              const parent = mutation.target.parentElement;
              if (parent && (parent.classList.contains('lucide') || parent.classList.contains('lucide'))) {
                processIconElement(parent);
              }
            }
          }
        });

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          characterData: true
        });
      })();
    </script>
    ${buildStyles({
      inter400Url,
      inter500Url,
      inter600Url,
      inter700Url,
      inter800Url,
      lucideUrl,
      lucideCss,
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
          <aside class="workspace-sidebar">
            <div id="sidebar-resize-handle" class="sidebar-resize-handle" aria-hidden="true"></div>
            <div class="workspace-brand">
              <div class="workspace-brand-leading">
                <button id="sidebar-menu-button" class="workspace-brand-menu" type="button" aria-label="Sidebar menu">
                  <span class="lucide" aria-hidden="true">menu</span>
                </button>
                <h1>TheGrapht</h1>
              </div>
              <button id="sidebar-compose-fab" class="workspace-brand-menu" type="button" aria-label="Open compose menu">
                <span class="lucide" aria-hidden="true">edit</span>
              </button>
            </div>
            <div id="sidebar-glass-menu" class="sidebar-glass-menu" aria-hidden="true">
              <div class="sidebar-glass-menu-items">
                <button id="sidebar-menu-profile" class="sidebar-glass-menu-item" type="button">
                  <span class="lucide" aria-hidden="true">person</span>
                  <span>Profile</span>
                </button>
                <button id="sidebar-menu-saved" class="sidebar-glass-menu-item" type="button">
                  <span class="lucide" aria-hidden="true">bookmark</span>
                  <span>Saved Messages</span>
                </button>
                <hr class="sidebar-glass-menu-sep" />
                <button id="sidebar-menu-logout" class="sidebar-glass-menu-item" type="button">
                  <span class="lucide" aria-hidden="true">logout</span>
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
              <button id="sidebar-ai-button" class="sidebar-ai-button" type="button" aria-label="TheGraphT Chat">
                <span class="lucide" aria-hidden="true">auto_awesome</span>
              </button>
              <div class="sidebar-ai-tooltip" aria-hidden="true">TheGraphT Chat</div>
            </div>

            <!-- TheGraphT Chat AI Panel -->
            <div id="sidebar-ai-panel" class="sidebar-ai-panel" aria-hidden="true">
              <header class="sidebar-ai-header" style="position: relative;">
                <div class="sidebar-ai-title-wrap" id="sidebar-ai-model-selector-btn" style="cursor: pointer; user-select: none;">
                  <span class="lucide sidebar-ai-header-stars" aria-hidden="true" id="sidebar-ai-selected-model-icon">auto_awesome</span>
                  <div class="sidebar-ai-header-copy" style="display: flex; align-items: center; gap: 4px;">
                    <strong class="sidebar-ai-title" id="sidebar-ai-selected-model-name">TheGraphT Chat (Base)</strong>
                    <span class="lucide" style="font-size: 18px; opacity: 0.7; transition: transform 0.2s ease;" id="sidebar-ai-selector-chevron">keyboard_arrow_down</span>
                  </div>
                </div>
                <button id="sidebar-ai-close" class="sidebar-ai-close" type="button" aria-label="Close AI chat">
                  <span class="lucide" aria-hidden="true">close</span>
                </button>
                
                <!-- Model Selector Dropdown Menu (Material M3 Glassmorphism Style) -->
                <div id="sidebar-ai-model-menu" class="sidebar-ai-model-menu" aria-hidden="true">
                  <div class="sidebar-ai-model-menu-item active" data-model="base">
                    <span class="lucide sidebar-ai-model-icon" aria-hidden="true">mode_fan</span>
                    <div class="sidebar-ai-model-info">
                      <div class="sidebar-ai-model-name">TheGraphT Chat (Base)</div>
                      <div class="sidebar-ai-model-desc">Отлично подходит для повседневных задач</div>
                    </div>
                    <span class="lucide sidebar-ai-model-check" aria-hidden="true" id="sidebar-ai-check-base">check</span>
                  </div>
                  <div class="sidebar-ai-model-menu-item" data-model="pro" style="opacity: 0.8;">
                    <span class="lucide sidebar-ai-model-icon pro" aria-hidden="true">auto_awesome</span>
                    <div class="sidebar-ai-model-info">
                      <div class="sidebar-ai-model-name" style="display: flex; align-items: center; gap: 6px;">
                        TheGraphT Chat Pro
                        <span class="lucide" style="font-size: 15px; color: #a5b4fc;">lock</span>
                      </div>
                      <div class="sidebar-ai-model-desc">Gemini Pro (доступно с 15 июня)</div>
                    </div>
                  </div>
                </div>
              </header>
              
              <div id="sidebar-ai-messages" class="sidebar-ai-messages">
                <div class="sidebar-ai-welcome">
                  <div class="sidebar-ai-welcome-stars">
                    <span class="lucide" aria-hidden="true">auto_awesome</span>
                  </div>
                  <h3>TheGraphT Chat</h3>
                  <p>Your personal AI assistant built into TheGraphT messenger. Ask me anything or let me analyze your conversations.</p>
                </div>
              </div>

              <!-- Quick Prompt suggestion Pills -->
              <div id="sidebar-ai-pills-wrap" class="sidebar-ai-pills-wrap">
                <div id="sidebar-ai-pills" class="sidebar-ai-pills">
                  <button class="sidebar-ai-pill" type="button" data-prompt="Summarize this chat for me">💬 Summarize chat</button>
                  <button class="sidebar-ai-pill" type="button" data-prompt="Help me write a reply to this conversation">✍️ Help me reply</button>
                  <button class="sidebar-ai-pill" type="button" data-prompt="What should I know about this conversation?">🔍 Analyze chat</button>
                  <button class="sidebar-ai-pill" type="button" data-prompt="Translate the last messages to English">🌐 Translate</button>
                </div>
              </div>

              <div class="sidebar-ai-footer">
                <div id="sidebar-ai-suggestions-wrap" class="sidebar-ai-suggestions-wrap hidden">
                  <div class="sidebar-ai-suggestions-title">ИИ предлагает варианты ответа:</div>
                  <div id="sidebar-ai-suggestions" class="sidebar-ai-suggestions"></div>
                </div>
                <div class="sidebar-ai-input-wrap">
                  <textarea id="sidebar-ai-input" rows="1" placeholder="Message TheGraphT Chat..." autocomplete="off"></textarea>
                  <button id="sidebar-ai-send" class="sidebar-ai-send" type="button" aria-label="Send">
                    <span class="lucide" aria-hidden="true">arrow_upward</span>
                  </button>
                </div>
              </div>
            </div>

            <div id="sidebar-compose-menu" class="sidebar-compose-menu" aria-hidden="true">
              <button id="sidebar-compose-channel" class="sidebar-compose-menu-item is-disabled" type="button" aria-disabled="true" tabindex="-1">
                <span class="lucide" aria-hidden="true">campaign</span>
                <span>New Channel</span>
              </button>
              <button id="sidebar-compose-group" class="sidebar-compose-menu-item" type="button">
                <span class="lucide" aria-hidden="true">groups</span>
                <span>New Group</span>
              </button>
              <button id="sidebar-compose-private" class="sidebar-compose-menu-item" type="button">
                <span class="lucide" aria-hidden="true">lock</span>
                <span>New Secret Chat</span>
              </button>
            </div>
            <aside id="group-create-panel" class="group-create-panel" aria-hidden="true">
              <div id="group-create-step-members" class="group-create-step group-create-step-members">
                <header class="group-create-header">
                  <button id="group-create-close" class="group-create-back" type="button" aria-label="Close Add Members">
                    <span class="lucide" aria-hidden="true">arrow_back</span>
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
                    <span class="lucide" aria-hidden="true">arrow_back</span>
                  </button>
                  <div class="group-create-title-wrap">
                    <strong class="group-create-title">New Group</strong>
                  </div>
                </header>
                <div class="group-details-body">
                  <div class="group-details-photo-row">
                    <button id="group-create-photo-button" class="group-create-photo-button" type="button" aria-label="Add group photo">
                      <span class="lucide" aria-hidden="true">add_a_photo</span>
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
                <span class="lucide" aria-hidden="true">arrow_forward</span>
              </button>
            </aside>

            <!-- Profile Settings Panel -->
            <aside id="sidebar-profile-panel" class="sidebar-profile-panel" aria-hidden="true">
              <header class="sidebar-profile-header">
                <button id="sidebar-profile-back" class="sidebar-profile-back" type="button" aria-label="Close Profile">
                  <span class="lucide" aria-hidden="true">arrow_back</span>
                </button>
                <strong class="sidebar-profile-title">Settings</strong>
                <button class="sidebar-profile-edit" type="button" aria-label="Edit profile">
                  <span class="lucide" aria-hidden="true">edit</span>
                </button>
                <button class="sidebar-profile-more" type="button" aria-label="More options">
                  <span class="lucide" aria-hidden="true">more_vert</span>
                </button>
              </header>

              <div class="sidebar-profile-body">
                <!-- Avatar Zone -->
                <div class="sidebar-profile-avatar-zone">
                  <div id="sidebar-profile-avatar" class="sidebar-profile-avatar-circle" aria-hidden="true"></div>
                  <div class="sidebar-profile-identity">
                    <p id="sidebar-profile-display-name" class="sidebar-profile-name"></p>
                    <span class="sidebar-profile-online-badge">online</span>
                  </div>
                </div>

                <!-- Info Block -->
                <div class="sidebar-profile-info-block">
                  <div class="sidebar-profile-info-row">
                    <span class="lucide sidebar-profile-info-icon" aria-hidden="true">alternate_email</span>
                    <div class="sidebar-profile-info-content">
                      <p id="sidebar-profile-username" class="sidebar-profile-info-value"></p>
                      <p class="sidebar-profile-info-label">Username</p>
                    </div>
                  </div>
                </div>

                <!-- Settings Menu -->
                <div class="sidebar-profile-settings-block">
                  <button class="sidebar-profile-setting-row" type="button">
                    <span class="lucide sidebar-profile-setting-icon" aria-hidden="true">notifications</span>
                    <span class="sidebar-profile-setting-label">Notifications and Sounds</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
                  <button class="sidebar-profile-setting-row" type="button">
                    <span class="lucide sidebar-profile-setting-icon" aria-hidden="true">storage</span>
                    <span class="sidebar-profile-setting-label">Data and Storage</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
                  <button class="sidebar-profile-setting-row" type="button">
                    <span class="lucide sidebar-profile-setting-icon" aria-hidden="true">lock</span>
                    <span class="sidebar-profile-setting-label">Privacy and Security</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
                  <button class="sidebar-profile-setting-row" type="button">
                    <span class="lucide sidebar-profile-setting-icon" aria-hidden="true">settings</span>
                    <span class="sidebar-profile-setting-label">General Settings</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
                  <button class="sidebar-profile-setting-row" type="button">
                    <span class="lucide sidebar-profile-setting-icon" aria-hidden="true">folder</span>
                    <span class="sidebar-profile-setting-label">Chat Folders</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
                  <button class="sidebar-profile-setting-row" type="button">
                    <span class="lucide sidebar-profile-setting-icon" aria-hidden="true">mood</span>
                    <span class="sidebar-profile-setting-label">Stickers and Emoji</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
                  <button class="sidebar-profile-setting-row" type="button">
                    <span class="lucide sidebar-profile-setting-icon" aria-hidden="true">devices</span>
                    <span class="sidebar-profile-setting-label">Devices</span>
                    <span class="sidebar-profile-device-badge">11</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
                  <button class="sidebar-profile-setting-row" type="button">
                    <span class="lucide sidebar-profile-setting-icon" aria-hidden="true">translate</span>
                    <span class="sidebar-profile-setting-label">Language</span>
                    <span class="sidebar-profile-setting-value">English</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
                </div>

                <!-- Premium Row -->
                <div class="sidebar-profile-premium-block">
                  <button class="sidebar-profile-premium-row" type="button">
                    <span class="sidebar-profile-premium-icon-wrap" aria-hidden="true">
                      <span class="lucide" aria-hidden="true">star</span>
                    </span>
                    <span class="sidebar-profile-premium-label">TheGraphT Premium</span>
                    <span class="lucide sidebar-profile-setting-arrow" aria-hidden="true">chevron_right</span>
                  </button>
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
                    <span class="lucide" aria-hidden="true">close</span>
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
                <span class="lucide" aria-hidden="true">call_end</span>
              </button>
              <div id="chat-audio-top-player" class="chat-audio-top-player header-player" aria-hidden="true">
                <div class="chat-audio-top-inner header-player-content">
                  <button id="chat-audio-top-prev" class="chat-audio-top-btn header-player-button" type="button" aria-label="Rewind 10 seconds">
                    <span class="lucide" aria-hidden="true">fast_rewind</span>
                  </button>
                  <button id="chat-audio-top-toggle" class="chat-audio-top-btn header-player-button" type="button" aria-label="Pause">
                    <span id="chat-audio-top-toggle-icon" class="lucide" aria-hidden="true">pause</span>
                  </button>
                  <button id="chat-audio-top-next" class="chat-audio-top-btn header-player-button" type="button" aria-label="Forward 10 seconds">
                    <span class="lucide" aria-hidden="true">fast_forward</span>
                  </button>
                  <div class="chat-audio-top-copy header-player-title">
                    <div id="chat-audio-top-title" class="chat-audio-top-title">Audio</div>
                    <div id="chat-audio-top-meta" class="chat-audio-top-meta header-player-time">0:00 · Unknown artist</div>
                  </div>
                  <div class="chat-audio-top-volume-wrap">
                    <button id="chat-audio-top-volume" class="chat-audio-top-btn" type="button" aria-label="Mute or unmute">
                      <span id="chat-audio-top-volume-icon" class="lucide" aria-hidden="true">volume_up</span>
                    </button>
                    <div id="chat-audio-top-volume-popover" class="chat-audio-top-volume-popover" aria-hidden="true">
                      <input id="chat-audio-top-volume-range" class="chat-audio-top-volume-range" type="range" min="0" max="1" step="0.01" value="1" aria-label="Volume" />
                    </div>
                  </div>
                  <button id="chat-audio-top-speed" class="chat-audio-top-speed" type="button" aria-label="Playback speed">1X</button>
                  <button id="chat-audio-top-repeat" class="chat-audio-top-repeat" type="button" aria-label="Repeat">
                    <span class="lucide" aria-hidden="true">repeat</span>
                  </button>
                  <button id="chat-audio-top-close" class="chat-audio-top-btn" type="button" aria-label="Stop and close player">
                    <span class="lucide" aria-hidden="true">close</span>
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
                    <span class="lucide" aria-hidden="true">close</span>
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
                  <span class="lucide" aria-hidden="true">south</span>
                </button>
${buildComposerMarkup({
  emojiIconDataUrl,
  settingsKeyboardIconDataUrl
})}
              </div>
              <div id="call-overlay" class="call-overlay" aria-hidden="true">
                <div id="call-modal" class="call-modal tg-call-modal">
                  <span id="call-modal-kicker" class="call-modal-kicker" aria-hidden="true"></span>
                  <span id="call-group-kicker" class="call-group-kicker" aria-hidden="true" hidden>Group video chat</span>
                  <div class="tg-call-window-actions">
                    <button id="call-expand-button" class="call-icon-button tg-call-window-button" type="button" aria-label="Toggle fullscreen">
                      <span class="lucide" aria-hidden="true">open_in_full</span>
                    </button>
                    <button id="call-close-button" class="call-icon-button tg-call-window-button" type="button" aria-label="Close call">
                      <span class="lucide" aria-hidden="true">close</span>
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
                        <span class="lucide" aria-hidden="true">videocam_off</span>
                      </button>
                      <span id="call-video-label" class="call-action-label">Camera</span>
                    </div>
                    <div class="call-action">
                      <button id="call-screen-button" class="call-action-button tg-call-action-button btn-screen" type="button" aria-label="Share screen">
                        <span class="lucide" aria-hidden="true">screen_share</span>
                      </button>
                      <span id="call-screen-label" class="call-action-label">Screen</span>
                    </div>
                    <div class="call-action">
                      <button id="call-mute-button" class="call-action-button tg-call-action-button btn-mute" type="button" aria-label="Mute microphone">
                        <span class="lucide" aria-hidden="true">mic</span>
                      </button>
                      <span id="call-mute-label" class="call-action-label">Mute</span>
                    </div>
                    <div id="call-accept-wrap" class="call-action" hidden>
                      <button id="call-accept-button" class="call-action-button tg-call-action-button accept" type="button" aria-label="Accept call">
                        <span class="lucide" aria-hidden="true">call</span>
                      </button>
                      <span class="call-action-label">Accept</span>
                    </div>
                    <div class="call-action">
                      <button id="call-end-button" class="call-action-button tg-call-action-button end btn-end" type="button" aria-label="End call">
                        <span class="lucide" aria-hidden="true">call_end</span>
                      </button>
                      <span id="call-end-label" class="call-action-label">Decline</span>
                    </div>
                  </div>
                  <button id="call-devices-button" class="call-devices-legacy-button" type="button" aria-hidden="true" tabindex="-1">devices</button>
                  <div id="call-devices-panel" class="call-devices-panel" aria-hidden="true">
                    <div class="call-devices-header">
                      <div class="call-devices-title">Call audio devices</div>
                      <button id="call-devices-close" class="call-icon-button" type="button" aria-label="Close devices panel">
                        <span class="lucide" aria-hidden="true">close</span>
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
                      <span class="lucide" aria-hidden="true">close</span>
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
                      <span class="lucide" aria-hidden="true">open_in_full</span>
                    </button>
                    <button id="call-mini-end" class="call-icon-button" type="button" aria-label="End call">
                      <span class="lucide" aria-hidden="true">call_end</span>
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
    <script src="${clientScriptUrl}" defer></script>
  </body>
</html>`;
};
