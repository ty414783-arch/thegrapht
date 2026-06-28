// call-signaling.ts — ported from calls/call-signaling.js
// Full call control: peer connection setup, offer/answer, signaling handlers, and call lifecycle.

import {
  logCall,
  warnCall,
  errCall,
  getDebugTrackState,
  getDebugStreamState,
  setCallError,
  buildCallMessageMarker,
  startOutgoingCallRingtone,
  startIncomingCallRingtone,
  claimCallRingtonePlayback,
  stopCallRingtone,
  logCallVideoDebug,
  logCallVideoDebugSnapshot,
} from "./call-debug";
import {
  createCallId,
  CALL_SETUP_TIMEOUT_MS,
  CALL_RECONNECT_GRACE_MS,
  parseRtcIceServers,
  isRecentlyClosedCall,
  rememberRecentlyClosedCall,
  broadcastCallAcceptedAcrossTabs,
  CALL_ACCEPT_BROADCAST_STORAGE_KEY,
} from "./call-utils";
import {
  buildOfferWithVoiceProfile,
  buildAnswerWithVoiceProfile,
  applyAudioSenderProfile,
  ensureRemoteAudioNode,
  startCallVoiceMeter,
  stopCallVoiceMeter,
  stopGroupLocalVoiceMeter,
  startGroupLocalVoiceMeter,
  clampVoiceLevel,
  setCallVoiceLevel,
  resolveCallFingerprintEmojis,
  sanitizeFingerprintEmojis,
  buildCallFingerprintEmojiMarkup,
} from "./call-webrtc";
import {
  groupCallStateByDialog,
  postedGroupStartByDialog,
  buildGroupCallMarker,
  openGroupLeaveModal,
  closeGroupLeaveModal,
  ensureGroupCallPresencePruneTimer,
  getGroupCallElapsedSecondsForCall,
  syncGroupCallBanner,
  syncGroupCallJoinStrip,
  pruneStaleGroupCallParticipants,
  ensureGroupCallPresenceHeartbeat,
  sendGroupCallPresenceHeartbeat,
} from "./group-call-state";
import {
  loadCallDevices,
  closeCallDevicesPanel,
  syncCallVideoStage,
  getAvatarMeta,
  resolveDialogAvatarUrlForDirectCall,
  resolveDirectPeerAvatarByUserId,
  shouldUseDirectScreenShareLayout,
  hideDirectLocalPreview,
  getOrCreateDirectLocalPreview,
  syncCallParticipantsGrid,
} from "./call-ui";
import { closeExpandedScreenPreview } from "./call-utils";

// ── Module-level mutable state ─────────────────────────────────────────────

let activeCall: Record<string, any> | null = null;
let realtimeSocket: WebSocket | null = null;
let callTickTimer: ReturnType<typeof setInterval> | null = null;
let callTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
let remoteAudioNodeRef: HTMLAudioElement | null = null;

// DOM element references (resolved from window globals at runtime)
function getCallModal(): HTMLElement | null {
  return (window as any).callModal || document.getElementById("call-modal");
}
function getCallMiniCard(): HTMLElement | null {
  return (window as any).callMiniCard || document.getElementById("call-mini-card");
}
function getCallOverlay(): HTMLElement | null {
  return (window as any).callOverlay || document.getElementById("call-overlay");
}
function getCallMuteButton(): HTMLElement | null {
  return (window as any).callMuteButton || document.getElementById("call-mute-button");
}
function getCallVideoButton(): HTMLElement | null {
  return (window as any).callVideoButton || document.getElementById("call-video-button");
}
function getCallScreenButton(): HTMLElement | null {
  return (window as any).callScreenButton || document.getElementById("call-screen-button");
}
function getCallEndButton(): HTMLElement | null {
  return (window as any).callEndButton || document.getElementById("call-end-button");
}
function getCallDevicesPanel(): HTMLElement | null {
  return (window as any).callDevicesPanel || document.getElementById("call-devices-panel");
}
function getCallInputDevice(): HTMLSelectElement | null {
  return (window as any).callInputDevice || (document.getElementById("call-input-device") as HTMLSelectElement | null);
}
function getCallOutputDevice(): HTMLSelectElement | null {
  return (window as any).callOutputDevice || (document.getElementById("call-output-device") as HTMLSelectElement | null);
}
function getGroupCallLeaveModal(): HTMLElement | null {
  return (window as any).groupCallLeaveModal || document.getElementById("group-call-leave-modal");
}
function getGroupCallEndForAll(): HTMLInputElement | null {
  return (window as any).groupCallEndForAll || (document.getElementById("group-call-end-for-all") as HTMLInputElement | null);
}

function getCurrentUserId(): string {
  return (window as any).currentUserId || "";
}
function getCurrentUserDisplayName(): string {
  return (window as any).currentUserDisplayName || "";
}
function getCurrentUserAvatarUrl(): string {
  return (window as any).currentUserAvatarUrl || "";
}
function getCurrentName(): string {
  const name = getCurrentUserDisplayName();
  if (name) return name;
  const el = (window as any).workspaceUserName;
  return (el instanceof HTMLElement ? el.textContent : "") || "You";
}
function getAllDialogs(): Array<Record<string, any>> {
  return (window as any).allDialogs || [];
}
function getCurrentDialogSnapshot(): Record<string, any> | null {
  return (window as any).currentDialogSnapshot || null;
}
function getIsPrimaryActiveTab(): boolean {
  return Boolean((window as any).isPrimaryActiveTab);
}
function getRtcIceServersRaw(): string | null {
  return (window as any).__rtcIceServersRaw || null;
}

// ── RTCIceServers wrapper ──────────────────────────────────────────────────

function getIceServers(): RTCIceServer[] {
  return parseRtcIceServers(getRtcIceServersRaw()) as RTCIceServer[];
}

// ── sendCallRealtime ───────────────────────────────────────────────────────

export function sendCallRealtime(payload: Record<string, unknown>): void {
  if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
    warnCall("realtime_send_skipped_socket_not_open", {
      payloadType: payload?.type,
      readyState: realtimeSocket?.readyState,
    });
    return;
  }
  logCall("realtime_send", {
    payloadType: payload.type,
    callId: payload.callId,
    dialogId: payload.dialogId,
    active: typeof payload.active === "boolean" ? payload.active : undefined,
    reason: payload.reason || "",
  });
  realtimeSocket.send(JSON.stringify(payload));
}

// ── Peer connection creation ───────────────────────────────────────────────

