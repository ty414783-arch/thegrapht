import { messageActions, uiActions } from "../../store/index.ts";
import type { Message } from "../../store/types.ts";
import { THG_IDEMPOTENCY_HEADER } from "../../services/thg-protocol-client.ts";

const getWin = () => window as any;

export type LegacyComposerSendContext = {
  composerInput?: HTMLTextAreaElement | null;
  composerSend?: HTMLButtonElement | null;
  workspaceUserName?: HTMLElement | null;
  currentSearchQuery?: string;
  rememberRecentGif?: (url: string) => void;
  clearPendingReplyMessage?: () => void;
  appendLocalOutgoingMessageToCurrentDialog?: (message: Message, options?: any) => boolean;
  rerenderCurrentDialog?: (options?: any) => void;
  prepareDialogPayloadForDisplay?: (dialog: any, messages: any[]) => Promise<any>;
  fetchJson?: (url: string, options?: any) => Promise<any>;
  encryptSecureMessageBody?: (dialog: any, body: string) => Promise<any>;
  isSecureDialog?: (dialog: any) => boolean;
  createIdempotencyKey?: (scope: string) => string;
  updateDialogInState?: (dialog: any, patch: any) => any;
  appendConfirmedMessageToCurrentDialog?: (dialog: any, message: any, options?: any) => void;
  playSound?: (name: string) => void;
  renderDialogs?: (dialogs: any[], options?: any) => void;
  getMessagePreviewText?: (message: any) => string;
  setStatus?: (message: string, type?: string) => void;
  showToast?: (message: string, type?: string) => void;
  sendTypingState?: (active: boolean) => void;
};

