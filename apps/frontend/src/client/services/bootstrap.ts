// Application bootstrap and globals initialization service
export {};

window.addEventListener('error', (event) => {
  const target = event.target;
  if (target instanceof HTMLImageElement && (
    target.classList.contains('inline-emoji') || 
    target.classList.contains('emoji-picker-tab-image') || 
    target.classList.contains('emoji-button-image') ||
    target.classList.contains('call-fingerprint-emoji')
  )) {
    if (!/-fe0f/.test(target.src) && !target.dataset.triedFe0f) {
      target.dataset.triedFe0f = 'true';
      target.src = target.src.replace(/[.]png$/, '-fe0f.png');
    } else if (/-fe0f/.test(target.src) && !target.dataset.triedNoFe0f) {
      target.dataset.triedNoFe0f = 'true';
      target.src = target.src.replace(/-fe0f[.]png$/, '.png');
    } else {
      const altText = target.alt || '?';
      if (target.parentNode) {
        const textNode = document.createTextNode(altText);
        target.replaceWith(textNode);
      }
    }
  }
}, true);


const getConfig = () => {
  const win = window as any;
  const webConfig = win.__THEGRAPHT_CONFIG__ || {};
  const desktopConfig = win.tgDesktop?.config || {};
  const config = {
    apiBaseUrl: webConfig.apiBaseUrl || desktopConfig.apiBase || "",
    wsBaseUrl: webConfig.wsBaseUrl || desktopConfig.wsBase || "",
    uiFlags: webConfig.uiFlags || {},
    ...webConfig
  };
  if (win.tgDesktop && desktopConfig.appleEmojiAssetBaseUrl) {
    config.appleEmojiAssetBaseUrl = desktopConfig.appleEmojiAssetBaseUrl;
  }
  return config;
};

// Resolve apiBase
const explicitApiBase = getConfig().apiBaseUrl || "";
const publicWebHosts = new Set(["web.thegrapht.su", "dev.thegrapht.su", "thegrapht.su", "www.thegrapht.su", "asymprote.thegrapht.su", "asymproto.thegrapht.su"]);
const isLoopbackHostname = (value: string) => /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(String(value || ""));
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
(window as any).apiBase = apiBase;

const uiFlags = Object.freeze(getConfig().uiFlags || {});
(window as any).__THEGRAPHT_UI_FLAGS__ = uiFlags;

const searchEmptyVideoUrl = getConfig().searchEmptyVideoUrl || "";
(window as any).searchEmptyVideoUrl = searchEmptyVideoUrl;

const appleEmojiAssetBaseUrl = getConfig().appleEmojiAssetBaseUrl || "";
(window as any).appleEmojiAssetBaseUrl = appleEmojiAssetBaseUrl;

(window as any).__rtcIceServersRaw = getConfig().rtcIceServers || null;
(window as any).__THEGRAPHT_WS_BASE_URL__ = getConfig().wsBaseUrl || "";
(window as any).__THEGRAPHT_LOGO_DATA_URL__ = getConfig().logoDataUrl || "";
(window as any).__THEGRAPHT_SEND_LOCAL_SOUND_URL__ = getConfig().sendLocalSoundUrl || "";
(window as any).__THEGRAPHT_MESSAGE_SOUND_URL__ = getConfig().messageSoundUrl || "";
(window as any).__callRingtoneUrls = {
  outgoing: getConfig().outgoingCallRingtoneUrl || "",
  incoming: getConfig().incomingCallRingtoneUrl || ""
};

