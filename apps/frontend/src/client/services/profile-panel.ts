// Profile Panel Service for Preact / TypeScript Migration
import { t } from "../i18n";

declare const realtimeSocket: WebSocket | null;
declare const currentDialogId: string;
declare const activeCall: any;
declare const stopAndReleaseCallMedia: () => Promise<void>;
declare const clearCallTimers: () => void;
declare const currentDialogPublicId: string;
declare const pendingAutoBottomDialogPublicId: string;
declare const pendingAutoBottomCanceled: boolean;
declare const currentUserId: string;
declare const currentUserUsername: string;
declare const currentUserEmail: string;
declare const currentUserDisplayName: string;
declare const currentUserAvatarLetter: string;
declare const currentUserAvatarUrl: string;
declare const allDialogs: any[];
declare const dialogPayloadCache: Map<string, any>;
declare const setDialogPayloadCache: (publicId: string, payload: any) => void;
declare const chatWindow: HTMLElement;
declare const prefetchedMediaUrls: Set<string>;
declare const currentDialogSnapshot: any;
declare const currentMessagesSnapshot: any[];
declare const releaseLocalMessageMediaUrls: () => void;
declare const localOutgoingMessages: any[];
declare const currentSearchQuery: string;
declare const currentSearchResults: any[];
declare const peerActiveInCurrentDialog: boolean;
declare const currentPeerReadAt: any;
declare const onlineUserIds: Set<string>;
declare const clearTypingIndicators: () => void;
declare const clearPendingImageAttachment: () => void;
declare const clearPendingReplyMessage: () => void;
declare const closeMessageContextMenu: () => void;
declare const closeDeleteMessageModal: () => void;
declare const closeViewerModal: () => void;
declare const sidebarSearch: HTMLInputElement;
declare const desktopNotificationIds: Set<string>;
declare const recentMessageNotificationTimes: Map<string, number>;
declare const chatScrollBottom: HTMLElement;
declare const chatScrollDayHideTimer: any;
declare const hideScrollDayIndicator: () => void;
declare const chatScrollDayLastLabel: string;
declare const isNearChatBottom: boolean;
declare const closeChatSearch: () => void;
declare const workspaceUserName: HTMLElement;
declare const persistLegacySessionToken: (token: string) => void;

declare const closeDialog: (opts?: any) => void;
declare const switchView: (visible: boolean) => void;
declare const applyRoute: (route: string) => void;
declare const pageRoot: HTMLElement;
declare const setStatus: (msg: string, type?: string) => void;
declare const showToast: (msg: string, type?: string) => void;
declare const resendTimer: any;
declare const pendingAuthPayload: any;
declare const pendingAuthMode: any;
declare const pendingAuthEmail: any;
declare const resendAttemptsLeft: number;
declare const mode: string;
declare const animateModeChange: (m: string) => void;

declare const dialogTypeLabels: Record<string, string>;
declare const dialogTypeTitles: Record<string, string>;
declare const dialogTypeOrder: string[];
declare const dialogTypeIcons: Record<string, string>;
declare const savedIcon: string;

declare const chatHeaderAvatar: HTMLElement;
declare const chatProfilePanel: HTMLElement;
declare const chatProfileAvatar: HTMLElement;
declare const chatProfileName: HTMLElement;
declare const chatProfileStatus: HTMLElement;
declare const chatProfileLink: HTMLAnchorElement;
declare const syncGroupCallBanner: () => void;
declare const chatSearchPanel: HTMLElement;
declare const renderChatSearchResults: () => void;

declare const groupMemberContextMenu: HTMLElement;
declare const groupMemberContextMenuBody: HTMLElement;
declare const groupMemberContextMenuState: any;
declare const groupMemberContextMenuCloseTimer: any;

declare const profileLinkContextMenu: HTMLElement;
declare const profileLinkContextMenuBody: HTMLElement;
declare const profileLinkContextMenuState: any;
declare const profileLinkContextMenuCloseTimer: any;

declare const loadDialog: (id: string, opts?: any) => Promise<void>;
declare const createPreferredDirectDialog: (id: string) => Promise<any>;
declare const prepareDialogPayloadForDisplay: (dialog: any, messages: any[]) => Promise<any>;
declare const updateDialogInState: (dialog: any, meta?: any) => any;
declare const renderDialogs: (dialogs: any[]) => void;
declare const viewerModal: HTMLElement;
declare const setViewerZoom: (zoom: number) => void;
declare const viewerZoom: number;
declare const rerenderDialogsIfVisible: () => void;

declare const getTypingUsersForDialog: (dialogId: string) => any[];
declare const formatLastSeen: (time: any) => string;

// Format helpers from format-utils
declare const escapeHtml: (v: any) => string;
declare const getAvatarMeta: (seed: any, label: any) => any;

const getWin = () => window as any;

const safeGetIcon = (name: string, extraClasses = "", attrs = ""): string => {
  try {
    const fn = (window as any).getIcon;
    if (typeof fn === "function") {
      return fn(name, extraClasses, attrs);
    }
  } catch (_) {}
  return "";
};

let typingStopTimer: any = null;
let groupMemberContextMenuCloseTimerLocal: any = null;
let profileLinkContextMenuCloseTimerLocal: any = null;

const sendTypingState = (isTyping: boolean) => {
  if (isTyping && getWin().__THEGRAPHT_USER_SETTINGS__?.typingIndicators === false) {
    return;
  }
  const socket = getWin().realtimeSocket;
  if (!socket || socket.readyState !== WebSocket.OPEN || !getWin().currentDialogId) {
    return;
  }

  socket.send(JSON.stringify({
    type: "typing",
    dialogId: getWin().currentDialogId,
    isTyping
  }));
};

const scheduleTypingStop = () => {
  if (typingStopTimer) {
    window.clearTimeout(typingStopTimer);
  }

  typingStopTimer = window.setTimeout(() => {
    sendTypingState(false);
  }, 1600);
};

