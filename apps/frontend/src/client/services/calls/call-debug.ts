// call-debug.ts — ported from calls/call-debug.js
// Provides log buffer, warn/error helpers, ringtone controls and debug dump utilities.

export interface CallLogEntry {
  ts: string;
  level: "info" | "warn" | "error";
  event: string;
  details: Record<string, unknown>;
}

// ── Log buffer ─────────────────────────────────────────────────────────────

const CALL_DEBUG_PREFIX = "[TheGraphT Call]";
const MAX_LOG_ENTRIES = 800;

const callDebugLogBuffer: CallLogEntry[] = Array.isArray(
  (window as any).__THEGRAPHT_CALL_LOGS__
)
  ? (window as any).__THEGRAPHT_CALL_LOGS__
  : [];

(window as any).__THEGRAPHT_CALL_LOGS__ = callDebugLogBuffer;

function pushCallLog(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown> = {}
): void {
  const entry: CallLogEntry = { ts: new Date().toISOString(), level, event, details };
  callDebugLogBuffer.push(entry);
  if (callDebugLogBuffer.length > MAX_LOG_ENTRIES) {
    callDebugLogBuffer.splice(0, callDebugLogBuffer.length - MAX_LOG_ENTRIES);
  }
}

export function logCall(event: string, details: Record<string, unknown> = {}): void {
  pushCallLog("info", event, details);
  try {
    console.info(CALL_DEBUG_PREFIX, event, details);
  } catch {}
}

export function warnCall(event: string, details: Record<string, unknown> = {}): void {
  pushCallLog("warn", event, details);
  try {
    console.warn(CALL_DEBUG_PREFIX, event, details);
  } catch {}
}

export function errCall(event: string, details: Record<string, unknown> = {}): void {
  pushCallLog("error", event, details);
  try {
    console.error(CALL_DEBUG_PREFIX, event, details);
  } catch {}
}

// ── Debug dump utilities (exposed on window) ───────────────────────────────

(window as any).__dumpTheGraphTCallVideoLogs = (): string => {
  const logs: CallLogEntry[] = Array.isArray((window as any).__THEGRAPHT_CALL_LOGS__)
    ? (window as any).__THEGRAPHT_CALL_LOGS__
    : [];
  return JSON.stringify(
    logs.filter((e) => String(e?.event || "").startsWith("video_debug_")),
    null,
    2
  );
};

(window as any).__dumpTheGraphTCallVideoLogsAround = (
  from: number = 7,
  to: number = 12
): string => {
  const logs: CallLogEntry[] = Array.isArray((window as any).__THEGRAPHT_CALL_LOGS__)
    ? (window as any).__THEGRAPHT_CALL_LOGS__
    : [];
  return JSON.stringify(
    logs.filter(
      (e) =>
        String(e?.event || "").startsWith("video_debug_") &&
        Number((e?.details as any)?.elapsed || 0) >= Number(from || 0) &&
        Number((e?.details as any)?.elapsed || 0) <= Number(to || 0)
    ),
    null,
    2
  );
};

(window as any).__clearTheGraphTCallLogs = (): void => {
  if (Array.isArray((window as any).__THEGRAPHT_CALL_LOGS__)) {
    (window as any).__THEGRAPHT_CALL_LOGS__.length = 0;
  }
};

(window as any).__dumpTheGraphTCallIncident = (
  callId: string = "",
  fromSecond: number = 0
): string => {
  const logs: CallLogEntry[] = Array.isArray((window as any).__THEGRAPHT_CALL_LOGS__)
    ? (window as any).__THEGRAPHT_CALL_LOGS__
    : [];
  const targetCallId = String(callId || "").trim();
  const from = Number(fromSecond || 0);
  const includeEvent = (eventName: unknown): boolean =>
    String(eventName || "").startsWith("video_debug_") ||
    String(eventName || "").startsWith("realtime_receive_call_") ||
    String(eventName || "").startsWith("pc_") ||
    String(eventName || "").startsWith("ice_") ||
    String(eventName || "") === "realtime_send" ||
    String(eventName || "") === "setup_timeout_armed" ||
    String(eventName || "") === "finish_call" ||
    String(eventName || "") === "call_error";
  const filtered = logs.filter((entry) => {
    if (!includeEvent(entry?.event)) return false;
    const elapsed = Number((entry?.details as any)?.elapsed || 0);
    if (elapsed < from) return false;
    if (!targetCallId) return true;
    return String((entry?.details as any)?.callId || "") === targetCallId;
  });
  return JSON.stringify(filtered, null, 2);
};

// ── Track/stream state helpers ─────────────────────────────────────────────

