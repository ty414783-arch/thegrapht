// call-ui.ts — ported from calls/call-ui.js
// UI sync, video stage management, avatar helpers, participant cards, device loading.

import {
  logCall,
  warnCall,
  logCallVideoDebug,
  logCallVideoDebugSnapshot,
  getDebugTrackState,
  getDebugStreamState,
  getCallErrorForUi,
} from "./call-debug";
import { buildAnimatedDots, formatCallDuration } from "./call-utils";
import { buildCallFingerprintEmojiMarkup, clampVoiceLevel, setCallVoiceLevel } from "./call-webrtc";
import {
  syncGroupCallBanner,
  ensureGroupCallPresenceHeartbeat,
  groupCallStateByDialog,
} from "./group-call-state";
import { closeExpandedScreenPreview } from "./call-utils";

// ── Avatar helpers ─────────────────────────────────────────────────────────

const avatarPalettes: [string, string][] = [
  ["#ffa48c", "#ff7870"],  // soft orange-red
  ["#8cd8ff", "#5cb5ff"],  // soft sky blue
  ["#7be3e3", "#45b0b0"],  // soft cyan teal
  ["#a4f08c", "#6dbd59"],  // soft green
  ["#e8a8ff", "#b07bf0"],  // soft violet/purple
  ["#ff9dbb", "#eb608f"],  // soft pink
  ["#ffb77c", "#ff8a7a"],  // soft sunset orange
  ["#93a5ff", "#637ce6"],  // soft indigo
  ["#6beed1", "#33be9e"],  // soft teal
  ["#ffd954", "#ffa726"],  // soft amber/gold
  ["#d7ccc8", "#a1887f"],  // soft warm brown
  ["#b0bec5", "#78909c"],  // soft slate blue-grey
];

function hashSeed(seed: string): number {
  const text = String(seed || "?");
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildGeneratedAvatarUrl(seedSource: string, labelSource: string): string {
  const seed = String(seedSource || labelSource || "?");
  const hash = hashSeed(seed);
  const palette = avatarPalettes[hash % avatarPalettes.length];
  const rawLabel = String(labelSource || seedSource || "?").trim();
  const words = rawLabel.split(/\s+/);
  let rawLetter = "";
  if (words.length >= 2) rawLetter = (words[0][0] || "") + (words[1][0] || "");
  else if (rawLabel.length >= 2) rawLetter = rawLabel.slice(0, 2);
  else rawLetter = rawLabel[0] || "?";
  const escapeHtml = (window as any).escapeHtml || ((s: string) => s);
  const letter = escapeHtml(rawLetter.toLocaleUpperCase("ru-RU"));
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">',
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0%" stop-color="', palette[0], '"/>',
    '<stop offset="100%" stop-color="', palette[1], '"/>',
    '</linearGradient></defs>',
    '<circle cx="64" cy="64" r="64" fill="url(#g)"/>',
    '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-family="Inter, Roboto, Segoe UI, sans-serif" font-size="64" font-weight="500">',
    letter,
    '</text></svg>',
  ].join("");
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export interface AvatarMeta {
  letter: string;
  start: string;
  end: string;
  avatarUrl: string;
  style: string;
}

export function getAvatarMeta(seedSource: string, labelSource: string): AvatarMeta {
  const seed = String(seedSource || labelSource || "?");
  const hash = hashSeed(seed);
  const palette = avatarPalettes[Math.abs(hash) % avatarPalettes.length];
  const rawLabel = String(labelSource || seedSource || "?").trim();
  const words = rawLabel.split(/\s+/);
  let rawLetter = "";
  if (words.length >= 2) rawLetter = (words[0][0] || "") + (words[1][0] || "");
  else if (rawLabel.length >= 2) rawLetter = rawLabel.slice(0, 2);
  else rawLetter = rawLabel[0] || "?";
  const escapeHtml = (window as any).escapeHtml || ((s: string) => s);
  const letter = rawLetter.toLocaleUpperCase("ru-RU") || "?";
  const avatarUrl = buildGeneratedAvatarUrl(seedSource, labelSource);
  return {
    letter: escapeHtml(letter),
    start: palette[0],
    end: palette[1],
    avatarUrl,
    style: "--avatar-start:" + palette[0] + ";--avatar-end:" + palette[1] + ";",
  };
}

// ── Participant helpers ────────────────────────────────────────────────────

export function getParticipantInitialsForCall(name: string): string {
  const parts = String(name || "Guest")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return ((parts.map((p) => p.charAt(0)).join("")) || "G").toUpperCase();
}

export function resolveDialogAvatarUrlForDirectCall(
  call: Record<string, any> | null,
  allDialogs: Array<Record<string, any>>
): string {
  if (!call || call.mode === "group") return "";
  if (call.peerAvatarUrl) return String(call.peerAvatarUrl);
  const peerId = String(call.peerId || "").trim();
  const dialogPublicId = String(call.dialogPublicId || "").trim();
  const matchingDialog = Array.isArray(allDialogs)
    ? allDialogs.find((d) => {
        if (!d || d.type !== "direct") return false;
        if (dialogPublicId && String(d.publicId || "") === dialogPublicId) return true;
        if (peerId && String(d.peerUserId || "") === peerId) return true;
        return false;
      })
    : null;
  const avatarUrl = matchingDialog?.avatarUrl ? String(matchingDialog.avatarUrl) : "";
  if (avatarUrl && call) call.peerAvatarUrl = avatarUrl;
  return avatarUrl;
}

export function resolveDirectPeerAvatarByUserId(
  userId: string,
  allDialogs: Array<Record<string, any>>
): string {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId || !Array.isArray(allDialogs)) return "";
  const matchingDialog = allDialogs.find(
    (d) => d && d.type === "direct" && String(d.peerUserId || "") === normalizedUserId && d.avatarUrl
  );
  return matchingDialog?.avatarUrl ? String(matchingDialog.avatarUrl) : "";
}