const resetWorkspaceState = () => {
  if (getWin().activeCall && typeof stopAndReleaseCallMedia === 'function') {
    void stopAndReleaseCallMedia();
  }
  if (getWin().backgroundRefreshTimer) {
    window.clearInterval(getWin().backgroundRefreshTimer);
    getWin().backgroundRefreshTimer = null;
  }
  getWin().backgroundRefreshInFlight = false;
  if (typeof clearCallTimers === 'function') {
    clearCallTimers();
  }
  getWin().activeCall = null;
  getWin().currentDialogId = "";
  getWin().currentDialogPublicId = "";
  getWin().pendingAutoBottomDialogPublicId = "";
  getWin().pendingAutoBottomCanceled = false;
  getWin().currentUserId = "";
  getWin().currentUserUsername = "";
  getWin().currentUserEmail = "";
  getWin().currentUserDisplayName = "";
  getWin().currentUserAvatarLetter = "";
  getWin().currentUserAvatarUrl = "";
  getWin().allDialogs = [];
  if (getWin().dialogPayloadCache) {
    getWin().dialogPayloadCache.clear();
  }
  if (getWin().prefetchedMediaUrls) {
    getWin().prefetchedMediaUrls.clear();
  }
  getWin().currentDialogSnapshot = null;
  getWin().currentMessagesSnapshot = [];
  if (typeof releaseLocalMessageMediaUrls === 'function') {
    releaseLocalMessageMediaUrls();
  }
  getWin().localOutgoingMessages = [];
  getWin().currentSearchQuery = "";
  getWin().currentSearchResults = [];
  getWin().peerActiveInCurrentDialog = false;
  getWin().currentPeerReadAt = null;
  if (getWin().onlineUserIds instanceof Set) {
    getWin().onlineUserIds.clear();
  }
  if (typeof clearTypingIndicators === 'function') {
    clearTypingIndicators();
  }
  if (getWin().clearPendingImageAttachment) {
    getWin().clearPendingImageAttachment();
  }
  if (typeof clearPendingReplyMessage === 'function') {
    clearPendingReplyMessage();
  }
  if (typeof getWin().closeMessageContextMenu === 'function') {
    getWin().closeMessageContextMenu();
  }
  if (typeof getWin().closeDeleteMessageModal === 'function') {
    getWin().closeDeleteMessageModal();
  }
  if (getWin().closeViewerModal) {
    getWin().closeViewerModal();
  }
  if (typeof sidebarSearch !== 'undefined' && sidebarSearch) {
    sidebarSearch.value = "";
  }
  if (getWin().desktopNotificationIds) {
    getWin().desktopNotificationIds.clear();
  }
  if (getWin().recentMessageNotificationTimes) {
    getWin().recentMessageNotificationTimes.clear();
  }
  if (typeof chatScrollBottom !== 'undefined' && chatScrollBottom) {
    chatScrollBottom.classList.remove("visible");
  }
  if (getWin().chatScrollDayHideTimer) {
    window.clearTimeout(getWin().chatScrollDayHideTimer);
    getWin().chatScrollDayHideTimer = null;
  }
  if (typeof hideScrollDayIndicator === 'function') {
    hideScrollDayIndicator();
  }
  getWin().chatScrollDayLastLabel = "";
  getWin().isNearChatBottom = true;
  if (typeof getWin().closeChatSearch === 'function') {
    getWin().closeChatSearch();
  }
  if (typeof workspaceUserName !== 'undefined' && workspaceUserName) {
    workspaceUserName.textContent = "Guest";
  }
  if (typeof persistLegacySessionToken === 'function') {
    persistLegacySessionToken("");
  }
};

const handleUnauthorizedSession = (
  message: string = "Session ended. Please sign in again.",
  toastType: string = "error",
  statusType: string = toastType === "success" ? "success" : "error"
) => {
  // Close all open modals, sidebars, active sessions panels, and overlays
  document.querySelectorAll(".sidebar-profile-panel, .session-confirm-modal-overlay, .media-modal, .avatar-upload-menu, .modal-overlay, [role='dialog']").forEach((el) => {
    el.classList.remove("open", "active", "visible");
    el.setAttribute("aria-hidden", "true");
  });

  if (typeof getWin().disableRealtime === 'function') {
    getWin().disableRealtime();
  }
  resetWorkspaceState();
  const closeDialogFn = getWin().closeDialog;
  if (typeof closeDialogFn === 'function') {
    closeDialogFn({ skipHistory: true });
  }
  const switchViewFn = getWin().switchView;
  if (typeof switchViewFn === 'function') {
    switchViewFn(false);
  }
  const applyRouteFn = getWin().applyRoute;
  if (typeof applyRouteFn === 'function') {
    applyRouteFn("");
  }
  if (typeof pageRoot !== 'undefined' && pageRoot) {
    pageRoot.classList.remove("booting");
  }
  const setStatusFn = getWin().setStatus;
  if (typeof setStatusFn === 'function') {
    setStatusFn(message, statusType);
  }
  const showToastFn = getWin().showToast;
  if (typeof showToastFn === 'function') {
    showToastFn(message, toastType);
  }

  // Reset inputs and error states
  const nameInput = document.getElementById("name") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const verificationCodeInput = document.getElementById("verification-code") as HTMLInputElement;
  const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
  const statusNode = document.getElementById("status");
  const verificationStatus = document.getElementById("verification-status");

  if (nameInput) nameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";
  if (verificationCodeInput) verificationCodeInput.value = "";
  if (submitButton) submitButton.disabled = false;
  if (statusNode) statusNode.textContent = "";
  if (verificationStatus) verificationStatus.textContent = "";

  [nameInput, emailInput, passwordInput, verificationCodeInput].forEach((input) => {
    if (input) {
      input.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
      delete input.dataset.validationMessage;
    }
  });

  // Clear active timers or pending auth states if any
  if (getWin().resendTimer) {
    window.clearInterval(getWin().resendTimer);
    getWin().resendTimer = null;
  }
  if (typeof getWin().pendingAuthPayload !== "undefined") getWin().pendingAuthPayload = null;
  if (typeof getWin().pendingAuthMode !== "undefined") getWin().pendingAuthMode = null;
  if (typeof getWin().pendingAuthEmail !== "undefined") getWin().pendingAuthEmail = null;
  if (typeof getWin().resendAttemptsLeft !== "undefined") getWin().resendAttemptsLeft = 3;

  // Reset verification UI to standard login form
  const loginInner = document.getElementById("auth-login-inner");
  const verificationInner = document.getElementById("auth-verification-inner");
  const metaRow = document.querySelector(".meta-row") as HTMLElement;
  if (loginInner) {
    loginInner.classList.remove("hidden");
    loginInner.classList.remove("fade-out");
  }
  if (verificationInner) {
    verificationInner.classList.add("hidden");
    verificationInner.classList.remove("fade-out");
  }
  if (metaRow) {
    metaRow.classList.remove("hidden");
    metaRow.style.opacity = "1";
  }
  const animateModeChangeFn = getWin().animateModeChange;
  if (typeof animateModeChangeFn === "function") {
    getWin().mode = "login";
    animateModeChangeFn("login");
  }
};

const getDialogTypeLabel = (type: string) => {
  const labels = getWin().dialogTypeLabels || (typeof dialogTypeLabels !== 'undefined' ? dialogTypeLabels : {});
  return labels[type] || String(type || "chat");
};

