export const audioPlayer = () => `

      composerIconImages.forEach((node) => {
        node.addEventListener("dragstart", (event) => event.preventDefault());
        node.addEventListener("contextmenu", (event) => event.preventDefault());
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

      const ensureTelegramRippleClass = (target) => {
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

      let activeAudioElement = null;
      let activeAudioRafId = null;
      let activeAudioSeekState = null;
      const detachedActiveAudioHost = document.createElement("div");
      detachedActiveAudioHost.style.display = "none";
      detachedActiveAudioHost.setAttribute("aria-hidden", "true");
      document.body.appendChild(detachedActiveAudioHost);
      let topProgressSeekState = null;
      let activeAudioMessageId = "";
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

      const setAudioProgressVisual = (progress, currentValue, maxValue) => {
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

      const setAudioToggleState = (card, isPlaying) => {
        if (!(card instanceof HTMLElement)) {
          return;
        }
        card.classList.toggle("is-playing", Boolean(isPlaying));
        const icon = card.querySelector(".message-audio-toggle-icon");
        if (icon instanceof HTMLElement) {
          icon.textContent = isPlaying ? "pause" : "play_arrow";
        }
        if (chatAudioTopToggleIcon instanceof HTMLElement && activeAudioElement && card?.contains(activeAudioElement)) {
          chatAudioTopToggleIcon.textContent = isPlaying ? "pause" : "play_arrow";
        }
      };

      const updateTopAudioProgress = (currentTime, duration) => {
        if (!(chatAudioTopProgressFill instanceof HTMLElement)) {
          return;
        }
        const safeDuration = Math.max(0.001, Number(duration) || 0.001);
        const safeCurrent = Math.min(Math.max(0, Number(currentTime) || 0), safeDuration);
        const percent = Math.min(100, Math.max(0, (safeCurrent / safeDuration) * 100));
        chatAudioTopProgressFill.style.setProperty("--audio-top-progress", percent.toFixed(3) + "%");
      };

      const applyActiveAudioVolume = () => {
        if (activeAudioElement instanceof HTMLAudioElement) {
          activeAudioElement.volume = Math.min(1, Math.max(0, Number(activeAudioVolume) || 0));
          activeAudioElement.muted = Boolean(activeAudioMuted || activeAudioVolume <= 0);
        }
        if (chatAudioTopVolumeRange instanceof HTMLInputElement) {
          chatAudioTopVolumeRange.value = String(Math.min(1, Math.max(0, Number(activeAudioVolume) || 0)));
        }
        if (chatAudioTopVolumeIcon instanceof HTMLElement) {
          chatAudioTopVolumeIcon.textContent = (activeAudioMuted || activeAudioVolume <= 0) ? "volume_off" : "volume_up";
        }
      };

      const hideTopAudioPlayer = () => {
        const wasVisible = chatWindow instanceof HTMLElement && chatWindow.classList.contains("audio-top-player-visible");
        const listTopBefore = messageList instanceof HTMLElement ? messageList.scrollTop : 0;
        if (chatAudioTopPlayer instanceof HTMLElement) {
          chatAudioTopPlayer.classList.remove("visible");
          chatAudioTopPlayer.setAttribute("aria-hidden", "true");
        }
        if (chatWindow instanceof HTMLElement) {
          chatWindow.classList.remove("audio-top-player-visible");
        }
        if (wasVisible && messageList instanceof HTMLElement) {
          messageList.scrollTop = Math.max(0, listTopBefore - 56);
        }
      };

      const updateTopAudioPlayer = (card, audioElement) => {
        if (!(chatAudioTopPlayer instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
          return;
        }
        if (card instanceof HTMLElement) {
          const nameNode = card.querySelector(".message-audio-name");
          activeAudioMessageId = String(card.getAttribute("data-message-id") || "");
          activeAudioTrackInfo = {
            title: String(nameNode?.textContent || "Audio").trim() || "Audio",
            sizeBytes: Number(card.getAttribute("data-audio-size") || 0) || 0
          };
        }
        const duration = card instanceof HTMLElement
          ? getAudioCardDurationSeconds(card, audioElement)
          : (Number(audioElement.duration) || 0);
        const currentTime = Math.max(0, Number(audioElement.currentTime) || 0);

        if (chatAudioTopTitle instanceof HTMLElement) {
          chatAudioTopTitle.textContent = activeAudioTrackInfo.title || "Audio";
        }
        if (chatAudioTopMeta instanceof HTMLElement) {
          chatAudioTopMeta.textContent = (formatDuration(currentTime) || "0:00") + " · Unknown artist";
        }
        if (chatAudioTopToggleIcon instanceof HTMLElement) {
          chatAudioTopToggleIcon.textContent = audioElement.paused ? "play_arrow" : "pause";
        }
        if (chatAudioTopSpeed instanceof HTMLElement) {
          chatAudioTopSpeed.textContent = (Number(audioElement.playbackRate || 1)).toFixed(1).replace(/\.0$/, "") + "X";
        }
        if (chatAudioTopRepeat instanceof HTMLElement) {
          chatAudioTopRepeat.classList.toggle("is-active", Boolean(audioElement.loop));
        }
        applyActiveAudioVolume();
        updateTopAudioProgress(currentTime, duration);

        const wasVisible = chatWindow instanceof HTMLElement && chatWindow.classList.contains("audio-top-player-visible");
        const listTopBefore = messageList instanceof HTMLElement ? messageList.scrollTop : 0;

        chatAudioTopPlayer.classList.add("visible");
        chatAudioTopPlayer.setAttribute("aria-hidden", "false");
        if (chatWindow instanceof HTMLElement) {
          chatWindow.classList.add("audio-top-player-visible");
        }
        if (!wasVisible && messageList instanceof HTMLElement) {
          messageList.scrollTop = listTopBefore + 56;
        }
      };

      const getAudioCardDurationSeconds = (card, audioElement) => {
        const fromAudio = Number(audioElement?.duration) || 0;
        if (fromAudio > 0) {
          return fromAudio;
        }
        if (!(card instanceof HTMLElement)) {
          return 0;
        }
        return Number(card.getAttribute("data-audio-duration") || 0) || 0;
      };

      const updateAudioCardUi = (card, audioElement) => {
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

      const playAudioFromCard = (card, audioElement) => {
        if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
          return false;
        }
        ensureAudioFallbackBinding(audioElement);
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
            activeAudioElement = audioElement;
            activeAudioMessageId = String(card.getAttribute("data-message-id") || "");
            setAudioToggleState(card, true);
            stopAudioRaf();
            tickActiveAudio();
          }).catch(() => {
            setAudioToggleState(card, false);
            if (activeAudioElement === audioElement) {
              activeAudioElement = null;
            }
            activeAudioMessageId = "";
            hideTopAudioPlayer();
          });
        } else {
          activeAudioElement = audioElement;
          activeAudioMessageId = String(card.getAttribute("data-message-id") || "");
          setAudioToggleState(card, true);
          stopAudioRaf();
          tickActiveAudio();
        }
        return true;
      };

      const playAdjacentAudioTrack = (fromCard, direction = 1) => {
        if (!(fromCard instanceof HTMLElement) || !(messageList instanceof HTMLElement)) {
          return false;
        }
        const cards = Array.from(messageList.querySelectorAll("[data-audio-card]"));
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

      const stopActiveAudio = ({ except, keepTopPlayerVisible = false } = {}) => {
        if (!(activeAudioElement instanceof HTMLAudioElement)) {
          stopAudioRaf();
          return;
        }
        if (except && activeAudioElement === except) {
          return;
        }
        try {
          activeAudioElement.pause();
        } catch {}
        const activeCard = activeAudioElement.closest("[data-audio-card]");
        if (activeCard instanceof HTMLElement) {
          setAudioToggleState(activeCard, false);
          updateAudioCardUi(activeCard, activeAudioElement);
        }
        activeAudioElement = null;
        activeAudioMessageId = "";
        topProgressSeekState = null;
        if (!keepTopPlayerVisible) {
          hideTopAudioPlayer();
        }
        stopAudioRaf();
      };

      const preserveActiveAudioForLayoutChange = () => {
        if (!(activeAudioElement instanceof HTMLAudioElement)) {
          return;
        }
        if (!activeAudioElement.isConnected) {
          return;
        }
        if (messageList instanceof HTMLElement && messageList.contains(activeAudioElement)) {
          detachedActiveAudioHost.appendChild(activeAudioElement);
        }
      };

      const reattachActiveAudioToVisibleCard = () => {
        if (!(activeAudioElement instanceof HTMLAudioElement) || !(messageList instanceof HTMLElement)) {
          return;
        }
        const messageId = String(activeAudioMessageId || "").trim();
        if (!messageId) {
          return;
        }
        const selector = '[data-audio-card][data-message-id="' + CSS.escape(messageId) + '"]';
        const card = messageList.querySelector(selector);
        if (!(card instanceof HTMLElement)) {
          return;
        }
        const renderedAudio = card.querySelector(".message-audio-element");
        if (renderedAudio instanceof HTMLAudioElement && renderedAudio !== activeAudioElement) {
          renderedAudio.replaceWith(activeAudioElement);
        } else if (!renderedAudio) {
          card.appendChild(activeAudioElement);
        }
        setAudioToggleState(card, !activeAudioElement.paused);
        updateAudioCardUi(card, activeAudioElement);
      };

      const tickActiveAudio = () => {
        if (!(activeAudioElement instanceof HTMLAudioElement)) {
          stopAudioRaf();
          return;
        }
        reattachActiveAudioToVisibleCard();
        const card = activeAudioElement.closest("[data-audio-card]");
        if (card instanceof HTMLElement) {
          updateAudioCardUi(card, activeAudioElement);
        } else {
          updateTopAudioPlayer(null, activeAudioElement);
        }
        if (activeAudioElement.ended) {
          if (!activeAudioRepeat && card instanceof HTMLElement && playAdjacentAudioTrack(card, 1)) {
            return;
          }
          if (card instanceof HTMLElement) {
            setAudioToggleState(card, false);
            updateAudioCardUi(card, activeAudioElement);
          } else if (chatAudioTopToggleIcon instanceof HTMLElement) {
            chatAudioTopToggleIcon.textContent = "play_arrow";
          }
          activeAudioElement = null;
          activeAudioMessageId = "";
          hideTopAudioPlayer();
          stopAudioRaf();
          return;
        }
        if (!activeAudioElement.paused) {
          activeAudioRafId = window.requestAnimationFrame(tickActiveAudio);
        } else {
          stopAudioRaf();
        }
      };

      const ensureAudioFallbackBinding = (audioElement) => {
        if (!(audioElement instanceof HTMLAudioElement) || audioElement.dataset.errorBound === "true") {
          return;
        }
        audioElement.dataset.errorBound = "true";
        audioElement.addEventListener("error", () => {
          const fallbackSrc = String(audioElement.getAttribute("data-fallback-src") || "");
          if (fallbackSrc && audioElement.dataset.fallbackTried !== "true") {
            audioElement.dataset.fallbackTried = "true";
            audioElement.src = fallbackSrc;
            try { audioElement.load(); } catch {}
          }
        });
      };

      const commitAudioSeekTarget = (audioElement, targetTime) => {
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

      const beginAudioSeek = (card, audioElement) => {
        if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
          return;
        }
        activeAudioSeekState = {
          card,
          audioElement,
          previewTime: Number(audioElement.currentTime) || 0,
          wasPlaying: !audioElement.paused,
          wasActive: activeAudioElement === audioElement
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
              activeAudioElement = seekState.audioElement;
              setAudioToggleState(seekState.card, true);
              stopAudioRaf();
              tickActiveAudio();
            }).catch(() => {
              setAudioToggleState(seekState.card, false);
              updateAudioCardUi(seekState.card, seekState.audioElement);
            });
          } else {
            activeAudioElement = seekState.audioElement;
            setAudioToggleState(seekState.card, true);
            stopAudioRaf();
            tickActiveAudio();
          }
          return;
        }

        if (seekState.wasActive) {
          activeAudioElement = null;
        }
        setAudioToggleState(seekState.card, false);
        updateAudioCardUi(seekState.card, seekState.audioElement);
      };

      messageList.addEventListener("click", (event) => {
        const toggle = event.target instanceof Element ? event.target.closest("[data-audio-toggle]") : null;
        if (!toggle) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const card = toggle.closest("[data-audio-card]");
        const audioElement = card?.querySelector(".message-audio-element");
        if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
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
        if (activeAudioElement === audioElement) {
          activeAudioElement = null;
          hideTopAudioPlayer();
          stopAudioRaf();
        }
      });

      messageList.addEventListener("input", (event) => {
        const progress = event.target instanceof Element ? event.target.closest("[data-audio-progress]") : null;
        if (!(progress instanceof HTMLInputElement)) {
          return;
        }
        event.stopPropagation();
        const card = progress.closest("[data-audio-card]");
        const audioElement = card?.querySelector(".message-audio-element");
        if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
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

      messageList.addEventListener("pointerdown", (event) => {
        const progress = event.target instanceof Element ? event.target.closest("[data-audio-progress]") : null;
        if (!(progress instanceof HTMLInputElement)) {
          return;
        }
        const card = progress.closest("[data-audio-card]");
        const audioElement = card?.querySelector(".message-audio-element");
        if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
          return;
        }
        beginAudioSeek(card, audioElement);
      });

      messageList.addEventListener("change", (event) => {
        const progress = event.target instanceof Element ? event.target.closest("[data-audio-progress]") : null;
        if (!(progress instanceof HTMLInputElement)) {
          return;
        }
        const card = progress.closest("[data-audio-card]");
        const audioElement = card?.querySelector(".message-audio-element");
        if (!(card instanceof HTMLElement) || !(audioElement instanceof HTMLAudioElement)) {
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

      window.addEventListener("pointerup", () => {
        finishAudioSeek();
      });

      window.addEventListener("pointercancel", () => {
        finishAudioSeek();
      });

      chatAudioTopPrev?.addEventListener("click", () => {
        if (!(activeAudioElement instanceof HTMLAudioElement)) {
          return;
        }
        const wasPlaying = !activeAudioElement.paused;
        if (wasPlaying) {
          try { activeAudioElement.pause(); } catch {}
        }
        const next = Math.max(0, (Number(activeAudioElement.currentTime) || 0) - 10);
        commitAudioSeekTarget(activeAudioElement, next);
        const card = activeAudioElement.closest("[data-audio-card]");
        if (card instanceof HTMLElement) {
          updateAudioCardUi(card, activeAudioElement);
        } else {
          updateTopAudioPlayer(null, activeAudioElement);
        }
        if (wasPlaying) {
          activeAudioElement.play().then(() => {
            stopAudioRaf();
            tickActiveAudio();
          }).catch(() => {});
        }
      });

      chatAudioTopNext?.addEventListener("click", () => {
        if (!(activeAudioElement instanceof HTMLAudioElement)) {
          return;
        }
        const wasPlaying = !activeAudioElement.paused;
        if (wasPlaying) {
          try { activeAudioElement.pause(); } catch {}
        }
        const duration = Number(activeAudioElement.duration) || Number.POSITIVE_INFINITY;
        const next = Math.min(duration, (Number(activeAudioElement.currentTime) || 0) + 10);
        commitAudioSeekTarget(activeAudioElement, next);
        const card = activeAudioElement.closest("[data-audio-card]");
        if (card instanceof HTMLElement) {
          updateAudioCardUi(card, activeAudioElement);
        } else {
          updateTopAudioPlayer(null, activeAudioElement);
        }
        if (wasPlaying) {
          activeAudioElement.play().then(() => {
            stopAudioRaf();
            tickActiveAudio();
          }).catch(() => {});
        }
      });

      chatAudioTopToggle?.addEventListener("click", () => {
        if (!(activeAudioElement instanceof HTMLAudioElement)) {
          return;
        }
        const card = activeAudioElement.closest("[data-audio-card]");
        if (activeAudioElement.paused) {
          activeAudioElement.play().then(() => {
            if (card instanceof HTMLElement) {
              setAudioToggleState(card, true);
            } else if (chatAudioTopToggleIcon instanceof HTMLElement) {
              chatAudioTopToggleIcon.textContent = "pause";
            }
            stopAudioRaf();
            tickActiveAudio();
          }).catch(() => {
            if (card instanceof HTMLElement) {
              setAudioToggleState(card, false);
            } else if (chatAudioTopToggleIcon instanceof HTMLElement) {
              chatAudioTopToggleIcon.textContent = "play_arrow";
            }
          });
          return;
        }
        activeAudioElement.pause();
        if (card instanceof HTMLElement) {
          setAudioToggleState(card, false);
          updateAudioCardUi(card, activeAudioElement);
        } else if (chatAudioTopToggleIcon instanceof HTMLElement) {
          chatAudioTopToggleIcon.textContent = "play_arrow";
          updateTopAudioPlayer(null, activeAudioElement);
        }
      });

      chatAudioTopClose?.addEventListener("click", () => {
        stopActiveAudio();
      });

      chatAudioTopSpeed?.addEventListener("click", () => {
        const rates = [1, 1.5, 2];
        const currentIndex = rates.findIndex((value) => Math.abs(value - activeAudioSpeed) < 0.01);
        const nextRate = rates[(currentIndex + 1) % rates.length];
        activeAudioSpeed = nextRate;
        if (activeAudioElement instanceof HTMLAudioElement) {
          activeAudioElement.playbackRate = nextRate;
          const card = activeAudioElement.closest("[data-audio-card]");
          if (card instanceof HTMLElement) {
            updateAudioCardUi(card, activeAudioElement);
          }
        } else if (chatAudioTopSpeed instanceof HTMLElement) {
          chatAudioTopSpeed.textContent = String(nextRate).replace(/\.0$/, "") + "X";
        }
      });

      chatAudioTopRepeat?.addEventListener("click", () => {
        activeAudioRepeat = !activeAudioRepeat;
        if (activeAudioElement instanceof HTMLAudioElement) {
          activeAudioElement.loop = activeAudioRepeat;
        }
        if (chatAudioTopRepeat instanceof HTMLElement) {
          chatAudioTopRepeat.classList.toggle("is-active", activeAudioRepeat);
        }
      });

      chatAudioTopVolume?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (chatAudioTopVolumePopover instanceof HTMLElement) {
          chatAudioTopVolumePopover.classList.toggle("open");
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

      chatAudioTopVolumeRange?.addEventListener("input", (event) => {
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

      document.addEventListener("click", (event) => {
        if (!(chatAudioTopVolumePopover instanceof HTMLElement)) {
          return;
        }
        const target = event.target instanceof Element ? event.target : null;
        if (target && target.closest(".chat-audio-top-volume-wrap")) {
          return;
        }
        chatAudioTopVolumePopover.classList.remove("open");
      });

      const seekFromTopProgressClientX = (clientX) => {
        if (!(activeAudioElement instanceof HTMLAudioElement) || !(chatAudioTopProgress instanceof HTMLElement)) {
          return;
        }
        const rect = chatAudioTopProgress.getBoundingClientRect();
        if (!rect.width || rect.width <= 0) {
          return;
        }
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const duration = Math.max(0, Number(activeAudioElement.duration) || 0);
        if (!duration) {
          return;
        }
        const next = ratio * duration;
        commitAudioSeekTarget(activeAudioElement, next);
        const card = activeAudioElement.closest("[data-audio-card]");
        if (card instanceof HTMLElement) {
          updateAudioCardUi(card, activeAudioElement);
        } else {
          updateTopAudioPlayer(null, activeAudioElement);
        }
      };

      chatAudioTopProgress?.addEventListener("pointerdown", (event) => {
        if (!(activeAudioElement instanceof HTMLAudioElement)) {
          return;
        }
        topProgressSeekState = {
          wasPlaying: !activeAudioElement.paused
        };
        if (topProgressSeekState.wasPlaying) {
          try { activeAudioElement.pause(); } catch {}
        }
        seekFromTopProgressClientX(event.clientX);
      });

      window.addEventListener("pointermove", (event) => {
        if (!topProgressSeekState) {
          return;
        }
        seekFromTopProgressClientX(event.clientX);
      });

      const finishTopProgressSeek = () => {
        if (!topProgressSeekState || !(activeAudioElement instanceof HTMLAudioElement)) {
          topProgressSeekState = null;
          return;
        }
        const shouldResume = topProgressSeekState.wasPlaying;
        topProgressSeekState = null;
        if (shouldResume) {
          activeAudioElement.play().then(() => {
            stopAudioRaf();
            tickActiveAudio();
          }).catch(() => {});
          return;
        }
        const card = activeAudioElement.closest("[data-audio-card]");
        if (card instanceof HTMLElement) {
          setAudioToggleState(card, false);
          updateAudioCardUi(card, activeAudioElement);
        } else if (chatAudioTopToggleIcon instanceof HTMLElement) {
          chatAudioTopToggleIcon.textContent = "play_arrow";
          updateTopAudioPlayer(null, activeAudioElement);
        }
      };

      window.addEventListener("pointerup", () => {
        finishTopProgressSeek();
      });

      window.addEventListener("pointercancel", () => {
        finishTopProgressSeek();
      });


`;
