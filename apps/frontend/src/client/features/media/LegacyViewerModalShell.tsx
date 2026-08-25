const getViewerDownloadIconHtml = () => {
  const getIcon = (window as any).getIcon;
  if (typeof getIcon !== "function") {
    return "";
  }
  return getIcon("download", "", 'aria-hidden="true"');
};

export function LegacyViewerModalShell() {
  const downloadIconHtml = getViewerDownloadIconHtml();

  return (
    <>
      <div class="media-modal-backdrop" />
      <div class="viewer-modal-shell">
        <div class="viewer-modal-header">
          <div class="viewer-author">
            <div id="viewer-author-avatar" class="viewer-author-avatar">?</div>
            <div class="viewer-author-copy">
              <span id="viewer-author-name" class="viewer-author-name">TheGraphT</span>
              <span id="viewer-author-meta" class="viewer-author-meta">Today, 00:00</span>
            </div>
          </div>
          <div class="viewer-header-actions">
            <button
              id="viewer-modal-download"
              class="viewer-modal-header-btn"
              type="button"
              aria-label="Save photo"
            >
              {downloadIconHtml ? (
                <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: downloadIconHtml }} />
              ) : null}
            </button>
            <button
              id="viewer-modal-close"
              class="media-modal-close"
              type="button"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
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
    </>
  );
}
