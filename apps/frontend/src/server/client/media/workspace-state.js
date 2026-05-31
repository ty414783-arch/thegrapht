export const workspaceState = () => `
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
          if (fallbackSrc && viewerModalImage.dataset.fallbackTried !== "true") {
            viewerModalImage.dataset.fallbackTried = "true";
            viewerModalImage.src = fallbackSrc;
            return;
          }
          viewerModal.classList.remove("open");
        };
        viewerModalImage.dataset.fallbackTried = "false";
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
          const isCached = (() => {
            if (typeof window.mediaUrlToBlobUrlCache !== "undefined" && window.mediaUrlToBlobUrlCache) {
              for (const value of window.mediaUrlToBlobUrlCache.values()) {
                if (value === removedMessage.mediaUrl) {
                  return true;
                }
              }
            }
            return false;
          })();
          if (!isCached) {
            URL.revokeObjectURL(removedMessage.mediaUrl);
          }
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
        markMessageDeletedLocally(messageId);
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
        const deletedMessageId = String(payload.messageId);
        markMessageDeletedLocally(payload.messageId);

        if (activeAudioElement instanceof HTMLAudioElement) {
          const activeAudioCard = activeAudioElement.closest("[data-audio-card]");
          const activeMessageId = activeAudioCard instanceof HTMLElement
            ? String(activeAudioCard.getAttribute("data-message-id") || "")
            : "";
          if ((activeMessageId && activeMessageId === deletedMessageId) || (activeAudioMessageId && activeAudioMessageId === deletedMessageId)) {
            stopActiveAudio();
          }
        } else if (activeAudioMessageId && activeAudioMessageId === deletedMessageId) {
          activeAudioMessageId = "";
          hideTopAudioPlayer();
        }

        const shouldStickToBottom = computeIsNearChatBottom();
        const previousScrollTop = messageList?.scrollTop || 0;
        const deletedMessageBefore = currentMessagesSnapshot.find((entry) => entry.id === payload.messageId) || null;
        const deletedAlbumId = deletedMessageBefore?.albumId || null;
        const deletedAlbumSizeBefore = deletedAlbumId
          ? currentMessagesSnapshot.filter((entry) => entry.albumId === deletedAlbumId).length
          : 0;
        const shouldUpdateAlbumInPlace = Boolean(deletedAlbumId && deletedAlbumSizeBefore > 1);
        const messageSelector = '[data-message-id="' + CSS.escape(String(payload.messageId)) + '"]';
        const renderedNode = messageList.querySelector(messageSelector);
        const hadMessageInSnapshot = Boolean(deletedMessageBefore);
        removeMessageFromCurrentState(payload.messageId);

        // Duplicate delete events can arrive after local apply/animation.
        // If message is already gone in state and DOM, skip expensive rerender.
        if (!hadMessageInSnapshot && !(renderedNode instanceof HTMLElement)) {
          rerenderDialogsIfVisible();
          return;
        }

        const currentLastMessage = currentMessagesSnapshot[currentMessagesSnapshot.length - 1] || null;
        const nextDialog = payload.dialog
          ? updateDialogInState(payload.dialog, {
              lastMessagePreview: currentLastMessage ? getMessagePreviewText(currentLastMessage) : payload.dialog.lastMessagePreview,
              lastMessageSenderName: currentLastMessage
                ? (
                    currentLastMessage.senderId === currentUserId
                      ? "You"
                      : (currentLastMessage.senderName || payload.dialog.title || "")
                  )
                : payload.dialog.lastMessageSenderName,
              lastMessageCreatedAt: currentLastMessage?.createdAt || payload.dialog.lastMessageCreatedAt
            }) || currentDialogSnapshot
          : currentDialogSnapshot;

        const shouldHandleInCurrentDialog = Boolean(
          (payload.dialog?.id && (payload.dialog.id === currentDialogId || currentDialogSnapshot?.id === payload.dialog.id))
          || renderedNode instanceof HTMLElement
          || hadMessageInSnapshot
        );

        if (shouldHandleInCurrentDialog) {
          if (shouldUpdateAlbumInPlace) {
            renderMessages(nextDialog, currentMessagesSnapshot, {
              scrollBehavior: shouldStickToBottom ? "auto" : "none",
              restoreScrollTop: shouldStickToBottom ? null : previousScrollTop
            });
            rerenderDialogsIfVisible();
            return;
          }

          const runAfterDeleteRender = () => {
            renderMessages(nextDialog, currentMessagesSnapshot, {
              scrollBehavior: shouldStickToBottom ? "auto" : "none",
              restoreScrollTop: shouldStickToBottom ? null : previousScrollTop
            });
          };

          if (renderedNode instanceof HTMLElement) {
            const initialHeight = renderedNode.getBoundingClientRect().height || renderedNode.offsetHeight || 0;
            renderedNode.style.pointerEvents = "none";
            renderedNode.style.height = initialHeight > 0 ? initialHeight + "px" : "";
            renderedNode.style.maxHeight = initialHeight > 0 ? initialHeight + "px" : "";
            renderedNode.style.transition =
              "opacity 220ms ease, transform 220ms ease, filter 220ms ease, height 260ms ease, max-height 260ms ease, margin 260ms ease, padding 260ms ease";

            requestAnimationFrame(() => {
              renderedNode.classList.add("message-removing");
              renderedNode.style.height = "0px";
              renderedNode.style.maxHeight = "0px";
            });

            window.setTimeout(() => {
              // Avoid full list rerender after delete animation to prevent
              // visible avatar/name flicker in group incoming rows.
              const groupIncomingRow = renderedNode.closest(".group-incoming-row");
              if (groupIncomingRow instanceof HTMLElement) {
                groupIncomingRow.remove();
              } else {
                renderedNode.remove();
              }
              normalizeMessageDaySeparators();

              if (!currentMessagesSnapshot.length) {
                runAfterDeleteRender();
              } else if (shouldStickToBottom) {
                scrollMessagesToBottom("auto");
              } else {
                syncChatScrollBottomButton();
              }

              rerenderDialogsIfVisible();
            }, 250);
          } else {
            runAfterDeleteRender();
          }
        } else if (payload.deletedForEveryone) {
          void loadWorkspace({ preserveRoute: true, scrollBehavior: "none" });
        }

        rerenderDialogsIfVisible();
      };

      const uploadImageBatch = async ({ attachments, caption }) => {
        if (!attachments.length || !currentDialogPublicId) {
          return;
        }

        await Promise.all(
          attachments.map((attachment) => measureImageUrl(attachment?.previewUrl || ""))
        );

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
            mediaNaturalWidth: Number(attachment.naturalWidth) || readCachedImageDimensions(attachment.previewUrl)?.naturalWidth || 0,
            mediaNaturalHeight: Number(attachment.naturalHeight) || readCachedImageDimensions(attachment.previewUrl)?.naturalHeight || 0,
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

              if (payload.dialog?.id === currentDialogId && payload.message) {
                if (!readCachedImageDimensions(payload.message.mediaUrl)) {
                  await measureImageUrl(payload.message.mediaUrl);
                }
                const serverDimensions = readCachedImageDimensions(payload.message.mediaUrl);
                const serverImageDimensions = serverDimensions?.naturalWidth && serverDimensions?.naturalHeight
                  ? {
                      mediaNaturalWidth: serverDimensions.naturalWidth,
                      mediaNaturalHeight: serverDimensions.naturalHeight
                    }
                  : (
                    localDraft?.mediaNaturalWidth && localDraft?.mediaNaturalHeight
                      ? {
                          mediaNaturalWidth: localDraft.mediaNaturalWidth,
                          mediaNaturalHeight: localDraft.mediaNaturalHeight
                        }
                      : {}
                  );

                if (localDraft && localDraft.mediaUrl && typeof window.registerMediaBlobUrl === "function") {
                  window.registerMediaBlobUrl(payload.message.mediaUrl, localDraft.mediaUrl);
                }

                appendConfirmedMessageToCurrentDialog(payload.dialog, payload.message, {
                  scrollBehavior: "auto",
                  replaceMessageId: localDraft?.id || "",
                  animateMessage: false,
                  messagePatch: serverImageDimensions
                });
              }

              if (localDraft) {
                removeLocalOutgoingMessage(localDraft.id);
              }
            }

            if (lastPayload?.message) {
              updateDialogInState(lastPayload.dialog, {
                lastMessagePreview: getMessagePreviewText(lastPayload.message),
                lastMessageSenderName: lastPayload.message.senderId === currentUserId
                  ? "You"
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

      const uploadAudioBatch = async ({ attachments, caption }) => {
        if (!attachments.length || !currentDialogPublicId) {
          return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 120000);
        const replyToMessageId = pendingReplyMessage?.id || "";
        const localDrafts = attachments.map((attachment, index) => ({
          id: "local_" + Date.now() + "_audio_" + index + "_" + Math.random().toString(36).slice(2, 8),
          dialogPublicId: currentDialogPublicId,
          senderId: currentUserId,
          senderName: workspaceUserName.textContent || "You",
          body: index === 0 ? caption : "",
          type: "audio",
          mediaUrl: attachment.previewUrl,
          attachmentMime: attachment.file.type,
          attachmentName: attachment.file.name,
          attachmentSize: Number(attachment.file.size) || 0,
          attachmentDurationSeconds: Number(attachment.durationSeconds) || 0,
          createdAt: new Date().toISOString(),
          localStatus: "pending",
          animateOnRender: index === attachments.length - 1
        }));

        localOutgoingMessages = localOutgoingMessages.concat(localDrafts);
        const appendedDrafts = localDrafts.every((draft, index) => appendLocalOutgoingMessageToCurrentDialog(draft, {
          scrollBehavior: "auto",
          forceScrollBottom: index === localDrafts.length - 1
        }));
        if (!appendedDrafts) {
          rerenderCurrentDialog({ scrollBehavior: "auto" });
        }

        try {
          let lastPayload = null;
          for (let index = 0; index < attachments.length; index += 1) {
            const attachment = attachments[index];
            const localDraft = localDrafts[index];
            const formData = new FormData();
            formData.append("file", attachment.file);
            formData.append("body", index === 0 ? caption : "");
            formData.append("attachmentDurationSeconds", String(Math.max(0, Math.round(Number(attachment.durationSeconds) || 0))));
            if (replyToMessageId && index === 0) {
              formData.append("replyToMessageId", replyToMessageId);
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

            if (payload.dialog?.id === currentDialogId && payload.message) {
              appendConfirmedMessageToCurrentDialog(payload.dialog, payload.message, {
                scrollBehavior: "auto",
                replaceMessageId: localDraft?.id || "",
                animateMessage: false,
                messagePatch: {
                  attachmentDurationSeconds: Number(attachment.durationSeconds) || 0,
                  attachmentSize: Number(attachment.file.size) || 0,
                  attachmentName: attachment.file.name || payload.message.attachmentName || "",
                  attachmentMime: attachment.file.type || payload.message.attachmentMime || ""
                }
              });
            }

            if (localDraft) {
              removeLocalOutgoingMessage(localDraft.id);
            }
          }

          if (lastPayload?.message) {
            updateDialogInState(lastPayload.dialog, {
              lastMessagePreview: getMessagePreviewText(lastPayload.message),
              lastMessageSenderName: lastPayload.message.senderId === currentUserId
                ? "You"
                : (lastPayload.message.senderName || lastPayload.dialog?.title || ""),
              lastMessageCreatedAt: lastPayload.message.createdAt || lastPayload.dialog?.lastMessageCreatedAt || ""
            });
          }
          clearPendingReplyMessage();
          playSound("send");
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

        const { lastMessagePreview, lastMessageSenderName, lastMessageCreatedAt, unreadCount } = options;
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
            lastMessageCreatedAt: lastMessageCreatedAt ?? dialogPatch.lastMessageCreatedAt ?? dialog.lastMessageCreatedAt,
            unreadCount: unreadCount ?? dialogPatch.unreadCount ?? dialog.unreadCount ?? 0
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
        if (isMessageDeletedLocally(message.id)) {
          return;
        }

        const replacementDraft = options.replaceMessageId
          ? getLocalMessagesForDialog(currentDialogPublicId).find((draft) => String(draft?.id || "") === String(options.replaceMessageId))
          : null;
        const hasInlineImageDimensions = Number(message?.mediaNaturalWidth) > 0 && Number(message?.mediaNaturalHeight) > 0;
        const draftImageDimensions = (!hasInlineImageDimensions && replacementDraft?.type === "image"
          && Number(replacementDraft?.mediaNaturalWidth) > 0
          && Number(replacementDraft?.mediaNaturalHeight) > 0)
          ? {
              mediaNaturalWidth: Number(replacementDraft.mediaNaturalWidth),
              mediaNaturalHeight: Number(replacementDraft.mediaNaturalHeight)
            }
          : {};
        const finalMessage = {
          ...message,
          ...draftImageDimensions,
          ...(options.messagePatch || {})
        };

        const finalMessageId = String(finalMessage.id || "");
        const hadMessageBefore = currentMessagesSnapshot.some((entry) => String(entry?.id || "") === finalMessageId);
        const isOwnMessage = finalMessage.senderId === currentUserId;
        const shouldStickToBottom = Boolean(options.forceScrollBottom) || isOwnMessage || computeIsNearChatBottom();

        const nextDialog = updateDialogInState(dialogPatch, {
          lastMessagePreview: getMessagePreviewText(finalMessage),
          lastMessageSenderName: finalMessage.senderId === currentUserId
            ? "You"
            : (finalMessage.senderName || dialogPatch.title || ""),
          lastMessageCreatedAt: finalMessage.createdAt || dialogPatch.lastMessageCreatedAt || ""
        }) || currentDialogSnapshot || dialogPatch;

        if (!hadMessageBefore) {
          currentMessagesSnapshot = currentMessagesSnapshot.concat([{
            ...finalMessage,
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
        const canFastAppend = !finalMessage.albumId
          && !messageList.querySelector(".empty-chat-state, .saved-empty-state, .direct-empty-state");

        if (canFastAppend) {
          const appendedFast = appendRenderableItemsToMessageList(
            buildRenderableMessageItems([{
              ...finalMessage,
              animateOnRender: options.animateMessage !== false
            }]),
            {
              replaceMessageId: options.replaceMessageId || ""
            }
          );

          if (appendedFast) {
            // Fast append renders from a cloned message object; persist "consumed"
            // animation state in snapshot to avoid second animation on later rerenders.
            currentMessagesSnapshot = currentMessagesSnapshot.map((entry) => (
              String(entry?.id || "") === finalMessageId
                ? { ...entry, animateOnRender: false }
                : entry
            ));
            if (nextDialog?.publicId) {
              setDialogPayloadCache(nextDialog.publicId, {
                dialog: nextDialog,
                messages: currentMessagesSnapshot
              });
            }
            if (shouldStickToBottom) {
              scrollMessagesToBottom(options.scrollBehavior || "auto");
            } else {
              syncChatScrollBottomButton();
            }
            return;
          }
        }

        // Duplicate realtime deliveries can land here with an already-rendered node.
        // Avoid forcing a full rerender to prevent visible double flicker.
        if (hadMessageBefore && !options.replaceMessageId) {
          if (shouldStickToBottom) {
            scrollMessagesToBottom(options.scrollBehavior || "auto");
          } else {
            syncChatScrollBottomButton();
          }
          return;
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
          return "recently online";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "recently online";
        }

        const now = new Date();
        const sameDay = now.toDateString() === date.toDateString();
        const timeLabel = date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit"
        });

        if (sameDay) {
          return "last seen at " + timeLabel;
        }

        const dateLabel = date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit"
        });

        return "last seen " + dateLabel + " at " + timeLabel;
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


`;
