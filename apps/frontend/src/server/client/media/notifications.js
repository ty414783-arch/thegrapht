export const notifications = ({ sendLocalSoundUrl, messageSoundUrl, logoDataUrl }) => `

      const canUseNotifications = () => typeof Notification !== "undefined";

      const ensureNotificationPermission = async () => {
        if (!canUseNotifications() || Notification.permission !== "default") {
          return Notification?.permission || "denied";
        }

        try {
          return await Notification.requestPermission();
        } catch {
          return Notification.permission || "denied";
        }
      };

      const bindNotificationPermissionPrompt = () => {
        if (notificationPermissionBound || !canUseNotifications()) {
          return;
        }

        notificationPermissionBound = true;

        const unlock = () => {
          sendAudioNode = ensureAudioNode(sendAudioNode, ${JSON.stringify(sendLocalSoundUrl)});
          messageAudioNode = ensureAudioNode(messageAudioNode, ${JSON.stringify(messageSoundUrl)});
          try { sendAudioNode.load(); } catch {}
          try { messageAudioNode.load(); } catch {}
          window.removeEventListener("pointerdown", unlock, true);
          window.removeEventListener("keydown", unlock, true);
          window.removeEventListener("touchstart", unlock, true);
        };

        window.addEventListener("pointerdown", unlock, true);
        window.addEventListener("keydown", unlock, true);
        window.addEventListener("touchstart", unlock, true);
      };

      const ensureAudioNode = (currentNode, src) => {
        if (currentNode) {
          return currentNode;
        }

        const audio = new Audio(src);
        audio.preload = "auto";
        return audio;
      };

      const playSound = (kind) => {
        const node = ensureAudioNode(kind === "send" ? sendAudioNode : messageAudioNode, kind === "send" ? ${JSON.stringify(sendLocalSoundUrl)} : ${JSON.stringify(messageSoundUrl)});

        if (kind === "send") {
          sendAudioNode = node;
        } else {
          messageAudioNode = node;
        }

        try {
          node.currentTime = 0;
          const playPromise = node.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } catch {}
      };

      const isWindowInactive = () => document.hidden || !document.hasFocus();

      const readNotificationOwner = () => {
        try {
          const raw = window.localStorage.getItem(NOTIFICATION_OWNER_STORAGE_KEY);
          if (!raw) {
            return null;
          }

          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") {
            return null;
          }

          return {
            tabId: typeof parsed.tabId === "string" ? parsed.tabId : "",
            expiresAt: Number(parsed.expiresAt) || 0
          };
        } catch {
          return null;
        }
      };

      const writeNotificationOwner = (force = false) => {
        const now = Date.now();
        const currentOwner = readNotificationOwner();
        const canClaim = force
          || !currentOwner
          || !currentOwner.tabId
          || currentOwner.expiresAt <= now
          || currentOwner.tabId === notificationTabId;

        if (!canClaim) {
          return false;
        }

        try {
          window.localStorage.setItem(NOTIFICATION_OWNER_STORAGE_KEY, JSON.stringify({
            tabId: notificationTabId,
            expiresAt: now + NOTIFICATION_OWNER_TTL_MS
          }));
          return true;
        } catch {
          return false;
        }
      };

      const isNotificationOwner = () => {
        const currentOwner = readNotificationOwner();
        return Boolean(currentOwner && currentOwner.tabId === notificationTabId && currentOwner.expiresAt > Date.now());
      };

      const refreshNotificationOwnership = () => {
        const shouldForce = !document.hidden || document.hasFocus();
        writeNotificationOwner(shouldForce);
      };

      const startNotificationOwnershipHeartbeat = () => {
        if (notificationOwnershipTimer) {
          window.clearInterval(notificationOwnershipTimer);
        }

        refreshNotificationOwnership();
        notificationOwnershipTimer = window.setInterval(() => {
          const currentOwner = readNotificationOwner();
          if (!currentOwner || currentOwner.tabId === notificationTabId || !document.hidden || document.hasFocus()) {
            refreshNotificationOwnership();
          }
        }, NOTIFICATION_OWNER_HEARTBEAT_MS);
      };
      const readActiveTabOwner = () => {
        try {
          const raw = window.localStorage.getItem(ACTIVE_TAB_OWNER_STORAGE_KEY);
          if (!raw) {
            return null;
          }
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") {
            return null;
          }
          return {
            tabId: typeof parsed.tabId === "string" ? parsed.tabId : "",
            expiresAt: Number(parsed.expiresAt) || 0
          };
        } catch {
          return null;
        }
      };
      const writeActiveTabOwner = (force = false) => {
        const now = Date.now();
        const currentOwner = readActiveTabOwner();
        const canClaim = force
          || !currentOwner
          || !currentOwner.tabId
          || currentOwner.expiresAt <= now
          || currentOwner.tabId === notificationTabId;
        if (!canClaim) {
          return false;
        }
        try {
          window.localStorage.setItem(ACTIVE_TAB_OWNER_STORAGE_KEY, JSON.stringify({
            tabId: notificationTabId,
            expiresAt: now + ACTIVE_TAB_OWNER_TTL_MS
          }));
          return true;
        } catch {
          return false;
        }
      };
      const applyPrimaryTabState = (nextIsPrimary) => {
        const changed = isPrimaryActiveTab !== Boolean(nextIsPrimary);
        isPrimaryActiveTab = Boolean(nextIsPrimary);

        if (multiTabBlocker) {
          multiTabBlocker.classList.toggle("visible", !isPrimaryActiveTab);
          multiTabBlocker.setAttribute("aria-hidden", isPrimaryActiveTab ? "true" : "false");
        }

        if (!isPrimaryActiveTab) {
          if (realtimeEnabled) {
            realtimeEnabled = false;
            disableRealtime();
          }
          scheduleBackgroundRefresh();
          if (changed) {
            showToast("Another tab is active. Close other tabs to continue here.", "error");
          }
          return;
        }

        if (changed && currentUserId && !realtimeEnabled) {
          realtimeEnabled = true;
          connectRealtime();
          scheduleBackgroundRefresh();
        }
      };
      const refreshPrimaryTabOwnership = () => {
        const shouldForce = !document.hidden || document.hasFocus();
        writeActiveTabOwner(shouldForce);
        const owner = readActiveTabOwner();
        applyPrimaryTabState(Boolean(owner && owner.tabId === notificationTabId && owner.expiresAt > Date.now()));
      };
      const startPrimaryTabOwnershipHeartbeat = () => {
        if (activeTabOwnershipTimer) {
          window.clearInterval(activeTabOwnershipTimer);
          activeTabOwnershipTimer = null;
        }

        refreshPrimaryTabOwnership();
        activeTabOwnershipTimer = window.setInterval(() => {
          refreshPrimaryTabOwnership();
        }, Math.max(2200, Math.floor(ACTIVE_TAB_OWNER_TTL_MS / 3)));
      };
      const releasePrimaryTabOwnership = () => {
        try {
          const owner = readActiveTabOwner();
          if (owner?.tabId === notificationTabId) {
            window.localStorage.removeItem(ACTIVE_TAB_OWNER_STORAGE_KEY);
          }
        } catch {}
      };

      const pruneRecentMessageNotifications = () => {
        const threshold = Date.now() - MESSAGE_NOTIFICATION_DEDUPE_MS;
        recentMessageNotificationTimes.forEach((timestamp, key) => {
          if (timestamp <= threshold) {
            recentMessageNotificationTimes.delete(key);
          }
        });
      };

      const shouldSkipMessageNotification = (messageId) => {
        pruneRecentMessageNotifications();
        const previousTimestamp = recentMessageNotificationTimes.get(messageId);
        const now = Date.now();
        if (previousTimestamp && now - previousTimestamp < MESSAGE_NOTIFICATION_DEDUPE_MS) {
          return true;
        }

        recentMessageNotificationTimes.set(messageId, now);
        return false;
      };

      const showBackgroundRefreshNotification = async () => {
        if (!currentUserId || !document.hidden || !isNotificationOwner()) {
          return;
        }

        const permission = await ensureNotificationPermission();
        if (permission !== "granted") {
          return;
        }

        try {
          const notification = new Notification("TheGrapht", {
            body: "This site was refreshed in the background",
            icon: ${JSON.stringify(logoDataUrl)},
            badge: ${JSON.stringify(logoDataUrl)},
            tag: "thegrapht_background_refresh",
            renotify: false
          });

          window.setTimeout(() => {
            try {
              notification.close();
            } catch {}
          }, 6500);
        } catch {}
      };

      const scheduleBackgroundRefresh = () => {
        if (backgroundRefreshTimer) {
          window.clearInterval(backgroundRefreshTimer);
          backgroundRefreshTimer = null;
        }

        if (!currentUserId || !document.hidden) {
          return;
        }

        backgroundRefreshTimer = window.setInterval(() => {
          void (async () => {
            if (backgroundRefreshInFlight || !currentUserId || !document.hidden) {
              return;
            }

            backgroundRefreshInFlight = true;
            try {
              await loadWorkspace({ preserveRoute: true, scrollBehavior: "none" });
              await showBackgroundRefreshNotification();
            } catch {} finally {
              backgroundRefreshInFlight = false;
            }
          })();
        }, BACKGROUND_REFRESH_INTERVAL_MS);
      };

      const resolveNotificationAvatarByUserId = (userId) => {
        const normalizedUserId = String(userId || "").trim();
        if (!normalizedUserId || !Array.isArray(allDialogs)) {
          return "";
        }
        const directDialog = allDialogs.find((entry) => (
          entry
          && entry.type === "direct"
          && String(entry.peerUserId || "") === normalizedUserId
          && entry.avatarUrl
        ));
        return directDialog?.avatarUrl ? String(directDialog.avatarUrl) : "";
      };

      const buildNotificationAvatarUrl = (dialog, fallbackName = "", preferredUserId = "") => {
        const userAvatarUrl = resolveNotificationAvatarByUserId(preferredUserId);
        if (userAvatarUrl) {
          return userAvatarUrl;
        }
        if (dialog?.avatarUrl) {
          return String(dialog.avatarUrl);
        }
        const seed = dialog?.type === "direct"
          ? (dialog?.peerUserId || dialog?.publicId || dialog?.id || fallbackName || "?")
          : (dialog?.id || dialog?.publicId || fallbackName || "?");
        const label = dialog?.title || dialog?.subtitle || fallbackName || "?";
        const avatar = getAvatarMeta(seed, label);
        return avatar.avatarUrl;
      };

      const isUndecryptableSecurePlaceholder = (value) => {
        const normalized = String(value || "").trim();
        return normalized === "Encrypted message unavailable on this device"
          || normalized === "New encrypted message"
          || normalized === "Encrypted message";
      };

      const showIncomingDesktopNotification = async (message, dialog) => {
        if (!message?.id || message.senderId === currentUserId || !isWindowInactive()) {
          return;
        }

        const previewBody = String(getMessagePreviewText(message) || "").trim();
        const shouldSkipSecureNotification = message?.decryptionFailed
          || !previewBody
          || isUndecryptableSecurePlaceholder(previewBody);

        if (shouldSkipSecureNotification) {
          wsInfo("notification_skipped", {
            messageId: message.id || null,
            dialogId: dialog?.id || dialog?.publicId || null,
            reason: message?.decryptionFailed ? "decryption_failed" : (!previewBody ? "empty_preview" : "placeholder_preview")
          });
          return;
        }

        if (!claimNotificationDelivery("message", message.id, 20000)) {
          return;
        }

        if (desktopNotificationIds.has(message.id) || shouldSkipMessageNotification(message.id)) {
          return;
        }

        desktopNotificationIds.add(message.id);

        const isGroupDialog = dialog?.type === "group";
        const senderLabel = String(message.senderName || "Someone");
        const title = isGroupDialog
          ? String(dialog?.title || "Group")
          : String(message.senderName || dialog?.title || "TheGraphT");
        const defaultPreviewLabel = message.type === "image"
          ? "Photo"
          : (message.type === "audio" ? "Audio" : "New message");
        const previewLabel = previewBody || defaultPreviewLabel;
        const replyPrefix = message.replyToMessageId ? "replied to a message: " : "";
        const body = isGroupDialog
          ? (senderLabel + ": " + replyPrefix + previewLabel)
          : (
            message.replyToSenderId === currentUserId
              ? ("Replied to your message: " + previewLabel)
              : (replyPrefix + previewLabel)
          );

        playSound("message");

        const permission = await ensureNotificationPermission();
        if (permission !== "granted") {
          return;
        }

        try {
          const notification = new Notification(title, {
            body,
            icon: buildNotificationAvatarUrl(dialog, title, message?.senderId || ""),
            badge: ${JSON.stringify(logoDataUrl)},
            tag: "message_" + message.id,
            renotify: false
          });

          window.setTimeout(() => {
            try {
              notification.close();
            } catch {}
          }, 8000);

          notification.onclick = () => {
            window.focus();
            if (dialog?.publicId) {
              pendingDialogPublicIdFromNotification = dialog.publicId;
              applyRoute(dialog.publicId);
              void loadDialog(dialog.publicId, { scrollBehavior: "auto" });
            }
            notification.close();
          };
        } catch {}
      };

`;
