export const buildBootstrapClientChunk = ({
  apiBaseUrl,
  appleEmojiAssetBaseUrl,
  uiFlags,
  searchEmptyVideoUrl
}) => `      const explicitApiBase = ${JSON.stringify(apiBaseUrl)};
      const publicWebHosts = new Set(["web.thegrapht.su", "thegrapht.su", "www.thegrapht.su"]);
      const isLoopbackHostname = (value) => /^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)$/i.test(String(value || ""));
      const resolveApiBase = () => {
        const currentHost = window.location.hostname || "";

        if (!explicitApiBase) {
          return "/api";
        }

        try {
          const resolved = new URL(explicitApiBase, window.location.href);
          if (publicWebHosts.has(currentHost) && isLoopbackHostname(resolved.hostname)) {
            return "/api";
          }

          if (resolved.origin === window.location.origin) {
            return resolved.pathname.replace(/\\/$/, "") || "/api";
          }

          return resolved.toString().replace(/\\/$/, "");
        } catch {
          return publicWebHosts.has(currentHost) && isLoopbackHostname(explicitApiBase)
            ? "/api"
            : (explicitApiBase || "/api");
        }
      };
      const apiBase = resolveApiBase();
      const uiFlags = Object.freeze(${JSON.stringify(uiFlags)});
      window.__THEGRAPHT_UI_FLAGS__ = uiFlags;
      const searchEmptyVideoUrl = ${JSON.stringify(searchEmptyVideoUrl)};
      const appleEmojiAssetBaseUrl = ${JSON.stringify(appleEmojiAssetBaseUrl)};
      const usersSearchApiUrl = apiBase + "/v1/users/search";
      const createDirectDialogApiUrl = apiBase + "/v1/dialogs/direct";
      const legacySessionStorageKey = "thegrapht_legacy_session_token";
      const legacySessionExpiresStorageKey = "thegrapht_legacy_session_token_expires_at";
      const LEGACY_SESSION_TOKEN_TTL_MS = 10 * 60 * 1000;
      const pageRoot = document.getElementById("page-root");
      const appProgress = document.getElementById("app-progress");
      const authView = document.getElementById("auth-view");
      const workspaceView = document.getElementById("workspace-view");
      const authCopyBlock = document.getElementById("auth-copy-block");
      const brandTitleDynamic = document.getElementById("brand-title-dynamic");
      const brandTitleCursor = document.getElementById("brand-title-cursor");
      const form = document.getElementById("auth-form");
      const toggleButton = document.getElementById("toggle-mode");
      const submitButton = document.getElementById("submit-button");
      const statusNode = document.getElementById("status");
      const nameField = document.getElementById("name-field");
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const authKicker = document.getElementById("auth-kicker");
      const authTitle = document.getElementById("auth-title");
      const authCopy = document.getElementById("auth-copy");
      const metaText = document.getElementById("meta-text");
      const dialogList = document.getElementById("dialog-list");
      const workspaceUserName = document.getElementById("workspace-user-name");
      const logoutButton = document.getElementById("logout-button");
      const toastStack = document.getElementById("toast-stack");
      const workspaceShell = document.querySelector(".workspace-shell");
      const workspaceSidebar = document.querySelector(".workspace-sidebar");
      const workspaceMain = document.querySelector(".workspace-main");
      const multiTabBlocker = document.getElementById("multi-tab-blocker");
      const sidebarResizeHandle = document.getElementById("sidebar-resize-handle");
      const chatWindow = document.getElementById("chat-window");
      const chatIsland = document.getElementById("chat-island");
      const chatIslandCopy = chatIsland?.querySelector(".chat-island-copy");
      const chatHeaderAvatar = document.getElementById("chat-header-avatar");
      const chatSearchToggle = document.getElementById("chat-search-toggle");
      const chatCallButton = document.getElementById("chat-call-button");
      const chatSearchPanel = document.getElementById("chat-search-panel");
      const chatSearchBackdrop = document.getElementById("chat-search-backdrop");
      const chatProfilePanel = document.getElementById("chat-profile-panel");
      const chatProfileClose = document.getElementById("chat-profile-close");
      const chatProfileAvatar = document.getElementById("chat-profile-avatar");
      const chatProfileName = document.getElementById("chat-profile-name");
      const chatProfileStatus = document.getElementById("chat-profile-status");
      const chatProfileUsername = document.getElementById("chat-profile-username");
      const chatProfileLink = document.getElementById("chat-profile-link");
      const chatSearchAvatar = document.getElementById("chat-search-avatar");
      const chatSearchInput = document.getElementById("chat-search-input");
      const chatSearchClose = document.getElementById("chat-search-close");
      const chatSearchResults = document.getElementById("chat-search-results");
      const chatCallChip = document.getElementById("chat-call-chip");
      const chatCallChipTitle = document.getElementById("chat-call-chip-title");
      const chatCallChipTime = document.getElementById("chat-call-chip-time");
      const chatAudioTopPlayer = document.getElementById("chat-audio-top-player");
      const chatAudioTopPrev = document.getElementById("chat-audio-top-prev");
      const chatAudioTopToggle = document.getElementById("chat-audio-top-toggle");
      const chatAudioTopToggleIcon = document.getElementById("chat-audio-top-toggle-icon");
      const chatAudioTopNext = document.getElementById("chat-audio-top-next");
      const chatAudioTopTitle = document.getElementById("chat-audio-top-title");
      const chatAudioTopMeta = document.getElementById("chat-audio-top-meta");
      const chatAudioTopVolume = document.getElementById("chat-audio-top-volume");
      const chatAudioTopVolumeIcon = document.getElementById("chat-audio-top-volume-icon");
      const chatAudioTopVolumePopover = document.getElementById("chat-audio-top-volume-popover");
      const chatAudioTopVolumeRange = document.getElementById("chat-audio-top-volume-range");
      const chatAudioTopSpeed = document.getElementById("chat-audio-top-speed");
      const chatAudioTopRepeat = document.getElementById("chat-audio-top-repeat");
      const chatAudioTopClose = document.getElementById("chat-audio-top-close");
      const chatAudioTopProgress = document.getElementById("chat-audio-top-progress");
      const chatAudioTopProgressFill = document.getElementById("chat-audio-top-progress-fill");
      const chatStage = document.getElementById("chat-stage");
      const chatLoadingOverlay = document.getElementById("chat-loading-overlay");
      const chatScrollBottom = document.getElementById("chat-scroll-bottom");
      const chatComposer = document.getElementById("chat-composer");
      const composerReplyPreview = document.getElementById("composer-reply-preview");
      const composerReplyAuthor = document.getElementById("composer-reply-author");
      const composerReplyText = document.getElementById("composer-reply-text");
      const composerReplyClose = document.getElementById("composer-reply-close");
      const composerEmojiButton = document.getElementById("composer-emoji-button");
      const emojiPicker = document.getElementById("emoji-picker");
      const emojiPickerHead = document.getElementById("emoji-picker-head");
      const emojiPickerBody = document.getElementById("emoji-picker-body");
      const composerInputOverlay = document.getElementById("composer-input-overlay");
      const composerInput = document.getElementById("composer-input");
      const composerSend = document.getElementById("composer-send");
      const composerAttachButton = document.getElementById("composer-attach-button");
      const attachMenu = document.getElementById("attach-menu");
      const composerFileInput = document.getElementById("composer-file-input");
      const composerAttachmentPreview = document.getElementById("composer-attachment-preview");
      const composerAttachmentImage = document.getElementById("composer-attachment-image");
      const composerAttachmentMeta = document.getElementById("composer-attachment-meta");
      const composerAttachmentRemove = document.getElementById("composer-attachment-remove");
      const attachmentModal = document.getElementById("attachment-modal");
      const attachmentModalTitle = document.getElementById("attachment-modal-title");
      const attachmentModalClose = document.getElementById("attachment-modal-close");
      const attachmentModalPrev = document.getElementById("attachment-modal-prev");
      const attachmentModalNext = document.getElementById("attachment-modal-next");
      const attachmentModalImage = document.getElementById("attachment-modal-image");
      const attachmentModalStrip = document.getElementById("attachment-modal-strip");
      const attachmentModalEmojiButton = document.getElementById("attachment-modal-emoji-button");
      const attachmentModalEmojiPicker = document.getElementById("attachment-modal-emoji-picker");
      const attachmentModalEmojiPickerHead = document.getElementById("attachment-modal-emoji-picker-head");
      const attachmentModalEmojiPickerBody = document.getElementById("attachment-modal-emoji-picker-body");
      const attachmentModalCaption = document.getElementById("attachment-modal-caption");
      const attachmentModalSend = document.getElementById("attachment-modal-send");
      const viewerModal = document.getElementById("viewer-modal");
      const viewerModalClose = document.getElementById("viewer-modal-close");
      const viewerModalImage = document.getElementById("viewer-modal-image");
      const viewerModalStage = document.getElementById("viewer-modal-stage");
      const viewerZoomChip = document.getElementById("viewer-zoom-chip");
      const viewerZoomOut = document.getElementById("viewer-zoom-out");
      const viewerZoomIn = document.getElementById("viewer-zoom-in");
      const viewerZoomValue = document.getElementById("viewer-zoom-value");
      const viewerAuthorAvatar = document.getElementById("viewer-author-avatar");
      const viewerAuthorName = document.getElementById("viewer-author-name");
      const viewerAuthorMeta = document.getElementById("viewer-author-meta");
      const messageContextMenu = document.getElementById("message-context-menu");
      const messageContextMenuBody = document.getElementById("message-context-menu-body");
      const dialogContextMenu = document.getElementById("dialog-context-menu");
      const dialogContextMenuBody = document.getElementById("dialog-context-menu-body");
      const deleteMessageModal = document.getElementById("delete-message-modal");
      const deleteMessageCancel = document.getElementById("delete-message-cancel");
      const deleteMessageConfirm = document.getElementById("delete-message-confirm");
      const deleteMessageForEveryone = document.getElementById("delete-message-for-everyone");
      const deleteMessageForEveryoneWrap = document.getElementById("delete-message-for-everyone-wrap");
      const deleteMessageForEveryoneLabel = document.getElementById("delete-message-for-everyone-label");
      const composerIconImages = Array.from(document.querySelectorAll(".composer-icon-image, .composer-send img, .attachment-modal-send img"));
      const messageList = document.getElementById("message-list");
      const chatTitle = document.getElementById("chat-title");
      const chatSubtitle = document.getElementById("chat-subtitle");
      const sidebarSearch = document.getElementById("sidebar-search");
      const callOverlay = document.getElementById("call-overlay");
      const callModal = document.getElementById("call-modal");
      const callExpandButton = document.getElementById("call-expand-button");
      const callCloseButton = document.getElementById("call-close-button");
      const callPeerAvatar = document.getElementById("call-peer-avatar");
      const callPeerName = document.getElementById("call-peer-name");
      const callPeerStatus = document.getElementById("call-peer-status");
      const callPeerSubstatus = document.getElementById("call-peer-substatus");
      const callMuteButton = document.getElementById("call-mute-button");
      const callMuteLabel = document.getElementById("call-mute-label");
      const callDevicesButton = document.getElementById("call-devices-button");
      const callAcceptWrap = document.getElementById("call-accept-wrap");
      const callAcceptButton = document.getElementById("call-accept-button");
      const callEndButton = document.getElementById("call-end-button");
      const callEndLabel = document.getElementById("call-end-label");
      const callDevicesPanel = document.getElementById("call-devices-panel");
      const callDevicesClose = document.getElementById("call-devices-close");
      const callInputDevice = document.getElementById("call-input-device");
      const callOutputDevice = document.getElementById("call-output-device");
      const callMiniCard = document.getElementById("call-mini-card");
      const callMiniDragHandle = document.getElementById("call-mini-drag-handle");
      const callMiniName = document.getElementById("call-mini-name");
      const callMiniSubtitle = document.getElementById("call-mini-subtitle");
      const callMiniAvatar = document.getElementById("call-mini-avatar");
      const callMiniClose = document.getElementById("call-mini-close");
      const callMiniOpen = document.getElementById("call-mini-open");
      const callMiniEnd = document.getElementById("call-mini-end");
      const savedIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.75h10a1 1 0 0 1 1 1v13.5l-6-3.6-6 3.6V5.75a1 1 0 0 1 1-1Z"></path></svg>';
      const groupIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 11.2a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z"></path><path d="M16.3 10.1a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"></path><path d="M4.8 18.2c.8-2.3 2.5-3.5 5-3.5s4.2 1.2 5 3.5"></path><path d="M14.2 18.2c.5-1.7 1.8-2.6 3.9-2.6"></path></svg>';
      const channelIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12c3.1-3.2 11.9-5.8 15-6.2-.3 3.2-3 12.1-6.2 15.2-.4-2.6-1.3-4.5-2.9-6.1-1.6-1.6-3.5-2.5-5.9-2.9Z"></path><path d="m10.3 13.7-2.8 2.8"></path></svg>';
      const secretIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8 5.7 6.4v5.1c0 4.5 2.4 7.8 6.3 8.8 3.9-1 6.3-4.3 6.3-8.8V6.4L12 3.8Z"></path><path d="M9.7 12.4 11.3 14l3.2-4"></path></svg>';
      const privateIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 10V8.4a4.5 4.5 0 1 1 9 0V10"></path><path d="M6.7 10.2h10.6a1 1 0 0 1 1 1v7.1a1 1 0 0 1-1 1H6.7a1 1 0 0 1-1-1v-7.1a1 1 0 0 1 1-1Z"></path></svg>';
      const singleCheckIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.1 10.5 2.4 2.4 5-5.8"></path></svg>';
      const doubleChecksIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3.8 10.6 2.3 2.3 4.4-5.1"></path><path d="m8.7 10.6 2.3 2.3 4.4-5.1"></path></svg>';
      const pendingClockIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.5"></circle><path d="M10 6.5v3.9l2.6 1.6"></path></svg>';
      const dialogTypeOrder = ["saved", "direct", "private", "group", "channel", "secret"];
      const dialogTypeLabels = {
        saved: "Saved",
        direct: "Direct",
        private: "Private",
        group: "Group",
        channel: "Channel",
        secret: "Secret"
      };
      const dialogTypeTitles = {
        saved: "Saved messages",
        direct: "Direct messages",
        private: "Private chats",
        group: "Groups",
        channel: "Channels",
        secret: "Secret chats"
      };
      const dialogTypeIcons = {
        saved: savedIcon,
        group: groupIcon,
        channel: channelIcon,
        secret: secretIcon,
        private: privateIcon
      };
      const MAX_MEDIA_ATTACHMENTS = 500;
      const ALBUM_MEDIA_LIMIT = 5;
      const SIDEBAR_WIDTH_STORAGE_KEY = "thegrapht_sidebar_width";
      const ACTIVE_TAB_OWNER_STORAGE_KEY = "thegrapht_active_tab_owner";
      const NOTIFICATION_OWNER_STORAGE_KEY = "thegrapht_notification_owner";
      const NOTIFICATION_CLAIM_STORAGE_PREFIX = "thegrapht_notification_claim_";
      const BACKGROUND_REFRESH_INTERVAL_MS = 30 * 60 * 1000;
      const NOTIFICATION_OWNER_TTL_MS = 22000;
      const NOTIFICATION_OWNER_HEARTBEAT_MS = 8000;
      const ACTIVE_TAB_OWNER_TTL_MS = 9000;
      const MESSAGE_NOTIFICATION_DEDUPE_MS = 45000;
      const DIALOG_CACHE_LIMIT = 36;
      const DIALOG_MEDIA_PREFETCH_LIMIT = 10;
      const EMOJI_RECENTS_STORAGE_KEY = "thegrapht_emoji_recents";
      const EMOJI_RECENTS_LIMIT = 18;
      const emojiClusterPattern = new RegExp(
        "(?:\\\\p{Extended_Pictographic}|[\\\\u{1F1E6}-\\\\u{1F1FF}]|[#*0-9]\\\\uFE0F?\\\\u20E3|[\\\\u00A9\\\\u00AE\\\\u2122])",
        "u"
      );
      const graphemeSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
        ? new Intl.Segmenter("en", { granularity: "grapheme" })
        : null;
      const emojiTabIcons = {
        recent: '<svg class="emoji-picker-tab-icon circle-stroke" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 7.5v5l3.2 1.9"></path></svg>',
        people: '<svg class="emoji-picker-tab-icon circle-stroke" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M9.2 10.4h.01"></path><path d="M14.8 10.4h.01"></path><path d="M8.7 14.2c.9 1.1 2 1.6 3.3 1.6s2.4-.5 3.3-1.6"></path></svg>',
        nature: '<svg class="emoji-picker-tab-icon circle-stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 20.2c0-5.8 2.1-9.5 6.6-12.5-1 5.5-2.8 9.5-6.6 12.5Z"></path><path d="M11.8 20.2c0-4.5-1.6-7.7-5.4-10.1.6 4.5 2.2 7.7 5.4 10.1Z"></path><path d="M12 20.2V7.8"></path></svg>',
        food: '<svg class="emoji-picker-tab-icon solid-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.9 4.8c1.7 0 3 1.2 3 2.8 0 1.8-1.1 3-2.8 4.1-1.4.9-2.9 2.5-4.1 4.8-1.2-2.3-2.7-3.9-4.1-4.8C6.2 10.6 5.1 9.4 5.1 7.6c0-1.6 1.3-2.8 3-2.8 1.3 0 2.3.7 2.9 1.7.6-1 1.6-1.7 2.9-1.7Z"></path><path d="M12 16.5v2.7"></path></svg>',
        symbols: '<svg class="emoji-picker-tab-icon circle-stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 14.8h5.6"></path><path d="M10 17.8h4"></path><path d="M9.5 12c-1-1-1.7-2.1-1.7-3.6a4.2 4.2 0 1 1 8.4 0c0 1.5-.7 2.6-1.7 3.6-.8.8-1.2 1.4-1.2 2.4h-2.6c0-1-.4-1.6-1.2-2.4Z"></path></svg>'
      };
      const emojiSections = [
        { key: "recent", title: "Recently Used", emojis: [] },
        { key: "people", title: "Emoji & People", emojis: ["😀","😃","😄","😁","😆","🥹","😂","🤣","🙂","😉","😊","😇","😍","😘","😗","😋","😜","🤪","🤨","🫠","🥳","😎","🤓","😴","🤔","🤯","🥺","😭","😡","🤗","🫡","🤝"] },
        { key: "nature", title: "Animals & Nature", emojis: ["🌲","🌳","🌴","🌵","🌷","🌸","🌹","🌻","🍀","🌿","🍄","🌞","🌈","⚡","🔥","🌊","🐶","🐱","🦊","🐼","🐷","🦆","🦋","🐝"] },
        { key: "food", title: "Food & Drink", emojis: ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🥝","🍍","🥑","🥐","🍕","🍔","🍟","🌮","🍜","🍣","☕","🧋","🥤"] },
        { key: "symbols", title: "Symbols", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💫","⭐","✨","✅","❌","⚠️","💬","💭","📌","🔔","🎵","🎧","📷","📎","🚀","🫶"] }
      ];
      let mode = "login";
      let currentDialogId = "";
      let currentDialogPublicId = "";
      let currentUserId = "";
      let currentUserUsername = "";
      let currentUserEmail = "";
      let allDialogs = [];
      let realtimeSocket = null;
      let realtimeEnabled = false;
      let currentDialogSnapshot = null;
      let currentMessagesSnapshot = [];
      let localOutgoingMessages = [];
      let currentSearchQuery = "";
      let searchDelayTimer = null;
      let currentSearchResults = [];
      let searchRequestId = 0;
      let sidebarResizeState = null;
      let pendingDialogPublicIdFromNotification = "";
      const notificationTabId = (window.crypto && typeof window.crypto.randomUUID === "function")
        ? window.crypto.randomUUID()
        : ("tab_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10));
      const recentMessageNotificationTimes = new Map();
      let notificationOwnershipTimer = null;
      let activeTabOwnershipTimer = null;
      let backgroundRefreshTimer = null;
      let backgroundRefreshInFlight = false;
      let dialogSwitchTimer = null;
      let activeDialogLoadToken = 0;
      let activeTopProgressCount = 0;
      let topProgressFinishTimer = null;
      let topProgressAutoTimer = null;
      let topProgressValue = 0;
      let bottomLockToken = 0;
      let bottomLockCanceledByUser = false;
      let suppressBottomLockCancel = false;
      let pendingAutoBottomDialogPublicId = "";
      let pendingAutoBottomCanceled = false;
      let manualScrollIntentAt = 0;
      let forceBottomOnNextDialogRender = false;
      let textMessageSendInFlight = false;
      let emojiPickerCloseTimer = null;
      let attachMenuCloseTimer = null;
      const dialogPayloadCache = new Map();
      const prefetchedMediaUrls = new Set();
      const imageDimensionsCache = new Map();
      const dialogScrollTopCache = new Map();
      const DIALOG_SCROLL_CACHE_LIMIT = 80;

      const setDialogScrollTop = (publicId, value) => {
        if (!publicId || !Number.isFinite(value)) {
          return;
        }

        const normalized = Math.max(0, Math.floor(value));
        if (dialogScrollTopCache.has(publicId)) {
          dialogScrollTopCache.delete(publicId);
        }
        dialogScrollTopCache.set(publicId, normalized);

        while (dialogScrollTopCache.size > DIALOG_SCROLL_CACHE_LIMIT) {
          const oldestKey = dialogScrollTopCache.keys().next().value;
          if (!oldestKey) {
            break;
          }
          dialogScrollTopCache.delete(oldestKey);
        }
      };

      const getDialogScrollTop = (publicId) => {
        if (!publicId || !dialogScrollTopCache.has(publicId)) {
          return null;
        }

        const value = dialogScrollTopCache.get(publicId);
        dialogScrollTopCache.delete(publicId);
        dialogScrollTopCache.set(publicId, value);
        return Number.isFinite(value) ? value : null;
      };

      const rememberCurrentDialogScrollTop = () => {
        if (!currentDialogPublicId || !messageList) {
          return;
        }

        setDialogScrollTop(currentDialogPublicId, messageList.scrollTop || 0);
      };

      const clampSidebarWidth = (value) => {
        const viewportWidth = window.innerWidth || 0;
        const minWidth = 320;
        const maxWidth = Math.max(minWidth, Math.min(720, Math.floor(viewportWidth * 0.5)));
        return Math.max(minWidth, Math.min(maxWidth, Math.round(value)));
      };

      const applySidebarWidth = (value, options = {}) => {
        if (!workspaceShell) {
          return;
        }

        const nextWidth = clampSidebarWidth(value);
        workspaceShell.style.setProperty("--sidebar-width", nextWidth + "px");

        if (!options.skipPersist) {
          try {
            window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(nextWidth));
          } catch {}
        }
      };

      const syncSidebarWidth = () => {
        let storedWidth = 360;

        try {
          storedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY) || 360);
        } catch {}

        applySidebarWidth(Number.isFinite(storedWidth) ? storedWidth : 360, { skipPersist: true });
      };

      const stopSidebarResize = () => {
        if (!sidebarResizeState) {
          return;
        }

        sidebarResizeState = null;
        workspaceShell.classList.remove("sidebar-resizing");
      };

      const updateSidebarResize = (clientX) => {
        if (!sidebarResizeState) {
          return;
        }

        const nextWidth = sidebarResizeState.startWidth + (clientX - sidebarResizeState.startX);
        applySidebarWidth(nextWidth);
      };

      const startSidebarResize = (clientX) => {
        if (window.innerWidth <= 900) {
          return;
        }

        const currentWidth = workspaceSidebar ? workspaceSidebar.getBoundingClientRect().width : 360;

        sidebarResizeState = {
          startX: clientX,
          startWidth: currentWidth
        };
        workspaceShell.classList.add("sidebar-resizing");
      };
      let chatSearchQuery = "";
      let chatSearchHighlightTimer = null;
      let activeCall = null;
      let callTickTimer = null;
      let callTimeoutTimer = null;
      let remoteAudioNode = null;
      let outgoingCallRingtoneNode = null;
      let incomingCallRingtoneNode = null;
      let isNearChatBottom = true;
      let peerActiveInCurrentDialog = false;
      let currentPeerReadAt = null;
      const onlineUserIds = new Set();
      const typingUsersByDialog = new Map();
      const typingTimers = new Map();
      let typingStopTimer = null;
      let realtimeReconnectTimer = null;
      let realtimeHeartbeatTimer = null;
      let realtimeWatchdogTimer = null;
      let realtimeLastActivityAt = 0;
      let legacySessionToken = "";
      let pendingImageAttachments = [];
      let pendingImageAttachmentIndex = 0;
      let pendingFileAttachments = [];
      let pendingFileAttachmentIndex = 0;
      let attachmentModalMode = "image";
      let pendingImageCaption = "";
      let pendingAttachmentModalScrollTop = 0;
      let attachmentModalCleanupTimer = null;
      let attachmentModalCleanupToken = 0;
      let pendingReplyMessage = null;
      let messageContextMenuCloseTimer = null;
      let messageContextMenuState = null;
      let dialogContextMenuCloseTimer = null;
      let dialogContextMenuState = null;
      let deleteMessageTarget = null;
      let currentUserDisplayName = "";
      let currentUserAvatarLetter = "";
      let notificationPermissionBound = false;
      let sendAudioNode = null;
      let messageAudioNode = null;
      const desktopNotificationIds = new Set();
      const realtimeMessageSeenAt = new Map();
      let viewerZoom = 1;
      let viewerSourceRect = null;
      let viewerCleanupTimer = null;
      let isPrimaryActiveTab = true;
      let viewerLoadToken = 0;
      const VIEWER_MIN_ZOOM = 0.7;
      const VIEWER_MAX_ZOOM = 3.5;
      const REALTIME_HEARTBEAT_INTERVAL_MS = 12000;
      const REALTIME_WATCHDOG_INTERVAL_MS = 5000;
      const REALTIME_STALE_TIMEOUT_MS = 35000;

      try {
        const legacySessionExpiresAt = Number(window.localStorage.getItem(legacySessionExpiresStorageKey) || 0);
        if (legacySessionExpiresAt && legacySessionExpiresAt > Date.now()) {
          legacySessionToken = window.localStorage.getItem(legacySessionStorageKey) || "";
        } else {
          window.localStorage.removeItem(legacySessionStorageKey);
          window.localStorage.removeItem(legacySessionExpiresStorageKey);
          legacySessionToken = "";
        }
      } catch {
        legacySessionToken = "";
      }

      const composerHasValue = () => composerInput.value.trim().length > 0;

      const persistLegacySessionToken = (token) => {
        legacySessionToken = token || "";

        try {
          if (legacySessionToken) {
            window.localStorage.setItem(legacySessionStorageKey, legacySessionToken);
            window.localStorage.setItem(legacySessionExpiresStorageKey, String(Date.now() + LEGACY_SESSION_TOKEN_TTL_MS));
          } else {
            window.localStorage.removeItem(legacySessionStorageKey);
            window.localStorage.removeItem(legacySessionExpiresStorageKey);
          }
        } catch {}
      };

      const syncComposerState = () => {
        chatComposer.classList.toggle("send-active", composerHasValue());
        composerInput.placeholder = "Message";
        renderComposerOverlay();
      };

      const readRecentEmojis = () => {
        try {
          const parsed = JSON.parse(window.localStorage.getItem(EMOJI_RECENTS_STORAGE_KEY) || "[]");
          return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()).slice(0, EMOJI_RECENTS_LIMIT) : [];
        } catch {
          return [];
        }
      };

      const writeRecentEmojis = (emojis) => {
        try {
          window.localStorage.setItem(EMOJI_RECENTS_STORAGE_KEY, JSON.stringify(emojis.slice(0, EMOJI_RECENTS_LIMIT)));
        } catch {}
      };

      const rememberRecentEmoji = (emoji) => {
        const nextRecents = [emoji].concat(readRecentEmojis().filter((item) => item !== emoji)).slice(0, EMOJI_RECENTS_LIMIT);
        writeRecentEmojis(nextRecents);
      };

      const splitGraphemes = (value) => {
        const text = String(value || "");
        if (!text) {
          return [];
        }

        if (graphemeSegmenter) {
          return Array.from(graphemeSegmenter.segment(text), (part) => part.segment);
        }

        return Array.from(text);
      };

      const APPLE_EMOJI_BASE_URL = appleEmojiAssetBaseUrl || "/assets/emoji/apple-64/";

      const getEmojiAssetUrl = (emoji) => {
        if (!emoji) {
          return "";
        }

        const codePointParts = [];
        for (const symbol of Array.from(String(emoji))) {
          const codePoint = symbol.codePointAt(0);
          if (typeof codePoint === "number") {
            codePointParts.push(codePoint.toString(16));
          }
        }

        return codePointParts.length
          ? APPLE_EMOJI_BASE_URL + codePointParts.join("-") + ".png"
          : "";
      };

      const renderEmojiAwareTextHtml = (value, options = {}) => {
        const text = String(value ?? "");
        const extraClass = options.extraClass ? " " + options.extraClass : "";
        const transparentText = Boolean(options.transparentText);
        let result = "";

        for (const segment of splitGraphemes(text)) {
          if (emojiClusterPattern.test(segment)) {
            const emojiAssetUrl = getEmojiAssetUrl(segment);
            const emojiMarkup = emojiAssetUrl
              ? '<img class="inline-emoji' + extraClass + '" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(segment) + '" draggable="false" loading="lazy" decoding="async">'
              : '<span class="inline-emoji' + extraClass + '" aria-label="' + escapeHtml(segment) + '">' + escapeHtml(segment) + '</span>';
            result += options.wrapEmoji
              ? '<span class="composer-emoji-slot">' + emojiMarkup + '</span>'
              : emojiMarkup;
            continue;
          }

          result += transparentText
            ? '<span class="composer-overlay-text">' + escapeHtml(segment) + '</span>'
            : escapeHtml(segment);
        }

        return result;
      };

      const renderComposerOverlay = () => {
        if (!composerInputOverlay) {
          return;
        }

        const value = composerInput.value;
        composerInput.parentElement?.classList.remove("has-rendered-emoji");
        if (!value) {
          composerInputOverlay.classList.add("empty");
          composerInputOverlay.innerHTML = '<span class="composer-input-placeholder">Message</span>';
          return;
        }

        const hasEmoji = splitGraphemes(value).some((segment) => emojiClusterPattern.test(segment));
        composerInputOverlay.classList.remove("empty");
        composerInput.parentElement?.classList.toggle("has-rendered-emoji", hasEmoji);
        composerInputOverlay.innerHTML = hasEmoji
          ? renderEmojiAwareTextHtml(value, {
              extraClass: "composer-inline-emoji",
              transparentText: true,
              wrapEmoji: true
            })
          : "";
      };

      const renderEmojiPicker = () => {
        const recentSection = {
          ...emojiSections[0],
          emojis: readRecentEmojis()
        };
        const sections = [recentSection].concat(emojiSections.slice(1));

        emojiPickerHead.innerHTML = sections.map((section, index) => (
          '<button class="emoji-picker-tab' + (index === 0 ? ' active' : '') + '" type="button" data-emoji-tab="' + section.key + '" aria-label="' + escapeHtml(section.title) + '">' +
            (emojiTabIcons[section.key] || "") +
          '</button>'
        )).join("");

        emojiPickerBody.innerHTML = sections.map((section) => (
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
                        ? '<img class="emoji-button-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="" aria-hidden="true" loading="lazy" decoding="async">'
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

        emojiPickerHead.querySelectorAll("[data-emoji-tab]").forEach((button) => {
          button.addEventListener("click", () => {
            const key = button.getAttribute("data-emoji-tab");
            if (!key) {
              return;
            }
            emojiPickerHead.querySelectorAll("[data-emoji-tab]").forEach((node) => node.classList.toggle("active", node === button));
            emojiPickerBody.querySelector('[data-emoji-section="' + key + '"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });

        emojiPickerBody.querySelectorAll("[data-emoji-value]").forEach((button) => {
          button.addEventListener("click", () => {
            const emoji = button.getAttribute("data-emoji-value");
            if (!emoji) {
              return;
            }

            const selectionStart = composerInput.selectionStart ?? composerInput.value.length;
            const selectionEnd = composerInput.selectionEnd ?? composerInput.value.length;
            composerInput.value = composerInput.value.slice(0, selectionStart) + emoji + composerInput.value.slice(selectionEnd);
            composerInput.focus();
            composerInput.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
            rememberRecentEmoji(emoji);
            syncComposerState();
            renderEmojiPicker();
          });
        });
      };

      const closeEmojiPicker = () => {
        if (emojiPickerCloseTimer) {
          window.clearTimeout(emojiPickerCloseTimer);
          emojiPickerCloseTimer = null;
        }
        emojiPicker.classList.remove("open");
        emojiPicker.setAttribute("aria-hidden", "true");
      };

      const scheduleEmojiPickerClose = () => {
        if (emojiPickerCloseTimer) {
          window.clearTimeout(emojiPickerCloseTimer);
        }
        emojiPickerCloseTimer = window.setTimeout(() => {
          closeEmojiPicker();
        }, 120);
      };

      const openEmojiPicker = () => {
        if (emojiPickerCloseTimer) {
          window.clearTimeout(emojiPickerCloseTimer);
          emojiPickerCloseTimer = null;
        }
        renderEmojiPicker();
        emojiPicker.classList.add("open");
        emojiPicker.setAttribute("aria-hidden", "false");
      };

      const closeAttachMenu = () => {
        if (attachMenuCloseTimer) {
          window.clearTimeout(attachMenuCloseTimer);
          attachMenuCloseTimer = null;
        }
        attachMenu.classList.remove("open");
        attachMenu.setAttribute("aria-hidden", "true");
      };

      const scheduleAttachMenuClose = () => {
        if (attachMenuCloseTimer) {
          window.clearTimeout(attachMenuCloseTimer);
        }
        attachMenuCloseTimer = window.setTimeout(() => {
          closeAttachMenu();
        }, 120);
      };

      const openAttachMenu = () => {
        if (attachMenuCloseTimer) {
          window.clearTimeout(attachMenuCloseTimer);
          attachMenuCloseTimer = null;
        }
        attachMenu.classList.add("open");
        attachMenu.setAttribute("aria-hidden", "false");
      };

      const escapeHtml = (value) => String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

      const reducedMotionQuery = window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
      const prefersReducedMotion = () => Boolean(reducedMotionQuery?.matches);
      const motionDurations = Object.freeze({
        fast: 100,
        standard: 140,
        emphasized: 180
      });
      const motionEasing = Object.freeze({
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        emphasized: "cubic-bezier(0.2, 0, 0, 1)",
        spring: "cubic-bezier(0.2, 0, 0, 1)"
      });

      const runMotion = (node, keyframes, options = {}) => {
        if (!node || prefersReducedMotion() || typeof node.animate !== "function") {
          return null;
        }

        return node.animate(keyframes, {
          duration: motionDurations.standard,
          easing: motionEasing.standard,
          fill: "both",
          ...options
        });
      };

      const runStaggerMotion = (root, selector, options = {}) => {
        if (!root || prefersReducedMotion()) {
          return;
        }

        const nodes = Array.from(root.querySelectorAll(selector));
        const limit = Number.isFinite(options.limit) ? options.limit : nodes.length;
        const visibleNodes = options.fromEnd ? nodes.slice(-limit) : nodes.slice(0, limit);

        visibleNodes.forEach((node, index) => {
          runMotion(
            node,
            options.keyframes || [
              { opacity: 0, transform: "translateY(6px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            {
              duration: options.duration || motionDurations.emphasized,
              delay: Math.min(index * (options.step || 28), options.maxDelay || 280),
              easing: options.easing || motionEasing.emphasized
            }
          );
        });
      };

      const animateDialogListItems = () => {
        runStaggerMotion(dialogList, ".dialog-section-label, .dialog-item, .search-empty-state, .search-loading-state", {
          duration: 140,
          step: 12,
          maxDelay: 96,
          keyframes: [
            { opacity: 0, transform: "translateX(-6px)" },
            { opacity: 1, transform: "translateX(0)" }
          ]
        });
      };

      const animateMessageListItems = () => {
        runStaggerMotion(messageList, ".message, .saved-empty-state, .direct-empty-state, .empty-chat-state", {
          fromEnd: true,
          limit: 36,
          duration: 150,
          step: 8,
          maxDelay: 80,
          keyframes: [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" }
          ]
        });
      };

      const startTopProgress = () => {
        if (authView && authView.classList.contains("hidden")) {
          return;
        }
        activeTopProgressCount += 1;

        if (!appProgress || prefersReducedMotion()) {
          return;
        }

        if (topProgressFinishTimer) {
          window.clearTimeout(topProgressFinishTimer);
          topProgressFinishTimer = null;
        }
        if (topProgressAutoTimer) {
          window.clearInterval(topProgressAutoTimer);
          topProgressAutoTimer = null;
        }

        appProgress.classList.remove("finishing");
        appProgress.classList.add("active");
        topProgressValue = Math.max(topProgressValue, 0.06);
        appProgress.style.setProperty("--app-progress-value", String(topProgressValue));

        topProgressAutoTimer = window.setInterval(() => {
          if (activeTopProgressCount <= 0) {
            return;
          }
          const next = Math.min(0.92, topProgressValue + Math.max(0.015, (0.92 - topProgressValue) * 0.14));
          if (next <= topProgressValue) {
            return;
          }
          topProgressValue = next;
          appProgress.style.setProperty("--app-progress-value", String(topProgressValue));
        }, 140);
      };

      const finishTopProgress = () => {
        activeTopProgressCount = Math.max(0, activeTopProgressCount - 1);

        if (!appProgress || prefersReducedMotion() || activeTopProgressCount > 0) {
          return;
        }

        appProgress.classList.remove("active");
        appProgress.classList.add("finishing");
        if (topProgressAutoTimer) {
          window.clearInterval(topProgressAutoTimer);
          topProgressAutoTimer = null;
        }
        topProgressValue = 1;
        appProgress.style.setProperty("--app-progress-value", "1");

        if (topProgressFinishTimer) {
          window.clearTimeout(topProgressFinishTimer);
        }

        topProgressFinishTimer = window.setTimeout(() => {
          if (activeTopProgressCount === 0) {
            appProgress.classList.remove("finishing");
            topProgressValue = 0;
            appProgress.style.setProperty("--app-progress-value", "0");
          }
        }, 220);
      };

      const finishAllTopProgress = () => {
        activeTopProgressCount = 1;
        finishTopProgress();
      };

      const claimNotificationDelivery = (kind, id, ttlMs = 15000) => {
        if (!kind || !id) {
          return true;
        }

        const storageKey = NOTIFICATION_CLAIM_STORAGE_PREFIX + kind + "_" + id;
        const now = Date.now();
        const token = notificationTabId + "_" + now + "_" + Math.random().toString(36).slice(2, 8);

        try {
          const existingRaw = window.localStorage.getItem(storageKey);
          if (existingRaw) {
            const existing = JSON.parse(existingRaw);
            if (existing && Number(existing.expiresAt) > now) {
              return false;
            }
          }

          window.localStorage.setItem(storageKey, JSON.stringify({
            token,
            expiresAt: now + ttlMs
          }));

          const confirmedRaw = window.localStorage.getItem(storageKey);
          const confirmed = confirmedRaw ? JSON.parse(confirmedRaw) : null;
          return Boolean(confirmed && confirmed.token === token);
        } catch {
          return true;
        }
      };

      const pulseElement = (node) => {
        runMotion(
          node,
          [
            { transform: "scale(1)" },
            { transform: "scale(0.98)" },
            { transform: "scale(1)" }
          ],
          {
            duration: 120,
            easing: motionEasing.standard
          }
        );
      };

      const attachRippleMotion = () => {
        document.addEventListener("pointerdown", (event) => {
          const target = event.target instanceof Element
            ? event.target.closest("button, [role='button']")
            : null;

          if (!target || prefersReducedMotion()) {
            return;
          }

          if (target.classList.contains("chat-island-copy")) {
            return;
          }

          target.classList.add("ripple-host");
          const rect = target.getBoundingClientRect();
          target.style.setProperty("--ripple-x", (event.clientX - rect.left) + "px");
          target.style.setProperty("--ripple-y", (event.clientY - rect.top) + "px");
          target.classList.remove("ripple");
          void target.offsetWidth;
          target.classList.add("ripple");
          pulseElement(target);
          window.setTimeout(() => target.classList.remove("ripple"), 280);
        }, { passive: true });
      };

      attachRippleMotion();

      const cloneJson = (value) => JSON.parse(JSON.stringify(value));

      const setDialogPayloadCache = (publicId, payload) => {
        if (!publicId || !payload?.dialog) {
          return;
        }

        if (dialogPayloadCache.has(publicId)) {
          dialogPayloadCache.delete(publicId);
        }

        dialogPayloadCache.set(publicId, cloneJson(payload));

        while (dialogPayloadCache.size > DIALOG_CACHE_LIMIT) {
          const oldestKey = dialogPayloadCache.keys().next().value;
          if (!oldestKey) {
            break;
          }
          dialogPayloadCache.delete(oldestKey);
        }
      };

      const getDialogPayloadCache = (publicId) => {
        if (!publicId || !dialogPayloadCache.has(publicId)) {
          return null;
        }

        const cachedPayload = dialogPayloadCache.get(publicId);
        dialogPayloadCache.delete(publicId);
        dialogPayloadCache.set(publicId, cachedPayload);
        return cloneJson(cachedPayload);
      };

      const prefetchDialogMedia = (messages = []) => {
        const mediaUrls = [];

        for (let index = messages.length - 1; index >= 0; index -= 1) {
          const message = messages[index];
          if (message?.type === "image" && typeof message.mediaUrl === "string" && message.mediaUrl) {
            mediaUrls.push(message.mediaUrl);
          }

          if (mediaUrls.length >= DIALOG_MEDIA_PREFETCH_LIMIT) {
            break;
          }
        }

        mediaUrls.reverse().forEach((url) => {
          if (!url || prefetchedMediaUrls.has(url)) {
            return;
          }

          prefetchedMediaUrls.add(url);
          const image = new Image();
          image.decoding = "async";
          image.onload = () => {
            if (image.naturalWidth > 0 && image.naturalHeight > 0) {
              imageDimensionsCache.set(url, {
                naturalWidth: image.naturalWidth,
                naturalHeight: image.naturalHeight
              });
            }
          };
          image.src = url;
        });
      };

      const readCachedImageDimensions = (url) => {
        if (!url) {
          return null;
        }

        return imageDimensionsCache.get(url) || null;
      };

      const writeImageDimensions = (url, image) => {
        if (!url || !image?.naturalWidth || !image?.naturalHeight) {
          return null;
        }

        const dimensions = {
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight
        };
        imageDimensionsCache.set(url, dimensions);
        return dimensions;
      };

      const measureImageUrl = (url) => new Promise((resolve) => {
        if (!url || imageDimensionsCache.has(url)) {
          resolve(imageDimensionsCache.get(url) || null);
          return;
        }

        const image = new Image();
        let settled = false;
        const settle = (dimensions = null) => {
          if (settled) {
            return;
          }

          settled = true;
          resolve(dimensions);
        };

        image.decoding = "async";
        image.onload = () => settle(writeImageDimensions(url, image));
        image.onerror = () => settle(null);
        image.src = url;

        window.setTimeout(() => settle(null), 9000);
      });

      const preloadDialogMediaDimensions = async (messages = []) => {
        const urls = [];
        const seen = new Set();

        for (let index = (messages?.length || 0) - 1; index >= 0; index -= 1) {
          const message = messages[index];
          const mediaUrl = message?.type === "image" ? String(message.mediaUrl || "").trim() : "";
          if (!mediaUrl || seen.has(mediaUrl) || imageDimensionsCache.has(mediaUrl)) {
            continue;
          }
          seen.add(mediaUrl);
          urls.push(mediaUrl);
          if (urls.length >= 48) {
            break;
          }
        }

        await Promise.all(urls.map((url) => measureImageUrl(url)));
      };

      const startDialogSwitchTransition = () => {
        chatWindow.classList.add("dialog-switching");
        if (dialogSwitchTimer) {
          window.clearTimeout(dialogSwitchTimer);
        }
      };

      const finishDialogSwitchTransition = () => {
        if (dialogSwitchTimer) {
          window.clearTimeout(dialogSwitchTimer);
        }

        dialogSwitchTimer = window.setTimeout(() => {
          chatWindow.classList.remove("dialog-switching");
          dialogSwitchTimer = null;
        }, 170);
      };

      const linkifyMessageBody = (value) => {
        const text = String(value ?? "");
        const linkPattern = new RegExp(
          "(^|[^a-zA-Z0-9_@+.-])(" +
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}" +
            "|(?:\\\\+?\\\\d[\\\\d\\\\s().-]{6,}\\\\d)" +
            "|(?:https?:\\\\/\\\\/|www\\\\.)[^\\\\s<]+" +
            "|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\\\.)+[a-z]{2,}(?:\\\\/[^\\\\s<]*)?" +
          ")",
          "gi"
        );
        let cursor = 0;
        let result = "";

        for (const match of text.matchAll(linkPattern)) {
          const leading = match[1] || "";
          const matchedLink = match[2] || "";
          const start = (match.index ?? 0) + leading.length;
          let end = start + matchedLink.length;
          let visibleLink = matchedLink;
          let trailing = "";

          while (/[),.!?:;]+$/.test(visibleLink)) {
            trailing = visibleLink.slice(-1) + trailing;
            visibleLink = visibleLink.slice(0, -1);
            end -= 1;
          }

          if (!visibleLink) {
            continue;
          }

          const lowerVisibleLink = visibleLink.toLowerCase();
          const isEmail = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(visibleLink);
          const phoneDigits = visibleLink.replace(/\\D/g, "");
          const isPhone = /^\\+?[\\d\\s().-]+$/.test(visibleLink) && phoneDigits.length >= 7;
          const hasHttpScheme = lowerVisibleLink.startsWith("http://") || lowerVisibleLink.startsWith("https://");
          const normalizedHref = isEmail
            ? "mailto:" + visibleLink
            : isPhone
              ? "tel:" + visibleLink.replace(/[\\s().-]/g, "")
              : hasHttpScheme
                ? visibleLink
                : "https://" + visibleLink;

          result += renderEmojiAwareTextHtml(text.slice(cursor, start));
          result += '<a class="message-link" href="' + escapeHtml(normalizedHref) + '" target="_blank" rel="noopener noreferrer">' + renderEmojiAwareTextHtml(visibleLink) + '</a>';
          result += renderEmojiAwareTextHtml(trailing);
          cursor = end;
        }

        result += renderEmojiAwareTextHtml(text.slice(cursor));
        return result;
      };

      const scrollMessagesToBottom = (behavior = "auto") => {
        messageList.scrollTo({
          top: messageList.scrollHeight,
          behavior
        });
      };

      const snapMessagesToBottom = () => {
        suppressBottomLockCancel = true;
        messageList.scrollTop = messageList.scrollHeight;
        requestAnimationFrame(() => {
          suppressBottomLockCancel = false;
        });
      };

      const hardPinMessagesToBottom = (token = 0) => {
        if (bottomLockCanceledByUser || (token && token !== bottomLockToken)) {
          return;
        }

        snapMessagesToBottom();
        requestAnimationFrame(() => {
          if (bottomLockCanceledByUser || (token && token !== bottomLockToken)) {
            return;
          }
          snapMessagesToBottom();
          window.setTimeout(() => {
            if (bottomLockCanceledByUser || (token && token !== bottomLockToken)) {
              return;
            }
            snapMessagesToBottom();
          }, 80);
        });
      };

      const startBottomLock = (options = {}) => {
        bottomLockToken += 1;
        bottomLockCanceledByUser = false;
        if (options.hideList !== false) {
          messageList.classList.add("preparing-bottom");
        } else {
          messageList.classList.remove("preparing-bottom");
        }
        return bottomLockToken;
      };

      const finishBottomLock = (token) => {
        if (bottomLockCanceledByUser || (token && token !== bottomLockToken)) {
          messageList.classList.remove("preparing-bottom");
          return;
        }

        hardPinMessagesToBottom(token);
        messageList.classList.remove("preparing-bottom");
        syncChatScrollBottomButton();
      };

      const cancelBottomLock = () => {
        bottomLockToken += 1;
        bottomLockCanceledByUser = true;
        messageList.classList.remove("preparing-bottom");
      };

      const consumeForceBottomOnNextDialogRender = () => {
        if (!forceBottomOnNextDialogRender) {
          return false;
        }

        forceBottomOnNextDialogRender = false;
        return true;
      };

      const markManualScrollIntent = () => {
        manualScrollIntentAt = Date.now();
        if (pendingAutoBottomDialogPublicId) {
          pendingAutoBottomCanceled = true;
        }
        // Any manual interaction with the history must invalidate the current
        // auto-bottom token, including delayed pins scheduled after first load.
        if (!bottomLockCanceledByUser) {
          cancelBottomLock();
        }
      };

      const computeIsNearChatBottom = () => {
        const distance = messageList.scrollHeight - messageList.clientHeight - messageList.scrollTop;
        return distance <= 140;
      };

      const syncChatScrollBottomButton = () => {
        if (!currentDialogId || messageList.classList.contains("saved-empty")) {
          chatScrollBottom.classList.remove("visible");
          return;
        }

        isNearChatBottom = computeIsNearChatBottom();
        chatScrollBottom.classList.toggle("visible", !isNearChatBottom);
      };

      const getCurrentDialogMessages = () => {
        if (!currentDialogSnapshot) {
          return [];
        }

        return currentMessagesSnapshot.concat(getLocalMessagesForDialog(currentDialogSnapshot.publicId));
      };
`;