function createPeerConnection(call: Record<string, any>): RTCPeerConnection {
  const iceServers = getIceServers();
  const peerConnection = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 10 });
  try { peerConnection.addTransceiver("video", { direction: "sendrecv" }); } catch {}
  logCall("pc_created", { callId: call.callId, iceServers });

  peerConnection.onicecandidate = (event) => {
    if (!activeCall || activeCall.callId !== call.callId) return;
    if (!event.candidate) {
      logCall("ice_candidate_gathering_complete", { callId: call.callId, iceGatheringState: peerConnection.iceGatheringState });
      return;
    }
    logCall("ice_candidate_local", {
      callId: call.callId,
      protocol: event.candidate.protocol,
      type: event.candidate.type,
      address: event.candidate.address,
    });
    sendCallRealtime({ type: "call_candidate", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId, candidate: event.candidate });
  };

  peerConnection.ontrack = (event) => {
    logCall("remote_track_received", {
      callId: call.callId,
      kind: event.track?.kind || "",
      streamCount: event.streams?.length || 0,
      track: getDebugTrackState(event.track || null),
      streams: Array.from(event.streams || []).map(getDebugStreamState),
    });
    if (!event.track) return;
    const stream = event.streams?.[0] || new MediaStream([event.track]);
    if (event.track?.kind === "audio") {
      const audio = ensureRemoteAudioNode();
      audio.srcObject = stream;
      startCallVoiceMeter(stream, getCallModal(), getCallMiniCard());
      try {
        const p = audio.play();
        if (p?.catch) p.catch(() => {});
      } catch {}
      return;
    }
    if (event.track?.kind === "video" && activeCall && activeCall.callId === call.callId) {
      const callElapsed = () => {
        if (!activeCall || !activeCall.connectedAt) return 0;
        return Math.max(0, Math.floor((Date.now() - activeCall.connectedAt) / 1000));
      };
      const applyRemoteVideoTrack = () => {
        if (!activeCall || activeCall.callId !== call.callId) return;
        if (event.track.readyState === "ended" || event.track.muted) return;
        if (activeCall.remoteVideoStream !== stream) activeCall.remoteVideoFrameReady = false;
        activeCall.remoteVideoStream = stream;
        if (event.track.readyState === "live" && !event.track.muted) activeCall.remoteVideoFrameReady = true;
        void syncCallVideoStageFull();
      };
      const clearRemoteVideoTrack = () => {
        if (!activeCall || activeCall.callId !== call.callId) return;
        const currentStream = activeCall.remoteVideoStream;
        const currentTrack = currentStream instanceof MediaStream ? currentStream.getVideoTracks()[0] || null : null;
        if (currentTrack && currentTrack !== event.track) return;
        activeCall.remoteVideoStream = null;
        activeCall.remoteVideoFrameReady = false;
        activeCall.remoteVisualKind = "none";
        if (activeCall.remoteScreenSharing) {
          activeCall.remoteScreenSharing = false;
          activeCall.screenOwnerUserId = "";
        }
        void syncCallVideoStageFull();
        syncCallUi();
      };
      const clearRemoteVideoTrackWithGrace = () => {
        if (!activeCall || activeCall.callId !== call.callId) return;
        if (activeCall.remoteVideoMuteGraceTimer) window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
        activeCall.remoteVideoMuteGraceTimer = window.setTimeout(() => {
          if (!activeCall || activeCall.callId !== call.callId) return;
          activeCall.remoteVideoMuteGraceTimer = null;
          const cs = activeCall.remoteVideoStream;
          const ct = cs instanceof MediaStream ? cs.getVideoTracks()[0] || null : null;
          if (ct && ct.readyState === "live" && !ct.muted) return;
          clearRemoteVideoTrack();
        }, 1600);
      };
      if (!event.track.muted && event.track.readyState === "live") applyRemoteVideoTrack();
      else void syncCallVideoStageFull();
      event.track.onunmute = () => {
        if (activeCall?.remoteVideoMuteGraceTimer) {
          window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
          activeCall.remoteVideoMuteGraceTimer = null;
        }
        applyRemoteVideoTrack();
      };
      event.track.onmute = () => clearRemoteVideoTrackWithGrace();
      event.track.onended = () => {
        if (activeCall?.remoteVideoMuteGraceTimer) {
          window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
          activeCall.remoteVideoMuteGraceTimer = null;
        }
        clearRemoteVideoTrack();
      };
    }
  };

  peerConnection.onconnectionstatechange = () => {
    if (!activeCall || activeCall.callId !== call.callId) return;
    logCall("pc_connection_state", {
      callId: call.callId,
      connectionState: peerConnection.connectionState,
      iceConnectionState: peerConnection.iceConnectionState,
      iceGatheringState: peerConnection.iceGatheringState,
      signalingState: peerConnection.signalingState,
    });
    if (peerConnection.connectionState === "connected") {
      activeCall.status = "active";
      activeCall.lastError = "";
      if (!activeCall.connectedAt) activeCall.connectedAt = Date.now();
      clearCallTimers();
      stopCallRingtone();
      startCallTicker();
      syncCallUi();
      return;
    }
    if (peerConnection.connectionState === "disconnected") {
      if (activeCall.status === "active" || activeCall.status === "connecting") {
        activeCall.status = "reconnecting";
        setCallError(activeCall, "Unstable network, reconnecting.", { connectionState: peerConnection.connectionState, iceConnectionState: peerConnection.iceConnectionState });
        syncCallUi();
      }
      if (!callTimeoutTimer) {
        callTimeoutTimer = window.setTimeout(() => {
          if (!activeCall || activeCall.callId !== call.callId) return;
          void finishActiveCall({ summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : buildCallMessageMarker("missed"), remoteEnded: false });
        }, CALL_RECONNECT_GRACE_MS);
      }
      return;
    }
    if (peerConnection.connectionState === "failed" || peerConnection.connectionState === "closed") {
      setCallError(activeCall, "WebRTC connection failed.", { connectionState: peerConnection.connectionState, iceConnectionState: peerConnection.iceConnectionState, signalingState: peerConnection.signalingState });
      void finishActiveCall({ summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : "", remoteEnded: false });
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    if (!activeCall || activeCall.callId !== call.callId) return;
    logCall("pc_ice_connection_state", { callId: call.callId, iceConnectionState: peerConnection.iceConnectionState, connectionState: peerConnection.connectionState, iceGatheringState: peerConnection.iceGatheringState });
    if (peerConnection.iceConnectionState === "connected" || peerConnection.iceConnectionState === "completed") {
      if (activeCall.status === "reconnecting") {
        activeCall.status = activeCall.connectedAt ? "active" : "connecting";
        activeCall.lastError = "";
        syncCallUi();
      }
      return;
    }
    if (peerConnection.iceConnectionState === "failed") {
      setCallError(activeCall, "ICE failed: candidates could not connect.", { connectionState: peerConnection.connectionState, signalingState: peerConnection.signalingState });
      void finishActiveCall({ summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : buildCallMessageMarker("missed"), remoteEnded: false });
    }
  };

  peerConnection.onicecandidateerror = (event: RTCPeerConnectionIceErrorEvent) => {
    const safeCode = Number.isFinite(event?.errorCode) ? event.errorCode : "unknown";
    const safeText = event?.errorText ? String(event.errorText) : "unknown";
    const safeUrl = event?.url ? String(event.url) : "";
    const verboseMessage = "ICE " + safeCode + ": " + safeText + (safeUrl ? " (" + safeUrl + ")" : "");
    warnCall("ice_candidate_error", { callId: call.callId, errorCode: event.errorCode, errorText: event.errorText, url: event.url });
    if (!activeCall || activeCall.callId !== call.callId) return;
    if (Number(event?.errorCode) === 701) return;
    if (activeCall.status === "active") return;
    setCallError(activeCall, verboseMessage, { errorCode: event.errorCode, errorText: event.errorText, url: event.url });
  };

  peerConnection.onicegatheringstatechange = () => {
    logCall("pc_ice_gathering_state", { callId: call.callId, iceGatheringState: peerConnection.iceGatheringState });
  };

  peerConnection.onsignalingstatechange = () => {
    logCall("pc_signaling_state", { callId: call.callId, signalingState: peerConnection.signalingState });
    if (
      activeCall && activeCall.callId === call.callId &&
      activeCall.mode !== "group" &&
      peerConnection.signalingState === "stable" &&
      activeCall.pendingVisualRenegotiationReason
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
}

// ── Group peer connection ──────────────────────────────────────────────────

function createGroupPeerConnection(
  call: Record<string, any>,
  peerUserId: string,
  peerName: string = "User"
): RTCPeerConnection | null {
  if (!call || call.mode !== "group" || !peerUserId) return null;
  if (!(call.groupPeerConnections instanceof Map)) call.groupPeerConnections = new Map();
  const existing = call.groupPeerConnections.get(peerUserId);
  if (existing?.peerConnection) return existing.peerConnection;
  const iceServers = getIceServers();
  const peerConnection = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 10 });
  if (call.localStream) {
    (call.localStream as MediaStream).getTracks().forEach((track) => {
      try { peerConnection.addTrack(track, call.localStream); } catch {}
    });
  }
  call.groupPeerConnections.set(peerUserId, { peerConnection, peerUserId, peerName: String(peerName || "User"), offerSent: false });

  peerConnection.onicecandidate = (event) => {
    if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== call.callId) return;
    if (!event.candidate) return;
    sendCallRealtime({ type: "call_candidate", mode: "group", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId, targetUserId: peerUserId, candidate: event.candidate });
  };

  peerConnection.ontrack = (event) => {
    if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== call.callId) return;
    if (!(call.groupRemoteAudioNodes instanceof Map)) call.groupRemoteAudioNodes = new Map();
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
      const p = audioNode.play();
      if (p?.catch) p.catch(() => {});
    } catch {}
  };

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState;
    if (state === "failed" || state === "closed" || state === "disconnected") {
      const entry = call.groupPeerConnections.get(peerUserId);
      if (entry?.peerConnection === peerConnection) call.groupPeerConnections.delete(peerUserId);
    }
  };

  return peerConnection;
}

async function maybeStartGroupPeerNegotiation(
  call: Record<string, any>,
  peerUserId: string,
  peerName: string = "User"
): Promise<void> {
  if (!call || call.mode !== "group" || !peerUserId || peerUserId === getCurrentUserId()) return;
  const selfId = String(getCurrentUserId() || "");
  const targetId = String(peerUserId || "");
  if (!selfId || !targetId) return;
  const shouldInitiate = selfId.localeCompare(targetId) > 0;
  const peerConnection = createGroupPeerConnection(call, peerUserId, peerName);
  if (!peerConnection) return;
  const entry = call.groupPeerConnections.get(peerUserId);
  if (!shouldInitiate || entry?.offerSent) return;
  try {
    const offer = await buildOfferWithVoiceProfile(peerConnection);
    await peerConnection.setLocalDescription(offer);
    entry.offerSent = true;
    call.groupPeerConnections.set(peerUserId, entry);
    sendCallRealtime({
      type: "call_invite", mode: "group",
      callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId,
      targetUserId: peerUserId, callerName: getCurrentName(), offer,
    });
  } catch (error) {
    warnCall("group_offer_failed", { peerUserId, error: error instanceof Error ? error.message : String(error) });
  }
}

// ── Timer helpers ──────────────────────────────────────────────────────────

function getCallElapsedSeconds(): number {
  if (!activeCall) return 0;
  if (activeCall.mode === "group") return getGroupCallElapsedSecondsForCall(activeCall);
  if (!activeCall.connectedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - activeCall.connectedAt) / 1000));
}

function clearCallTimers(): void {
  if (callTickTimer) { window.clearInterval(callTickTimer); callTickTimer = null; }
  if (callTimeoutTimer) { window.clearTimeout(callTimeoutTimer); callTimeoutTimer = null; }
  stopCallRingtone();
}

function armCallSetupTimeout(callId: string, reason: string = "missed"): void {
  if (callTimeoutTimer) window.clearTimeout(callTimeoutTimer);
  logCall("setup_timeout_armed", { callId, reason, timeoutMs: CALL_SETUP_TIMEOUT_MS });
  callTimeoutTimer = window.setTimeout(() => {
    if (!activeCall || activeCall.callId !== callId || activeCall.status === "active") return;
    if (reason === "no_connect") {
      setCallError(activeCall, "Failed to establish P2P connection (ICE timeout).", {
        connectionState: activeCall.peerConnection?.connectionState,
        iceConnectionState: activeCall.peerConnection?.iceConnectionState,
        iceGatheringState: activeCall.peerConnection?.iceGatheringState,
      });
      const showToast = (window as any).showToast;
      if (typeof showToast === "function") showToast("Failed to establish call connection (ICE timeout).", "error");
    }
    warnCall("setup_timeout_fired", { callId, reason, status: activeCall.status });
    sendCallRealtime({ type: "call_end", callId: activeCall.callId, dialogId: activeCall.dialogId, dialogPublicId: activeCall.dialogPublicId, reason, summaryBody: buildCallMessageMarker("missed") });
    void finishActiveCall({ summaryBody: buildCallMessageMarker("missed"), remoteEnded: false });
  }, CALL_SETUP_TIMEOUT_MS);
}

function startCallTicker(): void {
  if (callTickTimer) return;
  callTickTimer = window.setInterval(() => {
    syncCallUi();
  }, 420);
}

// ── Stop & release call media ──────────────────────────────────────────────

