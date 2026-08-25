import { h, render } from "preact";
import { LegacyScrollBottomIcon } from "./LegacyScrollBottomIcon.tsx";

export function mountLegacyScrollBottomIcon() {
  const chatScrollBottom = document.getElementById("chat-scroll-bottom");
  if (!chatScrollBottom) {
    return;
  }

  render(h(LegacyScrollBottomIcon, {}), chatScrollBottom);
}