// Global states exposed on window
(window as any).currentDialogId = "";
(window as any).currentDialogPublicId = "";
(window as any).currentUserId = "";
(window as any).currentUserUsername = "";
(window as any).currentUserEmail = "";
(window as any).allDialogs = [];
(window as any).onlineUserIds = new Set();
(window as any).realtimeSocket = null;
(window as any).realtimeEnabled = false;
(window as any).isFirstRealtimeConnection = true;
(window as any).currentDialogSnapshot = null;
(window as any).currentMessagesSnapshot = [];
(window as any).localOutgoingMessages = [];
(window as any).currentSearchQuery = "";
(window as any).currentSearchResults = [];
(window as any).pendingDialogPublicIdFromNotification = "";
(window as any).manualScrollIntentAt = 0;
(window as any).pendingAutoBottomDialogPublicId = "";
(window as any).pendingAutoBottomCanceled = false;
(window as any).notificationTabId = (window.crypto && typeof window.crypto.randomUUID === "function")
  ? window.crypto.randomUUID()
  : ("tab_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10));

(window as any).recentMessageNotificationTimes = new Map();
(window as any).backgroundRefreshTimer = null;
(window as any).backgroundRefreshInFlight = false;
(window as any).notificationPermissionBound = false;
(window as any).sendAudioNode = null;
(window as any).messageAudioNode = null;
(window as any).desktopNotificationIds = new Set();
(window as any).realtimeMessageSeenAt = new Map();
Object.defineProperty(window, 'viewerZoom', { value: 1, writable: true, configurable: true });

const domIds = [
  "chat-window",
  "chat-island",
  "chat-header-avatar",
  "chat-title",
  "chat-subtitle",
  "chat-group-video-button",
  "chat-search-toggle",
  "chat-call-button",
  "chat-search-backdrop",
  "chat-search-panel",
  "chat-search-avatar",
  "chat-search-input",
  "chat-search-close",
  "chat-search-results",
  "chat-call-chip",
  "chat-call-chip-title",
  "chat-call-chip-time",
  "chat-audio-top-player",
  "chat-audio-top-prev",
  "chat-audio-top-toggle",
  "chat-audio-top-next",
  "chat-audio-top-title",
  "chat-audio-top-meta",
  "chat-audio-top-volume",
  "chat-audio-top-volume-popover",
  "chat-audio-top-volume-range",
  "chat-audio-top-speed",
  "chat-audio-top-repeat",
  "chat-audio-top-close",
  "chat-audio-top-progress",
  "chat-audio-top-progress-fill",
  "chat-profile-panel",
  "chat-profile-close",
  "chat-profile-avatar",
  "chat-profile-name",
  "chat-profile-status",
  "chat-profile-link-label",
  "chat-profile-link",
  "chat-profile-notifications-card",
  "chat-profile-notifications-btn",
  "chat-profile-members-section",
  "chat-profile-members-list",
  "chat-stage",
  "chat-loading-overlay",
  "chat-scroll-bottom",
  "call-overlay",
  "call-modal",
  "call-modal-kicker",
  "call-group-kicker",
  "call-expand-button",
  "call-mini-open",
  "call-mini-close",
  "call-mini-end",
  "group-call-banner",
  "group-call-join-strip",
  "group-call-join-button",
  "group-call-leave-cancel",
  "group-call-leave-confirm",
  "group-call-end-for-all",
  "call-mini-drag-handle",
  "call-mini-card",
  "call-accept-button",
  "call-end-button",
  "call-mute-button",
  "call-video-button",
  "call-screen-button",
  "call-devices-button",
  "call-devices-panel",
  "call-devices-close",
  "call-emoji-tooltip",
  "call-input-device",
  "call-output-device",
  "group-member-context-menu",
  "profile-link-context-menu",
  "emoji-picker",
  "emoji-picker-head",
  "emoji-picker-body",
  "gif-picker-body",
  "composer-input",
  "composer-input-overlay",
  "emoji-mode-tab-emoji",
  "emoji-mode-tab-gif",
  "emoji-picker-slide-track",
  "emoji-picker-search",
  "chat-composer",
  "attach-menu",
  "composer-attachment-preview",
  "composer-attachment-image",
  "composer-attachment-meta",
  "attachment-modal",
  "attachment-modal-emoji-picker",
  "composer-file-input",
  "attachment-modal-caption",
  "attachment-modal-prev",
  "attachment-modal-next",
  "attachment-modal-image",
  "attachment-modal-strip",
  "attachment-modal-title",
  "workspace-user-name",
  "message-list"
];

const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

domIds.forEach((id) => {
  const propName = toCamelCase(id);
  if (!(propName in window)) {
    Object.defineProperty(window, propName, {
      get() {
        return document.getElementById(id);
      },
      configurable: true
    });
  }
});

Object.defineProperty(window, 'chatIslandCopy', {
  get() {
    return document.querySelector('.chat-island-copy');
  },
  configurable: true
});

(window as any).viewerSourceRect = null;
(window as any).viewerCleanupTimer = null;
(window as any).isPrimaryActiveTab = true;
(window as any).viewerLoadToken = 0;
(window as any).textMessageSendInFlight = false;
(window as any).mediaMessageSendInFlight = false;
(window as any).pendingReplyMessage = null;
(window as any).currentUserDisplayName = "";

let legacySessionToken = "";
Object.defineProperty(window, "legacySessionToken", {
  get: () => legacySessionToken,
  set: (val) => { legacySessionToken = val; },
  configurable: true
});

const legacySessionStorageKey = "thegrapht_legacy_session_token";
const legacySessionExpiresStorageKey = "thegrapht_legacy_session_token_expires_at";
const LEGACY_SESSION_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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

const persistLegacySessionToken = (token: string) => {
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
(window as any).persistLegacySessionToken = persistLegacySessionToken;

// Emoji Sections configuration
const emojiSections = [
  { key: "recent", title: "Recently Used", emojis: [] as string[] },
  { key: "people", title: "Smileys & People", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🫢", "🤫", "🫠", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "🤚", "🖐️", "✋", "🖖", "🫲", "🫱", "🫳", "🫴", "🫵", "🫷", "🫸", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸", "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👩‍🦱", "🧑‍🦱", "👨‍🦱", "👩‍🦰", "🧑‍🦰", "👨‍🦰", "👱‍♀️", "👱", "👱‍♂️", "👩‍🦳", "🧑‍🦳", "👨‍🦳", "👩‍🦲", "🧑‍🦲", "👨‍🦲", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳", "👳‍♂️", "🧕", "👮‍♀️", "👮", "👮‍♂️", "👷‍♀️", "👷", "👷‍♂️", "💂‍♀️", "💂", "💂‍♂️", "🕵️‍♀️", "🕵️", "🕵️‍♂️", "👩‍⚕️", "🧑‍⚕️", "👨‍⚕️", "👩‍🌾", "🧑‍🌾", "👨‍🌾", "👩‍🍳", "🧑‍🍳", "👨‍🍳", "👩‍🎓", "🧑‍🎓", "👨‍🎓", "👩‍🎤", "🧑‍🎤", "👨‍🎤", "👩‍🏫", "🧑‍🏫", "👨‍🏫", "👩‍🏭", "🧑‍🏭", "👨‍🏭", "👩‍💻", "🧑‍💻", "👨‍💻", "👩‍💼", "🧑‍💼", "👨‍💼", "👩‍🔧", "🧑‍🔧", "👨‍🔧", "👩‍🔬", "🧑‍🔬", "👨‍🔬", "👩‍🎨", "🧑‍🎨", "👨‍🎨", "👩‍🚒", "🧑‍🚒", "👨‍🚒", "👩‍✈️", "🧑‍✈️", "👨‍✈️", "👩‍🚀", "🧑‍🚀", "👨‍🚀", "👩‍⚖️", "🧑‍⚖️", "👨‍⚖️", "👰‍♀️", "👰", "👰‍♂️", "🤵‍♀️", "🤵", "🤵‍♂️", "👸", "🤴", "🥷", "🦸‍♀️", "🦸", "🦸‍♂️", "🦹‍♀️", "🦹", "🦹‍♂️", "🤶", "🧑‍🎄", "🎅", "🧙‍♀️", "🧙", "🧙‍♂️", "🧝‍♀️", "🧝", "🧝‍♂️", "🧛‍♀️", "🧛", "🧛‍♂️", "🧟‍♀️", "🧟", "🧟‍♂️", "🧞‍♀️", "🧞", "🧞‍♂️", "🧜‍♀️", "🧜", "🧜‍♂️", "🧚‍♀️", "🧚", "🧚‍♂️", "👼", "🤰", "🫄", "🫅", "🤱", "👩‍🍼", "🧑‍🍼", "👨‍🍼", "🙇‍♀️", "🙇", "🙇‍♂️", "💁‍♀️", "💁", "💁‍♂️", "🙅‍♀️", "🙅", "🙅‍♂️", "🙆‍♀️", "🙆", "🙆‍♂️", "🙋‍♀️", "🙋", "🙋‍♂️", "🧏‍♀️", "🧏", "🧏‍♂️", "🤷‍♀️", "🤷", "🤷‍♂️", "🤦‍♀️", "🤦", "🤦‍♂️", "💆‍♀️", "💆", "💆‍♂️", "💇‍♀️", "💇", "💇‍♂️", "🚶‍♀️", "🚶", "🚶‍♂️", "🏃‍♀️", "🏃", "🏃‍♂️", "💃", "🕺", "🕴️", "👯‍♀️", "👯", "👯‍♂️", "🧖‍♀️", "🧖", "🧖‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️", "🧘‍♀️", "🧘", "🧘‍♂️", "🛌", "🗣️", "👤", "👥", "🫂"] },
  { key: "nature", title: "Animals & Nature", emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🦍", "🦧", "🐕", "🐕‍🦺", "🦮", "🐩", "🐺", "🦝", "🐈", "🐈‍⬛", "🐴", "🫎", "🦄", "🦓", "🦌", "🦬", "🐂", "🐃", "🐄", "🐖", "🐗", "🐏", "🐑", "🐐", "🐪", "🐫", "🦙", "🦒", "🐘", "🦣", "🦏", "🦛", "🐁", "🐀", "🐇", "🐿️", "🦫", "🦔", "🐾", "🦃", "🐔", "🐓", "🐣", "🐥", "🐤", "🐦", "🐧", "🕊️", "🦅", "🦆", "🦢", "🦉", "🦤", "🦩", "🦚", "🦜", "🐊", "🐢", "🦎", "🐍", "🐲", "🐉", "🦕", "🦖", "🐳", "🐋", "🐬", "🦭", "🐟", "🐠", "🐡", "🦈", "🐙", "🐚", "🪸", "🐌", "🦋", "🐛", "🐜", "🐝", "🪲", "🐞", "🦗", "🪳", "🕷️", "🕸️", "🦂", "🪰", "🪱", "🦠", "💐", "🌸", "💮", "🪷", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🌰", "🌍", "🌎", "🌏", "🪐", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "💫", "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥", "🌪️", "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "💨", "💧", "💦", "☔", "☂️", "🌊", "🌫️"] },
  { key: "food", title: "Food & Drink", emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🍿", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍢", "🍣", "🍤", "🍥", "🦪", "🍡", "🥟", "🥠", "🥡", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "🥛", "☕", "🫖", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧋", "🧃", "🧉", "🧊", "🥢", "🍽️", "🍴", "🥄"] },
  { key: "activity", title: "Activity & Sport", emojis: ["👾", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🏋️‍♂️", "🤼‍♀️", "🤼", "🤼‍♂️", "🤸‍♀️", "🤸", "🤸‍♂️", "⛹️‍♀️", "⛹️", "⛹️‍♂️", "🤺", "🤾‍♀️", "🤾", "🤾‍♂️", "🏌️‍♀️", "🏌️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘", "🧘‍♂️", "🏄‍♀️", "🏄", "🏄‍♂️", "🏊‍♀️", "🏊", "🏊‍♂️", "🤽‍♀️", "🤽", "🤽‍♂️", "🚣‍♀️", "🚣", "🚣‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️", "🚴‍♀️", "🚴", "🚴‍♂️", "🚵‍♀️", "🚵", "🚵‍♂️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎫", "🎟️", "🎪", "🤹‍♀️", "🤹", "🤹‍♂️", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻", "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", "🧩"] },
  { key: "travel", title: "Travel & Places", emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵", "🏍️", "🛺", "🚲", "🛴", "🛹", "🚏", "🛣️", "🛤️", "🛢️", "⛽", "🚨", "🚥", "🚦", "🛑", "🚧", "⚓", "⛵", "🛶", "🚤", "🛳️", "⛴️", "🚢", "✈️", "🛩️", "🛫", "🛬", "🪂", "💺", "🚁", "🚟", "🎒", "🚡", "🛰️", "🚀", "🛸", "🌌", "⛱️", "🎆", "🎇", "🎑", "🏔️", "⛰️", "🌋", "🗻", "🏕️", "🏖️", "🏜️", "🏝️", "🏞️", "🏟️", "🏛️", "🏗️", "🧱", "🏘️", "🏚️", "🏠", "🏡", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "💒", "🗼", "🗽", "⛪", "🕌", "🕍", "⛩️", "🕋", "⛲", "⛺", "🌁", "🌃", "🏙️", "🌄", "🌅", "🌆", "🌇", "🌉", "🎠", "🎡", "🎢", "💈", "🎪"] },
  { key: "objects", title: "Objects", emojis: ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🪛", "🔧", "🔨", "⚒️", "⛏️", "une", "🛡️", "⚙️", "⛓️", "🪝", "🧱", "🔫", "💣", "🪃", "🔪", "🗡️", "⚔️", "🚬", "⚰️", "🪦", "⚱️", "🔮", "📿", "🧿", "⚗️", "🔭", "🔬", "🕳️", "🩹", "🩺", "💊", "💉", "🧬", "🧼", "🧽", "🪥", "🪒", "🚿", "🛁", "🛀", "🔑", "🗝️", "🚪", "🪞", "🪟", "🪑", "🛋️", "🪠", "🧸", "🪆", "🧹", "🧺", "🧻", "🪣", "🪽", "🪯", "🪢", "🪡", "🧶", "🧵", "🎈", "🎏", "🎀", "🎁", "🎊", "🎉", "🪄", "🪅", "🧧", "✉️", "📩", "📨", "📧", "💌", "📥", "📤", "📦", "🏷️", "📪", "📫", "📬", "📭", "📮", "📯", "📜", "📃", "📄", "📑", "🧾", "📊", "📈", "📉", "🗒️", "🗓️", "📆", "📅", "🗑️", "📇", "🗃️", "🗳️", "🗄️", "📋", "📁", "📂", "🗂️", "🗞️", "📰", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚", "📖", "🔖", "🧷", "🔗", "📎", "🖇️", "📐", "📏", "📌", "📍", "🗺️", "✒️", "🖋️", "🖊️", "🖌️", "🖍️", "📝", "✏️", "🔍", "🔎", "🔒", "🔓", "🔏", "🔐"] },
  { key: "symbols", title: "Symbols", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🈳", "🈹", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈲", "🅰️", "🅱️", "🆎", "🅾️", "🆑", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💢", "%EF%B8%8F", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "🔱", "⚜️", "〽️", "⚠️", "🚸", "🔰", "♻️", "🈯", "💹", "❇️", "✳️", "❎", "✅", "💠", "🌀", "➿", "🌐", "Ⓜ️", "🏧", "🚾", "♿", "🅿️", "🛗", "🈁", "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧️", "🚻", "🚮", "🎦", "📶", "🆖", "🆗", "🆙", "🆒", "🆕", "🎰", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "▶️", "⏸️", "⏯️", "⏹️", "⏺️", "⏏️", "⏭️", "⏮️", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾️", "💲", "💱", "™️", "ℹ️", "🎌", "🔚", "🔙", "🔛", "🔝", "🔜", "☑️", "🔘", "⚪", "⚫", "🔴", "🔵", "🟤", "🟣", "🟢", "🟡", "🟠", "🟥", "🟦", "🟫", "🟪", "🟩", "🟨", "🟧"] },
  { key: "flags", title: "Flags", emojis: ["🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇷🇺", "🇺🇸", "🇬🇧", "🇨🇳", "🇩🇪", "🇫🇷", "🇯🇵", "🇮🇹", "🇪🇸", "🇧🇷", "🇰🇷", "🇮🇳", "🇨🇦", "🇦🇺", "🇹🇷", "🇪🇬", "🇿🇦", "🇸🇦", "🇦🇪", "🇮🇱", "🇮🇷", "🇺🇦", "🇧🇾", "🇰🇿", "🇬🇪", "🇦🇲", "🇦🇿", "🇺🇿", "🇰🇬", "🇹🇯", "🇹🇲", "🇲🇩", "🇱🇹", "🇱🇻", "🇪🇪", "🇪🇺", "🇻🇳", "🇮🇩", "🇲🇾", "🇸🇬", "🇹🇭", "🇵🇭", "🇲🇽", "🇦🇷", "🇨🇱", "🇨🇴", "🇵🇪", "🇻🇪", "🇳🇬", "🇰🇪", "🇪🇹", "🇲🇦", "🇩🇿", "🇹🇳", "🇵🇱", "🇷🇴", "🇳🇱", "🇧🇪", "🇨🇭", "🇦🇹", "🇸🇪", "🇳🇴", "🇩🇰", "🇫🇮", "🇮🇪", "🇬🇷", "🇵🇹", "🇮🇸", "🇳🇿"] }
];
(window as any).emojiSections = emojiSections;

// Recently deleted messages tombstone logic
const DELETED_MESSAGE_TOMBSTONE_TTL_MS = 8 * 60 * 1000;
const recentlyDeletedMessageIds = new Map<string, number>();

const markMessageDeletedLocally = (messageId: string) => {
  const id = String(messageId || "").trim();
  if (!id) return;
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
(window as any).markMessageDeletedLocally = markMessageDeletedLocally;

const isMessageDeletedLocally = (messageId: string) => {
  const id = String(messageId || "").trim();
  if (!id) return false;
  const ts = Number(recentlyDeletedMessageIds.get(id) || 0);
  if (!ts) return false;
  if ((Date.now() - ts) > DELETED_MESSAGE_TOMBSTONE_TTL_MS) {
    recentlyDeletedMessageIds.delete(id);
    return false;
  }
  return true;
};
(window as any).isMessageDeletedLocally = isMessageDeletedLocally;

// Utility functions
const escapeHtml = (value: any) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");
(window as any).escapeHtml = escapeHtml;

const EMOJI_RECENTS_STORAGE_KEY = "thegrapht_emoji_recents";
const EMOJI_RECENTS_LIMIT = 18;
const GIF_RECENTS_STORAGE_KEY = "tg_gif_recents";
const GIF_RECENTS_LIMIT = 100;

const readRecentEmojis = (): string[] => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(EMOJI_RECENTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()).slice(0, EMOJI_RECENTS_LIMIT) : [];
  } catch {
    return [];
  }
};
(window as any).readRecentEmojis = readRecentEmojis;

const writeRecentEmojis = (emojis: string[]) => {
  try {
    window.localStorage.setItem(EMOJI_RECENTS_STORAGE_KEY, JSON.stringify(emojis.slice(0, EMOJI_RECENTS_LIMIT)));
  } catch {}
};

const rememberRecentEmoji = (emoji: string) => {
  const nextRecents = [emoji].concat(readRecentEmojis().filter((item) => item !== emoji)).slice(0, EMOJI_RECENTS_LIMIT);
  writeRecentEmojis(nextRecents);
};
(window as any).rememberRecentEmoji = rememberRecentEmoji;

const readRecentGifs = (): string[] => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GIF_RECENTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()).slice(0, GIF_RECENTS_LIMIT) : [];
  } catch {
    return [];
  }
};

