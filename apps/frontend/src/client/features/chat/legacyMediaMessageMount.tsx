import { h, render } from "preact";
import { LegacyMediaMessage, type LegacyMediaMessageProps } from "./LegacyMediaMessage.tsx";

export function mountLegacyMediaMessageDom(props: LegacyMediaMessageProps): HTMLElement {
  const host = document.createElement("div");
  render(h(LegacyMediaMessage, props), host);
  const node = host.firstElementChild;
  if (!(node instanceof HTMLElement)) {
    host.remove();
    throw new Error("Legacy media message mount produced no root element");
  }
  host.removeChild(node);
  host.remove();
  return node;
}
