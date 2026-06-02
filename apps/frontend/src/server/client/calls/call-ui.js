export const callUi = () => `
      const getDialogByIdLocal = (dialogId) => allDialogs.find((dialog) => dialog.id === dialogId) || null;

      const closeCallDevicesPanel = () => {
        callDevicesPanel.classList.remove("open");
        callDevicesPanel.setAttribute("aria-hidden", "true");
      };

      const openCallDevicesPanel = () => {
        callDevicesPanel.classList.add("open");
        callDevicesPanel.setAttribute("aria-hidden", "false");
      };

      const syncActiveCallChip = () => {
        const shouldShow = Boolean(
          activeCall
          && activeCall.mode !== "group"
          && (activeCall.status === "outgoing" || activeCall.status === "incoming" || activeCall.status === "connecting" || activeCall.status === "reconnecting" || activeCall.status === "active")
          && currentDialogSnapshot
          && currentDialogSnapshot.id !== activeCall.dialogId
        );

        chatCallChip.classList.toggle("visible", shouldShow);
        chatCallChip.setAttribute("aria-hidden", shouldShow ? "false" : "true");

        if (!shouldShow) {
          return;
        }

        chatCallChipTitle.textContent = activeCall.peerName ? "Call with " + activeCall.peerName : "Call";
        chatCallChipTime.textContent = activeCall.status === "active"
          ? formatCallDuration(getCallElapsedSeconds())
          : (activeCall.status === "incoming" ? "incoming" : (activeCall.status === "reconnecting" ? "reconnecting" : "connecting..."));
      };

      const syncCallUi = () => {
        const hasCall = Boolean(activeCall);

        if (!hasCall) {
          const focusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          if (focusedElement && callOverlay.contains(focusedElement)) {
            focusedElement.blur();
          }
        }

        callOverlay.setAttribute("aria-hidden", hasCall ? "false" : "true");

        if (!hasCall) {
          callModal.classList.remove("open", "minimized");
          callModal.classList.remove("expanded", "has-direct-visuals", "has-dual-visuals", "has-screen-share");
          callModal.dataset.directVisualLayout = "none";
          callMiniCard.classList.remove("visible");
          callMiniCard.classList.remove("dragging");
          setCallVoiceLevel(0);
          callMiniCard.style.left = "";
          callMiniCard.style.top = "";
          callMiniCard.style.right = "";
          callMiniCard.style.bottom = "";
          closeCallDevicesPanel();
          syncCallVideoStage();
          if (callExpandButton) {
            const iconNode = callExpandButton.querySelector(".lucide");
            if (iconNode) {
              iconNode.textContent = "open_in_full";
            }
          }
          syncActiveCallChip();
          syncGroupCallBanner();
          return;
        }
        startCallTicker();

        const avatar = getAvatarMeta(activeCall.peerId || activeCall.peerName, activeCall.peerName || "?");
        const isIncoming = activeCall.status === "incoming";
        const isGroupCall = activeCall.mode === "group";
        const isIncomingDirection = activeCall.direction === "incoming";
        const shouldShowAcceptAction = isIncoming && isIncomingDirection;
        const isActive = activeCall.status === "active";
        const isRinging = activeCall.status === "incoming";
        const isReconnecting = activeCall.status === "reconnecting";
        const dots = buildAnimatedDots();
        const statusText = isIncoming
          ? "incoming call"
          : isActive
            ? formatCallDuration(getCallElapsedSeconds())
            : isReconnecting
              ? ("reconnecting" + dots)
            : activeCall.status === "outgoing"
              ? ("ringing" + dots)
              : ("connecting" + dots);
        const substatusText = isIncoming
          ? "From " + activeCall.peerName
          : isActive
            ? "call is active"
            : isReconnecting
              ? "Network is unstable, restoring call"
              : "Setting up call";
        const debugSuffix = (!isIncoming && !isActive && activeCall.lastError)
          ? " • " + getCallErrorForUi(activeCall.lastError)
          : "";

        callModal.dataset.callState = activeCall.status || "idle";
        callModal.dataset.callDirection = activeCall.direction || "outgoing";
        callModal.dataset.callMode = isGroupCall ? "group" : "direct";
        callMiniCard.dataset.callState = activeCall.status || "idle";
        callMiniCard.dataset.callDirection = activeCall.direction || "outgoing";
        callModal.classList.toggle("ringing", isRinging);
        callMiniCard.classList.toggle("ringing", isRinging);

        callPeerAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        callPeerAvatar.style.cssText = avatar.style;
        callModal.style.setProperty("--call-bg-start", avatar.start || "#bb8b4b");
        callModal.style.setProperty("--call-bg-end", avatar.end || "#b37f3f");
        callMiniCard.style.setProperty("--call-bg-start", avatar.start || "#bb8b4b");
        callMiniCard.style.setProperty("--call-bg-end", avatar.end || "#b37f3f");
        const callFingerprintNode = document.getElementById("call-fingerprint-emojis");
        if (callFingerprintNode) {
          callFingerprintNode.innerHTML = buildCallFingerprintEmojiMarkup(activeCall);
        }
        callPeerName.textContent = activeCall.peerName || "TheGraphT";
        callPeerStatus.textContent = isGroupCall
          ? (isActive ? "Live now" : "Connecting...")
          : (activeCall.status === "outgoing" ? ("Ringing" + dots) : statusText);
        const localParticipantState = activeCall.groupParticipants instanceof Map
          ? activeCall.groupParticipants.get(currentUserId)
          : null;
        const localParticipantSpeaking = !activeCall.isMuted;
        const groupSubstatusText = isActive
          ? (activeCall.isMuted ? "listening" : (localParticipantSpeaking ? "speaking" : "listening"))
          : "connecting...";
        callPeerSubstatus.textContent = isGroupCall ? (groupSubstatusText + debugSuffix) : "";
        if (callModalKicker) {
          callModalKicker.hidden = false;
          callModalKicker.textContent = isActive
            ? formatCallDuration(getCallElapsedSeconds())
            : (isIncoming ? "Incoming call" : (isReconnecting ? "Reconnecting" : (activeCall.status === "outgoing" ? "Ringing" : "Connecting")));
        }
        if (callGroupKicker) {
          callGroupKicker.hidden = !isGroupCall;
        }
        if (callGroupPanel) {
          callGroupPanel.hidden = !isGroupCall;
        }
        const groupParticipantsList = activeCall.groupParticipants instanceof Map
          ? Array.from(activeCall.groupParticipants.values())
          : [];
        if (callGroupList) {
          const rows = groupParticipantsList.map((participant) => {
            const isSpeaking = !participant?.isMuted;
            const voiceLevel = clampVoiceLevel(participant?.voiceLevel);
            const isTalkingNow = isSpeaking && voiceLevel > 0.035;
            const rowState = participant?.isMuted ? "listening" : "speaking";
            const avatar = getAvatarMeta(participant?.userId || participant?.name || "User", participant?.name || "User");
            return '<div class="call-group-row' + (isSpeaking ? " speaking" : "") + '">' +
              '<div class="call-group-row-left">' +
                '<div class="call-group-row-avatar-shell' + (isTalkingNow ? " talking" : "") + '" style="--voice-level:' + voiceLevel.toFixed(3) + ';">' +
                  '<div class="call-group-row-avatar' + (isSpeaking ? " speaking" : "") + '" style="' + avatar.style + '">' +
                    '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + escapeHtml(avatar.letter || "?") + '" />' +
                  '</div>' +
                '</div>' +
                '<div class="call-group-row-meta">' +
                  '<div class="call-group-row-name">' + escapeHtml(participant?.name || "User") + '</div>' +
                  '<div class="call-group-row-state">' + escapeHtml(rowState) + '</div>' +
                '</div>' +
              '</div>' +
              '<span class="lucide call-group-row-mic' + (participant?.isMuted ? " muted" : " active") + '" aria-hidden="true">' + (participant?.isMuted ? "mic_off" : "mic") + '</span>' +
            '</div>';
          });
          callGroupList.innerHTML = rows.join("");
        }
        callMiniAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        callMiniAvatar.style.cssText = avatar.style;
        callMiniName.textContent = activeCall.peerName || "TheGraphT";
        callMiniSubtitle.textContent = statusText;
        callMuteButton.classList.toggle("muted", Boolean(activeCall.isMuted));
        const muteIconNode = callMuteButton.querySelector(".lucide");
        if (muteIconNode) {
          muteIconNode.textContent = activeCall.isMuted ? "mic_off" : "mic";
        }
        if (callVideoButton) {
          callVideoButton.classList.toggle("active", Boolean(activeCall.cameraEnabled));
          callVideoButton.classList.toggle("muted", !Boolean(activeCall.cameraEnabled));
          const videoIconNode = callVideoButton.querySelector(".lucide");
          if (videoIconNode) {
            videoIconNode.textContent = activeCall.cameraEnabled ? "videocam" : "videocam_off";
          }
        }
        if (callScreenButton) {
          callScreenButton.classList.toggle("active", Boolean(activeCall.screenEnabled));
          callScreenButton.classList.toggle("muted", Boolean(activeCall.screenEnabled));
          const remoteOwnsScreen = Boolean(
            activeCall.remoteScreenSharing
            && activeCall.screenOwnerUserId
            && activeCall.screenOwnerUserId !== currentUserId
          );
          callScreenButton.disabled = remoteOwnsScreen && !activeCall.screenEnabled;
          callScreenButton.setAttribute(
            "title",
            remoteOwnsScreen && !activeCall.screenEnabled
              ? "The other user is already sharing screen"
              : "Screen"
          );
          const screenIconNode = callScreenButton.querySelector(".lucide");
          if (screenIconNode) {
            screenIconNode.textContent = activeCall.screenEnabled ? "stop_screen_share" : "screen_share";
          }
        }
        callMuteLabel.textContent = "Mute";
        if (isGroupCall) {
          callModal.classList.toggle("group-speaking", !activeCall.isMuted);
          callModal.classList.toggle("group-listening", Boolean(activeCall.isMuted));
          const hasAnySpeaker = groupParticipantsList.some((participant) => Boolean(participant?.isSpeaking) && !participant?.isMuted);
          setCallVoiceLevel(hasAnySpeaker ? 0.88 : (activeCall.isMuted ? 0.08 : 0.36));
        }
        if (callAcceptWrap.parentElement) {
          callAcceptWrap.parentElement.dataset.callLayout = shouldShowAcceptAction ? "incoming" : "outgoing";
        }
        callAcceptWrap.hidden = !shouldShowAcceptAction;
        callAcceptWrap.style.display = shouldShowAcceptAction ? "" : "none";
        const videoActionWrap = callVideoButton?.closest(".call-action");
        const screenActionWrap = callScreenButton?.closest(".call-action");
        const muteActionWrap = callMuteButton?.closest(".call-action");
        const shouldShowMediaActions = !shouldShowAcceptAction;
        if (videoActionWrap) {
          videoActionWrap.hidden = !shouldShowMediaActions;
        }
        if (screenActionWrap) {
          screenActionWrap.hidden = !shouldShowMediaActions;
        }
        if (muteActionWrap) {
          muteActionWrap.hidden = !shouldShowMediaActions;
        }
        callEndButton.setAttribute("aria-label", shouldShowAcceptAction ? "Decline call" : "End call");
        callEndLabel.textContent = shouldShowAcceptAction ? "Decline" : "End";
        syncCallVideoStage();
        callModal.classList.toggle("open", !activeCall.minimized);
        callMiniCard.classList.toggle("visible", Boolean(activeCall.minimized && !activeCall.miniHidden));
        if (activeCall.miniPosition && Number.isFinite(activeCall.miniPosition.left) && Number.isFinite(activeCall.miniPosition.top)) {
          callMiniCard.style.left = activeCall.miniPosition.left + "px";
          callMiniCard.style.top = activeCall.miniPosition.top + "px";
          callMiniCard.style.right = "auto";
          callMiniCard.style.bottom = "auto";
        } else {
          callMiniCard.style.left = "";
          callMiniCard.style.top = "";
          callMiniCard.style.right = "";
          callMiniCard.style.bottom = "";
        }
        syncActiveCallChip();
        syncGroupCallBanner();
        ensureGroupCallPresenceHeartbeat();
      };

      const startCallTicker = () => {
        if (callTickTimer) {
          return;
        }

        callTickTimer = window.setInterval(() => {
          logCallVideoDebugSnapshot("ticker");
          syncCallUi();
        }, 420);
      };

      const stopAndReleaseCallMedia = async () => {
        if (!activeCall) {
          return;
        }
        if (activeCall.mode !== "group") {
          await stopDirectVisualStream(activeCall, { notify: false });
          activeCall.remoteVideoStream = null;
          activeCall.remoteVideoFrameReady = false;
          activeCall.remoteScreenSharing = false;
          activeCall.screenOwnerUserId = "";
        }
        stopCallVoiceMeter();
        stopGroupLocalVoiceMeter();

        if (activeCall.mode === "group") {
          try {
            if (activeCall.groupPeerConnections instanceof Map) {
              activeCall.groupPeerConnections.forEach((entry) => {
                try {
                  entry?.peerConnection?.close();
                } catch {}
              });
            }
            if (activeCall.groupRemoteAudioNodes instanceof Map) {
              activeCall.groupRemoteAudioNodes.forEach((audioNode) => {
                try {
                  audioNode.pause();
                  audioNode.srcObject = null;
                  audioNode.remove();
                } catch {}
              });
            }
          } catch {}
        }

        try {
          activeCall.peerConnection?.getSenders().forEach((sender) => {
            try { sender.track?.stop(); } catch {}
          });
        } catch {}

        try {
          activeCall.peerConnection?.close();
        } catch {}

        try {
          activeCall.localStream?.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
        } catch {}
        if (activeCall.visualRenegotiateRetryTimer) {
          try { window.clearTimeout(activeCall.visualRenegotiateRetryTimer); } catch {}
          activeCall.visualRenegotiateRetryTimer = null;
        }
        if (activeCall.screenResyncTimer) {
          try { window.clearTimeout(activeCall.screenResyncTimer); } catch {}
          activeCall.screenResyncTimer = null;
        }
        if (activeCall.remoteVideoMuteGraceTimer) {
          try { window.clearTimeout(activeCall.remoteVideoMuteGraceTimer); } catch {}
          activeCall.remoteVideoMuteGraceTimer = null;
        }
        activeCall.pendingVisualRenegotiationReason = "";

        if (remoteAudioNode) {
          try {
            remoteAudioNode.pause();
            remoteAudioNode.srcObject = null;
          } catch {}
        }
      };


      const getParticipantInitialsForCall = (name) => {
        const parts = String(name || "Guest").trim().split(/\s+/).filter(Boolean).slice(0, 2);
        return (parts.map((part) => part.charAt(0)).join("") || "G").toUpperCase();
      };

      const resolveDialogAvatarUrlForDirectCall = (call) => {
        if (!call || call.mode === "group") {
          return "";
        }
        if (call.peerAvatarUrl) {
          return String(call.peerAvatarUrl);
        }
        const peerId = String(call.peerId || "").trim();
        const dialogPublicId = String(call.dialogPublicId || "").trim();
        const matchingDialog = Array.isArray(allDialogs)
          ? allDialogs.find((dialog) => {
              if (!dialog || dialog.type !== "direct") {
                return false;
              }
              if (dialogPublicId && String(dialog.publicId || "") === dialogPublicId) {
                return true;
              }
              if (peerId && String(dialog.peerUserId || "") === peerId) {
                return true;
              }
              return false;
            })
          : null;
        const avatarUrl = matchingDialog?.avatarUrl ? String(matchingDialog.avatarUrl) : "";
        if (avatarUrl && call) {
          call.peerAvatarUrl = avatarUrl;
        }
        return avatarUrl;
      };
      const resolveDirectPeerAvatarByUserId = (userId) => {
        const normalizedUserId = String(userId || "").trim();
        if (!normalizedUserId || !Array.isArray(allDialogs)) {
          return "";
        }
        const matchingDialog = allDialogs.find((dialog) => (
          dialog
          && dialog.type === "direct"
          && String(dialog.peerUserId || "") === normalizedUserId
          && dialog.avatarUrl
        ));
        return matchingDialog?.avatarUrl ? String(matchingDialog.avatarUrl) : "";
      };

      const buildCallParticipantCardHtml = ({ id, name, muted, imageSrc = "", avatarStyle = "" }) => (
        '<div class="participant-card call-participant-card" data-participant-id="' + escapeHtml(String(id || "")) + '">' +
          '<div class="participant-avatar call-participant-avatar" style="' + escapeHtml(String(avatarStyle || "")) + '">' +
            (imageSrc
              ? ('<img class="generated-avatar-photo" src="' + escapeHtml(imageSrc) + '" alt="' + escapeHtml(getParticipantInitialsForCall(name)) + '" />')
              : escapeHtml(getParticipantInitialsForCall(name))) +
          '</div>' +
          '<div class="participant-name call-participant-meta">' +
            '<span class="call-participant-name">' + escapeHtml(name || "Guest") + '</span>' +
            '<span class="lucide participant-mic call-participant-mic' + (muted ? " muted" : "") + '" aria-hidden="true">' + (muted ? "mic_off" : "mic") + '</span>' +
          '</div>' +
        '</div>'
      );

      const getOrCreateDirectLocalPreview = () => {
        const streamHost = document.getElementById("call-main-stream");
        if (!(streamHost instanceof HTMLElement)) {
          return null;
        }
        let preview = document.getElementById("local-video-preview");
        if (preview instanceof HTMLVideoElement) {
          return preview;
        }
        preview = document.createElement("video");
        preview.id = "local-video-preview";
        preview.autoplay = true;
        preview.muted = true;
        preview.playsInline = true;
        preview.setAttribute("aria-label", "Local camera preview");
        streamHost.appendChild(preview);
        return preview;
      };

      const hideDirectLocalPreview = () => {
        const preview = document.getElementById("local-video-preview");
        if (!(preview instanceof HTMLVideoElement)) {
          return;
        }
        preview.pause();
        preview.srcObject = null;
        preview.classList.remove("active");
        preview.style.display = "none";
      };

      const shouldUseDirectScreenShareLayout = (call) => {
        if (!call || call.mode === "group") {
          return false;
        }
        return Boolean(call.screenEnabled || call.remoteScreenSharing || call.remoteVisualKind === "screen");
      };

      const syncCallParticipantsGrid = () => {
        const grid = document.getElementById("call-participants-grid");
        if (!(grid instanceof HTMLElement)) {
          return;
        }
        if (!activeCall) {
          grid.innerHTML = "";
          callModal?.classList.remove("screen-share-active", "has-screen-share", "has-direct-visuals", "has-dual-visuals");
          return;
        }

        if (activeCall.mode !== "group") {
          const shouldShowDirectTiles = shouldUseDirectScreenShareLayout(activeCall);
          grid.innerHTML = "";
          callModal?.classList.toggle("screen-share-active", shouldShowDirectTiles);
          if (!shouldShowDirectTiles) {
            return;
          }
          const localAvatar = getAvatarMeta(currentUserId || "local", currentUserDisplayName || workspaceUserName.textContent || "You");
          const peerAvatarUrl = resolveDialogAvatarUrlForDirectCall(activeCall);
          const peerAvatar = peerAvatarUrl
            ? { avatarUrl: peerAvatarUrl, style: "", letter: getParticipantInitialsForCall(activeCall.peerName || "Guest") }
            : getAvatarMeta(activeCall.peerId || activeCall.peerName, activeCall.peerName || "Guest");
          grid.innerHTML = [
            buildCallParticipantCardHtml({
              id: currentUserId || "local",
              name: currentUserDisplayName || workspaceUserName.textContent || "You",
              muted: Boolean(activeCall.isMuted),
              imageSrc: localAvatar.avatarUrl,
              avatarStyle: localAvatar.style
            }),
            buildCallParticipantCardHtml({
              id: activeCall.peerId || "remote",
              name: activeCall.peerName || "Guest",
              muted: Boolean(activeCall.remoteMuted),
              imageSrc: peerAvatar.avatarUrl,
              avatarStyle: peerAvatar.style
            })
          ].join("");
          return;
        }

        if (activeCall.mode === "group" && activeCall.groupParticipants instanceof Map) {
          const rows = Array.from(activeCall.groupParticipants.values()).map((participant) => buildCallParticipantCardHtml({
            id: participant?.userId || participant?.name,
            name: participant?.name || "Guest",
            muted: Boolean(participant?.isMuted)
          }));
          grid.innerHTML = rows.join("");
          return;
        }
      };

      const syncCallVideoStage = () => {
        syncCallParticipantsGrid();

        const remoteScreenVideo = document.getElementById("remote-screen-video");
        const mainPlaceholder = document.getElementById("call-main-placeholder");
        const localVideoPreview = getOrCreateDirectLocalPreview();
        const directCallLayoutHost = callModal instanceof HTMLElement ? callModal : null;
        const remoteVideoTrack = activeCall?.remoteVideoStream instanceof MediaStream
          ? activeCall.remoteVideoStream.getVideoTracks()[0] || null
          : null;
        const hasPendingRemoteVideo = Boolean(
          activeCall?.remoteVideoStream
          && remoteVideoTrack
          && remoteVideoTrack.readyState === "live"
          && !remoteVideoTrack.muted
        );
        const remoteElementHasFrames = Boolean(
          remoteScreenVideo instanceof HTMLVideoElement
          && remoteScreenVideo.readyState >= 2
          && remoteScreenVideo.videoWidth > 0
          && remoteScreenVideo.videoHeight > 0
        );
        const hasRemoteVideo = Boolean(
          hasPendingRemoteVideo
          && (activeCall?.remoteVideoFrameReady || remoteElementHasFrames)
        );
        const hasLocalCameraPreview = Boolean(
          activeCall
          && activeCall.mode !== "group"
          && activeCall.cameraEnabled
          && activeCall.localVisualStream instanceof MediaStream
        );
        const hasLocalScreenPreview = Boolean(
          activeCall
          && activeCall.mode !== "group"
          && activeCall.screenEnabled
          && activeCall.localVisualStream instanceof MediaStream
        );
        const shouldForcePlaceholder = Boolean(
          activeCall
          && activeCall.mode !== "group"
          && !activeCall.screenEnabled
          && !activeCall.remoteScreenSharing
          && activeCall.remoteVisualKind === "none"
        );
        if (
          activeCall
          && activeCall.mode !== "group"
          && activeCall.screenResyncTimer
          && (hasRemoteVideo || !activeCall.remoteScreenSharing)
        ) {
          window.clearTimeout(activeCall.screenResyncTimer);
          activeCall.screenResyncTimer = null;
        }

        if (!(remoteScreenVideo instanceof HTMLVideoElement)) {
          logCallVideoDebug("sync_stage_no_remote_element", {
            hasRemoteVideo,
            hasPendingRemoteVideo,
            remoteVideoTrack: getDebugTrackState(remoteVideoTrack)
          });
          return;
        }

        if (shouldForcePlaceholder) {
          closeExpandedScreenPreview();
          remoteScreenVideo.pause();
          remoteScreenVideo.onloadedmetadata = null;
          remoteScreenVideo.onplaying = null;
          remoteScreenVideo.onresize = null;
          remoteScreenVideo.srcObject = null;
          remoteScreenVideo.classList.remove("active");
          if (mainPlaceholder instanceof HTMLElement) {
            mainPlaceholder.hidden = false;
            mainPlaceholder.style.display = "flex";
          }
          if (!hasLocalCameraPreview) {
            hideDirectLocalPreview();
          }
          if (directCallLayoutHost) {
            directCallLayoutHost.classList.remove("has-direct-visuals", "has-dual-visuals", "has-screen-share", "screen-share-active");
            directCallLayoutHost.dataset.directVisualLayout = "none";
          }
          logCallVideoDebug("sync_stage_forced_placeholder", {
            screenEnabled: Boolean(activeCall?.screenEnabled),
            remoteScreenSharing: Boolean(activeCall?.remoteScreenSharing),
            remoteVisualKind: activeCall?.remoteVisualKind || ""
          });
          return;
        }

        const markRemoteVideoFrameReady = (source) => {
          if (!activeCall || remoteScreenVideo.srcObject !== activeCall.remoteVideoStream) {
            return;
          }
          if (remoteScreenVideo.readyState < 2 || remoteScreenVideo.videoWidth <= 0 || remoteScreenVideo.videoHeight <= 0) {
            logCallVideoDebug("remote_video_frame_not_ready", {
              source,
              readyState: remoteScreenVideo.readyState,
              videoWidth: remoteScreenVideo.videoWidth,
              videoHeight: remoteScreenVideo.videoHeight
            });
            return;
          }
          activeCall.remoteVideoFrameReady = true;
          logCallVideoDebug("remote_video_frame_ready", {
            source,
            readyState: remoteScreenVideo.readyState,
            videoWidth: remoteScreenVideo.videoWidth,
            videoHeight: remoteScreenVideo.videoHeight
          });
          syncCallVideoStage();
        };

        logCallVideoDebugSnapshot("syncCallVideoStage", { force: Boolean(hasRemoteVideo) });
        logCallVideoDebug("sync_stage_decision", {
          hasRemoteVideo,
          hasPendingRemoteVideo,
          remoteVideoFrameReady: Boolean(activeCall?.remoteVideoFrameReady),
          remoteElementHasFrames,
          hasLocalCameraPreview,
          remoteVideoTrack: getDebugTrackState(remoteVideoTrack),
          screenShareLayout: shouldUseDirectScreenShareLayout(activeCall)
        });

        if (activeCall && hasPendingRemoteVideo && !hasRemoteVideo) {
          if (remoteScreenVideo.srcObject !== activeCall.remoteVideoStream) {
            remoteScreenVideo.srcObject = activeCall.remoteVideoStream;
          }
          remoteScreenVideo.onloadedmetadata = () => markRemoteVideoFrameReady("loadedmetadata");
          remoteScreenVideo.onplaying = () => markRemoteVideoFrameReady("playing");
          remoteScreenVideo.onresize = () => markRemoteVideoFrameReady("resize");
          try {
            const playPromise = remoteScreenVideo.play();
            if (playPromise?.catch) {
              playPromise.catch((error) => {
                logCallVideoDebug("remote_video_play_rejected", {
                  message: error instanceof Error ? error.message : String(error)
                });
              });
            }
          } catch (error) {
            logCallVideoDebug("remote_video_play_failed", {
              message: error instanceof Error ? error.message : String(error)
            });
          }
          const canKeepLastRemoteFrame = Boolean(
            remoteScreenVideo.srcObject === activeCall.remoteVideoStream
            && remoteVideoTrack
            && remoteVideoTrack.readyState === "live"
            && (remoteElementHasFrames || Boolean(activeCall?.remoteVideoFrameReady))
          );
          if (canKeepLastRemoteFrame) {
            remoteScreenVideo.classList.add("active");
            if (mainPlaceholder instanceof HTMLElement) {
              mainPlaceholder.hidden = true;
              mainPlaceholder.style.display = "none";
            }
          } else {
            remoteScreenVideo.classList.remove("active");
            if (mainPlaceholder instanceof HTMLElement) {
              mainPlaceholder.hidden = false;
              mainPlaceholder.style.display = "flex";
            }
          }
          if (!hasLocalCameraPreview) {
            hideDirectLocalPreview();
          }
          if (directCallLayoutHost) {
            directCallLayoutHost.classList.remove("has-direct-visuals", "has-dual-visuals", "has-screen-share");
            directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCall));
            directCallLayoutHost.dataset.directVisualLayout = "none";
          }
          logCallVideoDebug("sync_stage_waiting_for_frames", {
            remoteVideoTrack: getDebugTrackState(remoteVideoTrack),
            readyState: remoteScreenVideo.readyState,
            videoWidth: remoteScreenVideo.videoWidth,
            videoHeight: remoteScreenVideo.videoHeight
          });
        } else if (!activeCall || (!hasRemoteVideo && !hasLocalScreenPreview)) {
          closeExpandedScreenPreview();
          remoteScreenVideo.pause();
          remoteScreenVideo.onloadedmetadata = null;
          remoteScreenVideo.onplaying = null;
          remoteScreenVideo.onresize = null;
          remoteScreenVideo.srcObject = null;
          remoteScreenVideo.classList.remove("active");
          if (mainPlaceholder instanceof HTMLElement) {
            mainPlaceholder.hidden = false;
            mainPlaceholder.style.display = "flex";
          }
          if (!hasLocalCameraPreview) {
            hideDirectLocalPreview();
          }
          if (directCallLayoutHost) {
            directCallLayoutHost.classList.remove("has-direct-visuals", "has-dual-visuals", "has-screen-share");
            directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCall));
            directCallLayoutHost.dataset.directVisualLayout = "none";
          }
          logCallVideoDebug("sync_stage_placeholder_visible", {
            hasRemoteVideo,
            screenShareLayout: shouldUseDirectScreenShareLayout(activeCall)
          });
        } else {
          const isLocalScreenOwner = Boolean(
            activeCall
            && activeCall.mode !== "group"
            && activeCall.screenEnabled
            && activeCall.screenOwnerUserId
            && activeCall.screenOwnerUserId === currentUserId
          );
          const streamForMainStage = isLocalScreenOwner
            ? activeCall.localVisualStream
            : (hasRemoteVideo ? activeCall.remoteVideoStream : activeCall.localVisualStream);
          if (remoteScreenVideo.srcObject !== streamForMainStage) {
            remoteScreenVideo.srcObject = streamForMainStage;
          }
          remoteScreenVideo.onloadedmetadata = () => markRemoteVideoFrameReady("loadedmetadata");
          remoteScreenVideo.onplaying = () => markRemoteVideoFrameReady("playing");
          remoteScreenVideo.onresize = () => markRemoteVideoFrameReady("resize");
          remoteScreenVideo.classList.add("active");
          try {
            const playPromise = remoteScreenVideo.play();
            if (playPromise?.catch) {
              playPromise.catch(() => {});
            }
          } catch {}
          if (mainPlaceholder instanceof HTMLElement) {
            mainPlaceholder.hidden = true;
            mainPlaceholder.style.display = "none";
          }
          if (directCallLayoutHost) {
            directCallLayoutHost.classList.add("has-direct-visuals");
            directCallLayoutHost.classList.toggle("has-screen-share", shouldUseDirectScreenShareLayout(activeCall));
            directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCall));
            directCallLayoutHost.classList.remove("has-dual-visuals");
            directCallLayoutHost.dataset.directVisualLayout = "single";
          }
          logCallVideoDebug("sync_stage_remote_visible", {
            remoteVideoTrack: getDebugTrackState(remoteVideoTrack),
            usingLocalScreenPreview: Boolean(!hasRemoteVideo && hasLocalScreenPreview),
            screenShareLayout: shouldUseDirectScreenShareLayout(activeCall)
          });
        }

        if (localVideoPreview instanceof HTMLVideoElement && hasLocalCameraPreview) {
          localVideoPreview.srcObject = activeCall.localVisualStream;
          localVideoPreview.classList.add("active");
          localVideoPreview.style.display = "block";
        } else {
          hideDirectLocalPreview();
        }
      };


      const restoreCallModal = () => {
        if (!activeCall) {
          return;
        }

        activeCall.minimized = false;
        activeCall.miniHidden = false;
        syncCallUi();
      };

      const minimizeCallModal = () => {
        if (!activeCall) {
          return;
        }

        activeCall.minimized = true;
        activeCall.miniHidden = false;
        closeCallDevicesPanel();
        syncCallUi();
      };

      const dismissMiniCallCard = () => {
        if (!activeCall) {
          return;
        }

        activeCall.miniHidden = true;
        syncCallUi();
      };


      const avatarPalettes = [
        ["#6cb5ff", "#4a8fe9"],
        ["#ff9f6c", "#ea6d4a"],
        ["#7de3b2", "#39b67f"],
        ["#f7a6d8", "#d66ab3"],
        ["#b49cff", "#7f69ee"],
        ["#ffd56a", "#f0a93e"],
        ["#7fd4ff", "#3d8fe0"]
      ];
      const hashSeed = (seed) => {
        const text = String(seed || "?");
        let hash = 0;
        for (let index = 0; index < text.length; index += 1) {
          hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
        }
        return Math.abs(hash);
      };
      const buildGeneratedAvatarUrl = (seedSource, labelSource) => {
        const seed = String(seedSource || labelSource || "?");
        const hash = hashSeed(seed);
        const palette = avatarPalettes[hash % avatarPalettes.length];
        const rawLabel = String(labelSource || seedSource || "?").trim();
        const words = rawLabel.split(/\s+/);
        let rawLetter = "";
        if (words.length >= 2) {
          rawLetter = (words[0][0] || "") + (words[1][0] || "");
        } else if (rawLabel.length >= 2) {
          rawLetter = rawLabel.slice(0, 2);
        } else {
          rawLetter = rawLabel[0] || "?";
        }
        const letter = escapeHtml(rawLetter.toLocaleUpperCase("ru-RU"));
        const svg = [
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">',
          '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">',
          '<stop offset="0%" stop-color="', palette[0], '"/>',
          '<stop offset="100%" stop-color="', palette[1], '"/>',
          '</linearGradient></defs>',
          '<circle cx="64" cy="64" r="64" fill="url(#g)"/>',
          '<circle cx="38" cy="30" r="18" fill="#ffffff" opacity="0.08"/>',
          '<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Roboto, Segoe UI, Trebuchet MS, sans-serif" font-size="58" font-weight="700">',
          letter,
          '</text></svg>'
        ].join("");
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      };

      const getAvatarMeta = (seedSource, labelSource) => {
        const seed = String(seedSource || labelSource || "?");
        const hash = hashSeed(seed);
        const palette = avatarPalettes[Math.abs(hash) % avatarPalettes.length];
        const rawLabel = String(labelSource || seedSource || "?").trim();
        const words = rawLabel.split(/\s+/);
        let rawLetter = "";
        if (words.length >= 2) {
          rawLetter = (words[0][0] || "") + (words[1][0] || "");
        } else if (rawLabel.length >= 2) {
          rawLetter = rawLabel.slice(0, 2);
        } else {
          rawLetter = rawLabel[0] || "?";
        }
        const letter = rawLetter.toLocaleUpperCase("ru-RU") || "?";
        const avatarUrl = buildGeneratedAvatarUrl(seedSource, labelSource);
        return {
          letter: escapeHtml(letter),
          start: palette[0],
          end: palette[1],
          avatarUrl,
          style: '--avatar-start:' + palette[0] + ';--avatar-end:' + palette[1] + ';'
        };
      };


`;