export function buildCallParticipantCardHtml(opts: {
  id: string;
  name: string;
  muted: boolean;
  imageSrc?: string;
  avatarStyle?: string;
}): string {
  const { id, name, muted, imageSrc = "", avatarStyle = "" } = opts;
  const escapeHtml = (window as any).escapeHtml || ((s: string) => s);
  const getIcon = (window as any).getIcon || (() => "");
  return (
    '<div class="participant-card call-participant-card" data-participant-id="' +
    escapeHtml(String(id || "")) +
    '">' +
    '<div class="participant-avatar call-participant-avatar" style="' +
    escapeHtml(String(avatarStyle || "")) +
    '">' +
    (imageSrc
      ? '<img class="generated-avatar-photo" src="' +
        escapeHtml(imageSrc) +
        '" alt="' +
        escapeHtml(getParticipantInitialsForCall(name)) +
        '" />'
      : escapeHtml(getParticipantInitialsForCall(name))) +
    "</div>" +
    '<div class="participant-name call-participant-meta">' +
    '<span class="call-participant-name">' +
    escapeHtml(name || "Guest") +
    "</span>" +
    getIcon(
      muted ? "mic_off" : "mic",
      "participant-mic call-participant-mic" + (muted ? " muted" : ""),
      'aria-hidden="true"'
    ) +
    "</div>" +
    "</div>"
  );
}

// ── Devices loading ────────────────────────────────────────────────────────

export async function loadCallDevices(
  callInputDeviceEl: HTMLSelectElement | null,
  callOutputDeviceEl: HTMLSelectElement | null
): Promise<void> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputDevices = devices.filter((d) => d.kind === "audioinput");
    const outputDevices = devices.filter((d) => d.kind === "audiooutput");
    const escapeHtml = (window as any).escapeHtml || ((s: string) => s);
    if (callInputDeviceEl) {
      callInputDeviceEl.innerHTML = inputDevices
        .map(
          (d, i) =>
            '<option value="' +
            escapeHtml(d.deviceId) +
            '">' +
            escapeHtml(d.label || "Microphone " + (i + 1)) +
            "</option>"
        )
        .join("");
    }
    if (callOutputDeviceEl) {
      callOutputDeviceEl.innerHTML = outputDevices
        .map(
          (d, i) =>
            '<option value="' +
            escapeHtml(d.deviceId) +
            '">' +
            escapeHtml(d.label || "Output " + (i + 1)) +
            "</option>"
        )
        .join("");
    }
  } catch {}
}

// ── Call devices panel ─────────────────────────────────────────────────────

export function closeCallDevicesPanel(callDevicesPanelEl: HTMLElement | null): void {
  if (!callDevicesPanelEl) return;
  callDevicesPanelEl.classList.remove("open");
  callDevicesPanelEl.setAttribute("aria-hidden", "true");
}

