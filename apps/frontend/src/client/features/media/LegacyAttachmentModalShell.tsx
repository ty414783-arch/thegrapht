export function LegacyAttachmentModalShell() {
  return (
    <>
      <div class="media-modal-backdrop" />
      <div class="attachment-modal-shell is-single">
        <div class="attachment-modal-header">
          <button
            id="attachment-modal-close"
            class="attachment-modal-icon-btn close-btn"
            type="button"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h2 id="attachment-modal-title" class="attachment-modal-title" data-i18n="actions.sendPhoto">
            Send Photo
          </h2>
          <div class="attachment-modal-header-actions" />
        </div>
        <div class="attachment-modal-content">
          <div id="attachment-modal-stage" class="attachment-modal-stage" hidden style="display: none;">
            <button
              id="attachment-modal-prev"
              class="attachment-modal-nav prev"
              type="button"
              aria-label="Previous photo"
              hidden
            >
              &lsaquo;
            </button>
            <div class="attachment-modal-main">
              <img id="attachment-modal-image" class="" src="" alt="" />
            </div>
            <button
              id="attachment-modal-next"
              class="attachment-modal-nav next"
              type="button"
              aria-label="Next photo"
              hidden
            >
              &rsaquo;
            </button>
          </div>
          <div id="attachment-modal-collage" class="attachment-modal-collage" hidden style="display: none;" />
          <div id="attachment-modal-strip" class="attachment-modal-strip" />
          <div class="attachment-modal-composer">
            <div id="attachment-modal-emoji-picker" class="emoji-picker attachment-modal-emoji-picker" aria-hidden="true">
              <div class="emoji-picker-search-wrap">
                <svg class="emoji-picker-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  id="attachment-modal-emoji-picker-search"
                  class="emoji-picker-search"
                  type="text"
                  placeholder="Search Emoji"
                  data-i18n-placeholder="emoji.search"
                  autocomplete="off"
                />
              </div>
              <div id="attachment-modal-emoji-picker-head" class="emoji-picker-head" />
              <div id="attachment-modal-emoji-picker-body" class="emoji-picker-body" />
            </div>
            <div class="attachment-modal-caption-pill">
              <button
                id="attachment-modal-emoji-button"
                class="attachment-modal-emoji-btn"
                type="button"
                aria-label="Add emoji"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </button>
              <textarea
                id="attachment-modal-caption"
                class="attachment-modal-caption"
                rows={1}
                placeholder="Add a caption..."
                data-i18n-placeholder="media.addCaption"
                autocomplete="off"
              />
              <button
                id="attachment-modal-send"
                class="attachment-modal-send-fab"
                type="button"
                aria-label="Send"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