const getDialogSectionTitle = (type: string) => {
  const titles = getWin().dialogTypeTitles || (typeof dialogTypeTitles !== 'undefined' ? dialogTypeTitles : {});
  return titles[type] || getDialogTypeLabel(type);
};

const getDialogTypeRank = (type: string) => {
  const order = getWin().dialogTypeOrder || (typeof dialogTypeOrder !== 'undefined' ? dialogTypeOrder : []);
  const rank = order.indexOf(type);
  return rank === -1 ? order.length : rank;
};

const getDialogAvatarMarkup = (dialog: any, options: any = {}) => {
  const showPresence = options.showPresence !== false;
  const showSecretBadge = options.showSecretBadge !== false;
  const isSecretDirect = Boolean(
    (dialog?.type === "secret" || dialog?.type === "direct" || dialog?.type === "private")
    && dialog?.encryptionMode === "e2e_v1"
  );
  const secretBadgeMarkup = (showSecretBadge && isSecretDirect)
    ? '<span class="dialog-avatar-secret" data-chip-name="' + escapeHtml(t("profile.secretChatEncrypted")) + '" aria-label="' + escapeHtml(t("profile.secretChatEncrypted")) + '">' + safeGetIcon("lock") + '</span>'
    : "";

  if (dialog.type === "saved") {
    const icon = '<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff" stroke="#ffffff" stroke-width="1" aria-hidden="true"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>';
    return '<div class="dialog-avatar saved-avatar">' + icon + '</div>';
  }

  const isDirect = dialog.type === "direct" || dialog.type === "private" || dialog.type === "secret";
  if (isDirect || dialog.type === "group" || dialog.type === "channel") {
    const isOnline = showPresence && isDirect && isDirectDialogOnline(dialog);
    const onlineLabel = escapeHtml(t("status.online") || "Online");
    const presenceMarkup = (showPresence && isDirect)
      ? '<span class="dialog-avatar-presence' + (isOnline ? ' online' : '') + '" ' + (isOnline ? 'data-tooltip="' + onlineLabel + '" aria-label="' + onlineLabel + '"' : '') + ' aria-hidden="true"></span>'
      : "";
    const avatarClass = isDirect ? "user-avatar" : (dialog.type === "channel" ? "channel-avatar" : "group-avatar");

    if (dialog.avatarUrl) {
      return '<div class="dialog-avatar ' + avatarClass + '">' +
        '<img class="generated-avatar-photo" src="' + escapeHtml(String(dialog.avatarUrl)) + '" alt="' + escapeHtml((dialog.title || "?").slice(0, 1)) + '" />' +
        presenceMarkup +
        secretBadgeMarkup +
      '</div>';
    }
    const avatar = getAvatarMeta(
      isDirect ? (dialog.peerUserId || dialog.peerId || dialog.userId || dialog.publicId) : dialog.id,
      dialog.title || dialog.subtitle || "?"
    );
    return '<div class="dialog-avatar ' + avatarClass + '" style="' + avatar.style + '">' +
      '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />' +
      presenceMarkup +
      secretBadgeMarkup +
    '</div>';
  }

  const icons = getWin().dialogTypeIcons || (typeof dialogTypeIcons !== 'undefined' ? dialogTypeIcons : {});
  const sIcon = typeof savedIcon !== 'undefined' ? savedIcon : "";
  const icon = icons[dialog.type] || sIcon;
  return '<div class="dialog-avatar">' + icon + '</div>';
};

const isDirectDialogOnline = (dialog: any) => {
  if (!dialog) {
    return false;
  }
  const isDirect = dialog.type === "direct" || dialog.type === "private" || dialog.type === "secret";
  if (!isDirect) {
    return false;
  }
  const peerUserId = String(dialog.peerUserId || dialog.peerId || dialog.userId || "").trim();
  if (!peerUserId) {
    return false;
  }

  if (getWin().currentDialogId && dialog.id === getWin().currentDialogId && getWin().peerActiveInCurrentDialog) {
    if (getWin().onlineUserIds instanceof Set) {
      getWin().onlineUserIds.add(peerUserId);
    }
    return true;
  }

  return getWin().onlineUserIds ? getWin().onlineUserIds.has(peerUserId) : false;
};

const DIALOG_NOTIFICATION_PREFS_STORAGE_KEY = "thegrapht_dialog_notification_prefs";
const LEGACY_GROUP_NOTIFICATION_PREFS_STORAGE_KEY = "thegrapht_group_notification_prefs";

