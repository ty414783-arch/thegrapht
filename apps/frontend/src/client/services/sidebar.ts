// Sidebar Navigation & AI Panel Service
export {};

declare const getIcon: (name: string, extraClasses?: string, attrs?: string) => string;
declare const getAvatarMeta: (seed: any, label: any) => any;
declare const escapeHtml: (v: any) => string;
declare const formatLastSeen: (time: any) => string;
declare const showToast: (message: string, type?: string) => void;
declare const playSound: (kind: string) => void;
declare const getDialogAvatarMarkup: (dialog: any, options?: any) => string;

declare const getDialogScrollTop: (publicId: string) => number | null;
declare const rememberCurrentDialogScrollTop: () => void;
declare const getDialogPayloadCache: (publicId: string) => any;
declare const setDialogPayloadCache: (publicId: string, payload: any) => void;
declare const visitedDialogsInSession: Set<string>;
declare const dialogScrollTopCache: Map<string, number>;
declare const getMessagePreviewText: (message: any) => string;
declare const prepareDialogPayloadForDisplay: (dialog: any, messages: any[]) => Promise<any>;
declare const updateDialogInState: (dialog: any, meta?: any) => any;
declare const prefetchDialogMedia: (messages: any[]) => void;
declare const buildRenderableMessageItems: (messages: any[]) => any[];
declare const annotateGroupIncomingSequences: (items: any[]) => any[];
declare const renderDaySeparator: (val: any) => string;
declare const renderAlbumMessage: (messages: any[], opts?: any) => string;
declare const renderSingleMessage: (message: any, opts?: any) => string;
declare const normalizeMessageDaySeparators: () => void;
declare const hydrateMessageImages: (opts?: any) => void;
declare const preloadDialogMediaDimensions: (messages: any[], opts?: any) => Promise<any>;
declare const startBottomLock: (opts?: any) => number;
declare const finishBottomLock: (token: number) => void;
declare const hardPinMessagesToBottom: (token: number) => void;
declare const scrollMessagesToBottom: (behavior?: "auto" | "smooth") => void;

declare const sendTypingState: (isTyping: boolean) => void;
declare const clearPendingReplyMessage: () => void;
declare const closeMessageContextMenu: () => void;
declare const closeDeleteMessageModal: () => void;
declare const clearPendingImageAttachment: (opts?: any) => void;
declare const sendCurrentPresence: () => void;
declare const closeChatProfilePanel: () => void;
declare const isSecureDialog: (dialog: any) => boolean;
declare const encryptSecureMessageBody: (dialog: any, body: string) => Promise<any>;
declare const createSecretDirectDialog: (peerUserId: string) => Promise<any>;
declare const appendLocalOutgoingMessageToCurrentDialog: (draft: any, options?: any) => boolean;
declare const appendConfirmedMessageToCurrentDialog: (dialog: any, message: any, options?: any) => void;
declare const rerenderCurrentDialog: (options?: any) => void;
declare const openEmojiPicker: () => void;
declare const closeEmojiPicker: () => void;
declare const scheduleEmojiPickerClose: () => void;
declare const readRecentEmojis: () => string[];
declare const getEmojiAssetUrl: (char: string) => string;
declare const rememberRecentEmoji: (char: string) => void;
declare const emojiSections: Array<{ key: string; title: string; emojis: string[] }>;
declare const openAttachMenu: () => void;
declare const closeAttachMenu: () => void;
declare const scheduleAttachMenuClose: () => void;
declare const addPendingImageAttachments: (files: File[]) => Promise<void>;
declare const addPendingFileAttachments: (files: File[]) => Promise<void>;
declare const closeAttachmentModal: () => void;
declare const moveAttachmentModal: (dir: number) => void;
declare const uploadAudioBatch: (opts: any) => Promise<void>;
declare const uploadImageBatch: (opts: any) => Promise<void>;
declare const rememberRecentGif: (url: string) => void;

declare const formatDialogSubtitle: (dialog: any) => string;
declare const formatDialogListTime: (time: any) => string;
declare const renderDialogPreviewHtml: (dialog: any) => string;
declare const isDirectDialogOnline: (dialog: any) => boolean;

declare const startNotificationOwnershipHeartbeat: () => void;
declare const startPrimaryTabOwnershipHeartbeat: () => void;
declare const refreshNotificationOwnership: () => void;
declare const refreshPrimaryTabOwnership: () => void;
declare const scheduleBackgroundRefresh: () => void;
declare const sendActiveState: (active: boolean) => void;
declare const releasePrimaryTabOwnership: () => void;

declare const systemPrompt: string;

const getWin = () => window as any;
const GROUP_MAX_MEMBERS = 20000;

// Module scoped state
let groupCreateSelectedDialogIds = new Set<string>();
let groupCreateSearchQuery = "";
let groupCreateStep = 1;
let groupCreatePhotoDataUrl = "";
let groupCreateNameTouched = false;
let groupCreateRenderedSelectedDialogIds = new Set<string>();
let groupCreateMode = "group"; // "group" | "secret"

let currentSearchQuery = "";
let currentSearchResults: any[] = [];
let searchDelayTimer: any = null;
let searchRequestId = 0;

let dialogContextMenuCloseTimer: any = null;
let dialogContextMenuState: any = null;

let aiHistory: Array<{ role: string; content: string }> = [];
let activeAiController: AbortController | null = null;
let pickerMode = "emoji";

// Helper functions
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

const decodeSecretRouteToken = (value: any) => {
  try {
    const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    return decodeURIComponent(escape(window.atob(normalized + padding)));
  } catch {
    return "";
  }
};

const getRoutedPublicId = () => {
  const path = String(window.location.pathname || "/");
  if (!path || path === "/") {
    return "";
  }
  const lowerPath = path.toLowerCase();
  if (lowerPath.startsWith("/@") && (lowerPath.endsWith("/sc") || lowerPath.endsWith("/sc/"))) {
    const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
    const parts = trimmed.split("/");
    const usernamePart = parts.length >= 2 ? parts[1] : "";
    const url = new URL(window.location.href);
    const secretToken = url.searchParams.get("s") || "";
    const decodedPublicId = decodeSecretRouteToken(secretToken);
    if (decodedPublicId) {
      return decodedPublicId;
    }
    return "@" + decodeURIComponent(String(usernamePart || "").replace(/^@+/, ""));
  }
  if (path.startsWith("/g/")) {
    return decodeURIComponent(path.slice(3));
  }
  return decodeURIComponent(path.slice(1));
};

const getDialogUsernameFromSidebarDialog = (dialog: any) => {
  if (!dialog) {
    return "";
  }
  const peerUsername = String(dialog.peerUsername || "").trim().toLowerCase();
  if (peerUsername) {
    return peerUsername.replace(/^@+/, "");
  }
  const subtitle = String(dialog.subtitle || "").trim();
  if (subtitle.startsWith("@")) {
    return subtitle.replace(/^@+/, "").trim().toLowerCase();
  }
  return "";
};

const resolveRoutePathForDialogPublicId = (publicId: string) => {
  if (!publicId) {
    return "/";
  }
  const allDialogs = getWin().allDialogs || [];
  const dialog = Array.isArray(allDialogs) ? allDialogs.find((d: any) => d.publicId === publicId) : null;
  if (!dialog) {
    return "/" + publicId;
  }
  if (dialog.type === "group") {
    return "/g/" + publicId;
  }
  const isSecretDialog = Boolean(
    (dialog.type === "secret" || dialog.type === "direct" || dialog.type === "private")
    && dialog.encryptionMode === "e2e_v1"
  );
  if (isSecretDialog) {
    const username = getDialogUsernameFromSidebarDialog(dialog);
    const secretToken = encodeSecretRouteToken(publicId);
    if (username && secretToken) {
      return "/@" + encodeURIComponent(username) + "/sc?s=" + encodeURIComponent(secretToken);
    }
    return "/" + publicId;
  }
  if (["direct", "private"].includes(dialog.type)) {
    const username = getDialogUsernameFromSidebarDialog(dialog);
    if (username) {
      return "/@" + encodeURIComponent(username);
    }
  }
  return "/" + publicId;
};

const getGroupCreateCandidates = () => {
  const seenPeerUsers = new Set();
  const allDialogs = getWin().allDialogs || [];
  return allDialogs
    .filter((dialog: any) => {
      const peerUserId = String(dialog?.peerUserId || "").trim();
      if (!dialog || dialog.type !== "direct" || dialog.encryptionMode === "e2e_v1" || !peerUserId) {
        return false;
      }
      if (seenPeerUsers.has(peerUserId)) {
        return false;
      }
      seenPeerUsers.add(peerUserId);
      return true;
    })
    .sort((a: any, b: any) => {
      const aTs = new Date(a?.lastMessageCreatedAt || 0).getTime();
      const bTs = new Date(b?.lastMessageCreatedAt || 0).getTime();
      return bTs - aTs;
    });
};

const getSecretCreateCandidates = () => {
  const byPeer = new Map();
  const allDialogs = getWin().allDialogs || [];
  allDialogs.forEach((dialog: any) => {
    if (!dialog || !["direct", "private", "secret"].includes(dialog.type)) {
      return;
    }
    const peerUserId = String(dialog.peerUserId || "").trim();
    if (!peerUserId) {
      return;
    }
    const existing = byPeer.get(peerUserId) || {
      peerUserId,
      cloudDialog: null,
      secretDialog: null
    };
    const isSecret = dialog.encryptionMode === "e2e_v1";
    if (isSecret) {
      existing.secretDialog = existing.secretDialog || dialog;
    } else {
      existing.cloudDialog = existing.cloudDialog || dialog;
    }
    byPeer.set(peerUserId, existing);
  });
  return Array.from(byPeer.values())
    .map((entry) => {
      const baseDialog = entry.cloudDialog || entry.secretDialog;
      if (!baseDialog) {
        return null;
      }
      return {
        id: "secret-candidate-" + entry.peerUserId,
        peerUserId: entry.peerUserId,
        title: baseDialog.title,
        subtitle: baseDialog.subtitle,
        peerLastSeenAt: baseDialog.peerLastSeenAt,
        avatarUrl: baseDialog.avatarUrl,
        publicId: baseDialog.publicId,
        lastMessageCreatedAt: baseDialog.lastMessageCreatedAt || null,
        type: "direct",
        encryptionMode: baseDialog.encryptionMode,
        unavailable: Boolean(entry.secretDialog)
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const aTs = new Date(a?.lastMessageCreatedAt || 0).getTime();
      const bTs = new Date(b?.lastMessageCreatedAt || 0).getTime();
      return bTs - aTs;
    });
};

const getGroupCreateSelectedCandidates = () => {
  const selectedIds = groupCreateSelectedDialogIds;
  const candidates = groupCreateMode === "secret" ? getSecretCreateCandidates() : getGroupCreateCandidates();
  return candidates.filter((dialog: any) => selectedIds.has(String(dialog.id)));
};

const getAutoGeneratedGroupName = (selectedCandidates: any[]) => {
  const selfName = String(getWin().currentUserDisplayName || getWin().currentUserUsername || getWin().currentUserEmail || "You").trim() || "You";
  const peerNames = selectedCandidates.map((dialog: any) => String(dialog.title || "User").trim() || "User");
  return [selfName].concat(peerNames).join(" & ");
};

const getDialogSortTimestamp = (dialog: any) => {
  const raw = dialog?.lastMessageCreatedAt || dialog?.updatedAt || dialog?.createdAt || "";
  const ts = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(ts) ? ts : 0;
};

const getFilteredDialogs = (dialogs: any[]) => {
  return dialogs.slice().sort((left, right) => {
    const leftSaved = left?.type === "saved";
    const rightSaved = right?.type === "saved";

    if (leftSaved && !rightSaved) {
      return -1;
    }
    if (!leftSaved && rightSaved) {
      return 1;
    }

    const timeDelta = getDialogSortTimestamp(right) - getDialogSortTimestamp(left);
    if (timeDelta !== 0) {
      return timeDelta;
    }

    return String(left?.title || "").localeCompare(String(right?.title || ""));
  });
};

const dedupeMessagesById = (messages: any[]) => {
  if (!Array.isArray(messages) || !messages.length) {
    return [];
  }
  const uniqueMap = new Map();
  messages.forEach((message) => {
    if (!message || typeof message !== "object") {
      return;
    }
    const key = String(message.id || "");
    if (!key) {
      return;
    }
    uniqueMap.set(key, message);
  });
  return Array.from(uniqueMap.values());
};

const isMobileViewport = () => window.matchMedia("(max-width: 900px)").matches;

const uiRenderDebugEnabled = true;
const uiRenderDebug = (event: string, details: any = {}) => {
  if (!uiRenderDebugEnabled) {
    return;
  }
  try {
    console.log("[TheGraphT UI DEBUG]", event, {
      ts: Date.now(),
      route: window.location.pathname || "/",
      currentDialogPublicId: getWin().currentDialogPublicId || null,
      currentDialogId: getWin().currentDialogId || null,
      ...details
    });
  } catch {}
};

const getLocalMessagesForDialog = (publicId: string): any[] => {
  const localList = getWin().localOutgoingMessages || [];
  return localList.filter((m: any) => m && m.dialogPublicId === publicId);
};

const applyRoute = (publicId: string) => {
  const nextPath = resolveRoutePathForDialogPublicId(publicId);
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, "", nextPath);
  }
};

const fetchJson = async (url: string, options: any = {}) => {
  const requestHeaders = {
    ...(options.headers || {})
  };

  const legacySessionToken = getWin().legacySessionToken;
  if (legacySessionToken && !requestHeaders.Authorization) {
    requestHeaders.Authorization = "Bearer " + legacySessionToken;
  }

  // Start progress indicator
  const startTopProgress = getWin().startTopProgress;
  if (typeof startTopProgress === "function") {
    startTopProgress();
  }

  try {
    let response: Response;

    try {
      response = await fetch(url, {
        credentials: "include",
        ...options,
        headers: requestHeaders
      });
    } catch (error) {
      const currentHost = window.location.hostname || "";
      const hint = currentHost === "web.thegrapht.su"
        ? " Could not reach API at web.thegrapht.su."
        : "";
      throw new Error("Network request failed." + hint);
    }

    const rawBody = await response.text();
    const payload = rawBody ? JSON.parse(rawBody) : {};

    if (!response.ok) {
      if (response.status === 401 && !String(url).includes("/auth/")) {
        const persistLegacySessionToken = getWin().persistLegacySessionToken;
        if (typeof persistLegacySessionToken === "function") {
          persistLegacySessionToken("");
        }
        if (getWin().currentUserId) {
          const handleUnauthorizedSession = getWin().handleUnauthorizedSession;
          if (typeof handleUnauthorizedSession === "function") {
            handleUnauthorizedSession(payload.error || "Session ended. Please sign in again.");
          }
        } else {
          const disableRealtime = getWin().disableRealtime;
          if (typeof disableRealtime === "function") {
            disableRealtime();
          }
        }
      }

      const rawErrorMsg = payload.error || "Request failed.";
      throw new Error(response.status === 401 ? rawErrorMsg + " (unauthorized)" : rawErrorMsg);
    }

    return payload;
  } finally {
    const finishTopProgress = getWin().finishTopProgress;
    if (typeof finishTopProgress === "function") {
      finishTopProgress();
    }
  }
};

const warmupDialogMediaInBackground = (messages: any[] = [], options: any = {}) => {
  const targetPublicId = String(options.targetPublicId || "");
  const targetLoadToken = Number(options.targetLoadToken) || 0;
  const start = () => {
    void preloadDialogMediaDimensions(messages, {
      limit: Number(options.limit) || 12,
      chunkSize: Number(options.chunkSize) || 4,
      timeBudgetMs: Number(options.timeBudgetMs) || 140,
      shouldContinue: () => (
        getWin().currentDialogPublicId === targetPublicId
        && getWin().activeDialogLoadToken === targetLoadToken
      )
    });
    prefetchDialogMedia(messages);
  };

  const getIdle = (window as any).requestIdleCallback;
  if (typeof getIdle === "function") {
    getIdle(start, { timeout: 180 });
    return;
  }

  window.setTimeout(start, 0);
};

