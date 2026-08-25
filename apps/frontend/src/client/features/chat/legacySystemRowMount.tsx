import { h, render } from "preact";
import { LegacySystemRowMessage, type LegacySystemRowMessageProps } from "./LegacySystemRowMessage.tsx";

export function mountLegacySystemRowMessageDom(props: LegacySystemRowMessageProps): HTMLElement {
  const host = document.createElement("div");
  render(h(LegacySystemRowMessage, props), host);
  const node = host.firstElementChild;
  if (!(node instanceof HTMLElement)) {
    host.remove();
    throw new Error("Legacy system row mount produced no root element");
  }
  host.removeChild(node);
  host.remove();
  return node;
}