const readDialogNotificationPrefs = () => {
  try {
    const raw = localStorage.getItem(DIALOG_NOTIFICATION_PREFS_STORAGE_KEY)
      || localStorage.getItem(LEGACY_GROUP_NOTIFICATION_PREFS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeDialogNotificationPrefs = (prefs: Record<string, boolean>) => {
  try {
    localStorage.setItem(DIALOG_NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
};

const isDialogNotificationsEnabled = (publicId: string) => {
  if (!publicId) {
    return true;
  }
  const prefs = readDialogNotificationPrefs();
  return prefs[String(publicId)] !== false;
};

const setDialogNotificationsEnabled = (publicId: string, enabled: boolean) => {
  if (!publicId) {
    return;
  }
  const prefs = readDialogNotificationPrefs();
  prefs[String(publicId)] = Boolean(enabled);
  writeDialogNotificationPrefs(prefs);
};

const isGroupNotificationsEnabled = isDialogNotificationsEnabled;
const setGroupNotificationsEnabled = setDialogNotificationsEnabled;

const syncGroupNotificationsToggle = () => {
  const toggle = document.getElementById("chat-profile-notifications-btn");
  if (!toggle) {
    return;
  }
  const dialogType = getWin().currentDialogSnapshot?.type;
  const isGroupOrChannel = dialogType === "group" || dialogType === "channel";
  const enabled = isGroupOrChannel
    ? isDialogNotificationsEnabled(getWin().currentDialogSnapshot?.publicId)
    : true;
  toggle.classList.toggle("is-on", enabled);
  toggle.setAttribute("aria-checked", enabled ? "true" : "false");
};

const getGroupMembers = (dialog: any) => {
  if (!dialog || dialog.type !== "group" || !Array.isArray(dialog.groupMembers)) {
    return [];
  }
  return dialog.groupMembers
    .filter((member: any) => member && member.userId)
    .map((member: any) => ({
      userId: String(member.userId),
      name: String(member.name || member.username || "User"),
      username: member.username ? String(member.username) : "",
      role: String(member.role || "member"),
      lastSeenAt: member.lastSeenAt || null
    }));
};

const getGroupOnlineCount = (dialog: any) => {
  const members = getGroupMembers(dialog);
  const memberIds = new Set(members.map((member) => member.userId));
  let onlineCount = 0;
  for (const memberId of memberIds) {
    if (memberId === getWin().currentUserId || (getWin().onlineUserIds && getWin().onlineUserIds.has(memberId))) {
      onlineCount += 1;
    }
  }
  return onlineCount;
};

const getTypingPreview = (dialog: any) => {
  if (!dialog?.id) return "";
  const getTypingUsers = getWin().getTypingUsersForDialog;
  let typingUsers: string[] = [];
  if (typeof getTypingUsers === 'function') {
    typingUsers = getTypingUsers(dialog.id);
  }

  if (!typingUsers || !typingUsers.length) {
    return "";
  }

  if (dialog.type === "direct") {
    return t("status.typing") || "typing...";
  }
  return t("status.someoneTyping") || "someone is typing...";
};

const formatDialogSubtitle = (dialog: any) => {
  if (!dialog) {
    return "";
  }

  const typingPreview = getTypingPreview(dialog);

  if (typingPreview) {
    return typingPreview;
  }

  if (dialog.type === "saved") {
    // Telegram shows no subtitle for Saved Messages
    return "";
  }

  if (dialog.type === "direct" || dialog.type === "private") {
    if (dialog.encryptionMode === "e2e_v1") {
      return t("profile.secretChatEncrypted");
    }

    if (isDirectDialogOnline(dialog)) {
      return t("status.online");
    }

    const lastSeen = typeof formatLastSeen === 'function' ? formatLastSeen(dialog.peerLastSeenAt) : "";
    return lastSeen ? lastSeen : t("status.recentlyOnline");
  }

  if (dialog.type === "group") {
    const participants = Number(dialog.participants) || 0;
    const formatGroupMembersCount = getWin().formatGroupMembersCount;
    const parts = [];
    if (participants > 0 && typeof formatGroupMembersCount === "function") {
      parts.push(formatGroupMembersCount(participants));
    } else if (participants > 0) {
      parts.push(participants + " " + t("group.memberMany"));
    } else {
      parts.push(t("menu.newGroup"));
    }
    const onlineCount = getGroupOnlineCount(dialog);
    if (onlineCount > 0) {
      parts.push(onlineCount + " " + t("status.online"));
    }
    return parts.join(", ");
  }

  if (dialog.type === "channel") {
    const participants = Number(dialog.participants) || 0;
    const formatChannelSubscribersCount = getWin().formatChannelSubscribersCount;
    const parts = [];
    if (participants > 0 && typeof formatChannelSubscribersCount === "function") {
      parts.push(formatChannelSubscribersCount(participants));
    } else if (participants > 0) {
      parts.push(participants + " " + t("channel.subscriberMany"));
    } else {
      parts.push(t("channel.subscribers"));
    }
    return parts.join(" · ");
  }

  const parts = [];
  if (dialog.subtitle) {
    parts.push(dialog.subtitle);
  }
  const typeLabel = getDialogSectionTitle(dialog.type);
  if (!parts.includes(typeLabel)) {
    parts.push(typeLabel);
  }
  if (dialog.participants) {
    const formatGroupMembersCount = getWin().formatGroupMembersCount;
    if (typeof formatGroupMembersCount === "function") {
      parts.push(formatGroupMembersCount(Number(dialog.participants)));
    } else {
      parts.push(dialog.participants + " " + t("group.memberMany"));
    }
  }
  return parts.join(", ");
};

const getDialogUsername = (dialog: any) => {
  if (!dialog) {
    return "";
  }

  if (dialog.type === "saved") {
    return String(getWin().currentUserUsername || "").replace(/^@+/, "");
  }
  const peerUsername = String(dialog.peerUsername || "").trim();
  if (peerUsername) {
    return peerUsername.replace(/^@+/, "");
  }

  const subtitle = String(dialog.subtitle || "").trim();
  if (subtitle.startsWith("@")) {
    return subtitle.replace(/^@+/, "");
  }

  return "";
};

const getChatProfileDetails = (dialog: any) => {
  if (!dialog) {
    return null;
  }

  if (dialog.type !== "direct" && dialog.type !== "saved" && dialog.type !== "group" && dialog.type !== "channel") {
    return null;
  }

  const username = dialog.type === "group"
    ? dialog.publicId
    : (dialog.type === "channel" ? (dialog.channelSlug || dialog.publicId) : getDialogUsername(dialog));
  const isSaved = dialog.type === "saved";
  const isGroup = dialog.type === "group";
  const isChannel = dialog.type === "channel";
  const isSecretDialog = Boolean(
    (dialog?.type === "secret" || dialog?.type === "direct" || dialog?.type === "private")
    && dialog?.encryptionMode === "e2e_v1"
  );
  const name = isSaved
    ? (getWin().currentUserDisplayName || getWin().currentUserUsername || dialog.title || "You")
    : (dialog.title || "Profile");
  const status = isSaved
    ? t("profile.yourProfile")
    : (
      isSecretDialog
        ? t("profile.secretChatEncrypted")
        : (
          dialog?.type === "direct"
            ? (isDirectDialogOnline(dialog) ? t("status.online") : (typeof formatLastSeen === 'function' ? formatLastSeen(dialog?.peerLastSeenAt) : ""))
            : formatDialogSubtitle(dialog)
        )
    );
  const avatar = getAvatarMeta(
    isSaved
      ? (getWin().currentUserId || "saved-self")
      : (isGroup || isChannel ? dialog.id : (dialog.peerUserId || dialog.publicId || dialog.id || name)),
    name
  );
  const usernameLabel = isChannel
    ? ("@" + (dialog.channelSlug || dialog.publicId))
    : (isGroup ? ("@" + username) : (username ? "@" + username : "username is not set yet"));
  const encodeSecretRouteToken = (value: any) => {
    try {
      let token = window.btoa(unescape(encodeURIComponent(String(value || ""))));
      token = token.split("+").join("-").split("/").join("_");
      while (token.endsWith("=")) {
        token = token.slice(0, -1);
      }
      return token;
    } catch {
      return "";
    }
  };
  const getPublicAppOrigin = getWin().getPublicAppOrigin;
  const originUrl = typeof getPublicAppOrigin === "function" ? getPublicAppOrigin() : window.location.origin;
  const profileUrl = isChannel
    ? (
      dialog.channelVisibility === "public" && dialog.channelSlug
        ? (originUrl + "/c/" + dialog.channelSlug)
        : (dialog.channelInviteToken ? (originUrl + "/c/+" + dialog.channelInviteToken) : originUrl)
    )
    : (
      isGroup
        ? (originUrl + "/g/" + dialog.publicId)
        : (
          isSecretDialog
            ? (username
              ? (originUrl + "/@" + encodeURIComponent(username) + "/sc?s=" + encodeURIComponent(encodeSecretRouteToken(dialog.publicId || "")))
              : originUrl)
            : (username ? (originUrl + "/@" + encodeURIComponent(username)) : originUrl)
        )
    );

  return {
    avatar,
    name,
    status,
    username,
    usernameLabel,
    profileUrl,
    isSecretDialog
  };
};

const syncChatHeaderMeta = () => {
  const chatHeaderAvatarEl = document.getElementById("chat-header-avatar");
  if (!chatHeaderAvatarEl) {
    return;
  }

  const currentDialog = getWin().currentDialogSnapshot;
  if (!currentDialog) {
    chatHeaderAvatarEl.innerHTML = "";
    chatHeaderAvatarEl.removeAttribute("data-rendered-dialog-id");
    return;
  }

  const isDirect = currentDialog.type === "direct" || currentDialog.type === "private" || currentDialog.type === "secret";
  const isOnline = isDirect && isDirectDialogOnline(currentDialog);
  const avatarPresence = chatHeaderAvatarEl.querySelector(".dialog-avatar-presence");
  const dialogKey = String(currentDialog.id || currentDialog.publicId || "");

  if (chatHeaderAvatarEl.getAttribute("data-rendered-dialog-id") === dialogKey && avatarPresence) {
    avatarPresence.classList.toggle("online", isOnline);
    const onlineLabel = t("status.online") || "Online";
    if (isOnline) {
      avatarPresence.setAttribute("data-tooltip", onlineLabel);
      avatarPresence.removeAttribute("title");
      avatarPresence.setAttribute("aria-label", onlineLabel);
    } else {
      avatarPresence.removeAttribute("data-tooltip");
      avatarPresence.removeAttribute("title");
      avatarPresence.removeAttribute("aria-label");
    }
  } else {
    chatHeaderAvatarEl.setAttribute("data-rendered-dialog-id", dialogKey);
    chatHeaderAvatarEl.innerHTML = getDialogAvatarMarkup(currentDialog, {
      showPresence: isDirect
    });
  }

  const syncDesktopTitlebarLocal = getWin().syncDesktopTitlebar;
  if (typeof syncDesktopTitlebarLocal === "function") {
    syncDesktopTitlebarLocal(currentDialog);
  }
};

const syncChatProfilePanel = () => {
  const chatProfilePanelEl = document.getElementById("chat-profile-panel");
  if (!chatProfilePanelEl) {
    return;
  }

  const currentDialog = getWin().currentDialogSnapshot;
  const details = getChatProfileDetails(currentDialog);
  if (!details) {
    const chatWindowEl = document.getElementById("chat-window") || document.getElementById("workspace-view");
    if (chatWindowEl) {
      chatWindowEl.classList.remove("profile-panel-open");
    }
    chatProfilePanelEl.classList.remove("open");
    chatProfilePanelEl.setAttribute("aria-hidden", "true");
    return;
  }

  const renderLegacyProfileSummary = getWin().renderLegacyProfileSummary;
  if (!(typeof renderLegacyProfileSummary === "function" && currentDialog && renderLegacyProfileSummary(currentDialog))) {
    const chatProfileAvatarEl = document.getElementById("chat-profile-avatar");
    if (chatProfileAvatarEl) {
      const isDirect = currentDialog?.type === "direct" || currentDialog?.type === "private" || currentDialog?.type === "secret";
      const isOnline = isDirect && isDirectDialogOnline(currentDialog);
      const profilePresence = chatProfileAvatarEl.querySelector(".dialog-avatar-presence");
      const dialogKey = String(currentDialog?.id || currentDialog?.publicId || "");

      if (chatProfileAvatarEl.getAttribute("data-rendered-dialog-id") === dialogKey && profilePresence) {
        profilePresence.classList.toggle("online", isOnline);
        const onlineLabel = t("status.online") || "Online";
        if (isOnline) {
          profilePresence.setAttribute("data-tooltip", onlineLabel);
          profilePresence.removeAttribute("title");
          profilePresence.setAttribute("aria-label", onlineLabel);
        } else {
          profilePresence.removeAttribute("data-tooltip");
          profilePresence.removeAttribute("title");
          profilePresence.removeAttribute("aria-label");
        }
      } else if (currentDialog) {
        chatProfileAvatarEl.setAttribute("data-rendered-dialog-id", dialogKey);
        chatProfileAvatarEl.innerHTML = getDialogAvatarMarkup(currentDialog, {
          showPresence: isDirect
        });
      }
    }
    const chatProfileNameEl = document.getElementById("chat-profile-name");
    if (chatProfileNameEl) {
      chatProfileNameEl.textContent = details.name;
    }
    const chatProfileStatusEl = document.getElementById("chat-profile-status");
    if (chatProfileStatusEl) {
      chatProfileStatusEl.textContent = details.status || "profile";
    }
  }
  
  const notificationsCard = document.getElementById("chat-profile-notifications-card");
  const secretCard = document.getElementById("chat-profile-secret-card");
  const descriptionCard = document.getElementById("chat-profile-description-card");
  const descriptionEl = document.getElementById("chat-profile-description");
  const qrButton = document.getElementById("chat-profile-qr-btn");

  const isGroupOrChannel = currentDialog?.type === "group" || currentDialog?.type === "channel";
  if (notificationsCard) {
    notificationsCard.style.display = isGroupOrChannel ? "flex" : "none";
  }
  if (secretCard) {
    secretCard.style.display = "none";
  }

  const descriptionText = currentDialog?.type === "channel"
    ? String(currentDialog.channelDescription || "").trim()
    : (currentDialog?.type === "group" ? String(currentDialog.groupDescription || "").trim() : "");
  if (descriptionCard && descriptionEl) {
    if (descriptionText) {
      descriptionCard.style.display = "block";
      descriptionEl.textContent = descriptionText;
    } else {
      descriptionCard.style.display = "none";
      descriptionEl.textContent = "";
    }
  }

  if (qrButton) {
    qrButton.style.display = isGroupOrChannel ? "inline-flex" : "none";
  }
  const linkLabel = document.getElementById("chat-profile-link-label");
  const chatProfileLinkEl = document.getElementById("chat-profile-link") as HTMLAnchorElement | null;
  const linkCard = chatProfileLinkEl ? chatProfileLinkEl.closest(".chat-profile-card") as HTMLElement : null;
  if (linkLabel) {
    linkLabel.textContent = currentDialog?.type === "group"
      ? t("info.groupLink")
      : (currentDialog?.type === "channel" ? t("info.channelLink") : t("info.profileLink"));
  }
  if (linkCard) {
    linkCard.style.display = details.isSecretDialog ? "none" : "block";
  }
  syncGroupNotificationsToggle();

  const membersSection = document.getElementById("chat-profile-members-section");
  const membersList = document.getElementById("chat-profile-members-list");

  if (currentDialog?.type === "group") {
    const renderLegacyProfileMembersList = getWin().renderLegacyProfileMembersList;
    if (typeof renderLegacyProfileMembersList === "function") {
      renderLegacyProfileMembersList(currentDialog);
    } else if (membersSection && membersList) {
      membersSection.style.display = "block";
      const members = getGroupMembers(currentDialog);
      membersList.innerHTML = members.map((member) => {
        const role = member.role === "owner" ? t("role.owner") : (member.role === "admin" ? t("role.admin") : t("role.member"));
        const memberUserId = String(member.userId || "").trim();
        const isSelfMember = memberUserId && memberUserId === String(getWin().currentUserId || "").trim();
        const statusText = isSelfMember || (getWin().onlineUserIds && getWin().onlineUserIds.has(memberUserId))
          ? t("status.online")
          : (typeof formatLastSeen === 'function' ? formatLastSeen(member.lastSeenAt) : "");
        const displayName = String(member.name || member.username || "User");
        const avatar = getAvatarMeta(member.userId, displayName);
        return '<div class="group-member-row" data-member-user-id="' + escapeHtml(member.userId) + '">' +
          '<div class="dialog-avatar user-avatar group-member-avatar" style="' + avatar.style + '">' +
            '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + escapeHtml(avatar.letter || "?") + '" />' +
          '</div>' +
          '<div class="group-member-main">' +
            '<div class="group-member-name">' + escapeHtml(displayName) + '</div>' +
            '<div class="group-member-status">' + escapeHtml(statusText) + '</div>' +
          '</div>' +
          '<div class="group-member-role">' + escapeHtml(role) + '</div>' +
        '</div>';
      }).join("");
    }
  } else {
    if (membersSection) membersSection.style.display = "none";
    const renderLegacyProfileMembersList = getWin().renderLegacyProfileMembersList;
    if (typeof renderLegacyProfileMembersList === "function" && membersList) {
      renderLegacyProfileMembersList(null);
    } else if (membersList) {
      membersList.innerHTML = "";
    }
  }

  const leaveChannelBtn = document.getElementById("chat-profile-leave-channel-btn");
  if (leaveChannelBtn) {
    const canLeaveChannel = currentDialog?.type === "channel"
      && currentDialog.channelIsMember === true
      && !currentDialog.channelCanPost;
    leaveChannelBtn.hidden = !canLeaveChannel;
  }

  if (!details.isSecretDialog && chatProfileLinkEl) {
    const visibleProfileUrl = details.profileUrl.startsWith("https://")
      ? details.profileUrl.slice(8)
      : (details.profileUrl.startsWith("http://") ? details.profileUrl.slice(7) : details.profileUrl);
    chatProfileLinkEl.textContent = visibleProfileUrl;
    chatProfileLinkEl.href = details.profileUrl;
  }
};

const refreshCurrentDialogChrome = () => {
  const currentDialog = getWin().currentDialogSnapshot;
  if (!currentDialog) {
    syncChatHeaderMeta();
    if (typeof getWin().syncChatIslandActions === 'function') {
      getWin().syncChatIslandActions();
    }
    if (typeof getWin().syncActiveCallChip === 'function') {
      getWin().syncActiveCallChip();
    }
    syncChatProfilePanel();
    return;
  }

  const chatTitle = document.getElementById("chat-title");
  const chatSubtitle = document.getElementById("chat-subtitle");
  if (chatTitle) {
    chatTitle.textContent = currentDialog.title || "";
  }
  if (chatSubtitle) {
    if (getWin().connectionStatusManager?.getState?.() && getWin().connectionStatusManager.getState() !== "connected") {
      // Keep displaying connection status in chat subtitle
    } else {
      const typingPreview = getTypingPreview(currentDialog);
      const renderTypingFn = getWin().renderTypingPreviewHtml;
      if (typingPreview && typeof renderTypingFn === "function") {
        chatSubtitle.innerHTML = renderTypingFn(typingPreview);
        chatSubtitle.style.color = "";
        chatSubtitle.removeAttribute("data-connection-state");
      } else {
        chatSubtitle.textContent = formatDialogSubtitle(currentDialog);
        chatSubtitle.style.color = "";
        chatSubtitle.removeAttribute("data-connection-state");
      }
    }
  }
  syncChatHeaderMeta();
  syncChatProfilePanel();
  if (typeof getWin().syncChatIslandActions === 'function') {
    getWin().syncChatIslandActions();
  }
  if (typeof getWin().syncActiveCallChip === 'function') {
    getWin().syncActiveCallChip();
  }
  if (typeof getWin().syncGroupCallBanner === "function") {
    getWin().syncGroupCallBanner();
  }
  if (typeof getWin().syncComposerState === "function") {
    getWin().syncComposerState();
  }

  const chatSearchPanel = document.getElementById("chat-search-panel");
  if (chatSearchPanel && chatSearchPanel.classList.contains("open")) {
    if (typeof getWin().renderChatSearchResults === 'function') {
      getWin().renderChatSearchResults();
    }
  }
};

const closeGroupMemberContextMenu = () => {
  if (groupMemberContextMenuCloseTimerLocal) {
    window.clearTimeout(groupMemberContextMenuCloseTimerLocal);
    groupMemberContextMenuCloseTimerLocal = null;
  }
  const groupMemberContextMenuEl = document.getElementById("group-member-context-menu");
  if (groupMemberContextMenuEl) {
    groupMemberContextMenuEl.classList.remove("open");
    groupMemberContextMenuEl.setAttribute("aria-hidden", "true");
  }
  getWin().groupMemberContextMenuState = null;
};

const closeGroupMemberContextMenuSoon = () => {
  if (groupMemberContextMenuCloseTimerLocal) {
    window.clearTimeout(groupMemberContextMenuCloseTimerLocal);
  }
  groupMemberContextMenuCloseTimerLocal = window.setTimeout(() => {
    closeGroupMemberContextMenu();
  }, 120);
};

const closeProfileLinkContextMenu = () => {
  if (profileLinkContextMenuCloseTimerLocal) {
    window.clearTimeout(profileLinkContextMenuCloseTimerLocal);
    profileLinkContextMenuCloseTimerLocal = null;
  }
  if (typeof profileLinkContextMenu !== 'undefined' && profileLinkContextMenu) {
    profileLinkContextMenu.classList.remove("open");
    profileLinkContextMenu.setAttribute("aria-hidden", "true");
  }
  getWin().profileLinkContextMenuState = null;
};

const closeProfileLinkContextMenuSoon = () => {
  if (profileLinkContextMenuCloseTimerLocal) {
    window.clearTimeout(profileLinkContextMenuCloseTimerLocal);
  }
  profileLinkContextMenuCloseTimerLocal = window.setTimeout(() => {
    closeProfileLinkContextMenu();
  }, 120);
};

const openProfileLinkContextMenu = (event: MouseEvent, profileUrl: string) => {
  if (typeof profileLinkContextMenu === 'undefined' || !profileLinkContextMenu || typeof profileLinkContextMenuBody === 'undefined' || !profileLinkContextMenuBody || !profileUrl) {
    return;
  }

  profileLinkContextMenuBody.innerHTML =
    '<button class="dialog-context-menu-item" type="button" data-action="copy-username-link">' +
      safeGetIcon("content_copy", "", 'aria-hidden="true"') +
      '<span>Copy Username</span>' +
    '</button>';
  getWin().profileLinkContextMenuState = { profileUrl: String(profileUrl) };

  const menuWidth = 244;
  const menuHeight = 72;
  const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
  const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
  profileLinkContextMenu.style.left = left + "px";
  profileLinkContextMenu.style.top = top + "px";
  profileLinkContextMenu.classList.add("open");
  profileLinkContextMenu.setAttribute("aria-hidden", "false");

  profileLinkContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      closeProfileLinkContextMenuSoon();
      const urlToCopy = String(getWin().profileLinkContextMenuState?.profileUrl || "").trim();
      if (!urlToCopy) {
        return;
      }
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(urlToCopy);
        } else {
          throw new Error("Clipboard API is not available");
        }
        showToast("Username link copied", "success");
      } catch {
        showToast("Failed to copy username link", "error");
      }
    });
  });
};