export function openCallDevicesPanel(callDevicesPanelEl: HTMLElement | null): void {
  if (!callDevicesPanelEl) return;
  callDevicesPanelEl.classList.add("open");
  callDevicesPanelEl.setAttribute("aria-hidden", "false");
}

// ── Local video preview ────────────────────────────────────────────────────

export function getOrCreateDirectLocalPreview(): HTMLVideoElement | null {
  const streamHost = document.getElementById("call-main-stream");
  if (!(streamHost instanceof HTMLElement)) return null;
  let preview = document.getElementById("local-video-preview");
  if (preview instanceof HTMLVideoElement) return preview;
  const vid = document.createElement("video");
  vid.id = "local-video-preview";
  vid.autoplay = true;
  vid.muted = true;
  vid.playsInline = true;
  vid.setAttribute("aria-label", "Local camera preview");
  streamHost.appendChild(vid);
  return vid;
}

export function hideDirectLocalPreview(): void {
  const preview = document.getElementById("local-video-preview");
  if (!(preview instanceof HTMLVideoElement)) return;
  preview.pause();
  preview.srcObject = null;
  preview.classList.remove("active");
  preview.style.display = "none";
}

// ── Screen share layout helpers ────────────────────────────────────────────

export function shouldUseDirectScreenShareLayout(call: Record<string, any> | null): boolean {
  if (!call || call.mode === "group") return false;
  return Boolean(call.screenEnabled || call.remoteScreenSharing || call.remoteVisualKind === "screen");
}

// ── syncCallParticipantsGrid ───────────────────────────────────────────────

export function syncCallParticipantsGrid(
  activeCallVal: Record<string, any> | null,
  callModalEl: HTMLElement | null,
  deps: {
    currentUserId: string;
    currentUserDisplayName: string;
    getCurrentName: () => string;
    allDialogs: Array<Record<string, any>>;
  }
): void {
  const grid = document.getElementById("call-participants-grid");
  if (!(grid instanceof HTMLElement)) return;
  if (!activeCallVal) {
    grid.innerHTML = "";
    callModalEl?.classList.remove(
      "screen-share-active",
      "has-screen-share",
      "has-direct-visuals",
      "has-dual-visuals"
    );
    return;
  }
  if (activeCallVal.mode !== "group") {
    const shouldShowDirectTiles = shouldUseDirectScreenShareLayout(activeCallVal);
    grid.innerHTML = "";
    callModalEl?.classList.toggle("screen-share-active", shouldShowDirectTiles);
    if (!shouldShowDirectTiles) return;
    const localAvatar = getAvatarMeta(
      deps.currentUserId || "local",
      deps.getCurrentName()
    );
    const peerAvatarUrl = resolveDialogAvatarUrlForDirectCall(activeCallVal, deps.allDialogs);
    const peerAvatar = peerAvatarUrl
      ? {
          avatarUrl: peerAvatarUrl,
          style: "",
          letter: getParticipantInitialsForCall(activeCallVal.peerName || "Guest"),
        }
      : getAvatarMeta(activeCallVal.peerId || activeCallVal.peerName, activeCallVal.peerName || "Guest");
    grid.innerHTML = [
      buildCallParticipantCardHtml({
        id: deps.currentUserId || "local",
        name: deps.getCurrentName(),
        muted: Boolean(activeCallVal.isMuted),
        imageSrc: localAvatar.avatarUrl,
        avatarStyle: localAvatar.style,
      }),
      buildCallParticipantCardHtml({
        id: activeCallVal.peerId || "remote",
        name: activeCallVal.peerName || "Guest",
        muted: Boolean(activeCallVal.remoteMuted),
        imageSrc: peerAvatar.avatarUrl,
        avatarStyle: peerAvatar.style,
      }),
    ].join("");
    return;
  }
  if (activeCallVal.mode === "group" && activeCallVal.groupParticipants instanceof Map) {
    const rows = Array.from(activeCallVal.groupParticipants.values()).map(
      (participant: any) =>
        buildCallParticipantCardHtml({
          id: participant?.userId || participant?.name,
          name: participant?.name || "Guest",
          muted: Boolean(participant?.isMuted),
        })
    );
    grid.innerHTML = rows.join("");
  }
}

// ── syncCallVideoStage ─────────────────────────────────────────────────────

