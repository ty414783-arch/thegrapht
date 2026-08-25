import { h, render } from "preact";
import { LegacyChatHeaderController } from "./LegacyChatHeaderController.tsx";

export function mountLegacyChatHeader() {
  const chatIsland = document.getElementById("chat-island");
  if (!chatIsland) {
    return;
  }

  let host = document.getElementById("legacy-chat-header-controller-host");
  if (!host) {
    host = document.createElement("span");
    host.id = "legacy-chat-header-controller-host";
    host.hidden = true;
    host.setAttribute("aria-hidden", "true");
    chatIsland.appendChild(host);
  }

  render(h(LegacyChatHeaderController, null), host);
}
