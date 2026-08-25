import { createSliceSetter, createStore } from "./create-store.ts";
import { initialAppState, type AppState, type Dialog, type Message, type ToastItem, type UploadItem, type User } from "./types.ts";

export const appStore = createStore(initialAppState());

const setAuth = createSliceSetter(appStore, "auth");
const setDialogs = createSliceSetter(appStore, "dialogs");
const setMessages = createSliceSetter(appStore, "messages");
const setPresence = createSliceSetter(appStore, "presence");
const setUi = createSliceSetter(appStore, "ui");
const setUploads = createSliceSetter(appStore, "uploads");

export const authActions = {
  setUser: (user: User | null) => {
    setAuth({
      user,
      userId: user?.id || "",
      isAuthenticated: Boolean(user?.id)
    });
  },
  setToken: (token: string) => setAuth({ token }),
  clear: () => setAuth({ user: null, userId: "", token: "", isAuthenticated: false })
};

export const dialogActions = {
  setAll: (all: Dialog[]) => setDialogs({ all }),
  setCurrent: (current: Dialog | null) => setDialogs({
    current,
    currentPublicId: current?.publicId || ""
  }),
  updateCurrent: (patch: Partial<Dialog>) => {
    appStore.setState((state) => ({
      ...state,
      dialogs: {
        ...state.dialogs,
        current: state.dialogs.current ? { ...state.dialogs.current, ...patch } : null
      }
    }));
  },
  upsert: (dialog: Dialog) => {
    appStore.setState((state) => {
      const all = [...state.dialogs.all];
      const index = all.findIndex((item) => item.id === dialog.id || item.publicId === dialog.publicId);
      if (index >= 0) {
        all[index] = { ...all[index], ...dialog };
      } else {
        all.unshift(dialog);
      }
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          all,
          current: state.dialogs.current?.id === dialog.id
            ? { ...state.dialogs.current, ...dialog }
            : state.dialogs.current
        }
      };
    });
  },
  clearUnread: (publicId: string) => {
    appStore.setState((state) => ({
      ...state,
      dialogs: {
        ...state.dialogs,
        all: state.dialogs.all.map((dialog) => (
          dialog.publicId === publicId ? { ...dialog, unreadCount: 0 } : dialog
        )),
        current: state.dialogs.current?.publicId === publicId
          ? { ...state.dialogs.current, unreadCount: 0 }
          : state.dialogs.current
      }
    }));
  }
};

export const messageActions = {
  setCurrent: (current: Message[]) => setMessages({ current }),
  setLocalOutgoing: (localOutgoing: Message[]) => setMessages({ localOutgoing }),
  append: (message: Message) => {
    appStore.setState((state) => ({
      ...state,
      messages: {
        ...state.messages,
        current: [...state.messages.current, message]
      }
    }));
  },
  replaceLocal: (localId: string, confirmed: Message) => {
    appStore.setState((state) => ({
      ...state,
      messages: {
        current: state.messages.current.map((message) => (
          message.id === localId ? confirmed : message
        )),
        localOutgoing: state.messages.localOutgoing.filter((message) => message.id !== localId)
      }
    }));
  },
  remove: (messageId: string) => {
    appStore.setState((state) => ({
      ...state,
      messages: {
        ...state.messages,
        current: state.messages.current.filter((message) => message.id !== messageId)
      }
    }));
  },
  markFailed: (localId: string) => {
    appStore.setState((state) => ({
      ...state,
      messages: {
        ...state.messages,
        current: state.messages.current.map((message) => (
          message.id === localId ? { ...message, localStatus: "failed" as const } : message
        ))
      }
    }));
  },
  updateById: (messageId: string, patch: Partial<Message>) => {
    appStore.setState((state) => ({
      ...state,
      messages: {
        ...state.messages,
        current: state.messages.current.map((message) => (
          message.id === messageId ? { ...message, ...patch } : message
        ))
      }
    }));
  }
};

export const presenceActions = {
  setOnlineUserIds: (userIds: string[]) => {
    setPresence({ onlineUserIds: new Set(userIds) });
  },
  setTypingForDialog: (dialogId: string, userIds: string[]) => {
    appStore.setState((state) => ({
      ...state,
      presence: {
        ...state.presence,
        typingByDialog: {
          ...state.presence.typingByDialog,
          [dialogId]: userIds
        }
      }
    }));
  },
  setPeerReadAt: (peerReadAt: string | null) => setPresence({ peerReadAt })
};

export const uiActions = {
  showToast: (message: string, type: ToastItem["type"] = "info") => {
    const toast: ToastItem = {
      id: "toast_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      message,
      type
    };
    appStore.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        toasts: [...state.ui.toasts, toast]
      }
    }));
    return toast.id;
  },
  dismissToast: (id: string) => {
    appStore.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        toasts: state.ui.toasts.filter((toast) => toast.id !== id)
      }
    }));
  },
  setNearChatBottom: (isNearChatBottom: boolean) => setUi({ isNearChatBottom }),
  setPendingReply: (pendingReplyMessage: Message | null) => setUi({ pendingReplyMessage }),
  setBootComplete: (bootComplete: boolean) => setUi({ bootComplete }),
  setConnectionStatus: (connectionStatus: AppState["ui"]["connectionStatus"]) => setUi({ connectionStatus })
};

export const uploadActions = {
  upsert: (item: UploadItem) => {
    appStore.setState((state) => {
      const items = [...state.uploads.items];
      const index = items.findIndex((entry) => entry.id === item.id);
      if (index >= 0) items[index] = item;
      else items.push(item);
      return { ...state, uploads: { items } };
    });
  },
  remove: (id: string) => {
    appStore.setState((state) => ({
      ...state,
      uploads: { items: state.uploads.items.filter((item) => item.id !== id) }
    }));
  },
  clearForDialog: (dialogPublicId: string) => {
    appStore.setState((state) => ({
      ...state,
      uploads: { items: state.uploads.items.filter((item) => item.dialogPublicId !== dialogPublicId) }
    }));
  }
};

export const getAppState = () => appStore.getState();
export const subscribeAppStore = appStore.subscribe;

export const selectCurrentDialog = () => appStore.getState().dialogs.current;
export const selectCurrentMessages = () => appStore.getState().messages.current;
export const selectAllDialogs = () => appStore.getState().dialogs.all;
