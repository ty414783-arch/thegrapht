import type { LegacyAttachmentCollageItem } from "./legacyAttachmentModalSync.ts";

type LegacyAttachmentPhotoCollageProps = {
  items: LegacyAttachmentCollageItem[];
  removingIndex: number | null;
  onRemove: (index: number) => void;
};

export function LegacyAttachmentPhotoCollage({
  items,
  removingIndex,
  onRemove
}: LegacyAttachmentPhotoCollageProps) {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.index}
          class={"attachment-modal-collage-item" + (removingIndex === item.index ? " is-removing" : "")}
          data-photo-collage-index={String(item.index)}
        >
          <img src={item.previewUrl} alt={item.alt} />
          <button
            class="photo-tile-delete"
            type="button"
            aria-label="Delete photo"
            data-remove-photo-index={String(item.index)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove(item.index);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </>
  );
}
