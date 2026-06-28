export const callUtils = ({ rtcIceServers }) => `
      const createCallId = () => "call_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      const CALL_SETUP_TIMEOUT_MS = 22000;
      const CALL_RECONNECT_GRACE_MS = 8000;
      const rtcIceServersRaw = ${JSON.stringify(rtcIceServers || "")};

      const formatCallDuration = (seconds) => {
        const safeSeconds = Math.max(0, Math.floor(seconds || 0));
        const minutes = Math.floor(safeSeconds / 60);
        const remainder = safeSeconds % 60;
        return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
      };

      const parseRtcIceServers = () => {
        const normalizeUrlsList = (value) => {
          const list = Array.isArray(value) ? value : [value];
          return list
            .map((entry) => typeof entry === "string" ? entry.trim() : "")
            .filter(Boolean);
        };
        const isValidIceUrl = (value) => {
          if (typeof value !== "string") {
            return false;
          }
          const raw = value.trim();
          if (!raw) {
            return false;
          }
          // Accept stun/turn/turns with either hostname or IPv4 and optional
          // port/query. Reject malformed values like "stun::3478".
          return /^(stun|turn|turns):[a-z0-9.-]+(?::\\d{1,5})?(?:\\?.*)?$/i.test(raw);
        };
        const hasTurnUrl = (value) => normalizeUrlsList(value).some((entry) => /^turns?:/i.test(entry));
        const isValidTurnAuth = (username, credential) =>
          typeof username === "string"
          && username.trim().length > 0
          && typeof credential === "string"
          && credential.trim().length > 0;
        const defaultTurnHost = (window.location && window.location.hostname) ? window.location.hostname : "89.35.130.157";
        const fallback = [
          { urls: "stun:" + defaultTurnHost + ":3478" },
          {
            urls: [
              "turn:" + defaultTurnHost + ":3478?transport=udp",
              "turn:" + defaultTurnHost + ":3478?transport=tcp"
            ],
            username: "thegrapht_turn",
            credential: "thegrapht_turn_pass"
          }
        ];

        if (!rtcIceServersRaw) {
          logCall("ice_servers_fallback_default", { fallback });
          return fallback;
        }

        try {
          const parsed = JSON.parse(rtcIceServersRaw);
          if (!Array.isArray(parsed)) {
            return fallback;
          }

          const normalized = parsed
            .filter((item) => item && typeof item === "object")
            .map((item) => {
              const urls = item.urls;
              const username = typeof item.username === "string" ? item.username.trim() : "";
              const credential = typeof item.credential === "string" ? item.credential.trim() : "";

              if (typeof urls === "string" || Array.isArray(urls)) {
                const filteredUrls = normalizeUrlsList(urls).filter((entry) => isValidIceUrl(entry));
                if (!filteredUrls.length) {
                  warnCall("dropping_invalid_ice_server_urls", { urls });
                  return null;
                }

                if (hasTurnUrl(filteredUrls) && !isValidTurnAuth(username, credential)) {
                  warnCall("dropping_invalid_turn_server_missing_credentials", { urls });
                  return null;
                }

                return {
                  urls: Array.isArray(urls) ? filteredUrls : filteredUrls[0],
                  ...(username ? { username } : {}),
                  ...(credential ? { credential } : {})
                };
              }

              return null;
            })
            .filter(Boolean);

          const resolved = normalized.length ? normalized : fallback;
          logCall("ice_servers_resolved", { resolved });
          return resolved;
        } catch {
          warnCall("ice_servers_parse_failed_using_fallback", { rtcIceServersRaw });
          return fallback;
        }
      };


      const buildAnimatedDots = () => {
        const phase = (Math.floor(Date.now() / 420) % 3) + 1;
        return ".".repeat(phase);
      };

      const getCallElapsedSeconds = () => {
        if (!activeCall) {
          return 0;
        }
        if (activeCall.mode === "group") {
          return getGroupCallElapsedSecondsForCall(activeCall);
        }
        if (!activeCall.connectedAt) {
          return 0;
        }
        return Math.max(0, Math.floor((Date.now() - activeCall.connectedAt) / 1000));
      };
      const CLOSED_CALL_COOLDOWN_MS = 25000;
      const CALL_ACCEPT_BROADCAST_STORAGE_KEY = "thegrapht_call_accept_broadcast";
      const recentlyClosedCalls = new Map();
      const pruneRecentlyClosedCalls = () => {
        const now = Date.now();
        for (const [key, expiresAt] of recentlyClosedCalls.entries()) {
          if (!Number.isFinite(expiresAt) || expiresAt <= now) {
            recentlyClosedCalls.delete(key);
          }
        }
      };
      const buildClosedCallKey = (dialogId, callId) => {
        const safeDialogId = String(dialogId || "").trim();
        const safeCallId = String(callId || "").trim();
        if (!safeDialogId || !safeCallId) {
          return "";
        }
        return safeDialogId + "|" + safeCallId;
      };
      const rememberRecentlyClosedCall = (dialogId, callId) => {
        const key = buildClosedCallKey(dialogId, callId);
        if (!key) {
          return;
        }
        recentlyClosedCalls.set(key, Date.now() + CLOSED_CALL_COOLDOWN_MS);
      };
      const isRecentlyClosedCall = (dialogId, callId) => {
        pruneRecentlyClosedCalls();
        const key = buildClosedCallKey(dialogId, callId);
        if (!key) {
          return false;
        }
        return recentlyClosedCalls.has(key);
      };
      const broadcastCallAcceptedAcrossTabs = (call) => {
        if (!call?.callId || !call?.dialogId) {
          return;
        }
        try {
          window.localStorage.setItem(CALL_ACCEPT_BROADCAST_STORAGE_KEY, JSON.stringify({
            callId: String(call.callId || ""),
            dialogId: String(call.dialogId || ""),
            acceptedAt: Date.now()
          }));
        } catch {}
      };

      const getCallScreenOwnerName = () => {
        if (!activeCall) {
          return "";
        }
        if (activeCall.screenEnabled && activeCall.screenOwnerUserId === currentUserId) {
          return currentUserDisplayName || workspaceUserName.textContent || "You";
        }
        if (activeCall.remoteScreenSharing && activeCall.screenOwnerUserId && activeCall.screenOwnerUserId !== currentUserId) {
          return activeCall.peerName || "Remote user";
        }
        return activeCall.peerName || currentUserDisplayName || workspaceUserName.textContent || "User";
      };
      const ensureScreenOverlayNodes = () => {
        if (!(callModal instanceof HTMLElement)) {
          return null;
        }
        let overlay = callModal.querySelector(".call-screen-overlay");
        if (!(overlay instanceof HTMLElement)) {
          overlay = document.createElement("div");
          overlay.className = "call-screen-overlay";
          overlay.setAttribute("aria-hidden", "true");
          overlay.innerHTML = ""
            + '<div class="call-screen-overlay-backdrop" data-overlay-dismiss="true"></div>'
            + '<div class="call-screen-overlay-content">'
            +   '<div class="call-screen-overlay-title"></div>'
            +   '<div class="call-screen-overlay-stage" data-overlay-dismiss="true"></div>'
            +   '<div class="call-screen-overlay-hud">'
            +     window.getIcon("screen_share", "", 'aria-hidden="true"')
            +     '<span class="call-screen-overlay-owner"></span>'
            +   '</div>'
            + '</div>';
          callModal.appendChild(overlay);
        }
        const stage = overlay.querySelector(".call-screen-overlay-stage");
        const title = overlay.querySelector(".call-screen-overlay-title");
        const owner = overlay.querySelector(".call-screen-overlay-owner");
        if (!(stage instanceof HTMLElement) || !(title instanceof HTMLElement) || !(owner instanceof HTMLElement)) {
          return null;
        }
        return { overlay, stage, title, owner };
      };
      const closeExpandedScreenPreview = () => {
        if (!(callModal instanceof HTMLElement)) {
          return;
        }
        const nodes = ensureScreenOverlayNodes();
        if (!nodes) {
          return;
        }
        nodes.overlay.classList.remove("open");
        nodes.overlay.setAttribute("aria-hidden", "true");
        nodes.stage.innerHTML = "";
      };
      const openExpandedScreenPreview = () => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        const sourceVideo = document.getElementById("remote-screen-video");
        const sourceStream = sourceVideo instanceof HTMLVideoElement ? sourceVideo.srcObject : null;
        if (!(sourceStream instanceof MediaStream)) {
          return;
        }
        const nodes = ensureScreenOverlayNodes();
        if (!nodes) {
          return;
        }
        const ownerName = getCallScreenOwnerName();
        nodes.title.textContent = "Screen sharing: " + ownerName;
        nodes.owner.textContent = ownerName;
        nodes.stage.innerHTML = "";
        const expandedVideo = document.createElement("video");
        expandedVideo.className = "call-screen-overlay-video";
        expandedVideo.setAttribute("data-overlay-dismiss", "true");
        expandedVideo.autoplay = true;
        expandedVideo.playsInline = true;
        expandedVideo.srcObject = sourceStream;
        nodes.stage.appendChild(expandedVideo);
        nodes.overlay.classList.add("open");
        nodes.overlay.setAttribute("aria-hidden", "false");
        try {
          const playPromise = expandedVideo.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
        } catch {}
      };


`;
