// Notifications & Tab Active State Management Service
export {};

declare const getAvatarMeta: (idOrName: string, name: string) => { style: string; avatarUrl: string; letter: string };
declare const getMessagePreviewText: (message: any) => string;
declare const claimNotificationDelivery: (kind: string, id: string, ttlMs?: number) => boolean;
declare const applyRoute: (route: string) => void;
declare const loadDialog: (publicId: string, options?: any) => Promise<void>;
declare const wsInfo: (event: string, details: any) => void;

const getWin = () => window as any;

// Constants matching bootstrap.js/notifications.js configs
const ACTIVE_TAB_OWNER_STORAGE_KEY = "thegrapht_active_tab_owner";
const NOTIFICATION_OWNER_STORAGE_KEY = "thegrapht_notification_owner";
const BACKGROUND_REFRESH_INTERVAL_MS = 30 * 60 * 1000;
const NOTIFICATION_OWNER_TTL_MS = 22000;
const NOTIFICATION_OWNER_HEARTBEAT_MS = 8000;
const ACTIVE_TAB_OWNER_TTL_MS = 9000;
const MESSAGE_NOTIFICATION_DEDUPE_MS = 45000;

// Expose and reference global variables on window
let notificationOwnershipTimer: any = null;
let activeTabOwnershipTimer: any = null;
let backgroundRefreshTimer: any = null;

const canUseNotifications = () => typeof Notification !== "undefined";

const ensureNotificationPermission = async (): Promise<string> => {
  if (!canUseNotifications() || Notification.permission !== "default") {
    return Notification?.permission || "denied";
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission || "denied";
  }
};

const ensureAudioNode = (currentNode: HTMLAudioElement | null, src: string): HTMLAudioElement => {
  if (currentNode) {
    return currentNode;
  }
  const audio = new Audio(src);
  audio.preload = "auto";
  return audio;
};

const bindNotificationPermissionPrompt = () => {
  if (getWin().notificationPermissionBound || !canUseNotifications()) {
    return;
  }

  getWin().notificationPermissionBound = true;

  const unlock = () => {
    const sendSound = getWin().__THEGRAPHT_SEND_LOCAL_SOUND_URL__ || "";
    const messageSound = getWin().__THEGRAPHT_MESSAGE_SOUND_URL__ || "";
    getWin().sendAudioNode = ensureAudioNode(getWin().sendAudioNode, sendSound);
    getWin().messageAudioNode = ensureAudioNode(getWin().messageAudioNode, messageSound);
    try {
      getWin().sendAudioNode.load();
    } catch {}
    try {
      getWin().messageAudioNode.load();
    } catch {}
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    window.removeEventListener("touchstart", unlock, true);
  };

  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
  window.addEventListener("touchstart", unlock, true);
};