async function stopAndReleaseCallMedia(): Promise<void> {
  if (!activeCall) return;
  if (activeCall.mode !== "group") {
    await stopDirectVisualStream(activeCall, { notify: false });
    activeCall.remoteVideoStream = null;
    activeCall.remoteVideoFrameReady = false;
    activeCall.remoteScreenSharing = false;
    activeCall.screenOwnerUserId = "";
  }
  stopCallVoiceMeter(getCallModal(), getCallMiniCard());
  stopGroupLocalVoiceMeter();
  if (activeCall.mode === "group") {
    try {
      if (activeCall.groupPeerConnections instanceof Map) {
        activeCall.groupPeerConnections.forEach((entry: any) => { try { entry?.peerConnection?.close(); } catch {} });
      }
      if (activeCall.groupRemoteAudioNodes instanceof Map) {
        activeCall.groupRemoteAudioNodes.forEach((audioNode: HTMLAudioElement) => {
          try { audioNode.pause(); audioNode.srcObject = null; audioNode.remove(); } catch {}
        });
      }
    } catch {}
  }
  try { activeCall.peerConnection?.getSenders().forEach((sender: any) => { try { sender.track?.stop(); } catch {} }); } catch {}
  try { activeCall.peerConnection?.close(); } catch {}
  try { activeCall.localStream?.getTracks().forEach((track: MediaStreamTrack) => { try { track.stop(); } catch {} }); } catch {}
  if (activeCall.visualRenegotiateRetryTimer) { try { window.clearTimeout(activeCall.visualRenegotiateRetryTimer); } catch {} activeCall.visualRenegotiateRetryTimer = null; }
  if (activeCall.screenResyncTimer) { try { window.clearTimeout(activeCall.screenResyncTimer); } catch {} activeCall.screenResyncTimer = null; }
  if (activeCall.remoteVideoMuteGraceTimer) { try { window.clearTimeout(activeCall.remoteVideoMuteGraceTimer); } catch {} activeCall.remoteVideoMuteGraceTimer = null; }
  activeCall.pendingVisualRenegotiationReason = "";
  const rn = ensureRemoteAudioNode();
  if (rn) { try { rn.pause(); rn.srcObject = null; } catch {} }
}

// ── finishActiveCall ───────────────────────────────────────────────────────

export async function finishActiveCall(opts: { summaryBody?: string; remoteEnded?: boolean } = {}): Promise<void> {
  if (!activeCall) return;
  logCall("finish_call", { callId: activeCall.callId, status: activeCall.status, remoteEnded: opts.remoteEnded, summaryBody: opts.summaryBody });
  rememberRecentlyClosedCall(activeCall.dialogId, activeCall.callId);
  clearCallTimers();
  const callModal = getCallModal();
  const callModalEl = callModal;
  if (callModalEl) closeExpandedScreenPreview(callModalEl, (window as any).getIcon || (() => ""));
  await stopAndReleaseCallMedia();
  activeCall = null;
  syncCallUi();
}

// ── syncCallUi ─────────────────────────────────────────────────────────────

