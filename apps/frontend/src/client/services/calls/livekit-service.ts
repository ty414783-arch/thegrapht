// livekit-service.ts — ported from livekit-service.js
// Wraps the LiveKit client SDK for group video calls (SFU mode).

interface LkSdk {
  Room: new () => LkRoom;
  RoomEvent: Record<string, string>;
  ParticipantEvent: Record<string, string>;
  Track?: { Source?: Record<string, string> };
}

interface LkPublication {
  trackSid?: string;
  sid?: string;
  source?: string;
  isMuted?: boolean;
  isSubscribed?: boolean;
  track?: LkTrack | null;
}

interface LkTrack {
  kind: "video" | "audio";
  detach(el: HTMLMediaElement): void;
  attach(el: HTMLMediaElement): HTMLMediaElement;
}

interface LkParticipant {
  sid?: string;
  identity?: string;
  name?: string;
  isLocal?: boolean;
  isMicrophoneEnabled?: boolean;
  isScreenShareEnabled?: boolean;
  trackPublications: Map<string, LkPublication>;
  videoTrackPublications?: Map<string, LkPublication>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  setScreenShareEnabled(enabled: boolean): Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

interface LkRoom {
  localParticipant: LkParticipant;
  remoteParticipants: Map<string, LkParticipant>;
  connect(url: string, token: string): Promise<void>;
  disconnect(): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

// ── SDK singleton ──────────────────────────────────────────────────────────

let currentRoom: LkRoom | null = null;
let liveKitSdk: LkSdk | null = null;
let controlsBound = false;

const participantCards = new Map<string, { card: HTMLElement; avatar: HTMLElement; name: HTMLElement; mic: HTMLElement }>();
const remoteVideoTracks = new Map<string, { track: LkTrack; publication: LkPublication; participant: LkParticipant; isScreenShare: boolean }>();
const remoteAudioTracks = new Map<string, HTMLAudioElement>();
let localPreviewTrackSid = "";

async function getLiveKitSdk(): Promise<LkSdk> {
  if (liveKitSdk) return liveKitSdk;
  if ((window as any).LiveKit && typeof (window as any).LiveKit.Room === "function") {
    liveKitSdk = (window as any).LiveKit as LkSdk;
    return liveKitSdk;
  }
  // livekit-client may be loaded via a CDN <script> tag or as a local package.
  // Use @vite-ignore to prevent Rollup from trying to bundle it.
  liveKitSdk = (await import(/* @vite-ignore */ "livekit-client")) as unknown as LkSdk;
  return liveKitSdk;
}

// ── Participant helpers ────────────────────────────────────────────────────

function getParticipantKey(participant: LkParticipant | null | undefined): string {
  return String(participant?.sid || participant?.identity || "");
}

function getParticipantName(participant: LkParticipant | null | undefined): string {
  const name = String(participant?.name || "").trim();
  if (name) return name;
  return String(participant?.identity || "").trim() || "Guest";
}

function getParticipantInitials(participant: LkParticipant | null | undefined): string {
  const name = getParticipantName(participant);
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "G";
  return parts.map((p) => p[0]).join("").toUpperCase();
}

function isMicrophoneMuted(participant: LkParticipant | null | undefined): boolean {
  if (!participant || !(participant.trackPublications instanceof Map)) return true;
  for (const publication of participant.trackPublications.values()) {
    const source = publication?.source;
    const micSource = liveKitSdk?.Track?.Source?.Microphone;
    if (source === "microphone" || source === micSource) {
      return publication.isMuted !== false;
    }
  }
  return true;
}

// ── DOM element helpers ────────────────────────────────────────────────────

function getParticipantsGrid(): HTMLElement | null {
  return document.getElementById("call-participants-grid");
}

function getRemoteVideo(): HTMLVideoElement | null {
  const el = document.getElementById("remote-screen-video");
  return el instanceof HTMLVideoElement ? el : null;
}

function getPlaceholder(): HTMLElement | null {
  return document.getElementById("call-main-placeholder");
}

function getCallMainStream(): HTMLElement | null {
  return document.getElementById("call-main-stream");
}

function getOrCreateLocalPreview(): HTMLVideoElement | null {
  let preview = document.getElementById("local-video-preview");
  if (preview instanceof HTMLVideoElement) return preview;
  const host = getCallMainStream();
  if (!(host instanceof HTMLElement)) return null;
  const vid = document.createElement("video");
  vid.id = "local-video-preview";
  vid.autoplay = true;
  vid.muted = true;
  vid.playsInline = true;
  vid.setAttribute("aria-label", "Local camera preview");
  vid.style.position = "absolute";
  vid.style.right = "16px";
  vid.style.bottom = "16px";
  vid.style.width = "164px";
  vid.style.height = "92px";
  vid.style.objectFit = "cover";
  vid.style.borderRadius = "10px";
  vid.style.border = "1px solid rgba(255,255,255,0.18)";
  vid.style.background = "#111";
  vid.style.boxShadow = "0 10px 24px rgba(0,0,0,0.35)";
  vid.style.zIndex = "5";
  vid.style.display = "none";
  host.appendChild(vid);
  return vid;
}

function hideLocalPreview(): void {
  const preview = document.getElementById("local-video-preview");
  if (!(preview instanceof HTMLVideoElement)) return;
  preview.pause();
  preview.srcObject = null;
  preview.style.display = "none";
  localPreviewTrackSid = "";
}

function getLocalCameraPublication(): LkPublication | null {
  if (!currentRoom?.localParticipant?.videoTrackPublications) return null;
  for (const pub of currentRoom.localParticipant.videoTrackPublications.values()) {
    const source = pub?.source;
    if (source === "camera" || source === liveKitSdk?.Track?.Source?.Camera) return pub;
  }
  return null;
}

function syncLocalCameraPreview(): void {
  const preview = getOrCreateLocalPreview();
  if (!(preview instanceof HTMLVideoElement)) return;
  const publication = getLocalCameraPublication();
  const track = publication?.track || null;
  if (!track || track.kind !== "video") {
    hideLocalPreview();
    return;
  }
  track.detach(preview);
  track.attach(preview);
  preview.style.display = "block";
  localPreviewTrackSid = String(publication?.trackSid || publication?.sid || "");
}

function showMainPlaceholder(): void {
  const remoteVideo = getRemoteVideo();
  const placeholder = getPlaceholder();
  if (remoteVideo instanceof HTMLVideoElement) {
    remoteVideo.pause();
    remoteVideo.srcObject = null;
    remoteVideo.classList.remove("active");
  }
  if (placeholder instanceof HTMLElement) {
    placeholder.hidden = false;
    placeholder.style.display = "flex";
  }
}

function hideMainPlaceholder(): void {
  const placeholder = getPlaceholder();
  if (placeholder instanceof HTMLElement) {
    placeholder.hidden = true;
    placeholder.style.display = "none";
  }
}

// ── Participant cards ──────────────────────────────────────────────────────

function renderParticipantCard(participant: LkParticipant): void {
  const grid = getParticipantsGrid();
  const key = getParticipantKey(participant);
  if (!(grid instanceof HTMLElement) || !key) return;
  let entry = participantCards.get(key);
  if (!entry) {
    const card = document.createElement("div");
    card.className = "participant-card call-participant-card";
    card.dataset.participantSid = key;
    const avatar = document.createElement("div");
    avatar.className = "participant-avatar call-participant-avatar";
    avatar.textContent = getParticipantInitials(participant);
    const badge = document.createElement("div");
    badge.className = "participant-name call-participant-meta";
    const name = document.createElement("span");
    name.className = "call-participant-name";
    const mic = document.createElement("span");
    mic.className = "participant-mic-wrapper";
    mic.setAttribute("aria-hidden", "true");
    badge.append(name, mic);
    card.append(avatar, badge);
    grid.appendChild(card);
    entry = { card, avatar, name, mic };
    participantCards.set(key, entry);
  }
  const muted = isMicrophoneMuted(participant);
  entry.avatar.textContent = getParticipantInitials(participant);
  entry.name.textContent = getParticipantName(participant);
  const getIcon = (window as any).getIcon || (() => "");
  entry.mic.innerHTML = getIcon(
    muted ? "mic_off" : "mic",
    "participant-mic call-participant-mic" + (muted ? " muted" : "")
  );
}

function removeParticipantCard(participant: LkParticipant): void {
  const key = getParticipantKey(participant);
  if (!key) return;
  const entry = participantCards.get(key);
  if (!entry) return;
  entry.card.remove();
  participantCards.delete(key);
}

function clearParticipantCards(): void {
  participantCards.forEach((entry) => entry.card.remove());
  participantCards.clear();
}

// ── Remote track key ───────────────────────────────────────────────────────

function remoteTrackKey(publication: LkPublication, participant: LkParticipant): string {
  const pKey = getParticipantKey(participant);
  return String(publication?.trackSid || publication?.sid || `${pKey}:${publication?.source || "track"}`);
}

function isScreenSharePublication(publication: LkPublication): boolean {
  const source = publication?.source;
  return source === "screen_share" || source === liveKitSdk?.Track?.Source?.ScreenShare;
}

// ── Remote video rendering ─────────────────────────────────────────────────

function chooseRemoteVideoTrack(): (typeof remoteVideoTracks extends Map<string, infer V> ? V : never) | null {
  const screenTracks: Array<{ track: LkTrack; isScreenShare: boolean }> = [];
  const cameraTracks: Array<{ track: LkTrack; isScreenShare: boolean }> = [];
  remoteVideoTracks.forEach((entry) => {
    if (entry.isScreenShare) screenTracks.push(entry);
    else cameraTracks.push(entry);
  });
  return (screenTracks[0] || cameraTracks[0] || null) as any;
}

function renderRemoteVideo(): void {
  const remoteVideo = getRemoteVideo();
  if (!(remoteVideo instanceof HTMLVideoElement)) return;
  const selected = chooseRemoteVideoTrack();
  if (!selected?.track) {
    showMainPlaceholder();
    return;
  }
  selected.track.detach(remoteVideo);
  selected.track.attach(remoteVideo);
  remoteVideo.classList.add("active");
  remoteVideo.style.display = "block";
  hideMainPlaceholder();
}

// ── Remote audio ───────────────────────────────────────────────────────────

function attachRemoteAudio(track: LkTrack, publication: LkPublication, participant: LkParticipant): void {
  const key = remoteTrackKey(publication, participant);
  let audio = remoteAudioTracks.get(key);
  if (!(audio instanceof HTMLAudioElement)) {
    audio = document.createElement("audio");
    audio.autoplay = true;
    (audio as any).playsInline = true;
    audio.dataset.livekitRemoteAudio = key;
    document.body.appendChild(audio);
    remoteAudioTracks.set(key, audio);
  }
  track.detach(audio);
  track.attach(audio);
  const p = audio.play();
  if (p?.catch) p.catch(() => {});
}

function detachRemoteAudio(track: LkTrack, publication: LkPublication, participant: LkParticipant): void {
  const key = remoteTrackKey(publication, participant);
  const audio = remoteAudioTracks.get(key);
  if (!(audio instanceof HTMLAudioElement)) return;
  track.detach(audio);
  audio.pause();
  audio.srcObject = null;
  audio.remove();
  remoteAudioTracks.delete(key);
}

// ── Track event handlers ───────────────────────────────────────────────────

function handleTrackSubscribed(
  track: LkTrack,
  publication: LkPublication,
  participant: LkParticipant
): void {
  if (!participant || participant.isLocal || participant === currentRoom?.localParticipant) return;
  if (track.kind === "video") {
    const remoteVideo = getRemoteVideo();
    const placeholder = getPlaceholder();
    remoteVideoTracks.set(remoteTrackKey(publication, participant), {
      track,
      publication,
      participant,
      isScreenShare: isScreenSharePublication(publication),
    });
    if (remoteVideo instanceof HTMLVideoElement) {
      track.detach(remoteVideo);
      track.attach(remoteVideo);
      remoteVideo.classList.add("active");
      remoteVideo.style.display = "block";
    }
    if (placeholder instanceof HTMLElement) {
      placeholder.hidden = true;
      placeholder.style.display = "none";
    }
    renderRemoteVideo();
    return;
  }
  if (track.kind === "audio") {
    attachRemoteAudio(track, publication, participant);
  }
}

function handleTrackUnsubscribed(
  track: LkTrack,
  publication: LkPublication,
  participant: LkParticipant
): void {
  if (!participant || participant.isLocal || participant === currentRoom?.localParticipant) return;
  if (track.kind === "video") {
    const key = remoteTrackKey(publication, participant);
    const remoteVideo = getRemoteVideo();
    const placeholder = getPlaceholder();
    if (remoteVideo instanceof HTMLVideoElement) {
      track.detach(remoteVideo);
      remoteVideo.classList.remove("active");
      remoteVideo.style.display = "none";
    }
    if (placeholder instanceof HTMLElement) {
      placeholder.hidden = false;
      placeholder.style.display = "flex";
    }
    remoteVideoTracks.delete(key);
    renderRemoteVideo();
    return;
  }
  if (track.kind === "audio") {
    detachRemoteAudio(track, publication, participant);
  }
}

// ── Local media controls ───────────────────────────────────────────────────

function syncLocalButtons(): void {
  if (!currentRoom) return;
  const cameraButton = document.querySelector(".btn-camera, #call-video-button");
  const screenButton = document.querySelector(".btn-screen, #call-screen-button");
  const muteButton = document.querySelector(".btn-mute, #call-mute-button");
  if (cameraButton instanceof HTMLElement) {
    const publication = getLocalCameraPublication();
    cameraButton.classList.toggle("active", Boolean(publication?.track));
  }
  if (screenButton instanceof HTMLElement) {
    screenButton.classList.toggle("active", Boolean(currentRoom.localParticipant.isScreenShareEnabled));
  }
  if (muteButton instanceof HTMLElement) {
    muteButton.classList.toggle("active", !Boolean(currentRoom.localParticipant.isMicrophoneEnabled));
  }
}

async function toggleLocalCamera(): Promise<void> {
  if (!currentRoom) return;
  const publication = getLocalCameraPublication();
  const hasTrack = Boolean(publication?.track);
  await currentRoom.localParticipant.setCameraEnabled(!hasTrack);
  if (!hasTrack) syncLocalCameraPreview();
  else hideLocalPreview();
  syncLocalButtons();
}

async function toggleLocalScreenShare(): Promise<void> {
  if (!currentRoom) return;
  const isEnabled = Boolean(currentRoom.localParticipant.isScreenShareEnabled);
  await currentRoom.localParticipant.setScreenShareEnabled(!isEnabled);
  syncLocalButtons();
}

async function toggleLocalMicrophone(): Promise<void> {
  if (!currentRoom) return;
  const isEnabled = Boolean(currentRoom.localParticipant.isMicrophoneEnabled);
  await currentRoom.localParticipant.setMicrophoneEnabled(!isEnabled);
  renderParticipantCard(currentRoom.localParticipant);
  syncLocalButtons();
}

// ── Room lifecycle ─────────────────────────────────────────────────────────

function disconnectRoom(): void {
  if (currentRoom) currentRoom.disconnect();
  currentRoom = null;
  remoteVideoTracks.clear();
  remoteAudioTracks.forEach((audio) => {
    audio.pause();
    audio.srcObject = null;
    audio.remove();
  });
  remoteAudioTracks.clear();
  clearParticipantCards();
  hideLocalPreview();
  showMainPlaceholder();
}

function bindControls(): void {
  if (controlsBound) return;
  controlsBound = true;
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const cameraButton = target?.closest(".btn-camera, #call-video-button");
    const screenButton = target?.closest(".btn-screen, #call-screen-button");
    const muteButton = target?.closest(".btn-mute, #call-mute-button");
    const endButton = target?.closest(".btn-end, #call-end-button");
    if (cameraButton) { event.preventDefault(); void toggleLocalCamera(); return; }
    if (screenButton) { event.preventDefault(); void toggleLocalScreenShare(); return; }
    if (muteButton) { event.preventDefault(); void toggleLocalMicrophone(); return; }
    if (endButton) disconnectRoom();
  });
}

