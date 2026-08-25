import { useEffect } from "preact/hooks";
import { getRoutedPublicId } from "./routing.ts";
import { openWorkspaceDialog } from "./workspace-actions.ts";
import { isNewChatUiEnabled, isNewSidebarEnabled } from "../../store/sync-legacy.ts";

/** Sync browser history with Preact workspace when new UI flags are on. */
export function WorkspaceRouter() {
  useEffect(() => {
    if (!isNewChatUiEnabled() && !isNewSidebarEnabled()) {
      return;
    }

    const handlePopState = () => {
      const publicId = getRoutedPublicId();
      if (!publicId) {
        document.getElementById("page-root")?.classList.remove("mobile-chat-open");
        return;
      }
      void openWorkspaceDialog(publicId, { pushRoute: false, fromRoute: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!isNewChatUiEnabled() && !isNewSidebarEnabled()) return;
    const publicId = getRoutedPublicId();
    if (publicId && (window as any).currentUserId) {
      void openWorkspaceDialog(publicId, { pushRoute: false });
    }
  }, []);

  return null;
}
