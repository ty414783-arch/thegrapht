export const buildMediaClientChunk = ({
  sendLocalSoundUrl,
  messageSoundUrl,
  logoDataUrl,
  wsBaseUrl
}) => `      const getLocalMessagesForDialog = (dialogPublicId) => localOutgoingMessages.filter((message) => message.dialogPublicId === dialogPublicId);

      const releaseLocalMessageMediaUrls = () => {
        for (const message of localOutgoingMessages) {
          if (message?.mediaUrl && String(message.mediaUrl).startsWith("blob:")) {
            URL.revokeObjectURL(message.mediaUrl);
          }
        }
      };

      const formatBytes = (bytes) => {
        if (!Number.isFinite(bytes) || bytes <= 0) {
          return "";
        }

        if (bytes >= 1024 * 1024) {
          return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + " MB";
        }

        return Math.max(1, Math.round(bytes / 1024)) + " KB";
      };

      const formatPhotoCount = (count) => count === 1 ? "1 фотография" : count + " фотографий";

      const chunkItems = (items, size) => {
        const result = [];

        for (let index = 0; index < items.length; index += size) {
          result.push(items.slice(index, index + size));
        }

        return result;
      };

      const canUseNotifications = () => typeof Notification !== "undefined";

      const ensureNotificationPermission = async () => {
        if (!canUseNotifications() || Notification.permission !== "default") {
          return Notification?.permission || "denied";
        }

        try {
          return await Notification.requestPermission();
        } catch {
          return Notification.permission || "denied";
        }
      };

      const bindNotificationPermissionPrompt = () => {
        if (notificationPermissionBound || !canUseNotifications()) {
          return;
        }

        notificationPermissionBound = true;

        const unlock = () => {
          sendAudioNode = ensureAudioNode(sendAudioNode, ${JSON.stringify(sendLocalSoundUrl)});
          messageAudioNode = ensureAudioNode(messageAudioNode, ${JSON.stringify(messageSoundUrl)});
          try { sendAudioNode.load(); } catch {}
          try { messageAudioNode.load(); } catch {}
          window.removeEventListener("pointerdown", unlock, true);
          window.removeEventListener("keydown", unlock, true);
          window.removeEventListener("touchstart", unlock, true);
        };

        window.addEventListener("pointerdown", unlock, true);
        window.addEventListener("keydown", unlock, true);
        window.addEventListener("touchstart", unlock, true);
      };

      const ensureAudioNode = (currentNode, src) => {
        if (currentNode) {
          return currentNode;
        }

        const audio = new Audio(src);
        audio.preload = "auto";
        return audio;
      };

      const playSound = (kind) => {
        const node = ensureAudioNode(kind === "send" ? sendAudioNode : messageAudioNode, kind === "send" ? ${JSON.stringify(sendLocalSoundUrl)} : ${JSON.stringify(messageSoundUrl)});

        if (kind === "send") {
          sendAudioNode = node;
        } else {
          messageAudioNode = node;
        }

        try {
          node.currentTime = 0;
          const playPromise = node.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } catch {}
      };

      const isWindowInactive = () => document.hidden || !document.hasFocus();

      const readNotificationOwner = () => {
        try {
          const raw = window.localStorage.getItem(NOTIFICATION_OWNER_STORAGE_KEY);
          if (!raw) {
            return null;
          }

          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") {
            return null;
          }

          return {
            tabId: typeof parsed.tabId === "string" ? parsed.tabId : "",
            expiresAt: Number(parsed.expiresAt) || 0
          };
        } catch {
          return null;
        }
      };

      const writeNotificationOwner = (force = false) => {
        const now = Date.now();
        const currentOwner = readNotificationOwner();
        const canClaim = force
          || !currentOwner
          || !currentOwner.tabId
          || currentOwner.expiresAt <= now
          || currentOwner.tabId === notificationTabId;

        if (!canClaim) {
          return false;
        }

        try {
          window.localStorage.setItem(NOTIFICATION_OWNER_STORAGE_KEY, JSON.stringify({
            tabId: notificationTabId,
            expiresAt: now + NOTIFICATION_OWNER_TTL_MS
          }));
          return true;
        } catch {
          return false;
        }
      };

      const isNotificationOwner = () => {
        const currentOwner = readNotificationOwner();
        return Boolean(currentOwner && currentOwner.tabId === notificationTabId && currentOwner.expiresAt > Date.now());
      };

      const refreshNotificationOwnership = () => {
        const shouldForce = !document.hidden || document.hasFocus();
        writeNotificationOwner(shouldForce);
      };

      const startNotificationOwnershipHeartbeat = () => {
        if (notificationOwnershipTimer) {
          window.clearInterval(notificationOwnershipTimer);
        }

        refreshNotificationOwnership();
        notificationOwnershipTimer = window.setInterval(() => {
          const currentOwner = readNotificationOwner();
          if (!currentOwner || currentOwner.tabId === notificationTabId || !document.hidden || document.hasFocus()) {
            refreshNotificationOwnership();
          }
        }, NOTIFICATION_OWNER_HEARTBEAT_MS);
      };

      const pruneRecentMessageNotifications = () => {
        const threshold = Date.now() - MESSAGE_NOTIFICATION_DEDUPE_MS;
        recentMessageNotificationTimes.forEach((timestamp, key) => {
          if (timestamp <= threshold) {
            recentMessageNotificationTimes.delete(key);
          }
        });
      };

      const shouldSkipMessageNotification = (messageId) => {
        pruneRecentMessageNotifications();
        const previousTimestamp = recentMessageNotificationTimes.get(messageId);
        const now = Date.now();
        if (previousTimestamp && now - previousTimestamp < MESSAGE_NOTIFICATION_DEDUPE_MS) {
          return true;
        }

        recentMessageNotificationTimes.set(messageId, now);
        return false;
      };

      const showBackgroundRefreshNotification = async () => {
        if (!currentUserId || !document.hidden || !isNotificationOwner()) {
          return;
        }

        const permission = await ensureNotificationPermission();
        if (permission !== "granted") {
          return;
        }

        try {
          const notification = new Notification("TheGrapht", {
            body: "Этот сайт был обновлён в фоновом режиме",
            icon: ${JSON.stringify(logoDataUrl)},
            badge: ${JSON.stringify(logoDataUrl)},
            tag: "thegrapht_background_refresh",
            renotify: false
          });

          window.setTimeout(() => {
            try {
              notification.close();
            } catch {}
          }, 6500);
        } catch {}
      };

      const scheduleBackgroundRefresh = () => {
        if (backgroundRefreshTimer) {
          window.clearInterval(backgroundRefreshTimer);
          backgroundRefreshTimer = null;
        }

        if (!currentUserId || !document.hidden) {
          return;
        }

        backgroundRefreshTimer = window.setInterval(() => {
          void (async () => {
            if (backgroundRefreshInFlight || !currentUserId || !document.hidden) {
              return;
            }

            backgroundRefreshInFlight = true;
            try {
              await loadWorkspace({ preserveRoute: true, scrollBehavior: "none" });
              await showBackgroundRefreshNotification();
            } catch {} finally {
              backgroundRefreshInFlight = false;
            }
          })();
        }, BACKGROUND_REFRESH_INTERVAL_MS);
      };

      const buildNotificationAvatarUrl = (name) => {
        const avatar = getAvatarMeta(name || "?", name || "?");
        return avatar.avatarUrl;
      };

      const isUndecryptableSecurePlaceholder = (value) => {
        const normalized = String(value || "").trim();
        return normalized === "[Не удалось расшифровать сообщение]"
          || normalized === "[Нет локального ключа шифрования]"
          || normalized === "Новое зашифрованное сообщение"
          || normalized === "Encrypted message";
      };

      const showIncomingDesktopNotification = async (message, dialog) => {
        if (!message?.id || message.senderId === currentUserId || !isWindowInactive() || !isNotificationOwner()) {
          return;
        }

        const previewBody = String(getMessagePreviewText(message) || "").trim();
        const shouldSkipSecureNotification = message?.decryptionFailed
          || !previewBody
          || isUndecryptableSecurePlaceholder(previewBody);

        if (shouldSkipSecureNotification) {
          wsInfo("notification_skipped", {
            messageId: message.id || null,
            dialogId: dialog?.id || dialog?.publicId || null,
            reason: message?.decryptionFailed ? "decryption_failed" : (!previewBody ? "empty_preview" : "placeholder_preview")
          });
          return;
        }

        if (!claimNotificationDelivery("message", message.id, 20000)) {
          return;
        }

        if (desktopNotificationIds.has(message.id) || shouldSkipMessageNotification(message.id)) {
          return;
        }

        desktopNotificationIds.add(message.id);

        const title = String(message.senderName || dialog?.title || "TheGraphT");
        const body = message.replyToSenderId === currentUserId
          ? ("Ответил(а) на ваше сообщение: " + (previewBody || (message.type === "image" ? "Фотография" : "Новое сообщение")))
          : (previewBody || (message.type === "image" ? "Фотография" : "Новое сообщение"));

        playSound("message");

        const permission = await ensureNotificationPermission();
        if (permission !== "granted") {
          return;
        }

        try {
          const notification = new Notification(title, {
            body,
            icon: buildNotificationAvatarUrl(title),
            badge: ${JSON.stringify(logoDataUrl)},
            tag: "message_" + message.id,
            renotify: false
          });

          window.setTimeout(() => {
            try {
              notification.close();
            } catch {}
          }, 8000);

          notification.onclick = () => {
            window.focus();
            if (dialog?.publicId) {
              pendingDialogPublicIdFromNotification = dialog.publicId;
              applyRoute(dialog.publicId);
              void loadDialog(dialog.publicId, { scrollBehavior: "auto" });
            }
            notification.close();
          };
        } catch {}
      };

      const getConstrainedImageSize = (naturalWidth, naturalHeight) => {
        if (!naturalWidth || !naturalHeight) {
          return null;
        }

        const maxWidth = Math.min(320, Math.max(180, Math.floor(window.innerWidth * 0.46)));
        const maxHeight = Math.min(420, Math.max(220, Math.floor(window.innerHeight * 0.56)));
        const ratio = naturalWidth / naturalHeight;
        let width = Math.min(naturalWidth, maxWidth);
        let height = width / ratio;

        if (height > maxHeight) {
          height = maxHeight;
          width = height * ratio;
        }

        return {
          width: Math.round(width),
          height: Math.round(height)
        };
      };

      const getImageShellStyle = (message) => {
        if (message?.albumId) {
          return "";
        }

        const dimensions = readCachedImageDimensions(message?.mediaUrl);
        const size = dimensions
          ? getConstrainedImageSize(dimensions.naturalWidth, dimensions.naturalHeight)
          : null;

        return size ? ' style="width: ' + size.width + 'px; height: ' + size.height + 'px;"' : "";
      };

      const markMessageImageLoaded = (imageNode) => {
        if (!(imageNode instanceof HTMLImageElement)) {
          return;
        }

        const shell = imageNode.closest(".message-image-shell");

        if (!shell) {
          return;
        }

        const isAlbumTile = Boolean(shell.closest(".message-album-item"));
        writeImageDimensions(imageNode.currentSrc || imageNode.src, imageNode);

        if (!isAlbumTile && imageNode.naturalWidth > 0 && imageNode.naturalHeight > 0) {
          const size = getConstrainedImageSize(imageNode.naturalWidth, imageNode.naturalHeight);
          if (size) {
            shell.style.width = size.width + "px";
            shell.style.height = size.height + "px";
          }
        }

        shell.classList.add("loaded");
      };

      const hydrateMessageImages = (options = {}) => {
        const lockToken = options.lockToken || 0;
        const pendingImages = [];
        const keepBottomPinned = () => {
          if (lockToken && lockToken === bottomLockToken) {
            hardPinMessagesToBottom(lockToken);
          }
        };

        messageList.querySelectorAll(".message-image").forEach((imageNode) => {
          if (!(imageNode instanceof HTMLImageElement) || imageNode.dataset.hydrated === "true") {
            return;
          }

          imageNode.dataset.hydrated = "true";
          imageNode.addEventListener("load", () => {
            markMessageImageLoaded(imageNode);
            keepBottomPinned();
          });
          imageNode.addEventListener("error", () => {
            const shell = imageNode.closest(".message-image-shell");
            if (shell) {
              shell.classList.add("loaded");
            }
            keepBottomPinned();
          });

          if (imageNode.complete && imageNode.naturalWidth > 0) {
            markMessageImageLoaded(imageNode);
            keepBottomPinned();
            return;
          }

          pendingImages.push(imageNode);
        });

        return pendingImages;
      };

      const renderComposerAttachmentPreview = () => {
        composerAttachmentPreview.classList.remove("visible");
        composerAttachmentImage.removeAttribute("src");
        composerAttachmentMeta.textContent = "";
        syncComposerState();
      };

      const clearPendingImageAttachment = (options = {}) => {
        const preservePreviewUrls = new Set(options.preservePreviewUrls || []);
        const closingAttachments = pendingImageAttachments.slice();
        const cleanupToken = ++attachmentModalCleanupToken;

        if (attachmentModalCleanupTimer) {
          window.clearTimeout(attachmentModalCleanupTimer);
          attachmentModalCleanupTimer = null;
        }

        pendingImageAttachments = [];
        pendingImageAttachmentIndex = 0;
        pendingImageCaption = "";
        if (composerFileInput) {
          composerFileInput.value = "";
        }
        attachmentModalCaption.value = "";
        attachmentModalEmojiPicker?.classList.remove("open");
        attachmentModalEmojiPicker?.setAttribute("aria-hidden", "true");
        attachmentModal.classList.remove("open");
        attachmentModal.setAttribute("aria-hidden", "true");
        attachmentModalPrev.hidden = true;
        attachmentModalNext.hidden = true;
        renderComposerAttachmentPreview();

        attachmentModalCleanupTimer = window.setTimeout(() => {
          if (cleanupToken !== attachmentModalCleanupToken || attachmentModal.classList.contains("open")) {
            return;
          }

          for (const attachment of closingAttachments) {
            if (attachment?.previewUrl && !preservePreviewUrls.has(attachment.previewUrl)) {
              URL.revokeObjectURL(attachment.previewUrl);
            }
          }

          attachmentModalImage.removeAttribute("src");
          attachmentModalImage.alt = "";
          attachmentModalImage.parentElement?.classList.remove("loading");
          attachmentModalStrip.innerHTML = "";
        }, 220);
      };

      const moveAttachmentModal = (direction) => {
        if (pendingImageAttachments.length < 2) {
          return;
        }

        pendingImageAttachmentIndex = (pendingImageAttachmentIndex + direction + pendingImageAttachments.length) % pendingImageAttachments.length;
        renderAttachmentModal();
      };

      const renderAttachmentModal = () => {
        const attachment = pendingImageAttachments[pendingImageAttachmentIndex];

        if (!attachment) {
          attachmentModal.classList.remove("open");
          attachmentModal.setAttribute("aria-hidden", "true");
          return;
        }

        attachmentModalTitle.textContent = formatPhotoCount(pendingImageAttachments.length);
        attachmentModalImage.parentElement?.classList.add("loading");
        attachmentModalImage.src = attachment.previewUrl;
        attachmentModalImage.alt = attachment.file.name || "Фотография";
        attachmentModalImage.onload = () => {
          attachmentModalImage.parentElement?.classList.remove("loading");
        };
        attachmentModalImage.onerror = () => {
          attachmentModalImage.parentElement?.classList.remove("loading");
        };
        if (attachmentModalImage.complete && attachmentModalImage.naturalWidth > 0) {
          attachmentModalImage.parentElement?.classList.remove("loading");
        }
        attachmentModalCaption.value = pendingImageCaption;
        attachmentModalPrev.hidden = pendingImageAttachments.length < 2;
        attachmentModalNext.hidden = pendingImageAttachments.length < 2;
        attachmentModalStrip.hidden = pendingImageAttachments.length < 2;
        attachmentModalStrip.innerHTML = pendingImageAttachments.map((entry, index) => {
          return '<button class="attachment-modal-thumb' + (index === pendingImageAttachmentIndex ? ' active' : '') + '" type="button" data-attachment-index="' + index + '">' +
            '<img src="' + escapeHtml(entry.previewUrl) + '" alt="' + escapeHtml(entry.file.name || "Фотография") + '" />' +
          '</button>';
        }).join("");

        attachmentModal.classList.add("open");
        attachmentModal.setAttribute("aria-hidden", "false");

        attachmentModalStrip.querySelectorAll("[data-attachment-index]").forEach((button) => {
          button.addEventListener("click", () => {
            pendingImageAttachmentIndex = Number(button.getAttribute("data-attachment-index")) || 0;
            renderAttachmentModal();
          });
        });
      };

      const openAttachmentModal = (index = 0) => {
        if (!pendingImageAttachments.length) {
          return;
        }

        attachmentModalCleanupToken += 1;
        if (attachmentModalCleanupTimer) {
          window.clearTimeout(attachmentModalCleanupTimer);
          attachmentModalCleanupTimer = null;
        }

        pendingImageAttachmentIndex = Math.max(0, Math.min(index, pendingImageAttachments.length - 1));
        renderAttachmentModal();
      };

      const addPendingImageAttachments = (files) => {
        const validFiles = Array.from(files || []).filter((file) => file && String(file.type || "").startsWith("image/"));

        if (!validFiles.length) {
          showToast("Поддерживаются только изображения.", "error");
          return;
        }

        const availableSlots = Math.max(0, MAX_MEDIA_ATTACHMENTS - pendingImageAttachments.length);

        if (!availableSlots) {
          showToast("Можно выбрать максимум 500 фотографий за раз.", "error");
          return;
        }

        const acceptedFiles = validFiles.slice(0, availableSlots);

        if (acceptedFiles.length < validFiles.length) {
          showToast("Лимит выбора: 500 фотографий.", "error");
        }

        const nextAttachments = acceptedFiles.map((file) => ({
          id: "draft_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
          file,
          previewUrl: URL.createObjectURL(file)
        }));

        if (!pendingImageCaption && composerInput.value.trim()) {
          pendingImageCaption = composerInput.value.trim();
          composerInput.value = "";
        }

        pendingImageAttachments = pendingImageAttachments.concat(nextAttachments);
        renderComposerAttachmentPreview();
        openAttachmentModal(pendingImageAttachments.length - nextAttachments.length);
      };

      const setPendingImageAttachment = (file) => {
        addPendingImageAttachments([file]);
      };

      const parseCallSummaryMessage = (message) => {
        const rawBody = String(message?.body || "").trim();
        if (!rawBody.startsWith("[[call:") || !rawBody.endsWith("]]")) {
          return null;
        }

        const inner = rawBody.slice(7, -2);
        const parts = inner.split(":");
        const kind = String(parts[0] || "").trim();

        if (!/^[a-z_]+$/.test(kind)) {
          return null;
        }

        const durationSeconds = parts.length > 1 ? Number(parts[1] || 0) || 0 : 0;

        return {
          kind,
          durationSeconds
        };
      };

      const getCallSummaryPresentation = (message) => {
        const parsed = parseCallSummaryMessage(message);

        if (!parsed) {
          return null;
        }

        const isOutgoing = message.senderId === currentUserId;

        if (parsed.kind === "ended") {
          return {
            title: isOutgoing ? "Outgoing Call" : "Incoming Call",
            subtitle: formatCallDuration(parsed.durationSeconds),
            icon: "call",
            tone: "ended"
          };
        }

        if (parsed.kind === "missed") {
          return {
            title: isOutgoing ? "Outgoing Call" : "Incoming Call",
            subtitle: "Missed",
            icon: "call_made",
            tone: "missed"
          };
        }

        if (parsed.kind === "declined" || parsed.kind === "busy" || parsed.kind === "cancelled") {
          return {
            title: isOutgoing ? "Outgoing Call" : "Incoming Call",
            subtitle: parsed.kind === "busy" ? "Busy" : "Declined",
            icon: isOutgoing ? "call_made" : "call_received",
            tone: "declined"
          };
        }

        return {
          title: "Call",
          subtitle: "Ended",
          icon: "call",
          tone: "ended"
        };
      };

      const getMessagePreviewText = (message) => {
        if (!message) {
          return "";
        }

        const callSummary = getCallSummaryPresentation(message);

        if (callSummary) {
          return callSummary.title + " • " + callSummary.subtitle;
        }

        if (message.albumId && Number(message.albumSize) > 1) {
          const albumSize = Number(message.albumSize) || 0;
          return albumSize > 1 ? albumSize + " фото" : "Фотография";
        }

        if (message.type === "image") {
          return message.body ? "Фотография: " + message.body : "Фотография";
        }

        return message.body || "";
      };

      const getReplyPreviewText = (message) => {
        if (!message || !message.replyToMessageId) {
          return "";
        }

        if (message.replyToType === "image") {
          return message.replyToBody ? "Фотография: " + message.replyToBody : "Фотография";
        }

        return String(message.replyToBody || "").trim();
      };

      const renderReplyPreviewHtml = (message) => {
        if (!message?.replyToMessageId) {
          return "";
        }

        return '<div class="message-reply" data-reply-target-id="' + escapeHtml(message.replyToMessageId) + '">' +
          '<span class="message-reply-author">' + escapeHtml(message.replyToSenderName || "Сообщение") + '</span>' +
          '<span class="message-reply-text">' + renderEmojiAwareTextHtml(getReplyPreviewText(message) || "Сообщение") + '</span>' +
        '</div>';
      };

      const formatDialogListTime = (value) => {
        if (!value) {
          return "";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return "";
        }

        return date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit"
        });
      };

      const formatDialogPreview = (dialog) => {
        const typingPreview = getTypingPreview(dialog);
        if (typingPreview) {
          return typingPreview;
        }

        if (!dialog) {
          return "";
        }

        const preview = String(dialog.lastMessagePreview || "").trim();
        if (!preview) {
          return "";
        }
        const safePreview = isUndecryptableSecurePlaceholder(preview) ? "Сообщение" : preview;

        const rawCallPreview = parseCallSummaryMessage({ body: safePreview, senderId: dialog.lastMessageSenderName === "Вы" ? currentUserId : "" });
        const normalizedPreview = rawCallPreview
          ? (
              getCallSummaryPresentation({
                body: safePreview,
                senderId: dialog.lastMessageSenderName === "Вы" ? currentUserId : "",
                senderName: dialog.lastMessageSenderName || dialog.title || ""
              })?.title + " • " +
              getCallSummaryPresentation({
                body: safePreview,
                senderId: dialog.lastMessageSenderName === "Вы" ? currentUserId : "",
                senderName: dialog.lastMessageSenderName || dialog.title || ""
              })?.subtitle
            )
          : safePreview;

        if (dialog.type === "saved") {
          return "Вы: " + normalizedPreview;
        }

        if (dialog.type === "direct") {
          const senderName = String(dialog.lastMessageSenderName || dialog.title || "").trim();
          return senderName ? (senderName + ": " + normalizedPreview) : normalizedPreview;
        }

        return normalizedPreview;
      };

      const renderTypingPreviewHtml = (label) => (
        '<span class="typing-preview" aria-label="' + escapeHtml(label) + '">' +
          '<span class="typing-preview-text">' + escapeHtml(label.replace(/\.\.\.$/, "")) + '</span>' +
          '<span class="typing-preview-dots" aria-hidden="true">' +
            '<span class="typing-preview-dot"></span>' +
            '<span class="typing-preview-dot"></span>' +
            '<span class="typing-preview-dot"></span>' +
          '</span>' +
        '</span>'
      );

      const renderDialogPreviewHtml = (dialog) => {
        const typingPreview = getTypingPreview(dialog);

        if (typingPreview) {
          return renderTypingPreviewHtml(typingPreview);
        }

        return renderEmojiAwareTextHtml(formatDialogPreview(dialog));
      };

      const renderDialogSubtitleHtml = (dialog) => {
        const typingPreview = getTypingPreview(dialog);

        if (typingPreview) {
          return renderTypingPreviewHtml(typingPreview);
        }

        return escapeHtml(formatDialogSubtitle(dialog));
      };

      const formatViewerTimestamp = (value) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "";
        }

        return date.toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      };

      const getViewerTargetRect = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const imageRatio = viewerModalImage.naturalWidth > 0 && viewerModalImage.naturalHeight > 0
          ? viewerModalImage.naturalWidth / viewerModalImage.naturalHeight
          : 1;
        const topInset = Math.max(72, Math.floor(viewportHeight * 0.08));
        const bottomInset = Math.max(136, Math.floor(viewportHeight * 0.14));
        const sideInset = Math.max(48, Math.floor(viewportWidth * 0.08));
        const maxWidth = Math.max(260, viewportWidth - (sideInset * 2));
        const maxHeight = Math.max(220, viewportHeight - topInset - bottomInset);
        let width = maxWidth;
        let height = width / imageRatio;

        if (height > maxHeight) {
          height = maxHeight;
          width = height * imageRatio;
        }

        return {
          left: viewportWidth / 2,
          top: topInset + (maxHeight / 2),
          width,
          height
        };
      };

      const applyViewerRect = (rect, zoom = viewerZoom, borderRadius = 24) => {
        viewerModalImage.style.left = rect.left + "px";
        viewerModalImage.style.top = rect.top + "px";
        viewerModalImage.style.width = rect.width + "px";
        viewerModalImage.style.height = rect.height + "px";
        viewerModalImage.style.borderRadius = borderRadius + "px";
        viewerModalImage.style.transform = "translate(-50%, -50%) scale(" + zoom + ")";
        viewerModalImage.classList.toggle("zoomed", zoom > 1.01);
        viewerZoomValue.textContent = Math.round(zoom * 100) + "%";
      };

      const setViewerZoom = (nextZoom) => {
        viewerZoom = Math.max(VIEWER_MIN_ZOOM, Math.min(VIEWER_MAX_ZOOM, nextZoom));
        applyViewerRect(getViewerTargetRect(), viewerZoom, 24);
      };

      const closeViewerModal = () => {
        if (!viewerModal.classList.contains("open")) {
          return;
        }

        const fallbackRect = viewerSourceRect || {
          left: window.innerWidth / 2,
          top: window.innerHeight / 2,
          width: 80,
          height: 80
        };

        viewerZoom = 1;
        viewerModal.classList.remove("open");
        applyViewerRect(fallbackRect, 1, 18);
        viewerZoomChip.setAttribute("aria-hidden", "true");

        viewerLoadToken += 1;
        if (viewerCleanupTimer) {
          window.clearTimeout(viewerCleanupTimer);
          viewerCleanupTimer = null;
        }

        viewerCleanupTimer = window.setTimeout(() => {
          viewerModal.setAttribute("aria-hidden", "true");
          viewerModalImage.onload = null;
          viewerModalImage.onerror = null;
          if (!viewerModal.classList.contains("open")) {
            viewerModalImage.removeAttribute("src");
          }
          viewerSourceRect = null;
          viewerCleanupTimer = null;
        }, 280);
      };

      const openViewerModal = ({ src, senderName, senderId, createdAt, sourceRect }) => {
        if (!src) {
          return;
        }

        if (viewerCleanupTimer) {
          window.clearTimeout(viewerCleanupTimer);
          viewerCleanupTimer = null;
        }

        const loadToken = ++viewerLoadToken;
        viewerSourceRect = sourceRect || {
          left: window.innerWidth / 2,
          top: window.innerHeight / 2,
          width: 120,
          height: 120
        };
        viewerZoom = 1;
        const avatar = getAvatarMeta(senderId || senderName || "?", senderName || "?");
        viewerAuthorAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        viewerAuthorAvatar.style.cssText = avatar.style;
        viewerAuthorName.textContent = senderName || "TheGraphT";
        viewerAuthorMeta.textContent = formatViewerTimestamp(createdAt);
        viewerZoomChip.setAttribute("aria-hidden", "false");
        viewerModal.setAttribute("aria-hidden", "false");
        applyViewerRect(viewerSourceRect, 1, 18);
        viewerModalImage.onload = () => {
          if (loadToken !== viewerLoadToken) {
            return;
          }
          const targetRect = getViewerTargetRect();
          requestAnimationFrame(() => {
            if (loadToken !== viewerLoadToken) {
              return;
            }
            viewerModal.classList.add("open");
            applyViewerRect(targetRect, 1, 24);
          });
        };
        viewerModalImage.onerror = () => {
          if (loadToken !== viewerLoadToken) {
            return;
          }
          viewerModal.classList.remove("open");
        };
        viewerModalImage.src = src;
      };

      const removeLocalOutgoingMessage = (messageId) => {
        let removedMessage = null;

        localOutgoingMessages = localOutgoingMessages.filter((message) => {
          if (message.id !== messageId) {
            return true;
          }

          removedMessage = message;
          return false;
        });

        if (removedMessage?.mediaUrl && String(removedMessage.mediaUrl).startsWith("blob:")) {
          URL.revokeObjectURL(removedMessage.mediaUrl);
        }
      };

      const findMatchingPendingLocalMessageId = (dialogPublicId, message) => {
        if (!dialogPublicId || !message || message.senderId !== currentUserId) {
          return "";
        }

        const serverTime = Number.isFinite(new Date(message.createdAt || "").getTime())
          ? new Date(message.createdAt || "").getTime()
          : Date.now();
        let bestId = "";
        let bestDiff = Number.POSITIVE_INFINITY;

        localOutgoingMessages.forEach((localMessage) => {
          if (!localMessage || localMessage.localStatus !== "pending") {
            return;
          }
          if (localMessage.dialogPublicId !== dialogPublicId) {
            return;
          }
          if (localMessage.senderId !== currentUserId) {
            return;
          }
          if (String(localMessage.type || "text") !== String(message.type || "text")) {
            return;
          }
          if (String(localMessage.body || "").trim() !== String(message.body || "").trim()) {
            return;
          }
          if ((localMessage.replyToMessageId || null) !== (message.replyToMessageId || null)) {
            return;
          }

          const localTime = Number.isFinite(new Date(localMessage.createdAt || "").getTime())
            ? new Date(localMessage.createdAt || "").getTime()
            : serverTime;
          const delta = Math.abs(serverTime - localTime);
          if (delta > 120000) {
            return;
          }
          if (delta < bestDiff) {
            bestDiff = delta;
            bestId = localMessage.id;
          }
        });

        return bestId;
      };

      const removeMessageFromCurrentState = (messageId) => {
        if (pendingReplyMessage?.id === messageId) {
          clearPendingReplyMessage();
        }

        currentMessagesSnapshot = currentMessagesSnapshot
          .filter((message) => message.id !== messageId)
          .map((message) => (
            message.replyToMessageId === messageId
              ? {
                  ...message,
                  replyToMessageId: null,
                  replyToSenderId: null,
                  replyToSenderName: null,
                  replyToBody: null,
                  replyToType: null,
                  replyToMediaUrl: null
                }
              : message
          ));
        localOutgoingMessages = localOutgoingMessages.filter((message) => message.id !== messageId);

        if (currentDialogSnapshot?.publicId) {
          setDialogPayloadCache(currentDialogSnapshot.publicId, {
            dialog: currentDialogSnapshot,
            messages: currentMessagesSnapshot
          });
        }
      };

      const handleMessageDeletedEvent = (payload) => {
        if (!payload?.messageId) {
          return;
        }

        const shouldStickToBottom = computeIsNearChatBottom();
        removeMessageFromCurrentState(payload.messageId);

        const currentLastMessage = currentMessagesSnapshot[currentMessagesSnapshot.length - 1] || null;
        const nextDialog = payload.dialog
          ? updateDialogInState(payload.dialog, {
              lastMessagePreview: currentLastMessage ? getMessagePreviewText(currentLastMessage) : payload.dialog.lastMessagePreview,
              lastMessageSenderName: currentLastMessage
                ? (
                    currentLastMessage.senderId === currentUserId
                      ? "Вы"
                      : (currentLastMessage.senderName || payload.dialog.title || "")
                  )
                : payload.dialog.lastMessageSenderName,
              lastMessageCreatedAt: currentLastMessage?.createdAt || payload.dialog.lastMessageCreatedAt
            }) || currentDialogSnapshot
          : currentDialogSnapshot;

        if (payload.dialog?.id === currentDialogId || currentDialogSnapshot?.id === payload.dialog?.id) {
          renderMessages(nextDialog, currentMessagesSnapshot, {
            scrollBehavior: shouldStickToBottom ? "auto" : "none"
          });
        } else if (payload.deletedForEveryone) {
          void loadWorkspace({ preserveRoute: true, scrollBehavior: "none" });
        }

        rerenderDialogsIfVisible();
      };

      const uploadImageBatch = async ({ attachments, caption }) => {
        if (!attachments.length || !currentDialogPublicId) {
          return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 120000);
        const replyToMessageId = pendingReplyMessage?.id || "";
        const albumGroups = chunkItems(attachments, ALBUM_MEDIA_LIMIT).map((group) => ({
          albumId: "album_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10),
          items: group
        }));
        const localDrafts = albumGroups.flatMap((group, groupIndex) => (
          group.items.map((attachment, index) => ({
            id: "local_" + Date.now() + "_" + groupIndex + "_" + index + "_" + Math.random().toString(36).slice(2, 8),
            dialogPublicId: currentDialogPublicId,
            senderId: currentUserId,
            senderName: workspaceUserName.textContent || "You",
            body: index === 0 ? caption : "",
            type: "image",
            albumId: group.items.length > 1 ? group.albumId : null,
            albumIndex: group.items.length > 1 ? index : null,
            albumSize: group.items.length > 1 ? group.items.length : null,
            mediaUrl: attachment.previewUrl,
            attachmentMime: attachment.file.type,
            createdAt: new Date().toISOString(),
            localStatus: "pending",
            animateOnRender: groupIndex === albumGroups.length - 1 && index === group.items.length - 1
          }))
        ));

        localOutgoingMessages = localOutgoingMessages.concat(localDrafts);
        await preloadDialogMediaDimensions(localDrafts);
        const appendedDrafts = localDrafts.every((draft, index) => appendLocalOutgoingMessageToCurrentDialog(draft, {
          scrollBehavior: "auto",
          forceScrollBottom: index === localDrafts.length - 1
        }));
        if (!appendedDrafts) {
          rerenderCurrentDialog({ scrollBehavior: "auto" });
        }

        try {
          for (const group of albumGroups) {
            let lastPayload = null;

            for (let index = 0; index < group.items.length; index += 1) {
              const attachment = group.items[index];
              const localDraft = localDrafts.find((draft) => draft.albumId === (group.items.length > 1 ? group.albumId : null) && draft.mediaUrl === attachment.previewUrl) || localDrafts.find((draft) => draft.mediaUrl === attachment.previewUrl);
              const formData = new FormData();
              formData.append("file", attachment.file);
              formData.append("body", index === 0 ? caption : "");
              if (replyToMessageId) {
                formData.append("replyToMessageId", replyToMessageId);
              }

              if (group.items.length > 1) {
                formData.append("albumId", group.albumId);
                formData.append("albumIndex", String(index));
                formData.append("albumSize", String(group.items.length));
              }

              const payload = await fetchJson(
                apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages",
                {
                  method: "POST",
                  body: formData,
                  signal: controller.signal
                }
              );

              lastPayload = payload;
              if (localDraft) {
                removeLocalOutgoingMessage(localDraft.id);
              }

              if (payload.dialog?.id === currentDialogId && payload.message) {
                appendConfirmedMessageToCurrentDialog(payload.dialog, payload.message, {
                  scrollBehavior: "auto",
                  replaceMessageId: localDraft?.id || ""
                });
              }
            }

            if (lastPayload?.message) {
              updateDialogInState(lastPayload.dialog, {
                lastMessagePreview: getMessagePreviewText(lastPayload.message),
                lastMessageSenderName: lastPayload.message.senderId === currentUserId
                  ? "Вы"
                  : (lastPayload.message.senderName || lastPayload.dialog?.title || ""),
                lastMessageCreatedAt: lastPayload.message.createdAt || lastPayload.dialog?.lastMessageCreatedAt || ""
              });
            }

            playSound("send");
          }
          clearPendingReplyMessage();
        } catch (error) {
          localOutgoingMessages = localOutgoingMessages.map((message) => (
            localDrafts.some((draft) => draft.id === message.id)
              ? { ...message, localStatus: "failed" }
              : message
          ));
          localDrafts.forEach((draft) => {
            updateRenderedMessageStatus(draft.id, "failed");
          });
          throw error;
        } finally {
          window.clearTimeout(timeoutId);
          if (!currentSearchQuery.trim()) {
            renderDialogs(allDialogs);
          }
        }
      };

      const updateDialogInState = (dialogPatch, options = {}) => {
        if (!dialogPatch?.id) {
          return null;
        }

        const { lastMessagePreview, lastMessageSenderName, lastMessageCreatedAt } = options;
        let nextDialog = null;

        allDialogs = allDialogs.map((dialog) => {
          if (dialog.id !== dialogPatch.id) {
            return dialog;
          }

          nextDialog = {
            ...dialog,
            ...dialogPatch,
            lastMessagePreview: lastMessagePreview ?? dialog.lastMessagePreview,
            lastMessageSenderName: lastMessageSenderName ?? dialogPatch.lastMessageSenderName ?? dialog.lastMessageSenderName,
            lastMessageCreatedAt: lastMessageCreatedAt ?? dialogPatch.lastMessageCreatedAt ?? dialog.lastMessageCreatedAt
          };
          return nextDialog;
        });

        if (!nextDialog) {
          return null;
        }

        if (currentDialogSnapshot?.id === nextDialog.id) {
          currentDialogSnapshot = {
            ...currentDialogSnapshot,
            ...nextDialog
          };
        }

        return nextDialog;
      };

      const appendConfirmedMessageToCurrentDialog = (dialogPatch, message, options = {}) => {
        if (!dialogPatch?.id || !message || dialogPatch.id !== currentDialogId) {
          return;
        }

        const isOwnMessage = message.senderId === currentUserId;
        const shouldStickToBottom = Boolean(options.forceScrollBottom) || isOwnMessage || computeIsNearChatBottom();

        const nextDialog = updateDialogInState(dialogPatch, {
          lastMessagePreview: getMessagePreviewText(message),
          lastMessageSenderName: message.senderId === currentUserId
            ? "Вы"
            : (message.senderName || dialogPatch.title || ""),
          lastMessageCreatedAt: message.createdAt || dialogPatch.lastMessageCreatedAt || ""
        }) || currentDialogSnapshot || dialogPatch;

        if (!currentMessagesSnapshot.some((entry) => entry.id === message.id)) {
          currentMessagesSnapshot = currentMessagesSnapshot.concat([{
            ...message,
            animateOnRender: options.animateMessage !== false
          }]);
        }

        if (nextDialog?.publicId) {
          setDialogPayloadCache(nextDialog.publicId, {
            dialog: nextDialog,
            messages: currentMessagesSnapshot
          });
          prefetchDialogMedia(currentMessagesSnapshot);
        }
        const canFastAppend = !message.albumId
          && !messageList.querySelector(".empty-chat-state, .saved-empty-state, .direct-empty-state");

        if (canFastAppend) {
          const appendedFast = appendRenderableItemsToMessageList(
            buildRenderableMessageItems([{
              ...message,
              animateOnRender: options.animateMessage !== false
            }]),
            {
              replaceMessageId: options.replaceMessageId || ""
            }
          );

          if (appendedFast) {
            if (shouldStickToBottom) {
              scrollMessagesToBottom(options.scrollBehavior || "auto");
            } else {
              syncChatScrollBottomButton();
            }
            return;
          }
        }

        renderMessages(nextDialog, currentMessagesSnapshot, {
          scrollBehavior: shouldStickToBottom ? (options.scrollBehavior || "auto") : "none",
          animateList: false,
          forceScrollBottom: shouldStickToBottom
        });
      };

      const showToast = (message, type = "info") => {
        if (!message) {
          return;
        }

        const toast = document.createElement("div");
        toast.className = "toast " + type;
        toast.textContent = message;
        toastStack.appendChild(toast);

        window.setTimeout(() => {
          toast.style.opacity = "0";
          toast.style.transform = "translateY(8px)";
          window.setTimeout(() => toast.remove(), 180);
        }, 3400);
      };

      const rerenderDialogsIfVisible = () => {
        if (!currentSearchQuery.trim()) {
          renderDialogs(allDialogs);
        }
      };

      const formatLastSeen = (value) => {
        if (!value) {
          return "был(а) недавно в сети";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "был(а) недавно в сети";
        }

        const now = new Date();
        const sameDay = now.toDateString() === date.toDateString();
        const timeLabel = date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit"
        });

        if (sameDay) {
          return "был(а) в сети в " + timeLabel;
        }

        const dateLabel = date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit"
        });

        return "был(а) в сети " + dateLabel + " в " + timeLabel;
      };

      const syncVisibleDialogsRealtimeState = () => {
        if (currentSearchQuery.trim()) {
          return;
        }

        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          const dialogId = button.getAttribute("data-dialog-id");
          const dialog = allDialogs.find((entry) => entry.id === dialogId);

          if (!dialog) {
            return;
          }

          const avatarPresence = button.querySelector(".dialog-avatar-presence");

          if (avatarPresence) {
            avatarPresence.classList.toggle("online", isDirectDialogOnline(dialog));
          }

          const previewNode = button.querySelector(".dialog-preview-copy");

          if (previewNode) {
            const nextTypingPreview = getTypingPreview(dialog);
            const hasTypingNode = Boolean(previewNode.querySelector(".typing-preview"));

            if (nextTypingPreview) {
              if (!hasTypingNode) {
                previewNode.innerHTML = renderTypingPreviewHtml(nextTypingPreview);
              }
            } else if (hasTypingNode) {
              previewNode.innerHTML = renderDialogPreviewHtml(dialog);
            } else {
              previewNode.innerHTML = renderDialogPreviewHtml(dialog);
            }
          }
        });
      };

      const applyPresenceStateToDialogs = ({ userId, isOnline, lastSeenAt }) => {
        if (!userId) {
          return;
        }

        allDialogs = allDialogs.map((dialog) => {
          if (dialog.type !== "direct" || dialog.peerUserId !== userId) {
            return dialog;
          }

          return {
            ...dialog,
            peerLastSeenAt: lastSeenAt || dialog.peerLastSeenAt || null
          };
        });

        if (currentDialogSnapshot?.type === "direct" && currentDialogSnapshot.peerUserId === userId) {
          currentDialogSnapshot = {
            ...currentDialogSnapshot,
            peerLastSeenAt: lastSeenAt || currentDialogSnapshot.peerLastSeenAt || null
          };
        }

        if (isOnline) {
          onlineUserIds.add(userId);
        } else {
          onlineUserIds.delete(userId);
        }
      };

      const clearTypingIndicators = () => {
        for (const timeoutId of typingTimers.values()) {
          window.clearTimeout(timeoutId);
        }

        typingTimers.clear();
        typingUsersByDialog.clear();
      };

      const getTypingUsersForDialog = (dialogId) => Array.from(typingUsersByDialog.get(dialogId) || []);

      const updateTypingState = (dialogId, userId, isTyping) => {
        if (!dialogId || !userId || userId === currentUserId) {
          return;
        }

        const timerKey = dialogId + ":" + userId;
        const currentSet = new Set(typingUsersByDialog.get(dialogId) || []);

        if (isTyping) {
          currentSet.add(userId);
          typingUsersByDialog.set(dialogId, currentSet);

          const previousTimer = typingTimers.get(timerKey);

          if (previousTimer) {
            window.clearTimeout(previousTimer);
          }

          typingTimers.set(
            timerKey,
            window.setTimeout(() => {
              updateTypingState(dialogId, userId, false);
            }, 2600)
          );
        } else {
          currentSet.delete(userId);

          if (currentSet.size > 0) {
            typingUsersByDialog.set(dialogId, currentSet);
          } else {
            typingUsersByDialog.delete(dialogId);
          }

          const previousTimer = typingTimers.get(timerKey);

          if (previousTimer) {
            window.clearTimeout(previousTimer);
            typingTimers.delete(timerKey);
          }
        }

        syncVisibleDialogsRealtimeState();
        refreshCurrentDialogChrome();
      };

      const sendTypingState = (isTyping) => {
        if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN || !currentDialogId) {
          return;
        }

        realtimeSocket.send(JSON.stringify({
          type: "typing",
          dialogId: currentDialogId,
          isTyping
        }));
      };

      const scheduleTypingStop = () => {
        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
        }

        typingStopTimer = window.setTimeout(() => {
          sendTypingState(false);
        }, 1600);
      };

      const resetWorkspaceState = () => {
        if (activeCall) {
          void stopAndReleaseCallMedia();
        }
        if (backgroundRefreshTimer) {
          window.clearInterval(backgroundRefreshTimer);
          backgroundRefreshTimer = null;
        }
        backgroundRefreshInFlight = false;
        clearCallTimers();
        activeCall = null;
        currentDialogId = "";
        currentDialogPublicId = "";
        pendingAutoBottomDialogPublicId = "";
        pendingAutoBottomCanceled = false;
        currentUserId = "";
        currentUserUsername = "";
        currentUserEmail = "";
        currentUserDisplayName = "";
        currentUserAvatarLetter = "";
        allDialogs = [];
        dialogPayloadCache.clear();
        prefetchedMediaUrls.clear();
        currentDialogSnapshot = null;
        currentMessagesSnapshot = [];
        releaseLocalMessageMediaUrls();
        localOutgoingMessages = [];
        currentSearchQuery = "";
        currentSearchResults = [];
        peerActiveInCurrentDialog = false;
        currentPeerReadAt = null;
        onlineUserIds.clear();
        clearTypingIndicators();
        clearPendingImageAttachment();
        clearPendingReplyMessage();
        closeMessageContextMenu();
        closeDeleteMessageModal();
        closeViewerModal();
        sidebarSearch.value = "";
        desktopNotificationIds.clear();
        recentMessageNotificationTimes.clear();
        chatScrollBottom.classList.remove("visible");
        isNearChatBottom = true;
        closeChatSearch();
        workspaceUserName.textContent = "Гость";
        persistLegacySessionToken("");
      };

      const handleUnauthorizedSession = (
        message = "Сессия завершена. Войдите снова.",
        toastType = "error",
        statusType = toastType === "success" ? "success" : "error"
      ) => {
        disableRealtime();
        resetWorkspaceState();
        closeDialog({ skipHistory: true });
        switchView(false);
        applyRoute("");
        pageRoot.classList.remove("booting");
        setStatus(message, statusType);
        showToast(message, toastType);
      };

      const getDialogTypeLabel = (type) => dialogTypeLabels[type] || String(type || "chat");

      const getDialogSectionTitle = (type) => dialogTypeTitles[type] || getDialogTypeLabel(type);

      const getDialogTypeRank = (type) => {
        const rank = dialogTypeOrder.indexOf(type);
        return rank === -1 ? dialogTypeOrder.length : rank;
      };

      const getDialogAvatarMarkup = (dialog, options = {}) => {
        const showPresence = options.showPresence !== false;

        if (dialog.type === "direct") {
          const avatar = getAvatarMeta(dialog.peerUserId || dialog.publicId, dialog.title || dialog.subtitle || "?");
          return '<div class="dialog-avatar user-avatar" style="' + avatar.style + '">' +
            '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />' +
            (showPresence
              ? '<span class="dialog-avatar-presence' + (isDirectDialogOnline(dialog) ? ' online' : '') + '" aria-hidden="true"></span>'
              : "") +
          '</div>';
        }

        const icon = dialogTypeIcons[dialog.type] || savedIcon;
        return '<div class="dialog-avatar">' + icon + '</div>';
      };

      const isDirectDialogOnline = (dialog) => Boolean(dialog?.type === "direct" && dialog.peerUserId && onlineUserIds.has(dialog.peerUserId));

      const getTypingPreview = (dialog) => {
        const typingUsers = getTypingUsersForDialog(dialog?.id);

        if (!typingUsers.length) {
          return "";
        }

        return dialog?.type === "direct" ? "печатает..." : "кто-то печатает...";
      };

      const formatDialogSubtitle = (dialog) => {
        if (!dialog) {
          return "";
        }

        const typingPreview = getTypingPreview(dialog);

        if (typingPreview) {
          return typingPreview;
        }

        if (dialog.type === "saved") {
          return dialog.subtitle || getDialogSectionTitle(dialog.type);
        }

        if (dialog.type === "direct") {
          if (isDirectDialogOnline(dialog)) {
            return "в сети";
          }

          return formatLastSeen(dialog.peerLastSeenAt);
        }

        const parts = [];

        if (dialog.subtitle) {
          parts.push(dialog.subtitle);
        }

        const typeLabel = getDialogSectionTitle(dialog.type);

        if (!parts.includes(typeLabel)) {
          parts.push(typeLabel);
        }

        if (dialog.participants) {
          parts.push(dialog.participants + " members");
        }

        return parts.join(" • ");
      };

      const getDialogUsername = (dialog) => {
        if (!dialog) {
          return "";
        }

        if (dialog.type === "saved") {
          return String(currentUserUsername || "").replace(/^@+/, "");
        }

        const subtitle = String(dialog.subtitle || "").trim();
        if (subtitle.startsWith("@")) {
          return subtitle.replace(/^@+/, "");
        }

        return "";
      };

      const getChatProfileDetails = (dialog) => {
        if (!dialog) {
          return null;
        }

        if (dialog.type !== "direct" && dialog.type !== "saved") {
          return null;
        }

        const username = getDialogUsername(dialog);
        const isSaved = dialog.type === "saved";
        const name = isSaved
          ? (currentUserDisplayName || currentUserUsername || dialog.title || "Вы")
          : (dialog.title || "Профиль");
        const status = isSaved
          ? "Ваш профиль"
          : formatDialogSubtitle(dialog);
        const avatar = getAvatarMeta(
          isSaved ? (currentUserId || "saved-self") : (dialog.peerUserId || dialog.publicId || dialog.id || name),
          name
        );
        const usernameLabel = username ? "@" + username : "username ещё не задан";
        const profileUrl = username ? ("https://thegrapht.su/l/@" + encodeURIComponent(username)) : "https://thegrapht.su";

        return {
          avatar,
          name,
          status,
          username,
          usernameLabel,
          profileUrl
        };
      };

      const syncChatHeaderMeta = () => {
        if (!chatHeaderAvatar) {
          return;
        }

        if (!currentDialogSnapshot) {
          chatHeaderAvatar.innerHTML = "";
          return;
        }

        chatHeaderAvatar.innerHTML = getDialogAvatarMarkup(currentDialogSnapshot, {
          showPresence: currentDialogSnapshot.type === "direct"
        });
      };

      const syncChatProfilePanel = () => {
        if (!chatProfilePanel) {
          return;
        }

        const details = getChatProfileDetails(currentDialogSnapshot);
        if (!details) {
          chatWindow?.classList.remove("profile-panel-open");
          chatProfilePanel.classList.remove("open");
          chatProfilePanel.setAttribute("aria-hidden", "true");
          return;
        }

        chatProfileAvatar.innerHTML = getDialogAvatarMarkup(currentDialogSnapshot, {
          showPresence: currentDialogSnapshot.type === "direct"
        });
        chatProfileName.textContent = details.name;
        chatProfileStatus.textContent = details.status || "профиль";
        chatProfileUsername.textContent = details.usernameLabel;
        const visibleProfileUrl = details.profileUrl.startsWith("https://")
          ? details.profileUrl.slice(8)
          : (details.profileUrl.startsWith("http://") ? details.profileUrl.slice(7) : details.profileUrl);
        chatProfileLink.textContent = visibleProfileUrl;
        chatProfileLink.href = details.profileUrl;
      };

      const refreshCurrentDialogChrome = () => {
        if (!currentDialogSnapshot) {
          syncChatHeaderMeta();
          syncChatIslandActions();
          syncActiveCallChip();
          syncChatProfilePanel();
          return;
        }

        chatTitle.textContent = currentDialogSnapshot.title || "";
        chatSubtitle.textContent = formatDialogSubtitle(currentDialogSnapshot);
        syncChatHeaderMeta();
        syncChatProfilePanel();
        syncChatIslandActions();
        syncActiveCallChip();

        if (chatSearchPanel.classList.contains("open")) {
          renderChatSearchResults();
        }
      };

      const openChatProfilePanel = () => {
        if (!currentDialogSnapshot || !chatProfilePanel) {
          return;
        }

        syncChatProfilePanel();
        chatWindow?.classList.add("profile-panel-open");
        chatProfilePanel.classList.add("open");
        chatProfilePanel.setAttribute("aria-hidden", "false");
      };

      const closeChatProfilePanel = () => {
        if (!chatProfilePanel) {
          return;
        }

        chatWindow?.classList.remove("profile-panel-open");
        chatProfilePanel.classList.remove("open");
        chatProfilePanel.setAttribute("aria-hidden", "true");
      };

      const handleViewerWheelZoom = (event) => {
        if (!viewerModal.classList.contains("open") || !event.ctrlKey) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        setViewerZoom(viewerZoom + (event.deltaY < 0 ? 0.14 : -0.14));
      };

      const disableRealtime = () => {
        realtimeEnabled = false;

        if (realtimeReconnectTimer) {
          window.clearTimeout(realtimeReconnectTimer);
          realtimeReconnectTimer = null;
        }

        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
          typingStopTimer = null;
        }
        if (realtimeHeartbeatTimer) {
          window.clearInterval(realtimeHeartbeatTimer);
          realtimeHeartbeatTimer = null;
        }
        if (realtimeWatchdogTimer) {
          window.clearInterval(realtimeWatchdogTimer);
          realtimeWatchdogTimer = null;
        }

        onlineUserIds.clear();
        clearTypingIndicators();

        if (realtimeSocket && realtimeSocket.readyState !== WebSocket.CLOSED) {
          realtimeSocket.close();
        }

        realtimeSocket = null;
        realtimeLastActivityAt = 0;
        rerenderDialogsIfVisible();
        refreshCurrentDialogChrome();
      };

      const wsInfo = (event, details = {}) => {
        try {
          console.info("[TheGraphT WS]", event, details);
        } catch {}
      };

      const wsWarn = (event, details = {}) => {
        try {
          console.warn("[TheGraphT WS]", event, details);
        } catch {}
      };

      const touchRealtimeActivity = () => {
        realtimeLastActivityAt = Date.now();
      };

      const startRealtimeHealthChecks = () => {
        if (realtimeHeartbeatTimer) {
          window.clearInterval(realtimeHeartbeatTimer);
          realtimeHeartbeatTimer = null;
        }
        if (realtimeWatchdogTimer) {
          window.clearInterval(realtimeWatchdogTimer);
          realtimeWatchdogTimer = null;
        }

        touchRealtimeActivity();

        realtimeHeartbeatTimer = window.setInterval(() => {
          if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
            return;
          }

          try {
            realtimeSocket.send(JSON.stringify({
              type: "ping",
              ts: Date.now()
            }));
            wsInfo("ping_sent", {
              ts: Date.now()
            });
          } catch {}
        }, REALTIME_HEARTBEAT_INTERVAL_MS);

        realtimeWatchdogTimer = window.setInterval(() => {
          if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
            return;
          }

          const staleForMs = Date.now() - (realtimeLastActivityAt || 0);
          if (staleForMs <= REALTIME_STALE_TIMEOUT_MS) {
            return;
          }

          wsWarn("stale_socket_detected_forcing_reconnect", {
            staleForMs
          });
          try {
            realtimeSocket.close();
          } catch {}
        }, REALTIME_WATCHDOG_INTERVAL_MS);
      };

      const sendCurrentPresence = () => {
        if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
          return;
        }

        wsInfo("presence_send", {
          dialogId: currentDialogId || null
        });
        realtimeSocket.send(JSON.stringify({
          type: "presence",
          dialogId: currentDialogId || null
        }));
      };

      const getMessageStatusMarkup = (message, isOutgoing) => {
        if (!isOutgoing) {
          return "";
        }

        if (message.localStatus === "pending") {
          return '<span class="message-state" aria-label="Pending">' + pendingClockIcon + '</span>';
        }

        if (message.localStatus === "failed") {
          return '<span class="message-state" aria-label="Failed">!</span>';
        }

        const supportsPeerReadReceipts = Boolean(
          currentDialogSnapshot?.peerUserId
          && ["direct", "private", "secret"].includes(currentDialogSnapshot?.type)
        );

        if (supportsPeerReadReceipts) {
          const messageTimestamp = new Date(message.createdAt).getTime();
          const peerReadTimestamp = currentPeerReadAt ? new Date(currentPeerReadAt).getTime() : 0;
          const isReadByPeer = Number.isFinite(peerReadTimestamp) && peerReadTimestamp > 0 && messageTimestamp <= peerReadTimestamp;
          return isReadByPeer
            ? '<span class="message-checks message-checks-double">' + doubleChecksIcon + '</span>'
            : '<span class="message-checks message-checks-single">' + singleCheckIcon + '</span>';
        }

        return '<span class="message-checks message-checks-double">' + doubleChecksIcon + '</span>';
      };

      const renderImageLinkHtml = (message, caption, senderName, extraClass = "") => (
        '<a class="message-image-link' + extraClass + '" href="' + escapeHtml(message.mediaUrl) + '" data-image-url="' + escapeHtml(message.mediaUrl) + '" data-sender-name="' + escapeHtml(senderName) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-created-at="' + escapeHtml(message.createdAt || "") + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="message-image-shell"' + getImageShellStyle(message) + '>' +
            '<img class="message-image" src="' + escapeHtml(message.mediaUrl) + '" alt="' + escapeHtml(caption || "Фотография") + '" loading="lazy" decoding="async" fetchpriority="low" />' +
          '</span>' +
        '</a>'
      );

      const renderMessageBodyHtml = (message) => {
        const callSummary = getCallSummaryPresentation(message);

        if (callSummary) {
          return '<div class="message-call-card ' + callSummary.tone + '">' +
            '<span class="material-symbols-rounded message-call-icon" aria-hidden="true">' + escapeHtml(callSummary.icon) + '</span>' +
            '<div class="message-call-copy">' +
              '<div class="message-call-title">' + escapeHtml(callSummary.title) + '</div>' +
              '<div class="message-call-subtitle">' + escapeHtml(callSummary.subtitle) + '</div>' +
            '</div>' +
          '</div>';
        }

        if (message?.type === "image" && message.mediaUrl) {
          const caption = String(message.body || "").trim();
          const senderName = String(message.senderName || (message.senderId === currentUserId ? workspaceUserName.textContent : "TheGraphT"));
          return renderReplyPreviewHtml(message) + '<div class="message-visual">' +
            renderImageLinkHtml(message, caption, senderName) +
            (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
          '</div>';
        }

        return renderReplyPreviewHtml(message) + '<div class="message-body">' + linkifyMessageBody(message.body) + '</div>';
      };

      const buildRenderableMessageItems = (messages) => {
        const items = [];

        for (let index = 0; index < messages.length; index += 1) {
          const message = messages[index];

          if (message?.type === "image" && message.albumId) {
            const albumMessages = [message];
            let cursor = index + 1;

            while (cursor < messages.length) {
              const candidate = messages[cursor];

              if (
                candidate?.type === "image"
                && candidate.albumId === message.albumId
                && candidate.senderId === message.senderId
              ) {
                albumMessages.push(candidate);
                cursor += 1;
                continue;
              }

              break;
            }

            items.push({
              kind: "album",
              messages: albumMessages
            });
            index = cursor - 1;
            continue;
          }

          items.push({
            kind: "message",
            messages: [message]
          });
        }

        return items;
      };

      const renderAlbumMessage = (albumMessages) => {
        const leadMessage = albumMessages[0];
        const tailMessage = albumMessages[albumMessages.length - 1];
        const isOutgoing = tailMessage.senderId === currentUserId || tailMessage.localStatus;
        const date = new Date(tailMessage.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        const localStatusClass = tailMessage.localStatus ? ' message-status-' + tailMessage.localStatus : "";
        const shouldLaunch = Boolean(tailMessage.animateOnRender);
        if (shouldLaunch) {
          tailMessage.animateOnRender = false;
        }
        const launchClass = shouldLaunch ? " message-launch" : "";
        const senderName = String(leadMessage.senderName || (leadMessage.senderId === currentUserId ? workspaceUserName.textContent : "TheGraphT"));
        const caption = String(leadMessage.body || "").trim();

        return '<article class="message' + (isOutgoing ? "" : " incoming") + localStatusClass + launchClass + '" data-message-id="' + escapeHtml(tailMessage.id) + '" data-sender-id="' + escapeHtml(tailMessage.senderId || "") + '" data-message-type="' + escapeHtml(tailMessage.type || "text") + '" data-attachment-name="' + escapeHtml(tailMessage.attachmentName || "") + '" data-media-url="' + escapeHtml(tailMessage.mediaUrl || "") + '">' +
          renderReplyPreviewHtml(leadMessage) +
          '<div class="message-visual">' +
            '<div class="message-album count-' + albumMessages.length + '">' +
              albumMessages.map((message) => {
                const tileCaption = String(message.body || "").trim() || caption;
                return '<div class="message-album-item" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' + renderImageLinkHtml(message, tileCaption, senderName) + '</div>';
              }).join("") +
            '</div>' +
            (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
          '</div>' +
          '<div class="message-meta"><span>' + date + '</span>' + getMessageStatusMarkup(tailMessage, isOutgoing) + '</div>' +
        '</article>';
      };

      const renderSingleMessage = (message) => {
        const isOutgoing = message.senderId === currentUserId || message.localStatus;
        const date = new Date(message.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        const localStatusClass = message.localStatus ? ' message-status-' + message.localStatus : "";
        const shouldLaunch = Boolean(message.animateOnRender);
        if (shouldLaunch) {
          message.animateOnRender = false;
        }
        const launchClass = shouldLaunch ? " message-launch" : "";
        const mediaClass = message.type === "image" && !message.albumId ? " message-media" : "";
        return '<article class="message' + mediaClass + (isOutgoing ? "" : " incoming") + localStatusClass + launchClass + '" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' +
          renderMessageBodyHtml(message) +
          '<div class="message-meta"><span>' + date + '</span>' + getMessageStatusMarkup(message, isOutgoing) + '</div>' +
        '</article>';
      };

      function appendRenderableItemsToMessageList(items, options = {}) {
        if (!Array.isArray(items) || !items.length) {
          return false;
        }

        const html = items.map((item) => {
          if (item.kind === "album") {
            return renderAlbumMessage(item.messages);
          }
          if (!Array.isArray(item.messages) || !item.messages.length || !item.messages[0]) {
            return "";
          }
          return renderSingleMessage(item.messages[0]);
        }).join("");

        if (!html) {
          return false;
        }

        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = html;
        const nodes = Array.from(tempContainer.children);
        if (!nodes.length) {
          return false;
        }

        let hadReplacement = false;
        if (options.replaceMessageId) {
          const selector = '[data-message-id="' + CSS.escape(String(options.replaceMessageId)) + '"]';
          const previousNode = messageList.querySelector(selector);
          hadReplacement = Boolean(previousNode);
          previousNode?.remove();
        }

        const dedupedNodes = nodes.filter((node) => {
          const messageId = node.getAttribute("data-message-id");
          if (!messageId) {
            return true;
          }
          const selector = '[data-message-id="' + CSS.escape(String(messageId)) + '"]';
          return !messageList.querySelector(selector);
        });

        if (!dedupedNodes.length) {
          return hadReplacement;
        }

        const fragment = document.createDocumentFragment();
        dedupedNodes.forEach((node) => fragment.appendChild(node));
        messageList.appendChild(fragment);
        hydrateMessageImages({ lockToken: 0 });
        return true;
      }

      function appendLocalOutgoingMessageToCurrentDialog(localMessage, options = {}) {
        if (!currentDialogSnapshot || !localMessage || localMessage.dialogPublicId !== currentDialogSnapshot.publicId) {
          return false;
        }

        const emptyStateVisible = Boolean(
          messageList.querySelector(".empty-chat-state, .saved-empty-state, .direct-empty-state")
        );

        if (emptyStateVisible) {
          renderMessages(currentDialogSnapshot, currentMessagesSnapshot, {
            scrollBehavior: options.scrollBehavior || "auto",
            animateList: false,
            forceScrollBottom: Boolean(options.forceScrollBottom)
          });
          return true;
        }

        const appended = appendRenderableItemsToMessageList(buildRenderableMessageItems([localMessage]));
        if (!appended) {
          return false;
        }

        if (options.forceScrollBottom) {
          scrollMessagesToBottom(options.scrollBehavior || "auto");
        } else {
          syncChatScrollBottomButton();
        }

        return true;
      }

      function updateRenderedMessageStatus(messageId, status) {
        if (!messageId) {
          return;
        }

        const selector = '[data-message-id="' + CSS.escape(String(messageId)) + '"]';
        const node = messageList.querySelector(selector);
        if (!node) {
          return;
        }

        node.classList.remove("message-status-pending", "message-status-failed");
        if (status) {
          node.classList.add("message-status-" + status);
        }
      }

      const rerenderCurrentDialog = (options = {}) => {
        if (!currentDialogSnapshot) {
          return;
        }

        renderMessages(currentDialogSnapshot, currentMessagesSnapshot, options);
      };

      composerIconImages.forEach((node) => {
        node.addEventListener("dragstart", (event) => event.preventDefault());
        node.addEventListener("contextmenu", (event) => event.preventDefault());
      });

      messageList.addEventListener("click", (event) => {
        const imageLink = event.target instanceof Element ? event.target.closest(".message-image-link") : null;

        if (!imageLink) {
          return;
        }

        event.preventDefault();
        const imageNode = imageLink.querySelector(".message-image");
        const imageRect = imageNode?.getBoundingClientRect();
        openViewerModal({
          src: imageLink.getAttribute("data-image-url") || imageLink.getAttribute("href") || "",
          senderName: imageLink.getAttribute("data-sender-name") || "TheGraphT",
          senderId: imageLink.getAttribute("data-sender-id") || "",
          createdAt: imageLink.getAttribute("data-created-at") || "",
          sourceRect: imageRect
            ? {
                left: imageRect.left + imageRect.width / 2,
                top: imageRect.top + imageRect.height / 2,
                width: imageRect.width,
                height: imageRect.height
              }
            : null
        });
      });

      viewerModalClose.addEventListener("click", () => {
        closeViewerModal();
      });

      viewerModal.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;

        if (!target) {
          return;
        }

        if (
          !target.closest(".viewer-modal-image")
          && !target.closest(".viewer-modal-header")
          && !target.closest(".viewer-zoom-chip")
        ) {
          closeViewerModal();
        }
      });

      viewerModal.addEventListener("wheel", handleViewerWheelZoom, { passive: false });
      viewerModalStage.addEventListener("wheel", handleViewerWheelZoom, { passive: false });
      viewerModalImage.addEventListener("wheel", handleViewerWheelZoom, { passive: false });

      viewerZoomOut.addEventListener("click", () => {
        if (!viewerModal.classList.contains("open")) {
          return;
        }
        setViewerZoom(viewerZoom - 0.15);
      });

      viewerZoomIn.addEventListener("click", () => {
        if (!viewerModal.classList.contains("open")) {
          return;
        }
        setViewerZoom(viewerZoom + 0.15);
      });

      messageList.addEventListener("scroll", () => {
        if (!suppressBottomLockCancel) {
          markManualScrollIntent();
        }
        syncChatScrollBottomButton();
      }, { passive: true });

      messageList.addEventListener("wheel", () => {
        if (!suppressBottomLockCancel) {
          markManualScrollIntent();
        }
      }, { passive: true });

      messageList.addEventListener("touchstart", () => {
        if (!suppressBottomLockCancel) {
          markManualScrollIntent();
        }
      }, { passive: true });

      messageList.addEventListener("pointerdown", () => {
        if (!suppressBottomLockCancel) {
          markManualScrollIntent();
        }
      }, { passive: true });

      chatScrollBottom?.addEventListener("click", () => {
        scrollMessagesToBottom("smooth");
        requestAnimationFrame(() => {
          syncChatScrollBottomButton();
        });
      });

      chatSearchToggle?.addEventListener("click", () => {
        if (!currentDialogSnapshot) {
          return;
        }

        if (chatSearchPanel.classList.contains("open")) {
          closeChatSearch();
          return;
        }

        setChatSearchPanelOpen(true);
        renderChatSearchResults();
      });

      chatIslandCopy?.addEventListener("click", () => {
        if (!currentDialogSnapshot) {
          return;
        }

        if (chatProfilePanel.classList.contains("open")) {
          closeChatProfilePanel();
          return;
        }

        openChatProfilePanel();
      });

      chatIslandCopy?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        chatIslandCopy.click();
      });

      chatProfileClose?.addEventListener("click", () => {
        closeChatProfilePanel();
      });

      chatSearchClose?.addEventListener("click", () => {
        closeChatSearch();
      });

      chatSearchBackdrop?.addEventListener("click", () => {
        closeChatSearch();
      });

      chatSearchInput?.addEventListener("input", () => {
        chatSearchQuery = chatSearchInput.value || "";
        renderChatSearchResults();
      });

      chatSearchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeChatSearch();
        }
      });

      chatCallButton?.addEventListener("click", () => {
        void beginOutgoingCall();
      });

      chatCallChip?.addEventListener("click", () => {
        restoreCallModal();
      });

      callCloseButton?.addEventListener("click", () => {
        minimizeCallModal();
      });

      callExpandButton?.addEventListener("click", () => {
        restoreCallModal();
      });

      callMiniOpen?.addEventListener("click", () => {
        restoreCallModal();
      });

      callMiniClose?.addEventListener("click", () => {
        dismissMiniCallCard();
      });

      callMiniEnd?.addEventListener("click", () => {
        void endOrRejectCall();
      });

      callMiniDragHandle?.addEventListener("pointerdown", (event) => {
        if (!callOverlay || !callMiniCard || !callMiniDragHandle) {
          return;
        }
        if (!activeCall || !activeCall.minimized || event.button !== 0) {
          return;
        }
        const targetNode = event.target instanceof Element ? event.target : null;
        if (targetNode && targetNode.closest("button")) {
          return;
        }

        const overlayRect = callOverlay.getBoundingClientRect();
        const cardRect = callMiniCard.getBoundingClientRect();
        const dragState = {
          pointerId: event.pointerId,
          offsetX: event.clientX - cardRect.left,
          offsetY: event.clientY - cardRect.top,
          cardWidth: cardRect.width,
          cardHeight: cardRect.height,
          overlayLeft: overlayRect.left,
          overlayTop: overlayRect.top,
          overlayWidth: overlayRect.width,
          overlayHeight: overlayRect.height
        };

        callMiniCard.classList.add("dragging");
        callMiniDragHandle.setPointerCapture(event.pointerId);

        const applyPosition = (clientX, clientY) => {
          const maxLeft = Math.max(0, dragState.overlayWidth - dragState.cardWidth);
          const maxTop = Math.max(0, dragState.overlayHeight - dragState.cardHeight);
          const left = Math.max(0, Math.min(maxLeft, clientX - dragState.overlayLeft - dragState.offsetX));
          const top = Math.max(0, Math.min(maxTop, clientY - dragState.overlayTop - dragState.offsetY));

          callMiniCard.style.left = left + "px";
          callMiniCard.style.top = top + "px";
          callMiniCard.style.right = "auto";
          callMiniCard.style.bottom = "auto";
          if (activeCall) {
            activeCall.miniPosition = { left, top };
          }
        };

        const onMove = (moveEvent) => {
          if (moveEvent.pointerId !== dragState.pointerId) {
            return;
          }
          moveEvent.preventDefault();
          applyPosition(moveEvent.clientX, moveEvent.clientY);
        };

        const finishDrag = (finishEvent) => {
          if (finishEvent.pointerId !== dragState.pointerId) {
            return;
          }
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", finishDrag);
          window.removeEventListener("pointercancel", finishDrag);
          try {
            callMiniDragHandle.releasePointerCapture(finishEvent.pointerId);
          } catch {}
          callMiniCard.classList.remove("dragging");
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", finishDrag);
        window.addEventListener("pointercancel", finishDrag);
      });

      callAcceptButton?.addEventListener("click", () => {
        void acceptIncomingCall();
      });

      callEndButton?.addEventListener("click", () => {
        void endOrRejectCall();
      });

      callMuteButton?.addEventListener("click", () => {
        if (!activeCall?.localStream) {
          return;
        }

        activeCall.isMuted = !activeCall.isMuted;
        activeCall.localStream.getAudioTracks().forEach((track) => {
          track.enabled = !activeCall.isMuted;
        });
        syncCallUi();
      });

      callDevicesButton?.addEventListener("click", () => {
        if (!callDevicesPanel) {
          return;
        }
        if (callDevicesPanel.classList.contains("open")) {
          closeCallDevicesPanel();
          return;
        }

        void loadCallDevices().then(() => {
          openCallDevicesPanel();
        });
      });

      callDevicesClose?.addEventListener("click", () => {
        closeCallDevicesPanel();
      });

      callModal?.addEventListener("pointerdown", (event) => {
        if (!callDevicesPanel) {
          return;
        }
        if (!callDevicesPanel.classList.contains("open")) {
          return;
        }
        const targetNode = event.target instanceof Node ? event.target : null;
        if (!targetNode) {
          return;
        }
        if (callDevicesPanel.contains(targetNode) || callDevicesButton?.contains(targetNode)) {
          return;
        }
        closeCallDevicesPanel();
      });

      callInputDevice?.addEventListener("change", () => {
        void replaceLocalAudioTrack(callInputDevice.value);
      });

      callOutputDevice?.addEventListener("change", () => {
        void applyCallOutputDevice(callOutputDevice.value);
      });

      const connectRealtime = () => {
        if (!realtimeEnabled) {
          return;
        }

        if (realtimeSocket && (realtimeSocket.readyState === WebSocket.OPEN || realtimeSocket.readyState === WebSocket.CONNECTING)) {
          return;
        }

        const explicitWsBase = ${JSON.stringify(wsBaseUrl)};
        let wsUrl;

        if (explicitWsBase) {
          try {
            const resolvedWsUrl = new URL(explicitWsBase, window.location.href);
            const isPublicHost = /^(web\\.thegrapht\\.su|thegrapht\\.su|www\\.thegrapht\\.su)$/i.test(window.location.hostname || "");
            const isLoopbackWsHost = /^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)$/i.test(resolvedWsUrl.hostname || "");

            wsUrl = isPublicHost && isLoopbackWsHost
              ? new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws")
              : resolvedWsUrl;
          } catch {
            wsUrl = new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws");
          }
        } else {
          wsUrl = new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws");
        }

        wsInfo("connecting", {
          url: wsUrl.toString(),
          dialogId: currentDialogId || null
        });
        realtimeSocket = new WebSocket(wsUrl.toString());

        realtimeSocket.addEventListener("open", () => {
          if (realtimeReconnectTimer) {
            window.clearTimeout(realtimeReconnectTimer);
            realtimeReconnectTimer = null;
          }

          wsInfo("connected", {
            readyState: realtimeSocket?.readyState
          });
          touchRealtimeActivity();
          startRealtimeHealthChecks();
          sendCurrentPresence();
        });

        realtimeSocket.addEventListener("message", (event) => {
          touchRealtimeActivity();
          void (async () => {
            try {
              const payload = JSON.parse(event.data);
            wsInfo("message_received", {
              type: payload?.type || "unknown",
              dialogId: payload?.dialog?.id || payload?.dialogId || null,
              messageId: payload?.message?.id || payload?.messageId || null,
              callId: payload?.callId || null
            });
            if (payload.type === "pong") {
              return;
            }
            if (payload.type === "message_created") {
              const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.message ? [payload.message] : []);
              const preparedMessage = preparedPayload.messages[0] || payload.message;
              if (preparedMessage?.decryptionFailed) {
                wsWarn("message_decryption_failed", {
                  dialogId: preparedPayload.dialog?.id || preparedPayload.dialog?.publicId || null,
                  messageId: preparedMessage.id || null,
                  senderId: preparedMessage.senderId || null
                });
              }
              const replaceLocalMessageId = preparedMessage?.senderId === currentUserId
                ? findMatchingPendingLocalMessageId(preparedPayload.dialog?.publicId || "", preparedMessage)
                : "";
              if (replaceLocalMessageId) {
                removeLocalOutgoingMessage(replaceLocalMessageId);
              }
              const preparedMessagePreview = String(getMessagePreviewText(preparedMessage) || "").trim();
              const nextDialog = updateDialogInState(preparedPayload.dialog, {
                lastMessagePreview: preparedMessage?.decryptionFailed ? undefined : preparedMessagePreview,
                lastMessageSenderName: preparedMessage.senderId === currentUserId
                  ? "Вы"
                  : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
                lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
              });

              if (!currentSearchQuery.trim() && nextDialog) {
                renderDialogs(allDialogs);
              }

               if (preparedMessage?.senderId !== currentUserId) {
                void showIncomingDesktopNotification(preparedMessage, nextDialog || preparedPayload.dialog || null);
              }

              if (preparedPayload.dialog?.id === currentDialogId && preparedMessage) {
                appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
                  scrollBehavior: "smooth",
                  animateMessage: !replaceLocalMessageId,
                  replaceMessageId: replaceLocalMessageId
                });
                if (currentDialogPublicId) {
                  void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/read", {
                    method: "POST"
                  }).catch(() => {});
                }
                return;
              }

              if (!nextDialog) {
                void loadWorkspace({ preserveRoute: true });
              }
            } else if (payload.type === "presence_snapshot") {
              onlineUserIds.clear();
              (payload.userIds || []).forEach((userId) => {
                if (typeof userId === "string" && userId) {
                  onlineUserIds.add(userId);
                }
              });
              syncVisibleDialogsRealtimeState();
              refreshCurrentDialogChrome();
            } else if (payload.type === "user_presence" && payload.userId) {
              applyPresenceStateToDialogs({
                userId: payload.userId,
                isOnline: Boolean(payload.isOnline),
                lastSeenAt: payload.lastSeenAt || null
              });
              syncVisibleDialogsRealtimeState();
              refreshCurrentDialogChrome();
            } else if (payload.type === "dialog_presence" && payload.dialogId === currentDialogId) {
              const nextPeerActive = Array.isArray(payload.activeUserIds)
                ? payload.activeUserIds.some((userId) => userId !== currentUserId)
                : false;
              if (peerActiveInCurrentDialog !== nextPeerActive) {
                peerActiveInCurrentDialog = nextPeerActive;
                refreshCurrentDialogChrome();
              }
            } else if (payload.type === "dialog_read" && payload.dialogId === currentDialogId && payload.userId !== currentUserId) {
              currentPeerReadAt = payload.readAt || currentPeerReadAt;
              rerenderCurrentDialog({ scrollBehavior: "none" });
            } else if (payload.type === "message_deleted") {
              handleMessageDeletedEvent(payload);
            } else if (payload.type === "dialog_typing" && payload.dialogId && payload.userId && payload.userId !== currentUserId) {
              updateTypingState(payload.dialogId, payload.userId, Boolean(payload.isTyping));
            } else if (payload.type === "call_invite") {
              void handleCallInvite(payload);
            } else if (payload.type === "call_accept") {
              void handleCallAccept(payload);
            } else if (payload.type === "call_reject") {
              void handleCallReject(payload);
            } else if (payload.type === "call_end") {
              void handleCallEnd(payload);
            } else if (payload.type === "call_candidate") {
              void handleCallCandidate(payload);
            }
            } catch (error) {
              wsWarn("message_handler_failed", {
                error: error instanceof Error ? error.message : String(error)
              });
            }
          })();
        });

        realtimeSocket.addEventListener("close", (event) => {
          wsWarn("disconnected", {
            code: event?.code,
            reason: event?.reason || "",
            wasClean: Boolean(event?.wasClean),
            willReconnect: Boolean(realtimeEnabled)
          });
          if (realtimeHeartbeatTimer) {
            window.clearInterval(realtimeHeartbeatTimer);
            realtimeHeartbeatTimer = null;
          }
          if (realtimeWatchdogTimer) {
            window.clearInterval(realtimeWatchdogTimer);
            realtimeWatchdogTimer = null;
          }
          realtimeLastActivityAt = 0;
          realtimeSocket = null;
          onlineUserIds.clear();
          clearTypingIndicators();
          syncVisibleDialogsRealtimeState();
          refreshCurrentDialogChrome();
          if (realtimeEnabled) {
            wsInfo("reconnect_scheduled", {
              delayMs: 1200
            });
            realtimeReconnectTimer = window.setTimeout(() => connectRealtime(), 1200);
          }
        });

        realtimeSocket.addEventListener("error", () => {
          wsWarn("socket_error", {
            readyState: realtimeSocket?.readyState
          });
        });
      };

`;
