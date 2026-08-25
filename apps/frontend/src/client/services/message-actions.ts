// Message Actions Service (Reply, Context Menu, Delete, Download, Jump to message)
import { onDomReady } from "../shared/lib/on-dom-ready.ts";
import {
  getLegacyContextMenuActions,
  getLegacyMessageLinkOrText,
  isLegacyMessageDownloadable
} from "../features/profile/legacyMessageContextMenuSync.ts";
import { renderLegacyMessageContextMenuBody } from "../features/profile/legacyMessageContextMenuMount.tsx";
import {
  getLegacyDeleteMessageModalState
} from "../features/chat/legacyDeleteMessageModalSync.ts";
import {
  mountLegacyDeleteMessageModalShell,
  renderLegacyDeleteMessageModalBody
} from "../features/chat/legacyDeleteMessageModalMount.tsx";
import {
  setLegacyComposerReplyPreviewHandlers,
  syncLegacyComposerReplyPreview
} from "../features/chat/legacyComposerReplyPreviewMount.tsx";

const getWin = () => window as any;

const messageHighlightTimers = new Map<string, any>();
const deletingMessageIdsInFlight = new Set<string>();

const canOpenMessageContextMenu = (): boolean => {
  const dialog = getWin().currentDialogSnapshot;
  if (!dialog) {
    return true;
  }
  if (dialog.type === "channel" && dialog.channelCanPost !== true) {
    return false;
  }
  return true;
};

const getCurrentDialogMessageById = (messageId: string): any => {
  const currentMessagesSnapshot = getWin().currentMessagesSnapshot;
  const localOutgoingMessages = getWin().localOutgoingMessages;
  return (
    (Array.isArray(currentMessagesSnapshot) && currentMessagesSnapshot.find((message: any) => message.id === messageId)) ||
    (Array.isArray(localOutgoingMessages) && localOutgoingMessages.find((message: any) => message.id === messageId)) ||
    null
  );
};

const syncComposerReplyPreview = () => {
  syncLegacyComposerReplyPreview(getWin().pendingReplyMessage);
};

const clearMessageHighlight = (messageId: string) => {
  const messageList = document.getElementById("message-list");
  const node = messageList?.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');
  if (node) {
    node.classList.remove("message-jump-highlight");
  }
  const timerId = messageHighlightTimers.get(messageId);
  if (timerId) {
    window.clearTimeout(timerId);
    messageHighlightTimers.delete(messageId);
  }
};

const jumpToMessage = (messageId: string) => {
  if (!messageId) {
    return;
  }

  const messageList = document.getElementById("message-list");
  if (!messageList) {
    return;
  }
  const node = messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');
  if (!node) {
    return;
  }

  const scrollHost = messageList;
  let stableFrames = 0;
  let previousTop = scrollHost.scrollTop;
  const maxWaitMs = 1800;
  const startedAt = Date.now();

  const startHighlight = () => {
    clearMessageHighlight(messageId);
    node.classList.remove("message-jump-highlight");
    void (node as HTMLElement).offsetWidth;
    node.classList.add("message-jump-highlight");
    messageHighlightTimers.set(
      messageId,
      window.setTimeout(() => {
        node.classList.remove("message-jump-highlight");
        messageHighlightTimers.delete(messageId);
      }, 3200)
    );
  };

  const waitForArrival = () => {
    const currentTop = scrollHost.scrollTop;
    const delta = Math.abs(currentTop - previousTop);
    previousTop = currentTop;
    stableFrames = delta < 1 ? stableFrames + 1 : 0;

    if (stableFrames >= 6 || Date.now() - startedAt > maxWaitMs) {
      startHighlight();
      return;
    }

    window.requestAnimationFrame(waitForArrival);
  };

  node.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });

  window.requestAnimationFrame(waitForArrival);
};

