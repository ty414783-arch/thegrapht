export const callDebug = ({ outgoingCallRingtoneUrl, incomingCallRingtoneUrl }) => `
      const CALL_DEBUG_PREFIX = "[TheGraphT Call]";
      const callDebugLogBuffer = Array.isArray(window.__THEGRAPHT_CALL_LOGS__)
        ? window.__THEGRAPHT_CALL_LOGS__
        : [];
      window.__THEGRAPHT_CALL_LOGS__ = callDebugLogBuffer;

      const pushCallLog = (level, event, details = {}) => {
        const entry = {
          ts: new Date().toISOString(),
          level,
          event,
          details
        };
        callDebugLogBuffer.push(entry);
        if (callDebugLogBuffer.length > 800) {
          callDebugLogBuffer.splice(0, callDebugLogBuffer.length - 800);
        }
      };

      const logCall = (event, details = {}) => {
        pushCallLog("info", event, details);
        try {
          console.info(CALL_DEBUG_PREFIX, event, details);
        } catch {}
      };

      const warnCall = (event, details = {}) => {
        pushCallLog("warn", event, details);
        try {
          console.warn(CALL_DEBUG_PREFIX, event, details);
        } catch {}
      };

      const errCall = (event, details = {}) => {
        pushCallLog("error", event, details);
        try {
          console.error(CALL_DEBUG_PREFIX, event, details);
        } catch {}
      };

      window.__dumpTheGraphTCallVideoLogs = () => {
        const logs = Array.isArray(window.__THEGRAPHT_CALL_LOGS__)
          ? window.__THEGRAPHT_CALL_LOGS__
          : [];
        return JSON.stringify(
          logs.filter((entry) => String(entry?.event || "").startsWith("video_debug_")),
          null,
          2
        );
      };

      window.__dumpTheGraphTCallVideoLogsAround = (from = 7, to = 12) => {
        const logs = Array.isArray(window.__THEGRAPHT_CALL_LOGS__)
          ? window.__THEGRAPHT_CALL_LOGS__
          : [];
        return JSON.stringify(
          logs.filter((entry) => (
            String(entry?.event || "").startsWith("video_debug_")
            && Number(entry?.details?.elapsed || 0) >= Number(from || 0)
            && Number(entry?.details?.elapsed || 0) <= Number(to || 0)
          )),
          null,
          2
        );
      };

      window.__clearTheGraphTCallLogs = () => {
        if (Array.isArray(window.__THEGRAPHT_CALL_LOGS__)) {
          window.__THEGRAPHT_CALL_LOGS__.length = 0;
        }
      };
      window.__dumpTheGraphTCallIncident = (callId = "", fromSecond = 0) => {
        const logs = Array.isArray(window.__THEGRAPHT_CALL_LOGS__)
          ? window.__THEGRAPHT_CALL_LOGS__
          : [];
        const targetCallId = String(callId || "").trim();
        const from = Number(fromSecond || 0);
        const includeEvent = (eventName) => (
          String(eventName || "").startsWith("video_debug_")
          || String(eventName || "").startsWith("realtime_receive_call_")
          || String(eventName || "").startsWith("pc_")
          || String(eventName || "").startsWith("ice_")
          || String(eventName || "") === "realtime_send"
          || String(eventName || "") === "setup_timeout_armed"
          || String(eventName || "") === "finish_call"
          || String(eventName || "") === "call_error"
        );
        const filtered = logs.filter((entry) => {
          if (!includeEvent(entry?.event)) {
            return false;
          }
          const elapsed = Number(entry?.details?.elapsed || 0);
          if (elapsed < from) {
            return false;
          }
          if (!targetCallId) {
            return true;
          }
          return String(entry?.details?.callId || "") === targetCallId;
        });
        return JSON.stringify(filtered, null, 2);
      };

      const getDebugTrackState = (track) => {
        if (!track) {
          return null;
        }
        return {
          id: track.id || "",
          kind: track.kind || "",
          label: track.label || "",
          enabled: Boolean(track.enabled),
          muted: Boolean(track.muted),
          readyState: track.readyState || ""
        };
      };

      const getDebugStreamState = (stream) => {
        if (!(stream instanceof MediaStream)) {
          return null;
        }
        return {
          id: stream.id || "",
          audioTracks: stream.getAudioTracks().map(getDebugTrackState),
          videoTracks: stream.getVideoTracks().map(getDebugTrackState)
        };
      };

      const setCallError = (message, details = {}) => {
        if (!activeCall) {
          return;
        }

        activeCall.lastError = message;
        activeCall.lastErrorAt = Date.now();
        errCall("call_error", {
          callId: activeCall.callId,
          status: activeCall.status,
          message,
          ...details
        });
      };

      const getCallErrorForUi = (message) => {
        const normalized = typeof message === "string" ? message.trim() : "";
        if (!normalized) {
          return "";
        }

        if (/^ICE\\s+\\d+:/i.test(normalized)) {
          return "network issue, retrying connection";
        }

        return normalized.length > 120 ? (normalized.slice(0, 117) + "...") : normalized;
      };

      const ensureOutgoingCallRingtoneNode = () => {
        if (outgoingCallRingtoneNode) {
          return outgoingCallRingtoneNode;
        }

        outgoingCallRingtoneNode = new Audio(${JSON.stringify(outgoingCallRingtoneUrl)});
        outgoingCallRingtoneNode.loop = false;
        outgoingCallRingtoneNode.preload = "auto";
        return outgoingCallRingtoneNode;
      };

      const ensureIncomingCallRingtoneNode = () => {
        if (incomingCallRingtoneNode) {
          return incomingCallRingtoneNode;
        }

        incomingCallRingtoneNode = new Audio(${JSON.stringify(incomingCallRingtoneUrl)});
        incomingCallRingtoneNode.loop = true;
        incomingCallRingtoneNode.preload = "auto";
        return incomingCallRingtoneNode;
      };

      const startOutgoingCallRingtone = () => {
        const node = ensureOutgoingCallRingtoneNode();

        try {
          node.currentTime = 0;
          const playPromise = node.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
        } catch {}
      };

      const startIncomingCallRingtone = () => {
        const node = ensureIncomingCallRingtoneNode();

        try {
          node.currentTime = 0;
          const playPromise = node.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
        } catch {}
      };

      const claimCallRingtonePlayback = (callId) => {
        if (!callId) {
          return false;
        }
        if (typeof claimNotificationDelivery === "function") {
          return claimNotificationDelivery("call_ringtone", callId, 20000);
        }
        return true;
      };

      const stopCallRingtone = () => {
        [outgoingCallRingtoneNode, incomingCallRingtoneNode].forEach((node) => {
          if (!node) {
            return;
          }
          try {
            node.pause();
            node.currentTime = 0;
          } catch {}
        });
      };

      const buildCallMessageMarker = (kind, durationSeconds = 0) => {
        const safeDuration = Math.max(0, Math.floor(durationSeconds || 0));
        return kind === "ended"
          ? "[[call:" + kind + ":" + safeDuration + "]]"
          : "[[call:" + kind + "]]";
      };

      const clearCallTimers = () => {
        if (callTickTimer) {
          window.clearInterval(callTickTimer);
          callTickTimer = null;
        }
        stopGroupCallPresenceHeartbeat();
        stopGroupLocalVoiceMeter();

        if (callTimeoutTimer) {
          window.clearTimeout(callTimeoutTimer);
          callTimeoutTimer = null;
        }

        stopCallRingtone();
      };

      const armCallSetupTimeout = (callId, reason = "missed") => {
        if (callTimeoutTimer) {
          window.clearTimeout(callTimeoutTimer);
        }

        logCall("setup_timeout_armed", { callId, reason, timeoutMs: CALL_SETUP_TIMEOUT_MS });

        callTimeoutTimer = window.setTimeout(() => {
          if (!activeCall || activeCall.callId !== callId || activeCall.status === "active") {
            return;
          }

          if (reason === "no_connect") {
            setCallError("Failed to establish P2P connection (ICE timeout).", {
              connectionState: activeCall.peerConnection?.connectionState,
              iceConnectionState: activeCall.peerConnection?.iceConnectionState,
              iceGatheringState: activeCall.peerConnection?.iceGatheringState
            });
            showToast("Failed to establish call connection (ICE timeout).", "error");
          }

          warnCall("setup_timeout_fired", {
            callId,
            reason,
            status: activeCall.status,
            connectionState: activeCall.peerConnection?.connectionState,
            iceConnectionState: activeCall.peerConnection?.iceConnectionState,
            iceGatheringState: activeCall.peerConnection?.iceGatheringState
          });

          sendCallRealtime({
            type: "call_end",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            reason,
            summaryBody: buildCallMessageMarker("missed")
          });

          void finishActiveCall({
            summaryBody: buildCallMessageMarker("missed"),
            remoteEnded: false
          });
        }, CALL_SETUP_TIMEOUT_MS);
      };


      const buildCallVideoDebugDetails = (extra = {}) => {
        const remoteVideo = document.getElementById("remote-screen-video");
        const placeholder = document.getElementById("call-main-placeholder");
        const localPreview = document.getElementById("local-video-preview");
        const modalClassList = callModal?.classList ? Array.from(callModal.classList) : [];
        const remoteElementStream = remoteVideo instanceof HTMLVideoElement ? remoteVideo.srcObject : null;
        const localPreviewStream = localPreview instanceof HTMLVideoElement ? localPreview.srcObject : null;
        return {
          callId: activeCall?.callId || "",
          status: activeCall?.status || "",
          direction: activeCall?.direction || "",
          elapsed: getCallElapsedSeconds(),
          screenEnabled: Boolean(activeCall?.screenEnabled),
          remoteScreenSharing: Boolean(activeCall?.remoteScreenSharing),
          screenOwnerUserId: activeCall?.screenOwnerUserId || "",
          cameraEnabled: Boolean(activeCall?.cameraEnabled),
          hasActiveRemoteVideoStream: activeCall?.remoteVideoStream instanceof MediaStream,
          activeRemoteVideoStream: getDebugStreamState(activeCall?.remoteVideoStream),
          localVisualStream: getDebugStreamState(activeCall?.localVisualStream),
          remoteElementStream: getDebugStreamState(remoteElementStream),
          localPreviewStream: getDebugStreamState(localPreviewStream),
          remoteVideoElement: remoteVideo instanceof HTMLVideoElement ? {
            hidden: Boolean(remoteVideo.hidden),
            display: remoteVideo.style.display || "",
            className: remoteVideo.className || "",
            paused: Boolean(remoteVideo.paused),
            readyState: remoteVideo.readyState,
            videoWidth: remoteVideo.videoWidth,
            videoHeight: remoteVideo.videoHeight,
            currentTime: Number.isFinite(remoteVideo.currentTime) ? Number(remoteVideo.currentTime.toFixed(2)) : 0
          } : null,
          placeholder: placeholder instanceof HTMLElement ? {
            hidden: Boolean(placeholder.hidden),
            display: placeholder.style.display || ""
          } : null,
          modal: {
            classList: modalClassList,
            screenShareActive: modalClassList.includes("screen-share-active"),
            hasDirectVisuals: modalClassList.includes("has-direct-visuals"),
            hasScreenShare: modalClassList.includes("has-screen-share"),
            directVisualLayout: callModal?.dataset?.directVisualLayout || ""
          },
          peerConnection: activeCall?.peerConnection ? {
            connectionState: activeCall.peerConnection.connectionState,
            iceConnectionState: activeCall.peerConnection.iceConnectionState,
            signalingState: activeCall.peerConnection.signalingState
          } : null,
          ...extra
        };
      };

      const logCallVideoDebug = (event, details = {}) => {
        logCall("video_debug_" + event, buildCallVideoDebugDetails(details));
      };

      const logCallVideoDebugSnapshot = (source, { force = false } = {}) => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        const elapsed = getCallElapsedSeconds();
        const remoteTrack = activeCall.remoteVideoStream instanceof MediaStream
          ? activeCall.remoteVideoStream.getVideoTracks()[0] || null
          : null;
        const signature = [
          elapsed,
          activeCall.screenEnabled ? 1 : 0,
          activeCall.remoteScreenSharing ? 1 : 0,
          activeCall.cameraEnabled ? 1 : 0,
          remoteTrack?.id || "",
          remoteTrack?.muted ? 1 : 0,
          remoteTrack?.readyState || "",
          callModal?.classList?.contains("screen-share-active") ? 1 : 0,
          callModal?.classList?.contains("has-direct-visuals") ? 1 : 0
        ].join("|");
        if (!force && elapsed > 20 && activeCall.__lastVideoDebugSignature === signature) {
          return;
        }
        if (!force && activeCall.__lastVideoDebugSecond === elapsed && activeCall.__lastVideoDebugSignature === signature) {
          return;
        }
        activeCall.__lastVideoDebugSecond = elapsed;
        activeCall.__lastVideoDebugSignature = signature;
        logCallVideoDebug("snapshot", { source, signature });
      };


`;
