      const explicitApiBase = "";
      const publicWebHosts = new Set(["web.thegrapht.su", "dev.thegrapht.su", "thegrapht.su", "www.thegrapht.su"]);
      const isLoopbackHostname = (value) => /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(String(value || ""));
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
            return resolved.pathname.replace(/\/$/, "") || "/api";
          }

          return resolved.toString().replace(/\/$/, "");
        } catch {
          return publicWebHosts.has(currentHost) && isLoopbackHostname(explicitApiBase)
            ? "/api"
            : (explicitApiBase || "/api");
        }
      };
      const apiBase = resolveApiBase();
      const uiFlags = Object.freeze({"telegramTopBar":true,"desktopInterFont":true,"desktopSideGuttersOnly":true,"sidebarAccountCardHidden":true});
      window.__THEGRAPHT_UI_FLAGS__ = uiFlags;
      const searchEmptyVideoUrl = "/search.mp4";
      const appleEmojiAssetBaseUrl = "/assets/emoji/apple-64/";
      const usersSearchApiUrl = apiBase + "/v1/users/search";
      const createDirectDialogApiUrl = apiBase + "/v1/dialogs/direct";
      const legacySessionStorageKey = "thegrapht_legacy_session_token";
      const legacySessionExpiresStorageKey = "thegrapht_legacy_session_token_expires_at";
      const LEGACY_SESSION_TOKEN_TTL_MS = 10 * 60 * 1000;
      const pageRoot = document.getElementById("page-root");
      
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => document.body.classList.add("fonts-loaded"));
      } else {
        document.body.classList.add("fonts-loaded");
      }
      const appProgress = document.getElementById("app-progress");
      const bootSplash = document.getElementById("boot-splash");
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
      const chatGroupVideoButton = document.getElementById("chat-group-video-button");
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
      const chatProfileStartSecretBtn = document.getElementById("chat-profile-start-secret-btn");
      const chatSearchAvatar = document.getElementById("chat-search-avatar");
      const chatSearchInput = document.getElementById("chat-search-input");
      const chatSearchClose = document.getElementById("chat-search-close");
      const chatSearchResults = document.getElementById("chat-search-results");
      const chatCallChip = document.getElementById("chat-call-chip");
      const chatCallChipTitle = document.getElementById("chat-call-chip-title");
      const chatCallChipTime = document.getElementById("chat-call-chip-time");
      const groupCallBanner = document.getElementById("group-call-banner");
      const groupCallBannerState = document.getElementById("group-call-banner-state");
      const groupCallBannerTitle = document.getElementById("group-call-banner-title");
      const groupCallJoinStrip = document.getElementById("group-call-join-strip");
      const groupCallJoinTitle = document.getElementById("group-call-join-title");
      const groupCallJoinMeta = document.getElementById("group-call-join-meta");
      const groupCallJoinButton = document.getElementById("group-call-join-button");
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
      const emojiPickerSearch = document.getElementById("emoji-picker-search");
      const emojiPickerSlideTrack = document.getElementById("emoji-picker-slide-track");
      const gifPickerBody = document.getElementById("gif-picker-body");
      const emojiModeTabEmoji = document.getElementById("emoji-mode-tab-emoji");
      const emojiModeTabGif = document.getElementById("emoji-mode-tab-gif");
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
      const groupMemberContextMenu = document.getElementById("group-member-context-menu");
      const groupMemberContextMenuBody = document.getElementById("group-member-context-menu-body");
      const profileLinkContextMenu = document.getElementById("profile-link-context-menu");
      const profileLinkContextMenuBody = document.getElementById("profile-link-context-menu-body");
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
      const callModalKicker = document.getElementById("call-modal-kicker");
      const callGroupKicker = document.getElementById("call-group-kicker");
      const callExpandButton = document.getElementById("call-expand-button");
      const callCloseButton = document.getElementById("call-close-button");
      const callPeerAvatar = document.getElementById("call-peer-avatar");
      const callPeerName = document.getElementById("call-peer-name");
      const callPeerStatus = document.getElementById("call-peer-status");
      const callPeerSubstatus = document.getElementById("call-peer-substatus");
      const callVideoStage = document.getElementById("call-video-stage");
      const callRemoteSlot = document.getElementById("call-remote-slot");
      const callLocalSlot = document.getElementById("call-local-slot");
      const callRemoteVideo = document.getElementById("call-remote-video");
      const callLocalVideo = document.getElementById("call-local-video");
      const callVideoPlaceholder = document.getElementById("call-video-placeholder");
      const callScreenShareNotice = document.getElementById("call-screen-share-notice");
      const callGroupPanel = document.getElementById("call-group-panel");
      const callGroupList = document.getElementById("call-group-list");
      const callVideoButton = document.getElementById("call-video-button");
      const callScreenButton = document.getElementById("call-screen-button");
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
      const callEmojiTooltip = document.getElementById("call-emoji-tooltip");
      const groupCallLeaveModal = document.getElementById("group-call-leave-modal");
      const groupCallEndForAll = document.getElementById("group-call-end-for-all");
      const groupCallLeaveCancel = document.getElementById("group-call-leave-cancel");
      const groupCallLeaveConfirm = document.getElementById("group-call-leave-confirm");
      const BOOT_SPLASH_MIN_MS = 0;
      const bootSplashStartedAt = (typeof performance !== "undefined" && typeof performance.now === "function")
        ? performance.now()
        : Date.now();
      let bootSplashHoldPromise = null;
      let bootSplashHidden = false;

      const ensureBootMinDuration = () => {
        if (bootSplashHoldPromise) {
          return bootSplashHoldPromise;
        }
        const now = (typeof performance !== "undefined" && typeof performance.now === "function")
          ? performance.now()
          : Date.now();
        const elapsed = now - bootSplashStartedAt;
        const delay = Math.max(0, BOOT_SPLASH_MIN_MS - elapsed);
        bootSplashHoldPromise = new Promise((resolve) => {
          window.setTimeout(resolve, delay);
        });
        return bootSplashHoldPromise;
      };

      const hideBootSplash = () => {
        if (!bootSplash || bootSplashHidden) {
          return;
        }
        bootSplashHidden = true;
        bootSplash.classList.add("hidden");
        window.dispatchEvent(new CustomEvent("thegrapht:boot-splash-hidden"));
      };
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
        "(?:\\p{Extended_Pictographic}|[\\u{1F1E6}-\\u{1F1FF}]|[#*0-9]\\uFE0F?\\u20E3|[\\u00A9\\u00AE\\u2122])",
        "u"
      );
      const graphemeSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
        ? new Intl.Segmenter("en", { granularity: "grapheme" })
        : null;
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
      const emojiSections = [
        { key: "recent", title: "Recently Used", emojis: [] },
        { key: "people", title: "Smileys & People", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🫢", "🤫", "🫠", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "🤚", "🖐️", "✋", "🖖", "🫲", "🫱", "🫳", "🫴", "🫵", "🫷", "🫸", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸", "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👩‍🦱", "🧑‍🦱", "👨‍🦱", "👩‍🦰", "🧑‍🦰", "👨‍🦰", "👱‍♀️", "👱", "👱‍♂️", "👩‍🦳", "🧑‍🦳", "👨‍🦳", "👩‍🦲", "🧑‍🦲", "👨‍🦲", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳", "👳‍♂️", "🧕", "👮‍♀️", "👮", "👮‍♂️", "👷‍♀️", "👷", "👷‍♂️", "💂‍♀️", "💂", "💂‍♂️", "🕵️‍♀️", "🕵️", "🕵️‍♂️", "👩‍⚕️", "🧑‍⚕️", "👨‍⚕️", "👩‍🌾", "🧑‍🌾", "👨‍🌾", "👩‍🍳", "🧑‍🍳", "👨‍🍳", "👩‍🎓", "🧑‍🎓", "👨‍🎓", "👩‍🎤", "🧑‍🎤", "👨‍🎤", "👩‍🏫", "🧑‍🏫", "👨‍🏫", "👩‍🏭", "🧑‍🏭", "👨‍🏭", "👩‍💻", "🧑‍💻", "👨‍💻", "👩‍💼", "🧑‍💼", "👨‍💼", "👩‍🔧", "🧑‍🔧", "👨‍🔧", "👩‍🔬", "🧑‍🔬", "👨‍🔬", "👩‍🎨", "🧑‍🎨", "👨‍🎨", "👩‍🚒", "🧑‍🚒", "👨‍🚒", "👩‍✈️", "🧑‍✈️", "👨‍✈️", "👩‍🚀", "🧑‍🚀", "👨‍🚀", "👩‍⚖️", "🧑‍⚖️", "👨‍⚖️", "👰‍♀️", "👰", "👰‍♂️", "🤵‍♀️", "🤵", "🤵‍♂️", "👸", "🤴", "🥷", "🦸‍♀️", "🦸", "🦸‍♂️", "🦹‍♀️", "🦹", "🦹‍♂️", "🤶", "🧑‍🎄", "🎅", "🧙‍♀️", "🧙", "🧙‍♂️", "🧝‍♀️", "🧝", "🧝‍♂️", "🧛‍♀️", "🧛", "🧛‍♂️", "🧟‍♀️", "🧟", "🧟‍♂️", "🧞‍♀️", "🧞", "🧞‍♂️", "🧜‍♀️", "🧜", "🧜‍♂️", "🧚‍♀️", "🧚", "🧚‍♂️", "👼", "🤰", "🫄", "🫅", "🤱", "👩‍🍼", "🧑‍🍼", "👨‍🍼", "🙇‍♀️", "🙇", "🙇‍♂️", "💁‍♀️", "💁", "💁‍♂️", "🙅‍♀️", "🙅", "🙅‍♂️", "🙆‍♀️", "🙆", "🙆‍♂️", "🙋‍♀️", "🙋", "🙋‍♂️", "🧏‍♀️", "🧏", "🧏‍♂️", "🤷‍♀️", "🤷", "🤷‍♂️", "🤦‍♀️", "🤦", "🤦‍♂️", "💆‍♀️", "💆", "💆‍♂️", "💇‍♀️", "💇", "💇‍♂️", "🚶‍♀️", "🚶", "🚶‍♂️", "🏃‍♀️", "🏃", "🏃‍♂️", "💃", "🕺", "🕴️", "👯‍♀️", "👯", "👯‍♂️", "🧖‍♀️", "🧖", "🧖‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️", "🧘‍♀️", "🧘", "🧘‍♂️", "🛌", "🗣️", "👤", "👥", "🫂"] },
        { key: "nature", title: "Animals & Nature", emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🦍", "🦧", "🐕", "🐕‍🦺", "🦮", "🐩", "🐺", "🦝", "🐈", "🐈‍⬛", "🐴", "🫎", "🦄", "🦓", "🦌", "🦬", "🐂", "🐃", "🐄", "🐖", "🐗", "🐏", "🐑", "🐐", "🐪", "🐫", "🦙", "🦒", "🐘", "🦣", "🦏", "🦛", "🐁", "🐀", "🐇", "🐿️", "🦫", "🦔", "🐾", "🦃", "🐔", "🐓", "🐣", "🐥", "🐤", "🐦", "🐧", "🕊️", "🦅", "🦆", "🦢", "🦉", "🦤", "🦩", "🦚", "🦜", "🐊", "🐢", "🦎", "🐍", "🐲", "🐉", "🦕", "🦖", "🐳", "🐋", "🐬", "🦭", "🐟", "🐠", "🐡", "🦈", "🐙", "🐚", "🪸", "🐌", "🦋", "🐛", "🐜", "🐝", "🪲", "🐞", "🦗", "🪳", "🕷️", "🕸️", "🦂", "🪰", "🪱", "🦠", "💐", "🌸", "💮", "🪷", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🌰", "🌍", "🌎", "🌏", "🪐", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "💫", "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥", "🌪️", "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "💨", "💧", "💦", "☔", "☂️", "🌊", "🌫️"] },
        { key: "food", title: "Food & Drink", emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🍿", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍢", "🍣", "🍤", "🍥", "🦪", "🍡", "🥟", "🥠", "🥡", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "🥛", "☕", "🫖", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧋", "🧃", "🧉", "🧊", "🥢", "🍽️", "🍴", "🥄"] },
        { key: "activity", title: "Activity & Sport", emojis: ["👾", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🏋️‍♂️", "🤼‍♀️", "🤼", "🤼‍♂️", "🤸‍♀️", "🤸", "🤸‍♂️", "⛹️‍♀️", "⛹️", "⛹️‍♂️", "🤺", "🤾‍♀️", "🤾", "🤾‍♂️", "🏌️‍♀️", "🏌️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘", "🧘‍♂️", "🏄‍♀️", "🏄", "🏄‍♂️", "🏊‍♀️", "🏊", "🏊‍♂️", "🤽‍♀️", "🤽", "🤽‍♂️", "🚣‍♀️", "🚣", "🚣‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️", "🚴‍♀️", "🚴", "🚴‍♂️", "🚵‍♀️", "🚵", "🚵‍♂️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎫", "🎟️", "🎪", "🤹‍♀️", "🤹", "🤹‍♂️", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻", "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", "🧩"] },
        { key: "travel", title: "Travel & Places", emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵", "🏍️", "🛺", "🚲", "🛴", "🛹", "🚏", "🛣️", "🛤️", "🛢️", "⛽", "🚨", "🚥", "🚦", "🛑", "🚧", "⚓", "⛵", "🛶", "🚤", "🛳️", "⛴️", "🚢", "✈️", "🛩️", "🛫", "🛬", "🪂", "💺", "🚁", "🚟", "🎒", "🚡", "🛰️", "🚀", "🛸", "🌌", "⛱️", "🎆", "🎇", "🎑", "🏔️", "⛰️", "🌋", "🗻", "🏕️", "🏖️", "🏜️", "🏝️", "🏞️", "🏟️", "🏛️", "🏗️", "🧱", "🏘️", "🏚️", "🏠", "🏡", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "💒", "🗼", "🗽", "⛪", "🕌", "🕍", "⛩️", "🕋", "⛲", "⛺", "🌁", "🌃", "🏙️", "🌄", "🌅", "🌆", "🌇", "🌉", "🎠", "🎡", "🎢", "💈", "🎪"] },
        { key: "objects", title: "Objects", emojis: ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🪛", "🔧", "🔨", "⚒️", "⛏️", "🪓", "🛡️", "⚙️", "⛓️", "🪝", "🧱", "🔫", "💣", "🪃", "🔪", "🗡️", "⚔️", "🚬", "⚰️", "🪦", "⚱️", "🔮", "📿", "🧿", "⚗️", "🔭", "🔬", "🕳️", "🩹", "🩺", "💊", "💉", "🧬", "🧼", "🧽", "🪥", "🪒", "🚿", "🛁", "🛀", "🔑", "🗝️", "🚪", "🪞", "🪟", "🪑", "🛋️", "🪠", "🧸", "🪆", "🧹", "🧺", "🧻", "🪣", "🪽", "🪯", "🪢", "🪡", "🧶", "🧵", "🎈", "🎏", "🎀", "🎁", "🎊", "🎉", "🪄", "🪅", "🧧", "✉️", "📩", "📨", "📧", "💌", "📥", "📤", "📦", "🏷️", "📪", "📫", "📬", "📭", "📮", "📯", "📜", "📃", "📄", "📑", "🧾", "📊", "📈", "📉", "🗒️", "🗓️", "📆", "📅", "🗑️", "📇", "🗃️", "🗳️", "🗄️", "📋", "📁", "📂", "🗂️", "🗞️", "📰", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚", "📖", "🔖", "🧷", "🔗", "📎", "🖇️", "📐", "📏", "📌", "📍", "🗺️", "✒️", "🖋️", "🖊️", "🖌️", "🖍️", "📝", "✏️", "🔍", "🔎", "🔒", "🔓", "🔏", "🔐"] },
        { key: "symbols", title: "Symbols", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🈳", "🈹", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈲", "🅰️", "🅱️", "🆎", "🅾️", "🆑", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "🔱", "⚜️", "〽️", "⚠️", "🚸", "🔰", "♻️", "🈯", "💹", "❇️", "✳️", "❎", "✅", "💠", "🌀", "➿", "🌐", "Ⓜ️", "🏧", "🚾", "♿", "🅿️", "🛗", "🈁", "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧️", "🚻", "🚮", "🎦", "📶", "🆖", "🆗", "🆙", "🆒", "🆕", "🎰", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "▶️", "⏸️", "⏯️", "⏹️", "⏺️", "⏏️", "⏭️", "⏮️", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾️", "💲", "💱", "™️", "ℹ️", "🎌", "🔚", "🔙", "🔛", "🔝", "🔜", "☑️", "🔘", "⚪", "⚫", "🔴", "🔵", "🟤", "🟣", "🟢", "🟡", "🟠", "🟥", "🟦", "🟫", "🟪", "🟩", "🟨", "🟧"] },
        { key: "flags", title: "Flags", emojis: ["🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇷🇺", "🇺🇸", "🇬🇧", "🇨🇳", "🇩🇪", "🇫🇷", "🇯🇵", "🇮🇹", "🇪🇸", "🇧🇷", "🇰🇷", "🇮🇳", "🇨🇦", "🇦🇺", "🇹🇷", "🇪🇬", "🇿🇦", "🇸🇦", "🇦🇪", "🇮🇱", "🇮🇷", "🇺🇦", "🇧🇾", "🇰🇿", "🇬🇪", "🇦🇲", "🇦🇿", "🇺🇿", "🇰🇬", "🇹🇯", "🇹🇲", "🇲🇩", "🇱🇹", "🇱🇻", "🇪🇪", "🇪🇺", "🇻🇳", "🇮🇩", "🇲🇾", "🇸🇬", "🇹🇭", "🇵🇭", "🇲🇽", "🇦🇷", "🇨🇱", "🇨🇴", "🇵🇪", "🇻🇪", "🇳🇬", "🇰🇪", "🇪🇹", "🇲🇦", "🇩🇿", "🇹🇳", "🇵🇱", "🇷🇴", "🇳🇱", "🇧🇪", "🇨🇭", "🇦🇹", "🇸🇪", "🇳🇴", "🇩🇰", "🇫🇮", "🇮🇪", "🇬🇷", "🇵🇹", "🇮🇸", "🇳🇿"] }
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
      let isFirstRealtimeConnection = true;
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
      let mediaMessageSendInFlight = false;
      let emojiPickerCloseTimer = null;
      let attachMenuCloseTimer = null;
      let pickerMode = "emoji";
      const GIF_RECENTS_STORAGE_KEY = "tg_gif_recents";
      const GIF_RECENTS_LIMIT = 100;
      const dialogPayloadCache = new Map();
      const prefetchedMediaUrls = new Set();
      const imageDimensionsCache = new Map();
      const dialogScrollTopCache = new Map();
      try {
        const storedTops = window.localStorage.getItem("tg_dialog_scroll_tops");
        if (storedTops) {
          const parsed = JSON.parse(storedTops);
          if (parsed && typeof parsed === "object") {
            for (const [key, value] of Object.entries(parsed)) {
              if (Number.isFinite(value)) {
                dialogScrollTopCache.set(key, value);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to load dialog scroll tops:", e);
      }
      const DIALOG_SCROLL_CACHE_LIMIT = 80;
      const visitedDialogsInSession = new Set();

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

        try {
          const obj = {};
          for (const [k, v] of dialogScrollTopCache.entries()) {
            obj[k] = v;
          }
          window.localStorage.setItem("tg_dialog_scroll_tops", JSON.stringify(obj));
        } catch (e) {}
      };

      const getDialogScrollTop = (publicId) => {
        if (!publicId || !dialogScrollTopCache.has(publicId)) {
          return null;
        }

        const value = dialogScrollTopCache.get(publicId);
        dialogScrollTopCache.delete(publicId);
        dialogScrollTopCache.set(publicId, value);

        try {
          const obj = {};
          for (const [k, v] of dialogScrollTopCache.entries()) {
            obj[k] = v;
          }
          window.localStorage.setItem("tg_dialog_scroll_tops", JSON.stringify(obj));
        } catch (e) {}

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
      let groupMemberContextMenuCloseTimer = null;
      let groupMemberContextMenuState = null;
      let profileLinkContextMenuCloseTimer = null;
      let profileLinkContextMenuState = null;
      let deleteMessageTarget = null;
      let currentUserDisplayName = "";
      let currentUserAvatarLetter = "";
      let currentUserAvatarUrl = "";
      let notificationPermissionBound = false;
      let sendAudioNode = null;
      let messageAudioNode = null;
      const desktopNotificationIds = new Set();
      const realtimeMessageSeenAt = new Map();
      const recentlyDeletedMessageIds = new Map();
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
      const DELETED_MESSAGE_TOMBSTONE_TTL_MS = 8 * 60 * 1000;

      const markMessageDeletedLocally = (messageId) => {
        const id = String(messageId || "").trim();
        if (!id) {
          return;
        }
        const nowTs = Date.now();
        recentlyDeletedMessageIds.set(id, nowTs);
        if (recentlyDeletedMessageIds.size > 3000) {
          const threshold = nowTs - DELETED_MESSAGE_TOMBSTONE_TTL_MS;
          recentlyDeletedMessageIds.forEach((timestamp, key) => {
            if (!timestamp || timestamp < threshold) {
              recentlyDeletedMessageIds.delete(key);
            }
          });
        }
      };

      const isMessageDeletedLocally = (messageId) => {
        const id = String(messageId || "").trim();
        if (!id) {
          return false;
        }
        const ts = Number(recentlyDeletedMessageIds.get(id) || 0);
        if (!ts) {
          return false;
        }
        if ((Date.now() - ts) > DELETED_MESSAGE_TOMBSTONE_TTL_MS) {
          recentlyDeletedMessageIds.delete(id);
          return false;
        }
        return true;
      };

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
      const COMPOSER_INPUT_MIN_HEIGHT_PX = 46;
      const COMPOSER_INPUT_MAX_HEIGHT_PX = 200;

      const syncComposerInputHeight = () => {
        if (!composerInput) {
          return;
        }
        composerInput.style.height = "auto";
        if (!composerInput.value) {
          composerInput.style.height = COMPOSER_INPUT_MIN_HEIGHT_PX + "px";
          composerInput.style.overflowY = "hidden";
          return;
        }
        const nextHeight = Math.min(
          COMPOSER_INPUT_MAX_HEIGHT_PX,
          Math.max(COMPOSER_INPUT_MIN_HEIGHT_PX, composerInput.scrollHeight || COMPOSER_INPUT_MIN_HEIGHT_PX)
        );
        composerInput.style.height = nextHeight + "px";
        composerInput.style.overflowY = nextHeight >= COMPOSER_INPUT_MAX_HEIGHT_PX ? "auto" : "hidden";
      };

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
        syncComposerInputHeight();
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

      const readRecentGifs = () => {
        try {
          const parsed = JSON.parse(window.localStorage.getItem(GIF_RECENTS_STORAGE_KEY) || "[]");
          return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()).slice(0, GIF_RECENTS_LIMIT) : [];
        } catch {
          return [];
        }
      };

      const writeRecentGifs = (gifs) => {
        try {
          window.localStorage.setItem(GIF_RECENTS_STORAGE_KEY, JSON.stringify(gifs.slice(0, GIF_RECENTS_LIMIT)));
        } catch {}
      };

      const rememberRecentGif = (gifUrl) => {
        const nextRecents = [gifUrl].concat(readRecentGifs().filter((item) => item !== gifUrl)).slice(0, GIF_RECENTS_LIMIT);
        writeRecentGifs(nextRecents);
      };

      const filterEmojiSections = (sections, query) => {
        if (!query) {
          return sections;
        }
        const lowerQuery = query.toLowerCase();
        return sections.map((section) => ({
          ...section,
          emojis: section.emojis.filter((emoji) => emoji.toLowerCase().includes(lowerQuery))
        })).filter((section) => section.emojis.length > 0);
      };

      const setPickerMode = (mode) => {
        pickerMode = mode;
        if (emojiModeTabEmoji) {
          emojiModeTabEmoji.classList.toggle("active", mode === "emoji");
        }
        if (emojiModeTabGif) {
          emojiModeTabGif.classList.toggle("active", mode === "gif");
        }
        if (emojiPickerSlideTrack) {
          emojiPickerSlideTrack.style.transform = mode === "gif" ? "translateX(-50%)" : "translateX(0)";
        }
        if (emojiPickerSearch) {
          emojiPickerSearch.placeholder = mode === "gif" ? "Search GIFs" : "Search Emoji";
          emojiPickerSearch.value = "";
        }
        if (emojiPickerHead) {
          emojiPickerHead.style.display = mode === "gif" ? "none" : "";
        }
        if (mode === "gif") {
          renderGifPicker();
        }
      };

      let gifSearchTimeout = null;

      const renderGifPicker = async () => {
        if (!gifPickerBody) {
          return;
        }
        const query = emojiPickerSearch ? emojiPickerSearch.value.trim() : "";
        
        if (query) {
          gifPickerBody.innerHTML =
            '<div class="gif-empty-state">' +
              '<span class="material-symbols-rounded" aria-hidden="true" style="display: inline-block; animation: spin 1s linear infinite;">autorenew</span>' +
              '<div class="gif-empty-state-text">Поиск в Giphy...</div>' +
            '</div>';
          
          if (gifSearchTimeout) {
            window.clearTimeout(gifSearchTimeout);
          }
          
          gifSearchTimeout = window.setTimeout(async () => {
            try {
              const res = await fetch(apiBase + "/v1/gifs/search?q=" + encodeURIComponent(query));
              if (!res.ok) throw new Error("Giphy API error");
              const json = await res.json();
              const items = json.data || [];
              
              if (items.length === 0) {
                gifPickerBody.innerHTML =
                  '<div class="gif-empty-state">' +
                    '<span class="material-symbols-rounded" aria-hidden="true">gif_box</span>' +
                    '<div class="gif-empty-state-text">Ничего не найдено</div>' +
                  '</div>';
                return;
              }
              
              gifPickerBody.innerHTML =
                '<p class="emoji-picker-title" style="margin-top: 4px; margin-bottom: 10px;">Результаты поиска</p>' +
                '<div class="gif-grid">' +
                  items.map((item) => {
                    const previewUrl = item.images.fixed_height_downsampled?.url || item.images.fixed_height?.url || item.images.original?.url;
                    const originalUrl = item.images.downsized?.url || item.images.original?.url;
                    return (
                      '<button class="gif-grid-item" type="button" data-gif-url="' + escapeHtml(originalUrl) + '">' +
                        '<img src="' + escapeHtml(previewUrl) + '" alt="GIF" loading="lazy" decoding="async" referrerpolicy="no-referrer" />' +
                      '</button>'
                    );
                  }).join("") +
                '</div>';
                
              gifPickerBody.querySelectorAll("[data-gif-url]").forEach((button) => {
                button.addEventListener("click", () => {
                  const gifUrl = button.getAttribute("data-gif-url");
                  if (!gifUrl) return;
                  rememberRecentGif(gifUrl);
                  const selectionStart = composerInput.selectionStart ?? composerInput.value.length;
                  const selectionEnd = composerInput.selectionEnd ?? composerInput.value.length;
                  composerInput.value = composerInput.value.slice(0, selectionStart) + gifUrl + composerInput.value.slice(selectionEnd);
                  composerInput.focus();
                  composerInput.setSelectionRange(selectionStart + gifUrl.length, selectionStart + gifUrl.length);
                  syncComposerState();
                  closeEmojiPicker();
                });
              });
            } catch (err) {
              console.error("Giphy search failed:", err);
              gifPickerBody.innerHTML =
                '<div class="gif-empty-state">' +
                  '<span class="material-symbols-rounded" aria-hidden="true">error</span>' +
                  '<div class="gif-empty-state-text">Ошибка поиска</div>' +
                '</div>';
            }
          }, 300);
        } else {
          // Empty query - Render Recent AND Trending!
          const recentGifs = readRecentGifs();
          
          let htmlMarkup = "";
          
          if (recentGifs.length > 0) {
            htmlMarkup +=
              '<p class="emoji-picker-title" style="margin-top: 4px; margin-bottom: 10px;">Недавние</p>' +
              '<div class="gif-grid" style="margin-bottom: 16px;">' +
                recentGifs.map((gifUrl) => (
                  '<button class="gif-grid-item" type="button" data-gif-url="' + escapeHtml(gifUrl) + '">' +
                    '<img src="' + escapeHtml(gifUrl) + '" alt="GIF" loading="lazy" decoding="async" referrerpolicy="no-referrer" />' +
                  '</button>'
                )).join("") +
              '</div>';
          }
          
          // Add a loading state for recommended/trending section
          htmlMarkup +=
            '<p class="emoji-picker-title" style="margin-top: 4px; margin-bottom: 10px;">Рекомендуемые</p>' +
            '<div id="giphy-trending-container">' +
              '<div class="gif-empty-state" style="padding: 20px 0;">' +
                '<span class="material-symbols-rounded" aria-hidden="true" style="display: inline-block; animation: spin 1s linear infinite;">autorenew</span>' +
                '<div class="gif-empty-state-text">Загрузка рекомендаций...</div>' +
              '</div>' +
            '</div>';
            
          gifPickerBody.innerHTML = htmlMarkup;
          
          // Setup click handlers for the Recent grid
          gifPickerBody.querySelectorAll("[data-gif-url]").forEach((button) => {
            button.addEventListener("click", () => {
              const gifUrl = button.getAttribute("data-gif-url");
              if (!gifUrl) return;
              rememberRecentGif(gifUrl);
              const selectionStart = composerInput.selectionStart ?? composerInput.value.length;
              const selectionEnd = composerInput.selectionEnd ?? composerInput.value.length;
              composerInput.value = composerInput.value.slice(0, selectionStart) + gifUrl + composerInput.value.slice(selectionEnd);
              composerInput.focus();
              composerInput.setSelectionRange(selectionStart + gifUrl.length, selectionStart + gifUrl.length);
              syncComposerState();
              closeEmojiPicker();
            });
          });
          
          // Fetch trending Giphys asynchronously!
          try {
            const res = await fetch(apiBase + "/v1/gifs/search?q=");
            if (!res.ok) throw new Error("Giphy API error");
            const json = await res.json();
            const items = json.data || [];
            
            const trendingContainer = document.getElementById("giphy-trending-container");
            if (!trendingContainer) return;
            
            if (items.length === 0) {
              trendingContainer.innerHTML =
                '<div class="gif-empty-state" style="padding: 20px 0;">' +
                  '<span class="material-symbols-rounded" aria-hidden="true">gif_box</span>' +
                  '<div class="gif-empty-state-text">Рекомендации недоступны</div>' +
                '</div>';
              return;
            }
            
            trendingContainer.innerHTML =
              '<div class="gif-grid">' +
                items.map((item) => {
                  const previewUrl = item.images.fixed_height_downsampled?.url || item.images.fixed_height?.url || item.images.original?.url;
                  const originalUrl = item.images.downsized?.url || item.images.original?.url;
                  return (
                    '<button class="gif-grid-item" type="button" data-gif-url="' + escapeHtml(originalUrl) + '">' +
                      '<img src="' + escapeHtml(previewUrl) + '" alt="GIF" loading="lazy" decoding="async" referrerpolicy="no-referrer" />' +
                    '</button>'
                  );
                }).join("") +
              '</div>';
              
            // Setup click handlers for the newly loaded Trending grid
            trendingContainer.querySelectorAll("[data-gif-url]").forEach((button) => {
              button.addEventListener("click", () => {
                const gifUrl = button.getAttribute("data-gif-url");
                if (!gifUrl) return;
                rememberRecentGif(gifUrl);
                const selectionStart = composerInput.selectionStart ?? composerInput.value.length;
                const selectionEnd = composerInput.selectionEnd ?? composerInput.value.length;
                composerInput.value = composerInput.value.slice(0, selectionStart) + gifUrl + composerInput.value.slice(selectionEnd);
                composerInput.focus();
                composerInput.setSelectionRange(selectionStart + gifUrl.length, selectionStart + gifUrl.length);
                syncComposerState();
                closeEmojiPicker();
              });
            });
          } catch (err) {
            console.error("Failed to load Giphy trending:", err);
            const trendingContainer = document.getElementById("giphy-trending-container");
            if (trendingContainer) {
              trendingContainer.innerHTML =
                '<div class="gif-empty-state" style="padding: 20px 0;">' +
                  '<span class="material-symbols-rounded" aria-hidden="true">error</span>' +
                  '<div class="gif-empty-state-text">Не удалось загрузить рекомендации</div>' +
                '</div>';
            }
          }
        }
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
              ? '<img class="inline-emoji' + extraClass + '" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(segment) + '" onerror=\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\' draggable="false" loading="lazy" decoding="async">'
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
        if (!composerInput || !composerInputOverlay) {
          return;
        }

        const value = String(composerInput.value || "");
        if (!value) {
          composerInputOverlay.classList.add("empty");
          composerInputOverlay.innerHTML = '<span class="composer-input-placeholder">Message</span>';
          composerInput.parentElement?.classList.remove("has-rendered-emoji");
          return;
        }

        const hasEmoji = emojiClusterPattern.test(value);
        if (!hasEmoji) {
          composerInputOverlay.classList.add("empty");
          composerInputOverlay.innerHTML = "";
          composerInput.parentElement?.classList.remove("has-rendered-emoji");
          return;
        }

        composerInputOverlay.classList.remove("empty");
        composerInputOverlay.innerHTML = renderEmojiAwareTextHtml(value, {
          wrapEmoji: true,
          transparentText: true,
          extraClass: "composer-inline-emoji"
        });
        composerInput.parentElement?.classList.add("has-rendered-emoji");
      };

      const renderEmojiPicker = () => {
        const query = emojiPickerSearch ? emojiPickerSearch.value.trim() : "";
        const recentSection = {
          ...emojiSections[0],
          emojis: readRecentEmojis()
        };
        let sections = [recentSection].concat(emojiSections.slice(1));
        if (query) {
          sections = filterEmojiSections(sections, query);
        }

        emojiPickerHead.innerHTML = sections.map((section, index) => {
          const emojiChar = emojiTabIcons[section.key] || "";
          const emojiAssetUrl = getEmojiAssetUrl(emojiChar);
          const iconHtml = emojiAssetUrl
            ? '<img class="emoji-picker-tab-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emojiChar) + '" onerror=\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\' aria-hidden="true" loading="lazy" decoding="async">'
            : '<span class="emoji-picker-tab-fallback">' + escapeHtml(emojiChar) + '</span>';

          return '<button class="emoji-picker-tab' + (index === 0 ? ' active' : '') + '" type="button" data-emoji-tab="' + section.key + '" aria-label="' + escapeHtml(section.title) + '">' +
            iconHtml +
          '</button>';
        }).join("");

        if (sections.length === 0) {
          emojiPickerBody.innerHTML = '<div class="emoji-picker-no-results">Ничего не найдено</div>';
          return;
        }

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
                        ? '<img class="emoji-button-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emoji) + '" onerror=\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\' aria-hidden="true" loading="lazy" decoding="async">'
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
            const targetSection = emojiPickerBody.querySelector('[data-emoji-section="' + key + '"]');
            if (targetSection) {
              const targetScrollTop = targetSection.getBoundingClientRect().top - emojiPickerBody.getBoundingClientRect().top + emojiPickerBody.scrollTop;
              emojiPickerBody.scrollTo({
                top: targetScrollTop,
                behavior: "smooth"
              });
            }
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
        if (emojiPickerSearch) {
          emojiPickerSearch.value = "";
        }
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
        setPickerMode("emoji");
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
        if (!messageList || prefersReducedMotion()) {
          return;
        }

        const nodes = Array.from(
          messageList.querySelectorAll(".message, .saved-empty-state, .direct-empty-state, .empty-chat-state")
        );
        if (!nodes.length) {
          return;
        }

        nodes.forEach((node, index) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          node.classList.remove("is-visible");
          node.classList.add("message-stagger-item");
          node.style.transitionDelay = String((nodes.length - 1 - index) * 50) + "ms";
        });

        requestAnimationFrame(() => {
          nodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) {
              return;
            }
            node.classList.add("is-visible");
          });
        });

        const cleanupDelay = (nodes.length * 50) + 500;
        window.setTimeout(() => {
          nodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) {
              return;
            }
            node.classList.remove("message-stagger-item", "is-visible");
            node.style.transitionDelay = "";
          });
        }, cleanupDelay);
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

        let targetUrl = url;
        if (typeof window.mediaUrlToBlobUrlCache !== "undefined" && window.mediaUrlToBlobUrlCache && window.mediaUrlToBlobUrlCache.has(url)) {
          targetUrl = window.mediaUrlToBlobUrlCache.get(url);
        }

        return imageDimensionsCache.get(targetUrl) || imageDimensionsCache.get(url) || null;
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
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" +
            "|(?:\\+?\\d[\\d\\s().-]{6,}\\d)" +
            "|(?:https?:\\/\\/|www\\.)[^\\s<]+" +
            "|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}(?:\\/[^\\s<]*)?" +
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
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visibleLink);
          const phoneDigits = visibleLink.replace(/\D/g, "");
          const isPhone = /^\+?[\d\s().-]+$/.test(visibleLink) && phoneDigits.length >= 7;
          const hasHttpScheme = lowerVisibleLink.startsWith("http://") || lowerVisibleLink.startsWith("https://");
          const normalizedHref = isEmail
            ? "mailto:" + visibleLink
            : isPhone
              ? "tel:" + visibleLink.replace(/[\s().-]/g, "")
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

      // Global Material Design Ripple Effect with Release Fade-out
      const createRipple = (e) => {
        const target = e.target.closest("button, [role='button'], .dialog-item, .sidebar-glass-menu-item, .sidebar-profile-setting-row, .sidebar-profile-premium-row, .btn, .chat-island-action");
        if (!target || target.disabled || target.classList.contains("disabled")) return;
        
        const style = window.getComputedStyle(target);
        const origPosition = style.position;
        if (origPosition !== "absolute" && origPosition !== "relative" && origPosition !== "fixed") {
          target.style.position = "relative";
        }
        
        const origOverflow = style.overflow;
        if (origOverflow !== "hidden") {
          target.style.overflow = "hidden";
        }
        
        const rect = target.getBoundingClientRect();
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        
        if (e.touches && e.touches[0]) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        }
        
        let x = clientX - rect.left;
        let y = clientY - rect.top;
        
        if (typeof clientX !== "number" || isNaN(x) || isNaN(y)) {
          x = rect.width / 2;
          y = rect.height / 2;
        }
        
        const dx = Math.max(x, rect.width - x);
        const dy = Math.max(y, rect.height - y);
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        target.querySelectorAll(".material-ripple").forEach(r => r.remove());
        
        const ripple = document.createElement("span");
        ripple.className = "material-ripple";
        ripple.style.width = (radius * 2) + "px";
        ripple.style.height = (radius * 2) + "px";
        ripple.style.left = (x - radius) + "px";
        ripple.style.top = (y - radius) + "px";
        
        target.appendChild(ripple);
        
        // Trigger layout reflow to register starting scale(0)
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        ripple.offsetWidth;
        
        ripple.style.transform = "scale(1)";
        ripple.style.opacity = "1";
        
        const startTime = Date.now();
        
        const releaseRipple = () => {
          const elapsed = Date.now() - startTime;
          const delay = Math.max(0, 320 - elapsed);
          
          setTimeout(() => {
            ripple.style.opacity = "0";
            
            setTimeout(() => {
              ripple.remove();
              if (target && !target.querySelector(".material-ripple")) {
                if (origPosition !== "absolute" && origPosition !== "relative" && origPosition !== "fixed") {
                  target.style.removeProperty("position");
                }
                if (origOverflow !== "hidden") {
                  target.style.removeProperty("overflow");
                }
              }
            }, 450);
          }, delay);
          
          target.removeEventListener("mouseup", releaseRipple);
          target.removeEventListener("mouseleave", releaseRipple);
          target.removeEventListener("touchend", releaseRipple);
          target.removeEventListener("touchcancel", releaseRipple);
        };
        
        target.addEventListener("mouseup", releaseRipple);
        target.addEventListener("mouseleave", releaseRipple);
        target.addEventListener("touchend", releaseRipple);
        target.addEventListener("touchcancel", releaseRipple);
      };
      
      document.addEventListener("mousedown", createRipple);
      document.addEventListener("touchstart", createRipple, { passive: true });

      const secureFeatureState = {
        identityPromise: null,
        publishPromise: null,
        dialogKeys: new Map(),
        keyBundles: new Map()
      };
      const SECURE_LOG_PREFIX = "[TheGraphT Secure]";
      const logSecure = (event, details = {}) => {
        try {
          console.info(SECURE_LOG_PREFIX, event, details);
        } catch {}
      };
      const warnSecure = (event, details = {}) => {
        try {
          console.warn(SECURE_LOG_PREFIX, event, details);
        } catch {}
      };
      const secureDialogsDirectApiUrl = apiBase + "/v1/dialogs/direct/secure";
      const secureKeyBundleApiUrl = apiBase + "/v1/e2e/key-bundle";
      const secureKeyStoragePrefix = "thegrapht_secure_identity_v1:";
      const secureDialogKeyStoragePrefix = "thegrapht_secure_dialog_key_v2:";

      const isSecureDialog = (dialog) => dialog?.encryptionMode === "e2e_v1";
      const hasSecureCrypto = () => Boolean(window.crypto?.subtle && window.TextEncoder && window.TextDecoder);

      const toBase64 = (bytes) => {
        let binary = "";
        const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        for (let index = 0; index < view.length; index += 1) {
          binary += String.fromCharCode(view[index]);
        }
        return btoa(binary);
      };

      const fromBase64 = (value) => {
        const binary = atob(String(value || ""));
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
      };

      const encodeUtf8 = (value) => new TextEncoder().encode(String(value || ""));
      const decodeUtf8 = (bytes) => new TextDecoder().decode(bytes);

      const hashSecureKeyId = async (text) => {
        const digest = await window.crypto.subtle.digest("SHA-256", encodeUtf8(text));
        return toBase64(new Uint8Array(digest)).replace(/=+$/g, "").slice(0, 24);
      };

      const importSecurePublicJwk = (jwk) => window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
          name: "ECDH",
          namedCurve: "P-256"
        },
        true,
        []
      );

      const importSecurePrivateJwk = (jwk) => window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
          name: "ECDH",
          namedCurve: "P-256"
        },
        true,
        ["deriveBits"]
      );

      const importDialogKey = (rawKey) => window.crypto.subtle.importKey(
        "raw",
        rawKey,
        {
          name: "AES-GCM"
        },
        true,
        ["encrypt", "decrypt"]
      );

      const deriveWrappingKey = async (privateKey, peerPublicJwk) => {
        const peerPublicKey = await importSecurePublicJwk(peerPublicJwk);
        const rawBits = await window.crypto.subtle.deriveBits(
          {
            name: "ECDH",
            public: peerPublicKey
          },
          privateKey,
          256
        );
        return importDialogKey(rawBits);
      };

      const loadStoredSecureIdentity = async (userId) => {
        const raw = window.localStorage.getItem(secureKeyStoragePrefix + userId);
        if (!raw) {
          return null;
        }

        const parsed = JSON.parse(raw);
        if (!parsed?.publicJwk || !parsed?.privateJwk || parsed.algorithm !== "P-256") {
          return null;
        }

        const [publicKey, privateKey] = await Promise.all([
          importSecurePublicJwk(parsed.publicJwk),
          importSecurePrivateJwk(parsed.privateJwk)
        ]);

        return {
          algorithm: "P-256",
          keyId: parsed.keyId,
          publicKey,
          privateKey,
          publicJwk: parsed.publicJwk,
          privateJwk: parsed.privateJwk,
          publicKeyPayload: parsed.publicKeyPayload
        };
      };

      const createSecureIdentity = async (userId) => {
        const keyPair = await window.crypto.subtle.generateKey(
          {
            name: "ECDH",
            namedCurve: "P-256"
          },
          true,
          ["deriveBits"]
        );
        const [publicJwk, privateJwk] = await Promise.all([
          window.crypto.subtle.exportKey("jwk", keyPair.publicKey),
          window.crypto.subtle.exportKey("jwk", keyPair.privateKey)
        ]);
        const publicKeyPayload = JSON.stringify(publicJwk);
        const keyId = await hashSecureKeyId(publicKeyPayload);
        const identity = {
          algorithm: "P-256",
          keyId,
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey,
          publicJwk,
          privateJwk,
          publicKeyPayload
        };
        window.localStorage.setItem(secureKeyStoragePrefix + userId, JSON.stringify({
          algorithm: identity.algorithm,
          keyId: identity.keyId,
          publicJwk,
          privateJwk,
          publicKeyPayload
        }));
        return identity;
      };

      const ensureSecureIdentity = async () => {
        if (!currentUserId || !hasSecureCrypto()) {
          return null;
        }

        if (!secureFeatureState.identityPromise) {
          secureFeatureState.identityPromise = (async () => {
            const stored = await loadStoredSecureIdentity(currentUserId);
            return stored || createSecureIdentity(currentUserId);
          })().catch((error) => {
            secureFeatureState.identityPromise = null;
            throw error;
          });
        }

        return secureFeatureState.identityPromise;
      };

      const getSecureDialogStorageKey = (dialogPublicId) => secureDialogKeyStoragePrefix + currentUserId + ":" + dialogPublicId;

      const persistDialogKey = (dialogPublicId, rawKey, keyId) => {
        const serialized = JSON.stringify({
          keyId,
          rawKey: toBase64(new Uint8Array(rawKey))
        });
        secureFeatureState.dialogKeys.set(dialogPublicId, {
          keyId,
          rawKey,
          cryptoKeyPromise: Promise.resolve(importDialogKey(rawKey))
        });
        window.localStorage.setItem(getSecureDialogStorageKey(dialogPublicId), serialized);
      };

      const loadPersistedDialogKey = async (dialogPublicId) => {
        const raw = window.localStorage.getItem(getSecureDialogStorageKey(dialogPublicId));
        if (!raw) {
          return null;
        }

        const parsed = JSON.parse(raw);
        const rawKey = fromBase64(parsed.rawKey);
        const entry = {
          keyId: parsed.keyId || "",
          rawKey,
          cryptoKeyPromise: importDialogKey(rawKey)
        };
        secureFeatureState.dialogKeys.set(dialogPublicId, entry);
        return entry;
      };
      const invalidateDialogKeyCache = (dialogPublicId) => {
        if (!dialogPublicId) {
          return;
        }
        secureFeatureState.dialogKeys.delete(dialogPublicId);
        try {
          window.localStorage.removeItem(getSecureDialogStorageKey(dialogPublicId));
        } catch {}
      };

      const fetchJsonWithStatus = async (url, options = {}) => {
        const headers = {
          ...(options.headers || {})
        };
        const host = String(window.location.hostname || "").toLowerCase();
        const isDesktop = host === "" || (typeof window !== "undefined" && (!!window.tgDesktop || !!window.__TAURI_INTERNALS__));
        const canUseLegacyAuthorizationHeader = host === "localhost"
          || host === "127.0.0.1"
          || host.endsWith(".local")
          || isDesktop;
        if (canUseLegacyAuthorizationHeader && legacySessionToken && !headers.Authorization) {
          headers.Authorization = "Bearer " + legacySessionToken;
        }

        const response = await fetch(url, {
          credentials: "include",
          ...options,
          headers
        });
        const rawBody = await response.text();
        const payload = rawBody ? JSON.parse(rawBody) : {};
        return {
          ok: response.ok,
          status: response.status,
          payload
        };
      };

      const ensureOwnSecureKeyBundlePublished = async () => {
        if (!currentUserId || !hasSecureCrypto()) {
          return null;
        }

        if (!secureFeatureState.publishPromise) {
          secureFeatureState.publishPromise = (async () => {
            const identity = await ensureSecureIdentity();
            if (!identity) {
              return null;
            }

            await fetchJson(secureKeyBundleApiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                publicKey: identity.publicKeyPayload,
                algorithm: identity.algorithm
              })
            });

            return identity;
          })().catch((error) => {
            secureFeatureState.publishPromise = null;
            throw error;
          });
        }

        return secureFeatureState.publishPromise;
      };

      const getPeerSecureBundle = async (userId) => {
        if (secureFeatureState.keyBundles.has(userId)) {
          return secureFeatureState.keyBundles.get(userId);
        }

        const response = await fetchJsonWithStatus(apiBase + "/v1/e2e/users/" + encodeURIComponent(userId) + "/key-bundle");
        if (!response.ok) {
          return null;
        }

        const bundle = {
          ...response.payload,
          publicJwk: JSON.parse(response.payload.publicKey)
        };
        secureFeatureState.keyBundles.set(userId, bundle);
        return bundle;
      };

      const wrapDialogKeyForPublicJwk = async ({ rawDialogKey, localIdentity, recipientPublicJwk }) => {
        const wrappingKey = await deriveWrappingKey(localIdentity.privateKey, recipientPublicJwk);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const wrappedKey = await window.crypto.subtle.encrypt(
          {
            name: "AES-GCM",
            iv
          },
          wrappingKey,
          rawDialogKey
        );

        return JSON.stringify({
          version: 1,
          algorithm: "P-256-AES-GCM",
          senderKeyId: localIdentity.keyId,
          iv: toBase64(iv),
          wrappedKey: toBase64(new Uint8Array(wrappedKey))
        });
      };

      const ensureSecureDialogKey = async (dialog) => {
        if (!dialog?.publicId || !isSecureDialog(dialog) || !hasSecureCrypto()) {
          return null;
        }

        const cached = secureFeatureState.dialogKeys.get(dialog.publicId) || await loadPersistedDialogKey(dialog.publicId);
        if (cached) {
          return {
            keyId: cached.keyId,
            cryptoKey: await cached.cryptoKeyPromise
          };
        }

        const identity = await ensureOwnSecureKeyBundlePublished();
        if (!identity) {
          return null;
        }

        const bootstrap = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(dialog.publicId) + "/secure-bootstrap");
        if (!bootstrap?.keyEnvelope || !bootstrap?.peer?.publicKey) {
          return null;
        }

        const peerPublicJwk = JSON.parse(bootstrap.peer.publicKey);
        const envelope = JSON.parse(bootstrap.keyEnvelope);
        const wrappingKey = await deriveWrappingKey(identity.privateKey, peerPublicJwk);
        const rawDialogKey = await window.crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: fromBase64(envelope.iv)
          },
          wrappingKey,
          fromBase64(envelope.wrappedKey)
        );
        const rawKey = new Uint8Array(rawDialogKey);
        const keyId = envelope.senderKeyId || identity.keyId;
        persistDialogKey(dialog.publicId, rawKey, keyId);

        return {
          keyId,
          cryptoKey: await importDialogKey(rawKey)
        };
      };

      const decryptSecureMessage = async (dialog, message) => {
        if (!isSecureDialog(dialog) || !message?.ciphertext || !message?.nonce) {
          return message;
        }

        try {
          const cached = secureFeatureState.dialogKeys.get(dialog.publicId) || await loadPersistedDialogKey(dialog.publicId);
          if (cached?.keyId && message?.senderKeyId && cached.keyId !== message.senderKeyId) {
            warnSecure("decrypt_key_id_mismatch_refreshing_key", {
              dialogId: dialog.id,
              dialogPublicId: dialog.publicId,
              messageId: message.id,
              cachedKeyId: cached.keyId,
              senderKeyId: message.senderKeyId
            });
            invalidateDialogKeyCache(dialog.publicId);
          }

          const dialogKey = await ensureSecureDialogKey(dialog);
          if (!dialogKey?.cryptoKey) {
            warnSecure("decrypt_skipped_no_key", {
              dialogId: dialog.id,
              dialogPublicId: dialog.publicId,
              messageId: message.id,
              senderId: message.senderId
            });
            return {
              ...message,
              body: "Encrypted message unavailable on this device",
              decryptionFailed: true
            };
          }

          const plaintext = await window.crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: fromBase64(message.nonce)
            },
            dialogKey.cryptoKey,
            fromBase64(message.ciphertext)
          );

          return {
            ...message,
            body: decodeUtf8(new Uint8Array(plaintext)),
            decryptionFailed: false
          };
        } catch (error) {
          // One retry with fresh bootstrap in case local cache is stale.
          try {
            invalidateDialogKeyCache(dialog.publicId);
            const refreshedDialogKey = await ensureSecureDialogKey(dialog);
            if (refreshedDialogKey?.cryptoKey) {
              const plaintext = await window.crypto.subtle.decrypt(
                {
                  name: "AES-GCM",
                  iv: fromBase64(message.nonce)
                },
                refreshedDialogKey.cryptoKey,
                fromBase64(message.ciphertext)
              );
              return {
                ...message,
                body: decodeUtf8(new Uint8Array(plaintext)),
                decryptionFailed: false
              };
            }
          } catch {}

          warnSecure("decrypt_failed", {
            dialogId: dialog.id,
            dialogPublicId: dialog.publicId,
            messageId: message.id,
            senderId: message.senderId,
            senderKeyId: message.senderKeyId || null,
            error: error instanceof Error ? error.message : String(error)
          });
          return {
            ...message,
            body: "Encrypted message unavailable on this device",
            decryptionFailed: true
          };
        }
      };

      const prepareDialogPayloadForDisplay = async (dialog, messages = []) => {
        if (!dialog || !isSecureDialog(dialog) || !messages.length) {
          return {
            dialog,
            messages
          };
        }

        const preparedMessages = [];
        let failedDecryptions = 0;
        for (const message of messages) {
          const preparedMessage = await decryptSecureMessage(dialog, message);
          if (preparedMessage?.decryptionFailed) {
            failedDecryptions += 1;
          }
          preparedMessages.push(preparedMessage);
        }

        if (failedDecryptions > 0) {
          warnSecure("payload_decrypt_partial_failure", {
            dialogId: dialog.id,
            dialogPublicId: dialog.publicId,
            totalMessages: messages.length,
            failedDecryptions
          });
        }

        return {
          dialog,
          messages: preparedMessages
        };
      };

      const encryptSecureMessageBody = async (dialog, body) => {
        const dialogKey = await ensureSecureDialogKey(dialog);
        if (!dialogKey?.cryptoKey) {
          throw new Error("Failed to initialize secure dialog key.");
        }

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await window.crypto.subtle.encrypt(
          {
            name: "AES-GCM",
            iv
          },
          dialogKey.cryptoKey,
          encodeUtf8(body)
        );

        logSecure("encrypt_message_ready", {
          dialogId: dialog.id,
          dialogPublicId: dialog.publicId,
          plaintextLength: String(body || "").length
        });

        return {
          ciphertext: toBase64(new Uint8Array(ciphertext)),
          nonce: toBase64(iv),
          senderKeyId: dialogKey.keyId || ""
        };
      };

      const createPreferredDirectDialog = async (targetUserId) => {
        return fetchJson(createDirectDialogApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ targetUserId })
        });
      };

      const createSecretDirectDialog = async (targetUserId) => {
        if (!targetUserId || !hasSecureCrypto()) {
          throw new Error("Secure chat is not supported in this browser.");
        }

        try {
          const [localIdentity, peerBundle] = await Promise.all([
            ensureOwnSecureKeyBundlePublished(),
            getPeerSecureBundle(targetUserId)
          ]);

          if (!localIdentity || !peerBundle?.publicJwk) {
            throw new Error("SECURE_FALLBACK_REQUIRED");
          }

          const rawDialogKey = window.crypto.getRandomValues(new Uint8Array(32));
          const [creatorKeyEnvelope, recipientKeyEnvelope] = await Promise.all([
            wrapDialogKeyForPublicJwk({
              rawDialogKey,
              localIdentity,
              recipientPublicJwk: localIdentity.publicJwk
            }),
            wrapDialogKeyForPublicJwk({
              rawDialogKey,
              localIdentity,
              recipientPublicJwk: peerBundle.publicJwk
            })
          ]);

          const payload = await fetchJson(secureDialogsDirectApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              targetUserId,
              creatorKeyEnvelope,
              recipientKeyEnvelope,
              keyAlgorithm: "P-256-AES-GCM",
              encryptionVersion: 1,
              explicit: true
            })
          });

          if (payload?.dialog?.publicId) {
            persistDialogKey(payload.dialog.publicId, rawDialogKey, localIdentity.keyId);
          }

          return payload;
        } catch (error) {
          if (error instanceof Error && error.message !== "SECURE_FALLBACK_REQUIRED") {
            console.warn("Secure direct dialog bootstrap failed.", error);
          }

          throw new Error("Failed to start secret chat.");
        }
      };

      const formatSearchTime = (value) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "";
        }

        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });
      };

      const getChatSearchContextAvatarMarkup = () => {
        if (!currentDialogSnapshot) {
          return "";
        }

        return getDialogAvatarMarkup(currentDialogSnapshot, {
          showPresence: false
        });
      };

      const getChatSearchResultAvatarMarkup = (message) => {
        if (currentDialogSnapshot?.type === "saved") {
          return getChatSearchContextAvatarMarkup();
        }

        const avatar = getAvatarMeta(message.senderId || message.senderName, message.senderName || "?");
        return '<div class="chat-search-result-avatar" style="' + avatar.style + '"><img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" /></div>';
      };

      const getChatSearchResultName = (message) => {
        if (currentDialogSnapshot?.type === "saved") {
          return currentDialogSnapshot?.title || "Saved Messages";
        }

        return message.senderName || currentDialogSnapshot?.title || "TheGraphT";
      };

      const setChatSearchPanelOpen = (isOpen) => {
        if (isOpen) {
          closeChatProfilePanel();
        }
        chatWindow.classList.toggle("search-open", isOpen);
        chatSearchPanel.classList.toggle("open", isOpen);
        chatSearchPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
        chatSearchToggle.classList.toggle("active", isOpen);

        if (!isOpen) {
          chatSearchQuery = "";
          chatSearchInput.value = "";
          chatSearchResults.innerHTML = "";
          return;
        }

        chatSearchAvatar.innerHTML = getChatSearchContextAvatarMarkup();
        chatSearchAvatar.style.cssText = "";
        requestAnimationFrame(() => {
          chatSearchInput.focus();
          chatSearchInput.select();
        });
      };

      const closeChatSearch = () => {
        setChatSearchPanelOpen(false);
      };

      const renderChatSearchResults = () => {
        const query = chatSearchQuery.trim().toLowerCase();

        if (!currentDialogSnapshot) {
          chatSearchResults.innerHTML = "";
          return;
        }

        if (!query) {
          chatSearchResults.innerHTML = '<div class="chat-search-empty">Type a word or phrase to search messages.</div>';
          return;
        }

        const matches = getCurrentDialogMessages().filter((message) => {
          const haystack = String(message.body || "").toLowerCase();
          return haystack.includes(query);
        }).slice().reverse();

        if (!matches.length) {
          chatSearchResults.innerHTML = '<div class="chat-search-empty">No results found.</div>';
          return;
        }

        chatSearchResults.innerHTML = matches.map((message) => {
          const body = String(message.body || "").trim() || (message.type === "image" ? "Photo" : "Message");
          return '<button class="chat-search-result" type="button" data-search-message-id="' + escapeHtml(message.id) + '">' +
            getChatSearchResultAvatarMarkup(message) +
            '<div class="chat-search-result-copy">' +
              '<div class="chat-search-result-line"><span class="chat-search-result-name">' + escapeHtml(getChatSearchResultName(message)) + '</span><span class="chat-search-result-time">' + escapeHtml(formatSearchTime(message.createdAt)) + '</span></div>' +
              '<div class="chat-search-result-text">' + escapeHtml(body) + '</div>' +
            '</div>' +
          '</button>';
        }).join("");

        chatSearchResults.querySelectorAll("[data-search-message-id]").forEach((button) => {
          button.addEventListener("click", () => {
            const messageId = button.getAttribute("data-search-message-id");

            if (!messageId) {
              return;
            }

            const target = messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');
            const highlightNode = target?.closest(".message") || target;

            if (!highlightNode) {
              return;
            }

            closeChatSearch();

            requestAnimationFrame(() => {
              highlightNode.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            });

            if (chatSearchHighlightTimer) {
              window.clearTimeout(chatSearchHighlightTimer);
            }

            const scrollHost = messageList;
            let stableFrames = 0;
            let previousTop = scrollHost.scrollTop;
            const maxWaitMs = 1800;
            const startedAt = Date.now();

            const startSearchHighlight = () => {
              highlightNode.classList.remove("message-search-hit");
              void highlightNode.offsetWidth;
              highlightNode.classList.add("message-search-hit");

              chatSearchHighlightTimer = window.setTimeout(() => {
                highlightNode.classList.remove("message-search-hit");
              }, 3200);
            };

            const waitForArrival = () => {
              const currentTop = scrollHost.scrollTop;
              const delta = Math.abs(currentTop - previousTop);
              previousTop = currentTop;
              stableFrames = delta < 1 ? stableFrames + 1 : 0;

              if (stableFrames >= 6 || Date.now() - startedAt > maxWaitMs) {
                startSearchHighlight();
                return;
              }

              window.requestAnimationFrame(waitForArrival);
            };

            window.requestAnimationFrame(waitForArrival);
          });
        });
      };

      const syncChatIslandActions = () => {
        const hasDialog = Boolean(currentDialogSnapshot);
        chatSearchToggle.hidden = !hasDialog;
        chatGroupVideoButton.hidden = !hasDialog || currentDialogSnapshot?.type !== "group";
        chatCallButton.hidden = !hasDialog || currentDialogSnapshot?.type !== "direct";
        if (!hasDialog) {
          closeChatSearch();
        }
      };



      const createCallId = () => "call_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      const CALL_SETUP_TIMEOUT_MS = 22000;
      const CALL_RECONNECT_GRACE_MS = 8000;
      const rtcIceServersRaw = "";

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
          return /^(stun|turn|turns):[a-z0-9.-]+(?::\d{1,5})?(?:\?.*)?$/i.test(raw);
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
            +     '<span class="material-symbols-rounded" aria-hidden="true">screen_share</span>'
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




      const CALL_DEBUG_PREFIX = "[TheGraphT Call]";
      const callDebugLogBuffer = Array.isArray(window.__THEGRAPHT_CALL_LOGS__)
        ? window.__THEGRAPHT_CALL_LOGS__
        : [];
      window.__THEGRAPHT_CALL_LOGS__ = callDebugLogBuffer;

      const pushCallLog = (level, event, details = {}) => {
        const entry = {
          ts: new Date().toISOString(),
          level,
          event,
          details
        };
        callDebugLogBuffer.push(entry);
        if (callDebugLogBuffer.length > 800) {
          callDebugLogBuffer.splice(0, callDebugLogBuffer.length - 800);
        }
      };

      const logCall = (event, details = {}) => {
        pushCallLog("info", event, details);
        try {
          console.info(CALL_DEBUG_PREFIX, event, details);
        } catch {}
      };

      const warnCall = (event, details = {}) => {
        pushCallLog("warn", event, details);
        try {
          console.warn(CALL_DEBUG_PREFIX, event, details);
        } catch {}
      };

      const errCall = (event, details = {}) => {
        pushCallLog("error", event, details);
        try {
          console.error(CALL_DEBUG_PREFIX, event, details);
        } catch {}
      };

      window.__dumpTheGraphTCallVideoLogs = () => {
        const logs = Array.isArray(window.__THEGRAPHT_CALL_LOGS__)
          ? window.__THEGRAPHT_CALL_LOGS__
          : [];
        return JSON.stringify(
          logs.filter((entry) => String(entry?.event || "").startsWith("video_debug_")),
          null,
          2
        );
      };

      window.__dumpTheGraphTCallVideoLogsAround = (from = 7, to = 12) => {
        const logs = Array.isArray(window.__THEGRAPHT_CALL_LOGS__)
          ? window.__THEGRAPHT_CALL_LOGS__
          : [];
        return JSON.stringify(
          logs.filter((entry) => (
            String(entry?.event || "").startsWith("video_debug_")
            && Number(entry?.details?.elapsed || 0) >= Number(from || 0)
            && Number(entry?.details?.elapsed || 0) <= Number(to || 0)
          )),
          null,
          2
        );
      };

      window.__clearTheGraphTCallLogs = () => {
        if (Array.isArray(window.__THEGRAPHT_CALL_LOGS__)) {
          window.__THEGRAPHT_CALL_LOGS__.length = 0;
        }
      };
      window.__dumpTheGraphTCallIncident = (callId = "", fromSecond = 0) => {
        const logs = Array.isArray(window.__THEGRAPHT_CALL_LOGS__)
          ? window.__THEGRAPHT_CALL_LOGS__
          : [];
        const targetCallId = String(callId || "").trim();
        const from = Number(fromSecond || 0);
        const includeEvent = (eventName) => (
          String(eventName || "").startsWith("video_debug_")
          || String(eventName || "").startsWith("realtime_receive_call_")
          || String(eventName || "").startsWith("pc_")
          || String(eventName || "").startsWith("ice_")
          || String(eventName || "") === "realtime_send"
          || String(eventName || "") === "setup_timeout_armed"
          || String(eventName || "") === "finish_call"
          || String(eventName || "") === "call_error"
        );
        const filtered = logs.filter((entry) => {
          if (!includeEvent(entry?.event)) {
            return false;
          }
          const elapsed = Number(entry?.details?.elapsed || 0);
          if (elapsed < from) {
            return false;
          }
          if (!targetCallId) {
            return true;
          }
          return String(entry?.details?.callId || "") === targetCallId;
        });
        return JSON.stringify(filtered, null, 2);
      };

      const getDebugTrackState = (track) => {
        if (!track) {
          return null;
        }
        return {
          id: track.id || "",
          kind: track.kind || "",
          label: track.label || "",
          enabled: Boolean(track.enabled),
          muted: Boolean(track.muted),
          readyState: track.readyState || ""
        };
      };

      const getDebugStreamState = (stream) => {
        if (!(stream instanceof MediaStream)) {
          return null;
        }
        return {
          id: stream.id || "",
          audioTracks: stream.getAudioTracks().map(getDebugTrackState),
          videoTracks: stream.getVideoTracks().map(getDebugTrackState)
        };
      };

      const setCallError = (message, details = {}) => {
        if (!activeCall) {
          return;
        }

        activeCall.lastError = message;
        activeCall.lastErrorAt = Date.now();
        errCall("call_error", {
          callId: activeCall.callId,
          status: activeCall.status,
          message,
          ...details
        });
      };

      const getCallErrorForUi = (message) => {
        const normalized = typeof message === "string" ? message.trim() : "";
        if (!normalized) {
          return "";
        }

        if (/^ICE\s+\d+:/i.test(normalized)) {
          return "network issue, retrying connection";
        }

        return normalized.length > 120 ? (normalized.slice(0, 117) + "...") : normalized;
      };

      const ensureOutgoingCallRingtoneNode = () => {
        if (outgoingCallRingtoneNode) {
          return outgoingCallRingtoneNode;
        }

        outgoingCallRingtoneNode = new Audio("/outgoing.mp3");
        outgoingCallRingtoneNode.loop = false;
        outgoingCallRingtoneNode.preload = "auto";
        return outgoingCallRingtoneNode;
      };

      const ensureIncomingCallRingtoneNode = () => {
        if (incomingCallRingtoneNode) {
          return incomingCallRingtoneNode;
        }

        incomingCallRingtoneNode = new Audio("/incoming.mp3");
        incomingCallRingtoneNode.loop = true;
        incomingCallRingtoneNode.preload = "auto";
        return incomingCallRingtoneNode;
      };

      const startOutgoingCallRingtone = () => {
        const node = ensureOutgoingCallRingtoneNode();

        try {
          node.currentTime = 0;
          const playPromise = node.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
        } catch {}
      };

      const startIncomingCallRingtone = () => {
        const node = ensureIncomingCallRingtoneNode();

        try {
          node.currentTime = 0;
          const playPromise = node.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
        } catch {}
      };

      const claimCallRingtonePlayback = (callId) => {
        if (!callId) {
          return false;
        }
        if (typeof claimNotificationDelivery === "function") {
          return claimNotificationDelivery("call_ringtone", callId, 20000);
        }
        return true;
      };

      const stopCallRingtone = () => {
        [outgoingCallRingtoneNode, incomingCallRingtoneNode].forEach((node) => {
          if (!node) {
            return;
          }
          try {
            node.pause();
            node.currentTime = 0;
          } catch {}
        });
      };

      const buildCallMessageMarker = (kind, durationSeconds = 0) => {
        const safeDuration = Math.max(0, Math.floor(durationSeconds || 0));
        return kind === "ended"
          ? "[[call:" + kind + ":" + safeDuration + "]]"
          : "[[call:" + kind + "]]";
      };

      const clearCallTimers = () => {
        if (callTickTimer) {
          window.clearInterval(callTickTimer);
          callTickTimer = null;
        }
        stopGroupCallPresenceHeartbeat();
        stopGroupLocalVoiceMeter();

        if (callTimeoutTimer) {
          window.clearTimeout(callTimeoutTimer);
          callTimeoutTimer = null;
        }

        stopCallRingtone();
      };

      const armCallSetupTimeout = (callId, reason = "missed") => {
        if (callTimeoutTimer) {
          window.clearTimeout(callTimeoutTimer);
        }

        logCall("setup_timeout_armed", { callId, reason, timeoutMs: CALL_SETUP_TIMEOUT_MS });

        callTimeoutTimer = window.setTimeout(() => {
          if (!activeCall || activeCall.callId !== callId || activeCall.status === "active") {
            return;
          }

          if (reason === "no_connect") {
            setCallError("Failed to establish P2P connection (ICE timeout).", {
              connectionState: activeCall.peerConnection?.connectionState,
              iceConnectionState: activeCall.peerConnection?.iceConnectionState,
              iceGatheringState: activeCall.peerConnection?.iceGatheringState
            });
            showToast("Failed to establish call connection (ICE timeout).", "error");
          }

          warnCall("setup_timeout_fired", {
            callId,
            reason,
            status: activeCall.status,
            connectionState: activeCall.peerConnection?.connectionState,
            iceConnectionState: activeCall.peerConnection?.iceConnectionState,
            iceGatheringState: activeCall.peerConnection?.iceGatheringState
          });

          sendCallRealtime({
            type: "call_end",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            reason,
            summaryBody: buildCallMessageMarker("missed")
          });

          void finishActiveCall({
            summaryBody: buildCallMessageMarker("missed"),
            remoteEnded: false
          });
        }, CALL_SETUP_TIMEOUT_MS);
      };


      const buildCallVideoDebugDetails = (extra = {}) => {
        const remoteVideo = document.getElementById("remote-screen-video");
        const placeholder = document.getElementById("call-main-placeholder");
        const localPreview = document.getElementById("local-video-preview");
        const modalClassList = callModal?.classList ? Array.from(callModal.classList) : [];
        const remoteElementStream = remoteVideo instanceof HTMLVideoElement ? remoteVideo.srcObject : null;
        const localPreviewStream = localPreview instanceof HTMLVideoElement ? localPreview.srcObject : null;
        return {
          callId: activeCall?.callId || "",
          status: activeCall?.status || "",
          direction: activeCall?.direction || "",
          elapsed: getCallElapsedSeconds(),
          screenEnabled: Boolean(activeCall?.screenEnabled),
          remoteScreenSharing: Boolean(activeCall?.remoteScreenSharing),
          screenOwnerUserId: activeCall?.screenOwnerUserId || "",
          cameraEnabled: Boolean(activeCall?.cameraEnabled),
          hasActiveRemoteVideoStream: activeCall?.remoteVideoStream instanceof MediaStream,
          activeRemoteVideoStream: getDebugStreamState(activeCall?.remoteVideoStream),
          localVisualStream: getDebugStreamState(activeCall?.localVisualStream),
          remoteElementStream: getDebugStreamState(remoteElementStream),
          localPreviewStream: getDebugStreamState(localPreviewStream),
          remoteVideoElement: remoteVideo instanceof HTMLVideoElement ? {
            hidden: Boolean(remoteVideo.hidden),
            display: remoteVideo.style.display || "",
            className: remoteVideo.className || "",
            paused: Boolean(remoteVideo.paused),
            readyState: remoteVideo.readyState,
            videoWidth: remoteVideo.videoWidth,
            videoHeight: remoteVideo.videoHeight,
            currentTime: Number.isFinite(remoteVideo.currentTime) ? Number(remoteVideo.currentTime.toFixed(2)) : 0
          } : null,
          placeholder: placeholder instanceof HTMLElement ? {
            hidden: Boolean(placeholder.hidden),
            display: placeholder.style.display || ""
          } : null,
          modal: {
            classList: modalClassList,
            screenShareActive: modalClassList.includes("screen-share-active"),
            hasDirectVisuals: modalClassList.includes("has-direct-visuals"),
            hasScreenShare: modalClassList.includes("has-screen-share"),
            directVisualLayout: callModal?.dataset?.directVisualLayout || ""
          },
          peerConnection: activeCall?.peerConnection ? {
            connectionState: activeCall.peerConnection.connectionState,
            iceConnectionState: activeCall.peerConnection.iceConnectionState,
            signalingState: activeCall.peerConnection.signalingState
          } : null,
          ...extra
        };
      };

      const logCallVideoDebug = (event, details = {}) => {
        logCall("video_debug_" + event, buildCallVideoDebugDetails(details));
      };

      const logCallVideoDebugSnapshot = (source, { force = false } = {}) => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        const elapsed = getCallElapsedSeconds();
        const remoteTrack = activeCall.remoteVideoStream instanceof MediaStream
          ? activeCall.remoteVideoStream.getVideoTracks()[0] || null
          : null;
        const signature = [
          elapsed,
          activeCall.screenEnabled ? 1 : 0,
          activeCall.remoteScreenSharing ? 1 : 0,
          activeCall.cameraEnabled ? 1 : 0,
          remoteTrack?.id || "",
          remoteTrack?.muted ? 1 : 0,
          remoteTrack?.readyState || "",
          callModal?.classList?.contains("screen-share-active") ? 1 : 0,
          callModal?.classList?.contains("has-direct-visuals") ? 1 : 0
        ].join("|");
        if (!force && elapsed > 20 && activeCall.__lastVideoDebugSignature === signature) {
          return;
        }
        if (!force && activeCall.__lastVideoDebugSecond === elapsed && activeCall.__lastVideoDebugSignature === signature) {
          return;
        }
        activeCall.__lastVideoDebugSecond = elapsed;
        activeCall.__lastVideoDebugSignature = signature;
        logCallVideoDebug("snapshot", { source, signature });
      };




      const callFingerprintEmojiPool = ["🍎","🐱","🚀","🔥","🎯","🌊","🛰️","🛡️","⚡","🌙","🎧","📡","🧩","🎮","🦊","🧠","🦄","🍀","🧭","🔐","📶","🕹️","🫧","🌐"];
      const callFingerprintEmojiHints = {
        "🍎": "Red apple",
        "🐱": "Cat face",
        "🚀": "Rocket",
        "🔥": "Fire",
        "🎯": "Bullseye",
        "🌊": "Water wave",
        "🛰️": "Satellite",
        "🛡️": "Shield",
        "⚡": "Lightning",
        "🌙": "Crescent moon",
        "🎧": "Headphones",
        "📡": "Satellite antenna",
        "🧩": "Puzzle piece",
        "🎮": "Gamepad",
        "🦊": "Fox face",
        "🧠": "Brain",
        "🦄": "Unicorn",
        "🍀": "Four leaf clover",
        "🧭": "Compass",
        "🔐": "Locked key",
        "📶": "Signal strength",
        "🕹️": "Joystick",
        "🫧": "Bubbles",
        "🌐": "Globe"
      };
      const hashCallFingerprintSeed = (seed) => {
        const text = String(seed || "");
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
      };
      const buildCallFingerprintEmojis = () => {
        const pool = callFingerprintEmojiPool.slice();
        const picked = [];
        for (let index = 0; index < 6 && pool.length; index += 1) {
          let randomIndex = 0;
          if (window.crypto?.getRandomValues) {
            const randomBuffer = new Uint32Array(1);
            window.crypto.getRandomValues(randomBuffer);
            randomIndex = randomBuffer[0] % pool.length;
          } else {
            randomIndex = Math.floor(Math.random() * pool.length);
          }
          picked.push(pool.splice(randomIndex, 1)[0]);
        }
        return picked;
      };
      const sanitizeFingerprintEmojis = (value) => {
        if (!Array.isArray(value)) {
          return [];
        }
        return value
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .slice(0, 6);
      };
      const resolveCallFingerprintEmojis = (call) => {
        const synced = sanitizeFingerprintEmojis(call?.fingerprintEmojis);
        if (synced.length === 6) {
          return synced;
        }
        const generated = buildCallFingerprintEmojis(call);
        if (call && typeof call === "object") {
          call.fingerprintEmojis = generated;
        }
        return generated;
      };
      const buildCallFingerprintEmojiMarkup = (call) => {
        const emojis = resolveCallFingerprintEmojis(call);
        return emojis.map((emoji) => {
          const emojiAssetUrl = typeof getEmojiAssetUrl === "function" ? getEmojiAssetUrl(emoji) : "";
          const emojiHint = String(callFingerprintEmojiHints[emoji] || "Emoji fingerprint");
          if (!emojiAssetUrl) {
            return '<span class="call-fingerprint-emoji" data-emoji-hint="' + escapeHtml(emojiHint) + '" aria-label="' + escapeHtml(emojiHint) + '">' + escapeHtml(emoji) + '</span>';
          }
          return '<img class="call-fingerprint-emoji" data-emoji-hint="' + escapeHtml(emojiHint) + '" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emoji) + '" onerror=\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\' loading="lazy" decoding="async" draggable="false" />';
        }).join("");
      };

      const tuneOpusSdp = (sdp) => {
        if (typeof sdp !== "string" || !sdp.trim()) {
          return sdp;
        }

        const lines = sdp.split("\r\n");
        const opusLine = lines.find((line) => /^a=rtpmap:(\d+)\s+opus\/48000\/2$/i.test(line));
        if (!opusLine) {
          return sdp;
        }

        const opusPayloadType = opusLine.slice("a=rtpmap:".length).split(" ")[0];
        const fmtpPrefix = "a=fmtp:" + opusPayloadType;
        const expectedParams = {
          useinbandfec: "1",
          usedtx: "0",
          minptime: "10",
          cbr: "1",
          maxaveragebitrate: "48000"
        };

        let updated = false;
        const tunedLines = lines.map((line) => {
          if (!line.startsWith(fmtpPrefix)) {
            return line;
          }

          const rawParams = line
            .slice(fmtpPrefix.length)
            .trim()
            .split(";")
            .map((item) => item.trim())
            .filter(Boolean);

          const paramsMap = new Map();
          rawParams.forEach((item) => {
            const [rawKey, rawValue] = item.split("=");
            if (!rawKey) {
              return;
            }
            paramsMap.set(rawKey.trim().toLowerCase(), typeof rawValue === "string" ? rawValue.trim() : "");
          });

          Object.entries(expectedParams).forEach(([key, value]) => {
            paramsMap.set(key, value);
          });

          const serialized = Array.from(paramsMap.entries())
            .map(([key, value]) => key + (value ? "=" + value : ""))
            .join(";");

          updated = true;
          return fmtpPrefix + " " + serialized;
        });

        if (!updated) {
          tunedLines.push(
            fmtpPrefix + " " + Object.entries(expectedParams).map(([key, value]) => key + "=" + value).join(";")
          );
        }

        return tunedLines.join("\r\n");
      };

      const buildOfferWithVoiceProfile = async (peerConnection) => {
        const offer = await peerConnection.createOffer();
        const tunedSdp = tuneOpusSdp(offer.sdp || "");
        if (!tunedSdp || tunedSdp === offer.sdp) {
          return offer;
        }
        return {
          type: offer.type,
          sdp: tunedSdp
        };
      };

      const buildAnswerWithVoiceProfile = async (peerConnection) => {
        const answer = await peerConnection.createAnswer();
        const tunedSdp = tuneOpusSdp(answer.sdp || "");
        if (!tunedSdp || tunedSdp === answer.sdp) {
          return answer;
        }
        return {
          type: answer.type,
          sdp: tunedSdp
        };
      };

      const applyAudioSenderProfile = async (peerConnection, callId) => {
        try {
          const sender = peerConnection.getSenders().find((entry) => entry.track?.kind === "audio");
          if (!sender || typeof sender.getParameters !== "function" || typeof sender.setParameters !== "function") {
            return;
          }

          const parameters = sender.getParameters() || {};
          if (!Array.isArray(parameters.encodings) || !parameters.encodings.length) {
            parameters.encodings = [{}];
          }
          parameters.encodings[0] = {
            ...(parameters.encodings[0] || {}),
            maxBitrate: 48000
          };
          await sender.setParameters(parameters);
          logCall("audio_sender_profile_applied", { callId, maxBitrate: 48000 });
        } catch (error) {
          warnCall("audio_sender_profile_skipped", {
            callId,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const ensureRemoteAudioNode = () => {
        if (remoteAudioNode) {
          return remoteAudioNode;
        }

        remoteAudioNode = new Audio();
        remoteAudioNode.autoplay = true;
        remoteAudioNode.controls = false;
        remoteAudioNode.disableRemotePlayback = true;
        try {
          remoteAudioNode.setAttribute("x-webkit-airplay", "deny");
        } catch {}
        return remoteAudioNode;
      };
      const disableSystemMediaSessionControls = () => {
        const mediaSession = navigator.mediaSession;
        if (!mediaSession || typeof mediaSession.setActionHandler !== "function") {
          return;
        }

        const actions = [
          "play",
          "pause",
          "stop",
          "seekbackward",
          "seekforward",
          "seekto",
          "previoustrack",
          "nexttrack",
          "skipad"
        ];

        for (const action of actions) {
          try {
            mediaSession.setActionHandler(action, null);
          } catch {}
        }

        try {
          mediaSession.metadata = null;
        } catch {}
        try {
          mediaSession.playbackState = "none";
        } catch {}
      };
      disableSystemMediaSessionControls();

      const clampVoiceLevel = (value) => Math.max(0, Math.min(1, Number(value) || 0));
      const setCallVoiceLevel = (nextLevel) => {
        const level = Number.isFinite(nextLevel) ? Math.max(0, Math.min(1, nextLevel)) : 0;
        if (callModal?.style) {
          callModal.style.setProperty("--call-voice-level", String(level));
        }
        if (callMiniCard?.style) {
          callMiniCard.style.setProperty("--call-voice-level", String(level));
        }
      };
      const stopCallVoiceMeter = () => {
        if (callVoiceMeterRaf) {
          window.cancelAnimationFrame(callVoiceMeterRaf);
          callVoiceMeterRaf = 0;
        }
        try {
          callVoiceMeterSource?.disconnect();
        } catch {}
        try {
          callVoiceMeterAnalyser?.disconnect();
        } catch {}
        callVoiceMeterSource = null;
        callVoiceMeterAnalyser = null;
        callVoiceMeterData = null;
        if (callVoiceMeterContext) {
          try {
            if (callVoiceMeterContext.state !== "closed") {
              void callVoiceMeterContext.close();
            }
          } catch {}
        }
        callVoiceMeterContext = null;
        setCallVoiceLevel(0);
      };
      const stopGroupLocalVoiceMeter = () => {
        if (groupLocalVoiceMeterTimer) {
          window.clearInterval(groupLocalVoiceMeterTimer);
          groupLocalVoiceMeterTimer = null;
        }
        try {
          groupLocalVoiceMeterSource?.disconnect();
        } catch {}
        try {
          groupLocalVoiceMeterAnalyser?.disconnect();
        } catch {}
        groupLocalVoiceMeterSource = null;
        groupLocalVoiceMeterAnalyser = null;
        groupLocalVoiceMeterData = null;
        if (groupLocalVoiceMeterContext) {
          try {
            if (groupLocalVoiceMeterContext.state !== "closed") {
              void groupLocalVoiceMeterContext.close();
            }
          } catch {}
        }
        groupLocalVoiceMeterContext = null;
        groupLocalVoiceLastSpeaking = false;
        groupLocalVoiceLastPresenceSentAt = 0;
        groupLocalVoiceLastLevel = 0;
        groupLocalVoiceLastLevelSent = 0;
        groupLocalVoiceLastUiLevel = 0;
      };
      const startGroupLocalVoiceMeter = (call) => {
        stopGroupLocalVoiceMeter();
        if (!call || call.mode !== "group" || !call.localStream || typeof window.AudioContext !== "function") {
          return;
        }
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
            if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== call.callId) {
              stopGroupLocalVoiceMeter();
              return;
            }
            let peak = 0;
            if (!activeCall.isMuted && groupLocalVoiceMeterAnalyser && groupLocalVoiceMeterData) {
              try {
                groupLocalVoiceMeterAnalyser.getByteTimeDomainData(groupLocalVoiceMeterData);
                for (let index = 0; index < groupLocalVoiceMeterData.length; index += 1) {
                  const amplitude = Math.abs((groupLocalVoiceMeterData[index] - 128) / 128);
                  if (amplitude > peak) {
                    peak = amplitude;
                  }
                }
              } catch {}
            }
            const normalizedVoiceLevel = activeCall.isMuted
              ? 0
              : clampVoiceLevel(Math.max(0, Math.min(1, (peak - 0.012) * 3.45)));
            const isSpeakingNow = !activeCall.isMuted;
            const speakingChanged = isSpeakingNow !== groupLocalVoiceLastSpeaking;
            groupLocalVoiceLastSpeaking = isSpeakingNow;
            groupLocalVoiceLastLevel = normalizedVoiceLevel;
            const levelChangedForUi = Math.abs(normalizedVoiceLevel - groupLocalVoiceLastUiLevel) > 0.045;
            if (levelChangedForUi) {
              groupLocalVoiceLastUiLevel = normalizedVoiceLevel;
            }
            upsertGroupParticipant(
              activeCall,
              currentUserId,
              currentUserDisplayName || workspaceUserName.textContent || "You",
              Boolean(activeCall.isMuted),
              isSpeakingNow,
              normalizedVoiceLevel
            );
            const state = groupCallStateByDialog.get(activeCall.dialogId);
            if (state) {
              if (!(state.participantIds instanceof Set)) {
                state.participantIds = new Set();
              }
              state.participantIds.add(currentUserId);
              if (state.participantLastSeenAtMap instanceof Map) {
                state.participantLastSeenAtMap.set(currentUserId, Date.now());
              }
              state.participantCount = state.participantIds.size;
              groupCallStateByDialog.set(activeCall.dialogId, state);
            }
            const nowTs = Date.now();
            const levelChangedForPresence = Math.abs(normalizedVoiceLevel - groupLocalVoiceLastLevelSent) > 0.08;
            if (speakingChanged || levelChangedForPresence || (nowTs - groupLocalVoiceLastPresenceSentAt) > 820) {
              groupLocalVoiceLastPresenceSentAt = nowTs;
              groupLocalVoiceLastLevelSent = normalizedVoiceLevel;
              sendCallRealtime({
                type: "call_presence",
                mode: "group",
                callId: activeCall.callId,
                dialogId: activeCall.dialogId,
                dialogPublicId: activeCall.dialogPublicId,
                participantUserId: currentUserId,
                participantName: currentUserDisplayName || workspaceUserName.textContent || "You",
                isMuted: Boolean(activeCall.isMuted),
                isSpeaking: isSpeakingNow,
                voiceLevel: normalizedVoiceLevel
              });
            }
            if (activeCall.mode === "group") {
              setCallVoiceLevel(activeCall.isMuted ? 0.06 : Math.max(0.12, normalizedVoiceLevel));
            }
            if (speakingChanged || levelChangedForUi) {
              syncCallUi();
            }
          }, 220);
        } catch (error) {
          warnCall("group_local_voice_meter_start_failed", {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };
      const startCallVoiceMeter = (stream) => {
        stopCallVoiceMeter();
        if (!stream || typeof window.AudioContext !== "function") {
          return;
        }

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

          const tick = () => {
            if (!callVoiceMeterAnalyser || !callVoiceMeterData) {
              return;
            }
            try {
              callVoiceMeterAnalyser.getByteTimeDomainData(callVoiceMeterData);
              let peak = 0;
              for (let index = 0; index < callVoiceMeterData.length; index += 1) {
                const amplitude = Math.abs((callVoiceMeterData[index] - 128) / 128);
                if (amplitude > peak) {
                  peak = amplitude;
                }
              }
              const normalized = Math.max(0, Math.min(1, (peak - 0.015) * 3.2));
              setCallVoiceLevel(normalized);
            } catch {
              setCallVoiceLevel(0);
            }
            callVoiceMeterRaf = window.requestAnimationFrame(tick);
          };
          callVoiceMeterRaf = window.requestAnimationFrame(tick);
        } catch (error) {
          warnCall("voice_meter_start_failed", {
            error: error instanceof Error ? error.message : String(error)
          });
          setCallVoiceLevel(0);
        }
      };




      const groupCallStateByDialog = new Map();
      const postedGroupStartByDialog = new Map();
      let groupCallPresenceHeartbeatTimer = null;
      let groupCallPresencePruneTimer = null;
      let groupCallJoinStripHideTimer = null;
      const GROUP_CALL_PRESENCE_STALE_MS = 14000;
      const getGroupCallSummaryDuration = (seconds) => Math.max(0, Math.floor(Number(seconds) || 0));
      const buildGroupCallMarker = (kind, durationSeconds = 0) =>
        kind === "ended_video"
          ? "[[call:" + kind + ":" + getGroupCallSummaryDuration(durationSeconds) + "]]"
          : "[[call:" + kind + "]]";
      const isInGroupCallForDialog = (dialogId) => (
        Boolean(activeCall && activeCall.mode === "group" && activeCall.dialogId === dialogId)
      );
      const getGroupCallMembersCount = (state) => {
        if (!state) {
          return 0;
        }
        if (state.participantIds instanceof Set && state.participantIds.size > 0) {
          return state.participantIds.size;
        }
        return Math.max(0, Number(state.participantCount) || 0);
      };
      const pruneStaleGroupCallParticipants = () => {
        const nowTs = Date.now();
        let hasAnyState = false;
        for (const [dialogId, state] of groupCallStateByDialog.entries()) {
          if (!state || !(state.participantIds instanceof Set)) {
            continue;
          }
          hasAnyState = true;
          const seenAtMap = state.participantLastSeenAtMap instanceof Map
            ? state.participantLastSeenAtMap
            : new Map();
          state.participantLastSeenAtMap = seenAtMap;
          for (const participantUserId of Array.from(state.participantIds.values())) {
            const seenAt = Number(seenAtMap.get(participantUserId) || 0);
            if (!seenAt || (nowTs - seenAt) > GROUP_CALL_PRESENCE_STALE_MS) {
              state.participantIds.delete(participantUserId);
              seenAtMap.delete(participantUserId);
            }
          }
          state.participantCount = state.participantIds.size;
          groupCallStateByDialog.set(dialogId, state);
        }
        if (!hasAnyState && !activeCall) {
          if (groupCallPresencePruneTimer) {
            window.clearInterval(groupCallPresencePruneTimer);
            groupCallPresencePruneTimer = null;
          }
        }
      };
      const ensureGroupCallPresencePruneTimer = () => {
        if (groupCallPresencePruneTimer) {
          return;
        }
        groupCallPresencePruneTimer = window.setInterval(() => {
          pruneStaleGroupCallParticipants();
          syncGroupCallBanner();
        }, 3000);
      };
      const parseGroupCallMarkerBody = (rawBody) => {
        const body = String(rawBody || "").trim();
        if (!body.startsWith("[[call:") || !body.endsWith("]]")) {
          return null;
        }
        const inner = body.slice(7, -2);
        const parts = inner.split(":");
        const kind = String(parts[0] || "").trim();
        if (kind !== "started_video" && kind !== "ended_video") {
          return null;
        }
        const durationSeconds = parts.length > 1 ? Math.max(0, Number(parts[1] || 0) || 0) : 0;
        return {
          kind,
          durationSeconds
        };
      };
      const buildRecoveredGroupCallId = (dialogId) => "group_call_recovered_" + String(dialogId || "");
      const resolveGroupCallStartedAtMs = (call) => {
        if (!call || call.mode !== "group") {
          return Number(call?.connectedAt) || 0;
        }
        const state = call?.dialogId ? groupCallStateByDialog.get(call.dialogId) : null;
        const fromState = Number(state?.startedAtMs) || 0;
        const fromCall = Number(call.groupStartedAtMs) || 0;
        const fromConnectedAt = Number(call.connectedAt) || 0;
        return fromState || fromCall || fromConnectedAt || 0;
      };
      const getGroupCallElapsedSecondsForCall = (call) => {
        const startedAtMs = resolveGroupCallStartedAtMs(call);
        if (!startedAtMs) {
          return 0;
        }
        return Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
      };
      const syncGroupCallStateFromMessages = (dialog, messages) => {
        if (!dialog || dialog.type !== "group" || !Array.isArray(messages)) {
          return;
        }
        const dialogId = String(dialog.id || "");
        if (!dialogId) {
          return;
        }

        let latestStarted = null;
        let latestEnded = null;

        for (let index = 0; index < messages.length; index += 1) {
          const message = messages[index];
          const marker = parseGroupCallMarkerBody(message?.body);
          if (!marker) {
            continue;
          }
          const ts = new Date(message?.createdAt || 0).getTime();
          const sortTs = Number.isFinite(ts) ? ts : 0;
          if (marker.kind === "started_video") {
            latestStarted = {
              ts: sortTs,
              senderUserId: String(message?.senderId || ""),
              senderName: String(message?.senderName || "").trim()
            };
          } else if (marker.kind === "ended_video") {
            latestEnded = {
              ts: sortTs
            };
          }
        }

        const hasActiveStartedMarker = Boolean(
          latestStarted
          && (!latestEnded || latestStarted.ts > latestEnded.ts)
        );
        const hasLocalActiveGroupCall = Boolean(
          activeCall
          && activeCall.mode === "group"
          && activeCall.dialogId === dialogId
        );

        if (!hasActiveStartedMarker && !hasLocalActiveGroupCall) {
          groupCallStateByDialog.delete(dialogId);
          postedGroupStartByDialog.delete(dialogId);
          syncGroupCallBanner();
          return;
        }

        const prevState = groupCallStateByDialog.get(dialogId) || null;
        const starterUserId = latestStarted?.senderUserId || prevState?.starterUserId || activeCall?.startedByUserId || "";
        const participantIds = prevState?.participantIds instanceof Set
          ? new Set(prevState.participantIds)
          : new Set();
        const participantLastSeenAtMap = prevState?.participantLastSeenAtMap instanceof Map
          ? new Map(prevState.participantLastSeenAtMap)
          : new Map();
        if (hasLocalActiveGroupCall) {
          participantIds.add(currentUserId);
          participantLastSeenAtMap.set(currentUserId, Date.now());
        }
        groupCallStateByDialog.set(dialogId, {
          callId: activeCall?.callId || prevState?.callId || buildRecoveredGroupCallId(dialogId),
          dialogId,
          title: String(dialog.title || prevState?.title || "Group video chat"),
          status: hasLocalActiveGroupCall ? "active" : "active",
          starterUserId,
          startedAtMs: Number(latestStarted?.ts) || Number(prevState?.startedAtMs) || Number(resolveGroupCallStartedAtMs(activeCall)) || Date.now(),
          participantLastSeenAtMap,
          participantIds,
          participantCount: participantIds.size
        });
        ensureGroupCallPresencePruneTimer();
        pruneStaleGroupCallParticipants();
        syncGroupCallBanner();
      };
      const syncGroupCallJoinStrip = () => {
        if (!groupCallJoinStrip || !groupCallJoinTitle || !groupCallJoinMeta || !groupCallJoinButton) {
          return;
        }
        if (groupCallJoinStripHideTimer) {
          window.clearTimeout(groupCallJoinStripHideTimer);
          groupCallJoinStripHideTimer = null;
        }
        const dialogId = currentDialogSnapshot?.id || "";
        const knownDialog = dialogId ? allDialogs.find((dialog) => dialog.id === dialogId) : null;
        if (dialogId && !knownDialog) {
          groupCallStateByDialog.delete(dialogId);
          postedGroupStartByDialog.delete(dialogId);
        }
        const state = dialogId ? groupCallStateByDialog.get(dialogId) : null;
        const membersCount = getGroupCallMembersCount(state);
        const shouldShow = Boolean(
          state
          && currentDialogSnapshot?.type === "group"
          && knownDialog?.type === "group"
          && !isInGroupCallForDialog(dialogId)
        );
        if (!shouldShow) {
          const switchedToNonGroup = currentDialogSnapshot?.type !== "group" || knownDialog?.type !== "group";
          groupCallJoinStrip.classList.remove("visible");
          groupCallJoinStrip.setAttribute("aria-hidden", "true");
          chatWindow?.classList.remove("group-call-join-visible");
          if (switchedToNonGroup) {
            groupCallJoinStrip.hidden = true;
            return;
          }
          groupCallJoinStripHideTimer = window.setTimeout(() => {
            groupCallJoinStrip.hidden = true;
            groupCallJoinStripHideTimer = null;
          }, 220);
          return;
        }
        groupCallJoinStrip.hidden = false;
        groupCallJoinStrip.classList.add("visible");
        groupCallJoinStrip.setAttribute("aria-hidden", "false");
        groupCallJoinTitle.textContent = state.status === "active" ? "Live stream" : "Connecting stream";
        groupCallJoinMeta.textContent = membersCount + " member" + (membersCount === 1 ? "" : "s");
        chatWindow?.classList.add("group-call-join-visible");
      };
      const stopGroupCallPresenceHeartbeat = () => {
        if (groupCallPresenceHeartbeatTimer) {
          window.clearInterval(groupCallPresenceHeartbeatTimer);
          groupCallPresenceHeartbeatTimer = null;
        }
      };
      const sendGroupCallPresenceHeartbeat = () => {
        if (!activeCall || activeCall.mode !== "group") {
          return;
        }
        const state = groupCallStateByDialog.get(activeCall.dialogId);
        if (state) {
          if (!(state.participantIds instanceof Set)) {
            state.participantIds = new Set();
          }
          if (!(state.participantLastSeenAtMap instanceof Map)) {
            state.participantLastSeenAtMap = new Map();
          }
          state.participantIds.add(currentUserId);
          state.participantLastSeenAtMap.set(currentUserId, Date.now());
          state.participantCount = state.participantIds.size;
          groupCallStateByDialog.set(activeCall.dialogId, state);
        }
        sendCallRealtime({
          type: "call_presence",
          mode: "group",
          callId: activeCall.callId,
          dialogId: activeCall.dialogId,
          dialogPublicId: activeCall.dialogPublicId,
          participantUserId: currentUserId,
          participantName: currentUserDisplayName || workspaceUserName.textContent || "You",
          isMuted: Boolean(activeCall.isMuted),
          isSpeaking: !activeCall.isMuted,
          voiceLevel: activeCall.isMuted ? 0 : clampVoiceLevel(groupLocalVoiceLastLevel)
        });
      };
      const ensureGroupCallPresenceHeartbeat = () => {
        const shouldRun = Boolean(activeCall && activeCall.mode === "group");
        if (!shouldRun) {
          stopGroupCallPresenceHeartbeat();
          return;
        }
        ensureGroupCallPresencePruneTimer();
        if (groupCallPresenceHeartbeatTimer) {
          return;
        }
        groupCallPresenceHeartbeatTimer = window.setInterval(() => {
          sendGroupCallPresenceHeartbeat();
        }, 6000);
      };
      const syncGroupCallBanner = () => {
        if (!groupCallBanner || !groupCallBannerState || !groupCallBannerTitle) {
          syncGroupCallJoinStrip();
          return;
        }
        const chatWindow = document.getElementById("chat-window");
        const dialogId = currentDialogSnapshot?.id || "";
        const state = dialogId ? groupCallStateByDialog.get(dialogId) : null;
        const activeGroupCall = activeCall && activeCall.mode === "group" ? activeCall : null;
        const shouldShowBanner = Boolean(
          activeGroupCall
          || (state && isInGroupCallForDialog(dialogId))
        );
        if (!shouldShowBanner) {
          groupCallBanner.classList.remove("visible");
          groupCallBanner.setAttribute("aria-hidden", "true");
          groupCallBanner.hidden = true;
          chatWindow?.classList.remove("group-call-banner-visible");
          syncGroupCallJoinStrip();
          return;
        }
        const bannerCall = activeGroupCall || null;
        const bannerDialogId = bannerCall?.dialogId || dialogId;
        const bannerState = bannerDialogId ? groupCallStateByDialog.get(bannerDialogId) : state;
        groupCallBanner.hidden = false;
        groupCallBanner.classList.add("visible");
        groupCallBanner.setAttribute("aria-hidden", "false");
        chatWindow?.classList.add("group-call-banner-visible");
        const isBannerActive = Boolean(
          bannerCall?.status === "active"
          || bannerState?.status === "active"
        );
        groupCallBanner.dataset.callStatus = isBannerActive ? "active" : "connecting";
        groupCallBannerState.textContent = isBannerActive ? "Live" : "Connecting...";
        groupCallBannerTitle.textContent = bannerCall?.peerName || bannerState?.title || (currentDialogSnapshot?.title || "Group video chat");
        syncGroupCallJoinStrip();
      };

      const openGroupLeaveModal = () => {
        if (!groupCallLeaveModal) {
          return;
        }
        if (groupCallEndForAll) {
          groupCallEndForAll.checked = false;
          groupCallEndForAll.disabled = false;
        }
        groupCallLeaveModal.classList.add("visible");
        groupCallLeaveModal.setAttribute("aria-hidden", "false");
      };

      const closeGroupLeaveModal = () => {
        if (!groupCallLeaveModal) {
          return;
        }
        groupCallLeaveModal.classList.remove("visible");
        groupCallLeaveModal.setAttribute("aria-hidden", "true");
      };
      let callVoiceMeterRaf = 0;
      let callVoiceMeterContext = null;
      let callVoiceMeterAnalyser = null;
      let callVoiceMeterSource = null;
      let callVoiceMeterData = null;
      let groupLocalVoiceMeterTimer = null;
      let groupLocalVoiceMeterContext = null;
      let groupLocalVoiceMeterAnalyser = null;
      let groupLocalVoiceMeterSource = null;
      let groupLocalVoiceMeterData = null;
      let groupLocalVoiceLastSpeaking = false;
      let groupLocalVoiceLastPresenceSentAt = 0;
      let groupLocalVoiceLastLevel = 0;
      let groupLocalVoiceLastLevelSent = 0;
      let groupLocalVoiceLastUiLevel = 0;



      const getDialogByIdLocal = (dialogId) => allDialogs.find((dialog) => dialog.id === dialogId) || null;

      const closeCallDevicesPanel = () => {
        callDevicesPanel.classList.remove("open");
        callDevicesPanel.setAttribute("aria-hidden", "true");
      };

      const openCallDevicesPanel = () => {
        callDevicesPanel.classList.add("open");
        callDevicesPanel.setAttribute("aria-hidden", "false");
      };

      const syncActiveCallChip = () => {
        const shouldShow = Boolean(
          activeCall
          && activeCall.mode !== "group"
          && (activeCall.status === "outgoing" || activeCall.status === "incoming" || activeCall.status === "connecting" || activeCall.status === "reconnecting" || activeCall.status === "active")
          && currentDialogSnapshot
          && currentDialogSnapshot.id !== activeCall.dialogId
        );

        chatCallChip.classList.toggle("visible", shouldShow);
        chatCallChip.setAttribute("aria-hidden", shouldShow ? "false" : "true");

        if (!shouldShow) {
          return;
        }

        chatCallChipTitle.textContent = activeCall.peerName ? "Call with " + activeCall.peerName : "Call";
        chatCallChipTime.textContent = activeCall.status === "active"
          ? formatCallDuration(getCallElapsedSeconds())
          : (activeCall.status === "incoming" ? "incoming" : (activeCall.status === "reconnecting" ? "reconnecting" : "connecting..."));
      };

      const syncCallUi = () => {
        const hasCall = Boolean(activeCall);

        if (!hasCall) {
          const focusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          if (focusedElement && callOverlay.contains(focusedElement)) {
            focusedElement.blur();
          }
        }

        callOverlay.setAttribute("aria-hidden", hasCall ? "false" : "true");

        if (!hasCall) {
          callModal.classList.remove("open", "minimized");
          callModal.classList.remove("expanded", "has-direct-visuals", "has-dual-visuals", "has-screen-share");
          callModal.dataset.directVisualLayout = "none";
          callMiniCard.classList.remove("visible");
          callMiniCard.classList.remove("dragging");
          setCallVoiceLevel(0);
          callMiniCard.style.left = "";
          callMiniCard.style.top = "";
          callMiniCard.style.right = "";
          callMiniCard.style.bottom = "";
          closeCallDevicesPanel();
          syncCallVideoStage();
          if (callExpandButton) {
            const iconNode = callExpandButton.querySelector(".material-symbols-rounded");
            if (iconNode) {
              iconNode.textContent = "open_in_full";
            }
          }
          syncActiveCallChip();
          syncGroupCallBanner();
          return;
        }
        startCallTicker();

        const avatar = getAvatarMeta(activeCall.peerId || activeCall.peerName, activeCall.peerName || "?");
        const isIncoming = activeCall.status === "incoming";
        const isGroupCall = activeCall.mode === "group";
        const isIncomingDirection = activeCall.direction === "incoming";
        const shouldShowAcceptAction = isIncoming && isIncomingDirection;
        const isActive = activeCall.status === "active";
        const isRinging = activeCall.status === "incoming";
        const isReconnecting = activeCall.status === "reconnecting";
        const dots = buildAnimatedDots();
        const statusText = isIncoming
          ? "incoming call"
          : isActive
            ? formatCallDuration(getCallElapsedSeconds())
            : isReconnecting
              ? ("reconnecting" + dots)
            : activeCall.status === "outgoing"
              ? ("ringing" + dots)
              : ("connecting" + dots);
        const substatusText = isIncoming
          ? "From " + activeCall.peerName
          : isActive
            ? "call is active"
            : isReconnecting
              ? "Network is unstable, restoring call"
              : "Setting up call";
        const debugSuffix = (!isIncoming && !isActive && activeCall.lastError)
          ? " • " + getCallErrorForUi(activeCall.lastError)
          : "";

        callModal.dataset.callState = activeCall.status || "idle";
        callModal.dataset.callDirection = activeCall.direction || "outgoing";
        callModal.dataset.callMode = isGroupCall ? "group" : "direct";
        callMiniCard.dataset.callState = activeCall.status || "idle";
        callMiniCard.dataset.callDirection = activeCall.direction || "outgoing";
        callModal.classList.toggle("ringing", isRinging);
        callMiniCard.classList.toggle("ringing", isRinging);

        callPeerAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        callPeerAvatar.style.cssText = avatar.style;
        callModal.style.setProperty("--call-bg-start", avatar.start || "#bb8b4b");
        callModal.style.setProperty("--call-bg-end", avatar.end || "#b37f3f");
        callMiniCard.style.setProperty("--call-bg-start", avatar.start || "#bb8b4b");
        callMiniCard.style.setProperty("--call-bg-end", avatar.end || "#b37f3f");
        const callFingerprintNode = document.getElementById("call-fingerprint-emojis");
        if (callFingerprintNode) {
          callFingerprintNode.innerHTML = buildCallFingerprintEmojiMarkup(activeCall);
        }
        callPeerName.textContent = activeCall.peerName || "TheGraphT";
        callPeerStatus.textContent = isGroupCall
          ? (isActive ? "Live now" : "Connecting...")
          : (activeCall.status === "outgoing" ? ("Ringing" + dots) : statusText);
        const localParticipantState = activeCall.groupParticipants instanceof Map
          ? activeCall.groupParticipants.get(currentUserId)
          : null;
        const localParticipantSpeaking = !activeCall.isMuted;
        const groupSubstatusText = isActive
          ? (activeCall.isMuted ? "listening" : (localParticipantSpeaking ? "speaking" : "listening"))
          : "connecting...";
        callPeerSubstatus.textContent = isGroupCall ? (groupSubstatusText + debugSuffix) : "";
        if (callModalKicker) {
          callModalKicker.hidden = false;
          callModalKicker.textContent = isActive
            ? formatCallDuration(getCallElapsedSeconds())
            : (isIncoming ? "Incoming call" : (isReconnecting ? "Reconnecting" : (activeCall.status === "outgoing" ? "Ringing" : "Connecting")));
        }
        if (callGroupKicker) {
          callGroupKicker.hidden = !isGroupCall;
        }
        if (callGroupPanel) {
          callGroupPanel.hidden = !isGroupCall;
        }
        const groupParticipantsList = activeCall.groupParticipants instanceof Map
          ? Array.from(activeCall.groupParticipants.values())
          : [];
        if (callGroupList) {
          const rows = groupParticipantsList.map((participant) => {
            const isSpeaking = !participant?.isMuted;
            const voiceLevel = clampVoiceLevel(participant?.voiceLevel);
            const isTalkingNow = isSpeaking && voiceLevel > 0.035;
            const rowState = participant?.isMuted ? "listening" : "speaking";
            const avatar = getAvatarMeta(participant?.userId || participant?.name || "User", participant?.name || "User");
            return '<div class="call-group-row' + (isSpeaking ? " speaking" : "") + '">' +
              '<div class="call-group-row-left">' +
                '<div class="call-group-row-avatar-shell' + (isTalkingNow ? " talking" : "") + '" style="--voice-level:' + voiceLevel.toFixed(3) + ';">' +
                  '<div class="call-group-row-avatar' + (isSpeaking ? " speaking" : "") + '" style="' + avatar.style + '">' +
                    '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + escapeHtml(avatar.letter || "?") + '" />' +
                  '</div>' +
                '</div>' +
                '<div class="call-group-row-meta">' +
                  '<div class="call-group-row-name">' + escapeHtml(participant?.name || "User") + '</div>' +
                  '<div class="call-group-row-state">' + escapeHtml(rowState) + '</div>' +
                '</div>' +
              '</div>' +
              '<span class="material-symbols-rounded call-group-row-mic' + (participant?.isMuted ? " muted" : " active") + '" aria-hidden="true">' + (participant?.isMuted ? "mic_off" : "mic") + '</span>' +
            '</div>';
          });
          callGroupList.innerHTML = rows.join("");
        }
        callMiniAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        callMiniAvatar.style.cssText = avatar.style;
        callMiniName.textContent = activeCall.peerName || "TheGraphT";
        callMiniSubtitle.textContent = statusText;
        callMuteButton.classList.toggle("muted", Boolean(activeCall.isMuted));
        const muteIconNode = callMuteButton.querySelector(".material-symbols-rounded");
        if (muteIconNode) {
          muteIconNode.textContent = activeCall.isMuted ? "mic_off" : "mic";
        }
        if (callVideoButton) {
          callVideoButton.classList.toggle("active", Boolean(activeCall.cameraEnabled));
          callVideoButton.classList.toggle("muted", !Boolean(activeCall.cameraEnabled));
          const videoIconNode = callVideoButton.querySelector(".material-symbols-rounded");
          if (videoIconNode) {
            videoIconNode.textContent = activeCall.cameraEnabled ? "videocam" : "videocam_off";
          }
        }
        if (callScreenButton) {
          callScreenButton.classList.toggle("active", Boolean(activeCall.screenEnabled));
          callScreenButton.classList.toggle("muted", Boolean(activeCall.screenEnabled));
          const remoteOwnsScreen = Boolean(
            activeCall.remoteScreenSharing
            && activeCall.screenOwnerUserId
            && activeCall.screenOwnerUserId !== currentUserId
          );
          callScreenButton.disabled = remoteOwnsScreen && !activeCall.screenEnabled;
          callScreenButton.setAttribute(
            "title",
            remoteOwnsScreen && !activeCall.screenEnabled
              ? "The other user is already sharing screen"
              : "Screen"
          );
          const screenIconNode = callScreenButton.querySelector(".material-symbols-rounded");
          if (screenIconNode) {
            screenIconNode.textContent = activeCall.screenEnabled ? "stop_screen_share" : "screen_share";
          }
        }
        callMuteLabel.textContent = "Mute";
        if (isGroupCall) {
          callModal.classList.toggle("group-speaking", !activeCall.isMuted);
          callModal.classList.toggle("group-listening", Boolean(activeCall.isMuted));
          const hasAnySpeaker = groupParticipantsList.some((participant) => Boolean(participant?.isSpeaking) && !participant?.isMuted);
          setCallVoiceLevel(hasAnySpeaker ? 0.88 : (activeCall.isMuted ? 0.08 : 0.36));
        }
        if (callAcceptWrap.parentElement) {
          callAcceptWrap.parentElement.dataset.callLayout = shouldShowAcceptAction ? "incoming" : "outgoing";
        }
        callAcceptWrap.hidden = !shouldShowAcceptAction;
        callAcceptWrap.style.display = shouldShowAcceptAction ? "" : "none";
        const videoActionWrap = callVideoButton?.closest(".call-action");
        const screenActionWrap = callScreenButton?.closest(".call-action");
        const muteActionWrap = callMuteButton?.closest(".call-action");
        const shouldShowMediaActions = !shouldShowAcceptAction;
        if (videoActionWrap) {
          videoActionWrap.hidden = !shouldShowMediaActions;
        }
        if (screenActionWrap) {
          screenActionWrap.hidden = !shouldShowMediaActions;
        }
        if (muteActionWrap) {
          muteActionWrap.hidden = !shouldShowMediaActions;
        }
        callEndButton.setAttribute("aria-label", shouldShowAcceptAction ? "Decline call" : "End call");
        callEndLabel.textContent = shouldShowAcceptAction ? "Decline" : "End";
        syncCallVideoStage();
        callModal.classList.toggle("open", !activeCall.minimized);
        callMiniCard.classList.toggle("visible", Boolean(activeCall.minimized && !activeCall.miniHidden));
        if (activeCall.miniPosition && Number.isFinite(activeCall.miniPosition.left) && Number.isFinite(activeCall.miniPosition.top)) {
          callMiniCard.style.left = activeCall.miniPosition.left + "px";
          callMiniCard.style.top = activeCall.miniPosition.top + "px";
          callMiniCard.style.right = "auto";
          callMiniCard.style.bottom = "auto";
        } else {
          callMiniCard.style.left = "";
          callMiniCard.style.top = "";
          callMiniCard.style.right = "";
          callMiniCard.style.bottom = "";
        }
        syncActiveCallChip();
        syncGroupCallBanner();
        ensureGroupCallPresenceHeartbeat();
      };

      const startCallTicker = () => {
        if (callTickTimer) {
          return;
        }

        callTickTimer = window.setInterval(() => {
          logCallVideoDebugSnapshot("ticker");
          syncCallUi();
        }, 420);
      };

      const stopAndReleaseCallMedia = async () => {
        if (!activeCall) {
          return;
        }
        if (activeCall.mode !== "group") {
          await stopDirectVisualStream(activeCall, { notify: false });
          activeCall.remoteVideoStream = null;
          activeCall.remoteVideoFrameReady = false;
          activeCall.remoteScreenSharing = false;
          activeCall.screenOwnerUserId = "";
        }
        stopCallVoiceMeter();
        stopGroupLocalVoiceMeter();

        if (activeCall.mode === "group") {
          try {
            if (activeCall.groupPeerConnections instanceof Map) {
              activeCall.groupPeerConnections.forEach((entry) => {
                try {
                  entry?.peerConnection?.close();
                } catch {}
              });
            }
            if (activeCall.groupRemoteAudioNodes instanceof Map) {
              activeCall.groupRemoteAudioNodes.forEach((audioNode) => {
                try {
                  audioNode.pause();
                  audioNode.srcObject = null;
                  audioNode.remove();
                } catch {}
              });
            }
          } catch {}
        }

        try {
          activeCall.peerConnection?.getSenders().forEach((sender) => {
            try { sender.track?.stop(); } catch {}
          });
        } catch {}

        try {
          activeCall.peerConnection?.close();
        } catch {}

        try {
          activeCall.localStream?.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
        } catch {}
        if (activeCall.visualRenegotiateRetryTimer) {
          try { window.clearTimeout(activeCall.visualRenegotiateRetryTimer); } catch {}
          activeCall.visualRenegotiateRetryTimer = null;
        }
        if (activeCall.screenResyncTimer) {
          try { window.clearTimeout(activeCall.screenResyncTimer); } catch {}
          activeCall.screenResyncTimer = null;
        }
        if (activeCall.remoteVideoMuteGraceTimer) {
          try { window.clearTimeout(activeCall.remoteVideoMuteGraceTimer); } catch {}
          activeCall.remoteVideoMuteGraceTimer = null;
        }
        activeCall.pendingVisualRenegotiationReason = "";

        if (remoteAudioNode) {
          try {
            remoteAudioNode.pause();
            remoteAudioNode.srcObject = null;
          } catch {}
        }
      };


      const getParticipantInitialsForCall = (name) => {
        const parts = String(name || "Guest").trim().split(/s+/).filter(Boolean).slice(0, 2);
        return (parts.map((part) => part.charAt(0)).join("") || "G").toUpperCase();
      };

      const resolveDialogAvatarUrlForDirectCall = (call) => {
        if (!call || call.mode === "group") {
          return "";
        }
        if (call.peerAvatarUrl) {
          return String(call.peerAvatarUrl);
        }
        const peerId = String(call.peerId || "").trim();
        const dialogPublicId = String(call.dialogPublicId || "").trim();
        const matchingDialog = Array.isArray(allDialogs)
          ? allDialogs.find((dialog) => {
              if (!dialog || dialog.type !== "direct") {
                return false;
              }
              if (dialogPublicId && String(dialog.publicId || "") === dialogPublicId) {
                return true;
              }
              if (peerId && String(dialog.peerUserId || "") === peerId) {
                return true;
              }
              return false;
            })
          : null;
        const avatarUrl = matchingDialog?.avatarUrl ? String(matchingDialog.avatarUrl) : "";
        if (avatarUrl && call) {
          call.peerAvatarUrl = avatarUrl;
        }
        return avatarUrl;
      };
      const resolveDirectPeerAvatarByUserId = (userId) => {
        const normalizedUserId = String(userId || "").trim();
        if (!normalizedUserId || !Array.isArray(allDialogs)) {
          return "";
        }
        const matchingDialog = allDialogs.find((dialog) => (
          dialog
          && dialog.type === "direct"
          && String(dialog.peerUserId || "") === normalizedUserId
          && dialog.avatarUrl
        ));
        return matchingDialog?.avatarUrl ? String(matchingDialog.avatarUrl) : "";
      };

      const buildCallParticipantCardHtml = ({ id, name, muted, imageSrc = "", avatarStyle = "" }) => (
        '<div class="participant-card call-participant-card" data-participant-id="' + escapeHtml(String(id || "")) + '">' +
          '<div class="participant-avatar call-participant-avatar" style="' + escapeHtml(String(avatarStyle || "")) + '">' +
            (imageSrc
              ? ('<img class="generated-avatar-photo" src="' + escapeHtml(imageSrc) + '" alt="' + escapeHtml(getParticipantInitialsForCall(name)) + '" />')
              : escapeHtml(getParticipantInitialsForCall(name))) +
          '</div>' +
          '<div class="participant-name call-participant-meta">' +
            '<span class="call-participant-name">' + escapeHtml(name || "Guest") + '</span>' +
            '<span class="material-symbols-rounded participant-mic call-participant-mic' + (muted ? " muted" : "") + '" aria-hidden="true">' + (muted ? "mic_off" : "mic") + '</span>' +
          '</div>' +
        '</div>'
      );

      const getOrCreateDirectLocalPreview = () => {
        const streamHost = document.getElementById("call-main-stream");
        if (!(streamHost instanceof HTMLElement)) {
          return null;
        }
        let preview = document.getElementById("local-video-preview");
        if (preview instanceof HTMLVideoElement) {
          return preview;
        }
        preview = document.createElement("video");
        preview.id = "local-video-preview";
        preview.autoplay = true;
        preview.muted = true;
        preview.playsInline = true;
        preview.setAttribute("aria-label", "Local camera preview");
        streamHost.appendChild(preview);
        return preview;
      };

      const hideDirectLocalPreview = () => {
        const preview = document.getElementById("local-video-preview");
        if (!(preview instanceof HTMLVideoElement)) {
          return;
        }
        preview.pause();
        preview.srcObject = null;
        preview.classList.remove("active");
        preview.style.display = "none";
      };

      const shouldUseDirectScreenShareLayout = (call) => {
        if (!call || call.mode === "group") {
          return false;
        }
        return Boolean(call.screenEnabled || call.remoteScreenSharing || call.remoteVisualKind === "screen");
      };

      const syncCallParticipantsGrid = () => {
        const grid = document.getElementById("call-participants-grid");
        if (!(grid instanceof HTMLElement)) {
          return;
        }
        if (!activeCall) {
          grid.innerHTML = "";
          callModal?.classList.remove("screen-share-active", "has-screen-share", "has-direct-visuals", "has-dual-visuals");
          return;
        }

        if (activeCall.mode !== "group") {
          const shouldShowDirectTiles = shouldUseDirectScreenShareLayout(activeCall);
          grid.innerHTML = "";
          callModal?.classList.toggle("screen-share-active", shouldShowDirectTiles);
          if (!shouldShowDirectTiles) {
            return;
          }
          const localAvatar = getAvatarMeta(currentUserId || "local", currentUserDisplayName || workspaceUserName.textContent || "You");
          const peerAvatarUrl = resolveDialogAvatarUrlForDirectCall(activeCall);
          const peerAvatar = peerAvatarUrl
            ? { avatarUrl: peerAvatarUrl, style: "", letter: getParticipantInitialsForCall(activeCall.peerName || "Guest") }
            : getAvatarMeta(activeCall.peerId || activeCall.peerName, activeCall.peerName || "Guest");
          grid.innerHTML = [
            buildCallParticipantCardHtml({
              id: currentUserId || "local",
              name: currentUserDisplayName || workspaceUserName.textContent || "You",
              muted: Boolean(activeCall.isMuted),
              imageSrc: localAvatar.avatarUrl,
              avatarStyle: localAvatar.style
            }),
            buildCallParticipantCardHtml({
              id: activeCall.peerId || "remote",
              name: activeCall.peerName || "Guest",
              muted: Boolean(activeCall.remoteMuted),
              imageSrc: peerAvatar.avatarUrl,
              avatarStyle: peerAvatar.style
            })
          ].join("");
          return;
        }

        if (activeCall.mode === "group" && activeCall.groupParticipants instanceof Map) {
          const rows = Array.from(activeCall.groupParticipants.values()).map((participant) => buildCallParticipantCardHtml({
            id: participant?.userId || participant?.name,
            name: participant?.name || "Guest",
            muted: Boolean(participant?.isMuted)
          }));
          grid.innerHTML = rows.join("");
          return;
        }
      };

      const syncCallVideoStage = () => {
        syncCallParticipantsGrid();

        const remoteScreenVideo = document.getElementById("remote-screen-video");
        const mainPlaceholder = document.getElementById("call-main-placeholder");
        const localVideoPreview = getOrCreateDirectLocalPreview();
        const directCallLayoutHost = callModal instanceof HTMLElement ? callModal : null;
        const remoteVideoTrack = activeCall?.remoteVideoStream instanceof MediaStream
          ? activeCall.remoteVideoStream.getVideoTracks()[0] || null
          : null;
        const hasPendingRemoteVideo = Boolean(
          activeCall?.remoteVideoStream
          && remoteVideoTrack
          && remoteVideoTrack.readyState === "live"
          && !remoteVideoTrack.muted
        );
        const remoteElementHasFrames = Boolean(
          remoteScreenVideo instanceof HTMLVideoElement
          && remoteScreenVideo.readyState >= 2
          && remoteScreenVideo.videoWidth > 0
          && remoteScreenVideo.videoHeight > 0
        );
        const hasRemoteVideo = Boolean(
          hasPendingRemoteVideo
          && (activeCall?.remoteVideoFrameReady || remoteElementHasFrames)
        );
        const hasLocalCameraPreview = Boolean(
          activeCall
          && activeCall.mode !== "group"
          && activeCall.cameraEnabled
          && activeCall.localVisualStream instanceof MediaStream
        );
        const hasLocalScreenPreview = Boolean(
          activeCall
          && activeCall.mode !== "group"
          && activeCall.screenEnabled
          && activeCall.localVisualStream instanceof MediaStream
        );
        const shouldForcePlaceholder = Boolean(
          activeCall
          && activeCall.mode !== "group"
          && !activeCall.screenEnabled
          && !activeCall.remoteScreenSharing
          && activeCall.remoteVisualKind === "none"
        );
        if (
          activeCall
          && activeCall.mode !== "group"
          && activeCall.screenResyncTimer
          && (hasRemoteVideo || !activeCall.remoteScreenSharing)
        ) {
          window.clearTimeout(activeCall.screenResyncTimer);
          activeCall.screenResyncTimer = null;
        }

        if (!(remoteScreenVideo instanceof HTMLVideoElement)) {
          logCallVideoDebug("sync_stage_no_remote_element", {
            hasRemoteVideo,
            hasPendingRemoteVideo,
            remoteVideoTrack: getDebugTrackState(remoteVideoTrack)
          });
          return;
        }

        if (shouldForcePlaceholder) {
          closeExpandedScreenPreview();
          remoteScreenVideo.pause();
          remoteScreenVideo.onloadedmetadata = null;
          remoteScreenVideo.onplaying = null;
          remoteScreenVideo.onresize = null;
          remoteScreenVideo.srcObject = null;
          remoteScreenVideo.classList.remove("active");
          if (mainPlaceholder instanceof HTMLElement) {
            mainPlaceholder.hidden = false;
            mainPlaceholder.style.display = "flex";
          }
          if (!hasLocalCameraPreview) {
            hideDirectLocalPreview();
          }
          if (directCallLayoutHost) {
            directCallLayoutHost.classList.remove("has-direct-visuals", "has-dual-visuals", "has-screen-share", "screen-share-active");
            directCallLayoutHost.dataset.directVisualLayout = "none";
          }
          logCallVideoDebug("sync_stage_forced_placeholder", {
            screenEnabled: Boolean(activeCall?.screenEnabled),
            remoteScreenSharing: Boolean(activeCall?.remoteScreenSharing),
            remoteVisualKind: activeCall?.remoteVisualKind || ""
          });
          return;
        }

        const markRemoteVideoFrameReady = (source) => {
          if (!activeCall || remoteScreenVideo.srcObject !== activeCall.remoteVideoStream) {
            return;
          }
          if (remoteScreenVideo.readyState < 2 || remoteScreenVideo.videoWidth <= 0 || remoteScreenVideo.videoHeight <= 0) {
            logCallVideoDebug("remote_video_frame_not_ready", {
              source,
              readyState: remoteScreenVideo.readyState,
              videoWidth: remoteScreenVideo.videoWidth,
              videoHeight: remoteScreenVideo.videoHeight
            });
            return;
          }
          activeCall.remoteVideoFrameReady = true;
          logCallVideoDebug("remote_video_frame_ready", {
            source,
            readyState: remoteScreenVideo.readyState,
            videoWidth: remoteScreenVideo.videoWidth,
            videoHeight: remoteScreenVideo.videoHeight
          });
          syncCallVideoStage();
        };

        logCallVideoDebugSnapshot("syncCallVideoStage", { force: Boolean(hasRemoteVideo) });
        logCallVideoDebug("sync_stage_decision", {
          hasRemoteVideo,
          hasPendingRemoteVideo,
          remoteVideoFrameReady: Boolean(activeCall?.remoteVideoFrameReady),
          remoteElementHasFrames,
          hasLocalCameraPreview,
          remoteVideoTrack: getDebugTrackState(remoteVideoTrack),
          screenShareLayout: shouldUseDirectScreenShareLayout(activeCall)
        });

        if (activeCall && hasPendingRemoteVideo && !hasRemoteVideo) {
          if (remoteScreenVideo.srcObject !== activeCall.remoteVideoStream) {
            remoteScreenVideo.srcObject = activeCall.remoteVideoStream;
          }
          remoteScreenVideo.onloadedmetadata = () => markRemoteVideoFrameReady("loadedmetadata");
          remoteScreenVideo.onplaying = () => markRemoteVideoFrameReady("playing");
          remoteScreenVideo.onresize = () => markRemoteVideoFrameReady("resize");
          try {
            const playPromise = remoteScreenVideo.play();
            if (playPromise?.catch) {
              playPromise.catch((error) => {
                logCallVideoDebug("remote_video_play_rejected", {
                  message: error instanceof Error ? error.message : String(error)
                });
              });
            }
          } catch (error) {
            logCallVideoDebug("remote_video_play_failed", {
              message: error instanceof Error ? error.message : String(error)
            });
          }
          const canKeepLastRemoteFrame = Boolean(
            remoteScreenVideo.srcObject === activeCall.remoteVideoStream
            && remoteVideoTrack
            && remoteVideoTrack.readyState === "live"
            && (remoteElementHasFrames || Boolean(activeCall?.remoteVideoFrameReady))
          );
          if (canKeepLastRemoteFrame) {
            remoteScreenVideo.classList.add("active");
            if (mainPlaceholder instanceof HTMLElement) {
              mainPlaceholder.hidden = true;
              mainPlaceholder.style.display = "none";
            }
          } else {
            remoteScreenVideo.classList.remove("active");
            if (mainPlaceholder instanceof HTMLElement) {
              mainPlaceholder.hidden = false;
              mainPlaceholder.style.display = "flex";
            }
          }
          if (!hasLocalCameraPreview) {
            hideDirectLocalPreview();
          }
          if (directCallLayoutHost) {
            directCallLayoutHost.classList.remove("has-direct-visuals", "has-dual-visuals", "has-screen-share");
            directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCall));
            directCallLayoutHost.dataset.directVisualLayout = "none";
          }
          logCallVideoDebug("sync_stage_waiting_for_frames", {
            remoteVideoTrack: getDebugTrackState(remoteVideoTrack),
            readyState: remoteScreenVideo.readyState,
            videoWidth: remoteScreenVideo.videoWidth,
            videoHeight: remoteScreenVideo.videoHeight
          });
        } else if (!activeCall || (!hasRemoteVideo && !hasLocalScreenPreview)) {
          closeExpandedScreenPreview();
          remoteScreenVideo.pause();
          remoteScreenVideo.onloadedmetadata = null;
          remoteScreenVideo.onplaying = null;
          remoteScreenVideo.onresize = null;
          remoteScreenVideo.srcObject = null;
          remoteScreenVideo.classList.remove("active");
          if (mainPlaceholder instanceof HTMLElement) {
            mainPlaceholder.hidden = false;
            mainPlaceholder.style.display = "flex";
          }
          if (!hasLocalCameraPreview) {
            hideDirectLocalPreview();
          }
          if (directCallLayoutHost) {
            directCallLayoutHost.classList.remove("has-direct-visuals", "has-dual-visuals", "has-screen-share");
            directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCall));
            directCallLayoutHost.dataset.directVisualLayout = "none";
          }
          logCallVideoDebug("sync_stage_placeholder_visible", {
            hasRemoteVideo,
            screenShareLayout: shouldUseDirectScreenShareLayout(activeCall)
          });
        } else {
          const isLocalScreenOwner = Boolean(
            activeCall
            && activeCall.mode !== "group"
            && activeCall.screenEnabled
            && activeCall.screenOwnerUserId
            && activeCall.screenOwnerUserId === currentUserId
          );
          const streamForMainStage = isLocalScreenOwner
            ? activeCall.localVisualStream
            : (hasRemoteVideo ? activeCall.remoteVideoStream : activeCall.localVisualStream);
          if (remoteScreenVideo.srcObject !== streamForMainStage) {
            remoteScreenVideo.srcObject = streamForMainStage;
          }
          remoteScreenVideo.onloadedmetadata = () => markRemoteVideoFrameReady("loadedmetadata");
          remoteScreenVideo.onplaying = () => markRemoteVideoFrameReady("playing");
          remoteScreenVideo.onresize = () => markRemoteVideoFrameReady("resize");
          remoteScreenVideo.classList.add("active");
          try {
            const playPromise = remoteScreenVideo.play();
            if (playPromise?.catch) {
              playPromise.catch(() => {});
            }
          } catch {}
          if (mainPlaceholder instanceof HTMLElement) {
            mainPlaceholder.hidden = true;
            mainPlaceholder.style.display = "none";
          }
          if (directCallLayoutHost) {
            directCallLayoutHost.classList.add("has-direct-visuals");
            directCallLayoutHost.classList.toggle("has-screen-share", shouldUseDirectScreenShareLayout(activeCall));
            directCallLayoutHost.classList.toggle("screen-share-active", shouldUseDirectScreenShareLayout(activeCall));
            directCallLayoutHost.classList.remove("has-dual-visuals");
            directCallLayoutHost.dataset.directVisualLayout = "single";
          }
          logCallVideoDebug("sync_stage_remote_visible", {
            remoteVideoTrack: getDebugTrackState(remoteVideoTrack),
            usingLocalScreenPreview: Boolean(!hasRemoteVideo && hasLocalScreenPreview),
            screenShareLayout: shouldUseDirectScreenShareLayout(activeCall)
          });
        }

        if (localVideoPreview instanceof HTMLVideoElement && hasLocalCameraPreview) {
          localVideoPreview.srcObject = activeCall.localVisualStream;
          localVideoPreview.classList.add("active");
          localVideoPreview.style.display = "block";
        } else {
          hideDirectLocalPreview();
        }
      };


      const restoreCallModal = () => {
        if (!activeCall) {
          return;
        }

        activeCall.minimized = false;
        activeCall.miniHidden = false;
        syncCallUi();
      };

      const minimizeCallModal = () => {
        if (!activeCall) {
          return;
        }

        activeCall.minimized = true;
        activeCall.miniHidden = false;
        closeCallDevicesPanel();
        syncCallUi();
      };

      const dismissMiniCallCard = () => {
        if (!activeCall) {
          return;
        }

        activeCall.miniHidden = true;
        syncCallUi();
      };


      const avatarPalettes = [
        ["#6cb5ff", "#4a8fe9"],
        ["#ff9f6c", "#ea6d4a"],
        ["#7de3b2", "#39b67f"],
        ["#f7a6d8", "#d66ab3"],
        ["#b49cff", "#7f69ee"],
        ["#ffd56a", "#f0a93e"],
        ["#7fd4ff", "#3d8fe0"]
      ];
      const hashSeed = (seed) => {
        const text = String(seed || "?");
        let hash = 0;
        for (let index = 0; index < text.length; index += 1) {
          hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
        }
        return Math.abs(hash);
      };
      const buildGeneratedAvatarUrl = (seedSource, labelSource) => {
        const seed = String(seedSource || labelSource || "?");
        const hash = hashSeed(seed);
        const palette = avatarPalettes[hash % avatarPalettes.length];
        const rawLabel = String(labelSource || seedSource || "?").trim();
        const words = rawLabel.split(/s+/);
        let rawLetter = "";
        if (words.length >= 2) {
          rawLetter = (words[0][0] || "") + (words[1][0] || "");
        } else if (rawLabel.length >= 2) {
          rawLetter = rawLabel.slice(0, 2);
        } else {
          rawLetter = rawLabel[0] || "?";
        }
        const letter = escapeHtml(rawLetter.toLocaleUpperCase("ru-RU"));
        const svg = [
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">',
          '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">',
          '<stop offset="0%" stop-color="', palette[0], '"/>',
          '<stop offset="100%" stop-color="', palette[1], '"/>',
          '</linearGradient></defs>',
          '<circle cx="64" cy="64" r="64" fill="url(#g)"/>',
          '<circle cx="38" cy="30" r="18" fill="#ffffff" opacity="0.08"/>',
          '<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Roboto, Segoe UI, Trebuchet MS, sans-serif" font-size="58" font-weight="700">',
          letter,
          '</text></svg>'
        ].join("");
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      };

      const getAvatarMeta = (seedSource, labelSource) => {
        const seed = String(seedSource || labelSource || "?");
        const hash = hashSeed(seed);
        const palette = avatarPalettes[Math.abs(hash) % avatarPalettes.length];
        const rawLabel = String(labelSource || seedSource || "?").trim();
        const words = rawLabel.split(/s+/);
        let rawLetter = "";
        if (words.length >= 2) {
          rawLetter = (words[0][0] || "") + (words[1][0] || "");
        } else if (rawLabel.length >= 2) {
          rawLetter = rawLabel.slice(0, 2);
        } else {
          rawLetter = rawLabel[0] || "?";
        }
        const letter = rawLetter.toLocaleUpperCase("ru-RU") || "?";
        const avatarUrl = buildGeneratedAvatarUrl(seedSource, labelSource);
        return {
          letter: escapeHtml(letter),
          start: palette[0],
          end: palette[1],
          avatarUrl,
          style: '--avatar-start:' + palette[0] + ';--avatar-end:' + palette[1] + ';'
        };
      };




      const createGroupPeerConnection = (call, peerUserId, peerName = "User") => {
        if (!call || call.mode !== "group" || !peerUserId) {
          return null;
        }
        if (!(call.groupPeerConnections instanceof Map)) {
          call.groupPeerConnections = new Map();
        }
        const existing = call.groupPeerConnections.get(peerUserId);
        if (existing?.peerConnection) {
          return existing.peerConnection;
        }
        const iceServers = parseRtcIceServers();
        const peerConnection = new RTCPeerConnection({
          iceServers,
          iceCandidatePoolSize: 10
        });
        if (call.localStream) {
          call.localStream.getTracks().forEach((track) => {
            try {
              peerConnection.addTrack(track, call.localStream);
            } catch {}
          });
        }
        call.groupPeerConnections.set(peerUserId, {
          peerConnection,
          peerUserId,
          peerName: String(peerName || "User"),
          offerSent: false
        });

        peerConnection.onicecandidate = (event) => {
          if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== call.callId) {
            return;
          }
          if (!event.candidate) {
            return;
          }
          sendCallRealtime({
            type: "call_candidate",
            mode: "group",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            targetUserId: peerUserId,
            candidate: event.candidate
          });
        };

        peerConnection.ontrack = (event) => {
          if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== call.callId) {
            return;
          }
          if (!(call.groupRemoteAudioNodes instanceof Map)) {
            call.groupRemoteAudioNodes = new Map();
          }
          let audioNode = call.groupRemoteAudioNodes.get(peerUserId);
          if (!audioNode) {
            audioNode = new Audio();
            audioNode.autoplay = true;
            audioNode.controls = false;
            audioNode.style.display = "none";
            document.body.appendChild(audioNode);
            call.groupRemoteAudioNodes.set(peerUserId, audioNode);
          }
          audioNode.srcObject = event.streams?.[0] || null;
          try {
            const playPromise = audioNode.play();
            if (playPromise?.catch) {
              playPromise.catch(() => {});
            }
          } catch {}
        };

        peerConnection.onconnectionstatechange = () => {
          const state = peerConnection.connectionState;
          if (state === "failed" || state === "closed" || state === "disconnected") {
            const entry = call.groupPeerConnections.get(peerUserId);
            if (entry?.peerConnection === peerConnection) {
              call.groupPeerConnections.delete(peerUserId);
            }
          }
        };

        return peerConnection;
      };

      const maybeStartGroupPeerNegotiation = async (call, peerUserId, peerName = "User") => {
        if (!call || call.mode !== "group" || !peerUserId || peerUserId === currentUserId) {
          return;
        }
        const selfId = String(currentUserId || "");
        const targetId = String(peerUserId || "");
        if (!selfId || !targetId) {
          return;
        }
        const shouldInitiate = selfId.localeCompare(targetId) > 0;
        const peerConnection = createGroupPeerConnection(call, peerUserId, peerName);
        if (!peerConnection) {
          return;
        }
        const entry = call.groupPeerConnections.get(peerUserId);
        if (!shouldInitiate || entry?.offerSent) {
          return;
        }
        try {
          const offer = await buildOfferWithVoiceProfile(peerConnection);
          await peerConnection.setLocalDescription(offer);
          entry.offerSent = true;
          call.groupPeerConnections.set(peerUserId, entry);
          sendCallRealtime({
            type: "call_invite",
            mode: "group",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            targetUserId: peerUserId,
            callerName: currentUserDisplayName || workspaceUserName.textContent || "TheGraphT",
            offer
          });
        } catch (error) {
          warnCall("group_offer_failed", {
            peerUserId,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const sendCallRealtime = (payload) => {
        if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
          warnCall("realtime_send_skipped_socket_not_open", {
            payloadType: payload?.type,
            readyState: realtimeSocket?.readyState
          });
          return;
        }

        logCall("realtime_send", {
          payloadType: payload.type,
          callId: payload.callId,
          dialogId: payload.dialogId,
          active: typeof payload.active === "boolean" ? payload.active : undefined,
          reason: payload.reason || ""
        });
        realtimeSocket.send(JSON.stringify(payload));
      };

      const finishActiveCall = async ({ summaryBody = "", remoteEnded = false } = {}) => {
        if (!activeCall) {
          return;
        }

        logCall("finish_call", {
          callId: activeCall.callId,
          status: activeCall.status,
          remoteEnded,
          summaryBody
        });
        rememberRecentlyClosedCall(activeCall.dialogId, activeCall.callId);
        clearCallTimers();
        closeExpandedScreenPreview();
        await stopAndReleaseCallMedia();
        activeCall = null;
        syncCallUi();
      };


      const loadCallDevices = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputDevices = devices.filter((device) => device.kind === "audioinput");
          const outputDevices = devices.filter((device) => device.kind === "audiooutput");

          callInputDevice.innerHTML = inputDevices.map((device, index) => (
            '<option value="' + escapeHtml(device.deviceId) + '">' + escapeHtml(device.label || ("Microphone " + (index + 1))) + '</option>'
          )).join("");

          callOutputDevice.innerHTML = outputDevices.map((device, index) => (
            '<option value="' + escapeHtml(device.deviceId) + '">' + escapeHtml(device.label || ("Output " + (index + 1))) + '</option>'
          )).join("");
        } catch {}
      };

      const createPeerConnection = (call) => {
        const iceServers = parseRtcIceServers();
        const peerConnection = new RTCPeerConnection({
          iceServers,
          iceCandidatePoolSize: 10
        });
        try {
          peerConnection.addTransceiver("video", { direction: "sendrecv" });
        } catch {}
        logCall("pc_created", { callId: call.callId, iceServers });

        peerConnection.onicecandidate = (event) => {
          if (!activeCall || activeCall.callId !== call.callId) {
            return;
          }

          if (!event.candidate) {
            logCall("ice_candidate_gathering_complete", {
              callId: call.callId,
              iceGatheringState: peerConnection.iceGatheringState
            });
            return;
          }

          logCall("ice_candidate_local", {
            callId: call.callId,
            protocol: event.candidate.protocol,
            type: event.candidate.type,
            address: event.candidate.address
          });

          sendCallRealtime({
            type: "call_candidate",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            candidate: event.candidate
          });
        };

        peerConnection.ontrack = (event) => {
          logCall("remote_track_received", {
            callId: call.callId,
            kind: event.track?.kind || "",
            streamCount: event.streams?.length || 0,
            track: getDebugTrackState(event.track || null),
            streams: Array.from(event.streams || []).map(getDebugStreamState)
          });
          logCallVideoDebug("ontrack", {
            incomingTrack: getDebugTrackState(event.track || null),
            incomingStreams: Array.from(event.streams || []).map(getDebugStreamState)
          });
          if (!event.track) {
            return;
          }
          const stream = event.streams?.[0] || new MediaStream([event.track]);
          if (event.track?.kind === "audio") {
            const audio = ensureRemoteAudioNode();
            audio.srcObject = stream;
            startCallVoiceMeter(stream);
            try {
              const playPromise = audio.play();
              if (playPromise?.catch) {
                playPromise.catch(() => {});
              }
            } catch {}
            return;
          }
          if (event.track?.kind === "video" && activeCall && activeCall.callId === call.callId) {
            const applyRemoteVideoTrack = () => {
              logCallVideoDebug("remote_video_apply_attempt", {
                incomingTrack: getDebugTrackState(event.track),
                incomingStream: getDebugStreamState(stream)
              });
              if (!activeCall || activeCall.callId !== call.callId) {
                return;
              }
              if (event.track.readyState === "ended" || event.track.muted) {
                logCallVideoDebug("remote_video_apply_skipped", {
                  reason: event.track.readyState === "ended" ? "ended" : "muted",
                  incomingTrack: getDebugTrackState(event.track)
                });
                return;
              }
              if (activeCall.remoteVideoStream !== stream) {
                activeCall.remoteVideoFrameReady = false;
              }
              activeCall.remoteVideoStream = stream;
              // Treat a live/unmuted inbound track as frame-ready to avoid
              // placeholder flicker while the element refreshes metadata.
              if (event.track.readyState === "live" && !event.track.muted) {
                activeCall.remoteVideoFrameReady = true;
              }
              logCallVideoDebug("remote_video_applied", {
                incomingTrack: getDebugTrackState(event.track),
                incomingStream: getDebugStreamState(stream)
              });
              syncCallVideoStage();
            };
            const clearRemoteVideoTrack = () => {
              logCallVideoDebug("remote_video_clear_attempt", {
                incomingTrack: getDebugTrackState(event.track)
              });
              if (!activeCall || activeCall.callId !== call.callId) {
                return;
              }
              const currentStream = activeCall.remoteVideoStream;
              const currentTrack = currentStream instanceof MediaStream
                ? currentStream.getVideoTracks()[0] || null
                : null;
              if (currentTrack && currentTrack !== event.track) {
                logCallVideoDebug("remote_video_clear_skipped", {
                  reason: "different_current_track",
                  incomingTrack: getDebugTrackState(event.track),
                  currentTrack: getDebugTrackState(currentTrack)
                });
                return;
              }
              activeCall.remoteVideoStream = null;
              activeCall.remoteVideoFrameReady = false;
              activeCall.remoteVisualKind = "none";
              if (activeCall.remoteScreenSharing) {
                activeCall.remoteScreenSharing = false;
                activeCall.screenOwnerUserId = "";
              }
              logCallVideoDebug("remote_video_cleared", {
                incomingTrack: getDebugTrackState(event.track)
              });
              syncCallVideoStage();
              syncCallUi();
            };
            const clearRemoteVideoTrackWithGrace = () => {
              if (!activeCall || activeCall.callId !== call.callId) {
                return;
              }
              if (activeCall.remoteVideoMuteGraceTimer) {
                window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
              }
              activeCall.remoteVideoMuteGraceTimer = window.setTimeout(() => {
                if (!activeCall || activeCall.callId !== call.callId) {
                  return;
                }
                activeCall.remoteVideoMuteGraceTimer = null;
                const currentStream = activeCall.remoteVideoStream;
                const currentTrack = currentStream instanceof MediaStream
                  ? currentStream.getVideoTracks()[0] || null
                  : null;
                if (currentTrack && currentTrack.readyState === "live" && !currentTrack.muted) {
                  logCallVideoDebug("remote_video_clear_grace_skipped", {
                    reason: "track_recovered",
                    currentTrack: getDebugTrackState(currentTrack)
                  });
                  return;
                }
                clearRemoteVideoTrack();
              }, 1600);
            };
            if (!event.track.muted && event.track.readyState === "live") {
              applyRemoteVideoTrack();
            } else {
              syncCallVideoStage();
            }
            event.track.onunmute = () => {
              if (activeCall?.remoteVideoMuteGraceTimer) {
                window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
                activeCall.remoteVideoMuteGraceTimer = null;
              }
              logCallVideoDebug("track_onunmute", {
                incomingTrack: getDebugTrackState(event.track)
              });
              applyRemoteVideoTrack();
            };
            event.track.onmute = () => {
              logCallVideoDebug("track_onmute", {
                incomingTrack: getDebugTrackState(event.track)
              });
              clearRemoteVideoTrackWithGrace();
            };
            event.track.onended = () => {
              if (activeCall?.remoteVideoMuteGraceTimer) {
                window.clearTimeout(activeCall.remoteVideoMuteGraceTimer);
                activeCall.remoteVideoMuteGraceTimer = null;
              }
              logCallVideoDebug("track_onended", {
                incomingTrack: getDebugTrackState(event.track)
              });
              clearRemoteVideoTrack();
            };
          }
        };

        peerConnection.onconnectionstatechange = () => {
          if (!activeCall || activeCall.callId !== call.callId) {
            return;
          }

          logCall("pc_connection_state", {
            callId: call.callId,
            connectionState: peerConnection.connectionState,
            iceConnectionState: peerConnection.iceConnectionState,
            iceGatheringState: peerConnection.iceGatheringState,
            signalingState: peerConnection.signalingState
          });

          if (peerConnection.connectionState === "connected") {
            activeCall.status = "active";
            activeCall.lastError = "";
            if (!activeCall.connectedAt) {
              activeCall.connectedAt = Date.now();
            }
            clearCallTimers();
            stopCallRingtone();
            startCallTicker();
            syncCallUi();
            return;
          }

          if (peerConnection.connectionState === "disconnected") {
            if (activeCall.status === "active" || activeCall.status === "connecting") {
              activeCall.status = "reconnecting";
              setCallError("Unstable network, reconnecting.", {
                connectionState: peerConnection.connectionState,
                iceConnectionState: peerConnection.iceConnectionState
              });
              syncCallUi();
            }
            if (!callTimeoutTimer) {
              callTimeoutTimer = window.setTimeout(() => {
                if (!activeCall || activeCall.callId !== call.callId) {
                  return;
                }
                void finishActiveCall({
                  summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : buildCallMessageMarker("missed"),
                  remoteEnded: false
                });
              }, CALL_RECONNECT_GRACE_MS);
            }
            return;
          }

          if (peerConnection.connectionState === "failed" || peerConnection.connectionState === "closed") {
            setCallError("WebRTC connection failed.", {
              connectionState: peerConnection.connectionState,
              iceConnectionState: peerConnection.iceConnectionState,
              signalingState: peerConnection.signalingState
            });
            void finishActiveCall({
              summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : "",
              remoteEnded: false
            });
          }
        };

        peerConnection.oniceconnectionstatechange = () => {
          if (!activeCall || activeCall.callId !== call.callId) {
            return;
          }

          logCall("pc_ice_connection_state", {
            callId: call.callId,
            iceConnectionState: peerConnection.iceConnectionState,
            connectionState: peerConnection.connectionState,
            iceGatheringState: peerConnection.iceGatheringState
          });

          if (peerConnection.iceConnectionState === "connected" || peerConnection.iceConnectionState === "completed") {
            if (activeCall.status === "reconnecting") {
              activeCall.status = activeCall.connectedAt ? "active" : "connecting";
              activeCall.lastError = "";
              syncCallUi();
            }
            return;
          }

          if (peerConnection.iceConnectionState === "failed") {
            setCallError("ICE failed: candidates could not connect.", {
              connectionState: peerConnection.connectionState,
              signalingState: peerConnection.signalingState
            });
            void finishActiveCall({
              summaryBody: activeCall.connectedAt ? buildCallMessageMarker("ended", getCallElapsedSeconds()) : buildCallMessageMarker("missed"),
              remoteEnded: false
            });
          }
        };

        peerConnection.onicecandidateerror = (event) => {
          const safeCode = Number.isFinite(event?.errorCode) ? event.errorCode : "unknown";
          const safeText = event?.errorText ? String(event.errorText) : "unknown";
          const safeUrl = event?.url ? String(event.url) : "";
          const verboseMessage = "ICE " + safeCode + ": " + safeText + (safeUrl ? " (" + safeUrl + ")" : "");
          warnCall("ice_candidate_error", {
            callId: call.callId,
            errorCode: event.errorCode,
            errorText: event.errorText,
            url: event.url
          });

          if (!activeCall || activeCall.callId !== call.callId) {
            return;
          }

          // 701 errors are often non-fatal candidate gathering warnings in browsers.
          if (Number(event?.errorCode) === 701) {
            return;
          }

          // Do not override active call UI with transient candidate-level errors.
          if (activeCall.status === "active") {
            return;
          }

          setCallError(verboseMessage, {
            errorCode: event.errorCode,
            errorText: event.errorText,
            url: event.url
          });
        };

        peerConnection.onicegatheringstatechange = () => {
          logCall("pc_ice_gathering_state", {
            callId: call.callId,
            iceGatheringState: peerConnection.iceGatheringState
          });
        };

        peerConnection.onsignalingstatechange = () => {
          logCall("pc_signaling_state", {
            callId: call.callId,
            signalingState: peerConnection.signalingState
          });
          if (
            activeCall
            && activeCall.callId === call.callId
            && activeCall.mode !== "group"
            && peerConnection.signalingState === "stable"
            && activeCall.pendingVisualRenegotiationReason
          ) {
            const retryReason = activeCall.pendingVisualRenegotiationReason;
            activeCall.pendingVisualRenegotiationReason = "";
            if (activeCall.visualRenegotiateRetryTimer) {
              window.clearTimeout(activeCall.visualRenegotiateRetryTimer);
              activeCall.visualRenegotiateRetryTimer = null;
            }
            void renegotiateDirectVisualTrack(activeCall, retryReason);
          }
        };

        return peerConnection;
      };

      const ensureCallLocalStream = async (inputDeviceId) => {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support calls.");
        }

        const constraints = {
          audio: {
            ...(inputDeviceId ? { deviceId: { exact: inputDeviceId } } : {}),
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000,
            sampleSize: 16,
            latency: 0
          }
        };

        return navigator.mediaDevices.getUserMedia(constraints);
      };

      const applyCallOutputDevice = async (deviceId) => {
        const audio = ensureRemoteAudioNode();

        if (typeof audio.setSinkId !== "function" || !deviceId) {
          return;
        }

        try {
          await audio.setSinkId(deviceId);
        } catch {}
      };


      const updateVisualSenderTrack = async (call, track) => {
        if (!call?.peerConnection) {
          return;
        }
        logCallVideoDebug("update_visual_sender_start", {
          targetCallId: call.callId,
          nextTrack: getDebugTrackState(track)
        });
        const sender = call.peerConnection.getSenders().find((entry) => (
          entry.track?.kind === "video"
          || call.peerConnection.getTransceivers().some((transceiver) => (
            transceiver.sender === entry && transceiver.receiver?.track?.kind === "video"
          ))
        ));
        if (sender) {
          await sender.replaceTrack(track || null);
          logCallVideoDebug("update_visual_sender_replaced", {
            targetCallId: call.callId,
            nextTrack: getDebugTrackState(track),
            senderTrack: getDebugTrackState(sender.track)
          });
          return;
        }
        if (track) {
          const videoTransceiver = call.peerConnection.getTransceivers().find((transceiver) => (
            transceiver.receiver?.track?.kind === "video"
          ));
          if (videoTransceiver?.sender) {
            await videoTransceiver.sender.replaceTrack(track);
            logCallVideoDebug("update_visual_sender_transceiver_replaced", {
              targetCallId: call.callId,
              nextTrack: getDebugTrackState(track),
              senderTrack: getDebugTrackState(videoTransceiver.sender.track)
            });
            return;
          }
          call.peerConnection.addTrack(track, new MediaStream([track]));
          logCallVideoDebug("update_visual_sender_added_track", {
            targetCallId: call.callId,
            nextTrack: getDebugTrackState(track)
          });
        }
      };

      const renegotiateDirectVisualTrack = async (call, reason) => {
        if (!call?.peerConnection || call.mode === "group") {
          return;
        }
        if (call.peerConnection.signalingState !== "stable") {
          call.pendingVisualRenegotiationReason = reason || "visual_update";
          if (!call.visualRenegotiateRetryTimer) {
            call.visualRenegotiateRetryTimer = window.setTimeout(() => {
              if (!activeCall || activeCall.callId !== call.callId) {
                return;
              }
              call.visualRenegotiateRetryTimer = null;
              const retryReason = call.pendingVisualRenegotiationReason || reason || "visual_update";
              call.pendingVisualRenegotiationReason = "";
              void renegotiateDirectVisualTrack(call, retryReason);
            }, 220);
          }
          logCallVideoDebug("renegotiate_visual_skipped", {
            reason,
            signalingState: call.peerConnection.signalingState
          });
          return;
        }
        try {
          const offer = await buildOfferWithVoiceProfile(call.peerConnection);
          await call.peerConnection.setLocalDescription(offer);
          logCallVideoDebug("renegotiate_visual_offer_created", {
            reason,
            sdpType: offer.type
          });
          sendCallRealtime({
            type: "call_invite",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            callerName: currentUserDisplayName || workspaceUserName.textContent || "TheGraphT",
            fingerprintEmojis: call.fingerprintEmojis || [],
            offer,
            renegotiate: true,
            reason
          });
          call.pendingVisualRenegotiationReason = "";
        } catch (error) {
          warnCall("renegotiate_visual_failed", {
            reason,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const requestDirectScreenResync = async (call, trigger = "remote_screen_state") => {
        if (!call || call.mode === "group" || !call.peerConnection) {
          return;
        }
        if (call.screenEnabled) {
          return;
        }
        const hasRemoteTrack = call.remoteVideoStream instanceof MediaStream
          && (call.remoteVideoStream.getVideoTracks()[0]?.readyState === "live");
        if (hasRemoteTrack) {
          return;
        }
        await renegotiateDirectVisualTrack(call, "screen_resync:" + String(trigger || "state"));
      };

      const stopDirectVisualStream = async (call, { notify = true, stopReason = "" } = {}) => {
        if (!call || call.mode === "group") {
          return;
        }
        logCallVideoDebug("stop_direct_visual_start", {
          notify,
          stopReason,
          targetCallId: call.callId,
          localVisualStream: getDebugStreamState(call.localVisualStream)
        });
        if (call.visualTrackStopBound) {
          call.visualTrackStopBound.onended = null;
          call.visualTrackStopBound = null;
        }
        if (call.localVisualStream instanceof MediaStream) {
          call.localVisualStream.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
        }
        call.localVisualStream = null;
        call.cameraEnabled = false;
        call.screenEnabled = false;
        call.screenOwnerUserId = "";
        call.remoteVisualKind = "none";
        try {
          await updateVisualSenderTrack(call, null);
        } catch {}
        await renegotiateDirectVisualTrack(call, "visual_stop");
        if (notify) {
          sendCallRealtime({
            type: "call_screen_state",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            active: false
          });
        }
        logCallVideoDebug("stop_direct_visual_done", {
          notify,
          stopReason,
          targetCallId: call.callId
        });
        syncCallVideoStage();
      };

      const startDirectCamera = async (call) => {
        if (!call || call.mode === "group") {
          return false;
        }
        const wasScreenSharing = Boolean(call.screenEnabled);
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const cameraTrack = cameraStream.getVideoTracks()[0];
        if (!cameraTrack) {
          return false;
        }
        logCallVideoDebug("start_camera_track_acquired", {
          cameraStream: getDebugStreamState(cameraStream),
          cameraTrack: getDebugTrackState(cameraTrack)
        });
        if (call.visualTrackStopBound) {
          call.visualTrackStopBound.onended = null;
          call.visualTrackStopBound = null;
        }
        if (call.localVisualStream instanceof MediaStream) {
          call.localVisualStream.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
        }
        await updateVisualSenderTrack(call, cameraTrack);
        call.localVisualStream = cameraStream;
        call.visualTrackStopBound = cameraTrack;
        call.cameraEnabled = true;
        call.screenEnabled = false;
        call.screenOwnerUserId = "";
        call.remoteVisualKind = "camera";
        if (wasScreenSharing) {
          sendCallRealtime({
            type: "call_screen_state",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            active: false
          });
        }
        await renegotiateDirectVisualTrack(call, "camera_start");
        logCallVideoDebug("start_camera_done", {
          wasScreenSharing,
          cameraStream: getDebugStreamState(cameraStream),
          cameraTrack: getDebugTrackState(cameraTrack)
        });
        cameraTrack.onended = () => {
          if (activeCall && activeCall.callId === call.callId) {
            logCallVideoDebug("local_camera_track_ended", {
              endedTrack: getDebugTrackState(cameraTrack)
            });
            void stopDirectVisualStream(call, { stopReason: "local_camera_track_ended" });
            syncCallUi();
          }
        };
        syncCallVideoStage();
        return true;
      };

      const startDirectScreenShare = async (call) => {
        if (!call || call.mode === "group") {
          return false;
        }
        const wasScreenSharing = Boolean(call.screenEnabled);
        if (call.remoteScreenSharing && call.screenOwnerUserId && call.screenOwnerUserId !== currentUserId) {
          showToast("The other user is already sharing the screen.", "error");
          return false;
        }
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (!screenTrack) {
          return false;
        }
        logCallVideoDebug("start_screen_track_acquired", {
          screenStream: getDebugStreamState(screenStream),
          screenTrack: getDebugTrackState(screenTrack)
        });
        if (call.visualTrackStopBound) {
          call.visualTrackStopBound.onended = null;
          call.visualTrackStopBound = null;
        }
        if (call.localVisualStream instanceof MediaStream) {
          call.localVisualStream.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
        }
        await updateVisualSenderTrack(call, screenTrack);
        call.localVisualStream = screenStream;
        call.visualTrackStopBound = screenTrack;
        call.cameraEnabled = false;
        call.screenEnabled = true;
        call.remoteScreenSharing = false;
        call.screenOwnerUserId = currentUserId;
        call.remoteVisualKind = "screen";
        if (wasScreenSharing) {
          sendCallRealtime({
            type: "call_screen_state",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            active: false
          });
        }
        screenTrack.onended = () => {
          if (activeCall && activeCall.callId === call.callId) {
            logCallVideoDebug("local_screen_track_ended", {
              endedTrack: getDebugTrackState(screenTrack)
            });
            void stopDirectVisualStream(call, { stopReason: "local_screen_track_ended" });
            syncCallUi();
          }
        };
        sendCallRealtime({
          type: "call_screen_state",
          callId: call.callId,
          dialogId: call.dialogId,
          dialogPublicId: call.dialogPublicId,
          active: true
        });
        await renegotiateDirectVisualTrack(call, "screen_start");
        logCallVideoDebug("start_screen_done", {
          wasScreenSharing,
          screenStream: getDebugStreamState(screenStream),
          screenTrack: getDebugTrackState(screenTrack)
        });
        syncCallVideoStage();
        return true;
      };


      const toggleDirectCallCamera = async () => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        if (activeCall.cameraEnabled) {
          await stopDirectVisualStream(activeCall);
          syncCallUi();
          return;
        }
        try {
          const started = await startDirectCamera(activeCall);
          if (started) {
            syncCallUi();
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to enable camera.", "error");
        }
      };

      const toggleDirectCallScreenShare = async () => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        if (activeCall.screenEnabled) {
          await stopDirectVisualStream(activeCall);
          syncCallUi();
          return;
        }
        try {
          const started = await startDirectScreenShare(activeCall);
          if (started) {
            syncCallUi();
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to start screen share.", "error");
        }
      };

      const replaceLocalAudioTrack = async (deviceId) => {
        if (!activeCall?.peerConnection) {
          return;
        }

        const nextStream = await ensureCallLocalStream(deviceId);
        const nextTrack = nextStream.getAudioTracks()[0];
        const sender = activeCall.peerConnection.getSenders().find((entry) => entry.track?.kind === "audio");

        if (sender && nextTrack) {
          await sender.replaceTrack(nextTrack);
        } else if (nextTrack) {
          activeCall.peerConnection.addTrack(nextTrack, nextStream);
        }

        activeCall.localStream?.getTracks().forEach((track) => {
          try { track.stop(); } catch {}
        });
        activeCall.localStream = nextStream;
        activeCall.inputDeviceId = deviceId;
        if (activeCall.isMuted && nextTrack) {
          nextTrack.enabled = false;
        }
      };


      const showIncomingCallNotification = async (call) => {
        if (!isWindowInactive() || !call || !isNotificationOwner()) {
          return;
        }

        if (!claimNotificationDelivery("call", call.callId, 20000)) {
          return;
        }

        playSound("message");
        const permission = await ensureNotificationPermission();

        if (permission !== "granted") {
          return;
        }

        try {
          const notificationAvatarUrl = String(call?.peerAvatarUrl || "").trim()
            || resolveDialogAvatarUrlForDirectCall(call)
            || getAvatarMeta(
              call?.peerId || call?.dialogId || call?.peerName || "?",
              call?.peerName || "?"
            ).avatarUrl;
          const notification = new Notification(call.peerName + " is calling you", {
            body: "Tap to open the call",
            icon: notificationAvatarUrl,
            badge: "/assets/logo.jpg",
            tag: "call_" + call.callId,
            renotify: true
          });

          notification.onclick = () => {
            window.focus();
            restoreCallModal();
            notification.close();
          };
        } catch {}
      };

      const beginOutgoingCall = async () => {
        if (!isPrimaryActiveTab) {
          showToast("Another tab is active. Close other tabs to place calls here.", "error");
          return;
        }

        if (!currentDialogSnapshot || currentDialogSnapshot.type !== "direct") {
          return;
        }

        if (activeCall) {
          showToast("Finish the current call first.", "error");
          return;
        }

        try {
          const localStream = await ensureCallLocalStream("");
          logCall("local_stream_acquired_outgoing", {
            trackCount: localStream.getTracks().length
          });
          await loadCallDevices();
          const call = {
            callId: createCallId(),
            dialogId: currentDialogSnapshot.id,
            dialogPublicId: currentDialogSnapshot.publicId,
            peerId: currentDialogSnapshot.peerUserId || "",
            peerName: currentDialogSnapshot.title,
            peerAvatarUrl: currentDialogSnapshot.avatarUrl || "",
            status: "outgoing",
            direction: "outgoing",
            localStream,
            peerConnection: null,
            connectedAt: 0,
            isMuted: false,
            inputDeviceId: "",
            outputDeviceId: "",
            pendingCandidates: [],
            minimized: false,
            miniHidden: false,
            miniPosition: null,
            cameraEnabled: false,
            screenEnabled: false,
            localVisualStream: null,
            remoteVideoStream: null,
            remoteVideoFrameReady: false,
            remoteVisualKind: "none",
            remoteScreenSharing: false,
            screenOwnerUserId: "",
            remoteMuted: false,
            visualTrackStopBound: null,
            visualRenegotiateRetryTimer: null,
            pendingVisualRenegotiationReason: "",
            screenResyncTimer: null,
            remoteVideoMuteGraceTimer: null
          };
          call.fingerprintEmojis = resolveCallFingerprintEmojis(call);

          const peerConnection = createPeerConnection(call);
          call.peerConnection = peerConnection;
          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
          });
          await applyAudioSenderProfile(peerConnection, call.callId);

          activeCall = call;
          startOutgoingCallRingtone();
          startCallTicker();
          syncCallUi();
          const offer = await buildOfferWithVoiceProfile(peerConnection);
          await peerConnection.setLocalDescription(offer);
          logCall("local_offer_created", {
            callId: call.callId,
            sdpType: offer.type
          });
          sendCallRealtime({
            type: "call_invite",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            callerName: currentUserDisplayName || workspaceUserName.textContent || "TheGraphT",
            callerAvatarUrl: String(currentUserAvatarUrl || "").trim(),
            fingerprintEmojis: call.fingerprintEmojis,
            offer
          });

          armCallSetupTimeout(call.callId, "missed");
        } catch (error) {
            setCallError("Failed to start outgoing call.", {
            error: error instanceof Error ? error.message : String(error)
          });
          showToast(error instanceof Error ? error.message : "Failed to start call.", "error");
        }
      };

      const upsertGroupParticipant = (call, userId, name, isMuted, isSpeaking, voiceLevel = 0) => {
        if (!call.groupParticipants) {
          call.groupParticipants = new Map();
        }
        call.groupParticipants.set(userId, {
          userId,
          name,
          isMuted: Boolean(isMuted),
          isSpeaking: Boolean(isSpeaking),
          voiceLevel: clampVoiceLevel(voiceLevel)
        });
      };

      const beginGroupVideoCall = async () => {
        if (!isPrimaryActiveTab) {
          showToast("Another tab is active. Close other tabs to control calls here.", "error");
          return;
        }
        if (!currentDialogSnapshot || currentDialogSnapshot.type !== "group") {
          return;
        }
        if (activeCall) {
          showToast("Finish the current call first.", "error");
          return;
        }

        try {
          const localStream = await ensureCallLocalStream("");
          localStream.getAudioTracks().forEach((track) => {
            track.enabled = false;
          });
          const callId = (groupCallStateByDialog.get(currentDialogSnapshot.id)?.callId) || createCallId();
          const existingState = groupCallStateByDialog.get(currentDialogSnapshot.id) || null;
          const startedByCurrentUser = !existingState;

          activeCall = {
            callId,
            dialogId: currentDialogSnapshot.id,
            dialogPublicId: currentDialogSnapshot.publicId,
            peerId: currentDialogSnapshot.publicId || "",
            peerName: currentDialogSnapshot.title || "Group",
            status: "connecting",
            direction: "outgoing",
            mode: "group",
            startedByUserId: startedByCurrentUser ? currentUserId : (existingState?.starterUserId || ""),
            localStream,
            peerConnection: null,
            connectedAt: Date.now(),
            isMuted: true,
            inputDeviceId: "",
            outputDeviceId: "",
            pendingCandidates: [],
            minimized: false,
            miniHidden: false,
            miniPosition: null,
            groupParticipants: new Map(),
            groupPeerConnections: new Map(),
            groupRemoteAudioNodes: new Map()
          };
          upsertGroupParticipant(
            activeCall,
            currentUserId,
            currentUserDisplayName || workspaceUserName.textContent || "You",
            true,
            false,
            0
          );
          groupCallStateByDialog.set(activeCall.dialogId, {
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            title: activeCall.peerName,
            status: "connecting",
            starterUserId: activeCall.startedByUserId || currentUserId,
            startedAtMs: Number(existingState?.startedAtMs) || Date.now(),
            participantLastSeenAtMap: new Map([[currentUserId, Date.now()]]),
            participantIds: new Set([currentUserId]),
            participantCount: 1
          });
          ensureGroupCallPresencePruneTimer();
          if (startedByCurrentUser && postedGroupStartByDialog.get(activeCall.dialogId) !== activeCall.callId) {
            sendCallRealtime({
              type: "call_invite",
              mode: "group",
              callId: activeCall.callId,
              dialogId: activeCall.dialogId,
              dialogPublicId: activeCall.dialogPublicId,
              callerName: currentUserDisplayName || workspaceUserName.textContent || "TheGraphT",
              startedAtMs: Number(groupCallStateByDialog.get(activeCall.dialogId)?.startedAtMs) || Date.now(),
              summarySenderUserId: currentUserId,
              summaryBody: buildGroupCallMarker("started_video")
            });
            postedGroupStartByDialog.set(activeCall.dialogId, activeCall.callId);
          }
          sendCallRealtime({
            type: "call_presence",
            mode: "group",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            participantUserId: currentUserId,
            participantName: currentUserDisplayName || workspaceUserName.textContent || "You",
            isMuted: true,
            isSpeaking: false,
            voiceLevel: 0
          });
          syncCallUi();
          startGroupLocalVoiceMeter(activeCall);

          window.setTimeout(() => {
            if (!activeCall || activeCall.mode !== "group") {
              return;
            }
            activeCall.status = "active";
            startCallTicker();
            const state = groupCallStateByDialog.get(activeCall.dialogId);
            if (state) {
              state.status = "active";
              groupCallStateByDialog.set(activeCall.dialogId, state);
            }
            syncCallUi();
          }, 1100);
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to start group call.", "error");
        }
      };

      const acceptIncomingCall = async () => {
        if (!activeCall || activeCall.status !== "incoming") {
          return;
        }

        try {
          const localStream = await ensureCallLocalStream(activeCall.inputDeviceId || "");
          logCall("local_stream_acquired_incoming", {
            callId: activeCall.callId,
            trackCount: localStream.getTracks().length
          });
          await loadCallDevices();
          const peerConnection = createPeerConnection(activeCall);
          activeCall.peerConnection = peerConnection;
          activeCall.localStream = localStream;
          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
          });
          await applyAudioSenderProfile(peerConnection, activeCall.callId);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(activeCall.remoteOffer));
          logCall("remote_offer_set", {
            callId: activeCall.callId,
            sdpType: activeCall.remoteOffer?.type
          });

          while (activeCall.pendingCandidates.length) {
            const candidate = activeCall.pendingCandidates.shift();
            try {
              await peerConnection.addIceCandidate(candidate);
            } catch {}
          }

          const answer = await buildAnswerWithVoiceProfile(peerConnection);
          await peerConnection.setLocalDescription(answer);
          logCall("local_answer_created", {
            callId: activeCall.callId,
            sdpType: answer.type
          });
          activeCall.status = "connecting";
          stopCallRingtone();
          syncCallUi();
          sendCallRealtime({
            type: "call_accept",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            answer
          });
          broadcastCallAcceptedAcrossTabs(activeCall);
        } catch (error) {
            setCallError("Failed to accept incoming call.", {
            error: error instanceof Error ? error.message : String(error)
          });
          showToast(error instanceof Error ? error.message : "Failed to accept call.", "error");
          await finishActiveCall({ summaryBody: buildCallMessageMarker("missed"), remoteEnded: false });
        }
      };

      const endOrRejectCall = async () => {
        if (!activeCall) {
          return;
        }

        const call = activeCall;
        if (call.mode === "group") {
          openGroupLeaveModal();
          return;
        }

        if (call.status === "incoming") {
          sendCallRealtime({
            type: "call_reject",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            reason: "declined",
            summaryBody: buildCallMessageMarker("declined")
          });
          await finishActiveCall({
            summaryBody: buildCallMessageMarker("declined"),
            remoteEnded: false
          });
          return;
        }

        if (call.status === "active") {
          sendCallRealtime({
            type: "call_end",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            reason: "ended",
            durationSeconds: getCallElapsedSeconds(),
            summaryBody: buildCallMessageMarker("ended", getCallElapsedSeconds())
          });
          await finishActiveCall({
            summaryBody: buildCallMessageMarker("ended", getCallElapsedSeconds()),
            remoteEnded: false
          });
          return;
        }

        sendCallRealtime({
          type: "call_end",
          callId: call.callId,
          dialogId: call.dialogId,
          dialogPublicId: call.dialogPublicId,
          reason: "cancelled",
          summaryBody: buildCallMessageMarker("cancelled")
        });
        await finishActiveCall({
          summaryBody: buildCallMessageMarker("cancelled"),
          remoteEnded: false
        });
      };

      const confirmLeaveGroupCall = async ({ endForEveryone = false } = {}) => {
        if (!activeCall || activeCall.mode !== "group") {
          closeGroupLeaveModal();
          return;
        }
        const call = activeCall;
        closeGroupLeaveModal();

        sendCallRealtime({
          type: "call_leave",
          mode: "group",
          callId: call.callId,
          dialogId: call.dialogId,
          dialogPublicId: call.dialogPublicId,
          participantUserId: currentUserId
        });
        const stateBeforeLeave = groupCallStateByDialog.get(call.dialogId);
        if (stateBeforeLeave && stateBeforeLeave.participantIds instanceof Set) {
          stateBeforeLeave.participantIds.delete(currentUserId);
          stateBeforeLeave.participantCount = stateBeforeLeave.participantIds.size;
          groupCallStateByDialog.set(call.dialogId, stateBeforeLeave);
          syncGroupCallBanner();
        }

        if (endForEveryone) {
          const state = groupCallStateByDialog.get(call.dialogId);
          const summarySenderUserId = state?.starterUserId || call.startedByUserId || currentUserId;
          const elapsedSeconds = getGroupCallElapsedSecondsForCall(call);
          sendCallRealtime({
            type: "call_end",
            mode: "group",
            callId: call.callId,
            dialogId: call.dialogId,
            dialogPublicId: call.dialogPublicId,
            reason: "ended_video",
            durationSeconds: elapsedSeconds,
            summarySenderUserId,
            summaryBody: buildGroupCallMarker("ended_video", elapsedSeconds)
          });
          groupCallStateByDialog.delete(call.dialogId);
          postedGroupStartByDialog.delete(call.dialogId);
        }

        await finishActiveCall({ summaryBody: "", remoteEnded: false });
      };

      const handleCallInvite = async (payload) => {
        logCall("realtime_receive_call_invite", {
          callId: payload?.callId,
          dialogId: payload?.dialogId,
          senderUserId: payload?.senderUserId
        });
        if (!payload?.callId || !payload?.dialogId) {
          warnCall("call_invite_ignored_invalid_payload", { payload });
          return;
        }
        if (isRecentlyClosedCall(payload.dialogId, payload.callId)) {
          sendCallRealtime({
            type: "call_reject",
            callId: payload.callId,
            dialogId: payload.dialogId,
            dialogPublicId: payload.dialogPublicId || "",
            reason: "stale"
          });
          return;
        }

        const dialog = getDialogByIdLocal(payload.dialogId) || currentDialogSnapshot;
        if (!dialog || dialog.type !== "group" && payload.mode === "group") {
          return;
        }

        if (payload.mode === "group") {
          if (payload.targetUserId && payload.targetUserId !== currentUserId) {
            return;
          }
          const wasKnownGroupState = groupCallStateByDialog.has(payload.dialogId);
          groupCallStateByDialog.set(payload.dialogId, {
            callId: payload.callId,
            dialogId: payload.dialogId,
            title: dialog?.title || "Group video chat",
            status: "connecting",
            starterUserId: payload.senderUserId || "",
            startedAtMs: Number(payload.startedAtMs) || Date.now(),
            participantLastSeenAtMap: new Map(payload.senderUserId ? [[payload.senderUserId, Date.now()]] : []),
            participantIds: new Set(payload.senderUserId ? [payload.senderUserId] : []),
            participantCount: payload.senderUserId ? 1 : 0
          });
          ensureGroupCallPresencePruneTimer();
          syncGroupCallBanner();
          if (
            !wasKnownGroupState
            && payload.senderUserId !== currentUserId
            && !payload.offer
          ) {
            try {
              if (typeof showToast === "function") {
                showToast("Group call started in " + String(dialog?.title || "group"), "info");
              }
            } catch {}
            try {
              if (typeof isWindowInactive === "function" && typeof isNotificationOwner === "function" && isWindowInactive() && isNotificationOwner()) {
                const permission = await ensureNotificationPermission();
                if (permission === "granted") {
                  const notification = new Notification("Group call started", {
                    body: String(dialog?.title || "Group"),
                    icon: typeof buildNotificationAvatarUrl === "function"
                      ? buildNotificationAvatarUrl(dialog, String(dialog?.title || "Group"))
                      : undefined,
                    badge: "/assets/logo.jpg",
                    tag: "group_call_started_" + String(payload.dialogId || ""),
                    renotify: false
                  });
                  notification.onclick = () => {
                    try { window.focus(); } catch {}
                    try { restoreCallModal(); } catch {}
                    try { notification.close(); } catch {}
                  };
                }
              }
            } catch {}
          }
          if (!activeCall || activeCall.mode !== "group" || activeCall.dialogId !== payload.dialogId || !payload.offer) {
            return;
          }
          const peerUserId = payload.senderUserId || "";
          if (!peerUserId || peerUserId === currentUserId) {
            return;
          }
          try {
            const peerConnection = createGroupPeerConnection(activeCall, peerUserId, payload.callerName || "User");
            await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
            const answer = await buildAnswerWithVoiceProfile(peerConnection);
            await peerConnection.setLocalDescription(answer);
            sendCallRealtime({
              type: "call_accept",
              mode: "group",
              callId: payload.callId,
              dialogId: payload.dialogId,
              dialogPublicId: payload.dialogPublicId || activeCall.dialogPublicId || "",
              targetUserId: peerUserId,
              answer
            });
          } catch (error) {
            warnCall("group_answer_failed", {
              peerUserId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
          return;
        }

        if (!payload.offer) {
          warnCall("call_invite_ignored_missing_offer", { payload });
          return;
        }

        if (payload.senderUserId && payload.senderUserId === currentUserId) {
          return;
        }

        if (!isPrimaryActiveTab) {
          return;
        }

        if (
          activeCall
          && activeCall.dialogId === payload.dialogId
          && (activeCall.status === "outgoing" || activeCall.status === "connecting" || activeCall.status === "active")
        ) {
          if (payload.renegotiate && payload.offer && activeCall.callId === payload.callId && activeCall.peerConnection) {
            try {
              if (payload.reason === "screen_start") {
                activeCall.remoteVisualKind = "screen";
                activeCall.remoteScreenSharing = true;
                activeCall.screenOwnerUserId = String(payload.senderUserId || activeCall.screenOwnerUserId || "");
              } else if (payload.reason === "camera_start") {
                activeCall.remoteVisualKind = "camera";
                activeCall.remoteScreenSharing = false;
                activeCall.screenOwnerUserId = "";
              } else if (payload.reason === "visual_stop") {
                activeCall.remoteVisualKind = "none";
                activeCall.remoteVideoStream = null;
                activeCall.remoteVideoFrameReady = false;
                activeCall.remoteScreenSharing = false;
                activeCall.screenOwnerUserId = "";
              }
              syncCallVideoStage();
              syncCallUi();
              logCallVideoDebug("renegotiate_visual_offer_received", {
                reason: payload.reason || "",
                sdpType: payload.offer?.type || ""
              });
              await activeCall.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
              const answer = await buildAnswerWithVoiceProfile(activeCall.peerConnection);
              await activeCall.peerConnection.setLocalDescription(answer);
              sendCallRealtime({
                type: "call_accept",
                callId: activeCall.callId,
                dialogId: activeCall.dialogId,
                dialogPublicId: activeCall.dialogPublicId || "",
                answer,
                renegotiate: true,
                reason: payload.reason || ""
              });
              logCallVideoDebug("renegotiate_visual_answer_sent", {
                reason: payload.reason || "",
                sdpType: answer.type
              });
            } catch (error) {
              warnCall("renegotiate_visual_offer_failed", {
                reason: payload.reason || "",
                error: error instanceof Error ? error.message : String(error)
              });
            }
          }
          return;
        }

        if (activeCall && activeCall.callId !== payload.callId) {
          sendCallRealtime({
            type: "call_reject",
            callId: payload.callId,
            dialogId: payload.dialogId,
            dialogPublicId: payload.dialogPublicId || dialog?.publicId || "",
            reason: "busy"
          });
          return;
        }

        activeCall = {
          callId: payload.callId,
          dialogId: payload.dialogId,
          dialogPublicId: payload.dialogPublicId || dialog?.publicId || "",
          peerId: payload.senderUserId || dialog?.peerUserId || "",
          peerName: payload.callerName || dialog?.title || "TheGraphT",
          peerAvatarUrl: String(payload.callerAvatarUrl || "") || resolveDirectPeerAvatarByUserId(payload.senderUserId) || dialog?.avatarUrl || "",
          status: "incoming",
          direction: "incoming",
          remoteOffer: payload.offer,
          peerConnection: null,
          localStream: null,
          connectedAt: 0,
          isMuted: false,
          inputDeviceId: "",
          outputDeviceId: "",
          pendingCandidates: [],
          minimized: false,
          miniHidden: false,
          miniPosition: null,
          cameraEnabled: false,
          screenEnabled: false,
          localVisualStream: null,
          remoteVideoStream: null,
          remoteVideoFrameReady: false,
          remoteVisualKind: "none",
          remoteScreenSharing: false,
          screenOwnerUserId: "",
          remoteMuted: false,
          visualTrackStopBound: null,
          visualRenegotiateRetryTimer: null,
          pendingVisualRenegotiationReason: "",
          screenResyncTimer: null,
          remoteVideoMuteGraceTimer: null
        };
        activeCall.fingerprintEmojis = sanitizeFingerprintEmojis(payload.fingerprintEmojis);

        if (claimCallRingtonePlayback(payload.callId)) {
          startIncomingCallRingtone();
        }
        startCallTicker();
        syncCallUi();
        armCallSetupTimeout(payload.callId, "missed");
        await showIncomingCallNotification(activeCall);
      };

      const handleCallAccept = async (payload) => {
        logCall("realtime_receive_call_accept", {
          callId: payload?.callId,
          dialogId: payload?.dialogId
        });
        if (payload?.mode === "group") {
          if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== payload.callId) {
            return;
          }
          if (payload.targetUserId && payload.targetUserId !== currentUserId) {
            return;
          }
          const peerUserId = payload.senderUserId || "";
          if (!peerUserId || !payload.answer) {
            return;
          }
          const entry = activeCall.groupPeerConnections instanceof Map
            ? activeCall.groupPeerConnections.get(peerUserId)
            : null;
          if (!entry?.peerConnection) {
            return;
          }
          try {
            await entry.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
          } catch (error) {
            warnCall("group_set_remote_answer_failed", {
              peerUserId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
          return;
        }
        if (!activeCall || activeCall.callId !== payload.callId || !payload.answer || !activeCall.peerConnection) {
          warnCall("call_accept_ignored_state_mismatch", {
            payloadCallId: payload?.callId,
            activeCallId: activeCall?.callId,
            hasPeerConnection: Boolean(activeCall?.peerConnection)
          });
          return;
        }

        if (callTimeoutTimer) {
          window.clearTimeout(callTimeoutTimer);
          callTimeoutTimer = null;
        }

        try {
          logCallVideoDebug("call_accept_received", {
            renegotiate: Boolean(payload.renegotiate),
            reason: payload.reason || "",
            sdpType: payload.answer?.type || ""
          });
          await activeCall.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
          if (!payload.renegotiate) {
            activeCall.status = "connecting";
          }
          stopCallRingtone();
          logCall("remote_answer_set", {
            callId: activeCall.callId,
            sdpType: payload.answer?.type,
            renegotiate: Boolean(payload.renegotiate),
            reason: payload.reason || ""
          });
          if (!payload.renegotiate) {
            armCallSetupTimeout(activeCall.callId, "no_connect");
          }

          while (activeCall.pendingCandidates.length) {
            const candidate = activeCall.pendingCandidates.shift();
            try {
              await activeCall.peerConnection.addIceCandidate(candidate);
            } catch {}
          }

          syncCallUi();
        } catch (error) {
          setCallError("Failed to apply remote answer SDP.", {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const handleCallCandidate = async (payload) => {
        logCall("realtime_receive_call_candidate", {
          callId: payload?.callId,
          hasCandidate: Boolean(payload?.candidate)
        });
        if (payload?.mode === "group") {
          if (!activeCall || activeCall.mode !== "group" || activeCall.callId !== payload.callId) {
            return;
          }
          if (payload.targetUserId && payload.targetUserId !== currentUserId) {
            return;
          }
          const peerUserId = payload.senderUserId || "";
          const entry = activeCall.groupPeerConnections instanceof Map
            ? activeCall.groupPeerConnections.get(peerUserId)
            : null;
          if (!entry?.peerConnection || !payload.candidate) {
            return;
          }
          try {
            await entry.peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (error) {
            warnCall("group_add_ice_failed", {
              peerUserId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
          return;
        }
        if (!activeCall || activeCall.callId !== payload.callId || !payload.candidate) {
          return;
        }

        const candidate = new RTCIceCandidate(payload.candidate);

        if (!activeCall.peerConnection || !activeCall.peerConnection.remoteDescription) {
          activeCall.pendingCandidates.push(candidate);
          logCall("remote_candidate_buffered", {
            callId: payload.callId,
            bufferedCount: activeCall.pendingCandidates.length
          });
          return;
        }

        try {
          await activeCall.peerConnection.addIceCandidate(candidate);
        } catch (error) {
          setCallError("Failed to add ICE candidate.", {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const handleCallReject = async (payload) => {
        logCall("realtime_receive_call_reject", {
          callId: payload?.callId,
          reason: payload?.reason
        });
        rememberRecentlyClosedCall(payload?.dialogId, payload?.callId);
        if (!activeCall || activeCall.callId !== payload.callId) {
          return;
        }

        stopCallRingtone();
        const summary = payload.reason === "busy" ? "Busy" : "Declined call";
        await finishActiveCall({
          summaryBody: "",
          remoteEnded: true
        });
        showToast(summary, "info");
      };

      const handleCallPresence = async (payload) => {
        if (!payload?.callId || !payload?.dialogId || payload?.mode !== "group") {
          return;
        }
        const knownDialog = getDialogByIdLocal(payload.dialogId) || (currentDialogSnapshot?.id === payload.dialogId ? currentDialogSnapshot : null);
        if (!knownDialog || knownDialog.type !== "group") {
          return;
        }
        const state = groupCallStateByDialog.get(payload.dialogId) || {
          callId: payload.callId,
          dialogId: payload.dialogId,
          title: currentDialogSnapshot?.id === payload.dialogId ? (currentDialogSnapshot?.title || "Group video chat") : "Group video chat",
          status: "active",
          starterUserId: payload.senderUserId || "",
          startedAtMs: Number(payload.startedAtMs) || Date.now(),
          participantLastSeenAtMap: new Map(),
          participantIds: new Set(),
          participantCount: 0
        };
        if (!(state.participantIds instanceof Set)) {
          state.participantIds = new Set();
        }
        if (!(state.participantLastSeenAtMap instanceof Map)) {
          state.participantLastSeenAtMap = new Map();
        }
        const participantUserId = payload.participantUserId || payload.senderUserId || "";
        if (participantUserId) {
          state.participantIds.add(participantUserId);
          state.participantLastSeenAtMap.set(participantUserId, Date.now());
        }
        state.status = "active";
        state.participantCount = state.participantIds.size;
        state.callId = payload.callId || state.callId;
        groupCallStateByDialog.set(payload.dialogId, state);
        ensureGroupCallPresencePruneTimer();
        pruneStaleGroupCallParticipants();

        if (!activeCall || activeCall.mode !== "group" || activeCall.dialogId !== payload.dialogId) {
          syncGroupCallBanner();
          return;
        }
        if (activeCall.callId !== payload.callId) {
          activeCall.callId = payload.callId;
        }
        if (activeCall.status !== "active") {
          activeCall.status = "active";
        }
        startCallTicker();
        const participantUserIdForCall = payload.participantUserId || payload.senderUserId || "";
        const participantMuted = Boolean(payload.isMuted);
        const participantSpeaking = participantMuted ? false : true;
        const participantVoiceLevel = participantMuted ? 0 : clampVoiceLevel(payload.voiceLevel);
        upsertGroupParticipant(
          activeCall,
          participantUserIdForCall,
          payload.participantName || "User",
          participantMuted,
          participantSpeaking,
          participantVoiceLevel
        );
        if (participantUserIdForCall && participantUserIdForCall !== currentUserId) {
          void maybeStartGroupPeerNegotiation(activeCall, participantUserIdForCall, payload.participantName || "User");
        }
        syncCallUi();
      };

      const handleCallLeave = async (payload) => {
        if (!payload?.callId || payload?.mode !== "group") {
          return;
        }
        const state = payload?.dialogId ? groupCallStateByDialog.get(payload.dialogId) : null;
        if (state && state.participantIds instanceof Set) {
          const participantUserId = payload.participantUserId || payload.senderUserId || "";
          if (participantUserId) {
            state.participantIds.delete(participantUserId);
            if (state.participantLastSeenAtMap instanceof Map) {
              state.participantLastSeenAtMap.delete(participantUserId);
            }
            state.participantCount = state.participantIds.size;
            groupCallStateByDialog.set(payload.dialogId, state);
          }
        }
        if (!payload?.dialogId) {
          for (const [dialogId, entry] of groupCallStateByDialog.entries()) {
            if (entry?.callId !== payload.callId || !(entry.participantIds instanceof Set)) {
              continue;
            }
            const participantUserId = payload.participantUserId || payload.senderUserId || "";
            if (participantUserId) {
              entry.participantIds.delete(participantUserId);
              if (entry.participantLastSeenAtMap instanceof Map) {
                entry.participantLastSeenAtMap.delete(participantUserId);
              }
            }
            entry.participantCount = entry.participantIds.size;
            groupCallStateByDialog.set(dialogId, entry);
          }
        }
        if (!activeCall || activeCall.callId !== payload.callId || activeCall.mode !== "group") {
          syncGroupCallBanner();
          return;
        }
        if (activeCall.groupParticipants instanceof Map) {
          activeCall.groupParticipants.delete(payload.participantUserId || payload.senderUserId || "");
          syncCallUi();
        }
      };

      const handleCallScreenState = async (payload) => {
        if (!payload?.callId || !activeCall || activeCall.callId !== payload.callId || activeCall.mode === "group") {
          return;
        }
        logCallVideoDebug("screen_state_received", {
          payload: {
            callId: payload.callId || "",
            senderUserId: payload.senderUserId || "",
            active: Boolean(payload.active),
            reason: payload.reason || ""
          }
        });
        const remoteUserId = String(payload.senderUserId || "").trim();
        const isActive = Boolean(payload.active);
        const reason = String(payload.reason || "");

        if (isActive && activeCall.screenEnabled) {
          logCallVideoDebug("screen_state_reject_busy", {
            remoteUserId,
            isActive
          });
          sendCallRealtime({
            type: "call_screen_state",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            active: false,
            reason: "busy"
          });
          return;
        }
        if (!isActive && reason === "busy" && activeCall.screenEnabled && remoteUserId) {
          await stopDirectVisualStream(activeCall, { notify: false });
          showToast("Screen sharing is already active on the other side.", "error");
        }

        activeCall.remoteScreenSharing = isActive;
        activeCall.screenOwnerUserId = isActive ? remoteUserId : "";
        if (isActive) {
          activeCall.remoteVisualKind = "screen";
          if (activeCall.screenResyncTimer) {
            window.clearTimeout(activeCall.screenResyncTimer);
          }
          activeCall.screenResyncTimer = window.setTimeout(() => {
            if (!activeCall || activeCall.callId !== payload.callId || !activeCall.remoteScreenSharing) {
              return;
            }
            activeCall.screenResyncTimer = null;
            void requestDirectScreenResync(activeCall, "timer");
          }, 1400);
        }
        if (!isActive) {
          if (activeCall.screenResyncTimer) {
            window.clearTimeout(activeCall.screenResyncTimer);
            activeCall.screenResyncTimer = null;
          }
          // When remote side stops screen sharing, aggressively clear old video
          // to avoid stale black frame being kept on stage.
          activeCall.remoteVideoStream = null;
          activeCall.remoteVideoFrameReady = false;
          activeCall.remoteVisualKind = "none";
        }
        logCallVideoDebug("screen_state_applied", {
          remoteUserId,
          isActive,
          reason
        });
        syncCallVideoStage();
        syncCallUi();
      };

      const handleCallMuteState = (payload) => {
        if (!payload?.callId || !activeCall || activeCall.callId !== payload.callId || activeCall.mode === "group") {
          return;
        }
        const senderUserId = String(payload.senderUserId || "").trim();
        if (senderUserId && senderUserId === currentUserId) {
          return;
        }
        activeCall.remoteMuted = Boolean(payload.isMuted);
        syncCallParticipantsGrid();
      };

      const handleCallEnd = async (payload) => {
        logCall("realtime_receive_call_end", {
          callId: payload?.callId,
          reason: payload?.reason
        });
        rememberRecentlyClosedCall(payload?.dialogId, payload?.callId);
        if (payload?.mode === "group" && payload?.dialogId) {
          groupCallStateByDialog.delete(payload.dialogId);
          postedGroupStartByDialog.delete(payload.dialogId);
          syncGroupCallBanner();
        }
        if (!activeCall || activeCall.callId !== payload.callId) {
          return;
        }

        stopCallRingtone();
        await finishActiveCall({
          summaryBody: "",
          remoteEnded: true
        });

        if (payload.reason === "missed") {
          showToast("Missed call.", "info");
          return;
        }

        if (payload.reason === "no_connect") {
          showToast("Failed to establish call connection.", "error");
        }
      };
      const notifyCallStateOnPageUnload = () => {
        if (!activeCall) {
          return;
        }
        try {
          if (activeCall.mode === "group") {
            sendCallRealtime({
              type: "call_leave",
              mode: "group",
              callId: activeCall.callId,
              dialogId: activeCall.dialogId,
              dialogPublicId: activeCall.dialogPublicId,
              participantUserId: currentUserId
            });
            return;
          }
          sendCallRealtime({
            type: "call_end",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            reason: "reloaded"
          });
        } catch {}
      };
      window.addEventListener("storage", (event) => {
        if (!event || event.key !== CALL_ACCEPT_BROADCAST_STORAGE_KEY || !event.newValue) {
          return;
        }
        let parsed = null;
        try {
          parsed = JSON.parse(event.newValue);
        } catch {
          parsed = null;
        }
        if (!parsed || typeof parsed !== "object") {
          return;
        }
        const callId = String(parsed.callId || "");
        const dialogId = String(parsed.dialogId || "");
        if (!callId || !dialogId || !activeCall) {
          return;
        }
        if (activeCall.callId !== callId || activeCall.dialogId !== dialogId) {
          return;
        }
        if (activeCall.status !== "incoming") {
          return;
        }
        stopCallRingtone();
        void finishActiveCall({
          summaryBody: "",
          remoteEnded: true
        });
      });
      window.addEventListener("pagehide", notifyCallStateOnPageUnload);
      window.addEventListener("beforeunload", notifyCallStateOnPageUnload);




      const getLocalMessagesForDialog = (dialogPublicId) => localOutgoingMessages.filter((message) => message.dialogPublicId === dialogPublicId);

      const releaseLocalMessageMediaUrls = () => {
        for (const message of localOutgoingMessages) {
          if (message?.mediaUrl && String(message.mediaUrl).startsWith("blob:")) {
            URL.revokeObjectURL(message.mediaUrl);
          }
        }
      };

      const formatBytes = (bytes) => {
        if (!Number.isFinite(bytes) || bytes <= 0) {
          return "";
        }

        if (bytes >= 1024 * 1024) {
          return (bytes / (1024 * 1024)).toFixed(1).replace(/.0$/, "") + " MB";
        }

        return Math.max(1, Math.round(bytes / 1024)) + " KB";
      };

      const formatPhotoCount = (count) => count === 1 ? "Send Photo" : ("Send " + count + " Photos");
      const formatFileCount = (count) => count === 1 ? "Send File" : ("Send " + count + " Files");
      const formatDuration = (seconds) => {
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return "";
        }
        const total = Math.round(seconds);
        const minutes = Math.floor(total / 60);
        const remSeconds = total % 60;
        return minutes + ":" + String(remSeconds).padStart(2, "0");
      };
      const measureAudioDuration = (src) => new Promise((resolve) => {
        if (!src) {
          resolve(0);
          return;
        }
        const audio = document.createElement("audio");
        let settled = false;
        const finish = (value) => {
          if (settled) {
            return;
          }
          settled = true;
          audio.removeAttribute("src");
          audio.load();
          resolve(Number.isFinite(value) ? value : 0);
        };
        audio.preload = "metadata";
        audio.onloadedmetadata = () => {
          finish(audio.duration);
        };
        audio.onerror = () => finish(0);
        audio.src = src;
      });

      const chunkItems = (items, size) => {
        const result = [];

        for (let index = 0; index < items.length; index += size) {
          result.push(items.slice(index, index + size));
        }

        return result;
      };
      const toEpochMs = (value) => {
        if (value === null || value === undefined || value === "") {
          return 0;
        }

        if (typeof value === "number" && Number.isFinite(value)) {
          return value > 1000000000000 ? Math.floor(value) : Math.floor(value * 1000);
        }

        const raw = String(value).trim();
        if (!raw) {
          return 0;
        }

        if (/^d+$/.test(raw)) {
          const numeric = Number(raw);
          if (!Number.isFinite(numeric) || numeric <= 0) {
            return 0;
          }
          return numeric > 1000000000000 ? Math.floor(numeric) : Math.floor(numeric * 1000);
        }

        const parsed = Date.parse(raw);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          return 0;
        }

        return Math.floor(parsed);
      };
      const startOfDayTs = (value) => {
        const date = new Date(toEpochMs(value));
        if (Number.isNaN(date.getTime())) {
          return 0;
        }
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      };
      const formatDaySeparatorLabel = (value) => {
        const date = new Date(toEpochMs(value));
        if (Number.isNaN(date.getTime())) {
          return "";
        }
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const diffDays = Math.round((today - target) / 86400000);
        if (diffDays === 0) {
          return "Today";
        }
        if (diffDays === 1) {
          return "Yesterday";
        }
        if (diffDays >= 2 && diffDays <= 5) {
          return date.toLocaleDateString("en-US", { weekday: "long" });
        }
        return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
      };




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
          sendAudioNode = ensureAudioNode(sendAudioNode, "/send.mp3");
          messageAudioNode = ensureAudioNode(messageAudioNode, "/message.mp3");
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
        const node = ensureAudioNode(kind === "send" ? sendAudioNode : messageAudioNode, kind === "send" ? "/send.mp3" : "/message.mp3");

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
            icon: "/logo.jpg",
            badge: "/logo.jpg",
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
            badge: "/logo.jpg",
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




      const getConstrainedImageSize = (naturalWidth, naturalHeight) => {
        if (!naturalWidth || !naturalHeight) {
          return null;
        }

        const maxWidth = Math.min(420, Math.max(180, Math.floor(window.innerWidth * 0.46)));
        const maxHeight = Math.min(520, Math.max(220, Math.floor(window.innerHeight * 0.62)));
        const ratio = naturalWidth / naturalHeight;
        let width = Math.min(naturalWidth, maxWidth);
        let height = width / ratio;

        if (height > maxHeight) {
          height = maxHeight;
          width = height * ratio;
        }

        return {
          width: Math.round(width),
          height: Math.round(height)
        };
      };

      const getImageShellStyle = (message) => {
        if (message?.albumId) {
          return "";
        }

        const inlineDimensions = (
          Number(message?.mediaNaturalWidth) > 0
          && Number(message?.mediaNaturalHeight) > 0
        )
          ? {
              naturalWidth: Number(message.mediaNaturalWidth),
              naturalHeight: Number(message.mediaNaturalHeight)
            }
          : null;
        const dimensions = inlineDimensions || readCachedImageDimensions(message?.mediaUrl);
        const size = dimensions
          ? getConstrainedImageSize(dimensions.naturalWidth, dimensions.naturalHeight)
          : null;

        return size ? ' style="width: ' + size.width + 'px; height: ' + size.height + 'px;"' : "";
      };

      const markMessageImageLoaded = (imageNode) => {
        if (!(imageNode instanceof HTMLImageElement)) {
          return;
        }

        const shell = imageNode.closest(".message-image-shell");

        if (!shell) {
          return;
        }

        const isAlbumTile = Boolean(shell.closest(".message-album-item"));
        writeImageDimensions(imageNode.currentSrc || imageNode.src, imageNode);

        if (
          !isAlbumTile
          && imageNode.naturalWidth > 0
          && imageNode.naturalHeight > 0
        ) {
          const size = getConstrainedImageSize(imageNode.naturalWidth, imageNode.naturalHeight);
          if (size) {
            shell.style.width = size.width + "px";
            shell.style.height = size.height + "px";
          }
        }

        shell.classList.add("loaded");
      };

      const hydrateMessageImages = (options = {}) => {
        const lockToken = options.lockToken || 0;
        const pendingImages = [];
        const keepBottomPinned = () => {
          if (lockToken && lockToken === bottomLockToken) {
            hardPinMessagesToBottom(lockToken);
          }
        };

        messageList.querySelectorAll(".message-image").forEach((imageNode) => {
          if (!(imageNode instanceof HTMLImageElement) || imageNode.dataset.hydrated === "true") {
            return;
          }

          imageNode.dataset.hydrated = "true";
          imageNode.addEventListener("load", () => {
            markMessageImageLoaded(imageNode);
            keepBottomPinned();
          });
          imageNode.addEventListener("error", () => {
            const fallbackSrc = String(imageNode.getAttribute("data-fallback-src") || "");
            if (fallbackSrc && imageNode.dataset.fallbackTried !== "true") {
              imageNode.dataset.fallbackTried = "true";
              imageNode.src = fallbackSrc;
              const linkNode = imageNode.closest(".message-image-link");
              if (linkNode) {
                linkNode.setAttribute("data-image-url", fallbackSrc);
              }
              return;
            }
            const shell = imageNode.closest(".message-image-shell");
            if (shell) {
              shell.classList.add("loaded");
            }
            keepBottomPinned();
          });

          if (imageNode.complete && imageNode.naturalWidth > 0) {
            markMessageImageLoaded(imageNode);
            keepBottomPinned();
            return;
          }

          pendingImages.push(imageNode);
        });

        return pendingImages;
      };

      const renderComposerAttachmentPreview = () => {
        composerAttachmentPreview.classList.remove("visible");
        composerAttachmentImage.removeAttribute("src");
        composerAttachmentMeta.textContent = "";
        syncComposerState();
      };

      const closeAttachmentModal = () => {
        const attachmentModalContent = attachmentModal.querySelector(".attachment-modal-content");
        if (attachmentModalContent instanceof HTMLElement) {
          pendingAttachmentModalScrollTop = attachmentModalContent.scrollTop || 0;
        }
        attachmentModalEmojiPicker?.classList.remove("open");
        attachmentModalEmojiPicker?.setAttribute("aria-hidden", "true");
        attachmentModal.classList.remove("open");
        attachmentModal.setAttribute("aria-hidden", "true");
      };

      const clearPendingImageAttachment = (options = {}) => {
        const preservePreviewUrls = new Set(options.preservePreviewUrls || []);
        const closingAttachments = pendingImageAttachments.concat(pendingFileAttachments);
        const cleanupToken = ++attachmentModalCleanupToken;
        const attachmentModalShell = attachmentModal.querySelector(".attachment-modal-shell");

        if (attachmentModalCleanupTimer) {
          window.clearTimeout(attachmentModalCleanupTimer);
          attachmentModalCleanupTimer = null;
        }

        pendingImageAttachments = [];
        pendingImageAttachmentIndex = 0;
        pendingFileAttachments = [];
        pendingFileAttachmentIndex = 0;
        attachmentModalMode = "image";
        pendingImageCaption = "";
        pendingAttachmentModalScrollTop = 0;
        if (composerFileInput) {
          composerFileInput.value = "";
        }
        attachmentModalCaption.value = "";
        attachmentModalEmojiPicker?.classList.remove("open");
        attachmentModalEmojiPicker?.setAttribute("aria-hidden", "true");
        if (attachmentModalShell) {
          attachmentModalShell.classList.remove("is-file-mode");
          attachmentModalShell.classList.remove("is-multi");
          attachmentModalShell.classList.add("is-single");
        }
        attachmentModal.classList.remove("open");
        attachmentModal.setAttribute("aria-hidden", "true");
        attachmentModalPrev.hidden = true;
        attachmentModalNext.hidden = true;
        renderComposerAttachmentPreview();

        attachmentModalCleanupTimer = window.setTimeout(() => {
          if (cleanupToken !== attachmentModalCleanupToken || attachmentModal.classList.contains("open")) {
            return;
          }

          for (const attachment of closingAttachments) {
            if (attachment?.previewUrl && !preservePreviewUrls.has(attachment.previewUrl)) {
              URL.revokeObjectURL(attachment.previewUrl);
            }
          }

          attachmentModalImage.removeAttribute("src");
          attachmentModalImage.alt = "";
          attachmentModalImage.parentElement?.classList.remove("loading");
          attachmentModalStrip.innerHTML = "";
        }, 220);
      };

      const moveAttachmentModal = (direction) => {
        if (attachmentModalMode !== "image" || pendingImageAttachments.length < 2) {
          return;
        }

        pendingImageAttachmentIndex = (pendingImageAttachmentIndex + direction + pendingImageAttachments.length) % pendingImageAttachments.length;
        renderAttachmentModal();
      };

      const renderAttachmentModal = (options = {}) => {
        if (attachmentModalMode === "file") {
          const attachment = pendingFileAttachments[pendingFileAttachmentIndex];
          const attachmentModalShell = attachmentModal.querySelector(".attachment-modal-shell");
          const attachmentModalContent = attachmentModal.querySelector(".attachment-modal-content");
          const preserveScroll = Boolean(options.preserveScroll);

          if (!attachment) {
            attachmentModal.classList.remove("open");
            attachmentModal.setAttribute("aria-hidden", "true");
            return;
          }

          const hasLongFileList = pendingFileAttachments.length > 6;
          if (attachmentModalShell) {
            attachmentModalShell.classList.add("is-file-mode");
            attachmentModalShell.classList.toggle("is-multi", hasLongFileList);
            attachmentModalShell.classList.toggle("is-single", !hasLongFileList);
          }

          attachmentModalTitle.textContent = formatFileCount(pendingFileAttachments.length);
          attachmentModalCaption.value = pendingImageCaption;
          attachmentModalPrev.hidden = true;
          attachmentModalNext.hidden = true;
          attachmentModalStrip.hidden = false;
          attachmentModalImage.removeAttribute("src");
          attachmentModalImage.alt = "";
          attachmentModalImage.parentElement?.classList.remove("loading");
          attachmentModalStrip.innerHTML = pendingFileAttachments.map((entry, index) => {
            const duration = formatDuration(Number(entry.durationSeconds) || 0);
            const size = formatBytes(Number(entry.file?.size) || 0);
            const meta = duration && size
              ? (duration + " • " + size)
              : (duration || size || "Audio file");
            return '<button class="attachment-modal-file-item' + (index === pendingFileAttachmentIndex ? ' active' : '') + '" type="button" data-file-attachment-index="' + index + '">' +
              '<span class="attachment-modal-file-icon" aria-hidden="true">▶</span>' +
              '<span class="attachment-modal-file-copy">' +
                '<span class="attachment-modal-file-name">' + escapeHtml(entry.file?.name || "Audio file") + '</span>' +
                '<span class="attachment-modal-file-meta">' + escapeHtml(meta) + '</span>' +
              '</span>' +
            '</button>';
          }).join("");

          attachmentModal.classList.add("open");
          attachmentModal.setAttribute("aria-hidden", "false");

          attachmentModalStrip.querySelectorAll("[data-file-attachment-index]").forEach((button) => {
            button.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              pendingFileAttachmentIndex = Number(button.getAttribute("data-file-attachment-index")) || 0;
              renderAttachmentModal();
            });
          });

          if (preserveScroll && attachmentModalContent instanceof HTMLElement) {
            attachmentModalContent.scrollTop = pendingAttachmentModalScrollTop;
          } else if (attachmentModalContent instanceof HTMLElement) {
            attachmentModalContent.scrollTop = 0;
          }
          return;
        }

        const attachment = pendingImageAttachments[pendingImageAttachmentIndex];
        const attachmentModalShell = attachmentModal.querySelector(".attachment-modal-shell");
        const attachmentModalContent = attachmentModal.querySelector(".attachment-modal-content");
        const preserveScroll = Boolean(options.preserveScroll);

        if (!attachment) {
          attachmentModal.classList.remove("open");
          attachmentModal.setAttribute("aria-hidden", "true");
          return;
        }
        const isMultiSelection = pendingImageAttachments.length > 1;
        if (attachmentModalShell) {
          attachmentModalShell.classList.remove("is-file-mode");
          attachmentModalShell.classList.toggle("is-multi", isMultiSelection);
          attachmentModalShell.classList.toggle("is-single", !isMultiSelection);
        }

        attachmentModalTitle.textContent = formatPhotoCount(pendingImageAttachments.length);
        attachmentModalImage.parentElement?.classList.add("loading");
        attachmentModalImage.src = attachment.previewUrl;
        attachmentModalImage.alt = attachment.file.name || "Photo";
        attachmentModalImage.onload = () => {
          attachmentModalImage.parentElement?.classList.remove("loading");
        };
        attachmentModalImage.onerror = () => {
          attachmentModalImage.parentElement?.classList.remove("loading");
        };
        if (attachmentModalImage.complete && attachmentModalImage.naturalWidth > 0) {
          attachmentModalImage.parentElement?.classList.remove("loading");
        }
        attachmentModalCaption.value = pendingImageCaption;
        attachmentModalPrev.hidden = true;
        attachmentModalNext.hidden = true;
        attachmentModalStrip.hidden = pendingImageAttachments.length < 2;
        attachmentModalStrip.innerHTML = pendingImageAttachments.map((entry, index) => {
          return '<button class="attachment-modal-thumb' + (index === pendingImageAttachmentIndex ? ' active' : '') + '" type="button" data-attachment-index="' + index + '">' +
            '<img src="' + escapeHtml(entry.previewUrl) + '" alt="' + escapeHtml(entry.file.name || "Photo") + '" />' +
          '</button>';
        }).join("");

        attachmentModal.classList.add("open");
        attachmentModal.setAttribute("aria-hidden", "false");

        attachmentModalStrip.querySelectorAll("[data-attachment-index]").forEach((button) => {
          button.addEventListener("click", () => {
            pendingImageAttachmentIndex = Number(button.getAttribute("data-attachment-index")) || 0;
            renderAttachmentModal();
          });
        });
        if (preserveScroll && attachmentModalContent instanceof HTMLElement) {
          attachmentModalContent.scrollTop = pendingAttachmentModalScrollTop;
        } else {
          const activeThumb = attachmentModalStrip.querySelector('[data-attachment-index="' + pendingImageAttachmentIndex + '"]');
          if (activeThumb instanceof HTMLElement) {
            activeThumb.scrollIntoView({
              block: "nearest",
              inline: "nearest"
            });
          }
        }
      };

      const openAttachmentModal = (index = 0, options = {}) => {
        if (attachmentModalMode === "file") {
          if (!pendingFileAttachments.length) {
            return;
          }
        } else if (!pendingImageAttachments.length) {
          return;
        }

        attachmentModalCleanupToken += 1;
        if (attachmentModalCleanupTimer) {
          window.clearTimeout(attachmentModalCleanupTimer);
          attachmentModalCleanupTimer = null;
        }

        if (attachmentModalMode === "file") {
          pendingFileAttachmentIndex = Math.max(0, Math.min(index, pendingFileAttachments.length - 1));
        } else {
          pendingImageAttachmentIndex = Math.max(0, Math.min(index, pendingImageAttachments.length - 1));
        }
        renderAttachmentModal({
          preserveScroll: Boolean(options.preserveScroll)
        });
      };

      const addPendingImageAttachments = async (files) => {
        const validFiles = Array.from(files || []).filter((file) => file && String(file.type || "").startsWith("image/"));

        if (!validFiles.length) {
          showToast("Only images are supported.", "error");
          return;
        }

        const availableSlots = Math.max(0, MAX_MEDIA_ATTACHMENTS - pendingImageAttachments.length);

        if (!availableSlots) {
          showToast("You can select up to 500 photos at once.", "error");
          return;
        }

        const acceptedFiles = validFiles.slice(0, availableSlots);

        if (acceptedFiles.length < validFiles.length) {
          showToast("Selection limit: 500 photos.", "error");
        }

        const nextAttachments = await Promise.all(acceptedFiles.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          const measured = await measureImageUrl(previewUrl);
          return {
            id: "draft_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
            file,
            previewUrl,
            naturalWidth: Number(measured?.naturalWidth) || 0,
            naturalHeight: Number(measured?.naturalHeight) || 0
          };
        }));

        if (!pendingImageCaption && composerInput.value.trim()) {
          pendingImageCaption = composerInput.value.trim();
          composerInput.value = "";
          syncComposerState();
        }

        pendingImageAttachments = pendingImageAttachments.concat(nextAttachments);
        attachmentModalMode = "image";
        renderComposerAttachmentPreview();
        openAttachmentModal(pendingImageAttachments.length - nextAttachments.length);
      };

      const setPendingImageAttachment = (file) => {
        void addPendingImageAttachments([file]);
      };

      const addPendingFileAttachments = async (files) => {
        const validFiles = Array.from(files || []).filter((file) => file && String(file.type || "").startsWith("audio/"));

        if (!validFiles.length) {
          showToast("Only audio files are supported in File mode.", "error");
          return;
        }

        const availableSlots = Math.max(0, MAX_MEDIA_ATTACHMENTS - pendingFileAttachments.length);

        if (!availableSlots) {
          showToast("You can select up to 500 files at once.", "error");
          return;
        }

        const acceptedFiles = validFiles.slice(0, availableSlots);
        if (acceptedFiles.length < validFiles.length) {
          showToast("Selection limit: 500 files.", "error");
        }

        const nextAttachments = await Promise.all(acceptedFiles.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          const durationSeconds = await measureAudioDuration(previewUrl);
          return {
            id: "file_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
            file,
            previewUrl,
            durationSeconds: Number(durationSeconds) || 0
          };
        }));

        if (!pendingImageCaption && composerInput.value.trim()) {
          pendingImageCaption = composerInput.value.trim();
          composerInput.value = "";
          syncComposerState();
        }

        pendingFileAttachments = pendingFileAttachments.concat(nextAttachments);
        attachmentModalMode = "file";
        renderComposerAttachmentPreview();
        openAttachmentModal(pendingFileAttachments.length - nextAttachments.length);
      };

      const parseCallSummaryMessage = (message) => {
        const rawBody = String(message?.body || "").trim();
        if (!rawBody.startsWith("[[call:") || !rawBody.endsWith("]]")) {
          return null;
        }

        const inner = rawBody.slice(7, -2);
        const parts = inner.split(":");
        const kind = String(parts[0] || "").trim();

        if (!/^[a-z_]+$/.test(kind)) {
          return null;
        }

        const durationSeconds = parts.length > 1 ? Number(parts[1] || 0) || 0 : 0;

        return {
          kind,
          durationSeconds
        };
      };

      const getCallSummaryPresentation = (message) => {
        const parsed = parseCallSummaryMessage(message);

        if (!parsed) {
          return null;
        }

        const isOutgoing = message.senderId === currentUserId;
        const formatVideoChatDuration = (totalSeconds) => {
          const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
          if (safe < 60) {
            return safe + " seconds";
          }
          const minutes = Math.floor(safe / 60);
          const seconds = safe % 60;
          if (minutes < 60) {
            return minutes + " min " + seconds + " sec";
          }
          const hours = Math.floor(minutes / 60);
          const remMinutes = minutes % 60;
          return hours + " h " + remMinutes + " min";
        };

        if (parsed.kind === "started_video") {
          return {
            title: (message.senderName || "Someone") + " started a video chat",
            subtitle: "",
            icon: "videocam",
            tone: "ended"
          };
        }

        if (parsed.kind === "ended_video") {
          return {
            title: (message.senderName || "Someone") + " ended the video chat",
            subtitle: "(" + formatVideoChatDuration(parsed.durationSeconds) + ")",
            icon: "videocam_off",
            tone: "declined"
          };
        }

        if (parsed.kind === "ended") {
          return {
            title: isOutgoing ? "Outgoing Call" : "Incoming Call",
            subtitle: formatCallDuration(parsed.durationSeconds),
            icon: "call",
            tone: "ended"
          };
        }

        if (parsed.kind === "missed") {
          return {
            title: isOutgoing ? "Outgoing Call" : "Incoming Call",
            subtitle: "Missed",
            icon: "call_made",
            tone: "missed"
          };
        }

        if (parsed.kind === "declined" || parsed.kind === "busy" || parsed.kind === "cancelled") {
          return {
            title: isOutgoing ? "Outgoing Call" : "Incoming Call",
            subtitle: parsed.kind === "busy" ? "Busy" : "Declined",
            icon: isOutgoing ? "call_made" : "call_received",
            tone: "declined"
          };
        }

        return {
          title: "Call",
          subtitle: "Ended",
          icon: "call",
          tone: "ended"
        };
      };

      const getMessagePreviewText = (message) => {
        if (!message) {
          return "";
        }

        const callSummary = getCallSummaryPresentation(message);

        if (callSummary) {
          return callSummary.title + " • " + callSummary.subtitle;
        }

        if (message.albumId && Number(message.albumSize) > 1) {
          const albumSize = Number(message.albumSize) || 0;
          return albumSize > 1 ? albumSize + " photos" : "Photo";
        }

        if (message.type === "image") {
          return message.body ? "Photo: " + message.body : "Photo";
        }

        if (message.type === "audio") {
          return message.body ? "Audio: " + message.body : "Audio";
        }

        return message.body || "";
      };

      const getReplyPreviewText = (message) => {
        if (!message || !message.replyToMessageId) {
          return "";
        }

        if (message.replyToType === "image") {
          return message.replyToBody ? "Photo: " + message.replyToBody : "Photo";
        }

        if (message.replyToType === "audio") {
          return message.replyToBody ? "Audio: " + message.replyToBody : "Audio";
        }

        return String(message.replyToBody || "").trim();
      };

      const renderReplyPreviewHtml = (message) => {
        if (!message?.replyToMessageId) {
          return "";
        }

        return '<div class="message-reply" data-reply-target-id="' + escapeHtml(message.replyToMessageId) + '">' +
          '<span class="message-reply-author">' + escapeHtml(message.replyToSenderName || "Message") + '</span>' +
          '<span class="message-reply-text">' + renderEmojiAwareTextHtml(getReplyPreviewText(message) || "Message") + '</span>' +
        '</div>';
      };

      const formatDialogListTime = (value) => {
        if (!value) {
          return "";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return "";
        }

        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });
      };

      const formatDialogPreview = (dialog) => {
        const typingPreview = getTypingPreview(dialog);
        if (typingPreview) {
          return typingPreview;
        }

        if (!dialog) {
          return "";
        }

        const preview = String(dialog.lastMessagePreview || "").trim();
        if (!preview) {
          return "";
        }
        const safePreview = isUndecryptableSecurePlaceholder(preview) ? "Message" : preview;

        const rawCallPreview = parseCallSummaryMessage({ body: safePreview, senderId: dialog.lastMessageSenderName === "You" ? currentUserId : "" });
        const normalizedPreview = rawCallPreview
          ? (
              getCallSummaryPresentation({
                body: safePreview,
                senderId: dialog.lastMessageSenderName === "You" ? currentUserId : "",
                senderName: dialog.lastMessageSenderName || dialog.title || ""
              })?.title + " • " +
              getCallSummaryPresentation({
                body: safePreview,
                senderId: dialog.lastMessageSenderName === "You" ? currentUserId : "",
                senderName: dialog.lastMessageSenderName || dialog.title || ""
              })?.subtitle
            )
          : safePreview;

        if (dialog.type === "saved") {
          return "You: " + normalizedPreview;
        }

        if (dialog.type === "direct" || dialog.type === "group") {
          const senderName = String(dialog.lastMessageSenderName || dialog.title || "").trim();
          return senderName ? (senderName + ": " + normalizedPreview) : normalizedPreview;
        }

        return normalizedPreview;
      };

      const renderTypingPreviewHtml = (label) => (
        '<span class="typing-preview" aria-label="' + escapeHtml(label) + '">' +
          '<span class="typing-preview-text">' + escapeHtml(label.replace(/...$/, "")) + '</span>' +
          '<span class="typing-preview-dots" aria-hidden="true">' +
            '<span class="typing-preview-dot"></span>' +
            '<span class="typing-preview-dot"></span>' +
            '<span class="typing-preview-dot"></span>' +
          '</span>' +
        '</span>'
      );

      const renderDialogPreviewHtml = (dialog) => {
        const typingPreview = getTypingPreview(dialog);

        if (typingPreview) {
          return renderTypingPreviewHtml(typingPreview);
        }

        return renderEmojiAwareTextHtml(formatDialogPreview(dialog));
      };

      const renderDialogSubtitleHtml = (dialog) => {
        const typingPreview = getTypingPreview(dialog);

        if (typingPreview) {
          return renderTypingPreviewHtml(typingPreview);
        }

        return escapeHtml(formatDialogSubtitle(dialog));
      };

      const formatViewerTimestamp = (value) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "";
        }

        return date.toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        });
      };

      const getViewerTargetRect = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const imageRatio = viewerModalImage.naturalWidth > 0 && viewerModalImage.naturalHeight > 0
          ? viewerModalImage.naturalWidth / viewerModalImage.naturalHeight
          : 1;
        const topInset = Math.max(72, Math.floor(viewportHeight * 0.08));
        const bottomInset = Math.max(136, Math.floor(viewportHeight * 0.14));
        const sideInset = Math.max(48, Math.floor(viewportWidth * 0.08));
        const maxWidth = Math.max(260, viewportWidth - (sideInset * 2));
        const maxHeight = Math.max(220, viewportHeight - topInset - bottomInset);
        let width = maxWidth;
        let height = width / imageRatio;

        if (height > maxHeight) {
          height = maxHeight;
          width = height * imageRatio;
        }

        return {
          left: viewportWidth / 2,
          top: viewportHeight / 2,
          width,
          height
        };
      };

      const applyViewerRect = (rect, zoom = viewerZoom, borderRadius = 24) => {
        viewerModalImage.style.left = rect.left + "px";
        viewerModalImage.style.top = rect.top + "px";
        viewerModalImage.style.width = rect.width + "px";
        viewerModalImage.style.height = rect.height + "px";
        viewerModalImage.style.borderRadius = borderRadius + "px";
        viewerModalImage.style.transform = "translate(-50%, -50%) scale(" + zoom + ")";
        viewerModalImage.classList.toggle("zoomed", zoom > 1.01);
        viewerZoomValue.textContent = Math.round(zoom * 100) + "%";
      };

      const setViewerZoom = (nextZoom) => {
        viewerZoom = Math.max(VIEWER_MIN_ZOOM, Math.min(VIEWER_MAX_ZOOM, nextZoom));
        applyViewerRect(getViewerTargetRect(), viewerZoom, 24);
      };

      const closeViewerModal = () => {
        if (!viewerModal.classList.contains("open")) {
          return;
        }

        const fallbackRect = viewerSourceRect || {
          left: window.innerWidth / 2,
          top: window.innerHeight / 2,
          width: 80,
          height: 80
        };

        viewerZoom = 1;
        viewerModal.classList.remove("open");
        applyViewerRect(fallbackRect, 1, 18);
        viewerZoomChip.setAttribute("aria-hidden", "true");

        viewerLoadToken += 1;
        if (viewerCleanupTimer) {
          window.clearTimeout(viewerCleanupTimer);
          viewerCleanupTimer = null;
        }

        viewerCleanupTimer = window.setTimeout(() => {
          viewerModal.setAttribute("aria-hidden", "true");
          viewerModalImage.onload = null;
          viewerModalImage.onerror = null;
          if (!viewerModal.classList.contains("open")) {
            viewerModalImage.removeAttribute("src");
          }
          viewerSourceRect = null;
          viewerCleanupTimer = null;
        }, 280);
      };

      const openViewerModal = ({ src, fallbackSrc, senderName, senderId, createdAt, sourceRect }) => {
        if (!src) {
          return;
        }

        if (viewerCleanupTimer) {
          window.clearTimeout(viewerCleanupTimer);
          viewerCleanupTimer = null;
        }

        const loadToken = ++viewerLoadToken;
        viewerSourceRect = sourceRect || {
          left: window.innerWidth / 2,
          top: window.innerHeight / 2,
          width: 120,
          height: 120
        };
        viewerZoom = 1;
        const avatar = getAvatarMeta(senderId || senderName || "?", senderName || "?");
        viewerAuthorAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        viewerAuthorAvatar.style.cssText = avatar.style;
        viewerAuthorName.textContent = senderName || "TheGraphT";
        viewerAuthorMeta.textContent = formatViewerTimestamp(createdAt);



        viewerZoomChip.setAttribute("aria-hidden", "false");
        viewerModal.setAttribute("aria-hidden", "false");
        applyViewerRect(viewerSourceRect, 1, 18);
        viewerModalImage.onload = () => {
          if (loadToken !== viewerLoadToken) {
            return;
          }
          const targetRect = getViewerTargetRect();
          requestAnimationFrame(() => {
            if (loadToken !== viewerLoadToken) {
              return;
            }
            viewerModal.classList.add("open");
            applyViewerRect(targetRect, 1, 24);
          });
        };
        viewerModalImage.onerror = () => {
          if (loadToken !== viewerLoadToken) {
            return;
          }
          if (fallbackSrc && viewerModalImage.dataset.fallbackTried !== "true") {
            viewerModalImage.dataset.fallbackTried = "true";
            viewerModalImage.src = fallbackSrc;
            return;
          }
          viewerModal.classList.remove("open");
        };
        viewerModalImage.dataset.fallbackTried = "false";
        viewerModalImage.src = src;
      };

      const removeLocalOutgoingMessage = (messageId) => {
        let removedMessage = null;

        localOutgoingMessages = localOutgoingMessages.filter((message) => {
          if (message.id !== messageId) {
            return true;
          }

          removedMessage = message;
          return false;
        });

        if (removedMessage?.mediaUrl && String(removedMessage.mediaUrl).startsWith("blob:")) {
          const isCached = (() => {
            if (typeof window.mediaUrlToBlobUrlCache !== "undefined" && window.mediaUrlToBlobUrlCache) {
              for (const value of window.mediaUrlToBlobUrlCache.values()) {
                if (value === removedMessage.mediaUrl) {
                  return true;
                }
              }
            }
            return false;
          })();
          if (!isCached) {
            URL.revokeObjectURL(removedMessage.mediaUrl);
          }
        }
      };

      const findMatchingPendingLocalMessageId = (dialogPublicId, message) => {
        if (!dialogPublicId || !message || message.senderId !== currentUserId) {
          return "";
        }

        const serverTime = Number.isFinite(new Date(message.createdAt || "").getTime())
          ? new Date(message.createdAt || "").getTime()
          : Date.now();
        let bestId = "";
        let bestDiff = Number.POSITIVE_INFINITY;

        localOutgoingMessages.forEach((localMessage) => {
          if (!localMessage || localMessage.localStatus !== "pending") {
            return;
          }
          if (localMessage.dialogPublicId !== dialogPublicId) {
            return;
          }
          if (localMessage.senderId !== currentUserId) {
            return;
          }
          if (String(localMessage.type || "text") !== String(message.type || "text")) {
            return;
          }
          if (String(localMessage.body || "").trim() !== String(message.body || "").trim()) {
            return;
          }
          if ((localMessage.replyToMessageId || null) !== (message.replyToMessageId || null)) {
            return;
          }

          const localTime = Number.isFinite(new Date(localMessage.createdAt || "").getTime())
            ? new Date(localMessage.createdAt || "").getTime()
            : serverTime;
          const delta = Math.abs(serverTime - localTime);
          if (delta > 120000) {
            return;
          }
          if (delta < bestDiff) {
            bestDiff = delta;
            bestId = localMessage.id;
          }
        });

        return bestId;
      };

      const removeMessageFromCurrentState = (messageId) => {
        markMessageDeletedLocally(messageId);
        if (pendingReplyMessage?.id === messageId) {
          clearPendingReplyMessage();
        }

        currentMessagesSnapshot = currentMessagesSnapshot
          .filter((message) => message.id !== messageId)
          .map((message) => (
            message.replyToMessageId === messageId
              ? {
                  ...message,
                  replyToMessageId: null,
                  replyToSenderId: null,
                  replyToSenderName: null,
                  replyToBody: null,
                  replyToType: null,
                  replyToMediaUrl: null
                }
              : message
          ));
        localOutgoingMessages = localOutgoingMessages.filter((message) => message.id !== messageId);

        if (currentDialogSnapshot?.publicId) {
          setDialogPayloadCache(currentDialogSnapshot.publicId, {
            dialog: currentDialogSnapshot,
            messages: currentMessagesSnapshot
          });
        }
      };

      const handleMessageDeletedEvent = (payload) => {
        if (!payload?.messageId) {
          return;
        }
        const deletedMessageId = String(payload.messageId);
        markMessageDeletedLocally(payload.messageId);

        if (activeAudioElement instanceof HTMLAudioElement) {
          const activeAudioCard = activeAudioElement.closest("[data-audio-card]");
          const activeMessageId = activeAudioCard instanceof HTMLElement
            ? String(activeAudioCard.getAttribute("data-message-id") || "")
            : "";
          if ((activeMessageId && activeMessageId === deletedMessageId) || (activeAudioMessageId && activeAudioMessageId === deletedMessageId)) {
            stopActiveAudio();
          }
        } else if (activeAudioMessageId && activeAudioMessageId === deletedMessageId) {
          activeAudioMessageId = "";
          hideTopAudioPlayer();
        }

        const shouldStickToBottom = computeIsNearChatBottom();
        const previousScrollTop = messageList?.scrollTop || 0;
        const deletedMessageBefore = currentMessagesSnapshot.find((entry) => entry.id === payload.messageId) || null;
        const deletedAlbumId = deletedMessageBefore?.albumId || null;
        const deletedAlbumSizeBefore = deletedAlbumId
          ? currentMessagesSnapshot.filter((entry) => entry.albumId === deletedAlbumId).length
          : 0;
        const shouldUpdateAlbumInPlace = Boolean(deletedAlbumId && deletedAlbumSizeBefore > 1);
        const messageSelector = '[data-message-id="' + CSS.escape(String(payload.messageId)) + '"]';
        const renderedNode = messageList.querySelector(messageSelector);
        const hadMessageInSnapshot = Boolean(deletedMessageBefore);
        removeMessageFromCurrentState(payload.messageId);

        // Duplicate delete events can arrive after local apply/animation.
        // If message is already gone in state and DOM, skip expensive rerender.
        if (!hadMessageInSnapshot && !(renderedNode instanceof HTMLElement)) {
          rerenderDialogsIfVisible();
          return;
        }

        const currentLastMessage = currentMessagesSnapshot[currentMessagesSnapshot.length - 1] || null;
        const nextDialog = payload.dialog
          ? updateDialogInState(payload.dialog, {
              lastMessagePreview: currentLastMessage ? getMessagePreviewText(currentLastMessage) : payload.dialog.lastMessagePreview,
              lastMessageSenderName: currentLastMessage
                ? (
                    currentLastMessage.senderId === currentUserId
                      ? "You"
                      : (currentLastMessage.senderName || payload.dialog.title || "")
                  )
                : payload.dialog.lastMessageSenderName,
              lastMessageCreatedAt: currentLastMessage?.createdAt || payload.dialog.lastMessageCreatedAt
            }) || currentDialogSnapshot
          : currentDialogSnapshot;

        const shouldHandleInCurrentDialog = Boolean(
          (payload.dialog?.id && (payload.dialog.id === currentDialogId || currentDialogSnapshot?.id === payload.dialog.id))
          || renderedNode instanceof HTMLElement
          || hadMessageInSnapshot
        );

        if (shouldHandleInCurrentDialog) {
          if (shouldUpdateAlbumInPlace) {
            renderMessages(nextDialog, currentMessagesSnapshot, {
              scrollBehavior: shouldStickToBottom ? "auto" : "none",
              restoreScrollTop: shouldStickToBottom ? null : previousScrollTop
            });
            rerenderDialogsIfVisible();
            return;
          }

          const runAfterDeleteRender = () => {
            renderMessages(nextDialog, currentMessagesSnapshot, {
              scrollBehavior: shouldStickToBottom ? "auto" : "none",
              restoreScrollTop: shouldStickToBottom ? null : previousScrollTop
            });
          };

          if (renderedNode instanceof HTMLElement) {
            const initialHeight = renderedNode.getBoundingClientRect().height || renderedNode.offsetHeight || 0;
            renderedNode.style.pointerEvents = "none";
            renderedNode.style.height = initialHeight > 0 ? initialHeight + "px" : "";
            renderedNode.style.maxHeight = initialHeight > 0 ? initialHeight + "px" : "";
            renderedNode.style.transition =
              "opacity 220ms ease, transform 220ms ease, filter 220ms ease, height 260ms ease, max-height 260ms ease, margin 260ms ease, padding 260ms ease";

            requestAnimationFrame(() => {
              renderedNode.classList.add("message-removing");
              renderedNode.style.height = "0px";
              renderedNode.style.maxHeight = "0px";
            });

            window.setTimeout(() => {
              // Avoid full list rerender after delete animation to prevent
              // visible avatar/name flicker in group incoming rows.
              const groupIncomingRow = renderedNode.closest(".group-incoming-row");
              if (groupIncomingRow instanceof HTMLElement) {
                groupIncomingRow.remove();
              } else {
                renderedNode.remove();
              }
              normalizeMessageDaySeparators();

              if (!currentMessagesSnapshot.length) {
                runAfterDeleteRender();
              } else if (shouldStickToBottom) {
                scrollMessagesToBottom("auto");
              } else {
                syncChatScrollBottomButton();
              }

              rerenderDialogsIfVisible();
            }, 250);
          } else {
            runAfterDeleteRender();
          }
        } else if (payload.deletedForEveryone) {
          void loadWorkspace({ preserveRoute: true, scrollBehavior: "none" });
        }

        rerenderDialogsIfVisible();
      };

      const uploadImageBatch = async ({ attachments, caption }) => {
        if (!attachments.length || !currentDialogPublicId) {
          return;
        }

        await Promise.all(
          attachments.map((attachment) => measureImageUrl(attachment?.previewUrl || ""))
        );

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 120000);
        const replyToMessageId = pendingReplyMessage?.id || "";
        const albumGroups = chunkItems(attachments, ALBUM_MEDIA_LIMIT).map((group) => ({
          albumId: "album_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10),
          items: group
        }));
        const localDrafts = albumGroups.flatMap((group, groupIndex) => (
          group.items.map((attachment, index) => ({
            id: "local_" + Date.now() + "_" + groupIndex + "_" + index + "_" + Math.random().toString(36).slice(2, 8),
            dialogPublicId: currentDialogPublicId,
            senderId: currentUserId,
            senderName: workspaceUserName.textContent || "You",
            body: index === 0 ? caption : "",
            type: "image",
            albumId: group.items.length > 1 ? group.albumId : null,
            albumIndex: group.items.length > 1 ? index : null,
            albumSize: group.items.length > 1 ? group.items.length : null,
            mediaUrl: attachment.previewUrl,
            attachmentMime: attachment.file.type,
            mediaNaturalWidth: Number(attachment.naturalWidth) || readCachedImageDimensions(attachment.previewUrl)?.naturalWidth || 0,
            mediaNaturalHeight: Number(attachment.naturalHeight) || readCachedImageDimensions(attachment.previewUrl)?.naturalHeight || 0,
            createdAt: new Date().toISOString(),
            localStatus: "pending",
            animateOnRender: groupIndex === albumGroups.length - 1 && index === group.items.length - 1
          }))
        ));

        localOutgoingMessages = localOutgoingMessages.concat(localDrafts);
        await preloadDialogMediaDimensions(localDrafts);
        const appendedDrafts = localDrafts.every((draft, index) => appendLocalOutgoingMessageToCurrentDialog(draft, {
          scrollBehavior: "auto",
          forceScrollBottom: index === localDrafts.length - 1
        }));
        if (!appendedDrafts) {
          rerenderCurrentDialog({ scrollBehavior: "auto" });
        }

        try {
          for (const group of albumGroups) {
            let lastPayload = null;

            for (let index = 0; index < group.items.length; index += 1) {
              const attachment = group.items[index];
              const localDraft = localDrafts.find((draft) => draft.albumId === (group.items.length > 1 ? group.albumId : null) && draft.mediaUrl === attachment.previewUrl) || localDrafts.find((draft) => draft.mediaUrl === attachment.previewUrl);
              const formData = new FormData();
              formData.append("file", attachment.file);
              formData.append("body", index === 0 ? caption : "");
              if (replyToMessageId) {
                formData.append("replyToMessageId", replyToMessageId);
              }

              if (group.items.length > 1) {
                formData.append("albumId", group.albumId);
                formData.append("albumIndex", String(index));
                formData.append("albumSize", String(group.items.length));
              }

              const payload = await fetchJson(
                apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages",
                {
                  method: "POST",
                  body: formData,
                  signal: controller.signal
                }
              );

              lastPayload = payload;

              if (payload.dialog?.id === currentDialogId && payload.message) {
                if (!readCachedImageDimensions(payload.message.mediaUrl)) {
                  await measureImageUrl(payload.message.mediaUrl);
                }
                const serverDimensions = readCachedImageDimensions(payload.message.mediaUrl);
                const serverImageDimensions = serverDimensions?.naturalWidth && serverDimensions?.naturalHeight
                  ? {
                      mediaNaturalWidth: serverDimensions.naturalWidth,
                      mediaNaturalHeight: serverDimensions.naturalHeight
                    }
                  : (
                    localDraft?.mediaNaturalWidth && localDraft?.mediaNaturalHeight
                      ? {
                          mediaNaturalWidth: localDraft.mediaNaturalWidth,
                          mediaNaturalHeight: localDraft.mediaNaturalHeight
                        }
                      : {}
                  );

                if (localDraft && localDraft.mediaUrl && typeof window.registerMediaBlobUrl === "function") {
                  window.registerMediaBlobUrl(payload.message.mediaUrl, localDraft.mediaUrl);
                }

                appendConfirmedMessageToCurrentDialog(payload.dialog, payload.message, {
                  scrollBehavior: "auto",
                  replaceMessageId: localDraft?.id || "",
                  animateMessage: false,
                  messagePatch: serverImageDimensions
                });
              }

              if (localDraft) {
                removeLocalOutgoingMessage(localDraft.id);
              }
            }

            if (lastPayload?.message) {
              updateDialogInState(lastPayload.dialog, {
                lastMessagePreview: getMessagePreviewText(lastPayload.message),
                lastMessageSenderName: lastPayload.message.senderId === currentUserId
                  ? "You"
                  : (lastPayload.message.senderName || lastPayload.dialog?.title || ""),
                lastMessageCreatedAt: lastPayload.message.createdAt || lastPayload.dialog?.lastMessageCreatedAt || ""
              });
            }

            playSound("send");
          }
          clearPendingReplyMessage();
        } catch (error) {
          localOutgoingMessages = localOutgoingMessages.map((message) => (
            localDrafts.some((draft) => draft.id === message.id)
              ? { ...message, localStatus: "failed" }
              : message
          ));
          localDrafts.forEach((draft) => {
            updateRenderedMessageStatus(draft.id, "failed");
          });
          throw error;
        } finally {
          window.clearTimeout(timeoutId);
          if (!currentSearchQuery.trim()) {
            renderDialogs(allDialogs);
          }
        }
      };

      const uploadAudioBatch = async ({ attachments, caption }) => {
        if (!attachments.length || !currentDialogPublicId) {
          return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 120000);
        const replyToMessageId = pendingReplyMessage?.id || "";
        const localDrafts = attachments.map((attachment, index) => ({
          id: "local_" + Date.now() + "_audio_" + index + "_" + Math.random().toString(36).slice(2, 8),
          dialogPublicId: currentDialogPublicId,
          senderId: currentUserId,
          senderName: workspaceUserName.textContent || "You",
          body: index === 0 ? caption : "",
          type: "audio",
          mediaUrl: attachment.previewUrl,
          attachmentMime: attachment.file.type,
          attachmentName: attachment.file.name,
          attachmentSize: Number(attachment.file.size) || 0,
          attachmentDurationSeconds: Number(attachment.durationSeconds) || 0,
          createdAt: new Date().toISOString(),
          localStatus: "pending",
          animateOnRender: index === attachments.length - 1
        }));

        localOutgoingMessages = localOutgoingMessages.concat(localDrafts);
        const appendedDrafts = localDrafts.every((draft, index) => appendLocalOutgoingMessageToCurrentDialog(draft, {
          scrollBehavior: "auto",
          forceScrollBottom: index === localDrafts.length - 1
        }));
        if (!appendedDrafts) {
          rerenderCurrentDialog({ scrollBehavior: "auto" });
        }

        try {
          let lastPayload = null;
          for (let index = 0; index < attachments.length; index += 1) {
            const attachment = attachments[index];
            const localDraft = localDrafts[index];
            const formData = new FormData();
            formData.append("file", attachment.file);
            formData.append("body", index === 0 ? caption : "");
            formData.append("attachmentDurationSeconds", String(Math.max(0, Math.round(Number(attachment.durationSeconds) || 0))));
            if (replyToMessageId && index === 0) {
              formData.append("replyToMessageId", replyToMessageId);
            }

            const payload = await fetchJson(
              apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages",
              {
                method: "POST",
                body: formData,
                signal: controller.signal
              }
            );

            lastPayload = payload;

            if (payload.dialog?.id === currentDialogId && payload.message) {
              appendConfirmedMessageToCurrentDialog(payload.dialog, payload.message, {
                scrollBehavior: "auto",
                replaceMessageId: localDraft?.id || "",
                animateMessage: false,
                messagePatch: {
                  attachmentDurationSeconds: Number(attachment.durationSeconds) || 0,
                  attachmentSize: Number(attachment.file.size) || 0,
                  attachmentName: attachment.file.name || payload.message.attachmentName || "",
                  attachmentMime: attachment.file.type || payload.message.attachmentMime || ""
                }
              });
            }

            if (localDraft) {
              removeLocalOutgoingMessage(localDraft.id);
            }
          }

          if (lastPayload?.message) {
            updateDialogInState(lastPayload.dialog, {
              lastMessagePreview: getMessagePreviewText(lastPayload.message),
              lastMessageSenderName: lastPayload.message.senderId === currentUserId
                ? "You"
                : (lastPayload.message.senderName || lastPayload.dialog?.title || ""),
              lastMessageCreatedAt: lastPayload.message.createdAt || lastPayload.dialog?.lastMessageCreatedAt || ""
            });
          }
          clearPendingReplyMessage();
          playSound("send");
        } catch (error) {
          localOutgoingMessages = localOutgoingMessages.map((message) => (
            localDrafts.some((draft) => draft.id === message.id)
              ? { ...message, localStatus: "failed" }
              : message
          ));
          localDrafts.forEach((draft) => {
            updateRenderedMessageStatus(draft.id, "failed");
          });
          throw error;
        } finally {
          window.clearTimeout(timeoutId);
          if (!currentSearchQuery.trim()) {
            renderDialogs(allDialogs);
          }
        }
      };

      const updateDialogInState = (dialogPatch, options = {}) => {
        if (!dialogPatch?.id) {
          return null;
        }

        const { lastMessagePreview, lastMessageSenderName, lastMessageCreatedAt, unreadCount } = options;
        let nextDialog = null;

        allDialogs = allDialogs.map((dialog) => {
          if (dialog.id !== dialogPatch.id) {
            return dialog;
          }

          nextDialog = {
            ...dialog,
            ...dialogPatch,
            lastMessagePreview: lastMessagePreview ?? dialog.lastMessagePreview,
            lastMessageSenderName: lastMessageSenderName ?? dialogPatch.lastMessageSenderName ?? dialog.lastMessageSenderName,
            lastMessageCreatedAt: lastMessageCreatedAt ?? dialogPatch.lastMessageCreatedAt ?? dialog.lastMessageCreatedAt,
            unreadCount: unreadCount ?? dialogPatch.unreadCount ?? dialog.unreadCount ?? 0
          };
          return nextDialog;
        });

        if (!nextDialog) {
          return null;
        }

        if (currentDialogSnapshot?.id === nextDialog.id) {
          currentDialogSnapshot = {
            ...currentDialogSnapshot,
            ...nextDialog
          };
        }

        return nextDialog;
      };

      const appendConfirmedMessageToCurrentDialog = (dialogPatch, message, options = {}) => {
        if (!dialogPatch?.id || !message || dialogPatch.id !== currentDialogId) {
          return;
        }
        if (isMessageDeletedLocally(message.id)) {
          return;
        }

        const replacementDraft = options.replaceMessageId
          ? getLocalMessagesForDialog(currentDialogPublicId).find((draft) => String(draft?.id || "") === String(options.replaceMessageId))
          : null;
        const hasInlineImageDimensions = Number(message?.mediaNaturalWidth) > 0 && Number(message?.mediaNaturalHeight) > 0;
        const draftImageDimensions = (!hasInlineImageDimensions && replacementDraft?.type === "image"
          && Number(replacementDraft?.mediaNaturalWidth) > 0
          && Number(replacementDraft?.mediaNaturalHeight) > 0)
          ? {
              mediaNaturalWidth: Number(replacementDraft.mediaNaturalWidth),
              mediaNaturalHeight: Number(replacementDraft.mediaNaturalHeight)
            }
          : {};
        const finalMessage = {
          ...message,
          ...draftImageDimensions,
          ...(options.messagePatch || {})
        };

        const finalMessageId = String(finalMessage.id || "");
        const hadMessageBefore = currentMessagesSnapshot.some((entry) => String(entry?.id || "") === finalMessageId);
        const isOwnMessage = finalMessage.senderId === currentUserId;
        const shouldStickToBottom = Boolean(options.forceScrollBottom) || isOwnMessage || computeIsNearChatBottom();

        const nextDialog = updateDialogInState(dialogPatch, {
          lastMessagePreview: getMessagePreviewText(finalMessage),
          lastMessageSenderName: finalMessage.senderId === currentUserId
            ? "You"
            : (finalMessage.senderName || dialogPatch.title || ""),
          lastMessageCreatedAt: finalMessage.createdAt || dialogPatch.lastMessageCreatedAt || ""
        }) || currentDialogSnapshot || dialogPatch;

        if (!hadMessageBefore) {
          currentMessagesSnapshot = currentMessagesSnapshot.concat([{
            ...finalMessage,
            animateOnRender: options.animateMessage !== false
          }]);
        }

        if (nextDialog?.publicId) {
          setDialogPayloadCache(nextDialog.publicId, {
            dialog: nextDialog,
            messages: currentMessagesSnapshot
          });
          prefetchDialogMedia(currentMessagesSnapshot);
        }
        const canFastAppend = !finalMessage.albumId
          && !messageList.querySelector(".empty-chat-state, .saved-empty-state, .direct-empty-state");

        if (canFastAppend) {
          const appendedFast = appendRenderableItemsToMessageList(
            buildRenderableMessageItems([{
              ...finalMessage,
              animateOnRender: options.animateMessage !== false
            }]),
            {
              replaceMessageId: options.replaceMessageId || ""
            }
          );

          if (appendedFast) {
            // Fast append renders from a cloned message object; persist "consumed"
            // animation state in snapshot to avoid second animation on later rerenders.
            currentMessagesSnapshot = currentMessagesSnapshot.map((entry) => (
              String(entry?.id || "") === finalMessageId
                ? { ...entry, animateOnRender: false }
                : entry
            ));
            if (nextDialog?.publicId) {
              setDialogPayloadCache(nextDialog.publicId, {
                dialog: nextDialog,
                messages: currentMessagesSnapshot
              });
            }
            if (shouldStickToBottom) {
              scrollMessagesToBottom(options.scrollBehavior || "auto");
            } else {
              syncChatScrollBottomButton();
            }
            return;
          }
        }

        // Duplicate realtime deliveries can land here with an already-rendered node.
        // Avoid forcing a full rerender to prevent visible double flicker.
        if (hadMessageBefore && !options.replaceMessageId) {
          if (shouldStickToBottom) {
            scrollMessagesToBottom(options.scrollBehavior || "auto");
          } else {
            syncChatScrollBottomButton();
          }
          return;
        }

        renderMessages(nextDialog, currentMessagesSnapshot, {
          scrollBehavior: shouldStickToBottom ? (options.scrollBehavior || "auto") : "none",
          animateList: false,
          forceScrollBottom: shouldStickToBottom
        });
      };

      const showToast = (message, type = "info") => {
        if (!message) {
          return;
        }

        const toast = document.createElement("div");
        toast.className = "toast " + type;
        toast.textContent = message;
        toastStack.appendChild(toast);

        window.setTimeout(() => {
          toast.style.opacity = "0";
          toast.style.transform = "translateY(8px)";
          window.setTimeout(() => toast.remove(), 180);
        }, 3400);
      };

      const rerenderDialogsIfVisible = () => {
        if (!currentSearchQuery.trim()) {
          renderDialogs(allDialogs);
        }
      };

      const formatLastSeen = (value) => {
        if (!value) {
          return "recently online";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "recently online";
        }

        const now = new Date();
        const sameDay = now.toDateString() === date.toDateString();
        const timeLabel = date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit"
        });

        if (sameDay) {
          return "last seen at " + timeLabel;
        }

        const dateLabel = date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit"
        });

        return "last seen " + dateLabel + " at " + timeLabel;
      };

      const syncVisibleDialogsRealtimeState = () => {
        if (currentSearchQuery.trim()) {
          return;
        }

        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          const dialogId = button.getAttribute("data-dialog-id");
          const dialog = allDialogs.find((entry) => entry.id === dialogId);

          if (!dialog) {
            return;
          }

          const avatarPresence = button.querySelector(".dialog-avatar-presence");

          if (avatarPresence) {
            avatarPresence.classList.toggle("online", isDirectDialogOnline(dialog));
          }

          const previewNode = button.querySelector(".dialog-preview-copy");

          if (previewNode) {
            const nextTypingPreview = getTypingPreview(dialog);
            const hasTypingNode = Boolean(previewNode.querySelector(".typing-preview"));

            if (nextTypingPreview) {
              if (!hasTypingNode) {
                previewNode.innerHTML = renderTypingPreviewHtml(nextTypingPreview);
              }
            } else if (hasTypingNode) {
              previewNode.innerHTML = renderDialogPreviewHtml(dialog);
            } else {
              previewNode.innerHTML = renderDialogPreviewHtml(dialog);
            }
          }
        });
      };

      const applyPresenceStateToDialogs = ({ userId, isOnline, lastSeenAt }) => {
        if (!userId) {
          return;
        }

        allDialogs = allDialogs.map((dialog) => {
          if (dialog.type !== "direct" || dialog.peerUserId !== userId) {
            return dialog;
          }

          return {
            ...dialog,
            peerLastSeenAt: lastSeenAt || dialog.peerLastSeenAt || null
          };
        });

        if (currentDialogSnapshot?.type === "direct" && currentDialogSnapshot.peerUserId === userId) {
          currentDialogSnapshot = {
            ...currentDialogSnapshot,
            peerLastSeenAt: lastSeenAt || currentDialogSnapshot.peerLastSeenAt || null
          };
        }

        if (isOnline) {
          onlineUserIds.add(userId);
        } else {
          onlineUserIds.delete(userId);
        }
      };

      const clearTypingIndicators = () => {
        for (const timeoutId of typingTimers.values()) {
          window.clearTimeout(timeoutId);
        }

        typingTimers.clear();
        typingUsersByDialog.clear();
      };

      const getTypingUsersForDialog = (dialogId) => Array.from(typingUsersByDialog.get(dialogId) || []);

      const updateTypingState = (dialogId, userId, isTyping) => {
        if (!dialogId || !userId || userId === currentUserId) {
          return;
        }

        const timerKey = dialogId + ":" + userId;
        const currentSet = new Set(typingUsersByDialog.get(dialogId) || []);

        if (isTyping) {
          currentSet.add(userId);
          typingUsersByDialog.set(dialogId, currentSet);

          const previousTimer = typingTimers.get(timerKey);

          if (previousTimer) {
            window.clearTimeout(previousTimer);
          }

          typingTimers.set(
            timerKey,
            window.setTimeout(() => {
              updateTypingState(dialogId, userId, false);
            }, 2600)
          );
        } else {
          currentSet.delete(userId);




          if (currentSet.size > 0) {
            typingUsersByDialog.set(dialogId, currentSet);
          } else {
            typingUsersByDialog.delete(dialogId);
          }

          const previousTimer = typingTimers.get(timerKey);

          if (previousTimer) {
            window.clearTimeout(previousTimer);
            typingTimers.delete(timerKey);
          }
        }

        syncVisibleDialogsRealtimeState();
        refreshCurrentDialogChrome();
      };

      const sendTypingState = (isTyping) => {
        if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN || !currentDialogId) {
          return;
        }

        realtimeSocket.send(JSON.stringify({
          type: "typing",
          dialogId: currentDialogId,
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
        if (activeCall) {
          void stopAndReleaseCallMedia();
        }
        if (backgroundRefreshTimer) {
          window.clearInterval(backgroundRefreshTimer);
          backgroundRefreshTimer = null;
        }
        backgroundRefreshInFlight = false;
        clearCallTimers();
        activeCall = null;
        currentDialogId = "";
        currentDialogPublicId = "";
        pendingAutoBottomDialogPublicId = "";
        pendingAutoBottomCanceled = false;
        currentUserId = "";
        currentUserUsername = "";
        currentUserEmail = "";
        currentUserDisplayName = "";
        currentUserAvatarLetter = "";
        currentUserAvatarUrl = "";
        allDialogs = [];
        dialogPayloadCache.clear();
        prefetchedMediaUrls.clear();
        currentDialogSnapshot = null;
        currentMessagesSnapshot = [];
        releaseLocalMessageMediaUrls();
        localOutgoingMessages = [];
        currentSearchQuery = "";
        currentSearchResults = [];
        peerActiveInCurrentDialog = false;
        currentPeerReadAt = null;
        onlineUserIds.clear();
        clearTypingIndicators();
        clearPendingImageAttachment();
        clearPendingReplyMessage();
        closeMessageContextMenu();
        closeDeleteMessageModal();
        closeViewerModal();
        sidebarSearch.value = "";
        desktopNotificationIds.clear();
        recentMessageNotificationTimes.clear();
        chatScrollBottom.classList.remove("visible");
        if (chatScrollDayHideTimer) {
          window.clearTimeout(chatScrollDayHideTimer);
          chatScrollDayHideTimer = null;
        }
        hideScrollDayIndicator();
        chatScrollDayLastLabel = "";
        isNearChatBottom = true;
        closeChatSearch();
        workspaceUserName.textContent = "Guest";
        persistLegacySessionToken("");
      };

      const handleUnauthorizedSession = (
        message = "Session ended. Please sign in again.",
        toastType = "error",
        statusType = toastType === "success" ? "success" : "error"
      ) => {
        disableRealtime();
        resetWorkspaceState();
        closeDialog({ skipHistory: true });
        switchView(false);
        applyRoute("");
        pageRoot.classList.remove("booting");
        setStatus(message, statusType);
        showToast(message, toastType);

        // Reset inputs and error states
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const verificationCodeInput = document.getElementById("verification-code");
        const submitButton = document.getElementById("submit-button");
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
        if (typeof resendTimer !== "undefined" && resendTimer) {
          window.clearInterval(resendTimer);
          resendTimer = null;
        }
        if (typeof pendingAuthPayload !== "undefined") pendingAuthPayload = null;
        if (typeof pendingAuthMode !== "undefined") pendingAuthMode = null;
        if (typeof pendingAuthEmail !== "undefined") pendingAuthEmail = null;
        if (typeof resendAttemptsLeft !== "undefined") resendAttemptsLeft = 3;

        // Reset verification UI to standard login form
        const loginInner = document.getElementById("auth-login-inner");
        const verificationInner = document.getElementById("auth-verification-inner");
        const metaRow = document.querySelector(".meta-row");
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
        if (typeof animateModeChange === "function") {
          mode = "login";
          animateModeChange("login");
        }
      };

      const getDialogTypeLabel = (type) => dialogTypeLabels[type] || String(type || "chat");

      const getDialogSectionTitle = (type) => dialogTypeTitles[type] || getDialogTypeLabel(type);

      const getDialogTypeRank = (type) => {
        const rank = dialogTypeOrder.indexOf(type);
        return rank === -1 ? dialogTypeOrder.length : rank;
      };

      const getDialogAvatarMarkup = (dialog, options = {}) => {
        const showPresence = options.showPresence !== false;
        const showSecretBadge = options.showSecretBadge !== false;
        const isSecretDirect = Boolean(
          (dialog?.type === "secret" || dialog?.type === "direct" || dialog?.type === "private")
          && dialog?.encryptionMode === "e2e_v1"
        );
        const secretBadgeTitle = "Secret chat. End-to-end encrypted.";
        const secretBadgeMarkup = (showSecretBadge && isSecretDirect)
          ? '<span class="dialog-avatar-secret" title="' + escapeHtml(secretBadgeTitle) + '" aria-label="' + escapeHtml(secretBadgeTitle) + '"><span class="material-symbols-rounded">lock</span></span>'
          : "";

        if (dialog.type === "direct" || dialog.type === "group") {
          if (dialog.avatarUrl) {
            return '<div class="dialog-avatar ' + (dialog.type === "direct" ? "user-avatar" : "group-avatar") + '">' +
              '<img class="generated-avatar-photo" src="' + escapeHtml(String(dialog.avatarUrl)) + '" alt="' + escapeHtml((dialog.title || "?").slice(0, 1)) + '" />' +
              (showPresence && dialog.type === "direct"
                ? '<span class="dialog-avatar-presence' + (isDirectDialogOnline(dialog) ? ' online' : '') + '" aria-hidden="true"></span>'
                : "") +
              secretBadgeMarkup +
            '</div>';
          }
          const avatar = getAvatarMeta(
            dialog.type === "direct" ? (dialog.peerUserId || dialog.publicId) : dialog.id,
            dialog.title || dialog.subtitle || "?"
          );
          return '<div class="dialog-avatar ' + (dialog.type === "direct" ? "user-avatar" : "group-avatar") + '" style="' + avatar.style + '">' +
            '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />' +
            (showPresence && dialog.type === "direct"
              ? '<span class="dialog-avatar-presence' + (isDirectDialogOnline(dialog) ? ' online' : '') + '" aria-hidden="true"></span>'
              : "") +
            secretBadgeMarkup +
          '</div>';
        }

        const icon = dialogTypeIcons[dialog.type] || savedIcon;
        return '<div class="dialog-avatar">' + icon + '</div>';
      };

      const isDirectDialogOnline = (dialog) => {
        if (!(dialog?.type === "direct" && dialog.peerUserId)) {
          return false;
        }

        // If this direct dialog is currently open, trust dialog-level realtime
        // presence too (it updates faster than global user presence snapshots).
        if (currentDialogId && dialog.id === currentDialogId && peerActiveInCurrentDialog) {
          return true;
        }

        return onlineUserIds.has(dialog.peerUserId);
      };
      const GROUP_NOTIFICATION_PREFS_STORAGE_KEY = "thegrapht_group_notification_prefs";
      const getGroupNotificationPrefs = () => {
        try {
          const raw = localStorage.getItem(GROUP_NOTIFICATION_PREFS_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : {};
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
          return {};
        }
      };
      const isGroupNotificationsEnabled = (publicId) => {
        if (!publicId) {
          return false;
        }
        const prefs = getGroupNotificationPrefs();
        return Boolean(prefs[String(publicId)] === true);
      };
      const setGroupNotificationsEnabled = (publicId, enabled) => {
        if (!publicId) {
          return;
        }
        try {
          const prefs = getGroupNotificationPrefs();
          prefs[String(publicId)] = Boolean(enabled);
          localStorage.setItem(GROUP_NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(prefs));
        } catch {}
      };
      const syncGroupNotificationsToggle = () => {
        const toggle = document.getElementById("chat-profile-notifications-btn");
        if (!toggle) {
          return;
        }
        const isGroup = currentDialogSnapshot?.type === "group";
        const enabled = isGroup ? isGroupNotificationsEnabled(currentDialogSnapshot?.publicId) : false;
        toggle.classList.toggle("is-on", enabled);
        toggle.setAttribute("aria-checked", enabled ? "true" : "false");
      };
      const getGroupMembers = (dialog) => {
        if (!dialog || dialog.type !== "group" || !Array.isArray(dialog.groupMembers)) {
          return [];
        }
        return dialog.groupMembers
          .filter((member) => member && member.userId)
          .map((member) => ({
            userId: String(member.userId),
            name: String(member.name || member.username || "User"),
            username: member.username ? String(member.username) : "",
            role: String(member.role || "member"),
            lastSeenAt: member.lastSeenAt || null
          }));
      };
      const getGroupOnlineCount = (dialog) => {
        const members = getGroupMembers(dialog);
        const memberIds = new Set(members.map((member) => member.userId));
        let onlineCount = 0;
        for (const memberId of memberIds) {
          if (memberId === currentUserId || onlineUserIds.has(memberId)) {
            onlineCount += 1;
          }
        }
        return onlineCount;
      };

      const getTypingPreview = (dialog) => {
        const typingUsers = getTypingUsersForDialog(dialog?.id);

        if (!typingUsers.length) {
          return "";
        }

        return dialog?.type === "direct" ? "typing..." : "someone is typing...";
      };

      const formatDialogSubtitle = (dialog) => {
        if (!dialog) {
          return "";
        }

        const typingPreview = getTypingPreview(dialog);

        if (typingPreview) {
          return typingPreview;
        }

        if (dialog.type === "saved") {
          return dialog.subtitle || getDialogSectionTitle(dialog.type);
        }

        if (dialog.type === "direct") {
          if (dialog.encryptionMode === "e2e_v1") {
            return "Secret chat • End-to-end encrypted";
          }

          if (isDirectDialogOnline(dialog)) {
            return "online";
          }

          return "Cloud chat • " + formatLastSeen(dialog.peerLastSeenAt);
        }

        if (dialog.type === "group") {
          const participants = Number(dialog.participants) || 0;
          const parts = ["Group"];
          if (participants > 0) {
            parts.push(participants + (participants === 1 ? " member" : " members"));
          }
          const onlineCount = getGroupOnlineCount(dialog);
          if (onlineCount > 0) {
            parts.push(onlineCount + " online");
          }
          return parts.join(" • ");
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
          parts.push(dialog.participants + " members");
        }
        return parts.join(" • ");
      };

      const getDialogUsername = (dialog) => {
        if (!dialog) {
          return "";
        }

        if (dialog.type === "saved") {
          return String(currentUserUsername || "").replace(/^@+/, "");
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

      const getChatProfileDetails = (dialog) => {
        if (!dialog) {
          return null;
        }

        if (dialog.type !== "direct" && dialog.type !== "saved" && dialog.type !== "group") {
          return null;
        }

        const username = dialog.type === "group" ? dialog.publicId : getDialogUsername(dialog);
        const isSaved = dialog.type === "saved";
        const isGroup = dialog.type === "group";
        const isSecretDialog = Boolean(
          (dialog?.type === "secret" || dialog?.type === "direct" || dialog?.type === "private")
          && dialog?.encryptionMode === "e2e_v1"
        );
        const name = isSaved
          ? (currentUserDisplayName || currentUserUsername || dialog.title || "You")
          : (dialog.title || "Profile");
        const status = isSaved
          ? "Your profile"
          : (
            isSecretDialog
              ? "Secret chat • End-to-end encrypted"
              : (
                dialog?.type === "direct"
                  ? (isDirectDialogOnline(dialog) ? "online" : formatLastSeen(dialog?.peerLastSeenAt))
                  : formatDialogSubtitle(dialog)
              )
          );
        const avatar = getAvatarMeta(
          isSaved ? (currentUserId || "saved-self") : (isGroup ? dialog.id : (dialog.peerUserId || dialog.publicId || dialog.id || name)),
          name
        );
        const usernameLabel = isGroup ? ("@" + username) : (username ? "@" + username : "username is not set yet");
        const encodeSecretRouteToken = (value) => {
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
        const originUrl = window.location.origin;
        const profileUrl = isGroup
          ? (originUrl + "/g/" + dialog.publicId)
          : (
            isSecretDialog
              ? (username
                ? (originUrl + "/@" + encodeURIComponent(username) + "/sc?s=" + encodeURIComponent(encodeSecretRouteToken(dialog.publicId || "")))
                : originUrl)
              : (username ? (originUrl + "/@" + encodeURIComponent(username)) : originUrl)
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
        if (!chatHeaderAvatar) {
          return;
        }

        if (!currentDialogSnapshot) {
          chatHeaderAvatar.innerHTML = "";
          return;
        }

        chatHeaderAvatar.innerHTML = getDialogAvatarMarkup(currentDialogSnapshot, {
          showPresence: currentDialogSnapshot.type === "direct"
        });
      };

      const syncChatProfilePanel = () => {
        if (!chatProfilePanel) {
          return;
        }

        const details = getChatProfileDetails(currentDialogSnapshot);
        if (!details) {
          chatWindow?.classList.remove("profile-panel-open");
          chatProfilePanel.classList.remove("open");
          chatProfilePanel.setAttribute("aria-hidden", "true");
          return;
        }

        chatProfileAvatar.innerHTML = getDialogAvatarMarkup(currentDialogSnapshot, {
          showPresence: currentDialogSnapshot.type === "direct"
        });
        chatProfileName.textContent = details.name;
        chatProfileStatus.textContent = details.status || "profile";
        
        const notificationsCard = document.getElementById("chat-profile-notifications-card");
        const secretCard = document.getElementById("chat-profile-secret-card");
        
        if (currentDialogSnapshot?.type === "group") {
          if (notificationsCard) notificationsCard.style.display = "flex";
        } else {
          if (notificationsCard) notificationsCard.style.display = "none";
        }
        if (secretCard) {
          secretCard.style.display = "none";
        }
        const linkLabel = document.getElementById("chat-profile-link-label");
        const linkCard = chatProfileLink?.closest(".chat-profile-card");
        if (linkLabel) {
          linkLabel.textContent = currentDialogSnapshot?.type === "group" ? "Group link" : "Profile link";
        }
        if (linkCard) {
          linkCard.style.display = details.isSecretDialog ? "none" : "block";
        }
        syncGroupNotificationsToggle();

        const membersSection = document.getElementById("chat-profile-members-section");
        const membersList = document.getElementById("chat-profile-members-list");
        
        if (currentDialogSnapshot?.type === "group") {
          if (membersSection) membersSection.style.display = "block";
          if (membersList) {
            const members = getGroupMembers(currentDialogSnapshot);
            membersList.innerHTML = members.map((member) => {
              const role = member.role === "owner" ? "owner" : (member.role === "admin" ? "admin" : "member");
              const memberUserId = String(member.userId || "").trim();
              const isSelfMember = memberUserId && memberUserId === String(currentUserId || "").trim();
              const statusText = isSelfMember || onlineUserIds.has(memberUserId)
                ? "online"
                : formatLastSeen(member.lastSeenAt);
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
        }

        if (!details.isSecretDialog) {
          const visibleProfileUrl = details.profileUrl.startsWith("https://")
            ? details.profileUrl.slice(8)
            : (details.profileUrl.startsWith("http://") ? details.profileUrl.slice(7) : details.profileUrl);
          chatProfileLink.textContent = visibleProfileUrl;
          chatProfileLink.href = details.profileUrl;
        }
      };

      const refreshCurrentDialogChrome = () => {
        if (!currentDialogSnapshot) {
          syncChatHeaderMeta();
          syncChatIslandActions();
          syncActiveCallChip();
          syncChatProfilePanel();
          return;
        }

        chatTitle.textContent = currentDialogSnapshot.title || "";
        chatSubtitle.textContent = formatDialogSubtitle(currentDialogSnapshot);
        syncChatHeaderMeta();
        syncChatProfilePanel();
        syncChatIslandActions();
        syncActiveCallChip();
        if (typeof syncGroupCallBanner === "function") {
          syncGroupCallBanner();
        }

        if (chatSearchPanel.classList.contains("open")) {
          renderChatSearchResults();
        }
      };

      const closeGroupMemberContextMenu = () => {
        if (groupMemberContextMenuCloseTimer) {
          window.clearTimeout(groupMemberContextMenuCloseTimer);
          groupMemberContextMenuCloseTimer = null;
        }
        groupMemberContextMenu?.classList.remove("open");
        groupMemberContextMenu?.setAttribute("aria-hidden", "true");
        groupMemberContextMenuState = null;
      };

      const closeGroupMemberContextMenuSoon = () => {
        if (groupMemberContextMenuCloseTimer) {
          window.clearTimeout(groupMemberContextMenuCloseTimer);
        }
        groupMemberContextMenuCloseTimer = window.setTimeout(() => {
          closeGroupMemberContextMenu();
        }, 120);
      };

      const closeProfileLinkContextMenu = () => {
        if (profileLinkContextMenuCloseTimer) {
          window.clearTimeout(profileLinkContextMenuCloseTimer);
          profileLinkContextMenuCloseTimer = null;
        }
        profileLinkContextMenu?.classList.remove("open");
        profileLinkContextMenu?.setAttribute("aria-hidden", "true");
        profileLinkContextMenuState = null;
      };

      const closeProfileLinkContextMenuSoon = () => {
        if (profileLinkContextMenuCloseTimer) {
          window.clearTimeout(profileLinkContextMenuCloseTimer);
        }
        profileLinkContextMenuCloseTimer = window.setTimeout(() => {
          closeProfileLinkContextMenu();
        }, 120);
      };

      const openProfileLinkContextMenu = (event, profileUrl) => {
        if (!profileLinkContextMenu || !profileLinkContextMenuBody || !profileUrl) {
          return;
        }

        profileLinkContextMenuBody.innerHTML =
          '<button class="dialog-context-menu-item" type="button" data-action="copy-username-link">' +
            '<span class="material-symbols-rounded" aria-hidden="true">content_copy</span>' +
            '<span>Copy Username</span>' +
          '</button>';
        profileLinkContextMenuState = { profileUrl: String(profileUrl) };

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
            const urlToCopy = String(profileLinkContextMenuState?.profileUrl || "").trim();
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

      const openDirectDialogForUser = async (targetUserId, options = {}) => {
        const userId = String(targetUserId || "").trim();
        if (!userId) {
          return;
        }

        const openProfile = Boolean(options.openProfile);

        if (userId === currentUserId) {
          const savedDialog = allDialogs.find((dialog) => dialog.type === "saved");
          if (savedDialog?.publicId) {
            await loadDialog(savedDialog.publicId);
            if (openProfile) {
              openChatProfilePanel();
            }
          }
          return;
        }

        const existingDirectDialog = allDialogs.find((dialog) => (
          ["direct", "private"].includes(dialog?.type)
          && String(dialog?.peerUserId || "").trim() === userId
        ));
        if (existingDirectDialog?.publicId) {
          await loadDialog(existingDirectDialog.publicId, { forceReload: false });
          if (openProfile) {
            openChatProfilePanel();
          }
          return;
        }

        try {
          const payload = await createPreferredDirectDialog(userId);
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.messages || []);
          if (!preparedPayload.dialog?.publicId) {
            return;
          }

          setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
          const upsertedDialog = updateDialogInState(preparedPayload.dialog, {
            lastMessagePreview: preparedPayload.dialog.lastMessagePreview || null,
            lastMessageSenderName: preparedPayload.dialog.lastMessageSenderName || null,
            lastMessageCreatedAt: preparedPayload.dialog.lastMessageCreatedAt || new Date().toISOString()
          });
          if (!upsertedDialog) {
            allDialogs.unshift(preparedPayload.dialog);
          }
          if (!currentSearchQuery.trim()) {
            renderDialogs(allDialogs);
          }

          await loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
          if (openProfile) {
            openChatProfilePanel();
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to open direct chat.", "error");
        }
      };


      const openGroupMemberContextMenu = (event, memberUserId) => {
        if (!groupMemberContextMenu || !groupMemberContextMenuBody) {
          return;
        }

        const userId = String(memberUserId || "").trim();
        if (!userId) {
          return;
        }

        groupMemberContextMenuBody.innerHTML =
          '<button class="dialog-context-menu-item" type="button" data-action="send-message">' +
            '<span class="material-symbols-rounded" aria-hidden="true">chat</span>' +
            '<span>Send Message</span>' +
          '</button>';
        groupMemberContextMenuState = { userId };

        const menuWidth = 244;
        const menuHeight = 72;
        const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
        const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
        groupMemberContextMenu.style.left = left + "px";
        groupMemberContextMenu.style.top = top + "px";
        groupMemberContextMenu.classList.add("open");
        groupMemberContextMenu.setAttribute("aria-hidden", "false");

        groupMemberContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
          button.addEventListener("click", () => {
            closeGroupMemberContextMenuSoon();
            void openDirectDialogForUser(userId, { openProfile: true });
          });
        });
      };

      const openChatProfilePanel = () => {
        if (!currentDialogSnapshot || !chatProfilePanel) {
          return;
        }

        syncChatProfilePanel();
        chatWindow?.classList.add("profile-panel-open");
        chatProfilePanel.classList.add("open");
        chatProfilePanel.setAttribute("aria-hidden", "false");
      };

      const closeChatProfilePanel = () => {
        if (!chatProfilePanel) {
          return;
        }

        chatWindow?.classList.remove("profile-panel-open");
        chatProfilePanel.classList.remove("open");
        chatProfilePanel.setAttribute("aria-hidden", "true");
      };

      const handleViewerWheelZoom = (event) => {
        if (!viewerModal.classList.contains("open") || !event.ctrlKey) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        setViewerZoom(viewerZoom + (event.deltaY < 0 ? 0.14 : -0.14));
      };

      const disableRealtime = () => {
        realtimeEnabled = false;

        if (realtimeReconnectTimer) {
          window.clearTimeout(realtimeReconnectTimer);
          realtimeReconnectTimer = null;
        }

        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
          typingStopTimer = null;
        }
        if (realtimeHeartbeatTimer) {
          window.clearInterval(realtimeHeartbeatTimer);
          realtimeHeartbeatTimer = null;
        }
        if (realtimeWatchdogTimer) {
          window.clearInterval(realtimeWatchdogTimer);
          realtimeWatchdogTimer = null;
        }
        if (realtimeDialogResyncTimer) {
          window.clearInterval(realtimeDialogResyncTimer);
          realtimeDialogResyncTimer = null;
        }

        onlineUserIds.clear();
        clearTypingIndicators();

        if (realtimeSocket && realtimeSocket.readyState !== WebSocket.CLOSED) {
          realtimeSocket.close();
        }




        realtimeSocket = null;
        realtimeLastActivityAt = 0;
        rerenderDialogsIfVisible();
        refreshCurrentDialogChrome();
      };

      const wsInfo = (event, details = {}) => {
        try {
          console.info("[TheGraphT WS]", event, details);
        } catch {}
      };

      const wsWarn = (event, details = {}) => {
        try {
          console.warn("[TheGraphT WS]", event, details);
        } catch {}
      };

      const touchRealtimeActivity = () => {
        realtimeLastActivityAt = Date.now();
      };

      let realtimeDialogResyncTimer = null;
      let realtimeDialogResyncInFlight = false;
      let realtimeDialogResyncLastAt = 0;
      let realtimeDialogResyncLastDialogId = "";
      let chatScrollDayHideTimer = null;
      let chatScrollDayLastLabel = "";

      const reconcileCurrentDialogMessages = async (reason = "unspecified", options = {}) => {
        const force = Boolean(options.force);
        if (!currentDialogPublicId || !currentDialogSnapshot) {
          return;
        }
        if (realtimeDialogResyncInFlight) {
          return;
        }

        const nowTs = Date.now();
        if (!force && realtimeDialogResyncLastDialogId === currentDialogPublicId && (nowTs - realtimeDialogResyncLastAt) < 1800) {
          return;
        }

        realtimeDialogResyncInFlight = true;
        realtimeDialogResyncLastAt = nowTs;
        realtimeDialogResyncLastDialogId = currentDialogPublicId;

        try {
          const scrollTopBefore = messageList?.scrollTop || 0;
          const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages");
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.messages || []);
          if (!preparedPayload?.dialog || preparedPayload.dialog.publicId !== currentDialogPublicId) {
            return;
          }

          const serverMessages = (Array.isArray(preparedPayload.messages) ? preparedPayload.messages : [])
            .filter((message) => !isMessageDeletedLocally(message?.id));
          const currentMessages = (Array.isArray(currentMessagesSnapshot) ? currentMessagesSnapshot : [])
            .filter((message) => !isMessageDeletedLocally(message?.id));
          const serverIds = new Set(serverMessages.map((message) => String(message?.id || "")));
          const currentIds = new Set(currentMessages.map((message) => String(message?.id || "")));
          const missingInCurrent = serverMessages.filter((message) => !currentIds.has(String(message?.id || ""))).length;
          const localPendingInCurrent = currentMessages.filter((message) => String(message?.id || "").startsWith("local_")).length;

          // Reliability-first merge:
          // - keep all currently visible messages (prevents "message disappeared then reappeared")
          // - overlay with canonical server versions by id
          // - include local pending drafts until matched/replaced
          const mergedMap = new Map();
          currentMessages.forEach((message) => {
            const id = String(message?.id || "");
            if (!id) {
              return;
            }
            mergedMap.set(id, message);
          });
          serverMessages.forEach((message) => {
            const id = String(message?.id || "");
            if (!id) {
              return;
            }
            const prev = mergedMap.get(id);
            mergedMap.set(id, prev ? { ...prev, ...message } : message);
          });

          const mergedMessages = Array.from(mergedMap.values()).sort((a, b) => {
            const aTs = getMessageEpochSeconds(a) * 1000;
            const bTs = getMessageEpochSeconds(b) * 1000;
            if (aTs !== bTs) {
              return aTs - bTs;
            }
            return String(a?.id || "").localeCompare(String(b?.id || ""));
          });

          const signaturesDiffer = (
            mergedMessages.map((message) => String(message?.id || "")).join("|")
            !== currentMessages.map((message) => String(message?.id || "")).join("|")
          );

          wsInfo("dialog_resync_checked", {
            reason,
            dialogPublicId: currentDialogPublicId,
            currentCount: currentMessages.length,
            serverCount: serverMessages.length,
            missingInCurrent,
            localPendingInCurrent,
            mergedCount: mergedMessages.length,
            signaturesDiffer
          });

          if (!signaturesDiffer && missingInCurrent === 0) {
            return;
          }

          const mergedPayload = {
            dialog: preparedPayload.dialog,
            messages: mergedMessages
          };
          setDialogPayloadCache(currentDialogPublicId, mergedPayload);
          const shouldStickBottom = (messageList.scrollHeight - (messageList.scrollTop + messageList.clientHeight)) < 56;
          renderMessages(preparedPayload.dialog, mergedMessages, {
            scrollBehavior: "none",
            openingDialog: false,
            animateList: false,
            forceScrollBottom: shouldStickBottom,
            restoreScrollTop: shouldStickBottom ? null : scrollTopBefore
          });
          wsWarn("dialog_resync_applied", {
            reason,
            dialogPublicId: currentDialogPublicId,
            missingInCurrent,
            localPendingInCurrent,
            serverCount: serverMessages.length,
            mergedCount: mergedMessages.length
          });
        } catch (error) {
          wsWarn("dialog_resync_failed", {
            reason,
            error: error instanceof Error ? error.message : String(error)
          });
        } finally {
          realtimeDialogResyncInFlight = false;
        }
      };

      const startRealtimeHealthChecks = () => {
        if (realtimeHeartbeatTimer) {
          window.clearInterval(realtimeHeartbeatTimer);
          realtimeHeartbeatTimer = null;
        }
        if (realtimeWatchdogTimer) {
          window.clearInterval(realtimeWatchdogTimer);
          realtimeWatchdogTimer = null;
        }

        touchRealtimeActivity();

        realtimeHeartbeatTimer = window.setInterval(() => {
          if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
            return;
          }

          try {
            realtimeSocket.send(JSON.stringify({
              type: "ping",
              ts: Date.now()
            }));
            wsInfo("ping_sent", {
              ts: Date.now()
            });
          } catch {}
        }, REALTIME_HEARTBEAT_INTERVAL_MS);

        realtimeWatchdogTimer = window.setInterval(() => {
          if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
            return;
          }

          const staleForMs = Date.now() - (realtimeLastActivityAt || 0);
          if (staleForMs <= REALTIME_STALE_TIMEOUT_MS) {
            return;
          }

          wsWarn("stale_socket_detected_forcing_reconnect", {
            staleForMs
          });
          try {
            realtimeSocket.close();
          } catch {}
        }, REALTIME_WATCHDOG_INTERVAL_MS);

        if (realtimeDialogResyncTimer) {
          window.clearInterval(realtimeDialogResyncTimer);
          realtimeDialogResyncTimer = null;
        }
        // Periodic resync is disabled to avoid double-loading, wasteful HTTP polling,
        // and layout-reflow scroll jumps in dialogues, groups, and everywhere.
        /*
        realtimeDialogResyncTimer = window.setInterval(() => {
          if (!currentDialogPublicId || !currentDialogSnapshot || document.visibilityState === "hidden") {
            return;
          }
          void reconcileCurrentDialogMessages("periodic");
        }, 4000);
        */
      };

      const sendCurrentPresence = () => {
        if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
          return;
        }

        wsInfo("presence_send", {
          dialogId: currentDialogId || null
        });
        realtimeSocket.send(JSON.stringify({
          type: "presence",
          dialogId: currentDialogId || null
        }));
      };




      const getMessageStatusMarkup = (message, isOutgoing) => {
        if (!isOutgoing) {
          return "";
        }

        if (message.localStatus === "pending") {
          return '<span class="message-state" aria-label="Pending">' + pendingClockIcon + '</span>';
        }

        if (message.localStatus === "failed") {
          return '<span class="message-state" aria-label="Failed">!</span>';
        }

        const supportsPeerReadReceipts = Boolean(
          currentDialogSnapshot?.peerUserId
          && ["direct", "private", "secret"].includes(currentDialogSnapshot?.type)
        );

        if (supportsPeerReadReceipts) {
          const messageTimestamp = new Date(message.createdAt).getTime();
          const peerReadTimestamp = currentPeerReadAt ? new Date(currentPeerReadAt).getTime() : 0;
          const isReadByPeer = Number.isFinite(peerReadTimestamp) && peerReadTimestamp > 0 && messageTimestamp <= peerReadTimestamp;
          return isReadByPeer
            ? '<span class="message-checks message-checks-double">' + doubleChecksIcon + '</span>'
            : '<span class="message-checks message-checks-single">' + singleCheckIcon + '</span>';
        }

        if (currentDialogSnapshot?.type === "group") {
          const messageTimestamp = new Date(message.createdAt).getTime();
          const groupReadTimestamp = currentPeerReadAt ? new Date(currentPeerReadAt).getTime() : 0;
          const isReadByAnyMember = Number.isFinite(groupReadTimestamp) && groupReadTimestamp > 0 && messageTimestamp <= groupReadTimestamp;
          return isReadByAnyMember
            ? '<span class="message-checks message-checks-double">' + doubleChecksIcon + '</span>'
            : '<span class="message-checks message-checks-single">' + singleCheckIcon + '</span>';
        }

        return '<span class="message-checks message-checks-double">' + doubleChecksIcon + '</span>';
      };

      const mediaUrlToBlobUrlCache = new Map();
      const registerMediaBlobUrl = (mediaUrl, blobUrl) => {
        if (!mediaUrl || !blobUrl) return;
        mediaUrlToBlobUrlCache.set(mediaUrl, blobUrl);
        if (mediaUrlToBlobUrlCache.size > 100) {
          const firstKey = mediaUrlToBlobUrlCache.keys().next().value;
          const firstVal = mediaUrlToBlobUrlCache.get(firstKey);
          if (firstVal && firstVal.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(firstVal);
            } catch {}
          }
          mediaUrlToBlobUrlCache.delete(firstKey);
        }
      };
      window.registerMediaBlobUrl = registerMediaBlobUrl;
      window.mediaUrlToBlobUrlCache = mediaUrlToBlobUrlCache;

      const resolvePublicMediaUrl = (rawUrl) => {
        var value = String(rawUrl || "").trim();
        if (!value) {
          return "";
        }
        if (typeof mediaUrlToBlobUrlCache !== "undefined" && mediaUrlToBlobUrlCache.has(value)) {
          return mediaUrlToBlobUrlCache.get(value);
        }
        if (value.startsWith("blob:") || value.startsWith("data:")) {
          return value;
        }
        if (value.startsWith("/v/")) {
          value = "https://cdn.thegrapht.su" + value;
        } else if (/^https?:\/\/web\.thegrapht\.su\/v\//i.test(value)) {
          value = value.replace(/^https?:\/\/web\.thegrapht\.su/i, "https://cdn.thegrapht.su");
        }
        if (typeof legacySessionToken !== "undefined" && legacySessionToken) {
          value = value + (value.indexOf("?") >= 0 ? "&" : "?") + "token=" + encodeURIComponent(legacySessionToken);
        }
        return value;
      };

      const resolveWebMediaUrlFallback = (rawUrl) => {
        var value = String(rawUrl || "").trim();
        if (!value) {
          return "";
        }
        if (value.startsWith("blob:") || value.startsWith("data:")) {
          return value;
        }
        var cleanUrl = value.split("?")[0];
        if (cleanUrl.startsWith("/v/")) {
          value = "https://web.thegrapht.su" + cleanUrl;
        } else if (/^https?:\/\/cdn\.thegrapht\.su\/v\//i.test(cleanUrl)) {
          value = cleanUrl.replace(/^https?:\/\/cdn\.thegrapht\.su/i, "https://web.thegrapht.su");
        } else {
          value = cleanUrl;
        }
        if (typeof legacySessionToken !== "undefined" && legacySessionToken) {
          value = value + (value.indexOf("?") >= 0 ? "&" : "?") + "token=" + encodeURIComponent(legacySessionToken);
        }
        return value;
      };

      const renderImageLinkHtml = (message, caption, senderName, extraClass = "") => {
        const publicMediaUrl = resolvePublicMediaUrl(message.mediaUrl);
        const fallbackMediaUrl = resolveWebMediaUrlFallback(message.mediaUrl);
        const isPending = message.localStatus === "pending";

        let spinnerMarkup = "";
        if (isPending) {
          spinnerMarkup =
            '<div class="m3-spinner-container">' +
              '<svg class="m3-spinner" viewBox="0 0 48 48">' +
                '<circle class="m3-spinner-track" cx="24" cy="24" r="18" fill="none" stroke-width="4"></circle>' +
                '<circle class="m3-spinner-active" cx="24" cy="24" r="18" fill="none" stroke-width="4" stroke-dasharray="113" stroke-dashoffset="56"></circle>' +
              '</svg>' +
            '</div>';
        }

        const shellClass = "message-image-shell" + (isPending ? " is-pending" : "");
        const imageClass = "message-image" + (isPending ? " message-image-pending" : "");

        return '<button class="message-image-link' + extraClass + '" type="button" data-image-url="' + escapeHtml(publicMediaUrl) + '" data-image-fallback-url="' + escapeHtml(fallbackMediaUrl) + '" data-sender-name="' + escapeHtml(senderName) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-created-at="' + escapeHtml(message.createdAt || "") + '">' +
          '<span class="' + shellClass + '"' + getImageShellStyle(message) + '>' +
            '<img class="' + imageClass + '" src="' + escapeHtml(publicMediaUrl) + '" data-fallback-src="' + escapeHtml(fallbackMediaUrl) + '" alt="' + escapeHtml(caption || "Photo") + '" loading="lazy" decoding="async" fetchpriority="low" />' +
            spinnerMarkup +
          '</span>' +
        '</button>';
      };

      const getAudioDisplayName = (message) => {
        const fromAttachment = String(message?.attachmentName || "").trim();
        if (fromAttachment) {
          return fromAttachment;
        }
        const fromBody = String(message?.body || "").trim();
        if (fromBody) {
          return fromBody;
        }
        return "Audio";
      };

      const formatAudioMetaLabel = (seconds, sizeBytes, options = {}) => {
        const durationLabel = formatDuration(Number(seconds) || 0);
        const sizeLabel = formatBytes(Number(sizeBytes) || 0);
        const currentTimeLabel = String(options.currentTimeLabel || "").trim();

        if (currentTimeLabel && sizeLabel) {
          return currentTimeLabel + " • " + sizeLabel;
        }
        if (currentTimeLabel) {
          return currentTimeLabel;
        }
        if (durationLabel && sizeLabel) {
          return durationLabel + " • " + sizeLabel;
        }
        if (durationLabel) {
          return durationLabel;
        }
        if (sizeLabel) {
          return sizeLabel;
        }
        return "Audio";
      };

      const renderAudioMessageHtml = (message) => {
        const publicMediaUrl = resolvePublicMediaUrl(message.mediaUrl);
        const fallbackMediaUrl = resolveWebMediaUrlFallback(message.mediaUrl);
        const displayName = getAudioDisplayName(message);
        const durationSeconds = Number(message?.attachmentDurationSeconds) || 0;
        const sizeBytes = Number(message?.attachmentSize) || 0;
        const metaLabel = formatAudioMetaLabel(durationSeconds, sizeBytes);
        const caption = String(message?.body || "").trim();

        const isActiveTrack = (
          activeAudioElement instanceof HTMLAudioElement
          && !activeAudioElement.paused
          && String(activeAudioMessageId || "") === String(message.id || "")
        );
        const toggleIcon = isActiveTrack ? "pause" : "play_arrow";
        return renderReplyPreviewHtml(message) + '<div class="message-audio-wrap">' +
          '<div class="tg-audio-message message-audio-card' + (isActiveTrack ? " is-playing" : "") + '" data-audio-card data-message-id="' + escapeHtml(message.id) + '" data-audio-duration="' + escapeHtml(String(durationSeconds)) + '" data-audio-size="' + escapeHtml(String(sizeBytes)) + '" title="' + escapeHtml(displayName) + '">' +
            '<button class="tg-audio-play message-audio-toggle" type="button" data-audio-toggle aria-label="Play audio">' +
              '<span class="tg-audio-icon material-symbols-rounded message-audio-toggle-icon" aria-hidden="true">' + toggleIcon + '</span>' +
            '</button>' +
            '<div class="tg-audio-content message-audio-main">' +
              '<div class="tg-audio-title message-audio-name" title="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</div>' +
              '<div class="tg-audio-meta-row">' +
                '<span class="tg-audio-time message-audio-meta-line" data-audio-meta title="' + escapeHtml(displayName) + '">' + escapeHtml(metaLabel) + '</span>' +
                '<div class="tg-audio-seek">' +
                  '<div class="tg-audio-seek-track"></div>' +
                  '<div class="tg-audio-seek-fill"></div>' +
                  '<div class="tg-audio-seek-thumb"></div>' +
                  '<input class="tg-audio-seek-input" type="range" min="0" max="' + escapeHtml(String(Math.max(1, durationSeconds || 1))) + '" step="0.01" value="0" data-audio-progress aria-label="Audio position" title="' + escapeHtml(displayName) + '" />' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<audio class="message-audio-element" preload="metadata" src="' + escapeHtml(publicMediaUrl) + '" data-fallback-src="' + escapeHtml(fallbackMediaUrl) + '"></audio>' +
          '</div>' +
          (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
        '</div>';
      };

      const renderMessageBodyHtml = (message) => {
        const callMarker = parseCallSummaryMessage(message);
        if (
          currentDialogSnapshot?.type === "group"
          && callMarker
          && (callMarker.kind === "started_video" || callMarker.kind === "ended_video")
        ) {
          const actorName = String(message?.senderName || "Someone").trim() || "Someone";
          const durationLabel = (() => {
            const safe = Math.max(0, Math.floor(Number(callMarker.durationSeconds) || 0));
            if (safe < 60) {
              return safe + " seconds";
            }
            const m = Math.floor(safe / 60);
            const s = safe % 60;
            if (m < 60) {
              return m + " min " + s + " sec";
            }
            const h = Math.floor(m / 60);
            const mm = m % 60;
            return h + " h " + mm + " min";
          })();
          const line = callMarker.kind === "started_video"
            ? (actorName + " started a video chat")
            : (actorName + " ended the video chat (" + durationLabel + ")");
          return '<div class="message-group-video-event">' + escapeHtml(line) + '</div>';
        }

        const callSummary = getCallSummaryPresentation(message);

        if (callSummary) {
          return '<div class="message-call-card ' + callSummary.tone + '">' +
            '<span class="material-symbols-rounded message-call-icon" aria-hidden="true">' + escapeHtml(callSummary.icon) + '</span>' +
            '<div class="message-call-copy">' +
              '<div class="message-call-title">' + escapeHtml(callSummary.title) + '</div>' +
              '<div class="message-call-subtitle">' + escapeHtml(callSummary.subtitle) + '</div>' +
            '</div>' +
          '</div>';
        }

        if (message?.type === "image" && message.mediaUrl) {
          const caption = String(message.body || "").trim();
          const senderName = String(message.senderName || (message.senderId === currentUserId ? workspaceUserName.textContent : "TheGraphT"));
          return renderReplyPreviewHtml(message) + '<div class="message-visual">' +
            renderImageLinkHtml(message, caption, senderName) +
            (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
          '</div>';
        }

        if (message?.type === "audio" && message.mediaUrl) {
          return renderAudioMessageHtml(message);
        }

        return renderReplyPreviewHtml(message) + '<div class="message-body">' + linkifyMessageBody(message.body) + '</div>';
      };

      const renderDaySeparator = (value) => {
        const dayTs = startOfDayTs(value);
        const label = formatDaySeparatorLabel(value);
        if (!dayTs || !label) {
          return "";
        }
        return '<div class="message-day-separator" data-day-ts="' + escapeHtml(String(dayTs)) + '"><span>' + escapeHtml(label) + '</span></div>';
      };
      const getMessageEpochSeconds = (message) => {
        if (!message || typeof message !== "object") {
          return 0;
        }
        const tsMs = toEpochMs(message.createdAt || 0);
        if (!Number.isFinite(tsMs) || tsMs <= 0) {
          const rawDate = String(message.date || "").trim();
          if (!rawDate) {
            return 0;
          }
          const isNumericEpoch = /^d{10,}$/.test(rawDate);
          const hasCalendarDate = /d{4}-d{2}-d{2}/.test(rawDate) || /d{1,2}[./-]d{1,2}[./-]d{2,4}/.test(rawDate);
          if (!isNumericEpoch && !hasCalendarDate) {
            return 0;
          }
          const dateMs = toEpochMs(rawDate);
          if (!Number.isFinite(dateMs) || dateMs <= 0) {
            return 0;
          }
          return Math.floor(dateMs / 1000);
        }
        return Math.floor(tsMs / 1000);
      };
      const isNewDay = (prevMsg, nextMsg) => {
        const prevSec = getMessageEpochSeconds(prevMsg);
        const nextSec = getMessageEpochSeconds(nextMsg);
        if (!prevSec || !nextSec) {
          return true;
        }
        return new Date(prevSec * 1000).toDateString() !== new Date(nextSec * 1000).toDateString();
      };
      const debugDaySeparators = (stage, payload = {}) => {
        try {
          const isDirect = currentDialogSnapshot?.type === "direct" || currentDialogSnapshot?.type === "private";
          if (!isDirect) {
            return;
          }
          console.log("[TG_DAY_DEBUG]", stage, {
            dialogPublicId: currentDialogSnapshot?.publicId || null,
            dialogType: currentDialogSnapshot?.type || null,
            ...payload
          });
        } catch {}
      };
      const sortMessagesChronologically = (messages) => {
        if (!Array.isArray(messages) || messages.length <= 1) {
          return Array.isArray(messages) ? messages.slice() : [];
        }

        return messages.slice().sort((left, right) => {
          const leftTs = getMessageEpochSeconds(left);
          const rightTs = getMessageEpochSeconds(right);
          if (leftTs !== rightTs) {
            return leftTs - rightTs;
          }

          return String(left?.id || "").localeCompare(String(right?.id || ""));
        });
      };
      const getMessageDayValue = (message) => {
        const messageEpochSeconds = getMessageEpochSeconds(message);
        if (messageEpochSeconds > 0) {
          return messageEpochSeconds * 1000;
        }
        return message?.createdAt || Date.now();
      };
      const isSameDay = (leftValue, rightValue) => {
        const leftDate = new Date(leftValue || 0);
        const rightDate = new Date(rightValue || 0);
        if (!Number.isFinite(leftDate.getTime()) || !Number.isFinite(rightDate.getTime())) {
          return false;
        }
        return leftDate.toDateString() === rightDate.toDateString();
      };
      const normalizeMessageDaySeparators = () => {
        if (!messageList) {
          return;
        }

        const nodes = Array.from(messageList.children);
        const seenDayTs = new Set();
        let activeSeparator = null;
        let activeSeparatorHasMessage = false;

        const isRenderableMessageNode = (node) => (
          node instanceof HTMLElement
          && (
            node.classList.contains("message")
            || node.classList.contains("message-system-row")
            || node.classList.contains("group-incoming-row")
          )
        );

        nodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          if (node.classList.contains("message-day-separator")) {
            if (activeSeparator && !activeSeparatorHasMessage) {
              activeSeparator.remove();
            }

            const dayTs = String(node.dataset.dayTs || "");
            if (!dayTs || seenDayTs.has(dayTs)) {
              node.remove();
              activeSeparator = null;
              activeSeparatorHasMessage = false;
              return;
            }

            seenDayTs.add(dayTs);
            activeSeparator = node;
            activeSeparatorHasMessage = false;
            return;
          }

          if (activeSeparator && isRenderableMessageNode(node)) {
            activeSeparatorHasMessage = true;
          }
        });

        if (activeSeparator && !activeSeparatorHasMessage) {
          activeSeparator.remove();
        }

        const messageById = new Map();
        currentMessagesSnapshot.forEach((entry) => {
          const id = String(entry?.id || "");
          if (id) {
            messageById.set(id, entry);
          }
        });
        getLocalMessagesForDialog(currentDialogPublicId).forEach((entry) => {
          const id = String(entry?.id || "");
          if (id && !messageById.has(id)) {
            messageById.set(id, entry);
          }
        });

        const createSeparatorNode = (dayValue) => {
          const separatorContainer = document.createElement("div");
          separatorContainer.innerHTML = renderDaySeparator(dayValue);
          return separatorContainer.firstElementChild instanceof HTMLElement
            ? separatorContainer.firstElementChild
            : null;
        };

        let lastRenderableDayTs = "";
        Array.from(messageList.children).forEach((node) => {
          if (!isRenderableMessageNode(node)) {
            return;
          }

          const messageId = String(node.getAttribute("data-message-id") || "");
          const linkedMessage = messageId ? messageById.get(messageId) : null;
          const dayValue = linkedMessage ? getMessageDayValue(linkedMessage) : null;
          const dayTs = dayValue ? String(startOfDayTs(dayValue) || "") : "";
          if (!dayTs) {
            return;
          }

          const shouldStartNewDayBlock = dayTs !== lastRenderableDayTs;
          if (shouldStartNewDayBlock) {
            const previous = node.previousElementSibling;
            const hasProperSeparator = (
              previous instanceof HTMLElement
              && previous.classList.contains("message-day-separator")
              && String(previous.getAttribute("data-day-ts") || "") === dayTs
            );

            if (!hasProperSeparator) {
              const separatorNode = createSeparatorNode(dayValue);
              if (separatorNode) {
                messageList.insertBefore(separatorNode, node);
              }
            }
          }

          lastRenderableDayTs = dayTs;
        });
      };

      const hideScrollDayIndicator = () => {};
      const updateScrollDayIndicator = () => {};

      const buildRenderableMessageItems = (messages) => {
        const items = [];
        let previousRenderableMessage = null;
        const orderedMessages = sortMessagesChronologically(messages);
        const dayBuckets = [];
        const seenDayBuckets = new Set();

        debugDaySeparators("build_start", {
          inputCount: Array.isArray(messages) ? messages.length : 0,
          orderedCount: orderedMessages.length,
          sample: orderedMessages.slice(0, 5).map((msg) => ({
            id: msg?.id || null,
            date: msg?.date ?? null,
            createdAt: msg?.createdAt || null,
            epochSec: getMessageEpochSeconds(msg)
          }))
        });

        for (let index = 0; index < orderedMessages.length; index += 1) {
          const message = orderedMessages[index];
          if (!message || isMessageDeletedLocally(String(message.id || ""))) {
            continue;
          }
          if (!previousRenderableMessage || isNewDay(previousRenderableMessage, message)) {
            const dayBucketTs = startOfDayTs(getMessageDayValue(message));
            if (dayBucketTs && !seenDayBuckets.has(dayBucketTs)) {
              seenDayBuckets.add(dayBucketTs);
              dayBuckets.push(new Date(dayBucketTs).toISOString().slice(0, 10));
            }
            items.push({
              kind: "day",
              dayValue: getMessageDayValue(message)
            });
          }

          if (message?.type === "image" && message.albumId) {
            const albumMessages = [message];
            let cursor = index + 1;

            while (cursor < orderedMessages.length) {
              const candidate = orderedMessages[cursor];

              if (
                candidate?.type === "image"
                && candidate.albumId === message.albumId
                && candidate.senderId === message.senderId
              ) {
                albumMessages.push(candidate);
                cursor += 1;
                continue;
              }

              break;
            }

            // Split albums into chunks of 5
            for (let i = 0; i < albumMessages.length; i += 5) {
              items.push({
                kind: "album",
                messages: albumMessages.slice(i, i + 5)
              });
            }

            index = cursor - 1;
            previousRenderableMessage = albumMessages[albumMessages.length - 1] || message;
            continue;
          }

          items.push({
            kind: "message",
            messages: [message]
          });
          previousRenderableMessage = message;
        }

        debugDaySeparators("build_done", {
          itemCount: items.length,
          dayItemCount: items.filter((item) => item?.kind === "day").length,
          dayBuckets
        });

        return items;
      };

      const GROUP_SENDER_NAME_COLORS = [
        "#d49b84",
        "#85b6e2",
        "#8fc7a0",
        "#cfb07a",
        "#b6a2db",
        "#cf9fba",
        "#7fbdb8",
        "#9cb6dc",
        "#d4ae8e",
        "#8fb7d6",
        "#9bc3a6",
        "#c4a0d4"
      ];

      const getStableSenderColor = (senderId, senderName = "") => {
        const seed = String(senderId || senderName || "sender");
        let hash = 0;
        for (let i = 0; i < seed.length; i += 1) {
          hash = ((hash << 5) - hash) + seed.charCodeAt(i);
          hash |= 0;
        }
        const index = Math.abs(hash) % GROUP_SENDER_NAME_COLORS.length;
        return GROUP_SENDER_NAME_COLORS[index];
      };

      const getRenderableItemTailMessage = (item) => {
        if (!item || !Array.isArray(item.messages) || !item.messages.length) {
          return null;
        }
        return item.messages[item.messages.length - 1] || null;
      };

      const annotateGroupIncomingSequences = (items) => {
        if (!Array.isArray(items) || !items.length) {
          return items;
        }

        const isGroupDialog = currentDialogSnapshot?.type === "group";
        if (!isGroupDialog) {
          return items;
        }

        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          if (!item || (item.kind !== "message" && item.kind !== "album")) {
            continue;
          }

          const tailMessage = getRenderableItemTailMessage(item);
          const isOutgoing = tailMessage?.senderId === currentUserId || Boolean(tailMessage?.localStatus);
          const senderId = String(tailMessage?.senderId || "");
          if (!tailMessage || isOutgoing || !senderId) {
            item.groupIncomingMeta = null;
            continue;
          }

          item.groupIncomingMeta = {
            showName: true,
            showAvatar: true
          };
        }

        try {
          const incomingWithMeta = items.filter((item) => Boolean(item?.groupIncomingMeta)).length;
          console.log("[TheGraphT UI DEBUG] annotateGroupIncomingSequences", {
            ts: Date.now(),
            dialogPublicId: currentDialogSnapshot?.publicId || null,
            dialogType: currentDialogSnapshot?.type || null,
            totalItems: items.length,
            incomingWithMeta
          });
        } catch {}
        return items;
      };

      const renderGroupIncomingMessageShell = (message, contentHtml, meta = null) => {
        const senderName = String(message?.senderName || "Member").trim() || "Member";
        const senderId = String(message?.senderId || "");
        const avatar = getAvatarMeta(senderId || senderName, senderName);
        const senderColor = getStableSenderColor(senderId, senderName);
        const showAvatar = Boolean(meta?.showAvatar);
        const showName = Boolean(meta?.showName);
        const rowClass = showAvatar ? "group-incoming-row has-avatar" : "group-incoming-row no-avatar";
        const avatarClass = "group-incoming-avatar visible";

        return '<div class="' + rowClass + '">' +
          (showAvatar
            ? '<div class="' + avatarClass + '" style="' + avatar.style + '">' +
                '<div class="group-incoming-avatar-hit" data-sender-id="' + escapeHtml(senderId) + '" role="button" tabindex="0" aria-label="Open direct chat">' +
                '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + escapeHtml(avatar.letter || "?") + '" />' +
                '</div>' +
              '</div>'
            : ''
          ) +
          '<div class="group-incoming-main">' +
            (showName ? '<div class="group-incoming-sender" style="color:' + escapeHtml(senderColor) + '">' + escapeHtml(senderName) + '</div>' : '') +
            contentHtml +
          '</div>' +
        '</div>';
      };

      const renderAlbumMessage = (albumMessages, options = {}) => {
        const leadMessage = albumMessages[0];
        const tailMessage = albumMessages[albumMessages.length - 1];
        const isOutgoing = tailMessage.senderId === currentUserId || tailMessage.localStatus;
        const date = new Date(tailMessage.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const localStatusClass = tailMessage.localStatus ? ' message-status-' + tailMessage.localStatus : "";
        const shouldLaunch = Boolean(tailMessage.animateOnRender);
        if (shouldLaunch) {
          tailMessage.animateOnRender = false;
        }
        const launchClass = shouldLaunch ? " message-launch" : "";
        const senderName = String(leadMessage.senderName || (leadMessage.senderId === currentUserId ? workspaceUserName.textContent : "TheGraphT"));
        const caption = String(leadMessage.body || "").trim();

        const articleHtml = '<article class="message' + (isOutgoing ? "" : " incoming") + localStatusClass + launchClass + '" data-message-id="' + escapeHtml(tailMessage.id) + '" data-sender-id="' + escapeHtml(tailMessage.senderId || "") + '" data-message-type="' + escapeHtml(tailMessage.type || "text") + '" data-attachment-name="' + escapeHtml(tailMessage.attachmentName || "") + '" data-media-url="' + escapeHtml(tailMessage.mediaUrl || "") + '">' +
          renderReplyPreviewHtml(leadMessage) +
          '<div class="message-visual">' +
            '<div class="message-album count-' + albumMessages.length + '">' +
              albumMessages.map((message) => {
                const tileCaption = String(message.body || "").trim() || caption;
                return '<div class="message-album-item" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' + renderImageLinkHtml(message, tileCaption, senderName) + '</div>';
              }).join("") +
            '</div>' +
            (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
          '</div>' +
          '<div class="message-meta"><span>' + date + '</span>' + getMessageStatusMarkup(tailMessage, isOutgoing) + '</div>' +
        '</article>';

        if (!isOutgoing && currentDialogSnapshot?.type === "group") {
          return renderGroupIncomingMessageShell(tailMessage, articleHtml, options.groupIncomingMeta);
        }
        return articleHtml;
      };

      const renderSingleMessage = (message, options = {}) => {
        const callMarker = parseCallSummaryMessage(message);
        if (
          currentDialogSnapshot?.type === "group"
          && callMarker
          && (callMarker.kind === "started_video" || callMarker.kind === "ended_video")
        ) {
          const groupName = String(currentDialogSnapshot?.title || "Group").trim() || "Group";
          const plural = (count, one, many) => (count === 1 ? one : many);
          const durationLabel = (() => {
            const safe = Math.max(0, Math.floor(Number(callMarker.durationSeconds) || 0));
            if (safe < 60) {
              return safe + " " + plural(safe, "second", "seconds");
            }
            const m = Math.floor(safe / 60);
            const s = safe % 60;
            if (m < 60) {
              return m + " " + plural(m, "minute", "minutes") + ", " + s + " " + plural(s, "second", "seconds");
            }
            const h = Math.floor(m / 60);
            const mm = m % 60;
            return h + " " + plural(h, "hour", "hours") + ", " + mm + " " + plural(mm, "minute", "minutes");
          })();
          const line = callMarker.kind === "started_video"
            ? (groupName + " started a video chat")
            : (groupName + " ended the video chat (" + durationLabel + ")");
          const shouldLaunch = Boolean(message.animateOnRender);
          if (shouldLaunch) {
            message.animateOnRender = false;
          }
          return '<div class="message-system-row' + (shouldLaunch ? " message-launch" : "") + '" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' +
            '<div class="message-system-pill">' + escapeHtml(line) + '</div>' +
          '</div>';
        }

        const isOutgoing = message.senderId === currentUserId || message.localStatus;
        const date = new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const localStatusClass = message.localStatus ? ' message-status-' + message.localStatus : "";
        const shouldLaunch = Boolean(message.animateOnRender);
        if (shouldLaunch) {
          message.animateOnRender = false;
        }
        const launchClass = shouldLaunch ? " message-launch" : "";
        const mediaClass = ((message.type === "image" && !message.albumId) || message.type === "audio") ? " message-media" : "";
        const articleHtml = '<article class="message' + mediaClass + (isOutgoing ? "" : " incoming") + localStatusClass + launchClass + '" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' +
          renderMessageBodyHtml(message) +
          '<div class="message-meta"><span>' + date + '</span>' + getMessageStatusMarkup(message, isOutgoing) + '</div>' +
        '</article>';
        if (!isOutgoing && currentDialogSnapshot?.type === "group") {
          return renderGroupIncomingMessageShell(message, articleHtml, options.groupIncomingMeta);
        }
        return articleHtml;
      };

      function appendRenderableItemsToMessageList(items, options = {}) {
        if (!Array.isArray(items) || !items.length) {
          return false;
        }

        const normalizedItems = annotateGroupIncomingSequences(items);
        const html = normalizedItems.map((item) => (
          item.kind === "day"
            ? renderDaySeparator(item.dayValue)
            : item.kind === "album"
              ? renderAlbumMessage(item.messages, { groupIncomingMeta: item.groupIncomingMeta })
              : renderSingleMessage(item.messages[0], { groupIncomingMeta: item.groupIncomingMeta })
        )).join("");

        if (!html) {
          return false;
        }

        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = html;
        const nodes = Array.from(tempContainer.children);
        if (!nodes.length) {
          return false;
        }

        let hadReplacement = false;
        if (options.replaceMessageId) {
          const selector = '[data-message-id="' + CSS.escape(String(options.replaceMessageId)) + '"]';
          const previousNode = messageList.querySelector(selector);
          hadReplacement = Boolean(previousNode);
          if (previousNode && nodes.length > 0) {
            const primaryNewNode = nodes.shift();
            previousNode.replaceWith(primaryNewNode);
          } else {
            previousNode?.remove();
          }
        }

        const dedupedNodes = nodes.filter((node) => {
          const messageId = node.getAttribute("data-message-id");
          if (!messageId) {
            return true;
          }
          const selector = '[data-message-id="' + CSS.escape(String(messageId)) + '"]';
          return !messageList.querySelector(selector);
        });

        if (!dedupedNodes.length) {
          if (hadReplacement) {
            renderMessages(currentDialogSnapshot, currentMessagesSnapshot, {
              scrollBehavior: "none",
              animateList: false,
              restoreScrollTop: messageList?.scrollTop || 0
            });
          }
          return hadReplacement;
        }

        const firstIncomingDayNode = dedupedNodes.find((node) => (
          node instanceof HTMLElement && node.classList.contains("message-day-separator")
        ));
        const existingDayNodes = messageList.querySelectorAll(".message-day-separator[data-day-ts]");
        const lastExistingDayNode = existingDayNodes.length ? existingDayNodes[existingDayNodes.length - 1] : null;
        if (firstIncomingDayNode && lastExistingDayNode instanceof HTMLElement) {
          const incomingTs = String(firstIncomingDayNode.getAttribute("data-day-ts") || "");
          const existingTs = String(lastExistingDayNode.getAttribute("data-day-ts") || "");
          if (incomingTs && existingTs && incomingTs === existingTs) {
            firstIncomingDayNode.remove();
          }
        }

        const fragment = document.createDocumentFragment();
        dedupedNodes.filter(Boolean).forEach((node) => fragment.appendChild(node));
        messageList.appendChild(fragment);
        normalizeMessageDaySeparators();
        hydrateMessageImages({ lockToken: 0 });
        return true;
      }

      function appendLocalOutgoingMessageToCurrentDialog(localMessage, options = {}) {
        if (!currentDialogSnapshot || !localMessage || localMessage.dialogPublicId !== currentDialogSnapshot.publicId) {
          return false;
        }

        const emptyStateVisible = Boolean(
          messageList.querySelector(".empty-chat-state, .saved-empty-state, .direct-empty-state")
        );

        if (emptyStateVisible) {
          renderMessages(currentDialogSnapshot, currentMessagesSnapshot, {
            scrollBehavior: options.scrollBehavior || "auto",
            animateList: false,
            forceScrollBottom: Boolean(options.forceScrollBottom)
          });
          return true;
        }

        const appended = appendRenderableItemsToMessageList(buildRenderableMessageItems([localMessage]));
        if (!appended) {
          return false;
        }

        const applyComposerLaunchMotion = () => {
          const messageId = String(localMessage?.id || "");
          if (!messageId) {
            return;
          }
          const bubble = messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');
          if (!(bubble instanceof HTMLElement) || !bubble.classList.contains("message")) {
            return;
          }
          bubble.classList.add("sending");
          requestAnimationFrame(() => {
            bubble.classList.add("shown");
          });
        };

        requestAnimationFrame(applyComposerLaunchMotion);

        if (options.forceScrollBottom) {
          scrollMessagesToBottom(options.scrollBehavior || "auto");
        } else {
          syncChatScrollBottomButton();
        }

        return true;
      }

      function updateRenderedMessageStatus(messageId, status) {
        if (!messageId) {
          return;
        }

        const selector = '[data-message-id="' + CSS.escape(String(messageId)) + '"]';
        const node = messageList.querySelector(selector);
        if (!node) {
          return;
        }

        node.classList.remove("message-status-pending", "message-status-failed");
        if (status) {
          node.classList.add("message-status-" + status);
        }
      }

      const rerenderCurrentDialog = (options = {}) => {
        if (!currentDialogSnapshot) {
          return;
        }

        renderMessages(currentDialogSnapshot, currentMessagesSnapshot, options);
      };

      const refreshOutgoingReadReceiptsInPlace = () => {
        if (!currentDialogSnapshot || !currentDialogPublicId) {
          return;
        }

        const messagesById = new Map();
        currentMessagesSnapshot.forEach((message) => {
          if (message?.id) {
            messagesById.set(String(message.id), message);
          }
        });
        getLocalMessagesForDialog(currentDialogPublicId).forEach((message) => {
          if (message?.id) {
            messagesById.set(String(message.id), message);
          }
        });

        messageList.querySelectorAll(".message[data-message-id]").forEach((node) => {
          if (!(node instanceof HTMLElement) || node.classList.contains("incoming")) {
            return;
          }
          const messageId = node.getAttribute("data-message-id");
          if (!messageId) {
            return;
          }
          const message = messagesById.get(messageId);
          if (!message) {
            return;
          }

          const metaNode = node.querySelector(".message-meta");
          if (!(metaNode instanceof HTMLElement)) {
            return;
          }

          const nextStatusMarkup = getMessageStatusMarkup(message, true);
          const statusNode = metaNode.querySelector(".message-checks, .message-state");
          if (statusNode instanceof HTMLElement) {
            statusNode.outerHTML = nextStatusMarkup;
            return;
          }
          if (nextStatusMarkup) {
            metaNode.insertAdjacentHTML("beforeend", nextStatusMarkup);
          }
        });
      };




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
        ".composer .material-symbols-rounded",
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
          chatAudioTopSpeed.textContent = (Number(audioElement.playbackRate || 1)).toFixed(1).replace(/.0$/, "") + "X";
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
          chatAudioTopSpeed.textContent = String(nextRate).replace(/.0$/, "") + "X";
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




      messageList.addEventListener("click", (event) => {
        const groupAvatarHit = event.target instanceof Element ? event.target.closest(".group-incoming-avatar-hit[data-sender-id]") : null;
        if (groupAvatarHit) {
          const senderId = String(groupAvatarHit.getAttribute("data-sender-id") || "").trim();
          if (senderId) {
            void openDirectDialogForUser(senderId, { openProfile: true });
          }
          return;
        }

        const imageLink = event.target instanceof Element ? event.target.closest(".message-image-link") : null;

        if (!imageLink) {
          return;
        }

        event.preventDefault();
        const imageNode = imageLink.querySelector(".message-image");
        const imageRect = imageNode?.getBoundingClientRect();
        openViewerModal({
          src: imageLink.getAttribute("data-image-url") || "",
          fallbackSrc: imageLink.getAttribute("data-image-fallback-url") || "",
          senderName: imageLink.getAttribute("data-sender-name") || "TheGraphT",
          senderId: imageLink.getAttribute("data-sender-id") || "",
          createdAt: imageLink.getAttribute("data-created-at") || "",
          sourceRect: imageRect
            ? {
                left: imageRect.left + imageRect.width / 2,
                top: imageRect.top + imageRect.height / 2,
                width: imageRect.width,
                height: imageRect.height
              }
            : null
        });
      });

      messageList.addEventListener("dragstart", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }
        if (target.closest(".message-image, .message-image-link, .message-album-item")) {
          event.preventDefault();
        }
      });

      messageList.addEventListener("auxclick", (event) => {
        const imageLink = event.target instanceof Element ? event.target.closest(".message-image-link") : null;
        if (!imageLink) {
          return;
        }
        event.preventDefault();
      });

      viewerModalClose.addEventListener("click", () => {
        closeViewerModal();
      });

      viewerModal.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;

        if (!target) {
          return;
        }

        if (
          !target.closest(".viewer-modal-image")
          && !target.closest(".viewer-modal-header")
          && !target.closest(".viewer-zoom-chip")
        ) {
          closeViewerModal();
        }
      });

      viewerModal.addEventListener("wheel", handleViewerWheelZoom, { passive: false });
      viewerModalStage.addEventListener("wheel", handleViewerWheelZoom, { passive: false });
      viewerModalImage.addEventListener("wheel", handleViewerWheelZoom, { passive: false });

      viewerZoomOut.addEventListener("click", () => {
        if (!viewerModal.classList.contains("open")) {
          return;
        }
        setViewerZoom(viewerZoom - 0.15);
      });

      viewerZoomIn.addEventListener("click", () => {
        if (!viewerModal.classList.contains("open")) {
          return;
        }
        setViewerZoom(viewerZoom + 0.15);
      });




      let isLoadingOlderMessages = false;
      const hasMoreOlderMessages = {};
      const paginationBoundary = {};

      const loadOlderMessages = async () => {
        if (isLoadingOlderMessages || !currentDialogPublicId) return;
        if (hasMoreOlderMessages[currentDialogPublicId] === false) return;

        const messages = currentMessagesSnapshot || [];
        if (messages.length === 0) return;

        const boundary = paginationBoundary[currentDialogPublicId];
        let beforeDate, beforeId;
        
        if (boundary) {
          beforeDate = boundary.date;
          beforeId = boundary.id;
        } else {
          const oldestMessage = messages[0];
          beforeDate = oldestMessage.createdAt;
          beforeId = oldestMessage.id;
        }

        isLoadingOlderMessages = true;

        const loaderDiv = document.createElement("div");
        loaderDiv.className = "chat-spinner-container top-spinner";
        loaderDiv.innerHTML = '<div class="boot-splash-inner"><svg class="boot-splash-circular" viewBox="22 22 44 44" aria-hidden="true" focusable="false"><circle class="boot-splash-circular-indicator" cx="44" cy="44" r="20.2"></circle></svg></div>';
        
        messageList.prepend(loaderDiv);

        try {
          const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages?beforeDate=" + encodeURIComponent(beforeDate) + "&beforeId=" + encodeURIComponent(beforeId));
          
          // Record scroll metrics AFTER fetch but BEFORE DOM changes!
          const previousScrollHeight = messageList.scrollHeight;

          loaderDiv.remove();

          if (payload.messages && payload.messages.length > 0) {
            const oldestOfBatch = payload.messages[0];
            paginationBoundary[currentDialogPublicId] = {
              date: oldestOfBatch.createdAt,
              id: oldestOfBatch.id
            };
          }

          const existingIds = new Set(messages.map((message) => String(message?.id || "")));
          const uniqueNewMessages = (payload.messages || []).filter((message) => !existingIds.has(String(message?.id || "")));

          if (uniqueNewMessages.length === 0) {
            if (!payload.messages || payload.messages.length === 0) {
              hasMoreOlderMessages[currentDialogPublicId] = false;
            }
            
            // Adjust scroll for loader removal using CURRENT scrollTop!
            const newScrollHeight = messageList.scrollHeight;
            messageList.scrollTop = messageList.scrollTop + (newScrollHeight - previousScrollHeight);
            
            isLoadingOlderMessages = false;
            return;
          }

          currentMessagesSnapshot = uniqueNewMessages.concat(messages);

          const items = annotateGroupIncomingSequences(buildRenderableMessageItems(uniqueNewMessages));
          const html = items.map((item) => (
            item.kind === "day"
              ? renderDaySeparator(item.dayValue)
              : item.kind === "album"
                ? renderAlbumMessage(item.messages, { groupIncomingMeta: item.groupIncomingMeta })
                : renderSingleMessage(item.messages[0], { groupIncomingMeta: item.groupIncomingMeta })
          )).join("");

          messageList.insertAdjacentHTML('afterbegin', html);
          
          if (typeof normalizeMessageDaySeparators === "function") {
            normalizeMessageDaySeparators();
          }

          const newScrollHeight = messageList.scrollHeight;
          messageList.scrollTop = messageList.scrollTop + (newScrollHeight - previousScrollHeight);

          isLoadingOlderMessages = false;

        } catch (error) {
          console.error("Failed to load older messages", error);
          if (loaderDiv.parentNode) {
            loaderDiv.remove();
          }
          isLoadingOlderMessages = false;
        }
      };

      messageList.addEventListener("scroll", () => {
        rememberCurrentDialogScrollTop();
        syncChatScrollBottomButton();
        updateScrollDayIndicator();

        if (computeIsNearChatBottom()) {
          const unreadDivider = messageList.querySelector(".message-unread-divider");
          if (unreadDivider && !unreadDivider.dataset.dismissing) {
            unreadDivider.dataset.dismissing = "true";
            unreadDivider.style.opacity = "0";
            unreadDivider.style.height = "0";
            unreadDivider.style.margin = "0";
            unreadDivider.style.padding = "0";
            unreadDivider.style.border = "none";
            window.setTimeout(() => {
              unreadDivider.remove();
            }, 300);
          }
        }
        
        // Only load more if we are near top AND there is actually content to scroll!
        if (messageList.scrollTop < 50 && messageList.scrollHeight > messageList.clientHeight) {
          void loadOlderMessages();
        }
      }, { passive: true });

      messageList.addEventListener("wheel", () => {
        if (!suppressBottomLockCancel) {
          markManualScrollIntent();
        }
      }, { passive: true });

      messageList.addEventListener("touchstart", () => {
        if (!suppressBottomLockCancel) {
          markManualScrollIntent();
        }
      }, { passive: true });

      messageList.addEventListener("pointerdown", () => {
        if (!suppressBottomLockCancel) {
          markManualScrollIntent();
        }
      }, { passive: true });

      messageList.addEventListener("keydown", (event) => {
        const target = event.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
        if (scrollKeys.includes(event.key) && !suppressBottomLockCancel) {
          markManualScrollIntent();
        }
      }, { passive: true });

      chatScrollBottom.addEventListener("click", () => {
        scrollMessagesToBottom("smooth");
        requestAnimationFrame(() => {
          rememberCurrentDialogScrollTop();
          syncChatScrollBottomButton();
        });
      });




      chatSearchToggle.addEventListener("click", () => {
        if (!currentDialogSnapshot) {
          return;
        }

        if (chatSearchPanel.classList.contains("open")) {
          closeChatSearch();
          return;
        }

        setChatSearchPanelOpen(true);
        renderChatSearchResults();
      });

      chatIslandCopy?.addEventListener("click", () => {
        if (!currentDialogSnapshot) {
          return;
        }

        if (chatProfilePanel.classList.contains("open")) {
          closeChatProfilePanel();
          return;
        }

        openChatProfilePanel();
      });

      chatIslandCopy?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        chatIslandCopy.click();
      });

      chatProfileClose?.addEventListener("click", () => {
        closeChatProfilePanel();
      });

      groupMemberContextMenu?.addEventListener("mouseenter", () => {
        if (groupMemberContextMenuCloseTimer) {
          window.clearTimeout(groupMemberContextMenuCloseTimer);
          groupMemberContextMenuCloseTimer = null;
        }
      });

      groupMemberContextMenu?.addEventListener("mouseleave", () => {
        closeGroupMemberContextMenuSoon();
      });
      profileLinkContextMenu?.addEventListener("mouseenter", () => {
        if (profileLinkContextMenuCloseTimer) {
          window.clearTimeout(profileLinkContextMenuCloseTimer);
          profileLinkContextMenuCloseTimer = null;
        }
      });
      profileLinkContextMenu?.addEventListener("mouseleave", () => {
        closeProfileLinkContextMenuSoon();
      });

      document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }
        if (event.button === 2) {
          return;
        }
        if (!target.closest("#group-member-context-menu")) {
          closeGroupMemberContextMenu();
        }
        if (!target.closest("#profile-link-context-menu")) {
          closeProfileLinkContextMenu();
        }
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && groupMemberContextMenu?.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeGroupMemberContextMenu();
          return;
        }
        if (event.key === "Escape" && profileLinkContextMenu?.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeProfileLinkContextMenu();
        }
      });

      const chatProfileMembersList = document.getElementById("chat-profile-members-list");
      chatProfileMembersList?.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target.closest(".group-member-row[data-member-user-id]") : null;
        if (!target) {
          return;
        }
        const memberUserId = String(target.getAttribute("data-member-user-id") || "").trim();
        if (!memberUserId) {
          return;
        }
        closeGroupMemberContextMenu();
        void openDirectDialogForUser(memberUserId, { openProfile: true });
      });

      chatProfileMembersList?.addEventListener("contextmenu", (event) => {
        const target = event.target instanceof Element ? event.target.closest(".group-member-row[data-member-user-id]") : null;
        if (!target) {
          return;
        }
        const memberUserId = String(target.getAttribute("data-member-user-id") || "").trim();
        if (!memberUserId) {
          return;
        }

        const isSameTargetOpen = Boolean(
          groupMemberContextMenu?.classList.contains("open")
          && groupMemberContextMenuState?.userId
          && String(groupMemberContextMenuState.userId) === memberUserId
        );

        event.preventDefault();
        if (isSameTargetOpen) {
          closeGroupMemberContextMenu();
          return;
        }
        openGroupMemberContextMenu(event, memberUserId);
      });
      const onProfileIdentityContextMenu = (event) => {
        if (!currentDialogSnapshot) {
          return;
        }
        const details = getChatProfileDetails(currentDialogSnapshot);
        if (!details || !details.username || currentDialogSnapshot.type === "group") {
          return;
        }
        const isSameTargetOpen = Boolean(
          profileLinkContextMenu?.classList.contains("open")
          && profileLinkContextMenuState?.profileUrl
          && String(profileLinkContextMenuState.profileUrl) === String(details.profileUrl)
        );

        event.preventDefault();
        if (isSameTargetOpen) {
          closeProfileLinkContextMenu();
          return;
        }
        openProfileLinkContextMenu(event, details.profileUrl);
      };
      chatProfileName?.addEventListener("contextmenu", onProfileIdentityContextMenu);
      chatProfileLink?.addEventListener("contextmenu", onProfileIdentityContextMenu);

      const sidebarProfileUsernameEl = document.getElementById("sidebar-profile-username");
      const sidebarProfileUsernameRow = sidebarProfileUsernameEl?.closest(".sidebar-profile-info-row");

      sidebarProfileUsernameRow?.addEventListener("contextmenu", (event) => {
        const rawUsername = String(currentUserUsername || "").trim();
        if (!rawUsername) {
          return;
        }
        const profileUrl = window.location.origin + "/@" + encodeURIComponent(rawUsername);

        const isSameTargetOpen = Boolean(
          profileLinkContextMenu?.classList.contains("open")
          && profileLinkContextMenuState?.profileUrl
          && String(profileLinkContextMenuState.profileUrl) === String(profileUrl)
        );

        event.preventDefault();
        if (isSameTargetOpen) {
          closeProfileLinkContextMenu();
          return;
        }
        openProfileLinkContextMenu(event, profileUrl);
      });

      document.getElementById("chat-profile-notifications-btn")?.addEventListener("click", () => {
        if (currentDialogSnapshot?.type !== "group" || !currentDialogSnapshot?.publicId) {
          return;
        }
        const nextEnabled = !isGroupNotificationsEnabled(currentDialogSnapshot.publicId);
        setGroupNotificationsEnabled(currentDialogSnapshot.publicId, nextEnabled);
        syncGroupNotificationsToggle();
        showToast(nextEnabled ? "Notifications enabled" : "Notifications muted", "info");
      });
      document.getElementById("chat-profile-delete-btn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this group?")) {
          showToast("Group deleted", "success");
          closeChatProfilePanel();
          if (currentDialogSnapshot) {
            allDialogs = allDialogs.filter((d) => d.id !== currentDialogSnapshot.id);
            renderDialogs(allDialogs);
            closeDialog();
          }
        }
      });

      chatSearchClose.addEventListener("click", () => {
        closeChatSearch();
      });

      chatSearchBackdrop?.addEventListener("click", () => {
        closeChatSearch();
      });

      chatSearchInput.addEventListener("input", () => {
        chatSearchQuery = chatSearchInput.value || "";
        renderChatSearchResults();
      });

      chatSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeChatSearch();
        }
      });

      chatCallButton.addEventListener("click", () => {
        void beginOutgoingCall();
      });
      chatGroupVideoButton?.addEventListener("click", () => {
        void beginGroupVideoCall();
      });

      chatCallChip.addEventListener("click", () => {
        restoreCallModal();
      });

      callCloseButton.addEventListener("click", () => {
        void endOrRejectCall();
      });

      callExpandButton?.addEventListener("click", () => {
        if (!(callModal instanceof HTMLElement)) {
          return;
        }
        const nextExpanded = !callModal.classList.contains("expanded");
        callModal.classList.toggle("expanded", nextExpanded);
        const iconNode = callExpandButton.querySelector(".material-symbols-rounded");
        if (iconNode) {
          iconNode.textContent = nextExpanded ? "close_fullscreen" : "open_in_full";
        }
      });

      callMiniOpen.addEventListener("click", () => {
        restoreCallModal();
      });

      callMiniClose.addEventListener("click", () => {
        dismissMiniCallCard();
      });

      callMiniEnd.addEventListener("click", () => {
        void endOrRejectCall();
      });
      groupCallBanner?.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const endIconPressed = Boolean(target?.closest(".material-symbols-rounded"));
        if (endIconPressed && activeCall?.mode === "group") {
          event.preventDefault();
          event.stopPropagation();
          void endOrRejectCall();
          return;
        }
        if (activeCall?.mode === "group") {
          restoreCallModal();
          return;
        }
        void beginGroupVideoCall();
      });
      groupCallJoinStrip?.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (target && target.closest("button") && !target.closest("#group-call-join-button")) {
          return;
        }
        void beginGroupVideoCall();
      });
      groupCallJoinButton?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        void beginGroupVideoCall();
      });
      groupCallLeaveCancel?.addEventListener("click", () => {
        closeGroupLeaveModal();
      });
      groupCallLeaveConfirm?.addEventListener("click", () => {
        void confirmLeaveGroupCall({
          endForEveryone: Boolean(groupCallEndForAll?.checked)
        });
      });

      callMiniDragHandle?.addEventListener("pointerdown", (event) => {
        if (!activeCall || !activeCall.minimized || event.button !== 0) {
          return;
        }
        const targetNode = event.target instanceof Element ? event.target : null;
        if (targetNode && targetNode.closest("button")) {
          return;
        }

        const overlayRect = callOverlay.getBoundingClientRect();
        const cardRect = callMiniCard.getBoundingClientRect();
        const dragState = {
          pointerId: event.pointerId,
          offsetX: event.clientX - cardRect.left,
          offsetY: event.clientY - cardRect.top,
          cardWidth: cardRect.width,
          cardHeight: cardRect.height,
          overlayLeft: overlayRect.left,
          overlayTop: overlayRect.top,
          overlayWidth: overlayRect.width,
          overlayHeight: overlayRect.height
        };

        callMiniCard.classList.add("dragging");
        callMiniDragHandle.setPointerCapture(event.pointerId);

        const applyPosition = (clientX, clientY) => {
          const maxLeft = Math.max(0, dragState.overlayWidth - dragState.cardWidth);
          const maxTop = Math.max(0, dragState.overlayHeight - dragState.cardHeight);
          const left = Math.max(0, Math.min(maxLeft, clientX - dragState.overlayLeft - dragState.offsetX));
          const top = Math.max(0, Math.min(maxTop, clientY - dragState.overlayTop - dragState.offsetY));

          callMiniCard.style.left = left + "px";
          callMiniCard.style.top = top + "px";
          callMiniCard.style.right = "auto";
          callMiniCard.style.bottom = "auto";
          if (activeCall) {
            activeCall.miniPosition = { left, top };
          }
        };

        const onMove = (moveEvent) => {
          if (moveEvent.pointerId !== dragState.pointerId) {
            return;
          }
          moveEvent.preventDefault();
          applyPosition(moveEvent.clientX, moveEvent.clientY);
        };

        const finishDrag = (finishEvent) => {
          if (finishEvent.pointerId !== dragState.pointerId) {
            return;
          }
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", finishDrag);
          window.removeEventListener("pointercancel", finishDrag);
          try {
            callMiniDragHandle.releasePointerCapture(finishEvent.pointerId);
          } catch {}
          callMiniCard.classList.remove("dragging");
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", finishDrag);
        window.addEventListener("pointercancel", finishDrag);
      });

      callAcceptButton.addEventListener("click", () => {
        void acceptIncomingCall();
      });

      callEndButton.addEventListener("click", () => {
        void endOrRejectCall();
      });

      callMuteButton.addEventListener("click", () => {
        if (!activeCall?.localStream) {
          return;
        }

        activeCall.isMuted = !activeCall.isMuted;
        activeCall.localStream.getAudioTracks().forEach((track) => {
          track.enabled = !activeCall.isMuted;
        });
        if (activeCall.mode === "group") {
          if (typeof upsertGroupParticipant === "function") {
            upsertGroupParticipant(
              activeCall,
              currentUserId,
              currentUserDisplayName || workspaceUserName.textContent || "You",
              Boolean(activeCall.isMuted),
              !activeCall.isMuted
            );
          }
          const groupState = typeof groupCallStateByDialog !== "undefined"
            ? groupCallStateByDialog.get(activeCall.dialogId)
            : null;
          if (groupState) {
            if (!(groupState.participantIds instanceof Set)) {
              groupState.participantIds = new Set();
            }
            groupState.participantIds.add(currentUserId);
            if (groupState.participantLastSeenAtMap instanceof Map) {
              groupState.participantLastSeenAtMap.set(currentUserId, Date.now());
            }
            groupState.participantCount = groupState.participantIds.size;
            groupCallStateByDialog.set(activeCall.dialogId, groupState);
          }
          sendCallRealtime({
            type: "call_presence",
            mode: "group",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            participantUserId: currentUserId,
            participantName: currentUserDisplayName || workspaceUserName.textContent || "You",
            isMuted: Boolean(activeCall.isMuted),
            isSpeaking: !activeCall.isMuted,
            voiceLevel: activeCall.isMuted ? 0 : (typeof clampVoiceLevel === "function" ? clampVoiceLevel(groupLocalVoiceLastLevel) : 0)
          });
        } else {
          sendCallRealtime({
            type: "call_mute_state",
            callId: activeCall.callId,
            dialogId: activeCall.dialogId,
            dialogPublicId: activeCall.dialogPublicId,
            isMuted: Boolean(activeCall.isMuted)
          });
        }
        syncCallUi();
      });

      callVideoButton?.addEventListener("click", () => {
        void toggleDirectCallCamera();
      });

      callScreenButton?.addEventListener("click", () => {
        void toggleDirectCallScreenShare();
      });

      const mainStageVideoNode = document.getElementById("remote-screen-video");
      mainStageVideoNode?.addEventListener("click", () => {
        if (!activeCall || activeCall.mode === "group") {
          return;
        }
        const overlayNode = callModal?.querySelector?.(".call-screen-overlay");
        const isOverlayOpen = Boolean(overlayNode instanceof HTMLElement && overlayNode.classList.contains("open"));
        if (isOverlayOpen) {
          if (typeof closeExpandedScreenPreview === "function") {
            closeExpandedScreenPreview();
          }
          return;
        }
        if (typeof openExpandedScreenPreview === "function") {
          openExpandedScreenPreview();
        }
      });
      callModal?.addEventListener("click", (event) => {
        const targetNode = event.target instanceof Element ? event.target : null;
        if (!targetNode) {
          return;
        }
        if (targetNode.closest("[data-overlay-dismiss='true']")) {
          if (typeof closeExpandedScreenPreview === "function") {
            closeExpandedScreenPreview();
          }
        }
      });
      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          const overlayNode = callModal?.querySelector?.(".call-screen-overlay");
          const isOverlayOpen = Boolean(overlayNode instanceof HTMLElement && overlayNode.classList.contains("open"));
          const isCallExpanded = Boolean(callModal instanceof HTMLElement && callModal.classList.contains("expanded"));
          if (isOverlayOpen || isCallExpanded) {
            event.preventDefault();
            event.stopPropagation();
          }
          if (typeof closeExpandedScreenPreview === "function") {
            closeExpandedScreenPreview();
          }
          if (isCallExpanded && callModal instanceof HTMLElement) {
            callModal.classList.remove("expanded");
            if (callExpandButton instanceof HTMLElement) {
              const iconNode = callExpandButton.querySelector(".material-symbols-rounded");
              if (iconNode) {
                iconNode.textContent = "open_in_full";
              }
            }
          }
        }
      });

      callDevicesButton.addEventListener("click", () => {
        if (callDevicesPanel.classList.contains("open")) {
          closeCallDevicesPanel();
          return;
        }

        void loadCallDevices().then(() => {
          openCallDevicesPanel();
        });
      });

      callDevicesClose?.addEventListener("click", () => {
        closeCallDevicesPanel();
      });

      callModal.addEventListener("pointerdown", (event) => {
        if (!callDevicesPanel.classList.contains("open")) {
          return;
        }
        const targetNode = event.target instanceof Node ? event.target : null;
        if (!targetNode) {
          return;
        }
        if (callDevicesPanel.contains(targetNode) || callDevicesButton.contains(targetNode)) {
          return;
        }
        closeCallDevicesPanel();
      });

      const hideCallEmojiTooltip = () => {
        if (!(callEmojiTooltip instanceof HTMLElement)) {
          return;
        }
        callEmojiTooltip.classList.remove("visible");
        callEmojiTooltip.setAttribute("aria-hidden", "true");
      };

      const positionCallEmojiTooltip = (clientX, clientY) => {
        if (!(callEmojiTooltip instanceof HTMLElement) || !(callOverlay instanceof HTMLElement)) {
          return;
        }
        const offsetX = 14;
        const offsetY = 18;
        const overlayRect = callOverlay.getBoundingClientRect();
        const tooltipWidth = callEmojiTooltip.offsetWidth || 160;
        const tooltipHeight = callEmojiTooltip.offsetHeight || 36;
        const localX = clientX - overlayRect.left;
        const localY = clientY - overlayRect.top;
        const maxLeft = Math.max(8, overlayRect.width - tooltipWidth - 8);
        const maxTop = Math.max(8, overlayRect.height - tooltipHeight - 8);
        const nextLeft = Math.min(maxLeft, Math.max(8, localX + offsetX));
        const nextTop = Math.min(maxTop, Math.max(8, localY + offsetY));
        callEmojiTooltip.style.left = nextLeft + "px";
        callEmojiTooltip.style.top = nextTop + "px";
      };

      callOverlay?.addEventListener("pointermove", (event) => {
        const target = event.target instanceof Element ? event.target.closest(".call-fingerprint-emoji[data-emoji-hint]") : null;
        if (!(target instanceof HTMLElement) || !(callEmojiTooltip instanceof HTMLElement)) {
          hideCallEmojiTooltip();
          return;
        }
        const hint = String(target.getAttribute("data-emoji-hint") || "").trim();
        if (!hint) {
          hideCallEmojiTooltip();
          return;
        }
        callEmojiTooltip.textContent = hint;
        callEmojiTooltip.setAttribute("aria-hidden", "false");
        callEmojiTooltip.classList.add("visible");
        positionCallEmojiTooltip(event.clientX, event.clientY);
      });

      callOverlay?.addEventListener("pointerleave", () => {
        hideCallEmojiTooltip();
      });

      callInputDevice.addEventListener("change", () => {
        void replaceLocalAudioTrack(callInputDevice.value);
      });

      callOutputDevice.addEventListener("change", () => {
        void applyCallOutputDevice(callOutputDevice.value);
      });




      const connectRealtime = () => {
        if (!realtimeEnabled || !isPrimaryActiveTab) {
          return;
        }

        if (realtimeSocket && (realtimeSocket.readyState === WebSocket.OPEN || realtimeSocket.readyState === WebSocket.CONNECTING)) {
          return;
        }

        const explicitWsBase = "";
        let wsUrl;

        if (explicitWsBase) {
          try {
            const resolvedWsUrl = new URL(explicitWsBase, window.location.href);
            const isPublicHost = /^(web\.thegrapht\.su|thegrapht\.su|www\.thegrapht\.su)$/i.test(window.location.hostname || "");
            const isLoopbackWsHost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(resolvedWsUrl.hostname || "");

            wsUrl = isPublicHost && isLoopbackWsHost
              ? new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws")
              : resolvedWsUrl;
          } catch {
            wsUrl = new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws");
          }
        } else {
          wsUrl = new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws");
        }

        wsInfo("connecting", {
          url: wsUrl.toString(),
          dialogId: currentDialogId || null
        });
        realtimeSocket = new WebSocket(wsUrl.toString());

        realtimeSocket.addEventListener("open", () => {
          if (realtimeReconnectTimer) {
            window.clearTimeout(realtimeReconnectTimer);
            realtimeReconnectTimer = null;
          }

          wsInfo("connected", {
            readyState: realtimeSocket?.readyState
          });
          touchRealtimeActivity();
          startRealtimeHealthChecks();
          sendCurrentPresence();
          if (isFirstRealtimeConnection) {
            isFirstRealtimeConnection = false;
            wsInfo("ws_open_initial_skip_reconcile");
          } else {
            void reconcileCurrentDialogMessages("ws_open_reconnect", { force: true });
          }
        });

        realtimeSocket.addEventListener("message", (event) => {
          touchRealtimeActivity();
          void (async () => {
            try {
              const payload = JSON.parse(event.data);
            wsInfo("message_received", {
              type: payload?.type || "unknown",
              dialogId: payload?.dialog?.id || payload?.dialogId || null,
              messageId: payload?.message?.id || payload?.messageId || null,
              callId: payload?.callId || null
            });
            if (payload.type === "pong") {
              return;
            }
            if (payload.type === "message_created") {
              const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.message ? [payload.message] : []);
              const preparedMessage = preparedPayload.messages[0] || payload.message;
              const preparedMessageId = String(preparedMessage?.id || "");
              if (preparedMessageId && isMessageDeletedLocally(preparedMessageId)) {
                wsInfo("message_created_skipped_tombstoned", {
                  messageId: preparedMessageId
                });
                return;
              }
              const nowTs = Date.now();
              if (preparedMessageId) {
                const seenAt = Number(realtimeMessageSeenAt.get(preparedMessageId) || 0);
                if (seenAt && (nowTs - seenAt) < 6000) {
                  wsInfo("message_created_duplicate_skipped", {
                    messageId: preparedMessageId,
                    ageMs: nowTs - seenAt
                  });
                  return;
                }
                realtimeMessageSeenAt.set(preparedMessageId, nowTs);
                if (realtimeMessageSeenAt.size > 1500) {
                  const threshold = nowTs - 10 * 60 * 1000;
                  realtimeMessageSeenAt.forEach((timestamp, key) => {
                    if (!timestamp || timestamp < threshold) {
                      realtimeMessageSeenAt.delete(key);
                    }
                  });
                }
              }
              if (preparedMessage?.decryptionFailed) {
                wsWarn("message_decryption_failed", {
                  dialogId: preparedPayload.dialog?.id || preparedPayload.dialog?.publicId || null,
                  messageId: preparedMessage.id || null,
                  senderId: preparedMessage.senderId || null
                });
              }
              const replaceLocalMessageId = preparedMessage?.senderId === currentUserId
                ? findMatchingPendingLocalMessageId(preparedPayload.dialog?.publicId || "", preparedMessage)
                : "";
              if (replaceLocalMessageId) {
                removeLocalOutgoingMessage(replaceLocalMessageId);
              }
              const preparedMessagePreview = String(getMessagePreviewText(preparedMessage) || "").trim();
              const existingDialog = allDialogs.find((dialog) => dialog.id === preparedPayload.dialog?.id) || null;
              const existingUnreadCount = Math.max(0, Number(existingDialog?.unreadCount) || 0);
              const isCurrentDialogMessage = preparedPayload.dialog?.id === currentDialogId;
              const isIncomingMessage = preparedMessage?.senderId !== currentUserId;
              const nextUnreadCount = isCurrentDialogMessage
                ? 0
                : (isIncomingMessage ? (existingUnreadCount + 1) : existingUnreadCount);
              const nextDialog = updateDialogInState(preparedPayload.dialog, {
                lastMessagePreview: preparedMessage?.decryptionFailed ? undefined : preparedMessagePreview,
                lastMessageSenderName: preparedMessage.senderId === currentUserId
                  ? "You"
                  : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
                lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || "",
                unreadCount: nextUnreadCount
              });

              if (!currentSearchQuery.trim() && nextDialog) {
                renderDialogs(allDialogs);
              }

               if (preparedMessage?.senderId !== currentUserId) {
                void showIncomingDesktopNotification(preparedMessage, nextDialog || preparedPayload.dialog || null);
              }

              if (isCurrentDialogMessage && preparedMessage) {
                const isIncomingGroupMessage = Boolean(
                  preparedPayload.dialog?.type === "group"
                  && preparedMessage.senderId !== currentUserId
                );
                let messagePatch = {};
                if (
                  preparedMessage?.type === "image"
                  && !preparedMessage?.albumId
                  && preparedMessage?.mediaUrl
                ) {
                  if (!readCachedImageDimensions(preparedMessage.mediaUrl)) {
                    await measureImageUrl(preparedMessage.mediaUrl);
                  }
                  const incomingDimensions = readCachedImageDimensions(preparedMessage.mediaUrl);
                  if (incomingDimensions?.naturalWidth > 0 && incomingDimensions?.naturalHeight > 0) {
                    messagePatch = {
                      mediaNaturalWidth: incomingDimensions.naturalWidth,
                      mediaNaturalHeight: incomingDimensions.naturalHeight
                    };
                  }
                }
                appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
                  scrollBehavior: "smooth",
                  animateMessage: !replaceLocalMessageId,
                  replaceMessageId: replaceLocalMessageId,
                  forceScrollBottom: isIncomingGroupMessage,
                  messagePatch
                });
                if (currentDialogPublicId) {
                  void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/read", {
                    method: "POST"
                  }).catch(() => {});
                }
                void reconcileCurrentDialogMessages("message_created_current_dialog");
                return;
              }

              if (!nextDialog) {
                void loadWorkspace({ preserveRoute: true });
              }
            } else if (payload.type === "presence_snapshot") {
              onlineUserIds.clear();
              (payload.userIds || []).forEach((userId) => {
                if (typeof userId === "string" && userId) {
                  onlineUserIds.add(userId);
                }
              });
              syncVisibleDialogsRealtimeState();
              refreshCurrentDialogChrome();
            } else if (payload.type === "user_presence" && payload.userId) {
              applyPresenceStateToDialogs({
                userId: payload.userId,
                isOnline: Boolean(payload.isOnline),
                lastSeenAt: payload.lastSeenAt || null
              });
              syncVisibleDialogsRealtimeState();
              refreshCurrentDialogChrome();
            } else if (payload.type === "dialog_presence" && payload.dialogId === currentDialogId) {
              const nextPeerActive = Array.isArray(payload.activeUserIds)
                ? payload.activeUserIds.some((userId) => userId !== currentUserId)
                : false;
              if (peerActiveInCurrentDialog !== nextPeerActive) {
                peerActiveInCurrentDialog = nextPeerActive;
                refreshCurrentDialogChrome();
              }
            } else if (payload.type === "dialog_created" && payload.dialog?.publicId) {
              const createdDialog = payload.dialog;
              const upsertedDialog = updateDialogInState(createdDialog, {
                lastMessagePreview: createdDialog.lastMessagePreview || null,
                lastMessageSenderName: createdDialog.lastMessageSenderName || null,
                lastMessageCreatedAt: createdDialog.lastMessageCreatedAt || new Date().toISOString()
              });
              if (!upsertedDialog) {
                allDialogs.unshift(createdDialog);
              }
              if (!currentSearchQuery.trim()) {
                renderDialogs(allDialogs);
              }
              if (payload.actorUserId !== currentUserId) {
                const permission = await ensureNotificationPermission();
                if (permission === "granted" && isWindowInactive() && isNotificationOwner()) {
                  try {
                    const notification = new Notification("TheGraphT", {
                      body: "You were added to group " + String(createdDialog.title || "Group"),
                      icon: buildNotificationAvatarUrl(createdDialog, createdDialog.title || "Group"),
                      badge: "/logo.jpg",
                      tag: "group_added_" + String(createdDialog.publicId),
                      renotify: false
                    });
                    window.setTimeout(() => {
                      try { notification.close(); } catch {}
                    }, 8000);
                    notification.onclick = () => {
                      window.focus();
                      pendingDialogPublicIdFromNotification = createdDialog.publicId;
                      applyRoute(createdDialog.publicId);
                      void loadDialog(createdDialog.publicId, { scrollBehavior: "auto", forceReload: true });
                      notification.close();
                    };
                  } catch {}
                }
              }
            } else if (payload.type === "dialog_read" && payload.dialogId === currentDialogId && payload.userId !== currentUserId) {
              try {
                console.log("[TheGraphT UI DEBUG]", "ws:dialog_read", {
                  ts: Date.now(),
                  payloadDialogId: payload.dialogId,
                  currentDialogId,
                  payloadUserId: payload.userId,
                  currentUserId
                });
              } catch {}
              const nextPeerReadAt = payload.readAt || currentPeerReadAt;
              if (nextPeerReadAt !== currentPeerReadAt) {
                currentPeerReadAt = nextPeerReadAt;
                refreshOutgoingReadReceiptsInPlace();
              }
            } else if (payload.type === "message_deleted") {
              handleMessageDeletedEvent(payload);
            } else if (payload.type === "dialog_typing" && payload.dialogId && payload.userId && payload.userId !== currentUserId) {
              updateTypingState(payload.dialogId, payload.userId, Boolean(payload.isTyping));
            } else if (payload.type === "call_invite") {
              void handleCallInvite(payload);
            } else if (payload.type === "call_accept") {
              void handleCallAccept(payload);
            } else if (payload.type === "call_reject") {
              void handleCallReject(payload);
            } else if (payload.type === "call_end") {
              void handleCallEnd(payload);
            } else if (payload.type === "call_candidate") {
              void handleCallCandidate(payload);
            } else if (payload.type === "call_presence") {
              void handleCallPresence(payload);
            } else if (payload.type === "call_leave") {
              void handleCallLeave(payload);
            } else if (payload.type === "call_screen_state") {
              void handleCallScreenState(payload);
            } else if (payload.type === "call_mute_state") {
              if (typeof handleCallMuteState === "function") {
                handleCallMuteState(payload);
              }
            }
            } catch (error) {
              wsWarn("message_handler_failed", {
                error: error instanceof Error ? error.message : String(error)
              });
            }
          })();
        });

        realtimeSocket.addEventListener("close", (event) => {
          wsWarn("disconnected", {
            code: event?.code,
            reason: event?.reason || "",
            wasClean: Boolean(event?.wasClean),
            willReconnect: Boolean(realtimeEnabled)
          });
          if (realtimeHeartbeatTimer) {
            window.clearInterval(realtimeHeartbeatTimer);
            realtimeHeartbeatTimer = null;
          }
          if (realtimeWatchdogTimer) {
            window.clearInterval(realtimeWatchdogTimer);
            realtimeWatchdogTimer = null;
          }
          realtimeLastActivityAt = 0;
          realtimeSocket = null;
          onlineUserIds.clear();
          clearTypingIndicators();
          syncVisibleDialogsRealtimeState();
          refreshCurrentDialogChrome();
          if (realtimeEnabled) {
            wsInfo("reconnect_scheduled", {
              delayMs: 1200
            });
            realtimeReconnectTimer = window.setTimeout(() => connectRealtime(), 1200);
          }
        });

        realtimeSocket.addEventListener("error", () => {
          wsWarn("socket_error", {
            readyState: realtimeSocket?.readyState
          });
        });
      };



      const setStatus = (message, type) => {
        statusNode.textContent = message;
        statusNode.className = "status " + type;
      };

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

      const gsapOpenSidebar = (panel) => {
        if (!panel) return;
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
      };

      const gsapCloseSidebar = (panel) => {
        if (!panel) return;
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
      };

      const groupCreateClose = document.getElementById("group-create-close");
      const groupCreateSearchInput = document.getElementById("group-create-search-input");
      const groupCreateStepMembersTitle = document.getElementById("group-create-step-members-title");
      const groupCreateList = document.getElementById("group-create-list");
      const groupCreateSelected = document.getElementById("group-create-selected");
      const groupCreateNext = document.getElementById("group-create-next");
      const groupCreateDetailsBack = document.getElementById("group-create-details-back");
      const groupCreatePhotoButton = document.getElementById("group-create-photo-button");
      const groupCreatePhotoInput = document.getElementById("group-create-photo-input");
      const groupCreatePhotoPreview = document.getElementById("group-create-photo-preview");
      const groupCreateNameInput = document.getElementById("group-create-name-input");
      const groupCreateMemberCount = document.getElementById("group-create-member-count");
      const groupCreateDetailsList = document.getElementById("group-create-details-list");
      let groupCreateSelectedDialogIds = new Set();
      let groupCreateSearchQuery = "";
      let groupCreateStep = 1;
      let groupCreatePhotoDataUrl = "";
      let groupCreateNameTouched = false;
      let groupCreateRenderedSelectedDialogIds = new Set();
      let groupCreateMode = "group";
      const GROUP_MAX_MEMBERS = 20000;
      const encodeSecretRouteToken = (value) => {
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
      const decodeSecretRouteToken = (value) => {
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
      const getDialogUsernameFromSidebarDialog = (dialog) => {
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
      const resolveRoutePathForDialogPublicId = (publicId) => {
        if (!publicId) {
          return "/";
        }
        const dialog = typeof allDialogs !== "undefined" ? allDialogs.find((d) => d.publicId === publicId) : null;
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

      const setSidebarMenuOpen = (isOpen) => {
        workspaceSidebar?.classList.toggle("menu-open", isOpen);
        if (sidebarGlassMenu) {
          sidebarGlassMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        }
      };

      const toggleSidebarMenu = () => {
        const isOpen = workspaceSidebar?.classList.contains("menu-open");
        setSidebarMenuOpen(!isOpen);
      };

      const setSidebarComposeOpen = (isOpen) => {
        workspaceSidebar?.classList.toggle("compose-open", isOpen);
        if (sidebarComposeMenu) {
          sidebarComposeMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        }
      };

      const toggleSidebarComposeMenu = () => {
        const isOpen = workspaceSidebar?.classList.contains("compose-open");
        setSidebarComposeOpen(!isOpen);
      };

      const getGroupCreateCandidates = () => {
        const seenPeerUsers = new Set();
        return allDialogs
          .filter((dialog) => {
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
          .sort((a, b) => {
            const aTs = new Date(a?.lastMessageCreatedAt || 0).getTime();
            const bTs = new Date(b?.lastMessageCreatedAt || 0).getTime();
            return bTs - aTs;
          });
      };

      const getSecretCreateCandidates = () => {
        const byPeer = new Map();
        allDialogs.forEach((dialog) => {
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
          .sort((a, b) => {
            const aTs = new Date(a?.lastMessageCreatedAt || 0).getTime();
            const bTs = new Date(b?.lastMessageCreatedAt || 0).getTime();
            return bTs - aTs;
          });
      };

      const renderGroupCreateSelected = (candidates) => {
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

      const getGroupCreateSelectedCandidates = () => {
        const selectedIds = groupCreateSelectedDialogIds;
        const candidates = groupCreateMode === "secret" ? getSecretCreateCandidates() : getGroupCreateCandidates();
        return candidates.filter((dialog) => selectedIds.has(String(dialog.id)));
      };

      const getAutoGeneratedGroupName = (selectedCandidates) => {
        const selfName = String(currentUserDisplayName || currentUserUsername || currentUserEmail || "You").trim() || "You";
        const peerNames = selectedCandidates.map((dialog) => String(dialog.title || "User").trim() || "User");
        return [selfName].concat(peerNames).join(" & ");
      };

      const setGroupCreateStep = (step) => {
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
          ? candidates.filter((dialog) => {
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

        groupCreateList.innerHTML = filtered.map((dialog) => {
          const dialogId = String(dialog.id);
          const isSelected = groupCreateSelectedDialogIds.has(dialogId);
          const isUnavailable = Boolean(dialog.unavailable);
          const statusText = isUnavailable
            ? "Secret chat already exists"
            : (formatDialogSubtitle(dialog) || "last seen recently");
          return '<button class="group-create-item' + (isSelected ? " selected" : "") + (isUnavailable ? " unavailable" : "") + '" type="button" data-group-dialog-id="' + escapeHtml(dialogId) + '" ' + (isUnavailable ? 'disabled aria-disabled="true"' : "") + '>' +
            '<span class="group-create-check"><span class="material-symbols-rounded" aria-hidden="true">check</span></span>' +
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
            const candidate = filtered.find((item) => String(item.id) === dialogId);
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

      const animateModeChange = (nextMode) => {
        authCopyBlock.classList.add("switching");

        window.setTimeout(() => {
          const registerMode = nextMode === "register";
          authKicker.textContent = registerMode ? "Register" : "Sign in";
          authTitle.textContent = registerMode ? "Create account" : "Log in";
          authCopy.textContent = registerMode
            ? "Sign up to enter your Thegrapht workspace."
            : "Enter your email and password to sign in to Thegrapht.";
          submitButton.textContent = registerMode ? "Create account" : "Log in";
          metaText.textContent = registerMode ? "Already have an account?" : "No account?";
          toggleButton.textContent = registerMode ? "Back to sign in" : "Create account";
          nameField.classList.toggle("open", registerMode);
          nameInput.required = registerMode;
          passwordInput.autocomplete = registerMode ? "new-password" : "current-password";
          authCopyBlock.classList.remove("switching");
        }, 180);
      };

      const switchView = (showWorkspace) => {
        authView.classList.toggle("hidden", showWorkspace);
        workspaceView.classList.toggle("hidden", !showWorkspace);
        pageRoot.classList.toggle("workspace-mode", showWorkspace);
      };

      const finishBoot = async (showWorkspace) => {
        const wasBooting = pageRoot.classList.contains("booting");
        await ensureBootMinDuration();
        switchView(showWorkspace);
        pageRoot.classList.remove("booting");
        hideBootSplash();
        finishAllTopProgress();
        if (showWorkspace && wasBooting) {
          chatWindow.classList.remove("motion-enter");
          void chatWindow.offsetWidth;
          chatWindow.classList.add("motion-enter");
          animateDialogListItems();
        }
      };

      const getDialogSortTimestamp = (dialog) => {
        const raw = dialog?.lastMessageCreatedAt || dialog?.updatedAt || dialog?.createdAt || "";
        const ts = raw ? Date.parse(raw) : NaN;
        return Number.isFinite(ts) ? ts : 0;
      };

      const getFilteredDialogs = (dialogs) => {
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

      const renderSearchLoadingState = () => {
        dialogList.classList.remove("search-empty");
        dialogList.classList.add("search-loading");
        dialogList.innerHTML =
          '<div class="search-loading-state">' +
            '<div class="search-spinner" aria-hidden="true"></div>' +
          '</div>';
        animateDialogListItems();
      };

      const renderSearchResults = (users) => {
        dialogList.classList.remove("search-loading");
        dialogList.classList.remove("search-empty");
        const query = currentSearchQuery.trim().toLowerCase();
        const savedDialog = allDialogs.find((dialog) => dialog.type === "saved");
        const selfMatches = Boolean(
          query
          && (
            String(currentUserDisplayName || "").toLowerCase().includes(query)
            || String(currentUserUsername || "").toLowerCase().includes(query)
            || String(currentUserEmail || "").toLowerCase().includes(query)
          )
        );
        const visibleUsers = selfMatches
          ? [
              {
                id: currentUserId,
                name: currentUserDisplayName || currentUserUsername || currentUserEmail || "You",
                username: currentUserUsername || "",
                isSelf: true
              },
              ...users.filter((user) => user.id !== currentUserId)
            ]
          : users;

        if (!visibleUsers.length) {
          dialogList.classList.add("search-empty");
          dialogList.innerHTML =
            '<div class="search-empty-state">' +
              '<video autoplay muted loop playsinline preload="auto" aria-hidden="true">' +
                '<source src="' + searchEmptyVideoUrl + '" type="video/mp4" />' +
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

            if (targetUserId === currentUserId && savedDialog?.publicId) {
              currentSearchQuery = "";
              currentSearchResults = [];
              sidebarSearch.value = "";
              renderDialogs(allDialogs, { animate: true });
              await loadDialog(savedDialog.publicId);
              return;
            }

            try {
              const payload = await createPreferredDirectDialog(targetUserId);

              const preparedPayload = await prepareDialogPayloadForDisplay(
                payload.dialog || null,
                payload.messages || []
              );

              currentSearchQuery = "";
              currentSearchResults = [];
              sidebarSearch.value = "";
              await loadWorkspace();
              if (preparedPayload.dialog?.publicId) {
                setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
                await loadDialog(preparedPayload.dialog.publicId);
              }
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Failed to open chat.", "error");
              showToast(error instanceof Error ? error.message : "Failed to open chat.", "error");
            }
          });
        });
        animateDialogListItems();
      };

      const renderDialogs = (dialogs, options = {}) => {
        const shouldAnimate = Boolean(options.animate);
        const visibleDialogs = getFilteredDialogs(dialogs);

        dialogList.classList.remove("search-loading");
        dialogList.classList.remove("search-empty");

        dialogList.innerHTML = visibleDialogs.map((dialog) => {
          const active = dialog.id === currentDialogId ? " active" : "";
          const unreadCount = Math.max(0, Number(dialog?.unreadCount) || 0);
          const unreadBadgeClassName = unreadCount > 0
            ? "dialog-unread-badge"
            : "dialog-unread-badge is-hidden";
          const unreadBadgeText = unreadCount > 99 ? "99+" : String(unreadCount || "");

          return '<button class="dialog-item saved-item' + active + '" data-dialog-id="' + escapeHtml(dialog.id) + '" data-public-id="' + escapeHtml(dialog.publicId) + '">' +
            getDialogAvatarMarkup(dialog) +
            '<div class="dialog-body">' +
              '<div class="dialog-line"><span class="dialog-title-wrap"><strong>' + escapeHtml(dialog.title) + '</strong>' + (dialog.muted ? '<span class="material-symbols-rounded" style="font-size: 14px; margin-left: 4px; vertical-align: middle; opacity: 0.6;">volume_off</span>' : '') + '</span><span class="dialog-meta">' + escapeHtml(formatDialogListTime(dialog.lastMessageCreatedAt)) + '</span></div>' +
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
              // Immediately add is-hidden class to the badge if it exists to trigger the CSS transition
              const badgeEl = button.querySelector(".dialog-unread-badge");
              if (badgeEl && !badgeEl.classList.contains("is-hidden")) {
                badgeEl.classList.add("is-hidden");
              }

              allDialogs = allDialogs.map((dialog) => dialog.publicId === publicId
                ? { ...dialog, unreadCount: 0 }
                : dialog);
              if (currentDialogSnapshot?.publicId === publicId) {
                currentDialogSnapshot = {
                  ...currentDialogSnapshot,
                  unreadCount: 0
                };
              }

              // Delay renderDialogs to allow transition to complete
              window.setTimeout(() => {
                renderDialogs(allDialogs);
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
        dialogContextMenu.classList.remove("open");
        dialogContextMenu.setAttribute("aria-hidden", "true");
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

      const openDialogContextMenu = (event, context) => {
        if (!context?.publicId) {
          return;
        }

        dialogContextMenuState = context;
        dialogContextMenuBody.innerHTML =
          '<button class="dialog-context-menu-item" type="button" data-action="open_in_new">' +
            '<span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>' +
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

      const closeDialog = (options = {}) => {
        sendTypingState(false);
        clearPendingReplyMessage();
        closeMessageContextMenu();
        closeDialogContextMenu();
        closeDeleteMessageModal();
        currentDialogId = "";
        currentDialogPublicId = "";
        pendingAutoBottomDialogPublicId = "";
        pendingAutoBottomCanceled = false;
        peerActiveInCurrentDialog = false;
        currentPeerReadAt = null;
        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
          typingStopTimer = null;
        }
        clearPendingImageAttachment();
        sendCurrentPresence();
        closeChatProfilePanel();
        renderMessages(null, []);
        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          button.classList.remove("active");
        });
        if (!options.skipHistory) {
          applyRoute("");
        }
      };

      const closeDialogWithMotion = (options = {}) => {
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

      const isMobileViewport = () => window.matchMedia("(max-width: 900px)").matches;
      const syncMobileChatOpenState = (hasOpenDialog) => {
        if (!isMobileViewport()) {
          pageRoot.classList.remove("mobile-chat-open");
          return;
        }
        pageRoot.classList.toggle("mobile-chat-open", Boolean(hasOpenDialog));
      };

      window.addEventListener("resize", () => {
        syncMobileChatOpenState(Boolean(currentDialogSnapshot));
      });

      const dedupeMessagesById = (messages) => {
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
          // Keep latest object shape for the same message id.
          uniqueMap.set(key, message);
        });
        return Array.from(uniqueMap.values());
      };

      const renderMessages = (dialog, messages, options = {}) => {
        uiRenderDebug("renderMessages:called", {
          dialogPublicId: dialog?.publicId || null,
          dialogType: dialog?.type || null,
          messageCount: Array.isArray(messages) ? messages.length : 0,
          options
        });
        const shouldAnimateList = Boolean(options.animateList);
        const startMessagesLoading = () => {
          messageList.classList.add("loading-messages");
        };
        const finishMessagesLoading = () => {
          requestAnimationFrame(() => {
            messageList.classList.remove("loading-messages");
          });
        };
        currentDialogSnapshot = dialog;
        currentMessagesSnapshot = Array.isArray(messages)
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
            groupCallJoinStrip.hidden = true;
          }
          chatWindow?.classList.remove("group-call-join-visible");
        }

        if (!dialog) {
          startMessagesLoading();
          if (typeof preserveActiveAudioForLayoutChange === "function") {
            preserveActiveAudioForLayoutChange();
          }
          currentPeerReadAt = null;
          syncChatHeaderMeta();
          syncChatIslandActions();
          syncActiveCallChip();
          syncChatProfilePanel();
          workspaceMain.classList.add("empty-chat");
          workspaceMain.classList.remove("open-chat");
          chatStage.classList.add("empty");
          chatStage.classList.remove("open-chat");
          chatComposer.style.display = "none";
          syncMobileChatOpenState(false);
          setSidebarComposeOpen(false);
          composerInput.value = "";
        composerInput.style.height = "48px";
          composerInput.style.overflowY = "hidden";
          clearPendingImageAttachment();
          syncComposerState();
          messageList.classList.remove("saved-empty");
          messageList.innerHTML = '<div class="empty-chat-state"><p>Choose a chat to start messaging.</p><p>When you pick a dialog on the left, your conversation appears here.</p></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          finishMessagesLoading();
          finishDialogSwitchTransition();
          return;
        }

        const localMessages = getLocalMessagesForDialog(dialog.publicId).map((message) => (
          message && typeof message === "object" && message.animateOnRender
            ? { ...message, animateOnRender: false }
            : message
        ));
        const mergedMessages = dedupeMessagesById(currentMessagesSnapshot.concat(localMessages));
        if (dialog.type === "group" && typeof syncGroupCallStateFromMessages === "function") {
          syncGroupCallStateFromMessages(dialog, mergedMessages);
        }
        if (dialog.type !== "direct" && dialog.type !== "group") {
          currentPeerReadAt = null;
        }

        workspaceMain.classList.remove("empty-chat");
        workspaceMain.classList.add("open-chat");
        chatStage.classList.remove("empty");
        chatStage.classList.add("open-chat");
        chatComposer.style.display = "flex";
        syncMobileChatOpenState(true);
        setSidebarComposeOpen(false);
        setSidebarMenuOpen(false);
        chatTitle.textContent = dialog.title;
        chatSubtitle.textContent = formatDialogSubtitle(dialog);
        syncChatHeaderMeta();
        syncChatProfilePanel();
        syncChatIslandActions();
        syncActiveCallChip();
        syncComposerState();
        if (dialog.type === "saved" && mergedMessages.length === 0) {
          startMessagesLoading();
          bottomLockToken += 1;
          messageList.classList.remove("preparing-bottom");
          messageList.classList.add("saved-empty");
          messageList.innerHTML = '<div class="saved-empty-state"><h3>Your personal space</h3><p>Forward useful messages here.</p><p>Store photos and videos here safely.</p></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          closeChatSearch();
          finishMessagesLoading();
          finishDialogSwitchTransition();
          return;
        }

        if (dialog.type === "direct" && mergedMessages.length === 0) {
          startMessagesLoading();
          bottomLockToken += 1;
          messageList.classList.remove("preparing-bottom");
          const peerName = escapeHtml(dialog.title || "this user");
          messageList.classList.remove("saved-empty");
          messageList.innerHTML = '<div class="direct-empty-state"><div class="direct-empty-card"><h3>Start chatting with ' + peerName + '</h3><p>Once you send the first message, your chat history appears here.</p></div></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          if (chatSearchPanel.classList.contains("open")) {
            renderChatSearchResults();
          }
          syncActiveCallChip();
          finishMessagesLoading();
          finishDialogSwitchTransition();
          return;
        }

        if (dialog.type === "group" && mergedMessages.length === 0) {
          startMessagesLoading();
          bottomLockToken += 1;
          messageList.classList.remove("preparing-bottom");
          const groupName = escapeHtml(dialog.title || "Group");
          messageList.classList.remove("saved-empty");
          messageList.innerHTML = '<div class="direct-empty-state"><div class="direct-empty-card"><h3>Group "' + groupName + '"</h3><p>Groups can have:</p><p>✓ Up to 20,000 members</p><p>✓ Persistent chat history</p><p>✓ Public links such as thegrapht.su/g/' + escapeHtml(dialog.publicId) + '</p><p>✓ Admins with different rights</p></div></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          finishMessagesLoading();
          finishDialogSwitchTransition();
          return;
        }

        messageList.classList.remove("saved-empty");
        suppressBottomLockCancel = true;
        const hasRestoreScrollTop = typeof options.restoreScrollTop === "number";
        const shouldPrepareBottom = options.scrollBehavior !== "none" && !hasRestoreScrollTop;
        const forceBottomForRender = shouldPrepareBottom && (options.scrollBehavior === "auto" || options.forceScrollBottom);
        const applyRestoredScrollTop = () => {
          if (!hasRestoreScrollTop) {
            return false;
          }

          suppressBottomLockCancel = true;
          const maxTop = Math.max(0, messageList.scrollHeight - messageList.clientHeight);
          const nextTop = Math.min(maxTop, Math.max(0, Number(options.restoreScrollTop) || 0));
          messageList.scrollTop = nextTop;
          requestAnimationFrame(() => {
            window.setTimeout(() => {
              suppressBottomLockCancel = false;
            }, 150);
            syncChatScrollBottomButton();
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
          const sorted = sortMessagesChronologically(mergedMessages);
          const firstUnread = sorted[sorted.length - dialog.unreadCount];
          if (firstUnread) {
            firstUnreadMessageId = firstUnread.id;
          }
        }

        let renderedUnreadDivider = false;
        messageList.innerHTML = normalizedItems.map((item) => {
          let prefix = "";
          if (firstUnreadMessageId && !renderedUnreadDivider && item.messages) {
            const hasFirstUnread = item.messages.some(m => m && m.id === firstUnreadMessageId);
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
        if (chatSearchPanel.classList.contains("open")) {
          renderChatSearchResults();
        }
        syncActiveCallChip();
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
            if (forceBottomForRender && !bottomLockCanceledByUser) {
              hardPinMessagesToBottom(renderLockToken);
            }
            window.setTimeout(() => {
              suppressBottomLockCancel = false;
            }, 150);
            finishMessagesLoading();
            return;
          }
          if (!applyRestoredScrollTop()) {
            syncChatScrollBottomButton();
            window.setTimeout(() => {
              suppressBottomLockCancel = false;
            }, 150);
          }
          finishMessagesLoading();
        });
        finishDialogSwitchTransition();
      };

      const fetchJson = async (url, options = {}) => {
        const requestHeaders = {
          ...(options.headers || {})
        };

        if (legacySessionToken && !requestHeaders.Authorization) {
          requestHeaders.Authorization = "Bearer " + legacySessionToken;
        }

        startTopProgress();

        try {
          let response;

          try {
            response = await fetch(url, {
              credentials: "include",
              headers: requestHeaders,
              ...options
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
              persistLegacySessionToken("");
              if (currentUserId) {
                handleUnauthorizedSession(payload.error || "Session ended. Please sign in again.");
              } else {
                disableRealtime();
              }
            }

            throw new Error(payload.error || "Request failed.");
          }

          return payload;
        } finally {
          finishTopProgress();
        }
      };

      const applyRoute = (publicId) => {
        const nextPath = resolveRoutePathForDialogPublicId(publicId);
        if (window.location.pathname !== nextPath) {
          window.history.pushState({}, "", nextPath);
        }
      };

      const uiRenderDebugEnabled = true;
      const uiRenderDebug = (event, details = {}) => {
        if (!uiRenderDebugEnabled) {
          return;
        }
        try {
          console.log("[TheGraphT UI DEBUG]", event, {
            ts: Date.now(),
            route: window.location.pathname || "/",
            currentDialogPublicId: currentDialogPublicId || null,
            currentDialogId: currentDialogId || null,
            ...details
          });
        } catch {}
      };

      const warmupDialogMediaInBackground = (messages = [], options = {}) => {
        const targetPublicId = String(options.targetPublicId || "");
        const targetLoadToken = Number(options.targetLoadToken) || 0;
        const start = () => {
          void preloadDialogMediaDimensions(messages, {
            limit: Number(options.limit) || 12,
            chunkSize: Number(options.chunkSize) || 4,
            timeBudgetMs: Number(options.timeBudgetMs) || 140,
            shouldContinue: () => (
              currentDialogPublicId === targetPublicId
              && activeDialogLoadToken === targetLoadToken
            )
          });
          prefetchDialogMedia(messages);
        };

        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(start, { timeout: 180 });
          return;
        }

        window.setTimeout(start, 0);
      };

      const loadDialog = async (publicId, options = {}) => {
        uiRenderDebug("loadDialog:start", {
          publicId: publicId || null,
          options
        });
        if (!publicId) {
          return;
        }

        if (currentDialogPublicId === publicId && currentDialogSnapshot && !options.forceReload) {
          if (!options.skipHistory) {
            applyRoute(publicId);
          }
          return;
        }

        if (currentDialogId && currentDialogPublicId !== publicId) {
          sendTypingState(false);
          rememberCurrentDialogScrollTop();
        }

        if (currentDialogPublicId !== publicId) {
          clearPendingReplyMessage();
          closeChatProfilePanel();
          if (activeCall && activeCall.dialogPublicId !== publicId) {
            minimizeCallModal();
          }
        }

        activeDialogLoadToken += 1;
        const loadToken = activeDialogLoadToken;
        const cachedPayload = options.skipCache ? null : getDialogPayloadCache(publicId);
        
        const shouldRestoreScrollTop = Boolean(options.restoreScrollOnOpen)
          || visitedDialogsInSession.has(publicId)
          || dialogScrollTopCache.has(publicId);
        const restoredScrollTop = shouldRestoreScrollTop ? getDialogScrollTop(publicId) : 0;
        const hasRestoredScrollTop = shouldRestoreScrollTop
          && Number.isFinite(restoredScrollTop)
          && restoredScrollTop > 0;

        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
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
          currentDialogId = cachedPayload.dialog.id;
          currentDialogPublicId = cachedPayload.dialog.publicId;
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = cachedPayload.dialog.peerReadAt || null;
          renderMessages(cachedPayload.dialog, cachedPayload.messages, {
            // Keep cached dialog instant: no loading overlay or delayed reveal.
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

          if (pendingDialogPublicIdFromNotification === cachedPayload.dialog.publicId) {
            pendingDialogPublicIdFromNotification = "";
          }

          pendingAutoBottomDialogPublicId = "";
          void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(cachedPayload.dialog.publicId) + "/read", {
            method: "POST"
          }).catch(() => {});
          sendCurrentPresence();
          return;
        }

        const previewDialog = allDialogs.find((d) => d.publicId === publicId);
        if (previewDialog) {
          currentDialogId = previewDialog.id;
          currentDialogPublicId = previewDialog.publicId;
          currentDialogSnapshot = previewDialog;
          currentMessagesSnapshot = [];
          
          chatTitle.textContent = previewDialog.title;
          chatSubtitle.textContent = formatDialogSubtitle(previewDialog) || "";
          syncChatHeaderMeta();
          syncChatProfilePanel();
          
          workspaceMain.classList.remove("empty-chat");
          workspaceMain.classList.add("open-chat");
          chatStage.classList.remove("empty");
          chatStage.classList.add("open-chat");
          chatComposer.style.display = "flex";
          
          syncMobileChatOpenState(true);
          setSidebarComposeOpen(false);
          setSidebarMenuOpen(false);
          syncComposerState();
        } else {
          currentDialogId = "";
          currentDialogPublicId = publicId;
          currentDialogSnapshot = null;
          currentMessagesSnapshot = [];
          
          chatTitle.textContent = "Loading...";
          chatSubtitle.textContent = "";
          syncChatHeaderMeta();
          syncChatProfilePanel();
          
          workspaceMain.classList.remove("empty-chat");
          workspaceMain.classList.add("open-chat");
          chatStage.classList.remove("empty");
          chatStage.classList.add("open-chat");
          chatComposer.style.display = "none";
          
          syncMobileChatOpenState(true);
          setSidebarComposeOpen(false);
          setSidebarMenuOpen(false);
          syncComposerState();
        }

        pendingAutoBottomDialogPublicId = publicId;
        pendingAutoBottomCanceled = false;
        forceBottomOnNextDialogRender = !hasRestoredScrollTop && options.scrollBehavior !== "none";

        try {
          messageList.innerHTML = '            <div class="chat-spinner-container">              <div class="boot-splash-inner">                <svg class="boot-splash-circular" viewBox="22 22 44 44" aria-hidden="true" focusable="false">                  <circle class="boot-splash-circular-indicator" cx="44" cy="44" r="20.2"></circle>                </svg>              </div>            </div>          ';
          
          const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(publicId) + "/messages");
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.messages || []);

          if (loadToken !== activeDialogLoadToken) {
            return;
          }

          setDialogPayloadCache(publicId, preparedPayload);
          currentDialogId = preparedPayload.dialog.id;
          currentDialogPublicId = preparedPayload.dialog.publicId;
          if (pendingDialogPublicIdFromNotification === preparedPayload.dialog.publicId) {
            pendingDialogPublicIdFromNotification = "";
          }
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = preparedPayload.dialog.peerReadAt || null;
          const cachedSignature = cachedPayload?.messages
            ? cachedPayload.messages.map((message) => message.id).join("|")
            : "";
          const nextSignature = (preparedPayload.messages || []).map((message) => message.id).join("|");
          const lastPreparedMessage = (preparedPayload.messages || []).length
            ? preparedPayload.messages[preparedPayload.messages.length - 1]
            : null;

          if (lastPreparedMessage && !lastPreparedMessage.decryptionFailed) {
            updateDialogInState(preparedPayload.dialog, {
              lastMessagePreview: getMessagePreviewText(lastPreparedMessage),
              lastMessageSenderName: lastPreparedMessage.senderId === currentUserId
                ? "You"
                : (lastPreparedMessage.senderName || preparedPayload.dialog?.title || ""),
              lastMessageCreatedAt: lastPreparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
            });
            if (!currentSearchQuery.trim()) {
              renderDialogs(allDialogs);
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
            currentDialogSnapshot = preparedPayload.dialog;
            currentMessagesSnapshot = preparedPayload.messages || [];
            visitedDialogsInSession.add(preparedPayload.dialog.publicId);
            refreshCurrentDialogChrome();
            warmupDialogMediaInBackground(preparedPayload.messages, {
              targetPublicId: preparedPayload.dialog.publicId,
              targetLoadToken: loadToken
            });
          }
          pendingAutoBottomDialogPublicId = "";
          if (preparedPayload.dialog?.publicId) {
            void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(preparedPayload.dialog.publicId) + "/read", {
              method: "POST"
            }).catch(() => {});
          }
          sendCurrentPresence();
        } catch (error) {
          pendingAutoBottomDialogPublicId = "";
          finishDialogSwitchTransition();
          throw error;
        }
      };

      let workspaceLoadInFlightPromise = null;

      const loadWorkspace = (options = {}) => {
        uiRenderDebug("loadWorkspace:requested", { options, inFlight: Boolean(workspaceLoadInFlightPromise) });
        if (workspaceLoadInFlightPromise) {
          uiRenderDebug("loadWorkspace:joined_inflight", { options });
          return workspaceLoadInFlightPromise;
        }

        workspaceLoadInFlightPromise = (async () => {
          const isInitialWorkspaceBoot = pageRoot.classList.contains("booting");

          if (currentUserId) {
            uiRenderDebug("loadWorkspace:start_transition", { options });
            startDialogSwitchTransition();
          }

          const routedToken = pendingDialogPublicIdFromNotification
            || (
              options.preserveRoute
                ? currentDialogPublicId || getRoutedPublicId()
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
          const payload = await fetchJson(
            apiBase + "/v1/client-state" + (clientStateParams.toString() ? "?" + clientStateParams.toString() : "")
          );

          currentUserId = payload.user.id;
          currentUserUsername = payload.user.username || "";
          currentUserEmail = payload.user.email || "";
          currentUserDisplayName = payload.user.displayName || payload.user.username || payload.user.email || "TheGraphT user";
          currentUserAvatarLetter = String(currentUserDisplayName || "?").trim().charAt(0).toUpperCase() || "?";
          currentUserAvatarUrl = String(
            payload?.user?.avatarUrl
            || payload?.user?.photoUrl
            || payload?.user?.avatarDataUrl
            || payload?.user?.profilePhotoUrl
            || ""
          ).trim();
          secureFeatureState.identityPromise = null;
          secureFeatureState.publishPromise = null;
          const hydrateDialogPreviewsForSidebar = async (dialogs) => Array.isArray(dialogs) ? dialogs : [];

          workspaceUserName.textContent = currentUserDisplayName;
          allDialogs = await hydrateDialogPreviewsForSidebar(payload.dialogs || []);
          if (routeIsUsername) {
            const routedUsername = String(routedToken || "").replace(/^@+/, "").trim().toLowerCase();
            routedUsernameFromRoute = routedUsername;
            if (routedUsername) {
              let targetDialog = allDialogs.find((dialog) => (
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
            const cloudDialogForUsername = allDialogs.find((dialog) => (
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
          currentDialogId = finalSelection.dialog ? finalSelection.dialog.id : "";
          currentDialogPublicId = finalSelection.dialog ? finalSelection.dialog.publicId : "";
          if (currentDialogPublicId) {
            allDialogs = allDialogs.map((dialog) => dialog.publicId === currentDialogPublicId
              ? { ...dialog, unreadCount: 0 }
              : dialog);
          }
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = finalSelection.dialog?.peerReadAt || null;
          if (currentSearchQuery.trim()) {
            renderSearchResults(currentSearchResults);
          } else {
            renderDialogs(allDialogs);
          }
          if (finalSelection.dialog?.publicId) {
            setDialogPayloadCache(finalSelection.dialog.publicId, finalSelection);
          }
          forceBottomOnNextDialogRender = Boolean(finalSelection.dialog?.publicId) && options.scrollBehavior !== "none";
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
              targetLoadToken: activeDialogLoadToken
            });
          }
          uiRenderDebug("loadWorkspace:renderMessages", {
            selectedDialogPublicId: finalSelection.dialog?.publicId || null,
            selectedMessageCount: Array.isArray(finalSelection.messages) ? finalSelection.messages.length : 0,
            options
          });
          if (pendingDialogPublicIdFromNotification && finalSelection.dialog?.publicId === pendingDialogPublicIdFromNotification) {
            pendingDialogPublicIdFromNotification = "";
          }
          bindNotificationPermissionPrompt();
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
        if (currentUserId) {
          void loadWorkspace().catch(() => {
            finishBoot(false);
          });
        }
      });

      startNotificationOwnershipHeartbeat();
      startPrimaryTabOwnershipHeartbeat();

      window.addEventListener("focus", () => {
        refreshNotificationOwnership();
        refreshPrimaryTabOwnership();
        scheduleBackgroundRefresh();
      });

      document.addEventListener("visibilitychange", () => {
        refreshNotificationOwnership();
        refreshPrimaryTabOwnership();
        scheduleBackgroundRefresh();
      });

      window.addEventListener("storage", (event) => {
        if (event.key === ACTIVE_TAB_OWNER_STORAGE_KEY) {
          refreshPrimaryTabOwnership();
        }
      });

      window.addEventListener("beforeunload", () => {
        releasePrimaryTabOwnership();
      });

      const shouldBlockWorkspaceClipboard = () => !workspaceView.classList.contains("hidden");
      const isEditableTarget = (target) => {
        if (!(target instanceof Element)) {
          return false;
        }
        return Boolean(target.closest("input, textarea, [contenteditable='true'], [contenteditable='plaintext-only']"));
      };
      const isMessageTextTarget = (target) => {
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

        if (workspaceView.classList.contains("hidden")) {
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

      dialogList.addEventListener("contextmenu", (event) => {
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
        if (event.key === "Escape" && dialogContextMenu.classList.contains("open")) {
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

        if (event.key === "Escape" && sidebarProfilePanel && sidebarProfilePanel.getAttribute("aria-hidden") === "false") {
          event.preventDefault();
          event.stopPropagation();
          closeSidebarProfilePanel();
          return;
        }

        if (event.key === "Escape" && viewerModal.classList.contains("open")) {
          closeViewerModal();
          return;
        }

        if (event.key === "Escape" && chatProfilePanel.classList.contains("open")) {
          closeChatProfilePanel();
          return;
        }

        if (event.key === "Escape" && chatSearchPanel.classList.contains("open")) {
          closeChatSearch();
          return;
        }

        if (event.key === "Escape" && attachmentModal.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeAttachmentModal();
          return;
        }

        if (attachmentModal.classList.contains("open") && event.key === "ArrowLeft") {
          event.preventDefault();
          moveAttachmentModal(-1);
          return;
        }

        if (attachmentModal.classList.contains("open") && event.key === "ArrowRight") {
          event.preventDefault();
          moveAttachmentModal(1);
          return;
        }

        if ((event.key === "+" || event.key === "=") && event.ctrlKey && viewerModal.classList.contains("open")) {
          event.preventDefault();
          setViewerZoom(viewerZoom + 0.14);
          return;
        }

        if (event.key === "-" && event.ctrlKey && viewerModal.classList.contains("open")) {
          event.preventDefault();
          setViewerZoom(viewerZoom - 0.14);
          return;
        }

        if (event.key === "Escape" && currentDialogId) {
          closeDialogWithMotion();
        }
      });

      sidebarSearch.addEventListener("input", () => {
        currentSearchQuery = sidebarSearch.value || "";
        if (searchDelayTimer) {
          window.clearTimeout(searchDelayTimer);
          searchDelayTimer = null;
        }

        if (!currentSearchQuery.trim()) {
          currentSearchResults = [];
          renderDialogs(allDialogs, { animate: true });
          return;
        }

        renderSearchLoadingState();
        const requestId = ++searchRequestId;
        searchDelayTimer = window.setTimeout(() => {
          void (async () => {
            try {
              const payload = await fetchJson(usersSearchApiUrl + "?q=" + encodeURIComponent(currentSearchQuery.trim()));

              if (requestId !== searchRequestId) {
                return;
              }

              currentSearchResults = payload.users || [];
              renderSearchResults(currentSearchResults);
            } catch (error) {
              if (requestId !== searchRequestId) {
                return;
              }

              currentSearchResults = [];
              dialogList.classList.remove("search-loading");
              dialogList.classList.add("search-empty");
              dialogList.innerHTML = '<div class="search-empty-state"><p class="search-empty-title">Search unavailable</p><p class="search-empty-copy">Failed to load users.</p></div>';
              showToast(error instanceof Error ? error.message : "Search is currently unavailable.", "error");
            }
          })();
        }, 240);
      });

      sidebarMenuButton?.addEventListener("click", () => {
        toggleSidebarMenu();
      });

      let composeHoverTimeout = null;

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

      const handleComposeAction = (label) => {
        setSidebarComposeOpen(false);
        showToast(label + " is coming soon.", "info");
      };

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
              const upsertedDialog = updateDialogInState(preparedPayload.dialog, {
                lastMessagePreview: preparedPayload.dialog.lastMessagePreview || "Secure messages",
                lastMessageSenderName: preparedPayload.dialog.lastMessageSenderName || null,
                lastMessageCreatedAt: preparedPayload.dialog.lastMessageCreatedAt || new Date().toISOString()
              });
              if (!upsertedDialog) {
                allDialogs.unshift(preparedPayload.dialog);
              }
              if (!currentSearchQuery.trim()) {
                renderDialogs(allDialogs);
              }
              closeGroupCreatePanel();
              await loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
            } catch (error) {
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
            .map((dialog) => String(dialog.peerUserId || "").trim())
            .filter(Boolean)
        ));
        if (!memberUserIds.length) {
          showToast("Select at least one member with a valid user.", "info");
          return;
        }
        (async () => {
          try {
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
            const updatedDialog = updateDialogInState(preparedPayload.dialog, {
              lastMessagePreview: "You created a group",
              lastMessageSenderName: "You",
              lastMessageCreatedAt: new Date().toISOString()
            });
            if (!updatedDialog) {
              allDialogs.unshift({
                ...preparedPayload.dialog,
                lastMessagePreview: "You created a group",
                lastMessageSenderName: "You",
                lastMessageCreatedAt: new Date().toISOString()
              });
            }
            if (!currentSearchQuery.trim()) {
              renderDialogs(allDialogs);
            }
            applyRoute(preparedPayload.dialog.publicId);
            closeGroupCreatePanel();
            void loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
          } catch (error) {
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

      const sidebarProfilePanel = document.getElementById("sidebar-profile-panel");


      const sidebarProfileBack = document.getElementById("sidebar-profile-back");
      const sidebarProfileAvatarEl = document.getElementById("sidebar-profile-avatar");
      const sidebarProfileDisplayName = document.getElementById("sidebar-profile-display-name");
      const sidebarProfileUsername = document.getElementById("sidebar-profile-username");

      const openSidebarProfilePanel = () => {
        if (!sidebarProfilePanel) { return; }
        // Populate display name
        const displayName = String(currentUserDisplayName || currentUserUsername || currentUserEmail || "You").trim();
        if (sidebarProfileDisplayName) {
          sidebarProfileDisplayName.textContent = displayName;
        }
        // Populate username
        const rawUsername = String(currentUserUsername || "").trim();
        if (sidebarProfileUsername) {
          sidebarProfileUsername.textContent = rawUsername ? ("@" + rawUsername) : "";
        }
        // Populate avatar
        if (sidebarProfileAvatarEl) {
          const avatarUrl = String(currentUserAvatarUrl || "").trim();
          if (avatarUrl) {
            sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="' + escapeHtml(avatarUrl) + '" alt="' + escapeHtml(displayName) + '" />';
            sidebarProfileAvatarEl.removeAttribute("style");
          } else {
            const meta = typeof getAvatarMeta === "function"
              ? getAvatarMeta(currentUserId || displayName, displayName)
              : null;
            if (meta) {
              sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="' + meta.avatarUrl + '" alt="' + escapeHtml(meta.letter || "?") + '" />';
              sidebarProfileAvatarEl.style.cssText = meta.style || "";
            } else {
              const seed = String(currentUserId || displayName || "?");
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

      const closeSidebarProfilePanel = () => {
        gsapCloseSidebar(sidebarProfilePanel);
      };

      sidebarMenuProfile?.addEventListener("click", () => {
        setSidebarMenuOpen(false);
        openSidebarProfilePanel();
      });

      sidebarProfileBack?.addEventListener("click", () => {
        closeSidebarProfilePanel();
      });

      sidebarMenuSaved?.addEventListener("click", () => {
        const savedDialog = allDialogs.find((dialog) => dialog.type === "saved");
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

      syncSidebarWidth();

      sidebarResizeHandle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        startSidebarResize(event.clientX);
      });

      sidebarResizeHandle.addEventListener("dblclick", () => {
        applySidebarWidth(360);
      });

      window.addEventListener("pointermove", (event) => {
        updateSidebarResize(event.clientX);
      });

      window.addEventListener("pointerup", () => {
        stopSidebarResize();
      });

      window.addEventListener("pointercancel", () => {
        stopSidebarResize();
      });

      window.addEventListener("resize", () => {
        syncSidebarWidth();
      });

      composerInput.addEventListener("input", () => {
        syncComposerState();

        if (!currentDialogId || !realtimeEnabled) {
          return;
        }

        if (!composerInput.value.trim()) {
          sendTypingState(false);
          return;
        }

        sendTypingState(true);
        scheduleTypingStop();
      });

      ["select", "keyup", "mouseup", "focus", "blur"].forEach((eventName) => {
        composerInput.addEventListener(eventName, () => {
          renderComposerOverlay();
        });
      });

      const sendCurrentMessage = async () => {
        if (textMessageSendInFlight) {
          return;
        }

        const body = composerInput.value.trim();

        if (!body || !currentDialogPublicId) {
          return;
        }

        const isGifUrl = (body.startsWith("http://") || body.startsWith("https://")) &&
                         (body.split("?")[0].split("#")[0].toLowerCase().endsWith(".gif"));
        if (isGifUrl) {
          rememberRecentGif(body);
        }

        textMessageSendInFlight = true;
        composerSend.disabled = true;
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
        localOutgoingMessages.push({
          id: localMessageId,
          dialogPublicId: currentDialogPublicId,
          senderId: currentUserId,
          senderName: currentUserDisplayName || currentUserUsername || workspaceUserName.textContent || "You",
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
        composerInput.value = "";
        composerInput.style.height = "48px";
        composerInput.style.overflowY = "hidden";
        syncComposerState();
        composerInput.focus({ preventScroll: true });
        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
          typingStopTimer = null;
        }
        sendTypingState(false);
        const appendedLocal = appendLocalOutgoingMessageToCurrentDialog(localOutgoingMessages[localOutgoingMessages.length - 1], {
          scrollBehavior: "smooth",
          forceScrollBottom: true
        });
        if (!appendedLocal) {
          rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
        }
        playSound("send");

        try {
          const payload = isSecureDialog(currentDialogSnapshot)
            ? await (async () => {
                const encrypted = await encryptSecureMessageBody(currentDialogSnapshot, body);
                return fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages", {
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
            : await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages", {
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

          removeLocalOutgoingMessage(localMessageId);
          updateDialogInState(preparedPayload.dialog, {
            lastMessagePreview: getMessagePreviewText(preparedMessage) || body,
            lastMessageSenderName: preparedMessage.senderId === currentUserId
              ? "You"
              : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
            lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
          });
          if (preparedPayload.dialog?.id === currentDialogId && preparedMessage) {
            appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
              scrollBehavior: "smooth",
              animateList: false,
              forceScrollBottom: true,
              animateMessage: false,
              replaceMessageId: localMessageId
            });
          } else {
            rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
          }

          if (!currentSearchQuery.trim()) {
            renderDialogs(allDialogs);
          }
        } catch (error) {
          localOutgoingMessages = localOutgoingMessages.map((message) => (
            message.id === localMessageId
              ? { ...message, localStatus: "failed" }
              : message
          ));
          setStatus(error instanceof Error ? error.message : "Failed to send message.", "error");
          showToast(error instanceof Error ? error.message : "Failed to send message.", "error");
          updateRenderedMessageStatus(localMessageId, "failed");
        } finally {
          window.clearTimeout(timeoutId);
          composerSend.disabled = false;
          textMessageSendInFlight = false;
        }
      };

      composerSend.addEventListener("click", () => {
        void sendCurrentMessage();
      });

      composerEmojiButton.addEventListener("mouseenter", () => {
        openEmojiPicker();
      });

      composerEmojiButton.addEventListener("mouseleave", () => {
        scheduleEmojiPickerClose();
      });

      composerEmojiButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (emojiPicker.classList.contains("open")) {
          closeEmojiPicker();
        } else {
          openEmojiPicker();
        }
      });

      const renderAttachmentEmojiPicker = () => {
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
          const emojiChar = emojiTabIcons[section.key] || "";
          const emojiAssetUrl = getEmojiAssetUrl(emojiChar);
          const iconHtml = emojiAssetUrl
            ? '<img class="emoji-picker-tab-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emojiChar) + '" onerror=\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\' aria-hidden="true" loading="lazy" decoding="async">'
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
                        ? '<img class="emoji-button-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emoji) + '" onerror=\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\' aria-hidden="true" loading="lazy" decoding="async">'
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
            if (!emoji) {
              return;
            }

            const selectionStart = attachmentModalCaption.selectionStart ?? attachmentModalCaption.value.length;
            const selectionEnd = attachmentModalCaption.selectionEnd ?? attachmentModalCaption.value.length;
            attachmentModalCaption.value = attachmentModalCaption.value.slice(0, selectionStart) + emoji + attachmentModalCaption.value.slice(selectionEnd);
            pendingImageCaption = attachmentModalCaption.value;
            attachmentModalCaption.focus();
            attachmentModalCaption.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
            rememberRecentEmoji(emoji);
            renderAttachmentEmojiPicker();
          });
        });
      };

      const closeAttachmentEmojiPicker = () => {
        attachmentModalEmojiPicker.classList.remove("open");
        attachmentModalEmojiPicker.setAttribute("aria-hidden", "true");
      };

      const openAttachmentEmojiPicker = () => {
        renderAttachmentEmojiPicker();
        attachmentModalEmojiPicker.classList.add("open");
        attachmentModalEmojiPicker.setAttribute("aria-hidden", "false");
      };

      attachmentModalEmojiButton?.addEventListener("click", (event) => {
        event.preventDefault();
        if (attachmentModalEmojiPicker.classList.contains("open")) {
          closeAttachmentEmojiPicker();
        } else {
          openAttachmentEmojiPicker();
        }
      });

      emojiPicker.addEventListener("mouseenter", () => {
        openEmojiPicker();
      });

      emojiPicker.addEventListener("mouseleave", () => {
        scheduleEmojiPickerClose();
      });

      if (emojiPickerSearch) {
        emojiPickerSearch.addEventListener("input", () => {
          if (pickerMode === "emoji") {
            renderEmojiPicker();
          } else {
            renderGifPicker();
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
      const emojiPickerSlideContainer = emojiPicker.querySelector(".emoji-picker-slide-container");
      if (emojiPickerSlideContainer && emojiPickerSlideTrack) {
        let startX = 0;
        let startY = 0;
        let isSwiping = false;

        emojiPickerSlideContainer.addEventListener("pointerdown", (e) => {
          if (e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea")) {
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

          // If vertical scroll is dominating, cancel swipe
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

        const endSwipe = (e) => {
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

      composerAttachButton.addEventListener("mouseenter", () => {
        openAttachMenu();
      });

      composerAttachButton.addEventListener("mouseleave", () => {
        scheduleAttachMenuClose();
      });

      attachMenu.addEventListener("mouseenter", () => {
        openAttachMenu();
      });

      attachMenu.addEventListener("mouseleave", () => {
        scheduleAttachMenuClose();
      });

      composerAttachButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (attachMenu.classList.contains("open")) {
          closeAttachMenu();
        } else {
          openAttachMenu();
        }
      });

      attachMenu.querySelectorAll(".attach-menu-item").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.classList.contains("disabled")) {
            return;
          }

          button.classList.add("pressed");
          window.setTimeout(() => {
            button.classList.remove("pressed");
          }, 120);

          if (button.dataset.attachAction === "media") {
            closeAttachMenu();
            if (pendingImageAttachments.length || pendingFileAttachments.length) {
              clearPendingImageAttachment();
            }
            composerFileInput.setAttribute("accept", "image/png,image/jpeg,image/webp,image/gif");
            composerFileInput.dataset.attachMode = "media";
            composerFileInput.multiple = true;
            composerFileInput.click();
            return;
          }

          if (button.dataset.attachAction === "file") {
            closeAttachMenu();
            if (pendingImageAttachments.length || pendingFileAttachments.length) {
              clearPendingImageAttachment();
            }
            composerFileInput.setAttribute("accept", "audio/*");
            composerFileInput.dataset.attachMode = "file";
            composerFileInput.multiple = true;
            composerFileInput.click();
          }
        });
      });

      composerFileInput.addEventListener("change", () => {
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

      composerAttachmentRemove.addEventListener("click", () => {
        clearPendingImageAttachment();
      });

      attachmentModalClose.addEventListener("click", () => {
        closeAttachmentModal();
      });

      attachmentModalPrev.addEventListener("click", () => {
        moveAttachmentModal(-1);
      });

      attachmentModalNext.addEventListener("click", () => {
        moveAttachmentModal(1);
      });

      attachmentModal.addEventListener("click", (event) => {
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

      attachmentModalCaption.addEventListener("input", () => {
        pendingImageCaption = attachmentModalCaption.value;
      });

      attachmentModalCaption.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          attachmentModalSend.click();
        }
      });

      attachmentModalSend.addEventListener("click", () => {
        void (async () => {
          if (mediaMessageSendInFlight) {
            return;
          }

          if (attachmentModalMode === "file") {
            if (!pendingFileAttachments.length) {
              return;
            }
            mediaMessageSendInFlight = true;
            attachmentModalSend.disabled = true;
            attachmentModalCaption.disabled = true;
            const attachmentsToSend = pendingFileAttachments.slice();
            const previewUrlsToPreserve = attachmentsToSend.map((attachment) => attachment.previewUrl);
            const caption = attachmentModalCaption.value.trim();
            clearPendingImageAttachment({ preservePreviewUrls: previewUrlsToPreserve });
            try {
              await uploadAudioBatch({
                attachments: attachmentsToSend,
                caption
              });
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Failed to send audio.", "error");
              showToast(error instanceof Error ? error.message : "Failed to send audio.", "error");
            } finally {
              attachmentModalSend.disabled = false;
              attachmentModalCaption.disabled = false;
              mediaMessageSendInFlight = false;
            }
            return;
          }
          if (!pendingImageAttachments.length) {
            return;
          }

          mediaMessageSendInFlight = true;
          attachmentModalSend.disabled = true;
          attachmentModalCaption.disabled = true;

          const attachmentsToSend = pendingImageAttachments.slice();
          const previewUrlsToPreserve = attachmentsToSend.map((attachment) => attachment.previewUrl);
          const caption = attachmentModalCaption.value.trim();
          clearPendingImageAttachment({ preservePreviewUrls: previewUrlsToPreserve });

          try {
            await uploadImageBatch({
              attachments: attachmentsToSend,
              caption
            });
          } catch (error) {
            setStatus(error instanceof Error ? error.message : "Failed to send photos.", "error");
            showToast(error instanceof Error ? error.message : "Failed to send photos.", "error");
          } finally {
            attachmentModalSend.disabled = false;
            attachmentModalCaption.disabled = false;
            mediaMessageSendInFlight = false;
          }
        })();
      });

      composerInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          void sendCurrentMessage();
        }
      });

      composerInput.addEventListener("paste", (event) => {
        const imageItems = Array.from(event.clipboardData?.items || []).filter((item) => item.type.startsWith("image/"));

        if (!imageItems.length) {
          return;
        }

        event.preventDefault();
        void addPendingImageAttachments(
          imageItems
            .map((item) => item.getAsFile())
            .filter(Boolean)
        );
      });

      ["dragenter", "dragover"].forEach((eventName) => {
        chatStage.addEventListener(eventName, (event) => {
          const hasImages = Array.from(event.dataTransfer?.items || []).some((item) => item.type.startsWith("image/"));

          if (!hasImages) {
            return;
          }

          event.preventDefault();
          chatStage.classList.add("drag-active");
        });
      });

      ["dragleave", "dragend", "drop"].forEach((eventName) => {
        chatStage.addEventListener(eventName, () => {
          chatStage.classList.remove("drag-active");
        });
      });

      chatStage.addEventListener("drop", (event) => {
        const files = Array.from(event.dataTransfer?.files || []).filter((file) => String(file.type || "").startsWith("image/"));

        if (!files.length) {
          return;
        }

        event.preventDefault();
        void addPendingImageAttachments(files);
      });

      // TheGraphT Chat AI Panel interactions
      const sidebarAiPanel = document.getElementById("sidebar-ai-panel");
      const sidebarAiButton = document.getElementById("sidebar-ai-button");
      const sidebarAiClose = document.getElementById("sidebar-ai-close");
      const sidebarAiMessages = document.getElementById("sidebar-ai-messages");
      const sidebarAiInput = document.getElementById("sidebar-ai-input");
      const sidebarAiSend = document.getElementById("sidebar-ai-send");
      const sidebarAiPillsWrap = document.getElementById("sidebar-ai-pills-wrap");
      const sidebarAiPills = document.getElementById("sidebar-ai-pills");
      let aiHistory = [];
      let activeAiController = null;

      // Translate vertical mouse wheel scrolling to horizontal scroll for pills wrapper
      if (sidebarAiPillsWrap) {
        sidebarAiPillsWrap.addEventListener("wheel", (e) => {
          if (e.deltaY !== 0) {
            e.preventDefault();
            sidebarAiPillsWrap.scrollTo({
              left: sidebarAiPillsWrap.scrollLeft + e.deltaY * 1.5,
              behavior: "auto"
            });
          }
        });
      }

      // Gather visible chat messages for AI context
      const gatherChatContext = () => {
        const messageListEl = document.getElementById("message-list");
        if (!messageListEl) return "";
        
        // Only target actual messages or rows in the main chat pane (excluding AI sidebar messages)
        const messageEls = messageListEl.querySelectorAll(".message, .group-incoming-row, .message-system-row");
        const lines = [];
        const maxMessages = 40;
        const start = Math.max(0, messageEls.length - maxMessages);
        
        const peerName = currentDialogSnapshot ? (currentDialogSnapshot.title || "Собеседник") : "Собеседник";
        const myName = workspaceUserName ? (workspaceUserName.textContent || "Я") : "Я";
        
        for (let i = start; i < messageEls.length; i++) {
          const el = messageEls[i];
          
          // System message row
          if (el.classList.contains("message-system-row")) {
            const pill = el.querySelector(".message-system-pill");
            if (pill) {
              lines.push("[Системное сообщение]: " + pill.textContent.trim());
            }
            continue;
          }
          
          // Check incoming state
          let isIncoming = el.classList.contains("incoming");
          if (el.classList.contains("group-incoming-row")) {
            isIncoming = true;
          }
          
          const bubble = el.classList.contains("message") ? el : el.querySelector(".message");
          if (!bubble) continue;
          
          // Determine sender name
          let sender = "";
          if (isIncoming) {
            const groupSender = el.querySelector(".group-incoming-sender");
            sender = groupSender ? groupSender.textContent.trim() : peerName;
          } else {
            sender = myName + " (Вы)";
          }
          
          // Find text
          const body = bubble.querySelector(".message-body, .message-text");
          let text = body ? body.textContent.trim() : "";
          
          // Handle attachment fallback descriptions
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
          "Тип чата: " + (currentDialogSnapshot ? (currentDialogSnapshot.type || "Личный чат") : "Личный чат") + "\n" +
          "Текущий пользователь: " + myName + "\n" +
          "=================================\n\n" +
          lines.join("\n");
        return activeChatMeta;
      };

      // Smart Context-Aware Randomized Pill Generator
      const getPillsForContext = (isInitial, replyText = "") => {
        const contextText = gatherChatContext();
        const isRussian = /[а-яА-ЯёЁ]/.test(contextText) || /[а-яА-ЯёЁ]/.test(replyText) || (navigator.language && navigator.language.toLowerCase().startsWith("ru"));
        const peerName = currentDialogSnapshot ? (currentDialogSnapshot.title || (isRussian ? "собеседник" : "partner")) : (isRussian ? "собеседник" : "partner");

        // Analyze topics in the context & replyText
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

        // Collect matching items
        let candidates = [...currentCategory.general];
        if (hasChat) candidates = candidates.concat(currentCategory.chat);
        if (hasCode) candidates = candidates.concat(currentCategory.code);
        if (hasVideo) candidates = candidates.concat(currentCategory.video);
        if (hasTasks) candidates = candidates.concat(currentCategory.tasks);

        // Shuffle candidates using a secure random sort
        const shuffled = candidates.sort(() => 0.5 - Math.random());

        // Deduplicate based on label and take first 3 or 4
        const unique = [];
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

      // Regenerate initial welcome pills
      const regenerateInitialPills = () => {
        if (!sidebarAiPills) return;
        const pills = getPillsForContext(true);
        sidebarAiPills.innerHTML = pills.map((p) => {
          return '<button class="sidebar-ai-pill" type="button" data-prompt="' + escapeHtml(p.prompt) + '">' + escapeHtml(p.label) + '</button>';
        }).join("");
        
        // Re-setup quick prompts clicking
        sidebarAiPills.querySelectorAll(".sidebar-ai-pill").forEach((pill) => {
          pill.addEventListener("click", () => {
            const prompt = pill.getAttribute("data-prompt");
            if (!prompt || !sidebarAiInput) return;
            sidebarAiInput.value = prompt;
            void sendAiMessage();
          });
        });
      };

      // Render follow-up suggestion pills after assistant reply
      const renderFollowUps = (replyText) => {
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

      // Handle and render reply suggestions if present
      const handleAiReplySuggestions = (fullReply, streamBubble) => {
        const suggestionsWrap = document.getElementById("sidebar-ai-suggestions-wrap");
        const suggestionsContainer = document.getElementById("sidebar-ai-suggestions");
        if (!suggestionsWrap || !suggestionsContainer) return;

        // Reset suggestions
        suggestionsWrap.classList.add("hidden");
        suggestionsContainer.innerHTML = "";

        const suggestionsMatch = fullReply.match(/[SUGGESTIONS]([\s\S]*?)[/SUGGESTIONS]/);
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
                const composerInput = document.getElementById("composer-input");
                if (composerInput) {
                  // Flyer Animation
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

                  // Trigger animation
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

                    // Hide suggestions after use
                    suggestionsWrap.classList.add("hidden");
                  }, 600);
                } else {
                  // Fallback
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

          // Strip [SUGGESTIONS] block from message bubble text
          const cleanText = fullReply.replace(/[SUGGESTIONS][\s\S]*?[/SUGGESTIONS]/, "").trim();
          streamBubble.innerHTML = parseMarkdown(cleanText);
        }
      };

      const parseMarkdown = (txt) => {
        if (!txt) return "";
        var html = escapeHtml(txt);
        // Code Block
        var codeBlockRegex = new RegExp(String.fromCharCode(96) + "{3}([^]*?)" + String.fromCharCode(96) + "{3}", "g");
        html = html.replace(codeBlockRegex, "<pre><code>$1</code></pre>");
        // Inline Code
        var inlineCodeRegex = new RegExp(String.fromCharCode(96) + "([^" + String.fromCharCode(96) + String.fromCharCode(10) + "]+)" + String.fromCharCode(96), "g");
        html = html.replace(inlineCodeRegex, "<code>$1</code>");
        // URL Linkification
        var urlRegex = new RegExp("(https?:\/\/[^\s<>'\"]+[^\s\.\,\<\>\'\"])", "gi");
        html = html.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        // Bold-Italic (***)
        var boldItalicRegex = new RegExp("[*][*][*]([^*]+)[*][*][*]", "g");
        html = html.replace(boldItalicRegex, "<strong><em>$1</em></strong>");
        // Bold (**)
        var boldRegex = new RegExp("[*][*]([^*]+)[*][*]", "g");
        html = html.replace(boldRegex, "<strong>$1</strong>");
        // Italic (*)
        var italicRegex = new RegExp("[*]([^*]+)[*]", "g");
        html = html.replace(italicRegex, "<em>$1</em>");
        
        return html.split(String.fromCharCode(10)).map(function(p) {
          return p.trim() ? "<p>" + p + "</p>" : "";
        }).join("");
      };

      const renderAiBubble = (text, isUser = false) => {
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
        // Toggle Stop Generation behavior if currently streaming
        if (activeAiController) {
          activeAiController.abort();
          activeAiController = null;
          if (sidebarAiSend) {
            sidebarAiSend.classList.remove("is-streaming");
            sidebarAiSend.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">arrow_upward</span>';
          }
          
          // Append italicized stopped label
          const stopLabel = document.createElement("div");
          stopLabel.className = "sidebar-ai-stopped-label";
          stopLabel.innerHTML = "<em>Your message was stopped</em>";
          sidebarAiMessages.appendChild(stopLabel);
          sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
          return;
        }

        // Reset suggestions panel
        const suggestionsWrap = document.getElementById("sidebar-ai-suggestions-wrap");
        const suggestionsContainer = document.getElementById("sidebar-ai-suggestions");
        if (suggestionsWrap && suggestionsContainer) {
          suggestionsWrap.classList.add("hidden");
          suggestionsContainer.innerHTML = "";
        }

        const messageText = sidebarAiInput.value.trim();
        if (!messageText) return;
        
        sidebarAiInput.value = "";
        sidebarAiInput.style.height = "auto";
        
        // Remove welcome screen if it exists
        const welcome = sidebarAiMessages.querySelector(".sidebar-ai-welcome");
        if (welcome) {
          welcome.remove();
        }
        
        // Render user message bubble
        renderAiBubble(messageText, true);
        
        // Hide initial quick prompt pills after first message
        if (sidebarAiPillsWrap) sidebarAiPillsWrap.style.display = "none";

        // Remove previous follow-up pills
        sidebarAiMessages.querySelectorAll(".sidebar-ai-follow-up").forEach((el) => el.remove());

        // Create an empty assistant bubble that will be filled in real-time
        const streamBubble = document.createElement("div");
        streamBubble.className = "sidebar-ai-bubble assistant is-generating";
        streamBubble.innerHTML = '<span class="sidebar-ai-cursor"></span>';
        sidebarAiMessages.appendChild(streamBubble);
        sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });

        // Build chat context from visible messages
        const chatContext = gatherChatContext();
        let fullReply = "";
        
        // Calculate exact user local time and timezone
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

        // --- GOOGLE GEMINI PRO CLIENT-SIDE OR BACKEND PROXY STREAMING ---
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
              
              const reader = res.body.getReader();
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
            } catch (err) {
              if (err.name === "AbortError" || err.message.includes("aborted")) {
                return;
              }
              streamBubble.innerHTML = "<p>Error: " + escapeHtml(err.message) + "</p>";
            } finally {
              activeAiController = null;
              streamBubble.classList.remove("is-generating");
              if (sidebarAiSend) {
                sidebarAiSend.classList.remove("is-streaming");
                sidebarAiSend.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">arrow_upward</span>';
              }
            }
            return;
          }
        }

        // --- LOCAL OLLAMA BASE OR SECURE GEMINI PRO STREAMING ---
        try {
          console.log("[TheGraphT AI] Sending request to backend. Model:", currentAiModel, "Message length:", messageText.length);
          const startTime = Date.now();
          
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
          
          const reader = res.body.getReader();
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
            const events = buffer.split(String.fromCharCode(10) + String.fromCharCode(10));
            buffer = events.pop();
            
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
              } catch (parseErr) {
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
        } catch (err) {
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
            sidebarAiSend.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">arrow_upward</span>';
          }
        }
      };

      if (sidebarAiButton) {
        sidebarAiButton.addEventListener("click", () => {
          gsapOpenSidebar(sidebarAiPanel);
          
          // Regenerate initial pills when opening the panel
          regenerateInitialPills();
          if (sidebarAiPillsWrap && sidebarAiMessages.querySelector(".sidebar-ai-welcome")) {
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

      // Close on Escape press
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebarAiPanel && sidebarAiPanel.getAttribute("aria-hidden") === "false") {
          gsapCloseSidebar(sidebarAiPanel);
        }
      });

      if (sidebarAiInput) {
        // Auto-grow textarea height
        sidebarAiInput.addEventListener("input", () => {
          sidebarAiInput.style.height = "auto";
          sidebarAiInput.style.height = sidebarAiInput.scrollHeight + "px";
        });
        
        // Enter key to send (Shift+Enter for new line)
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

      // --- MODEL SELECTOR & GEMINI API KEY LOGIC ---
      const sidebarAiModelSelectorBtn = document.getElementById("sidebar-ai-model-selector-btn");
      const sidebarAiSelectedModelName = document.getElementById("sidebar-ai-selected-model-name");
      const sidebarAiSelectedModelIcon = document.getElementById("sidebar-ai-selected-model-icon");
      const sidebarAiSelectorChevron = document.getElementById("sidebar-ai-selector-chevron");
      const sidebarAiModelMenu = document.getElementById("sidebar-ai-model-menu");
      const sidebarAiCheckBase = document.getElementById("sidebar-ai-check-base");
      const sidebarAiCheckPro = document.getElementById("sidebar-ai-check-pro");
      
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
            // Pro model is locked until June 15
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
            
            proAlert.innerHTML = '<div style="display:flex; align-items:center; gap:8px; font-weight:700; color:#fff;"><span class="material-symbols-rounded" style="color:#a5b4fc; font-size:18px;">lock</span>TheGraphT Chat Pro</div><div style="font-size:13px; opacity:0.9; line-height:1.4;">Интеллектуальная модель станет доступна <strong>15 июня</strong>! Мы готовим для вас самое мощное ИИ-обновление.</div>';
            document.body.appendChild(proAlert);
            setTimeout(() => {
              proAlert.style.opacity = "0";
              proAlert.style.transform = "translateY(8px)";
              setTimeout(() => proAlert.remove(), 300);
            }, 4000);
          }
          
          sidebarAiModelMenu.classList.remove("open");
          if (sidebarAiSelectorChevron) sidebarAiSelectorChevron.style.transform = "rotate(0)";
        });
      });

      // Initial call to sync UI
      updateSelectedModelUI();

      // Setup initial quick prompts clicking & trigger first load generation
      regenerateInitialPills();


      const messageHighlightTimers = new Map();
      const deletingMessageIdsInFlight = new Set();

      const getCurrentDialogMessageById = (messageId) => (
        currentMessagesSnapshot.find((message) => message.id === messageId)
        || localOutgoingMessages.find((message) => message.id === messageId)
        || null
      );

      const getReplyPreviewCopy = (message) => {
        if (!message) {
          return "";
        }

        if (message.albumId && Number(message.albumSize) > 1) {
          return (Number(message.albumSize) || 0) + " photos";
        }

        if (message.type === "image") {
          return message.body ? ("Photo: " + message.body) : "Photo";
        }

        if (message.type === "audio") {
          return message.body ? ("Audio: " + message.body) : "Audio";
        }

        return String(message.body || "").trim();
      };

      const clearMessageHighlight = (messageId) => {
        const node = messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');
        if (node) {
          node.classList.remove("message-jump-highlight");
        }
        const timerId = messageHighlightTimers.get(messageId);
        if (timerId) {
          window.clearTimeout(timerId);
          messageHighlightTimers.delete(messageId);
        }
      };

      const jumpToMessage = (messageId) => {
        if (!messageId) {
          return;
        }

        const node = messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');
        if (!node) {
          return;
        }

        const scrollHost = messageList;
        let stableFrames = 0;
        let previousTop = scrollHost.scrollTop;
        const maxWaitMs = 1800;
        const startedAt = Date.now();

        const startHighlight = () => {
          clearMessageHighlight(messageId);
          node.classList.remove("message-jump-highlight");
          void node.offsetWidth;
          node.classList.add("message-jump-highlight");
          messageHighlightTimers.set(
            messageId,
            window.setTimeout(() => {
              node.classList.remove("message-jump-highlight");
              messageHighlightTimers.delete(messageId);
            }, 3200)
          );
        };

        const waitForArrival = () => {
          const currentTop = scrollHost.scrollTop;
          const delta = Math.abs(currentTop - previousTop);
          previousTop = currentTop;
          stableFrames = delta < 1 ? stableFrames + 1 : 0;

          if (stableFrames >= 6 || Date.now() - startedAt > maxWaitMs) {
            startHighlight();
            return;
          }

          window.requestAnimationFrame(waitForArrival);
        };

        node.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });

        window.requestAnimationFrame(waitForArrival);
      };

      const syncComposerReplyPreview = () => {
        if (!composerReplyPreview) {
          return;
        }

        if (!pendingReplyMessage) {
          composerReplyPreview.classList.remove("visible");
          composerReplyPreview.setAttribute("aria-hidden", "true");
          composerReplyAuthor.textContent = "";
          composerReplyText.textContent = "";
          return;
        }

        composerReplyAuthor.textContent = pendingReplyMessage.senderName || "Message";
        composerReplyText.innerHTML = renderEmojiAwareTextHtml(getReplyPreviewCopy(pendingReplyMessage) || "Message");
        composerReplyPreview.classList.add("visible");
        composerReplyPreview.setAttribute("aria-hidden", "false");
      };

      const setPendingReplyMessage = (message) => {
        pendingReplyMessage = message
          ? {
              id: message.id,
              senderId: message.senderId || "",
              senderName: message.senderName || (message.senderId === currentUserId ? (currentUserDisplayName || currentUserUsername || workspaceUserName.textContent || "You") : "Message"),
              body: message.body || "",
              type: message.type || "text",
              mediaUrl: message.mediaUrl || ""
            }
          : null;
        syncComposerReplyPreview();
      };

      const clearPendingReplyMessage = () => {
        pendingReplyMessage = null;
        syncComposerReplyPreview();
      };

      const closeMessageContextMenu = () => {
        if (messageContextMenuCloseTimer) {
          window.clearTimeout(messageContextMenuCloseTimer);
          messageContextMenuCloseTimer = null;
        }
        messageContextMenu.classList.remove("open");
        messageContextMenu.setAttribute("aria-hidden", "true");
        messageContextMenuState = null;
      };

      const closeMessageContextMenuSoon = () => {
        if (messageContextMenuCloseTimer) {
          window.clearTimeout(messageContextMenuCloseTimer);
        }
        messageContextMenuCloseTimer = window.setTimeout(() => {
          closeMessageContextMenu();
        }, 140);
      };

      const isMessageDownloadable = (message) => Boolean(
        message?.mediaUrl
        && (message.type === "image" || message.type === "video" || message.type === "audio")
      );

      const resolveDownloadMediaUrl = (rawUrl) => {
        const value = String(rawUrl || "").trim();
        if (!value) {
          return "";
        }
        if (value.startsWith("/v/")) {
          return "https://cdn.thegrapht.su" + value;
        }
        if (/^https?:\/\/web\.thegrapht\.su\/v\//i.test(value)) {
          return value.replace(/^https?:\/\/web\.thegrapht\.su/i, "https://cdn.thegrapht.su");
        }
        return value;
      };

      const buildContextMenuButton = (action, label, icon, danger = false) => (
        '<button class="message-context-menu-item' + (danger ? ' danger' : '') + '" type="button" data-action="' + action + '">' +
          icon +
          '<span>' + label + '</span>' +
        '</button>'
      );

      const getContextMenuActions = (message) => {
        const isOwn = message.senderId === currentUserId;
        const actions = [
          {
            key: "reply",
            label: "Reply",
            icon: '<span class="material-symbols-rounded" aria-hidden="true">reply</span>'
          }
        ];

        if (isMessageDownloadable(message)) {
          actions.push({
            key: "download",
            label: "Download",
            icon: '<span class="material-symbols-rounded" aria-hidden="true">download</span>'
          });
        }

        if (isOwn) {
          actions.push({
            key: "delete",
            label: "Delete",
            icon: '<span class="material-symbols-rounded" aria-hidden="true">delete</span>',
            danger: true
          });
        }

        return actions;
      };

      const openMessageContextMenu = (event, message) => {
        if (!message) {
          return;
        }

        const actions = getContextMenuActions(message);
        messageContextMenuBody.innerHTML = actions
          .map((action) => buildContextMenuButton(action.key, action.label, action.icon, Boolean(action.danger)))
          .join("");

        messageContextMenuState = { message };
        const menuWidth = 220;
        const menuHeight = 160;
        const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
        const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
        messageContextMenu.style.left = left + "px";
        messageContextMenu.style.top = top + "px";
        messageContextMenu.classList.add("open");
        messageContextMenu.setAttribute("aria-hidden", "false");

        messageContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
          button.addEventListener("click", () => {
            const action = button.getAttribute("data-action");
            if (!action) {
              return;
            }

            if (action === "reply") {
              setPendingReplyMessage(message);
              composerInput.focus();
              closeMessageContextMenuSoon();
              return;
            }

            if (action === "download") {
              void downloadMessageMedia(message);
              closeMessageContextMenuSoon();
              return;
            }

            if (action === "delete") {
              openDeleteMessageModal(message);
              closeMessageContextMenuSoon();
            }
          });
        });
      };

      const downloadMessageMedia = async (message) => {
        if (!isMessageDownloadable(message)) {
          return;
        }

        try {
          const messageId = String(message?.id || "").trim();
          if (!messageId || messageId.startsWith("local_")) {
            throw new Error("Media is not ready yet.");
          }
          const mediaUrl = apiBase + "/v1/messages/" + encodeURIComponent(messageId) + "/media";

          const requestHeaders = {};
          const host = String(window.location.hostname || "").toLowerCase();
          const isDesktop = host === "" || (typeof window !== "undefined" && (!!window.tgDesktop || !!window.__TAURI_INTERNALS__));
          const canUseLegacyAuthorizationHeader = host === "localhost"
            || host === "127.0.0.1"
            || host.endsWith(".local")
            || isDesktop;
          if (canUseLegacyAuthorizationHeader && typeof legacySessionToken !== "undefined" && legacySessionToken) {
            requestHeaders.Authorization = "Bearer " + legacySessionToken;
          }

          const response = await fetch(mediaUrl, {
            credentials: "include",
            headers: requestHeaders
          });
          if (!response.ok) {
            throw new Error("Failed to download file.");
          }
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          const extensionFallback = message.type === "video" ? ".mp4" : ".jpg";
          const filename = message.attachmentName || (message.id + extensionFallback);

          const link = document.createElement("a");
          link.href = objectUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to download file.", "error");
        }
      };

      const closeDeleteMessageModal = () => {
        deleteMessageTarget = null;
        deleteMessageModal.classList.remove("open");
        deleteMessageModal.setAttribute("aria-hidden", "true");
      };

      const openDeleteMessageModal = (message) => {
        deleteMessageTarget = message;
        const isOwn = message.senderId === currentUserId;
        const currentPathPublicId = String(window.location.pathname || "")
          .replace(/^\/+/, "")
          .split("/")[0];
        const isSavedDialog = currentDialogSnapshot?.type === "saved"
          || currentDialogSnapshot?.publicId === "-1002003143"
          || currentDialogPublicId === "-1002003143"
          || currentPathPublicId === "-1002003143"
          || String(currentDialogSnapshot?.title || "").toLowerCase() === "saved messages";
        const canDeleteForEveryone = !isSavedDialog && isOwn && !String(message.id || "").startsWith("local_");
        if (deleteMessageForEveryoneWrap) {
          deleteMessageForEveryoneWrap.hidden = !canDeleteForEveryone;
          deleteMessageForEveryoneWrap.style.display = canDeleteForEveryone ? "flex" : "none";
        }
        if (deleteMessageForEveryone) {
          deleteMessageForEveryone.disabled = !canDeleteForEveryone;
          deleteMessageForEveryone.checked = isOwn;
        }
        if (deleteMessageForEveryoneLabel) {
          deleteMessageForEveryoneLabel.textContent = "Also delete for everyone";
        }
        deleteMessageModal.classList.add("open");
        deleteMessageModal.setAttribute("aria-hidden", "false");
      };

      const animateMessageRemoval = (messageId) => new Promise((resolve) => {
        const targetNode = messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');

        if (!targetNode) {
          resolve();
          return;
        }

        const removableNode = targetNode.classList.contains("message")
          ? targetNode
          : (targetNode.closest(".message") || targetNode);

        removableNode.classList.add("message-removing");
        window.setTimeout(resolve, 320);
      });

      const confirmDeleteMessage = async () => {
        if (!deleteMessageTarget) {
          return;
        }

        const target = deleteMessageTarget;
        const targetId = String(target.id || "");
        if (!targetId) {
          return;
        }
        if (deletingMessageIdsInFlight.has(targetId)) {
          return;
        }
        deletingMessageIdsInFlight.add(targetId);
        markMessageDeletedLocally(targetId);
        const shouldStickToBottom = computeIsNearChatBottom();
        closeDeleteMessageModal();

        if (targetId.startsWith("local_")) {
          await animateMessageRemoval(targetId);
          removeLocalOutgoingMessage(targetId);
          rerenderCurrentDialog({ scrollBehavior: shouldStickToBottom ? "auto" : "none" });
          deletingMessageIdsInFlight.delete(targetId);
          return;
        }

        try {
          const payload = await fetchJson(apiBase + "/v1/messages/" + encodeURIComponent(targetId), {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              deleteForEveryone: Boolean(
                deleteMessageForEveryone
                && deleteMessageForEveryoneWrap
                && deleteMessageForEveryone.checked
                && !deleteMessageForEveryone.disabled
              )
            })
          });

          await animateMessageRemoval(targetId);
          handleMessageDeletedEvent(payload);
        } catch (error) {
          const errorMessage = error instanceof Error ? String(error.message || "") : "";
          if (errorMessage.includes("Сообщение не найдено")) {
            // Treat 404 as already deleted and reconcile UI immediately.
            handleMessageDeletedEvent({
              ok: true,
              messageId: targetId,
              deletedForEveryone: Boolean(
                deleteMessageForEveryone
                && deleteMessageForEveryoneWrap
                && deleteMessageForEveryone.checked
                && !deleteMessageForEveryone.disabled
              ),
              dialog: currentDialogSnapshot || null
            });
          } else {
            showToast(error instanceof Error ? error.message : "Failed to delete message.", "error");
          }
        } finally {
          deletingMessageIdsInFlight.delete(targetId);
        }
      };

      composerReplyPreview?.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest("#composer-reply-close")) {
          return;
        }
        if (pendingReplyMessage?.id) {
          jumpToMessage(pendingReplyMessage.id);
        }
      });

      composerReplyClose?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        clearPendingReplyMessage();
      });

      deleteMessageCancel?.addEventListener("click", () => {
        closeDeleteMessageModal();
      });

      deleteMessageConfirm?.addEventListener("click", () => {
        void confirmDeleteMessage();
      });

      deleteMessageModal?.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (target && !target.closest(".delete-message-modal-shell")) {
          closeDeleteMessageModal();
        }
      });

      messageContextMenu?.addEventListener("mouseenter", () => {
        if (messageContextMenuCloseTimer) {
          window.clearTimeout(messageContextMenuCloseTimer);
          messageContextMenuCloseTimer = null;
        }
      });

      messageContextMenu?.addEventListener("mouseleave", () => {
        closeMessageContextMenuSoon();
      });

      document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }
        if (event.button === 2) {
          return;
        }

        if (!target.closest("#message-context-menu")) {
          closeMessageContextMenu();
        }
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && deleteMessageModal.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeDeleteMessageModal();
          return;
        }

        if (event.key === "Escape" && messageContextMenu.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeMessageContextMenu();
        }
      });

      messageList.addEventListener("contextmenu", (event) => {
        const target = event.target instanceof Element
          ? event.target.closest(".message-album-item[data-message-id], .message[data-message-id], .message-system-row[data-message-id]")
          : null;

        if (!target) {
          return;
        }

        const messageId = target.getAttribute("data-message-id");
        if (!messageId) {
          return;
        }

        const isSameTargetOpen = Boolean(
          messageContextMenu.classList.contains("open")
          && messageContextMenuState?.message
          && String(messageContextMenuState.message.id) === String(messageId)
        );
        if (isSameTargetOpen) {
          event.preventDefault();
          closeMessageContextMenu();
          return;
        }

        const message = getCurrentDialogMessageById(messageId);
        if (!message) {
          return;
        }

        event.preventDefault();
        openMessageContextMenu(event, message);
      });

      messageList.addEventListener("click", (event) => {
        const replyNode = event.target instanceof Element ? event.target.closest(".message-reply[data-reply-target-id]") : null;
        if (!replyNode) {
          const messageTarget = event.target instanceof Element
            ? event.target.closest(".message-album-item[data-message-id], .message[data-message-id], .message-system-row[data-message-id]")
            : null;

          if (!messageTarget || event.detail < 2) {
            return;
          }

          if (event.target instanceof Element && event.target.closest("a, button, .message-reply")) {
            return;
          }

          const messageId = messageTarget.getAttribute("data-message-id");
          if (!messageId) {
            return;
          }

          const message = getCurrentDialogMessageById(messageId);
          if (!message) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          setPendingReplyMessage(message);
          composerInput.focus();
          return;
        }

        const targetId = replyNode.getAttribute("data-reply-target-id");
        if (targetId) {
          event.preventDefault();
          event.stopPropagation();
          jumpToMessage(targetId);
        }
      });

      messageList.addEventListener("dblclick", (event) => {
        const target = event.target instanceof Element
          ? event.target.closest(".message-album-item[data-message-id], .message[data-message-id], .message-system-row[data-message-id]")
          : null;

        if (!target) {
          return;
        }

        if (event.target instanceof Element && event.target.closest("a, button, .message-reply")) {
          return;
        }

        const messageId = target.getAttribute("data-message-id");
        if (!messageId) {
          return;
        }

        const message = getCurrentDialogMessageById(messageId);
        if (!message) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        setPendingReplyMessage(message);
        composerInput.focus();
      });

      syncComposerReplyPreview();

      toggleButton.addEventListener("click", () => {
        mode = mode === "login" ? "register" : "login";
        statusNode.textContent = "";
        statusNode.className = "status";
        animateModeChange(mode);
      });

      const setFieldErrorState = (input, message = "") => {
        if (!input) {
          return;
        }

        const hasError = Boolean(message);
        input.classList.toggle("invalid", hasError);
        input.setAttribute("aria-invalid", hasError ? "true" : "false");
        if (hasError) {
          input.dataset.validationMessage = message;
        } else {
          delete input.dataset.validationMessage;
        }
      };

      const clearFieldErrorState = (input) => {
        setFieldErrorState(input, "");
      };

      const validateAuthForm = () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const name = nameInput.value.trim();

        clearFieldErrorState(emailInput);
        clearFieldErrorState(passwordInput);
        clearFieldErrorState(nameInput);

        if (mode === "register" && !name) {
          setFieldErrorState(nameInput, "Enter your name.");
          nameInput.focus();
          return "Enter your name.";
        }

        if (!email) {
          setFieldErrorState(emailInput, "Enter your email.");
          emailInput.focus();
          return "Enter your email.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setFieldErrorState(emailInput, "Enter a valid email.");
          emailInput.focus();
          return "Enter a valid email.";
        }

        if (!password) {
          setFieldErrorState(passwordInput, "Enter your password.");
          passwordInput.focus();
          return "Enter your password.";
        }

        if (password.length < 6) {
          setFieldErrorState(passwordInput, "Password is too short.");
          passwordInput.focus();
          return "Password is too short.";
        }

        return "";
      };

      const brandHeroPhrases = [
        "messenger",
        "secure",
        "smooth",
        "private",
        "fast",
        "messenger"
      ];
      let brandHeroTimer = null;
      let brandHeroPhraseIndex = 0;
      let brandHeroCharIndex = 0;
      let brandHeroDeleting = false;
      let brandHeroPaused = false;

      const syncBrandHero = () => {
        if (!brandTitleDynamic) {
          return;
        }

        const phrase = brandHeroPhrases[brandHeroPhraseIndex] || "";
        brandTitleDynamic.textContent = phrase.slice(0, brandHeroCharIndex);
        if (brandTitleCursor) {
          brandTitleCursor.style.opacity = "1";
        }
      };

      const scheduleBrandHeroTick = (delay) => {
        if (brandHeroTimer) {
          window.clearTimeout(brandHeroTimer);
        }

        brandHeroTimer = window.setTimeout(runBrandHeroTick, delay);
      };

      const runBrandHeroTick = () => {
        const phrase = brandHeroPhrases[brandHeroPhraseIndex] || "";

        if (brandHeroPaused) {
          brandHeroPaused = false;
          brandHeroDeleting = true;
          scheduleBrandHeroTick(90);
          return;
        }

        if (!brandHeroDeleting) {
          brandHeroCharIndex = Math.min(phrase.length, brandHeroCharIndex + 1);
          syncBrandHero();

          if (brandHeroCharIndex >= phrase.length) {
            brandHeroPaused = true;
            scheduleBrandHeroTick(1500);
            return;
          }

          scheduleBrandHeroTick(68 + Math.random() * 42);
          return;
        }

        brandHeroCharIndex = Math.max(0, brandHeroCharIndex - 1);
        syncBrandHero();

        if (brandHeroCharIndex <= 0) {
          brandHeroDeleting = false;
          brandHeroPhraseIndex = (brandHeroPhraseIndex + 1) % brandHeroPhrases.length;
          scheduleBrandHeroTick(320);
          return;
        }

        scheduleBrandHeroTick(44 + Math.random() * 28);
      };

      if (logoutButton) {
        logoutButton.addEventListener("click", () => {
          void (async () => {
            logoutButton.disabled = true;
            try {
              if (typeof handleUnauthorizedSession === "function") {
                handleUnauthorizedSession("You are logged out.", "success");
              } else {
                window.location.replace("/");
                return;
              }
            } catch {
              window.location.replace("/");
              return;
            }
            try {
              await fetchJson(apiBase + "/v1/auth/logout", {
                method: "POST"
              });
            } catch {}
            logoutButton.disabled = false;
          })();
        });
      }

      const verificationInner = document.getElementById("auth-verification-inner");
      const verificationEmailTarget = document.getElementById("verification-email-target");
      const verificationForm = document.getElementById("verification-form");
      const verificationCodeInput = document.getElementById("verification-code");
      const verificationStatus = document.getElementById("verification-status");
      const verifyButton = document.getElementById("verify-button");
      const resendCodeButton = document.getElementById("resend-code-button");
      const resendTimerText = document.getElementById("resend-timer-text");
      const resendCountdown = document.getElementById("resend-countdown");
      const resendAttemptsText = document.getElementById("resend-attempts-text");
      const resendAttempts = document.getElementById("resend-attempts");
      const verificationBackBtn = document.getElementById("verification-back-btn");
      const loginInner = document.getElementById("auth-login-inner");
      const metaRow = document.querySelector(".meta-row");

      let resendTimer = null;
      let resendAttemptsLeft = 3;
      let pendingAuthPayload = null;
      let pendingAuthMode = null;
      let pendingAuthEmail = null;

      const startResendCooldown = () => {
        if (resendTimer) {
          window.clearInterval(resendTimer);
        }

        if (resendCodeButton) {
          resendCodeButton.disabled = true;
        }
        if (resendTimerText) {
          resendTimerText.classList.remove("hidden");
        }
        
        let secondsLeft = 60;
        if (resendCountdown) {
          resendCountdown.textContent = secondsLeft;
        }

        resendTimer = window.setInterval(() => {
          secondsLeft -= 1;
          if (resendCountdown) {
            resendCountdown.textContent = secondsLeft;
          }

          if (secondsLeft <= 0) {
            window.clearInterval(resendTimer);
            resendTimer = null;
            if (resendTimerText) {
              resendTimerText.classList.add("hidden");
            }
            
            if (resendAttemptsLeft > 0 && resendCodeButton) {
              resendCodeButton.disabled = false;
            }
          }
        }, 1000);
      };

      const updateAttemptsUI = () => {
        if (resendAttempts) {
          resendAttempts.textContent = resendAttemptsLeft;
        }
        if (resendAttemptsText) {
          if (resendAttemptsLeft <= 0) {
            resendAttemptsText.textContent = "No attempts remaining";
            if (resendCodeButton) {
              resendCodeButton.disabled = true;
            }
          } else {
            resendAttemptsText.textContent = "Attempts remaining: " + resendAttemptsLeft;
          }
        }
      };

      if (resendCodeButton) {
        resendCodeButton.addEventListener("click", () => {
          if (resendAttemptsLeft <= 0) {
            return;
          }

          void (async () => {
            if (resendCodeButton) {
              resendCodeButton.disabled = true;
            }
            try {
              await fetchJson(apiBase + "/v1/auth/resend", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  email: pendingAuthEmail
                })
              });

              resendAttemptsLeft -= 1;
              updateAttemptsUI();
              startResendCooldown();
              
              showToast("A new verification code has been requested.", "success");
            } catch (error) {
              showToast(error instanceof Error ? error.message : "Failed to request code.", "error");
              if (resendCodeButton && resendAttemptsLeft > 0 && !resendTimer) {
                resendCodeButton.disabled = false;
              }
            }
          })();
        });
      }

      if (verificationBackBtn) {
        verificationBackBtn.addEventListener("click", () => {
          if (resendTimer) {
            window.clearInterval(resendTimer);
            resendTimer = null;
          }

          if (verificationInner) {
            verificationInner.classList.add("fade-out");
          }

          window.setTimeout(() => {
            if (verificationInner) {
              verificationInner.classList.add("hidden");
              verificationInner.classList.remove("fade-out");
            }

            if (loginInner) {
              loginInner.classList.remove("hidden");
              loginInner.classList.add("fade-in");
              void loginInner.offsetWidth;
              loginInner.classList.remove("fade-in");
            }

            if (metaRow) {
              metaRow.classList.remove("hidden");
              metaRow.style.opacity = "1";
            }
          }, 300);
        });
      }

      if (verificationForm) {
        verificationForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          
          const enteredCode = verificationCodeInput ? verificationCodeInput.value.trim() : "";
          if (verificationStatus) {
            verificationStatus.textContent = "";
            verificationStatus.className = "status";
          }

          if (!enteredCode) {
            if (verificationCodeInput) {
              verificationCodeInput.classList.add("invalid");
              verificationCodeInput.focus();
            }
            if (verificationStatus) {
              verificationStatus.textContent = "Please enter the code.";
              verificationStatus.className = "status error";
            }
            return;
          }

          if (enteredCode.length !== 6) {
            if (verificationCodeInput) {
              verificationCodeInput.classList.add("invalid");
              verificationCodeInput.focus();
            }
            if (verificationStatus) {
              verificationStatus.textContent = "The code must be exactly 6 digits.";
              verificationStatus.className = "status error";
            }
            return;
          }

          if (verifyButton) {
            verifyButton.disabled = true;
          }
          if (verificationStatus) {
            verificationStatus.textContent = "Verifying code...";
            verificationStatus.className = "status success";
          }

          try {
            const payload = await fetchJson(apiBase + "/v1/auth/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email: pendingAuthEmail,
                code: enteredCode
              })
            });

            if (payload?.token && typeof payload.token === "string") {
              persistLegacySessionToken(payload.token);
            } else {
              persistLegacySessionToken("");
            }

            realtimeEnabled = true;
            await loadWorkspace();
            connectRealtime();

            if (pendingAuthMode === "register") {
              setStatus("Account created. Opening workspace.", "success");
              showToast("Account created.", "success");
            } else {
              setStatus("Signed in. Loading chats.", "success");
              showToast("Welcome back.", "success");
            }
          } catch (error) {
            if (verificationStatus) {
              verificationStatus.textContent = error instanceof Error ? error.message : "Verification failed.";
              verificationStatus.className = "status error";
            }
            if (verifyButton) {
              verifyButton.disabled = false;
            }
          }
        });

        if (verificationCodeInput) {
          verificationCodeInput.addEventListener("input", () => {
            verificationCodeInput.classList.remove("invalid");
            if (verificationStatus && verificationStatus.classList.contains("error")) {
              verificationStatus.textContent = "";
              verificationStatus.className = "status";
            }
          });
        }
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const validationError = validateAuthForm();

        if (validationError) {
          setStatus(validationError, "error");
          return;
        }

        submitButton.disabled = true;

        const body = {
          email: emailInput.value.trim(),
          password: passwordInput.value
        };

        if (mode === "register") {
          body.name = nameInput.value.trim();
        }

        try {
          const payload = await fetchJson(apiBase + "/v1/auth/" + (mode === "register" ? "register" : "login"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          });

          if (payload?.token && typeof payload.token === "string") {
            persistLegacySessionToken(payload.token);
          } else {
            persistLegacySessionToken("");
          }

          realtimeEnabled = true;
          await loadWorkspace();
          connectRealtime();

          if (mode === "register") {
            setStatus("Account created. Opening workspace.", "success");
            showToast("Account created.", "success");
          } else {
            setStatus("Signed in. Loading chats.", "success");
            showToast("Welcome back.", "success");
          }
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Request failed.", "error");
        } finally {
          submitButton.disabled = false;
        }
      });

      [nameInput, emailInput, passwordInput].forEach((input) => {
        if (!input) {
          return;
        }

        input.addEventListener("input", () => {
          clearFieldErrorState(input);
          if (statusNode.classList.contains("error")) {
            statusNode.textContent = "";
            statusNode.className = "status";
          }
        });
      });

      animateModeChange(mode);
      syncChatIslandActions();
      renderEmojiPicker();
      syncBrandHero();
      scheduleBrandHeroTick(900);

      const clearLegacyPwaState = async () => {
        if ("serviceWorker" in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
          } catch {}
        }

        if ("caches" in window) {
          try {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((key) => caches.delete(key)));
          } catch {}
        }
      };

      void clearLegacyPwaState();

      const startWorkspaceBootstrap = async () => {
        let lastError = null;
        for (let attempt = 0; attempt < 8; attempt += 1) {
          try {
            await loadWorkspace();
            return true;
          } catch (error) {
            lastError = error;
            const message = String(error?.message || "");
            if (/unauthorized/i.test(message)) {
              throw error;
            }
            await new Promise((resolve) => window.setTimeout(resolve, 600));
          }
        }
        if (lastError) {
          throw lastError;
        }
        throw new Error("Workspace bootstrap failed.");
      };

      void startWorkspaceBootstrap()
        .then(() => {
          realtimeEnabled = true;
          connectRealtime();
        })
        .catch(() => {
          disableRealtime();
          finishBoot(false);
        });

      window.addEventListener("offline", () => {
        showToast("Connection lost. Messages may fail to send.", "error");
      });

      window.addEventListener("online", () => {
        showToast("Connection restored.", "success");
        if (currentUserId) {
          realtimeEnabled = true;
          connectRealtime();
        }
      });
