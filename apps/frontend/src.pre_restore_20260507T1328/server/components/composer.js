export const composerStyles = `
      .composer {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 10px;
        flex-shrink: 0;
        margin-top: auto;
        padding-top: 12px;
        position: relative;
        z-index: 6;
      }
      .composer::before {
        content: "";
        position: absolute;
        left: -18px;
        right: -18px;
        bottom: -14px;
        height: 0;
        pointer-events: none;
        z-index: 0;
        background: transparent;
      }
      .composer-stack {
        width: min(760px, calc(100% - 64px));
        padding: 0 8px 2px;
        display: grid;
        gap: 10px;
        position: relative;
        z-index: 1;
      }
      .emoji-picker {
        position: absolute;
        left: 0;
        bottom: calc(100% + 18px);
        width: min(460px, calc(100vw - 80px));
        max-height: min(430px, calc(100vh - 220px));
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px 14px 12px;
        border-radius: 28px;
        background: rgba(37, 40, 48, 0.97);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 26px 56px rgba(0,0,0,0.3);
        backdrop-filter: blur(22px);
        opacity: 0;
        transform: translateY(10px) scale(0.985);
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
        z-index: 16;
      }
      .emoji-picker.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .emoji-picker-head {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .emoji-picker-head::-webkit-scrollbar {
        display: none;
      }
      .emoji-picker-tab {
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: #c7cfdd;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        position: relative;
        transition: color 0.16s ease, transform 0.16s ease;
      }
      .emoji-picker-tab::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -4px;
        width: 16px;
        height: 3px;
        border-radius: 999px;
        background: linear-gradient(90deg, #7f8cff 0%, #5fa9ff 100%);
        transform: translateX(-50%) scaleX(0.35);
        opacity: 0;
        transition: opacity 0.16s ease, transform 0.16s ease;
      }
      .emoji-picker-tab-icon {
        width: 18px;
        height: 18px;
        display: block;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
        overflow: visible;
        flex-shrink: 0;
      }
      .emoji-picker-tab-icon * {
        vector-effect: non-scaling-stroke;
      }
      .emoji-picker-tab-icon.circle-stroke * {
        stroke: currentColor;
        fill: none;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .emoji-picker-tab-icon.solid-fill * {
        fill: currentColor;
      }
      .emoji-picker-tab:hover {
        color: #eef2fb;
      }
      .emoji-picker-tab.active {
        color: #eef2fb;
      }
      .emoji-picker-tab.active::after {
        opacity: 1;
        transform: translateX(-50%) scaleX(1);
      }
      .emoji-picker-tab:active {
        transform: scale(0.94);
      }
      .emoji-picker-body {
        overflow-y: auto;
        padding-right: 4px;
        min-height: 0;
      }
      .emoji-picker-body::-webkit-scrollbar {
        width: 8px;
      }
      .emoji-picker-body::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.14);
        border-radius: 999px;
      }
      .emoji-picker-section + .emoji-picker-section {
        margin-top: 12px;
      }
      .emoji-picker-title {
        margin: 0 0 10px;
        font-size: 13px;
        color: #aeb6c4;
      }
      .emoji-picker-grid {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 8px;
      }
      .emoji-button {
        width: 100%;
        aspect-ratio: 1;
        border: 0;
        border-radius: 16px;
        background: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s ease, transform 0.16s ease;
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
        font-size: 29px;
        line-height: 1;
      }
      .emoji-button-image {
        width: 30px;
        height: 30px;
        object-fit: contain;
        display: block;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
      }
      .emoji-button:hover {
        background: rgba(255,255,255,0.08);
      }
      .emoji-button:active {
        transform: scale(0.94);
      }
      .emoji-picker-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .emoji-picker-hint {
        font-size: 12px;
        color: #98a1b0;
      }
      .attach-menu {
        position: absolute;
        right: 8px;
        bottom: calc(100% + 18px);
        min-width: 196px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px;
        border-radius: 18px;
        background: rgba(29, 31, 37, 0.98);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 24px 50px rgba(0,0,0,0.28);
        backdrop-filter: blur(18px);
        opacity: 0;
        transform: translateY(10px) scale(0.985);
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
        z-index: 16;
      }
      .attach-menu.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .attach-menu-item {
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
        transition: background 0.16s ease, transform 0.12s ease, opacity 0.12s ease;
      }
      .attach-menu-item:hover {
        background: rgba(255,255,255,0.06);
      }
      .attach-menu-item:active {
        transform: scale(0.985);
      }
      .attach-menu-item.disabled {
        color: rgba(241,244,251,0.42);
        background: rgba(255,255,255,0.02);
        cursor: not-allowed;
        pointer-events: none;
      }
      .attach-menu-item.disabled:hover {
        background: rgba(255,255,255,0.02);
      }
      .attach-menu-item svg {
        width: 21px;
        height: 21px;
        stroke: currentColor;
        fill: none;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
        flex-shrink: 0;
      }
      .composer-attachment-preview {
        display: none;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(20, 24, 32, 0.94);
      }
      .composer-attachment-preview.visible {
        display: flex;
      }
      .composer-attachment-thumb {
        width: 72px;
        height: 72px;
        border-radius: 18px;
        overflow: hidden;
        flex-shrink: 0;
        background: rgba(255,255,255,0.06);
      }
      .composer-attachment-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .composer-attachment-copy {
        min-width: 0;
        flex: 1;
      }
      .composer-attachment-title {
        margin: 0 0 6px;
        font-size: 15px;
        font-weight: 700;
        color: #eef2fb;
      }
      .composer-attachment-meta {
        margin: 0;
        font-size: 13px;
        color: #95a2b9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .composer-attachment-remove {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 0;
        background: rgba(255,255,255,0.06);
        color: #eef2fb;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        flex-shrink: 0;
      }
      .composer-reply-preview {
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: 64px;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 10px 14px;
        margin: 0;
        border-radius: 18px;
        border-left: 3px solid rgba(255, 184, 77, 0.95);
        background: rgba(75, 54, 35, 0.88);
        color: #fff6ea;
        cursor: pointer;
        transform: translateY(14px) scale(0.985);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform-origin: center bottom;
        transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.2, 0.85, 0.2, 1);
        will-change: transform, opacity;
      }
      .composer-reply-preview.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        visibility: visible;
        pointer-events: auto;
      }
      .composer-reply-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .composer-reply-author {
        font-size: 13px;
        font-weight: 800;
        color: #ffb14e;
        line-height: 1.1;
      }
      .composer-reply-text {
        font-size: 14px;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .composer-reply-close {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 0;
        background: rgba(255,255,255,0.08);
        color: #ffd6a8;
        font-size: 24px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
      }
      .composer-reply-close:hover {
        background: rgba(255,255,255,0.14);
      }
      .composer-shell {
        min-height: 52px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(18, 22, 30, 0.95);
        border: 1px solid rgba(255,255,255,0.07);
        box-shadow: none;
        transition: border-color 0.2s var(--motion-standard), box-shadow 0.2s var(--motion-standard), transform 0.2s var(--motion-standard), background 0.2s var(--motion-standard);
      }
      .composer-shell:focus-within {
        border-color: rgba(255,255,255,0.08);
        background: rgba(18, 22, 30, 0.98);
        box-shadow: none;
        transform: none;
      }
      .composer-icon {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 0;
        background: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #9aa3b2;
        padding: 0;
        flex-shrink: 0;
        cursor: pointer;
        transition: transform 0.12s ease, opacity 0.12s ease;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }
      .composer-icon:hover {
        opacity: 0.92;
      }
      .composer-icon:active {
        transform: scale(0.93);
      }
      .composer-icon-image {
        width: 32px;
        height: 32px;
        object-fit: contain;
        display: block;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
        pointer-events: none;
      }
      .composer-input {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: none;
        background: transparent;
        color: #edf2fb;
        -webkit-text-fill-color: #edf2fb;
        caret-color: #edf2fb;
        font-family: inherit;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.25;
        letter-spacing: 0;
        position: relative;
        z-index: 1;
      }
      .composer-input-wrap.has-rendered-emoji .composer-input {
        color: transparent;
        -webkit-text-fill-color: transparent;
      }
      .composer-input-wrap.has-rendered-emoji .composer-input::selection {
        color: transparent;
        -webkit-text-fill-color: transparent;
      }
      .composer-input::selection {
        color: #ffffff;
        -webkit-text-fill-color: #ffffff;
        background: rgba(80, 145, 255, 0.46);
      }
      .composer-input::-moz-selection {
        color: #ffffff;
        background: rgba(80, 145, 255, 0.46);
      }
      .composer-input::placeholder {
        color: #8e96a4;
        -webkit-text-fill-color: #8e96a4;
      }
      .composer-input-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        min-height: 40px;
      }
      .composer-input-overlay {
        position: absolute;
        inset: 0;
        display: none;
        align-items: center;
        min-width: 0;
        color: #edf2fb;
        font-family: inherit;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.25;
        letter-spacing: 0;
        white-space: pre;
        overflow: hidden;
        pointer-events: none;
        z-index: 2;
      }
      .composer-input-wrap.has-rendered-emoji .composer-input-overlay {
        display: flex;
      }
      .composer-input-overlay.empty {
        color: #8e96a4;
      }
      .composer-overlay-text {
        color: #edf2fb;
        font: inherit;
        letter-spacing: 0;
      }
      .composer-input-placeholder {
        color: inherit;
      }
      .composer-actions {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
        position: relative;
        overflow: visible;
        flex-shrink: 0;
      }
      .composer-send {
        width: 54px;
        height: 54px;
        margin-bottom: 1px;
        border: 0;
        border-radius: 50%;
        background: linear-gradient(180deg, #3a404c 0%, #2f3540 100%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        opacity: 0;
        transform: translateX(-8px);
        pointer-events: none;
        transition: opacity 0.12s ease, transform 0.12s ease;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }
      .composer.send-active .composer-send {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }
      .composer-send:active {
        transform: translateX(0) scale(0.97);
      }
      .composer-send img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        display: block;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
        pointer-events: none;
      }
`;

