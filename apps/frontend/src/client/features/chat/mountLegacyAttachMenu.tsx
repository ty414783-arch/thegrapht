import { h, render } from "preact";
import { LegacyAttachMenu } from "./LegacyAttachMenu.tsx";

export function mountLegacyAttachMenu() {
  const attachMenu = document.getElementById("attach-menu");
  if (!attachMenu) {
    return;
  }

  render(h(LegacyAttachMenu, {}), attachMenu);
}
