export const callWebrtc = () => `
      const callFingerprintEmojiPool = ["🍎","🐱","🚀","🔥","🎯","🌊","🛰️","🛡️","⚡","🌙","🎧","📡","🧩","🎮","🦊","🧠","🦄","🍀","🧭","🔐","📶","🕹️","🫧","🌐"];
      const callFingerprintEmojiHints = {
        "🍎": "Red apple",
        "🐱": "Cat face",
        "🚀": "Rocket",
        "🔥": "Fire",
        "🎯": "Bullseye",
        "🌊": "Water wave",
        "🛰️": "Satellite",
        "🛡️": "Shield",
        "⚡": "Lightning",
        "🌙": "Crescent moon",
        "🎧": "Headphones",
        "📡": "Satellite antenna",
        "🧩": "Puzzle piece",
        "🎮": "Gamepad",
        "🦊": "Fox face",
        "🧠": "Brain",
        "🦄": "Unicorn",
        "🍀": "Four leaf clover",
        "🧭": "Compass",
        "🔐": "Locked key",
        "📶": "Signal strength",
        "🕹️": "Joystick",
        "🫧": "Bubbles",
        "🌐": "Globe"
      };
      const hashCallFingerprintSeed = (seed) => {
        const text = String(seed || "");
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
      };
      const buildCallFingerprintEmojis = () => {
        const pool = callFingerprintEmojiPool.slice();
        const picked = [];
        for (let index = 0; index < 6 && pool.length; index += 1) {
          let randomIndex = 0;
          if (window.crypto?.getRandomValues) {
            const randomBuffer = new Uint32Array(1);
            window.crypto.getRandomValues(randomBuffer);
            randomIndex = randomBuffer[0] % pool.length;
          } else {
            randomIndex = Math.floor(Math.random() * pool.length);
          }
          picked.push(pool.splice(randomIndex, 1)[0]);
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
          const emojiHint = String(callFingerprintEmojiHints[emoji] || "Emoji fingerprint");
          if (!emojiAssetUrl) {
            return '<span class="call-fingerprint-emoji" data-emoji-hint="' + escapeHtml(emojiHint) + '" aria-label="' + escapeHtml(emojiHint) + '">' + escapeHtml(emoji) + '</span>';
          }
          return '<img class="call-fingerprint-emoji" data-emoji-hint="' + escapeHtml(emojiHint) + '" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emoji) + '" onerror=\\\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\\\' loading="lazy" decoding="async" draggable="false" />';
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
          maxaveragebitrate: "48000"
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
            maxBitrate: 48000
          };
          await sender.setParameters(parameters);
          logCall("audio_sender_profile_applied", { callId, maxBitrate: 48000 });
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

      const clampVoiceLevel = (value) => Math.max(0, Math.min(1, Number(value) || 0));
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
      const stopGroupLocalVoiceMeter = () => {
        if (groupLocalVoiceMeterTimer) {
          window.clearInterval(groupLocalVoiceMeterTimer);
          groupLocalVoiceMeterTimer = null;
        }
        try {
          groupLocalVoiceMeterSource?.disconnect();
        } catch {}
        try {
          groupLocalVoiceMeterAnalyser?.disconnect();
        } catch {}
        groupLocalVoiceMeterSource = null;
        groupLocalVoiceMeterAnalyser = null;
        groupLocalVoiceMeterData = null;
        if (groupLocalVoiceMeterContext) {
          try {
            if (groupLocalVoiceMeterContext.state !== "closed") {
              void groupLocalVoiceMeterContext.close();
            }
          } catch {}
        }
        groupLocalVoiceMeterContext = null;
        groupLocalVoiceLastSpeaking = false;
        groupLocalVoiceLastPresenceSentAt = 0;
        groupLocalVoiceLastLevel = 0;
        groupLocalVoiceLastLevelSent = 0;
        groupLocalVoiceLastUiLevel = 0;
      };
      const startGroupLocalVoiceMeter = (call) => {
        stopGroupLocalVoiceMeter();
        if (!call || call.mode !== "group" || !call.localStream || typeof window.AudioContext !== "function") {
          return;
        }
        try {
          const context = new window.AudioContext();
          const analyser = context.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.72;
          const data = new Uint8Array(analyser.fftSize);
          const source = context.createMediaStreamSource(call.localStream);
          source.connect(analyser);
          groupLocalVoiceMeterContext = context;
          groupLocalVoiceMeterAnalyser = analyser;
          groupLocalVoiceMeterSource = source;
          groupLocalVoiceMeterData = data;
          groupLocalVoiceMeterTimer = window.setInterval(() => {
            if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== call.callId) {
              stopGroupLocalVoiceMeter();
              return;
            }
            let peak = 0;
            if (!activeCall.isMuted && groupLocalVoiceMeterAnalyser && groupLocalVoiceMeterData) {
              try {
                groupLocalVoiceMeterAnalyser.getByteTimeDomainData(groupLocalVoiceMeterData);
                for (let index = 0; index < groupLocalVoiceMeterData.length; index += 1) {
                  const amplitude = Math.abs((groupLocalVoiceMeterData[index] - 128) / 128);
                  if (amplitude > peak) {
                    peak = amplitude;
                  }
                }
              } catch {}
            }
            const normalizedVoiceLevel = activeCall.isMuted
              ? 0
              : clampVoiceLevel(Math.max(0, Math.min(1, (peak - 0.012) * 3.45)));
            const isSpeakingNow = !activeCall.isMuted;
            const speakingChanged = isSpeakingNow !== groupLocalVoiceLastSpeaking;
            groupLocalVoiceLastSpeaking = isSpeakingNow;
            groupLocalVoiceLastLevel = normalizedVoiceLevel;
            const levelChangedForUi = Math.abs(normalizedVoiceLevel - groupLocalVoiceLastUiLevel) > 0.045;
            if (levelChangedForUi) {
              groupLocalVoiceLastUiLevel = normalizedVoiceLevel;
            }
            upsertGroupParticipant(
              activeCall,
              currentUserId,
              currentUserDisplayName || workspaceUserName.textContent || "You",
              Boolean(activeCall.isMuted),
              isSpeakingNow,
              normalizedVoiceLevel
            );
            const state = groupCallStateByDialog.get(activeCall.dialogId);
            if (state) {
              if (!(state.participantIds instanceof Set)) {
                state.participantIds = new Set();
              }
              state.participantIds.add(currentUserId);
              if (state.participantLastSeenAtMap instanceof Map) {
                state.participantLastSeenAtMap.set(currentUserId, Date.now());
              }
              state.participantCount = state.participantIds.size;
              groupCallStateByDialog.set(activeCall.dialogId, state);
            }
            const nowTs = Date.now();
            const levelChangedForPresence = Math.abs(normalizedVoiceLevel - groupLocalVoiceLastLevelSent) > 0.08;
            if (speakingChanged || levelChangedForPresence || (nowTs - groupLocalVoiceLastPresenceSentAt) > 820) {
              groupLocalVoiceLastPresenceSentAt = nowTs;
              groupLocalVoiceLastLevelSent = normalizedVoiceLevel;
              sendCallRealtime({
                type: "call_presence",
                mode: "group",
                callId: activeCall.callId,
                dialogId: activeCall.dialogId,
                dialogPublicId: activeCall.dialogPublicId,
                participantUserId: currentUserId,
                participantName: currentUserDisplayName || workspaceUserName.textContent || "You",
                isMuted: Boolean(activeCall.isMuted),
                isSpeaking: isSpeakingNow,
                voiceLevel: normalizedVoiceLevel
              });
            }
            if (activeCall.mode === "group") {
              setCallVoiceLevel(activeCall.isMuted ? 0.06 : Math.max(0.12, normalizedVoiceLevel));
            }
            if (speakingChanged || levelChangedForUi) {
              syncCallUi();
            }
          }, 220);
        } catch (error) {
          warnCall("group_local_voice_meter_start_failed", {
            error: error instanceof Error ? error.message : String(error)
          });
        }
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


`;
