// Audio Player Service for Preact / TypeScript Migration
export {};

declare const composerIconImages: HTMLElement[];
declare const chatAudioTopToggle: HTMLElement;
declare const chatAudioTopProgressFill: HTMLElement;
declare const chatAudioTopVolumeRange: HTMLInputElement;
declare const chatAudioTopVolume: HTMLElement;
declare const chatAudioTopPlayer: HTMLElement;
declare const chatAudioTopTitle: HTMLElement;
declare const chatAudioTopMeta: HTMLElement;
declare const chatAudioTopSpeed: HTMLElement;
declare const chatAudioTopRepeat: HTMLElement;
declare const chatWindow: HTMLElement;
declare const messageList: HTMLElement;
declare const chatAudioTopPrev: HTMLElement;
declare const chatAudioTopNext: HTMLElement;
declare const chatAudioTopClose: HTMLElement;
declare const chatAudioTopVolumePopover: HTMLElement;
declare const chatAudioTopProgress: HTMLElement;

const getWin = () => window as any;

// Safe dynamic wrappers for global helpers to prevent ReferenceErrors at runtime
const formatDuration = (v: number): string => {
  const f = getWin().formatDuration;
  return f ? f(v) : "";
};

const formatAudioMetaLabel = (seconds: number, sizeBytes: number, options?: any): string => {
  const f = getWin().formatAudioMetaLabel;
  return f ? f(seconds, sizeBytes, options) : "Audio";
};


// Storing and initializing variables on window so other modules can access them
const getActiveAudioElement = () => getWin().activeAudioElement as HTMLAudioElement | null;
const setActiveAudioElement = (el: HTMLAudioElement | null) => { getWin().activeAudioElement = el; };

const getActiveAudioMessageId = () => String(getWin().activeAudioMessageId || "");
const setActiveAudioMessageId = (id: string) => { getWin().activeAudioMessageId = id; };

const runOnInit = (fn: () => void) => {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};

// Setup composerIconImages if it exists on boot
runOnInit(() => {
  const composerIconImagesList = Array.from(document.querySelectorAll(".composer-icon-image, .composer-send img, .attachment-modal-send img")) as HTMLElement[];
  composerIconImagesList.forEach((node) => {
    node.addEventListener("dragstart", (event) => event.preventDefault());
    node.addEventListener("contextmenu", (event) => event.preventDefault());
  });
});

// Setup global prototype instrumentation for media elements to log play/pause events and stack traces to DevTools
runOnInit(() => {
  try {
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(this: HTMLMediaElement) {
      if (this.classList.contains("message-audio-element") || this.id.includes("audio")) {
        console.log("[Audio Debug] .play() called on element:", this, "src:", this.src);
        console.trace("[Audio Debug] .play() call stack trace");
      }
      return origPlay.apply(this, arguments as any);
    };

    const origPause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.pause = function(this: HTMLMediaElement) {
      if (this.classList.contains("message-audio-element") || this.id.includes("audio")) {
        console.log("[Audio Debug] .pause() called on element:", this, "src:", this.src);
        console.trace("[Audio Debug] .pause() call stack trace");
      }
      return origPause.apply(this, arguments as any);
    };
    console.log("[Audio Debug] Global play/pause console instrumentation active!");
  } catch (e) {
    console.error("[Audio Debug] Failed to instrument media elements:", e);
  }
});


const TELEGRAM_RIPPLE_TARGETS = [
  ".dialog-item",
  ".message-context-menu-item",
  ".chat-audio-top-btn",
  ".chat-scroll-bottom",
  ".toolbar-button",
  ".call-icon-button",
  ".call-action-button",
  ".group-create-photo-button",
  ".group-call-join-button",
  ".delete-message-button",
  ".header-action-btn",
  ".composer button",
  ".composer [role='button']",
  ".composer .lucide",
  "button"
].join(", ");

const ensureTelegramRippleClass = (target: Element | null): HTMLElement | null => {
  const host = target instanceof Element ? target.closest(TELEGRAM_RIPPLE_TARGETS) : null;
  if (!(host instanceof HTMLElement)) {
    return null;
  }
  if (host.matches("input, textarea, select, [data-audio-progress]")) {
    return null;
  }
  host.classList.add("tg-ripple");
  return host;
};

document.addEventListener("pointerover", (event) => {
  ensureTelegramRippleClass(event.target instanceof Element ? event.target : null);
}, { passive: true });

document.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) {
    return;
  }
  const host = ensureTelegramRippleClass(event.target instanceof Element ? event.target : null);
  if (!(host instanceof HTMLElement)) {
    return;
  }
  const rect = host.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }
  const wave = document.createElement("span");
  wave.className = "tg-ripple-wave";
  wave.style.left = (event.clientX - rect.left) + "px";
  wave.style.top = (event.clientY - rect.top) + "px";
  host.appendChild(wave);
  window.setTimeout(() => {
    wave.remove();
  }, 220);
});

