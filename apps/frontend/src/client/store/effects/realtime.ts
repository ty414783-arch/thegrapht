import { dialogActions, messageActions, presenceActions, uiActions } from "../index.ts";
import type { Dialog, Message } from "../types.ts";
import { thgApi } from "../../api/thg-client.ts";
import { isNewChatUiEnabled } from "../sync-legacy.ts";

type RealtimePayload = Record<string, unknown>;

const asDialog = (value: unknown): Dialog | null => (
  value && typeof value === "object" ? value as Dialog : null
);

const asMessage = (value: unknown): Message | null => (
  value && typeof value === "object" ? value as Message : null
);

const belongsToCurrentDialog = (message: Message, dialog?: Dialog | null) => {
  const state = (window as any).__THEGRAPHT_STORE__?.getState?.();
  const current = state?.dialogs?.current;
  if (!current) return false;
  const messageDialogId = String(message.dialogId || "");
  const messagePublicId = String(message.dialogPublicId || "");
  return (
    (messageDialogId && messageDialogId === current.id)
    || (messagePublicId && messagePublicId === current.publicId)
    || !messageDialogId
  );
};

export const handleRealtimeStoreEvent = (type: string, payload: RealtimePayload = {}) => {
  switch (type) {
    case "message_created": {
      const message = asMessage(payload.message);
      const dialog = asDialog(payload.dialog);
      if (dialog) {
        dialogActions.upsert(dialog);
      }
      if (!message?.id) break;

      const state = (window as any).__THEGRAPHT_STORE__?.getState?.();
      const current = state?.messages?.current || [];
      if (current.some((item: Message) => item.id === message.id)) {
        break;
      }

      if (isNewChatUiEnabled() && !belongsToCurrentDialog(message, dialog)) {
        break;
      }

      const pending = current.find((item: Message) => (
        item.localStatus === "pending"
        && item.senderId === message.senderId
        && item.body === message.body
      ));
      if (pending) {
        messageActions.replaceLocal(pending.id, {
          ...pending,
          ...message,
          localStatus: undefined
        });
      } else {
        messageActions.append(message);
      }
      break;
    }
    case "message_deleted": {
      const messageId = String(payload.messageId || "");
      if (messageId) messageActions.remove(messageId);
      break;
    }
    case "dialog_read": {
      const readAt = payload.readAt ? String(payload.readAt) : null;
      if (readAt) {
        presenceActions.setPeerReadAt(readAt);
        dialogActions.updateCurrent({ peerReadAt: readAt });
      }
      break;
    }
    case "dialog_created": {
      const dialog = asDialog(payload.dialog);
      if (dialog) dialogActions.upsert(dialog);
      break;
    }
    case "session_revoked": {
      uiActions.showToast("Session ended on another device.", "error");
      break;
    }
    case "dialog_typing": {
      const dialogId = String(payload.dialogId || "");
      const userId = String(payload.userId || "");
      const isTyping = Boolean(payload.isTyping);
      if (!dialogId || !userId) break;
      const win = window as any;
      const current = win.__THEGRAPHT_STORE__?.getState?.().presence.typingByDialog?.[dialogId] || [];
      const next = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id: string) => id !== userId);
      presenceActions.setTypingForDialog(dialogId, next);
      break;
    }
    case "presence_snapshot": {
      const userIds = Array.isArray(payload.userIds) ? payload.userIds.map(String) : [];
      presenceActions.setOnlineUserIds(userIds);
      break;
    }
    case "user_presence": {
      const userId = String(payload.userId || "");
      const isOnline = Boolean(payload.isOnline);
      if (!userId) break;
      const state = (window as any).__THEGRAPHT_STORE__?.getState?.();
      const current = state ? [...state.presence.onlineUserIds] : [];
      const next = isOnline
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      presenceActions.setOnlineUserIds(next);
      break;
    }
    case "realtime_reconnecting":
      uiActions.setConnectionStatus("reconnecting");
      break;
    case "realtime_offline":
      uiActions.setConnectionStatus("offline");
      break;
    case "realtime_online":
      uiActions.setConnectionStatus("online");
      break;
    default:
      break;
  }
};

export const reconcileCurrentDialogGap = async () => {
  if (!isNewChatUiEnabled()) return;
  const state = (window as any).__THEGRAPHT_STORE__?.getState?.();
  const publicId = state?.dialogs?.currentPublicId;
  if (!publicId) return;
  try {
    const payload = await thgApi.getMessages(publicId, { limit: "50" });
    if (Array.isArray(payload.messages)) {
      messageActions.setCurrent(payload.messages);
    }
  } catch {
    // Keep current list if gap sync fails.
  }
};

export const installRealtimeStoreBridge = () => {
  const win = window as any;
  if (win.__THEGRAPHT_REALTIME_STORE_BRIDGE__) return;

  win.__THEGRAPHT_REALTIME_STORE_BRIDGE__ = true;
  win.__THEGRAPHT_HANDLE_REALTIME_STORE_EVENT__ = handleRealtimeStoreEvent;
  win.__THEGRAPHT_RECONCILE_DIALOG_GAP__ = reconcileCurrentDialogGap;
};

installRealtimeStoreBridge();
