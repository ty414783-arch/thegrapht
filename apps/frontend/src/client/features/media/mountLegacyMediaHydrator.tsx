import { h, render } from "preact";
import { LegacyMediaHydratorController } from "./LegacyMediaHydratorController.tsx";

export function mountLegacyMediaHydrator() {
  const messageList = document.getElementById("message-list");
  if (!messageList) {
    return;
  }

  let host = document.getElementById("legacy-media-hydrator-host");
  if (!host) {
    host = document.createElement("span");
    host.id = "legacy-media-hydrator-host";
    host.hidden = true;
    host.setAttribute("aria-hidden", "true");
    messageList.appendChild(host);
  }

  render(h(LegacyMediaHydratorController, null), host);
}
