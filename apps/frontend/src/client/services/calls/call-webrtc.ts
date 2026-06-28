// call-webrtc.ts — ported from calls/call-webrtc.js
// WebRTC helpers: Opus SDP tuning, voice meters, fingerprint emojis,
// remote audio node, and media session controls.

import {
  logCall,
  warnCall,
  getDebugTrackState,
} from "./call-debug";

// ── Call fingerprint emojis ────────────────────────────────────────────────

const callFingerprintEmojiPool = [
  "🍎","🐱","🚀","🔥","🎯","🌊","🛰️","🛡️","⚡","🌙",
  "🎧","📡","🧩","🎮","🦊","🧠","🦄","🍀","🧭","🔐","📶","🕹️","🫧","🌐",
];

const callFingerprintEmojiHints: Record<string, string> = {
  "🍎": "Red apple", "🐱": "Cat face", "🚀": "Rocket", "🔥": "Fire",
  "🎯": "Bullseye", "🌊": "Water wave", "🛰️": "Satellite", "🛡️": "Shield",
  "⚡": "Lightning", "🌙": "Crescent moon", "🎧": "Headphones",
  "📡": "Satellite antenna", "🧩": "Puzzle piece", "🎮": "Gamepad",
  "🦊": "Fox face", "🧠": "Brain", "🦄": "Unicorn", "🍀": "Four leaf clover",
  "🧭": "Compass", "🔐": "Locked key", "📶": "Signal strength",
  "🕹️": "Joystick", "🫧": "Bubbles", "🌐": "Globe",
};

function buildCallFingerprintEmojis(): string[] {
  const pool = callFingerprintEmojiPool.slice();
  const picked: string[] = [];
  for (let i = 0; i < 6 && pool.length; i++) {
    let randomIndex = 0;
    if (window.crypto?.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      randomIndex = buf[0] % pool.length;
    } else {
      randomIndex = Math.floor(Math.random() * pool.length);
    }
    picked.push(pool.splice(randomIndex, 1)[0]);
  }
  return picked;
}

export function sanitizeFingerprintEmojis(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 6);
}

export function resolveCallFingerprintEmojis(call: Record<string, any> | null): string[] {
  const synced = sanitizeFingerprintEmojis(call?.fingerprintEmojis);
  if (synced.length === 6) return synced;
  const generated = buildCallFingerprintEmojis();
  if (call && typeof call === "object") call.fingerprintEmojis = generated;
  return generated;
}

export function buildCallFingerprintEmojiMarkup(call: Record<string, any> | null): string {
  const emojis = resolveCallFingerprintEmojis(call);
  const getEmojiAssetUrl = (window as any).getEmojiAssetUrl;
  const escapeHtml = (window as any).escapeHtml || ((s: string) => s);
  return emojis.map((emoji) => {
    const emojiAssetUrl = typeof getEmojiAssetUrl === "function" ? getEmojiAssetUrl(emoji) : "";
    const emojiHint = String(callFingerprintEmojiHints[emoji] || "Emoji fingerprint");
    if (!emojiAssetUrl) {
      return (
        '<span class="call-fingerprint-emoji" data-emoji-hint="' +
        escapeHtml(emojiHint) +
        '" aria-label="' +
        escapeHtml(emojiHint) +
        '">' +
        escapeHtml(emoji) +
        "</span>"
      );
    }
    return (
      '<img class="call-fingerprint-emoji" data-emoji-hint="' +
      escapeHtml(emojiHint) +
      '" src="' +
      escapeHtml(emojiAssetUrl) +
      '" alt="' +
      escapeHtml(emoji) +
      '" loading="lazy" decoding="async" draggable="false" />'
    );
  }).join("");
}

// ── Opus SDP tuning ────────────────────────────────────────────────────────