let activeAudioRafId: number | null = null;
let activeAudioSeekState: any = null;
const detachedActiveAudioHost = document.createElement("div");
detachedActiveAudioHost.style.position = "absolute";
detachedActiveAudioHost.style.width = "1px";
detachedActiveAudioHost.style.height = "1px";
detachedActiveAudioHost.style.overflow = "hidden";
detachedActiveAudioHost.style.opacity = "0";
detachedActiveAudioHost.style.pointerEvents = "none";
detachedActiveAudioHost.style.top = "-9999px";
detachedActiveAudioHost.style.left = "-9999px";
detachedActiveAudioHost.setAttribute("aria-hidden", "true");
document.body.appendChild(detachedActiveAudioHost);

let topProgressSeekState: any = null;
let activeAudioTrackInfo = {
  title: "Audio",
  sizeBytes: 0
};
let activeAudioVolume = 1;
let activeAudioMuted = false;
let activeAudioLastNonZeroVolume = 1;
let activeAudioSpeed = 1;
let activeAudioRepeat = false;

const stopAudioRaf = () => {
  if (activeAudioRafId) {
    window.cancelAnimationFrame(activeAudioRafId);
    activeAudioRafId = null;
  }
};

const setAudioProgressVisual = (progress: HTMLInputElement, currentValue: number, maxValue: number) => {
  if (!(progress instanceof HTMLInputElement)) {
    return;
  }
  const safeMax = Math.max(0.001, Number(maxValue) || 0.001);
  const safeCurrent = Math.min(Math.max(0, Number(currentValue) || 0), safeMax);
  const percent = Math.min(100, Math.max(0, (safeCurrent / safeMax) * 100));
  const percentValue = percent.toFixed(3) + "%";
  progress.style.setProperty("--audio-progress-pct", percentValue);
  const card = progress.closest("[data-audio-card]");
  if (card instanceof HTMLElement) {
    card.style.setProperty("--audio-progress-pct", percentValue);
  }
};

const setAudioToggleState = (card: HTMLElement, isPlaying: boolean) => {
  if (!(card instanceof HTMLElement)) {
    return;
  }
  card.classList.toggle("is-playing", Boolean(isPlaying));
  const icon = card.querySelector(".message-audio-toggle-icon");
  if (icon instanceof Element && getWin().updateIcon) {
    getWin().updateIcon(icon, isPlaying ? "pause" : "play_arrow");
  }
  const topToggle = getWin().chatAudioTopToggle;
  if (topToggle instanceof HTMLElement && getActiveAudioElement() && card?.contains(getActiveAudioElement()!)) {
    if (getWin().updateIcon) {
      getWin().updateIcon(topToggle, isPlaying ? "pause" : "play_arrow");
    }
  }
};

const updateTopAudioProgress = (currentTime: number, duration: number) => {
  const fill = getWin().chatAudioTopProgressFill;
  if (!(fill instanceof HTMLElement)) {
    return;
  }
  const safeDuration = Math.max(0.001, Number(duration) || 0.001);
  const safeCurrent = Math.min(Math.max(0, Number(currentTime) || 0), safeDuration);
  const percent = Math.min(100, Math.max(0, (safeCurrent / safeDuration) * 100));
  fill.style.setProperty("--audio-top-progress", percent.toFixed(3) + "%");
};

const applyActiveAudioVolume = () => {
  const activeAudio = getActiveAudioElement();
  if (activeAudio instanceof HTMLAudioElement) {
    activeAudio.volume = Math.min(1, Math.max(0, Number(activeAudioVolume) || 0));
    activeAudio.muted = Boolean(activeAudioMuted || activeAudioVolume <= 0);
  }
  const volRange = getWin().chatAudioTopVolumeRange;
  if (volRange instanceof HTMLInputElement) {
    volRange.value = String(Math.min(1, Math.max(0, Number(activeAudioVolume) || 0)));
  }
  const volBtn = getWin().chatAudioTopVolume;
  if (volBtn instanceof HTMLElement) {
    if (getWin().updateIcon) {
      getWin().updateIcon(volBtn, (activeAudioMuted || activeAudioVolume <= 0) ? "volume_off" : "volume_up");
    }
  }
};

const hideTopAudioPlayer = () => {
  const chatWin = getWin().chatWindow;
  const hasChatWindow = chatWin instanceof HTMLElement;
  const listNode = getWin().messageList || document.getElementById("message-list");
  const hasMessageList = listNode instanceof HTMLElement;
  const wasVisible = hasChatWindow && chatWin.classList.contains("audio-top-player-visible");
  const listTopBefore = hasMessageList ? listNode.scrollTop : 0;
  const topPlayer = getWin().chatAudioTopPlayer;
  if (topPlayer instanceof HTMLElement) {
    topPlayer.classList.remove("visible");
    topPlayer.setAttribute("aria-hidden", "true");
  }
  if (hasChatWindow) {
    chatWin.classList.remove("audio-top-player-visible");
  }
  const pageRoot = document.getElementById("page-root");
  if (pageRoot) {
    pageRoot.classList.remove("audio-top-player-visible");
  }
  if (wasVisible && hasMessageList) {
    listNode.scrollTop = Math.max(0, listTopBefore - 56);
  }
};

