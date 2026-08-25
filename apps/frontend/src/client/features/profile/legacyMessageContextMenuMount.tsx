import { h, render } from "preact";
import { LegacyMessageContextMenuBody } from "./LegacyMessageContextMenuBody.tsx";
import type { LegacyContextMenuAction } from "./legacyMessageContextMenuSync.ts";

export function renderLegacyMessageContextMenuBody(
  bodyEl: HTMLElement,
  actions: LegacyContextMenuAction[],
  onAction: (actionKey: string) => void
) {
  render(
    h(LegacyMessageContextMenuBody, {
      actions,
      onAction
    }),
    bodyEl
  );
}