function tuneOpusSdp(sdp: string): string {
  if (typeof sdp !== "string" || !sdp.trim()) return sdp;
  const lines = sdp.split("\r\n");
  const opusLine = lines.find((line) => /^a=rtpmap:(\d+)\s+opus\/48000\/2$/i.test(line));
  if (!opusLine) return sdp;
  const opusPayloadType = opusLine.slice("a=rtpmap:".length).split(" ")[0];
  const fmtpPrefix = "a=fmtp:" + opusPayloadType;
  const expectedParams: Record<string, string> = {
    useinbandfec: "1",
    usedtx: "0",
    minptime: "10",
    cbr: "1",
    maxaveragebitrate: "48000",
  };
  let updated = false;
  const tunedLines = lines.map((line) => {
    if (!line.startsWith(fmtpPrefix)) return line;
    const rawParams = line.slice(fmtpPrefix.length).trim().split(";").map((s) => s.trim()).filter(Boolean);
    const paramsMap = new Map<string, string>();
    rawParams.forEach((item) => {
      const [rawKey, rawValue] = item.split("=");
      if (!rawKey) return;
      paramsMap.set(rawKey.trim().toLowerCase(), typeof rawValue === "string" ? rawValue.trim() : "");
    });
    Object.entries(expectedParams).forEach(([key, value]) => paramsMap.set(key, value));
    const serialized = Array.from(paramsMap.entries())
      .map(([key, value]) => key + (value ? "=" + value : ""))
      .join(";");
    updated = true;
    return fmtpPrefix + " " + serialized;
  });
  if (!updated) {
    tunedLines.push(fmtpPrefix + " " + Object.entries(expectedParams).map(([k, v]) => k + "=" + v).join(";"));
  }
  return tunedLines.join("\r\n");
}

export async function buildOfferWithVoiceProfile(
  peerConnection: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const offer = await peerConnection.createOffer();
  const tunedSdp = tuneOpusSdp(offer.sdp || "");
  if (!tunedSdp || tunedSdp === offer.sdp) return offer;
  return { type: offer.type, sdp: tunedSdp };
}

export async function buildAnswerWithVoiceProfile(
  peerConnection: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const answer = await peerConnection.createAnswer();
  const tunedSdp = tuneOpusSdp(answer.sdp || "");
  if (!tunedSdp || tunedSdp === answer.sdp) return answer;
  return { type: answer.type, sdp: tunedSdp };
}