const setPendingReplyMessage = (message: any) => {
  const currentUserId = getWin().currentUserId;
  const currentUserDisplayName = getWin().currentUserDisplayName;
  const currentUserUsername = getWin().currentUserUsername;
  const workspaceUserName = document.getElementById("workspace-user-name");

  getWin().pendingReplyMessage = message
    ? {
        id: message.id,
        senderId: message.senderId || "",
        senderName: message.senderName || (message.senderId === currentUserId ? (currentUserDisplayName || currentUserUsername || workspaceUserName?.textContent || "You") : "Message"),
        body: message.body || "",
        type: message.type || "text",
        mediaUrl: message.mediaUrl || ""
      }
    : null;
  syncComposerReplyPreview();
};

const clearPendingReplyMessage = () => {
  getWin().pendingReplyMessage = null;
  syncComposerReplyPreview();
};

let messageContextMenuCloseTimer: any = null;
let messageContextMenuState: { message: any } | null = null;

const closeMessageContextMenu = () => {
  if (messageContextMenuCloseTimer) {
    window.clearTimeout(messageContextMenuCloseTimer);
    messageContextMenuCloseTimer = null;
  }
  const messageContextMenu = document.getElementById("message-context-menu");
  if (messageContextMenu) {
    messageContextMenu.classList.remove("open");
    messageContextMenu.setAttribute("aria-hidden", "true");
  }
  messageContextMenuState = null;
};

const closeMessageContextMenuSoon = () => {
  if (messageContextMenuCloseTimer) {
    window.clearTimeout(messageContextMenuCloseTimer);
  }
  messageContextMenuCloseTimer = window.setTimeout(() => {
    closeMessageContextMenu();
  }, 140);
};

const resolveDownloadMediaUrl = (rawUrl: string) => {
  const value = String(rawUrl || "").trim();
  if (!value) {
    return "";
  }
  if (value.startsWith("/v/")) {
    return "https://cdn.thegrapht.su" + value;
  }
  if (/^https?:\/\/web\.thegrapht\.su\/v\//i.test(value)) {
    return value.replace(/^https?:\/\/web\.thegrapht\.su/i, "https://cdn.thegrapht.su");
  }
  return value;
};

const handleMessageContextMenuAction = (action: string, message: any) => {
  if (action === "reply") {
    setPendingReplyMessage(message);
    const composerInput = document.getElementById("composer-input");
    if (composerInput) {
      composerInput.focus();
    }
    closeMessageContextMenu();
    return;
  }

  if (action === "edit") {
    const startEditingMessage = getWin().startEditingMessage;
    if (typeof startEditingMessage === "function") {
      startEditingMessage(message);
    }
    closeMessageContextMenu();
    return;
  }

  if (action === "copy_text") {
    if (message.body && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(message.body);
    }
    closeMessageContextMenuSoon();
    return;
  }

  if (action === "copy_link") {
    const link = getLegacyMessageLinkOrText(message);
    if (link && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(link);
    }
    closeMessageContextMenuSoon();
    return;
  }

  if (action === "download") {
    void downloadMessageMedia(message);
    closeMessageContextMenuSoon();
    return;
  }

  if (action === "pin") {
    const togglePinMessage = getWin().togglePinMessage;
    if (typeof togglePinMessage === "function") {
      togglePinMessage(message);
    }
    closeMessageContextMenuSoon();
    return;
  }

  if (action === "delete") {
    openDeleteMessageModal(message);
    closeMessageContextMenu();
  }
};

