import type { LegacyAttachmentFileItem } from "./legacyAttachmentModalSync.ts";

type LegacyAttachmentFileStripProps = {
  items: LegacyAttachmentFileItem[];
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
};

const FileIcon = ({ isAudio }: { isAudio: boolean }) => {
  if (isAudio) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
};

export function LegacyAttachmentFileStrip({
  items,
  onSelect,
  onRemove
}: LegacyAttachmentFileStripProps) {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.index}
          class={"attachment-modal-file-item" + (item.isActive ? " active" : "")}
          data-file-attachment-index={String(item.index)}
          onClick={(event) => {
            const target = event.target instanceof Element ? event.target : null;
            if (target?.closest("[data-remove-file-index]")) {
              return;
            }
            onSelect(item.index);
          }}
        >
          <div class="attachment-modal-file-icon" aria-hidden="true">
            <FileIcon isAudio={item.isAudio} />
          </div>
          <div class="attachment-modal-file-copy">
            <span class="attachment-modal-file-name" title={item.name}>{item.name}</span>
            <span class="attachment-modal-file-meta">{item.meta}</span>
          </div>
          <div class="attachment-modal-file-actions">
            <button
              class="attachment-modal-file-btn file-remove-btn"
              type="button"
              aria-label="Remove file"
              data-remove-file-index={String(item.index)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove(item.index);
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
