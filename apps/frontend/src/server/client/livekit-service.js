let currentRoom = null;
let liveKitSdk = null;
let controlsBound = false;

const participantCards = new Map();
const remoteVideoTracks = new Map();
const remoteAudioTracks = new Map();
let localPreviewTrackSid = "";

const getLiveKitSdk = async () => {
  if (liveKitSdk) {
    return liveKitSdk;
  }

  if (window.LiveKit && typeof window.LiveKit.Room === "function") {
    liveKitSdk = window.LiveKit;
    return liveKitSdk;
  }

  liveKitSdk = await import("livekit-client");
  return liveKitSdk;
};

const getParticipantKey = (participant) => String(participant?.sid || participant?.identity || "");

const getParticipantName = (participant) => {
  const name = String(participant?.name || "").trim();
  if (name) {
    return name;
  }

  const identity = String(participant?.identity || "").trim();
  return identity || "Guest";
};

const getParticipantInitials = (participant) => {
  const name = getParticipantName(participant);
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) {
    return "G";
  }
  return parts.map((part) => part[0]).join("").toUpperCase();
};

const isMicrophoneMuted = (participant) => {
  if (!participant || !(participant.trackPublications instanceof Map)) {
    return true;
  }

  for (const publication of participant.trackPublications.values()) {
    const source = publication?.source;
    const microphoneSource = liveKitSdk?.Track?.Source?.Microphone;
    if (source === "microphone" || source === microphoneSource) {
      return publication.isMuted !== false;
    }
  }

  return true;
};

const getParticipantsGrid = () => document.getElementById("call-participants-grid");
const getRemoteVideo = () => document.getElementById("remote-screen-video");
const getPlaceholder = () => document.getElementById("call-main-placeholder");
const getCallMainStream = () => document.getElementById("call-main-stream");

const getOrCreateLocalPreview = () => {
  let preview = document.getElementById("local-video-preview");
  if (preview instanceof HTMLVideoElement) {
    return preview;
  }

  const host = getCallMainStream();
  if (!(host instanceof HTMLElement)) {
    return null;
  }

  preview = document.createElement("video");
  preview.id = "local-video-preview";
  preview.autoplay = true;
  preview.muted = true;
  preview.playsInline = true;
  preview.setAttribute("aria-label", "Local camera preview");
  preview.style.position = "absolute";
  preview.style.right = "16px";
  preview.style.bottom = "16px";
  preview.style.width = "164px";
  preview.style.height = "92px";
  preview.style.objectFit = "cover";
  preview.style.borderRadius = "10px";
  preview.style.border = "1px solid rgba(255,255,255,0.18)";
  preview.style.background = "#111";
  preview.style.boxShadow = "0 10px 24px rgba(0,0,0,0.35)";
  preview.style.zIndex = "5";
  preview.style.display = "none";
  host.appendChild(preview);
  return preview;
};

const hideLocalPreview = () => {
  const preview = document.getElementById("local-video-preview");
  if (!(preview instanceof HTMLVideoElement)) {
    return;
  }

  preview.pause();
  preview.srcObject = null;
  preview.style.display = "none";
  localPreviewTrackSid = "";
};

const getLocalCameraPublication = () => {
  if (!currentRoom?.localParticipant?.videoTrackPublications) {
    return null;
  }

  for (const publication of currentRoom.localParticipant.videoTrackPublications.values()) {
    const source = publication?.source;
    if (source === "camera" || source === liveKitSdk?.Track?.Source?.Camera) {
      return publication;
    }
  }

  return null;
};

const syncLocalCameraPreview = () => {
  const preview = getOrCreateLocalPreview();
  if (!(preview instanceof HTMLVideoElement)) {
    return;
  }

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
};

const showMainPlaceholder = () => {
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
};

const hideMainPlaceholder = () => {
  const placeholder = getPlaceholder();
  if (placeholder instanceof HTMLElement) {
    placeholder.hidden = true;
    placeholder.style.display = "none";
  }
};

const renderParticipantCard = (participant) => {
  const grid = getParticipantsGrid();
  const key = getParticipantKey(participant);
  if (!(grid instanceof HTMLElement) || !key) {
    return;
  }

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
    mic.className = "lucide participant-mic call-participant-mic";
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
  entry.mic.textContent = muted ? "mic_off" : "mic";
  entry.mic.classList.toggle("muted", muted);
};

const removeParticipantCard = (participant) => {
  const key = getParticipantKey(participant);
  if (!key) {
    return;
  }

  const entry = participantCards.get(key);
  if (!entry) {
    return;
  }

  entry.card.remove();
  participantCards.delete(key);
};

const clearParticipantCards = () => {
  participantCards.forEach((entry) => entry.card.remove());
  participantCards.clear();
};

const remoteTrackKey = (publication, participant) => {
  const participantKey = getParticipantKey(participant);
  return String(publication?.trackSid || publication?.sid || `${participantKey}:${publication?.source || "track"}`);
};

const isScreenSharePublication = (publication) => {
  const source = publication?.source;
  return source === "screen_share" || source === liveKitSdk?.Track?.Source?.ScreenShare;
};

const chooseRemoteVideoTrack = () => {
  const screenTracks = [];
  const cameraTracks = [];

  remoteVideoTracks.forEach((entry) => {
    if (entry.isScreenShare) {
      screenTracks.push(entry);
    } else {
      cameraTracks.push(entry);
    }
  });

  return screenTracks[0] || cameraTracks[0] || null;
};

const renderRemoteVideo = () => {
  const remoteVideo = getRemoteVideo();
  if (!(remoteVideo instanceof HTMLVideoElement)) {
    return;
  }

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
};