const openMessageContextMenu = (
  event: MouseEvent | TouchEvent | { clientX?: number; clientY?: number },
  message: any
) => {
  if (!message || !canOpenMessageContextMenu()) {
    return;
  }

  const messageContextMenuBody = document.getElementById("message-context-menu-body");
  const messageContextMenu = document.getElementById("message-context-menu");
  if (!messageContextMenuBody || !messageContextMenu) {
    return;
  }

  const actions = getLegacyContextMenuActions(message);
  renderLegacyMessageContextMenuBody(
    messageContextMenuBody,
    actions,
    (actionKey) => handleMessageContextMenuAction(actionKey, message)
  );

  messageContextMenuState = { message };

  let clientX = (event as any).clientX || 0;
  let clientY = (event as any).clientY || 0;
  if ((event as any).touches && (event as any).touches[0]) {
    clientX = (event as any).touches[0].clientX;
    clientY = (event as any).touches[0].clientY;
  }

  const menuWidth = 200;
  const menuHeight = actions.length * 40 + 20;
  const left = Math.min(window.innerWidth - menuWidth - 16, Math.max(16, clientX || (window.innerWidth / 2 - menuWidth / 2)));
  const top = Math.min(window.innerHeight - menuHeight - 16, Math.max(16, clientY || (window.innerHeight / 2 - menuHeight / 2)));
  messageContextMenu.style.left = left + "px";
  messageContextMenu.style.top = top + "px";
  messageContextMenu.classList.add("open");
  messageContextMenu.setAttribute("aria-hidden", "false");
};

