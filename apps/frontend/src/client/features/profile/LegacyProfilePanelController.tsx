import { useEffect, useRef } from "preact/hooks";
import { appStore } from "../../store/index.ts";
import { useUiFlags } from "../../shared/hooks/useStore.ts";
import { renderLegacyProfilePanelContent } from "./legacyProfilePanelSync.ts";

const getWin = () => window as any;

const selectLegacyProfileMembersKey = (dialog: any) => {
  if (!dialog || dialog.type !== "group") {
    return String(dialog?.publicId || "");
  }

  const getGroupMembers = getWin().getGroupMembers;
  if (typeof getGroupMembers !== "function") {
    return String(dialog.publicId || "");
  }

  const onlineUserIds = getWin().onlineUserIds;
  const onlineKey = onlineUserIds instanceof Set
    ? [...onlineUserIds].sort().join(",")
    : (Array.isArray(onlineUserIds) ? onlineUserIds.slice().sort().join(",") : "");

  return [
    dialog.publicId,
    onlineKey,
    getGroupMembers(dialog).map((member: any) => [
      member.userId,
      member.role,
      member.name,
      member.username,
      member.lastSeenAt
    ].join(":")).join("|")
  ].join("::");
};

const selectLegacyProfilePanelKey = (dialog: any) => {
  if (!dialog) {
    return "";
  }

  const getDetails = getWin().getChatProfileDetails;
  const details = typeof getDetails === "function" ? getDetails(dialog) : null;

  return [
    selectLegacyProfileMembersKey(dialog),
    String(details?.name || ""),
    String(details?.status || "")
  ].join("::");
};

export function LegacyProfilePanelController() {
  const flags = useUiFlags();
  const lastKeyRef = useRef("");

  useEffect(() => {
    if (flags.newChatUi) {
      return;
    }

    const syncIfChanged = () => {
      const dialog = getWin().currentDialogSnapshot || appStore.getState().dialogs.current;
      const key = selectLegacyProfilePanelKey(dialog);
      if (key === lastKeyRef.current) {
        return;
      }
      lastKeyRef.current = key;
      renderLegacyProfilePanelContent(dialog);
    };

    syncIfChanged();

    return appStore.subscribe(() => {
      syncIfChanged();
    });
  }, [flags.newChatUi]);

  return null;
}