export const buildComposerMarkup = ({
  emojiIconDataUrl,
  settingsKeyboardIconDataUrl,
  sendButtonIconDataUrl
}) => `
                <div id="chat-composer" class="composer">
                  <div class="composer-stack">
                    <div id="composer-reply-preview" class="composer-reply-preview" aria-hidden="true">
                      <div class="composer-reply-copy">
                        <span id="composer-reply-author" class="composer-reply-author">~author</span>
                        <span id="composer-reply-text" class="composer-reply-text">Message</span>
                      </div>
                      <button id="composer-reply-close" class="composer-reply-close" type="button" aria-label="Cancel reply">&times;</button>
                    </div>
                    <div id="composer-attachment-preview" class="composer-attachment-preview" aria-live="polite">
                      <div class="composer-attachment-thumb">
                        <img id="composer-attachment-image" src="" alt="" />
                      </div>
                      <div class="composer-attachment-copy">
                        <p class="composer-attachment-title">1 photo</p>
                        <p id="composer-attachment-meta" class="composer-attachment-meta">PNG</p>
                      </div>
                      <button id="composer-attachment-remove" class="composer-attachment-remove" type="button" aria-label="Remove photo">&times;</button>
                    </div>
                    <div class="composer-shell">
                      <button id="composer-emoji-button" class="composer-icon" type="button" aria-label="Emoji">
                        <img class="composer-icon-image" src="${emojiIconDataUrl}" alt="" draggable="false" />
                      </button>
                      <div id="emoji-picker" class="emoji-picker" aria-hidden="true">
                        <div id="emoji-picker-head" class="emoji-picker-head"></div>
                        <div id="emoji-picker-body" class="emoji-picker-body"></div>
                        <div class="emoji-picker-foot">
                          <span class="emoji-picker-hint">Hover or click to pick an emoji</span>
                        </div>
                      </div>
                      <div class="composer-input-wrap">
                        <div id="composer-input-overlay" class="composer-input-overlay empty" aria-hidden="true"><span class="composer-input-placeholder">Message</span></div>
                        <input id="composer-input" class="composer-input" type="text" placeholder="Message" />
                      </div>
                      <span class="composer-actions">
                        <button id="composer-attach-button" class="composer-icon" type="button" aria-label="Add photo">
                          <img class="composer-icon-image" src="${settingsKeyboardIconDataUrl}" alt="" draggable="false" />
                        </button>
                        <div id="attach-menu" class="attach-menu" aria-hidden="true">
                          <button class="attach-menu-item" type="button" aria-label="Photo or Video" data-attach-action="media">
                            <span class="material-symbols-rounded" aria-hidden="true">photo_library</span>
                            <span>Photo or Video</span>
                          </button>
                          <button class="attach-menu-item" type="button" aria-label="File" data-attach-action="file">
                            <span class="material-symbols-rounded" aria-hidden="true">draft</span>
                            <span>File</span>
                          </button>
                        </div>
                      </span>
                      <input id="composer-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden />
                    </div>
                  </div>
                  <button id="composer-send" class="composer-send" type="button" aria-label="Send">
                    <img src="${sendButtonIconDataUrl}" alt="" draggable="false" />
                  </button>
                </div>
`;