const downloadMessageMedia = async (message: any) => {
  if (!isLegacyMessageDownloadable(message)) {
    return;
  }

  try {
    const messageId = String(message?.id || "").trim();
    if (!messageId || messageId.startsWith("local_")) {
      throw new Error("Media is not ready yet.");
    }
    const apiBase = getWin().apiBase || "/api";
    const mediaUrl = apiBase + "/v1/messages/" + encodeURIComponent(messageId) + "/media";

    const requestHeaders: Record<string, string> = {};
    const host = String(window.location.hostname || "").toLowerCase();
    const isDesktop = host === "" || (typeof window !== "undefined" && (!!(window as any).tgDesktop || !!(window as any).__TAURI_INTERNALS__));
    const canUseLegacyAuthorizationHeader = host === "localhost"
      || host === "127.0.0.1"
      || host.endsWith(".local")
      || isDesktop;
    const legacySessionToken = getWin().legacySessionToken;
    if (canUseLegacyAuthorizationHeader && legacySessionToken) {
      requestHeaders.Authorization = "Bearer " + legacySessionToken;
    }

    const response = await fetch(mediaUrl, {
      credentials: "include",
      headers: requestHeaders
    });
    if (!response.ok) {
      throw new Error("Failed to download file.");
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const extensionFallback = message.type === "video" ? ".mp4" : ".jpg";
    const filename = message.attachmentName || (message.id + extensionFallback);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch (error: any) {
    const showToast = getWin().showToast;
    if (typeof showToast === "function") {
      showToast(error instanceof Error ? error.message : "Failed to download file.", "error");
    }
  }
};

let deleteMessageTarget: any = null;

const closeDeleteMessageModal = () => {
  deleteMessageTarget = null;
  const deleteMessageModal = document.getElementById("delete-message-modal");
  if (deleteMessageModal) {
    deleteMessageModal.classList.remove("open");
    deleteMessageModal.setAttribute("aria-hidden", "true");
  }
};

const openDeleteMessageModal = (message: any) => {
  deleteMessageTarget = message;
  const modalState = getLegacyDeleteMessageModalState(message);
  const shellEl = document.querySelector("#delete-message-modal .delete-message-modal-shell");
  const deleteMessageModal = document.getElementById("delete-message-modal");

  if (shellEl instanceof HTMLElement) {
    renderLegacyDeleteMessageModalBody(shellEl, {
      ...modalState,
      onCancel: closeDeleteMessageModal,
      onConfirm: () => {
        void confirmDeleteMessage();
      },
      onDeleteForEveryoneChange: () => {}
    });
  }

  if (deleteMessageModal) {
    deleteMessageModal.classList.add("open");
    deleteMessageModal.setAttribute("aria-hidden", "false");
  }
};

const animateMessageRemoval = (messageId: string) => new Promise<void>((resolve) => {
  const messageList = document.getElementById("message-list");
  const targetNode = messageList?.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');

  if (!targetNode) {
    resolve();
    return;
  }

  const removableNode = targetNode.classList.contains("message")
    ? targetNode
    : (targetNode.closest(".message") || targetNode);

  removableNode.classList.add("message-removing");
  window.setTimeout(resolve, 320);
});

const confirmDeleteMessage = async () => {
  if (!deleteMessageTarget) {
    return;
  }

  const target = deleteMessageTarget;
  const targetId = String(target.id || "");
  if (!targetId) {
    return;
  }
  if (deletingMessageIdsInFlight.has(targetId)) {
    return;
  }
  deletingMessageIdsInFlight.add(targetId);

  const markMessageDeletedLocally = getWin().markMessageDeletedLocally;
  if (typeof markMessageDeletedLocally === "function") {
    markMessageDeletedLocally(targetId);
  }

  const computeIsNearChatBottom = getWin().computeIsNearChatBottom;
  const shouldStickToBottom = typeof computeIsNearChatBottom === "function" ? computeIsNearChatBottom() : false;
  closeDeleteMessageModal();

  const removeLocalOutgoingMessage = getWin().removeLocalOutgoingMessage;
  const rerenderCurrentDialog = getWin().rerenderCurrentDialog;
  const showToast = getWin().showToast;
  const handleMessageDeletedEvent = getWin().handleMessageDeletedEvent;
  const fetchJson = getWin().fetchJson;

  if (targetId.startsWith("local_")) {
    await animateMessageRemoval(targetId);
    if (typeof removeLocalOutgoingMessage === "function") {
      removeLocalOutgoingMessage(targetId);
    }
    if (typeof rerenderCurrentDialog === "function") {
      rerenderCurrentDialog({ scrollBehavior: shouldStickToBottom ? "auto" : "none" });
    }
    deletingMessageIdsInFlight.delete(targetId);
    return;
  }

  const deleteMessageForEveryone = document.getElementById("delete-message-for-everyone") as HTMLInputElement | null;
  const deleteMessageForEveryoneWrap = document.getElementById("delete-message-for-everyone-wrap");

  try {
    const apiBase = getWin().apiBase || "/api";
    if (typeof fetchJson !== "function") {
      throw new Error("fetchJson is not available.");
    }
    const payload = await fetchJson(apiBase + "/v1/messages/" + encodeURIComponent(targetId), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        deleteForEveryone: Boolean(
          deleteMessageForEveryone &&
          deleteMessageForEveryoneWrap &&
          deleteMessageForEveryone.checked &&
          !deleteMessageForEveryone.disabled
        )
      })
    });

    await animateMessageRemoval(targetId);
    if (typeof handleMessageDeletedEvent === "function") {
      handleMessageDeletedEvent(payload);
    }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? String(error.message || "") : "";
    if (errorMessage.includes("Сообщение не найдено")) {
      // Treat 404 as already deleted and reconcile UI immediately.
      if (typeof handleMessageDeletedEvent === "function") {
        handleMessageDeletedEvent({
          ok: true,
          messageId: targetId,
          deletedForEveryone: Boolean(
            deleteMessageForEveryone &&
            deleteMessageForEveryoneWrap &&
            deleteMessageForEveryone.checked &&
            !deleteMessageForEveryone.disabled
          ),
          dialog: getWin().currentDialogSnapshot || null
        });
      }
    } else {
      if (typeof showToast === "function") {
        showToast(error instanceof Error ? error.message : "Failed to delete message.", "error");
      }
    }
  } finally {
    deletingMessageIdsInFlight.delete(targetId);
  }
};