export function syncCallVideoStage(
  activeCallVal: Record<string, any> | null,
  callModalEl: HTMLElement | null,
  deps: {
    getCallElapsedSeconds: () => number;
    currentUserId: string;
    getCurrentName: () => string;
    allDialogs: Array<Record<string, any>>;
    closeExpandedScreenPreview: () => void;
  }
): void {
  syncCallParticipantsGrid(activeCallVal, callModalEl, {
    currentUserId: deps.currentUserId,
    currentUserDisplayName: "",
    getCurrentName: deps.getCurrentName,
    allDialogs: deps.allDialogs,
  });

  const remoteScreenVideo = document.getElementById("remote-screen-video");
  const mainPlaceholder = document.getElementById("call-main-placeholder");
  const localVideoPreview = getOrCreateDirectLocalPreview();
  const directCallLayoutHost = callModalEl;

  const remoteVideoTrack =
    activeCallVal?.remoteVideoStream instanceof MediaStream
      ? activeCallVal.remoteVideoStream.getVideoTracks()[0] || null
      : null;
  const hasPendingRemoteVideo = Boolean(
    activeCallVal?.remoteVideoStream &&
      remoteVideoTrack &&
      remoteVideoTrack.readyState === "live" &&
      !remoteVideoTrack.muted
  );
  const remoteElementHasFrames = Boolean(
    remoteScreenVideo instanceof HTMLVideoElement &&
      remoteScreenVideo.readyState >= 2 &&
      remoteScreenVideo.videoWidth > 0 &&
      remoteScreenVideo.videoHeight > 0
  );
  const hasRemoteVideo = Boolean(
    hasPendingRemoteVideo &&
      (activeCallVal?.remoteVideoFrameReady || remoteElementHasFrames)
  );
  const hasLocalCameraPreview = Boolean(
    activeCallVal &&
      activeCallVal.mode !== "group" &&
      activeCallVal.cameraEnabled &&
      activeCallVal.localVisualStream instanceof MediaStream
  );
  const hasLocalScreenPreview = Boolean(
    activeCallVal &&
      activeCallVal.mode !== "group" &&
      activeCallVal.screenEnabled &&
      activeCallVal.localVisualStream instanceof MediaStream
  );
  const shouldForcePlaceholder = Boolean(
    activeCallVal &&
      activeCallVal.mode !== "group" &&
      !activeCallVal.screenEnabled &&
      !activeCallVal.remoteScreenSharing &&
      activeCallVal.remoteVisualKind === "none"
  );

  if (
    activeCallVal &&
    activeCallVal.mode !== "group" &&
    activeCallVal.screenResyncTimer &&
    (hasRemoteVideo || !activeCallVal.remoteScreenSharing)
  ) {
    window.clearTimeout(activeCallVal.screenResyncTimer);
    activeCallVal.screenResyncTimer = null;
  }

  if (!(remoteScreenVideo instanceof HTMLVideoElement)) {
    logCallVideoDebug("sync_stage_no_remote_element", activeCallVal, deps.getCallElapsedSeconds, {
      hasRemoteVideo,
      hasPendingRemoteVideo,
      remoteVideoTrack: getDebugTrackState(remoteVideoTrack),
    });
    return;
  }

  if (shouldForcePlaceholder) {
    deps.closeExpandedScreenPreview();
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
    if (!hasLocalCameraPreview) hideDirectLocalPreview();
    if (directCallLayoutHost) {
      directCallLayoutHost.classList.remove(
        "has-direct-visuals","has-dual-visuals","has-screen-share","screen-share-active"
      );
      directCallLayoutHost.dataset.directVisualLayout = "none";
    }
    return;
  }

  const markRemoteVideoFrameReady = (source: string): void => {
    if (!activeCallVal || remoteScreenVideo.srcObject !== activeCallVal.remoteVideoStream) return;
    if (
      remoteScreenVideo.readyState < 2 ||
      remoteScreenVideo.videoWidth <= 0 ||
      remoteScreenVideo.videoHeight <= 0
    ) return;
    activeCallVal.remoteVideoFrameReady = true;
    syncCallVideoStage(activeCallVal, callModalEl, deps);
  };

  if (activeCallVal && hasPendingRemoteVideo && !hasRemoteVideo) {
    if (remoteScreenVideo.srcObject !== activeCallVal.remoteVideoStream) {
      remoteScreenVideo.srcObject = activeCallVal.remoteVideoStream;
    }
    remoteScreenVideo.onloadedmetadata = () => markRemoteVideoFrameReady("loadedmetadata");
    remoteScreenVideo.onplaying = () => markRemoteVideoFrameReady("playing");
    remoteScreenVideo.onresize = () => markRemoteVideoFrameReady("resize");
    try {
      const p = remoteScreenVideo.play();
      if (p?.catch) p.catch(() => {});
    } catch {}
    const canKeepLastRemoteFrame = Boolean(
      remoteScreenVideo.srcObject === activeCallVal.remoteVideoStream &&
        remoteVideoTrack &&
        remoteVideoTrack.readyState === "live" &&
        (remoteElementHasFrames || Boolean(activeCallVal?.remoteVideoFrameReady))
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
    if (!hasLocalCameraPreview) hideDirectLocalPreview();
    if (directCallLayoutHost) {
      directCallLayoutHost.classList.remove("has-direct-visuals","has-dual-visuals","has-screen-share");
      directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCallVal));
      directCallLayoutHost.dataset.directVisualLayout = "none";
    }
  } else if (!activeCallVal || (!hasRemoteVideo && !hasLocalScreenPreview)) {
    deps.closeExpandedScreenPreview();
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
    if (!hasLocalCameraPreview) hideDirectLocalPreview();
    if (directCallLayoutHost) {
      directCallLayoutHost.classList.remove("has-direct-visuals","has-dual-visuals","has-screen-share");
      directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCallVal));
      directCallLayoutHost.dataset.directVisualLayout = "none";
    }
  } else {
    const isLocalScreenOwner = Boolean(
      activeCallVal &&
        activeCallVal.mode !== "group" &&
        activeCallVal.screenEnabled &&
        activeCallVal.screenOwnerUserId &&
        activeCallVal.screenOwnerUserId === deps.currentUserId
    );
    const streamForMainStage = isLocalScreenOwner
      ? activeCallVal.localVisualStream
      : hasRemoteVideo
        ? activeCallVal.remoteVideoStream
        : activeCallVal?.localVisualStream;
    if (remoteScreenVideo.srcObject !== streamForMainStage) {
      remoteScreenVideo.srcObject = streamForMainStage;
    }
    remoteScreenVideo.onloadedmetadata = () => markRemoteVideoFrameReady("loadedmetadata");
    remoteScreenVideo.onplaying = () => markRemoteVideoFrameReady("playing");
    remoteScreenVideo.onresize = () => markRemoteVideoFrameReady("resize");
    remoteScreenVideo.classList.add("active");
    try {
      const p = remoteScreenVideo.play();
      if (p?.catch) p.catch(() => {});
    } catch {}
    if (mainPlaceholder instanceof HTMLElement) {
      mainPlaceholder.hidden = true;
      mainPlaceholder.style.display = "none";
    }
    if (directCallLayoutHost) {
      directCallLayoutHost.classList.add("has-direct-visuals");
      directCallLayoutHost.classList.toggle("has-screen-share", shouldUseDirectScreenShareLayout(activeCallVal));
      directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCallVal));
      directCallLayoutHost.classList.remove("has-dual-visuals");
      directCallLayoutHost.dataset.directVisualLayout = "single";
    }
  }

  if (localVideoPreview instanceof HTMLVideoElement && hasLocalCameraPreview) {
    localVideoPreview.srcObject = activeCallVal!.localVisualStream;
    localVideoPreview.classList.add("active");
    localVideoPreview.style.display = "block";
  } else {
    hideDirectLocalPreview();
  }
}

// ── restoreCallModal / minimizeCallModal / dismissMiniCallCard ─────────────

export function restoreCallModal(
  activeCallVal: Record<string, any> | null,
  syncCallUiFn: () => void
): void {
  if (!activeCallVal) return;
  activeCallVal.minimized = false;
  activeCallVal.miniHidden = false;
  syncCallUiFn();
}

export function minimizeCallModal(
  activeCallVal: Record<string, any> | null,
  callDevicesPanelEl: HTMLElement | null,
  syncCallUiFn: () => void
): void {
  if (!activeCallVal) return;
  activeCallVal.minimized = true;
  activeCallVal.miniHidden = false;
  closeCallDevicesPanel(callDevicesPanelEl);
  syncCallUiFn();
}

export function dismissMiniCallCard(
  activeCallVal: Record<string, any> | null,
  syncCallUiFn: () => void
): void {
  if (!activeCallVal) return;
  activeCallVal.miniHidden = true;
  syncCallUiFn();
}