export function getDebugTrackState(track: MediaStreamTrack | null | undefined): Record<string, unknown> | null {
  if (!track) return null;
  return {
    id: track.id || "",
    kind: track.kind || "",
    label: track.label || "",
    enabled: Boolean(track.enabled),
    muted: Boolean(track.muted),
    readyState: track.readyState || "",
  };
}

export function getDebugStreamState(stream: unknown): Record<string, unknown> | null {
  if (!(stream instanceof MediaStream)) return null;
  return {
    id: stream.id || "",
    audioTracks: stream.getAudioTracks().map(getDebugTrackState),
    videoTracks: stream.getVideoTracks().map(getDebugTrackState),
  };
}

// ── Call error helpers ─────────────────────────────────────────────────────

export function setCallError(
  activeCallVal: Record<string, any> | null,
  message: string,
  details: Record<string, unknown> = {}
): void {
  if (!activeCallVal) return;
  activeCallVal.lastError = message;
  activeCallVal.lastErrorAt = Date.now();
  errCall("call_error", {
    callId: activeCallVal.callId,
    status: activeCallVal.status,
    message,
    ...details,
  });
}

export function getCallErrorForUi(message: unknown): string {
  const normalized = typeof message === "string" ? message.trim() : "";
  if (!normalized) return "";
  if (/^ICE\s+\d+:/i.test(normalized)) return "network issue, retrying connection";
  return normalized.length > 120 ? normalized.slice(0, 117) + "..." : normalized;
}

// ── Ringtone nodes (lazy-init) ─────────────────────────────────────────────

let outgoingCallRingtoneNode: HTMLAudioElement | null = null;
let incomingCallRingtoneNode: HTMLAudioElement | null = null;

export function initRingtoneNodes(
  outgoingUrl: string,
  incomingUrl: string
): void {
  // Pre-warm ringtone URLs from server-injected config.
  // Nodes are still lazy-created on first use.
  (window as any).__callRingtoneUrls = { outgoing: outgoingUrl, incoming: incomingUrl };
}

function ensureOutgoingCallRingtoneNode(): HTMLAudioElement {
  if (outgoingCallRingtoneNode) return outgoingCallRingtoneNode;
  const url = (window as any).__callRingtoneUrls?.outgoing || "";
  outgoingCallRingtoneNode = new Audio(url);
  outgoingCallRingtoneNode.loop = false;
  outgoingCallRingtoneNode.preload = "auto";
  return outgoingCallRingtoneNode;
}

function ensureIncomingCallRingtoneNode(): HTMLAudioElement {
  if (incomingCallRingtoneNode) return incomingCallRingtoneNode;
  const url = (window as any).__callRingtoneUrls?.incoming || "";
  incomingCallRingtoneNode = new Audio(url);
  incomingCallRingtoneNode.loop = true;
  incomingCallRingtoneNode.preload = "auto";
  return incomingCallRingtoneNode;
}

export function startOutgoingCallRingtone(): void {
  const node = ensureOutgoingCallRingtoneNode();
  try {
    node.currentTime = 0;
    const p = node.play();
    if (p?.catch) p.catch(() => {});
  } catch {}
}

export function startIncomingCallRingtone(): void {
  const node = ensureIncomingCallRingtoneNode();
  try {
    node.currentTime = 0;
    const p = node.play();
    if (p?.catch) p.catch(() => {});
  } catch {}
}

export function claimCallRingtonePlayback(callId: string): boolean {
  if (!callId) return false;
  const claim = (window as any).claimNotificationDelivery;
  if (typeof claim === "function") {
    return claim("call_ringtone", callId, 20000);
  }
  return true;
}

export function stopCallRingtone(): void {
  [outgoingCallRingtoneNode, incomingCallRingtoneNode].forEach((node) => {
    if (!node) return;
    try {
      node.pause();
      node.currentTime = 0;
    } catch {}
  });
}

// ── Call message marker ────────────────────────────────────────────────────

export function buildCallMessageMarker(kind: string, durationSeconds: number = 0): string {
  const safeDuration = Math.max(0, Math.floor(durationSeconds || 0));
  return kind === "ended"
    ? "[[call:" + kind + ":" + safeDuration + "]]"
    : "[[call:" + kind + "]]";
}

// ── Video debug helpers ────────────────────────────────────────────────────