function syncCallUi(): void {
  const callModal = getCallModal();
  const callMiniCard = getCallMiniCard();
  const callOverlay = getCallOverlay();
  const callMuteButton = getCallMuteButton();
  const callVideoButton = getCallVideoButton();
  const callScreenButton = getCallScreenButton();
  const callEndButton = getCallEndButton();
  const escapeHtml = (window as any).escapeHtml || ((s: string) => s);
  const getIcon = (window as any).getIcon || (() => "");

  if (!callOverlay) return;

  const hasCall = Boolean(activeCall);
  if (!hasCall) {
    const focusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (focusedElement && callOverlay.contains(focusedElement)) focusedElement.blur();
  }
  callOverlay.setAttribute("aria-hidden", hasCall ? "false" : "true");

  if (!hasCall) {
    if (callModal) {
      callModal.classList.remove("open","minimized","expanded","has-direct-visuals","has-dual-visuals","has-screen-share");
      callModal.dataset.directVisualLayout = "none";
    }
    if (callMiniCard) {
      callMiniCard.classList.remove("visible","dragging");
      setCallVoiceLevel(0, callModal, callMiniCard);
      callMiniCard.style.left = "";
      callMiniCard.style.top = "";
      callMiniCard.style.right = "";
      callMiniCard.style.bottom = "";
    }
    closeCallDevicesPanel(getCallDevicesPanel());
    syncCallVideoStageFull();
    const callExpandButton = (window as any).callExpandButton || document.getElementById("call-expand-button");
    if (callExpandButton) {
      const iconNode = callExpandButton.querySelector(".lucide");
      if (iconNode) iconNode.outerHTML = getIcon("open_in_full", iconNode.className);
    }
    syncGroupCallBannerFull();
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
  const statusText = isIncoming ? "incoming call" : isActive ? formatCallDuration(getCallElapsedSeconds()) : isReconnecting ? "reconnecting" + dots : activeCall.status === "outgoing" ? "ringing" + dots : "connecting" + dots;
  const debugSuffix = !isIncoming && !isActive && activeCall.lastError ? " • " + getCallErrorForUi(activeCall.lastError) : "";

  if (callModal) {
    callModal.dataset.callState = activeCall.status || "idle";
    callModal.dataset.callDirection = activeCall.direction || "outgoing";
    callModal.dataset.callMode = isGroupCall ? "group" : "direct";
    callModal.classList.toggle("ringing", isRinging);
  }
  if (callMiniCard) {
    callMiniCard.dataset.callState = activeCall.status || "idle";
    callMiniCard.dataset.callDirection = activeCall.direction || "outgoing";
    callMiniCard.classList.toggle("ringing", isRinging);
  }

  // Avatar
  const callPeerAvatar = (window as any).callPeerAvatar || document.getElementById("call-peer-avatar");
  if (callPeerAvatar) {
    callPeerAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
    callPeerAvatar.style.cssText = avatar.style;
  }
  if (callModal?.style) {
    callModal.style.setProperty("--call-bg-start", avatar.start || "#bb8b4b");
    callModal.style.setProperty("--call-bg-end", avatar.end || "#b37f3f");
  }
  if (callMiniCard?.style) {
    callMiniCard.style.setProperty("--call-bg-start", avatar.start || "#bb8b4b");
    callMiniCard.style.setProperty("--call-bg-end", avatar.end || "#b37f3f");
  }

  const callFingerprintNode = document.getElementById("call-fingerprint-emojis");
  if (callFingerprintNode) callFingerprintNode.innerHTML = buildCallFingerprintEmojiMarkup(activeCall);

  const callPeerName = (window as any).callPeerName || document.getElementById("call-peer-name");
  const callPeerStatus = (window as any).callPeerStatus || document.getElementById("call-peer-status");
  const callPeerSubstatus = (window as any).callPeerSubstatus || document.getElementById("call-peer-substatus");
  if (callPeerName) callPeerName.textContent = activeCall.peerName || "TheGraphT";
  if (callPeerStatus) callPeerStatus.textContent = isGroupCall ? (isActive ? "Live now" : "Connecting...") : (activeCall.status === "outgoing" ? "Ringing" + dots : statusText);

  const localParticipantSpeaking = !activeCall.isMuted;
  const groupSubstatusText = isActive ? (activeCall.isMuted ? "listening" : localParticipantSpeaking ? "speaking" : "listening") : "connecting...";
  if (callPeerSubstatus) callPeerSubstatus.textContent = isGroupCall ? groupSubstatusText + debugSuffix : "";

  const callModalKicker = (window as any).callModalKicker || document.getElementById("call-modal-kicker");
  if (callModalKicker) {
    callModalKicker.hidden = false;
    callModalKicker.textContent = isActive ? formatCallDuration(getCallElapsedSeconds()) : (isIncoming ? "Incoming call" : isReconnecting ? "Reconnecting" : activeCall.status === "outgoing" ? "Ringing" : "Connecting");
  }
  const callGroupKicker = (window as any).callGroupKicker || document.getElementById("call-group-kicker");
  const callGroupPanel = (window as any).callGroupPanel || document.getElementById("call-group-panel");
  const callGroupList = (window as any).callGroupList || document.getElementById("call-group-list");
  if (callGroupKicker) callGroupKicker.hidden = !isGroupCall;
  if (callGroupPanel) callGroupPanel.hidden = !isGroupCall;

  const groupParticipantsList: any[] =
    activeCall.groupParticipants instanceof Map ? Array.from(activeCall.groupParticipants.values()) : [];
  if (callGroupList) {
    const rows = groupParticipantsList.map((participant: any) => {
      const isSpeaking = !participant?.isMuted;
      const voiceLevel = clampVoiceLevel(participant?.voiceLevel);
      const isTalkingNow = isSpeaking && voiceLevel > 0.035;
      const rowState = participant?.isMuted ? "listening" : "speaking";
      const av = getAvatarMeta(participant?.userId || participant?.name || "User", participant?.name || "User");
      return '<div class="call-group-row' + (isSpeaking ? " speaking" : "") + '">' +
        '<div class="call-group-row-left">' +
          '<div class="call-group-row-avatar-shell' + (isTalkingNow ? " talking" : "") + '" style="--voice-level:' + voiceLevel.toFixed(3) + ';">' +
            '<div class="call-group-row-avatar' + (isSpeaking ? " speaking" : "") + '" style="' + av.style + '">' +
              '<img class="generated-avatar-photo" src="' + av.avatarUrl + '" alt="' + escapeHtml(av.letter || "?") + '" />' +
            '</div>' +
          '</div>' +
          '<div class="call-group-row-meta">' +
            '<div class="call-group-row-name">' + escapeHtml(participant?.name || "User") + '</div>' +
            '<div class="call-group-row-state">' + escapeHtml(rowState) + '</div>' +
          '</div>' +
        '</div>' +
        getIcon(participant?.isMuted ? "mic_off" : "mic", "call-group-row-mic" + (participant?.isMuted ? " muted" : " active"), 'aria-hidden="true"') +
      '</div>';
    });
    callGroupList.innerHTML = rows.join("");
  }

  const callMiniAvatar = (window as any).callMiniAvatar || document.getElementById("call-mini-avatar");
  const callMiniName = (window as any).callMiniName || document.getElementById("call-mini-name");
  const callMiniSubtitle = (window as any).callMiniSubtitle || document.getElementById("call-mini-subtitle");
  const callMuteLabel = (window as any).callMuteLabel || document.getElementById("call-mute-label");
  const callEndLabel = (window as any).callEndLabel || document.getElementById("call-end-label");
  const callAcceptWrap = (window as any).callAcceptWrap || document.getElementById("call-accept-wrap");
  if (callMiniAvatar) { callMiniAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />'; callMiniAvatar.style.cssText = avatar.style; }
  if (callMiniName) callMiniName.textContent = activeCall.peerName || "TheGraphT";
  if (callMiniSubtitle) callMiniSubtitle.textContent = statusText;
  if (callMuteButton) callMuteButton.classList.toggle("muted", Boolean(activeCall.isMuted));
  if (callMuteButton) { const mn = callMuteButton.querySelector(".lucide"); if (mn) mn.outerHTML = getIcon(activeCall.isMuted ? "mic_off" : "mic", mn.className); }
  if (callVideoButton) {
    callVideoButton.classList.toggle("active", Boolean(activeCall.cameraEnabled));
    callVideoButton.classList.toggle("muted", !Boolean(activeCall.cameraEnabled));
    const vn = callVideoButton.querySelector(".lucide");
    if (vn) vn.outerHTML = getIcon(activeCall.cameraEnabled ? "videocam" : "videocam_off", vn.className);
  }
  if (callScreenButton) {
    callScreenButton.classList.toggle("active", Boolean(activeCall.screenEnabled));
    callScreenButton.classList.toggle("muted", Boolean(activeCall.screenEnabled));
    const remoteOwnsScreen = Boolean(activeCall.remoteScreenSharing && activeCall.screenOwnerUserId && activeCall.screenOwnerUserId !== getCurrentUserId());
    (callScreenButton as HTMLButtonElement).disabled = remoteOwnsScreen && !activeCall.screenEnabled;
    callScreenButton.setAttribute("title", remoteOwnsScreen && !activeCall.screenEnabled ? "The other user is already sharing screen" : "Screen");
    const sn = callScreenButton.querySelector(".lucide");
    if (sn) sn.outerHTML = getIcon(activeCall.screenEnabled ? "stop_screen_share" : "screen_share", sn.className);
  }
  if (callMuteLabel) callMuteLabel.textContent = "Mute";
  if (isGroupCall && callModal) {
    callModal.classList.toggle("group-speaking", !activeCall.isMuted);
    callModal.classList.toggle("group-listening", Boolean(activeCall.isMuted));
    const hasAnySpeaker = groupParticipantsList.some((p: any) => Boolean(p?.isSpeaking) && !p?.isMuted);
    setCallVoiceLevel(hasAnySpeaker ? 0.88 : activeCall.isMuted ? 0.08 : 0.36, callModal, callMiniCard);
  }
  if (callAcceptWrap) {
    if (callAcceptWrap.parentElement) callAcceptWrap.parentElement.dataset.callLayout = shouldShowAcceptAction ? "incoming" : "outgoing";
    callAcceptWrap.hidden = !shouldShowAcceptAction;
    callAcceptWrap.style.display = shouldShowAcceptAction ? "" : "none";
  }
  const videoActionWrap = callVideoButton?.closest(".call-action");
  const screenActionWrap = callScreenButton?.closest(".call-action");
  const muteActionWrap = callMuteButton?.closest(".call-action");
  const shouldShowMediaActions = !shouldShowAcceptAction;
  if (videoActionWrap) (videoActionWrap as HTMLElement).hidden = !shouldShowMediaActions;
  if (screenActionWrap) (screenActionWrap as HTMLElement).hidden = !shouldShowMediaActions;
  if (muteActionWrap) (muteActionWrap as HTMLElement).hidden = !shouldShowMediaActions;
  if (callEndButton) {
    callEndButton.setAttribute("aria-label", shouldShowAcceptAction ? "Decline call" : "End call");
    if (callEndLabel) callEndLabel.textContent = shouldShowAcceptAction ? "Decline" : "End";
  }

  syncCallVideoStageFull();
  if (callModal) {
    callModal.classList.toggle("open", !activeCall.minimized);
    if (callMiniCard) {
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
    }
  }
  syncActiveCallChip();
  syncGroupCallBannerFull();
  ensureGroupCallPresenceHeartbeatFull();
}

function buildAnimatedDots(): string {
  const phase = (Math.floor(Date.now() / 420) % 3) + 1;
  return ".".repeat(phase);
}

function formatCallDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function getCallErrorForUi(message: unknown): string {
  const normalized = typeof message === "string" ? message.trim() : "";
  if (!normalized) return "";
  if (/^ICE\s+\d+:/i.test(normalized)) return "network issue, retrying connection";
  return normalized.length > 120 ? normalized.slice(0, 117) + "..." : normalized;
}

function syncActiveCallChip(): void {
  const chatCallChip = (window as any).chatCallChip || document.getElementById("chat-call-chip");
  const chatCallChipTitle = (window as any).chatCallChipTitle || document.getElementById("chat-call-chip-title");
  const chatCallChipTime = (window as any).chatCallChipTime || document.getElementById("chat-call-chip-time");
  const currentDialogSnapshot = getCurrentDialogSnapshot();
  if (!chatCallChip) return;
  const shouldShow = Boolean(
    activeCall && activeCall.mode !== "group" &&
    (activeCall.status === "outgoing" || activeCall.status === "incoming" || activeCall.status === "connecting" || activeCall.status === "reconnecting" || activeCall.status === "active") &&
    currentDialogSnapshot && currentDialogSnapshot.id !== activeCall.dialogId
  );
  chatCallChip.classList.toggle("visible", shouldShow);
  chatCallChip.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  if (!shouldShow) return;
  if (chatCallChipTitle) chatCallChipTitle.textContent = activeCall.peerName ? "Call with " + activeCall.peerName : "Call";
  if (chatCallChipTime) chatCallChipTime.textContent = activeCall.status === "active" ? formatCallDuration(getCallElapsedSeconds()) : (activeCall.status === "incoming" ? "incoming" : activeCall.status === "reconnecting" ? "reconnecting" : "connecting...");
}

function syncCallVideoStageFull(): void {
  syncCallVideoStage(activeCall, getCallModal(), {
    getCallElapsedSeconds,
    currentUserId: getCurrentUserId(),
    getCurrentName,
    allDialogs: getAllDialogs(),
    closeExpandedScreenPreview: () => {
      const cm = getCallModal();
      if (cm) closeExpandedScreenPreview(cm, (window as any).getIcon || (() => ""));
    },
  });
}

function syncGroupCallBannerFull(): void {
  const groupCallBanner = (window as any).groupCallBanner || document.getElementById("group-call-banner");
  const groupCallBannerState = (window as any).groupCallBannerState || document.getElementById("group-call-banner-state");
  const groupCallBannerTitle = (window as any).groupCallBannerTitle || document.getElementById("group-call-banner-title");
  const groupCallJoinStrip = (window as any).groupCallJoinStrip || document.getElementById("group-call-join-strip");
  const groupCallJoinTitle = (window as any).groupCallJoinTitle || document.getElementById("group-call-join-title");
  const groupCallJoinMeta = (window as any).groupCallJoinMeta || document.getElementById("group-call-join-meta");
  const groupCallJoinButton = (window as any).groupCallJoinButton || document.getElementById("group-call-join-button");
  const chatWindow = document.getElementById("chat-window");
  syncGroupCallBanner({
    groupCallBanner, groupCallBannerState, groupCallBannerTitle,
    activeCallVal: activeCall,
    currentDialogSnapshot: getCurrentDialogSnapshot(),
    syncGroupCallJoinStrip: () => {
      syncGroupCallJoinStrip({
        groupCallJoinStrip, groupCallJoinTitle, groupCallJoinMeta, groupCallJoinButton,
        chatWindow, currentDialogSnapshot: getCurrentDialogSnapshot(),
        allDialogs: getAllDialogs() as any[], activeCallVal: activeCall,
      });
    },
  });
}

function ensureGroupCallPresenceHeartbeatFull(): void {
  ensureGroupCallPresenceHeartbeat({
    activeCallVal: activeCall,
    ensurePresencePruneTimer: () => {
      ensureGroupCallPresencePruneTimer(() => activeCall, syncGroupCallBannerFull);
    },
    sendHeartbeat: () => {
      sendGroupCallPresenceHeartbeat({
        activeCallVal: activeCall,
        currentUserId: getCurrentUserId(),
        getCurrentName,
        clampVoiceLevel,
        groupLocalVoiceLastLevel: (window as any).__groupLocalVoiceLastLevel || 0,
        sendCallRealtime,
      });
    },
  });
}

// ── Local media helpers ────────────────────────────────────────────────────

async function ensureCallLocalStream(inputDeviceId: string): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not support calls.");
  const audioConstraints: MediaTrackConstraints & Record<string, unknown> = {
    ...(inputDeviceId ? { deviceId: { exact: inputDeviceId } } : {}),
    echoCancellation: true, noiseSuppression: true, autoGainControl: true,
    channelCount: 1, sampleRate: 48000, sampleSize: 16, latency: 0,
  };
  return navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
}

export async function applyCallOutputDevice(deviceId: string): Promise<void> {
  const audio = ensureRemoteAudioNode();
  if (typeof (audio as any).setSinkId !== "function" || !deviceId) return;
  try { await (audio as any).setSinkId(deviceId); } catch {}
}

// ── Visual track helpers ───────────────────────────────────────────────────

async function updateVisualSenderTrack(call: Record<string, any>, track: MediaStreamTrack | null): Promise<void> {
  if (!call?.peerConnection) return;
  const sender = call.peerConnection.getSenders().find((entry: RTCRtpSender) =>
    entry.track?.kind === "video" ||
    call.peerConnection.getTransceivers().some((t: RTCRtpTransceiver) => t.sender === entry && t.receiver?.track?.kind === "video")
  );
  if (sender) {
    await sender.replaceTrack(track || null);
    return;
  }
  if (track) {
    const videoTransceiver = call.peerConnection.getTransceivers().find((t: RTCRtpTransceiver) => t.receiver?.track?.kind === "video");
    if (videoTransceiver?.sender) { await videoTransceiver.sender.replaceTrack(track); return; }
    call.peerConnection.addTrack(track, new MediaStream([track]));
  }
}

async function renegotiateDirectVisualTrack(call: Record<string, any>, reason: string): Promise<void> {
  if (!call?.peerConnection || call.mode === "group") return;
  if (call.peerConnection.signalingState !== "stable") {
    call.pendingVisualRenegotiationReason = reason || "visual_update";
    if (!call.visualRenegotiateRetryTimer) {
      call.visualRenegotiateRetryTimer = window.setTimeout(() => {
        if (!activeCall || activeCall.callId !== call.callId) return;
        call.visualRenegotiateRetryTimer = null;
        const retryReason = call.pendingVisualRenegotiationReason || reason || "visual_update";
        call.pendingVisualRenegotiationReason = "";
        void renegotiateDirectVisualTrack(call, retryReason);
      }, 220);
    }
    return;
  }
  try {
    const offer = await buildOfferWithVoiceProfile(call.peerConnection);
    await call.peerConnection.setLocalDescription(offer);
    sendCallRealtime({
      type: "call_invite", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId,
      callerName: getCurrentName(), fingerprintEmojis: call.fingerprintEmojis || [], offer,
      renegotiate: true, reason,
    });
    call.pendingVisualRenegotiationReason = "";
  } catch (error) {
    warnCall("renegotiate_visual_failed", { reason, error: error instanceof Error ? error.message : String(error) });
  }
}

async function stopDirectVisualStream(call: Record<string, any>, opts: { notify?: boolean; stopReason?: string } = {}): Promise<void> {
  if (!call || call.mode === "group") return;
  if (call.visualTrackStopBound) { call.visualTrackStopBound.onended = null; call.visualTrackStopBound = null; }
  if (call.localVisualStream instanceof MediaStream) call.localVisualStream.getTracks().forEach((t: MediaStreamTrack) => { try { t.stop(); } catch {} });
  call.localVisualStream = null;
  call.cameraEnabled = false;
  call.screenEnabled = false;
  call.screenOwnerUserId = "";
  call.remoteVisualKind = "none";
  try { await updateVisualSenderTrack(call, null); } catch {}
  await renegotiateDirectVisualTrack(call, "visual_stop");
  if (opts.notify !== false) {
    sendCallRealtime({ type: "call_screen_state", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId, active: false });
  }
  syncCallVideoStageFull();
}

// ── Public call actions ────────────────────────────────────────────────────

export async function beginOutgoingCall(): Promise<void> {
  if (!getIsPrimaryActiveTab()) {
    const showToast = (window as any).showToast;
    if (typeof showToast === "function") showToast("Another tab is active. Close other tabs to place calls here.", "error");
    return;
  }
  const currentDialogSnapshot = getCurrentDialogSnapshot();
  if (!currentDialogSnapshot || currentDialogSnapshot.type !== "direct") return;
  if (activeCall) {
    const showToast = (window as any).showToast;
    if (typeof showToast === "function") showToast("Finish the current call first.", "error");
    return;
  }
  try {
    const localStream = await ensureCallLocalStream("");
    await loadCallDevices(getCallInputDevice(), getCallOutputDevice());
    const call: Record<string, any> = {
      callId: createCallId(), dialogId: currentDialogSnapshot.id, dialogPublicId: currentDialogSnapshot.publicId,
      peerId: currentDialogSnapshot.peerUserId || "", peerName: currentDialogSnapshot.title,
      peerAvatarUrl: currentDialogSnapshot.avatarUrl || "", status: "outgoing", direction: "outgoing",
      localStream, peerConnection: null, connectedAt: 0, isMuted: false, inputDeviceId: "", outputDeviceId: "",
      pendingCandidates: [], minimized: false, miniHidden: false, miniPosition: null,
      cameraEnabled: false, screenEnabled: false, localVisualStream: null, remoteVideoStream: null,
      remoteVideoFrameReady: false, remoteVisualKind: "none", remoteScreenSharing: false,
      screenOwnerUserId: "", remoteMuted: false, visualTrackStopBound: null,
      visualRenegotiateRetryTimer: null, pendingVisualRenegotiationReason: "", screenResyncTimer: null, remoteVideoMuteGraceTimer: null,
    };
    call.fingerprintEmojis = resolveCallFingerprintEmojis(call);
    const peerConnection = createPeerConnection(call);
    call.peerConnection = peerConnection;
    localStream.getTracks().forEach((track: MediaStreamTrack) => peerConnection.addTrack(track, localStream));
    await applyAudioSenderProfile(peerConnection, call.callId);
    activeCall = call;
    startOutgoingCallRingtone();
    startCallTicker();
    syncCallUi();
    const offer = await buildOfferWithVoiceProfile(peerConnection);
    await peerConnection.setLocalDescription(offer);
    sendCallRealtime({
      type: "call_invite", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId,
      callerName: getCurrentName(), callerAvatarUrl: String(getCurrentUserAvatarUrl() || "").trim(),
      fingerprintEmojis: call.fingerprintEmojis, offer,
    });
    armCallSetupTimeout(call.callId, "missed");
  } catch (error) {
    setCallError(activeCall, "Failed to start outgoing call.", { error: error instanceof Error ? error.message : String(error) });
    const showToast = (window as any).showToast;
    if (typeof showToast === "function") showToast(error instanceof Error ? error.message : "Failed to start call.", "error");
  }
}

export function upsertGroupParticipant(
  call: Record<string, any>,
  userId: string,
  name: string,
  isMuted: boolean,
  isSpeaking: boolean,
  voiceLevel: number = 0
): void {
  if (!call.groupParticipants) call.groupParticipants = new Map();
  call.groupParticipants.set(userId, { userId, name, isMuted: Boolean(isMuted), isSpeaking: Boolean(isSpeaking), voiceLevel: clampVoiceLevel(voiceLevel) });
}

export async function beginGroupVideoCall(): Promise<void> {
  if (!getIsPrimaryActiveTab()) {
    const showToast = (window as any).showToast;
    if (typeof showToast === "function") showToast("Another tab is active. Close other tabs to control calls here.", "error");
    return;
  }
  const currentDialogSnapshot = getCurrentDialogSnapshot();
  if (!currentDialogSnapshot || currentDialogSnapshot.type !== "group") return;
  if (activeCall) {
    const showToast = (window as any).showToast;
    if (typeof showToast === "function") showToast("Finish the current call first.", "error");
    return;
  }
  try {
    const localStream = await ensureCallLocalStream("");
    localStream.getAudioTracks().forEach((track: MediaStreamTrack) => { track.enabled = false; });
    const callId = groupCallStateByDialog.get(currentDialogSnapshot.id)?.callId || createCallId();
    const existingState = groupCallStateByDialog.get(currentDialogSnapshot.id) || null;
    const startedByCurrentUser = !existingState;
    const currentUserId = getCurrentUserId();
    activeCall = {
      callId, dialogId: currentDialogSnapshot.id, dialogPublicId: currentDialogSnapshot.publicId,
      peerId: currentDialogSnapshot.publicId || "", peerName: currentDialogSnapshot.title || "Group",
      status: "connecting", direction: "outgoing", mode: "group",
      startedByUserId: startedByCurrentUser ? currentUserId : (existingState?.starterUserId || ""),
      localStream, peerConnection: null, connectedAt: Date.now(), isMuted: true,
      inputDeviceId: "", outputDeviceId: "", pendingCandidates: [], minimized: false, miniHidden: false, miniPosition: null,
      groupParticipants: new Map(), groupPeerConnections: new Map(), groupRemoteAudioNodes: new Map(),
    };
    upsertGroupParticipant(activeCall, currentUserId, getCurrentName(), true, false, 0);
    groupCallStateByDialog.set(activeCall.dialogId, {
      callId: activeCall.callId, dialogId: activeCall.dialogId,
      title: activeCall.peerName, status: "connecting",
      starterUserId: activeCall.startedByUserId || currentUserId,
      startedAtMs: Number(existingState?.startedAtMs) || Date.now(),
      participantLastSeenAtMap: new Map([[currentUserId, Date.now()]]),
      participantIds: new Set([currentUserId]), participantCount: 1,
    });
    ensureGroupCallPresencePruneTimer(() => activeCall, syncGroupCallBannerFull);
    if (startedByCurrentUser && postedGroupStartByDialog.get(activeCall.dialogId) !== activeCall.callId) {
      sendCallRealtime({
        type: "call_invite", mode: "group", callId: activeCall.callId, dialogId: activeCall.dialogId,
        dialogPublicId: activeCall.dialogPublicId, callerName: getCurrentName(),
        startedAtMs: Number(groupCallStateByDialog.get(activeCall.dialogId)?.startedAtMs) || Date.now(),
        summarySenderUserId: currentUserId, summaryBody: buildGroupCallMarker("started_video"),
      });
      postedGroupStartByDialog.set(activeCall.dialogId, activeCall.callId);
    }
    sendCallRealtime({
      type: "call_presence", mode: "group", callId: activeCall.callId, dialogId: activeCall.dialogId,
      dialogPublicId: activeCall.dialogPublicId, participantUserId: currentUserId, participantName: getCurrentName(),
      isMuted: true, isSpeaking: false, voiceLevel: 0,
    });
    syncCallUi();
    startGroupLocalVoiceMeter(activeCall, {
      upsertGroupParticipant,
      sendCallRealtime,
      syncCallUi,
      getActiveCall: () => activeCall,
      groupCallStateByDialog,
      currentUserId,
      getCurrentName,
      callModalEl: getCallModal(),
      callMiniCardEl: getCallMiniCard(),
    });
    window.setTimeout(() => {
      if (!activeCall || activeCall.mode !== "group") return;
      activeCall.status = "active";
      startCallTicker();
      const state = groupCallStateByDialog.get(activeCall.dialogId);
      if (state) { state.status = "active"; groupCallStateByDialog.set(activeCall.dialogId, state); }
      syncCallUi();
    }, 1100);
  } catch (error) {
    const showToast = (window as any).showToast;
    if (typeof showToast === "function") showToast(error instanceof Error ? error.message : "Failed to start group call.", "error");
  }
}

export async function acceptIncomingCall(): Promise<void> {
  if (!activeCall || activeCall.status !== "incoming") return;
  try {
    const localStream = await ensureCallLocalStream(activeCall.inputDeviceId || "");
    await loadCallDevices(getCallInputDevice(), getCallOutputDevice());
    const peerConnection = createPeerConnection(activeCall);
    activeCall.peerConnection = peerConnection;
    activeCall.localStream = localStream;
    localStream.getTracks().forEach((track: MediaStreamTrack) => peerConnection.addTrack(track, localStream));
    await applyAudioSenderProfile(peerConnection, activeCall.callId);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(activeCall.remoteOffer));
    while (activeCall.pendingCandidates.length) {
      const candidate = activeCall.pendingCandidates.shift();
      try { await peerConnection.addIceCandidate(candidate); } catch {}
    }
    const answer = await buildAnswerWithVoiceProfile(peerConnection);
    await peerConnection.setLocalDescription(answer);
    activeCall.status = "connecting";
    stopCallRingtone();
    syncCallUi();
    sendCallRealtime({ type: "call_accept", callId: activeCall.callId, dialogId: activeCall.dialogId, dialogPublicId: activeCall.dialogPublicId, answer });
    broadcastCallAcceptedAcrossTabs(activeCall);
  } catch (error) {
    setCallError(activeCall, "Failed to accept incoming call.", { error: error instanceof Error ? error.message : String(error) });
    const showToast = (window as any).showToast;
    if (typeof showToast === "function") showToast(error instanceof Error ? error.message : "Failed to accept call.", "error");
    await finishActiveCall({ summaryBody: buildCallMessageMarker("missed"), remoteEnded: false });
  }
}