const writeRecentGifs = (gifs: string[]) => {
  try {
    window.localStorage.setItem(GIF_RECENTS_STORAGE_KEY, JSON.stringify(gifs.slice(0, GIF_RECENTS_LIMIT)));
  } catch {}
};

const rememberRecentGif = (gifUrl: string) => {
  const nextRecents = [gifUrl].concat(readRecentGifs().filter((item) => item !== gifUrl)).slice(0, GIF_RECENTS_LIMIT);
  writeRecentGifs(nextRecents);
};
(window as any).rememberRecentGif = rememberRecentGif;

const emojiClusterPattern = new RegExp(
  "(?:\\p{Extended_Pictographic}|[\\u{1F1E6}-\\u{1F1FF}]|[#*0-9]\\uFE0F?\\u20E3|[\\u00A9\\u00AE\\u2122])",
  "u"
);
(window as any).emojiClusterPattern = emojiClusterPattern;

const graphemeSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter("en", { granularity: "grapheme" })
  : null;

const splitGraphemes = (value: any): string[] => {
  const text = String(value || "");
  if (!text) return [];
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (part) => part.segment);
  }
  return Array.from(text);
};

const getEmojiAssetUrl = (emoji: string) => {
  if (!emoji) return "";
  const codePointParts = [];
  for (const symbol of Array.from(String(emoji))) {
    const codePoint = symbol.codePointAt(0);
    if (typeof codePoint === "number") {
      codePointParts.push(codePoint.toString(16));
    }
  }
  return codePointParts.length
    ? appleEmojiAssetBaseUrl + codePointParts.join("-") + ".png"
    : "";
};
(window as any).getEmojiAssetUrl = getEmojiAssetUrl;