export async function sendLegacyComposerMessage(context: LegacyComposerSendContext = {}) {
  const win = getWin();
  if (win.textMessageSendInFlight) {
    return;
  }

  const composerInput = context.composerInput ?? document.getElementById("composer-input") as HTMLTextAreaElement | null;
  const composerSend = context.composerSend ?? document.getElementById("composer-send") as HTMLButtonElement | null;
  const body = composerInput?.value.trim();

  if (!body || !win.currentDialogPublicId) {
    return;
  }

  const rememberRecentGif = context.rememberRecentGif ?? win.rememberRecentGif;
  const isGifUrl = (body.startsWith("http://") || body.startsWith("https://"))
    && body.split("?")[0].split("#")[0].toLowerCase().endsWith(".gif");
  if (isGifUrl && typeof rememberRecentGif === "function") {
    rememberRecentGif(body);
  }

  win.textMessageSendInFlight = true;
  if (composerSend) {
    composerSend.disabled = true;
  }

  const pendingReplyMessage = win.pendingReplyMessage;
  const replyContext = pendingReplyMessage
    ? {
        id: pendingReplyMessage.id || null,
        senderId: pendingReplyMessage.senderId || null,
        senderName: pendingReplyMessage.senderName || null,
        body: pendingReplyMessage.body || null,
        type: pendingReplyMessage.type || null,
        mediaUrl: pendingReplyMessage.mediaUrl || null
      }
    : null;
  const localMessageId = "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const createIdempotencyKey = context.createIdempotencyKey ?? win.createIdempotencyKey;
  const idempotencyKey = typeof createIdempotencyKey === "function"
    ? createIdempotencyKey("send")
    : "send_" + Date.now();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 60000);
  const workspaceUserName = context.workspaceUserName ?? document.getElementById("workspace-user-name");
  const localMessage: Message = {
    id: localMessageId,
    dialogPublicId: win.currentDialogPublicId,
    senderId: win.currentUserId,
    senderName: win.currentUserDisplayName || win.currentUserUsername || workspaceUserName?.textContent || "You",
    body,
    type: "text",
    mediaUrl: null,
    replyToMessageId: replyContext?.id || null,
    createdAt: new Date().toISOString(),
    localStatus: "pending",
    animateOnRender: true
  };

  win.localOutgoingMessages = [...(Array.isArray(win.localOutgoingMessages) ? win.localOutgoingMessages : []), {
    ...localMessage,
    attachmentMime: null,
    replyToSenderId: replyContext?.senderId || null,
    replyToSenderName: replyContext?.senderName || null,
    replyToBody: replyContext?.body || null,
    replyToType: replyContext?.type || null,
    replyToMediaUrl: replyContext?.mediaUrl || null
  }];
  messageActions.setLocalOutgoing(win.localOutgoingMessages);
  uiActions.setPendingReply(null);

  const clearPendingReplyMessage = context.clearPendingReplyMessage ?? win.clearPendingReplyMessage;
  if (typeof clearPendingReplyMessage === "function") {
    clearPendingReplyMessage();
  }

  if (composerInput) {
    composerInput.value = "";
    composerInput.style.height = "48px";
    composerInput.style.overflowY = "hidden";
  }

  if (typeof win.syncComposerState === "function") {
    win.syncComposerState();
  }

  composerInput?.focus({ preventScroll: true });

  if (win.typingStopTimer) {
    window.clearTimeout(win.typingStopTimer);
    win.typingStopTimer = null;
  }

  const sendTypingState = context.sendTypingState ?? win.sendTypingState;
  if (typeof sendTypingState === "function") {
    sendTypingState(false);
  }

  const appendLocalOutgoingMessageToCurrentDialog = context.appendLocalOutgoingMessageToCurrentDialog
    ?? win.appendLocalOutgoingMessageToCurrentDialog;
  const appendedLocal = typeof appendLocalOutgoingMessageToCurrentDialog === "function"
    ? appendLocalOutgoingMessageToCurrentDialog(win.localOutgoingMessages[win.localOutgoingMessages.length - 1], {
      scrollBehavior: "smooth",
      forceScrollBottom: true
    })
    : false;

  if (!appendedLocal) {
    const rerenderCurrentDialog = context.rerenderCurrentDialog ?? win.rerenderCurrentDialog;
    if (typeof rerenderCurrentDialog === "function") {
      rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
    }
  }

  try {
    const apiBase = win.apiBase || "/api";
    const isSecureDialog = context.isSecureDialog ?? win.isSecureDialog;
    const encryptSecureMessageBody = context.encryptSecureMessageBody ?? win.encryptSecureMessageBody;
    const fetchJson = context.fetchJson ?? win.fetchJson;
    const payload = typeof isSecureDialog === "function" && isSecureDialog(win.currentDialogSnapshot)
      ? await (async () => {
          const encrypted = await encryptSecureMessageBody(win.currentDialogSnapshot, body);
          return fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(win.currentDialogPublicId) + "/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              [THG_IDEMPOTENCY_HEADER]: idempotencyKey
            },
            body: JSON.stringify({
              ciphertext: encrypted.ciphertext,
              nonce: encrypted.nonce,
              senderKeyId: encrypted.senderKeyId || undefined,
              replyToMessageId: replyContext?.id || undefined
            }),
            signal: controller.signal
          });
        })()
      : await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(win.currentDialogPublicId) + "/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            [THG_IDEMPOTENCY_HEADER]: idempotencyKey
          },
          body: JSON.stringify({
            body,
            replyToMessageId: replyContext?.id || undefined
          }),
          signal: controller.signal
        });

    const prepareDialogPayloadForDisplay = context.prepareDialogPayloadForDisplay ?? win.prepareDialogPayloadForDisplay;
    const preparedPayload = typeof prepareDialogPayloadForDisplay === "function"
      ? await prepareDialogPayloadForDisplay(payload.dialog, payload.message ? [payload.message] : [])
      : payload;
    const preparedMessage = preparedPayload.messages?.[0] || payload.message;

    win.localOutgoingMessages = (Array.isArray(win.localOutgoingMessages) ? win.localOutgoingMessages : [])
      .filter((message: Message) => message.id !== localMessageId);
    messageActions.setLocalOutgoing(win.localOutgoingMessages);

    const getMessagePreviewText = context.getMessagePreviewText ?? win.getMessagePreviewText;
    const updateDialogInState = context.updateDialogInState ?? win.updateDialogInState;
    if (typeof updateDialogInState === "function") {
      updateDialogInState(preparedPayload.dialog, {
        lastMessagePreview: (typeof getMessagePreviewText === "function" ? getMessagePreviewText(preparedMessage) : preparedMessage?.body) || body,
        lastMessageSenderName: preparedMessage.senderId === win.currentUserId
          ? "You"
          : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
        lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
      });
    }

    const appendConfirmedMessageToCurrentDialog = context.appendConfirmedMessageToCurrentDialog
      ?? win.appendConfirmedMessageToCurrentDialog;
    if (preparedPayload.dialog?.id === win.currentDialogId && preparedMessage) {
      if (typeof appendConfirmedMessageToCurrentDialog === "function") {
        appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
          scrollBehavior: "smooth",
          replaceMessageId: localMessageId,
          animateMessage: false
        });
      }
    } else {
      const rerenderCurrentDialog = context.rerenderCurrentDialog ?? win.rerenderCurrentDialog;
      if (typeof rerenderCurrentDialog === "function") {
        rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
      }
    }

    const playSound = context.playSound ?? win.playSound;
    if (typeof playSound === "function") {
      playSound("send");
    }

    const readSearchQuery = win.getSidebarCurrentSearchQuery;
    const currentSearchQuery = context.currentSearchQuery
      ?? (typeof readSearchQuery === "function" ? readSearchQuery() : "");
    const renderDialogs = context.renderDialogs ?? win.renderDialogs;
    if (!String(currentSearchQuery).trim() && typeof renderDialogs === "function") {
      renderDialogs(win.allDialogs);
    }
  } catch (error: any) {
    win.localOutgoingMessages = (Array.isArray(win.localOutgoingMessages) ? win.localOutgoingMessages : [])
      .map((message: Message) => (
        message.id === localMessageId
          ? { ...message, localStatus: "failed" as const }
          : message
      ));
    messageActions.setLocalOutgoing(win.localOutgoingMessages);

    const message = error instanceof Error ? error.message : "Failed to send message.";
    const setStatus = context.setStatus ?? win.setStatus;
    const showToast = context.showToast ?? win.showToast;
    if (typeof setStatus === "function") {
      setStatus(message, "error");
    }
    if (typeof showToast === "function") {
      showToast(message, "error");
    }
    if (typeof win.updateRenderedMessageStatus === "function") {
      win.updateRenderedMessageStatus(localMessageId, "failed");
    }
  } finally {
    window.clearTimeout(timeoutId);
    if (composerSend) {
      composerSend.disabled = false;
    }
    win.textMessageSendInFlight = false;
  }
}

export function installLegacyComposerSend(context: LegacyComposerSendContext = {}) {
  const win = getWin();
  win.sendLegacyComposerMessage = () => sendLegacyComposerMessage(context);
}