const updateTopAudioPlayer = (card: HTMLElement | null, audioElement: HTMLAudioElement) => {
  const topPlayer = getWin().chatAudioTopPlayer;
  if (!(topPlayer instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
    return;
  }
  if (card instanceof HTMLElement) {
    const nameNode = card.querySelector(".message-audio-name");
    setActiveAudioMessageId(String(card.getAttribute("data-message-id") || ""));
    activeAudioTrackInfo = {
      title: String(nameNode?.textContent || "Audio").trim() || "Audio",
      sizeBytes: Number(card.getAttribute("data-audio-size") || 0) || 0
    };
  }
  const duration = card instanceof HTMLElement
    ? getAudioCardDurationSeconds(card, audioElement)
    : (Number(audioElement.duration) || 0);
  const currentTime = Math.max(0, Number(audioElement.currentTime) || 0);

  const titleEl = getWin().chatAudioTopTitle;
  if (titleEl instanceof HTMLElement) {
    titleEl.textContent = activeAudioTrackInfo.title || "Audio";
  }
  const metaEl = getWin().chatAudioTopMeta;
  if (metaEl instanceof HTMLElement) {
    metaEl.textContent = (formatDuration(currentTime) || "0:00") + " · Unknown artist";
  }
  const toggleEl = getWin().chatAudioTopToggle;
  if (toggleEl instanceof HTMLElement) {
    if (getWin().updateIcon) {
      getWin().updateIcon(toggleEl, audioElement.paused ? "play_arrow" : "pause");
    }
  }
  const speedEl = getWin().chatAudioTopSpeed;
  if (speedEl instanceof HTMLElement) {
    speedEl.textContent = (Number(audioElement.playbackRate || 1)).toFixed(1).replace(/\.0$/, "") + "X";
  }
  const repeatEl = getWin().chatAudioTopRepeat;
  if (repeatEl instanceof HTMLElement) {
    repeatEl.classList.toggle("is-active", Boolean(audioElement.loop));
  }
  applyActiveAudioVolume();
  updateTopAudioProgress(currentTime, duration);

  const chatWin = getWin().chatWindow;
  const hasChatWindow = chatWin instanceof HTMLElement;
  const listNode = getWin().messageList || document.getElementById("message-list");
  const hasMessageList = listNode instanceof HTMLElement;
  const wasVisible = hasChatWindow && chatWin.classList.contains("audio-top-player-visible");
  const listTopBefore = hasMessageList ? listNode.scrollTop : 0;

  topPlayer.classList.add("visible");
  topPlayer.setAttribute("aria-hidden", "false");
  if (hasChatWindow) {
    chatWin.classList.add("audio-top-player-visible");
  }
  const pageRoot = document.getElementById("page-root");
  if (pageRoot) {
    pageRoot.classList.add("audio-top-player-visible");
  }
  if (!wasVisible && hasMessageList) {
    listNode.scrollTop = listTopBefore + 56;
  }
};

const getAudioCardDurationSeconds = (card: HTMLElement, audioElement: HTMLAudioElement) => {
  const fromAudio = Number(audioElement?.duration) || 0;
  if (fromAudio > 0) {
    return fromAudio;
  }
  if (!(card instanceof HTMLElement)) {
    return 0;
  }
  return Number(card.getAttribute("data-audio-duration") || 0) || 0;
};

const updateAudioCardUi = (card: HTMLElement, audioElement: HTMLAudioElement) => {
  if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
    return;
  }
  const duration = getAudioCardDurationSeconds(card, audioElement);
  const progress = card.querySelector("[data-audio-progress]");
  const progressMaxFromDom = progress instanceof HTMLInputElement ? (Number(progress.max) || 0) : 0;
  const effectiveDuration = duration > 0 ? duration : progressMaxFromDom;
  const isSeekingCurrent = activeAudioSeekState
    && activeAudioSeekState.audioElement === audioElement
    && Number.isFinite(activeAudioSeekState.previewTime);
  const effectiveCurrentTime = isSeekingCurrent
    ? Number(activeAudioSeekState.previewTime)
    : (Number(audioElement.currentTime) || 0);
  const currentTime = Math.max(0, effectiveCurrentTime);
  const maxValue = Math.max(1, effectiveDuration || 1);
  if (progress instanceof HTMLInputElement) {
    progress.max = String(maxValue);
    progress.value = String(Math.min(Math.max(0, currentTime), maxValue));
    setAudioProgressVisual(progress, currentTime, maxValue);
  }
  const sizeBytes = Number(card.getAttribute("data-audio-size") || 0) || 0;
  const metaLine = card.querySelector("[data-audio-meta]");
  if (metaLine instanceof HTMLElement) {
    const useCurrent = isSeekingCurrent || !audioElement.paused || currentTime > 0.04;
    const currentTimeLabel = useCurrent ? formatDuration(currentTime) : "";
    metaLine.textContent = formatAudioMetaLabel(effectiveDuration, sizeBytes, { currentTimeLabel });
  }
  updateTopAudioPlayer(card, audioElement);
};

