import { h, render } from "preact";
import { LegacyAttachmentFileStrip } from "./LegacyAttachmentFileStrip.tsx";
import { LegacyAttachmentModalShell } from "./LegacyAttachmentModalShell.tsx";
import { LegacyAttachmentPhotoCollage } from "./LegacyAttachmentPhotoCollage.tsx";
import {
  buildLegacyAttachmentCollageItems,
  buildLegacyAttachmentFileItems,
  type LegacyAttachmentCollageItem,
  type LegacyAttachmentFileItem
} from "./legacyAttachmentModalSync.ts";

export function mountLegacyAttachmentModalShell() {
  const attachmentModal = document.getElementById("attachment-modal");
  if (!attachmentModal) {
    return;
  }

  render(h(LegacyAttachmentModalShell, {}), attachmentModal);
}

export function renderLegacyAttachmentFileStrip(
  stripEl: HTMLElement,
  items: LegacyAttachmentFileItem[],
  handlers: {
    onSelect: (index: number) => void;
    onRemove: (index: number) => void;
  }
) {
  render(
    h(LegacyAttachmentFileStrip, {
      items,
      onSelect: handlers.onSelect,
      onRemove: handlers.onRemove
    }),
    stripEl
  );
}

export function renderLegacyAttachmentPhotoCollage(
  collageEl: HTMLElement,
  items: LegacyAttachmentCollageItem[],
  handlers: {
    removingIndex: number | null;
    onRemove: (index: number) => void;
  }
) {
  render(
    h(LegacyAttachmentPhotoCollage, {
      items,
      removingIndex: handlers.removingIndex,
      onRemove: handlers.onRemove
    }),
    collageEl
  );
}

export {
  buildLegacyAttachmentCollageItems,
  buildLegacyAttachmentFileItems
};
