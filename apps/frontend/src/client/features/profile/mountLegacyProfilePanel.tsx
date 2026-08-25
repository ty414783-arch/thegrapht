import { h, render } from "preact";
import { LegacyProfilePanelController } from "./LegacyProfilePanelController.tsx";

export function mountLegacyProfilePanel() {
  const profilePanel = document.getElementById("chat-profile-panel");
  if (!profilePanel) {
    return;
  }

  let host = document.getElementById("legacy-profile-panel-controller-host");
  if (!host) {
    host = document.createElement("span");
    host.id = "legacy-profile-panel-controller-host";
    host.hidden = true;
    host.setAttribute("aria-hidden", "true");
    profilePanel.appendChild(host);
  }

  render(h(LegacyProfilePanelController, null), host);
}
