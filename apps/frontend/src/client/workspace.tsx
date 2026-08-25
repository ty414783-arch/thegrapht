import "./store/bridge.ts";
import "./store/effects/realtime.ts";
import "./services/bootstrap.ts";
import "./services/format-utils.ts";
import "./services/scroll-pagination.ts";
import "./services/realtime-connection.ts";
import "./services/notifications.ts";
import "./services/workspace-state.ts";
import "./services/message-actions.ts";
import "./services/message-rendering.ts";
import "./services/ui-controls.ts";
import "./services/qr-share.ts";
import "./services/profile-panel.ts";
import "./services/sidebar.ts";
import "./services/auth.ts";
import { initMentionsHandler } from "./services/mentions.ts";
import "./services/settings-panels.ts";
import "./services/custom-scrollbars.ts";
import { render } from "preact";
import { App } from "./app/App.tsx";
import { onDomReady } from "./shared/lib/on-dom-ready.ts";
import { mountLegacyChatHeader } from "./features/profile/mountLegacyChatHeader.tsx";
import { mountLegacyProfilePanel } from "./features/profile/mountLegacyProfilePanel.tsx";
import { renderLegacyProfileMembersList, renderLegacyProfilePanelContent, renderLegacyProfileSummary } from "./features/profile/legacyProfilePanelSync.ts";
import { mountLegacyMediaHydrator } from "./features/media/mountLegacyMediaHydrator.tsx";

onDomReady(() => initMentionsHandler());
onDomReady(() => {
  (window as any).renderLegacyProfileMembersList = renderLegacyProfileMembersList;
  (window as any).renderLegacyProfileSummary = renderLegacyProfileSummary;
  (window as any).renderLegacyProfilePanelContent = renderLegacyProfilePanelContent;
  mountLegacyChatHeader();
  mountLegacyProfilePanel();
  mountLegacyMediaHydrator();
});

const deferNonCriticalServices = () => {
  void import("./services/secure.ts");
  void import("./services/search.ts");
  void import("./services/viewer-modal.ts");
  void import("./services/attachment-modal.ts");
  void import("./services/audio-player.ts");
  void import("./services/calls/call-utils.ts");
  void import("./services/calls/call-debug.ts");
  void import("./services/calls/call-webrtc.ts");
  void import("./services/calls/group-call-state.ts");
  void import("./services/calls/call-ui.ts");
  void import("./services/calls/call-signaling.ts");
  void import("./services/calls/livekit-service.ts");
};

if (document.readyState === "complete") {
  window.setTimeout(deferNonCriticalServices, 200);
} else {
  window.addEventListener("load", () => window.setTimeout(deferNonCriticalServices, 200));
}

const mountApp = () => {
  const root = document.getElementById("app-root");
  if (root) {
    root.removeAttribute("aria-hidden");
    render(<App />, root);
  }
};

onDomReady(mountApp);
