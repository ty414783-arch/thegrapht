import { useEffect } from "preact/hooks";
import { isNewAuthUiEnabled, isNewChatUiEnabled, isNewSidebarEnabled } from "../../store/sync-legacy.ts";
import legacyHideCss from "./legacy-hide.css?inline";

const STYLE_ID = "tg-legacy-hide-styles";

export const useLegacyUiToggle = () => {
  const newAuthUi = isNewAuthUiEnabled();
  const newChatUi = isNewChatUiEnabled();
  const newSidebar = isNewSidebarEnabled();

  useEffect(() => {
    const pageRoot = document.getElementById("page-root");
    if (!pageRoot) {
      return;
    }

    pageRoot.classList.toggle("ui-new-auth", newAuthUi);
    pageRoot.classList.toggle("ui-new-chat", newChatUi);
    pageRoot.classList.toggle("ui-new-sidebar", newSidebar);

    if (!document.getElementById(STYLE_ID)) {
      const styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      styleEl.textContent = legacyHideCss;
      document.head.appendChild(styleEl);
    }

    return () => {
      pageRoot.classList.remove("ui-new-auth", "ui-new-chat", "ui-new-sidebar");
    };
  }, [newAuthUi, newChatUi, newSidebar]);

  return { newAuthUi, newChatUi, newSidebar };
};