const openDirectDialogForUser = async (targetUserId: string, options: any = {}) => {
  const userId = String(targetUserId || "").trim();
  if (!userId) {
    return;
  }

  const openProfile = Boolean(options.openProfile);

  if (userId === getWin().currentUserId) {
    const savedDialog = getWin().allDialogs.find((dialog: any) => dialog.type === "saved");
    if (savedDialog?.publicId) {
      const loadDialogFn = getWin().loadDialog;
      if (typeof loadDialogFn === 'function') {
        await loadDialogFn(savedDialog.publicId);
      }
      const openChatProfilePanelFn = getWin().openChatProfilePanel;
      if (openProfile && typeof openChatProfilePanelFn === 'function') {
        openChatProfilePanelFn();
      }
    }
    return;
  }

  const existingDirectDialog = getWin().allDialogs.find((dialog: any) => (
    ["direct", "private"].includes(dialog?.type)
    && String(dialog?.peerUserId || "").trim() === userId
  ));
  if (existingDirectDialog?.publicId) {
    const loadDialogFn = getWin().loadDialog;
    if (typeof loadDialogFn === 'function') {
      await loadDialogFn(existingDirectDialog.publicId, { forceReload: false });
    }
    const openChatProfilePanelFn = getWin().openChatProfilePanel;
    if (openProfile && typeof openChatProfilePanelFn === 'function') {
      openChatProfilePanelFn();
    }
    return;
  }

  try {
    const createPreferredDirectDialogFn = getWin().createPreferredDirectDialog;
    const prepareDialogPayloadForDisplayFn = getWin().prepareDialogPayloadForDisplay;
    if (typeof createPreferredDirectDialogFn === 'function' && typeof prepareDialogPayloadForDisplayFn === 'function') {
      const payload = await createPreferredDirectDialogFn(userId);
      const preparedPayload = await prepareDialogPayloadForDisplayFn(payload.dialog || null, payload.messages || []);
      if (!preparedPayload.dialog?.publicId) {
        return;
      }

      const setDialogPayloadCacheFn = getWin().setDialogPayloadCache;
      if (typeof setDialogPayloadCacheFn === 'function') {
        setDialogPayloadCacheFn(preparedPayload.dialog.publicId, preparedPayload);
      }
      const updateDialogInStateFn = getWin().updateDialogInState;
      if (typeof updateDialogInStateFn === 'function') {
        const upsertedDialog = updateDialogInStateFn(preparedPayload.dialog, {
          lastMessagePreview: preparedPayload.dialog.lastMessagePreview || null,
          lastMessageSenderName: preparedPayload.dialog.lastMessageSenderName || null,
          lastMessageCreatedAt: preparedPayload.dialog.lastMessageCreatedAt || new Date().toISOString()
        });
        if (!upsertedDialog) {
          getWin().allDialogs.unshift(preparedPayload.dialog);
        }
      }
      if (!getWin().currentSearchQuery.trim()) {
        const renderDialogsFn = getWin().renderDialogs;
        if (typeof renderDialogsFn === 'function') {
          renderDialogsFn(getWin().allDialogs);
        }
      }

      const loadDialogFn = getWin().loadDialog;
      if (typeof loadDialogFn === 'function') {
        await loadDialogFn(preparedPayload.dialog.publicId, { forceReload: true });
      }
      const openChatProfilePanelFn = getWin().openChatProfilePanel;
      if (openProfile && typeof openChatProfilePanelFn === 'function') {
        openChatProfilePanelFn();
      }
    }
  } catch (error) {
    showToast(error instanceof Error ? error.message : "Failed to open direct chat.", "error");
  }
};

