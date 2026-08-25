export type LegacyDeleteMessageModalState = {
  canDeleteForEveryone: boolean;
  deleteForEveryoneChecked: boolean;
};

export function getLegacyDeleteMessageModalState(message: any): LegacyDeleteMessageModalState {
  const win = window as any;
  const currentUserId = win.currentUserId;
  const isOwn = message?.senderId === currentUserId;
  const currentPathPublicId = String(window.location.pathname || "")
    .replace(/^\/+/, "")
    .split("/")[0];
  const currentDialogSnapshot = win.currentDialogSnapshot;
  const currentDialogPublicId = win.currentDialogPublicId;
  const isSavedDialog = currentDialogSnapshot?.type === "saved"
    || currentDialogSnapshot?.publicId === "-1002003143"
    || currentDialogPublicId === "-1002003143"
    || currentPathPublicId === "-1002003143"
    || String(currentDialogSnapshot?.title || "").toLowerCase() === "saved messages";
  const canDeleteForEveryone = !isSavedDialog
    && isOwn
    && !String(message?.id || "").startsWith("local_");

  return {
    canDeleteForEveryone,
    deleteForEveryoneChecked: isOwn
  };
}