// Global variables initialized on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const showToast = (message: string, type = "info") => getWin().showToast?.(message, type);
  const openEmojiPicker = () => getWin().openEmojiPicker?.();
  const closeEmojiPicker = () => getWin().closeEmojiPicker?.();
  const scheduleEmojiPickerClose = () => getWin().scheduleEmojiPickerClose?.();
  const openAttachMenu = () => getWin().openAttachMenu?.();
  const closeAttachMenu = () => getWin().closeAttachMenu?.();
  const scheduleAttachMenuClose = () => getWin().scheduleAttachMenuClose?.();
  const addPendingImageAttachments = (files: any) => getWin().addPendingImageAttachments?.(files);
  const addPendingFileAttachments = (files: any) => getWin().addPendingFileAttachments?.(files);
  const closeAttachmentModal = () => getWin().closeAttachmentModal?.();
  const moveAttachmentModal = (dir: number) => getWin().moveAttachmentModal?.(dir);
  const clearPendingImageAttachment = (opts?: any) => getWin().clearPendingImageAttachment?.(opts);
  const sendCurrentPresence = () => getWin().sendCurrentPresence?.();
  const closeChatProfilePanel = () => getWin().closeChatProfilePanel?.();
  const sendTypingState = (isTyping: boolean) => getWin().sendTypingState?.(isTyping);
  const clearPendingReplyMessage = () => getWin().clearPendingReplyMessage?.();
  const closeMessageContextMenu = () => getWin().closeMessageContextMenu?.();
  const closeDeleteMessageModal = () => getWin().closeDeleteMessageModal?.();
  const rememberCurrentDialogScrollTop = () => getWin().rememberCurrentDialogScrollTop?.();
  const uploadAudioBatch = (opts: any) => getWin().uploadAudioBatch?.(opts);
  const uploadImageBatch = (opts: any) => getWin().uploadImageBatch?.(opts);

  const syncDesktopTitlebar = (dialog: any) => {
    const container = document.getElementById("tb-title-container");
    if (!container) return;

    if (!dialog) {
      // Default/Home state - show "TheGraphT"
      container.innerHTML = `
        <span class="tb-title-text" style="color: #eff4ff; font-weight: 700; font-size: 12px; font-family: inherit;">TheGraphT</span>
      `;
    } else if (dialog.type === "direct" || dialog.type === "saved" || dialog.type === "private") {
      // DM / Saved Messages / Private chat state - show "Личные сообщения" in the center without logo
      container.innerHTML = `
        <span class="tb-title-text" style="color: #eff4ff; font-weight: 700; font-size: 12px; font-family: inherit;">Личные сообщения</span>
      `;
    } else {
      // Group/Channel state - show name and photo if present
      let avatarMarkup = "";
      if (dialog.avatarUrl) {
        avatarMarkup = `<img class="tb-avatar" src="${escapeHtml(String(dialog.avatarUrl))}" alt="" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;" />`;
      } else {
        const getDialogAvatarMarkupLocal = getWin().getDialogAvatarMarkup;
        if (typeof getDialogAvatarMarkupLocal === "function") {
          avatarMarkup = getDialogAvatarMarkupLocal(dialog, { showPresence: false, showSecretBadge: false });
        }
      }

      container.innerHTML = `
        <div class="tb-avatar-container" style="display: inline-flex; align-items: center; justify-content: center;">${avatarMarkup}</div>
        <span class="tb-title-text" style="color: #eff4ff; font-weight: 700; font-size: 12px; font-family: inherit;">${escapeHtml(dialog.title || "")}</span>
      `;
    }
  };

  const workspaceSidebar = document.querySelector(".workspace-sidebar") as HTMLElement;
  const sidebarMenuButton = document.getElementById("sidebar-menu-button");
  const sidebarGlassMenu = document.getElementById("sidebar-glass-menu");
  const sidebarMenuProfile = document.getElementById("sidebar-menu-profile");
  const sidebarMenuSaved = document.getElementById("sidebar-menu-saved");
  const sidebarMenuLogout = document.getElementById("sidebar-menu-logout");
  const sidebarComposeFab = document.getElementById("sidebar-compose-fab");
  const sidebarComposeMenu = document.getElementById("sidebar-compose-menu");
  const sidebarComposeChannel = document.getElementById("sidebar-compose-channel");
  const sidebarComposeGroup = document.getElementById("sidebar-compose-group");
  const sidebarComposePrivate = document.getElementById("sidebar-compose-private");
  const groupCreatePanel = document.getElementById("group-create-panel");

  const setStatus = (message: string, type: string) => {
    const statusNode = document.getElementById("status");
    if (statusNode) {
      statusNode.textContent = message;
      statusNode.className = "status " + type;
    }
  };

  const gsapOpenSidebar = (panel: HTMLElement | null) => {
    if (!panel) return;
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  };

  const gsapCloseSidebar = (panel: HTMLElement | null) => {
    if (!panel) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  };

  const groupCreateClose = document.getElementById("group-create-close");
  const groupCreateSearchInput = document.getElementById("group-create-search-input") as HTMLInputElement;
  const groupCreateStepMembersTitle = document.getElementById("group-create-step-members-title");
  const groupCreateList = document.getElementById("group-create-list");
  const groupCreateSelected = document.getElementById("group-create-selected");
  const groupCreateNext = document.getElementById("group-create-next");
  const groupCreateDetailsBack = document.getElementById("group-create-details-back");
  const groupCreatePhotoButton = document.getElementById("group-create-photo-button");
  const groupCreatePhotoInput = document.getElementById("group-create-photo-input") as HTMLInputElement;
  const groupCreatePhotoPreview = document.getElementById("group-create-photo-preview") as HTMLImageElement;
  const groupCreateNameInput = document.getElementById("group-create-name-input") as HTMLInputElement;
  const groupCreateMemberCount = document.getElementById("group-create-member-count");
  const groupCreateDetailsList = document.getElementById("group-create-details-list");

  const authCopyBlock = document.getElementById("auth-copy-block");
  const authKicker = document.getElementById("auth-kicker");
  const authTitle = document.getElementById("auth-title");
  const authCopy = document.getElementById("auth-copy");
  const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
  const metaText = document.getElementById("meta-text");
  const toggleButton = document.getElementById("toggle-mode");
  const nameField = document.getElementById("name-field");
  const nameInput = document.getElementById("name") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;

  const authView = document.getElementById("auth-view");
  const workspaceView = document.getElementById("workspace-view");
  const pageRoot = document.getElementById("page-root");
  const chatWindow = document.getElementById("chat-window");

  const dialogList = document.getElementById("dialog-list");
  const workspaceUserName = document.getElementById("workspace-user-name");

  const dialogContextMenu = document.getElementById("dialog-context-menu");
  const dialogContextMenuBody = document.getElementById("dialog-context-menu-body");

  const messageList = document.getElementById("message-list");
  const chatComposer = document.getElementById("chat-composer");

  const chatTitle = document.getElementById("chat-title");
  const chatSubtitle = document.getElementById("chat-subtitle");
  const chatScrollBottom = document.getElementById("chat-scroll-bottom");
  const chatSearchPanel = document.getElementById("chat-search-panel");
  const sidebarSearch = document.getElementById("sidebar-search") as HTMLInputElement;

  const workspaceMain = document.querySelector(".workspace-main") as HTMLElement;
  const chatStage = document.getElementById("chat-stage") as HTMLElement;

  const attachmentModal = document.getElementById("attachment-modal");
  const attachmentModalCaption = document.getElementById("attachment-modal-caption") as HTMLInputElement;

  const attachmentModalEmojiPickerHead = document.getElementById("attachment-modal-emoji-picker-head");
  const attachmentModalEmojiPickerBody = document.getElementById("attachment-modal-emoji-picker-body");
  const attachmentModalEmojiPicker = document.getElementById("attachment-modal-emoji-picker");
  const attachmentModalEmojiButton = document.getElementById("attachment-modal-emoji-button");

  const emojiPicker = document.getElementById("emoji-picker");
  const emojiPickerSearch = document.getElementById("emoji-picker-search") as HTMLInputElement;

  const emojiModeTabEmoji = document.getElementById("emoji-mode-tab-emoji");
  const emojiModeTabGif = document.getElementById("emoji-mode-tab-gif");
  const emojiPickerSlideTrack = document.getElementById("emoji-picker-slide-track");

  const composerAttachButton = document.getElementById("composer-attach-button");
  const attachMenu = document.getElementById("attach-menu");
  const composerEmojiButton = document.getElementById("composer-emoji-button");
  const groupCallJoinStrip = document.getElementById("group-call-join-strip");

  const composerFileInput = document.getElementById("composer-file-input") as HTMLInputElement;
  const composerAttachmentRemove = document.getElementById("composer-attachment-remove");

  const attachmentModalClose = document.getElementById("attachment-modal-close");
  const attachmentModalPrev = document.getElementById("attachment-modal-prev");
  const attachmentModalNext = document.getElementById("attachment-modal-next");
  const attachmentModalSend = document.getElementById("attachment-modal-send") as HTMLButtonElement;

  const viewerModal = document.getElementById("viewer-modal");
  const chatProfilePanel = document.getElementById("chat-profile-panel");

  const logoutButton = document.getElementById("logout-button") as HTMLButtonElement;

  const composerSend = document.getElementById("composer-send") as HTMLButtonElement;
  const composerInput = document.getElementById("composer-input") as HTMLInputElement;

  const sidebarAiPanel = document.getElementById("sidebar-ai-panel");
  const sidebarAiButton = document.getElementById("sidebar-ai-button");
  const sidebarAiClose = document.getElementById("sidebar-ai-close");
  const sidebarAiMessages = document.getElementById("sidebar-ai-messages");
  const sidebarAiInput = document.getElementById("sidebar-ai-input") as HTMLTextAreaElement;
  const sidebarAiSend = document.getElementById("sidebar-ai-send");
  const sidebarAiPillsWrap = document.getElementById("sidebar-ai-pills-wrap");
  const sidebarAiPills = document.getElementById("sidebar-ai-pills");

  const sidebarAiModelSelectorBtn = document.getElementById("sidebar-ai-model-selector-btn");
  const sidebarAiSelectedModelName = document.getElementById("sidebar-ai-selected-model-name");
  const sidebarAiSelectedModelIcon = document.getElementById("sidebar-ai-selected-model-icon");
  const sidebarAiSelectorChevron = document.getElementById("sidebar-ai-selector-chevron");
  const sidebarAiModelMenu = document.getElementById("sidebar-ai-model-menu");
  const sidebarAiCheckBase = document.getElementById("sidebar-ai-check-base");
  const sidebarAiCheckPro = document.getElementById("sidebar-ai-check-pro");

  const sidebarResizeHandle = document.getElementById("sidebar-resize-handle");

  const setSidebarMenuOpen = (isOpen: boolean) => {
    workspaceSidebar?.classList.toggle("menu-open", isOpen);
    if (sidebarGlassMenu) {
      sidebarGlassMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }
  };

  const toggleSidebarMenu = () => {
    const isOpen = workspaceSidebar?.classList.contains("menu-open");
    setSidebarMenuOpen(!isOpen);
  };

  const setSidebarComposeOpen = (isOpen: boolean) => {
    workspaceSidebar?.classList.toggle("compose-open", isOpen);
    if (sidebarComposeMenu) {
      sidebarComposeMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }
  };

  const toggleSidebarComposeMenu = () => {
    const isOpen = workspaceSidebar?.classList.contains("compose-open");
    setSidebarComposeOpen(!isOpen);
  };

  const renderGroupCreateSelected = (candidates: any[]) => {
    if (!groupCreateSelected) {
      return;
    }
    const selectedCandidates = candidates.filter((dialog) => groupCreateSelectedDialogIds.has(String(dialog.id)));
    const selectedDialogIds = new Set(selectedCandidates.map((dialog) => String(dialog.id)));
    groupCreateSelected.innerHTML = selectedCandidates.map((dialog) => {
      const dialogId = String(dialog.id);
      const isNewSelected = !groupCreateRenderedSelectedDialogIds.has(dialogId);
      return '<div class="group-selected-chip' + (isNewSelected ? " is-new" : "") + '" title="' + escapeHtml(dialog.title || "User") + '">' +
        getDialogAvatarMarkup(dialog, { showPresence: false }) +
      '</div>';
    }).join("");
    groupCreateRenderedSelectedDialogIds = selectedDialogIds;
  };

  const setGroupCreateStep = (step: number) => {
    groupCreateStep = step === 2 ? 2 : 1;
    workspaceSidebar?.classList.toggle("group-create-step2-open", groupCreateStep === 2);
  };

  const syncGroupCreateNextButtonState = () => {
    const hasSelection = groupCreateSelectedDialogIds.size > 0;
    workspaceSidebar?.classList.toggle("group-create-next-enabled", hasSelection);
  };

  const renderGroupCreateDetails = () => {
    const selectedCandidates = getGroupCreateSelectedCandidates();
    const membersCount = selectedCandidates.length;
    if (groupCreateMemberCount) {
      groupCreateMemberCount.textContent = membersCount === 1 ? "1 member" : String(membersCount) + " members";
    }
    if (groupCreateDetailsList) {
      groupCreateDetailsList.innerHTML = selectedCandidates.map((dialog) => {
        const statusText = formatDialogSubtitle(dialog) || "last seen recently";
        return '<div class="group-create-details-item">' +
          getDialogAvatarMarkup(dialog) +
          '<div class="group-create-body">' +
            '<p class="group-create-name">' + escapeHtml(dialog.title || "User") + '</p>' +
            '<p class="group-create-status">' + escapeHtml(statusText) + '</p>' +
          '</div>' +
        '</div>';
      }).join("");
    }
    if (groupCreateNameInput && (!groupCreateNameTouched || !groupCreateNameInput.value.trim())) {
      groupCreateNameInput.value = getAutoGeneratedGroupName(selectedCandidates);
    }
  };

  const renderGroupCreateList = () => {
    if (!groupCreateList) {
      return;
    }
    const candidates = groupCreateMode === "secret" ? getSecretCreateCandidates() : getGroupCreateCandidates();
    const query = groupCreateSearchQuery.trim().toLowerCase();
    const filtered = query
      ? candidates.filter((dialog: any) => {
          const haystack = String(dialog.title || "").toLowerCase() + " " + String(formatDialogSubtitle(dialog) || "").toLowerCase();
          return haystack.includes(query);
        })
      : candidates;

    if (!filtered.length) {
      groupCreateList.innerHTML = '<div class="group-create-empty">No people found.</div>';
      renderGroupCreateSelected(candidates);
      syncGroupCreateNextButtonState();
      return;
    }

    groupCreateList.innerHTML = filtered.map((dialog: any) => {
      const dialogId = String(dialog.id);
      const isSelected = groupCreateSelectedDialogIds.has(dialogId);
      const isUnavailable = Boolean(dialog.unavailable);
      const statusText = isUnavailable
        ? "Secret chat already exists"
        : (formatDialogSubtitle(dialog) || "last seen recently");
      return '<button class="group-create-item' + (isSelected ? " selected" : "") + (isUnavailable ? " unavailable" : "") + '" type="button" data-group-dialog-id="' + escapeHtml(dialogId) + '" ' + (isUnavailable ? 'disabled aria-disabled="true"' : "") + '>' +
        '<span class="group-create-check">' + getIcon("check", "", 'aria-hidden="true"') + '</span>' +
        getDialogAvatarMarkup(dialog) +
        '<div class="group-create-body">' +
          '<p class="group-create-name">' + escapeHtml(dialog.title || "User") + '</p>' +
          '<p class="group-create-status">' + escapeHtml(statusText) + '</p>' +
        '</div>' +
      '</button>';
    }).join("");

    groupCreateList.querySelectorAll("[data-group-dialog-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const dialogId = button.getAttribute("data-group-dialog-id");
        if (!dialogId) {
          return;
        }
        const candidate = filtered.find((item: any) => String(item.id) === dialogId);
        if (candidate?.unavailable) {
          return;
        }
        if (groupCreateSelectedDialogIds.has(dialogId)) {
          groupCreateSelectedDialogIds.delete(dialogId);
        } else {
          if (groupCreateMode === "secret") {
            groupCreateSelectedDialogIds = new Set([dialogId]);
            renderGroupCreateList();
            renderGroupCreateDetails();
            return;
          }
          if (groupCreateSelectedDialogIds.size >= GROUP_MAX_MEMBERS) {
            showToast("Group member limit is 20000.", "info");
            return;
          }
          groupCreateSelectedDialogIds.add(dialogId);
        }
        renderGroupCreateList();
        renderGroupCreateDetails();
      });
    });

    renderGroupCreateSelected(candidates);
    syncGroupCreateNextButtonState();
  };

  const closeGroupCreatePanel = () => {
    gsapCloseSidebar(groupCreatePanel);
    workspaceSidebar?.classList.remove("group-create-next-enabled");
    workspaceSidebar?.classList.remove("group-create-step2-open");
    groupCreateMode = "group";
    if (groupCreateStepMembersTitle) {
      groupCreateStepMembersTitle.textContent = "Add Members";
    }
    if (groupCreateSearchInput) {
      groupCreateSearchInput.placeholder = "Add people...";
    }
    setGroupCreateStep(1);
  };

  const openGroupCreatePanel = () => {
    setSidebarComposeOpen(false);
    setSidebarMenuOpen(false);
    groupCreateSearchQuery = "";
    groupCreateSelectedDialogIds = new Set();
    groupCreateRenderedSelectedDialogIds = new Set();
    groupCreatePhotoDataUrl = "";
    groupCreateNameTouched = false;
    if (groupCreatePhotoPreview) {
      groupCreatePhotoPreview.removeAttribute("src");
    }
    groupCreatePhotoButton?.classList.remove("has-photo");
    if (groupCreateSearchInput) {
      groupCreateSearchInput.value = "";
    }
    if (groupCreateNameInput) {
      groupCreateNameInput.value = "";
    }
    setGroupCreateStep(1);
    renderGroupCreateList();
    renderGroupCreateDetails();
    gsapOpenSidebar(groupCreatePanel);
    window.setTimeout(() => {
      groupCreateSearchInput?.focus();
    }, 40);
  };

  const openSecretCreatePanel = () => {
    groupCreateMode = "secret";
    if (groupCreateStepMembersTitle) {
      groupCreateStepMembersTitle.textContent = "New Secret Chat";
    }
    if (groupCreateSearchInput) {
      groupCreateSearchInput.placeholder = "Who do you want to chat with?";
    }
    if (groupCreateNameInput) {
      groupCreateNameInput.value = "";
    }
    setGroupCreateStep(1);
    openGroupCreatePanel();
  };

  const animateModeChange = (nextMode: string) => {
    authCopyBlock?.classList.add("switching");

    window.setTimeout(() => {
      const registerMode = nextMode === "register";
      if (authKicker) authKicker.textContent = registerMode ? "Register" : "Sign in";
      if (authTitle) authTitle.textContent = registerMode ? "Create account" : "Log in";
      if (authCopy) {
        authCopy.textContent = registerMode
          ? "Sign up to enter your Thegrapht workspace."
          : "Enter your email and password to sign in to Thegrapht.";
      }
      if (submitButton) submitButton.textContent = registerMode ? "Create account" : "Log in";
      if (metaText) metaText.textContent = registerMode ? "Already have an account?" : "No account?";
      if (toggleButton) toggleButton.textContent = registerMode ? "Back to sign in" : "Create account";
      if (nameField) nameField.classList.toggle("open", registerMode);
      if (nameInput) nameInput.required = registerMode;
      if (passwordInput) passwordInput.autocomplete = registerMode ? "new-password" : "current-password";
      authCopyBlock?.classList.remove("switching");
    }, 180);
  };

  const switchView = (showWorkspace: boolean) => {
    authView?.classList.toggle("hidden", showWorkspace);
    workspaceView?.classList.toggle("hidden", !showWorkspace);
    pageRoot?.classList.toggle("workspace-mode", showWorkspace);
  };

  const animateDialogListItems = () => {
    // Local animation trigger helper
    const items = dialogList?.querySelectorAll(".dialog-item");
    if (items) {
      items.forEach((item, index) => {
        const el = item as HTMLElement;
        el.style.setProperty("--index", String(index));
      });
    }
  };

  const hideBootSplash = () => {
    const bootSplash = document.getElementById("boot-splash");
    if (bootSplash) {
      bootSplash.classList.add("hidden");
      window.dispatchEvent(new CustomEvent("thegrapht:boot-splash-hidden"));
    }
  };

  const finishBoot = async (showWorkspace: boolean) => {
    const wasBooting = pageRoot?.classList.contains("booting");
    const ensureBootMinDuration = getWin().ensureBootMinDuration;
    if (typeof ensureBootMinDuration === "function") {
      await ensureBootMinDuration();
    }
    switchView(showWorkspace);
    pageRoot?.classList.remove("booting");
    hideBootSplash();
    const finishAllTopProgress = getWin().finishAllTopProgress;
    if (typeof finishAllTopProgress === "function") {
      finishAllTopProgress();
    }
    if (showWorkspace && wasBooting && chatWindow) {
      chatWindow.classList.remove("motion-enter");
      void chatWindow.offsetWidth;
      chatWindow.classList.add("motion-enter");
      animateDialogListItems();
    }
  };

  const renderSearchLoadingState = () => {
    if (!dialogList) return;
    dialogList.classList.remove("search-empty");
    dialogList.classList.add("search-loading");
    dialogList.innerHTML =
      '<div class="search-loading-state">' +
        '<div class="search-spinner" aria-hidden="true"></div>' +
      '</div>';
    animateDialogListItems();
  };

  const renderSearchResults = (users: any[]) => {
    if (!dialogList) return;
    dialogList.classList.remove("search-loading");
    dialogList.classList.remove("search-empty");
    const query = currentSearchQuery.trim().toLowerCase();
    const allDialogs = getWin().allDialogs || [];
    const savedDialog = allDialogs.find((dialog: any) => dialog.type === "saved");
    const selfMatches = Boolean(
      query
      && (
        String(getWin().currentUserDisplayName || "").toLowerCase().includes(query)
        || String(getWin().currentUserUsername || "").toLowerCase().includes(query)
        || String(getWin().currentUserEmail || "").toLowerCase().includes(query)
      )
    );
    const visibleUsers = selfMatches
      ? [
          {
            id: getWin().currentUserId,
            name: getWin().currentUserDisplayName || getWin().currentUserUsername || getWin().currentUserEmail || "You",
            username: getWin().currentUserUsername || "",
            isSelf: true
          },
          ...users.filter((user) => user.id !== getWin().currentUserId)
        ]
      : users;

    if (!visibleUsers.length) {
      dialogList.classList.add("search-empty");
      const emptyVideo = getWin().searchEmptyVideoUrl || "";
      dialogList.innerHTML =
        '<div class="search-empty-state">' +
          '<video autoplay muted loop playsinline preload="auto" aria-hidden="true">' +
            '<source src="' + escapeHtml(emptyVideo) + '" type="video/mp4" />' +
          '</video>' +
          '<p class="search-empty-title">No results found</p>' +
          '<p class="search-empty-copy">Try another username or clear the search.</p>' +
        '</div>';
      animateDialogListItems();
      return;
    }

    dialogList.innerHTML = visibleUsers.map((user) => {
      const avatar = getAvatarMeta(user.id || user.username, user.name || user.username || "?");
      return '<button class="dialog-item" type="button" data-search-user-id="' + escapeHtml(user.id) + '">' +
        '<div class="dialog-avatar user-avatar" style="' + avatar.style + '"><img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" /></div>' +
        '<div class="dialog-body">' +
          '<div class="dialog-line only-title"><strong>' + escapeHtml(user.name) + '</strong></div>' +
              '<p class="dialog-preview">' + (
            user.isSelf
              ? 'You'
              : '@' + escapeHtml(user.username)
          ) + '</p>' +
        '</div>' +
      '</button>';
    }).join("");

    dialogList.querySelectorAll("[data-search-user-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const targetUserId = button.getAttribute("data-search-user-id");
        if (!targetUserId) {
          return;
        }

        if (targetUserId === getWin().currentUserId && savedDialog?.publicId) {
          currentSearchQuery = "";
          currentSearchResults = [];
          if (sidebarSearch) sidebarSearch.value = "";
          renderDialogs(allDialogs, { animate: true });
          await loadDialog(savedDialog.publicId);
          return;
        }

        try {
          const createPreferredDirectDialog = getWin().createPreferredDirectDialog;
          const payload = await createPreferredDirectDialog(targetUserId);

          const preparedPayload = await prepareDialogPayloadForDisplay(
            payload.dialog || null,
            payload.messages || []
          );

          currentSearchQuery = "";
          currentSearchResults = [];
          if (sidebarSearch) sidebarSearch.value = "";
          const loadWorkspace = getWin().loadWorkspace;
          if (typeof loadWorkspace === "function") {
            await loadWorkspace();
          }
          if (preparedPayload.dialog?.publicId) {
            setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
            await loadDialog(preparedPayload.dialog.publicId);
          }
        } catch (error: any) {
          setStatus(error instanceof Error ? error.message : "Failed to open chat.", "error");
          showToast(error instanceof Error ? error.message : "Failed to open chat.", "error");
        }
      });
    });
    animateDialogListItems();
  };

  const renderDialogs = (dialogs: any[], options: any = {}) => {
    if (!dialogList) return;
    const shouldAnimate = Boolean(options.animate);
    const visibleDialogs = getFilteredDialogs(dialogs);

    dialogList.classList.remove("search-loading");
    dialogList.classList.remove("search-empty");

    dialogList.innerHTML = visibleDialogs.map((dialog) => {
      const active = dialog.id === getWin().currentDialogId ? " active" : "";
      const unreadCount = Math.max(0, Number(dialog?.unreadCount) || 0);
      const unreadBadgeClassName = unreadCount > 0
        ? "dialog-unread-badge"
        : "dialog-unread-badge is-hidden";
      const unreadBadgeText = unreadCount > 99 ? "99+" : String(unreadCount || "");

      return '<button class="dialog-item saved-item' + active + '" data-dialog-id="' + escapeHtml(dialog.id) + '" data-public-id="' + escapeHtml(dialog.publicId) + '">' +
        getDialogAvatarMarkup(dialog) +
        '<div class="dialog-body">' +
          '<div class="dialog-line"><span class="dialog-title-wrap"><strong>' + escapeHtml(dialog.title) + '</strong>' + (dialog.muted ? getIcon("volume_off", "", 'style="font-size: 14px; margin-left: 4px; vertical-align: middle; opacity: 0.6;"') : '') + '</span><span class="dialog-meta">' + escapeHtml(formatDialogListTime(dialog.lastMessageCreatedAt)) + '</span></div>' +
          '<div class="dialog-preview dialog-preview-row">' +
            '<span class="dialog-preview-copy">' + renderDialogPreviewHtml(dialog) + '</span>' +
            '<span class="' + unreadBadgeClassName + '" aria-hidden="' + (unreadCount > 0 ? "false" : "true") + '">' + escapeHtml(unreadBadgeText) + '</span>' +
          '</div>' +
        '</div>' +
      '</button>';
    }).join("");

    dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const dialogId = button.getAttribute("data-dialog-id");
        const publicId = button.getAttribute("data-public-id");
        if (dialogId && publicId) {
          const badgeEl = button.querySelector(".dialog-unread-badge");
          if (badgeEl && !badgeEl.classList.contains("is-hidden")) {
            badgeEl.classList.add("is-hidden");
          }

          getWin().allDialogs = getWin().allDialogs.map((d: any) => d.publicId === publicId
            ? { ...d, unreadCount: 0 }
            : d);
          if (getWin().currentDialogSnapshot?.publicId === publicId) {
            getWin().currentDialogSnapshot = {
              ...getWin().currentDialogSnapshot,
              unreadCount: 0
            };
          }

          window.setTimeout(() => {
            renderDialogs(getWin().allDialogs);
          }, 220);

          void loadDialog(publicId);
        }
      });
    });
    if (shouldAnimate) {
      animateDialogListItems();
    }
  };

  const closeDialogContextMenu = () => {
    if (dialogContextMenuCloseTimer) {
      window.clearTimeout(dialogContextMenuCloseTimer);
      dialogContextMenuCloseTimer = null;
    }
    if (dialogContextMenu) {
      dialogContextMenu.classList.remove("open");
      dialogContextMenu.setAttribute("aria-hidden", "true");
    }
    dialogContextMenuState = null;
  };

  const closeDialogContextMenuSoon = () => {
    if (dialogContextMenuCloseTimer) {
      window.clearTimeout(dialogContextMenuCloseTimer);
    }
    dialogContextMenuCloseTimer = window.setTimeout(() => {
      closeDialogContextMenu();
    }, 140);
  };

  const openDialogContextMenu = (event: MouseEvent, context: any) => {
    if (!context?.publicId || !dialogContextMenuBody || !dialogContextMenu) {
      return;
    }

    dialogContextMenuState = context;
    dialogContextMenuBody.innerHTML =
      '<button class="dialog-context-menu-item" type="button" data-action="open_in_new">' +
        getIcon("open_in_new", "", 'aria-hidden="true"') +
        '<span>Open chat in new window</span>' +
      '</button>';

    const menuWidth = 268;
    const menuHeight = 72;
    const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
    const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
    dialogContextMenu.style.left = left + "px";
    dialogContextMenu.style.top = top + "px";
    dialogContextMenu.classList.add("open");
    dialogContextMenu.setAttribute("aria-hidden", "false");

    dialogContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-action");
        if (action !== "open_in_new" || !dialogContextMenuState?.publicId) {
          return;
        }

        const targetPath = resolveRoutePathForDialogPublicId(dialogContextMenuState.publicId);
        window.open(targetPath, "_blank", "noopener,noreferrer");
        closeDialogContextMenuSoon();
      });
    });
  };

  const closeDialog = (options: any = {}) => {
    sendTypingState(false);
    clearPendingReplyMessage();
    closeMessageContextMenu();
    closeDialogContextMenu();
    closeDeleteMessageModal();
    getWin().currentDialogId = "";
    getWin().currentDialogPublicId = "";
    getWin().pendingAutoBottomDialogPublicId = "";
    getWin().pendingAutoBottomCanceled = false;
    getWin().peerActiveInCurrentDialog = false;
    getWin().currentPeerReadAt = null;
    if (getWin().typingStopTimer) {
      window.clearTimeout(getWin().typingStopTimer);
      getWin().typingStopTimer = null;
    }
    clearPendingImageAttachment();
    sendCurrentPresence();
    closeChatProfilePanel();
    renderMessages(null, []);
    dialogList?.querySelectorAll("[data-dialog-id]").forEach((button) => {
      button.classList.remove("active");
    });
    if (!options.skipHistory) {
      applyRoute("");
    }
  };

  const closeDialogWithMotion = (options: any = {}) => {
    if (!(chatWindow instanceof HTMLElement)) {
      closeDialog(options);
      return;
    }
    if (chatWindow.classList.contains("motion-exit")) {
      return;
    }
    chatWindow.classList.add("motion-exit");
    window.setTimeout(() => {
      closeDialog(options);
      chatWindow.classList.remove("motion-exit");
    }, 140);
  };

  const syncMobileChatOpenState = (hasOpenDialog: boolean) => {
    if (!isMobileViewport()) {
      pageRoot?.classList.remove("mobile-chat-open");
      return;
    }
    pageRoot?.classList.toggle("mobile-chat-open", Boolean(hasOpenDialog));
  };

  const renderMessages = (dialog: any, messages: any[], options: any = {}) => {
    uiRenderDebug("renderMessages:called", {
      dialogPublicId: dialog?.publicId || null,
      dialogType: dialog?.type || null,
      messageCount: Array.isArray(messages) ? messages.length : 0,
      options
    });
    const shouldAnimateList = Boolean(options.animateList);
    const startMessagesLoading = () => {
      messageList?.classList.add("loading-messages");
    };
    const finishMessagesLoading = () => {
      requestAnimationFrame(() => {
        messageList?.classList.remove("loading-messages");
      });
    };
    getWin().currentDialogSnapshot = dialog;
    syncDesktopTitlebar(dialog);
    getWin().currentMessagesSnapshot = Array.isArray(messages)
      ? dedupeMessagesById(messages).map((message) => (
          message && typeof message === "object" && message.animateOnRender
            ? { ...message, animateOnRender: false }
            : message
        ))
      : [];
    if (dialog && dialog.type !== "group") {
      groupCallJoinStrip?.classList.remove("visible");
      groupCallJoinStrip?.setAttribute("aria-hidden", "true");
      if (groupCallJoinStrip) {
        (groupCallJoinStrip as any).hidden = true;
      }
      chatWindow?.classList.remove("group-call-join-visible");
    }

    if (!dialog || !messageList) {
      startMessagesLoading();
      const preserveActiveAudioForLayoutChange = getWin().preserveActiveAudioForLayoutChange;
      if (typeof preserveActiveAudioForLayoutChange === "function") {
        preserveActiveAudioForLayoutChange();
      }
      getWin().currentPeerReadAt = null;
      const syncChatHeaderMeta = getWin().syncChatHeaderMeta;
      if (typeof syncChatHeaderMeta === "function") syncChatHeaderMeta();
      const syncChatIslandActions = getWin().syncChatIslandActions;
      if (typeof syncChatIslandActions === "function") syncChatIslandActions();
      const syncActiveCallChip = getWin().syncActiveCallChip;
      if (typeof syncActiveCallChip === "function") syncActiveCallChip();
      const syncChatProfilePanel = getWin().syncChatProfilePanel;
      if (typeof syncChatProfilePanel === "function") syncChatProfilePanel();
      workspaceMain?.classList.add("empty-chat");
      workspaceMain?.classList.remove("open-chat");
      chatStage?.classList.add("empty");
      chatStage?.classList.remove("open-chat");
      if (chatComposer) chatComposer.style.display = "none";
      syncMobileChatOpenState(false);
      setSidebarComposeOpen(false);
      if (composerInput) {
        composerInput.value = "";
        composerInput.style.height = "48px";
        composerInput.style.overflowY = "hidden";
      }
      clearPendingImageAttachment();
      const syncComposerState = getWin().syncComposerState;
      if (typeof syncComposerState === "function") syncComposerState();
      messageList?.classList.remove("saved-empty");
      if (messageList) {
        messageList.innerHTML = '<div class="empty-chat-state"><p>Choose a chat to start messaging.</p><p>When you pick a dialog on the left, your conversation appears here.</p></div>';
      }
      chatScrollBottom?.classList.remove("visible");
      getWin().isNearChatBottom = true;
      finishMessagesLoading();
      const finishDialogSwitchTransition = getWin().finishDialogSwitchTransition;
      if (typeof finishDialogSwitchTransition === "function") finishDialogSwitchTransition();
      return;
    }

    const localMessages = getLocalMessagesForDialog(dialog.publicId).map((message) => (
      message && typeof message === "object" && message.animateOnRender
        ? { ...message, animateOnRender: false }
        : message
    ));
    const mergedMessages = dedupeMessagesById(getWin().currentMessagesSnapshot.concat(localMessages));
    const syncGroupCallStateFromMessages = getWin().syncGroupCallStateFromMessages;
    if (dialog.type === "group" && typeof syncGroupCallStateFromMessages === "function") {
      syncGroupCallStateFromMessages(dialog, mergedMessages);
    }
    if (dialog.type !== "direct" && dialog.type !== "group") {
      getWin().currentPeerReadAt = null;
    }

    workspaceMain?.classList.remove("empty-chat");
    workspaceMain?.classList.add("open-chat");
    chatStage?.classList.remove("empty");
    chatStage?.classList.add("open-chat");
    if (chatComposer) chatComposer.style.display = "flex";
    syncMobileChatOpenState(true);
    setSidebarComposeOpen(false);
    setSidebarMenuOpen(false);
    if (chatTitle) chatTitle.textContent = dialog.title;
    if (chatSubtitle) chatSubtitle.textContent = formatDialogSubtitle(dialog);
    const syncChatHeaderMetaLocal = getWin().syncChatHeaderMeta;
    if (typeof syncChatHeaderMetaLocal === "function") syncChatHeaderMetaLocal();
    const syncChatProfilePanelLocal = getWin().syncChatProfilePanel;
    if (typeof syncChatProfilePanelLocal === "function") syncChatProfilePanelLocal();
    const syncChatIslandActionsLocal = getWin().syncChatIslandActions;
    if (typeof syncChatIslandActionsLocal === "function") syncChatIslandActionsLocal();
    const syncActiveCallChipLocal = getWin().syncActiveCallChip;
    if (typeof syncActiveCallChipLocal === "function") syncActiveCallChipLocal();
    const syncComposerStateLocal = getWin().syncComposerState;
    if (typeof syncComposerStateLocal === "function") syncComposerStateLocal();

    if (dialog.type === "saved" && mergedMessages.length === 0) {
      startMessagesLoading();
      getWin().bottomLockToken = (getWin().bottomLockToken || 0) + 1;
      messageList.classList.remove("preparing-bottom");
      messageList.classList.add("saved-empty");
      messageList.innerHTML = '<div class="saved-empty-state"><h3>Your personal space</h3><p>Forward useful messages here.</p><p>Store photos and videos here safely.</p></div>';
      chatScrollBottom?.classList.remove("visible");
      getWin().isNearChatBottom = true;
      const closeChatSearchLocal = getWin().closeChatSearch;
      if (typeof closeChatSearchLocal === "function") closeChatSearchLocal();
      finishMessagesLoading();
      const finishDialogSwitchTransition = getWin().finishDialogSwitchTransition;
      if (typeof finishDialogSwitchTransition === "function") finishDialogSwitchTransition();
      return;
    }

    if (dialog.type === "direct" && mergedMessages.length === 0) {
      startMessagesLoading();
      getWin().bottomLockToken = (getWin().bottomLockToken || 0) + 1;
      messageList.classList.remove("preparing-bottom");
      const peerName = escapeHtml(dialog.title || "this user");
      messageList.classList.remove("saved-empty");
      messageList.innerHTML = '<div class="direct-empty-state"><div class="direct-empty-card"><h3>Start chatting with ' + peerName + '</h3><p>Once you send the first message, your chat history appears here.</p></div></div>';
      chatScrollBottom?.classList.remove("visible");
      getWin().isNearChatBottom = true;
      if (chatSearchPanel?.classList.contains("open")) {
        const renderChatSearchResultsLocal = getWin().renderChatSearchResults;
        if (typeof renderChatSearchResultsLocal === "function") renderChatSearchResultsLocal();
      }
      if (typeof syncActiveCallChipLocal === "function") syncActiveCallChipLocal();
      finishMessagesLoading();
      const finishDialogSwitchTransition = getWin().finishDialogSwitchTransition;
      if (typeof finishDialogSwitchTransition === "function") finishDialogSwitchTransition();
      return;
    }

    if (dialog.type === "group" && mergedMessages.length === 0) {
      startMessagesLoading();
      getWin().bottomLockToken = (getWin().bottomLockToken || 0) + 1;
      messageList.classList.remove("preparing-bottom");
      const groupName = escapeHtml(dialog.title || "Group");
      messageList.classList.remove("saved-empty");
      messageList.innerHTML = '<div class="direct-empty-state"><div class="direct-empty-card"><h3>Group "' + groupName + '"</h3><p>Groups can have:</p><p>✓ Up to 20,000 members</p><p>✓ Persistent chat history</p><p>✓ Public links such as thegrapht.su/g/' + escapeHtml(dialog.publicId) + '</p><p>✓ Admins with different rights</p></div></div>';
      chatScrollBottom?.classList.remove("visible");
      getWin().isNearChatBottom = true;
      finishMessagesLoading();
      const finishDialogSwitchTransition = getWin().finishDialogSwitchTransition;
      if (typeof finishDialogSwitchTransition === "function") finishDialogSwitchTransition();
      return;
    }

    messageList.classList.remove("saved-empty");
    getWin().suppressBottomLockCancel = true;
    const hasRestoreScrollTop = typeof options.restoreScrollTop === "number";
    const shouldPrepareBottom = (options.scrollBehavior !== "none" || options.forceScrollBottom) && !hasRestoreScrollTop;
    const forceBottomForRender = shouldPrepareBottom && (options.scrollBehavior === "auto" || options.forceScrollBottom);
    const applyRestoredScrollTop = () => {
      if (!hasRestoreScrollTop) {
        return false;
      }

      getWin().suppressBottomLockCancel = true;
      const maxTop = Math.max(0, messageList.scrollHeight - messageList.clientHeight);
      const nextTop = Math.min(maxTop, Math.max(0, Number(options.restoreScrollTop) || 0));
      messageList.scrollTop = nextTop;
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          getWin().suppressBottomLockCancel = false;
        }, 150);
        const syncChatScrollBottomButtonLocal = getWin().syncChatScrollBottomButton;
        if (typeof syncChatScrollBottomButtonLocal === "function") syncChatScrollBottomButtonLocal();
        rememberCurrentDialogScrollTop();
      });
      return true;
    };
    const renderLockToken = shouldPrepareBottom ? startBottomLock({
      hideList: !options.forceScrollBottom
    }) : 0;
    if (!shouldPrepareBottom) {
      messageList.classList.remove("preparing-bottom");
    }
    const preserveActiveAudioForLayoutChange = getWin().preserveActiveAudioForLayoutChange;
    if (typeof preserveActiveAudioForLayoutChange === "function") {
      preserveActiveAudioForLayoutChange();
    }
    startMessagesLoading();
    const renderableItems = buildRenderableMessageItems(mergedMessages);
    const normalizedItems = typeof annotateGroupIncomingSequences === "function"
      ? annotateGroupIncomingSequences(renderableItems)
      : renderableItems;
    uiRenderDebug("renderMessages:normalized_items", {
      dialogType: dialog?.type || null,
      totalItems: Array.isArray(normalizedItems) ? normalizedItems.length : 0,
      groupItemsWithMeta: Array.isArray(normalizedItems)
        ? normalizedItems.filter((item) => item?.groupIncomingMeta).length
        : 0
    });

    let firstUnreadMessageId = null;
    if (dialog.unreadCount > 0 && mergedMessages.length >= dialog.unreadCount) {
      // Inline sort messages chronologically
      const sorted = mergedMessages.slice().sort((a, b) => {
        const aTs = new Date(a?.createdAt || 0).getTime();
        const bTs = new Date(b?.createdAt || 0).getTime();
        return aTs - bTs;
      });
      const firstUnread = sorted[sorted.length - dialog.unreadCount];
      if (firstUnread) {
        firstUnreadMessageId = firstUnread.id;
      }
    }

    let renderedUnreadDivider = false;
    messageList.innerHTML = normalizedItems.map((item) => {
      let prefix = "";
      if (firstUnreadMessageId && !renderedUnreadDivider && item.messages) {
        const hasFirstUnread = item.messages.some((m: any) => m && m.id === firstUnreadMessageId);
        if (hasFirstUnread) {
          renderedUnreadDivider = true;
          prefix = '<div class="message-unread-divider"><span>Unread Messages</span></div>';
        }
      }
      const html = item.kind === "day"
        ? renderDaySeparator(item.dayValue)
        : item.kind === "album"
          ? renderAlbumMessage(item.messages, { groupIncomingMeta: item.groupIncomingMeta })
          : renderSingleMessage(item.messages[0], { groupIncomingMeta: item.groupIncomingMeta });
      return prefix + html;
    }).join("");

    if (typeof normalizeMessageDaySeparators === "function") {
      normalizeMessageDaySeparators();
    }
    hydrateMessageImages({ lockToken: renderLockToken });
    if (chatSearchPanel?.classList.contains("open")) {
      const renderChatSearchResultsLocal = getWin().renderChatSearchResults;
      if (typeof renderChatSearchResultsLocal === "function") renderChatSearchResultsLocal();
    }
    if (typeof syncActiveCallChipLocal === "function") syncActiveCallChipLocal();
    prefetchDialogMedia(mergedMessages);
    if (shouldPrepareBottom) {
      hardPinMessagesToBottom(renderLockToken);
    }
    requestAnimationFrame(() => {
      if (shouldPrepareBottom) {
        finishBottomLock(renderLockToken);
        if (options.scrollBehavior === "smooth") {
          scrollMessagesToBottom("smooth");
        }
        if (forceBottomForRender && !getWin().bottomLockCanceledByUser) {
          hardPinMessagesToBottom(renderLockToken);
        }
        window.setTimeout(() => {
          getWin().suppressBottomLockCancel = false;
        }, 150);
        finishMessagesLoading();
        return;
      }
      if (!applyRestoredScrollTop()) {
        const syncChatScrollBottomButtonLocal = getWin().syncChatScrollBottomButton;
        if (typeof syncChatScrollBottomButtonLocal === "function") syncChatScrollBottomButtonLocal();
        window.setTimeout(() => {
          getWin().suppressBottomLockCancel = false;
        }, 150);
      }
      finishMessagesLoading();
    });
    const finishDialogSwitchTransition = getWin().finishDialogSwitchTransition;
    if (typeof finishDialogSwitchTransition === "function") finishDialogSwitchTransition();
  };

  const loadDialog = async (publicId: string, options: any = {}) => {
    uiRenderDebug("loadDialog:start", {
      publicId: publicId || null,
      options
    });
    if (!publicId) {
      return;
    }

    if (getWin().currentDialogPublicId === publicId && getWin().currentDialogSnapshot && !options.forceReload) {
      if (!options.skipHistory) {
        applyRoute(publicId);
      }
      return;
    }

    if (getWin().currentDialogId && getWin().currentDialogPublicId !== publicId) {
      sendTypingState(false);
      rememberCurrentDialogScrollTop();
    }

    if (getWin().currentDialogPublicId !== publicId) {
      clearPendingReplyMessage();
      closeChatProfilePanel();
      if (getWin().activeCall && getWin().activeCall.dialogPublicId !== publicId) {
        const minimizeCallModal = getWin().minimizeCallModal;
        if (typeof minimizeCallModal === "function") {
          minimizeCallModal();
        }
      }
    }

    getWin().activeDialogLoadToken = (getWin().activeDialogLoadToken || 0) + 1;
    const loadToken = getWin().activeDialogLoadToken;
    const cachedPayload = options.skipCache ? null : getDialogPayloadCache(publicId);
    
    const shouldRestoreScrollTop = Boolean(options.restoreScrollOnOpen)
      || visitedDialogsInSession.has(publicId)
      || dialogScrollTopCache.has(publicId);
    const restoredScrollTop = shouldRestoreScrollTop ? getDialogScrollTop(publicId) : 0;
    const hasRestoredScrollTop = shouldRestoreScrollTop
      && Number.isFinite(restoredScrollTop)
      && (restoredScrollTop as number) > 0;

    dialogList?.querySelectorAll("[data-dialog-id]").forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-public-id") === publicId);
    });

    if (!options.skipHistory) {
      applyRoute(publicId);
    }

    if (cachedPayload?.dialog && !options.forceReload) {
      uiRenderDebug("loadDialog:cached", {
        publicId,
        messageCount: Array.isArray(cachedPayload.messages) ? cachedPayload.messages.length : 0
      });
      getWin().currentDialogId = cachedPayload.dialog.id;
      getWin().currentDialogPublicId = cachedPayload.dialog.publicId;
      getWin().peerActiveInCurrentDialog = false;
      getWin().currentPeerReadAt = cachedPayload.dialog.peerReadAt || null;
      renderMessages(cachedPayload.dialog, cachedPayload.messages, {
        scrollBehavior: "none",
        openingDialog: false,
        animateList: false,
        forceScrollBottom: !hasRestoredScrollTop,
        restoreScrollTop: hasRestoredScrollTop ? restoredScrollTop : null
      });
      visitedDialogsInSession.add(cachedPayload.dialog.publicId);
      warmupDialogMediaInBackground(cachedPayload.messages, {
        targetPublicId: cachedPayload.dialog.publicId,
        targetLoadToken: loadToken
      });

      if (getWin().pendingDialogPublicIdFromNotification === cachedPayload.dialog.publicId) {
        getWin().pendingDialogPublicIdFromNotification = "";
      }

      getWin().pendingAutoBottomDialogPublicId = "";
      const apiBase = getWin().apiBase || "/api";
      void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(cachedPayload.dialog.publicId) + "/read", {
        method: "POST"
      }).catch(() => {});
      sendCurrentPresence();
      return;
    }

    const allDialogs = getWin().allDialogs || [];
    const previewDialog = allDialogs.find((d: any) => d.publicId === publicId);
    if (previewDialog) {
      getWin().currentDialogId = previewDialog.id;
      getWin().currentDialogPublicId = previewDialog.publicId;
      getWin().currentDialogSnapshot = previewDialog;
      getWin().currentMessagesSnapshot = [];
      
      if (chatTitle) chatTitle.textContent = previewDialog.title;
      if (chatSubtitle) chatSubtitle.textContent = formatDialogSubtitle(previewDialog) || "";
      const syncChatHeaderMeta = getWin().syncChatHeaderMeta;
      if (typeof syncChatHeaderMeta === "function") syncChatHeaderMeta();
      const syncChatProfilePanel = getWin().syncChatProfilePanel;
      if (typeof syncChatProfilePanel === "function") syncChatProfilePanel();
      
      workspaceMain?.classList.remove("empty-chat");
      workspaceMain?.classList.add("open-chat");
      chatStage?.classList.remove("empty");
      chatStage?.classList.add("open-chat");
      if (chatComposer) chatComposer.style.display = "flex";
      
      syncMobileChatOpenState(true);
      setSidebarComposeOpen(false);
      setSidebarMenuOpen(false);
      const syncComposerState = getWin().syncComposerState;
      if (typeof syncComposerState === "function") syncComposerState();
    } else {
      getWin().currentDialogId = "";
      getWin().currentDialogPublicId = publicId;
      getWin().currentDialogSnapshot = null;
      getWin().currentMessagesSnapshot = [];
      
      if (chatTitle) chatTitle.textContent = "Loading...";
      if (chatSubtitle) chatSubtitle.textContent = "";
      const syncChatHeaderMeta = getWin().syncChatHeaderMeta;
      if (typeof syncChatHeaderMeta === "function") syncChatHeaderMeta();
      const syncChatProfilePanel = getWin().syncChatProfilePanel;
      if (typeof syncChatProfilePanel === "function") syncChatProfilePanel();
      
      workspaceMain?.classList.remove("empty-chat");
      workspaceMain?.classList.add("open-chat");
      chatStage?.classList.remove("empty");
      chatStage?.classList.add("open-chat");
      if (chatComposer) chatComposer.style.display = "none";
      
      syncMobileChatOpenState(true);
      setSidebarComposeOpen(false);
      setSidebarMenuOpen(false);
      const syncComposerState = getWin().syncComposerState;
      if (typeof syncComposerState === "function") syncComposerState();
    }

    getWin().pendingAutoBottomDialogPublicId = publicId;
    getWin().pendingAutoBottomCanceled = false;
    getWin().forceBottomOnNextDialogRender = !hasRestoredScrollTop && options.scrollBehavior !== "none";

    try {
      const preserveActiveAudioForLayoutChange = getWin().preserveActiveAudioForLayoutChange;
      if (typeof preserveActiveAudioForLayoutChange === "function") {
        preserveActiveAudioForLayoutChange();
      }
      if (messageList) {
        messageList.innerHTML = '\
          <div class="chat-spinner-container">\
            <div class="boot-splash-inner">\
              <svg class="boot-splash-circular" viewBox="22 22 44 44" aria-hidden="true" focusable="false">\
                <circle class="boot-splash-circular-indicator" cx="44" cy="44" r="20.2"></circle>\
              </svg>\
            </div>\
          </div>\
        ';
      }
      
      const apiBase = getWin().apiBase || "/api";
      const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(publicId) + "/messages");
      const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.messages || []);

      if (loadToken !== getWin().activeDialogLoadToken) {
        return;
      }

      setDialogPayloadCache(publicId, preparedPayload);
      getWin().currentDialogId = preparedPayload.dialog.id;
      getWin().currentDialogPublicId = preparedPayload.dialog.publicId;
      if (getWin().pendingDialogPublicIdFromNotification === preparedPayload.dialog.publicId) {
        getWin().pendingDialogPublicIdFromNotification = "";
      }
      getWin().peerActiveInCurrentDialog = false;
      getWin().currentPeerReadAt = preparedPayload.dialog.peerReadAt || null;
      const cachedSignature = cachedPayload?.messages
        ? cachedPayload.messages.map((m: any) => m.id).join("|")
        : "";
      const nextSignature = (preparedPayload.messages || []).map((m: any) => m.id).join("|");
      const lastPreparedMessage = (preparedPayload.messages || []).length
        ? preparedPayload.messages[preparedPayload.messages.length - 1]
        : null;

      if (lastPreparedMessage && !lastPreparedMessage.decryptionFailed) {
        updateDialogInState(preparedPayload.dialog, {
          lastMessagePreview: getMessagePreviewText(lastPreparedMessage),
          lastMessageSenderName: lastPreparedMessage.senderId === getWin().currentUserId
            ? "You"
            : (lastPreparedMessage.senderName || preparedPayload.dialog?.title || ""),
          lastMessageCreatedAt: lastPreparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
        });
        if (!currentSearchQuery.trim()) {
          renderDialogs(getWin().allDialogs);
        }
      }

      if (!cachedPayload?.dialog || cachedSignature !== nextSignature || options.forceReload) {
        uiRenderDebug("loadDialog:renderMessages", {
          publicId,
          cachedSignature,
          nextSignature,
          messageCount: Array.isArray(preparedPayload.messages) ? preparedPayload.messages.length : 0,
          options
        });
        renderMessages(preparedPayload.dialog, preparedPayload.messages, {
          scrollBehavior: hasRestoredScrollTop ? "none" : (options.scrollBehavior || "auto"),
          openingDialog: true,
          animateList: false,
          forceScrollBottom: !hasRestoredScrollTop,
          restoreScrollTop: hasRestoredScrollTop ? restoredScrollTop : null
        });
        visitedDialogsInSession.add(preparedPayload.dialog.publicId);
        warmupDialogMediaInBackground(preparedPayload.messages, {
          targetPublicId: preparedPayload.dialog.publicId,
          targetLoadToken: loadToken
        });
      } else {
        getWin().currentDialogSnapshot = preparedPayload.dialog;
        getWin().currentMessagesSnapshot = preparedPayload.messages || [];
        visitedDialogsInSession.add(preparedPayload.dialog.publicId);
        const refreshCurrentDialogChrome = getWin().refreshCurrentDialogChrome;
        if (typeof refreshCurrentDialogChrome === "function") {
          refreshCurrentDialogChrome();
        }
        warmupDialogMediaInBackground(preparedPayload.messages, {
          targetPublicId: preparedPayload.dialog.publicId,
          targetLoadToken: loadToken
        });
      }
      getWin().pendingAutoBottomDialogPublicId = "";
      if (preparedPayload.dialog?.publicId) {
        void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(preparedPayload.dialog.publicId) + "/read", {
          method: "POST"
        }).catch(() => {});
      }
      sendCurrentPresence();
    } catch (error) {
      getWin().pendingAutoBottomDialogPublicId = "";
      const finishDialogSwitchTransition = getWin().finishDialogSwitchTransition;
      if (typeof finishDialogSwitchTransition === "function") finishDialogSwitchTransition();
      throw error;
    }
  };

  let workspaceLoadInFlightPromise: Promise<void> | null = null;

  const loadWorkspace = (options: any = {}) => {
    uiRenderDebug("loadWorkspace:requested", { options, inFlight: Boolean(workspaceLoadInFlightPromise) });
    if (workspaceLoadInFlightPromise) {
      uiRenderDebug("loadWorkspace:joined_inflight", { options });
      return workspaceLoadInFlightPromise;
    }

    workspaceLoadInFlightPromise = (async () => {
      const isInitialWorkspaceBoot = pageRoot?.classList.contains("booting");

      if (getWin().currentUserId) {
        uiRenderDebug("loadWorkspace:start_transition", { options });
        const startDialogSwitchTransition = getWin().startDialogSwitchTransition;
        if (typeof startDialogSwitchTransition === "function") startDialogSwitchTransition();
      }

      const routedToken = getWin().pendingDialogPublicIdFromNotification
        || (
          options.preserveRoute
            ? getWin().currentDialogPublicId || getRoutedPublicId()
            : getRoutedPublicId()
        );
      const pathName = String(window.location.pathname || "");
      const lowerPathName = pathName.toLowerCase();
      const routeIsSecretUsernamePath = lowerPathName.startsWith("/@")
        && (lowerPathName.endsWith("/sc") || lowerPathName.endsWith("/sc/"));
      const routeIsUsername = String(routedToken || "").startsWith("@");
      let routedUsernameFromRoute = "";
      const routePublicId = routeIsUsername ? "" : String(routedToken || "");
      const clientStateParams = new URLSearchParams();
      if (routePublicId) {
        clientStateParams.set("publicId", routePublicId);
      } else if (routeIsUsername) {
        const routeUsername = String(routedToken || "").replace(/^@+/, "").trim().toLowerCase();
        if (routeUsername) {
          clientStateParams.set("routeUsername", routeUsername);
          clientStateParams.set("routeKind", routeIsSecretUsernamePath ? "secret" : "cloud");
        }
      }
      const apiBase = getWin().apiBase || "/api";
      const payload = await fetchJson(
        apiBase + "/v1/client-state" + (clientStateParams.toString() ? "?" + clientStateParams.toString() : "")
      );

      getWin().currentUserId = payload.user.id;
      getWin().currentUserUsername = payload.user.username || "";
      getWin().currentUserEmail = payload.user.email || "";
      getWin().currentUserDisplayName = payload.user.displayName || payload.user.username || payload.user.email || "TheGraphT user";
      getWin().currentUserAvatarLetter = String(getWin().currentUserDisplayName || "?").trim().charAt(0).toUpperCase() || "?";
      getWin().currentUserAvatarUrl = String(
        payload?.user?.avatarUrl
        || payload?.user?.photoUrl
        || payload?.user?.avatarDataUrl
        || payload?.user?.profilePhotoUrl
        || ""
      ).trim();
      const secureFeatureState = getWin().secureFeatureState;
      if (secureFeatureState) {
        secureFeatureState.identityPromise = null;
        secureFeatureState.publishPromise = null;
      }
      const hydrateDialogPreviewsForSidebar = async (dialogs: any[]) => Array.isArray(dialogs) ? dialogs : [];

      if (workspaceUserName) workspaceUserName.textContent = getWin().currentUserDisplayName;
      const parsedDialogs = await hydrateDialogPreviewsForSidebar(payload.dialogs || []);
      getWin().allDialogs = parsedDialogs;
      if (routeIsUsername) {
        const routedUsername = String(routedToken || "").replace(/^@+/, "").trim().toLowerCase();
        routedUsernameFromRoute = routedUsername;
        if (routedUsername) {
          let targetDialog = parsedDialogs.find((dialog: any) => (
            getDialogUsernameFromSidebarDialog(dialog) === routedUsername
            && (
              routeIsSecretUsernamePath
                ? (["direct", "private", "secret"].includes(dialog?.type) && dialog?.encryptionMode === "e2e_v1")
                : (["direct", "private"].includes(dialog?.type) && dialog?.encryptionMode !== "e2e_v1")
            )
          )) || null;

          if (targetDialog?.publicId) {
            const targetPayload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(targetDialog.publicId) + "/messages");
            const preparedTarget = await prepareDialogPayloadForDisplay(targetPayload.dialog || null, targetPayload.messages || []);
            if (preparedTarget?.dialog?.publicId) {
              payload.selectedDialog = preparedTarget.dialog;
              payload.messages = preparedTarget.messages || [];
            }
          }
        }
      }
      const preparedSelection = await prepareDialogPayloadForDisplay(payload.selectedDialog || null, payload.messages || []);
      if (
        routeIsUsername
        && !routeIsSecretUsernamePath
        && routedUsernameFromRoute
        && preparedSelection?.dialog?.encryptionMode === "e2e_v1"
        && ["direct", "private", "secret"].includes(preparedSelection?.dialog?.type)
      ) {
        const cloudDialogForUsername = parsedDialogs.find((dialog: any) => (
          getDialogUsernameFromSidebarDialog(dialog) === routedUsernameFromRoute
          && ["direct", "private"].includes(dialog?.type)
          && dialog?.encryptionMode !== "e2e_v1"
        ));
        if (cloudDialogForUsername?.publicId) {
          const cloudPayload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(cloudDialogForUsername.publicId) + "/messages");
          const preparedCloud = await prepareDialogPayloadForDisplay(cloudPayload.dialog || null, cloudPayload.messages || []);
          if (preparedCloud?.dialog?.publicId) {
            payload.selectedDialog = preparedCloud.dialog;
            payload.messages = preparedCloud.messages || [];
          }
        }
      }
      const finalSelection = await prepareDialogPayloadForDisplay(payload.selectedDialog || null, payload.messages || []);
      uiRenderDebug("loadWorkspace:fetched", {
        selectedDialogPublicId: finalSelection.dialog?.publicId || null,
        selectedMessageCount: Array.isArray(finalSelection.messages) ? finalSelection.messages.length : 0,
        dialogsCount: Array.isArray(payload.dialogs) ? payload.dialogs.length : 0
      });
      getWin().currentDialogId = finalSelection.dialog ? finalSelection.dialog.id : "";
      getWin().currentDialogPublicId = finalSelection.dialog ? finalSelection.dialog.publicId : "";
      if (getWin().currentDialogPublicId) {
        getWin().allDialogs = getWin().allDialogs.map((dialog: any) => dialog.publicId === getWin().currentDialogPublicId
          ? { ...dialog, unreadCount: 0 }
          : dialog);
      }
      getWin().peerActiveInCurrentDialog = false;
      getWin().currentPeerReadAt = finalSelection.dialog?.peerReadAt || null;
      if (currentSearchQuery.trim()) {
        renderSearchResults(currentSearchResults);
      } else {
        renderDialogs(getWin().allDialogs);
      }
      if (finalSelection.dialog?.publicId) {
        setDialogPayloadCache(finalSelection.dialog.publicId, finalSelection);
      }
      getWin().forceBottomOnNextDialogRender = Boolean(finalSelection.dialog?.publicId) && options.scrollBehavior !== "none";
      renderMessages(finalSelection.dialog, finalSelection.messages, {
        scrollBehavior: options.scrollBehavior || "auto",
        animateList: isInitialWorkspaceBoot,
        forceScrollBottom: Boolean(finalSelection.dialog?.publicId)
      });
      if (finalSelection.dialog?.publicId) {
        applyRoute(finalSelection.dialog.publicId);
      }
      if (finalSelection.dialog?.publicId) {
        warmupDialogMediaInBackground(finalSelection.messages, {
          targetPublicId: finalSelection.dialog.publicId,
          targetLoadToken: getWin().activeDialogLoadToken
        });
      }
      uiRenderDebug("loadWorkspace:renderMessages", {
        selectedDialogPublicId: finalSelection.dialog?.publicId || null,
        selectedMessageCount: Array.isArray(finalSelection.messages) ? finalSelection.messages.length : 0,
        options
      });
      if (getWin().pendingDialogPublicIdFromNotification && finalSelection.dialog?.publicId === getWin().pendingDialogPublicIdFromNotification) {
        getWin().pendingDialogPublicIdFromNotification = "";
      }
      const bindNotificationPermissionPrompt = getWin().bindNotificationPermissionPrompt;
      if (typeof bindNotificationPermissionPrompt === "function") bindNotificationPermissionPrompt();
      scheduleBackgroundRefresh();
      sendCurrentPresence();
      finishBoot(true);
    })();

    return workspaceLoadInFlightPromise.finally(() => {
      uiRenderDebug("loadWorkspace:finished");
      workspaceLoadInFlightPromise = null;
    });
  };

  window.addEventListener("popstate", () => {
    if (getWin().currentUserId) {
      void loadWorkspace().catch(() => {
        finishBoot(false);
      });
    }
  });

  if (typeof getWin().startNotificationOwnershipHeartbeat === "function") {
    getWin().startNotificationOwnershipHeartbeat();
  }
  if (typeof getWin().startPrimaryTabOwnershipHeartbeat === "function") {
    getWin().startPrimaryTabOwnershipHeartbeat();
  }

  window.addEventListener("focus", () => {
    if (typeof getWin().refreshNotificationOwnership === "function") {
      getWin().refreshNotificationOwnership();
    }
    if (typeof getWin().refreshPrimaryTabOwnership === "function") {
      getWin().refreshPrimaryTabOwnership();
    }
    if (typeof getWin().scheduleBackgroundRefresh === "function") {
      getWin().scheduleBackgroundRefresh();
    }
    if (typeof getWin().sendActiveState === "function") {
      getWin().sendActiveState(true);
    }
  });

  window.addEventListener("blur", () => {
    if (typeof getWin().sendActiveState === "function") {
      getWin().sendActiveState(false);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (typeof getWin().refreshNotificationOwnership === "function") {
      getWin().refreshNotificationOwnership();
    }
    if (typeof getWin().refreshPrimaryTabOwnership === "function") {
      getWin().refreshPrimaryTabOwnership();
    }
    if (typeof getWin().scheduleBackgroundRefresh === "function") {
      getWin().scheduleBackgroundRefresh();
    }
    if (typeof getWin().sendActiveState === "function") {
      getWin().sendActiveState(document.visibilityState === "visible");
    }
  });

  window.addEventListener("storage", (event) => {
    const ACTIVE_TAB_OWNER_STORAGE_KEY = "thegrapht_active_tab_owner";
    if (event.key === ACTIVE_TAB_OWNER_STORAGE_KEY) {
      refreshPrimaryTabOwnership();
    }
  });

  window.addEventListener("beforeunload", () => {
    releasePrimaryTabOwnership();
  });

  const shouldBlockWorkspaceClipboard = () => !workspaceView?.classList.contains("hidden");
  const isEditableTarget = (target: any) => {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest("input, textarea, [contenteditable='true'], [contenteditable='plaintext-only']"));
  };
  const isMessageTextTarget = (target: any) => {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest(".message-body, .message-reply-text"));
  };
  const hasAllowedMessageTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount < 1 || selection.isCollapsed) {
      return false;
    }
    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
    const focusElement = focusNode instanceof Element ? focusNode : focusNode?.parentElement;
    return Boolean(
      anchorElement
      && focusElement
      && isMessageTextTarget(anchorElement)
      && isMessageTextTarget(focusElement)
    );
  };

  document.addEventListener("copy", (event) => {
    if (!shouldBlockWorkspaceClipboard()) {
      return;
    }
    if (hasAllowedMessageTextSelection()) {
      return;
    }
    event.preventDefault();
  });

  document.addEventListener("cut", (event) => {
    if (!shouldBlockWorkspaceClipboard()) {
      return;
    }
    if (hasAllowedMessageTextSelection()) {
      return;
    }
    event.preventDefault();
  });

  document.addEventListener("selectstart", (event) => {
    if (
      !shouldBlockWorkspaceClipboard()
      || isEditableTarget(event.target)
      || isMessageTextTarget(event.target)
    ) {
      return;
    }
    event.preventDefault();
  });

  document.addEventListener("contextmenu", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }

    if (workspaceView?.classList.contains("hidden")) {
      return;
    }

    if (!target.closest("#workspace-view")) {
      return;
    }

    const allowNativeContextMenu = Boolean(
      target.closest("#composer-input, #attachment-modal-caption")
    );

    if (allowNativeContextMenu) {
      return;
    }

    event.preventDefault();
  });

  dialogList?.addEventListener("contextmenu", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest(".dialog-item[data-public-id]")
      : null;

    if (!target) {
      closeDialogContextMenu();
      return;
    }

    const publicId = target.getAttribute("data-public-id");
    const dialogId = target.getAttribute("data-dialog-id");
    if (!publicId || !dialogId) {
      closeDialogContextMenu();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    openDialogContextMenu(event, { publicId, dialogId });
  });

  dialogContextMenu?.addEventListener("mouseenter", () => {
    if (dialogContextMenuCloseTimer) {
      window.clearTimeout(dialogContextMenuCloseTimer);
      dialogContextMenuCloseTimer = null;
    }
  });

  dialogContextMenu?.addEventListener("mouseleave", () => {
    closeDialogContextMenuSoon();
  });

  document.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }

    if (!target.closest("#dialog-context-menu")) {
      closeDialogContextMenu();
    }

    if (
      !target.closest("#sidebar-glass-menu")
      && !target.closest("#sidebar-menu-button")
      && workspaceSidebar?.classList.contains("menu-open")
    ) {
      setSidebarMenuOpen(false);
    }

    if (
      !target.closest("#sidebar-compose-menu")
      && !target.closest("#sidebar-compose-fab")
      && workspaceSidebar?.classList.contains("compose-open")
    ) {
      setSidebarComposeOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialogContextMenu?.classList.contains("open")) {
      event.preventDefault();
      event.stopPropagation();
      closeDialogContextMenu();
      return;
    }

    if (event.key === "Escape" && workspaceSidebar?.classList.contains("menu-open")) {
      event.preventDefault();
      setSidebarMenuOpen(false);
      return;
    }

    if (event.key === "Escape" && workspaceSidebar?.classList.contains("compose-open")) {
      event.preventDefault();
      setSidebarComposeOpen(false);
      return;
    }

    if (event.key === "Escape" && groupCreatePanel && groupCreatePanel.getAttribute("aria-hidden") === "false") {
      event.preventDefault();
      event.stopPropagation();
      closeGroupCreatePanel();
      return;
    }

    const sidebarProfilePanel = document.getElementById("sidebar-profile-panel");
    if (event.key === "Escape" && sidebarProfilePanel && sidebarProfilePanel.getAttribute("aria-hidden") === "false") {
      event.preventDefault();
      event.stopPropagation();
      const closeSidebarProfilePanel = getWin().closeSidebarProfilePanel;
      if (typeof closeSidebarProfilePanel === "function") closeSidebarProfilePanel();
      return;
    }

    if (event.key === "Escape" && viewerModal?.classList.contains("open")) {
      const closeViewerModal = getWin().closeViewerModal;
      if (typeof closeViewerModal === "function") closeViewerModal();
      return;
    }

    if (event.key === "Escape" && chatProfilePanel?.classList.contains("open")) {
      closeChatProfilePanel();
      return;
    }

    if (event.key === "Escape" && chatSearchPanel?.classList.contains("open")) {
      const closeChatSearch = getWin().closeChatSearch;
      if (typeof closeChatSearch === "function") closeChatSearch();
      return;
    }

    if (event.key === "Escape" && attachmentModal?.classList.contains("open")) {
      event.preventDefault();
      event.stopPropagation();
      closeAttachmentModal();
      return;
    }

    if (attachmentModal?.classList.contains("open") && event.key === "ArrowLeft") {
      event.preventDefault();
      moveAttachmentModal(-1);
      return;
    }

    if (attachmentModal?.classList.contains("open") && event.key === "ArrowRight") {
      event.preventDefault();
      moveAttachmentModal(1);
      return;
    }

    if ((event.key === "+" || event.key === "=") && event.ctrlKey && viewerModal?.classList.contains("open")) {
      event.preventDefault();
      const viewerZoom = getWin().viewerZoom || 1;
      const setViewerZoom = getWin().setViewerZoom;
      if (typeof setViewerZoom === "function") setViewerZoom(viewerZoom + 0.14);
      return;
    }

    if (event.key === "-" && event.ctrlKey && viewerModal?.classList.contains("open")) {
      event.preventDefault();
      const viewerZoom = getWin().viewerZoom || 1;
      const setViewerZoom = getWin().setViewerZoom;
      if (typeof setViewerZoom === "function") setViewerZoom(viewerZoom - 0.14);
      return;
    }

    if (event.key === "Escape" && getWin().currentDialogId) {
      closeDialogWithMotion();
    }
  });

  sidebarSearch?.addEventListener("input", () => {
    currentSearchQuery = sidebarSearch.value || "";
    if (searchDelayTimer) {
      window.clearTimeout(searchDelayTimer);
      searchDelayTimer = null;
    }

    if (!currentSearchQuery.trim()) {
      currentSearchResults = [];
      const allDialogs = getWin().allDialogs || [];
      renderDialogs(allDialogs, { animate: true });
      return;
    }

    renderSearchLoadingState();
    const requestId = ++searchRequestId;
    searchDelayTimer = window.setTimeout(() => {
      void (async () => {
        try {
          const apiBase = getWin().apiBase || "/api";
          const usersSearchApiUrl = apiBase + "/v1/users/search";
          const payload = await fetchJson(usersSearchApiUrl + "?q=" + encodeURIComponent(currentSearchQuery.trim()));

          if (requestId !== searchRequestId) {
            return;
          }

          currentSearchResults = payload.users || [];
          renderSearchResults(currentSearchResults);
        } catch (error: any) {
          if (requestId !== searchRequestId) {
            return;
          }

          currentSearchResults = [];
          if (dialogList) {
            dialogList.classList.remove("search-loading");
            dialogList.classList.add("search-empty");
            dialogList.innerHTML = '<div class="search-empty-state"><p class="search-empty-title">Search unavailable</p><p class="search-empty-copy">Failed to load users.</p></div>';
          }
          showToast(error instanceof Error ? error.message : "Search is currently unavailable.", "error");
        }
      })();
    }, 240);
  });

  sidebarMenuButton?.addEventListener("click", () => {
    toggleSidebarMenu();
  });

  let composeHoverTimeout: any = null;

  const clearComposeHoverTimeout = () => {
    if (composeHoverTimeout) {
      clearTimeout(composeHoverTimeout);
      composeHoverTimeout = null;
    }
  };

  const startComposeCloseTimeout = () => {
    clearComposeHoverTimeout();
    composeHoverTimeout = setTimeout(() => {
      setSidebarComposeOpen(false);
    }, 300);
  };

  sidebarComposeFab?.addEventListener("click", (event) => {
    event.stopPropagation();
    clearComposeHoverTimeout();
    setSidebarComposeOpen(true);
  });

  sidebarComposeFab?.addEventListener("mouseenter", () => {
    clearComposeHoverTimeout();
    setSidebarComposeOpen(true);
  });

  sidebarComposeFab?.addEventListener("mouseleave", () => {
    startComposeCloseTimeout();
  });

  sidebarComposeMenu?.addEventListener("mouseenter", () => {
    clearComposeHoverTimeout();
  });

  sidebarComposeMenu?.addEventListener("mouseleave", () => {
    startComposeCloseTimeout();
  });

  sidebarComposeChannel?.addEventListener("click", (event) => {
    event.preventDefault();
  });
  
  sidebarComposeGroup?.addEventListener("click", () => {
    groupCreateMode = "group";
    if (groupCreateStepMembersTitle) {
      groupCreateStepMembersTitle.textContent = "Add Members";
    }
    if (groupCreateSearchInput) {
      groupCreateSearchInput.placeholder = "Add people...";
    }
    openGroupCreatePanel();
  });
  
  sidebarComposePrivate?.addEventListener("click", () => openSecretCreatePanel());
  groupCreateClose?.addEventListener("click", () => closeGroupCreatePanel());
  groupCreateNext?.addEventListener("click", () => {
    if (groupCreateMode === "secret") {
      const selectedCandidates = getGroupCreateSelectedCandidates();
      const selected = selectedCandidates[0] || null;
      const peerUserId = String(selected?.peerUserId || "").trim();
      if (!peerUserId) {
        return;
      }
      (async () => {
        try {
          const payload = await createSecretDirectDialog(peerUserId);
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.messages || []);
          if (!preparedPayload.dialog?.publicId) {
            throw new Error("Failed to open secret chat.");
          }
          setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
          const updateDialogInState = getWin().updateDialogInState;
          const upsertedDialog = typeof updateDialogInState === "function" ? updateDialogInState(preparedPayload.dialog, {
            lastMessagePreview: preparedPayload.dialog.lastMessagePreview || "Secure messages",
            lastMessageSenderName: preparedPayload.dialog.lastMessageSenderName || null,
            lastMessageCreatedAt: preparedPayload.dialog.lastMessageCreatedAt || new Date().toISOString()
          }) : null;
          if (!upsertedDialog) {
            getWin().allDialogs.unshift(preparedPayload.dialog);
          }
          if (!currentSearchQuery.trim()) {
            renderDialogs(getWin().allDialogs);
          }
          closeGroupCreatePanel();
          await loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
        } catch (error: any) {
          showToast(error instanceof Error ? error.message : "Failed to start secret chat.", "error");
        }
      })();
      return;
    }
    if (groupCreateStep === 1) {
      if (!groupCreateSelectedDialogIds.size) {
        return;
      }
      renderGroupCreateDetails();
      setGroupCreateStep(2);
      return;
    }
    const groupName = groupCreateNameInput ? (groupCreateNameInput.value || "New Group") : "New Group";
    const selectedCandidates = getGroupCreateSelectedCandidates();
    const memberUserIds = Array.from(new Set(
      selectedCandidates
        .map((dialog: any) => String(dialog.peerUserId || "").trim())
        .filter(Boolean)
    ));
    if (!memberUserIds.length) {
      showToast("Select at least one member with a valid user.", "info");
      return;
    }
    (async () => {
      try {
        const apiBase = getWin().apiBase || "/api";
        const payload = await fetchJson(apiBase + "/v1/dialogs/group", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: groupName,
            memberUserIds,
            avatarDataUrl: groupCreatePhotoDataUrl || undefined
          })
        });
        const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.messages || []);
        setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
        const updateDialogInState = getWin().updateDialogInState;
        const updatedDialog = typeof updateDialogInState === "function" ? updateDialogInState(preparedPayload.dialog, {
          lastMessagePreview: "You created a group",
          lastMessageSenderName: "You",
          lastMessageCreatedAt: new Date().toISOString()
        }) : null;
        if (!updatedDialog) {
          getWin().allDialogs.unshift({
            ...preparedPayload.dialog,
            lastMessagePreview: "You created a group",
            lastMessageSenderName: "You",
            lastMessageCreatedAt: new Date().toISOString()
          });
        }
        if (!currentSearchQuery.trim()) {
          renderDialogs(getWin().allDialogs);
        }
        applyRoute(preparedPayload.dialog.publicId);
        closeGroupCreatePanel();
        void loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
      } catch (error: any) {
        showToast(error instanceof Error ? error.message : "Failed to create group.", "error");
      }
    })();
  });
  groupCreateDetailsBack?.addEventListener("click", () => {
    setGroupCreateStep(1);
  });
  groupCreateSearchInput?.addEventListener("input", () => {
    groupCreateSearchQuery = groupCreateSearchInput.value || "";
    renderGroupCreateList();
  });
  groupCreatePhotoButton?.addEventListener("click", () => {
    groupCreatePhotoInput?.click();
  });
  groupCreatePhotoInput?.addEventListener("change", () => {
    const file = groupCreatePhotoInput.files && groupCreatePhotoInput.files[0] ? groupCreatePhotoInput.files[0] : null;
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      groupCreatePhotoDataUrl = result;
      if (groupCreatePhotoPreview && result) {
        groupCreatePhotoPreview.src = result;
        groupCreatePhotoButton?.classList.add("has-photo");
      }
    };
    reader.readAsDataURL(file);
    groupCreatePhotoInput.value = "";
  });
  groupCreateNameInput?.addEventListener("input", () => {
    groupCreateNameTouched = true;
  });

  const sidebarProfileAvatarEl = document.getElementById("sidebar-profile-avatar");
  const sidebarProfileDisplayName = document.getElementById("sidebar-profile-display-name");
  const sidebarProfileUsername = document.getElementById("sidebar-profile-username");
  const sidebarProfileBack = document.getElementById("sidebar-profile-back");

  const openSidebarProfilePanel = () => {
    const sidebarProfilePanel = document.getElementById("sidebar-profile-panel");
    if (!sidebarProfilePanel) { return; }
    const displayName = String(getWin().currentUserDisplayName || getWin().currentUserUsername || getWin().currentUserEmail || "You").trim();
    if (sidebarProfileDisplayName) {
      sidebarProfileDisplayName.textContent = displayName;
    }
    const rawUsername = String(getWin().currentUserUsername || "").trim();
    if (sidebarProfileUsername) {
      sidebarProfileUsername.textContent = rawUsername ? ("@" + rawUsername) : "";
    }
    if (sidebarProfileAvatarEl) {
      const avatarUrl = String(getWin().currentUserAvatarUrl || "").trim();
      if (avatarUrl) {
        sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="' + escapeHtml(avatarUrl) + '" alt="' + escapeHtml(displayName) + '" />';
        sidebarProfileAvatarEl.removeAttribute("style");
      } else {
        const meta = typeof getAvatarMeta === "function"
          ? getAvatarMeta(getWin().currentUserId || displayName, displayName)
          : null;
        if (meta) {
          sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="' + meta.avatarUrl + '" alt="' + escapeHtml(meta.letter || "?") + '" />';
          sidebarProfileAvatarEl.style.cssText = meta.style || "";
        } else {
          const seed = String(getWin().currentUserId || displayName || "?");
          const palettes = [["#6cb5ff","#4a8fe9"],["#ff9f6c","#ea6d4a"],["#7de3b2","#39b67f"],["#f7a6d8","#d66ab3"],["#b49cff","#7f69ee"],["#ffd56a","#f0a93e"],["#7fd4ff","#3d8fe0"]];
          let h = 0;
          for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h + seed.charCodeAt(i)) | 0; }
          const pal = palettes[Math.abs(h) % palettes.length];
          const raw = displayName.trim().split(/\s+/);
          let ltr = raw.length >= 2 ? (raw[0][0] || "") + (raw[1][0] || "") : displayName.slice(0, 2);
          ltr = ltr.toUpperCase();
          const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + pal[0] + '"/><stop offset="100%" stop-color="' + pal[1] + '"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#pg)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Roboto,sans-serif" font-size="56" font-weight="700">' + escapeHtml(ltr) + '</text></svg>';
          sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '" alt="' + escapeHtml(ltr) + '" />';
          sidebarProfileAvatarEl.style.cssText = "--avatar-start:" + pal[0] + ";--avatar-end:" + pal[1] + ";";
        }
      }
    }
    gsapOpenSidebar(sidebarProfilePanel);
  };

  sidebarMenuProfile?.addEventListener("click", () => {
    setSidebarMenuOpen(false);
    openSidebarProfilePanel();
  });
  sidebarProfileBack?.addEventListener("click", () => {
    const sidebarProfilePanel = document.getElementById("sidebar-profile-panel");
    gsapCloseSidebar(sidebarProfilePanel);
  });

  const sidebarProfilePanel = document.getElementById("sidebar-profile-panel");
  if (sidebarProfilePanel) {
    sidebarProfilePanel.addEventListener("click", (e) => {
      if (e.target === sidebarProfilePanel) {
        gsapCloseSidebar(sidebarProfilePanel);
      }
    });
    sidebarProfilePanel.addEventListener("wheel", (e) => {
      e.stopPropagation();
    });
  }

  const avatarEl = document.getElementById("sidebar-profile-avatar");
  avatarEl?.addEventListener("click", () => {
    const avatarImg = avatarEl.querySelector("img") as HTMLImageElement | null;
    const avatarUrl = avatarImg ? avatarImg.src : "";
    if (avatarUrl) {
      const displayName = getWin().currentUserDisplayName || "User";
      const userId = getWin().currentUserId;
      const formattedDate = new Date().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      (window as any).openViewerModal?.({
        src: avatarUrl,
        senderName: displayName,
        senderId: userId,
        createdAt: formattedDate,
        realAvatarUrl: String(getWin().currentUserAvatarUrl || "").trim()
      });
    }
  });

  const plusBtn = document.getElementById("sidebar-profile-avatar-plus");
  const uploadMenu = document.getElementById("avatar-upload-menu");
  const fileInput = document.getElementById("avatar-file-input") as HTMLInputElement | null;
  const fileBtn = document.getElementById("avatar-upload-file-btn");
  const clipboardBtn = document.getElementById("avatar-upload-clipboard-btn");

  plusBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    uploadMenu?.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (uploadMenu?.classList.contains("open") && !plusBtn?.contains(e.target as Node) && !uploadMenu.contains(e.target as Node)) {
      uploadMenu.classList.remove("open");
    }
  });

  const uploadUserAvatar = async (base64Data: string) => {
    const apiBase = getWin().apiBase || "/api";
    try {
      const res = await fetch(apiBase + "/v1/users/avatar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ avatarDataUrl: base64Data })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to upload avatar");
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to upload avatar");
    }
  };

  fileBtn?.addEventListener("click", () => {
    uploadMenu?.classList.remove("open");
    fileInput?.click();
  });

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      await uploadUserAvatar(base64Data);
    };
    reader.readAsDataURL(file);
    fileInput.value = "";
  });

  clipboardBtn?.addEventListener("click", async () => {
    uploadMenu?.classList.remove("open");
    try {
      const clipboardItems = await navigator.clipboard.read();
      let imageBlob = null;
      for (const item of clipboardItems) {
        const imageTypes = item.types.filter(t => t.startsWith("image/"));
        if (imageTypes.length > 0) {
          imageBlob = await item.getType(imageTypes[0]);
          break;
        }
      }
      if (imageBlob) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          await uploadUserAvatar(base64Data);
        };
        reader.readAsDataURL(imageBlob);
      } else {
        alert("No image found in clipboard!");
      }
    } catch (err) {
      console.error("Clipboard access failed:", err);
      alert("No image found in clipboard!");
    }
  });
  sidebarMenuSaved?.addEventListener("click", () => {
    const allDialogs = getWin().allDialogs || [];
    const savedDialog = allDialogs.find((dialog: any) => dialog.type === "saved");
    setSidebarMenuOpen(false);
    const targetPublicId = savedDialog?.publicId || "-1002003143";
    void loadDialog(targetPublicId, { scrollBehavior: "auto" });
  });

  sidebarMenuLogout?.addEventListener("click", () => {
    if (!logoutButton || logoutButton.disabled) {
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
    setSidebarMenuOpen(false);
    logoutButton.click();
  });

  // Sidebar resize
  const syncSidebarWidth = () => {
    let storedWidth = DEFAULT_SIDEBAR_WIDTH;
    try {
      storedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY) || DEFAULT_SIDEBAR_WIDTH);
    } catch {}
    const nextWidth = clampSidebarWidth(Number.isFinite(storedWidth) ? storedWidth : DEFAULT_SIDEBAR_WIDTH);
    const workspaceShell = document.querySelector(".workspace-shell") as HTMLElement;
    workspaceShell?.style.setProperty("--sidebar-width", nextWidth + "px");
  };

  const SIDEBAR_WIDTH_STORAGE_KEY = "thegrapht_sidebar_width";
  const DEFAULT_SIDEBAR_WIDTH = 360;
  const MIN_SIDEBAR_WIDTH = 320;
  const clampSidebarWidth = (val: number) => {
    const viewportWidth = window.innerWidth || 0;
    const maxWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(920, Math.floor(viewportWidth * 0.68)));
    return Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxWidth, Math.round(val)));
  };

  syncSidebarWidth();

  sidebarResizeHandle?.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (window.innerWidth <= 900) {
      return;
    }
    if (typeof sidebarResizeHandle.setPointerCapture === "function") {
      try {
        sidebarResizeHandle.setPointerCapture(event.pointerId);
      } catch {}
    }
    const currentWidth = workspaceSidebar ? workspaceSidebar.getBoundingClientRect().width : 360;
    getWin().sidebarResizeState = {
      startX: event.clientX,
      startWidth: currentWidth
    };
    const workspaceShell = document.querySelector(".workspace-shell") as HTMLElement;
    workspaceShell?.classList.add("sidebar-resizing");
  });

  sidebarResizeHandle?.addEventListener("dblclick", () => {
    const workspaceShell = document.querySelector(".workspace-shell") as HTMLElement;
    workspaceShell?.style.setProperty("--sidebar-width", DEFAULT_SIDEBAR_WIDTH + "px");
    try {
      window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(DEFAULT_SIDEBAR_WIDTH));
    } catch {}
  });

  window.addEventListener("pointermove", (event) => {
    const state = getWin().sidebarResizeState;
    if (!state) {
      return;
    }
    const nextWidth = state.startWidth + (event.clientX - state.startX);
    const workspaceShell = document.querySelector(".workspace-shell") as HTMLElement;
    const finalWidth = clampSidebarWidth(nextWidth);
    workspaceShell?.style.setProperty("--sidebar-width", finalWidth + "px");
    try {
      window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(finalWidth));
    } catch {}
  });

  const stopSidebarResize = (event?: PointerEvent) => {
    if (!getWin().sidebarResizeState) {
      return;
    }
    if (event && sidebarResizeHandle && typeof sidebarResizeHandle.releasePointerCapture === "function") {
      try {
        if (sidebarResizeHandle.hasPointerCapture?.(event.pointerId)) {
          sidebarResizeHandle.releasePointerCapture(event.pointerId);
        }
      } catch {}
    }
    getWin().sidebarResizeState = null;
    const workspaceShell = document.querySelector(".workspace-shell") as HTMLElement;
    workspaceShell?.classList.remove("sidebar-resizing");
  };

  window.addEventListener("pointerup", stopSidebarResize);
  window.addEventListener("pointercancel", stopSidebarResize);
  window.addEventListener("resize", () => {
    syncSidebarWidth();
  });

  composerInput?.addEventListener("input", () => {
    const syncComposerState = getWin().syncComposerState;
    if (typeof syncComposerState === "function") syncComposerState();

    if (!getWin().currentDialogId || !getWin().realtimeEnabled) {
      return;
    }

    if (!composerInput.value.trim()) {
      sendTypingState(false);
      return;
    }

    sendTypingState(true);
    const scheduleTypingStop = getWin().scheduleTypingStop;
    if (typeof scheduleTypingStop === "function") scheduleTypingStop();
  });

  const renderComposerOverlay = getWin().renderComposerOverlay;
  if (typeof renderComposerOverlay === "function" && composerInput) {
    ["select", "keyup", "mouseup", "focus", "blur"].forEach((eventName) => {
      composerInput.addEventListener(eventName, () => {
        renderComposerOverlay();
      });
    });
  }

  const sendCurrentMessage = async () => {
    if (getWin().textMessageSendInFlight) {
      return;
    }

    const body = composerInput?.value.trim();

    if (!body || !getWin().currentDialogPublicId) {
      return;
    }

    const isGifUrl = (body.startsWith("http://") || body.startsWith("https://")) &&
                     (body.split("?")[0].split("#")[0].toLowerCase().endsWith(".gif"));
    if (isGifUrl) {
      rememberRecentGif(body);
    }

    getWin().textMessageSendInFlight = true;
    if (composerSend) composerSend.disabled = true;
    const pendingReplyMessage = getWin().pendingReplyMessage;
    const replyContext = pendingReplyMessage
      ? {
          id: pendingReplyMessage.id || null,
          senderId: pendingReplyMessage.senderId || null,
          senderName: pendingReplyMessage.senderName || null,
          body: pendingReplyMessage.body || null,
          type: pendingReplyMessage.type || null,
          mediaUrl: pendingReplyMessage.mediaUrl || null
        }
      : null;
    const localMessageId = "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);
    getWin().localOutgoingMessages.push({
      id: localMessageId,
      dialogPublicId: getWin().currentDialogPublicId,
      senderId: getWin().currentUserId,
      senderName: getWin().currentUserDisplayName || getWin().currentUserUsername || workspaceUserName?.textContent || "You",
      body,
      type: "text",
      mediaUrl: null,
      attachmentMime: null,
      replyToMessageId: replyContext?.id || null,
      replyToSenderId: replyContext?.senderId || null,
      replyToSenderName: replyContext?.senderName || null,
      replyToBody: replyContext?.body || null,
      replyToType: replyContext?.type || null,
      replyToMediaUrl: replyContext?.mediaUrl || null,
      createdAt: new Date().toISOString(),
      localStatus: "pending",
      animateOnRender: true
    });
    clearPendingReplyMessage();
    if (composerInput) {
      composerInput.value = "";
      composerInput.style.height = "48px";
      composerInput.style.overflowY = "hidden";
    }
    const syncComposerState = getWin().syncComposerState;
    if (typeof syncComposerState === "function") syncComposerState();
    composerInput?.focus({ preventScroll: true });
    if (getWin().typingStopTimer) {
      window.clearTimeout(getWin().typingStopTimer);
      getWin().typingStopTimer = null;
    }
    sendTypingState(false);
    const appendedLocal = appendLocalOutgoingMessageToCurrentDialog(getWin().localOutgoingMessages[getWin().localOutgoingMessages.length - 1], {
      scrollBehavior: "smooth",
      forceScrollBottom: true
    });
    if (!appendedLocal) {
      rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
    }
    playSound("send");

    try {
      const apiBase = getWin().apiBase || "/api";
      const payload = isSecureDialog(getWin().currentDialogSnapshot)
        ? await (async () => {
            const encrypted = await encryptSecureMessageBody(getWin().currentDialogSnapshot, body);
            return fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(getWin().currentDialogPublicId) + "/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                ciphertext: encrypted.ciphertext,
                nonce: encrypted.nonce,
                senderKeyId: encrypted.senderKeyId || undefined,
                replyToMessageId: replyContext?.id || undefined
              }),
              signal: controller.signal
            });
          })()
        : await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(getWin().currentDialogPublicId) + "/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              body,
              replyToMessageId: replyContext?.id || undefined
            }),
            signal: controller.signal
          });
      const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.message ? [payload.message] : []);
      const preparedMessage = preparedPayload.messages[0] || payload.message;

      // Inline removeLocalOutgoingMessage
      getWin().localOutgoingMessages = getWin().localOutgoingMessages.filter((m: any) => m.id !== localMessageId);
      
      updateDialogInState(preparedPayload.dialog, {
        lastMessagePreview: getMessagePreviewText(preparedMessage) || body,
        lastMessageSenderName: preparedMessage.senderId === getWin().currentUserId
          ? "You"
          : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
        lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
      });
      if (preparedPayload.dialog?.id === getWin().currentDialogId && preparedMessage) {
        appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
          scrollBehavior: "smooth",
          replaceMessageId: localMessageId,
          animateMessage: false
        });
      } else {
        rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
      }

      if (!currentSearchQuery.trim()) {
        renderDialogs(getWin().allDialogs);
      }
    } catch (error: any) {
      getWin().localOutgoingMessages = getWin().localOutgoingMessages.map((message: any) => (
        message.id === localMessageId
          ? { ...message, localStatus: "failed" }
          : message
      ));
      setStatus(error instanceof Error ? error.message : "Failed to send message.", "error");
      showToast(error instanceof Error ? error.message : "Failed to send message.", "error");
      const updateRenderedMessageStatus = getWin().updateRenderedMessageStatus;
      if (typeof updateRenderedMessageStatus === "function") {
        updateRenderedMessageStatus(localMessageId, "failed");
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (composerSend) composerSend.disabled = false;
      getWin().textMessageSendInFlight = false;
    }
  };

  composerSend?.addEventListener("click", () => {
    void sendCurrentMessage();
  });

  composerEmojiButton?.addEventListener("mouseenter", () => {
    openEmojiPicker();
  });

  composerEmojiButton?.addEventListener("mouseleave", () => {
    scheduleEmojiPickerClose();
  });

  composerEmojiButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (emojiPicker?.classList.contains("open")) {
      closeEmojiPicker();
    } else {
      openEmojiPicker();
    }
  });

  const renderAttachmentEmojiPicker = () => {
    if (!attachmentModalEmojiPickerHead || !attachmentModalEmojiPickerBody) {
      return;
    }
    const emojiTabIcons = {
      recent: "⏱️",
      people: "😃",
      nature: "🐼",
      food: "🍔",
      activity: "⚽",
      travel: "🚗",
      objects: "💡",
      symbols: "🔣",
      flags: "🏁"
    };
    const recentSection = {
      ...emojiSections[0],
      emojis: readRecentEmojis()
    };
    const sections = [recentSection].concat(emojiSections.slice(1));

    attachmentModalEmojiPickerHead.innerHTML = sections.map((section, index) => {
      const emojiChar = emojiTabIcons[section.key as keyof typeof emojiTabIcons] || "";
      const emojiAssetUrl = getEmojiAssetUrl(emojiChar);
      const iconHtml = emojiAssetUrl
        ? '<img class="emoji-picker-tab-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emojiChar) + '" aria-hidden="true" loading="lazy" decoding="async">'
        : '<span class="emoji-picker-tab-fallback">' + escapeHtml(emojiChar) + '</span>';

      return '<button class="emoji-picker-tab' + (index === 0 ? ' active' : '') + '" type="button" data-emoji-tab="' + section.key + '" aria-label="' + escapeHtml(section.title) + '">' +
        iconHtml +
      '</button>';
    }).join("");

    attachmentModalEmojiPickerBody.innerHTML = sections.map((section) => (
      '<section class="emoji-picker-section" data-emoji-section="' + section.key + '">' +
        '<p class="emoji-picker-title">' + escapeHtml(section.title) + '</p>' +
        (
          section.emojis.length
            ? '<div class="emoji-picker-grid">' + section.emojis.map((emoji) => (
              (() => {
                const emojiAssetUrl = getEmojiAssetUrl(emoji);
                return (
              '<button class="emoji-button" type="button" data-emoji-value="' + escapeHtml(emoji) + '" aria-label="' + escapeHtml(emoji) + '">' +
                (
                  emojiAssetUrl
                    ? '<img class="emoji-button-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emoji) + '" aria-hidden="true" loading="lazy" decoding="async">'
                    : '<span class="emoji-button-image" aria-hidden="true">' + escapeHtml(emoji) + '</span>'
                ) +
              '</button>'
                );
              })()
            )).join("") + '</div>'
            : '<div class="emoji-picker-title">Nothing here yet</div>'
        ) +
      '</section>'
    )).join("");

    attachmentModalEmojiPickerHead.querySelectorAll("[data-emoji-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.getAttribute("data-emoji-tab");
        if (!key) {
          return;
        }
        attachmentModalEmojiPickerHead.querySelectorAll("[data-emoji-tab]").forEach((node) => node.classList.toggle("active", node === button));
        const targetSection = attachmentModalEmojiPickerBody.querySelector('[data-emoji-section="' + key + '"]');
        if (targetSection) {
          const targetScrollTop = targetSection.getBoundingClientRect().top - attachmentModalEmojiPickerBody.getBoundingClientRect().top + attachmentModalEmojiPickerBody.scrollTop;
          attachmentModalEmojiPickerBody.scrollTo({
            top: targetScrollTop,
            behavior: "smooth"
          });
        }
      });
    });

    attachmentModalEmojiPickerBody.querySelectorAll("[data-emoji-value]").forEach((button) => {
      button.addEventListener("click", () => {
        const emoji = button.getAttribute("data-emoji-value");
        if (!emoji || !attachmentModalCaption) {
          return;
        }

        const selectionStart = attachmentModalCaption.selectionStart ?? attachmentModalCaption.value.length;
        const selectionEnd = attachmentModalCaption.selectionEnd ?? attachmentModalCaption.value.length;
        attachmentModalCaption.value = attachmentModalCaption.value.slice(0, selectionStart) + emoji + attachmentModalCaption.value.slice(selectionEnd);
        getWin().pendingImageCaption = attachmentModalCaption.value;
        attachmentModalCaption.focus();
        attachmentModalCaption.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
        rememberRecentEmoji(emoji);
        renderAttachmentEmojiPicker();
      });
    });
  };

  const closeAttachmentEmojiPicker = () => {
    attachmentModalEmojiPicker?.classList.remove("open");
    attachmentModalEmojiPicker?.setAttribute("aria-hidden", "true");
  };

  const openAttachmentEmojiPicker = () => {
    renderAttachmentEmojiPicker();
    attachmentModalEmojiPicker?.classList.add("open");
    attachmentModalEmojiPicker?.setAttribute("aria-hidden", "false");
  };

  attachmentModalEmojiButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (attachmentModalEmojiPicker?.classList.contains("open")) {
      closeAttachmentEmojiPicker();
    } else {
      openAttachmentEmojiPicker();
    }
  });

  emojiPicker?.addEventListener("mouseenter", () => {
    openEmojiPicker();
  });

  emojiPicker?.addEventListener("mouseleave", () => {
    scheduleEmojiPickerClose();
  });

  const renderEmojiPicker = getWin().renderEmojiPicker;
  const renderGifPicker = getWin().renderGifPicker;
  const setPickerMode = (modeVal: string) => {
    if (modeVal === "gif" && emojiModeTabGif && (emojiModeTabGif.classList.contains("disabled") || emojiModeTabGif.hasAttribute("disabled"))) {
      modeVal = "emoji";
    }
    pickerMode = modeVal;
    if (emojiPicker) emojiPicker.className = "emoji-picker-container " + modeVal;
    if (emojiModeTabEmoji) emojiModeTabEmoji.classList.toggle("active", modeVal === "emoji");
    if (emojiModeTabGif) emojiModeTabGif.classList.toggle("active", modeVal === "gif");
    if (emojiPickerSlideTrack) {
      emojiPickerSlideTrack.style.transform = modeVal === "gif" ? "translateX(-50%)" : "translateX(0)";
    }
    if (emojiPickerSearch) {
      emojiPickerSearch.placeholder = modeVal === "emoji" ? "Search emojis..." : "Search GIFs...";
    }
  };

  if (emojiPickerSearch) {
    emojiPickerSearch.addEventListener("input", () => {
      if (pickerMode === "emoji") {
        if (typeof renderEmojiPicker === "function") renderEmojiPicker();
      } else {
        if (typeof renderGifPicker === "function") renderGifPicker();
      }
    });
  }

  if (emojiModeTabEmoji) {
    emojiModeTabEmoji.addEventListener("click", (e) => {
      e.preventDefault();
      setPickerMode("emoji");
    });
  }

  if (emojiModeTabGif) {
    emojiModeTabGif.addEventListener("click", (e) => {
      e.preventDefault();
      setPickerMode("gif");
    });
  }

  // Touch-swipe support on emoji picker slide container
  const emojiPickerSlideContainer = emojiPicker?.querySelector(".emoji-picker-slide-container") as HTMLElement;
  if (emojiPickerSlideContainer && emojiPickerSlideTrack) {
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    emojiPickerSlideContainer.addEventListener("pointerdown", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("input") || target.closest("textarea")) {
        return;
      }
      startX = e.clientX;
      startY = e.clientY;
      isSwiping = true;
      emojiPickerSlideTrack.classList.add("no-transition");
    });

    document.addEventListener("pointermove", (e) => {
      if (!isSwiping) return;
      const diffX = e.clientX - startX;
      const diffY = e.clientY - startY;

      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
        isSwiping = false;
        emojiPickerSlideTrack.classList.remove("no-transition");
        emojiPickerSlideTrack.style.transform = pickerMode === "gif" ? "translateX(-50%)" : "translateX(0)";
        return;
      }

      const pickerWidth = emojiPickerSlideContainer.offsetWidth;
      const basePercent = pickerMode === "gif" ? -50 : 0;
      const changePercent = (diffX / (pickerWidth * 2)) * 100;
      let newPercent = basePercent + changePercent;
      
      newPercent = Math.max(-55, Math.min(5, newPercent));
      
      emojiPickerSlideTrack.style.transform = "translateX(" + newPercent + "%)";
    });

    const endSwipe = (e: PointerEvent) => {
      if (!isSwiping) return;
      isSwiping = false;
      emojiPickerSlideTrack.classList.remove("no-transition");

      const diffX = e.clientX - startX;
      const pickerWidth = emojiPickerSlideContainer.offsetWidth;
      const threshold = pickerWidth * 0.2;

      if (diffX < -threshold && pickerMode === "emoji") {
        setPickerMode("gif");
      } else if (diffX > threshold && pickerMode === "gif") {
        setPickerMode("emoji");
      } else {
        emojiPickerSlideTrack.style.transform = pickerMode === "gif" ? "translateX(-50%)" : "translateX(0)";
      }
    };

    document.addEventListener("pointerup", endSwipe);
    document.addEventListener("pointercancel", endSwipe);
  }

  document.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }
    if (!target.closest("#emoji-picker") && !target.closest("#composer-emoji-button")) {
      closeEmojiPicker();
    }
    if (!target.closest("#attachment-modal-emoji-picker") && !target.closest("#attachment-modal-emoji-button")) {
      closeAttachmentEmojiPicker();
    }
    if (!target.closest("#attach-menu") && !target.closest("#composer-attach-button")) {
      closeAttachMenu();
    }
  });

  composerAttachButton?.addEventListener("mouseenter", () => {
    openAttachMenu();
  });

  composerAttachButton?.addEventListener("mouseleave", () => {
    scheduleAttachMenuClose();
  });

  attachMenu?.addEventListener("mouseenter", () => {
    openAttachMenu();
  });

  attachMenu?.addEventListener("mouseleave", () => {
    scheduleAttachMenuClose();
  });

  composerAttachButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (attachMenu?.classList.contains("open")) {
      closeAttachMenu();
    } else {
      openAttachMenu();
    }
  });

  attachMenu?.querySelectorAll(".attach-menu-item").forEach((button) => {
    button.addEventListener("click", () => {
      const btn = button as HTMLElement;
      if (btn.classList.contains("disabled")) {
        return;
      }

      btn.classList.add("pressed");
      window.setTimeout(() => {
        btn.classList.remove("pressed");
      }, 120);

      if (btn.dataset.attachAction === "media") {
        closeAttachMenu();
        if ((getWin().pendingImageAttachments || []).length || (getWin().pendingFileAttachments || []).length) {
          clearPendingImageAttachment();
        }
        composerFileInput?.setAttribute("accept", "image/png,image/jpeg,image/webp,image/gif");
        if (composerFileInput) {
          composerFileInput.dataset.attachMode = "media";
          composerFileInput.multiple = true;
          composerFileInput.click();
        }
        return;
      }

      if (btn.dataset.attachAction === "file") {
        closeAttachMenu();
        if ((getWin().pendingImageAttachments || []).length || (getWin().pendingFileAttachments || []).length) {
          clearPendingImageAttachment();
        }
        composerFileInput?.setAttribute("accept", "audio/*");
        if (composerFileInput) {
          composerFileInput.dataset.attachMode = "file";
          composerFileInput.multiple = true;
          composerFileInput.click();
        }
      }
    });
  });

  composerFileInput?.addEventListener("change", () => {
    const files = Array.from(composerFileInput.files || []);
    const attachMode = composerFileInput.dataset.attachMode || "media";
    composerFileInput.value = "";
    if (files.length && attachMode === "media") {
      void addPendingImageAttachments(files);
      return;
    }
    if (files.length && attachMode === "file") {
      void addPendingFileAttachments(files);
    }
  });

  composerAttachmentRemove?.addEventListener("click", () => {
    clearPendingImageAttachment();
  });

  attachmentModalClose?.addEventListener("click", () => {
    closeAttachmentModal();
  });

  attachmentModalPrev?.addEventListener("click", () => {
    moveAttachmentModal(-1);
  });

  attachmentModalNext?.addEventListener("click", () => {
    moveAttachmentModal(1);
  });

  attachmentModal?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }
    if (
      !target.closest(".attachment-modal-content")
      && !target.closest(".attachment-modal-main")
      && !target.closest(".attachment-modal-footer")
      && !target.closest(".attachment-modal-header")
      && !target.closest(".attachment-modal-nav")
      && !target.closest(".attachment-modal-strip")
    ) {
      closeAttachmentModal();
    }
  });

  attachmentModalCaption?.addEventListener("input", () => {
    getWin().pendingImageCaption = attachmentModalCaption.value;
  });

  attachmentModalCaption?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      attachmentModalSend?.click();
    }
  });

  attachmentModalSend?.addEventListener("click", () => {
    void (async () => {
      if (getWin().mediaMessageSendInFlight) {
        return;
      }

      const attachmentModalMode = getWin().attachmentModalMode || "image";

      if (attachmentModalMode === "file") {
        const fileAttachments = getWin().pendingFileAttachments || [];
        if (!fileAttachments.length) {
          return;
        }
        getWin().mediaMessageMessageSendInFlight = true;
        if (attachmentModalSend) attachmentModalSend.disabled = true;
        if (attachmentModalCaption) attachmentModalCaption.disabled = true;
        const attachmentsToSend = fileAttachments.slice();
        const previewUrlsToPreserve = attachmentsToSend.map((attachment: any) => attachment.previewUrl);
        const caption = attachmentModalCaption?.value.trim() || "";
        clearPendingImageAttachment({ preservePreviewUrls: previewUrlsToPreserve });
        try {
          await uploadAudioBatch({
            attachments: attachmentsToSend,
            caption
          });
        } catch (error: any) {
          setStatus(error instanceof Error ? error.message : "Failed to send audio.", "error");
          showToast(error instanceof Error ? error.message : "Failed to send audio.", "error");
        } finally {
          if (attachmentModalSend) attachmentModalSend.disabled = false;
          if (attachmentModalCaption) attachmentModalCaption.disabled = false;
          getWin().mediaMessageSendInFlight = false;
        }
        return;
      }
      const imageAttachments = getWin().pendingImageAttachments || [];
      if (!imageAttachments.length) {
        return;
      }

      getWin().mediaMessageSendInFlight = true;
      if (attachmentModalSend) attachmentModalSend.disabled = true;
      if (attachmentModalCaption) attachmentModalCaption.disabled = true;

      const attachmentsToSend = imageAttachments.slice();
      const previewUrlsToPreserve = attachmentsToSend.map((attachment: any) => attachment.previewUrl);
      const caption = attachmentModalCaption?.value.trim() || "";
      clearPendingImageAttachment({ preservePreviewUrls: previewUrlsToPreserve });

      try {
        await uploadImageBatch({
          attachments: attachmentsToSend,
          caption
        });
      } catch (error: any) {
        setStatus(error instanceof Error ? error.message : "Failed to send photos.", "error");
        showToast(error instanceof Error ? error.message : "Failed to send photos.", "error");
      } finally {
        if (attachmentModalSend) attachmentModalSend.disabled = false;
        if (attachmentModalCaption) attachmentModalCaption.disabled = false;
        getWin().mediaMessageSendInFlight = false;
      }
    })();
  });

  composerInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendCurrentMessage();
    }
  });

  composerInput?.addEventListener("paste", (event) => {
    const imageItems = Array.from(event.clipboardData?.items || []).filter((item) => item.type.startsWith("image/"));
    if (!imageItems.length) {
      return;
    }
    event.preventDefault();
    void addPendingImageAttachments(
      imageItems
        .map((item) => item.getAsFile())
        .filter(Boolean) as File[]
    );
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    chatStage?.addEventListener(eventName, (event: any) => {
      const hasImages = Array.from(event.dataTransfer?.items || []).some((item: any) => item.type.startsWith("image/"));
      if (!hasImages) {
        return;
      }
      event.preventDefault();
      chatStage.classList.add("drag-active");
    });
  });

  ["dragleave", "dragend", "drop"].forEach((eventName) => {
    chatStage?.addEventListener(eventName, () => {
      chatStage.classList.remove("drag-active");
    });
  });

  chatStage?.addEventListener("drop", (event: any) => {
    const files = Array.from(event.dataTransfer?.files || []).filter((file: any) => String(file.type || "").startsWith("image/"));
    if (!files.length) {
      return;
    }
    event.preventDefault();
    void addPendingImageAttachments(files);
  });

  // AI Panel Context
  const gatherChatContext = () => {
    const messageListEl = document.getElementById("message-list");
    if (!messageListEl) return "";
    
    const messageEls = messageListEl.querySelectorAll(".message, .group-incoming-row, .message-system-row");
    const lines = [];
    const maxMessages = 40;
    const start = Math.max(0, messageEls.length - maxMessages);
    
    const peerName = getWin().currentDialogSnapshot ? (getWin().currentDialogSnapshot.title || "Собеседник") : "Собеседник";
    const myName = workspaceUserName ? (workspaceUserName.textContent || "Я") : "Я";
    
    for (let i = start; i < messageEls.length; i++) {
      const el = messageEls[i];
      
      if (el.classList.contains("message-system-row")) {
        const pill = el.querySelector(".message-system-pill");
        if (pill) {
          lines.push("[Системное сообщение]: " + pill.textContent?.trim());
        }
        continue;
      }
      
      let isIncoming = el.classList.contains("incoming");
      if (el.classList.contains("group-incoming-row")) {
        isIncoming = true;
      }
      
      const bubble = el.classList.contains("message") ? el : el.querySelector(".message");
      if (!bubble) continue;
      
      let sender = "";
      if (isIncoming) {
        const groupSender = el.querySelector(".group-incoming-sender");
        sender = groupSender ? groupSender.textContent?.trim() || peerName : peerName;
      } else {
        sender = myName + " (Вы)";
      }
      
      const body = bubble.querySelector(".message-body, .message-text");
      let text = body ? body.textContent?.trim() || "" : "";
      
      if (!text) {
        const msgType = bubble.getAttribute("data-message-type");
        const attName = bubble.getAttribute("data-attachment-name");
        if (msgType === "image") {
          text = "[Изображение/Фото: " + (attName || "Без названия") + "]";
        } else if (msgType === "audio") {
          text = "[Голосовое сообщение/Аудио: " + (attName || "Без названия") + "]";
        }
      }
      
      if (text) {
        lines.push(sender + ": " + text);
      }
    }
    
    const activeChatMeta = "=== ИНФОРМАЦИЯ ОБ ОТКРЫТОМ ЧАТЕ ===\n" +
      "Название чата: " + peerName + "\n" +
      "Тип чата: " + (getWin().currentDialogSnapshot ? (getWin().currentDialogSnapshot.type || "Личный чат") : "Личный чат") + "\n" +
      "Текущий пользователь: " + myName + "\n" +
      "=================================\n\n" +
      lines.join("\n");
    return activeChatMeta;
  };

  const getPillsForContext = (isInitial: boolean, replyText = "") => {
    const contextText = gatherChatContext();
    const isRussian = /[а-яА-ЯёЁ]/.test(contextText) || /[а-яА-ЯёЁ]/.test(replyText) || (navigator.language && navigator.language.toLowerCase().startsWith("ru"));
    const peerName = getWin().currentDialogSnapshot ? (getWin().currentDialogSnapshot.title || (isRussian ? "собеседник" : "partner")) : (isRussian ? "собеседник" : "partner");

    const lowerContext = (contextText + " " + replyText).toLowerCase();
    
    const hasCode = lowerContext.includes("code") || lowerContext.includes("function") || lowerContext.includes("код") || lowerContext.includes("функция") || lowerContext.includes("ошибка") || lowerContext.includes("баг") || lowerContext.includes("js") || lowerContext.includes("html") || lowerContext.includes("css");
    const hasVideo = lowerContext.includes("video") || lowerContext.includes("media") || lowerContext.includes("видео") || lowerContext.includes("медиа") || lowerContext.includes("монтаж") || lowerContext.includes("клип") || lowerContext.includes("звук") || lowerContext.includes("аудио") || lowerContext.includes("youtube");
    const hasTasks = lowerContext.includes("plan") || lowerContext.includes("task") || lowerContext.includes("checklist") || lowerContext.includes("план") || lowerContext.includes("задач") || lowerContext.includes("цель") || lowerContext.includes("сделать") || lowerContext.includes("todo") || lowerContext.includes("проект");
    const hasChat = lowerContext.includes("summary") || lowerContext.includes("chat") || lowerContext.includes("conversation") || lowerContext.includes("выжимка") || lowerContext.includes("чат") || lowerContext.includes("переписка") || lowerContext.includes("сообщение") || lowerContext.includes("диалог");

    const ruPools = {
      initial: {
        general: [
          { label: "💬 Сделай выжимку чата", prompt: "Сделай краткую выжимку этого чата" },
          { label: "✍️ Помоги ответить", prompt: "Помоги мне написать вежливый ответ на последние сообщения" },
          { label: "🔍 Проанализируй чат", prompt: "Что мне нужно знать об этой переписке?" },
          { label: "🌐 Переведи на английский", prompt: "Переведи последние сообщения на английский язык" },
          { label: "💡 Предложи идею", prompt: "Дай мне интересную или креативную идею на сегодня" },
          { label: "📅 Составь план дня", prompt: "Помоги мне составить эффективный план на день" },
          { label: "❓ Что ты умеешь?", prompt: "Расскажи, чем ты можешь мне помочь в этом чате?" }
        ],
        chat: [
          { label: "📊 Кто активнее в чате?", prompt: "Кто самый активный участник в этой переписке?" },
          { label: "📌 Главные темы беседы", prompt: "Какие ключевые темы обсуждались в этом чате?" },
          { label: "🤝 О чем договорились?", prompt: "Сделай список договоренностей и решений из этого чата" },
          { label: "🎭 Какой тон беседы?", prompt: "Какая атмосфера и тон общения в этом чате?" }
        ],
        code: [
          { label: "💻 Объясни этот код", prompt: "Объясни, как работает этот программный код в переписке" },
          { label: "⚡ Оптимизируй код", prompt: "Как можно сделать этот код более быстрым и понятным?" },
          { label: "🐞 Найди баги", prompt: "Проверь код в этом чате на наличие ошибок или уязвимостей" }
        ],
        video: [
          { label: "🎬 Сценарий для видео", prompt: "Предложи креативный сценарий для короткого видео" },
          { label: "✂️ Как быстро монтировать?", prompt: "Дай советы по быстрому и качественному монтажу видео" },
          { label: "🎙️ Как улучшить звук?", prompt: "Как записать чистый и качественный звук для ролика?" }
        ],
        tasks: [
          { label: "📝 Чеклист задач", prompt: "Составь структурированный список задач на основе чата" },
          { label: "🚀 Какие наши шаги?", prompt: "Каковы наши следующие шаги по обсуждаемому проекту?" },
          { label: "🎯 Расставь приоритеты", prompt: "Помоги мне расставить приоритеты для этих задач" }
        ]
      },
      followUp: {
        general: [
          { label: "Продолжай", prompt: "Продолжай развивать эту мысль дальше" },
          { label: "Объясни подробнее", prompt: "Можешь объяснить этот момент подробнее?" },
          { label: "Дай мне пример", prompt: "Приведи практический пример для этого" },
          { label: "Можно попроще?", prompt: "Объясни это простыми словами для новичка" },
          { label: "Какие альтернативы?", prompt: "Какие еще есть варианты или альтернативные подходы?" },
          { label: "Дай практический совет", prompt: "Дай мне один конкретный совет, который я могу применить прямо сейчас" }
        ],
        chat: [
          { label: "Сделай выжимку подробнее", prompt: "Сделай более детальную выжимку этой беседы" },
          { label: "Как вежливо ответить " + peerName + "?", prompt: "Напиши несколько вариантов вежливого ответа для " + peerName },
          { label: "Как отказать " + peerName + "?", prompt: "Напиши вежливый и мягкий отказ для " + peerName },
          { label: "Выдели самое важное", prompt: "Покажи только самые критически важные тезисы из этого" }
        ],
        code: [
          { label: "Напиши тест-кейс", prompt: "Напиши модульный тест (unit test) для этой функции" },
          { label: "Сделай рефакторинг", prompt: "Предложи красивый рефакторинг этого решения" },
          { label: "Добавь комментарии", prompt: "Добавь понятные JSDoc комментарии к коду" }
        ],
        video: [
          { label: "Напиши детальный план", prompt: "Напиши подробную раскадровку для этого видео-сценария" },
          { label: "Какие инструменты нужны?", prompt: "Какой софт лучше использовать для реализации этого?" },
          { label: "Как продвигать ролик?", prompt: "Дай советы по продвижению этого видео на YouTube или TikTok" }
        ],
        tasks: [
          { label: "Преврати в чеклист", prompt: "Оформи эти пункты в виде красивого чеклиста задач" },
          { label: "С чего начать?", prompt: "Какой самый первый шаг мне нужно сделать прямо сейчас?" },
          { label: "Оцени риски", prompt: "Какие основные сложности или риски могут возникнуть при реализации?" }
        ]
      }
    };

    const enPools = {
      initial: {
        general: [
          { label: "💬 Summarize chat", prompt: "Summarize this chat for me concisely" },
          { label: "✍️ Help me reply", prompt: "Help me write a polite reply to the last messages" },
          { label: "🔍 Analyze chat", prompt: "What should I know about this conversation?" },
          { label: "🌐 Translate to English", prompt: "Translate the last messages in this chat to English" },
          { label: "💡 Give me an idea", prompt: "Give me an interesting or creative idea for today" },
          { label: "📅 Plan my day", prompt: "Help me create an efficient schedule for my day" },
          { label: "❓ What can you do?", prompt: "Explain what features you have and how you can help me here" }
        ],
        chat: [
          { label: "📊 Who is most active?", prompt: "Who is the most active participant in this chat?" },
          { label: "📌 Main discussion topics", prompt: "What are the primary topics discussed in this conversation?" },
          { label: "🤝 What was agreed?", prompt: "Make a list of agreements and decisions from this chat" },
          { label: "🎭 Conversation tone?", prompt: "What is the tone and mood of this conversation?" }
        ],
        code: [
          { label: "💻 Explain code", prompt: "Explain how the code in this chat works" },
          { label: "⚡ Optimize code", prompt: "How can this code be made faster and more readable?" },
          { label: "🐞 Find bugs", prompt: "Check the code in this chat for bugs or vulnerabilities" }
        ],
        video: [
          { label: "🎬 Video script idea", prompt: "Suggest a creative script for a short video" },
          { label: "✂️ Faster video editing", prompt: "Give me tips on editing videos faster and better" },
          { label: "🎙️ High-quality audio", prompt: "How do I record clear, professional audio for videos?" }
        ],
        tasks: [
          { label: "📝 Task checklist", prompt: "Create a structured task checklist based on this conversation" },
          { label: "🚀 Our next steps", prompt: "What are our next steps for this project?" },
          { label: "🎯 Prioritize tasks", prompt: "Help me prioritize these items" }
        ]
      },
      followUp: {
        general: [
          { label: "Continue", prompt: "Please continue expanding on this" },
          { label: "Explain further", prompt: "Can you explain this point in more detail?" },
          { label: "Give me an example", prompt: "Give me a practical, real-world example of this" },
          { label: "Can you simplify?", prompt: "Explain this in very simple terms for a beginner" },
          { label: "What are the alternatives?", prompt: "What are other ways or alternative approaches to this?" },
          { label: "Give a practical tip", prompt: "Give me one highly actionable tip I can use right now" }
        ],
        chat: [
          { label: "Detailed summary", prompt: "Provide a more detailed summary of this chat" },
          { label: "Reply to " + peerName, prompt: "Write a polite response to " + peerName },
          { label: "Decline " + peerName, prompt: "Write a polite and soft decline message to " + peerName },
          { label: "Show main bullet points", prompt: "Extract only the absolute key bullet points from this" }
        ],
        code: [
          { label: "Write a test case", prompt: "Write a unit test for this code" },
          { label: "Refactor this code", prompt: "Suggest a elegant refactoring of this code block" },
          { label: "Add comments", prompt: "Add clear documentation or comments to this code" }
        ],
        video: [
          { label: "Write a detailed plan", prompt: "Write a step-by-step storyboard for this video script" },
          { label: "What tools to use?", prompt: "What software or tools do you recommend for this?" },
          { label: "How to promote?", prompt: "How do I promote this video effectively on YouTube/TikTok?" }
        ],
        tasks: [
          { label: "Turn into checklist", prompt: "Format these items as a clean checklist" },
          { label: "Where should I start?", prompt: "What is the very first step I should take right now?" },
          { label: "Identify risks", prompt: "What are the potential risks or roadblocks here?" }
        ]
      }
    };

    const activePools = isRussian ? ruPools : enPools;
    const currentCategory = isInitial ? activePools.initial : activePools.followUp;

    let candidates = [...currentCategory.general];
    if (hasChat) candidates = candidates.concat(currentCategory.chat);
    if (hasCode) candidates = candidates.concat(currentCategory.code);
    if (hasVideo) candidates = candidates.concat(currentCategory.video);
    if (hasTasks) candidates = candidates.concat(currentCategory.tasks);

    const shuffled = candidates.sort(() => 0.5 - Math.random());

    const unique: Array<{ label: string; prompt: string }> = [];
    const seen = new Set();
    for (const item of shuffled) {
      if (!seen.has(item.label)) {
        seen.add(item.label);
        unique.push(item);
      }
      if (unique.length >= (isInitial ? 4 : 3)) break;
    }

    return unique;
  };

  const regenerateInitialPills = () => {
    if (!sidebarAiPills) return;
    const pills = getPillsForContext(true);
    sidebarAiPills.innerHTML = pills.map((p) => {
      return '<button class="sidebar-ai-pill" type="button" data-prompt="' + escapeHtml(p.prompt) + '">' + escapeHtml(p.label) + '</button>';
    }).join("");
    
    sidebarAiPills.querySelectorAll(".sidebar-ai-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        const prompt = pill.getAttribute("data-prompt");
        if (!prompt || !sidebarAiInput) return;
        sidebarAiInput.value = prompt;
        void sendAiMessage();
      });
    });
  };

  const renderFollowUps = (replyText: string) => {
    if (!sidebarAiMessages) return;
    const pills = getPillsForContext(false, replyText);
    const wrap = document.createElement("div");
    wrap.className = "sidebar-ai-follow-up";
    pills.forEach((p) => {
      const pill = document.createElement("button");
      pill.className = "sidebar-ai-follow-up-pill";
      pill.type = "button";
      pill.textContent = p.label;
      pill.addEventListener("click", () => {
        if (sidebarAiInput) sidebarAiInput.value = p.prompt;
        void sendAiMessage();
      });
      wrap.appendChild(pill);
    });
    sidebarAiMessages.appendChild(wrap);
    sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
  };

  const parseMarkdown = (txt: string) => {
    if (!txt) return "";
    let html = escapeHtml(txt);
    const codeBlockRegex = /```([^]*?)```/g;
    html = html.replace(codeBlockRegex, "<pre><code>$1</code></pre>");
    const inlineCodeRegex = /`([^`\n]+)`/g;
    html = html.replace(inlineCodeRegex, "<code>$1</code>");
    const urlRegex = /(https?:\/\/[^\s<>'"\)]+[^s\.\,\<\>\'\"\)])/gi;
    html = html.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    const boldItalicRegex = /\*\*\*([^*]+)\*\*\*/g;
    html = html.replace(boldItalicRegex, "<strong><em>$1</em></strong>");
    const boldRegex = /\*\*([^*]+)\*\*/g;
    html = html.replace(boldRegex, "<strong>$1</strong>");
    const italicRegex = /\*([^*]+)\*/g;
    html = html.replace(italicRegex, "<em>$1</em>");
    
    return html.split("\n").map(function(p) {
      return p.trim() ? "<p>" + p + "</p>" : "";
    }).join("");
  };

  const handleAiReplySuggestions = (fullReply: string, streamBubble: HTMLElement) => {
    const suggestionsWrap = document.getElementById("sidebar-ai-suggestions-wrap");
    const suggestionsContainer = document.getElementById("sidebar-ai-suggestions");
    if (!suggestionsWrap || !suggestionsContainer) return;

    suggestionsWrap.classList.add("hidden");
    suggestionsContainer.innerHTML = "";

    const suggestionsMatch = fullReply.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);
    if (suggestionsMatch) {
      const rawBlock = suggestionsMatch[1];
      const suggestions = rawBlock
        .split("\n")
        .map((s) => s.trim().replace(/^[-*•+]\s*/, "").replace(/^\[[-*•+]\s*\]/, "").trim())
        .filter((s) => s.length > 0);

      if (suggestions.length > 0) {
        suggestions.forEach((text) => {
          const pill = document.createElement("button");
          pill.className = "sidebar-ai-suggestion-pill";
          pill.type = "button";
          pill.textContent = text;

          pill.addEventListener("click", () => {
            const composerInput = document.getElementById("composer-input") as HTMLInputElement;
            if (composerInput) {
              const rectStart = pill.getBoundingClientRect();
              const rectEnd = composerInput.getBoundingClientRect();

              const flyer = document.createElement("div");
              flyer.className = "sidebar-ai-flyer-pill";
              flyer.textContent = text;
              flyer.style.position = "fixed";
              flyer.style.left = rectStart.left + "px";
              flyer.style.top = rectStart.top + "px";
              flyer.style.width = rectStart.width + "px";
              flyer.style.height = rectStart.height + "px";
              flyer.style.zIndex = "99999";
              flyer.style.pointerEvents = "none";
              flyer.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
              document.body.appendChild(flyer);

              requestAnimationFrame(() => {
                flyer.style.left = rectEnd.left + "px";
                flyer.style.top = rectEnd.top + "px";
                flyer.style.width = rectEnd.width + "px";
                flyer.style.height = rectEnd.height + "px";
                flyer.style.opacity = "0";
                flyer.style.transform = "scale(0.85) rotate(1deg)";
              });

              setTimeout(() => {
                flyer.remove();
                composerInput.value = text;
                composerInput.dispatchEvent(new Event("input", { bubbles: true }));
                composerInput.focus();

                suggestionsWrap.classList.add("hidden");
              }, 600);
            } else {
              const suggestionsAlert = document.createElement("div");
              suggestionsAlert.style.position = "fixed";
              suggestionsAlert.style.bottom = "80px";
              suggestionsAlert.style.right = "20px";
              suggestionsAlert.style.background = "rgba(239, 68, 68, 0.9)";
              suggestionsAlert.style.color = "#fff";
              suggestionsAlert.style.padding = "8px 16px";
              suggestionsAlert.style.borderRadius = "8px";
              suggestionsAlert.style.zIndex = "99999";
              suggestionsAlert.style.fontSize = "13px";
              suggestionsAlert.textContent = "Please open a chat to insert this reply.";
              document.body.appendChild(suggestionsAlert);
              setTimeout(() => suggestionsAlert.remove(), 2500);
            }
          });

          suggestionsContainer.appendChild(pill);
        });

        suggestionsWrap.classList.remove("hidden");
      }

      const cleanText = fullReply.replace(/\[SUGGESTIONS\][\s\S]*?\[\/SUGGESTIONS\]/, "").trim();
      streamBubble.innerHTML = parseMarkdown(cleanText);
    }
  };

  const renderAiBubble = (text: string, isUser = false) => {
    if (!sidebarAiMessages) return;
    const bubble = document.createElement("div");
    bubble.className = "sidebar-ai-bubble " + (isUser ? "user" : "assistant");
    
    if (!isUser) {
      bubble.innerHTML = parseMarkdown(text);
    } else {
      bubble.innerHTML = "<p>" + escapeHtml(text) + "</p>";
    }
    
    sidebarAiMessages.appendChild(bubble);
    sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
  };

  const sendAiMessage = async () => {
    if (activeAiController) {
      activeAiController.abort();
      activeAiController = null;
      if (sidebarAiSend) {
        sidebarAiSend.classList.remove("is-streaming");
        sidebarAiSend.innerHTML = getIcon("arrow_upward", "", 'aria-hidden="true"');
      }
      
      if (sidebarAiMessages) {
        const stopLabel = document.createElement("div");
        stopLabel.className = "sidebar-ai-stopped-label";
        stopLabel.innerHTML = "<em>Your message was stopped</em>";
        sidebarAiMessages.appendChild(stopLabel);
        sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
      }
      return;
    }

    const suggestionsWrap = document.getElementById("sidebar-ai-suggestions-wrap");
    const suggestionsContainer = document.getElementById("sidebar-ai-suggestions");
    if (suggestionsWrap && suggestionsContainer) {
      suggestionsWrap.classList.add("hidden");
      suggestionsContainer.innerHTML = "";
    }

    const messageText = sidebarAiInput?.value.trim();
    if (!messageText || !sidebarAiMessages) return;
    
    if (sidebarAiInput) {
      sidebarAiInput.value = "";
      sidebarAiInput.style.height = "auto";
    }
    
    const welcome = sidebarAiMessages.querySelector(".sidebar-ai-welcome");
    if (welcome) {
      welcome.remove();
    }
    
    renderAiBubble(messageText, true);
    
    if (sidebarAiPillsWrap) sidebarAiPillsWrap.style.display = "none";

    sidebarAiMessages.querySelectorAll(".sidebar-ai-follow-up").forEach((el) => el.remove());

    const streamBubble = document.createElement("div");
    streamBubble.className = "sidebar-ai-bubble assistant is-generating";
    streamBubble.innerHTML = '<span class="sidebar-ai-cursor"></span>';
    sidebarAiMessages.appendChild(streamBubble);
    sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });

    const chatContext = gatherChatContext();
    let fullReply = "";
    
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const userLocalTime = new Date().toLocaleString("ru-RU", {
      timeZone: userTimeZone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    });
    
    activeAiController = new AbortController();
    if (sidebarAiSend) {
      sidebarAiSend.classList.add("is-streaming");
      sidebarAiSend.innerHTML = '<div style="width: 12px; height: 12px; background: #ea5656; border-radius: 2px;"></div>';
    }

    if (currentAiModel === "pro") {
      const apiKey = localStorage.getItem("gemini_api_key");
      if (apiKey) {
        try {
          console.log("[TheGraphT AI] Direct client-side streaming to Google Gemini Pro. Model: gemini-2.5-flash");
          const contents = [];
          let finalSystemText = systemPrompt;
          if (chatContext) {
            finalSystemText += "\n\n[CONTEXT: CURRENTLY OPEN CHAT WINDOW]\n" + chatContext;
          }
          contents.push({
            role: "user",
            parts: [{ text: finalSystemText + "\n\nUser Prompt: " + messageText }]
          });
          
          const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=" + apiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: activeAiController.signal,
            body: JSON.stringify({
              contents: contents,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 384
              }
            })
          });
          
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error?.message || "Gemini API returned status: " + res.status);
          }
          
          const reader = res.body?.getReader();
          if (!reader) throw new Error("Null response body reader.");
          const decoder = new TextDecoder();
          let buffer = "";
          let chunkIndex = 0;
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            chunkIndex++;
            console.log("[TheGraphT AI] Direct Direct-Chunk #" + chunkIndex + ", size: " + value.length + " bytes");
            
            buffer += decoder.decode(value, { stream: true });
            
            let startIdx = 0;
            while (true) {
              const openBrace = buffer.indexOf("{", startIdx);
              if (openBrace === -1) break;
              
              let braceCount = 0;
              let closeBrace = -1;
              for (let i = openBrace; i < buffer.length; i++) {
                if (buffer[i] === "{") braceCount++;
                else if (buffer[i] === "}") {
                  braceCount--;
                  if (braceCount === 0) {
                    closeBrace = i;
                    break;
                  }
                }
              }
              
              if (closeBrace === -1) break;
              
              const jsonStr = buffer.slice(openBrace, closeBrace + 1);
              startIdx = closeBrace + 1;
              
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (text) {
                  console.log("[TheGraphT AI] Direct Parsed token successfully:", JSON.stringify(text));
                  fullReply += text;
                  streamBubble.innerHTML = parseMarkdown(fullReply) + '<span class="sidebar-ai-cursor"></span>';
                  sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
                }
              } catch (_) {}
            }
            
            if (startIdx > 0) {
              buffer = buffer.slice(startIdx);
            }
          }
          
          if (fullReply) {
            streamBubble.innerHTML = parseMarkdown(fullReply);
            handleAiReplySuggestions(fullReply, streamBubble);
          } else {
            streamBubble.innerHTML = "<p>Could not get a response.</p>";
          }
          
          renderFollowUps(fullReply);
          
          aiHistory.push({ role: "user", content: messageText });
          aiHistory.push({ role: "assistant", content: fullReply });
          if (aiHistory.length > 20) {
            aiHistory = aiHistory.slice(-20);
          }
        } catch (err: any) {
          if (err.name === "AbortError" || err.message.includes("aborted")) {
            return;
          }
          streamBubble.innerHTML = "<p>Error: " + escapeHtml(err.message) + "</p>";
        } finally {
          activeAiController = null;
          streamBubble.classList.remove("is-generating");
          if (sidebarAiSend) {
            sidebarAiSend.classList.remove("is-streaming");
            sidebarAiSend.innerHTML = getIcon("arrow_upward", "", 'aria-hidden="true"');
          }
        }
        return;
      }
    }

    try {
      console.log("[TheGraphT AI] Sending request to backend. Model:", currentAiModel, "Message length:", messageText.length);
      const startTime = Date.now();
      
      const apiBase = getWin().apiBase || "/api";
      const res = await fetch(apiBase + "/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: activeAiController.signal,
        body: JSON.stringify({
          message: messageText,
          history: aiHistory,
          chatContext: chatContext,
          clientTime: userLocalTime,
          clientTimeZone: userTimeZone,
          model: currentAiModel
        })
      });
      
      console.log("[TheGraphT AI] Received response from backend. Status:", res.status, "Time taken:", Date.now() - startTime, "ms");
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[TheGraphT AI] Backend returned error status:", res.status, "Data:", data);
        throw new Error(data.error || "AI is temporarily unavailable");
      }
      
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Null response body reader.");
      const decoder = new TextDecoder();
      let buffer = "";
      let chunkIndex = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[TheGraphT AI] Stream reader completed.");
          break;
        }
        
        chunkIndex++;
        console.log("[TheGraphT AI] Received chunk #" + chunkIndex + ", size: " + value.length + " bytes");
        
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        
        for (const event of events) {
          const dataLine = event.trim();
          if (!dataLine.startsWith("data: ")) continue;
          const payload = dataLine.slice(6);
          if (payload === "[DONE]") {
            console.log("[TheGraphT AI] Received [DONE] event payload.");
            continue;
          }
          
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              console.error("[TheGraphT AI] Payload contains error field:", parsed.error);
              throw new Error(parsed.error);
            }
            if (parsed.token) {
              console.log("[TheGraphT AI] Parsed token successfully:", JSON.stringify(parsed.token));
              fullReply += parsed.token;
              streamBubble.innerHTML = parseMarkdown(fullReply) + '<span class="sidebar-ai-cursor"></span>';
              sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
            }
          } catch (parseErr: any) {
            if (parseErr.message !== "Stream interrupted") {
              console.warn("[TheGraphT AI] JSON parse warning on payload:", payload, parseErr);
            }
          }
        }
      }
      
      if (fullReply) {
        streamBubble.innerHTML = parseMarkdown(fullReply);
        handleAiReplySuggestions(fullReply, streamBubble);
      } else {
        streamBubble.innerHTML = "<p>Could not get a response.</p>";
      }
      
      renderFollowUps(fullReply);
      
      aiHistory.push({ role: "user", content: messageText });
      aiHistory.push({ role: "assistant", content: fullReply });
      if (aiHistory.length > 20) {
        aiHistory = aiHistory.slice(-20);
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.message.includes("aborted")) {
        return;
      }
      console.error("[TheGraphT AI] Error inside the streaming loop:", err);
      streamBubble.innerHTML = "<p>Error: " + escapeHtml(err.message) + "</p>";
    } finally {
      activeAiController = null;
      streamBubble.classList.remove("is-generating");
      if (sidebarAiSend) {
        sidebarAiSend.classList.remove("is-streaming");
        sidebarAiSend.innerHTML = getIcon("arrow_upward", "", 'aria-hidden="true"');
      }
    }
  };

  if (sidebarAiButton) {
    // Activate AI button (it starts as disabled in HTML)
    sidebarAiButton.classList.remove("disabled");
    sidebarAiButton.removeAttribute("disabled");

    sidebarAiButton.addEventListener("click", () => {
      if (
        sidebarAiButton.classList.contains("disabled") || 
        sidebarAiButton.hasAttribute("disabled") ||
        sidebarAiButton.classList.contains("update-mode")
      ) {
        return;
      }
      
      // Load iframe URL if not yet loaded
      const iframe = document.getElementById("sidebar-ai-iframe") as HTMLIFrameElement | null;
      if (iframe && !iframe.src) {
        iframe.src = "https://ai.thegrapht.su";
      }

      gsapOpenSidebar(sidebarAiPanel);
      
      regenerateInitialPills();
      if (sidebarAiPillsWrap && sidebarAiMessages?.querySelector(".sidebar-ai-welcome")) {
        sidebarAiPillsWrap.style.display = "block";
      }
      
      window.setTimeout(() => {
        sidebarAiInput?.focus();
      }, 150);
    });
  }

  if (sidebarAiClose) {
    sidebarAiClose.addEventListener("click", () => {
      gsapCloseSidebar(sidebarAiPanel);
    });
  }

  if (sidebarAiInput) {
    sidebarAiInput.addEventListener("input", () => {
      sidebarAiInput.style.height = "auto";
      sidebarAiInput.style.height = sidebarAiInput.scrollHeight + "px";
    });
    
    sidebarAiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendAiMessage();
      }
    });
  }

  if (sidebarAiSend) {
    sidebarAiSend.addEventListener("click", () => {
      void sendAiMessage();
    });
  }

  let currentAiModel = "base";
  localStorage.setItem("sidebar_ai_model", "base");

  const updateSelectedModelUI = () => {
    if (sidebarAiCheckPro) {
      sidebarAiCheckPro.textContent = currentAiModel === "pro" ? "check" : "";
      sidebarAiCheckPro.style.color = currentAiModel === "pro" ? "#6366f1" : "#9da5b4";
    }
    
    if (sidebarAiCheckBase) {
      sidebarAiCheckBase.textContent = currentAiModel === "base" ? "check" : "";
    }
    
    if (sidebarAiSelectedModelName) {
      sidebarAiSelectedModelName.textContent = currentAiModel === "pro" ? "TheGraphT Chat Pro" : "TheGraphT Chat (Base)";
    }
    
    if (sidebarAiSelectedModelIcon) {
      sidebarAiSelectedModelIcon.textContent = currentAiModel === "pro" ? "auto_awesome" : "mode_fan";
      sidebarAiSelectedModelIcon.style.color = currentAiModel === "pro" ? "#a5b4fc" : "#9da5b4";
    }
    
    sidebarAiModelMenu?.querySelectorAll(".sidebar-ai-model-menu-item").forEach((el) => {
      const mod = el.getAttribute("data-model");
      el.classList.toggle("active", mod === currentAiModel);
    });
  };

  if (sidebarAiModelSelectorBtn) {
    sidebarAiModelSelectorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = sidebarAiModelMenu?.classList.contains("open");
      sidebarAiModelMenu?.classList.toggle("open", !isOpen);
      sidebarAiModelMenu?.setAttribute("aria-hidden", isOpen ? "true" : "false");
      if (sidebarAiSelectorChevron) {
        sidebarAiSelectorChevron.style.transform = isOpen ? "rotate(0)" : "rotate(180deg)";
      }
    });
  }

  window.addEventListener("click", () => {
    if (sidebarAiModelMenu?.classList.contains("open")) {
      sidebarAiModelMenu.classList.remove("open");
      sidebarAiModelMenu.setAttribute("aria-hidden", "true");
      if (sidebarAiSelectorChevron) {
        sidebarAiSelectorChevron.style.transform = "rotate(0)";
      }
    }
  });

  sidebarAiModelMenu?.querySelectorAll(".sidebar-ai-model-menu-item").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const modelType = el.getAttribute("data-model");
      
      if (modelType === "base") {
        currentAiModel = "base";
        localStorage.setItem("sidebar_ai_model", "base");
        updateSelectedModelUI();
      } else if (modelType === "pro") {
        const proAlert = document.createElement("div");
        proAlert.style.position = "fixed";
        proAlert.style.bottom = "80px";
        proAlert.style.right = "20px";
        proAlert.style.left = "20px";
        proAlert.style.background = "linear-gradient(135deg, #1e1b4b, #312e81)";
        proAlert.style.border = "1px solid rgba(99, 102, 241, 0.35)";
        proAlert.style.color = "#c7d2fe";
        proAlert.style.padding = "16px";
        proAlert.style.borderRadius = "16px";
        proAlert.style.zIndex = "99999";
        proAlert.style.fontSize = "14px";
        proAlert.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.15)";
        proAlert.style.display = "flex";
        proAlert.style.flexDirection = "column";
        proAlert.style.gap = "8px";
        proAlert.style.transition = "all 0.3s ease";
        
        proAlert.innerHTML = '<div style="display:flex; align-items:center; gap:8px; font-weight:700; color:#fff;">' + getIcon("lock", "", 'style="color:#a5b4fc; font-size:18px;"') + 'TheGraphT Chat Pro</div><div style="font-size:13px; opacity:0.9; line-height:1.4;">Интеллектуальная модель станет доступна <strong>15 июня</strong>! Мы готовим для вас самое мощное ИИ-обновление.</div>';
        document.body.appendChild(proAlert);
        setTimeout(() => {
          proAlert.style.opacity = "0";
          proAlert.style.transform = "translateY(8px)";
          setTimeout(() => proAlert.remove(), 300);
        }, 4000);
      }
      
      sidebarAiModelMenu?.classList.remove("open");
      if (sidebarAiSelectorChevron) sidebarAiSelectorChevron.style.transform = "rotate(0)";
    });
  });

  updateSelectedModelUI();
  regenerateInitialPills();

  // Expose methods on window for legacy interop
  getWin().renderDialogs = renderDialogs;
  getWin().renderMessages = renderMessages;
  getWin().applyRoute = applyRoute;
  getWin().loadDialog = loadDialog;
  getWin().fetchJson = fetchJson;
  getWin().animateModeChange = animateModeChange;
  getWin().loadWorkspace = loadWorkspace;
  getWin().switchView = switchView;
  getWin().finishBoot = finishBoot;
  getWin().setStatus = setStatus;
  getWin().syncDesktopTitlebar = syncDesktopTitlebar;
  getWin().closeDialog = closeDialog;
});