const openGroupMemberContextMenu = (event: MouseEvent, memberUserId: string) => {
  const groupMemberContextMenuEl = document.getElementById("group-member-context-menu");
  const groupMemberContextMenuBodyEl = document.getElementById("group-member-context-menu-body");
  if (!groupMemberContextMenuEl || !groupMemberContextMenuBodyEl) {
    return;
  }

  const userId = String(memberUserId || "").trim();
  if (!userId) {
    return;
  }

  groupMemberContextMenuBodyEl.innerHTML =
    '<button class="dialog-context-menu-item" type="button" data-action="send-message">' +
      safeGetIcon("chat", "", 'aria-hidden="true"') +
      '<span>Send Message</span>' +
    '</button>';
  getWin().groupMemberContextMenuState = { userId };

  const menuWidth = 244;
  const menuHeight = 72;
  const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
  const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
  groupMemberContextMenuEl.style.left = left + "px";
  groupMemberContextMenuEl.style.top = top + "px";
  groupMemberContextMenuEl.classList.add("open");
  groupMemberContextMenuEl.setAttribute("aria-hidden", "false");

  groupMemberContextMenuBodyEl.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      closeGroupMemberContextMenuSoon();
      void openDirectDialogForUser(userId, { openProfile: true });
    });
  });
};