// Event Listeners setup when DOM is ready
onDomReady(() => {
  setLegacyComposerReplyPreviewHandlers({
    onClose: clearPendingReplyMessage
  });

  const composerReplyPreview = document.getElementById("composer-reply-preview");
  const deleteMessageModal = document.getElementById("delete-message-modal");
  const messageContextMenu = document.getElementById("message-context-menu");
  const messageList = document.getElementById("message-list");
  const composerInput = document.getElementById("composer-input");

  mountLegacyDeleteMessageModalShell(() => ({
    onCancel: closeDeleteMessageModal,
    onConfirm: () => {
      void confirmDeleteMessage();
    },
    onDeleteForEveryoneChange: () => {}
  }));

  composerReplyPreview?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("#composer-reply-close")) {
      return;
    }
    const pendingReplyMessage = getWin().pendingReplyMessage;
    if (pendingReplyMessage?.id) {
      jumpToMessage(pendingReplyMessage.id);
    }
  });

  deleteMessageModal?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target && !target.closest(".delete-message-modal-shell")) {
      closeDeleteMessageModal();
    }
  });

  messageContextMenu?.addEventListener("mouseenter", () => {
    if (messageContextMenuCloseTimer) {
      window.clearTimeout(messageContextMenuCloseTimer);
      messageContextMenuCloseTimer = null;
    }
  });

  messageContextMenu?.addEventListener("mouseleave", () => {
    closeMessageContextMenuSoon();
  });

  document.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }
    if (event.button === 2) {
      return;
    }

    if (!target.closest("#message-context-menu")) {
      closeMessageContextMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && deleteMessageModal?.classList.contains("open")) {
      event.preventDefault();
      event.stopPropagation();
      closeDeleteMessageModal();
      return;
    }

    if (event.key === "Escape" && messageContextMenu?.classList.contains("open")) {
      event.preventDefault();
      event.stopPropagation();
      closeMessageContextMenu();
    }
  });

  if (messageList) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchActiveMessage: HTMLElement | null = null;
    let touchActiveBubble: HTMLElement | null = null;
    let touchSwipeDist = 0;
    let touchHoldTimer: any = null;

    messageList.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const target = e.target instanceof Element
        ? e.target.closest(".message-album-item[data-message-id], .message[data-message-id]")
        : null;
      if (!target) return;

      if (e.target instanceof Element && e.target.closest("a, button, .message-reply, .video-player")) {
        return;
      }

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchActiveMessage = target as HTMLElement;
      touchActiveBubble = (target.querySelector(".message-bubble") || target) as HTMLElement;
      touchSwipeDist = 0;

      const messageId = target.getAttribute("data-message-id");
      if (messageId) {
        if (touchHoldTimer) window.clearTimeout(touchHoldTimer);
        touchHoldTimer = window.setTimeout(() => {
          if (!canOpenMessageContextMenu()) {
            return;
          }
          const message = getCurrentDialogMessageById(messageId);
          if (message) {
            openMessageContextMenu({ clientX: touchStartX, clientY: touchStartY }, message);
          }
        }, 380);
      }
    }, { passive: true });

    messageList.addEventListener("touchmove", (e: TouchEvent) => {
      if (!touchActiveMessage || !touchActiveBubble || !e.touches[0]) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        if (touchHoldTimer) {
          window.clearTimeout(touchHoldTimer);
          touchHoldTimer = null;
        }
        if (touchSwipeDist !== 0) {
          touchActiveBubble.style.transform = "none";
          touchSwipeDist = 0;
        }
        return;
      }

      if (deltaX < -10) {
        if (touchHoldTimer) {
          window.clearTimeout(touchHoldTimer);
          touchHoldTimer = null;
        }
        touchSwipeDist = Math.max(-80, deltaX);
        touchActiveBubble.style.transform = `translateX(${touchSwipeDist}px) translateZ(0)`;
      }
    }, { passive: true });

    const handleTouchEndOrCancel = () => {
      if (touchHoldTimer) {
        window.clearTimeout(touchHoldTimer);
        touchHoldTimer = null;
      }

      if (touchActiveMessage && touchActiveBubble) {
        const messageId = touchActiveMessage.getAttribute("data-message-id");
        if (touchSwipeDist < -35 && messageId && canOpenMessageContextMenu()) {
          const message = getCurrentDialogMessageById(messageId);
          if (message) {
            setPendingReplyMessage(message);
            if (composerInput) composerInput.focus();
          }
        }

        const bubble = touchActiveBubble;
        bubble.style.transition = "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        bubble.style.transform = "translateX(0) translateZ(0)";
        window.setTimeout(() => {
          if (bubble) {
            bubble.style.transition = "";
            bubble.style.transform = "";
          }
        }, 260);
      }

      touchActiveMessage = null;
      touchActiveBubble = null;
      touchSwipeDist = 0;
    };

    messageList.addEventListener("touchend", handleTouchEndOrCancel, { passive: true });
    messageList.addEventListener("touchcancel", handleTouchEndOrCancel, { passive: true });

    messageList.addEventListener("contextmenu", (event: any) => {
      const target = event.target instanceof Element
        ? event.target.closest(".message-album-item[data-message-id], .message[data-message-id], .message-system-row[data-message-id]")
        : null;

      if (!target) {
        return;
      }

      const messageId = target.getAttribute("data-message-id");
      if (!messageId) {
        return;
      }

      const isContextMenuOpen = Boolean(messageContextMenu?.classList.contains("open"));
      if (isContextMenuOpen) {
        event.preventDefault();
        closeMessageContextMenu();
        return;
      }

      const message = getCurrentDialogMessageById(messageId);
      if (!message || !canOpenMessageContextMenu()) {
        return;
      }

      event.preventDefault();
      openMessageContextMenu(event, message);
    });

    messageList.addEventListener("click", (event) => {
      const replyNode = event.target instanceof Element ? event.target.closest(".message-reply[data-reply-target-id]") : null;
      if (replyNode) {
        const targetId = replyNode.getAttribute("data-reply-target-id");
        if (targetId) {
          event.preventDefault();
          event.stopPropagation();
          jumpToMessage(targetId);
        }
        return;
      }

      if (event.target instanceof Element && event.target.closest("a, button, audio, video, input, textarea, .message-reply, .message-mention")) {
        return;
      }

      const messageTarget = event.target instanceof Element
        ? event.target.closest(".message-album-item[data-message-id], .message[data-message-id]")
        : null;

      if (!messageTarget) {
        return;
      }

      const messageId = messageTarget.getAttribute("data-message-id");
      if (!messageId) {
        return;
      }

      const isContextMenuOpen = Boolean(messageContextMenu?.classList.contains("open"));
      if (isContextMenuOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeMessageContextMenu();
        return;
      }

      const message = getCurrentDialogMessageById(messageId);
      if (!message) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openMessageContextMenu(event, message);
    });

    messageList.addEventListener("dblclick", (event) => {
      const target = event.target instanceof Element
        ? event.target.closest(".message-album-item[data-message-id], .message[data-message-id], .message-system-row[data-message-id]")
        : null;

      if (!target) {
        return;
      }

      if (event.target instanceof Element && event.target.closest("a, button, .message-reply")) {
        return;
      }

      const messageId = target.getAttribute("data-message-id");
      if (!messageId) {
        return;
      }

      const message = getCurrentDialogMessageById(messageId);
      if (!message) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setPendingReplyMessage(message);
      if (composerInput) composerInput.focus();
    });
  }

  syncComposerReplyPreview();
});

// Bind to window for integration with legacy components
getWin().setPendingReplyMessage = setPendingReplyMessage;
getWin().clearPendingReplyMessage = clearPendingReplyMessage;
getWin().downloadMessageMedia = downloadMessageMedia;
getWin().openDeleteMessageModal = openDeleteMessageModal;
getWin().confirmDeleteMessage = confirmDeleteMessage;
getWin().jumpToMessage = jumpToMessage;
getWin().closeMessageContextMenu = closeMessageContextMenu;
getWin().closeDeleteMessageModal = closeDeleteMessageModal;