export async function endOrRejectCall(): Promise<void> {
  if (!activeCall) return;
  const call = activeCall;
  if (call.mode === "group") {
    openGroupLeaveModal(getGroupCallLeaveModal(), getGroupCallEndForAll());
    return;
  }
  if (call.status === "incoming") {
    sendCallRealtime({ type: "call_reject", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId, reason: "declined", summaryBody: buildCallMessageMarker("declined") });
    await finishActiveCall({ summaryBody: buildCallMessageMarker("declined"), remoteEnded: false });
    return;
  }
  if (call.status === "active") {
    sendCallRealtime({ type: "call_end", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId, reason: "ended", durationSeconds: getCallElapsedSeconds(), summaryBody: buildCallMessageMarker("ended", getCallElapsedSeconds()) });
    await finishActiveCall({ summaryBody: buildCallMessageMarker("ended", getCallElapsedSeconds()), remoteEnded: false });
    return;
  }
  sendCallRealtime({ type: "call_end", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId, reason: "cancelled", summaryBody: buildCallMessageMarker("cancelled") });
  await finishActiveCall({ summaryBody: buildCallMessageMarker("cancelled"), remoteEnded: false });
}

export async function confirmLeaveGroupCall(opts: { endForEveryone?: boolean } = {}): Promise<void> {
  if (!activeCall || activeCall.mode !== "group") {
    closeGroupLeaveModal(getGroupCallLeaveModal());
    return;
  }
  const call = activeCall;
  closeGroupLeaveModal(getGroupCallLeaveModal());
  const currentUserId = getCurrentUserId();
  sendCallRealtime({ type: "call_leave", mode: "group", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId, participantUserId: currentUserId });
  const stateBeforeLeave = groupCallStateByDialog.get(call.dialogId);
  if (stateBeforeLeave && stateBeforeLeave.participantIds instanceof Set) {
    stateBeforeLeave.participantIds.delete(currentUserId);
    stateBeforeLeave.participantCount = stateBeforeLeave.participantIds.size;
    groupCallStateByDialog.set(call.dialogId, stateBeforeLeave);
    syncGroupCallBannerFull();
  }
  if (opts.endForEveryone) {
    const state = groupCallStateByDialog.get(call.dialogId);
    const summarySenderUserId = state?.starterUserId || call.startedByUserId || currentUserId;
    const elapsedSeconds = getGroupCallElapsedSecondsForCall(call);
    sendCallRealtime({ type: "call_end", mode: "group", callId: call.callId, dialogId: call.dialogId, dialogPublicId: call.dialogPublicId, reason: "ended_video", durationSeconds: elapsedSeconds, summarySenderUserId, summaryBody: buildGroupCallMarker("ended_video", elapsedSeconds) });
    groupCallStateByDialog.delete(call.dialogId);
    postedGroupStartByDialog.delete(call.dialogId);
  }
  await finishActiveCall({ summaryBody: "", remoteEnded: false });
}

