import type { Dialog, Message, User } from "./types.ts";
import { authActions, dialogActions, messageActions, presenceActions } from "./index.ts";

export const isNewAuthUiEnabled = (): boolean => {
  const win = window as any;
  return Boolean(
    win.__THEGRAPHT_CONFIG__?.uiFlags?.newAuthUi
    || win.__THEGRAPHT_UI_FLAGS__?.newAuthUi
  );
};

export const isNewChatUiEnabled = (): boolean => {
  const win = window as any;
  return Boolean(
    win.__THEGRAPHT_CONFIG__?.uiFlags?.newChatUi
    || win.__THEGRAPHT_UI_FLAGS__?.newChatUi
  );
};

export const isNewSidebarEnabled = (): boolean => {
  const win = window as any;
  return Boolean(
    win.__THEGRAPHT_CONFIG__?.uiFlags?.newSidebar
    || win.__THEGRAPHT_UI_FLAGS__?.newSidebar
  );
};

const cloneDialogs = (dialogs: Dialog[] | undefined): Dialog[] => (
  Array.isArray(dialogs) ? dialogs.map((dialog) => ({ ...dialog })) : []
);

const cloneMessages = (messages: Message[] | undefined): Message[] => (
  Array.isArray(messages) ? messages.map((message) => ({ ...message })) : []
);

/** Explicit sync from legacy globals into store (after loadWorkspace/renderMessages/login). */
export const syncStoreFromLegacy = (patch: {
  user?: User | null;
  dialogs?: Dialog[];
  currentDialog?: Dialog | null;
  messages?: Message[];
  localOutgoing?: Message[];
  peerReadAt?: string | null;
} = {}) => {
  const win = window as any;
  const actions = win.__THEGRAPHT_STORE_ACTIONS__;
  if (!actions) {
    return;
  }

  if (patch.user !== undefined) {
    actions.authActions.setUser(patch.user);
  } else if (win.currentUser) {
    actions.authActions.setUser({ ...win.currentUser });
  } else if (win.currentUserId) {
    actions.authActions.setUser({ id: String(win.currentUserId) });
  }

  if (patch.dialogs !== undefined) {
    actions.dialogActions.setAll(cloneDialogs(patch.dialogs));
  } else if (Array.isArray(win.allDialogs)) {
    actions.dialogActions.setAll(cloneDialogs(win.allDialogs));
  }

  if (patch.currentDialog !== undefined) {
    actions.dialogActions.setCurrent(patch.currentDialog ? { ...patch.currentDialog } : null);
  } else if (win.currentDialogSnapshot) {
    actions.dialogActions.setCurrent({ ...win.currentDialogSnapshot });
  }

  if (patch.messages !== undefined) {
    actions.messageActions.setCurrent(cloneMessages(patch.messages));
  } else if (Array.isArray(win.currentMessagesSnapshot)) {
    actions.messageActions.setCurrent(cloneMessages(win.currentMessagesSnapshot));
  }

  if (patch.localOutgoing !== undefined) {
    actions.messageActions.setLocalOutgoing(cloneMessages(patch.localOutgoing));
  } else if (Array.isArray(win.localOutgoingMessages)) {
    actions.messageActions.setLocalOutgoing(cloneMessages(win.localOutgoingMessages));
  }

  if (patch.peerReadAt !== undefined) {
    actions.presenceActions.setPeerReadAt(patch.peerReadAt);
  } else if (win.currentPeerReadAt) {
    actions.presenceActions.setPeerReadAt(String(win.currentPeerReadAt));
  }
};

export const syncUserFromLegacy = (user: User | null | undefined) => {
  if (!user?.id) {
    return;
  }
  const win = window as any;
  win.currentUser = user;
  syncStoreFromLegacy({ user });
};
