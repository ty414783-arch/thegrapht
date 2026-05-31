export const attachmentModal = () => `

      const getConstrainedImageSize = (naturalWidth, naturalHeight) => {
        if (!naturalWidth || !naturalHeight) {
          return null;
        }

        const maxWidth = Math.min(420, Math.max(180, Math.floor(window.innerWidth * 0.46)));
        const maxHeight = Math.min(520, Math.max(220, Math.floor(window.innerHeight * 0.62)));
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

        const inlineDimensions = (
          Number(message?.mediaNaturalWidth) > 0
          && Number(message?.mediaNaturalHeight) > 0
        )
          ? {
              naturalWidth: Number(message.mediaNaturalWidth),
              naturalHeight: Number(message.mediaNaturalHeight)
            }
          : null;
        const dimensions = inlineDimensions || readCachedImageDimensions(message?.mediaUrl);
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

        if (
          !isAlbumTile
          && imageNode.naturalWidth > 0
          && imageNode.naturalHeight > 0
        ) {
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
            const fallbackSrc = String(imageNode.getAttribute("data-fallback-src") || "");
            if (fallbackSrc && imageNode.dataset.fallbackTried !== "true") {
              imageNode.dataset.fallbackTried = "true";
              imageNode.src = fallbackSrc;
              const linkNode = imageNode.closest(".message-image-link");
              if (linkNode) {
                linkNode.setAttribute("data-image-url", fallbackSrc);
              }
              return;
            }
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

      const closeAttachmentModal = () => {
        const attachmentModalContent = attachmentModal.querySelector(".attachment-modal-content");
        if (attachmentModalContent instanceof HTMLElement) {
          pendingAttachmentModalScrollTop = attachmentModalContent.scrollTop || 0;
        }
        attachmentModalEmojiPicker?.classList.remove("open");
        attachmentModalEmojiPicker?.setAttribute("aria-hidden", "true");
        attachmentModal.classList.remove("open");
        attachmentModal.setAttribute("aria-hidden", "true");
      };

      const clearPendingImageAttachment = (options = {}) => {
        const preservePreviewUrls = new Set(options.preservePreviewUrls || []);
        const closingAttachments = pendingImageAttachments.concat(pendingFileAttachments);
        const cleanupToken = ++attachmentModalCleanupToken;
        const attachmentModalShell = attachmentModal.querySelector(".attachment-modal-shell");

        if (attachmentModalCleanupTimer) {
          window.clearTimeout(attachmentModalCleanupTimer);
          attachmentModalCleanupTimer = null;
        }

        pendingImageAttachments = [];
        pendingImageAttachmentIndex = 0;
        pendingFileAttachments = [];
        pendingFileAttachmentIndex = 0;
        attachmentModalMode = "image";
        pendingImageCaption = "";
        pendingAttachmentModalScrollTop = 0;
        if (composerFileInput) {
          composerFileInput.value = "";
        }
        attachmentModalCaption.value = "";
        attachmentModalEmojiPicker?.classList.remove("open");
        attachmentModalEmojiPicker?.setAttribute("aria-hidden", "true");
        if (attachmentModalShell) {
          attachmentModalShell.classList.remove("is-file-mode");
          attachmentModalShell.classList.remove("is-multi");
          attachmentModalShell.classList.add("is-single");
        }
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
        if (attachmentModalMode !== "image" || pendingImageAttachments.length < 2) {
          return;
        }

        pendingImageAttachmentIndex = (pendingImageAttachmentIndex + direction + pendingImageAttachments.length) % pendingImageAttachments.length;
        renderAttachmentModal();
      };

      const renderAttachmentModal = (options = {}) => {
        if (attachmentModalMode === "file") {
          const attachment = pendingFileAttachments[pendingFileAttachmentIndex];
          const attachmentModalShell = attachmentModal.querySelector(".attachment-modal-shell");
          const attachmentModalContent = attachmentModal.querySelector(".attachment-modal-content");
          const preserveScroll = Boolean(options.preserveScroll);

          if (!attachment) {
            attachmentModal.classList.remove("open");
            attachmentModal.setAttribute("aria-hidden", "true");
            return;
          }

          const hasLongFileList = pendingFileAttachments.length > 6;
          if (attachmentModalShell) {
            attachmentModalShell.classList.add("is-file-mode");
            attachmentModalShell.classList.toggle("is-multi", hasLongFileList);
            attachmentModalShell.classList.toggle("is-single", !hasLongFileList);
          }

          attachmentModalTitle.textContent = formatFileCount(pendingFileAttachments.length);
          attachmentModalCaption.value = pendingImageCaption;
          attachmentModalPrev.hidden = true;
          attachmentModalNext.hidden = true;
          attachmentModalStrip.hidden = false;
          attachmentModalImage.removeAttribute("src");
          attachmentModalImage.alt = "";
          attachmentModalImage.parentElement?.classList.remove("loading");
          attachmentModalStrip.innerHTML = pendingFileAttachments.map((entry, index) => {
            const duration = formatDuration(Number(entry.durationSeconds) || 0);
            const size = formatBytes(Number(entry.file?.size) || 0);
            const meta = duration && size
              ? (duration + " • " + size)
              : (duration || size || "Audio file");
            return '<button class="attachment-modal-file-item' + (index === pendingFileAttachmentIndex ? ' active' : '') + '" type="button" data-file-attachment-index="' + index + '">' +
              '<span class="attachment-modal-file-icon" aria-hidden="true">▶</span>' +
              '<span class="attachment-modal-file-copy">' +
                '<span class="attachment-modal-file-name">' + escapeHtml(entry.file?.name || "Audio file") + '</span>' +
                '<span class="attachment-modal-file-meta">' + escapeHtml(meta) + '</span>' +
              '</span>' +
            '</button>';
          }).join("");

          attachmentModal.classList.add("open");
          attachmentModal.setAttribute("aria-hidden", "false");

          attachmentModalStrip.querySelectorAll("[data-file-attachment-index]").forEach((button) => {
            button.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              pendingFileAttachmentIndex = Number(button.getAttribute("data-file-attachment-index")) || 0;
              renderAttachmentModal();
            });
          });

          if (preserveScroll && attachmentModalContent instanceof HTMLElement) {
            attachmentModalContent.scrollTop = pendingAttachmentModalScrollTop;
          } else if (attachmentModalContent instanceof HTMLElement) {
            attachmentModalContent.scrollTop = 0;
          }
          return;
        }

        const attachment = pendingImageAttachments[pendingImageAttachmentIndex];
        const attachmentModalShell = attachmentModal.querySelector(".attachment-modal-shell");
        const attachmentModalContent = attachmentModal.querySelector(".attachment-modal-content");
        const preserveScroll = Boolean(options.preserveScroll);

        if (!attachment) {
          attachmentModal.classList.remove("open");
          attachmentModal.setAttribute("aria-hidden", "true");
          return;
        }
        const isMultiSelection = pendingImageAttachments.length > 1;
        if (attachmentModalShell) {
          attachmentModalShell.classList.remove("is-file-mode");
          attachmentModalShell.classList.toggle("is-multi", isMultiSelection);
          attachmentModalShell.classList.toggle("is-single", !isMultiSelection);
        }

        attachmentModalTitle.textContent = formatPhotoCount(pendingImageAttachments.length);
        attachmentModalImage.parentElement?.classList.add("loading");
        attachmentModalImage.src = attachment.previewUrl;
        attachmentModalImage.alt = attachment.file.name || "Photo";
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
        attachmentModalPrev.hidden = true;
        attachmentModalNext.hidden = true;
        attachmentModalStrip.hidden = pendingImageAttachments.length < 2;
        attachmentModalStrip.innerHTML = pendingImageAttachments.map((entry, index) => {
          return '<button class="attachment-modal-thumb' + (index === pendingImageAttachmentIndex ? ' active' : '') + '" type="button" data-attachment-index="' + index + '">' +
            '<img src="' + escapeHtml(entry.previewUrl) + '" alt="' + escapeHtml(entry.file.name || "Photo") + '" />' +
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
        if (preserveScroll && attachmentModalContent instanceof HTMLElement) {
          attachmentModalContent.scrollTop = pendingAttachmentModalScrollTop;
        } else {
          const activeThumb = attachmentModalStrip.querySelector('[data-attachment-index="' + pendingImageAttachmentIndex + '"]');
          if (activeThumb instanceof HTMLElement) {
            activeThumb.scrollIntoView({
              block: "nearest",
              inline: "nearest"
            });
          }
        }
      };

      const openAttachmentModal = (index = 0, options = {}) => {
        if (attachmentModalMode === "file") {
          if (!pendingFileAttachments.length) {
            return;
          }
        } else if (!pendingImageAttachments.length) {
          return;
        }

        attachmentModalCleanupToken += 1;
        if (attachmentModalCleanupTimer) {
          window.clearTimeout(attachmentModalCleanupTimer);
          attachmentModalCleanupTimer = null;
        }

        if (attachmentModalMode === "file") {
          pendingFileAttachmentIndex = Math.max(0, Math.min(index, pendingFileAttachments.length - 1));
        } else {
          pendingImageAttachmentIndex = Math.max(0, Math.min(index, pendingImageAttachments.length - 1));
        }
        renderAttachmentModal({
          preserveScroll: Boolean(options.preserveScroll)
        });
      };

      const addPendingImageAttachments = async (files) => {
        const validFiles = Array.from(files || []).filter((file) => file && String(file.type || "").startsWith("image/"));

        if (!validFiles.length) {
          showToast("Only images are supported.", "error");
          return;
        }

        const availableSlots = Math.max(0, MAX_MEDIA_ATTACHMENTS - pendingImageAttachments.length);

        if (!availableSlots) {
          showToast("You can select up to 500 photos at once.", "error");
          return;
        }

        const acceptedFiles = validFiles.slice(0, availableSlots);

        if (acceptedFiles.length < validFiles.length) {
          showToast("Selection limit: 500 photos.", "error");
        }

        const nextAttachments = await Promise.all(acceptedFiles.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          const measured = await measureImageUrl(previewUrl);
          return {
            id: "draft_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
            file,
            previewUrl,
            naturalWidth: Number(measured?.naturalWidth) || 0,
            naturalHeight: Number(measured?.naturalHeight) || 0
          };
        }));

        if (!pendingImageCaption && composerInput.value.trim()) {
          pendingImageCaption = composerInput.value.trim();
          composerInput.value = "";
          syncComposerState();
        }

        pendingImageAttachments = pendingImageAttachments.concat(nextAttachments);
        attachmentModalMode = "image";
        renderComposerAttachmentPreview();
        openAttachmentModal(pendingImageAttachments.length - nextAttachments.length);
      };

      const setPendingImageAttachment = (file) => {
        void addPendingImageAttachments([file]);
      };

      const addPendingFileAttachments = async (files) => {
        const validFiles = Array.from(files || []).filter((file) => file && String(file.type || "").startsWith("audio/"));

        if (!validFiles.length) {
          showToast("Only audio files are supported in File mode.", "error");
          return;
        }

        const availableSlots = Math.max(0, MAX_MEDIA_ATTACHMENTS - pendingFileAttachments.length);

        if (!availableSlots) {
          showToast("You can select up to 500 files at once.", "error");
          return;
        }

        const acceptedFiles = validFiles.slice(0, availableSlots);
        if (acceptedFiles.length < validFiles.length) {
          showToast("Selection limit: 500 files.", "error");
        }

        const nextAttachments = await Promise.all(acceptedFiles.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          const durationSeconds = await measureAudioDuration(previewUrl);
          return {
            id: "file_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
            file,
            previewUrl,
            durationSeconds: Number(durationSeconds) || 0
          };
        }));

        if (!pendingImageCaption && composerInput.value.trim()) {
          pendingImageCaption = composerInput.value.trim();
          composerInput.value = "";
          syncComposerState();
        }

        pendingFileAttachments = pendingFileAttachments.concat(nextAttachments);
        attachmentModalMode = "file";
        renderComposerAttachmentPreview();
        openAttachmentModal(pendingFileAttachments.length - nextAttachments.length);
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
        const formatVideoChatDuration = (totalSeconds) => {
          const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
          if (safe < 60) {
            return safe + " seconds";
          }
          const minutes = Math.floor(safe / 60);
          const seconds = safe % 60;
          if (minutes < 60) {
            return minutes + " min " + seconds + " sec";
          }
          const hours = Math.floor(minutes / 60);
          const remMinutes = minutes % 60;
          return hours + " h " + remMinutes + " min";
        };

        if (parsed.kind === "started_video") {
          return {
            title: (message.senderName || "Someone") + " started a video chat",
            subtitle: "",
            icon: "videocam",
            tone: "ended"
          };
        }

        if (parsed.kind === "ended_video") {
          return {
            title: (message.senderName || "Someone") + " ended the video chat",
            subtitle: "(" + formatVideoChatDuration(parsed.durationSeconds) + ")",
            icon: "videocam_off",
            tone: "declined"
          };
        }

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
          return albumSize > 1 ? albumSize + " photos" : "Photo";
        }

        if (message.type === "image") {
          return message.body ? "Photo: " + message.body : "Photo";
        }

        if (message.type === "audio") {
          return message.body ? "Audio: " + message.body : "Audio";
        }

        return message.body || "";
      };

      const getReplyPreviewText = (message) => {
        if (!message || !message.replyToMessageId) {
          return "";
        }

        if (message.replyToType === "image") {
          return message.replyToBody ? "Photo: " + message.replyToBody : "Photo";
        }

        if (message.replyToType === "audio") {
          return message.replyToBody ? "Audio: " + message.replyToBody : "Audio";
        }

        return String(message.replyToBody || "").trim();
      };

      const renderReplyPreviewHtml = (message) => {
        if (!message?.replyToMessageId) {
          return "";
        }

        return '<div class="message-reply" data-reply-target-id="' + escapeHtml(message.replyToMessageId) + '">' +
          '<span class="message-reply-author">' + escapeHtml(message.replyToSenderName || "Message") + '</span>' +
          '<span class="message-reply-text">' + renderEmojiAwareTextHtml(getReplyPreviewText(message) || "Message") + '</span>' +
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

        return date.toLocaleTimeString("en-US", {
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
        const safePreview = isUndecryptableSecurePlaceholder(preview) ? "Message" : preview;

        const rawCallPreview = parseCallSummaryMessage({ body: safePreview, senderId: dialog.lastMessageSenderName === "You" ? currentUserId : "" });
        const normalizedPreview = rawCallPreview
          ? (
              getCallSummaryPresentation({
                body: safePreview,
                senderId: dialog.lastMessageSenderName === "You" ? currentUserId : "",
                senderName: dialog.lastMessageSenderName || dialog.title || ""
              })?.title + " • " +
              getCallSummaryPresentation({
                body: safePreview,
                senderId: dialog.lastMessageSenderName === "You" ? currentUserId : "",
                senderName: dialog.lastMessageSenderName || dialog.title || ""
              })?.subtitle
            )
          : safePreview;

        if (dialog.type === "saved") {
          return "You: " + normalizedPreview;
        }

        if (dialog.type === "direct" || dialog.type === "group") {
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

        return date.toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
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
          top: viewportHeight / 2,
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

      const openViewerModal = ({ src, fallbackSrc, senderName, senderId, createdAt, sourceRect }) => {
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

`;
