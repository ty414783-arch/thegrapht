export const scrollPagination = () => `
      let isLoadingOlderMessages = false;
      const hasMoreOlderMessages = {};
      const paginationBoundary = {};

      const loadOlderMessages = async () => {
        if (isLoadingOlderMessages || !currentDialogPublicId) return;
        if (hasMoreOlderMessages[currentDialogPublicId] === false) return;

        const messages = currentMessagesSnapshot || [];
        if (messages.length === 0) return;

        const boundary = paginationBoundary[currentDialogPublicId];
        let beforeDate, beforeId;
        
        if (boundary) {
          beforeDate = boundary.date;
          beforeId = boundary.id;
        } else {
          const oldestMessage = messages[0];
          beforeDate = oldestMessage.createdAt;
          beforeId = oldestMessage.id;
        }

        isLoadingOlderMessages = true;

        const loaderDiv = document.createElement("div");
        loaderDiv.className = "chat-spinner-container top-spinner";
        loaderDiv.innerHTML = '<div class="boot-splash-inner"><svg class="boot-splash-circular" viewBox="22 22 44 44" aria-hidden="true" focusable="false"><circle class="boot-splash-circular-indicator" cx="44" cy="44" r="20.2"></circle></svg></div>';
        
        messageList.prepend(loaderDiv);

        try {
          const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages?beforeDate=" + encodeURIComponent(beforeDate) + "&beforeId=" + encodeURIComponent(beforeId));
          
          // Record scroll metrics AFTER fetch but BEFORE DOM changes!
          const previousScrollHeight = messageList.scrollHeight;

          loaderDiv.remove();

          if (payload.messages && payload.messages.length > 0) {
            const oldestOfBatch = payload.messages[0];
            paginationBoundary[currentDialogPublicId] = {
              date: oldestOfBatch.createdAt,
              id: oldestOfBatch.id
            };
          }

          const existingIds = new Set(messages.map((message) => String(message?.id || "")));
          const uniqueNewMessages = (payload.messages || []).filter((message) => !existingIds.has(String(message?.id || "")));

          if (uniqueNewMessages.length === 0) {
            if (!payload.messages || payload.messages.length === 0) {
              hasMoreOlderMessages[currentDialogPublicId] = false;
            }
            
            // Adjust scroll for loader removal using CURRENT scrollTop!
            const newScrollHeight = messageList.scrollHeight;
            messageList.scrollTop = messageList.scrollTop + (newScrollHeight - previousScrollHeight);
            
            isLoadingOlderMessages = false;
            return;
          }

          currentMessagesSnapshot = uniqueNewMessages.concat(messages);

          const items = annotateGroupIncomingSequences(buildRenderableMessageItems(uniqueNewMessages));
          const html = items.map((item) => (
            item.kind === "day"
              ? renderDaySeparator(item.dayValue)
              : item.kind === "album"
                ? renderAlbumMessage(item.messages, { groupIncomingMeta: item.groupIncomingMeta })
                : renderSingleMessage(item.messages[0], { groupIncomingMeta: item.groupIncomingMeta })
          )).join("");

          messageList.insertAdjacentHTML('afterbegin', html);
          
          if (typeof normalizeMessageDaySeparators === "function") {
            normalizeMessageDaySeparators();
          }

          const newScrollHeight = messageList.scrollHeight;
          messageList.scrollTop = messageList.scrollTop + (newScrollHeight - previousScrollHeight);

          isLoadingOlderMessages = false;

        } catch (error) {
          console.error("Failed to load older messages", error);
          if (loaderDiv.parentNode) {
            loaderDiv.remove();
          }
          isLoadingOlderMessages = false;
        }
      };

      messageList.addEventListener("scroll", () => {
        rememberCurrentDialogScrollTop();
        syncChatScrollBottomButton();
        updateScrollDayIndicator();

        if (computeIsNearChatBottom()) {
          const unreadDivider = messageList.querySelector(".message-unread-divider");
          if (unreadDivider && !unreadDivider.dataset.dismissing) {
            unreadDivider.dataset.dismissing = "true";
            unreadDivider.style.opacity = "0";
            unreadDivider.style.height = "0";
            unreadDivider.style.margin = "0";
            unreadDivider.style.padding = "0";
            unreadDivider.style.border = "none";
            window.setTimeout(() => {
              unreadDivider.remove();
            }, 300);
          }
        }
        
        // Only load more if we are near top AND there is actually content to scroll!
        if (messageList.scrollTop < 50 && messageList.scrollHeight > messageList.clientHeight) {
          void loadOlderMessages();
        }
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

      messageList.addEventListener("keydown", (event) => {
        const target = event.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
        if (scrollKeys.includes(event.key) && !suppressBottomLockCancel) {
          markManualScrollIntent();
        }
      }, { passive: true });

      chatScrollBottom.addEventListener("click", () => {
        scrollMessagesToBottom("smooth");
        requestAnimationFrame(() => {
          rememberCurrentDialogScrollTop();
          syncChatScrollBottomButton();
        });
      });


`;