const openChatProfilePanel = () => {
  const chatProfilePanelEl = document.getElementById("chat-profile-panel");
  if (!getWin().currentDialogSnapshot || !chatProfilePanelEl) {
    return;
  }

  getWin().closeEmojiPicker?.();
  syncChatProfilePanel();
  const chatWindowEl = document.getElementById("chat-window") || document.getElementById("workspace-view");
  if (chatWindowEl) {
    chatWindowEl.classList.add("profile-panel-open");
  }
  chatProfilePanelEl.classList.add("open");
  chatProfilePanelEl.setAttribute("aria-hidden", "false");
};

const closeChatProfilePanel = () => {
  const chatProfilePanelEl = document.getElementById("chat-profile-panel");
  if (!chatProfilePanelEl) {
    return;
  }

  const chatWindowEl = document.getElementById("chat-window") || document.getElementById("workspace-view");
  if (chatWindowEl) {
    chatWindowEl.classList.remove("profile-panel-open");
  }
  chatProfilePanelEl.classList.remove("open");
  chatProfilePanelEl.setAttribute("aria-hidden", "true");
};

const handleViewerWheelZoom = (event: WheelEvent) => {
  if (typeof viewerModal === 'undefined' || !viewerModal || !viewerModal.classList.contains("open") || !event.ctrlKey) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  if (typeof setViewerZoom === 'function') {
    setViewerZoom(getWin().viewerZoom + (event.deltaY < 0 ? 0.14 : -0.14));
  }
};