export async function replaceLocalAudioTrack(deviceId: string): Promise<void> {
  if (!activeCall?.peerConnection) return;
  const nextStream = await ensureCallLocalStream(deviceId);
  const nextTrack = nextStream.getAudioTracks()[0];
  const sender = activeCall.peerConnection.getSenders().find((e: RTCRtpSender) => e.track?.kind === "audio");
  if (sender && nextTrack) await sender.replaceTrack(nextTrack);
  else if (nextTrack) activeCall.peerConnection.addTrack(nextTrack, nextStream);
  activeCall.localStream?.getTracks().forEach((track: MediaStreamTrack) => { try { track.stop(); } catch {} });
  activeCall.localStream = nextStream;
  activeCall.inputDeviceId = deviceId;
  if (activeCall.isMuted && nextTrack) nextTrack.enabled = false;
}

export async function restoreCallModal(): Promise<void> {
  if (!activeCall) return;
  activeCall.minimized = false;
  activeCall.miniHidden = false;
  syncCallUi();
}

export function dismissMiniCallCard(): void {
  if (!activeCall) return;
  activeCall.miniHidden = true;
  syncCallUi();
}

// ── WebSocket event handlers ───────────────────────────────────────────────

export async function handleCallInvite(payload: Record<string, unknown>): Promise<void> {
  logCall("realtime_receive_call_invite", { callId: payload?.callId, dialogId: payload?.dialogId, senderUserId: payload?.senderUserId });
  if (!payload?.callId || !payload?.dialogId) { warnCall("call_invite_ignored_invalid_payload", { payload }); return; }
  const pCallId = String(payload.callId);
  const pDialogId = String(payload.dialogId);
  if (isRecentlyClosedCall(pDialogId, pCallId)) {
    sendCallRealtime({ type: "call_reject", callId: pCallId, dialogId: pDialogId, dialogPublicId: String(payload.dialogPublicId || ""), reason: "stale" });
    return;
  }
  const allDialogs = getAllDialogs();
  const currentDialogSnapshot = getCurrentDialogSnapshot();
  const dialog = allDialogs.find((d: any) => d.id === pDialogId) || (currentDialogSnapshot?.id === pDialogId ? currentDialogSnapshot : null);
  if (!dialog || (dialog.type !== "group" && payload.mode === "group")) return;

  if (payload.mode === "group") {
    if (payload.targetUserId && payload.targetUserId !== getCurrentUserId()) return;
    const wasKnown = groupCallStateByDialog.has(pDialogId);
    groupCallStateByDialog.set(pDialogId, {
      callId: pCallId, dialogId: pDialogId, title: dialog?.title || "Group video chat",
      status: "connecting", starterUserId: String(payload.senderUserId || ""),
      startedAtMs: Number(payload.startedAtMs) || Date.now(),
      participantLastSeenAtMap: new Map(payload.senderUserId ? [[String(payload.senderUserId), Date.now()]] : []),
      participantIds: new Set(payload.senderUserId ? [String(payload.senderUserId)] : []),
      participantCount: payload.senderUserId ? 1 : 0,
    });
    ensureGroupCallPresencePruneTimer(() => activeCall, syncGroupCallBannerFull);
    syncGroupCallBannerFull();
    if (!wasKnown && payload.senderUserId !== getCurrentUserId() && !payload.offer) {
      try {
        const showToast = (window as any).showToast;
        if (typeof showToast === "function") showToast("Group call started in " + String(dialog?.title || "group"), "info");
      } catch {}
      try {
        const isWindowInactive = (window as any).isWindowInactive;
        const isNotificationOwner = (window as any).isNotificationOwner;
        const ensureNotificationPermission = (window as any).ensureNotificationPermission;
        if (typeof isWindowInactive === "function" && typeof isNotificationOwner === "function" && isWindowInactive() && isNotificationOwner()) {
          const permission = await ensureNotificationPermission();
          if (permission === "granted") {
            const n = new Notification("Group call started", {
              body: String(dialog?.title || "Group"), badge: "/assets/logo.jpg",
              tag: "group_call_started_" + pDialogId, renotify: false,
            } as NotificationOptions & Record<string, unknown>);
            n.onclick = () => { try { window.focus(); } catch {} try { void restoreCallModal(); } catch {} try { n.close(); } catch {} };
          }
        }
      } catch {}
    }
    if (!activeCall || activeCall.mode !== "group" || activeCall.dialogId !== pDialogId || !payload.offer) return;
    const peerUserId = String(payload.senderUserId || "");
    if (!peerUserId || peerUserId === getCurrentUserId()) return;
    try {
      const pc = createGroupPeerConnection(activeCall, peerUserId, String(payload.callerName || "User"));
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(payload.offer as any));
      const answer = await buildAnswerWithVoiceProfile(pc);
      await pc.setLocalDescription(answer);
      sendCallRealtime({ type: "call_accept", mode: "group", callId: pCallId, dialogId: pDialogId, dialogPublicId: String(payload.dialogPublicId || activeCall.dialogPublicId || ""), targetUserId: peerUserId, answer });
    } catch (error) {
      warnCall("group_answer_failed", { peerUserId, error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (!payload.offer) { warnCall("call_invite_ignored_missing_offer", { payload }); return; }
  if (payload.senderUserId && payload.senderUserId === getCurrentUserId()) return;
  if (!getIsPrimaryActiveTab()) return;

  if (activeCall && activeCall.dialogId === pDialogId && (activeCall.status === "outgoing" || activeCall.status === "connecting" || activeCall.status === "active")) {
    if (payload.renegotiate && payload.offer && activeCall.callId === pCallId && activeCall.peerConnection) {
      try {
        if (payload.reason === "screen_start") { activeCall.remoteVisualKind = "screen"; activeCall.remoteScreenSharing = true; activeCall.screenOwnerUserId = String(payload.senderUserId || activeCall.screenOwnerUserId || ""); }
        else if (payload.reason === "camera_start") { activeCall.remoteVisualKind = "camera"; activeCall.remoteScreenSharing = false; activeCall.screenOwnerUserId = ""; }
        else if (payload.reason === "visual_stop") { activeCall.remoteVisualKind = "none"; activeCall.remoteVideoStream = null; activeCall.remoteVideoFrameReady = false; activeCall.remoteScreenSharing = false; activeCall.screenOwnerUserId = ""; }
        syncCallVideoStageFull(); syncCallUi();
        await activeCall.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer as any));
        const answer = await buildAnswerWithVoiceProfile(activeCall.peerConnection);
        await activeCall.peerConnection.setLocalDescription(answer);
        sendCallRealtime({ type: "call_accept", callId: activeCall.callId, dialogId: activeCall.dialogId, dialogPublicId: activeCall.dialogPublicId || "", answer, renegotiate: true, reason: payload.reason || "" });
      } catch (error) { warnCall("renegotiate_visual_offer_failed", { reason: payload.reason || "", error: error instanceof Error ? error.message : String(error) }); }
    }
    return;
  }

  if (activeCall && activeCall.callId !== pCallId) {
    sendCallRealtime({ type: "call_reject", callId: pCallId, dialogId: pDialogId, dialogPublicId: String(payload.dialogPublicId || dialog?.publicId || ""), reason: "busy" });
    return;
  }

  activeCall = {
    callId: pCallId, dialogId: pDialogId, dialogPublicId: String(payload.dialogPublicId || dialog?.publicId || ""),
    peerId: String(payload.senderUserId || dialog?.peerUserId || ""),
    peerName: String(payload.callerName || dialog?.title || "TheGraphT"),
    peerAvatarUrl: String(payload.callerAvatarUrl || "") || resolveDirectPeerAvatarByUserId(String(payload.senderUserId || ""), getAllDialogs()) || (dialog as any)?.avatarUrl || "",
    status: "incoming", direction: "incoming", remoteOffer: payload.offer,
    peerConnection: null, localStream: null, connectedAt: 0, isMuted: false,
    inputDeviceId: "", outputDeviceId: "", pendingCandidates: [], minimized: false, miniHidden: false, miniPosition: null,
    cameraEnabled: false, screenEnabled: false, localVisualStream: null, remoteVideoStream: null,
    remoteVideoFrameReady: false, remoteVisualKind: "none", remoteScreenSharing: false, screenOwnerUserId: "",
    remoteMuted: false, visualTrackStopBound: null, visualRenegotiateRetryTimer: null,
    pendingVisualRenegotiationReason: "", screenResyncTimer: null, remoteVideoMuteGraceTimer: null,
  };
  activeCall.fingerprintEmojis = sanitizeFingerprintEmojis(payload.fingerprintEmojis as any);

  if (claimCallRingtonePlayback(pCallId)) startIncomingCallRingtone();
  startCallTicker();
  syncCallUi();
  armCallSetupTimeout(pCallId, "missed");

  // Incoming call notification
  const isWindowInactive = (window as any).isWindowInactive;
  const isNotificationOwner = (window as any).isNotificationOwner;
  const ensureNotificationPermission = (window as any).ensureNotificationPermission;
  if (typeof isWindowInactive === "function" && typeof isNotificationOwner === "function" && isWindowInactive() && isNotificationOwner() && activeCall) {
    const claimNotificationDelivery = (window as any).claimNotificationDelivery;
    if (typeof claimNotificationDelivery !== "function" || claimNotificationDelivery("call", pCallId, 20000)) {
      const playSound = (window as any).playSound;
      if (typeof playSound === "function") playSound("message");
      try {
        const permission = await ensureNotificationPermission();
        if (permission === "granted") {
          const notifAvatarUrl = String(activeCall?.peerAvatarUrl || "").trim() || resolveDialogAvatarUrlForDirectCall(activeCall, getAllDialogs()) || getAvatarMeta(activeCall?.peerId || activeCall?.dialogId || activeCall?.peerName || "?", activeCall?.peerName || "?").avatarUrl;
          const n = new Notification((activeCall.peerName || "User") + " is calling you", {
            body: "Tap to open the call", icon: notifAvatarUrl, badge: "/assets/logo.jpg",
            tag: "call_" + pCallId, renotify: true,
          } as NotificationOptions & Record<string, unknown>);
          n.onclick = () => { window.focus(); void restoreCallModal(); n.close(); };
        }
      } catch {}
    }
  }
}

export async function handleCallAccept(payload: Record<string, unknown>): Promise<void> {
  logCall("realtime_receive_call_accept", { callId: payload?.callId, dialogId: payload?.dialogId });
  if (payload?.mode === "group") {
    if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== payload.callId) return;
    if (payload.targetUserId && payload.targetUserId !== getCurrentUserId()) return;
    const peerUserId = String(payload.senderUserId || "");
    if (!peerUserId || !payload.answer) return;
    const entry = activeCall.groupPeerConnections instanceof Map ? activeCall.groupPeerConnections.get(peerUserId) : null;
    if (!entry?.peerConnection) return;
    try { await entry.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer as any)); }
    catch (error) { warnCall("group_set_remote_answer_failed", { peerUserId, error: error instanceof Error ? error.message : String(error) }); }
    return;
  }
  if (!activeCall || activeCall.callId !== payload.callId || !payload.answer || !activeCall.peerConnection) { warnCall("call_accept_ignored_state_mismatch", { payloadCallId: payload?.callId, activeCallId: activeCall?.callId, hasPeerConnection: Boolean(activeCall?.peerConnection) }); return; }
  if (callTimeoutTimer) { window.clearTimeout(callTimeoutTimer); callTimeoutTimer = null; }
  try {
    await activeCall.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer as any));
    if (!payload.renegotiate) activeCall.status = "connecting";
    stopCallRingtone();
    if (!payload.renegotiate) armCallSetupTimeout(activeCall.callId, "no_connect");
    while (activeCall.pendingCandidates.length) {
      const candidate = activeCall.pendingCandidates.shift();
      try { await activeCall.peerConnection.addIceCandidate(candidate); } catch {}
    }
    syncCallUi();
  } catch (error) { setCallError(activeCall, "Failed to apply remote answer SDP.", { error: error instanceof Error ? error.message : String(error) }); }
}