const playAudioFromCard = (card: HTMLElement, audioElement: HTMLAudioElement) => {
  if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
    return false;
  }
  ensureAudioFallbackBinding(audioElement);
  
  // Move it to the detached host immediately before we play so it stays there permanently
  detachedActiveAudioHost.appendChild(audioElement);
  
  const nameNode = card.querySelector(".message-audio-name");
  activeAudioTrackInfo = {
    title: String(nameNode?.textContent || "Audio").trim() || "Audio",
    sizeBytes: Number(card.getAttribute("data-audio-size") || 0) || 0
  };
  stopActiveAudio({ except: audioElement, keepTopPlayerVisible: true });
  audioElement.playbackRate = activeAudioSpeed;
  audioElement.loop = activeAudioRepeat;
  audioElement.volume = Math.min(1, Math.max(0, Number(activeAudioVolume) || 0));
  audioElement.muted = Boolean(activeAudioMuted || activeAudioVolume <= 0);
  const playPromise = audioElement.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise.then(() => {
      setActiveAudioElement(audioElement);
      setActiveAudioMessageId(String(card.getAttribute("data-message-id") || ""));
      setAudioToggleState(card, true);
      stopAudioRaf();
      tickActiveAudio();
    }).catch((err) => {
      console.error("[Audio Debug] play() failed in playAudioFromCard:", err);
      setAudioToggleState(card, false);
      if (getActiveAudioElement() === audioElement) {
        setActiveAudioElement(null);
      }
      setActiveAudioMessageId("");
      hideTopAudioPlayer();
    });
  } else {
    setActiveAudioElement(audioElement);
    setActiveAudioMessageId(String(card.getAttribute("data-message-id") || ""));
    setAudioToggleState(card, true);
    stopAudioRaf();
    tickActiveAudio();
  }
  return true;
};

const playAdjacentAudioTrack = (fromCard: HTMLElement, direction: number = 1) => {
  const listNode = getWin().messageList || document.getElementById("message-list");
  const hasMessageList = listNode instanceof HTMLElement;
  if (!(fromCard instanceof HTMLElement) || !hasMessageList) {
    return false;
  }
  const cards = Array.from(listNode!.querySelectorAll("[data-audio-card]")) as HTMLElement[];
  const startIndex = cards.indexOf(fromCard);
  if (startIndex < 0) {
    return false;
  }
  const step = direction >= 0 ? 1 : -1;
  for (let cursor = startIndex + step; cursor >= 0 && cursor < cards.length; cursor += step) {
    const nextCard = cards[cursor];
    if (!(nextCard instanceof HTMLElement)) {
      continue;
    }
    const nextAudio = nextCard.querySelector(".message-audio-element");
    if (!(nextAudio instanceof HTMLAudioElement)) {
      continue;
    }
    if (playAudioFromCard(nextCard, nextAudio)) {
      return true;
    }
  }
  return false;
};

const stopActiveAudio = (opts: { except?: HTMLAudioElement, keepTopPlayerVisible?: boolean } = {}) => {
  const except = opts.except;
  const keepTopPlayerVisible = opts.keepTopPlayerVisible || false;
  const activeAudio = getActiveAudioElement();
  console.log("[Audio Debug] stopActiveAudio called with opts:", opts, "activeAudio =", activeAudio);
  console.trace("[Audio Debug] stopActiveAudio call stack trace");
  if (!(activeAudio instanceof HTMLAudioElement)) {
    stopAudioRaf();
    return;
  }
  if (except && activeAudio === except) {
    return;
  }
  try {
    activeAudio.pause();
  } catch {}
  
  // Find the active card by query selector since activeAudio is in the detached host
  const messageId = getActiveAudioMessageId();
  const listNode = getWin().messageList || document.getElementById("message-list");
  const activeCard = (messageId && listNode instanceof HTMLElement)
    ? listNode.querySelector('[data-audio-card][data-message-id="' + CSS.escape(messageId) + '"]')
    : null;
    
  if (activeCard instanceof HTMLElement) {
    setAudioToggleState(activeCard, false);
    updateAudioCardUi(activeCard, activeAudio);
  }
  setActiveAudioElement(null);
  setActiveAudioMessageId("");
  topProgressSeekState = null;
  if (!keepTopPlayerVisible) {
    hideTopAudioPlayer();
  }
  stopAudioRaf();
};
getWin().stopActiveAudio = stopActiveAudio;

const preserveActiveAudioForLayoutChange = () => {
  console.log("[Audio Debug] preserveActiveAudioForLayoutChange: no-op (audio is already in detached host)");
};

const reattachActiveAudioToVisibleCard = () => {
  console.log("[Audio Debug] reattachActiveAudioToVisibleCard: no-op");
};

