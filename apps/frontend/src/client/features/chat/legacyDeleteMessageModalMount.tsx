import { h, render } from "preact";
import { LegacyDeleteMessageModalBody } from "./LegacyDeleteMessageModalBody.tsx";
import type { LegacyDeleteMessageModalState } from "./legacyDeleteMessageModalSync.ts";

export type LegacyDeleteMessageModalRenderOptions = LegacyDeleteMessageModalState & {
  onCancel: () => void;
  onConfirm: () => void;
  onDeleteForEveryoneChange: (checked: boolean) => void;
};

export function renderLegacyDeleteMessageModalBody(
  shellEl: HTMLElement,
  options: LegacyDeleteMessageModalRenderOptions
) {
  render(
    h(LegacyDeleteMessageModalBody, options),
    shellEl
  );
}

export function mountLegacyDeleteMessageModalShell(
  getHandlers: () => Pick<
    LegacyDeleteMessageModalRenderOptions,
    "onCancel" | "onConfirm" | "onDeleteForEveryoneChange"
  >
) {
  const shellEl = document.querySelector("#delete-message-modal .delete-message-modal-shell");
  if (!(shellEl instanceof HTMLElement)) {
    return;
  }

  renderLegacyDeleteMessageModalBody(shellEl, {
    canDeleteForEveryone: false,
    deleteForEveryoneChecked: false,
    ...getHandlers()
  });
}