export async function handleCallCandidate(payload: Record<string, unknown>): Promise<void> {
  logCall("realtime_receive_call_candidate", { callId: payload?.callId, hasCandidate: Boolean(payload?.candidate) });
  if (payload?.mode === "group") {
    if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== payload.callId) return;
    if (payload.targetUserId && payload.targetUserId !== getCurrentUserId()) return;
    const peerUserId = String(payload.senderUserId || "");
    const entry = activeCall.groupPeerConnections instanceof Map ? activeCall.groupPeerConnections.get(peerUserId) : null;
    if (!entry?.peerConnection || !payload.candidate) return;
    try { await entry.peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate as any)); }
    catch (error) { warnCall("group_add_ice_failed", { peerUserId, error: error instanceof Error ? error.message : String(error) }); }
    return;
  }
  if (!activeCall || activeCall.callId !== payload.callId || !payload.candidate) return;
  const candidate = new RTCIceCandidate(payload.candidate as any);
  if (!activeCall.peerConnection || !activeCall.peerConnection.remoteDescription) {
    activeCall.pendingCandidates.push(candidate);
    return;
  }
  try { await activeCall.peerConnection.addIceCandidate(candidate); }
  catch (error) { setCallError(activeCall, "Failed to add ICE candidate.", { error: error instanceof Error ? error.message : String(error) }); }
}

export async function handleCallReject(payload: Record<string, unknown>): Promise<void> {
  logCall("realtime_receive_call_reject", { callId: payload?.callId, reason: payload?.reason });
  rememberRecentlyClosedCall(String(payload?.dialogId || ""), String(payload?.callId || ""));
  if (!activeCall || activeCall.callId !== payload.callId) return;
  stopCallRingtone();
  const summary = payload.reason === "busy" ? "Busy" : "Declined call";
  await finishActiveCall({ summaryBody: "", remoteEnded: true });
  const showToast = (window as any).showToast;
  if (typeof showToast === "function") showToast(summary, "info");
}

