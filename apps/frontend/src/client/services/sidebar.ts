// Sidebar Navigation & AI Panel Service
import { LANGUAGES, getCurrentLanguageCode, setLanguageCode, applyTranslations, t } from "../i18n";
import { createIdempotencyKey, THG_IDEMPOTENCY_HEADER } from "./thg-protocol-client";
import { googleSpinnerMarkup } from "../../server/components/google-spinner.js";
import { onDomReady } from "../shared/lib/on-dom-ready.ts";
import { sendLegacyComposerMessage } from "../features/chat/legacyComposerSend.ts";
import { mountLegacyComposer } from "../features/chat/mountLegacyComposer.tsx";
import { mountLegacyDialogItemDom } from "../features/sidebar/legacyDialogItemMount.tsx";
import { mountLegacyAttachMenu } from "../features/chat/mountLegacyAttachMenu.tsx";
import { mountLegacyAttachmentModalShell } from "../features/media/legacyAttachmentModalMount.tsx";
import {
  getLegacyDialogContextMenuActions
} from "../features/sidebar/legacyDialogContextMenuSync.ts";
import {
  renderLegacyDialogContextMenuBody
} from "../features/sidebar/legacyDialogContextMenuMount.tsx";

declare const getIcon: (name: string, extraClasses?: string, attrs?: string) => string;
declare const getAvatarMeta: (seed: any, label: any) => any;
declare const escapeHtml: (v: any) => string;
declare const formatLastSeen: (time: any) => string;
declare const showToast: (message: string, type?: string) => void;
declare const playSound: (kind: string) => void;
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
declare const annotateMessageSequences: (items: any[]) => any[];
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
declare const emojiNames: Record<string, string[]>;
let emojiPickerCloseTimer: any = null;
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
const resolveDialogAvatarMarkup = (dialog: any, options: any = {}) => {
  const fn = getWin().getDialogAvatarMarkup;
  if (typeof fn === "function") {
    return fn(dialog, options);
  }
  const title = String(dialog?.title || "?").slice(0, 1);
  if (dialog?.avatarUrl) {
    return '<div class="dialog-avatar"><img class="generated-avatar-photo" src="' + escapeHtml(String(dialog.avatarUrl)) + '" alt="' + escapeHtml(title) + '" /></div>';
  }
  const getAvatarMetaFn = getWin().getAvatarMeta;
  if (typeof getAvatarMetaFn === "function") {
    const avatar = getAvatarMetaFn(dialog?.id || dialog?.publicId, dialog?.title || "?");
    return '<div class="dialog-avatar" style="' + avatar.style + '"><img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" /></div>';
  }
  return '<div class="dialog-avatar">' + escapeHtml(title) + "</div>";
};
const GROUP_MAX_MEMBERS = 20000;

// Module scoped state
let groupCreateSelectedDialogIds = new Set<string>();
let groupCreateSearchQuery = "";
let groupCreateStep = 1;
let groupCreatePhotoDataUrl = "";
let groupCreateNameTouched = false;
let groupCreateRenderedSelectedDialogIds = new Set<string>();
let groupCreateMode = "group"; // "group" | "secret"
let channelCreateStep = 1;
let channelCreatePhotoDataUrl = "";
let channelCreateSlugStatus: "idle" | "checking" | "available" | "invalid" = "idle";
let channelCreateSlugTimer: ReturnType<typeof setTimeout> | null = null;
let channelCreateSlugRequestId = 0;

let currentSearchQuery = "";
let currentSearchResults: any[] = [];
let currentSearchChannels: any[] = [];
let searchDelayTimer: any = null;
let searchRequestId = 0;
const dismissedUnreadDividerDialogIds = new Set<string>();

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

const getChannelRouteFromPath = () => {
  const path = String(window.location.pathname || "");
  if (!path.startsWith("/c/")) {
    return null;
  }
  const rest = decodeURIComponent(path.slice(3)).trim();
  if (!rest) {
    return null;
  }
  if (rest.startsWith("+")) {
    return { kind: "invite" as const, inviteToken: rest.slice(1) };
  }
  return { kind: "slug" as const, slug: rest.toLowerCase() };
};

