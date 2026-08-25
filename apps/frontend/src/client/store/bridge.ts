import {
  appStore,
  authActions,
  dialogActions,
  messageActions,
  presenceActions,
  uiActions,
  uploadActions
} from "./index.ts";
import type { Dialog, Message } from "./types.ts";
import { syncStoreFromLegacy, syncUserFromLegacy, isNewChatUiEnabled } from "./sync-legacy.ts";

const getWin = () => window as any;

const cloneDialogs = (dialogs: Dialog[] | undefined): Dialog[] => (
  Array.isArray(dialogs) ? dialogs.map((dialog) => ({ ...dialog })) : []
);

const cloneMessages = (messages: Message[] | undefined): Message[] => (
  Array.isArray(messages) ? messages.map((message) => ({ ...message })) : []
);

let mirrorToWindow = false;

const syncStoreToWindow = () => {
  if (mirrorToWindow) {
    return;
  }
  const state = appStore.getState();
  const win = getWin();

  mirrorToWindow = true;
  try {
    win.currentUserId = state.auth.userId;
    win.currentDialogId = state.dialogs.current?.id || "";
    win.currentDialogPublicId = state.dialogs.currentPublicId;
    win.currentDialogSnapshot = state.dialogs.current ? { ...state.dialogs.current } : null;
    win.allDialogs = cloneDialogs(state.dialogs.all);
    win.currentMessagesSnapshot = cloneMessages(state.messages.current);
    win.localOutgoingMessages = cloneMessages(state.messages.localOutgoing);
    win.currentPeerReadAt = state.presence.peerReadAt;
    const onlineSet = win.onlineUserIds instanceof Set ? win.onlineUserIds : new Set();
    onlineSet.clear();
    for (const userId of state.presence.onlineUserIds) {
      onlineSet.add(userId);
    }
    win.onlineUserIds = onlineSet;
    win.typingUsersByDialog = { ...state.presence.typingByDialog };
    win.isNearChatBottom = state.ui.isNearChatBottom;
    win.pendingReplyMessage = state.ui.pendingReplyMessage ? { ...state.ui.pendingReplyMessage } : null;
  } finally {
    mirrorToWindow = false;
  }
};

const syncWindowToStore = () => {
  const win = getWin();

  if (win.currentUserId) {
    authActions.setUser(win.currentUser ? { ...win.currentUser } : { id: win.currentUserId });
  }

  dialogActions.setAll(cloneDialogs(win.allDialogs));
  dialogActions.setCurrent(win.currentDialogSnapshot ? { ...win.currentDialogSnapshot } : null);
  messageActions.setCurrent(cloneMessages(win.currentMessagesSnapshot));
  messageActions.setLocalOutgoing(cloneMessages(win.localOutgoingMessages));
  presenceActions.setPeerReadAt(win.currentPeerReadAt || null);

  if (win.onlineUserIds instanceof Set) {
    presenceActions.setOnlineUserIds([...win.onlineUserIds]);
  } else if (Array.isArray(win.onlineUserIds)) {
    presenceActions.setOnlineUserIds(win.onlineUserIds);
  }
};

const installLegacyPropertyBridge = () => {
  const win = getWin();
  const descriptors: Array<[string, () => unknown, (value: unknown) => void]> = [
    ["currentUserId", () => appStore.getState().auth.userId, (value) => authActions.setUser(value ? { id: String(value) } : null)],
    ["allDialogs", () => appStore.getState().dialogs.all, (value) => dialogActions.setAll(cloneDialogs(value as Dialog[]))],
    ["currentDialogSnapshot", () => appStore.getState().dialogs.current, (value) => dialogActions.setCurrent(value ? { ...(value as Dialog) } : null)],
    ["currentMessagesSnapshot", () => appStore.getState().messages.current, (value) => messageActions.setCurrent(cloneMessages(value as Message[]))],
    ["localOutgoingMessages", () => appStore.getState().messages.localOutgoing, (value) => messageActions.setLocalOutgoing(cloneMessages(value as Message[]))],
    ["currentPeerReadAt", () => appStore.getState().presence.peerReadAt, (value) => presenceActions.setPeerReadAt(value ? String(value) : null)],
    ["isNearChatBottom", () => appStore.getState().ui.isNearChatBottom, (value) => uiActions.setNearChatBottom(Boolean(value))],
    ["pendingReplyMessage", () => appStore.getState().ui.pendingReplyMessage, (value) => uiActions.setPendingReply(value ? { ...(value as Message) } : null)]
  ];

  for (const [key, getter, setter] of descriptors) {
    try {
      Object.defineProperty(win, key, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: (value: unknown) => {
          if (mirrorToWindow) {
            return;
          }
          setter(value);
        }
      });
    } catch {
      // Some keys may already exist as plain properties in older runtimes.
    }
  }
};

let bridgeInstalled = false;

export const installStoreBridge = () => {
  if (bridgeInstalled || typeof window === "undefined") {
    return;
  }

  bridgeInstalled = true;
  syncWindowToStore();
  installLegacyPropertyBridge();
  appStore.subscribe(syncStoreToWindow);
  syncStoreToWindow();

  getWin().__THEGRAPHT_STORE__ = appStore;
  getWin().__THEGRAPHT_STORE_ACTIONS__ = {
    authActions,
    dialogActions,
    messageActions,
    presenceActions,
    uiActions,
    uploadActions
  };
  getWin().syncStoreFromLegacy = syncStoreFromLegacy;
  getWin().syncUserFromLegacy = syncUserFromLegacy;
  getWin().isNewChatUiEnabled = isNewChatUiEnabled;
};

installStoreBridge();
