export const buildBootstrapClientChunk = ({
  apiBaseUrl,
  appleEmojiAssetBaseUrl,
  uiFlags,
  searchEmptyVideoUrl
}) => `      const explicitApiBase = ${JSON.stringify(apiBaseUrl)};
      const publicWebHosts = new Set(["web.thegrapht.su", "dev.thegrapht.su", "thegrapht.su", "www.thegrapht.su"]);
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
        "(?:\\\\p{Extended_Pictographic}|[\\\\u{1F1E6}-\\\\u{1F1FF}]|[#*0-9]\\\\uFE0F?\\\\u20E3|[\\\\u00A9\\\\u00AE\\\\u2122])",
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
              ? '<img class="inline-emoji' + extraClass + '" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(segment) + '" onerror=\\\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\\\' draggable="false" loading="lazy" decoding="async">'
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
            ? '<img class="emoji-picker-tab-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emojiChar) + '" onerror=\\\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\\\' aria-hidden="true" loading="lazy" decoding="async">'
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
                        ? '<img class="emoji-button-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emoji) + '" onerror=\\\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\\\' aria-hidden="true" loading="lazy" decoding="async">'
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
`;
