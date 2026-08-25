import type { AppState } from "../../store/types.ts";

const getWin = () => window as any;

export const selectLegacyChatChromeKey = (state: AppState) => {
  const dialog = state.dialogs.current;
  const publicId = String(dialog?.publicId || "");
  const peerUserId = String(dialog?.peerUserId || "");
  const peerOnline = peerUserId
    ? state.presence.onlineUserIds.includes(peerUserId)
    : false;

  return [
    publicId,
    String(dialog?.id || ""),
    String(dialog?.title || ""),
    String(dialog?.type || ""),
    String(dialog?.subtitle || ""),
    String((state.presence.typingByDialog[publicId] || []).join(",")),
    peerOnline ? "1" : "0",
    String(state.presence.peerReadAt || "")
  ].join("|");
};

export function syncLegacyChatChromeFromStore() {
  const refresh = getWin().refreshCurrentDialogChrome;
  if (typeof refresh === "function") {
    refresh();
    return;
  }

  const syncHeader = getWin().syncChatHeaderMeta;
  if (typeof syncHeader === "function") {
    syncHeader();
  }

  const syncProfile = getWin().syncChatProfilePanel;
  if (typeof syncProfile === "function") {
    syncProfile();
  }
}
