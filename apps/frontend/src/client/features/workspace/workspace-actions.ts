import { dialogActions } from "../../store/index.ts";
import { syncStoreFromLegacy } from "../../store/sync-legacy.ts";
import { thgApi } from "../../api/thg-client.ts";
import { pushWorkspaceRoute } from "./routing.ts";

export const openWorkspaceDialog = async (
  publicId: string,
  options: { pushRoute?: boolean; fromRoute?: boolean } = {}
) => {
  const { pushRoute = true } = options;
  const win = window as any;
  const state = win.__THEGRAPHT_STORE__?.getState?.();
  const dialogs = state?.dialogs?.all || win.allDialogs || [];
  const dialog = dialogs.find((item: { publicId?: string }) => item.publicId === publicId);

  if (dialog) {
    dialogActions.setCurrent({ ...dialog });
  }

  document.getElementById("page-root")?.classList.add("mobile-chat-open");

  try {
    const payload = await thgApi.getClientState({ publicId });
    if (payload.selectedDialog) {
      dialogActions.setCurrent(payload.selectedDialog);
    }
    if (Array.isArray(payload.messages)) {
      win.__THEGRAPHT_STORE_ACTIONS__?.messageActions?.setCurrent(payload.messages);
    }
    syncStoreFromLegacy({
      currentDialog: payload.selectedDialog || dialog || null,
      messages: payload.messages || [],
      peerReadAt: payload.selectedDialog?.peerReadAt || null
    });
    await thgApi.markDialogRead(publicId);
    dialogActions.clearUnread(publicId);
    if (pushRoute) {
      pushWorkspaceRoute(publicId);
    }
  } catch {
    if (typeof win.loadDialog === "function") {
      await win.loadDialog(publicId);
      if (pushRoute) pushWorkspaceRoute(publicId);
    }
  }
};

export const closeMobileChat = () => {
  document.getElementById("page-root")?.classList.remove("mobile-chat-open");
  dialogActions.setCurrent(null);
  window.history.pushState({}, "", "/");
};
