export const sidebarClientChunk = `      const setStatus = (message, type) => {
        statusNode.textContent = message;
        statusNode.className = "status " + type;
      };

      const sidebarMenuButton = document.getElementById("sidebar-menu-button");
      const sidebarGlassMenu = document.getElementById("sidebar-glass-menu");
      const sidebarMenuProfile = document.getElementById("sidebar-menu-profile");
      const sidebarMenuSaved = document.getElementById("sidebar-menu-saved");
      const sidebarMenuLogout = document.getElementById("sidebar-menu-logout");

      const setSidebarMenuOpen = (isOpen) => {
        workspaceSidebar?.classList.toggle("menu-open", isOpen);
        if (sidebarGlassMenu) {
          sidebarGlassMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        }
      };

      const toggleSidebarMenu = () => {
        const isOpen = workspaceSidebar?.classList.contains("menu-open");
        setSidebarMenuOpen(!isOpen);
      };

      const animateModeChange = (nextMode) => {
        authCopyBlock.classList.add("switching");

        window.setTimeout(() => {
          const registerMode = nextMode === "register";
          authKicker.textContent = registerMode ? "Register" : "Sign in";
          authTitle.textContent = registerMode ? "Create account" : "Log in";
          authCopy.textContent = registerMode
            ? "Sign up to enter your Thegrapht workspace."
            : "Enter your email and password to sign in to Thegrapht.";
          submitButton.textContent = registerMode ? "Create account" : "Log in";
          metaText.textContent = registerMode ? "Already have an account?" : "No account?";
          toggleButton.textContent = registerMode ? "Back to sign in" : "Create account";
          nameField.classList.toggle("open", registerMode);
          nameInput.required = registerMode;
          passwordInput.autocomplete = registerMode ? "new-password" : "current-password";
          authCopyBlock.classList.remove("switching");
        }, 180);
      };

      const switchView = (showWorkspace) => {
        authView.classList.toggle("hidden", showWorkspace);
        workspaceView.classList.toggle("hidden", !showWorkspace);
        pageRoot.classList.toggle("workspace-mode", showWorkspace);
      };

      const finishBoot = (showWorkspace) => {
        const wasBooting = pageRoot.classList.contains("booting");
        switchView(showWorkspace);
        pageRoot.classList.remove("booting");
        finishAllTopProgress();
        if (showWorkspace && wasBooting) {
          chatWindow.classList.remove("motion-enter");
          void chatWindow.offsetWidth;
          chatWindow.classList.add("motion-enter");
          animateDialogListItems();
        }
      };

      const getFilteredDialogs = (dialogs) => {
        return dialogs.slice().sort((left, right) => {
          const rankDelta = getDialogTypeRank(left.type) - getDialogTypeRank(right.type);

          if (rankDelta !== 0) {
            return rankDelta;
          }

          return 0;
        });
      };

      const renderSearchLoadingState = () => {
        dialogList.classList.remove("search-empty");
        dialogList.classList.add("search-loading");
        dialogList.innerHTML =
          '<div class="search-loading-state">' +
            '<div class="search-spinner" aria-hidden="true"></div>' +
          '</div>';
        animateDialogListItems();
      };

      const renderSearchResults = (users) => {
        dialogList.classList.remove("search-loading");
        dialogList.classList.remove("search-empty");
        const query = currentSearchQuery.trim().toLowerCase();
        const savedDialog = allDialogs.find((dialog) => dialog.type === "saved");
        const selfMatches = Boolean(
          query
          && (
            String(currentUserDisplayName || "").toLowerCase().includes(query)
            || String(currentUserUsername || "").toLowerCase().includes(query)
            || String(currentUserEmail || "").toLowerCase().includes(query)
          )
        );
        const visibleUsers = selfMatches
          ? [
              {
                id: currentUserId,
                name: currentUserDisplayName || currentUserUsername || currentUserEmail || "You",
                username: currentUserUsername || "",
                isSelf: true
              },
              ...users.filter((user) => user.id !== currentUserId)
            ]
          : users;

        if (!visibleUsers.length) {
          dialogList.classList.add("search-empty");
          dialogList.innerHTML =
            '<div class="search-empty-state">' +
              '<video autoplay muted loop playsinline preload="auto" aria-hidden="true">' +
                '<source src="' + searchEmptyVideoUrl + '" type="video/mp4" />' +
              '</video>' +
              '<p class="search-empty-title">No results found</p>' +
              '<p class="search-empty-copy">Try another username or clear the search.</p>' +
            '</div>';
          animateDialogListItems();
          return;
        }

        dialogList.innerHTML = visibleUsers.map((user) => {
          const avatar = getAvatarMeta(user.id || user.username, user.name || user.username || "?");
          return '<button class="dialog-item" type="button" data-search-user-id="' + escapeHtml(user.id) + '">' +
            '<div class="dialog-avatar user-avatar" style="' + avatar.style + '"><img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" /></div>' +
            '<div class="dialog-body">' +
              '<div class="dialog-line only-title"><strong>' + escapeHtml(user.name) + '</strong></div>' +
                  '<p class="dialog-preview">' + (
                user.isSelf
                  ? 'You'
                  : '@' + escapeHtml(user.username)
              ) + '</p>' +
            '</div>' +
          '</button>';
        }).join("");

        dialogList.querySelectorAll("[data-search-user-id]").forEach((button) => {
          button.addEventListener("click", async () => {
            const targetUserId = button.getAttribute("data-search-user-id");
            if (!targetUserId) {
              return;
            }

            if (targetUserId === currentUserId && savedDialog?.publicId) {
              currentSearchQuery = "";
              currentSearchResults = [];
              sidebarSearch.value = "";
              renderDialogs(allDialogs, { animate: true });
              await loadDialog(savedDialog.publicId);
              return;
            }

            try {
              const payload = await createPreferredDirectDialog(targetUserId);

              const preparedPayload = await prepareDialogPayloadForDisplay(
                payload.dialog || null,
                payload.messages || []
              );

              currentSearchQuery = "";
              currentSearchResults = [];
              sidebarSearch.value = "";
              await loadWorkspace();
              if (preparedPayload.dialog?.publicId) {
                setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
                await loadDialog(preparedPayload.dialog.publicId);
              }
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Failed to open chat.", "error");
              showToast(error instanceof Error ? error.message : "Failed to open chat.", "error");
            }
          });
        });
        animateDialogListItems();
      };

      const renderDialogs = (dialogs, options = {}) => {
        const shouldAnimate = Boolean(options.animate);
        const visibleDialogs = getFilteredDialogs(dialogs);
        const sections = visibleDialogs.reduce((accumulator, dialog) => {
          const lastSection = accumulator[accumulator.length - 1];

          if (!lastSection || lastSection.type !== dialog.type) {
            accumulator.push({
              type: dialog.type,
              dialogs: [dialog]
            });
            return accumulator;
          }

          lastSection.dialogs.push(dialog);
          return accumulator;
        }, []);

        dialogList.classList.remove("search-loading");
        dialogList.classList.remove("search-empty");

        dialogList.innerHTML = sections.map((section) => {
          return '<section class="dialog-section">' +
            '<p class="dialog-section-label">' + escapeHtml(getDialogSectionTitle(section.type)) + '</p>' +
            section.dialogs.map((dialog) => {
              const active = dialog.id === currentDialogId ? " active" : "";
              return '<button class="dialog-item saved-item' + active + '" data-dialog-id="' + escapeHtml(dialog.id) + '" data-public-id="' + escapeHtml(dialog.publicId) + '">' +
                getDialogAvatarMarkup(dialog) +
                '<div class="dialog-body">' +
                  '<div class="dialog-line"><span class="dialog-title-wrap"><strong>' + escapeHtml(dialog.title) + '</strong></span><span class="dialog-meta">' + escapeHtml(formatDialogListTime(dialog.lastMessageCreatedAt)) + '</span></div>' +
                  '<div class="dialog-preview dialog-preview-row">' +
                    '<span class="dialog-preview-copy">' + renderDialogPreviewHtml(dialog) + '</span>' +
                  '</div>' +
                '</div>' +
              '</button>';
            }).join("") +
          '</section>';
        }).join("");

        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          button.addEventListener("click", () => {
            const dialogId = button.getAttribute("data-dialog-id");
            const publicId = button.getAttribute("data-public-id");
            if (dialogId && publicId) {
              void loadDialog(publicId);
            }
          });
        });
        if (shouldAnimate) {
          animateDialogListItems();
        }
      };

      const closeDialogContextMenu = () => {
        if (dialogContextMenuCloseTimer) {
          window.clearTimeout(dialogContextMenuCloseTimer);
          dialogContextMenuCloseTimer = null;
        }
        dialogContextMenu.classList.remove("open");
        dialogContextMenu.setAttribute("aria-hidden", "true");
        dialogContextMenuState = null;
      };

      const closeDialogContextMenuSoon = () => {
        if (dialogContextMenuCloseTimer) {
          window.clearTimeout(dialogContextMenuCloseTimer);
        }
        dialogContextMenuCloseTimer = window.setTimeout(() => {
          closeDialogContextMenu();
        }, 140);
      };

      const openDialogContextMenu = (event, context) => {
        if (!context?.publicId) {
          return;
        }

        dialogContextMenuState = context;
        dialogContextMenuBody.innerHTML =
          '<button class="dialog-context-menu-item" type="button" data-action="open_in_new">' +
            '<span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>' +
            '<span>Open chat in new window</span>' +
          '</button>';

        const menuWidth = 268;
        const menuHeight = 72;
        const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
        const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
        dialogContextMenu.style.left = left + "px";
        dialogContextMenu.style.top = top + "px";
        dialogContextMenu.classList.add("open");
        dialogContextMenu.setAttribute("aria-hidden", "false");

        dialogContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
          button.addEventListener("click", () => {
            const action = button.getAttribute("data-action");
            if (action !== "open_in_new" || !dialogContextMenuState?.publicId) {
              return;
            }

            const targetPath = "/" + encodeURIComponent(dialogContextMenuState.publicId);
            window.open(targetPath, "_blank", "noopener,noreferrer");
            closeDialogContextMenuSoon();
          });
        });
      };

      const closeDialog = (options = {}) => {
        sendTypingState(false);
        clearPendingReplyMessage();
        closeMessageContextMenu();
        closeDialogContextMenu();
        closeDeleteMessageModal();
        currentDialogId = "";
        currentDialogPublicId = "";
        pendingAutoBottomDialogPublicId = "";
        pendingAutoBottomCanceled = false;
        peerActiveInCurrentDialog = false;
        currentPeerReadAt = null;
        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
          typingStopTimer = null;
        }
        clearPendingImageAttachment();
        sendCurrentPresence();
        closeChatProfilePanel();
        renderMessages(null, []);
        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          button.classList.remove("active");
        });
        if (!options.skipHistory) {
          applyRoute("");
        }
      };

      const renderMessages = (dialog, messages, options = {}) => {
        uiRenderDebug("renderMessages:called", {
          dialogPublicId: dialog?.publicId || null,
          dialogType: dialog?.type || null,
          messageCount: Array.isArray(messages) ? messages.length : 0,
          options
        });
        const shouldAnimateList = Boolean(options.animateList);
        currentDialogSnapshot = dialog;
        currentMessagesSnapshot = Array.isArray(messages) ? messages : [];

        if (!dialog) {
          if (typeof preserveActiveAudioForLayoutChange === "function") {
            preserveActiveAudioForLayoutChange();
          }
          currentPeerReadAt = null;
          syncChatHeaderMeta();
          syncChatIslandActions();
          syncActiveCallChip();
          syncChatProfilePanel();
          workspaceMain.classList.add("empty-chat");
          workspaceMain.classList.remove("open-chat");
          chatStage.classList.add("empty");
          chatStage.classList.remove("open-chat");
          chatComposer.style.display = "none";
          composerInput.value = "";
          clearPendingImageAttachment();
          syncComposerState();
          messageList.classList.remove("saved-empty");
          messageList.innerHTML = '<div class="empty-chat-state"><p>Choose a chat to start messaging.</p><p>When you pick a dialog on the left, your conversation appears here.</p></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          if (shouldAnimateList) {
            requestAnimationFrame(() => animateMessageListItems());
          }
          finishDialogSwitchTransition();
          return;
        }

        const localMessages = getLocalMessagesForDialog(dialog.publicId);
        const mergedMessages = currentMessagesSnapshot.concat(localMessages);
        if (dialog.type !== "direct") {
          currentPeerReadAt = null;
        }

        workspaceMain.classList.remove("empty-chat");
        workspaceMain.classList.add("open-chat");
        chatStage.classList.remove("empty");
        chatStage.classList.add("open-chat");
        chatComposer.style.display = "flex";
        chatTitle.textContent = dialog.title;
        chatSubtitle.textContent = formatDialogSubtitle(dialog);
        syncChatHeaderMeta();
        syncChatProfilePanel();
        syncChatIslandActions();
        syncActiveCallChip();
        syncComposerState();
        if (dialog.type === "saved" && mergedMessages.length === 0) {
          bottomLockToken += 1;
          messageList.classList.remove("preparing-bottom");
          messageList.classList.add("saved-empty");
          messageList.innerHTML = '<div class="saved-empty-state"><h3>Your personal space</h3><p>Forward useful messages here.</p><p>Store photos and videos here safely.</p></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          closeChatSearch();
          if (shouldAnimateList) {
            requestAnimationFrame(() => animateMessageListItems());
          }
          finishDialogSwitchTransition();
          return;
        }

        if (dialog.type === "direct" && mergedMessages.length === 0) {
          bottomLockToken += 1;
          messageList.classList.remove("preparing-bottom");
          const peerName = escapeHtml(dialog.title || "this user");
          messageList.classList.remove("saved-empty");
          messageList.innerHTML = '<div class="direct-empty-state"><div class="direct-empty-card"><h3>Start chatting with ' + peerName + '</h3><p>Once you send the first message, your chat history appears here.</p></div></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          if (chatSearchPanel.classList.contains("open")) {
            renderChatSearchResults();
          }
          syncActiveCallChip();
          if (shouldAnimateList) {
            requestAnimationFrame(() => animateMessageListItems());
          }
          finishDialogSwitchTransition();
          return;
        }

        messageList.classList.remove("saved-empty");
        const recentManualIntent = Date.now() - manualScrollIntentAt < 4000;
        const forceBottomForRender = Boolean(options.forceScrollBottom) || consumeForceBottomOnNextDialogRender();
        const hasRestoreScrollTop = Number.isFinite(options.restoreScrollTop) && Number(options.restoreScrollTop) > 0;
        const shouldPrepareBottom = !options.openingDialog && (Boolean(options.forceScrollBottom) || (options.scrollBehavior !== "none"
          && !(
            options.openingDialog
            && pendingAutoBottomCanceled
            && pendingAutoBottomDialogPublicId
            && dialog.publicId === pendingAutoBottomDialogPublicId
          )
          && (!recentManualIntent || forceBottomForRender))
          && !hasRestoreScrollTop);
        const applyRestoredScrollTop = () => {
          if (!hasRestoreScrollTop) {
            return false;
          }

          suppressBottomLockCancel = true;
          const maxTop = Math.max(0, messageList.scrollHeight - messageList.clientHeight);
          const nextTop = Math.min(maxTop, Math.max(0, Number(options.restoreScrollTop) || 0));
          messageList.scrollTop = nextTop;
          requestAnimationFrame(() => {
            suppressBottomLockCancel = false;
            syncChatScrollBottomButton();
            rememberCurrentDialogScrollTop();
          });
          return true;
        };
        const renderLockToken = shouldPrepareBottom ? startBottomLock({
          hideList: !options.forceScrollBottom
        }) : 0;
        if (!shouldPrepareBottom) {
          messageList.classList.remove("preparing-bottom");
        }
        if (typeof preserveActiveAudioForLayoutChange === "function") {
          preserveActiveAudioForLayoutChange();
        }
        messageList.innerHTML = buildRenderableMessageItems(mergedMessages).map((item) => (
          item.kind === "day"
            ? renderDaySeparator(item.dayValue)
            : item.kind === "album"
              ? renderAlbumMessage(item.messages)
              : renderSingleMessage(item.messages[0])
        )).join("");
        if (typeof normalizeMessageDaySeparators === "function") {
          normalizeMessageDaySeparators();
        }
        const pendingImages = hydrateMessageImages({ lockToken: renderLockToken });
        if (chatSearchPanel.classList.contains("open")) {
          renderChatSearchResults();
        }
        syncActiveCallChip();
        prefetchDialogMedia(mergedMessages);
        if (shouldPrepareBottom) {
          hardPinMessagesToBottom(renderLockToken);
        }
        if (shouldPrepareBottom && pendingImages.length) {
          let settledCount = 0;
          const settle = () => {
            settledCount += 1;
            if (settledCount >= pendingImages.length) {
              requestAnimationFrame(() => {
                finishBottomLock(renderLockToken);
                if (options.scrollBehavior === "smooth") {
                  scrollMessagesToBottom("smooth");
                }
                if (forceBottomForRender && !bottomLockCanceledByUser) {
                  hardPinMessagesToBottom(renderLockToken);
                }
              });
            }
          };

          pendingImages.forEach((imageNode) => {
            imageNode.addEventListener("load", settle, { once: true });
            imageNode.addEventListener("error", settle, { once: true });
          });

          window.setTimeout(() => {
            finishBottomLock(renderLockToken);
            if (options.scrollBehavior === "smooth") {
              scrollMessagesToBottom("smooth");
            }
            if (forceBottomForRender && !bottomLockCanceledByUser) {
              hardPinMessagesToBottom(renderLockToken);
            }
          }, 900);
        } else {
          requestAnimationFrame(() => {
            if (shouldPrepareBottom) {
              finishBottomLock(renderLockToken);
              if (options.scrollBehavior === "smooth") {
                scrollMessagesToBottom("smooth");
              }
              if (forceBottomForRender && !bottomLockCanceledByUser) {
                hardPinMessagesToBottom(renderLockToken);
              }
              return;
            }
            if (!applyRestoredScrollTop()) {
              syncChatScrollBottomButton();
            }
          });
        }
        finishDialogSwitchTransition();
        if (shouldAnimateList) {
          window.setTimeout(() => animateMessageListItems(), shouldPrepareBottom ? 120 : 0);
        }
      };

      const fetchJson = async (url, options = {}) => {
        const requestHeaders = {
          ...(options.headers || {})
        };

        const host = String(window.location.hostname || "").toLowerCase();
        const canUseLegacyAuthorizationHeader = host === "localhost"
          || host === "127.0.0.1"
          || host.endsWith(".local");
        if (canUseLegacyAuthorizationHeader && legacySessionToken && !requestHeaders.Authorization) {
          requestHeaders.Authorization = "Bearer " + legacySessionToken;
        }

        startTopProgress();

        try {
          let response;

          try {
            response = await fetch(url, {
              credentials: "include",
              headers: requestHeaders,
              ...options
            });
          } catch (error) {
            const currentHost = window.location.hostname || "";
            const hint = currentHost === "web.thegrapht.su"
              ? " Could not reach API at web.thegrapht.su."
              : "";
            throw new Error("Network request failed." + hint);
          }

          const rawBody = await response.text();
          const payload = rawBody ? JSON.parse(rawBody) : {};

          if (!response.ok) {
            if (response.status === 401 && !String(url).includes("/auth/")) {
              persistLegacySessionToken("");
              if (currentUserId) {
                handleUnauthorizedSession(payload.error || "Session ended. Please sign in again.");
              } else {
                disableRealtime();
              }
            }

            throw new Error(payload.error || "Request failed.");
          }

          return payload;
        } finally {
          finishTopProgress();
        }
      };

      const applyRoute = (publicId) => {
        const nextPath = publicId ? "/" + publicId : "/";
        if (window.location.pathname !== nextPath) {
          window.history.pushState({}, "", nextPath);
        }
      };

      const uiRenderDebugEnabled = true;
      const uiRenderDebug = (event, details = {}) => {
        if (!uiRenderDebugEnabled) {
          return;
        }
        try {
          console.log("[TheGraphT UI DEBUG]", event, {
            ts: Date.now(),
            route: window.location.pathname || "/",
            currentDialogPublicId: currentDialogPublicId || null,
            currentDialogId: currentDialogId || null,
            ...details
          });
        } catch {}
      };

      const loadDialog = async (publicId, options = {}) => {
        uiRenderDebug("loadDialog:start", {
          publicId: publicId || null,
          options
        });
        if (!publicId) {
          return;
        }

        if (currentDialogPublicId === publicId && currentDialogSnapshot && !options.forceReload) {
          if (!options.skipHistory) {
            applyRoute(publicId);
          }
          return;
        }

        if (currentDialogId && currentDialogPublicId !== publicId) {
          sendTypingState(false);
          rememberCurrentDialogScrollTop();
        }

        if (currentDialogPublicId !== publicId) {
          clearPendingReplyMessage();
          closeChatProfilePanel();
          if (activeCall && activeCall.dialogPublicId !== publicId) {
            minimizeCallModal();
          }
        }

        activeDialogLoadToken += 1;
        const loadToken = activeDialogLoadToken;
        const cachedPayload = options.skipCache ? null : getDialogPayloadCache(publicId);
        const shouldRestoreScrollTop = Boolean(options.restoreScrollOnOpen);
        const restoredScrollTop = shouldRestoreScrollTop ? getDialogScrollTop(publicId) : 0;
        const hasRestoredScrollTop = shouldRestoreScrollTop
          && Number.isFinite(restoredScrollTop)
          && restoredScrollTop > 0;

        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          button.classList.toggle("active", button.getAttribute("data-public-id") === publicId);
        });

        if (!options.skipHistory) {
          applyRoute(publicId);
        }

        if (cachedPayload?.dialog && !options.forceReload) {
          uiRenderDebug("loadDialog:cached", {
            publicId,
            messageCount: Array.isArray(cachedPayload.messages) ? cachedPayload.messages.length : 0
          });
          await preloadDialogMediaDimensions(cachedPayload.messages);
          prefetchDialogMedia(cachedPayload.messages);
          currentDialogId = cachedPayload.dialog.id;
          currentDialogPublicId = cachedPayload.dialog.publicId;
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = cachedPayload.dialog.peerReadAt || null;
          renderMessages(cachedPayload.dialog, cachedPayload.messages, {
            // Keep cached dialog instant: no loading overlay or delayed reveal.
            scrollBehavior: "none",
            openingDialog: false,
            animateList: false,
            forceScrollBottom: !hasRestoredScrollTop,
            restoreScrollTop: hasRestoredScrollTop ? restoredScrollTop : null
          });

          if (pendingDialogPublicIdFromNotification === cachedPayload.dialog.publicId) {
            pendingDialogPublicIdFromNotification = "";
          }

          pendingAutoBottomDialogPublicId = "";
          sendCurrentPresence();
          return;
        }

        pendingAutoBottomDialogPublicId = publicId;
        pendingAutoBottomCanceled = false;
        forceBottomOnNextDialogRender = !hasRestoredScrollTop && options.scrollBehavior !== "none";

        try {
          const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(publicId) + "/messages");
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.messages || []);

          if (loadToken !== activeDialogLoadToken) {
            return;
          }

          setDialogPayloadCache(publicId, preparedPayload);
          await preloadDialogMediaDimensions(preparedPayload.messages);
          prefetchDialogMedia(preparedPayload.messages);
          currentDialogId = preparedPayload.dialog.id;
          currentDialogPublicId = preparedPayload.dialog.publicId;
          if (pendingDialogPublicIdFromNotification === preparedPayload.dialog.publicId) {
            pendingDialogPublicIdFromNotification = "";
          }
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = preparedPayload.dialog.peerReadAt || null;
          const cachedSignature = cachedPayload?.messages
            ? cachedPayload.messages.map((message) => message.id).join("|")
            : "";
          const nextSignature = (preparedPayload.messages || []).map((message) => message.id).join("|");
          const lastPreparedMessage = (preparedPayload.messages || []).length
            ? preparedPayload.messages[preparedPayload.messages.length - 1]
            : null;

          if (lastPreparedMessage && !lastPreparedMessage.decryptionFailed) {
            updateDialogInState(preparedPayload.dialog, {
              lastMessagePreview: getMessagePreviewText(lastPreparedMessage),
              lastMessageSenderName: lastPreparedMessage.senderId === currentUserId
                ? "You"
                : (lastPreparedMessage.senderName || preparedPayload.dialog?.title || ""),
              lastMessageCreatedAt: lastPreparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
            });
            if (!currentSearchQuery.trim()) {
              renderDialogs(allDialogs);
            }
          }

          if (!cachedPayload?.dialog || cachedSignature !== nextSignature) {
            uiRenderDebug("loadDialog:renderMessages", {
              publicId,
              cachedSignature,
              nextSignature,
              messageCount: Array.isArray(preparedPayload.messages) ? preparedPayload.messages.length : 0,
              options
            });
            renderMessages(preparedPayload.dialog, preparedPayload.messages, {
              scrollBehavior: hasRestoredScrollTop ? "none" : (options.scrollBehavior || "auto"),
              openingDialog: true,
              animateList: false,
              forceScrollBottom: !hasRestoredScrollTop,
              restoreScrollTop: hasRestoredScrollTop ? restoredScrollTop : null
            });
          } else {
            currentDialogSnapshot = preparedPayload.dialog;
            currentMessagesSnapshot = preparedPayload.messages || [];
            refreshCurrentDialogChrome();
          }
          pendingAutoBottomDialogPublicId = "";
          sendCurrentPresence();
        } catch (error) {
          pendingAutoBottomDialogPublicId = "";
          finishDialogSwitchTransition();
          throw error;
        }
      };

      let workspaceLoadInFlightPromise = null;

      const setPrimaryTabBlockerVisible = (isVisible) => {
        if (!multiTabBlocker) {
          return;
        }
        multiTabBlocker.classList.toggle("visible", Boolean(isVisible));
        multiTabBlocker.setAttribute("aria-hidden", isVisible ? "false" : "true");
      };

      const readTabOwnerRecord = (key) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) {
            return null;
          }
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") {
            return null;
          }
          const ownerId = String(parsed.ownerId || "");
          const expiresAt = Number(parsed.expiresAt || 0);
          if (!ownerId || !Number.isFinite(expiresAt)) {
            return null;
          }
          return { ownerId, expiresAt };
        } catch {
          return null;
        }
      };

      const writeTabOwnerRecord = (key, ttlMs) => {
        const payload = JSON.stringify({
          ownerId: notificationTabId,
          expiresAt: Date.now() + ttlMs
        });
        try {
          localStorage.setItem(key, payload);
          return true;
        } catch {
          return false;
        }
      };

      const refreshSidebarNotificationOwnership = () => {
        const record = readTabOwnerRecord(NOTIFICATION_OWNER_STORAGE_KEY);
        const now = Date.now();
        if (!record || record.expiresAt <= now || record.ownerId === notificationTabId) {
          writeTabOwnerRecord(NOTIFICATION_OWNER_STORAGE_KEY, NOTIFICATION_OWNER_TTL_MS);
        }
      };

      const startSidebarNotificationOwnershipHeartbeat = () => {
        if (notificationOwnershipTimer) {
          window.clearInterval(notificationOwnershipTimer);
        }
        refreshSidebarNotificationOwnership();
        notificationOwnershipTimer = window.setInterval(() => {
          refreshSidebarNotificationOwnership();
        }, NOTIFICATION_OWNER_HEARTBEAT_MS);
      };

      const refreshSidebarPrimaryTabOwnership = () => {
        const record = readTabOwnerRecord(ACTIVE_TAB_OWNER_STORAGE_KEY);
        const now = Date.now();
        const ownedByCurrentTab = Boolean(record && record.ownerId === notificationTabId && record.expiresAt > now);

        if (!record || record.expiresAt <= now || ownedByCurrentTab) {
          writeTabOwnerRecord(ACTIVE_TAB_OWNER_STORAGE_KEY, ACTIVE_TAB_OWNER_TTL_MS);
          setPrimaryTabBlockerVisible(false);
          return;
        }

        setPrimaryTabBlockerVisible(true);
      };

      const startSidebarPrimaryTabOwnershipHeartbeat = () => {
        if (activeTabOwnershipTimer) {
          window.clearInterval(activeTabOwnershipTimer);
        }
        refreshSidebarPrimaryTabOwnership();
        activeTabOwnershipTimer = window.setInterval(() => {
          refreshSidebarPrimaryTabOwnership();
        }, Math.max(1200, Math.floor(ACTIVE_TAB_OWNER_TTL_MS / 3)));
      };

      const releaseSidebarPrimaryTabOwnership = () => {
        const record = readTabOwnerRecord(ACTIVE_TAB_OWNER_STORAGE_KEY);
        if (!record || record.ownerId !== notificationTabId) {
          return;
        }
        try {
          localStorage.removeItem(ACTIVE_TAB_OWNER_STORAGE_KEY);
        } catch {}
      };

      const loadWorkspace = (options = {}) => {
        uiRenderDebug("loadWorkspace:requested", { options, inFlight: Boolean(workspaceLoadInFlightPromise) });
        if (workspaceLoadInFlightPromise) {
          uiRenderDebug("loadWorkspace:joined_inflight", { options });
          return workspaceLoadInFlightPromise;
        }

        workspaceLoadInFlightPromise = (async () => {
          const isInitialWorkspaceBoot = pageRoot.classList.contains("booting");

          if (currentUserId) {
            uiRenderDebug("loadWorkspace:start_transition", { options });
            startDialogSwitchTransition();
          }

          const routePublicId = pendingDialogPublicIdFromNotification
            || (
              options.preserveRoute
                ? currentDialogPublicId || (window.location.pathname !== "/" ? decodeURIComponent(window.location.pathname.slice(1)) : "")
                : (window.location.pathname !== "/" ? decodeURIComponent(window.location.pathname.slice(1)) : "")
            );
          const payload = await fetchJson(apiBase + "/v1/client-state" + (routePublicId ? "?publicId=" + encodeURIComponent(routePublicId) : ""));

          currentUserId = payload.user.id;
          currentUserUsername = payload.user.username || "";
          currentUserEmail = payload.user.email || "";
          currentUserDisplayName = payload.user.displayName || payload.user.username || payload.user.email || "TheGraphT user";
          currentUserAvatarLetter = String(currentUserDisplayName || "?").trim().charAt(0).toUpperCase() || "?";
          secureFeatureState.identityPromise = null;
          secureFeatureState.publishPromise = null;
          void ensureOwnSecureKeyBundlePublished().catch((error) => {
            console.warn("Secure key bundle publish skipped.", error);
          });
          const hydrateDialogPreviewsForSidebar = async (dialogs) => {
            if (!Array.isArray(dialogs) || !dialogs.length) {
              return [];
            }

            const preparedDialogs = [];

            for (const dialog of dialogs) {
              if (!dialog
                || dialog.encryptionMode !== "e2e_v1"
                || !dialog.lastMessageCiphertext
                || !dialog.lastMessageNonce) {
                preparedDialogs.push(dialog);
                continue;
              }

              try {
                const lastSenderId = dialog.lastMessageSenderName === "You"
                  ? currentUserId
                  : (dialog.peerUserId || "");
                const decryptedLastMessage = await decryptSecureMessage(dialog, {
                  id: dialog.lastMessageId || "",
                  type: dialog.lastMessageType || "text",
                  body: "",
                  ciphertext: dialog.lastMessageCiphertext,
                  nonce: dialog.lastMessageNonce,
                  senderId: lastSenderId,
                  senderName: dialog.lastMessageSenderName || dialog.title || "",
                  senderKeyId: dialog.lastMessageSenderKeyId || null
                });

                if (!decryptedLastMessage?.decryptionFailed) {
                  const readablePreview = String(getMessagePreviewText(decryptedLastMessage) || "").trim();
                  if (readablePreview && !isUndecryptableSecurePlaceholder(readablePreview)) {
                    preparedDialogs.push({
                      ...dialog,
                      lastMessagePreview: readablePreview
                    });
                    continue;
                  }
                }
              } catch {}

              preparedDialogs.push(dialog);
            }

            return preparedDialogs;
          };

          const preparedSelection = await prepareDialogPayloadForDisplay(payload.selectedDialog || null, payload.messages || []);
          uiRenderDebug("loadWorkspace:fetched", {
            selectedDialogPublicId: preparedSelection.dialog?.publicId || null,
            selectedMessageCount: Array.isArray(preparedSelection.messages) ? preparedSelection.messages.length : 0,
            dialogsCount: Array.isArray(payload.dialogs) ? payload.dialogs.length : 0
          });
          workspaceUserName.textContent = currentUserDisplayName;
          allDialogs = await hydrateDialogPreviewsForSidebar(payload.dialogs || []);
          currentDialogId = preparedSelection.dialog ? preparedSelection.dialog.id : "";
          currentDialogPublicId = preparedSelection.dialog ? preparedSelection.dialog.publicId : "";
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = preparedSelection.dialog?.peerReadAt || null;
          if (currentSearchQuery.trim()) {
            renderSearchResults(currentSearchResults);
          } else {
            renderDialogs(allDialogs);
          }
          if (preparedSelection.dialog?.publicId) {
            setDialogPayloadCache(preparedSelection.dialog.publicId, preparedSelection);
            await preloadDialogMediaDimensions(preparedSelection.messages);
            prefetchDialogMedia(preparedSelection.messages);
          }
          forceBottomOnNextDialogRender = Boolean(preparedSelection.dialog?.publicId) && options.scrollBehavior !== "none";
          renderMessages(preparedSelection.dialog, preparedSelection.messages, {
            scrollBehavior: options.scrollBehavior || "auto",
            animateList: isInitialWorkspaceBoot,
            forceScrollBottom: Boolean(preparedSelection.dialog?.publicId)
          });
          uiRenderDebug("loadWorkspace:renderMessages", {
            selectedDialogPublicId: preparedSelection.dialog?.publicId || null,
            selectedMessageCount: Array.isArray(preparedSelection.messages) ? preparedSelection.messages.length : 0,
            options
          });
          if (pendingDialogPublicIdFromNotification && preparedSelection.dialog?.publicId === pendingDialogPublicIdFromNotification) {
            pendingDialogPublicIdFromNotification = "";
          }
          bindNotificationPermissionPrompt();
          scheduleBackgroundRefresh();
          sendCurrentPresence();
          finishBoot(true);
        })();

        return workspaceLoadInFlightPromise.finally(() => {
          uiRenderDebug("loadWorkspace:finished");
          workspaceLoadInFlightPromise = null;
        });
      };

      window.addEventListener("popstate", () => {
        if (currentUserId) {
          void loadWorkspace().catch(() => {
            finishBoot(false);
          });
        }
      });

      startSidebarNotificationOwnershipHeartbeat();
      startSidebarPrimaryTabOwnershipHeartbeat();

      window.addEventListener("focus", () => {
        refreshSidebarNotificationOwnership();
        refreshSidebarPrimaryTabOwnership();
        scheduleBackgroundRefresh();
      });

      document.addEventListener("visibilitychange", () => {
        refreshSidebarNotificationOwnership();
        refreshSidebarPrimaryTabOwnership();
        scheduleBackgroundRefresh();
      });

      window.addEventListener("storage", (event) => {
        if (event.key === ACTIVE_TAB_OWNER_STORAGE_KEY) {
          refreshSidebarPrimaryTabOwnership();
        }
      });

      window.addEventListener("beforeunload", () => {
        releaseSidebarPrimaryTabOwnership();
      });

      const shouldBlockWorkspaceClipboard = () => !workspaceView.classList.contains("hidden");
      const isEditableTarget = (target) => {
        if (!(target instanceof Element)) {
          return false;
        }
        return Boolean(target.closest("input, textarea, [contenteditable='true'], [contenteditable='plaintext-only']"));
      };
      const isMessageTextTarget = (target) => {
        if (!(target instanceof Element)) {
          return false;
        }
        return Boolean(target.closest(".message-body, .message-reply-text"));
      };
      const hasAllowedMessageTextSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount < 1 || selection.isCollapsed) {
          return false;
        }
        const anchorNode = selection.anchorNode;
        const focusNode = selection.focusNode;
        const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
        const focusElement = focusNode instanceof Element ? focusNode : focusNode?.parentElement;
        return Boolean(
          anchorElement
          && focusElement
          && isMessageTextTarget(anchorElement)
          && isMessageTextTarget(focusElement)
        );
      };

      document.addEventListener("copy", (event) => {
        if (!shouldBlockWorkspaceClipboard()) {
          return;
        }
        if (hasAllowedMessageTextSelection()) {
          return;
        }
        event.preventDefault();
      });

      document.addEventListener("cut", (event) => {
        if (!shouldBlockWorkspaceClipboard()) {
          return;
        }
        if (hasAllowedMessageTextSelection()) {
          return;
        }
        event.preventDefault();
      });

      document.addEventListener("selectstart", (event) => {
        if (
          !shouldBlockWorkspaceClipboard()
          || isEditableTarget(event.target)
          || isMessageTextTarget(event.target)
        ) {
          return;
        }
        event.preventDefault();
      });

      document.addEventListener("contextmenu", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }

        if (workspaceView.classList.contains("hidden")) {
          return;
        }

        if (!target.closest("#workspace-view")) {
          return;
        }

        const allowNativeContextMenu = Boolean(target.closest("#composer-input"));

        if (allowNativeContextMenu) {
          return;
        }

        event.preventDefault();
      });

      dialogList.addEventListener("contextmenu", (event) => {
        const target = event.target instanceof Element
          ? event.target.closest(".dialog-item[data-public-id]")
          : null;

        if (!target) {
          closeDialogContextMenu();
          return;
        }

        const publicId = target.getAttribute("data-public-id");
        const dialogId = target.getAttribute("data-dialog-id");
        if (!publicId || !dialogId) {
          closeDialogContextMenu();
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        openDialogContextMenu(event, { publicId, dialogId });
      });

      dialogContextMenu?.addEventListener("mouseenter", () => {
        if (dialogContextMenuCloseTimer) {
          window.clearTimeout(dialogContextMenuCloseTimer);
          dialogContextMenuCloseTimer = null;
        }
      });

      dialogContextMenu?.addEventListener("mouseleave", () => {
        closeDialogContextMenuSoon();
      });

      document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }

        if (!target.closest("#dialog-context-menu")) {
          closeDialogContextMenu();
        }

        if (
          !target.closest("#sidebar-glass-menu")
          && !target.closest("#sidebar-menu-button")
          && workspaceSidebar?.classList.contains("menu-open")
        ) {
          setSidebarMenuOpen(false);
        }
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && dialogContextMenu.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeDialogContextMenu();
          return;
        }

        if (event.key === "Escape" && workspaceSidebar?.classList.contains("menu-open")) {
          event.preventDefault();
          setSidebarMenuOpen(false);
          return;
        }

        if (event.key === "Escape" && viewerModal.classList.contains("open")) {
          closeViewerModal();
          return;
        }

        if (event.key === "Escape" && chatProfilePanel.classList.contains("open")) {
          closeChatProfilePanel();
          return;
        }

        if (event.key === "Escape" && chatSearchPanel.classList.contains("open")) {
          closeChatSearch();
          return;
        }

        if (event.key === "Escape" && attachmentModal.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeAttachmentModal();
          return;
        }

        if (attachmentModal.classList.contains("open") && event.key === "ArrowLeft") {
          event.preventDefault();
          moveAttachmentModal(-1);
          return;
        }

        if (attachmentModal.classList.contains("open") && event.key === "ArrowRight") {
          event.preventDefault();
          moveAttachmentModal(1);
          return;
        }

        if ((event.key === "+" || event.key === "=") && event.ctrlKey && viewerModal.classList.contains("open")) {
          event.preventDefault();
          setViewerZoom(viewerZoom + 0.14);
          return;
        }

        if (event.key === "-" && event.ctrlKey && viewerModal.classList.contains("open")) {
          event.preventDefault();
          setViewerZoom(viewerZoom - 0.14);
          return;
        }

        if (event.key === "Escape" && currentDialogId) {
          closeDialog();
        }
      });

      sidebarSearch.addEventListener("input", () => {
        currentSearchQuery = sidebarSearch.value || "";
        if (searchDelayTimer) {
          window.clearTimeout(searchDelayTimer);
          searchDelayTimer = null;
        }

        if (!currentSearchQuery.trim()) {
          currentSearchResults = [];
          renderDialogs(allDialogs, { animate: true });
          return;
        }

        renderSearchLoadingState();
        const requestId = ++searchRequestId;
        searchDelayTimer = window.setTimeout(() => {
          void (async () => {
            try {
              const payload = await fetchJson(usersSearchApiUrl + "?q=" + encodeURIComponent(currentSearchQuery.trim()));

              if (requestId !== searchRequestId) {
                return;
              }

              currentSearchResults = payload.users || [];
              renderSearchResults(currentSearchResults);
            } catch (error) {
              if (requestId !== searchRequestId) {
                return;
              }

              currentSearchResults = [];
              dialogList.classList.remove("search-loading");
              dialogList.classList.add("search-empty");
              dialogList.innerHTML = '<div class="search-empty-state"><p class="search-empty-title">Search unavailable</p><p class="search-empty-copy">Failed to load users.</p></div>';
              showToast(error instanceof Error ? error.message : "Search is currently unavailable.", "error");
            }
          })();
        }, 240);
      });

      sidebarMenuButton?.addEventListener("click", () => {
        toggleSidebarMenu();
      });

      sidebarMenuProfile?.addEventListener("click", () => {
        setSidebarMenuOpen(false);
        showToast("Profile section will be available soon.", "info");
      });

      sidebarMenuSaved?.addEventListener("click", () => {
        const savedDialog = allDialogs.find((dialog) => dialog.type === "saved");
        setSidebarMenuOpen(false);
        const targetPublicId = savedDialog?.publicId || "-1002003143";
        void loadDialog(targetPublicId, { scrollBehavior: "auto" });
      });

      sidebarMenuLogout?.addEventListener("click", () => {
        if (!logoutButton || logoutButton.disabled) {
          return;
        }
        setSidebarMenuOpen(false);
        logoutButton.click();
      });

      syncSidebarWidth();

      sidebarResizeHandle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        startSidebarResize(event.clientX);
      });

      sidebarResizeHandle.addEventListener("dblclick", () => {
        applySidebarWidth(360);
      });

      window.addEventListener("pointermove", (event) => {
        updateSidebarResize(event.clientX);
      });

      window.addEventListener("pointerup", () => {
        stopSidebarResize();
      });

      window.addEventListener("pointercancel", () => {
        stopSidebarResize();
      });

      window.addEventListener("resize", () => {
        syncSidebarWidth();
      });

      composerInput.addEventListener("input", () => {
        syncComposerState();

        if (!currentDialogId || !realtimeEnabled) {
          return;
        }

        if (!composerInput.value.trim()) {
          sendTypingState(false);
          return;
        }

        sendTypingState(true);
        scheduleTypingStop();
      });

      ["select", "keyup", "mouseup", "focus", "blur"].forEach((eventName) => {
        composerInput.addEventListener(eventName, () => {
          renderComposerOverlay();
        });
      });

      const sendCurrentMessage = async () => {
        if (textMessageSendInFlight) {
          return;
        }

        const body = composerInput.value.trim();

        if (!body || !currentDialogPublicId) {
          return;
        }

        textMessageSendInFlight = true;
        composerSend.disabled = true;
        const localMessageId = "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 60000);
        localOutgoingMessages.push({
          id: localMessageId,
          dialogPublicId: currentDialogPublicId,
          senderId: currentUserId,
          senderName: currentUserDisplayName || currentUserUsername || workspaceUserName.textContent || "You",
          body,
          type: "text",
          mediaUrl: null,
          attachmentMime: null,
          replyToMessageId: pendingReplyMessage?.id || null,
          replyToSenderId: pendingReplyMessage?.senderId || null,
          replyToSenderName: pendingReplyMessage?.senderName || null,
          replyToBody: pendingReplyMessage?.body || null,
          replyToType: pendingReplyMessage?.type || null,
          replyToMediaUrl: pendingReplyMessage?.mediaUrl || null,
          createdAt: new Date().toISOString(),
          localStatus: "pending",
          animateOnRender: true
        });
        composerInput.value = "";
        syncComposerState();
        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
          typingStopTimer = null;
        }
        sendTypingState(false);
        const appendedLocal = appendLocalOutgoingMessageToCurrentDialog(localOutgoingMessages[localOutgoingMessages.length - 1], {
          scrollBehavior: "smooth",
          forceScrollBottom: true
        });
        if (!appendedLocal) {
          rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
        }

        try {
          const payload = isSecureDialog(currentDialogSnapshot)
            ? await (async () => {
                const encrypted = await encryptSecureMessageBody(currentDialogSnapshot, body);
                return fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    ciphertext: encrypted.ciphertext,
                    nonce: encrypted.nonce,
                    senderKeyId: encrypted.senderKeyId || undefined,
                    replyToMessageId: pendingReplyMessage?.id || undefined
                  }),
                  signal: controller.signal
                });
              })()
            : await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  body,
                  replyToMessageId: pendingReplyMessage?.id || undefined
                }),
                signal: controller.signal
              });
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.message ? [payload.message] : []);
          const preparedMessage = preparedPayload.messages[0] || payload.message;

          removeLocalOutgoingMessage(localMessageId);
          updateDialogInState(preparedPayload.dialog, {
            lastMessagePreview: getMessagePreviewText(preparedMessage) || body,
            lastMessageSenderName: preparedMessage.senderId === currentUserId
              ? "You"
              : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
            lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
          });
          clearPendingReplyMessage();
          playSound("send");

          if (preparedPayload.dialog?.id === currentDialogId && preparedMessage) {
            appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
              scrollBehavior: "smooth",
              animateList: false,
              forceScrollBottom: true,
              animateMessage: false,
              replaceMessageId: localMessageId
            });
          } else {
            rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
          }

          if (!currentSearchQuery.trim()) {
            renderDialogs(allDialogs);
          }
        } catch (error) {
          localOutgoingMessages = localOutgoingMessages.map((message) => (
            message.id === localMessageId
              ? { ...message, localStatus: "failed" }
              : message
          ));
          setStatus(error instanceof Error ? error.message : "Failed to send message.", "error");
          showToast(error instanceof Error ? error.message : "Failed to send message.", "error");
          updateRenderedMessageStatus(localMessageId, "failed");
        } finally {
          window.clearTimeout(timeoutId);
          composerSend.disabled = false;
          textMessageSendInFlight = false;
        }
      };

      composerSend.addEventListener("click", () => {
        void sendCurrentMessage();
      });

      composerEmojiButton.addEventListener("mouseenter", () => {
        openEmojiPicker();
      });

      composerEmojiButton.addEventListener("mouseleave", () => {
        scheduleEmojiPickerClose();
      });

      composerEmojiButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (emojiPicker.classList.contains("open")) {
          closeEmojiPicker();
        } else {
          openEmojiPicker();
        }
      });

      const renderAttachmentEmojiPicker = () => {
        const recentSection = {
          ...emojiSections[0],
          emojis: readRecentEmojis()
        };
        const sections = [recentSection].concat(emojiSections.slice(1));

        attachmentModalEmojiPickerHead.innerHTML = sections.map((section, index) => (
          '<button class="emoji-picker-tab' + (index === 0 ? ' active' : '') + '" type="button" data-emoji-tab="' + section.key + '" aria-label="' + escapeHtml(section.title) + '">' +
            (emojiTabIcons[section.key] || "") +
          '</button>'
        )).join("");

        attachmentModalEmojiPickerBody.innerHTML = sections.map((section) => (
          '<section class="emoji-picker-section" data-emoji-section="' + section.key + '">' +
            '<p class="emoji-picker-title">' + escapeHtml(section.title) + '</p>' +
            (
              section.emojis.length
                ? '<div class="emoji-picker-grid">' + section.emojis.map((emoji) => (
                  (() => {
                    const emojiAssetUrl = getEmojiAssetUrl(emoji);
                    return (
                  '<button class="emoji-button" type="button" data-emoji-value="' + escapeHtml(emoji) + '" aria-label="' + escapeHtml(emoji) + '">' +
                    (
                      emojiAssetUrl
                        ? '<img class="emoji-button-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="" aria-hidden="true" loading="lazy" decoding="async">'
                        : '<span class="emoji-button-image" aria-hidden="true">' + escapeHtml(emoji) + '</span>'
                    ) +
                  '</button>'
                    );
                  })()
                )).join("") + '</div>'
                : '<div class="emoji-picker-title">Nothing here yet</div>'
            ) +
          '</section>'
        )).join("");

        attachmentModalEmojiPickerHead.querySelectorAll("[data-emoji-tab]").forEach((button) => {
          button.addEventListener("click", () => {
            const key = button.getAttribute("data-emoji-tab");
            if (!key) {
              return;
            }
            attachmentModalEmojiPickerHead.querySelectorAll("[data-emoji-tab]").forEach((node) => node.classList.toggle("active", node === button));
            attachmentModalEmojiPickerBody.querySelector('[data-emoji-section="' + key + '"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });

        attachmentModalEmojiPickerBody.querySelectorAll("[data-emoji-value]").forEach((button) => {
          button.addEventListener("click", () => {
            const emoji = button.getAttribute("data-emoji-value");
            if (!emoji) {
              return;
            }

            const selectionStart = attachmentModalCaption.selectionStart ?? attachmentModalCaption.value.length;
            const selectionEnd = attachmentModalCaption.selectionEnd ?? attachmentModalCaption.value.length;
            attachmentModalCaption.value = attachmentModalCaption.value.slice(0, selectionStart) + emoji + attachmentModalCaption.value.slice(selectionEnd);
            pendingImageCaption = attachmentModalCaption.value;
            attachmentModalCaption.focus();
            attachmentModalCaption.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
            rememberRecentEmoji(emoji);
            renderAttachmentEmojiPicker();
          });
        });
      };

      const closeAttachmentEmojiPicker = () => {
        attachmentModalEmojiPicker.classList.remove("open");
        attachmentModalEmojiPicker.setAttribute("aria-hidden", "true");
      };

      const openAttachmentEmojiPicker = () => {
        renderAttachmentEmojiPicker();
        attachmentModalEmojiPicker.classList.add("open");
        attachmentModalEmojiPicker.setAttribute("aria-hidden", "false");
      };

      attachmentModalEmojiButton?.addEventListener("click", (event) => {
        event.preventDefault();
        if (attachmentModalEmojiPicker.classList.contains("open")) {
          closeAttachmentEmojiPicker();
        } else {
          openAttachmentEmojiPicker();
        }
      });

      emojiPicker.addEventListener("mouseenter", () => {
        openEmojiPicker();
      });

      emojiPicker.addEventListener("mouseleave", () => {
        scheduleEmojiPickerClose();
      });

      document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }
        if (!target.closest("#emoji-picker") && !target.closest("#composer-emoji-button")) {
          closeEmojiPicker();
        }
        if (!target.closest("#attachment-modal-emoji-picker") && !target.closest("#attachment-modal-emoji-button")) {
          closeAttachmentEmojiPicker();
        }
        if (!target.closest("#attach-menu") && !target.closest("#composer-attach-button")) {
          closeAttachMenu();
        }
      });

      composerAttachButton.addEventListener("mouseenter", () => {
        openAttachMenu();
      });

      composerAttachButton.addEventListener("mouseleave", () => {
        scheduleAttachMenuClose();
      });

      attachMenu.addEventListener("mouseenter", () => {
        openAttachMenu();
      });

      attachMenu.addEventListener("mouseleave", () => {
        scheduleAttachMenuClose();
      });

      composerAttachButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (attachMenu.classList.contains("open")) {
          closeAttachMenu();
        } else {
          openAttachMenu();
        }
      });

      attachMenu.querySelectorAll(".attach-menu-item").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.classList.contains("disabled")) {
            return;
          }

          button.classList.add("pressed");
          window.setTimeout(() => {
            button.classList.remove("pressed");
          }, 120);

          if (button.dataset.attachAction === "media") {
            closeAttachMenu();
            if (pendingImageAttachments.length || pendingFileAttachments.length) {
              clearPendingImageAttachment();
            }
            composerFileInput.setAttribute("accept", "image/png,image/jpeg,image/webp,image/gif");
            composerFileInput.dataset.attachMode = "media";
            composerFileInput.multiple = true;
            composerFileInput.click();
            return;
          }

          if (button.dataset.attachAction === "file") {
            closeAttachMenu();
            if (pendingImageAttachments.length || pendingFileAttachments.length) {
              clearPendingImageAttachment();
            }
            composerFileInput.setAttribute("accept", "audio/*");
            composerFileInput.dataset.attachMode = "file";
            composerFileInput.multiple = true;
            composerFileInput.click();
          }
        });
      });

      composerFileInput.addEventListener("change", () => {
        const files = Array.from(composerFileInput.files || []);
        const attachMode = composerFileInput.dataset.attachMode || "media";
        composerFileInput.value = "";
        if (files.length && attachMode === "media") {
          void addPendingImageAttachments(files);
          return;
        }
        if (files.length && attachMode === "file") {
          void addPendingFileAttachments(files);
        }
      });

      composerAttachmentRemove.addEventListener("click", () => {
        clearPendingImageAttachment();
      });

      attachmentModalClose.addEventListener("click", () => {
        closeAttachmentModal();
      });

      attachmentModalPrev.addEventListener("click", () => {
        moveAttachmentModal(-1);
      });

      attachmentModalNext.addEventListener("click", () => {
        moveAttachmentModal(1);
      });

      attachmentModal.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;

        if (!target) {
          return;
        }

        if (
          !target.closest(".attachment-modal-content")
          && !target.closest(".attachment-modal-main")
          && !target.closest(".attachment-modal-footer")
          && !target.closest(".attachment-modal-header")
          && !target.closest(".attachment-modal-nav")
          && !target.closest(".attachment-modal-strip")
        ) {
          closeAttachmentModal();
        }
      });

      attachmentModalCaption.addEventListener("input", () => {
        pendingImageCaption = attachmentModalCaption.value;
      });

      attachmentModalCaption.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          attachmentModalSend.click();
        }
      });

      attachmentModalSend.addEventListener("click", () => {
        void (async () => {
          if (attachmentModalMode === "file") {
            if (!pendingFileAttachments.length) {
              return;
            }
            attachmentModalSend.disabled = true;
            attachmentModalCaption.disabled = true;
            const attachmentsToSend = pendingFileAttachments.slice();
            const previewUrlsToPreserve = attachmentsToSend.map((attachment) => attachment.previewUrl);
            const caption = attachmentModalCaption.value.trim();
            clearPendingImageAttachment({ preservePreviewUrls: previewUrlsToPreserve });
            try {
              await uploadAudioBatch({
                attachments: attachmentsToSend,
                caption
              });
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Failed to send audio.", "error");
              showToast(error instanceof Error ? error.message : "Failed to send audio.", "error");
            } finally {
              attachmentModalSend.disabled = false;
              attachmentModalCaption.disabled = false;
            }
            return;
          }
          if (!pendingImageAttachments.length) {
            return;
          }

          attachmentModalSend.disabled = true;
          attachmentModalCaption.disabled = true;

          const attachmentsToSend = pendingImageAttachments.slice();
          const previewUrlsToPreserve = attachmentsToSend.map((attachment) => attachment.previewUrl);
          const caption = attachmentModalCaption.value.trim();
          clearPendingImageAttachment({ preservePreviewUrls: previewUrlsToPreserve });

          try {
            await uploadImageBatch({
              attachments: attachmentsToSend,
              caption
            });
          } catch (error) {
            setStatus(error instanceof Error ? error.message : "Failed to send photos.", "error");
            showToast(error instanceof Error ? error.message : "Failed to send photos.", "error");
          } finally {
            attachmentModalSend.disabled = false;
            attachmentModalCaption.disabled = false;
          }
        })();
      });

      composerInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          void sendCurrentMessage();
        }
      });

      composerInput.addEventListener("paste", (event) => {
        const imageItems = Array.from(event.clipboardData?.items || []).filter((item) => item.type.startsWith("image/"));

        if (!imageItems.length) {
          return;
        }

        event.preventDefault();
        void addPendingImageAttachments(
          imageItems
            .map((item) => item.getAsFile())
            .filter(Boolean)
        );
      });

      ["dragenter", "dragover"].forEach((eventName) => {
        chatStage.addEventListener(eventName, (event) => {
          const hasImages = Array.from(event.dataTransfer?.items || []).some((item) => item.type.startsWith("image/"));

          if (!hasImages) {
            return;
          }

          event.preventDefault();
          chatStage.classList.add("drag-active");
        });
      });

      ["dragleave", "dragend", "drop"].forEach((eventName) => {
        chatStage.addEventListener(eventName, () => {
          chatStage.classList.remove("drag-active");
        });
      });

      chatStage.addEventListener("drop", (event) => {
        const files = Array.from(event.dataTransfer?.files || []).filter((file) => String(file.type || "").startsWith("image/"));

        if (!files.length) {
          return;
        }

        event.preventDefault();
        void addPendingImageAttachments(files);
      });

`;
