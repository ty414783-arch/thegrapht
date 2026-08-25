import { h, render } from "preact";
import { LegacyDialogItem, type LegacyDialogItemProps } from "./LegacyDialogItem.tsx";

export function mountLegacyDialogItemDom(props: LegacyDialogItemProps): HTMLElement {
  const host = document.createElement("div");
  render(h(LegacyDialogItem, props), host);
  const node = host.firstElementChild;
  if (!(node instanceof HTMLElement)) {
    host.remove();
    throw new Error("Legacy dialog item mount produced no root element");
  }
  host.removeChild(node);
  host.remove();
  return node;
}