const getRoutedPublicId = () => {
  const path = String(window.location.pathname || "/");
  if (!path || path === "/") {
    return "";
  }
  if (getChannelRouteFromPath()) {
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
  if (dialog.type === "channel") {
    if (dialog.channelVisibility === "public" && dialog.channelSlug) {
      return "/c/" + dialog.channelSlug;
    }
    if (dialog.channelInviteToken) {
      return "/c/+" + dialog.channelInviteToken;
    }
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

const ARCHIVED_DIALOGS_KEY = "thegrapht_archived_dialogs";
let archiveViewOpen = false;

const getArchivedDialogIds = (): string[] => {
  try {
    const raw = window.localStorage.getItem(ARCHIVED_DIALOGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch {
    return [];
  }
};

const setArchivedDialogIds = (ids: string[]) => {
  window.localStorage.setItem(ARCHIVED_DIALOGS_KEY, JSON.stringify(Array.from(new Set(ids))));
};

const isDialogArchived = (publicId: string) => getArchivedDialogIds().includes(String(publicId || ""));

const getFilteredDialogs = (dialogs: any[]) => {
  const archivedIds = new Set(getArchivedDialogIds());
  return dialogs
    .filter((dialog) => !(dialog?.type === "channel" && dialog?.channelIsMember !== true))
    .filter((dialog) => {
      const archived = archivedIds.has(String(dialog?.publicId || ""));
      return archiveViewOpen ? archived : !archived;
    })
    .slice()
    .sort((left, right) => {
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

const formatApiError = (errorValue: unknown, fallback = "Request failed.") => {
  if (typeof errorValue === "string" && errorValue.trim()) {
    return errorValue;
  }
  if (errorValue && typeof errorValue === "object" && "message" in errorValue) {
    const message = String((errorValue as { message?: unknown }).message || "").trim();
    if (message) {
      return message;
    }
  }
  return fallback;
};

const fetchJson = async (url: string, options: any = {}) => {
  const requestHeaders = {
    "X-THG-Protocol": "1",
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
            handleUnauthorizedSession(formatApiError(payload.error, "Session ended. Please sign in again."));
          }
        } else {
          const disableRealtime = getWin().disableRealtime;
          if (typeof disableRealtime === "function") {
            disableRealtime();
          }
        }
      }

      const rawErrorMsg = formatApiError(payload.error);
      throw new Error(response.status === 401 ? rawErrorMsg + " (unauthorized)" : rawErrorMsg);
    }

    getWin().connectionStatusManager?.markReachable?.();
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
    const preload = getWin().preloadDialogMediaDimensions;
    if (typeof preload === "function") {
      void preload(messages, {
        limit: Number(options.limit) || 12,
        chunkSize: Number(options.chunkSize) || 4,
        timeBudgetMs: Number(options.timeBudgetMs) || 140,
        shouldContinue: () => (
          getWin().currentDialogPublicId === targetPublicId
          && getWin().activeDialogLoadToken === targetLoadToken
        )
      });
    }
    if (typeof getWin().prefetchDialogMedia === "function") {
      getWin().prefetchDialogMedia(messages);
    }
  };

  const getIdle = (window as any).requestIdleCallback;
  if (typeof getIdle === "function") {
    getIdle(start, { timeout: 180 });
    return;
  }

  window.setTimeout(start, 0);
};

// Global variables initialized when the document can be queried
onDomReady(() => {
  mountLegacyAttachmentModalShell();
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
  const channelCreatePanel = document.getElementById("channel-create-panel");

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

  const channelCreateClose = document.getElementById("channel-create-close");
  const channelCreateTypeBack = document.getElementById("channel-create-type-back");
  const channelCreatePhotoButton = document.getElementById("channel-create-photo-button");
  const channelCreatePhotoInput = document.getElementById("channel-create-photo-input") as HTMLInputElement;
  const channelCreatePhotoPreview = document.getElementById("channel-create-photo-preview") as HTMLImageElement;
  const channelCreateNameInput = document.getElementById("channel-create-name-input") as HTMLInputElement;
  const channelCreateDescriptionInput = document.getElementById("channel-create-description-input") as HTMLTextAreaElement;
  const channelCreateNext = document.getElementById("channel-create-next");
  const channelCreateSubmit = document.getElementById("channel-create-submit");
  const channelCreatePublicLinkWrap = document.getElementById("channel-create-public-link-wrap");
  const channelCreatePrivateLinkWrap = document.getElementById("channel-create-private-link-wrap");
  const channelCreateSlugField = document.getElementById("channel-create-slug-field");
  const channelCreateSlugPrefix = document.getElementById("channel-create-slug-prefix");
  const channelCreateSlugInput = document.getElementById("channel-create-slug-input") as HTMLInputElement;
  const channelCreateSlugError = document.getElementById("channel-create-slug-error");
  const channelCreatePrivateLinkPreview = document.getElementById("channel-create-private-link-preview");
  const channelVisibilityInputs = Array.from(document.querySelectorAll('input[name="channel-visibility"]')) as HTMLInputElement[];

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
  mountLegacyAttachMenu();
  const attachMenu = document.getElementById("attach-menu");
  const composerEmojiButton = document.getElementById("composer-emoji-button");
  const groupCallJoinStrip = document.getElementById("group-call-join-strip");

  const composerFileInput = document.getElementById("composer-file-input") as HTMLInputElement;
  const composerAttachmentRemove = document.getElementById("composer-attachment-remove");

  const attachmentModalClose = document.getElementById("attachment-modal-close");
  const attachmentModalAdd = document.getElementById("attachment-modal-add");
  const attachmentModalCancel = document.getElementById("attachment-modal-cancel");
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

  const sidebarComposeFabRound = document.getElementById("sidebar-compose-fab-round");
  sidebarComposeFabRound?.addEventListener("click", () => {
    toggleSidebarComposeMenu();
  });
  sidebarComposeFab?.addEventListener("click", () => {
    toggleSidebarComposeMenu();
  });

  const globalChipTooltip = document.getElementById("group-chip-tooltip-global");

  const hideGlobalChipTooltip = () => {
    if (!globalChipTooltip) return;
    globalChipTooltip.classList.remove("visible");
    globalChipTooltip.setAttribute("aria-hidden", "true");
  };

  const showGlobalChipTooltip = (chipElement: HTMLElement, text: string) => {
    if (!globalChipTooltip || !chipElement || !text) return;
    globalChipTooltip.textContent = text;
    const rect = chipElement.getBoundingClientRect();
    const tooltipWidth = globalChipTooltip.offsetWidth || 120;
    const tooltipHeight = globalChipTooltip.offsetHeight || 32;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.top - tooltipHeight - 8;

    if (top < 10) {
      top = rect.bottom + 8;
      globalChipTooltip.classList.add("position-below");
    } else {
      globalChipTooltip.classList.remove("position-below");
    }

    left = Math.max(12, Math.min(window.innerWidth - tooltipWidth - 12, left));

    globalChipTooltip.style.left = `${left}px`;
    globalChipTooltip.style.top = `${top}px`;
    globalChipTooltip.classList.add("visible");
    globalChipTooltip.setAttribute("aria-hidden", "false");
  };

  document.addEventListener("mouseover", (event) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const secretTarget = target.closest?.(".dialog-avatar-secret") as HTMLElement | null;
    if (secretTarget) {
      const tooltipText = secretTarget.getAttribute("data-chip-name") || secretTarget.getAttribute("aria-label") || t("profile.secretChatEncrypted");
      showGlobalChipTooltip(secretTarget, tooltipText);
      return;
    }

    const avatarTarget = target.closest?.("#chat-profile-avatar, #chat-header-avatar, .chat-profile-avatar, .profile-panel-avatar") as HTMLElement | null;
    if (avatarTarget) {
      showGlobalChipTooltip(avatarTarget, t("profile.viewPhoto"));
      return;
    }
  }, true);

  document.addEventListener("mouseout", (event) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const secretTarget = target.closest?.(".dialog-avatar-secret");
    const avatarTarget = target.closest?.("#chat-profile-avatar, #chat-header-avatar, .chat-profile-avatar, .profile-panel-avatar");
    if (secretTarget || avatarTarget) {
      hideGlobalChipTooltip();
    }
  }, true);

  document.addEventListener("mousedown", () => {
    hideGlobalChipTooltip();
  }, true);

  const renderGroupCreateSelected = (candidates: any[]) => {
    if (!groupCreateSelected) {
      return;
    }
    const selectedCandidates = candidates.filter((dialog) => groupCreateSelectedDialogIds.has(String(dialog.id)));
    const selectedDialogIds = new Set(selectedCandidates.map((dialog) => String(dialog.id)));
    groupCreateSelected.innerHTML = selectedCandidates.map((dialog) => {
      const dialogId = String(dialog.id);
      const isNewSelected = !groupCreateRenderedSelectedDialogIds.has(dialogId);
      const name = dialog.title || "User";
      return '<div class="group-selected-chip' + (isNewSelected ? " is-new" : "") + '" data-chip-name="' + escapeHtml(name) + '">' +
        resolveDialogAvatarMarkup(dialog, { showPresence: false }) +
      '</div>';
    }).join("");
    groupCreateRenderedSelectedDialogIds = selectedDialogIds;

    groupCreateSelected.querySelectorAll(".group-selected-chip").forEach((chip) => {
      const name = chip.getAttribute("data-chip-name");
      if (!name) return;
      chip.addEventListener("mouseenter", () => {
        showGlobalChipTooltip(chip as HTMLElement, name);
      });
      chip.addEventListener("mouseleave", () => {
        hideGlobalChipTooltip();
      });
    });
  };

  groupCreateSelected?.addEventListener("scroll", hideGlobalChipTooltip);

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
      const formatGroupMembersCount = getWin().formatGroupMembersCount;
      groupCreateMemberCount.textContent = typeof formatGroupMembersCount === "function"
        ? formatGroupMembersCount(membersCount)
        : (membersCount === 1 ? ("1 " + t("group.memberOne")) : (String(membersCount) + " " + t("group.memberMany")));
    }
    if (groupCreateDetailsList) {
      groupCreateDetailsList.innerHTML = selectedCandidates.map((dialog) => {
        const statusText = formatDialogSubtitle(dialog) || t("status.recentlyOnline");
        return '<div class="group-create-details-item">' +
          resolveDialogAvatarMarkup(dialog) +
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
      groupCreateList.innerHTML = '<div class="group-create-empty" data-i18n="group.noPeopleFound">' + escapeHtml(t("group.noPeopleFound")) + '</div>';
      renderGroupCreateSelected(candidates);
      syncGroupCreateNextButtonState();
      return;
    }

    groupCreateList.innerHTML = filtered.map((dialog: any) => {
      const dialogId = String(dialog.id);
      const isSelected = groupCreateSelectedDialogIds.has(dialogId);
      const isUnavailable = Boolean(dialog.unavailable);
      const statusText = isUnavailable
        ? t("group.secretChatAlreadyExists")
        : (formatDialogSubtitle(dialog) || "last seen recently");
      return '<button class="group-create-item' + (isSelected ? " selected" : "") + (isUnavailable ? " unavailable" : "") + '" type="button" data-group-dialog-id="' + escapeHtml(dialogId) + '" ' + (isUnavailable ? 'disabled aria-disabled="true"' : "") + '>' +
        '<span class="group-create-check">' + getIcon("check", "", 'aria-hidden="true"') + '</span>' +
        resolveDialogAvatarMarkup(dialog) +
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
      groupCreateStepMembersTitle.textContent = t("group.addMembers");
    }
    if (groupCreateSearchInput) {
      groupCreateSearchInput.placeholder = t("group.addPeople");
    }
    setGroupCreateStep(1);
  };

  const openGroupCreatePanel = () => {
    closeChannelCreatePanel();
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
      groupCreateStepMembersTitle.textContent = t("menu.newSecretChat");
    }
    if (groupCreateSearchInput) {
      groupCreateSearchInput.placeholder = t("group.whoToChatWith");
    }
    if (groupCreateNameInput) {
      groupCreateNameInput.value = "";
    }
    setGroupCreateStep(1);
    openGroupCreatePanel();
  };

  const getChannelLinkHost = () => {
    const hostFn = getWin().getPublicAppHost;
    if (typeof hostFn === "function") {
      return hostFn();
    }
    const hostname = window.location.hostname || "";
    if (hostname.includes("dev.thegrapht.su") || hostname === "localhost" || hostname === "127.0.0.1") {
      return "dev.thegrapht.su";
    }
    return "web.thegrapht.su";
  };

  const getSelectedChannelVisibility = () => {
    const selected = channelVisibilityInputs.find((input) => input.checked);
    return selected?.value === "public" ? "public" : "private";
  };

  const syncChannelCreateVisibilityUi = () => {
    const visibility = getSelectedChannelVisibility();
    const isPublic = visibility === "public";
    if (channelCreatePublicLinkWrap) {
      channelCreatePublicLinkWrap.hidden = !isPublic;
    }
    if (channelCreatePrivateLinkWrap) {
      channelCreatePrivateLinkWrap.hidden = isPublic;
    }
    if (channelCreateSlugPrefix) {
      channelCreateSlugPrefix.textContent = getChannelLinkHost() + "/c/";
    }
    if (channelCreatePrivateLinkPreview) {
      channelCreatePrivateLinkPreview.textContent = window.location.protocol + "//" + getChannelLinkHost() + "/c/+…";
    }
    syncChannelCreateActions();
  };

  const syncChannelSlugValidationUi = () => {
    const isPublic = getSelectedChannelVisibility() === "public";
    const slugValue = channelCreateSlugInput ? (channelCreateSlugInput.value || "").trim().toLowerCase() : "";
    const showInvalid = isPublic && channelCreateStep === 2 && slugValue && channelCreateSlugStatus === "invalid";
    channelCreateSlugField?.classList.toggle("is-invalid", Boolean(showInvalid));
    if (channelCreateSlugError) {
      channelCreateSlugError.hidden = !showInvalid;
      if (!showInvalid) {
        channelCreateSlugError.textContent = t("channel.linkInvalid");
      }
    }
    syncChannelCreateActions();
  };

  const syncChannelCreateActions = () => {
    const channelName = channelCreateNameInput ? (channelCreateNameInput.value || "").trim() : "";
    const canProceedStep1 = Boolean(channelName);
    const isPublic = getSelectedChannelVisibility() === "public";
    const slugValue = channelCreateSlugInput ? (channelCreateSlugInput.value || "").trim().toLowerCase() : "";
    const canSubmit = channelCreateStep === 2 && (
      !isPublic || (slugValue && channelCreateSlugStatus === "available")
    );
    const panelOpen = Boolean(channelCreatePanel?.classList.contains("open"));
    workspaceSidebar?.classList.toggle("channel-create-open", panelOpen);
    workspaceSidebar?.classList.toggle("channel-create-next-enabled", panelOpen && channelCreateStep === 1 && canProceedStep1);
    workspaceSidebar?.classList.toggle("channel-create-step2-open", panelOpen && channelCreateStep === 2);
    workspaceSidebar?.classList.toggle("channel-create-submit-enabled", panelOpen && Boolean(canSubmit));
  };

  const setChannelCreateStep = (nextStep: number) => {
    channelCreateStep = nextStep === 2 ? 2 : 1;
    syncChannelCreateActions();
    syncChannelSlugValidationUi();
  };

  const resetChannelSlugCheck = () => {
    channelCreateSlugStatus = "idle";
    if (channelCreateSlugTimer) {
      window.clearTimeout(channelCreateSlugTimer);
      channelCreateSlugTimer = null;
    }
    syncChannelSlugValidationUi();
  };

  const scheduleChannelSlugCheck = () => {
    const slugValue = channelCreateSlugInput ? (channelCreateSlugInput.value || "").trim().toLowerCase() : "";
    if (channelCreateSlugTimer) {
      window.clearTimeout(channelCreateSlugTimer);
      channelCreateSlugTimer = null;
    }
    if (!slugValue || getSelectedChannelVisibility() !== "public") {
      resetChannelSlugCheck();
      return;
    }
    channelCreateSlugStatus = "checking";
    syncChannelSlugValidationUi();
    const requestId = ++channelCreateSlugRequestId;
    channelCreateSlugTimer = window.setTimeout(() => {
      void (async () => {
        try {
          const apiBase = getWin().apiBase || "/api";
          const payload = await fetchJson(apiBase + "/v1/channels/slug-available?slug=" + encodeURIComponent(slugValue));
          if (requestId !== channelCreateSlugRequestId) {
            return;
          }
          channelCreateSlugStatus = payload.available ? "available" : "invalid";
        } catch {
          if (requestId !== channelCreateSlugRequestId) {
            return;
          }
          channelCreateSlugStatus = "invalid";
        }
        syncChannelSlugValidationUi();
      })();
    }, 320);
  };

  const closeChannelCreatePanel = () => {
    gsapCloseSidebar(channelCreatePanel);
    workspaceSidebar?.classList.remove("channel-create-open");
    workspaceSidebar?.classList.remove("channel-create-next-enabled");
    workspaceSidebar?.classList.remove("channel-create-step2-open");
    workspaceSidebar?.classList.remove("channel-create-submit-enabled");
    channelCreatePhotoDataUrl = "";
    channelCreateStep = 1;
    resetChannelSlugCheck();
    if (channelCreatePhotoPreview) {
      channelCreatePhotoPreview.removeAttribute("src");
    }
    channelCreatePhotoButton?.classList.remove("has-photo");
    if (channelCreateNameInput) {
      channelCreateNameInput.value = "";
    }
    if (channelCreateDescriptionInput) {
      channelCreateDescriptionInput.value = "";
    }
    if (channelCreateSlugInput) {
      channelCreateSlugInput.value = "";
    }
    channelVisibilityInputs.forEach((input, index) => {
      input.checked = index === 0;
    });
    syncChannelCreateVisibilityUi();
    setChannelCreateStep(1);
  };

  const openChannelCreatePanel = () => {
    closeGroupCreatePanel();
    setSidebarComposeOpen(false);
    setSidebarMenuOpen(false);
    channelCreatePhotoDataUrl = "";
    resetChannelSlugCheck();
    if (channelCreatePhotoPreview) {
      channelCreatePhotoPreview.removeAttribute("src");
    }
    channelCreatePhotoButton?.classList.remove("has-photo");
    if (channelCreateNameInput) {
      channelCreateNameInput.value = "";
    }
    if (channelCreateDescriptionInput) {
      channelCreateDescriptionInput.value = "";
    }
    if (channelCreateSlugInput) {
      channelCreateSlugInput.value = "";
    }
    channelVisibilityInputs.forEach((input, index) => {
      input.checked = index === 0;
    });
    gsapOpenSidebar(channelCreatePanel);
    syncChannelCreateVisibilityUi();
    setChannelCreateStep(1);
    window.setTimeout(() => {
      channelCreateNameInput?.focus();
    }, 40);
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
      window.setTimeout(() => {
        if (bootSplash.parentNode) {
          bootSplash.remove();
        }
      }, 280);
    }
  };

  const finishBoot = (showWorkspace: boolean) => {
    switchView(showWorkspace);
    pageRoot?.classList.remove("booting");
    hideBootSplash();
    getWin().__THEGRAPHT_STORE_ACTIONS__?.uiActions?.setBootComplete?.(true);
    const finishAllTopProgress = getWin().finishAllTopProgress;
    if (typeof finishAllTopProgress === "function") {
      finishAllTopProgress();
    }
    if (showWorkspace) {
      animateDialogListItems();
      scheduleEmojiPickerWarmup();
    }
  };

  const scheduleEmojiPickerWarmup = () => {
    const warmup = getWin().scheduleEmojiPickerWarmup;
    if (typeof warmup === "function") {
      warmup();
    }
  };

  const renderSearchLoadingState = () => {
    if (!dialogList) return;
    dialogList.classList.remove("search-empty");
    dialogList.classList.add("search-loading");
    dialogList.innerHTML =
      '<div class="search-loading-state">' + googleSpinnerMarkup(40) + '</div>';
    animateDialogListItems();
  };

  const renderSearchResults = (users: any[], channels: any[] = currentSearchChannels) => {
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
    const visibleChannels = Array.isArray(channels) ? channels : [];

    if (!visibleUsers.length && !visibleChannels.length) {
      dialogList.classList.add("search-empty");
      const emptyVideo = getWin().searchEmptyVideoUrl || "";
      dialogList.innerHTML =
        '<div class="search-empty-state">' +
          '<video autoplay muted loop playsinline preload="auto" aria-hidden="true">' +
            '<source src="' + escapeHtml(emptyVideo) + '" type="video/mp4" />' +
          '</video>' +
          '<p class="search-empty-title">' + escapeHtml(t("search.noResultsTitle")) + '</p>' +
          '<p class="search-empty-copy">' + escapeHtml(t("search.noResultsDesc")) + '</p>' +
        '</div>';
      animateDialogListItems();
      return;
    }

    const channelMarkup = visibleChannels.map((channel) => {
      const avatar = getAvatarMeta(channel.publicId || channel.id, channel.title || "Channel");
      return '<button class="dialog-item" type="button" data-search-channel-id="' + escapeHtml(channel.publicId || "") + '">' +
        '<div class="dialog-avatar group-avatar" style="' + avatar.style + '"><img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" /></div>' +
        '<div class="dialog-body">' +
          '<div class="dialog-line only-title"><strong>' + escapeHtml(channel.title || "Channel") + '</strong></div>' +
          '<p class="dialog-preview">@' + escapeHtml(channel.channelSlug || "channel") + '</p>' +
        '</div>' +
      '</button>';
    }).join("");

    dialogList.innerHTML = channelMarkup + visibleUsers.map((user) => {
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
        if (!targetUserId) return;

        const currentUserId = getWin().currentUserId;
        const allDialogs = getWin().allDialogs || [];
        const isSelf = targetUserId === currentUserId;

        const savedDialog = allDialogs.find((d: any) => isSelf ? d.type === "saved" : (d.type === "direct" && d.peerUserId === targetUserId));
        if (savedDialog) {
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

    dialogList.querySelectorAll("[data-search-channel-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const channelPublicId = button.getAttribute("data-search-channel-id");
        const channel = visibleChannels.find((item) => item.publicId === channelPublicId);
        if (!channel?.channelSlug) {
          return;
        }

        try {
          currentSearchQuery = "";
          currentSearchResults = [];
          currentSearchChannels = [];
          if (sidebarSearch) sidebarSearch.value = "";
          const nextPath = "/c/" + encodeURIComponent(channel.channelSlug);
          if (window.location.pathname !== nextPath) {
            window.history.pushState({}, "", nextPath);
          }
          const loadWorkspace = getWin().loadWorkspace;
          if (typeof loadWorkspace === "function") {
            await loadWorkspace({ forceNew: true, animate: true });
          }
        } catch (error: any) {
          showToast(error instanceof Error ? error.message : "Failed to open channel.", "error");
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

    const renderPreviewFn = (getWin() as any).renderDialogPreviewHtml || ((d: any) => escapeHtml(d?.lastMessagePreview || ""));
    const getIconFn = (getWin() as any).getIcon || (typeof getIcon === "function" ? getIcon : null);
    const typeIcon = (type: string) => {
      if (!getIconFn) return "";
      if (type === "channel") return '<span class="dialog-type-icon">' + getIconFn("campaign", "", 'aria-hidden="true"') + "</span>";
      if (type === "group") return '<span class="dialog-type-icon">' + getIconFn("groups", "", 'aria-hidden="true"') + "</span>";
      if (type === "secret") return '<span class="dialog-type-icon">' + getIconFn("lock", "", 'aria-hidden="true"') + "</span>";
      if (type === "bot") return '<span class="dialog-type-icon">' + getIconFn("bot", "", 'aria-hidden="true"') + "</span>";
      return "";
    };
    const archivedDialogs = (dialogs || []).filter((dialog) => isDialogArchived(String(dialog?.publicId || "")));
    const archivePreview = archivedDialogs.slice(0, 3).map((dialog) => String(dialog.title || "").trim()).filter(Boolean).join(", ");
    const archiveRow = (!archiveViewOpen && archivedDialogs.length)
      ? '<button class="dialog-item dialog-archive-item" type="button" data-action="open-archive">' +
          '<div class="dialog-avatar dialog-archive-avatar">' + (getIconFn ? getIconFn("archive", "", 'aria-hidden="true"') : "") + "</div>" +
          '<div class="dialog-body">' +
            '<div class="dialog-line"><span class="dialog-title-wrap"><strong>' + escapeHtml(t("sidebar.archive")) + "</strong></span></div>" +
            '<div class="dialog-preview-row"><div class="dialog-preview-copy"><span class="dialog-archive-preview">' + escapeHtml(archivePreview) + "</span></div></div>" +
          "</div>" +
        "</button>"
      : (archiveViewOpen
        ? '<button class="dialog-item dialog-archive-item is-open" type="button" data-action="open-archive">' +
            '<div class="dialog-avatar dialog-archive-avatar">' + (getIconFn ? getIconFn("arrow_back", "", 'aria-hidden="true"') : "") + "</div>" +
            '<div class="dialog-body"><div class="dialog-line"><span class="dialog-title-wrap"><strong>' + escapeHtml(t("sidebar.archive")) + "</strong></span></div></div>" +
          "</button>"
        : "");

    dialogList.innerHTML = "";
    const dialogFragment = document.createDocumentFragment();
    if (archiveRow) {
      const archiveHost = document.createElement("div");
      archiveHost.innerHTML = archiveRow;
      Array.from(archiveHost.children).forEach((node) => dialogFragment.appendChild(node));
    }

    visibleDialogs.forEach((dialog) => {
      const isBot = dialog.type === "bot";
      const unreadCount = Math.max(0, Number(dialog?.unreadCount) || 0);
      const muted = Boolean(dialog.muted) || (typeof getWin().isDialogNotificationsEnabled === "function" && getWin().isDialogNotificationsEnabled(dialog.publicId) === false);
      const verified = dialog.verified || dialog.isVerified
        ? '<span class="dialog-verified">' + (getIconFn ? getIconFn("verified", "", 'aria-hidden="true"') : "") + "</span>"
        : "";
      const node = mountLegacyDialogItemDom({
        dialogId: String(dialog.id || ""),
        publicId: String(dialog.publicId || ""),
        dialogType: String(dialog.type || ""),
        unreadCount,
        muted,
        isActive: dialog.id === getWin().currentDialogId,
        avatarHtml: resolveDialogAvatarMarkup(dialog),
        typeIconHtml: typeIcon(dialog.type),
        title: String(dialog.title || ""),
        verifiedHtml: verified,
        metaTime: formatDialogListTime(dialog.lastMessageCreatedAt),
        previewHtml: renderPreviewFn(dialog),
        openButtonLabel: t("sidebar.open"),
        showOpenButton: isBot,
        onOpen: () => {
          const dialogId = String(dialog.id || "");
          const publicId = String(dialog.publicId || "");
          if (!dialogId || !publicId) {
            return;
          }

          getWin().__THEGRAPHT_STORE_ACTIONS__?.dialogActions?.clearUnread?.(publicId);
          const button = dialogList?.querySelector('.dialog-item[data-public-id="' + CSS.escape(publicId) + '"]');
          const badgeEl = button?.querySelector(".dialog-unread-badge");
          if (badgeEl && !badgeEl.classList.contains("is-hidden")) {
            badgeEl.classList.add("is-hidden");
          }
          if (button instanceof HTMLElement) {
            button.dataset.dialogUnread = "0";
          }
          getWin().allDialogs = getWin().allDialogs.map((entry: any) => entry.publicId === publicId
            ? { ...entry, unreadCount: 0 }
            : entry);
          if (getWin().currentDialogSnapshot?.publicId === publicId) {
            getWin().currentDialogSnapshot = {
              ...getWin().currentDialogSnapshot,
              unreadCount: 0
            };
          }

          getWin().applyDialogFolderFilter?.();
          void loadDialog(publicId);
        }
      });
      dialogFragment.appendChild(node);
    });
    dialogList.appendChild(dialogFragment);

    getWin().applyDialogFolderFilter?.();

    dialogList.querySelectorAll("[data-action='open-archive']").forEach((button) => {
      button.addEventListener("click", () => {
        archiveViewOpen = !archiveViewOpen;
        renderDialogs(getWin().allDialogs || []);
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
    const archived = isDialogArchived(String(context.publicId || ""));

    renderLegacyDialogContextMenuBody(
      dialogContextMenuBody,
      getLegacyDialogContextMenuActions(archived),
      (action) => {
        const publicId = String(dialogContextMenuState?.publicId || "");
        if (!publicId) {
          return;
        }
        if (action === "archive") {
          const next = getArchivedDialogIds();
          if (archived) {
            setArchivedDialogIds(next.filter((id) => id !== publicId));
          } else {
            setArchivedDialogIds(next.concat(publicId));
          }
          renderDialogs(getWin().allDialogs || []);
          closeDialogContextMenu();
          return;
        }
        if (action !== "open_in_new") {
          return;
        }

        const targetPath = resolveRoutePathForDialogPublicId(publicId);
        window.open(targetPath, "_blank", "noopener,noreferrer");
        closeDialogContextMenuSoon();
      }
    );

    const menuWidth = 268;
    const menuHeight = 120;
    const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
    const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
    dialogContextMenu.style.left = left + "px";
    dialogContextMenu.style.top = top + "px";
    dialogContextMenu.classList.add("open");
    dialogContextMenu.setAttribute("aria-hidden", "false");
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
    if (isMobileViewport()) {
      if (pageRoot?.classList.contains("mobile-chat-closing")) {
        return;
      }
      pageRoot?.classList.add("mobile-chat-closing");
      syncMobileChatOpenState(false);
      window.setTimeout(() => {
        closeDialog(options);
        pageRoot?.classList.remove("mobile-chat-closing");
      }, 200);
      return;
    }
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

  const dismissUnreadDivider = (publicId = getWin().currentDialogPublicId) => {
    if (publicId) {
      dismissedUnreadDividerDialogIds.add(String(publicId));
    }
    if (getWin().currentDialogSnapshot?.publicId && (!publicId || getWin().currentDialogSnapshot.publicId === publicId)) {
      getWin().currentDialogSnapshot = {
        ...getWin().currentDialogSnapshot,
        unreadCount: 0
      };
    }
    const unreadDivider = messageList?.querySelector(".message-unread-divider") as HTMLElement | null;
    if (!unreadDivider || unreadDivider.dataset.dismissing) {
      return;
    }
    unreadDivider.dataset.dismissing = "true";
    unreadDivider.style.opacity = "0";
    unreadDivider.style.height = "0";
    unreadDivider.style.margin = "0";
    unreadDivider.style.padding = "0";
    unreadDivider.style.border = "none";
    window.setTimeout(() => {
      unreadDivider.remove();
    }, 300);
  };
  getWin().dismissUnreadDivider = dismissUnreadDivider;

  const renderMessages = (dialog: any, messages: any[], options: any = {}) => {
    uiRenderDebug("renderMessages:called", {
      dialogPublicId: dialog?.publicId || null,
      dialogType: dialog?.type || null,
      messageCount: Array.isArray(messages) ? messages.length : 0,
      options
    });
    const shouldAnimateList = Boolean(options.animateList) && !isMobileViewport();
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
    getWin().syncStoreFromLegacy?.({
      currentDialog: dialog,
      messages: getWin().currentMessagesSnapshot,
      peerReadAt: getWin().currentPeerReadAt || null
    });
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
      messageList?.classList.remove("saved-empty", "direct-empty");
      if (messageList && !isMobileViewport()) {
        messageList.innerHTML = '<div class="empty-chat-state"><p data-i18n="empty.chooseChatTitle">' + escapeHtml(t("empty.chooseChatTitle")) + '</p><p data-i18n="empty.chooseChatBody">' + escapeHtml(t("empty.chooseChatBody")) + '</p></div>';
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
    if (chatSubtitle && (!getWin().connectionStatusManager?.getState?.() || getWin().connectionStatusManager.getState() === "connected")) {
      chatSubtitle.textContent = formatDialogSubtitle(dialog);
    }
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
      messageList.classList.remove("direct-empty");
      messageList.classList.add("saved-empty");
      messageList.innerHTML = '<div class="saved-empty-state"><h3>' + escapeHtml(t("empty.savedHeader")) + '</h3><p>' + escapeHtml(t("empty.savedLine1")) + '</p><p>' + escapeHtml(t("empty.savedLine2")) + '</p></div>';
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
      messageList.classList.add("direct-empty");
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
      messageList.classList.add("direct-empty");
      messageList.innerHTML = '<div class="direct-empty-state"><div class="direct-empty-card"><h3>Group "' + groupName + '"</h3><p>Groups can have:</p><p>✓ Up to 20,000 members</p><p>✓ Persistent chat history</p><p>✓ Public links such as thegrapht.su/g/' + escapeHtml(dialog.publicId) + '</p><p>✓ Admins with different rights</p></div></div>';
      chatScrollBottom?.classList.remove("visible");
      getWin().isNearChatBottom = true;
      finishMessagesLoading();
      const finishDialogSwitchTransition = getWin().finishDialogSwitchTransition;
      if (typeof finishDialogSwitchTransition === "function") finishDialogSwitchTransition();
      return;
    }

    messageList.classList.remove("saved-empty", "direct-empty");
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
    const annotateFn = (typeof getWin().annotateMessageSequences === "function"
      ? getWin().annotateMessageSequences
      : (typeof getWin().annotateGroupIncomingSequences === "function"
        ? getWin().annotateGroupIncomingSequences
        : null));
    const normalizedItems = annotateFn ? annotateFn(renderableItems) : renderableItems;
    uiRenderDebug("renderMessages:normalized_items", {
      dialogType: dialog?.type || null,
      totalItems: Array.isArray(normalizedItems) ? normalizedItems.length : 0,
      groupItemsWithMeta: Array.isArray(normalizedItems)
        ? normalizedItems.filter((item) => item?.groupIncomingMeta).length
        : 0
    });

    const isChannelGuest = dialog.type === "channel" && dialog.channelIsMember !== true;
    const unreadAlreadyDismissed = Boolean(dialog.publicId && dismissedUnreadDividerDialogIds.has(dialog.publicId));
    let firstUnreadMessageId = null;
    if (
      !isChannelGuest
      && !unreadAlreadyDismissed
      && dialog.unreadCount > 0
      && mergedMessages.length >= dialog.unreadCount
    ) {
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
    messageList.innerHTML = "";
    const messageFragment = document.createDocumentFragment();
    const renderRenderableItemDom = getWin().renderRenderableItemDom;
    normalizedItems.forEach((item) => {
      if (firstUnreadMessageId && !renderedUnreadDivider && item.messages) {
        const hasFirstUnread = item.messages.some((m: any) => m && m.id === firstUnreadMessageId);
        if (hasFirstUnread) {
          renderedUnreadDivider = true;
          const unreadDivider = document.createElement("div");
          unreadDivider.className = "message-unread-divider";
          unreadDivider.innerHTML = "<span>" + escapeHtml(t("chat.unreadMessages")) + "</span>";
          messageFragment.appendChild(unreadDivider);
        }
      }

      const node = typeof renderRenderableItemDom === "function"
        ? renderRenderableItemDom(item)
        : null;
      if (node instanceof HTMLElement) {
        messageFragment.appendChild(node);
        return;
      }

      const html = item.kind === "day"
        ? renderDaySeparator(item.dayValue)
        : item.kind === "album"
          ? renderAlbumMessage(item.messages, { groupIncomingMeta: item.groupIncomingMeta, outgoingSeqMeta: item.outgoingSeqMeta })
          : renderSingleMessage(item.messages[0], { groupIncomingMeta: item.groupIncomingMeta, outgoingSeqMeta: item.outgoingSeqMeta });
      if (!html) {
        return;
      }
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = html;
      Array.from(tempContainer.children).forEach((fallbackNode) => {
        messageFragment.appendChild(fallbackNode);
      });
    });
    messageList.appendChild(messageFragment);

    if (typeof getWin().normalizeMessageDaySeparators === "function") {
      getWin().normalizeMessageDaySeparators();
    }
    if (typeof getWin().hydrateMessageImages === "function") {
      getWin().hydrateMessageImages({ lockToken: renderLockToken });
    }
    if (chatSearchPanel?.classList.contains("open")) {
      const renderChatSearchResultsLocal = getWin().renderChatSearchResults;
      if (typeof renderChatSearchResultsLocal === "function") renderChatSearchResultsLocal();
    }
    if (typeof syncActiveCallChipLocal === "function") syncActiveCallChipLocal();
    if (typeof getWin().prefetchDialogMedia === "function") {
      getWin().prefetchDialogMedia(mergedMessages);
    }
    if (shouldPrepareBottom) {
      getWin().bottomLockCanceledByUser = false;
      messageList.scrollTop = messageList.scrollHeight;
      hardPinMessagesToBottom(renderLockToken);
      dismissUnreadDivider(dialog.publicId);
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
    
    const shouldRestoreScrollTop = Boolean(options.restoreScrollOnOpen);
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
      getWin().currentDialogId = cachedPayload.dialog.id;
      getWin().currentDialogPublicId = cachedPayload.dialog.publicId;
      getWin().currentDialogSnapshot = cachedPayload.dialog;
      getWin().currentMessagesSnapshot = cachedPayload.messages || [];
      getWin().peerActiveInCurrentDialog = false;
      getWin().currentPeerReadAt = cachedPayload.dialog.peerReadAt || null;

      if (chatTitle) chatTitle.textContent = cachedPayload.dialog.title || "";
      if (chatSubtitle && (!getWin().connectionStatusManager?.getState?.() || getWin().connectionStatusManager.getState() === "connected")) {
        chatSubtitle.textContent = formatDialogSubtitle(cachedPayload.dialog) || "";
      }
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

      renderMessages(cachedPayload.dialog, cachedPayload.messages, {
        scrollBehavior: "auto",
        openingDialog: true,
        animateList: false,
        forceScrollBottom: true,
        restoreScrollTop: null
      });

      visitedDialogsInSession.add(cachedPayload.dialog.publicId);
      warmupDialogMediaInBackground(cachedPayload.messages, {
        targetPublicId: cachedPayload.dialog.publicId,
        targetLoadToken: loadToken
      });
    } else {
      const allDialogs = getWin().allDialogs || [];
      const previewDialog = allDialogs.find((d: any) => d.publicId === publicId);
      if (previewDialog) {
        getWin().currentDialogId = previewDialog.id;
        getWin().currentDialogPublicId = previewDialog.publicId;
        getWin().currentDialogSnapshot = previewDialog;
        getWin().currentMessagesSnapshot = [];
        
        if (chatTitle) chatTitle.textContent = previewDialog.title;
        if (chatSubtitle && (!getWin().connectionStatusManager?.getState?.() || getWin().connectionStatusManager.getState() === "connected")) {
          chatSubtitle.textContent = formatDialogSubtitle(previewDialog) || "";
        }
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

      if (messageList) {
        messageList.innerHTML = '<div class="chat-spinner-container">' + googleSpinnerMarkup(40) + '</div>';
      }
    }

    getWin().pendingAutoBottomDialogPublicId = publicId;
    getWin().pendingAutoBottomCanceled = false;
    getWin().forceBottomOnNextDialogRender = true;

    try {
      const preserveActiveAudioForLayoutChange = getWin().preserveActiveAudioForLayoutChange;
      if (typeof preserveActiveAudioForLayoutChange === "function") {
        preserveActiveAudioForLayoutChange();
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
      getWin().currentDialogSnapshot = preparedPayload.dialog;
      getWin().currentMessagesSnapshot = preparedPayload.messages || [];
      if (chatComposer) chatComposer.style.display = "flex";
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
          scrollBehavior: "auto",
          openingDialog: true,
          animateList: false,
          forceScrollBottom: true,
          restoreScrollTop: null
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
      if (
        preparedPayload.dialog?.publicId
        && (preparedPayload.dialog?.type !== "channel" || preparedPayload.dialog?.channelIsMember === true)
      ) {
        void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(preparedPayload.dialog.publicId) + "/read", {
          method: "POST"
        }).catch(() => {});
        const publicId = preparedPayload.dialog.publicId;
        getWin().allDialogs = (getWin().allDialogs || []).map((dialog: any) => dialog.publicId === publicId
          ? { ...dialog, unreadCount: 0 }
          : dialog);
        if (getWin().currentDialogSnapshot?.publicId === publicId) {
          getWin().currentDialogSnapshot = {
            ...getWin().currentDialogSnapshot,
            unreadCount: 0
          };
        }
        const badgeEl = document.querySelector('.dialog-item[data-public-id="' + CSS.escape(publicId) + '"] .dialog-unread-badge');
        if (badgeEl) {
          badgeEl.classList.add("is-hidden");
          badgeEl.textContent = "0";
        }
        const dialogButton = document.querySelector('.dialog-item[data-public-id="' + CSS.escape(publicId) + '"]') as HTMLElement | null;
        if (dialogButton) {
          dialogButton.dataset.dialogUnread = "0";
        }
        dismissUnreadDivider(publicId);
      }
      sendCurrentPresence();
    } catch (error) {
      getWin().pendingAutoBottomDialogPublicId = "";
      const finishDialogSwitchTransition = getWin().finishDialogSwitchTransition;
      if (typeof finishDialogSwitchTransition === "function") finishDialogSwitchTransition();
    }
  };

  let workspaceLoadInFlightPromise: Promise<void> | null = null;

  const loadWorkspace = (options: any = {}) => {
    uiRenderDebug("loadWorkspace:requested", { options, inFlight: Boolean(workspaceLoadInFlightPromise) });
    if (workspaceLoadInFlightPromise && !options.forceNew) {
      uiRenderDebug("loadWorkspace:joined_inflight", { options });
      return workspaceLoadInFlightPromise;
    }

    const previousWorkspaceLoad = workspaceLoadInFlightPromise;
    workspaceLoadInFlightPromise = (async () => {
      if (previousWorkspaceLoad) {
        try {
          await previousWorkspaceLoad;
        } catch {}
      }
      if (getWin().currentUserId) {
        uiRenderDebug("loadWorkspace:start_transition", { options });
        const startDialogSwitchTransition = getWin().startDialogSwitchTransition;
        if (typeof startDialogSwitchTransition === "function") startDialogSwitchTransition();
      }

      const channelRoute = getChannelRouteFromPath();
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
      if (channelRoute?.kind === "slug") {
        clientStateParams.set("channelSlug", channelRoute.slug);
      } else if (channelRoute?.kind === "invite") {
        clientStateParams.set("channelInviteToken", channelRoute.inviteToken);
      } else if (routePublicId) {
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
      getWin().currentUserAvatarUpdatedAt = String(
        payload?.user?.avatarUpdatedAt
        || payload?.user?.avatar_updated_at
        || payload?.user?.createdAt
        || getWin().currentUserAvatarUpdatedAt
        || ""
      ).trim();
      getWin().currentUserCreatedAt = String(payload?.user?.createdAt || "").trim();
      getWin().currentUser = payload.user;
      getWin().syncUserFromLegacy?.(payload.user);
      const secureFeatureState = getWin().secureFeatureState;
      if (secureFeatureState) {
        secureFeatureState.identityPromise = null;
        secureFeatureState.publishPromise = null;
      }
      const hydrateDialogPreviewsForSidebar = async (dialogs: any[]) => Array.isArray(dialogs) ? dialogs : [];

      if (workspaceUserName) workspaceUserName.textContent = getWin().currentUserDisplayName;
      const parsedDialogs = await hydrateDialogPreviewsForSidebar(payload.dialogs || []);
      getWin().allDialogs = parsedDialogs;
      getWin().syncStoreFromLegacy?.({ dialogs: parsedDialogs });
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
      finishBoot(true);
      getWin().forceBottomOnNextDialogRender = Boolean(finalSelection.dialog?.publicId) && options.scrollBehavior !== "none";
      try {
        renderMessages(finalSelection.dialog, finalSelection.messages, {
          scrollBehavior: options.scrollBehavior || "auto",
          animateList: false,
          forceScrollBottom: Boolean(finalSelection.dialog?.publicId)
        });
      } catch (error) {
        console.warn("renderMessages failed during workspace load:", error);
      }
      if (finalSelection.dialog?.publicId) {
        if (channelRoute?.kind === "slug" && finalSelection.dialog.channelSlug) {
          const slugPath = "/c/" + encodeURIComponent(finalSelection.dialog.channelSlug);
          if (window.location.pathname !== slugPath) {
            window.history.pushState({}, "", slugPath);
          }
        } else if (channelRoute?.kind === "invite" && finalSelection.dialog.channelInviteToken) {
          const invitePath = "/c/+" + encodeURIComponent(finalSelection.dialog.channelInviteToken);
          if (window.location.pathname !== invitePath) {
            window.history.pushState({}, "", invitePath);
          }
        } else {
          applyRoute(finalSelection.dialog.publicId);
        }
      }
      const syncComposerState = getWin().syncComposerState;
      if (typeof syncComposerState === "function") {
        syncComposerState();
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
      getWin().syncStoreFromLegacy?.({
        user: payload.user,
        dialogs: getWin().allDialogs,
        currentDialog: finalSelection.dialog || null,
        messages: getWin().currentMessagesSnapshot,
        peerReadAt: getWin().currentPeerReadAt || null
      });
      if (getWin().pendingDialogPublicIdFromNotification && finalSelection.dialog?.publicId === getWin().pendingDialogPublicIdFromNotification) {
        getWin().pendingDialogPublicIdFromNotification = "";
      }
      const bindNotificationPermissionPrompt = getWin().bindNotificationPermissionPrompt;
      if (typeof bindNotificationPermissionPrompt === "function") bindNotificationPermissionPrompt();
      scheduleBackgroundRefresh();
      sendCurrentPresence();
    })();

    const nextWorkspaceLoad = workspaceLoadInFlightPromise;
    return nextWorkspaceLoad.finally(() => {
      uiRenderDebug("loadWorkspace:finished");
      if (workspaceLoadInFlightPromise === nextWorkspaceLoad) {
        workspaceLoadInFlightPromise = null;
      }
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
      currentSearchChannels = [];
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
          currentSearchChannels = payload.channels || [];
          renderSearchResults(currentSearchResults, currentSearchChannels);
        } catch (error: any) {
          if (requestId !== searchRequestId) {
            return;
          }

          currentSearchResults = [];
          currentSearchChannels = [];
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

  sidebarComposeChannel?.addEventListener("click", () => {
    openChannelCreatePanel();
  });
  
  sidebarComposeGroup?.addEventListener("click", () => {
    groupCreateMode = "group";
    if (groupCreateStepMembersTitle) {
      groupCreateStepMembersTitle.textContent = t("group.addMembers");
    }
    if (groupCreateSearchInput) {
      groupCreateSearchInput.placeholder = t("group.addPeople");
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

  channelCreateClose?.addEventListener("click", () => closeChannelCreatePanel());
  channelCreateTypeBack?.addEventListener("click", () => setChannelCreateStep(1));
  channelCreateNext?.addEventListener("click", () => {
    const channelName = channelCreateNameInput ? (channelCreateNameInput.value || "").trim() : "";
    if (!channelName) {
      return;
    }
    syncChannelCreateVisibilityUi();
    setChannelCreateStep(2);
  });
  channelCreateSubmit?.addEventListener("click", () => {
    const channelName = channelCreateNameInput ? (channelCreateNameInput.value || "").trim() : "";
    const visibility = getSelectedChannelVisibility();
    const slugValue = channelCreateSlugInput ? (channelCreateSlugInput.value || "").trim().toLowerCase() : "";
    if (!channelName) {
      return;
    }
    if (visibility === "public" && (!slugValue || channelCreateSlugStatus !== "available")) {
      syncChannelSlugValidationUi();
      return;
    }
    (async () => {
      try {
        const apiBase = getWin().apiBase || "/api";
        const payload = await fetchJson(apiBase + "/v1/dialogs/channel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: channelName,
            description: channelCreateDescriptionInput ? (channelCreateDescriptionInput.value || "").trim() : "",
            avatarDataUrl: channelCreatePhotoDataUrl || undefined,
            visibility,
            slug: visibility === "public" ? slugValue : undefined
          })
        });
        const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.messages || []);
        if (!preparedPayload.dialog?.publicId) {
          throw new Error("Failed to create channel.");
        }
        setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
        const updateDialogInState = getWin().updateDialogInState;
        const updatedDialog = typeof updateDialogInState === "function"
          ? updateDialogInState(preparedPayload.dialog, {
            lastMessagePreview: "You created a channel",
            lastMessageSenderName: "You",
            lastMessageCreatedAt: new Date().toISOString()
          })
          : null;
        if (!updatedDialog) {
          getWin().allDialogs.unshift({
            ...preparedPayload.dialog,
            lastMessagePreview: "You created a channel",
            lastMessageSenderName: "You",
            lastMessageCreatedAt: new Date().toISOString()
          });
        }
        if (!currentSearchQuery.trim()) {
          renderDialogs(getWin().allDialogs);
        }
        applyRoute(preparedPayload.dialog.publicId);
        closeChannelCreatePanel();
        await loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
      } catch (error: any) {
        const message = error instanceof Error ? error.message : "Failed to create channel.";
        if (message.toLowerCase().includes("link is invalid")) {
          channelCreateSlugStatus = "invalid";
          syncChannelSlugValidationUi();
        }
        showToast(message, "error");
      }
    })();
  });
  channelVisibilityInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncChannelCreateVisibilityUi();
      scheduleChannelSlugCheck();
    });
  });
  channelCreateSlugInput?.addEventListener("input", () => {
    scheduleChannelSlugCheck();
  });
  channelCreateNameInput?.addEventListener("input", () => {
    syncChannelCreateActions();
  });
  channelCreatePhotoButton?.addEventListener("click", () => {
    channelCreatePhotoInput?.click();
  });
  channelCreatePhotoInput?.addEventListener("change", () => {
    const file = channelCreatePhotoInput.files && channelCreatePhotoInput.files[0] ? channelCreatePhotoInput.files[0] : null;
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      channelCreatePhotoDataUrl = result;
      if (channelCreatePhotoPreview && result) {
        channelCreatePhotoPreview.src = result;
        channelCreatePhotoButton?.classList.add("has-photo");
      }
    };
    reader.readAsDataURL(file);
    channelCreatePhotoInput.value = "";
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
          const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + pal[0] + '"/><stop offset="100%" stop-color="' + pal[1] + '"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#pg)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Open Sans, sans-serif" font-size="56" font-weight="700">' + escapeHtml(ltr) + '</text></svg>';
          sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '" alt="' + escapeHtml(ltr) + '" />';
          sidebarProfileAvatarEl.style.cssText = "--avatar-start:" + pal[0] + ";--avatar-end:" + pal[1] + ";";
        }
      }
    }
    void fetchAndUpdateSessionsCount();
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

  // --- ACTIVE SESSIONS LOGIC ---
  const fetchAndUpdateSessionsCount = async () => {
    try {
      const fetchJsonFn = getWin().fetchJson;
      const data = typeof fetchJsonFn === "function"
        ? await fetchJsonFn((getWin().apiBase || "/api") + "/v1/auth/sessions")
        : null;
      if (data) {
        const badge = document.getElementById("sidebar-profile-device-badge");
        if (badge) badge.textContent = String(data.count || 1);
        return data;
      }
    } catch (err) {
      console.warn("Failed to fetch sessions count:", err);
    }
    return null;
  };

  (window as any).updateActiveSessionsUI = async () => {
    const data = await fetchAndUpdateSessionsCount();
    const activeSessionsPanel = document.getElementById("active-sessions-panel");
    if (data && activeSessionsPanel && activeSessionsPanel.classList.contains("open")) {
      renderActiveSessions(data);
    }
  };

  const renderActiveSessions = (data: any) => {
    const currentCard = document.getElementById("current-device-card");
    const activeList = document.getElementById("active-devices-list");
    if (!currentCard || !activeList) return;

    const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
    const currentSession = sessions.find((s: any) => s.isCurrent) || sessions.find((s: any) => s.id === data?.currentSessionId) || null;
    const otherSessions = sessions.filter((s: any) => s.id !== currentSession?.id);
    const label = (key: string, fallback: string) => {
      const translated = t(key);
      return translated === key ? fallback : translated;
    };
    const getActivity = (session: any) => {
      if (session?.isCurrent) return label("status.online", "online");
      const timestamp = new Date(session?.lastSeenAt || 0).getTime();
      if (!timestamp) return "";
      const seconds = Math.round((timestamp - Date.now()) / 1000);
      if (seconds > -90) return label("status.online", "online");
      const locale = getCurrentLanguageCode() || navigator.language;
      const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      if (seconds > -3600) return formatter.format(Math.round(seconds / 60), "minute");
      if (seconds > -86400) return formatter.format(Math.round(seconds / 3600), "hour");
      if (seconds > -604800) return formatter.format(Math.round(seconds / 86400), "day");
      return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(timestamp));
    };
    const getLocation = (session: any) => [
      String(session?.location || "").trim() || label("activeSessions.unknownLocation", "Unknown location"),
      getActivity(session)
    ].filter(Boolean).join(" • ");

    const getPlatformIconSvg = (type: string) => {
      const t = String(type || "").toLowerCase();
      if (t.includes("android")) {
        return '<div class="session-icon-circle android"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M1 18q.25-2.625 1.6-4.775t3.475-3.5L4.15 6.5q-.225-.35-.112-.75t.462-.6q.35-.225.75-.125t.6.45l2 3.325q.95-.4 1.988-.6T12 8t2.163.2t1.987.6l2-3.325q.2-.35.6-.45t.75.125q.35.2.45.6t-.1.75l-1.925 3.225q2.125 1.35 3.475 3.5T23 18zm17.013-3.787q.037-.438-.238-.863t-.675-.55t-.725.1t-.375.65t.225.85t.688.563t.737-.088t.363-.663M7.1 14.95q.4-.125.675-.55t.238-.862t-.363-.663t-.737-.088t-.688.563T6 14.2t.375.65t.725.1"/></svg></div>';
      } else if (t.includes("ios") || t.includes("iphone") || t.includes("ipad")) {
        return '<div class="session-icon-circle apple"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25"/></svg></div>';
      } else if (t.includes("mac") || t.includes("apple")) {
        return '<div class="session-icon-circle apple"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M14 18v2l2 1v1H8l-.004-.996L10 20v-2H2.992A1 1 0 0 1 2 16.992V4.008C2 3.451 2.455 3 2.992 3h18.016c.548 0 .992.449.992 1.007v12.985c0 .557-.455 1.008-.992 1.008zM4 5v9h16V5z"/></svg></div>';
      } else if (t.includes("linux") || t.includes("ubuntu")) {
        return '<div class="session-icon-circle linux"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M19.7 17.6c-.1-.2-.2-.4-.2-.6c0-.4-.2-.7-.5-1c-.1-.1-.3-.2-.4-.2c.6-1.8-.3-3.6-1.3-4.9c-.8-1.2-2-2.1-1.9-3.7c0-1.9.2-5.4-3.3-5.1c-3.6.2-2.6 3.9-2.7 5.2c0 1.1-.5 2.2-1.3 3.1c-.2.2-.4.5-.5.7c-1 1.2-1.5 2.8-1.5 4.3c-.2.2-.4.4-.5.6c-.1.1-.2.2-.2.3c-.1.1-.3.2-.5.3c-.4.1-.7.3-.9.7c-.1.3-.2.7-.1 1.1c.1.2.1.4 0 .7c-.2.4-.2.9 0 1.4c.3.4.8.5 1.5.6c.5 0 1.1.2 1.6.4c.5.3 1.1.5 1.7.5c.3 0 .7-.1 1-.2c.3-.2.5-.4.6-.7c.4 0 1-.2 1.7-.2c.6 0 1.2.2 2 .1c0 .1 0 .2.1.3c.2.5.7.9 1.3 1h.2c.8-.1 1.6-.5 2.1-1.1c.4-.4.9-.7 1.4-.9c.6-.3 1-.5 1.1-1c.1-.7-.1-1.1-.5-1.7M12.8 4.8c.6.1 1.1.6 1 1.2q0 .45-.3.9h-.1c-.2-.1-.3-.1-.4-.2c.1-.1.1-.3.2-.5c0-.4-.2-.7-.4-.7c-.3 0-.5.3-.5.7v.1c-.1-.1-.3-.1-.4-.2V6c-.1-.5.3-1.1.9-1.2m-.3 2c.1.1.3.2.4.2s.3.1.4.2c.2.1.4.2.4.5s-.3.6-.9.8c-.2.1-.3.1-.4.2c-.3.2-.6.3-1 .3c-.3 0-.6-.2-.8-.4c-.1-.1-.2-.2-.4-.3c-.1-.1-.3-.3-.4-.6c0-.1.1-.2.2-.3c.3-.2.4-.3.5-.4l.1-.1c.2-.3.6-.5 1-.5c.3.1.6.2.9.4M10.4 5c.4 0 .7.4.8 1.1v.2c-.1 0-.3.1-.4.2v-.2c0-.3-.2-.6-.4-.5c-.2 0-.3.3-.3.6c0 .2.1.3.2.4c0 0-.1.1-.2.1c-.2-.2-.4-.5-.4-.8c0-.6.3-1.1.7-1.1m-1 16.1c-.7.3-1.6.2-2.2-.2c-.6-.3-1.1-.4-1.8-.4c-.5-.1-1-.1-1.1-.3s-.1-.5.1-1q.15-.45 0-.9c-.1-.3-.1-.5 0-.8s.3-.4.6-.5s.5-.2.7-.4c.1-.1.2-.2.3-.4c.3-.4.5-.6.8-.6c.6.1 1.1 1 1.5 1.9c.2.3.4.7.7 1c.4.5.9 1.2.9 1.6c0 .5-.2.8-.5 1m4.9-2.2c0 .1 0 .1-.1.2c-1.2.9-2.8 1-4.1.3l-.6-.9c.9-.1.7-1.3-1.2-2.5c-2-1.3-.6-3.7.1-4.8c.1-.1.1 0-.3.8c-.3.6-.9 2.1-.1 3.2c0-.8.2-1.6.5-2.4c.7-1.3 1.2-2.8 1.5-4.3c.1.1.1.1.2.1c.1.1.2.2.3.2c.2.3.6.4.9.4h.1c.4 0 .8-.1 1.1-.4c.1-.1.2-.2.4-.2q.45-.15.9-.6c.4 1.3.8 2.5 1.4 3.6c.4.8.7 1.6.9 2.5c.3 0 .7.1 1 .3c.8.4 1.1.7 1 1.2H18c0-.3-.2-.6-.9-.9s-1.3-.3-1.5.4c-.1 0-.2.1-.3.1c-.8.4-.8 1.5-.9 2.6c.1.4 0 .7-.1 1.1m4.6.6c-.6.2-1.1.6-1.5 1.1c-.4.6-1.1 1-1.9.9c-.4 0-.8-.3-.9-.7c-.1-.6-.1-1.2.2-1.8c.1-.4.2-.7.3-1.1c.1-1.2.1-1.9.6-2.2c0 .5.3.8.7 1c.5 0 1-.1 1.4-.5h.2c.3 0 .5 0 .7.2s.3.5.3.7c0 .3.2.6.3.9c.5.5.5.8.5.9c-.1.2-.5.4-.9.6m-9-12c-.1 0-.1 0-.1.1c0 0 0 .1.1.1s.1.1.1.1c.3.4.8.6 1.4.7c.5-.1 1-.2 1.5-.6l.6-.3c.1 0 .1-.1.1-.1c0-.1 0-.1-.1-.1c-.2.1-.5.2-.7.3c-.4.3-.9.5-1.4.5s-.9-.3-1.2-.6c-.1 0-.2-.1-.3-.1"/></svg></div>';
      } else if (t.includes("chrome") || t.includes("browser")) {
        return '<div class="session-icon-circle chrome"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M6.804 15a6 6 0 0 0 6.423 2.873l-2.346 4.063C5.885 21.379 2 17.144 2 12c0-1.395.287-2.723.803-3.93zm14.361-7A10 10 0 0 1 22 12c0 5.118-3.844 9.334-8.803 9.926l4-6.926l-.003-.001A5.97 5.97 0 0 0 18 12a5.98 5.98 0 0 0-1.53-4zM12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8m0-6a9.99 9.99 0 0 1 8.001 4H12a6 6 0 0 0-5.7 4.126L3.953 6.063A9.99 9.99 0 0 1 12 2"/></svg></div>';
      }
      return '<div class="session-icon-circle windows"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M22 2L11.2 3.6v8l10.8-.1zM10.2 12.5L2 12.4v6.8l8.1 1.1zM2 4.8v6.8h8.1V3.7zm9.1 7.7v7.9L22 22v-9.4z"/></svg></div>';
    };

    currentCard.innerHTML = currentSession ? `
      ${getPlatformIconSvg([currentSession.deviceType, currentSession.os, currentSession.browser].join(" "))}
      <div class="session-card-info">
        <h4 class="session-device-name">${escapeHtml(currentSession.deviceName || label("activeSessions.unknownDevice", "Unknown device"))}</h4>
        <p class="session-app-info">${escapeHtml(currentSession.appInfo || [currentSession.browser, currentSession.os].filter(Boolean).join(" • "))}</p>
        <p class="session-location-info">${escapeHtml(getLocation(currentSession))}</p>
      </div>
      <div class="session-card-actions">
        <button class="session-rename-btn" data-session-id="${escapeHtml(currentSession.id)}" type="button">${escapeHtml(label("activeSessions.rename", "Rename"))}</button>
      </div>
    ` : `<p class="active-sessions-help-text">${escapeHtml(label("activeSessions.loadFailed", "Failed to load active sessions."))}</p>`;

    const terminateBtn = document.getElementById("terminate-other-sessions-btn") as HTMLButtonElement | null;
    if (terminateBtn) {
      if (otherSessions.length === 0) {
        terminateBtn.disabled = true;
        terminateBtn.classList.add("disabled");
        terminateBtn.title = label("activeSessions.noOtherSessions", "No other active sessions to terminate");
      } else {
        terminateBtn.disabled = false;
        terminateBtn.classList.remove("disabled");
        terminateBtn.title = "";
      }
    }

    if (otherSessions.length === 0) {
      activeList.innerHTML = `<p class="active-sessions-help-text" style="margin: 8px 4px;">${escapeHtml(label("activeSessions.noOtherDevices", "No other active devices."))}</p>`;
    } else {
      activeList.innerHTML = otherSessions.map((session: any) => `
        <div class="session-card" data-session-id="${escapeHtml(session.id)}">
          ${getPlatformIconSvg([session.deviceType, session.os, session.browser].join(" "))}
          <div class="session-card-info">
            <h4 class="session-device-name">${escapeHtml(session.deviceName || label("activeSessions.unknownDevice", "Unknown device"))}</h4>
            <p class="session-app-info">${escapeHtml(session.appInfo || [session.browser, session.os].filter(Boolean).join(" • "))}</p>
            <p class="session-location-info">${escapeHtml(getLocation(session))}</p>
          </div>
          <div class="session-card-actions">
            <button class="session-close-btn terminate-single-session-btn" data-session-id="${escapeHtml(session.id)}" type="button" aria-label="Terminate session">&times;</button>
          </div>
        </div>
      `).join("");
    }
  };

  // Confirmation Modal Handler
  let pendingTerminateAction: (() => Promise<void>) | null = null;
  const confirmModal = document.getElementById("terminate-confirm-modal");
  const confirmText = document.getElementById("terminate-confirm-text");
  const confirmCancel = document.getElementById("terminate-confirm-cancel");
  const confirmSubmit = document.getElementById("terminate-confirm-submit");

  const openConfirmModal = (text: string, action: () => Promise<void>) => {
    if (!confirmModal) return;
    if (confirmText) confirmText.textContent = text;
    pendingTerminateAction = action;
    const activeCard = document.querySelector(".active-sessions-card");
    if (activeCard) activeCard.classList.add("modal-blur-active");
    confirmModal.classList.add("open");
    confirmModal.setAttribute("aria-hidden", "false");
  };

  const closeConfirmModal = () => {
    if (!confirmModal) return;
    confirmModal.classList.remove("open");
    confirmModal.setAttribute("aria-hidden", "true");
    pendingTerminateAction = null;
    const activeCard = document.querySelector(".active-sessions-card");
    if (activeCard) activeCard.classList.remove("modal-blur-active");
  };

  confirmCancel?.addEventListener("click", closeConfirmModal);
  confirmModal?.querySelector(".session-confirm-modal-backdrop")?.addEventListener("click", closeConfirmModal);
  confirmSubmit?.addEventListener("click", async () => {
    if (pendingTerminateAction) {
      const action = pendingTerminateAction;
      closeConfirmModal();
      await action();
    }
  });

  // Open Active Sessions Modal
  const openActiveSessionsPanel = async () => {
    const activeSessionsPanel = document.getElementById("active-sessions-panel");
    if (!activeSessionsPanel) return;
    gsapOpenSidebar(activeSessionsPanel);
    const currentCard = document.getElementById("current-device-card");
    const activeList = document.getElementById("active-devices-list");
    if (currentCard) currentCard.innerHTML = `<p class="active-sessions-help-text">${escapeHtml(t("activeSessions.loading") === "activeSessions.loading" ? "Loading sessions…" : t("activeSessions.loading"))}</p>`;
    if (activeList) activeList.innerHTML = "";
    const data = await fetchAndUpdateSessionsCount();
    if (data) {
      renderActiveSessions(data);
    }
  };

  // Devices menu click
  const devicesBtn = document.getElementById("sidebar-profile-devices-btn");
  devicesBtn?.addEventListener("click", () => {
    openActiveSessionsPanel();
  });

  // Language Selection Modal Handler
  let tempSelectedLang = getCurrentLanguageCode();
  const languagePanel = document.getElementById("language-select-panel");
  const languageBtn = document.getElementById("sidebar-profile-language-btn");
  const languageListContainer = document.getElementById("language-list-container");
  const languageSearchInput = document.getElementById("language-search-input") as HTMLInputElement | null;

  const APPLE_FLAG_EMOJI_MAP: Record<string, string> = {
    gb: "1f1ec-1f1e7",
    ru: "1f1f7-1f1fa",
    by: "1f1e7-1f1fe",
    ad: "1f1e6-1f1e9",
    cn: "1f1e8-1f1f3",
    tw: "1f1f9-1f1fc",
    hr: "1f1ed-1f1f7",
    cz: "1f1e8-1f1ff",
    nl: "1f1f3-1f1f1",
    fi: "1f1eb-1f1ee",
    fr: "1f1eb-1f1f7",
    de: "1f1e9-1f1ea",
    id: "1f1ee-1f1e9",
    it: "1f1ee-1f1f9",
    kz: "1f1f0-1f1ff",
    kr: "1f1f0-1f1f7",
    my: "1f1f2-1f1fe",
    no: "1f1f3-1f1f4",
    pl: "1f1f5-1f1f1",
    br: "1f1e7-1f1f7",
    ro: "1f1f7-1f1f4",
    rs: "1f1f7-1f1f8",
    es: "1f1ea-1f1f8",
    tr: "1f1f9-1f1f7",
    ua: "1f1fa-1f1e6"
  };

  const preloadLanguageFlagImages = () => {
    Object.values(APPLE_FLAG_EMOJI_MAP).forEach((hex) => {
      const img = new Image();
      img.src = `/assets/emoji/apple-64/${hex}.png`;
    });
    const checkImg = new Image();
    checkImg.src = "/assets/emoji/apple-64/2705.png";
  };
  preloadLanguageFlagImages();

  const renderLanguageList = (filterText: string = "") => {
    if (!languageListContainer) return;
    const query = filterText.trim().toLowerCase();
    const filtered = LANGUAGES.filter(
      (l) => l.nativeName.toLowerCase().includes(query) || l.englishName.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      languageListContainer.innerHTML = `
        <div class="language-empty-state">
          <div class="language-empty-title" data-i18n="language.notFoundTitle">${escapeHtml(t("language.notFoundTitle"))}</div>
          <div class="language-empty-desc" data-i18n="language.notFoundDesc">${escapeHtml(t("language.notFoundDesc"))}</div>
        </div>
      `;
      return;
    }

    languageListContainer.innerHTML = filtered.map((lang) => {
      const isSelected = lang.code === tempSelectedLang;
      const emojiHex = APPLE_FLAG_EMOJI_MAP[lang.iso] || "1f1ec-1f1e7";
      return `
        <label class="language-option-item ${isSelected ? "active" : ""}" data-lang-code="${lang.code}">
          <input type="radio" name="selected_language" value="${lang.code}" ${isSelected ? "checked" : ""} class="language-radio" />
          <div class="language-check-box">
            <img src="/assets/emoji/apple-64/2705.png" alt="Selected" class="language-check-emoji" />
          </div>
          <img src="/assets/emoji/apple-64/${emojiHex}.png" alt="${escapeHtml(lang.englishName)}" class="language-flag-img" />
          <div class="language-option-text">
            <div class="language-native-name">${escapeHtml(lang.nativeName)}</div>
            <div class="language-english-name">${escapeHtml(lang.englishName)}</div>
          </div>
        </label>
      `;
    }).join("");

    languageListContainer.querySelectorAll(".language-option-item").forEach((item) => {
      item.addEventListener("click", () => {
        const code = item.getAttribute("data-lang-code");
        if (code && code !== tempSelectedLang) {
          tempSelectedLang = code;
          setLanguageCode(code);
          renderLanguageList(languageSearchInput?.value || "");
        }
      });
    });
  };

  const openLanguagePanel = () => {
    if (!languagePanel) return;
    tempSelectedLang = getCurrentLanguageCode();
    if (languageSearchInput) languageSearchInput.value = "";
    renderLanguageList();
    gsapOpenSidebar(languagePanel);
    window.requestAnimationFrame(() => languageSearchInput?.focus());
  };

  languageBtn?.addEventListener("click", () => {
    openLanguagePanel();
  });

  languageSearchInput?.addEventListener("input", (e) => {
    renderLanguageList((e.target as HTMLInputElement).value);
  });

  languageListContainer?.addEventListener("change", (event) => {
    const input = event.target as HTMLInputElement;
    if (input.name !== "selected_language" || !input.value || input.value === tempSelectedLang) return;
    tempSelectedLang = input.value;
    setLanguageCode(input.value);
    renderLanguageList(languageSearchInput?.value || "");
  });

  const requestLanguageClose = () => {
    if (languagePanel) gsapCloseSidebar(languagePanel);
  };

  document.getElementById("language-select-back")?.addEventListener("click", requestLanguageClose);
  document.getElementById("language-select-close")?.addEventListener("click", requestLanguageClose);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (renameModal?.classList.contains("open")) return closeRenameModal();
    if (confirmModal?.classList.contains("open")) return closeConfirmModal();
    if (languagePanel?.classList.contains("open")) return gsapCloseSidebar(languagePanel);
    const activeSessionsPanel = document.getElementById("active-sessions-panel");
    if (activeSessionsPanel?.classList.contains("open")) gsapCloseSidebar(activeSessionsPanel);
  });

  // Apply initial translations on page load
  applyTranslations();

  // Back & Close buttons
  document.getElementById("active-sessions-back")?.addEventListener("click", () => {
    const activeSessionsPanel = document.getElementById("active-sessions-panel");
    if (activeSessionsPanel) gsapCloseSidebar(activeSessionsPanel);
  });
  document.getElementById("active-sessions-close")?.addEventListener("click", () => {
    const activeSessionsPanel = document.getElementById("active-sessions-panel");
    if (activeSessionsPanel) gsapCloseSidebar(activeSessionsPanel);
  });

  // Terminate All Other Sessions
  document.getElementById("terminate-other-sessions-btn")?.addEventListener("click", () => {
    const terminateBtn = document.getElementById("terminate-other-sessions-btn") as HTMLButtonElement | null;
    if (terminateBtn?.disabled) {
      const showToastFn = (window as any).showToast;
      if (typeof showToastFn === "function") {
        showToastFn(t("activeSessions.noOtherSessions") === "activeSessions.noOtherSessions" ? "You have no other active sessions to terminate." : t("activeSessions.noOtherSessions"), "info");
      }
      return;
    }

    openConfirmModal(t("activeSessions.confirmAll") === "activeSessions.confirmAll" ? "Are you sure you want to terminate all other sessions?" : t("activeSessions.confirmAll"), async () => {
      try {
        await getWin().fetchJson((getWin().apiBase || "/api") + "/v1/auth/sessions/terminate-other", { method: "POST" });
        const activeList = document.getElementById("active-devices-list");
        if (activeList) {
          const cards = activeList.querySelectorAll(".session-card");
          cards.forEach((card) => card.classList.add("removing"));
          setTimeout(() => void (window as any).updateActiveSessionsUI?.(), 300);
        }
      } catch (err) {
        console.error("Failed to terminate other sessions:", err);
      }
    });
  });

  // Terminate Single Session (Delegate click)
  document.getElementById("active-devices-list")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest(".terminate-single-session-btn") as HTMLElement | null;
    if (!btn) return;
    const sessionId = btn.getAttribute("data-session-id");
    if (!sessionId) return;

    openConfirmModal(t("activeSessions.confirmOne") === "activeSessions.confirmOne" ? "Are you sure you want to terminate this session?" : t("activeSessions.confirmOne"), async () => {
      try {
        await getWin().fetchJson((getWin().apiBase || "/api") + `/v1/auth/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
        const card = btn.closest(".session-card");
        if (card) {
          card.classList.add("removing");
          setTimeout(() => {
            card.remove();
            void (window as any).updateActiveSessionsUI?.();
          }, 300);
        }
        fetchAndUpdateSessionsCount();
      } catch (err) {
        console.error("Failed to terminate session:", err);
      }
    });
  });

  const renameModal = document.getElementById("session-rename-modal");
  const renameForm = document.getElementById("session-rename-form") as HTMLFormElement | null;
  const renameInput = document.getElementById("session-rename-input") as HTMLInputElement | null;
  let renamedSessionId = "";
  const closeRenameModal = () => {
    renameModal?.classList.remove("open");
    renameModal?.setAttribute("aria-hidden", "true");
    renamedSessionId = "";
  };
  document.getElementById("session-rename-cancel")?.addEventListener("click", closeRenameModal);
  renameModal?.querySelector(".session-confirm-modal-backdrop")?.addEventListener("click", closeRenameModal);
  document.getElementById("active-sessions-panel")?.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLElement>(".session-rename-btn");
    if (!button?.dataset.sessionId || !renameModal || !renameInput) return;
    renamedSessionId = button.dataset.sessionId;
    renameInput.value = document.querySelector("#current-device-card .session-device-name")?.textContent?.trim() || "";
    renameModal.classList.add("open");
    renameModal.setAttribute("aria-hidden", "false");
    window.setTimeout(() => renameInput.select(), 50);
  });
  renameForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const deviceName = String(renameInput?.value || "").trim();
    if (!renamedSessionId || !deviceName) return;
    const sessionId = renamedSessionId;
    closeRenameModal();
    try {
      await getWin().fetchJson((getWin().apiBase || "/api") + `/v1/auth/sessions/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName })
      });
      getWin().showToast?.(t("activeSessions.renamed") === "activeSessions.renamed" ? "Device renamed" : t("activeSessions.renamed"), "success");
      await (window as any).updateActiveSessionsUI?.();
    } catch {
      getWin().showToast?.(t("activeSessions.renameFailed") === "activeSessions.renameFailed" ? "Failed to rename device." : t("activeSessions.renameFailed"), "error");
    }
  });

  window.setInterval(() => {
    if (document.visibilityState === "visible" && document.getElementById("active-sessions-panel")?.classList.contains("open")) {
      void (window as any).updateActiveSessionsUI?.();
    }
  }, 10000);
  window.addEventListener("focus", () => {
    if (document.getElementById("active-sessions-panel")?.classList.contains("open")) void (window as any).updateActiveSessionsUI?.();
  });


  const avatarEl = document.getElementById("sidebar-profile-avatar");
  avatarEl?.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
  avatarEl?.addEventListener("click", () => {
    const avatarImg = avatarEl.querySelector("img") as HTMLImageElement | null;
    const avatarUrl = avatarImg ? avatarImg.src : "";
    const realAvatarUrl = String(getWin().currentUserAvatarUrl || "").trim();
    if (avatarUrl && !avatarUrl.startsWith("data:image/svg+xml") && realAvatarUrl && !realAvatarUrl.startsWith("data:image/svg+xml")) {
      const displayName = getWin().currentUserDisplayName || "User";
      const userId = getWin().currentUserId;
      const createdAt = getWin().currentUserAvatarUpdatedAt
        || getWin().currentUserCreatedAt;
      (window as any).openViewerModal?.({
        src: realAvatarUrl || avatarUrl,
        senderName: displayName,
        senderId: userId,
        createdAt: createdAt,
        realAvatarUrl
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

  const compressAvatarImage = (base64Data: string, maxSize = 512, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(base64Data);
        }
      };
      img.onerror = () => resolve(base64Data);
      img.src = base64Data;
    });
  };

  const uploadUserAvatar = async (base64Data: string) => {
    const apiBase = getWin().apiBase || "/api";
    try {
      const compressed = await compressAvatarImage(base64Data);
      const res = await fetch(apiBase + "/v1/users/avatar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ avatarDataUrl: compressed })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user?.avatarUpdatedAt) {
          getWin().currentUserAvatarUpdatedAt = data.user.avatarUpdatedAt;
        } else {
          getWin().currentUserAvatarUpdatedAt = new Date().toISOString();
        }
      } else {
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
  const SIDEBAR_WIDTH_STORAGE_KEY = "thegrapht_sidebar_width";
  const DEFAULT_SIDEBAR_WIDTH = 380;
  const COLLAPSED_SIDEBAR_WIDTH = 78;
  const MIN_EXPANDED_SIDEBAR_WIDTH = 280;
  const COLLAPSED_SNAP_WIDTH = 180;
  const MIN_SIDEBAR_WIDTH = COLLAPSED_SIDEBAR_WIDTH;

  const getMaxSidebarWidth = () => {
    const viewportWidth = window.innerWidth || 0;
    return Math.max(MIN_EXPANDED_SIDEBAR_WIDTH, Math.min(920, Math.floor(viewportWidth * 0.5)));
  };

  const clampSidebarWidth = (val: number) => {
    return Math.max(MIN_SIDEBAR_WIDTH, Math.min(getMaxSidebarWidth(), Math.round(val)));
  };

  const snapSidebarWidth = (val: number) => {
    const clamped = clampSidebarWidth(val);
    if (clamped <= COLLAPSED_SNAP_WIDTH) {
      return COLLAPSED_SIDEBAR_WIDTH;
    }
    return clamped;
  };

  const collapseProgress = (width: number) => {
    if (width <= COLLAPSED_SIDEBAR_WIDTH) {
      return 1;
    }
    if (width >= MIN_EXPANDED_SIDEBAR_WIDTH) {
      return 0;
    }
    return (MIN_EXPANDED_SIDEBAR_WIDTH - width) / (MIN_EXPANDED_SIDEBAR_WIDTH - COLLAPSED_SIDEBAR_WIDTH);
  };

  const applySidebarWidth = (width: number, persist = false) => {
    const nextWidth = clampSidebarWidth(width);
    const collapse = collapseProgress(nextWidth);
    const workspaceShell = document.querySelector(".workspace-shell") as HTMLElement;
    workspaceShell?.style.setProperty("--sidebar-width", nextWidth + "px");
    workspaceShell?.style.setProperty("--sidebar-collapse", String(collapse));
    document.documentElement.style.setProperty("--sidebar-width", nextWidth + "px");
    document.documentElement.style.setProperty("--sidebar-collapse", String(collapse));
    workspaceSidebar?.classList.toggle("sidebar-collapsed", collapse > 0.92);
    if (persist) {
      try {
        window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(nextWidth));
      } catch {}
    }
  };

  const setSidebarResizing = (isResizing: boolean) => {
    const workspaceShell = document.querySelector(".workspace-shell") as HTMLElement;
    workspaceShell?.classList.toggle("sidebar-resizing", isResizing);
    document.documentElement.classList.toggle("sidebar-resizing", isResizing);
  };

  const syncSidebarWidth = () => {
    let storedWidth = DEFAULT_SIDEBAR_WIDTH;
    try {
      storedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY) || DEFAULT_SIDEBAR_WIDTH);
    } catch {}
    applySidebarWidth(snapSidebarWidth(Number.isFinite(storedWidth) ? storedWidth : DEFAULT_SIDEBAR_WIDTH), true);
  };

  syncSidebarWidth();
  window.requestAnimationFrame(() => {
    document.documentElement.classList.add("sidebar-ready");
  });

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
    const currentWidth = workspaceSidebar ? workspaceSidebar.getBoundingClientRect().width : DEFAULT_SIDEBAR_WIDTH;
    getWin().sidebarResizeState = {
      startX: event.clientX,
      startWidth: currentWidth
    };
    setSidebarResizing(true);
  });

  sidebarResizeHandle?.addEventListener("dblclick", () => {
    const currentWidth = workspaceSidebar ? workspaceSidebar.getBoundingClientRect().width : DEFAULT_SIDEBAR_WIDTH;
    applySidebarWidth(
      currentWidth <= COLLAPSED_SNAP_WIDTH ? DEFAULT_SIDEBAR_WIDTH : COLLAPSED_SIDEBAR_WIDTH,
      true
    );
  });

  window.addEventListener("pointermove", (event) => {
    const state = getWin().sidebarResizeState;
    if (!state) {
      return;
    }
    const nextWidth = state.startWidth + (event.clientX - state.startX);
    applySidebarWidth(nextWidth, true);
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
    const liveWidth = workspaceSidebar ? workspaceSidebar.getBoundingClientRect().width : DEFAULT_SIDEBAR_WIDTH;
    getWin().sidebarResizeState = null;
    setSidebarResizing(false);
    applySidebarWidth(snapSidebarWidth(liveWidth), true);
  };

  window.addEventListener("pointerup", stopSidebarResize);
  window.addEventListener("pointercancel", stopSidebarResize);
  window.addEventListener("resize", () => {
    setSidebarResizing(true);
    syncSidebarWidth();
    window.requestAnimationFrame(() => setSidebarResizing(false));
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

  const sendCurrentMessage = () => sendLegacyComposerMessage({
    composerInput,
    composerSend,
    workspaceUserName
  });

  composerSend?.addEventListener("click", () => {
    void sendCurrentMessage();
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

    const attachmentModalEmojiPickerSearch = document.getElementById("attachment-modal-emoji-picker-search") as HTMLInputElement | null;
    const query = String(attachmentModalEmojiPickerSearch?.value || "").trim().toLowerCase();

    let sections;
    if (query) {
      sections = emojiSections.map((section) => ({
        ...section,
        emojis: section.emojis.filter((emoji) => {
          const names = (emojiNames as Record<string, string[]>)[emoji] || [];
          return emoji.includes(query) || names.some((name) => name.toLowerCase().includes(query));
        })
      })).filter((section) => section.emojis.length > 0);
    } else {
      const recentSection = {
        ...emojiSections[0],
        emojis: readRecentEmojis()
      };
      sections = [recentSection].concat(emojiSections.slice(1));
    }

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
        if (attachmentModalCaption instanceof HTMLElement) {
          attachmentModalCaption.style.height = "auto";
          const h = Math.min(100, Math.max(24, attachmentModalCaption.scrollHeight));
          attachmentModalCaption.style.height = h + "px";
        }
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

  const attachmentModalEmojiPickerSearch = document.getElementById("attachment-modal-emoji-picker-search") as HTMLInputElement | null;
  if (attachmentModalEmojiPickerSearch) {
    attachmentModalEmojiPickerSearch.addEventListener("input", () => {
      renderAttachmentEmojiPicker();
    });
  }

  document.addEventListener("click", (event) => {
    if (!attachmentModalEmojiPicker?.classList.contains("open")) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest("#attachment-modal-emoji-picker") && !target.closest("#attachment-modal-emoji-button")) {
      closeAttachmentEmojiPicker();
    }
  });

  const renderEmojiPicker = getWin().renderEmojiPicker;
  const renderGifPicker = getWin().renderGifPicker;
  const setPickerMode = (modeVal: string) => {
    if (modeVal === "gif" && emojiModeTabGif && (emojiModeTabGif.classList.contains("disabled") || emojiModeTabGif.hasAttribute("disabled"))) {
      modeVal = "emoji";
    }
    pickerMode = modeVal;
    if (emojiPicker) {
      emojiPicker.classList.toggle("picker-mode-gif", modeVal === "gif");
      emojiPicker.classList.toggle("picker-mode-emoji", modeVal !== "gif");
    }
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
    emojiPickerSearch.addEventListener("focus", () => {
      if (emojiPickerCloseTimer) {
        window.clearTimeout(emojiPickerCloseTimer);
        emojiPickerCloseTimer = null;
      }
    });
    emojiPickerSearch.addEventListener("keydown", () => {
      if (emojiPickerCloseTimer) {
        window.clearTimeout(emojiPickerCloseTimer);
        emojiPickerCloseTimer = null;
      }
    });
    emojiPickerSearch.addEventListener("input", () => {
      if (emojiPickerCloseTimer) {
        window.clearTimeout(emojiPickerCloseTimer);
        emojiPickerCloseTimer = null;
      }
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

  const isHoverSupported = Boolean(window.matchMedia && window.matchMedia("(hover: hover)").matches);

  if (isHoverSupported) {
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
  }

  composerAttachButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
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

  attachmentModalAdd?.addEventListener("click", () => {
    composerFileInput?.click();
  });

  attachmentModalCancel?.addEventListener("click", () => {
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
      && !target.closest(".attachment-modal-shell")
    ) {
      closeAttachmentModal();
    }
  });

  const autoResizeAttachmentCaption = () => {
    const captionEl = document.getElementById("attachment-modal-caption") as HTMLTextAreaElement | null;
    if (captionEl instanceof HTMLElement) {
      captionEl.style.height = "auto";
      const h = Math.min(120, Math.max(32, captionEl.scrollHeight));
      captionEl.style.height = h + "px";
    }
  };

  attachmentModalCaption?.addEventListener("input", () => {
    getWin().pendingImageCaption = (attachmentModalCaption as unknown as HTMLTextAreaElement).value;
    autoResizeAttachmentCaption();
  });

  attachmentModalCaption?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      attachmentModalSend?.click();
    } else if (event.key === "Enter" && event.shiftKey) {
      requestAnimationFrame(autoResizeAttachmentCaption);
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
        getWin().mediaMessageSendInFlight = true;
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
      let sendOnEnter = true;
      try {
        sendOnEnter = JSON.parse(localStorage.getItem("thegrapht_user_settings_v1") || "{}").sendOnEnter !== false;
      } catch {}
      if (!sendOnEnter) return;
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
  getWin().getSidebarCurrentSearchQuery = () => currentSearchQuery;
  getWin().renderDialogs = renderDialogs;
  mountLegacyComposer({
    composerInput,
    composerSend,
    workspaceUserName
  });
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
  getWin().showGlobalChipTooltip = showGlobalChipTooltip;
  getWin().hideGlobalChipTooltip = hideGlobalChipTooltip;

  window.addEventListener("thegrapht:language-changed", () => {
    if (Array.isArray(getWin().allDialogs)) renderDialogs(getWin().allDialogs);
    document.querySelectorAll<HTMLElement>(".message-day-separator[data-day-ts] span").forEach((labelNode) => {
      const dayNode = labelNode.closest<HTMLElement>(".message-day-separator");
      const dayTimestamp = Number(dayNode?.dataset.dayTs || 0);
      const formatter = getWin().formatDaySeparatorLabel;
      if (dayTimestamp > 0 && typeof formatter === "function") labelNode.textContent = formatter(dayTimestamp);
    });
    if (typeof getWin().syncChatHeaderMeta === "function") getWin().syncChatHeaderMeta();
  });
});