function bindParticipantEvents(sdk: LkSdk, participant: LkParticipant): void {
  participant.on(sdk.ParticipantEvent.TrackMuted, () => renderParticipantCard(participant));
  participant.on(sdk.ParticipantEvent.TrackUnmuted, () => renderParticipantCard(participant));
  participant.on(sdk.ParticipantEvent.TrackPublished, () => renderParticipantCard(participant));
  participant.on(sdk.ParticipantEvent.TrackUnpublished, () => renderParticipantCard(participant));
}

function hydrateExistingParticipants(sdk: LkSdk, room: LkRoom): void {
  renderParticipantCard(room.localParticipant);
  bindParticipantEvents(sdk, room.localParticipant);
  room.remoteParticipants.forEach((participant) => {
    renderParticipantCard(participant);
    bindParticipantEvents(sdk, participant);
    participant.trackPublications.forEach((publication) => {
      if (publication.isSubscribed && publication.track) {
        handleTrackSubscribed(publication.track, publication, participant);
      }
    });
  });
}

function bindRoomEvents(sdk: LkSdk, room: LkRoom): void {
  room.on(sdk.RoomEvent.ParticipantConnected, (participant: unknown) => {
    renderParticipantCard(participant as LkParticipant);
    bindParticipantEvents(sdk, participant as LkParticipant);
  });
  room.on(sdk.RoomEvent.ParticipantDisconnected, (participant: unknown) => {
    removeParticipantCard(participant as LkParticipant);
    [...remoteVideoTracks.entries()].forEach(([key, entry]) => {
      if (entry.participant === participant) remoteVideoTracks.delete(key);
    });
    renderRemoteVideo();
  });
  room.on(sdk.RoomEvent.TrackSubscribed, (track: unknown, pub: unknown, part: unknown) =>
    handleTrackSubscribed(track as LkTrack, pub as LkPublication, part as LkParticipant)
  );
  room.on(sdk.RoomEvent.TrackUnsubscribed, (track: unknown, pub: unknown, part: unknown) =>
    handleTrackUnsubscribed(track as LkTrack, pub as LkPublication, part as LkParticipant)
  );
  room.on(sdk.RoomEvent.LocalTrackPublished, () => {
    syncLocalButtons();
    syncLocalCameraPreview();
  });
  room.on(sdk.RoomEvent.LocalTrackUnpublished, (publication: unknown) => {
    const pub = publication as LkPublication;
    const source = pub?.source;
    if (source === "camera" || source === liveKitSdk?.Track?.Source?.Camera) hideLocalPreview();
    syncLocalButtons();
  });
  room.on(sdk.RoomEvent.Disconnected, () => {
    currentRoom = null;
    remoteVideoTracks.clear();
    remoteAudioTracks.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
    });
    remoteAudioTracks.clear();
    clearParticipantCards();
    hideLocalPreview();
    showMainPlaceholder();
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function initLiveKitCall(serverUrl: string, token: string): Promise<LkRoom> {
  if (!serverUrl || !token) throw new Error("initLiveKitCall requires serverUrl and token.");
  const sdk = await getLiveKitSdk();
  disconnectRoom();
  bindControls();
  const room = new sdk.Room();
  currentRoom = room;
  bindRoomEvents(sdk, room);
  await room.connect(serverUrl, token);
  await room.localParticipant.setMicrophoneEnabled(true);
  hydrateExistingParticipants(sdk, room);
  syncLocalCameraPreview();
  syncLocalButtons();
  showMainPlaceholder();
  return room;
}

export async function disconnectLiveKitCall(): Promise<void> {
  disconnectRoom();
}

// Expose on window for legacy call (sidebar.js / bootstrap.js) bindings
(window as any).initLiveKitCall = initLiveKitCall;
(window as any).disconnectLiveKitCall = disconnectLiveKitCall;