export function buildCallVideoDebugDetails(
  activeCallVal: Record<string, any> | null,
  getCallElapsedSeconds: () => number,
  extra: Record<string, unknown> = {}
): Record<string, unknown> {
  const remoteVideo = document.getElementById("remote-screen-video");
  const placeholder = document.getElementById("call-main-placeholder");
  const localPreview = document.getElementById("local-video-preview");
  const callModal = (window as any).__callModal || null;
  const modalClassList =
    callModal?.classList ? Array.from(callModal.classList) : [];
  const remoteElementStream =
    remoteVideo instanceof HTMLVideoElement ? remoteVideo.srcObject : null;
  const localPreviewStream =
    localPreview instanceof HTMLVideoElement ? localPreview.srcObject : null;
  return {
    callId: activeCallVal?.callId || "",
    status: activeCallVal?.status || "",
    direction: activeCallVal?.direction || "",
    elapsed: getCallElapsedSeconds(),
    screenEnabled: Boolean(activeCallVal?.screenEnabled),
    remoteScreenSharing: Boolean(activeCallVal?.remoteScreenSharing),
    screenOwnerUserId: activeCallVal?.screenOwnerUserId || "",
    cameraEnabled: Boolean(activeCallVal?.cameraEnabled),
    hasActiveRemoteVideoStream: activeCallVal?.remoteVideoStream instanceof MediaStream,
    activeRemoteVideoStream: getDebugStreamState(activeCallVal?.remoteVideoStream),
    localVisualStream: getDebugStreamState(activeCallVal?.localVisualStream),
    remoteElementStream: getDebugStreamState(remoteElementStream),
    localPreviewStream: getDebugStreamState(localPreviewStream),
    remoteVideoElement:
      remoteVideo instanceof HTMLVideoElement
        ? {
            hidden: Boolean(remoteVideo.hidden),
            display: remoteVideo.style.display || "",
            className: remoteVideo.className || "",
            paused: Boolean(remoteVideo.paused),
            readyState: remoteVideo.readyState,
            videoWidth: remoteVideo.videoWidth,
            videoHeight: remoteVideo.videoHeight,
            currentTime: Number.isFinite(remoteVideo.currentTime)
              ? Number(remoteVideo.currentTime.toFixed(2))
              : 0,
          }
        : null,
    placeholder:
      placeholder instanceof HTMLElement
        ? {
            hidden: Boolean(placeholder.hidden),
            display: placeholder.style.display || "",
          }
        : null,
    modal: {
      classList: modalClassList,
      screenShareActive: (modalClassList as string[]).includes("screen-share-active"),
      hasDirectVisuals: (modalClassList as string[]).includes("has-direct-visuals"),
      hasScreenShare: (modalClassList as string[]).includes("has-screen-share"),
      directVisualLayout: callModal?.dataset?.directVisualLayout || "",
    },
    peerConnection: activeCallVal?.peerConnection
      ? {
          connectionState: activeCallVal.peerConnection.connectionState,
          iceConnectionState: activeCallVal.peerConnection.iceConnectionState,
          signalingState: activeCallVal.peerConnection.signalingState,
        }
      : null,
    ...extra,
  };
}

export function logCallVideoDebug(
  event: string,
  activeCallVal: Record<string, any> | null,
  getCallElapsedSeconds: () => number,
  details: Record<string, unknown> = {}
): void {
  logCall("video_debug_" + event, buildCallVideoDebugDetails(activeCallVal, getCallElapsedSeconds, details));
}

export function logCallVideoDebugSnapshot(
  source: string,
  activeCallVal: Record<string, any> | null,
  getCallElapsedSeconds: () => number,
  opts: { force?: boolean } = {}
): void {
  if (!activeCallVal || activeCallVal.mode === "group") return;
  const elapsed = getCallElapsedSeconds();
  const remoteTrack =
    activeCallVal.remoteVideoStream instanceof MediaStream
      ? activeCallVal.remoteVideoStream.getVideoTracks()[0] || null
      : null;
  const callModal = (window as any).__callModal || null;
  const signature = [
    elapsed,
    activeCallVal.screenEnabled ? 1 : 0,
    activeCallVal.remoteScreenSharing ? 1 : 0,
    activeCallVal.cameraEnabled ? 1 : 0,
    remoteTrack?.id || "",
    remoteTrack?.muted ? 1 : 0,
    remoteTrack?.readyState || "",
    callModal?.classList?.contains("screen-share-active") ? 1 : 0,
    callModal?.classList?.contains("has-direct-visuals") ? 1 : 0,
  ].join("|");
  const { force = false } = opts;
  if (!force && elapsed > 20 && activeCallVal.__lastVideoDebugSignature === signature) return;
  if (!force && activeCallVal.__lastVideoDebugSecond === elapsed && activeCallVal.__lastVideoDebugSignature === signature)
    return;
  activeCallVal.__lastVideoDebugSecond = elapsed;
  activeCallVal.__lastVideoDebugSignature = signature;
  logCallVideoDebug("snapshot", activeCallVal, getCallElapsedSeconds, { source, signature });
}