export async function handleCallPresence(payload: Record<string, unknown>): Promise<void> {
  if (!payload?.callId || !payload?.dialogId || payload?.mode !== "group") return;
  const pDialogId = String(payload.dialogId);
  const allDialogs = getAllDialogs();
  const currentDialogSnapshot = getCurrentDialogSnapshot();
  const knownDialog = allDialogs.find((d: any) => d.id === pDialogId) || (currentDialogSnapshot?.id === pDialogId ? currentDialogSnapshot : null);
  if (!knownDialog || (knownDialog as any).type !== "group") return;
  const state = groupCallStateByDialog.get(pDialogId) || {
    callId: String(payload.callId), dialogId: pDialogId,
    title: currentDialogSnapshot?.id === pDialogId ? (currentDialogSnapshot?.title || "Group video chat") : "Group video chat",
    status: "active", starterUserId: String(payload.senderUserId || ""),
    startedAtMs: Number(payload.startedAtMs) || Date.now(),
    participantLastSeenAtMap: new Map(), participantIds: new Set(), participantCount: 0,
  };
  if (!(state.participantIds instanceof Set)) state.participantIds = new Set();
  if (!(state.participantLastSeenAtMap instanceof Map)) state.participantLastSeenAtMap = new Map();
  const participantUserId = String(payload.participantUserId || payload.senderUserId || "");
  if (participantUserId) { state.participantIds.add(participantUserId); state.participantLastSeenAtMap.set(participantUserId, Date.now()); }
  state.status = "active";
  state.participantCount = state.participantIds.size;
  state.callId = String(payload.callId || state.callId);
  groupCallStateByDialog.set(pDialogId, state);
    ensureGroupCallPresencePruneTimer(() => activeCall, syncGroupCallBannerFull);
  const { pruneStaleGroupCallParticipants } = await import("./group-call-state");
  pruneStaleGroupCallParticipants(activeCall);
  if (!activeCall || activeCall.mode !== "group" || activeCall.dialogId !== pDialogId) { syncGroupCallBannerFull(); return; }
  if (activeCall.callId !== payload.callId) activeCall.callId = String(payload.callId);
  if (activeCall.status !== "active") activeCall.status = "active";
  startCallTicker();
  const participantUserIdForCall = String(payload.participantUserId || payload.senderUserId || "");
  const participantMuted = Boolean(payload.isMuted);
  upsertGroupParticipant(activeCall, participantUserIdForCall, String(payload.participantName || "User"), participantMuted, !participantMuted, participantMuted ? 0 : clampVoiceLevel(payload.voiceLevel));
  if (participantUserIdForCall && participantUserIdForCall !== getCurrentUserId()) {
    void maybeStartGroupPeerNegotiation(activeCall, participantUserIdForCall, String(payload.participantName || "User"));
  }
  syncCallUi();
}

export async function handleCallLeave(payload: Record<string, unknown>): Promise<void> {
  if (!payload?.callId || payload?.mode !== "group") return;
  const pDialogId = String(payload?.dialogId || "");
  const state = pDialogId ? groupCallStateByDialog.get(pDialogId) : undefined;
  if (state && state.participantIds instanceof Set) {
    const puid = String(payload.participantUserId || payload.senderUserId || "");
    if (puid) { state.participantIds.delete(puid); if (state.participantLastSeenAtMap instanceof Map) state.participantLastSeenAtMap.delete(puid); state.participantCount = state.participantIds.size; groupCallStateByDialog.set(pDialogId, state); }
  }
  if (!pDialogId) {
    for (const [dId, entry] of groupCallStateByDialog.entries()) {
      if (entry?.callId !== payload.callId || !(entry.participantIds instanceof Set)) continue;
      const puid = String(payload.participantUserId || payload.senderUserId || "");
      if (puid) { entry.participantIds.delete(puid); if (entry.participantLastSeenAtMap instanceof Map) entry.participantLastSeenAtMap.delete(puid); }
      entry.participantCount = entry.participantIds.size;
      groupCallStateByDialog.set(dId, entry);
    }
  }
  if (!activeCall || activeCall.callId !== payload.callId || activeCall.mode !== "group") { syncGroupCallBannerFull(); return; }
  if (activeCall.groupParticipants instanceof Map) {
    activeCall.groupParticipants.delete(String(payload.participantUserId || payload.senderUserId || ""));
    syncCallUi();
  }
}

export async function handleCallScreenState(payload: Record<string, unknown>): Promise<void> {
  if (!payload?.callId || !activeCall || activeCall.callId !== payload.callId || activeCall.mode === "group") return;
  const remoteUserId = String(payload.senderUserId || "").trim();
  const isActive = Boolean(payload.active);
  const reason = String(payload.reason || "");
  if (isActive && activeCall.screenEnabled) {
    sendCallRealtime({ type: "call_screen_state", callId: activeCall.callId, dialogId: activeCall.dialogId, dialogPublicId: activeCall.dialogPublicId, active: false, reason: "busy" });
    return;
  }
  if (!isActive && reason === "busy" && activeCall.screenEnabled && remoteUserId) {
    await stopDirectVisualStream(activeCall, { notify: false });
    const showToast = (window as any).showToast;
    if (typeof showToast === "function") showToast("Screen sharing is already active on the other side.", "error");
  }
  activeCall.remoteScreenSharing = isActive;
  activeCall.screenOwnerUserId = isActive ? remoteUserId : "";
  if (isActive) {
    activeCall.remoteVisualKind = "screen";
    if (activeCall.screenResyncTimer) window.clearTimeout(activeCall.screenResyncTimer);
    activeCall.screenResyncTimer = window.setTimeout(() => {
      if (!activeCall || activeCall.callId !== payload.callId || !activeCall.remoteScreenSharing) return;
      activeCall.screenResyncTimer = null;
      void renegotiateDirectVisualTrack(activeCall, "screen_resync:timer");
    }, 1400);
  }
  if (!isActive) {
    if (activeCall.screenResyncTimer) { window.clearTimeout(activeCall.screenResyncTimer); activeCall.screenResyncTimer = null; }
    activeCall.remoteVideoStream = null;
    activeCall.remoteVideoFrameReady = false;
    activeCall.remoteVisualKind = "none";
  }
  syncCallVideoStageFull();
  syncCallUi();
}

export function handleCallMuteState(payload: Record<string, unknown>): void {
  if (!payload?.callId || !activeCall || activeCall.callId !== payload.callId || activeCall.mode === "group") return;
  const senderUserId = String(payload.senderUserId || "").trim();
  if (senderUserId && senderUserId === getCurrentUserId()) return;
  activeCall.remoteMuted = Boolean(payload.isMuted);
  syncCallParticipantsGrid(activeCall, getCallModal(), {
    currentUserId: getCurrentUserId(), currentUserDisplayName: getCurrentUserDisplayName(),
    getCurrentName, allDialogs: getAllDialogs(),
  });
}

export async function handleCallEnd(payload: Record<string, unknown>): Promise<void> {
  logCall("realtime_receive_call_end", { callId: payload?.callId, reason: payload?.reason });
  rememberRecentlyClosedCall(String(payload?.dialogId || ""), String(payload?.callId || ""));
  if (payload?.mode === "group" && payload?.dialogId) {
    groupCallStateByDialog.delete(String(payload.dialogId));
    postedGroupStartByDialog.delete(String(payload.dialogId));
    syncGroupCallBannerFull();
  }
  if (!activeCall || activeCall.callId !== payload.callId) return;
  stopCallRingtone();
  await finishActiveCall({ summaryBody: "", remoteEnded: true });
  const showToast = (window as any).showToast;
  if (typeof showToast === "function") {
    if (payload.reason === "missed") { showToast("Missed call.", "info"); return; }
    if (payload.reason === "no_connect") showToast("Failed to establish call connection.", "error");
  }
}

// ── Init: expose on window and hook storage/pagehide events ───────────────

function notifyCallStateOnPageUnload(): void {
  if (!activeCall) return;
  try {
    if (activeCall.mode === "group") {
      sendCallRealtime({ type: "call_leave", mode: "group", callId: activeCall.callId, dialogId: activeCall.dialogId, dialogPublicId: activeCall.dialogPublicId, participantUserId: getCurrentUserId() });
      return;
    }
    sendCallRealtime({ type: "call_end", callId: activeCall.callId, dialogId: activeCall.dialogId, dialogPublicId: activeCall.dialogPublicId, reason: "reloaded" });
  } catch {}
}

export function initCallSignaling(ws: WebSocket): void {
  realtimeSocket = ws;
}

// Expose call actions on window for legacy sidebar.js / bootstrap.js
(window as any).beginOutgoingCall = beginOutgoingCall;
(window as any).beginGroupVideoCall = beginGroupVideoCall;
(window as any).acceptIncomingCall = acceptIncomingCall;
(window as any).endOrRejectCall = endOrRejectCall;
(window as any).confirmLeaveGroupCall = confirmLeaveGroupCall;
(window as any).restoreCallModal = restoreCallModal;
(window as any).dismissMiniCallCard = dismissMiniCallCard;
(window as any).replaceLocalAudioTrack = replaceLocalAudioTrack;
(window as any).applyCallOutputDevice = applyCallOutputDevice;
(window as any).upsertGroupParticipant = upsertGroupParticipant;
(window as any).handleCallInvite = handleCallInvite;
(window as any).handleCallAccept = handleCallAccept;
(window as any).handleCallCandidate = handleCallCandidate;
(window as any).handleCallReject = handleCallReject;
(window as any).handleCallPresence = handleCallPresence;
(window as any).handleCallLeave = handleCallLeave;
(window as any).handleCallScreenState = handleCallScreenState;
(window as any).handleCallMuteState = handleCallMuteState;
(window as any).handleCallEnd = handleCallEnd;
(window as any).initCallSignaling = initCallSignaling;
(window as any).sendCallRealtime = sendCallRealtime;
(window as any).finishActiveCall = finishActiveCall;
(window as any).__getActiveCall = () => activeCall;

window.addEventListener("storage", (event) => {
  if (!event || event.key !== CALL_ACCEPT_BROADCAST_STORAGE_KEY || !event.newValue) return;
  let parsed: any = null;
  try { parsed = JSON.parse(event.newValue); } catch { parsed = null; }
  if (!parsed || typeof parsed !== "object") return;
  const callId = String(parsed.callId || "");
  const dialogId = String(parsed.dialogId || "");
  if (!callId || !dialogId || !activeCall) return;
  if (activeCall.callId !== callId || activeCall.dialogId !== dialogId) return;
  if (activeCall.status !== "incoming") return;
  stopCallRingtone();
  void finishActiveCall({ summaryBody: "", remoteEnded: true });
});

window.addEventListener("pagehide", notifyCallStateOnPageUnload);
window.addEventListener("beforeunload", notifyCallStateOnPageUnload);
