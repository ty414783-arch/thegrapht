export const groupCallState = () => `
      const groupCallStateByDialog = new Map();
      const postedGroupStartByDialog = new Map();
      let groupCallPresenceHeartbeatTimer = null;
      let groupCallPresencePruneTimer = null;
      let groupCallJoinStripHideTimer = null;
      const GROUP_CALL_PRESENCE_STALE_MS = 14000;
      const getGroupCallSummaryDuration = (seconds) => Math.max(0, Math.floor(Number(seconds) || 0));
      const buildGroupCallMarker = (kind, durationSeconds = 0) =>
        kind === "ended_video"
          ? "[[call:" + kind + ":" + getGroupCallSummaryDuration(durationSeconds) + "]]"
          : "[[call:" + kind + "]]";
      const isInGroupCallForDialog = (dialogId) => (
        Boolean(activeCall && activeCall.mode === "group" && activeCall.dialogId === dialogId)
      );
      const getGroupCallMembersCount = (state) => {
        if (!state) {
          return 0;
        }
        if (state.participantIds instanceof Set && state.participantIds.size > 0) {
          return state.participantIds.size;
        }
        return Math.max(0, Number(state.participantCount) || 0);
      };
      const pruneStaleGroupCallParticipants = () => {
        const nowTs = Date.now();
        let hasAnyState = false;
        for (const [dialogId, state] of groupCallStateByDialog.entries()) {
          if (!state || !(state.participantIds instanceof Set)) {
            continue;
          }
          hasAnyState = true;
          const seenAtMap = state.participantLastSeenAtMap instanceof Map
            ? state.participantLastSeenAtMap
            : new Map();
          state.participantLastSeenAtMap = seenAtMap;
          for (const participantUserId of Array.from(state.participantIds.values())) {
            const seenAt = Number(seenAtMap.get(participantUserId) || 0);
            if (!seenAt || (nowTs - seenAt) > GROUP_CALL_PRESENCE_STALE_MS) {
              state.participantIds.delete(participantUserId);
              seenAtMap.delete(participantUserId);
            }
          }
          state.participantCount = state.participantIds.size;
          groupCallStateByDialog.set(dialogId, state);
        }
        if (!hasAnyState && !activeCall) {
          if (groupCallPresencePruneTimer) {
            window.clearInterval(groupCallPresencePruneTimer);
            groupCallPresencePruneTimer = null;
          }
        }
      };
      const ensureGroupCallPresencePruneTimer = () => {
        if (groupCallPresencePruneTimer) {
          return;
        }
        groupCallPresencePruneTimer = window.setInterval(() => {
          pruneStaleGroupCallParticipants();
          syncGroupCallBanner();
        }, 3000);
      };
      const parseGroupCallMarkerBody = (rawBody) => {
        const body = String(rawBody || "").trim();
        if (!body.startsWith("[[call:") || !body.endsWith("]]")) {
          return null;
        }
        const inner = body.slice(7, -2);
        const parts = inner.split(":");
        const kind = String(parts[0] || "").trim();
        if (kind !== "started_video" && kind !== "ended_video") {
          return null;
        }
        const durationSeconds = parts.length > 1 ? Math.max(0, Number(parts[1] || 0) || 0) : 0;
        return {
          kind,
          durationSeconds
        };
      };
      const buildRecoveredGroupCallId = (dialogId) => "group_call_recovered_" + String(dialogId || "");
      const resolveGroupCallStartedAtMs = (call) => {
        if (!call || call.mode !== "group") {
          return Number(call?.connectedAt) || 0;
        }
        const state = call?.dialogId ? groupCallStateByDialog.get(call.dialogId) : null;
        const fromState = Number(state?.startedAtMs) || 0;
        const fromCall = Number(call.groupStartedAtMs) || 0;
        const fromConnectedAt = Number(call.connectedAt) || 0;
        return fromState || fromCall || fromConnectedAt || 0;
      };
      const getGroupCallElapsedSecondsForCall = (call) => {
        const startedAtMs = resolveGroupCallStartedAtMs(call);
        if (!startedAtMs) {
          return 0;
        }
        return Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
      };
      const syncGroupCallStateFromMessages = (dialog, messages) => {
        if (!dialog || dialog.type !== "group" || !Array.isArray(messages)) {
          return;
        }
        const dialogId = String(dialog.id || "");
        if (!dialogId) {
          return;
        }

        let latestStarted = null;
        let latestEnded = null;

        for (let index = 0; index < messages.length; index += 1) {
          const message = messages[index];
          const marker = parseGroupCallMarkerBody(message?.body);
          if (!marker) {
            continue;
          }
          const ts = new Date(message?.createdAt || 0).getTime();
          const sortTs = Number.isFinite(ts) ? ts : 0;
          if (marker.kind === "started_video") {
            latestStarted = {
              ts: sortTs,
              senderUserId: String(message?.senderId || ""),
              senderName: String(message?.senderName || "").trim()
            };
          } else if (marker.kind === "ended_video") {
            latestEnded = {
              ts: sortTs
            };
          }
        }

        const hasActiveStartedMarker = Boolean(
          latestStarted
          && (!latestEnded || latestStarted.ts > latestEnded.ts)
        );
        const hasLocalActiveGroupCall = Boolean(
          activeCall
          && activeCall.mode === "group"
          && activeCall.dialogId === dialogId
        );

        if (!hasActiveStartedMarker && !hasLocalActiveGroupCall) {
          groupCallStateByDialog.delete(dialogId);
          postedGroupStartByDialog.delete(dialogId);
          syncGroupCallBanner();
          return;
        }

        const prevState = groupCallStateByDialog.get(dialogId) || null;
        const starterUserId = latestStarted?.senderUserId || prevState?.starterUserId || activeCall?.startedByUserId || "";
        const participantIds = prevState?.participantIds instanceof Set
          ? new Set(prevState.participantIds)
          : new Set();
        const participantLastSeenAtMap = prevState?.participantLastSeenAtMap instanceof Map
          ? new Map(prevState.participantLastSeenAtMap)
          : new Map();
        if (hasLocalActiveGroupCall) {
          participantIds.add(currentUserId);
          participantLastSeenAtMap.set(currentUserId, Date.now());
        }
        groupCallStateByDialog.set(dialogId, {
          callId: activeCall?.callId || prevState?.callId || buildRecoveredGroupCallId(dialogId),
          dialogId,
          title: String(dialog.title || prevState?.title || "Group video chat"),
          status: hasLocalActiveGroupCall ? "active" : "active",
          starterUserId,
          startedAtMs: Number(latestStarted?.ts) || Number(prevState?.startedAtMs) || Number(resolveGroupCallStartedAtMs(activeCall)) || Date.now(),
          participantLastSeenAtMap,
          participantIds,
          participantCount: participantIds.size
        });
        ensureGroupCallPresencePruneTimer();
        pruneStaleGroupCallParticipants();
        syncGroupCallBanner();
      };
      const syncGroupCallJoinStrip = () => {
        if (!groupCallJoinStrip || !groupCallJoinTitle || !groupCallJoinMeta || !groupCallJoinButton) {
          return;
        }
        if (groupCallJoinStripHideTimer) {
          window.clearTimeout(groupCallJoinStripHideTimer);
          groupCallJoinStripHideTimer = null;
        }
        const dialogId = currentDialogSnapshot?.id || "";
        const knownDialog = dialogId ? allDialogs.find((dialog) => dialog.id === dialogId) : null;
        if (dialogId && !knownDialog) {
          groupCallStateByDialog.delete(dialogId);
          postedGroupStartByDialog.delete(dialogId);
        }
        const state = dialogId ? groupCallStateByDialog.get(dialogId) : null;
        const membersCount = getGroupCallMembersCount(state);
        const shouldShow = Boolean(
          state
          && currentDialogSnapshot?.type === "group"
          && knownDialog?.type === "group"
          && !isInGroupCallForDialog(dialogId)
        );
        if (!shouldShow) {
          const switchedToNonGroup = currentDialogSnapshot?.type !== "group" || knownDialog?.type !== "group";
          groupCallJoinStrip.classList.remove("visible");
          groupCallJoinStrip.setAttribute("aria-hidden", "true");
          chatWindow?.classList.remove("group-call-join-visible");
          if (switchedToNonGroup) {
            groupCallJoinStrip.hidden = true;
            return;
          }
          groupCallJoinStripHideTimer = window.setTimeout(() => {
            groupCallJoinStrip.hidden = true;
            groupCallJoinStripHideTimer = null;
          }, 220);
          return;
        }
        groupCallJoinStrip.hidden = false;
        groupCallJoinStrip.classList.add("visible");
        groupCallJoinStrip.setAttribute("aria-hidden", "false");
        groupCallJoinTitle.textContent = state.status === "active" ? "Live stream" : "Connecting stream";
        groupCallJoinMeta.textContent = membersCount + " member" + (membersCount === 1 ? "" : "s");
        chatWindow?.classList.add("group-call-join-visible");
      };
      const stopGroupCallPresenceHeartbeat = () => {
        if (groupCallPresenceHeartbeatTimer) {
          window.clearInterval(groupCallPresenceHeartbeatTimer);
          groupCallPresenceHeartbeatTimer = null;
        }
      };
      const sendGroupCallPresenceHeartbeat = () => {
        if (!activeCall || activeCall.mode !== "group") {
          return;
        }
        const state = groupCallStateByDialog.get(activeCall.dialogId);
        if (state) {
          if (!(state.participantIds instanceof Set)) {
            state.participantIds = new Set();
          }
          if (!(state.participantLastSeenAtMap instanceof Map)) {
            state.participantLastSeenAtMap = new Map();
          }
          state.participantIds.add(currentUserId);
          state.participantLastSeenAtMap.set(currentUserId, Date.now());
          state.participantCount = state.participantIds.size;
          groupCallStateByDialog.set(activeCall.dialogId, state);
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
          voiceLevel: activeCall.isMuted ? 0 : clampVoiceLevel(groupLocalVoiceLastLevel)
        });
      };
      const ensureGroupCallPresenceHeartbeat = () => {
        const shouldRun = Boolean(activeCall && activeCall.mode === "group");
        if (!shouldRun) {
          stopGroupCallPresenceHeartbeat();
          return;
        }
        ensureGroupCallPresencePruneTimer();
        if (groupCallPresenceHeartbeatTimer) {
          return;
        }
        groupCallPresenceHeartbeatTimer = window.setInterval(() => {
          sendGroupCallPresenceHeartbeat();
        }, 6000);
      };
      const syncGroupCallBanner = () => {
        if (!groupCallBanner || !groupCallBannerState || !groupCallBannerTitle) {
          syncGroupCallJoinStrip();
          return;
        }
        const chatWindow = document.getElementById("chat-window");
        const dialogId = currentDialogSnapshot?.id || "";
        const state = dialogId ? groupCallStateByDialog.get(dialogId) : null;
        const activeGroupCall = activeCall && activeCall.mode === "group" ? activeCall : null;
        const shouldShowBanner = Boolean(
          activeGroupCall
          || (state && isInGroupCallForDialog(dialogId))
        );
        if (!shouldShowBanner) {
          groupCallBanner.classList.remove("visible");
          groupCallBanner.setAttribute("aria-hidden", "true");
          groupCallBanner.hidden = true;
          chatWindow?.classList.remove("group-call-banner-visible");
          syncGroupCallJoinStrip();
          return;
        }
        const bannerCall = activeGroupCall || null;
        const bannerDialogId = bannerCall?.dialogId || dialogId;
        const bannerState = bannerDialogId ? groupCallStateByDialog.get(bannerDialogId) : state;
        groupCallBanner.hidden = false;
        groupCallBanner.classList.add("visible");
        groupCallBanner.setAttribute("aria-hidden", "false");
        chatWindow?.classList.add("group-call-banner-visible");
        const isBannerActive = Boolean(
          bannerCall?.status === "active"
          || bannerState?.status === "active"
        );
        groupCallBanner.dataset.callStatus = isBannerActive ? "active" : "connecting";
        groupCallBannerState.textContent = isBannerActive ? "Live" : "Connecting...";
        groupCallBannerTitle.textContent = bannerCall?.peerName || bannerState?.title || (currentDialogSnapshot?.title || "Group video chat");
        syncGroupCallJoinStrip();
      };

      const openGroupLeaveModal = () => {
        if (!groupCallLeaveModal) {
          return;
        }
        if (groupCallEndForAll) {
          groupCallEndForAll.checked = false;
          groupCallEndForAll.disabled = false;
        }
        groupCallLeaveModal.classList.add("visible");
        groupCallLeaveModal.setAttribute("aria-hidden", "false");
      };

      const closeGroupLeaveModal = () => {
        if (!groupCallLeaveModal) {
          return;
        }
        groupCallLeaveModal.classList.remove("visible");
        groupCallLeaveModal.setAttribute("aria-hidden", "true");
      };
      let callVoiceMeterRaf = 0;
      let callVoiceMeterContext = null;
      let callVoiceMeterAnalyser = null;
      let callVoiceMeterSource = null;
      let callVoiceMeterData = null;
      let groupLocalVoiceMeterTimer = null;
      let groupLocalVoiceMeterContext = null;
      let groupLocalVoiceMeterAnalyser = null;
      let groupLocalVoiceMeterSource = null;
      let groupLocalVoiceMeterData = null;
      let groupLocalVoiceLastSpeaking = false;
      let groupLocalVoiceLastPresenceSentAt = 0;
      let groupLocalVoiceLastLevel = 0;
      let groupLocalVoiceLastLevelSent = 0;
      let groupLocalVoiceLastUiLevel = 0;

`;
