import { h, render } from "preact";
import { LegacyComposerReplyPreviewInner } from "./LegacyComposerReplyPreviewInner.tsx";
import {
  buildLegacyComposerReplyPreviewState,
  type LegacyComposerReplyPreviewState
} from "./legacyComposerReplyPreviewSync.ts";

type LegacyComposerReplyPreviewHandlers = {
  onClose: () => void;
};

let replyPreviewHandlers: LegacyComposerReplyPreviewHandlers = {
  onClose: () => {}
};

export function setLegacyComposerReplyPreviewHandlers(handlers: LegacyComposerReplyPreviewHandlers) {
  replyPreviewHandlers = handlers;
}

export function renderLegacyComposerReplyPreview(state: LegacyComposerReplyPreviewState) {
  const previewEl = document.getElementById("composer-reply-preview");
  if (!(previewEl instanceof HTMLElement)) {
    return;
  }

  previewEl.classList.toggle("visible", state.visible);
  previewEl.setAttribute("aria-hidden", state.visible ? "false" : "true");

  if (!state.visible) {
    render(null, previewEl);
    return;
  }

  render(
    h(LegacyComposerReplyPreviewInner, {
      author: state.author,
      textHtml: state.textHtml,
      onClose: replyPreviewHandlers.onClose
    }),
    previewEl
  );
}

export function syncLegacyComposerReplyPreview(pendingReplyMessage: any) {
  renderLegacyComposerReplyPreview(buildLegacyComposerReplyPreviewState(pendingReplyMessage));
}

export { buildLegacyComposerReplyPreviewState };