const renderEmojiAwareTextHtml = (value: any, options: any = {}) => {
  const text = String(value ?? "");
  const extraClass = options.extraClass ? " " + options.extraClass : "";
  const transparentText = Boolean(options.transparentText);
  let result = "";

  for (const segment of splitGraphemes(text)) {
    if (emojiClusterPattern.test(segment)) {
      const emojiUrl = getEmojiAssetUrl(segment);
      const emojiMarkup = emojiUrl
        ? '<img class="inline-emoji' + extraClass + '" src="' + escapeHtml(emojiUrl) + '" alt="' + escapeHtml(segment) + '" draggable="false" loading="lazy" decoding="async">'
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
(window as any).renderEmojiAwareTextHtml = renderEmojiAwareTextHtml;

const linkifyMessageBody = (value: any) => {
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

    if (!visibleLink) continue;

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
(window as any).linkifyMessageBody = linkifyMessageBody;

// Dialog Payload cache
const DIALOG_CACHE_LIMIT = 36;
const dialogPayloadCache = new Map<string, any>();
const cloneJson = (value: any) => JSON.parse(JSON.stringify(value));

const setDialogPayloadCache = (publicId: string, payload: any) => {
  if (!publicId || !payload?.dialog) return;
  if (dialogPayloadCache.has(publicId)) {
    dialogPayloadCache.delete(publicId);
  }
  dialogPayloadCache.set(publicId, cloneJson(payload));
  while (dialogPayloadCache.size > DIALOG_CACHE_LIMIT) {
    const oldestKey = dialogPayloadCache.keys().next().value;
    if (oldestKey) dialogPayloadCache.delete(oldestKey);
  }
};
(window as any).setDialogPayloadCache = setDialogPayloadCache;

const getDialogPayloadCache = (publicId: string) => {
  if (!publicId || !dialogPayloadCache.has(publicId)) return null;
  const cachedPayload = dialogPayloadCache.get(publicId);
  dialogPayloadCache.delete(publicId);
  dialogPayloadCache.set(publicId, cachedPayload);
  return cloneJson(cachedPayload);
};
(window as any).getDialogPayloadCache = getDialogPayloadCache;

// Image dimensions and prefetch cache
const prefetchedMediaUrls = new Set<string>();
const imageDimensionsCache = new Map<string, { naturalWidth: number; naturalHeight: number }>();
const DIALOG_MEDIA_PREFETCH_LIMIT = 10;

const prefetchDialogMedia = (messages: any[] = []) => {
  const mediaUrls: string[] = [];
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.type === "image" && typeof message.mediaUrl === "string" && message.mediaUrl) {
      mediaUrls.push(message.mediaUrl);
    }
    if (mediaUrls.length >= DIALOG_MEDIA_PREFETCH_LIMIT) break;
  }
  mediaUrls.reverse().forEach((url) => {
    if (!url || prefetchedMediaUrls.has(url)) return;
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
(window as any).prefetchDialogMedia = prefetchDialogMedia;

const readCachedImageDimensions = (url: string) => {
  if (!url) return null;
  let targetUrl = url;
  if ((window as any).mediaUrlToBlobUrlCache && (window as any).mediaUrlToBlobUrlCache.has(url)) {
    targetUrl = (window as any).mediaUrlToBlobUrlCache.get(url);
  }
  return imageDimensionsCache.get(targetUrl) || imageDimensionsCache.get(url) || null;
};
(window as any).readCachedImageDimensions = readCachedImageDimensions;

const writeImageDimensions = (url: string, image: HTMLImageElement) => {
  if (!url || !image?.naturalWidth || !image?.naturalHeight) return null;
  const dimensions = {
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight
  };
  imageDimensionsCache.set(url, dimensions);
  return dimensions;
};

const measureImageUrl = (url: string): Promise<{ naturalWidth: number; naturalHeight: number } | null> => new Promise((resolve) => {
  if (!url || imageDimensionsCache.has(url)) {
    resolve(imageDimensionsCache.get(url) || null);
    return;
  }
  const image = new Image();
  let settled = false;
  const settle = (dimensions: any = null) => {
    if (settled) return;
    settled = true;
    resolve(dimensions);
  };
  image.decoding = "async";
  image.onload = () => settle(writeImageDimensions(url, image));
  image.onerror = () => settle(null);
  image.src = url;
  window.setTimeout(() => settle(null), 9000);
});
(window as any).measureImageUrl = measureImageUrl;

const preloadDialogMediaDimensions = async (messages: any[] = []) => {
  const urls: string[] = [];
  const seen = new Set<string>();
  for (let index = (messages?.length || 0) - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const mediaUrl = message?.type === "image" ? String(message.mediaUrl || "").trim() : "";
    if (!mediaUrl || seen.has(mediaUrl) || imageDimensionsCache.has(mediaUrl)) continue;
    seen.add(mediaUrl);
    urls.push(mediaUrl);
    if (urls.length >= 48) break;
  }
  await Promise.all(urls.map((url) => measureImageUrl(url)));
};
(window as any).preloadDialogMediaDimensions = preloadDialogMediaDimensions;

// Dialog Scroll Cache
const DIALOG_SCROLL_CACHE_LIMIT = 80;
const dialogScrollTopCache = new Map<string, number>();
const visitedDialogsInSession = new Set<string>();
(window as any).dialogScrollTopCache = dialogScrollTopCache;
(window as any).visitedDialogsInSession = visitedDialogsInSession;

try {
  const storedTops = window.localStorage.getItem("tg_dialog_scroll_tops");
  if (storedTops) {
    const parsed = JSON.parse(storedTops);
    if (parsed && typeof parsed === "object") {
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "number" && Number.isFinite(value)) {
          dialogScrollTopCache.set(key, value);
        }
      }
    }
  }
} catch (e) {
  console.error("Failed to load dialog scroll tops:", e);
}

const setDialogScrollTop = (publicId: string, value: number) => {
  if (!publicId || !Number.isFinite(value)) return;
  const normalized = Math.max(0, Math.floor(value));
  if (dialogScrollTopCache.has(publicId)) {
    dialogScrollTopCache.delete(publicId);
  }
  dialogScrollTopCache.set(publicId, normalized);
  while (dialogScrollTopCache.size > DIALOG_SCROLL_CACHE_LIMIT) {
    const oldestKey = dialogScrollTopCache.keys().next().value;
    if (oldestKey) dialogScrollTopCache.delete(oldestKey);
  }
  try {
    const obj: Record<string, number> = {};
    for (const [k, v] of dialogScrollTopCache.entries()) {
      obj[k] = v;
    }
    window.localStorage.setItem("tg_dialog_scroll_tops", JSON.stringify(obj));
  } catch (e) {}
};

const getDialogScrollTop = (publicId: string): number | null => {
  if (!publicId || !dialogScrollTopCache.has(publicId)) return null;
  const value = dialogScrollTopCache.get(publicId);
  if (value === undefined) return null;
  dialogScrollTopCache.delete(publicId);
  dialogScrollTopCache.set(publicId, value);
  try {
    const obj: Record<string, number> = {};
    for (const [k, v] of dialogScrollTopCache.entries()) {
      obj[k] = v;
    }
    window.localStorage.setItem("tg_dialog_scroll_tops", JSON.stringify(obj));
  } catch (e) {}
  return value;
};
(window as any).getDialogScrollTop = getDialogScrollTop;

const rememberCurrentDialogScrollTop = () => {
  const currentDialogPublicId = (window as any).currentDialogPublicId;
  const messageList = document.getElementById("message-list");
  if (!currentDialogPublicId || !messageList) return;
  setDialogScrollTop(currentDialogPublicId, messageList.scrollTop || 0);
};
(window as any).rememberCurrentDialogScrollTop = rememberCurrentDialogScrollTop;

// Motion utilities
const reducedMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
const prefersReducedMotion = () => Boolean(reducedMotionQuery?.matches);
const motionDurations = { fast: 100, standard: 140, emphasized: 180 };
const motionEasing = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  spring: "cubic-bezier(0.2, 0, 0, 1)"
};

const runMotion = (node: HTMLElement | null, keyframes: any[], options: any = {}) => {
  if (!node || prefersReducedMotion() || typeof node.animate !== "function") return null;
  return node.animate(keyframes, {
    duration: motionDurations.standard,
    easing: motionEasing.standard,
    fill: "both",
    ...options
  });
};

const runStaggerMotion = (root: HTMLElement | null, selector: string, options: any = {}) => {
  if (!root || prefersReducedMotion()) return;
  const nodes = Array.from(root.querySelectorAll(selector));
  const limit = Number.isFinite(options.limit) ? options.limit : nodes.length;
  const visibleNodes = options.fromEnd ? nodes.slice(-limit) : nodes.slice(0, limit);
  visibleNodes.forEach((node, index) => {
    runMotion(
      node as HTMLElement,
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
  const dialogList = document.getElementById("dialog-list");
  if (!dialogList) return;
  runStaggerMotion(dialogList, ".dialog-section-label, .tg-dialog-item, .dialog-item, .search-empty-state, .search-loading-state", {
    duration: 140,
    step: 12,
    maxDelay: 96,
    keyframes: [
      { opacity: 0, transform: "translateX(-6px)" },
      { opacity: 1, transform: "translateX(0)" }
    ]
  });
};
(window as any).animateDialogListItems = animateDialogListItems;

const animateMessageListItems = () => {
  const messageList = document.getElementById("message-list");
  if (!messageList || prefersReducedMotion()) return;
  const nodes = Array.from(
    messageList.querySelectorAll(".message, .saved-empty-state, .direct-empty-state, .empty-chat-state")
  );
  if (!nodes.length) return;
  nodes.forEach((node, index) => {
    if (!(node instanceof HTMLElement)) return;
    node.classList.remove("is-visible");
    node.classList.add("message-stagger-item");
    node.style.transitionDelay = String((nodes.length - 1 - index) * 50) + "ms";
  });
  requestAnimationFrame(() => {
    nodes.forEach((node) => {
      if (node instanceof HTMLElement) node.classList.add("is-visible");
    });
  });
  const cleanupDelay = (nodes.length * 50) + 500;
  window.setTimeout(() => {
    nodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.classList.remove("message-stagger-item", "is-visible");
      node.style.transitionDelay = "";
    });
  }, cleanupDelay);
};
(window as any).animateMessageListItems = animateMessageListItems;

// Progress Indicator
let activeTopProgressCount = 0;
let topProgressFinishTimer: any = null;
let topProgressAutoTimer: any = null;
let topProgressValue = 0;

const startTopProgress = () => {
  const authView = document.getElementById("auth-view");
  if (authView && authView.classList.contains("hidden")) return;
  activeTopProgressCount += 1;
  const appProgress = document.getElementById("app-progress");
  if (!appProgress || prefersReducedMotion()) return;
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
    if (activeTopProgressCount <= 0) return;
    const next = Math.min(0.92, topProgressValue + Math.max(0.015, (0.92 - topProgressValue) * 0.14));
    if (next <= topProgressValue) return;
    topProgressValue = next;
    appProgress.style.setProperty("--app-progress-value", String(topProgressValue));
  }, 140);
};
(window as any).startTopProgress = startTopProgress;

const finishTopProgress = () => {
  activeTopProgressCount = Math.max(0, activeTopProgressCount - 1);
  const appProgress = document.getElementById("app-progress");
  if (!appProgress || prefersReducedMotion() || activeTopProgressCount > 0) return;
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
(window as any).finishTopProgress = finishTopProgress;

const finishAllTopProgress = () => {
  activeTopProgressCount = 1;
  finishTopProgress();
};
(window as any).finishAllTopProgress = finishAllTopProgress;

// Notifications Heartbeat and Ownership
const NOTIFICATION_CLAIM_STORAGE_PREFIX = "thegrapht_notification_claim_";
const claimNotificationDelivery = (kind: string, id: string, ttlMs: number = 15000) => {
  if (!kind || !id) return true;
  const storageKey = NOTIFICATION_CLAIM_STORAGE_PREFIX + kind + "_" + id;
  const now = Date.now();
  const token = (window as any).notificationTabId + "_" + now + "_" + Math.random().toString(36).slice(2, 8);
  try {
    const existingRaw = window.localStorage.getItem(storageKey);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      if (existing && Number(existing.expiresAt) > now) {
        return false;
      }
    }
    window.localStorage.setItem(storageKey, JSON.stringify({ token, expiresAt: now + ttlMs }));
    const confirmedRaw = window.localStorage.getItem(storageKey);
    const confirmed = confirmedRaw ? JSON.parse(confirmedRaw) : null;
    return Boolean(confirmed && confirmed.token === token);
  } catch {
    return true;
  }
};
(window as any).claimNotificationDelivery = claimNotificationDelivery;

// Bottom History Locking
let bottomLockToken = 0;
let bottomLockCanceledByUser = false;
let suppressBottomLockCancel = false;

const scrollMessagesToBottom = (behavior: "auto" | "smooth" = "auto") => {
  const messageList = document.getElementById("message-list");
  if (!messageList) return;
  messageList.scrollTo({
    top: messageList.scrollHeight,
    behavior
  });
};
(window as any).scrollMessagesToBottom = scrollMessagesToBottom;

const snapMessagesToBottom = () => {
  const messageList = document.getElementById("message-list");
  if (!messageList) return;
  suppressBottomLockCancel = true;
  messageList.scrollTop = messageList.scrollHeight;
  requestAnimationFrame(() => {
    suppressBottomLockCancel = false;
  });
};

const hardPinMessagesToBottom = (token: number = 0) => {
  if (bottomLockCanceledByUser || (token && token !== bottomLockToken)) return;
  snapMessagesToBottom();
  requestAnimationFrame(() => {
    if (bottomLockCanceledByUser || (token && token !== bottomLockToken)) return;
    snapMessagesToBottom();
    window.setTimeout(() => {
      if (bottomLockCanceledByUser || (token && token !== bottomLockToken)) return;
      snapMessagesToBottom();
    }, 80);
  });
};
(window as any).hardPinMessagesToBottom = hardPinMessagesToBottom;

const startBottomLock = (options: any = {}) => {
  bottomLockToken += 1;
  bottomLockCanceledByUser = false;
  const messageList = document.getElementById("message-list");
  if (messageList) {
    if (options.hideList !== false) {
      messageList.classList.add("preparing-bottom");
    } else {
      messageList.classList.remove("preparing-bottom");
    }
  }
  return bottomLockToken;
};
(window as any).startBottomLock = startBottomLock;

const finishBottomLock = (token: number) => {
  const messageList = document.getElementById("message-list");
  if (bottomLockCanceledByUser || (token && token !== bottomLockToken)) {
    if (messageList) messageList.classList.remove("preparing-bottom");
    return;
  }
  hardPinMessagesToBottom(token);
  if (messageList) messageList.classList.remove("preparing-bottom");
  const syncChatScrollBottomButton = (window as any).syncChatScrollBottomButton;
  if (typeof syncChatScrollBottomButton === "function") syncChatScrollBottomButton();
};
(window as any).finishBottomLock = finishBottomLock;

const cancelBottomLock = () => {
  bottomLockToken += 1;
  bottomLockCanceledByUser = true;
  const messageList = document.getElementById("message-list");
  if (messageList) messageList.classList.remove("preparing-bottom");
};

const markManualScrollIntent = () => {
  (window as any).manualScrollIntentAt = Date.now();
  if ((window as any).pendingAutoBottomDialogPublicId) {
    (window as any).pendingAutoBottomCanceled = true;
  }
  if (!bottomLockCanceledByUser) {
    cancelBottomLock();
  }
};
(window as any).markManualScrollIntent = markManualScrollIntent;

// Scroll near bottom detection
const computeIsNearChatBottom = () => {
  const messageList = document.getElementById("message-list");
  if (!messageList) return true;
  const distance = messageList.scrollHeight - messageList.clientHeight - messageList.scrollTop;
  return distance <= 140;
};
(window as any).computeIsNearChatBottom = computeIsNearChatBottom;

const syncChatScrollBottomButton = () => {
  const chatScrollBottom = document.getElementById("chat-scroll-bottom");
  const messageList = document.getElementById("message-list");
  if (!chatScrollBottom || !messageList) return;
  const currentDialogId = (window as any).currentDialogId;
  if (!currentDialogId || messageList.classList.contains("saved-empty")) {
    chatScrollBottom.classList.remove("visible");
    return;
  }
  const isNearChatBottom = computeIsNearChatBottom();
  chatScrollBottom.classList.toggle("visible", !isNearChatBottom);
};
(window as any).syncChatScrollBottomButton = syncChatScrollBottomButton;

// Ripple Effects
const pulseElement = (node: HTMLElement) => {
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
    if (!target || prefersReducedMotion()) return;
    if (target.classList.contains("chat-island-copy") || target.classList.contains("avatar-plus-button")) return;
    target.classList.add("ripple-host");
    const rect = target.getBoundingClientRect();
    (target as HTMLElement).style.setProperty("--ripple-x", (event.clientX - rect.left) + "px");
    (target as HTMLElement).style.setProperty("--ripple-y", (event.clientY - rect.top) + "px");
    target.classList.remove("ripple");
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (target as HTMLElement).offsetWidth;
    target.classList.add("ripple");
    pulseElement(target as HTMLElement);
    window.setTimeout(() => target.classList.remove("ripple"), 280);
  }, { passive: true });
};