const attachRemoteAudio = (track, publication, participant) => {
  const key = remoteTrackKey(publication, participant);
  let audio = remoteAudioTracks.get(key);
  if (!(audio instanceof HTMLAudioElement)) {
    audio = document.createElement("audio");
    audio.autoplay = true;
    audio.playsInline = true;
    audio.dataset.livekitRemoteAudio = key;
    document.body.appendChild(audio);
    remoteAudioTracks.set(key, audio);
  }

  track.detach(audio);
  track.attach(audio);
  const playPromise = audio.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
};

const detachRemoteAudio = (track, publication, participant) => {
  const key = remoteTrackKey(publication, participant);
  const audio = remoteAudioTracks.get(key);
  if (!(audio instanceof HTMLAudioElement)) {
    return;
  }

  track.detach(audio);
  audio.pause();
  audio.srcObject = null;
  audio.remove();
  remoteAudioTracks.delete(key);
};

const handleTrackSubscribed = (track, publication, participant) => {
  if (!participant || participant.isLocal || participant === currentRoom?.localParticipant) {
    return;
  }

  if (track.kind === "video") {
    const remoteVideo = getRemoteVideo();
    const placeholder = getPlaceholder();
    remoteVideoTracks.set(remoteTrackKey(publication, participant), {
      track,
      publication,
      participant,
      isScreenShare: isScreenSharePublication(publication)
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
};

const handleTrackUnsubscribed = (track, publication, participant) => {
  if (!participant || participant.isLocal || participant === currentRoom?.localParticipant) {
    return;
  }

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
};

const syncLocalButtons = () => {
  if (!currentRoom) {
    return;
  }

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
};

const toggleLocalCamera = async () => {
  if (!currentRoom) {
    return;
  }

  const publication = getLocalCameraPublication();
  const hasTrack = Boolean(publication?.track);
  await currentRoom.localParticipant.setCameraEnabled(!hasTrack);

  if (!hasTrack) {
    syncLocalCameraPreview();
  } else {
    hideLocalPreview();
  }

  syncLocalButtons();
};

const toggleLocalScreenShare = async () => {
  if (!currentRoom) {
    return;
  }

  const isEnabled = Boolean(currentRoom.localParticipant.isScreenShareEnabled);
  await currentRoom.localParticipant.setScreenShareEnabled(!isEnabled);

  // Local screen share is sent to LiveKit only. It is never attached to #remote-screen-video.
  syncLocalButtons();
};

const toggleLocalMicrophone = async () => {
  if (!currentRoom) {
    return;
  }

  const isEnabled = Boolean(currentRoom.localParticipant.isMicrophoneEnabled);
  await currentRoom.localParticipant.setMicrophoneEnabled(!isEnabled);
  renderParticipantCard(currentRoom.localParticipant);
  syncLocalButtons();
};

const disconnectRoom = () => {
  if (currentRoom) {
    currentRoom.disconnect();
  }

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
};

const bindControls = () => {
  if (controlsBound) {
    return;
  }
  controlsBound = true;

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const cameraButton = target?.closest(".btn-camera, #call-video-button");
    const screenButton = target?.closest(".btn-screen, #call-screen-button");
    const muteButton = target?.closest(".btn-mute, #call-mute-button");
    const endButton = target?.closest(".btn-end, #call-end-button");

    if (cameraButton) {
      event.preventDefault();
      void toggleLocalCamera();
      return;
    }

    if (screenButton) {
      event.preventDefault();
      void toggleLocalScreenShare();
      return;
    }

    if (muteButton) {
      event.preventDefault();
      void toggleLocalMicrophone();
      return;
    }

    if (endButton) {
      disconnectRoom();
    }
  });
};

const bindParticipantEvents = (sdk, participant) => {
  participant.on(sdk.ParticipantEvent.TrackMuted, () => renderParticipantCard(participant));
  participant.on(sdk.ParticipantEvent.TrackUnmuted, () => renderParticipantCard(participant));
  participant.on(sdk.ParticipantEvent.TrackPublished, () => renderParticipantCard(participant));
  participant.on(sdk.ParticipantEvent.TrackUnpublished, () => renderParticipantCard(participant));
};

const hydrateExistingParticipants = (sdk, room) => {
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
};

const bindRoomEvents = (sdk, room) => {
  room.on(sdk.RoomEvent.ParticipantConnected, (participant) => {
    renderParticipantCard(participant);
    bindParticipantEvents(sdk, participant);
  });

  room.on(sdk.RoomEvent.ParticipantDisconnected, (participant) => {
    removeParticipantCard(participant);
    [...remoteVideoTracks.entries()].forEach(([key, entry]) => {
      if (entry.participant === participant) {
        remoteVideoTracks.delete(key);
      }
    });
    renderRemoteVideo();
  });

  room.on(sdk.RoomEvent.TrackSubscribed, handleTrackSubscribed);
  room.on(sdk.RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

  room.on(sdk.RoomEvent.LocalTrackPublished, () => {
    syncLocalButtons();
    syncLocalCameraPreview();
  });
  room.on(sdk.RoomEvent.LocalTrackUnpublished, (publication) => {
    const source = publication?.source;
    if (source === "camera" || source === liveKitSdk?.Track?.Source?.Camera) {
      hideLocalPreview();
    }
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
};

export const initLiveKitCall = async (serverUrl, token) => {
  if (!serverUrl || !token) {
    throw new Error("initLiveKitCall requires serverUrl and token.");
  }

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
};

export const disconnectLiveKitCall = async () => {
  disconnectRoom();
};

export { renderParticipantCard, removeParticipantCard, toggleLocalCamera, toggleLocalScreenShare };