export async function applyAudioSenderProfile(
  peerConnection: RTCPeerConnection,
  callId: string
): Promise<void> {
  try {
    const sender = peerConnection.getSenders().find((entry) => entry.track?.kind === "audio");
    if (!sender || typeof sender.getParameters !== "function" || typeof sender.setParameters !== "function")
      return;
    const parameters: RTCRtpSendParameters = sender.getParameters() || ({} as any);
    if (!Array.isArray(parameters.encodings) || !parameters.encodings.length) {
      (parameters as any).encodings = [{}];
    }
    parameters.encodings[0] = { ...(parameters.encodings[0] || {}), maxBitrate: 48000 };
    await sender.setParameters(parameters);
    logCall("audio_sender_profile_applied", { callId, maxBitrate: 48000 });
  } catch (error) {
    warnCall("audio_sender_profile_skipped", {
      callId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ── Remote audio node ──────────────────────────────────────────────────────

let remoteAudioNode: HTMLAudioElement | null = null;

export function ensureRemoteAudioNode(): HTMLAudioElement {
  if (remoteAudioNode) return remoteAudioNode;
  remoteAudioNode = new Audio();
  remoteAudioNode.autoplay = true;
  remoteAudioNode.controls = false;
  remoteAudioNode.disableRemotePlayback = true;
  try {
    remoteAudioNode.setAttribute("x-webkit-airplay", "deny");
  } catch {}
  return remoteAudioNode;
}

export function getRemoteAudioNode(): HTMLAudioElement | null {
  return remoteAudioNode;
}

// ── Media session controls ─────────────────────────────────────────────────

export function disableSystemMediaSessionControls(): void {
  const mediaSession = navigator.mediaSession;
  if (!mediaSession || typeof mediaSession.setActionHandler !== "function") return;
  const actions: MediaSessionAction[] = [
    "play","pause","stop","seekbackward","seekforward",
    "seekto","previoustrack","nexttrack","skipad",
  ];
  for (const action of actions) {
    try { mediaSession.setActionHandler(action, null); } catch {}
  }
  try { mediaSession.metadata = null; } catch {}
  try { (mediaSession as any).playbackState = "none"; } catch {}
}

disableSystemMediaSessionControls();

// ── Voice level helpers ────────────────────────────────────────────────────

export function clampVoiceLevel(value: unknown): number {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

export function setCallVoiceLevel(
  level: number,
  callModalEl: HTMLElement | null,
  callMiniCardEl: HTMLElement | null
): void {
  const l = Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : 0;
  if (callModalEl?.style) callModalEl.style.setProperty("--call-voice-level", String(l));
  if (callMiniCardEl?.style) callMiniCardEl.style.setProperty("--call-voice-level", String(l));
}

// ── P2P call voice meter ───────────────────────────────────────────────────

let callVoiceMeterRaf = 0;
let callVoiceMeterContext: AudioContext | null = null;
let callVoiceMeterAnalyser: AnalyserNode | null = null;
let callVoiceMeterSource: MediaStreamAudioSourceNode | null = null;
let callVoiceMeterData: Uint8Array | null = null;

export function stopCallVoiceMeter(
  callModalEl: HTMLElement | null,
  callMiniCardEl: HTMLElement | null
): void {
  if (callVoiceMeterRaf) {
    window.cancelAnimationFrame(callVoiceMeterRaf);
    callVoiceMeterRaf = 0;
  }
  try { callVoiceMeterSource?.disconnect(); } catch {}
  try { callVoiceMeterAnalyser?.disconnect(); } catch {}
  callVoiceMeterSource = null;
  callVoiceMeterAnalyser = null;
  callVoiceMeterData = null;
  if (callVoiceMeterContext) {
    try {
      if (callVoiceMeterContext.state !== "closed") void callVoiceMeterContext.close();
    } catch {}
  }
  callVoiceMeterContext = null;
  setCallVoiceLevel(0, callModalEl, callMiniCardEl);
}

export function startCallVoiceMeter(
  stream: MediaStream,
  callModalEl: HTMLElement | null,
  callMiniCardEl: HTMLElement | null
): void {
  stopCallVoiceMeter(callModalEl, callMiniCardEl);
  if (!stream || typeof window.AudioContext !== "function") return;
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
    const tick = (): void => {
      if (!callVoiceMeterAnalyser || !callVoiceMeterData) return;
      try {
        callVoiceMeterAnalyser.getByteTimeDomainData(callVoiceMeterData);
        let peak = 0;
        for (let i = 0; i < callVoiceMeterData.length; i++) {
          const amp = Math.abs((callVoiceMeterData[i] - 128) / 128);
          if (amp > peak) peak = amp;
        }
        const normalized = Math.max(0, Math.min(1, (peak - 0.015) * 3.2));
        setCallVoiceLevel(normalized, callModalEl, callMiniCardEl);
      } catch {
        setCallVoiceLevel(0, callModalEl, callMiniCardEl);
      }
      callVoiceMeterRaf = window.requestAnimationFrame(tick);
    };
    callVoiceMeterRaf = window.requestAnimationFrame(tick);
  } catch (error) {
    warnCall("voice_meter_start_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    setCallVoiceLevel(0, callModalEl, callMiniCardEl);
  }
}

// ── Group local voice meter ────────────────────────────────────────────────

let groupLocalVoiceMeterTimer: ReturnType<typeof setInterval> | null = null;
let groupLocalVoiceMeterContext: AudioContext | null = null;
let groupLocalVoiceMeterAnalyser: AnalyserNode | null = null;
let groupLocalVoiceMeterSource: MediaStreamAudioSourceNode | null = null;
let groupLocalVoiceMeterData: Uint8Array | null = null;
let groupLocalVoiceLastSpeaking = false;
let groupLocalVoiceLastPresenceSentAt = 0;
export let groupLocalVoiceLastLevel = 0;
let groupLocalVoiceLastLevelSent = 0;
let groupLocalVoiceLastUiLevel = 0;

export function stopGroupLocalVoiceMeter(): void {
  if (groupLocalVoiceMeterTimer) {
    window.clearInterval(groupLocalVoiceMeterTimer);
    groupLocalVoiceMeterTimer = null;
  }
  try { groupLocalVoiceMeterSource?.disconnect(); } catch {}
  try { groupLocalVoiceMeterAnalyser?.disconnect(); } catch {}
  groupLocalVoiceMeterSource = null;
  groupLocalVoiceMeterAnalyser = null;
  groupLocalVoiceMeterData = null;
  if (groupLocalVoiceMeterContext) {
    try {
      if (groupLocalVoiceMeterContext.state !== "closed") void groupLocalVoiceMeterContext.close();
    } catch {}
  }
  groupLocalVoiceMeterContext = null;
  groupLocalVoiceLastSpeaking = false;
  groupLocalVoiceLastPresenceSentAt = 0;
  groupLocalVoiceLastLevel = 0;
  groupLocalVoiceLastLevelSent = 0;
  groupLocalVoiceLastUiLevel = 0;
}

export function startGroupLocalVoiceMeter(
  call: Record<string, any>,
  deps: {
    upsertGroupParticipant: (call: Record<string, any>, userId: string, name: string, isMuted: boolean, isSpeaking: boolean, level: number) => void;
    sendCallRealtime: (payload: Record<string, unknown>) => void;
    syncCallUi: () => void;
    getActiveCall: () => Record<string, any> | null;
    groupCallStateByDialog: Map<string, any>;
    currentUserId: string;
    getCurrentName: () => string;
    callModalEl: HTMLElement | null;
    callMiniCardEl: HTMLElement | null;
  }
): void {
  stopGroupLocalVoiceMeter();
  if (!call || call.mode !== "group" || !call.localStream || typeof window.AudioContext !== "function")
    return;
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
      const activeCallVal = deps.getActiveCall();
      if (!activeCallVal || activeCallVal.mode !== "group" || activeCallVal.callId !== call.callId) {
        stopGroupLocalVoiceMeter();
        return;
      }
      let peak = 0;
      if (!activeCallVal.isMuted && groupLocalVoiceMeterAnalyser && groupLocalVoiceMeterData) {
        try {
          groupLocalVoiceMeterAnalyser.getByteTimeDomainData(groupLocalVoiceMeterData);
          for (let i = 0; i < groupLocalVoiceMeterData.length; i++) {
            const amp = Math.abs((groupLocalVoiceMeterData[i] - 128) / 128);
            if (amp > peak) peak = amp;
          }
        } catch {}
      }
      const normalizedVoiceLevel = activeCallVal.isMuted
        ? 0
        : clampVoiceLevel(Math.max(0, Math.min(1, (peak - 0.012) * 3.45)));
      const isSpeakingNow = !activeCallVal.isMuted;
      const speakingChanged = isSpeakingNow !== groupLocalVoiceLastSpeaking;
      groupLocalVoiceLastSpeaking = isSpeakingNow;
      groupLocalVoiceLastLevel = normalizedVoiceLevel;
      const levelChangedForUi = Math.abs(normalizedVoiceLevel - groupLocalVoiceLastUiLevel) > 0.045;
      if (levelChangedForUi) groupLocalVoiceLastUiLevel = normalizedVoiceLevel;

      deps.upsertGroupParticipant(
        activeCallVal,
        deps.currentUserId,
        deps.getCurrentName(),
        Boolean(activeCallVal.isMuted),
        isSpeakingNow,
        normalizedVoiceLevel
      );

      const state = deps.groupCallStateByDialog.get(activeCallVal.dialogId);
      if (state) {
        if (!(state.participantIds instanceof Set)) state.participantIds = new Set();
        state.participantIds.add(deps.currentUserId);
        if (state.participantLastSeenAtMap instanceof Map)
          state.participantLastSeenAtMap.set(deps.currentUserId, Date.now());
        state.participantCount = state.participantIds.size;
        deps.groupCallStateByDialog.set(activeCallVal.dialogId, state);
      }

      const nowTs = Date.now();
      const levelChangedForPresence = Math.abs(normalizedVoiceLevel - groupLocalVoiceLastLevelSent) > 0.08;
      if (speakingChanged || levelChangedForPresence || nowTs - groupLocalVoiceLastPresenceSentAt > 820) {
        groupLocalVoiceLastPresenceSentAt = nowTs;
        groupLocalVoiceLastLevelSent = normalizedVoiceLevel;
        deps.sendCallRealtime({
          type: "call_presence",
          mode: "group",
          callId: activeCallVal.callId,
          dialogId: activeCallVal.dialogId,
          dialogPublicId: activeCallVal.dialogPublicId,
          participantUserId: deps.currentUserId,
          participantName: deps.getCurrentName(),
          isMuted: Boolean(activeCallVal.isMuted),
          isSpeaking: isSpeakingNow,
          voiceLevel: normalizedVoiceLevel,
        });
      }

      if (activeCallVal.mode === "group") {
        setCallVoiceLevel(
          activeCallVal.isMuted ? 0.06 : Math.max(0.12, normalizedVoiceLevel),
          deps.callModalEl,
          deps.callMiniCardEl
        );
      }
      if (speakingChanged || levelChangedForUi) deps.syncCallUi();
    }, 220);
  } catch (error) {
    warnCall("group_local_voice_meter_start_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
