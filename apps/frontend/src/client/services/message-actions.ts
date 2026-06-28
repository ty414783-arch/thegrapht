// Message Actions Service (Reply, Context Menu, Delete, Download, Jump to message)
export {};

const getWin = () => window as any;

const messageHighlightTimers = new Map<string, any>();
const deletingMessageIdsInFlight = new Set<string>();

const getCurrentDialogMessageById = (messageId: string): any => {
  const currentMessagesSnapshot = getWin().currentMessagesSnapshot;
  const localOutgoingMessages = getWin().localOutgoingMessages;
  return (
    (Array.isArray(currentMessagesSnapshot) && currentMessagesSnapshot.find((message: any) => message.id === messageId)) ||
    (Array.isArray(localOutgoingMessages) && localOutgoingMessages.find((message: any) => message.id === messageId)) ||
    null
  );
};

const getReplyPreviewCopy = (message: any): string => {
  if (!message) {
    return "";
  }

  if (message.albumId && Number(message.albumSize) > 1) {
    return (Number(message.albumSize) || 0) + " photos";
  }

  if (message.type === "image") {
    return message.body ? ("Photo: " + message.body) : "Photo";
  }

  if (message.type === "audio") {
    return message.body ? ("Audio: " + message.body) : "Audio";
  }

  return String(message.body || "").trim();
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

const syncComposerReplyPreview = () => {
  const composerReplyPreview = document.getElementById("composer-reply-preview");
  const composerReplyAuthor = document.getElementById("composer-reply-author");
  const composerReplyText = document.getElementById("composer-reply-text");
  if (!composerReplyPreview) {
    return;
  }

  const pendingReplyMessage = getWin().pendingReplyMessage;
  if (!pendingReplyMessage) {
    composerReplyPreview.classList.remove("visible");
    composerReplyPreview.setAttribute("aria-hidden", "true");
    if (composerReplyAuthor) composerReplyAuthor.textContent = "";
    if (composerReplyText) composerReplyText.textContent = "";
    return;
  }

  if (composerReplyAuthor) {
    composerReplyAuthor.textContent = pendingReplyMessage.senderName || "Message";
  }
  if (composerReplyText) {
    const renderEmojiAwareTextHtml = getWin().renderEmojiAwareTextHtml;
    composerReplyText.innerHTML = typeof renderEmojiAwareTextHtml === "function"
      ? renderEmojiAwareTextHtml(getReplyPreviewCopy(pendingReplyMessage) || "Message")
      : getReplyPreviewCopy(pendingReplyMessage) || "Message";
  }
  composerReplyPreview.classList.add("visible");
  composerReplyPreview.setAttribute("aria-hidden", "false");
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

const isMessageDownloadable = (message: any) => Boolean(
  message?.mediaUrl
  && (message.type === "image" || message.type === "video" || message.type === "audio")
);

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

const buildContextMenuButton = (action: string, label: string, icon: string, danger = false) => (
  '<button class="message-context-menu-item' + (danger ? ' danger' : '') + '" type="button" data-action="' + action + '">' +
    icon +
    '<span>' + label + '</span>' +
  '</button>'
);

const getContextMenuActions = (message: any) => {
  const currentUserId = getWin().currentUserId;
  const isOwn = message.senderId === currentUserId;
  const actions: any[] = [
    {
      key: "reply",
      label: "Reply",
      icon: typeof getWin().getIcon === "function" ? getWin().getIcon("reply", "", 'aria-hidden="true"') : ""
    }
  ];

  if (isMessageDownloadable(message)) {
    actions.push({
      key: "download",
      label: "Download",
      icon: typeof getWin().getIcon === "function" ? getWin().getIcon("download", "", 'aria-hidden="true"') : ""
    });
  }

  if (isOwn) {
    actions.push({
      key: "delete",
      label: "Delete",
      icon: typeof getWin().getIcon === "function" ? getWin().getIcon("delete", "", 'aria-hidden="true"') : "",
      danger: true
    });
  }

  return actions;
};

const openMessageContextMenu = (event: MouseEvent, message: any) => {
  if (!message) {
    return;
  }

  const messageContextMenuBody = document.getElementById("message-context-menu-body");
  const messageContextMenu = document.getElementById("message-context-menu");
  if (!messageContextMenuBody || !messageContextMenu) {
    return;
  }

  const actions = getContextMenuActions(message);
  messageContextMenuBody.innerHTML = actions
    .map((action) => buildContextMenuButton(action.key, action.label, action.icon, Boolean(action.danger)))
    .join("");

  messageContextMenuState = { message };
  const menuWidth = 220;
  const menuHeight = 160;
  const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
  const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
  messageContextMenu.style.left = left + "px";
  messageContextMenu.style.top = top + "px";
  messageContextMenu.classList.add("open");
  messageContextMenu.setAttribute("aria-hidden", "false");

  const composerInput = document.getElementById("composer-input");

  messageContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      if (!action) {
        return;
      }

      if (action === "reply") {
        setPendingReplyMessage(message);
        if (composerInput) composerInput.focus();
        closeMessageContextMenuSoon();
        return;
      }

      if (action === "download") {
        void downloadMessageMedia(message);
        closeMessageContextMenuSoon();
        return;
      }

      if (action === "delete") {
        openDeleteMessageModal(message);
        closeMessageContextMenuSoon();
      }
    });
  });
};

