export const uiControls = () => `
      chatSearchToggle.addEventListener("click", () => {
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

      groupMemberContextMenu?.addEventListener("mouseenter", () => {
        if (groupMemberContextMenuCloseTimer) {
          window.clearTimeout(groupMemberContextMenuCloseTimer);
          groupMemberContextMenuCloseTimer = null;
        }
      });

      groupMemberContextMenu?.addEventListener("mouseleave", () => {
        closeGroupMemberContextMenuSoon();
      });
      profileLinkContextMenu?.addEventListener("mouseenter", () => {
        if (profileLinkContextMenuCloseTimer) {
          window.clearTimeout(profileLinkContextMenuCloseTimer);
          profileLinkContextMenuCloseTimer = null;
        }
      });
      profileLinkContextMenu?.addEventListener("mouseleave", () => {
        closeProfileLinkContextMenuSoon();
      });

      document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }
        if (event.button === 2) {
          return;
        }
        if (!target.closest("#group-member-context-menu")) {
          closeGroupMemberContextMenu();
        }
        if (!target.closest("#profile-link-context-menu")) {
          closeProfileLinkContextMenu();
        }
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && groupMemberContextMenu?.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeGroupMemberContextMenu();
          return;
        }
        if (event.key === "Escape" && profileLinkContextMenu?.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeProfileLinkContextMenu();
        }
      });

      const chatProfileMembersList = document.getElementById("chat-profile-members-list");
      chatProfileMembersList?.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target.closest(".group-member-row[data-member-user-id]") : null;
        if (!target) {
          return;
        }
        const memberUserId = String(target.getAttribute("data-member-user-id") || "").trim();
        if (!memberUserId) {
          return;
        }
        closeGroupMemberContextMenu();
        void openDirectDialogForUser(memberUserId, { openProfile: true });
      });

      chatProfileMembersList?.addEventListener("contextmenu", (event) => {
        const target = event.target instanceof Element ? event.target.closest(".group-member-row[data-member-user-id]") : null;
        if (!target) {
          return;
        }
        const memberUserId = String(target.getAttribute("data-member-user-id") || "").trim();
        if (!memberUserId) {
          return;
        }

        const isSameTargetOpen = Boolean(
          groupMemberContextMenu?.classList.contains("open")
          && groupMemberContextMenuState?.userId
          && String(groupMemberContextMenuState.userId) === memberUserId
        );

        event.preventDefault();
        if (isSameTargetOpen) {
          closeGroupMemberContextMenu();
          return;
        }
        openGroupMemberContextMenu(event, memberUserId);
      });
      const onProfileIdentityContextMenu = (event) => {
        if (!currentDialogSnapshot) {
          return;
        }
        const details = getChatProfileDetails(currentDialogSnapshot);
        if (!details || !details.username || currentDialogSnapshot.type === "group") {
          return;
        }
        const isSameTargetOpen = Boolean(
          profileLinkContextMenu?.classList.contains("open")
          && profileLinkContextMenuState?.profileUrl
          && String(profileLinkContextMenuState.profileUrl) === String(details.profileUrl)
        );

        event.preventDefault();
        if (isSameTargetOpen) {
          closeProfileLinkContextMenu();
          return;
        }
        openProfileLinkContextMenu(event, details.profileUrl);
      };
      chatProfileName?.addEventListener("contextmenu", onProfileIdentityContextMenu);
      chatProfileLink?.addEventListener("contextmenu", onProfileIdentityContextMenu);

      const sidebarProfileUsernameEl = document.getElementById("sidebar-profile-username");
      const sidebarProfileUsernameRow = sidebarProfileUsernameEl?.closest(".sidebar-profile-info-row");

      sidebarProfileUsernameRow?.addEventListener("contextmenu", (event) => {
        const rawUsername = String(currentUserUsername || "").trim();
        if (!rawUsername) {
          return;
        }
        const profileUrl = window.location.origin + "/@" + encodeURIComponent(rawUsername);

        const isSameTargetOpen = Boolean(
          profileLinkContextMenu?.classList.contains("open")
          && profileLinkContextMenuState?.profileUrl
          && String(profileLinkContextMenuState.profileUrl) === String(profileUrl)
        );

        event.preventDefault();
        if (isSameTargetOpen) {
          closeProfileLinkContextMenu();
          return;
        }
        openProfileLinkContextMenu(event, profileUrl);
      });

      sidebarProfileUsernameRow?.addEventListener("click", async (event) => {
        if (event.button === 2) {
          return;
        }
        const rawUsername = String(currentUserUsername || "").trim();
        if (!rawUsername) {
          return;
        }
        const profileUrl = window.location.origin + "/@" + encodeURIComponent(rawUsername);
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(profileUrl);
          } else {
            throw new Error("Clipboard API is not available");
          }
          showToast("Username link copied", "success");
        } catch {
          showToast("Failed to copy username link", "error");
        }
      });

      document.getElementById("chat-profile-notifications-btn")?.addEventListener("click", () => {
        if (currentDialogSnapshot?.type !== "group" || !currentDialogSnapshot?.publicId) {
          return;
        }
        const nextEnabled = !isGroupNotificationsEnabled(currentDialogSnapshot.publicId);
        setGroupNotificationsEnabled(currentDialogSnapshot.publicId, nextEnabled);
        syncGroupNotificationsToggle();
        showToast(nextEnabled ? "Notifications enabled" : "Notifications muted", "info");
      });
      document.getElementById("chat-profile-delete-btn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this group?")) {
          showToast("Group deleted", "success");
          closeChatProfilePanel();
          if (currentDialogSnapshot) {
            allDialogs = allDialogs.filter((d) => d.id !== currentDialogSnapshot.id);
            renderDialogs(allDialogs);
            closeDialog();
          }
        }
      });

      chatSearchClose.addEventListener("click", () => {
        closeChatSearch();
      });

      chatSearchBackdrop?.addEventListener("click", () => {
        closeChatSearch();
      });

      chatSearchInput.addEventListener("input", () => {
        chatSearchQuery = chatSearchInput.value || "";
        renderChatSearchResults();
      });

      chatSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeChatSearch();
        }
      });

      chatCallButton.addEventListener("click", () => {
        void beginOutgoingCall();
      });
      chatGroupVideoButton?.addEventListener("click", () => {
        void beginGroupVideoCall();
      });

      chatCallChip.addEventListener("click", () => {
        restoreCallModal();
      });

      callCloseButton.addEventListener("click", () => {
        void endOrRejectCall();
      });

      callExpandButton?.addEventListener("click", () => {
        if (!(callModal instanceof HTMLElement)) {
          return;
        }
        const nextExpanded = !callModal.classList.contains("expanded");
        callModal.classList.toggle("expanded", nextExpanded);
        const iconNode = callExpandButton.querySelector(".lucide");
        if (iconNode) {
          iconNode.textContent = nextExpanded ? "close_fullscreen" : "open_in_full";
        }
      });

      callMiniOpen.addEventListener("click", () => {
        restoreCallModal();
      });

      callMiniClose.addEventListener("click", () => {
        dismissMiniCallCard();
      });

      callMiniEnd.addEventListener("click", () => {
        void endOrRejectCall();
      });
      groupCallBanner?.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const endIconPressed = Boolean(target?.closest(".lucide"));
        if (endIconPressed && activeCall?.mode === "group") {
          event.preventDefault();
          event.stopPropagation();
          void endOrRejectCall();
          return;
        }
        if (activeCall?.mode === "group") {
          restoreCallModal();
          return;
        }
        void beginGroupVideoCall();
      });
      groupCallJoinStrip?.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (target && target.closest("button") && !target.closest("#group-call-join-button")) {
          return;
        }
        void beginGroupVideoCall();
      });
      groupCallJoinButton?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        void beginGroupVideoCall();
      });
      groupCallLeaveCancel?.addEventListener("click", () => {
        closeGroupLeaveModal();
      });
      groupCallLeaveConfirm?.addEventListener("click", () => {
        void confirmLeaveGroupCall({
          endForEveryone: Boolean(groupCallEndForAll?.checked)
        });
      });

      callMiniDragHandle?.addEventListener("pointerdown", (event) => {
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

      callAcceptButton.addEventListener("click", () => {
        void acceptIncomingCall();
      });

      callEndButton.addEventListener("click", () => {
        void endOrRejectCall();
      });

      callMuteButton.addEventListener("click", () => {
        if (!activeCall?.localStream) {
          return;
        }

        activeCall.isMuted = !activeCall.isMuted;
        activeCall.localStream.getAudioTracks().forEach((track) => {
          track.enabled = !activeCall.isMuted;
        });
        if (activeCall.mode === "group") {
          if (typeof upsertGroupParticipant === "function") {
            upsertGroupParticipant(
              activeCall,
              currentUserId,
              currentUserDisplayName || workspaceUserName.textContent || "You",
              Boolean(activeCall.isMuted),
              !activeCall.isMuted
            );
          }
          const groupState = typeof groupCallStateByDialog !== "undefined"
            ? groupCallStateByDialog.get(activeCall.dialogId)
            : null;
          if (groupState) {
            if (!(groupState.participantIds instanceof Set)) {
              groupState.participantIds = new Set();
            }
            groupState.participantIds.add(currentUserId);
            if (groupState.participantLastSeenAtMap instanceof Map) {
              groupState.participantLastSeenAtMap.set(currentUserId, Date.now());
            }
            groupState.participantCount = groupState.participantIds.size;
            groupCallStateByDialog.set(activeCall.dialogId, groupState);
          }
          sendCallRealtime({
            type: "call_presence",
            mode: "group",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            participantUserId: currentUserId,
            participantName: currentUserDisplayName || workspaceUserName.textContent || "You",
            isMuted: Boolean(activeCall.isMuted),
            isSpeaking: !activeCall.isMuted,
            voiceLevel: activeCall.isMuted ? 0 : (typeof clampVoiceLevel === "function" ? clampVoiceLevel(groupLocalVoiceLastLevel) : 0)
          });
        } else {
          sendCallRealtime({
            type: "call_mute_state",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            isMuted: Boolean(activeCall.isMuted)
          });
        }
        syncCallUi();
      });

      callVideoButton?.addEventListener("click", () => {
        void toggleDirectCallCamera();
      });

      callScreenButton?.addEventListener("click", () => {
        void toggleDirectCallScreenShare();
      });

      const mainStageVideoNode = document.getElementById("remote-screen-video");
      mainStageVideoNode?.addEventListener("click", () => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        const overlayNode = callModal?.querySelector?.(".call-screen-overlay");
        const isOverlayOpen = Boolean(overlayNode instanceof HTMLElement && overlayNode.classList.contains("open"));
        if (isOverlayOpen) {
          if (typeof closeExpandedScreenPreview === "function") {
            closeExpandedScreenPreview();
          }
          return;
        }
        if (typeof openExpandedScreenPreview === "function") {
          openExpandedScreenPreview();
        }
      });
      callModal?.addEventListener("click", (event) => {
        const targetNode = event.target instanceof Element ? event.target : null;
        if (!targetNode) {
          return;
        }
        if (targetNode.closest("[data-overlay-dismiss='true']")) {
          if (typeof closeExpandedScreenPreview === "function") {
            closeExpandedScreenPreview();
          }
        }
      });
      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          const overlayNode = callModal?.querySelector?.(".call-screen-overlay");
          const isOverlayOpen = Boolean(overlayNode instanceof HTMLElement && overlayNode.classList.contains("open"));
          const isCallExpanded = Boolean(callModal instanceof HTMLElement && callModal.classList.contains("expanded"));
          if (isOverlayOpen || isCallExpanded) {
            event.preventDefault();
            event.stopPropagation();
          }
          if (typeof closeExpandedScreenPreview === "function") {
            closeExpandedScreenPreview();
          }
          if (isCallExpanded && callModal instanceof HTMLElement) {
            callModal.classList.remove("expanded");
            if (callExpandButton instanceof HTMLElement) {
              const iconNode = callExpandButton.querySelector(".lucide");
              if (iconNode) {
                iconNode.textContent = "open_in_full";
              }
            }
          }
        }
      });

      callDevicesButton.addEventListener("click", () => {
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

      callModal.addEventListener("pointerdown", (event) => {
        if (!callDevicesPanel.classList.contains("open")) {
          return;
        }
        const targetNode = event.target instanceof Node ? event.target : null;
        if (!targetNode) {
          return;
        }
        if (callDevicesPanel.contains(targetNode) || callDevicesButton.contains(targetNode)) {
          return;
        }
        closeCallDevicesPanel();
      });

      const hideCallEmojiTooltip = () => {
        if (!(callEmojiTooltip instanceof HTMLElement)) {
          return;
        }
        callEmojiTooltip.classList.remove("visible");
        callEmojiTooltip.setAttribute("aria-hidden", "true");
      };

      const positionCallEmojiTooltip = (clientX, clientY) => {
        if (!(callEmojiTooltip instanceof HTMLElement) || !(callOverlay instanceof HTMLElement)) {
          return;
        }
        const offsetX = 14;
        const offsetY = 18;
        const overlayRect = callOverlay.getBoundingClientRect();
        const tooltipWidth = callEmojiTooltip.offsetWidth || 160;
        const tooltipHeight = callEmojiTooltip.offsetHeight || 36;
        const localX = clientX - overlayRect.left;
        const localY = clientY - overlayRect.top;
        const maxLeft = Math.max(8, overlayRect.width - tooltipWidth - 8);
        const maxTop = Math.max(8, overlayRect.height - tooltipHeight - 8);
        const nextLeft = Math.min(maxLeft, Math.max(8, localX + offsetX));
        const nextTop = Math.min(maxTop, Math.max(8, localY + offsetY));
        callEmojiTooltip.style.left = nextLeft + "px";
        callEmojiTooltip.style.top = nextTop + "px";
      };

      callOverlay?.addEventListener("pointermove", (event) => {
        const target = event.target instanceof Element ? event.target.closest(".call-fingerprint-emoji[data-emoji-hint]") : null;
        if (!(target instanceof HTMLElement) || !(callEmojiTooltip instanceof HTMLElement)) {
          hideCallEmojiTooltip();
          return;
        }
        const hint = String(target.getAttribute("data-emoji-hint") || "").trim();
        if (!hint) {
          hideCallEmojiTooltip();
          return;
        }
        callEmojiTooltip.textContent = hint;
        callEmojiTooltip.setAttribute("aria-hidden", "false");
        callEmojiTooltip.classList.add("visible");
        positionCallEmojiTooltip(event.clientX, event.clientY);
      });

      callOverlay?.addEventListener("pointerleave", () => {
        hideCallEmojiTooltip();
      });

      callInputDevice.addEventListener("change", () => {
        void replaceLocalAudioTrack(callInputDevice.value);
      });

      callOutputDevice.addEventListener("change", () => {
        void applyCallOutputDevice(callOutputDevice.value);
      });


`;