// Initialize ripple on startup
attachRippleMotion();

const createRipple = (e: any) => {
  const target = e.target.closest("button, [role='button'], .dialog-item, .sidebar-glass-menu-item, .sidebar-profile-setting-row, .sidebar-profile-premium-row, .btn, .chat-island-action") as HTMLElement;
  if (!target || (target as any).disabled || target.classList.contains("disabled") || target.id === "sidebar-profile-avatar-plus") return;
  
  if (!target.dataset.rippleCount || target.dataset.rippleCount === "0") {
    target.dataset.rippleCount = "0";
    target.dataset.origPosition = target.style.position || "";
    target.dataset.origOverflow = target.style.overflow || "";
  }
  target.dataset.rippleCount = String(Number(target.dataset.rippleCount) + 1);

  const origPosition = target.dataset.origPosition;
  const origOverflow = target.dataset.origOverflow;
  
  if (origPosition !== "absolute" && origPosition !== "relative" && origPosition !== "fixed") {
    target.style.position = "relative";
  }
  
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
  
  const ripple = document.createElement("span");
  ripple.className = "material-ripple";
  ripple.style.width = (radius * 2) + "px";
  ripple.style.height = (radius * 2) + "px";
  ripple.style.left = (x - radius) + "px";
  ripple.style.top = (y - radius) + "px";
  
  target.appendChild(ripple);
  
  // Trigger layout reflow
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  ripple.offsetWidth;
  
  ripple.style.transform = "scale(1)";
  ripple.style.opacity = "1";
  
  const startTime = Date.now();
  let released = false;
  
  const releaseRipple = () => {
    if (released) return;
    released = true;
    clearTimeout(fallbackTimeout);

    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, 320 - elapsed);
    
    setTimeout(() => {
      ripple.style.opacity = "0";
      
      setTimeout(() => {
        ripple.remove();
        const count = Number(target.dataset.rippleCount || 1) - 1;
        target.dataset.rippleCount = String(count);
        if (count <= 0) {
          target.removeAttribute("data-ripple-count");
          if (origPosition !== "absolute" && origPosition !== "relative" && origPosition !== "fixed") {
            if (origPosition) {
              target.style.position = origPosition;
            } else {
              target.style.removeProperty("position");
            }
          }
          if (origOverflow !== "hidden") {
            if (origOverflow) {
              target.style.overflow = origOverflow;
            } else {
              target.style.removeProperty("overflow");
            }
          }
          target.removeAttribute("data-orig-position");
          target.removeAttribute("data-orig-overflow");
        }
      }, 450);
    }, delay);
    
    target.removeEventListener("mouseup", releaseRipple);
    target.removeEventListener("mouseleave", releaseRipple);
    target.removeEventListener("touchend", releaseRipple);
    target.removeEventListener("touchcancel", releaseRipple);
  };
  
  const fallbackTimeout = setTimeout(releaseRipple, 2000);

  target.addEventListener("mouseup", releaseRipple);
  target.addEventListener("mouseleave", releaseRipple);
  target.addEventListener("touchend", releaseRipple);
  target.addEventListener("touchcancel", releaseRipple);
};