const downloadMessageMedia = async (message: any) => {
  if (!isMessageDownloadable(message)) {
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
  const currentUserId = getWin().currentUserId;
  const isOwn = message.senderId === currentUserId;
  const currentPathPublicId = String(window.location.pathname || "")
    .replace(/^\/+/, "")
    .split("/")[0];
  const currentDialogSnapshot = getWin().currentDialogSnapshot;
  const currentDialogPublicId = getWin().currentDialogPublicId;
  const isSavedDialog = currentDialogSnapshot?.type === "saved"
    || currentDialogSnapshot?.publicId === "-1002003143"
    || currentDialogPublicId === "-1002003143"
    || currentPathPublicId === "-1002003143"
    || String(currentDialogSnapshot?.title || "").toLowerCase() === "saved messages";
  const canDeleteForEveryone = !isSavedDialog && isOwn && !String(message.id || "").startsWith("local_");

  const deleteMessageForEveryoneWrap = document.getElementById("delete-message-for-everyone-wrap");
  const deleteMessageForEveryone = document.getElementById("delete-message-for-everyone") as HTMLInputElement | null;
  const deleteMessageForEveryoneLabel = document.getElementById("delete-message-for-everyone-label");
  const deleteMessageModal = document.getElementById("delete-message-modal");

  if (deleteMessageForEveryoneWrap) {
    deleteMessageForEveryoneWrap.hidden = !canDeleteForEveryone;
    deleteMessageForEveryoneWrap.style.display = canDeleteForEveryone ? "flex" : "none";
  }
  if (deleteMessageForEveryone) {
    deleteMessageForEveryone.disabled = !canDeleteForEveryone;
    deleteMessageForEveryone.checked = isOwn;
  }
  if (deleteMessageForEveryoneLabel) {
    deleteMessageForEveryoneLabel.textContent = "Also delete for everyone";
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
document.addEventListener("DOMContentLoaded", () => {
  const composerReplyPreview = document.getElementById("composer-reply-preview");
  const composerReplyClose = document.getElementById("composer-reply-close");
  const deleteMessageCancel = document.getElementById("delete-message-cancel");
  const deleteMessageConfirm = document.getElementById("delete-message-confirm");
  const deleteMessageModal = document.getElementById("delete-message-modal");
  const messageContextMenu = document.getElementById("message-context-menu");
  const messageList = document.getElementById("message-list");
  const composerInput = document.getElementById("composer-input");

  composerReplyPreview?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("#composer-reply-close")) {
      return;
    }
    const pendingReplyMessage = getWin().pendingReplyMessage;
    if (pendingReplyMessage?.id) {
      jumpToMessage(pendingReplyMessage.id);
    }
  });

  composerReplyClose?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearPendingReplyMessage();
  });

  deleteMessageCancel?.addEventListener("click", () => {
    closeDeleteMessageModal();
  });

  deleteMessageConfirm?.addEventListener("click", () => {
    void confirmDeleteMessage();
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

      const isSameTargetOpen = Boolean(
        messageContextMenu?.classList.contains("open") &&
        messageContextMenuState?.message &&
        String(messageContextMenuState.message.id) === String(messageId)
      );
      if (isSameTargetOpen) {
        event.preventDefault();
        closeMessageContextMenu();
        return;
      }

      const message = getCurrentDialogMessageById(messageId);
      if (!message) {
        return;
      }

      event.preventDefault();
      openMessageContextMenu(event, message);
    });

    messageList.addEventListener("click", (event) => {
      const replyNode = event.target instanceof Element ? event.target.closest(".message-reply[data-reply-target-id]") : null;
      if (!replyNode) {
        const messageTarget = event.target instanceof Element
          ? event.target.closest(".message-album-item[data-message-id], .message[data-message-id], .message-system-row[data-message-id]")
          : null;

        if (!messageTarget || event.detail < 2) {
          return;
        }

        if (event.target instanceof Element && event.target.closest("a, button, .message-reply")) {
          return;
        }

        const messageId = messageTarget.getAttribute("data-message-id");
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
        return;
      }

      const targetId = replyNode.getAttribute("data-reply-target-id");
      if (targetId) {
        event.preventDefault();
        event.stopPropagation();
        jumpToMessage(targetId);
      }
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
