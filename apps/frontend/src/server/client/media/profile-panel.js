export const profilePanel = () => `
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
        currentUserAvatarUrl = "";
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
        if (chatScrollDayHideTimer) {
          window.clearTimeout(chatScrollDayHideTimer);
          chatScrollDayHideTimer = null;
        }
        hideScrollDayIndicator();
        chatScrollDayLastLabel = "";
        isNearChatBottom = true;
        closeChatSearch();
        workspaceUserName.textContent = "Guest";
        persistLegacySessionToken("");
      };

      const handleUnauthorizedSession = (
        message = "Session ended. Please sign in again.",
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

        // Reset inputs and error states
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const verificationCodeInput = document.getElementById("verification-code");
        const submitButton = document.getElementById("submit-button");
        const statusNode = document.getElementById("status");
        const verificationStatus = document.getElementById("verification-status");

        if (nameInput) nameInput.value = "";
        if (emailInput) emailInput.value = "";
        if (passwordInput) passwordInput.value = "";
        if (verificationCodeInput) verificationCodeInput.value = "";
        if (submitButton) submitButton.disabled = false;
        if (statusNode) statusNode.textContent = "";
        if (verificationStatus) verificationStatus.textContent = "";

        [nameInput, emailInput, passwordInput, verificationCodeInput].forEach((input) => {
          if (input) {
            input.classList.remove("invalid");
            input.removeAttribute("aria-invalid");
            delete input.dataset.validationMessage;
          }
        });

        // Clear active timers or pending auth states if any
        if (typeof resendTimer !== "undefined" && resendTimer) {
          window.clearInterval(resendTimer);
          resendTimer = null;
        }
        if (typeof pendingAuthPayload !== "undefined") pendingAuthPayload = null;
        if (typeof pendingAuthMode !== "undefined") pendingAuthMode = null;
        if (typeof pendingAuthEmail !== "undefined") pendingAuthEmail = null;
        if (typeof resendAttemptsLeft !== "undefined") resendAttemptsLeft = 3;

        // Reset verification UI to standard login form
        const loginInner = document.getElementById("auth-login-inner");
        const verificationInner = document.getElementById("auth-verification-inner");
        const metaRow = document.querySelector(".meta-row");
        if (loginInner) {
          loginInner.classList.remove("hidden");
          loginInner.classList.remove("fade-out");
        }
        if (verificationInner) {
          verificationInner.classList.add("hidden");
          verificationInner.classList.remove("fade-out");
        }
        if (metaRow) {
          metaRow.classList.remove("hidden");
          metaRow.style.opacity = "1";
        }
        if (typeof animateModeChange === "function") {
          mode = "login";
          animateModeChange("login");
        }
      };

      const getDialogTypeLabel = (type) => dialogTypeLabels[type] || String(type || "chat");

      const getDialogSectionTitle = (type) => dialogTypeTitles[type] || getDialogTypeLabel(type);

      const getDialogTypeRank = (type) => {
        const rank = dialogTypeOrder.indexOf(type);
        return rank === -1 ? dialogTypeOrder.length : rank;
      };

      const getDialogAvatarMarkup = (dialog, options = {}) => {
        const showPresence = options.showPresence !== false;
        const showSecretBadge = options.showSecretBadge !== false;
        const isSecretDirect = Boolean(
          (dialog?.type === "secret" || dialog?.type === "direct" || dialog?.type === "private")
          && dialog?.encryptionMode === "e2e_v1"
        );
        const secretBadgeTitle = "Secret chat. End-to-end encrypted.";
        const secretBadgeMarkup = (showSecretBadge && isSecretDirect)
          ? '<span class="dialog-avatar-secret" title="' + escapeHtml(secretBadgeTitle) + '" aria-label="' + escapeHtml(secretBadgeTitle) + '"><span class="lucide">lock</span></span>'
          : "";

        if (dialog.type === "direct" || dialog.type === "group") {
          if (dialog.avatarUrl) {
            return '<div class="dialog-avatar ' + (dialog.type === "direct" ? "user-avatar" : "group-avatar") + '">' +
              '<img class="generated-avatar-photo" src="' + escapeHtml(String(dialog.avatarUrl)) + '" alt="' + escapeHtml((dialog.title || "?").slice(0, 1)) + '" />' +
              (showPresence && dialog.type === "direct"
                ? '<span class="dialog-avatar-presence' + (isDirectDialogOnline(dialog) ? ' online' : '') + '" aria-hidden="true"></span>'
                : "") +
              secretBadgeMarkup +
            '</div>';
          }
          const avatar = getAvatarMeta(
            dialog.type === "direct" ? (dialog.peerUserId || dialog.publicId) : dialog.id,
            dialog.title || dialog.subtitle || "?"
          );
          return '<div class="dialog-avatar ' + (dialog.type === "direct" ? "user-avatar" : "group-avatar") + '" style="' + avatar.style + '">' +
            '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />' +
            (showPresence && dialog.type === "direct"
              ? '<span class="dialog-avatar-presence' + (isDirectDialogOnline(dialog) ? ' online' : '') + '" aria-hidden="true"></span>'
              : "") +
            secretBadgeMarkup +
          '</div>';
        }

        const icon = dialogTypeIcons[dialog.type] || savedIcon;
        return '<div class="dialog-avatar">' + icon + '</div>';
      };

      const isDirectDialogOnline = (dialog) => {
        if (!(dialog?.type === "direct" && dialog.peerUserId)) {
          return false;
        }

        // If this direct dialog is currently open, trust dialog-level realtime
        // presence too (it updates faster than global user presence snapshots).
        if (currentDialogId && dialog.id === currentDialogId && peerActiveInCurrentDialog) {
          return true;
        }

        return onlineUserIds.has(dialog.peerUserId);
      };
      const GROUP_NOTIFICATION_PREFS_STORAGE_KEY = "thegrapht_group_notification_prefs";
      const getGroupNotificationPrefs = () => {
        try {
          const raw = localStorage.getItem(GROUP_NOTIFICATION_PREFS_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : {};
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
          return {};
        }
      };
      const isGroupNotificationsEnabled = (publicId) => {
        if (!publicId) {
          return false;
        }
        const prefs = getGroupNotificationPrefs();
        return Boolean(prefs[String(publicId)] === true);
      };
      const setGroupNotificationsEnabled = (publicId, enabled) => {
        if (!publicId) {
          return;
        }
        try {
          const prefs = getGroupNotificationPrefs();
          prefs[String(publicId)] = Boolean(enabled);
          localStorage.setItem(GROUP_NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(prefs));
        } catch {}
      };
      const syncGroupNotificationsToggle = () => {
        const toggle = document.getElementById("chat-profile-notifications-btn");
        if (!toggle) {
          return;
        }
        const isGroup = currentDialogSnapshot?.type === "group";
        const enabled = isGroup ? isGroupNotificationsEnabled(currentDialogSnapshot?.publicId) : false;
        toggle.classList.toggle("is-on", enabled);
        toggle.setAttribute("aria-checked", enabled ? "true" : "false");
      };
      const getGroupMembers = (dialog) => {
        if (!dialog || dialog.type !== "group" || !Array.isArray(dialog.groupMembers)) {
          return [];
        }
        return dialog.groupMembers
          .filter((member) => member && member.userId)
          .map((member) => ({
            userId: String(member.userId),
            name: String(member.name || member.username || "User"),
            username: member.username ? String(member.username) : "",
            role: String(member.role || "member"),
            lastSeenAt: member.lastSeenAt || null
          }));
      };
      const getGroupOnlineCount = (dialog) => {
        const members = getGroupMembers(dialog);
        const memberIds = new Set(members.map((member) => member.userId));
        let onlineCount = 0;
        for (const memberId of memberIds) {
          if (memberId === currentUserId || onlineUserIds.has(memberId)) {
            onlineCount += 1;
          }
        }
        return onlineCount;
      };

      const getTypingPreview = (dialog) => {
        const typingUsers = getTypingUsersForDialog(dialog?.id);

        if (!typingUsers.length) {
          return "";
        }

        return dialog?.type === "direct" ? "typing..." : "someone is typing...";
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
          if (dialog.encryptionMode === "e2e_v1") {
            return "Secret chat • End-to-end encrypted";
          }

          if (isDirectDialogOnline(dialog)) {
            return "online";
          }

          return "Cloud chat • " + formatLastSeen(dialog.peerLastSeenAt);
        }

        if (dialog.type === "group") {
          const participants = Number(dialog.participants) || 0;
          const parts = ["Group"];
          if (participants > 0) {
            parts.push(participants + (participants === 1 ? " member" : " members"));
          }
          const onlineCount = getGroupOnlineCount(dialog);
          if (onlineCount > 0) {
            parts.push(onlineCount + " online");
          }
          return parts.join(" • ");
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
        const peerUsername = String(dialog.peerUsername || "").trim();
        if (peerUsername) {
          return peerUsername.replace(/^@+/, "");
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

        if (dialog.type !== "direct" && dialog.type !== "saved" && dialog.type !== "group") {
          return null;
        }

        const username = dialog.type === "group" ? dialog.publicId : getDialogUsername(dialog);
        const isSaved = dialog.type === "saved";
        const isGroup = dialog.type === "group";
        const isSecretDialog = Boolean(
          (dialog?.type === "secret" || dialog?.type === "direct" || dialog?.type === "private")
          && dialog?.encryptionMode === "e2e_v1"
        );
        const name = isSaved
          ? (currentUserDisplayName || currentUserUsername || dialog.title || "You")
          : (dialog.title || "Profile");
        const status = isSaved
          ? "Your profile"
          : (
            isSecretDialog
              ? "Secret chat • End-to-end encrypted"
              : (
                dialog?.type === "direct"
                  ? (isDirectDialogOnline(dialog) ? "online" : formatLastSeen(dialog?.peerLastSeenAt))
                  : formatDialogSubtitle(dialog)
              )
          );
        const avatar = getAvatarMeta(
          isSaved ? (currentUserId || "saved-self") : (isGroup ? dialog.id : (dialog.peerUserId || dialog.publicId || dialog.id || name)),
          name
        );
        const usernameLabel = isGroup ? ("@" + username) : (username ? "@" + username : "username is not set yet");
        const encodeSecretRouteToken = (value) => {
          try {
            let token = window.btoa(unescape(encodeURIComponent(String(value || ""))));
            token = token.split("+").join("-").split("/").join("_");
            while (token.endsWith("=")) {
              token = token.slice(0, -1);
            }
            return token;
          } catch {
            return "";
          }
        };
        const originUrl = window.location.origin;
        const profileUrl = isGroup
          ? (originUrl + "/g/" + dialog.publicId)
          : (
            isSecretDialog
              ? (username
                ? (originUrl + "/@" + encodeURIComponent(username) + "/sc?s=" + encodeURIComponent(encodeSecretRouteToken(dialog.publicId || "")))
                : originUrl)
              : (username ? (originUrl + "/@" + encodeURIComponent(username)) : originUrl)
          );

        return {
          avatar,
          name,
          status,
          username,
          usernameLabel,
          profileUrl,
          isSecretDialog
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
        chatProfileStatus.textContent = details.status || "profile";
        
        const notificationsCard = document.getElementById("chat-profile-notifications-card");
        const secretCard = document.getElementById("chat-profile-secret-card");
        
        if (currentDialogSnapshot?.type === "group") {
          if (notificationsCard) notificationsCard.style.display = "flex";
        } else {
          if (notificationsCard) notificationsCard.style.display = "none";
        }
        if (secretCard) {
          secretCard.style.display = "none";
        }
        const linkLabel = document.getElementById("chat-profile-link-label");
        const linkCard = chatProfileLink?.closest(".chat-profile-card");
        if (linkLabel) {
          linkLabel.textContent = currentDialogSnapshot?.type === "group" ? "Group link" : "Profile link";
        }
        if (linkCard) {
          linkCard.style.display = details.isSecretDialog ? "none" : "block";
        }
        syncGroupNotificationsToggle();

        const membersSection = document.getElementById("chat-profile-members-section");
        const membersList = document.getElementById("chat-profile-members-list");
        
        if (currentDialogSnapshot?.type === "group") {
          if (membersSection) membersSection.style.display = "block";
          if (membersList) {
            const members = getGroupMembers(currentDialogSnapshot);
            membersList.innerHTML = members.map((member) => {
              const role = member.role === "owner" ? "owner" : (member.role === "admin" ? "admin" : "member");
              const memberUserId = String(member.userId || "").trim();
              const isSelfMember = memberUserId && memberUserId === String(currentUserId || "").trim();
              const statusText = isSelfMember || onlineUserIds.has(memberUserId)
                ? "online"
                : formatLastSeen(member.lastSeenAt);
              const displayName = String(member.name || member.username || "User");
              const avatar = getAvatarMeta(member.userId, displayName);
              return '<div class="group-member-row" data-member-user-id="' + escapeHtml(member.userId) + '">' +
                '<div class="dialog-avatar user-avatar group-member-avatar" style="' + avatar.style + '">' +
                  '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + escapeHtml(avatar.letter || "?") + '" />' +
                '</div>' +
                '<div class="group-member-main">' +
                  '<div class="group-member-name">' + escapeHtml(displayName) + '</div>' +
                  '<div class="group-member-status">' + escapeHtml(statusText) + '</div>' +
                '</div>' +
                '<div class="group-member-role">' + escapeHtml(role) + '</div>' +
              '</div>';
            }).join("");
          }
        } else {
          if (membersSection) membersSection.style.display = "none";
        }

        if (!details.isSecretDialog) {
          const visibleProfileUrl = details.profileUrl.startsWith("https://")
            ? details.profileUrl.slice(8)
            : (details.profileUrl.startsWith("http://") ? details.profileUrl.slice(7) : details.profileUrl);
          chatProfileLink.textContent = visibleProfileUrl;
          chatProfileLink.href = details.profileUrl;
        }
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
        if (typeof syncGroupCallBanner === "function") {
          syncGroupCallBanner();
        }

        if (chatSearchPanel.classList.contains("open")) {
          renderChatSearchResults();
        }
      };

      const closeGroupMemberContextMenu = () => {
        if (groupMemberContextMenuCloseTimer) {
          window.clearTimeout(groupMemberContextMenuCloseTimer);
          groupMemberContextMenuCloseTimer = null;
        }
        groupMemberContextMenu?.classList.remove("open");
        groupMemberContextMenu?.setAttribute("aria-hidden", "true");
        groupMemberContextMenuState = null;
      };

      const closeGroupMemberContextMenuSoon = () => {
        if (groupMemberContextMenuCloseTimer) {
          window.clearTimeout(groupMemberContextMenuCloseTimer);
        }
        groupMemberContextMenuCloseTimer = window.setTimeout(() => {
          closeGroupMemberContextMenu();
        }, 120);
      };

      const closeProfileLinkContextMenu = () => {
        if (profileLinkContextMenuCloseTimer) {
          window.clearTimeout(profileLinkContextMenuCloseTimer);
          profileLinkContextMenuCloseTimer = null;
        }
        profileLinkContextMenu?.classList.remove("open");
        profileLinkContextMenu?.setAttribute("aria-hidden", "true");
        profileLinkContextMenuState = null;
      };

      const closeProfileLinkContextMenuSoon = () => {
        if (profileLinkContextMenuCloseTimer) {
          window.clearTimeout(profileLinkContextMenuCloseTimer);
        }
        profileLinkContextMenuCloseTimer = window.setTimeout(() => {
          closeProfileLinkContextMenu();
        }, 120);
      };

      const openProfileLinkContextMenu = (event, profileUrl) => {
        if (!profileLinkContextMenu || !profileLinkContextMenuBody || !profileUrl) {
          return;
        }

        profileLinkContextMenuBody.innerHTML =
          '<button class="dialog-context-menu-item" type="button" data-action="copy-username-link">' +
            '<span class="lucide" aria-hidden="true">content_copy</span>' +
            '<span>Copy Username</span>' +
          '</button>';
        profileLinkContextMenuState = { profileUrl: String(profileUrl) };

        const menuWidth = 244;
        const menuHeight = 72;
        const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
        const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
        profileLinkContextMenu.style.left = left + "px";
        profileLinkContextMenu.style.top = top + "px";
        profileLinkContextMenu.classList.add("open");
        profileLinkContextMenu.setAttribute("aria-hidden", "false");

        profileLinkContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
          button.addEventListener("click", async () => {
            closeProfileLinkContextMenuSoon();
            const urlToCopy = String(profileLinkContextMenuState?.profileUrl || "").trim();
            if (!urlToCopy) {
              return;
            }
            try {
              if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(urlToCopy);
              } else {
                throw new Error("Clipboard API is not available");
              }
              showToast("Username link copied", "success");
            } catch {
              showToast("Failed to copy username link", "error");
            }
          });
        });
      };

      const openDirectDialogForUser = async (targetUserId, options = {}) => {
        const userId = String(targetUserId || "").trim();
        if (!userId) {
          return;
        }

        const openProfile = Boolean(options.openProfile);

        if (userId === currentUserId) {
          const savedDialog = allDialogs.find((dialog) => dialog.type === "saved");
          if (savedDialog?.publicId) {
            await loadDialog(savedDialog.publicId);
            if (openProfile) {
              openChatProfilePanel();
            }
          }
          return;
        }

        const existingDirectDialog = allDialogs.find((dialog) => (
          ["direct", "private"].includes(dialog?.type)
          && String(dialog?.peerUserId || "").trim() === userId
        ));
        if (existingDirectDialog?.publicId) {
          await loadDialog(existingDirectDialog.publicId, { forceReload: false });
          if (openProfile) {
            openChatProfilePanel();
          }
          return;
        }

        try {
          const payload = await createPreferredDirectDialog(userId);
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.messages || []);
          if (!preparedPayload.dialog?.publicId) {
            return;
          }

          setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
          const upsertedDialog = updateDialogInState(preparedPayload.dialog, {
            lastMessagePreview: preparedPayload.dialog.lastMessagePreview || null,
            lastMessageSenderName: preparedPayload.dialog.lastMessageSenderName || null,
            lastMessageCreatedAt: preparedPayload.dialog.lastMessageCreatedAt || new Date().toISOString()
          });
          if (!upsertedDialog) {
            allDialogs.unshift(preparedPayload.dialog);
          }
          if (!currentSearchQuery.trim()) {
            renderDialogs(allDialogs);
          }

          await loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
          if (openProfile) {
            openChatProfilePanel();
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to open direct chat.", "error");
        }
      };


      const openGroupMemberContextMenu = (event, memberUserId) => {
        if (!groupMemberContextMenu || !groupMemberContextMenuBody) {
          return;
        }

        const userId = String(memberUserId || "").trim();
        if (!userId) {
          return;
        }

        groupMemberContextMenuBody.innerHTML =
          '<button class="dialog-context-menu-item" type="button" data-action="send-message">' +
            '<span class="lucide" aria-hidden="true">chat</span>' +
            '<span>Send Message</span>' +
          '</button>';
        groupMemberContextMenuState = { userId };

        const menuWidth = 244;
        const menuHeight = 72;
        const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
        const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
        groupMemberContextMenu.style.left = left + "px";
        groupMemberContextMenu.style.top = top + "px";
        groupMemberContextMenu.classList.add("open");
        groupMemberContextMenu.setAttribute("aria-hidden", "false");

        groupMemberContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
          button.addEventListener("click", () => {
            closeGroupMemberContextMenuSoon();
            void openDirectDialogForUser(userId, { openProfile: true });
          });
        });
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
        if (realtimeDialogResyncTimer) {
          window.clearInterval(realtimeDialogResyncTimer);
          realtimeDialogResyncTimer = null;
        }

        onlineUserIds.clear();
        clearTypingIndicators();

        if (realtimeSocket && realtimeSocket.readyState !== WebSocket.CLOSED) {
          realtimeSocket.close();
        }

`;