document.addEventListener("mousedown", createRipple);
document.addEventListener("touchstart", createRipple, { passive: true });
// Listen to DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const bootSplash = document.getElementById("boot-splash");
  const pageRoot = document.getElementById("page-root");

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => document.body.classList.add("fonts-loaded"));
  } else {
    document.body.classList.add("fonts-loaded");
  }

  // Setup layout widths
  let storedWidth = 360;
  try {
    storedWidth = Number(window.localStorage.getItem("thegrapht_sidebar_width") || 360);
  } catch {}
  const workspaceShell = document.querySelector(".workspace-shell") as HTMLElement;
  if (workspaceShell) {
    const nextWidth = Math.max(320, Math.min(Math.min(920, Math.floor((window.innerWidth || 0) * 0.68)) || 920, storedWidth));
    workspaceShell.style.setProperty("--sidebar-width", nextWidth + "px");
  }

  const messageList = document.getElementById("message-list");
  messageList?.addEventListener("scroll", () => {
    if (!suppressBottomLockCancel) {
      const isNear = computeIsNearChatBottom();
      if (!isNear && !bottomLockCanceledByUser) {
        cancelBottomLock();
      }
    }
    syncChatScrollBottomButton();
  });

  // DOM element references for emoji / GIF picker
  const emojiPicker = document.getElementById("emoji-picker");
  const emojiPickerHead = document.getElementById("emoji-picker-head");
  const emojiPickerBody = document.getElementById("emoji-picker-body");
  const gifPickerBody = document.getElementById("gif-picker-body");
  const composerInput = document.getElementById("composer-input") as HTMLTextAreaElement | null;
  const composerInputOverlay = document.getElementById("composer-input-overlay");
  const emojiModeTabEmoji = document.getElementById("emoji-mode-tab-emoji");
  const emojiModeTabGif = document.getElementById("emoji-mode-tab-gif");
  const emojiPickerSlideTrack = document.getElementById("emoji-picker-slide-track");
  const emojiPickerSearch = document.getElementById("emoji-picker-search") as HTMLInputElement | null;
  const chatComposer = document.getElementById("chat-composer");
  const attachMenu = document.getElementById("attach-menu");

  let emojiPickerCloseTimer: any = null;
  let attachMenuCloseTimer: any = null;
  let pickerMode = "emoji";

  const COMPOSER_INPUT_MIN_HEIGHT_PX = 46;
  const COMPOSER_INPUT_MAX_HEIGHT_PX = 200;

  const syncComposerInputHeight = () => {
    if (!composerInput) return;
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

  const composerHasValue = () => composerInput ? composerInput.value.trim().length > 0 : false;

  const renderComposerOverlay = () => {
    if (!composerInput || !composerInputOverlay) return;
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
    composerInputOverlay.innerHTML = (window as any).renderEmojiAwareTextHtml(value, {
      wrapEmoji: true,
      transparentText: true,
      extraClass: "composer-inline-emoji"
    });
    composerInput.parentElement?.classList.add("has-rendered-emoji");
  };

  const syncComposerState = () => {
    if (chatComposer) chatComposer.classList.toggle("send-active", composerHasValue());
    if (composerInput) composerInput.placeholder = "Message";
    renderComposerOverlay();
    syncComposerInputHeight();
  };
  (window as any).syncComposerState = syncComposerState;

  const filterEmojiSections = (sections: any[], queryStr: string) => {
    if (!queryStr) return sections;
    const lowerQuery = queryStr.toLowerCase();
    return sections.map((section) => ({
      ...section,
      emojis: section.emojis.filter((emoji: string) => emoji.toLowerCase().includes(lowerQuery))
    })).filter((section) => section.emojis.length > 0);
  };

  const setPickerMode = (mode: string) => {
    if (mode === "gif" && emojiModeTabGif && (emojiModeTabGif.classList.contains("disabled") || emojiModeTabGif.hasAttribute("disabled"))) {
      mode = "emoji";
    }
    pickerMode = mode;
    if (emojiModeTabEmoji) emojiModeTabEmoji.classList.toggle("active", mode === "emoji");
    if (emojiModeTabGif) emojiModeTabGif.classList.toggle("active", mode === "gif");
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
      void renderGifPicker();
    }
  };

  let gifSearchTimeout: any = null;

  const renderGifPicker = async () => {
    if (!gifPickerBody) return;
    const query = emojiPickerSearch ? emojiPickerSearch.value.trim() : "";
    
    if (query) {
      gifPickerBody.innerHTML =
        '<div class="gif-empty-state">' +
          '<span class="lucide" aria-hidden="true" style="display: inline-block; animation: spin 1s linear infinite;">autorenew</span>' +
          '<div class="gif-empty-state-text">Поиск в Giphy...</div>' +
        '</div>';
      
      if (gifSearchTimeout) {
        window.clearTimeout(gifSearchTimeout);
      }
      
      gifSearchTimeout = window.setTimeout(async () => {
        try {
          const res = await fetch((window as any).apiBase + "/v1/gifs/search?q=" + encodeURIComponent(query));
          if (!res.ok) throw new Error("Giphy API error");
          const json = await res.json();
          const items = json.data || [];
          
          if (items.length === 0) {
            gifPickerBody.innerHTML =
              '<div class="gif-empty-state">' +
                '<span class="lucide" aria-hidden="true">gif_box</span>' +
                '<div class="gif-empty-state-text">Ничего не найдено</div>' +
              '</div>';
            return;
          }
          
          gifPickerBody.innerHTML =
            '<p class="emoji-picker-title" style="margin-top: 4px; margin-bottom: 10px;">Результаты поиска</p>' +
            '<div class="gif-grid">' +
              items.map((item: any) => {
                const previewUrl = item.images.fixed_height_downsampled?.url || item.images.fixed_height?.url || item.images.original?.url;
                const originalUrl = item.images.downsized?.url || item.images.original?.url;
                return (
                  '<button class="gif-grid-item" type="button" data-gif-url="' + (window as any).escapeHtml(originalUrl) + '">' +
                    '<img src="' + (window as any).escapeHtml(previewUrl) + '" alt="GIF" loading="lazy" decoding="async" referrerpolicy="no-referrer" />' +
                  '</button>'
                );
              }).join("") +
            '</div>';
            
          gifPickerBody.querySelectorAll("[data-gif-url]").forEach((button) => {
            button.addEventListener("click", () => {
              const gifUrl = button.getAttribute("data-gif-url");
              if (!gifUrl || !composerInput) return;
              (window as any).rememberRecentGif(gifUrl);
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
              '<span class="lucide" aria-hidden="true">error</span>' +
              '<div class="gif-empty-state-text">Ошибка поиска</div>' +
            '</div>';
        }
      }, 300);
    } else {
      const recentGifs = (window as any).readRecentGifs ? (window as any).readRecentGifs() : [];
      let htmlMarkup = "";
      
      if (recentGifs.length > 0) {
        htmlMarkup +=
          '<p class="emoji-picker-title" style="margin-top: 4px; margin-bottom: 10px;">Недавние</p>' +
          '<div class="gif-grid" style="margin-bottom: 16px;">' +
            recentGifs.map((gifUrl: string) => (
              '<button class="gif-grid-item" type="button" data-gif-url="' + (window as any).escapeHtml(gifUrl) + '">' +
                '<img src="' + (window as any).escapeHtml(gifUrl) + '" alt="GIF" loading="lazy" decoding="async" referrerpolicy="no-referrer" />' +
              '</button>'
            )).join("") +
          '</div>';
      }
      
      htmlMarkup +=
        '<p class="emoji-picker-title" style="margin-top: 4px; margin-bottom: 10px;">Рекомендуемые</p>' +
        '<div id="giphy-trending-container">' +
          '<div class="gif-empty-state" style="padding: 20px 0;">' +
            '<span class="lucide" aria-hidden="true" style="display: inline-block; animation: spin 1s linear infinite;">autorenew</span>' +
            '<div class="gif-empty-state-text">Загрузка рекомендаций...</div>' +
          '</div>' +
        '</div>';
        
      gifPickerBody.innerHTML = htmlMarkup;
      
      gifPickerBody.querySelectorAll("[data-gif-url]").forEach((button) => {
        button.addEventListener("click", () => {
          const gifUrl = button.getAttribute("data-gif-url");
          if (!gifUrl || !composerInput) return;
          (window as any).rememberRecentGif(gifUrl);
          const selectionStart = composerInput.selectionStart ?? composerInput.value.length;
          const selectionEnd = composerInput.selectionEnd ?? composerInput.value.length;
          composerInput.value = composerInput.value.slice(0, selectionStart) + gifUrl + composerInput.value.slice(selectionEnd);
          composerInput.focus();
          composerInput.setSelectionRange(selectionStart + gifUrl.length, selectionStart + gifUrl.length);
          syncComposerState();
          closeEmojiPicker();
        });
      });
      
      try {
        const res = await fetch((window as any).apiBase + "/v1/gifs/search?q=");
        if (!res.ok) throw new Error("Giphy API error");
        const json = await res.json();
        const items = json.data || [];
        
        const trendingContainer = document.getElementById("giphy-trending-container");
        if (!trendingContainer) return;
        
        if (items.length === 0) {
          trendingContainer.innerHTML =
            '<div class="gif-empty-state" style="padding: 20px 0;">' +
              '<span class="lucide" aria-hidden="true">gif_box</span>' +
              '<div class="gif-empty-state-text">Рекомендации недоступны</div>' +
            '</div>';
          return;
        }
        
        trendingContainer.innerHTML =
          '<div class="gif-grid">' +
            items.map((item: any) => {
              const previewUrl = item.images.fixed_height_downsampled?.url || item.images.fixed_height?.url || item.images.original?.url;
              const originalUrl = item.images.downsized?.url || item.images.original?.url;
              return (
                '<button class="gif-grid-item" type="button" data-gif-url="' + (window as any).escapeHtml(originalUrl) + '">' +
                  '<img src="' + (window as any).escapeHtml(previewUrl) + '" alt="GIF" loading="lazy" decoding="async" referrerpolicy="no-referrer" />' +
                '</button>'
              );
            }).join("") +
          '</div>';
          
        trendingContainer.querySelectorAll("[data-gif-url]").forEach((button) => {
          button.addEventListener("click", () => {
            const gifUrl = button.getAttribute("data-gif-url");
            if (!gifUrl || !composerInput) return;
            (window as any).rememberRecentGif(gifUrl);
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
              '<span class="lucide" aria-hidden="true">error</span>' +
              '<div class="gif-empty-state-text">Не удалось загрузить рекомендации</div>' +
            '</div>';
        }
      }
    }
  };
  (window as any).renderGifPicker = renderGifPicker;

  const emojiTabIcons: Record<string, string> = {
    recent: '🕒',
    people: '😀',
    nature: '🌲',
    food: '🍔',
    activity: '⚽',
    travel: '🚗',
    objects: '💡',
    symbols: '❤️',
    flags: '🚩'
  };

  const renderEmojiPicker = () => {
    if (!emojiPickerHead || !emojiPickerBody) return;
    const query = emojiPickerSearch ? emojiPickerSearch.value.trim() : "";
    const recentSection = {
      ...(window as any).emojiSections[0],
      emojis: (window as any).readRecentEmojis()
    };
    let sections = [recentSection].concat((window as any).emojiSections.slice(1));
    if (query) {
      sections = filterEmojiSections(sections, query);
    }

    emojiPickerHead.innerHTML = sections.map((section, index) => {
      const emojiChar = emojiTabIcons[section.key] || "";
      const emojiAssetUrl = (window as any).getEmojiAssetUrl(emojiChar);
      const iconHtml = emojiAssetUrl
        ? '<img class="emoji-picker-tab-image" src="' + (window as any).escapeHtml(emojiAssetUrl) + '" alt="' + (window as any).escapeHtml(emojiChar) + '" aria-hidden="true" loading="lazy" decoding="async">'
        : '<span class="emoji-picker-tab-fallback">' + (window as any).escapeHtml(emojiChar) + '</span>';

      return '<button class="emoji-picker-tab' + (index === 0 ? ' active' : '') + '" type="button" data-emoji-tab="' + section.key + '" aria-label="' + (window as any).escapeHtml(section.title) + '">' +
        iconHtml +
      '</button>';
    }).join("");

    if (sections.length === 0) {
      emojiPickerBody.innerHTML = '<div class="emoji-picker-no-results">Ничего не найдено</div>';
      return;
    }

    emojiPickerBody.innerHTML = sections.map((section) => (
      '<section class="emoji-picker-section" data-emoji-section="' + section.key + '">' +
        '<p class="emoji-picker-title">' + (window as any).escapeHtml(section.title) + '</p>' +
        (
          section.emojis.length
            ? '<div class="emoji-picker-grid">' + section.emojis.map((emoji: string) => (
              (() => {
                const emojiAssetUrl = (window as any).getEmojiAssetUrl(emoji);
                return (
              '<button class="emoji-button" type="button" data-emoji-value="' + (window as any).escapeHtml(emoji) + '" aria-label="' + (window as any).escapeHtml(emoji) + '">' +
                (
                  emojiAssetUrl
                    ? '<img class="emoji-button-image" src="' + (window as any).escapeHtml(emojiAssetUrl) + '" alt="' + (window as any).escapeHtml(emoji) + '" aria-hidden="true" loading="lazy" decoding="async">'
                    : '<span class="emoji-button-image" aria-hidden="true">' + (window as any).escapeHtml(emoji) + '</span>'
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
        if (!key) return;
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
        if (!emoji || !composerInput) return;

        const selectionStart = composerInput.selectionStart ?? composerInput.value.length;
        const selectionEnd = composerInput.selectionEnd ?? composerInput.value.length;
        composerInput.value = composerInput.value.slice(0, selectionStart) + emoji + composerInput.value.slice(selectionEnd);
        composerInput.focus();
        composerInput.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
        (window as any).rememberRecentEmoji(emoji);
        syncComposerState();
        renderEmojiPicker();
      });
    });
  };
  (window as any).renderEmojiPicker = renderEmojiPicker;

  const closeEmojiPicker = () => {
    if (emojiPickerCloseTimer) {
      window.clearTimeout(emojiPickerCloseTimer);
      emojiPickerCloseTimer = null;
    }
    if (emojiPicker) {
      emojiPicker.classList.remove("open");
      emojiPicker.setAttribute("aria-hidden", "true");
    }
    if (emojiPickerSearch) {
      emojiPickerSearch.value = "";
    }
  };
  (window as any).closeEmojiPicker = closeEmojiPicker;

  const scheduleEmojiPickerClose = () => {
    if (emojiPickerCloseTimer) {
      window.clearTimeout(emojiPickerCloseTimer);
    }
    emojiPickerCloseTimer = window.setTimeout(() => {
      closeEmojiPicker();
    }, 120);
  };
  (window as any).scheduleEmojiPickerClose = scheduleEmojiPickerClose;

  const openEmojiPicker = () => {
    if (emojiPickerCloseTimer) {
      window.clearTimeout(emojiPickerCloseTimer);
      emojiPickerCloseTimer = null;
    }
    setPickerMode("emoji");
    renderEmojiPicker();
    if (emojiPicker) {
      emojiPicker.classList.add("open");
      emojiPicker.setAttribute("aria-hidden", "false");
    }
  };
  (window as any).openEmojiPicker = openEmojiPicker;

  const closeAttachMenu = () => {
    if (attachMenuCloseTimer) {
      window.clearTimeout(attachMenuCloseTimer);
      attachMenuCloseTimer = null;
    }
    if (attachMenu) {
      attachMenu.classList.remove("open");
      attachMenu.setAttribute("aria-hidden", "true");
    }
  };
  (window as any).closeAttachMenu = closeAttachMenu;

  const scheduleAttachMenuClose = () => {
    if (attachMenuCloseTimer) {
      window.clearTimeout(attachMenuCloseTimer);
    }
    attachMenuCloseTimer = window.setTimeout(() => {
      closeAttachMenu();
    }, 120);
  };
  (window as any).scheduleAttachMenuClose = scheduleAttachMenuClose;

  const openAttachMenu = () => {
    if (attachMenuCloseTimer) {
      window.clearTimeout(attachMenuCloseTimer);
      attachMenuCloseTimer = null;
    }
    if (attachMenu) {
      attachMenu.classList.add("open");
      attachMenu.setAttribute("aria-hidden", "false");
    }
  };
  (window as any).openAttachMenu = openAttachMenu;

  // Set event listeners for composer input
  composerInput?.addEventListener("input", syncComposerState);
  composerInput?.addEventListener("change", syncComposerState);

  // Resizable profile panel logic
  const chatProfileResizeHandle = document.getElementById("chat-profile-resize-handle");
  const chatProfilePanel = document.getElementById("chat-profile-panel");

  // Restore saved width from localStorage
  const savedWidth = localStorage.getItem("chat-profile-panel-width");
  if (savedWidth) {
    document.documentElement.style.setProperty("--chat-profile-panel-width", savedWidth + "px");
  }

  if (chatProfileResizeHandle && chatProfilePanel) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      isResizing = true;
      chatProfileResizeHandle.classList.add("active");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startX = clientX;
      startWidth = chatProfilePanel.getBoundingClientRect().width;

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;
      if ('touches' in e) {
        e.preventDefault();
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startX;
      let newWidth = startWidth - deltaX;

      const minWidth = 320;
      const maxWidth = Math.min(800, window.innerWidth * 0.8);
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;

      document.documentElement.style.setProperty("--chat-profile-panel-width", newWidth + "px");
    };

    const onTouchMove = (e: TouchEvent) => {
      onMouseMove(e);
    };

    const onMouseUp = () => {
      if (!isResizing) return;
      isResizing = false;
      chatProfileResizeHandle.classList.remove("active");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      const currentWidth = chatProfilePanel.getBoundingClientRect().width;
      localStorage.setItem("chat-profile-panel-width", Math.round(currentWidth).toString());

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onMouseUp);
    };

    chatProfileResizeHandle.addEventListener("mousedown", onMouseDown);
    chatProfileResizeHandle.addEventListener("touchstart", onMouseDown, { passive: true });
  }

  // Premium Modal Open/Close Logic
  const premiumModalOverlay = document.getElementById("premium-modal-overlay");
  const premiumBtn = document.querySelector(".sidebar-profile-premium-row");
  const premiumClose = document.getElementById("premium-modal-close");
  const premiumSlider = document.getElementById("premium-modal-slider");
  const premiumDetailBack = document.getElementById("premium-detail-back");
  const premiumDetailIcon = document.getElementById("premium-detail-icon");
  const premiumDetailTitle = document.getElementById("premium-detail-title");
  const premiumDetailList = document.getElementById("premium-detail-list");

  interface SubFeatureItem {
    title: string;
    desc: string;
    iconSvg: string;
  }

  const subFeaturesMap: Record<string, { title: string; iconHtml: string; items: SubFeatureItem[] }> = {
    style: {
      title: "Messenger Style Customization",
      iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      items: [
        {
          title: "Gradient Themes",
          desc: "Choose from curated multi-color gradient presets.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.63-.77 1.63-1.7 0-.42-.16-.83-.44-1.14-.28-.31-.44-.72-.44-1.16 0-.93.77-1.7 1.7-1.7H16c4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8z"/></svg>`
        },
        {
          title: "Custom Chat Bubbles",
          desc: "Customize outgoing/incoming message bubble styles.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
        },
        {
          title: "Accent Colors",
          desc: "Set custom primary colors for the entire interface.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.63-.77 1.63-1.7 0-.42-.16-.83-.44-1.14-.28-.31-.44-.72-.44-1.16 0-.93.77-1.7 1.7-1.7H16c4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8z"/></svg>`
        },
        {
          title: "Premium Wallpapers",
          desc: "Unlock exclusive parallax chat background patterns.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`
        }
      ]
    },
    glow: {
      title: "Avatar Glow Effect",
      iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
      items: [
        {
          title: "Dynamic Glowing Borders",
          desc: "Add a vibrant glowing ring to your avatar.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
        },
        {
          title: "Pulse Patterns",
          desc: "Choose between breathing, rotating, or wave glow animations.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
        },
        {
          title: "Custom Glow Color",
          desc: "Match the glowing ring to your current mood.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="12" cy="12" r="3"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.63-.77 1.63-1.7 0-.42-.16-.83-.44-1.14-.28-.31-.44-.72-.44-1.16 0-.93.77-1.7 1.7-1.7H16c4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8z"/></svg>`
        },
        {
          title: "Profile View Highlight",
          desc: "Glow effect remains visible in search and chat headers.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
        }
      ]
    },
    color: {
      title: "Custom Nickname Color",
      iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-edit"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
      items: [
        {
          title: "Name Coloring",
          desc: "Paint your name with any gradient or solid color.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="12" cy="12" r="3"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.63-.77 1.63-1.7 0-.42-.16-.83-.44-1.14-.28-.31-.44-.72-.44-1.16 0-.93.77-1.7 1.7-1.7H16c4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8z"/></svg>`
        },
        {
          title: "Premium Badge",
          desc: "Display a special verified star badge next to your name.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
        },
        {
          title: "Custom Mention Style",
          desc: "Highlight mentions of your name with distinct styling.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-at-sign"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>`
        },
        {
          title: "Group List Highlight",
          desc: "Stand out in large group member lists.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
        }
      ]
    },
    gif: {
      title: "GIF Avatars",
      iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
      items: [
        {
          title: "Animated Profiles",
          desc: "Play GIF avatars inside chats and settings.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`
        },
        {
          title: "High Frame Rate",
          desc: "Smooth GIF playback with optimized resource usage.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
        },
        {
          title: "Custom Cover Frame",
          desc: "Pick the static cover frame for offline/preview views.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
        },
        {
          title: "Looping Playback",
          desc: "Infinite seamless loops for your animation files.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`
        }
      ]
    },
    status: {
      title: "Custom Last Seen Status",
      iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      items: [
        {
          title: "Stealth Offline",
          desc: "Hide your precise activity time from everyone.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`
        },
        {
          title: "Selective Visibility",
          desc: "Customize who can see your online status.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
        },
        {
          title: "Read Time Control",
          desc: "Hide when you read other users' messages.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`
        },
        {
          title: "Granular Status",
          desc: "Shows general states like 'recently' or 'long ago'.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
        }
      ]
    },
    ai: {
      title: "AI Assistant Integration",
      iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      items: [
        {
          title: "Graphite Model Access",
          desc: "Chat with our smartest, reasoning AI engine.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cpu"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 15h3"/><path d="M1 9h3"/><path d="M1 15h3"/></svg>`
        },
        {
          title: "Carbon Coding Model",
          desc: "Ask advanced programming and debugging questions.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
        },
        {
          title: "Priority Inference",
          desc: "Get lightning fast responses even during high load.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
        },
        {
          title: "Unlimited Context",
          desc: "Longer history memory limits for your AI sessions.",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers"><path d="m12 3-10 5 10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`
        }
      ]
    }
  };

  console.log("Premium elements status:", { premiumModalOverlay, premiumBtn, premiumClose, premiumSlider });

  const openPremiumModal = () => {
    console.log("openPremiumModal triggered! Overlay:", premiumModalOverlay);
    if (!premiumModalOverlay) return;
    
    // Reset to main features list when opening
    if (premiumSlider) {
      premiumSlider.classList.remove("show-detail");
    }

    premiumModalOverlay.removeAttribute("hidden");
    premiumModalOverlay.setAttribute("aria-hidden", "false");
    void premiumModalOverlay.offsetWidth;
    premiumModalOverlay.classList.add("open");
    console.log("Overlay open class added. Classes:", premiumModalOverlay.className);
  };

  const closePremiumModal = () => {
    console.log("closePremiumModal triggered!");
    if (!premiumModalOverlay) return;
    premiumModalOverlay.classList.remove("open");
    premiumModalOverlay.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      if (!premiumModalOverlay.classList.contains("open")) {
        premiumModalOverlay.setAttribute("hidden", "true");
        // Reset slider layout
        if (premiumSlider) {
          premiumSlider.classList.remove("show-detail");
        }
      }
    }, 300);
  };

  if (premiumBtn) {
    premiumBtn.addEventListener("click", (e) => {
      console.log("Direct premium button click!");
      openPremiumModal();
    });
  }

  if (premiumClose) {
    premiumClose.addEventListener("click", (e) => {
      closePremiumModal();
    });
  }

  // Handle detailed features click and back navigation
  if (premiumDetailBack && premiumSlider) {
    premiumDetailBack.addEventListener("click", () => {
      premiumSlider.classList.remove("show-detail");
    });
  }

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    
    // Handle main profile row click
    if (target.closest(".sidebar-profile-premium-row")) {
      console.log("Delegated premium button click!");
      openPremiumModal();
      return;
    }
    
    // Handle clicking a specific premium feature item to slide to detailed view
    const featureItem = target.closest(".premium-feature-item");
    if (featureItem && premiumSlider && premiumDetailIcon && premiumDetailTitle && premiumDetailList) {
      const featureId = featureItem.getAttribute("data-feature");
      if (featureId && subFeaturesMap[featureId]) {
        const data = subFeaturesMap[featureId];
        
        // Populate detail icon & title
        premiumDetailIcon.innerHTML = data.iconHtml;
        premiumDetailTitle.textContent = data.title;
        
        // Populate list
        premiumDetailList.innerHTML = data.items.map(item => `
          <li class="premium-detail-item">
            <span class="premium-detail-item-icon-wrap">
              ${item.iconSvg}
            </span>
            <div class="premium-detail-item-info">
              <span class="premium-detail-item-title">${item.title}</span>
              <span class="premium-detail-item-desc">${item.desc}</span>
            </div>
          </li>
        `).join("");
        
        // Slide to detail view
        premiumSlider.classList.add("show-detail");
      }
      return;
    }
    
    // Handle closing click
    if (target === premiumModalOverlay || target.closest("#premium-modal-close")) {
      console.log("Delegated close click!");
      closePremiumModal();
      return;
    }

    // Handle subscribe buttons action
    if (target.closest(".premium-subscribe-action")) {
      alert("Subscribing process simulation: Thank you for supporting TheGraphT Premium!");
      closePremiumModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && premiumModalOverlay && !premiumModalOverlay.hasAttribute("hidden")) {
      closePremiumModal();
    }
  });
});