const tickActiveAudio = () => {
  const activeAudio = getActiveAudioElement();
  if (!(activeAudio instanceof HTMLAudioElement)) {
    stopAudioRaf();
    return;
  }
  
  // Find card in DOM by message ID since activeAudio is in the detached host
  const messageId = getActiveAudioMessageId();
  const listNode = getWin().messageList || document.getElementById("message-list");
  const card = (messageId && listNode instanceof HTMLElement)
    ? listNode.querySelector('[data-audio-card][data-message-id="' + CSS.escape(messageId) + '"]')
    : null;
    
  if (card instanceof HTMLElement) {
    updateAudioCardUi(card, activeAudio);
  } else {
    updateTopAudioPlayer(null, activeAudio);
  }
  if (activeAudio.ended) {
    if (!activeAudioRepeat && card instanceof HTMLElement && playAdjacentAudioTrack(card, 1)) {
      return;
    }
    if (card instanceof HTMLElement) {
      setAudioToggleState(card, false);
      updateAudioCardUi(card, activeAudio);
    } else {
      const topToggle = getWin().chatAudioTopToggle;
      if (topToggle instanceof HTMLElement && getWin().updateIcon) {
        getWin().updateIcon(topToggle, "play_arrow");
      }
    }
    setActiveAudioElement(null);
    setActiveAudioMessageId("");
    hideTopAudioPlayer();
    stopAudioRaf();
    return;
  }
  if (!activeAudio.paused) {
    activeAudioRafId = window.requestAnimationFrame(tickActiveAudio);
  } else {
    stopAudioRaf();
  }
};

const ensureAudioFallbackBinding = (audioElement: HTMLAudioElement) => {
  if (!(audioElement instanceof HTMLAudioElement) || audioElement.dataset.errorBound === "true") {
    return;
  }
  audioElement.dataset.errorBound = "true";
  
  audioElement.addEventListener("play", () => {
    console.log("[Audio Debug] HTMLMediaElement 'play' event on:", audioElement, "paused =", audioElement.paused);
  });
  audioElement.addEventListener("playing", () => {
    console.log("[Audio Debug] HTMLMediaElement 'playing' event on:", audioElement);
  });
  audioElement.addEventListener("pause", () => {
    console.log("[Audio Debug] HTMLMediaElement 'pause' event on:", audioElement, "paused =", audioElement.paused);
    console.trace("[Audio Debug] HTMLMediaElement 'pause' event stack trace");
  });
  audioElement.addEventListener("ended", () => {
    console.log("[Audio Debug] HTMLMediaElement 'ended' event on:", audioElement);
  });
  audioElement.addEventListener("error", (e) => {
    console.error("[Audio Debug] HTMLMediaElement 'error' event on:", audioElement, "error:", e);
  });
  
  audioElement.addEventListener("error", () => {
    const fallbackSrc = String(audioElement.getAttribute("data-fallback-src") || "");
    if (fallbackSrc && audioElement.dataset.fallbackTried !== "true") {
      audioElement.dataset.fallbackTried = "true";
      audioElement.src = fallbackSrc;
      try { audioElement.load(); } catch {}
    }
  });
};

const commitAudioSeekTarget = (audioElement: HTMLAudioElement, targetTime: number) => {
  if (!(audioElement instanceof HTMLAudioElement)) {
    return;
  }
  const applySeek = () => {
    try {
      audioElement.currentTime = targetTime;
    } catch {}
  };

  if (Number.isFinite(audioElement.duration) && audioElement.duration > 0) {
    applySeek();
    return;
  }

  const applyOnce = () => {
    audioElement.removeEventListener("loadedmetadata", applyOnce);
    audioElement.removeEventListener("canplay", applyOnce);
    applySeek();
  };
  audioElement.addEventListener("loadedmetadata", applyOnce, { once: true });
  audioElement.addEventListener("canplay", applyOnce, { once: true });
  try {
    audioElement.load();
  } catch {}
};

const beginAudioSeek = (card: HTMLElement, audioElement: HTMLAudioElement) => {
  if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
    return;
  }
  activeAudioSeekState = {
    card,
    audioElement,
    previewTime: Number(audioElement.currentTime) || 0,
    wasPlaying: !audioElement.paused,
    wasActive: getActiveAudioElement() === audioElement
  };
  if (!audioElement.paused) {
    try {
      audioElement.pause();
    } catch {}
  }
  card.classList.add("is-seeking");
};

const finishAudioSeek = () => {
  if (!activeAudioSeekState) {
    return;
  }
  const seekState = activeAudioSeekState;
  activeAudioSeekState = null;
  seekState.card?.classList.remove("is-seeking");

  if (!(seekState.audioElement instanceof HTMLAudioElement)) {
    return;
  }
  commitAudioSeekTarget(seekState.audioElement, Number(seekState.previewTime) || 0);

  if (seekState.wasPlaying) {
    const playPromise = seekState.audioElement.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(() => {
        setActiveAudioElement(seekState.audioElement);
        setAudioToggleState(seekState.card, true);
        stopAudioRaf();
        tickActiveAudio();
      }).catch(() => {
        setAudioToggleState(seekState.card, false);
        updateAudioCardUi(seekState.card, seekState.audioElement);
      });
    } else {
      setActiveAudioElement(seekState.audioElement);
      setAudioToggleState(seekState.card, true);
      stopAudioRaf();
      tickActiveAudio();
    }
    return;
  }

  if (seekState.wasActive) {
    setActiveAudioElement(null);
  }
  setAudioToggleState(seekState.card, false);
  updateAudioCardUi(seekState.card, seekState.audioElement);
};

