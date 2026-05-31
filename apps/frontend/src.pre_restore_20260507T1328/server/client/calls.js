export const buildCallsClientChunk = ({
  outgoingCallRingtoneUrl,
  incomingCallRingtoneUrl,
  rtcIceServers
}) => `      const createCallId = () => "call_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      const CALL_SETUP_TIMEOUT_MS = 22000;
      const CALL_RECONNECT_GRACE_MS = 8000;
      const rtcIceServersRaw = ${JSON.stringify(rtcIceServers || "")};
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

      const formatCallDuration = (seconds) => {
        const safeSeconds = Math.max(0, Math.floor(seconds || 0));
        const minutes = Math.floor(safeSeconds / 60);
        const remainder = safeSeconds % 60;
        return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
      };
      const callFingerprintEmojiPool = ["🍎","🐱","🚀","🔥","🎯","🌊","🛰️","🛡️","⚡","🌙","🎧","📡","🧩","🎮","🦊","🧠","🦄","🍀","🧭","🔐","📶","🕹️","🫧","🌐"];
      const hashCallFingerprintSeed = (seed) => {
        const text = String(seed || "");
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
      };
      const buildCallFingerprintEmojis = (call) => {
        const seed = String(call?.callId || "");
        let hash = hashCallFingerprintSeed(seed);
        const picked = [];
        for (let index = 0; index < 6; index += 1) {
          hash = Math.imul(hash ^ (index + 1), 2246822519) >>> 0;
          picked.push(callFingerprintEmojiPool[hash % callFingerprintEmojiPool.length]);
        }
        return picked;
      };
      const sanitizeFingerprintEmojis = (value) => {
        if (!Array.isArray(value)) {
          return [];
        }
        return value
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .slice(0, 6);
      };
      const resolveCallFingerprintEmojis = (call) => {
        const synced = sanitizeFingerprintEmojis(call?.fingerprintEmojis);
        if (synced.length === 6) {
          return synced;
        }
        const generated = buildCallFingerprintEmojis(call);
        if (call && typeof call === "object") {
          call.fingerprintEmojis = generated;
        }
        return generated;
      };
      const buildCallFingerprintEmojiMarkup = (call) => {
        const emojis = resolveCallFingerprintEmojis(call);
        return emojis.map((emoji) => {
          const emojiAssetUrl = typeof getEmojiAssetUrl === "function" ? getEmojiAssetUrl(emoji) : "";
          if (!emojiAssetUrl) {
            return '<span class="call-fingerprint-emoji" aria-label="' + escapeHtml(emoji) + '">' + escapeHtml(emoji) + '</span>';
          }
          return '<img class="call-fingerprint-emoji" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emoji) + '" loading="lazy" decoding="async" draggable="false" />';
        }).join("");
      };

      const tuneOpusSdp = (sdp) => {
        if (typeof sdp !== "string" || !sdp.trim()) {
          return sdp;
        }

        const lines = sdp.split("\\r\\n");
        const opusLine = lines.find((line) => /^a=rtpmap:(\\d+)\\s+opus\\/48000\\/2$/i.test(line));
        if (!opusLine) {
          return sdp;
        }

        const opusPayloadType = opusLine.slice("a=rtpmap:".length).split(" ")[0];
        const fmtpPrefix = "a=fmtp:" + opusPayloadType;
        const expectedParams = {
          useinbandfec: "1",
          usedtx: "0",
          minptime: "10",
          cbr: "1",
          maxaveragebitrate: "28000"
        };

        let updated = false;
        const tunedLines = lines.map((line) => {
          if (!line.startsWith(fmtpPrefix)) {
            return line;
          }

          const rawParams = line
            .slice(fmtpPrefix.length)
            .trim()
            .split(";")
            .map((item) => item.trim())
            .filter(Boolean);

          const paramsMap = new Map();
          rawParams.forEach((item) => {
            const [rawKey, rawValue] = item.split("=");
            if (!rawKey) {
              return;
            }
            paramsMap.set(rawKey.trim().toLowerCase(), typeof rawValue === "string" ? rawValue.trim() : "");
          });

          Object.entries(expectedParams).forEach(([key, value]) => {
            paramsMap.set(key, value);
          });

          const serialized = Array.from(paramsMap.entries())
            .map(([key, value]) => key + (value ? "=" + value : ""))
            .join(";");

          updated = true;
          return fmtpPrefix + " " + serialized;
        });

        if (!updated) {
          tunedLines.push(
            fmtpPrefix + " " + Object.entries(expectedParams).map(([key, value]) => key + "=" + value).join(";")
          );
        }

        return tunedLines.join("\\r\\n");
      };

      const buildOfferWithVoiceProfile = async (peerConnection) => {
        const offer = await peerConnection.createOffer();
        const tunedSdp = tuneOpusSdp(offer.sdp || "");
        if (!tunedSdp || tunedSdp === offer.sdp) {
          return offer;
        }
        return {
          type: offer.type,
          sdp: tunedSdp
        };
      };

      const buildAnswerWithVoiceProfile = async (peerConnection) => {
        const answer = await peerConnection.createAnswer();
        const tunedSdp = tuneOpusSdp(answer.sdp || "");
        if (!tunedSdp || tunedSdp === answer.sdp) {
          return answer;
        }
        return {
          type: answer.type,
          sdp: tunedSdp
        };
      };

      const applyAudioSenderProfile = async (peerConnection, callId) => {
        try {
          const sender = peerConnection.getSenders().find((entry) => entry.track?.kind === "audio");
          if (!sender || typeof sender.getParameters !== "function" || typeof sender.setParameters !== "function") {
            return;
          }

          const parameters = sender.getParameters() || {};
          if (!Array.isArray(parameters.encodings) || !parameters.encodings.length) {
            parameters.encodings = [{}];
          }
          parameters.encodings[0] = {
            ...(parameters.encodings[0] || {}),
            maxBitrate: 28000
          };
          await sender.setParameters(parameters);
          logCall("audio_sender_profile_applied", { callId, maxBitrate: 28000 });
        } catch (error) {
          warnCall("audio_sender_profile_skipped", {
            callId,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const ensureRemoteAudioNode = () => {
        if (remoteAudioNode) {
          return remoteAudioNode;
        }

        remoteAudioNode = new Audio();
        remoteAudioNode.autoplay = true;
        remoteAudioNode.controls = false;
        remoteAudioNode.disableRemotePlayback = true;
        try {
          remoteAudioNode.setAttribute("x-webkit-airplay", "deny");
        } catch {}
        return remoteAudioNode;
      };
      const disableSystemMediaSessionControls = () => {
        const mediaSession = navigator.mediaSession;
        if (!mediaSession || typeof mediaSession.setActionHandler !== "function") {
          return;
        }

        const actions = [
          "play",
          "pause",
          "stop",
          "seekbackward",
          "seekforward",
          "seekto",
          "previoustrack",
          "nexttrack",
          "skipad"
        ];

        for (const action of actions) {
          try {
            mediaSession.setActionHandler(action, null);
          } catch {}
        }

        try {
          mediaSession.metadata = null;
        } catch {}
        try {
          mediaSession.playbackState = "none";
        } catch {}
      };
      disableSystemMediaSessionControls();
      let callVoiceMeterRaf = 0;
      let callVoiceMeterContext = null;
      let callVoiceMeterAnalyser = null;
      let callVoiceMeterSource = null;
      let callVoiceMeterData = null;
      const setCallVoiceLevel = (nextLevel) => {
        const level = Number.isFinite(nextLevel) ? Math.max(0, Math.min(1, nextLevel)) : 0;
        if (callModal?.style) {
          callModal.style.setProperty("--call-voice-level", String(level));
        }
        if (callMiniCard?.style) {
          callMiniCard.style.setProperty("--call-voice-level", String(level));
        }
      };
      const stopCallVoiceMeter = () => {
        if (callVoiceMeterRaf) {
          window.cancelAnimationFrame(callVoiceMeterRaf);
          callVoiceMeterRaf = 0;
        }
        try {
          callVoiceMeterSource?.disconnect();
        } catch {}
        try {
          callVoiceMeterAnalyser?.disconnect();
        } catch {}
        callVoiceMeterSource = null;
        callVoiceMeterAnalyser = null;
        callVoiceMeterData = null;
        if (callVoiceMeterContext) {
          try {
            if (callVoiceMeterContext.state !== "closed") {
              void callVoiceMeterContext.close();
            }
          } catch {}
        }
        callVoiceMeterContext = null;
        setCallVoiceLevel(0);
      };
      const startCallVoiceMeter = (stream) => {
        stopCallVoiceMeter();
        if (!stream || typeof window.AudioContext !== "function") {
          return;
        }

        try {
          const context = new window.AudioContext();
          const analyser = context.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.78;
          const data = new Uint8Array(analyser.fftSize);
          const source = context.createMediaStreamSource(stream);
          source.connect(analyser);

          callVoiceMeterContext = context;
          callVoiceMeterAnalyser = analyser;
          callVoiceMeterSource = source;
          callVoiceMeterData = data;

          const tick = () => {
            if (!callVoiceMeterAnalyser || !callVoiceMeterData) {
              return;
            }
            try {
              callVoiceMeterAnalyser.getByteTimeDomainData(callVoiceMeterData);
              let peak = 0;
              for (let index = 0; index < callVoiceMeterData.length; index += 1) {
                const amplitude = Math.abs((callVoiceMeterData[index] - 128) / 128);
                if (amplitude > peak) {
                  peak = amplitude;
                }
              }
              const normalized = Math.max(0, Math.min(1, (peak - 0.015) * 3.2));
              setCallVoiceLevel(normalized);
            } catch {
              setCallVoiceLevel(0);
            }
            callVoiceMeterRaf = window.requestAnimationFrame(tick);
          };
          callVoiceMeterRaf = window.requestAnimationFrame(tick);
        } catch (error) {
          warnCall("voice_meter_start_failed", {
            error: error instanceof Error ? error.message : String(error)
          });
          setCallVoiceLevel(0);
        }
      };

      const parseRtcIceServers = () => {
        const normalizeUrlsList = (value) => {
          const list = Array.isArray(value) ? value : [value];
          return list
            .map((entry) => typeof entry === "string" ? entry.trim() : "")
            .filter(Boolean);
        };
        const isValidIceUrl = (value) => {
          if (typeof value !== "string") {
            return false;
          }
          const raw = value.trim();
          if (!raw) {
            return false;
          }
          // Accept stun/turn/turns with either hostname or IPv4 and optional
          // port/query. Reject malformed values like "stun::3478".
          return /^(stun|turn|turns):[a-z0-9.-]+(?::\\d{1,5})?(?:\\?.*)?$/i.test(raw);
        };
        const hasTurnUrl = (value) => normalizeUrlsList(value).some((entry) => /^turns?:/i.test(entry));
        const isValidTurnAuth = (username, credential) =>
          typeof username === "string"
          && username.trim().length > 0
          && typeof credential === "string"
          && credential.trim().length > 0;
        const defaultTurnHost = (window.location && window.location.hostname) ? window.location.hostname : "89.35.130.157";
        const fallback = [
          { urls: "stun:" + defaultTurnHost + ":3478" },
          {
            urls: [
              "turn:" + defaultTurnHost + ":3478?transport=udp",
              "turn:" + defaultTurnHost + ":3478?transport=tcp"
            ],
            username: "thegrapht_turn",
            credential: "thegrapht_turn_pass"
          }
        ];

        if (!rtcIceServersRaw) {
          logCall("ice_servers_fallback_default", { fallback });
          return fallback;
        }

        try {
          const parsed = JSON.parse(rtcIceServersRaw);
          if (!Array.isArray(parsed)) {
            return fallback;
          }

          const normalized = parsed
            .filter((item) => item && typeof item === "object")
            .map((item) => {
              const urls = item.urls;
              const username = typeof item.username === "string" ? item.username.trim() : "";
              const credential = typeof item.credential === "string" ? item.credential.trim() : "";

              if (typeof urls === "string" || Array.isArray(urls)) {
                const filteredUrls = normalizeUrlsList(urls).filter((entry) => isValidIceUrl(entry));
                if (!filteredUrls.length) {
                  warnCall("dropping_invalid_ice_server_urls", { urls });
                  return null;
                }

                if (hasTurnUrl(filteredUrls) && !isValidTurnAuth(username, credential)) {
                  warnCall("dropping_invalid_turn_server_missing_credentials", { urls });
                  return null;
                }

                return {
                  urls: Array.isArray(urls) ? filteredUrls : filteredUrls[0],
                  ...(username ? { username } : {}),
                  ...(credential ? { credential } : {})
                };
              }

              return null;
            })
            .filter(Boolean);

          const resolved = normalized.length ? normalized : fallback;
          logCall("ice_servers_resolved", { resolved });
          return resolved;
        } catch {
          warnCall("ice_servers_parse_failed_using_fallback", { rtcIceServersRaw });
          return fallback;
        }
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

      const buildAnimatedDots = () => {
        const phase = Math.floor(Date.now() / 420) % 4;
        return ".".repeat(phase);
      };

      const getCallElapsedSeconds = () => {
        if (!activeCall?.connectedAt) {
          return 0;
        }

        return Math.max(0, Math.floor((Date.now() - activeCall.connectedAt) / 1000));
      };

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
          callMiniCard.classList.remove("visible");
          callMiniCard.classList.remove("dragging");
          setCallVoiceLevel(0);
          callMiniCard.style.left = "";
          callMiniCard.style.top = "";
          callMiniCard.style.right = "";
          callMiniCard.style.bottom = "";
          closeCallDevicesPanel();
          syncActiveCallChip();
          return;
        }

        const avatar = getAvatarMeta(activeCall.peerId || activeCall.peerName, activeCall.peerName || "?");
        const isIncoming = activeCall.status === "incoming";
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
        callMiniCard.dataset.callState = activeCall.status || "idle";
        callMiniCard.dataset.callDirection = activeCall.direction || "outgoing";
        callModal.classList.toggle("ringing", isRinging);
        callMiniCard.classList.toggle("ringing", isRinging);

        callPeerAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        callPeerAvatar.style.cssText = avatar.style;
        const callFingerprintNode = document.getElementById("call-fingerprint-emojis");
        if (callFingerprintNode) {
          callFingerprintNode.innerHTML = buildCallFingerprintEmojiMarkup(activeCall);
        }
        callPeerName.textContent = activeCall.peerName || "TheGraphT";
        callPeerStatus.textContent = statusText;
        callPeerSubstatus.textContent = substatusText + debugSuffix;
        callMiniAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        callMiniAvatar.style.cssText = avatar.style;
        callMiniName.textContent = activeCall.peerName || "TheGraphT";
        callMiniSubtitle.textContent = statusText;
        callMuteButton.classList.toggle("muted", Boolean(activeCall.isMuted));
        callMuteLabel.textContent = activeCall.isMuted ? "mic muted" : "microphone";
        callAcceptWrap.hidden = !shouldShowAcceptAction;
        callAcceptWrap.style.display = shouldShowAcceptAction ? "" : "none";
        if (callAcceptWrap.parentElement) {
          callAcceptWrap.parentElement.dataset.callLayout = shouldShowAcceptAction ? "incoming" : "outgoing";
        }
        callEndButton.setAttribute("aria-label", shouldShowAcceptAction ? "Decline call" : "End call");
        callEndLabel.textContent = shouldShowAcceptAction ? "decline" : "end";
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
      };

      const startCallTicker = () => {
        if (callTickTimer) {
          return;
        }

        callTickTimer = window.setInterval(() => {
          syncCallUi();
        }, 1000);
      };

      const stopAndReleaseCallMedia = async () => {
        if (!activeCall) {
          return;
        }
        stopCallVoiceMeter();

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

        if (remoteAudioNode) {
          try {
            remoteAudioNode.pause();
            remoteAudioNode.srcObject = null;
          } catch {}
        }
      };

      const sendCallRealtime = (payload) => {
        if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
          warnCall("realtime_send_skipped_socket_not_open", {
            payloadType: payload?.type,
            readyState: realtimeSocket?.readyState
          });
          return;
        }

        logCall("realtime_send", {
          payloadType: payload.type,
          callId: payload.callId,
          dialogId: payload.dialogId
        });
        realtimeSocket.send(JSON.stringify(payload));
      };

      const finishActiveCall = async ({ summaryBody = "", remoteEnded = false } = {}) => {
        if (!activeCall) {
          return;
        }

        logCall("finish_call", {
          callId: activeCall.callId,
          status: activeCall.status,
          remoteEnded,
          summaryBody
        });
        clearCallTimers();
        await stopAndReleaseCallMedia();
        activeCall = null;
        syncCallUi();
      };

      const loadCallDevices = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputDevices = devices.filter((device) => device.kind === "audioinput");
          const outputDevices = devices.filter((device) => device.kind === "audiooutput");

          callInputDevice.innerHTML = inputDevices.map((device, index) => (
            '<option value="' + escapeHtml(device.deviceId) + '">' + escapeHtml(device.label || ("Microphone " + (index + 1))) + '</option>'
          )).join("");

          callOutputDevice.innerHTML = outputDevices.map((device, index) => (
            '<option value="' + escapeHtml(device.deviceId) + '">' + escapeHtml(device.label || ("Output " + (index + 1))) + '</option>'
          )).join("");
        } catch {}
      };

      const createPeerConnection = (call) => {
        const iceServers = parseRtcIceServers();
        const peerConnection = new RTCPeerConnection({
          iceServers,
          iceCandidatePoolSize: 10
        });
        logCall("pc_created", { callId: call.callId, iceServers });

        peerConnection.onicecandidate = (event) => {
          if (!activeCall || activeCall.callId !== call.callId) {
            return;
          }

          if (!event.candidate) {
            logCall("ice_candidate_gathering_complete", {
              callId: call.callId,
              iceGatheringState: peerConnection.iceGatheringState
            });
            return;
          }

          logCall("ice_candidate_local", {
            callId: call.callId,
            protocol: event.candidate.protocol,
            type: event.candidate.type,
            address: event.candidate.address
          });

          sendCallRealtime({
            type: "call_candidate",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            candidate: event.candidate
          });
        };

        peerConnection.ontrack = (event) => {
          logCall("remote_track_received", {
            callId: call.callId,
            streamCount: event.streams?.length || 0
          });
          const audio = ensureRemoteAudioNode();
          audio.srcObject = event.streams[0];
          startCallVoiceMeter(event.streams[0]);
          try {
            const playPromise = audio.play();
            if (playPromise?.catch) {
              playPromise.catch(() => {});
            }
          } catch {}
        };

        peerConnection.onconnectionstatechange = () => {
          if (!activeCall || activeCall.callId !== call.callId) {
            return;
          }

          logCall("pc_connection_state", {
            callId: call.callId,
            connectionState: peerConnection.connectionState,
            iceConnectionState: peerConnection.iceConnectionState,
            iceGatheringState: peerConnection.iceGatheringState,
            signalingState: peerConnection.signalingState
          });

          if (peerConnection.connectionState === "connected") {
            activeCall.status = "active";
            activeCall.lastError = "";
            if (!activeCall.connectedAt) {
              activeCall.connectedAt = Date.now();
            }
            clearCallTimers();
            stopCallRingtone();
            startCallTicker();
            syncCallUi();
            return;
          }

          if (peerConnection.connectionState === "disconnected") {
            if (activeCall.status === "active" || activeCall.status === "connecting") {
              activeCall.status = "reconnecting";
              setCallError("Unstable network, reconnecting.", {
                connectionState: peerConnection.connectionState,
                iceConnectionState: peerConnection.iceConnectionState
              });
              syncCallUi();
            }
            if (!callTimeoutTimer) {
              callTimeoutTimer = window.setTimeout(() => {
                if (!activeCall || activeCall.callId !== call.callId) {
                  return;
                }
                void finishActiveCall({
                  summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : buildCallMessageMarker("missed"),
                  remoteEnded: false
                });
              }, CALL_RECONNECT_GRACE_MS);
            }
            return;
          }

          if (peerConnection.connectionState === "failed" || peerConnection.connectionState === "closed") {
            setCallError("WebRTC connection failed.", {
              connectionState: peerConnection.connectionState,
              iceConnectionState: peerConnection.iceConnectionState,
              signalingState: peerConnection.signalingState
            });
            void finishActiveCall({
              summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : "",
              remoteEnded: false
            });
          }
        };

        peerConnection.oniceconnectionstatechange = () => {
          if (!activeCall || activeCall.callId !== call.callId) {
            return;
          }

          logCall("pc_ice_connection_state", {
            callId: call.callId,
            iceConnectionState: peerConnection.iceConnectionState,
            connectionState: peerConnection.connectionState,
            iceGatheringState: peerConnection.iceGatheringState
          });

          if (peerConnection.iceConnectionState === "connected" || peerConnection.iceConnectionState === "completed") {
            if (activeCall.status === "reconnecting") {
              activeCall.status = activeCall.connectedAt ? "active" : "connecting";
              activeCall.lastError = "";
              syncCallUi();
            }
            return;
          }

          if (peerConnection.iceConnectionState === "failed") {
            setCallError("ICE failed: candidates could not connect.", {
              connectionState: peerConnection.connectionState,
              signalingState: peerConnection.signalingState
            });
            void finishActiveCall({
              summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : buildCallMessageMarker("missed"),
              remoteEnded: false
            });
          }
        };

        peerConnection.onicecandidateerror = (event) => {
          const safeCode = Number.isFinite(event?.errorCode) ? event.errorCode : "unknown";
          const safeText = event?.errorText ? String(event.errorText) : "unknown";
          const safeUrl = event?.url ? String(event.url) : "";
          const verboseMessage = "ICE " + safeCode + ": " + safeText + (safeUrl ? " (" + safeUrl + ")" : "");
          warnCall("ice_candidate_error", {
            callId: call.callId,
            errorCode: event.errorCode,
            errorText: event.errorText,
            url: event.url
          });

          if (!activeCall || activeCall.callId !== call.callId) {
            return;
          }

          // 701 errors are often non-fatal candidate gathering warnings in browsers.
          if (Number(event?.errorCode) === 701) {
            return;
          }

          // Do not override active call UI with transient candidate-level errors.
          if (activeCall.status === "active") {
            return;
          }

          setCallError(verboseMessage, {
            errorCode: event.errorCode,
            errorText: event.errorText,
            url: event.url
          });
        };

        peerConnection.onicegatheringstatechange = () => {
          logCall("pc_ice_gathering_state", {
            callId: call.callId,
            iceGatheringState: peerConnection.iceGatheringState
          });
        };

        peerConnection.onsignalingstatechange = () => {
          logCall("pc_signaling_state", {
            callId: call.callId,
            signalingState: peerConnection.signalingState
          });
        };

        return peerConnection;
      };

      const ensureCallLocalStream = async (inputDeviceId) => {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support calls.");
        }

        const constraints = {
          audio: {
            ...(inputDeviceId ? { deviceId: { exact: inputDeviceId } } : {}),
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000,
            sampleSize: 16,
            latency: 0
          }
        };

        return navigator.mediaDevices.getUserMedia(constraints);
      };

      const applyCallOutputDevice = async (deviceId) => {
        const audio = ensureRemoteAudioNode();

        if (typeof audio.setSinkId !== "function" || !deviceId) {
          return;
        }

        try {
          await audio.setSinkId(deviceId);
        } catch {}
      };

      const replaceLocalAudioTrack = async (deviceId) => {
        if (!activeCall?.peerConnection) {
          return;
        }

        const nextStream = await ensureCallLocalStream(deviceId);
        const nextTrack = nextStream.getAudioTracks()[0];
        const sender = activeCall.peerConnection.getSenders().find((entry) => entry.track?.kind === "audio");

        if (sender && nextTrack) {
          await sender.replaceTrack(nextTrack);
        } else if (nextTrack) {
          activeCall.peerConnection.addTrack(nextTrack, nextStream);
        }

        activeCall.localStream?.getTracks().forEach((track) => {
          try { track.stop(); } catch {}
        });
        activeCall.localStream = nextStream;
        activeCall.inputDeviceId = deviceId;
        if (activeCall.isMuted && nextTrack) {
          nextTrack.enabled = false;
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

      const showIncomingCallNotification = async (call) => {
        if (!isWindowInactive() || !call || !isNotificationOwner()) {
          return;
        }

        if (!claimNotificationDelivery("call", call.callId, 20000)) {
          return;
        }

        playSound("message");
        const permission = await ensureNotificationPermission();

        if (permission !== "granted") {
          return;
        }

        try {
          const notification = new Notification(call.peerName + " is calling you", {
            body: "Tap to open the call",
            icon: buildNotificationAvatarUrl(call.peerName),
            badge: "/assets/logo.jpg",
            tag: "call_" + call.callId,
            renotify: true
          });

          notification.onclick = () => {
            window.focus();
            restoreCallModal();
            notification.close();
          };
        } catch {}
      };

      const beginOutgoingCall = async () => {
        if (!isPrimaryActiveTab) {
          showToast("Another tab is active. Close other tabs to place calls here.", "error");
          return;
        }

        if (!currentDialogSnapshot || currentDialogSnapshot.type !== "direct") {
          return;
        }

        if (activeCall) {
          showToast("Finish the current call first.", "error");
          return;
        }

        try {
          const localStream = await ensureCallLocalStream("");
          logCall("local_stream_acquired_outgoing", {
            trackCount: localStream.getTracks().length
          });
          await loadCallDevices();
          const call = {
            callId: createCallId(),
            dialogId: currentDialogSnapshot.id,
            dialogPublicId: currentDialogSnapshot.publicId,
            peerId: currentDialogSnapshot.peerUserId || "",
            peerName: currentDialogSnapshot.title,
            status: "outgoing",
            direction: "outgoing",
            localStream,
            peerConnection: null,
            connectedAt: 0,
            isMuted: false,
            inputDeviceId: "",
            outputDeviceId: "",
            pendingCandidates: [],
            minimized: false,
            miniHidden: false,
            miniPosition: null
          };
          call.fingerprintEmojis = resolveCallFingerprintEmojis(call);

          const peerConnection = createPeerConnection(call);
          call.peerConnection = peerConnection;
          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
          });
          await applyAudioSenderProfile(peerConnection, call.callId);

          activeCall = call;
          startOutgoingCallRingtone();
          syncCallUi();
          const offer = await buildOfferWithVoiceProfile(peerConnection);
          await peerConnection.setLocalDescription(offer);
          logCall("local_offer_created", {
            callId: call.callId,
            sdpType: offer.type
          });
          sendCallRealtime({
            type: "call_invite",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            callerName: currentUserDisplayName || workspaceUserName.textContent || "TheGraphT",
            fingerprintEmojis: call.fingerprintEmojis,
            offer
          });

          armCallSetupTimeout(call.callId, "missed");
        } catch (error) {
            setCallError("Failed to start outgoing call.", {
            error: error instanceof Error ? error.message : String(error)
          });
          showToast(error instanceof Error ? error.message : "Failed to start call.", "error");
        }
      };

      const acceptIncomingCall = async () => {
        if (!activeCall || activeCall.status !== "incoming") {
          return;
        }

        try {
          const localStream = await ensureCallLocalStream(activeCall.inputDeviceId || "");
          logCall("local_stream_acquired_incoming", {
            callId: activeCall.callId,
            trackCount: localStream.getTracks().length
          });
          await loadCallDevices();
          const peerConnection = createPeerConnection(activeCall);
          activeCall.peerConnection = peerConnection;
          activeCall.localStream = localStream;
          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
          });
          await applyAudioSenderProfile(peerConnection, activeCall.callId);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(activeCall.remoteOffer));
          logCall("remote_offer_set", {
            callId: activeCall.callId,
            sdpType: activeCall.remoteOffer?.type
          });

          while (activeCall.pendingCandidates.length) {
            const candidate = activeCall.pendingCandidates.shift();
            try {
              await peerConnection.addIceCandidate(candidate);
            } catch {}
          }

          const answer = await buildAnswerWithVoiceProfile(peerConnection);
          await peerConnection.setLocalDescription(answer);
          logCall("local_answer_created", {
            callId: activeCall.callId,
            sdpType: answer.type
          });
          activeCall.status = "connecting";
          stopCallRingtone();
          syncCallUi();
          sendCallRealtime({
            type: "call_accept",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            answer
          });
        } catch (error) {
            setCallError("Failed to accept incoming call.", {
            error: error instanceof Error ? error.message : String(error)
          });
          showToast(error instanceof Error ? error.message : "Failed to accept call.", "error");
          await finishActiveCall({ summaryBody: buildCallMessageMarker("missed"), remoteEnded: false });
        }
      };

      const endOrRejectCall = async () => {
        if (!activeCall) {
          return;
        }

        const call = activeCall;

        if (call.status === "incoming") {
          sendCallRealtime({
            type: "call_reject",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            reason: "declined",
            summaryBody: buildCallMessageMarker("declined")
          });
          await finishActiveCall({
            summaryBody: buildCallMessageMarker("declined"),
            remoteEnded: false
          });
          return;
        }

        if (call.status === "active") {
          sendCallRealtime({
            type: "call_end",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            reason: "ended",
            durationSeconds: getCallElapsedSeconds(),
            summaryBody: buildCallMessageMarker("ended", getCallElapsedSeconds())
          });
          await finishActiveCall({
            summaryBody: buildCallMessageMarker("ended", getCallElapsedSeconds()),
            remoteEnded: false
          });
          return;
        }

        sendCallRealtime({
          type: "call_end",
          callId: call.callId,
          dialogId: call.dialogId,
          dialogPublicId: call.dialogPublicId,
          reason: "cancelled",
          summaryBody: buildCallMessageMarker("cancelled")
        });
        await finishActiveCall({
          summaryBody: buildCallMessageMarker("cancelled"),
          remoteEnded: false
        });
      };

      const handleCallInvite = async (payload) => {
        logCall("realtime_receive_call_invite", {
          callId: payload?.callId,
          dialogId: payload?.dialogId,
          senderUserId: payload?.senderUserId
        });
        if (!payload?.callId || !payload?.dialogId || !payload?.offer) {
          warnCall("call_invite_ignored_invalid_payload", { payload });
          return;
        }

        const dialog = getDialogByIdLocal(payload.dialogId) || currentDialogSnapshot;

        if (payload.senderUserId && payload.senderUserId === currentUserId) {
          return;
        }

        if (!isPrimaryActiveTab) {
          return;
        }

        if (
          activeCall
          && activeCall.dialogId === payload.dialogId
          && (activeCall.status === "outgoing" || activeCall.status === "connecting" || activeCall.status === "active")
        ) {
          return;
        }

        if (activeCall && activeCall.callId !== payload.callId) {
          sendCallRealtime({
            type: "call_reject",
            callId: payload.callId,
            dialogId: payload.dialogId,
            dialogPublicId: payload.dialogPublicId || dialog?.publicId || "",
            reason: "busy"
          });
          return;
        }

        activeCall = {
          callId: payload.callId,
          dialogId: payload.dialogId,
          dialogPublicId: payload.dialogPublicId || dialog?.publicId || "",
          peerId: payload.senderUserId || dialog?.peerUserId || "",
          peerName: payload.callerName || dialog?.title || "TheGraphT",
          status: "incoming",
          direction: "incoming",
          remoteOffer: payload.offer,
          peerConnection: null,
          localStream: null,
          connectedAt: 0,
          isMuted: false,
          inputDeviceId: "",
          outputDeviceId: "",
          pendingCandidates: [],
          minimized: false,
          miniHidden: false,
          miniPosition: null
        };
        activeCall.fingerprintEmojis = sanitizeFingerprintEmojis(payload.fingerprintEmojis);

        if (claimCallRingtonePlayback(payload.callId)) {
          startIncomingCallRingtone();
        }
        syncCallUi();
        armCallSetupTimeout(payload.callId, "missed");
        await showIncomingCallNotification(activeCall);
      };

      const handleCallAccept = async (payload) => {
        logCall("realtime_receive_call_accept", {
          callId: payload?.callId,
          dialogId: payload?.dialogId
        });
        if (!activeCall || activeCall.callId !== payload.callId || !payload.answer || !activeCall.peerConnection) {
          warnCall("call_accept_ignored_state_mismatch", {
            payloadCallId: payload?.callId,
            activeCallId: activeCall?.callId,
            hasPeerConnection: Boolean(activeCall?.peerConnection)
          });
          return;
        }

        if (callTimeoutTimer) {
          window.clearTimeout(callTimeoutTimer);
          callTimeoutTimer = null;
        }

        try {
          await activeCall.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
          activeCall.status = "connecting";
          stopCallRingtone();
          logCall("remote_answer_set", {
            callId: activeCall.callId,
            sdpType: payload.answer?.type
          });
          armCallSetupTimeout(activeCall.callId, "no_connect");

          while (activeCall.pendingCandidates.length) {
            const candidate = activeCall.pendingCandidates.shift();
            try {
              await activeCall.peerConnection.addIceCandidate(candidate);
            } catch {}
          }

          syncCallUi();
        } catch (error) {
          setCallError("Failed to apply remote answer SDP.", {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const handleCallCandidate = async (payload) => {
        logCall("realtime_receive_call_candidate", {
          callId: payload?.callId,
          hasCandidate: Boolean(payload?.candidate)
        });
        if (!activeCall || activeCall.callId !== payload.callId || !payload.candidate) {
          return;
        }

        const candidate = new RTCIceCandidate(payload.candidate);

        if (!activeCall.peerConnection || !activeCall.peerConnection.remoteDescription) {
          activeCall.pendingCandidates.push(candidate);
          logCall("remote_candidate_buffered", {
            callId: payload.callId,
            bufferedCount: activeCall.pendingCandidates.length
          });
          return;
        }

        try {
          await activeCall.peerConnection.addIceCandidate(candidate);
        } catch (error) {
          setCallError("Failed to add ICE candidate.", {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const handleCallReject = async (payload) => {
        logCall("realtime_receive_call_reject", {
          callId: payload?.callId,
          reason: payload?.reason
        });
        if (!activeCall || activeCall.callId !== payload.callId) {
          return;
        }

        stopCallRingtone();
        const summary = payload.reason === "busy" ? "Busy" : "Declined call";
        await finishActiveCall({
          summaryBody: "",
          remoteEnded: true
        });
        showToast(summary, "info");
      };

      const handleCallEnd = async (payload) => {
        logCall("realtime_receive_call_end", {
          callId: payload?.callId,
          reason: payload?.reason
        });
        if (!activeCall || activeCall.callId !== payload.callId) {
          return;
        }

        stopCallRingtone();
        await finishActiveCall({
          summaryBody: "",
          remoteEnded: true
        });

        if (payload.reason === "missed") {
          showToast("Missed call.", "info");
          return;
        }

        if (payload.reason === "no_connect") {
          showToast("Failed to establish call connection.", "error");
        }
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
        const rawLetter = Array.from(String(labelSource || seedSource || "?").trim())[0] || "?";
        const letter = escapeHtml(String(rawLetter).toLocaleUpperCase("ru-RU"));
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
        const rawLetter = Array.from(String(labelSource || seedSource || "?").trim())[0] || "?";
        const letter = String(rawLetter).toLocaleUpperCase("ru-RU") || "?";
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
