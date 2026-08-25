import { h, render } from "preact";
import { LegacyComposerController } from "./LegacyComposerController.tsx";
import type { LegacyComposerSendContext } from "./legacyComposerSend.ts";

export function mountLegacyComposer(context: LegacyComposerSendContext = {}) {
  const chatComposer = document.getElementById("chat-composer");
  if (!chatComposer) {
    return;
  }

  let host = document.getElementById("legacy-composer-controller-host");
  if (!host) {
    host = document.createElement("span");
    host.id = "legacy-composer-controller-host";
    host.hidden = true;
    host.setAttribute("aria-hidden", "true");
    chatComposer.appendChild(host);
  }

  render(h(LegacyComposerController, { context }), host);
}
