import { h, render } from "preact";
import { LegacyDialogContextMenuBody } from "./LegacyDialogContextMenuBody.tsx";
import type { LegacyDialogContextMenuAction } from "./legacyDialogContextMenuSync.ts";

export function renderLegacyDialogContextMenuBody(
  bodyEl: HTMLElement,
  actions: LegacyDialogContextMenuAction[],
  onAction: (actionKey: string) => void
) {
  render(
    h(LegacyDialogContextMenuBody, {
      actions,
      onAction
    }),
    bodyEl
  );
}