const playSound = (kind: "send" | "message") => {
  const sendSound = getWin().__THEGRAPHT_SEND_LOCAL_SOUND_URL__ || "";
  const messageSound = getWin().__THEGRAPHT_MESSAGE_SOUND_URL__ || "";
  const node = ensureAudioNode(
    kind === "send" ? getWin().sendAudioNode : getWin().messageAudioNode,
    kind === "send" ? sendSound : messageSound
  );

  if (kind === "send") {
    getWin().sendAudioNode = node;
  } else {
    getWin().messageAudioNode = node;
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
  const tabId = getWin().notificationTabId || "";
  const canClaim = force
    || !currentOwner
    || !currentOwner.tabId
    || currentOwner.expiresAt <= now
    || currentOwner.tabId === tabId;

  if (!canClaim) {
    return false;
  }

  try {
    window.localStorage.setItem(NOTIFICATION_OWNER_STORAGE_KEY, JSON.stringify({
      tabId,
      expiresAt: now + NOTIFICATION_OWNER_TTL_MS
    }));
    return true;
  } catch {
    return false;
  }
};

const isNotificationOwner = () => {
  const currentOwner = readNotificationOwner();
  const tabId = getWin().notificationTabId || "";
  return Boolean(currentOwner && currentOwner.tabId === tabId && currentOwner.expiresAt > Date.now());
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
  const tabId = getWin().notificationTabId || "";
  notificationOwnershipTimer = window.setInterval(() => {
    const currentOwner = readNotificationOwner();
    if (!currentOwner || currentOwner.tabId === tabId || !document.hidden || document.hasFocus()) {
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
  const tabId = getWin().notificationTabId || "";
  const canClaim = force
    || !currentOwner
    || !currentOwner.tabId
    || currentOwner.expiresAt <= now
    || currentOwner.tabId === tabId;
  if (!canClaim) {
    return false;
  }
  try {
    window.localStorage.setItem(ACTIVE_TAB_OWNER_STORAGE_KEY, JSON.stringify({
      tabId,
      expiresAt: now + ACTIVE_TAB_OWNER_TTL_MS
    }));
    return true;
  } catch {
    return false;
  }
};



const applyPrimaryTabState = (nextIsPrimary: boolean) => {
  if (getWin().tgDesktop) {
    nextIsPrimary = true;
  }
  const changed = getWin().isPrimaryActiveTab !== Boolean(nextIsPrimary);
  getWin().isPrimaryActiveTab = Boolean(nextIsPrimary);

  const multiTabBlocker = document.getElementById("multi-tab-blocker");
  if (multiTabBlocker) {
    multiTabBlocker.classList.toggle("visible", !getWin().isPrimaryActiveTab);
    multiTabBlocker.setAttribute("aria-hidden", getWin().isPrimaryActiveTab ? "true" : "false");
  }

  if (!getWin().isPrimaryActiveTab) {
    if (getWin().realtimeEnabled) {
      getWin().realtimeEnabled = false;
      if (typeof getWin().disableRealtime === "function") {
        getWin().disableRealtime();
      }
    }
    scheduleBackgroundRefresh();
    if (changed) {
      if (typeof getWin().showToast === "function") {
        getWin().showToast("Another tab is active. Close other tabs to continue here.", "error");
      }
    }
    return;
  }

  if (changed && getWin().currentUserId && !getWin().realtimeEnabled) {
    getWin().realtimeEnabled = true;
    if (typeof getWin().connectRealtime === "function") {
      getWin().connectRealtime();
    }
    scheduleBackgroundRefresh();
  }
};

const refreshPrimaryTabOwnership = () => {
  const shouldForce = !document.hidden || document.hasFocus();
  writeActiveTabOwner(shouldForce);
  const owner = readActiveTabOwner();
  const tabId = getWin().notificationTabId || "";
  applyPrimaryTabState(Boolean(owner && owner.tabId === tabId && owner.expiresAt > Date.now()));
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
    const tabId = getWin().notificationTabId || "";
    if (owner?.tabId === tabId) {
      window.localStorage.removeItem(ACTIVE_TAB_OWNER_STORAGE_KEY);
    }
  } catch {}
};

const pruneRecentMessageNotifications = () => {
  const threshold = Date.now() - MESSAGE_NOTIFICATION_DEDUPE_MS;
  const recentMap = getWin().recentMessageNotificationTimes;
  if (recentMap) {
    recentMap.forEach((timestamp: number, key: string) => {
      if (timestamp <= threshold) {
        recentMap.delete(key);
      }
    });
  }
};

const shouldSkipMessageNotification = (messageId: string) => {
  pruneRecentMessageNotifications();
  const recentMap = getWin().recentMessageNotificationTimes;
  if (!recentMap) {
    return false;
  }
  const previousTimestamp = recentMap.get(messageId);
  const now = Date.now();
  if (previousTimestamp && now - previousTimestamp < MESSAGE_NOTIFICATION_DEDUPE_MS) {
    return true;
  }

  recentMap.set(messageId, now);
  return false;
};

const showBackgroundRefreshNotification = async () => {
  const currentUserId = getWin().currentUserId;
  const logoDataUrl = getWin().__THEGRAPHT_LOGO_DATA_URL__ || "";
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
      icon: logoDataUrl,
      badge: logoDataUrl,
      tag: "thegrapht_background_refresh",
      renotify: false
    } as any);

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

  const currentUserId = getWin().currentUserId;
  if (!currentUserId || !document.hidden) {
    return;
  }

  backgroundRefreshTimer = window.setInterval(() => {
    void (async () => {
      if (getWin().backgroundRefreshInFlight || !getWin().currentUserId || !document.hidden) {
        return;
      }

      getWin().backgroundRefreshInFlight = true;
      try {
        if (typeof getWin().loadWorkspace === "function") {
          await getWin().loadWorkspace({ preserveRoute: true, scrollBehavior: "none" });
        }
        await showBackgroundRefreshNotification();
      } catch {} finally {
        getWin().backgroundRefreshInFlight = false;
      }
    })();
  }, BACKGROUND_REFRESH_INTERVAL_MS);
};

const resolveNotificationAvatarByUserId = (userId: string) => {
  const normalizedUserId = String(userId || "").trim();
  const allDialogs = getWin().allDialogs;
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

const buildNotificationAvatarUrl = (dialog: any, fallbackName = "", preferredUserId = "") => {
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

const isUndecryptableSecurePlaceholder = (value: string) => {
  const normalized = String(value || "").trim();
  return normalized === "Encrypted message unavailable on this device"
    || normalized === "New encrypted message"
    || normalized === "Encrypted message";
};

const showIncomingDesktopNotification = async (message: any, dialog: any) => {
  const currentUserId = getWin().currentUserId;
  const logoDataUrl = getWin().__THEGRAPHT_LOGO_DATA_URL__ || "";
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

  const recentMap = getWin().recentMessageNotificationTimes;
  const desktopIds = getWin().desktopNotificationIds;

  if ((desktopIds && desktopIds.has(message.id)) || shouldSkipMessageNotification(message.id)) {
    return;
  }

  if (desktopIds) {
    desktopIds.add(message.id);
  }

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
      badge: logoDataUrl,
      tag: "message_" + message.id,
      renotify: false
    } as any);

    window.setTimeout(() => {
      try {
        notification.close();
      } catch {}
    }, 8000);

    notification.onclick = () => {
      window.focus();
      if (dialog?.publicId) {
        getWin().pendingDialogPublicIdFromNotification = dialog.publicId;
        const applyRouteFn = getWin().applyRoute;
        if (typeof applyRouteFn === "function") applyRouteFn(dialog.publicId);
        const loadDialogFn = getWin().loadDialog;
        if (typeof loadDialogFn === "function") void loadDialogFn(dialog.publicId, { scrollBehavior: "auto" });
      }
      notification.close();
    };
  } catch {}
};

// Bind exports to window namespace
getWin().bindNotificationPermissionPrompt = bindNotificationPermissionPrompt;
getWin().playSound = playSound;
getWin().startNotificationOwnershipHeartbeat = startNotificationOwnershipHeartbeat;
getWin().startPrimaryTabOwnershipHeartbeat = startPrimaryTabOwnershipHeartbeat;
getWin().refreshPrimaryTabOwnership = refreshPrimaryTabOwnership;
getWin().refreshNotificationOwnership = refreshNotificationOwnership;
getWin().scheduleBackgroundRefresh = scheduleBackgroundRefresh;
getWin().releasePrimaryTabOwnership = releasePrimaryTabOwnership;
getWin().showIncomingDesktopNotification = showIncomingDesktopNotification;
