import { h, render } from "preact";
import { LegacyDaySeparator, type LegacyDaySeparatorProps } from "./LegacyDaySeparator.tsx";

export function mountLegacyDaySeparatorDom(props: LegacyDaySeparatorProps): HTMLElement {
  const host = document.createElement("div");
  render(h(LegacyDaySeparator, props), host);
  const node = host.firstElementChild;
  if (!(node instanceof HTMLElement)) {
    host.remove();
    throw new Error("Legacy day separator mount produced no root element");
  }
  host.removeChild(node);
  host.remove();
  return node;
}