const disableRealtime = () => {
  getWin().realtimeEnabled = false;

  if (getWin().realtimeReconnectTimer) {
    window.clearTimeout(getWin().realtimeReconnectTimer);
    getWin().realtimeReconnectTimer = null;
  }

  if (typingStopTimer) {
    window.clearTimeout(typingStopTimer);
    typingStopTimer = null;
  }
  if (getWin().realtimeHeartbeatTimer) {
    window.clearInterval(getWin().realtimeHeartbeatTimer);
    getWin().realtimeHeartbeatTimer = null;
  }
  if (getWin().realtimeWatchdogTimer) {
    window.clearInterval(getWin().realtimeWatchdogTimer);
    getWin().realtimeWatchdogTimer = null;
  }
  if (getWin().realtimeDialogResyncTimer) {
    window.clearInterval(getWin().realtimeDialogResyncTimer);
    getWin().realtimeDialogResyncTimer = null;
  }

  if (getWin().onlineUserIds instanceof Set) {
    getWin().onlineUserIds.clear();
  }
  if (typeof clearTypingIndicators === 'function') {
    clearTypingIndicators();
  }

  const socket = getWin().realtimeSocket;
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
  }

  getWin().realtimeSocket = null;
  getWin().realtimeLastActivityAt = 0;
  if (typeof rerenderDialogsIfVisible === 'function') {
    rerenderDialogsIfVisible();
  }
  refreshCurrentDialogChrome();
};

const initProfilePanelEvents = () => {
  const membersList = document.getElementById("chat-profile-members-list");
  if (membersList) {
    membersList.addEventListener("contextmenu", (event) => {
      const row = event.target instanceof Element ? event.target.closest(".group-member-row") : null;
      if (!row) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const memberUserId = row.getAttribute("data-member-user-id") || "";
      openGroupMemberContextMenu(event as MouseEvent, memberUserId);
    });
  }

  if (typeof chatProfileLink !== 'undefined' && chatProfileLink) {
    chatProfileLink.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openProfileLinkContextMenu(event, chatProfileLink.href || "");
    });
  }

  if (typeof viewerModal !== 'undefined' && viewerModal) {
    // Wheel zoom is handled in viewer-modal.ts without requiring Ctrl.
  }

  document.addEventListener("click", () => {
    closeGroupMemberContextMenuSoon();
    closeProfileLinkContextMenuSoon();
  });
};

if (document.readyState === "complete" || document.readyState === "interactive") {
  initProfilePanelEvents();
} else {
  document.addEventListener("DOMContentLoaded", initProfilePanelEvents);
}

// Bind APIs to window
getWin().isDirectDialogOnline = isDirectDialogOnline;
getWin().getTypingPreview = getTypingPreview;
getWin().sendTypingState = sendTypingState;
getWin().scheduleTypingStop = scheduleTypingStop;
getWin().resetWorkspaceState = resetWorkspaceState;
getWin().handleUnauthorizedSession = handleUnauthorizedSession;
getWin().getDialogTypeLabel = getDialogTypeLabel;
getWin().getDialogSectionTitle = getDialogSectionTitle;
getWin().getDialogTypeRank = getDialogTypeRank;
getWin().getDialogAvatarMarkup = getDialogAvatarMarkup;
getWin().isDialogNotificationsEnabled = isDialogNotificationsEnabled;
getWin().setDialogNotificationsEnabled = setDialogNotificationsEnabled;
getWin().isGroupNotificationsEnabled = isGroupNotificationsEnabled;
getWin().setGroupNotificationsEnabled = setGroupNotificationsEnabled;
getWin().syncGroupNotificationsToggle = syncGroupNotificationsToggle;
getWin().getGroupMembers = getGroupMembers;
getWin().getGroupOnlineCount = getGroupOnlineCount;
getWin().formatDialogSubtitle = formatDialogSubtitle;
getWin().getDialogUsername = getDialogUsername;
getWin().getChatProfileDetails = getChatProfileDetails;
getWin().syncChatHeaderMeta = syncChatHeaderMeta;
getWin().syncChatProfilePanel = syncChatProfilePanel;
getWin().refreshCurrentDialogChrome = refreshCurrentDialogChrome;
getWin().closeGroupMemberContextMenu = closeGroupMemberContextMenu;
getWin().closeProfileLinkContextMenu = closeProfileLinkContextMenu;
getWin().openProfileLinkContextMenu = openProfileLinkContextMenu;
getWin().openDirectDialogForUser = openDirectDialogForUser;
getWin().openGroupMemberContextMenu = openGroupMemberContextMenu;
getWin().openChatProfilePanel = openChatProfilePanel;
getWin().closeChatProfilePanel = closeChatProfilePanel;
getWin().handleViewerWheelZoom = handleViewerWheelZoom;
getWin().disableRealtime = disableRealtime;
