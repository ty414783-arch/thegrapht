export const callSignaling = () => `
      const createGroupPeerConnection = (call, peerUserId, peerName = "User") => {
        if (!call || call.mode !== "group" || !peerUserId) {
          return null;
        }
        if (!(call.groupPeerConnections instanceof Map)) {
          call.groupPeerConnections = new Map();
        }
        const existing = call.groupPeerConnections.get(peerUserId);
        if (existing?.peerConnection) {
          return existing.peerConnection;
        }
        const iceServers = parseRtcIceServers();
        const peerConnection = new RTCPeerConnection({
          iceServers,
          iceCandidatePoolSize: 10
        });
        if (call.localStream) {
          call.localStream.getTracks().forEach((track) => {
            try {
              peerConnection.addTrack(track, call.localStream);
            } catch {}
          });
        }
        call.groupPeerConnections.set(peerUserId, {
          peerConnection,
          peerUserId,
          peerName: String(peerName || "User"),
          offerSent: false
        });

        peerConnection.onicecandidate = (event) => {
          if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== call.callId) {
            return;
          }
          if (!event.candidate) {
            return;
          }
          sendCallRealtime({
            type: "call_candidate",
            mode: "group",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            targetUserId: peerUserId,
            candidate: event.candidate
          });
        };

        peerConnection.ontrack = (event) => {
          if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== call.callId) {
            return;
          }
          if (!(call.groupRemoteAudioNodes instanceof Map)) {
            call.groupRemoteAudioNodes = new Map();
          }
          let audioNode = call.groupRemoteAudioNodes.get(peerUserId);
          if (!audioNode) {
            audioNode = new Audio();
            audioNode.autoplay = true;
            audioNode.controls = false;
            audioNode.style.display = "none";
            document.body.appendChild(audioNode);
            call.groupRemoteAudioNodes.set(peerUserId, audioNode);
          }
          audioNode.srcObject = event.streams?.[0] || null;
          try {
            const playPromise = audioNode.play();
            if (playPromise?.catch) {
              playPromise.catch(() => {});
            }
          } catch {}
        };

        peerConnection.onconnectionstatechange = () => {
          const state = peerConnection.connectionState;
          if (state === "failed" || state === "closed" || state === "disconnected") {
            const entry = call.groupPeerConnections.get(peerUserId);
            if (entry?.peerConnection === peerConnection) {
              call.groupPeerConnections.delete(peerUserId);
            }
          }
        };

        return peerConnection;
      };

      const maybeStartGroupPeerNegotiation = async (call, peerUserId, peerName = "User") => {
        if (!call || call.mode !== "group" || !peerUserId || peerUserId === currentUserId) {
          return;
        }
        const selfId = String(currentUserId || "");
        const targetId = String(peerUserId || "");
        if (!selfId || !targetId) {
          return;
        }
        const shouldInitiate = selfId.localeCompare(targetId) > 0;
        const peerConnection = createGroupPeerConnection(call, peerUserId, peerName);
        if (!peerConnection) {
          return;
        }
        const entry = call.groupPeerConnections.get(peerUserId);
        if (!shouldInitiate || entry?.offerSent) {
          return;
        }
        try {
          const offer = await buildOfferWithVoiceProfile(peerConnection);
          await peerConnection.setLocalDescription(offer);
          entry.offerSent = true;
          call.groupPeerConnections.set(peerUserId, entry);
          sendCallRealtime({
            type: "call_invite",
            mode: "group",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            targetUserId: peerUserId,
            callerName: currentUserDisplayName || workspaceUserName.textContent || "TheGraphT",
            offer
          });
        } catch (error) {
          warnCall("group_offer_failed", {
            peerUserId,
            error: error instanceof Error ? error.message : String(error)
          });
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
          dialogId: payload.dialogId,
          active: typeof payload.active === "boolean" ? payload.active : undefined,
          reason: payload.reason || ""
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
        rememberRecentlyClosedCall(activeCall.dialogId, activeCall.callId);
        clearCallTimers();
        closeExpandedScreenPreview();
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
        try {
          peerConnection.addTransceiver("video", { direction: "sendrecv" });
        } catch {}
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
            kind: event.track?.kind || "",
            streamCount: event.streams?.length || 0,
            track: getDebugTrackState(event.track || null),
            streams: Array.from(event.streams || []).map(getDebugStreamState)
          });
          logCallVideoDebug("ontrack", {
            incomingTrack: getDebugTrackState(event.track || null),
            incomingStreams: Array.from(event.streams || []).map(getDebugStreamState)
          });
          if (!event.track) {
            return;
          }
          const stream = event.streams?.[0] || new MediaStream([event.track]);
          if (event.track?.kind === "audio") {
            const audio = ensureRemoteAudioNode();
            audio.srcObject = stream;
            startCallVoiceMeter(stream);
            try {
              const playPromise = audio.play();
              if (playPromise?.catch) {
                playPromise.catch(() => {});
              }
            } catch {}
            return;
          }
          if (event.track?.kind === "video" && activeCall && activeCall.callId === call.callId) {
            const applyRemoteVideoTrack = () => {
              logCallVideoDebug("remote_video_apply_attempt", {
                incomingTrack: getDebugTrackState(event.track),
                incomingStream: getDebugStreamState(stream)
              });
              if (!activeCall || activeCall.callId !== call.callId) {
                return;
              }
              if (event.track.readyState === "ended" || event.track.muted) {
                logCallVideoDebug("remote_video_apply_skipped", {
                  reason: event.track.readyState === "ended" ? "ended" : "muted",
                  incomingTrack: getDebugTrackState(event.track)
                });
                return;
              }
              if (activeCall.remoteVideoStream !== stream) {
                activeCall.remoteVideoFrameReady = false;
              }
              activeCall.remoteVideoStream = stream;
              // Treat a live/unmuted inbound track as frame-ready to avoid
              // placeholder flicker while the element refreshes metadata.
              if (event.track.readyState === "live" && !event.track.muted) {
                activeCall.remoteVideoFrameReady = true;
              }
              logCallVideoDebug("remote_video_applied", {
                incomingTrack: getDebugTrackState(event.track),
                incomingStream: getDebugStreamState(stream)
              });
              syncCallVideoStage();
            };
            const clearRemoteVideoTrack = () => {
              logCallVideoDebug("remote_video_clear_attempt", {
                incomingTrack: getDebugTrackState(event.track)
              });
              if (!activeCall || activeCall.callId !== call.callId) {
                return;
              }
              const currentStream = activeCall.remoteVideoStream;
              const currentTrack = currentStream instanceof MediaStream
                ? currentStream.getVideoTracks()[0] || null
                : null;
              if (currentTrack && currentTrack !== event.track) {
                logCallVideoDebug("remote_video_clear_skipped", {
                  reason: "different_current_track",
                  incomingTrack: getDebugTrackState(event.track),
                  currentTrack: getDebugTrackState(currentTrack)
                });
                return;
              }
              activeCall.remoteVideoStream = null;
              activeCall.remoteVideoFrameReady = false;
              activeCall.remoteVisualKind = "none";
              if (activeCall.remoteScreenSharing) {
                activeCall.remoteScreenSharing = false;
                activeCall.screenOwnerUserId = "";
              }
              logCallVideoDebug("remote_video_cleared", {
                incomingTrack: getDebugTrackState(event.track)
              });
              syncCallVideoStage();
              syncCallUi();
            };
            const clearRemoteVideoTrackWithGrace = () => {
              if (!activeCall || activeCall.callId !== call.callId) {
                return;
              }
              if (activeCall.remoteVideoMuteGraceTimer) {
                window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
              }
              activeCall.remoteVideoMuteGraceTimer = window.setTimeout(() => {
                if (!activeCall || activeCall.callId !== call.callId) {
                  return;
                }
                activeCall.remoteVideoMuteGraceTimer = null;
                const currentStream = activeCall.remoteVideoStream;
                const currentTrack = currentStream instanceof MediaStream
                  ? currentStream.getVideoTracks()[0] || null
                  : null;
                if (currentTrack && currentTrack.readyState === "live" && !currentTrack.muted) {
                  logCallVideoDebug("remote_video_clear_grace_skipped", {
                    reason: "track_recovered",
                    currentTrack: getDebugTrackState(currentTrack)
                  });
                  return;
                }
                clearRemoteVideoTrack();
              }, 1600);
            };
            if (!event.track.muted && event.track.readyState === "live") {
              applyRemoteVideoTrack();
            } else {
              syncCallVideoStage();
            }
            event.track.onunmute = () => {
              if (activeCall?.remoteVideoMuteGraceTimer) {
                window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
                activeCall.remoteVideoMuteGraceTimer = null;
              }
              logCallVideoDebug("track_onunmute", {
                incomingTrack: getDebugTrackState(event.track)
              });
              applyRemoteVideoTrack();
            };
            event.track.onmute = () => {
              logCallVideoDebug("track_onmute", {
                incomingTrack: getDebugTrackState(event.track)
              });
              clearRemoteVideoTrackWithGrace();
            };
            event.track.onended = () => {
              if (activeCall?.remoteVideoMuteGraceTimer) {
                window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
                activeCall.remoteVideoMuteGraceTimer = null;
              }
              logCallVideoDebug("track_onended", {
                incomingTrack: getDebugTrackState(event.track)
              });
              clearRemoteVideoTrack();
            };
          }
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
          if (
            activeCall
            && activeCall.callId === call.callId
            && activeCall.mode !== "group"
            && peerConnection.signalingState === "stable"
            && activeCall.pendingVisualRenegotiationReason
          ) {
            const retryReason = activeCall.pendingVisualRenegotiationReason;
            activeCall.pendingVisualRenegotiationReason = "";
            if (activeCall.visualRenegotiateRetryTimer) {
              window.clearTimeout(activeCall.visualRenegotiateRetryTimer);
              activeCall.visualRenegotiateRetryTimer = null;
            }
            void renegotiateDirectVisualTrack(activeCall, retryReason);
          }
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


      const updateVisualSenderTrack = async (call, track) => {
        if (!call?.peerConnection) {
          return;
        }
        logCallVideoDebug("update_visual_sender_start", {
          targetCallId: call.callId,
          nextTrack: getDebugTrackState(track)
        });
        const sender = call.peerConnection.getSenders().find((entry) => (
          entry.track?.kind === "video"
          || call.peerConnection.getTransceivers().some((transceiver) => (
            transceiver.sender === entry && transceiver.receiver?.track?.kind === "video"
          ))
        ));
        if (sender) {
          await sender.replaceTrack(track || null);
          logCallVideoDebug("update_visual_sender_replaced", {
            targetCallId: call.callId,
            nextTrack: getDebugTrackState(track),
            senderTrack: getDebugTrackState(sender.track)
          });
          return;
        }
        if (track) {
          const videoTransceiver = call.peerConnection.getTransceivers().find((transceiver) => (
            transceiver.receiver?.track?.kind === "video"
          ));
          if (videoTransceiver?.sender) {
            await videoTransceiver.sender.replaceTrack(track);
            logCallVideoDebug("update_visual_sender_transceiver_replaced", {
              targetCallId: call.callId,
              nextTrack: getDebugTrackState(track),
              senderTrack: getDebugTrackState(videoTransceiver.sender.track)
            });
            return;
          }
          call.peerConnection.addTrack(track, new MediaStream([track]));
          logCallVideoDebug("update_visual_sender_added_track", {
            targetCallId: call.callId,
            nextTrack: getDebugTrackState(track)
          });
        }
      };

      const renegotiateDirectVisualTrack = async (call, reason) => {
        if (!call?.peerConnection || call.mode === "group") {
          return;
        }
        if (call.peerConnection.signalingState !== "stable") {
          call.pendingVisualRenegotiationReason = reason || "visual_update";
          if (!call.visualRenegotiateRetryTimer) {
            call.visualRenegotiateRetryTimer = window.setTimeout(() => {
              if (!activeCall || activeCall.callId !== call.callId) {
                return;
              }
              call.visualRenegotiateRetryTimer = null;
              const retryReason = call.pendingVisualRenegotiationReason || reason || "visual_update";
              call.pendingVisualRenegotiationReason = "";
              void renegotiateDirectVisualTrack(call, retryReason);
            }, 220);
          }
          logCallVideoDebug("renegotiate_visual_skipped", {
            reason,
            signalingState: call.peerConnection.signalingState
          });
          return;
        }
        try {
          const offer = await buildOfferWithVoiceProfile(call.peerConnection);
          await call.peerConnection.setLocalDescription(offer);
          logCallVideoDebug("renegotiate_visual_offer_created", {
            reason,
            sdpType: offer.type
          });
          sendCallRealtime({
            type: "call_invite",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            callerName: currentUserDisplayName || workspaceUserName.textContent || "TheGraphT",
            fingerprintEmojis: call.fingerprintEmojis || [],
            offer,
            renegotiate: true,
            reason
          });
          call.pendingVisualRenegotiationReason = "";
        } catch (error) {
          warnCall("renegotiate_visual_failed", {
            reason,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const requestDirectScreenResync = async (call, trigger = "remote_screen_state") => {
        if (!call || call.mode === "group" || !call.peerConnection) {
          return;
        }
        if (call.screenEnabled) {
          return;
        }
        const hasRemoteTrack = call.remoteVideoStream instanceof MediaStream
          && (call.remoteVideoStream.getVideoTracks()[0]?.readyState === "live");
        if (hasRemoteTrack) {
          return;
        }
        await renegotiateDirectVisualTrack(call, "screen_resync:" + String(trigger || "state"));
      };

      const stopDirectVisualStream = async (call, { notify = true, stopReason = "" } = {}) => {
        if (!call || call.mode === "group") {
          return;
        }
        logCallVideoDebug("stop_direct_visual_start", {
          notify,
          stopReason,
          targetCallId: call.callId,
          localVisualStream: getDebugStreamState(call.localVisualStream)
        });
        if (call.visualTrackStopBound) {
          call.visualTrackStopBound.onended = null;
          call.visualTrackStopBound = null;
        }
        if (call.localVisualStream instanceof MediaStream) {
          call.localVisualStream.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
        }
        call.localVisualStream = null;
        call.cameraEnabled = false;
        call.screenEnabled = false;
        call.screenOwnerUserId = "";
        call.remoteVisualKind = "none";
        try {
          await updateVisualSenderTrack(call, null);
        } catch {}
        await renegotiateDirectVisualTrack(call, "visual_stop");
        if (notify) {
          sendCallRealtime({
            type: "call_screen_state",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            active: false
          });
        }
        logCallVideoDebug("stop_direct_visual_done", {
          notify,
          stopReason,
          targetCallId: call.callId
        });
        syncCallVideoStage();
      };

      const startDirectCamera = async (call) => {
        if (!call || call.mode === "group") {
          return false;
        }
        const wasScreenSharing = Boolean(call.screenEnabled);
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const cameraTrack = cameraStream.getVideoTracks()[0];
        if (!cameraTrack) {
          return false;
        }
        logCallVideoDebug("start_camera_track_acquired", {
          cameraStream: getDebugStreamState(cameraStream),
          cameraTrack: getDebugTrackState(cameraTrack)
        });
        if (call.visualTrackStopBound) {
          call.visualTrackStopBound.onended = null;
          call.visualTrackStopBound = null;
        }
        if (call.localVisualStream instanceof MediaStream) {
          call.localVisualStream.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
        }
        await updateVisualSenderTrack(call, cameraTrack);
        call.localVisualStream = cameraStream;
        call.visualTrackStopBound = cameraTrack;
        call.cameraEnabled = true;
        call.screenEnabled = false;
        call.screenOwnerUserId = "";
        call.remoteVisualKind = "camera";
        if (wasScreenSharing) {
          sendCallRealtime({
            type: "call_screen_state",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            active: false
          });
        }
        await renegotiateDirectVisualTrack(call, "camera_start");
        logCallVideoDebug("start_camera_done", {
          wasScreenSharing,
          cameraStream: getDebugStreamState(cameraStream),
          cameraTrack: getDebugTrackState(cameraTrack)
        });
        cameraTrack.onended = () => {
          if (activeCall && activeCall.callId === call.callId) {
            logCallVideoDebug("local_camera_track_ended", {
              endedTrack: getDebugTrackState(cameraTrack)
            });
            void stopDirectVisualStream(call, { stopReason: "local_camera_track_ended" });
            syncCallUi();
          }
        };
        syncCallVideoStage();
        return true;
      };

      const startDirectScreenShare = async (call) => {
        if (!call || call.mode === "group") {
          return false;
        }
        const wasScreenSharing = Boolean(call.screenEnabled);
        if (call.remoteScreenSharing && call.screenOwnerUserId && call.screenOwnerUserId !== currentUserId) {
          showToast("The other user is already sharing the screen.", "error");
          return false;
        }
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (!screenTrack) {
          return false;
        }
        logCallVideoDebug("start_screen_track_acquired", {
          screenStream: getDebugStreamState(screenStream),
          screenTrack: getDebugTrackState(screenTrack)
        });
        if (call.visualTrackStopBound) {
          call.visualTrackStopBound.onended = null;
          call.visualTrackStopBound = null;
        }
        if (call.localVisualStream instanceof MediaStream) {
          call.localVisualStream.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
        }
        await updateVisualSenderTrack(call, screenTrack);
        call.localVisualStream = screenStream;
        call.visualTrackStopBound = screenTrack;
        call.cameraEnabled = false;
        call.screenEnabled = true;
        call.remoteScreenSharing = false;
        call.screenOwnerUserId = currentUserId;
        call.remoteVisualKind = "screen";
        if (wasScreenSharing) {
          sendCallRealtime({
            type: "call_screen_state",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            active: false
          });
        }
        screenTrack.onended = () => {
          if (activeCall && activeCall.callId === call.callId) {
            logCallVideoDebug("local_screen_track_ended", {
              endedTrack: getDebugTrackState(screenTrack)
            });
            void stopDirectVisualStream(call, { stopReason: "local_screen_track_ended" });
            syncCallUi();
          }
        };
        sendCallRealtime({
          type: "call_screen_state",
          callId: call.callId,
          dialogId: call.dialogId,
          dialogPublicId: call.dialogPublicId,
          active: true
        });
        await renegotiateDirectVisualTrack(call, "screen_start");
        logCallVideoDebug("start_screen_done", {
          wasScreenSharing,
          screenStream: getDebugStreamState(screenStream),
          screenTrack: getDebugTrackState(screenTrack)
        });
        syncCallVideoStage();
        return true;
      };


      const toggleDirectCallCamera = async () => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        if (activeCall.cameraEnabled) {
          await stopDirectVisualStream(activeCall);
          syncCallUi();
          return;
        }
        try {
          const started = await startDirectCamera(activeCall);
          if (started) {
            syncCallUi();
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to enable camera.", "error");
        }
      };

      const toggleDirectCallScreenShare = async () => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        if (activeCall.screenEnabled) {
          await stopDirectVisualStream(activeCall);
          syncCallUi();
          return;
        }
        try {
          const started = await startDirectScreenShare(activeCall);
          if (started) {
            syncCallUi();
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to start screen share.", "error");
        }
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
          const notificationAvatarUrl = String(call?.peerAvatarUrl || "").trim()
            || resolveDialogAvatarUrlForDirectCall(call)
            || getAvatarMeta(
              call?.peerId || call?.dialogId || call?.peerName || "?",
              call?.peerName || "?"
            ).avatarUrl;
          const notification = new Notification(call.peerName + " is calling you", {
            body: "Tap to open the call",
            icon: notificationAvatarUrl,
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
            peerAvatarUrl: currentDialogSnapshot.avatarUrl || "",
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
            miniPosition: null,
            cameraEnabled: false,
            screenEnabled: false,
            localVisualStream: null,
            remoteVideoStream: null,
            remoteVideoFrameReady: false,
            remoteVisualKind: "none",
            remoteScreenSharing: false,
            screenOwnerUserId: "",
            remoteMuted: false,
            visualTrackStopBound: null,
            visualRenegotiateRetryTimer: null,
            pendingVisualRenegotiationReason: "",
            screenResyncTimer: null,
            remoteVideoMuteGraceTimer: null
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
          startCallTicker();
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
            callerAvatarUrl: String(currentUserAvatarUrl || "").trim(),
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

      const upsertGroupParticipant = (call, userId, name, isMuted, isSpeaking, voiceLevel = 0) => {
        if (!call.groupParticipants) {
          call.groupParticipants = new Map();
        }
        call.groupParticipants.set(userId, {
          userId,
          name,
          isMuted: Boolean(isMuted),
          isSpeaking: Boolean(isSpeaking),
          voiceLevel: clampVoiceLevel(voiceLevel)
        });
      };

      const beginGroupVideoCall = async () => {
        if (!isPrimaryActiveTab) {
          showToast("Another tab is active. Close other tabs to control calls here.", "error");
          return;
        }
        if (!currentDialogSnapshot || currentDialogSnapshot.type !== "group") {
          return;
        }
        if (activeCall) {
          showToast("Finish the current call first.", "error");
          return;
        }

        try {
          const localStream = await ensureCallLocalStream("");
          localStream.getAudioTracks().forEach((track) => {
            track.enabled = false;
          });
          const callId = (groupCallStateByDialog.get(currentDialogSnapshot.id)?.callId) || createCallId();
          const existingState = groupCallStateByDialog.get(currentDialogSnapshot.id) || null;
          const startedByCurrentUser = !existingState;

          activeCall = {
            callId,
            dialogId: currentDialogSnapshot.id,
            dialogPublicId: currentDialogSnapshot.publicId,
            peerId: currentDialogSnapshot.publicId || "",
            peerName: currentDialogSnapshot.title || "Group",
            status: "connecting",
            direction: "outgoing",
            mode: "group",
            startedByUserId: startedByCurrentUser ? currentUserId : (existingState?.starterUserId || ""),
            localStream,
            peerConnection: null,
            connectedAt: Date.now(),
            isMuted: true,
            inputDeviceId: "",
            outputDeviceId: "",
            pendingCandidates: [],
            minimized: false,
            miniHidden: false,
            miniPosition: null,
            groupParticipants: new Map(),
            groupPeerConnections: new Map(),
            groupRemoteAudioNodes: new Map()
          };
          upsertGroupParticipant(
            activeCall,
            currentUserId,
            currentUserDisplayName || workspaceUserName.textContent || "You",
            true,
            false,
            0
          );
          groupCallStateByDialog.set(activeCall.dialogId, {
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            title: activeCall.peerName,
            status: "connecting",
            starterUserId: activeCall.startedByUserId || currentUserId,
            startedAtMs: Number(existingState?.startedAtMs) || Date.now(),
            participantLastSeenAtMap: new Map([[currentUserId, Date.now()]]),
            participantIds: new Set([currentUserId]),
            participantCount: 1
          });
          ensureGroupCallPresencePruneTimer();
          if (startedByCurrentUser && postedGroupStartByDialog.get(activeCall.dialogId) !== activeCall.callId) {
            sendCallRealtime({
              type: "call_invite",
              mode: "group",
              callId: activeCall.callId,
              dialogId: activeCall.dialogId,
              dialogPublicId: activeCall.dialogPublicId,
              callerName: currentUserDisplayName || workspaceUserName.textContent || "TheGraphT",
              startedAtMs: Number(groupCallStateByDialog.get(activeCall.dialogId)?.startedAtMs) || Date.now(),
              summarySenderUserId: currentUserId,
              summaryBody: buildGroupCallMarker("started_video")
            });
            postedGroupStartByDialog.set(activeCall.dialogId, activeCall.callId);
          }
          sendCallRealtime({
            type: "call_presence",
            mode: "group",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            participantUserId: currentUserId,
            participantName: currentUserDisplayName || workspaceUserName.textContent || "You",
            isMuted: true,
            isSpeaking: false,
            voiceLevel: 0
          });
          syncCallUi();
          startGroupLocalVoiceMeter(activeCall);

          window.setTimeout(() => {
            if (!activeCall || activeCall.mode !== "group") {
              return;
            }
            activeCall.status = "active";
            startCallTicker();
            const state = groupCallStateByDialog.get(activeCall.dialogId);
            if (state) {
              state.status = "active";
              groupCallStateByDialog.set(activeCall.dialogId, state);
            }
            syncCallUi();
          }, 1100);
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to start group call.", "error");
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
          broadcastCallAcceptedAcrossTabs(activeCall);
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
        if (call.mode === "group") {
          openGroupLeaveModal();
          return;
        }

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

      const confirmLeaveGroupCall = async ({ endForEveryone = false } = {}) => {
        if (!activeCall || activeCall.mode !== "group") {
          closeGroupLeaveModal();
          return;
        }
        const call = activeCall;
        closeGroupLeaveModal();

        sendCallRealtime({
          type: "call_leave",
          mode: "group",
          callId: call.callId,
          dialogId: call.dialogId,
          dialogPublicId: call.dialogPublicId,
          participantUserId: currentUserId
        });
        const stateBeforeLeave = groupCallStateByDialog.get(call.dialogId);
        if (stateBeforeLeave && stateBeforeLeave.participantIds instanceof Set) {
          stateBeforeLeave.participantIds.delete(currentUserId);
          stateBeforeLeave.participantCount = stateBeforeLeave.participantIds.size;
          groupCallStateByDialog.set(call.dialogId, stateBeforeLeave);
          syncGroupCallBanner();
        }

        if (endForEveryone) {
          const state = groupCallStateByDialog.get(call.dialogId);
          const summarySenderUserId = state?.starterUserId || call.startedByUserId || currentUserId;
          const elapsedSeconds = getGroupCallElapsedSecondsForCall(call);
          sendCallRealtime({
            type: "call_end",
            mode: "group",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            reason: "ended_video",
            durationSeconds: elapsedSeconds,
            summarySenderUserId,
            summaryBody: buildGroupCallMarker("ended_video", elapsedSeconds)
          });
          groupCallStateByDialog.delete(call.dialogId);
          postedGroupStartByDialog.delete(call.dialogId);
        }

        await finishActiveCall({ summaryBody: "", remoteEnded: false });
      };

      const handleCallInvite = async (payload) => {
        logCall("realtime_receive_call_invite", {
          callId: payload?.callId,
          dialogId: payload?.dialogId,
          senderUserId: payload?.senderUserId
        });
        if (!payload?.callId || !payload?.dialogId) {
          warnCall("call_invite_ignored_invalid_payload", { payload });
          return;
        }
        if (isRecentlyClosedCall(payload.dialogId, payload.callId)) {
          sendCallRealtime({
            type: "call_reject",
            callId: payload.callId,
            dialogId: payload.dialogId,
            dialogPublicId: payload.dialogPublicId || "",
            reason: "stale"
          });
          return;
        }

        const dialog = getDialogByIdLocal(payload.dialogId) || currentDialogSnapshot;
        if (!dialog || dialog.type !== "group" && payload.mode === "group") {
          return;
        }

        if (payload.mode === "group") {
          if (payload.targetUserId && payload.targetUserId !== currentUserId) {
            return;
          }
          const wasKnownGroupState = groupCallStateByDialog.has(payload.dialogId);
          groupCallStateByDialog.set(payload.dialogId, {
            callId: payload.callId,
            dialogId: payload.dialogId,
            title: dialog?.title || "Group video chat",
            status: "connecting",
            starterUserId: payload.senderUserId || "",
            startedAtMs: Number(payload.startedAtMs) || Date.now(),
            participantLastSeenAtMap: new Map(payload.senderUserId ? [[payload.senderUserId, Date.now()]] : []),
            participantIds: new Set(payload.senderUserId ? [payload.senderUserId] : []),
            participantCount: payload.senderUserId ? 1 : 0
          });
          ensureGroupCallPresencePruneTimer();
          syncGroupCallBanner();
          if (
            !wasKnownGroupState
            && payload.senderUserId !== currentUserId
            && !payload.offer
          ) {
            try {
              if (typeof showToast === "function") {
                showToast("Group call started in " + String(dialog?.title || "group"), "info");
              }
            } catch {}
            try {
              if (typeof isWindowInactive === "function" && typeof isNotificationOwner === "function" && isWindowInactive() && isNotificationOwner()) {
                const permission = await ensureNotificationPermission();
                if (permission === "granted") {
                  const notification = new Notification("Group call started", {
                    body: String(dialog?.title || "Group"),
                    icon: typeof buildNotificationAvatarUrl === "function"
                      ? buildNotificationAvatarUrl(dialog, String(dialog?.title || "Group"))
                      : undefined,
                    badge: "/assets/logo.jpg",
                    tag: "group_call_started_" + String(payload.dialogId || ""),
                    renotify: false
                  });
                  notification.onclick = () => {
                    try { window.focus(); } catch {}
                    try { restoreCallModal(); } catch {}
                    try { notification.close(); } catch {}
                  };
                }
              }
            } catch {}
          }
          if (!activeCall || activeCall.mode !== "group" || activeCall.dialogId !== payload.dialogId || !payload.offer) {
            return;
          }
          const peerUserId = payload.senderUserId || "";
          if (!peerUserId || peerUserId === currentUserId) {
            return;
          }
          try {
            const peerConnection = createGroupPeerConnection(activeCall, peerUserId, payload.callerName || "User");
            await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
            const answer = await buildAnswerWithVoiceProfile(peerConnection);
            await peerConnection.setLocalDescription(answer);
            sendCallRealtime({
              type: "call_accept",
              mode: "group",
              callId: payload.callId,
              dialogId: payload.dialogId,
              dialogPublicId: payload.dialogPublicId || activeCall.dialogPublicId || "",
              targetUserId: peerUserId,
              answer
            });
          } catch (error) {
            warnCall("group_answer_failed", {
              peerUserId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
          return;
        }

        if (!payload.offer) {
          warnCall("call_invite_ignored_missing_offer", { payload });
          return;
        }

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
          if (payload.renegotiate && payload.offer && activeCall.callId === payload.callId && activeCall.peerConnection) {
            try {
              if (payload.reason === "screen_start") {
                activeCall.remoteVisualKind = "screen";
                activeCall.remoteScreenSharing = true;
                activeCall.screenOwnerUserId = String(payload.senderUserId || activeCall.screenOwnerUserId || "");
              } else if (payload.reason === "camera_start") {
                activeCall.remoteVisualKind = "camera";
                activeCall.remoteScreenSharing = false;
                activeCall.screenOwnerUserId = "";
              } else if (payload.reason === "visual_stop") {
                activeCall.remoteVisualKind = "none";
                activeCall.remoteVideoStream = null;
                activeCall.remoteVideoFrameReady = false;
                activeCall.remoteScreenSharing = false;
                activeCall.screenOwnerUserId = "";
              }
              syncCallVideoStage();
              syncCallUi();
              logCallVideoDebug("renegotiate_visual_offer_received", {
                reason: payload.reason || "",
                sdpType: payload.offer?.type || ""
              });
              await activeCall.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
              const answer = await buildAnswerWithVoiceProfile(activeCall.peerConnection);
              await activeCall.peerConnection.setLocalDescription(answer);
              sendCallRealtime({
                type: "call_accept",
                callId: activeCall.callId,
                dialogId: activeCall.dialogId,
                dialogPublicId: activeCall.dialogPublicId || "",
                answer,
                renegotiate: true,
                reason: payload.reason || ""
              });
              logCallVideoDebug("renegotiate_visual_answer_sent", {
                reason: payload.reason || "",
                sdpType: answer.type
              });
            } catch (error) {
              warnCall("renegotiate_visual_offer_failed", {
                reason: payload.reason || "",
                error: error instanceof Error ? error.message : String(error)
              });
            }
          }
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
          peerAvatarUrl: String(payload.callerAvatarUrl || "") || resolveDirectPeerAvatarByUserId(payload.senderUserId) || dialog?.avatarUrl || "",
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
          miniPosition: null,
          cameraEnabled: false,
          screenEnabled: false,
          localVisualStream: null,
          remoteVideoStream: null,
          remoteVideoFrameReady: false,
          remoteVisualKind: "none",
          remoteScreenSharing: false,
          screenOwnerUserId: "",
          remoteMuted: false,
          visualTrackStopBound: null,
          visualRenegotiateRetryTimer: null,
          pendingVisualRenegotiationReason: "",
          screenResyncTimer: null,
          remoteVideoMuteGraceTimer: null
        };
        activeCall.fingerprintEmojis = sanitizeFingerprintEmojis(payload.fingerprintEmojis);

        if (claimCallRingtonePlayback(payload.callId)) {
          startIncomingCallRingtone();
        }
        startCallTicker();
        syncCallUi();
        armCallSetupTimeout(payload.callId, "missed");
        await showIncomingCallNotification(activeCall);
      };

      const handleCallAccept = async (payload) => {
        logCall("realtime_receive_call_accept", {
          callId: payload?.callId,
          dialogId: payload?.dialogId
        });
        if (payload?.mode === "group") {
          if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== payload.callId) {
            return;
          }
          if (payload.targetUserId && payload.targetUserId !== currentUserId) {
            return;
          }
          const peerUserId = payload.senderUserId || "";
          if (!peerUserId || !payload.answer) {
            return;
          }
          const entry = activeCall.groupPeerConnections instanceof Map
            ? activeCall.groupPeerConnections.get(peerUserId)
            : null;
          if (!entry?.peerConnection) {
            return;
          }
          try {
            await entry.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
          } catch (error) {
            warnCall("group_set_remote_answer_failed", {
              peerUserId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
          return;
        }
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
          logCallVideoDebug("call_accept_received", {
            renegotiate: Boolean(payload.renegotiate),
            reason: payload.reason || "",
            sdpType: payload.answer?.type || ""
          });
          await activeCall.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
          if (!payload.renegotiate) {
            activeCall.status = "connecting";
          }
          stopCallRingtone();
          logCall("remote_answer_set", {
            callId: activeCall.callId,
            sdpType: payload.answer?.type,
            renegotiate: Boolean(payload.renegotiate),
            reason: payload.reason || ""
          });
          if (!payload.renegotiate) {
            armCallSetupTimeout(activeCall.callId, "no_connect");
          }

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
        if (payload?.mode === "group") {
          if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== payload.callId) {
            return;
          }
          if (payload.targetUserId && payload.targetUserId !== currentUserId) {
            return;
          }
          const peerUserId = payload.senderUserId || "";
          const entry = activeCall.groupPeerConnections instanceof Map
            ? activeCall.groupPeerConnections.get(peerUserId)
            : null;
          if (!entry?.peerConnection || !payload.candidate) {
            return;
          }
          try {
            await entry.peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (error) {
            warnCall("group_add_ice_failed", {
              peerUserId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
          return;
        }
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
        rememberRecentlyClosedCall(payload?.dialogId, payload?.callId);
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

      const handleCallPresence = async (payload) => {
        if (!payload?.callId || !payload?.dialogId || payload?.mode !== "group") {
          return;
        }
        const knownDialog = getDialogByIdLocal(payload.dialogId) || (currentDialogSnapshot?.id === payload.dialogId ? currentDialogSnapshot : null);
        if (!knownDialog || knownDialog.type !== "group") {
          return;
        }
        const state = groupCallStateByDialog.get(payload.dialogId) || {
          callId: payload.callId,
          dialogId: payload.dialogId,
          title: currentDialogSnapshot?.id === payload.dialogId ? (currentDialogSnapshot?.title || "Group video chat") : "Group video chat",
          status: "active",
          starterUserId: payload.senderUserId || "",
          startedAtMs: Number(payload.startedAtMs) || Date.now(),
          participantLastSeenAtMap: new Map(),
          participantIds: new Set(),
          participantCount: 0
        };
        if (!(state.participantIds instanceof Set)) {
          state.participantIds = new Set();
        }
        if (!(state.participantLastSeenAtMap instanceof Map)) {
          state.participantLastSeenAtMap = new Map();
        }
        const participantUserId = payload.participantUserId || payload.senderUserId || "";
        if (participantUserId) {
          state.participantIds.add(participantUserId);
          state.participantLastSeenAtMap.set(participantUserId, Date.now());
        }
        state.status = "active";
        state.participantCount = state.participantIds.size;
        state.callId = payload.callId || state.callId;
        groupCallStateByDialog.set(payload.dialogId, state);
        ensureGroupCallPresencePruneTimer();
        pruneStaleGroupCallParticipants();

        if (!activeCall || activeCall.mode !== "group" || activeCall.dialogId !== payload.dialogId) {
          syncGroupCallBanner();
          return;
        }
        if (activeCall.callId !== payload.callId) {
          activeCall.callId = payload.callId;
        }
        if (activeCall.status !== "active") {
          activeCall.status = "active";
        }
        startCallTicker();
        const participantUserIdForCall = payload.participantUserId || payload.senderUserId || "";
        const participantMuted = Boolean(payload.isMuted);
        const participantSpeaking = participantMuted ? false : true;
        const participantVoiceLevel = participantMuted ? 0 : clampVoiceLevel(payload.voiceLevel);
        upsertGroupParticipant(
          activeCall,
          participantUserIdForCall,
          payload.participantName || "User",
          participantMuted,
          participantSpeaking,
          participantVoiceLevel
        );
        if (participantUserIdForCall && participantUserIdForCall !== currentUserId) {
          void maybeStartGroupPeerNegotiation(activeCall, participantUserIdForCall, payload.participantName || "User");
        }
        syncCallUi();
      };

      const handleCallLeave = async (payload) => {
        if (!payload?.callId || payload?.mode !== "group") {
          return;
        }
        const state = payload?.dialogId ? groupCallStateByDialog.get(payload.dialogId) : null;
        if (state && state.participantIds instanceof Set) {
          const participantUserId = payload.participantUserId || payload.senderUserId || "";
          if (participantUserId) {
            state.participantIds.delete(participantUserId);
            if (state.participantLastSeenAtMap instanceof Map) {
              state.participantLastSeenAtMap.delete(participantUserId);
            }
            state.participantCount = state.participantIds.size;
            groupCallStateByDialog.set(payload.dialogId, state);
          }
        }
        if (!payload?.dialogId) {
          for (const [dialogId, entry] of groupCallStateByDialog.entries()) {
            if (entry?.callId !== payload.callId || !(entry.participantIds instanceof Set)) {
              continue;
            }
            const participantUserId = payload.participantUserId || payload.senderUserId || "";
            if (participantUserId) {
              entry.participantIds.delete(participantUserId);
              if (entry.participantLastSeenAtMap instanceof Map) {
                entry.participantLastSeenAtMap.delete(participantUserId);
              }
            }
            entry.participantCount = entry.participantIds.size;
            groupCallStateByDialog.set(dialogId, entry);
          }
        }
        if (!activeCall || activeCall.callId !== payload.callId || activeCall.mode !== "group") {
          syncGroupCallBanner();
          return;
        }
        if (activeCall.groupParticipants instanceof Map) {
          activeCall.groupParticipants.delete(payload.participantUserId || payload.senderUserId || "");
          syncCallUi();
        }
      };

      const handleCallScreenState = async (payload) => {
        if (!payload?.callId || !activeCall || activeCall.callId !== payload.callId || activeCall.mode === "group") {
          return;
        }
        logCallVideoDebug("screen_state_received", {
          payload: {
            callId: payload.callId || "",
            senderUserId: payload.senderUserId || "",
            active: Boolean(payload.active),
            reason: payload.reason || ""
          }
        });
        const remoteUserId = String(payload.senderUserId || "").trim();
        const isActive = Boolean(payload.active);
        const reason = String(payload.reason || "");

        if (isActive && activeCall.screenEnabled) {
          logCallVideoDebug("screen_state_reject_busy", {
            remoteUserId,
            isActive
          });
          sendCallRealtime({
            type: "call_screen_state",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            active: false,
            reason: "busy"
          });
          return;
        }
        if (!isActive && reason === "busy" && activeCall.screenEnabled && remoteUserId) {
          await stopDirectVisualStream(activeCall, { notify: false });
          showToast("Screen sharing is already active on the other side.", "error");
        }

        activeCall.remoteScreenSharing = isActive;
        activeCall.screenOwnerUserId = isActive ? remoteUserId : "";
        if (isActive) {
          activeCall.remoteVisualKind = "screen";
          if (activeCall.screenResyncTimer) {
            window.clearTimeout(activeCall.screenResyncTimer);
          }
          activeCall.screenResyncTimer = window.setTimeout(() => {
            if (!activeCall || activeCall.callId !== payload.callId || !activeCall.remoteScreenSharing) {
              return;
            }
            activeCall.screenResyncTimer = null;
            void requestDirectScreenResync(activeCall, "timer");
          }, 1400);
        }
        if (!isActive) {
          if (activeCall.screenResyncTimer) {
            window.clearTimeout(activeCall.screenResyncTimer);
            activeCall.screenResyncTimer = null;
          }
          // When remote side stops screen sharing, aggressively clear old video
          // to avoid stale black frame being kept on stage.
          activeCall.remoteVideoStream = null;
          activeCall.remoteVideoFrameReady = false;
          activeCall.remoteVisualKind = "none";
        }
        logCallVideoDebug("screen_state_applied", {
          remoteUserId,
          isActive,
          reason
        });
        syncCallVideoStage();
        syncCallUi();
      };

      const handleCallMuteState = (payload) => {
        if (!payload?.callId || !activeCall || activeCall.callId !== payload.callId || activeCall.mode === "group") {
          return;
        }
        const senderUserId = String(payload.senderUserId || "").trim();
        if (senderUserId && senderUserId === currentUserId) {
          return;
        }
        activeCall.remoteMuted = Boolean(payload.isMuted);
        syncCallParticipantsGrid();
      };

      const handleCallEnd = async (payload) => {
        logCall("realtime_receive_call_end", {
          callId: payload?.callId,
          reason: payload?.reason
        });
        rememberRecentlyClosedCall(payload?.dialogId, payload?.callId);
        if (payload?.mode === "group" && payload?.dialogId) {
          groupCallStateByDialog.delete(payload.dialogId);
          postedGroupStartByDialog.delete(payload.dialogId);
          syncGroupCallBanner();
        }
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
      const notifyCallStateOnPageUnload = () => {
        if (!activeCall) {
          return;
        }
        try {
          if (activeCall.mode === "group") {
            sendCallRealtime({
              type: "call_leave",
              mode: "group",
              callId: activeCall.callId,
              dialogId: activeCall.dialogId,
              dialogPublicId: activeCall.dialogPublicId,
              participantUserId: currentUserId
            });
            return;
          }
          sendCallRealtime({
            type: "call_end",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            reason: "reloaded"
          });
        } catch {}
      };
      window.addEventListener("storage", (event) => {
        if (!event || event.key !== CALL_ACCEPT_BROADCAST_STORAGE_KEY || !event.newValue) {
          return;
        }
        let parsed = null;
        try {
          parsed = JSON.parse(event.newValue);
        } catch {
          parsed = null;
        }
        if (!parsed || typeof parsed !== "object") {
          return;
        }
        const callId = String(parsed.callId || "");
        const dialogId = String(parsed.dialogId || "");
        if (!callId || !dialogId || !activeCall) {
          return;
        }
        if (activeCall.callId !== callId || activeCall.dialogId !== dialogId) {
          return;
        }
        if (activeCall.status !== "incoming") {
          return;
        }
        stopCallRingtone();
        void finishActiveCall({
          summaryBody: "",
          remoteEnded: true
        });
      });
      window.addEventListener("pagehide", notifyCallStateOnPageUnload);
      window.addEventListener("beforeunload", notifyCallStateOnPageUnload);


`;