// Dom Events registration
runOnInit(() => {
  const listNode = getWin().messageList || document.getElementById("message-list");
  const hasMessageList = listNode instanceof HTMLElement;
  if (hasMessageList) {
    listNode.addEventListener("click", (event) => {
      const toggle = event.target instanceof Element ? event.target.closest("[data-audio-toggle]") : null;
      if (!toggle) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const card = toggle.closest("[data-audio-card]");
      if (!(card instanceof HTMLElement)) {
        return;
      }
      const messageId = String(card.getAttribute("data-message-id") || "");
      let audioElement = card.querySelector(".message-audio-element") as HTMLAudioElement | null;
      if (messageId && messageId === getActiveAudioMessageId()) {
        audioElement = getActiveAudioElement() || audioElement;
      }
      if (!(audioElement instanceof HTMLAudioElement)) {
        return;
      }
      ensureAudioFallbackBinding(audioElement);
      if (audioElement.paused) {
        playAudioFromCard(card, audioElement);
        return;
      }
      audioElement.pause();
      setAudioToggleState(card, false);
      updateAudioCardUi(card, audioElement);
      if (getActiveAudioElement() === audioElement) {
        setActiveAudioElement(null);
        hideTopAudioPlayer();
        stopAudioRaf();
      }
    });

    listNode.addEventListener("input", (event) => {
      const progress = event.target instanceof Element ? event.target.closest("[data-audio-progress]") : null;
      if (!(progress instanceof HTMLInputElement)) {
        return;
      }
      event.stopPropagation();
      const card = progress.closest("[data-audio-card]");
      if (!(card instanceof HTMLElement)) {
        return;
      }
      const messageId = String(card.getAttribute("data-message-id") || "");
      let audioElement = card.querySelector(".message-audio-element") as HTMLAudioElement | null;
      if (messageId && messageId === getActiveAudioMessageId()) {
        audioElement = getActiveAudioElement() || audioElement;
      }
      if (!(audioElement instanceof HTMLAudioElement)) {
        return;
      }
      if (!activeAudioSeekState || activeAudioSeekState.audioElement !== audioElement) {
        beginAudioSeek(card, audioElement);
      }
      const duration = getAudioCardDurationSeconds(card, audioElement);
      const maxValue = Math.max(1, duration || Number(progress.max) || 1);
      const nextValue = Math.min(Math.max(0, Number(progress.value) || 0), maxValue);
      if (activeAudioSeekState && activeAudioSeekState.audioElement === audioElement) {
        activeAudioSeekState.previewTime = nextValue;
      }
      updateAudioCardUi(card, audioElement);
    });

    listNode.addEventListener("pointerdown", (event) => {
      const progress = event.target instanceof Element ? event.target.closest("[data-audio-progress]") : null;
      if (!(progress instanceof HTMLInputElement)) {
        return;
      }
      const card = progress.closest("[data-audio-card]");
      if (!(card instanceof HTMLElement)) {
        return;
      }
      const messageId = String(card.getAttribute("data-message-id") || "");
      let audioElement = card.querySelector(".message-audio-element") as HTMLAudioElement | null;
      if (messageId && messageId === getActiveAudioMessageId()) {
        audioElement = getActiveAudioElement() || audioElement;
      }
      if (!(audioElement instanceof HTMLAudioElement)) {
        return;
      }
      beginAudioSeek(card, audioElement);
    });

    listNode.addEventListener("change", (event) => {
      const progress = event.target instanceof Element ? event.target.closest("[data-audio-progress]") : null;
      if (!(progress instanceof HTMLInputElement)) {
        return;
      }
      const card = progress.closest("[data-audio-card]");
      if (!(card instanceof HTMLElement)) {
        return;
      }
      const messageId = String(card.getAttribute("data-message-id") || "");
      let audioElement = card.querySelector(".message-audio-element") as HTMLAudioElement | null;
      if (messageId && messageId === getActiveAudioMessageId()) {
        audioElement = getActiveAudioElement() || audioElement;
      }
      if (!(audioElement instanceof HTMLAudioElement)) {
        return;
      }
      const duration = getAudioCardDurationSeconds(card, audioElement);
      const maxValue = Math.max(1, duration || Number(progress.max) || 1);
      const nextValue = Math.min(Math.max(0, Number(progress.value) || 0), maxValue);
      commitAudioSeekTarget(audioElement, nextValue);
      if (activeAudioSeekState && activeAudioSeekState.audioElement === audioElement) {
        activeAudioSeekState.previewTime = nextValue;
      }
      updateAudioCardUi(card, audioElement);
      finishAudioSeek();
    });
  }

  window.addEventListener("pointerup", () => {
    finishAudioSeek();
  });

  window.addEventListener("pointercancel", () => {
    finishAudioSeek();
  });

  const topPrev = getWin().chatAudioTopPrev;
  if (topPrev instanceof HTMLElement) {
    topPrev.addEventListener("click", () => {
      const activeAudio = getActiveAudioElement();
      if (!(activeAudio instanceof HTMLAudioElement)) {
        return;
      }
      const wasPlaying = !activeAudio.paused;
      if (wasPlaying) {
        try { activeAudio.pause(); } catch {}
      }
      const next = Math.max(0, (Number(activeAudio.currentTime) || 0) - 10);
      commitAudioSeekTarget(activeAudio, next);
      const card = activeAudio.closest("[data-audio-card]");
      if (card instanceof HTMLElement) {
        updateAudioCardUi(card, activeAudio);
      } else {
        updateTopAudioPlayer(null, activeAudio);
      }
      if (wasPlaying) {
        activeAudio.play().then(() => {
          stopAudioRaf();
          tickActiveAudio();
        }).catch(() => {});
      }
    });
  }

  const topNext = getWin().chatAudioTopNext;
  if (topNext instanceof HTMLElement) {
    topNext.addEventListener("click", () => {
      const activeAudio = getActiveAudioElement();
      if (!(activeAudio instanceof HTMLAudioElement)) {
        return;
      }
      const wasPlaying = !activeAudio.paused;
      if (wasPlaying) {
        try { activeAudio.pause(); } catch {}
      }
      const duration = Number(activeAudio.duration) || Number.POSITIVE_INFINITY;
      const next = Math.min(duration, (Number(activeAudio.currentTime) || 0) + 10);
      commitAudioSeekTarget(activeAudio, next);
      const card = activeAudio.closest("[data-audio-card]");
      if (card instanceof HTMLElement) {
        updateAudioCardUi(card, activeAudio);
      } else {
        updateTopAudioPlayer(null, activeAudio);
      }
      if (wasPlaying) {
        activeAudio.play().then(() => {
          stopAudioRaf();
          tickActiveAudio();
        }).catch(() => {});
      }
    });
  }

  const topToggle = getWin().chatAudioTopToggle;
  if (topToggle instanceof HTMLElement) {
    topToggle.addEventListener("click", () => {
      const activeAudio = getActiveAudioElement();
      if (!(activeAudio instanceof HTMLAudioElement)) {
        return;
      }
      const card = activeAudio.closest("[data-audio-card]");
      if (activeAudio.paused) {
        activeAudio.play().then(() => {
          if (card instanceof HTMLElement) {
            setAudioToggleState(card, true);
          } else {
            const tog = getWin().chatAudioTopToggle;
            if (tog instanceof HTMLElement && getWin().updateIcon) {
              getWin().updateIcon(tog, "pause");
            }
          }
          stopAudioRaf();
          tickActiveAudio();
        }).catch(() => {
          if (card instanceof HTMLElement) {
            setAudioToggleState(card, false);
          } else {
            const tog = getWin().chatAudioTopToggle;
            if (tog instanceof HTMLElement && getWin().updateIcon) {
              getWin().updateIcon(tog, "play_arrow");
            }
          }
        });
        return;
      }
      activeAudio.pause();
      if (card instanceof HTMLElement) {
        setAudioToggleState(card, false);
        updateAudioCardUi(card, activeAudio);
      } else {
        const tog = getWin().chatAudioTopToggle;
        if (tog instanceof HTMLElement && getWin().updateIcon) {
          getWin().updateIcon(tog, "play_arrow");
        }
        updateTopAudioPlayer(null, activeAudio);
      }
    });
  }

  const topClose = getWin().chatAudioTopClose;
  if (topClose instanceof HTMLElement) {
    topClose.addEventListener("click", () => {
      stopActiveAudio();
    });
  }

  const topSpeed = getWin().chatAudioTopSpeed;
  if (topSpeed instanceof HTMLElement) {
    topSpeed.addEventListener("click", () => {
      const rates = [1, 1.5, 2];
      const currentIndex = rates.findIndex((value) => Math.abs(value - activeAudioSpeed) < 0.01);
      const nextRate = rates[(currentIndex + 1) % rates.length];
      activeAudioSpeed = nextRate;
      const activeAudio = getActiveAudioElement();
      if (activeAudio instanceof HTMLAudioElement) {
        activeAudio.playbackRate = nextRate;
        const card = activeAudio.closest("[data-audio-card]");
        if (card instanceof HTMLElement) {
          updateAudioCardUi(card, activeAudio);
        }
      } else {
        const sp = getWin().chatAudioTopSpeed;
        if (sp instanceof HTMLElement) {
          sp.textContent = String(nextRate).replace(/\.0$/, "") + "X";
        }
      }
    });
  }

  const topRepeat = getWin().chatAudioTopRepeat;
  if (topRepeat instanceof HTMLElement) {
    topRepeat.addEventListener("click", () => {
      activeAudioRepeat = !activeAudioRepeat;
      const activeAudio = getActiveAudioElement();
      if (activeAudio instanceof HTMLAudioElement) {
        activeAudio.loop = activeAudioRepeat;
      }
      const rep = getWin().chatAudioTopRepeat;
      if (rep instanceof HTMLElement) {
        rep.classList.toggle("is-active", activeAudioRepeat);
      }
    });
  }

  const topVolBtn = getWin().chatAudioTopVolume;
  if (topVolBtn instanceof HTMLElement) {
    topVolBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const popover = getWin().chatAudioTopVolumePopover;
      if (popover instanceof HTMLElement) {
        popover.classList.toggle("open");
      }
      if (activeAudioMuted || activeAudioVolume <= 0) {
        activeAudioMuted = false;
        activeAudioVolume = Math.max(0.01, Number(activeAudioLastNonZeroVolume) || 1);
      } else {
        activeAudioLastNonZeroVolume = Math.max(0.01, Number(activeAudioVolume) || 1);
        activeAudioMuted = true;
      }
      applyActiveAudioVolume();
    });
  }

  const topVolRange = getWin().chatAudioTopVolumeRange;
  if (topVolRange instanceof HTMLInputElement) {
    topVolRange.addEventListener("input", (event) => {
      const target = event.target instanceof HTMLInputElement ? event.target : null;
      if (!target) {
        return;
      }
      const nextVolume = Math.min(1, Math.max(0, Number(target.value) || 0));
      activeAudioVolume = nextVolume;
      if (nextVolume > 0) {
        activeAudioLastNonZeroVolume = nextVolume;
      }
      activeAudioMuted = nextVolume <= 0;
      applyActiveAudioVolume();
    });
  }

  document.addEventListener("click", (event) => {
    const popover = getWin().chatAudioTopVolumePopover;
    if (!(popover instanceof HTMLElement)) {
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (target && target.closest(".chat-audio-top-volume-wrap")) {
      return;
    }
    popover.classList.remove("open");
  });

  const seekFromTopProgressClientX = (clientX: number) => {
    const activeAudio = getActiveAudioElement();
    const topProgress = getWin().chatAudioTopProgress;
    if (!(activeAudio instanceof HTMLAudioElement) || !(topProgress instanceof HTMLElement)) {
      return;
    }
    const rect = topProgress.getBoundingClientRect();
    if (!rect.width || rect.width <= 0) {
      return;
    }
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const duration = Math.max(0, Number(activeAudio.duration) || 0);
    if (!duration) {
      return;
    }
    const next = ratio * duration;
    commitAudioSeekTarget(activeAudio, next);
    const card = activeAudio.closest("[data-audio-card]");
    if (card instanceof HTMLElement) {
      updateAudioCardUi(card, activeAudio);
    } else {
      updateTopAudioPlayer(null, activeAudio);
    }
  };

  const topProgress = getWin().chatAudioTopProgress;
  if (topProgress instanceof HTMLElement) {
    topProgress.addEventListener("pointerdown", (event) => {
      const activeAudio = getActiveAudioElement();
      if (!(activeAudio instanceof HTMLAudioElement)) {
        return;
      }
      topProgressSeekState = {
        wasPlaying: !activeAudio.paused
      };
      if (topProgressSeekState.wasPlaying) {
        try { activeAudio.pause(); } catch {}
      }
      seekFromTopProgressClientX(event.clientX);
    });
  }

  window.addEventListener("pointermove", (event) => {
    if (!topProgressSeekState) {
      return;
    }
    seekFromTopProgressClientX(event.clientX);
  });

  const finishTopProgressSeek = () => {
    const activeAudio = getActiveAudioElement();
    if (!topProgressSeekState || !(activeAudio instanceof HTMLAudioElement)) {
      topProgressSeekState = null;
      return;
    }
    const shouldResume = topProgressSeekState.wasPlaying;
    topProgressSeekState = null;
    if (shouldResume) {
      activeAudio.play().then(() => {
        stopAudioRaf();
        tickActiveAudio();
      }).catch(() => {});
      return;
    }
    const card = activeAudio.closest("[data-audio-card]");
    if (card instanceof HTMLElement) {
      setAudioToggleState(card, false);
      updateAudioCardUi(card, activeAudio);
    } else {
      const tog = getWin().chatAudioTopToggle;
      if (tog instanceof HTMLElement && getWin().updateIcon) {
        getWin().updateIcon(tog, "play_arrow");
      }
      updateTopAudioPlayer(null, activeAudio);
    }
  };

  window.addEventListener("pointerup", () => {
    finishTopProgressSeek();
  });

  window.addEventListener("pointercancel", () => {
    finishTopProgressSeek();
  });
});

getWin().hideTopAudioPlayer = hideTopAudioPlayer;
getWin().preserveActiveAudioForLayoutChange = preserveActiveAudioForLayoutChange;
getWin().reattachActiveAudioToVisibleCard = reattachActiveAudioToVisibleCard;
