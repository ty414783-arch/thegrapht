import { googleSpinnerMarkup } from "../../server/components/google-spinner.js";
import { mountLegacyTextMessageDom, resolveLegacyTextStatusState } from "../features/chat/legacyTextMessageMount.tsx";
import { mountLegacyMediaMessageDom } from "../features/chat/legacyMediaMessageMount.tsx";
import { mountLegacySystemRowMessageDom } from "../features/chat/legacySystemRowMount.tsx";
import { mountLegacyDaySeparatorDom } from "../features/chat/legacyDaySeparatorMount.tsx";

// Global declarations of variables and functions defined by other scripts/modules
const safeGetIcon = (name: string, extraClasses = "", attrs = ""): string => {
  try {
    const fn = (window as any).getIcon;
    if (typeof fn === "function") {
      return fn(name, extraClasses, attrs);
    }
  } catch (_) {}
  return "";
};
declare const currentDialogSnapshot: any;
declare const currentPeerReadAt: any;
declare const legacySessionToken: string;
declare const activeAudioElement: any;
declare const activeAudioMessageId: any;
declare const currentUserId: string;
declare const workspaceUserName: HTMLElement;
declare const messageList: HTMLElement;
declare const currentMessagesSnapshot: any[];
declare const toEpochMs: (v: any) => number;
declare const startOfDayTs: (v: any) => number;
declare const formatDaySeparatorLabel: (v: any) => string;
declare const formatDuration: (v: number) => string;
declare const formatBytes: (v: number) => string;
declare const escapeHtml: (v: any) => string;
declare const linkifyMessageBody: (v: string) => string;
declare const parseCallSummaryMessage: (msg: any) => any;
declare const getCallSummaryPresentation: (msg: any) => any;
declare const getAvatarMeta: (seed: any, label: any) => any;
declare const renderReplyPreviewHtml: (msg: any) => string;
declare const isMessageDeletedLocally: (id: string) => boolean;
declare const getLocalMessagesForDialog: (id: string) => any[];
declare const currentDialogPublicId: string;
declare const hydrateMessageImages: (opts?: any) => void;
declare const readCachedImageDimensions: (url: string) => any;
declare const getConstrainedImageSize: (w: number, h: number) => any;
declare const getImageShellStyle: (msg: any) => string;
declare const renderMessages: (dialog: any, messages: any[], options?: any) => void;
declare const scrollMessagesToBottom: (behavior?: string) => void;
declare const syncChatScrollBottomButton: () => void;

// Fallbacks for global icons if they are not in scope yet
declare const pendingClockIcon: string;
declare const doubleChecksIcon: string;
declare const singleCheckIcon: string;

const getPendingClockIcon = () => {
  const win = window as any;
  if (win.pendingClockIcon) return win.pendingClockIcon;
  try {
    if (typeof pendingClockIcon !== 'undefined') return pendingClockIcon;
  } catch {}
  return '<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><circle cx="10" cy="10" r="6.5"></circle><path d="M10 6.5v3.9l2.6 1.6"></path></svg>';
};

const getDoubleChecksIcon = () =>
  '<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M2.5 10.5l3.8 3.8 7.8-8M7.1 10.5l3.8 3.8L17.5 7"/></svg>';

const getSingleCheckIcon = () =>
  '<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M3.5 10.5l4 3.8 8.8-8"/></svg>';

const STATUS_ICON_SELECTOR = ".message-status-icon, .message-checks, .message-state";

const wrapStatusIcon = (innerHtml: string, modifierClass = "", ariaLabel = "") => {
  const className = ["message-status-icon", modifierClass].filter(Boolean).join(" ");
  const ariaAttr = ariaLabel ? (' aria-label="' + escapeHtml(ariaLabel) + '"') : "";
  return '<span class="' + className + '"' + ariaAttr + ">" + innerHtml + "</span>";
};

const syncStatusNode = (target: HTMLElement, source: HTMLElement) => {
  target.className = source.className;
  target.innerHTML = source.innerHTML;
  const ariaLabel = source.getAttribute("aria-label");
  if (ariaLabel) {
    target.setAttribute("aria-label", ariaLabel);
  } else {
    target.removeAttribute("aria-label");
  }
};

const getWin = () => window as any;

const getMessageStatusMarkup = (message: any, isOutgoing: boolean): string => {
  if (!isOutgoing) {
    return "";
  }

  if (message.localStatus === "pending") {
    return wrapStatusIcon(getPendingClockIcon(), "is-pending", "Pending");
  }

  if (message.localStatus === "failed") {
    return wrapStatusIcon("!", "is-failed", "Failed");
  }

  const supportsPeerReadReceipts = Boolean(
    getWin().currentDialogSnapshot?.peerUserId
    && ["direct", "private", "secret"].includes(getWin().currentDialogSnapshot?.type)
  );

  if (supportsPeerReadReceipts) {
    const messageTimestamp = new Date(message.createdAt).getTime();
    const peerReadTimestamp = getWin().currentPeerReadAt ? new Date(getWin().currentPeerReadAt).getTime() : 0;
    const isReadByPeer = Number.isFinite(peerReadTimestamp) && peerReadTimestamp > 0 && messageTimestamp <= peerReadTimestamp;
    return isReadByPeer
      ? wrapStatusIcon(getDoubleChecksIcon(), "message-checks-double")
      : wrapStatusIcon(getSingleCheckIcon(), "message-checks-single");
  }

  if (getWin().currentDialogSnapshot?.type === "group") {
    const messageTimestamp = new Date(message.createdAt).getTime();
    const groupReadTimestamp = getWin().currentPeerReadAt ? new Date(getWin().currentPeerReadAt).getTime() : 0;
    const isReadByAnyMember = Number.isFinite(groupReadTimestamp) && groupReadTimestamp > 0 && messageTimestamp <= groupReadTimestamp;
    return isReadByAnyMember
      ? wrapStatusIcon(getDoubleChecksIcon(), "message-checks-double")
      : wrapStatusIcon(getSingleCheckIcon(), "message-checks-single");
  }

  return wrapStatusIcon(getDoubleChecksIcon(), "message-checks-double");
};

const mediaUrlToBlobUrlCache = new Map<string, string>();
const registerMediaBlobUrl = (mediaUrl: string, blobUrl: string) => {
  if (!mediaUrl || !blobUrl) return;
  mediaUrlToBlobUrlCache.set(mediaUrl, blobUrl);
  if (mediaUrlToBlobUrlCache.size > 100) {
    const firstKey = mediaUrlToBlobUrlCache.keys().next().value;
    if (firstKey) {
      const firstVal = mediaUrlToBlobUrlCache.get(firstKey);
      if (firstVal && firstVal.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(firstVal);
        } catch {}
      }
      mediaUrlToBlobUrlCache.delete(firstKey);
    }
  }
};
getWin().registerMediaBlobUrl = registerMediaBlobUrl;
getWin().mediaUrlToBlobUrlCache = mediaUrlToBlobUrlCache;

const resolvePublicMediaUrl = (rawUrl: string): string => {
  let value = String(rawUrl || "").trim();
  if (!value) {
    return "";
  }
  if (mediaUrlToBlobUrlCache.has(value)) {
    return mediaUrlToBlobUrlCache.get(value) || "";
  }
  if (value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }
  if (window.location.hostname === "dev.thegrapht.su") {
    value = value.replace(/^https?:\/\/cdn\.thegrapht\.su\/v\//i, "/v/");
  } else {
    if (value.startsWith("/v/")) {
      value = "https://cdn.thegrapht.su" + value;
    } else if (/^https?:\/\/web\.thegrapht\.su\/v\//i.test(value)) {
      value = value.replace(/^https?:\/\/web\.thegrapht\.su/i, "https://cdn.thegrapht.su");
    }
  }
  if (getWin().legacySessionToken) {
    value = value + (value.indexOf("?") >= 0 ? "&" : "?") + "token=" + encodeURIComponent(getWin().legacySessionToken);
  }
  return value;
};

const resolveWebMediaUrlFallback = (rawUrl: string): string => {
  let value = String(rawUrl || "").trim();
  if (!value) {
    return "";
  }
  if (value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }
  if (window.location.hostname === "dev.thegrapht.su") {
    value = value.replace(/^https?:\/\/cdn\.thegrapht\.su\/v\//i, "/v/");
  } else {
    const cleanUrl = value.split("?")[0];
    if (cleanUrl.startsWith("/v/")) {
      value = "https://web.thegrapht.su" + cleanUrl;
    } else if (/^https?:\/\/cdn\.thegrapht\.su\/v\//i.test(cleanUrl)) {
      value = cleanUrl.replace(/^https?:\/\/cdn\.thegrapht\.su/i, "https://web.thegrapht.su");
    } else {
      value = cleanUrl;
    }
  }
  if (getWin().legacySessionToken) {
    value = value + (value.indexOf("?") >= 0 ? "&" : "?") + "token=" + encodeURIComponent(getWin().legacySessionToken);
  }
  return value;
};

const renderImageLinkHtml = (message: any, caption: string, senderName: string, extraClass: string = "") => {
  const publicMediaUrl = resolvePublicMediaUrl(message.mediaUrl);
  const fallbackMediaUrl = resolveWebMediaUrlFallback(message.mediaUrl);
  const isPending = message.localStatus === "pending";

  const spinnerMarkup =
    '<div class="m3-spinner-container">' + googleSpinnerMarkup(36) + '</div>';

  const shellClass = "message-image-shell" + (isPending ? " is-pending" : "");
  const imageClass = "message-image" + (isPending ? " message-image-pending" : "");

  const getStyle = () => {
    try {
      return getWin().getImageShellStyle ? getWin().getImageShellStyle(message) : (typeof getImageShellStyle !== 'undefined' ? getImageShellStyle(message) : "");
    } catch {
      return "";
    }
  };

  const senderAvatar = message.senderAvatar || message.senderPhoto || (message.sender && (message.sender.avatarUrl || message.sender.photoUrl)) || "";

  return '<button class="message-image-link' + extraClass + '" type="button" data-image-url="' + escapeHtml(publicMediaUrl) + '" data-image-fallback-url="' + escapeHtml(fallbackMediaUrl) + '" data-sender-name="' + escapeHtml(senderName) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-sender-avatar="' + escapeHtml(senderAvatar) + '" data-created-at="' + escapeHtml(message.createdAt || "") + '">' +
    '<span class="' + shellClass + '"' + getStyle() + '>' +
      '<img class="' + imageClass + '" src="' + escapeHtml(publicMediaUrl) + '" data-fallback-src="' + escapeHtml(fallbackMediaUrl) + '" alt="' + escapeHtml(caption || "Photo") + '" decoding="async" />' +
      spinnerMarkup +
    '</span>' +
  '</button>';
};

const getAudioDisplayName = (message: any) => {
  const fromAttachment = String(message?.attachmentName || "").trim();
  if (fromAttachment && !/^[_\-\s.]+$/.test(fromAttachment)) {
    return fromAttachment;
  }
  const fromBody = String(message?.body || "").trim();
  if (fromBody) {
    return fromBody;
  }
  return "Audio";
};

const formatAudioMetaLabel = (seconds: number, sizeBytes: number, options: any = {}) => {
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

const renderAudioMessageHtml = (message: any) => {
  const publicMediaUrl = resolvePublicMediaUrl(message.mediaUrl);
  const fallbackMediaUrl = resolveWebMediaUrlFallback(message.mediaUrl);
  const displayName = getAudioDisplayName(message);
  const durationSeconds = Number(message?.attachmentDurationSeconds) || 0;
  const sizeBytes = Number(message?.attachmentSize) || 0;
  const metaLabel = formatAudioMetaLabel(durationSeconds, sizeBytes);
  const caption = String(message?.body || "").trim();

  const isActiveTrack = (
    getWin().activeAudioElement instanceof HTMLAudioElement
    && !getWin().activeAudioElement.paused
    && String(getWin().activeAudioMessageId || "") === String(message.id || "")
  );
  const toggleIcon = isActiveTrack ? "pause" : "play_arrow";
  return renderReplyPreviewHtml(message) + '<div class="message-audio-wrap">' +
    '<div class="tg-audio-message message-audio-card' + (isActiveTrack ? " is-playing" : "") + '" data-audio-card data-message-id="' + escapeHtml(message.id) + '" data-audio-duration="' + escapeHtml(String(durationSeconds)) + '" data-audio-size="' + escapeHtml(String(sizeBytes)) + '" title="' + escapeHtml(displayName) + '">' +
       '<button class="tg-audio-play message-audio-toggle" type="button" data-audio-toggle aria-label="Play audio">' +
         safeGetIcon(toggleIcon, "tg-audio-icon message-audio-toggle-icon", 'aria-hidden="true"') +
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

const renderMessageBodyHtml = (message: any) => {
  const callMarker = parseCallSummaryMessage(message);
  if (
    getWin().currentDialogSnapshot?.type === "group"
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
      '<div class="message-call-icon">' + safeGetIcon(callSummary.icon, "", 'aria-hidden="true"') + '</div>' +
      '<div class="message-call-copy">' +
        '<div class="message-call-title">' + escapeHtml(callSummary.title) + '</div>' +
        '<div class="message-call-subtitle">' + escapeHtml(callSummary.subtitle) + '</div>' +
      '</div>' +
    '</div>';
  }

  if (message?.type === "image" && message.mediaUrl) {
    const caption = String(message.body || "").trim();
    const senderName = String(message.senderName || (message.senderId === getWin().currentUserId ? (getWin().workspaceUserName?.textContent || "You") : "TheGraphT"));
    return renderReplyPreviewHtml(message) + '<div class="message-visual">' +
      renderImageLinkHtml(message, caption, senderName) +
      (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
    '</div>';
  }

  if (message?.type === "audio" && message.mediaUrl) {
    return renderAudioMessageHtml(message);
  }

  return renderReplyPreviewHtml(message) + '<div class="message-body">' + linkifyMessageBody(message.body || message.text || "") + '</div>';
};

const renderDaySeparator = (value: any) => {
  const dayTs = startOfDayTs(value);
  const label = formatDaySeparatorLabel(value);
  if (!dayTs || !label) {
    return "";
  }
  return '<div class="message-day-separator" data-day-ts="' + escapeHtml(String(dayTs)) + '"><span>' + escapeHtml(label) + '</span></div>';
};
getWin().renderDaySeparator = renderDaySeparator;

const getMessageEpochSeconds = (message: any): number => {
  if (!message || typeof message !== "object") {
    return 0;
  }
  const tsMs = toEpochMs(message.createdAt || 0);
  if (!Number.isFinite(tsMs) || tsMs <= 0) {
    const rawDate = String(message.date || "").trim();
    if (!rawDate) {
      return 0;
    }
    const isNumericEpoch = /^\d{10,}$/.test(rawDate);
    const hasCalendarDate = /\d{4}-\d{2}-\d{2}/.test(rawDate) || /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(rawDate);
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

const isNewDay = (prevMsg: any, nextMsg: any): boolean => {
  const prevSec = getMessageEpochSeconds(prevMsg);
  const nextSec = getMessageEpochSeconds(nextMsg);
  if (!prevSec || !nextSec) {
    return true;
  }
  return new Date(prevSec * 1000).toDateString() !== new Date(nextSec * 1000).toDateString();
};

const debugDaySeparators = (stage: string, payload: any = {}) => {
  try {
    const isDirect = getWin().currentDialogSnapshot?.type === "direct" || getWin().currentDialogSnapshot?.type === "private";
    if (!isDirect) {
      return;
    }
    console.log("[TG_DAY_DEBUG]", stage, {
      dialogPublicId: getWin().currentDialogSnapshot?.publicId || null,
      dialogType: getWin().currentDialogSnapshot?.type || null,
      ...payload
    });
  } catch {}
};

const sortMessagesChronologically = (messages: any[]): any[] => {
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

const getMessageDayValue = (message: any) => {
  const messageEpochSeconds = getMessageEpochSeconds(message);
  if (messageEpochSeconds > 0) {
    return messageEpochSeconds * 1000;
  }
  return message?.createdAt || Date.now();
};

const normalizeMessageDaySeparators = () => {
  if (!getWin().messageList) {
    return;
  }

  const nodes = Array.from(getWin().messageList.children);
  const seenDayTs = new Set<string>();
  let activeSeparator: HTMLElement | null = null;
  let activeSeparatorHasMessage = false;

  const isRenderableMessageNode = (node: Element) => (
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

  const messageById = new Map<string, any>();
  if (Array.isArray(getWin().currentMessagesSnapshot)) {
    getWin().currentMessagesSnapshot.forEach((entry: any) => {
      const id = String(entry?.id || "");
      if (id) {
        messageById.set(id, entry);
      }
    });
  }
  if (getWin().currentDialogPublicId && typeof getLocalMessagesForDialog === "function") {
    getLocalMessagesForDialog(getWin().currentDialogPublicId).forEach((entry: any) => {
      const id = String(entry?.id || "");
      if (id && !messageById.has(id)) {
        messageById.set(id, entry);
      }
    });
  }

  const createSeparatorNode = (dayValue: any) => {
    const separatorContainer = document.createElement("div");
    separatorContainer.innerHTML = renderDaySeparator(dayValue);
    return separatorContainer.firstElementChild instanceof HTMLElement
      ? separatorContainer.firstElementChild
      : null;
  };

  let lastRenderableDayTs = "";
  Array.from(getWin().messageList.children).forEach((node) => {
    if (!(node instanceof HTMLElement) || !isRenderableMessageNode(node)) {
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
          getWin().messageList.insertBefore(separatorNode, node);
        }
      }
    }

    lastRenderableDayTs = dayTs;
  });
};

const buildRenderableMessageItems = (messages: any[]): any[] => {
  const items: any[] = [];
  let previousRenderableMessage: any = null;
  const orderedMessages = sortMessagesChronologically(messages);
  const dayBuckets: string[] = [];
  const seenDayBuckets = new Set<number>();

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

const getStableSenderColor = (senderId: string, senderName: string = ""): string => {
  const seed = String(senderId || senderName || "sender");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GROUP_SENDER_NAME_COLORS.length;
  return GROUP_SENDER_NAME_COLORS[index];
};

const renderMessageAvatarHtml = (message: any, isOutgoing: boolean): string => {
  const dialog = getWin().currentDialogSnapshot || {};
  const isSaved = dialog.type === "saved";
  const isDirect = ["direct", "private", "secret"].includes(String(dialog.type || ""));
  const currentUserName = String(
    getWin().currentUserDisplayName
    || getWin().currentUserUsername
    || getWin().workspaceUserName?.textContent
    || "You"
  ).trim() || "You";
  const senderName = String(message?.senderName || dialog.title || "Member").trim() || "Member";
  const label = (isOutgoing || isSaved) ? currentUserName : senderName;
  const seed = (isOutgoing || isSaved)
    ? (getWin().currentUserId || "saved-self")
    : (message?.senderId || dialog.peerUserId || dialog.id || label);
  const embeddedAvatarUrl = String(
    message?.senderAvatar
    || message?.senderPhoto
    || message?.sender?.avatarUrl
    || message?.sender?.photoUrl
    || ""
  ).trim();
  const avatarUrl = String(
    (isOutgoing || isSaved)
      ? (getWin().currentUserAvatarUrl || embeddedAvatarUrl)
      : (embeddedAvatarUrl || (isDirect ? dialog.avatarUrl : "") || dialog.avatarUrl || "")
  ).trim();
  const generated = getAvatarMeta(seed, label);
  const resolvedAvatarUrl = avatarUrl || generated.avatarUrl;
  const styleAttr = avatarUrl ? "" : ' style="' + generated.style + '"';

  return '<span class="message-avatar" aria-hidden="true"' + styleAttr + '>' +
    '<img class="generated-avatar-photo" src="' + escapeHtml(resolvedAvatarUrl) + '" alt="" />' +
  '</span>';
};

const getRenderableItemTailMessage = (item: any) => {
  if (!item || !Array.isArray(item.messages) || !item.messages.length) {
    return null;
  }
  return item.messages[item.messages.length - 1] || null;
};

const getRenderableItemLeadMessage = (item: any) => {
  if (!item || !Array.isArray(item.messages) || !item.messages.length) {
    return null;
  }
  return item.messages[0] || null;
};

const GROUP_SEQUENCE_GAP_MS = 2 * 60 * 60 * 1000;
const isFeedStyleDialog = () => {
  const type = String(getWin().currentDialogSnapshot?.type || "");
  return type === "channel";
};
const getCurrentUserId = () => String(getWin().currentUserId || "").trim();
const getMessageSenderId = (message: any) => String(
  message?.senderId || message?.sender_id || message?.fromId || ""
).trim();
const isOutgoingMessage = (message: any) => {
  if (!message || isFeedStyleDialog()) {
    return false;
  }
  const currentUserId = getCurrentUserId();
  const senderId = getMessageSenderId(message);
  if (currentUserId && senderId && senderId === currentUserId) {
    return true;
  }
  return Boolean(message.localStatus || message.outgoing === true || message.isOut === true);
};

const getItemTimestampMs = (item: any) => {
  const tailMessage = getRenderableItemTailMessage(item);
  if (!tailMessage) {
    return 0;
  }
  const dateMs = typeof getWin().toEpochMs === "function"
    ? getWin().toEpochMs(tailMessage.createdAt)
    : Date.parse(String(tailMessage.createdAt || ""));
  return dateMs && !Number.isNaN(dateMs) ? dateMs : 0;
};

const getItemLeadTimestampMs = (item: any) => {
  const leadMessage = getRenderableItemLeadMessage(item);
  if (!leadMessage) {
    return 0;
  }
  const dateMs = typeof getWin().toEpochMs === "function"
    ? getWin().toEpochMs(leadMessage.createdAt)
    : Date.parse(String(leadMessage.createdAt || ""));
  return dateMs && !Number.isNaN(dateMs) ? dateMs : 0;
};

const isRenderableBubbleItem = (item: any) => (
  Boolean(item && (item.kind === "message" || item.kind === "album"))
);

const isOutgoingBubbleItem = (item: any) => isOutgoingMessage(getRenderableItemTailMessage(item));

const getItemSenderKey = (item: any) => {
  if (isOutgoingBubbleItem(item)) {
    return "__outgoing__";
  }
  const dialog = getWin().currentDialogSnapshot || {};
  const dialogType = String(dialog.type || "");
  const tailMessage = getRenderableItemTailMessage(item);
  const senderId = getMessageSenderId(tailMessage);
  if (dialogType === "channel" || dialogType === "bot") {
    return "channel:" + String(dialog.publicId || dialog.id || senderId || "channel");
  }
  if (dialogType === "direct" || dialogType === "private" || dialogType === "secret") {
    return "peer:" + String(senderId || dialog.peerUserId || dialog.publicId || "peer");
  }
  return String(senderId || tailMessage?.senderName || "incoming");
};

const isIncomingPeerBubbleItem = (item: any) => {
  if (!isRenderableBubbleItem(item)) {
    return false;
  }
  const tailMessage = getRenderableItemTailMessage(item);
  return Boolean(tailMessage && !isOutgoingBubbleItem(item));
};

const shouldUseIncomingShell = (_dialogType: string, isOutgoing: boolean) => !isOutgoing;

const findPreviousBubbleItem = (items: any[], startIndex: number, matcher: (item: any) => boolean) => {
  for (let index = startIndex - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (!item) {
      continue;
    }
    if (item.kind === "day") {
      return null;
    }
    if (isRenderableBubbleItem(item)) {
      return matcher(item) ? item : null;
    }
  }
  return null;
};

const findNextBubbleItem = (items: any[], startIndex: number, matcher: (item: any) => boolean) => {
  for (let index = startIndex + 1; index < items.length; index += 1) {
    const item = items[index];
    if (!item) {
      continue;
    }
    if (item.kind === "day") {
      return null;
    }
    if (isRenderableBubbleItem(item)) {
      return matcher(item) ? item : null;
    }
  }
  return null;
};

const continuesIncomingSequence = (previousItem: any, currentItem: any) => {
  if (!previousItem || !currentItem) {
    return false;
  }
  const previousTail = getRenderableItemTailMessage(previousItem);
  const currentTail = getRenderableItemTailMessage(currentItem);
  if (!previousTail || !currentTail) {
    return false;
  }
  if (getItemSenderKey(previousItem) !== getItemSenderKey(currentItem)) {
    return false;
  }
  const previousTs = getItemTimestampMs(previousItem);
  const currentLeadTs = getItemLeadTimestampMs(currentItem);
  if (previousTs > 0 && currentLeadTs > 0 && (currentLeadTs - previousTs) > GROUP_SEQUENCE_GAP_MS) {
    return false;
  }
  return true;
};

const continuesOutgoingSequence = (previousItem: any, currentItem: any) => (
  continuesIncomingSequence(previousItem, currentItem)
);

const buildSequencePosition = (continuesWithPrev: boolean, continuesWithNext: boolean) => {
  if (!continuesWithPrev && !continuesWithNext) {
    return "single";
  }
  if (!continuesWithPrev && continuesWithNext) {
    return "first";
  }
  if (continuesWithPrev && continuesWithNext) {
    return "middle";
  }
  return "last";
};

const buildSequenceClassSuffix = (meta: { seqPosition?: string; showTail?: boolean } | null | undefined) => {
  if (!meta?.seqPosition) {
    return "";
  }
  let suffix = " message-seq-" + meta.seqPosition;
  if (meta.showTail) {
    suffix += " message-has-tail";
  }
  return suffix;
};

const BUBBLE_TAIL_SVG = '<svg class="tg-bubble-tail-svg" viewBox="0 0 8 17" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path fill="currentColor" d="M1 17H8V0H7C6.807 2.8393 6.1238 5.7667 4.9504 8.7824 4.04603 11.1066 2.5041 13.2667.3247 15.2625c-.40731.373-.43513 1.0056-.06213 1.4129.18943.20685.45702.32465.7375.32465z"/></svg>';
const FALLBACK_OUTGOING_SEQ_META = {
  seqPosition: "single",
  showTail: true,
  isContinued: false
};
const FALLBACK_INCOMING_SEQ_META = {
  seqPosition: "single",
  showTail: true,
  showAvatar: true,
  showAvatarSpacer: false,
  showName: false,
  isContinued: false
};
const renderBubbleTailHtml = (meta: { showTail?: boolean } | null | undefined) => (
  meta?.showTail ? '<span class="tg-bubble-tail" aria-hidden="true">' + BUBBLE_TAIL_SVG + '</span>' : ""
);
const resolveOutgoingSeqMeta = (isOutgoing: boolean, meta: any) => (
  isOutgoing ? (meta || FALLBACK_OUTGOING_SEQ_META) : null
);
const resolveIncomingSeqMeta = (isOutgoing: boolean, meta: any) => (
  isOutgoing ? null : (meta || FALLBACK_INCOMING_SEQ_META)
);

const annotateIncomingSequences = (items: any[]): any[] => {
  if (!Array.isArray(items) || !items.length) {
    return items;
  }

  const dialogType = String(getWin().currentDialogSnapshot?.type || "");

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!isIncomingPeerBubbleItem(item)) {
      item.groupIncomingMeta = null;
      continue;
    }

    const previousItem = findPreviousBubbleItem(items, index, isIncomingPeerBubbleItem);
    const nextItem = findNextBubbleItem(items, index, isIncomingPeerBubbleItem);
    const continuesWithPrev = continuesIncomingSequence(previousItem, item);
    const continuesWithNext = continuesIncomingSequence(item, nextItem);
    const seqPosition = buildSequencePosition(continuesWithPrev, continuesWithNext);

    item.groupIncomingMeta = {
      seqPosition,
      showName: dialogType === "group" && (seqPosition === "single" || seqPosition === "first"),
      showAvatar: seqPosition === "single" || seqPosition === "last",
      showAvatarSpacer: seqPosition === "first" || seqPosition === "middle",
      showTail: seqPosition === "single" || seqPosition === "last",
      isContinued: continuesWithPrev
    };
  }

  return items;
};

const annotateOutgoingSequences = (items: any[]): any[] => {
  if (!Array.isArray(items) || !items.length) {
    return items;
  }

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!isOutgoingBubbleItem(item)) {
      item.outgoingSeqMeta = null;
      continue;
    }

    const previousItem = findPreviousBubbleItem(items, index, isOutgoingBubbleItem);
    const nextItem = findNextBubbleItem(items, index, isOutgoingBubbleItem);
    const continuesWithPrev = continuesOutgoingSequence(previousItem, item);
    const continuesWithNext = continuesOutgoingSequence(item, nextItem);
    const seqPosition = buildSequencePosition(continuesWithPrev, continuesWithNext);

    item.outgoingSeqMeta = {
      seqPosition,
      showTail: seqPosition === "single" || seqPosition === "last",
      isContinued: continuesWithPrev
    };
  }

  return items;
};

const annotateMessageSequences = (items: any[]): any[] => {
  if (!Array.isArray(items) || !items.length) {
    return items;
  }
  annotateIncomingSequences(items);
  annotateOutgoingSequences(items);
  return items;
};

const annotateGroupIncomingSequences = annotateMessageSequences;

const renderIncomingPeerAvatarHtml = (message: any) => {
  const dialog = getWin().currentDialogSnapshot || {};
  const senderName = String(message?.senderName || dialog.title || "Member").trim() || "Member";
  const senderId = String(message?.senderId || "");
  const useDialogAvatar = ["direct", "private", "secret", "channel", "bot"].includes(String(dialog.type || ""));
  const embeddedAvatarUrl = String(
    message?.senderAvatar
    || message?.senderPhoto
    || message?.sender?.avatarUrl
    || message?.sender?.photoUrl
    || ""
  ).trim();
  const avatarUrl = String(
    embeddedAvatarUrl || (useDialogAvatar ? dialog.avatarUrl : "") || ""
  ).trim();
  const generated = getAvatarMeta(senderId || senderName, senderName);
  const resolvedAvatarUrl = avatarUrl || generated.avatarUrl;
  const styleAttr = avatarUrl ? "" : ' style="' + generated.style + '"';

  return '<div class="group-incoming-avatar visible"' + styleAttr + '>' +
    '<div class="group-incoming-avatar-hit" data-sender-id="' + escapeHtml(senderId) + '" role="button" tabindex="0" aria-label="Open direct chat">' +
      '<img class="generated-avatar-photo" src="' + escapeHtml(resolvedAvatarUrl) + '" alt="' + escapeHtml(generated.letter || senderName.charAt(0) || "?") + '" />' +
    '</div>' +
  '</div>';
};

const renderGroupIncomingMessageShell = (message: any, contentHtml: string, meta: any = null) => {
  const senderName = String(message?.senderName || "Member").trim() || "Member";
  const senderId = String(message?.senderId || "");
  const senderColor = getStableSenderColor(senderId, senderName);
  const showAvatar = Boolean(meta?.showAvatar);
  const showAvatarSpacer = Boolean(meta?.showAvatarSpacer);
  const showName = Boolean(meta?.showName);
  const rowClasses = [
    "group-incoming-row",
    showAvatar ? "has-avatar" : "no-avatar",
    meta?.isContinued ? "group-incoming-row--continued" : ""
  ].filter(Boolean).join(" ");
  const tailMessage = message;
  const messageId = String(tailMessage?.id || "");

  return '<div class="' + rowClasses + '"' + (messageId ? ' data-message-id="' + escapeHtml(messageId) + '"' : "") + ' data-sender-id="' + escapeHtml(senderId) + '">' +
    (showAvatar
      ? renderIncomingPeerAvatarHtml(message)
      : (showAvatarSpacer ? '<div class="group-incoming-avatar placeholder" aria-hidden="true"></div>' : "")
    ) +
    '<div class="group-incoming-main">' +
      (showName ? '<div class="group-incoming-sender" style="color:' + escapeHtml(senderColor) + '">' + escapeHtml(senderName) + '</div>' : '') +
      contentHtml +
    '</div>' +
  '</div>';
};

const isLegacyTextOnlyMessage = (message: any) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  const messageType = String(message.type || "text");
  if (messageType !== "text") {
    return false;
  }

  if (message.mediaUrl || message.albumId) {
    return false;
  }

  const callMarker = parseCallSummaryMessage(message);
  if (
    getWin().currentDialogSnapshot?.type === "group"
    && callMarker
    && (callMarker.kind === "started_video" || callMarker.kind === "ended_video")
  ) {
    return false;
  }

  if (getCallSummaryPresentation(message)) {
    return false;
  }

  return true;
};

const buildLegacyTextMessageProps = (message: any, options: any = {}) => {
  const isOutgoing = isOutgoingMessage(message);
  const dateMs = typeof getWin().toEpochMs === "function"
    ? getWin().toEpochMs(message.createdAt)
    : Date.parse(String(message.createdAt || ""));
  const timeLabel = (dateMs && !Number.isNaN(dateMs) && dateMs > 0)
    ? (String(new Date(dateMs).getHours()).padStart(2, "0") + ":" + String(new Date(dateMs).getMinutes()).padStart(2, "0"))
    : "";
  const localStatusClass = message.localStatus ? " message-status-" + message.localStatus : "";
  const shouldLaunch = Boolean(message.animateOnRender);
  if (shouldLaunch) {
    message.animateOnRender = false;
  }
  const launchClass = shouldLaunch ? " message-launch" : "";
  const outgoingSeqMeta = resolveOutgoingSeqMeta(Boolean(isOutgoing), options.outgoingSeqMeta);
  const incomingSeqMeta = resolveIncomingSeqMeta(Boolean(isOutgoing), options.groupIncomingMeta);
  const incomingSeqClass = !isOutgoing ? buildSequenceClassSuffix(incomingSeqMeta) : "";
  const outgoingSeqClass = isOutgoing ? buildSequenceClassSuffix(outgoingSeqMeta) : "";
  const continuedClass = isOutgoing
    ? (outgoingSeqMeta?.isContinued ? " message-seq-continued" : "")
    : (incomingSeqMeta?.isContinued ? " message-seq-continued" : "");
  const articleClassName = "message"
    + (isOutgoing ? "" : " incoming")
    + localStatusClass
    + launchClass
    + incomingSeqClass
    + outgoingSeqClass
    + continuedClass;
  const seqMeta = isOutgoing ? outgoingSeqMeta : incomingSeqMeta;
  const dialogType = String(getWin().currentDialogSnapshot?.type || "");
  const useShell = shouldUseIncomingShell(dialogType, Boolean(isOutgoing));
  let shell = null;

  if (useShell) {
    const senderName = String(message?.senderName || "Member").trim() || "Member";
    const senderId = String(message?.senderId || "");
    const senderColor = getStableSenderColor(senderId, senderName);
    const rowClassName = [
      "group-incoming-row",
      incomingSeqMeta?.showAvatar ? "has-avatar" : "no-avatar",
      incomingSeqMeta?.isContinued ? "group-incoming-row--continued" : ""
    ].filter(Boolean).join(" ");

    shell = {
      rowClassName,
      messageId: String(message.id || ""),
      senderId,
      senderName,
      senderColor,
      showAvatar: Boolean(incomingSeqMeta?.showAvatar),
      showAvatarSpacer: Boolean(incomingSeqMeta?.showAvatarSpacer),
      showName: Boolean(incomingSeqMeta?.showName),
      avatarHtml: incomingSeqMeta?.showAvatar ? renderIncomingPeerAvatarHtml(message) : ""
    };
  }

  return {
    messageId: String(message.id || ""),
    senderId: String(message.senderId || ""),
    messageType: String(message.type || "text"),
    attachmentName: String(message.attachmentName || ""),
    mediaUrl: String(message.mediaUrl || ""),
    articleClassName,
    timeLabel,
    replyPreviewHtml: renderReplyPreviewHtml(message),
    bodyHtml: linkifyMessageBody(message.body || message.text || ""),
    showTail: Boolean(seqMeta?.showTail),
    statusState: resolveLegacyTextStatusState(message, isOutgoing),
    shell
  };
};

const renderLegacyTextMessageNode = (message: any, options: any = {}) => (
  mountLegacyTextMessageDom(buildLegacyTextMessageProps(message, options))
);

const isLegacyMediaMessage = (message: any) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  const messageType = String(message.type || "text");
  if (messageType === "image" && message.mediaUrl && !message.albumId) {
    return true;
  }

  if (messageType === "audio" && message.mediaUrl) {
    return true;
  }

  return false;
};

const buildLegacyMediaShell = (message: any, incomingSeqMeta: any) => {
  const senderName = String(message?.senderName || "Member").trim() || "Member";
  const senderId = String(message?.senderId || "");
  const senderColor = getStableSenderColor(senderId, senderName);
  const rowClassName = [
    "group-incoming-row",
    incomingSeqMeta?.showAvatar ? "has-avatar" : "no-avatar",
    incomingSeqMeta?.isContinued ? "group-incoming-row--continued" : ""
  ].filter(Boolean).join(" ");

  return {
    rowClassName,
    messageId: String(message.id || ""),
    senderId,
    senderName,
    senderColor,
    showAvatar: Boolean(incomingSeqMeta?.showAvatar),
    showAvatarSpacer: Boolean(incomingSeqMeta?.showAvatarSpacer),
    showName: Boolean(incomingSeqMeta?.showName),
    avatarHtml: incomingSeqMeta?.showAvatar ? renderIncomingPeerAvatarHtml(message) : ""
  };
};

const buildLegacyArticleClassName = (message: any, isOutgoing: boolean, options: any = {}, config: { media?: boolean } = {}) => {
  const localStatusClass = message.localStatus ? " message-status-" + message.localStatus : "";
  const shouldLaunch = Boolean(message.animateOnRender);
  if (shouldLaunch) {
    message.animateOnRender = false;
  }
  const launchClass = shouldLaunch ? " message-launch" : "";
  const outgoingSeqMeta = resolveOutgoingSeqMeta(Boolean(isOutgoing), options.outgoingSeqMeta);
  const incomingSeqMeta = resolveIncomingSeqMeta(Boolean(isOutgoing), options.groupIncomingMeta);
  const incomingSeqClass = !isOutgoing ? buildSequenceClassSuffix(incomingSeqMeta) : "";
  const outgoingSeqClass = isOutgoing ? buildSequenceClassSuffix(outgoingSeqMeta) : "";
  const continuedClass = isOutgoing
    ? (outgoingSeqMeta?.isContinued ? " message-seq-continued" : "")
    : (incomingSeqMeta?.isContinued ? " message-seq-continued" : "");
  const hasCaption = Boolean(String(message.body || "").trim());
  const captionClass = hasCaption ? " has-caption" : "";
  const mediaClass = config.media ? (" message-media" + captionClass) : "";

  return {
    articleClassName: "message"
      + mediaClass
      + (isOutgoing ? "" : " incoming")
      + localStatusClass
      + launchClass
      + incomingSeqClass
      + outgoingSeqClass
      + continuedClass,
    outgoingSeqMeta,
    incomingSeqMeta,
    seqMeta: isOutgoing ? outgoingSeqMeta : incomingSeqMeta
  };
};

const buildLegacyMediaArticleClassName = (message: any, isOutgoing: boolean, options: any = {}) => (
  buildLegacyArticleClassName(message, Boolean(isOutgoing), options, { media: true })
);

const buildLegacyMediaMessageProps = (message: any, options: any = {}) => {
  const isOutgoing = isOutgoingMessage(message);
  const dateMs = typeof getWin().toEpochMs === "function"
    ? getWin().toEpochMs(message.createdAt)
    : Date.parse(String(message.createdAt || ""));
  const timeLabel = (dateMs && !Number.isNaN(dateMs) && dateMs > 0)
    ? (String(new Date(dateMs).getHours()).padStart(2, "0") + ":" + String(new Date(dateMs).getMinutes()).padStart(2, "0"))
    : "";
  const { articleClassName, incomingSeqMeta, seqMeta } = buildLegacyMediaArticleClassName(message, Boolean(isOutgoing), options);
  const dialogType = String(getWin().currentDialogSnapshot?.type || "");
  const useShell = shouldUseIncomingShell(dialogType, Boolean(isOutgoing));

  return {
    messageId: String(message.id || ""),
    senderId: String(message.senderId || ""),
    messageType: String(message.type || "text"),
    attachmentName: String(message.attachmentName || ""),
    mediaUrl: String(message.mediaUrl || ""),
    articleClassName,
    timeLabel,
    contentHtml: renderMessageBodyHtml(message),
    showTail: Boolean(seqMeta?.showTail),
    statusState: resolveLegacyTextStatusState(message, isOutgoing),
    shell: useShell ? buildLegacyMediaShell(message, incomingSeqMeta) : null
  };
};

const buildLegacyAlbumContentHtml = (albumMessages: any[], leadMessage: any) => {
  const senderName = String(leadMessage.senderName || (leadMessage.senderId === getWin().currentUserId ? (getWin().workspaceUserName?.textContent || "You") : "TheGraphT"));
  const caption = String(leadMessage.body || "").trim();

  return renderReplyPreviewHtml(leadMessage)
    + '<div class="message-visual">'
    + '<div class="message-album count-' + albumMessages.length + '">'
    + albumMessages.map((message) => {
      const tileCaption = String(message.body || "").trim() || caption;
      return '<div class="message-album-item" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' + renderImageLinkHtml(message, tileCaption, senderName) + '</div>';
    }).join("")
    + '</div>'
    + (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '')
    + '</div>';
};

const buildLegacyAlbumMessageProps = (albumMessages: any[], options: any = {}) => {
  const leadMessage = albumMessages[0];
  const tailMessage = albumMessages[albumMessages.length - 1];
  const isOutgoing = isOutgoingMessage(tailMessage);
  const dateMs = typeof getWin().toEpochMs === "function"
    ? getWin().toEpochMs(tailMessage.createdAt)
    : Date.parse(String(tailMessage.createdAt || ""));
  const timeLabel = (dateMs && !Number.isNaN(dateMs) && dateMs > 0)
    ? (String(new Date(dateMs).getHours()).padStart(2, "0") + ":" + String(new Date(dateMs).getMinutes()).padStart(2, "0"))
    : "";
  const caption = String(leadMessage.body || "").trim();
  const { articleClassName: baseArticleClassName, incomingSeqMeta, seqMeta } = buildLegacyMediaArticleClassName(tailMessage, Boolean(isOutgoing), options);
  let articleClassName = baseArticleClassName.replace(" has-caption", "");
  if (caption) {
    articleClassName = articleClassName.replace("message-media", "message-media has-caption");
  }
  const dialogType = String(getWin().currentDialogSnapshot?.type || "");
  const useShell = shouldUseIncomingShell(dialogType, Boolean(isOutgoing));

  return {
    messageId: String(tailMessage.id || ""),
    senderId: String(tailMessage.senderId || ""),
    messageType: String(tailMessage.type || "text"),
    attachmentName: String(tailMessage.attachmentName || ""),
    mediaUrl: String(tailMessage.mediaUrl || ""),
    articleClassName,
    timeLabel,
    contentHtml: buildLegacyAlbumContentHtml(albumMessages, leadMessage),
    showTail: Boolean(seqMeta?.showTail),
    statusState: resolveLegacyTextStatusState(tailMessage, isOutgoing),
    shell: useShell ? buildLegacyMediaShell(tailMessage, incomingSeqMeta) : null
  };
};

const renderLegacyMediaMessageNode = (message: any, options: any = {}) => (
  mountLegacyMediaMessageDom(buildLegacyMediaMessageProps(message, options))
);

const renderLegacyAlbumMessageNode = (albumMessages: any[], options: any = {}) => (
  mountLegacyMediaMessageDom(buildLegacyAlbumMessageProps(albumMessages, options))
);

const isLegacySystemRowMessage = (message: any) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  const callMarker = parseCallSummaryMessage(message);
  return Boolean(
    getWin().currentDialogSnapshot?.type === "group"
    && callMarker
    && (callMarker.kind === "started_video" || callMarker.kind === "ended_video")
  );
};

const isLegacyCallBubbleMessage = (message: any) => {
  if (!message || typeof message !== "object" || isLegacySystemRowMessage(message)) {
    return false;
  }

  return Boolean(getCallSummaryPresentation(message));
};

const buildGroupVideoSystemPillText = (message: any) => {
  const callMarker = parseCallSummaryMessage(message);
  const groupName = String(getWin().currentDialogSnapshot?.title || "Group").trim() || "Group";
  const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);
  const durationLabel = (() => {
    const safe = Math.max(0, Math.floor(Number(callMarker?.durationSeconds) || 0));
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

  return callMarker?.kind === "started_video"
    ? (groupName + " started a video chat")
    : (groupName + " ended the video chat (" + durationLabel + ")");
};

const buildLegacySystemRowProps = (message: any) => {
  const shouldLaunch = Boolean(message.animateOnRender);
  if (shouldLaunch) {
    message.animateOnRender = false;
  }

  return {
    rowClassName: "message-system-row" + (shouldLaunch ? " message-launch" : ""),
    messageId: String(message.id || ""),
    senderId: String(message.senderId || ""),
    messageType: String(message.type || "text"),
    attachmentName: String(message.attachmentName || ""),
    mediaUrl: String(message.mediaUrl || ""),
    pillText: buildGroupVideoSystemPillText(message)
  };
};

const buildLegacyCallBubbleMessageProps = (message: any, options: any = {}) => {
  const isOutgoing = isOutgoingMessage(message);
  const dateMs = typeof getWin().toEpochMs === "function"
    ? getWin().toEpochMs(message.createdAt)
    : Date.parse(String(message.createdAt || ""));
  const timeLabel = (dateMs && !Number.isNaN(dateMs) && dateMs > 0)
    ? (String(new Date(dateMs).getHours()).padStart(2, "0") + ":" + String(new Date(dateMs).getMinutes()).padStart(2, "0"))
    : "";
  const { articleClassName, incomingSeqMeta, seqMeta } = buildLegacyArticleClassName(message, Boolean(isOutgoing), options, { media: false });
  const dialogType = String(getWin().currentDialogSnapshot?.type || "");
  const useShell = shouldUseIncomingShell(dialogType, Boolean(isOutgoing));

  return {
    messageId: String(message.id || ""),
    senderId: String(message.senderId || ""),
    messageType: String(message.type || "text"),
    attachmentName: String(message.attachmentName || ""),
    mediaUrl: String(message.mediaUrl || ""),
    articleClassName,
    timeLabel,
    contentHtml: renderMessageBodyHtml(message),
    showTail: Boolean(seqMeta?.showTail),
    statusState: resolveLegacyTextStatusState(message, isOutgoing),
    shell: useShell ? buildLegacyMediaShell(message, incomingSeqMeta) : null
  };
};

const renderLegacyDaySeparatorNode = (dayValue: any): HTMLElement | null => {
  const dayTs = startOfDayTs(dayValue);
  const label = formatDaySeparatorLabel(dayValue);
  if (!dayTs || !label) {
    return null;
  }

  return mountLegacyDaySeparatorDom({
    dayTs: String(dayTs),
    label
  });
};

const renderLegacySystemRowNode = (message: any) => (
  mountLegacySystemRowMessageDom(buildLegacySystemRowProps(message))
);

const renderLegacyCallBubbleNode = (message: any, options: any = {}) => (
  mountLegacyMediaMessageDom(buildLegacyCallBubbleMessageProps(message, options))
);

const htmlToFirstElement = (html: string): HTMLElement | null => {
  if (!html) {
    return null;
  }

  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = html;
  const node = tempContainer.firstElementChild;
  return node instanceof HTMLElement ? node : null;
};

const renderAlbumMessage = (albumMessages: any[], options: any = {}) => {
  const leadMessage = albumMessages[0];
  const tailMessage = albumMessages[albumMessages.length - 1];
  const isOutgoing = isOutgoingMessage(tailMessage);
  const dateMs = typeof getWin().toEpochMs === "function"
    ? getWin().toEpochMs(tailMessage.createdAt)
    : Date.parse(String(tailMessage.createdAt || ""));
  const date = (dateMs && !Number.isNaN(dateMs) && dateMs > 0)
    ? (String(new Date(dateMs).getHours()).padStart(2, "0") + ":" + String(new Date(dateMs).getMinutes()).padStart(2, "0"))
    : "";
  const localStatusClass = tailMessage.localStatus ? ' message-status-' + tailMessage.localStatus : "";
  const shouldLaunch = Boolean(tailMessage.animateOnRender);
  if (shouldLaunch) {
    tailMessage.animateOnRender = false;
  }
  const launchClass = shouldLaunch ? " message-launch" : "";
  const senderName = String(leadMessage.senderName || (leadMessage.senderId === getWin().currentUserId ? (getWin().workspaceUserName?.textContent || "You") : "TheGraphT"));
  const caption = String(leadMessage.body || "").trim();
  const captionClass = caption ? " has-caption" : "";
  const dialogType = String(getWin().currentDialogSnapshot?.type || "");
  const outgoingSeqMeta = resolveOutgoingSeqMeta(Boolean(isOutgoing), options.outgoingSeqMeta);
  const incomingSeqMeta = resolveIncomingSeqMeta(Boolean(isOutgoing), options.groupIncomingMeta);
  const incomingSeqClass = !isOutgoing ? buildSequenceClassSuffix(incomingSeqMeta) : "";
  const outgoingSeqClass = isOutgoing ? buildSequenceClassSuffix(outgoingSeqMeta) : "";
  const continuedClass = isOutgoing
    ? (outgoingSeqMeta?.isContinued ? " message-seq-continued" : "")
    : (incomingSeqMeta?.isContinued ? " message-seq-continued" : "");

  const articleHtml = '<article class="message message-media' + captionClass + (isOutgoing ? "" : " incoming") + localStatusClass + launchClass + incomingSeqClass + outgoingSeqClass + continuedClass + '" data-message-id="' + escapeHtml(tailMessage.id) + '" data-sender-id="' + escapeHtml(tailMessage.senderId || "") + '" data-message-type="' + escapeHtml(tailMessage.type || "text") + '" data-attachment-name="' + escapeHtml(tailMessage.attachmentName || "") + '" data-media-url="' + escapeHtml(tailMessage.mediaUrl || "") + '">' +
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
    '<div class="message-meta"><span class="message-meta-time">' + date + '</span>' + getMessageStatusMarkup(tailMessage, isOutgoing) + '</div>' +
    renderBubbleTailHtml(isOutgoing ? outgoingSeqMeta : incomingSeqMeta) +
  '</article>';

  if (shouldUseIncomingShell(dialogType, Boolean(isOutgoing))) {
    return renderGroupIncomingMessageShell(tailMessage, articleHtml, incomingSeqMeta);
  }
  return articleHtml;
};

const renderSingleMessage = (message: any, options: any = {}) => {
  const callMarker = parseCallSummaryMessage(message);
  if (
    getWin().currentDialogSnapshot?.type === "group"
    && callMarker
    && (callMarker.kind === "started_video" || callMarker.kind === "ended_video")
  ) {
    const groupName = String(getWin().currentDialogSnapshot?.title || "Group").trim() || "Group";
    const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);
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

  const isOutgoing = isOutgoingMessage(message);
  const dateMs = typeof getWin().toEpochMs === "function"
    ? getWin().toEpochMs(message.createdAt)
    : Date.parse(String(message.createdAt || ""));
  const date = (dateMs && !Number.isNaN(dateMs) && dateMs > 0)
    ? (String(new Date(dateMs).getHours()).padStart(2, "0") + ":" + String(new Date(dateMs).getMinutes()).padStart(2, "0"))
    : "";
  const localStatusClass = message.localStatus ? ' message-status-' + message.localStatus : "";
  const shouldLaunch = Boolean(message.animateOnRender);
  if (shouldLaunch) {
    message.animateOnRender = false;
  }
  const launchClass = shouldLaunch ? " message-launch" : "";
  const hasCaption = Boolean(String(message.body || "").trim());
  const captionClass = hasCaption ? " has-caption" : "";
  const mediaClass = ((message.type === "image" && !message.albumId) || message.type === "audio") ? (" message-media" + captionClass) : "";
  const dialogType = String(getWin().currentDialogSnapshot?.type || "");
  const outgoingSeqMeta = resolveOutgoingSeqMeta(Boolean(isOutgoing), options.outgoingSeqMeta);
  const incomingSeqMeta = resolveIncomingSeqMeta(Boolean(isOutgoing), options.groupIncomingMeta);
  const incomingSeqClass = !isOutgoing ? buildSequenceClassSuffix(incomingSeqMeta) : "";
  const outgoingSeqClass = isOutgoing ? buildSequenceClassSuffix(outgoingSeqMeta) : "";
  const continuedClass = isOutgoing
    ? (outgoingSeqMeta?.isContinued ? " message-seq-continued" : "")
    : (incomingSeqMeta?.isContinued ? " message-seq-continued" : "");
  const articleHtml = '<article class="message' + mediaClass + (isOutgoing ? "" : " incoming") + localStatusClass + launchClass + incomingSeqClass + outgoingSeqClass + continuedClass + '" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' +
    renderMessageBodyHtml(message) +
    '<div class="message-meta"><span class="message-meta-time">' + date + '</span>' + getMessageStatusMarkup(message, isOutgoing) + '</div>' +
    renderBubbleTailHtml(isOutgoing ? outgoingSeqMeta : incomingSeqMeta) +
  '</article>';
  const useShell = shouldUseIncomingShell(dialogType, Boolean(isOutgoing));
  if (useShell) {
    return renderGroupIncomingMessageShell(message, articleHtml, incomingSeqMeta);
  }
  return articleHtml;
};

const renderRenderableItemHtml = (item: any) => {
  if (!item) {
    return "";
  }
  if (item.kind === "day") {
    return renderDaySeparator(item.dayValue);
  }
  if (item.kind === "album") {
    return renderAlbumMessage(item.messages, {
      groupIncomingMeta: item.groupIncomingMeta,
      outgoingSeqMeta: item.outgoingSeqMeta
    });
  }
  return renderSingleMessage(item.messages[0], {
    groupIncomingMeta: item.groupIncomingMeta,
    outgoingSeqMeta: item.outgoingSeqMeta
  });
};

const renderRenderableItemDom = (item: any): HTMLElement | null => {
  if (!item) {
    return null;
  }
  if (item.kind === "day") {
    return renderLegacyDaySeparatorNode(item.dayValue);
  }
  if (item.kind === "album") {
    return renderLegacyAlbumMessageNode(item.messages, {
      groupIncomingMeta: item.groupIncomingMeta,
      outgoingSeqMeta: item.outgoingSeqMeta
    });
  }

  const message = item.messages?.[0];
  if (message && isLegacyTextOnlyMessage(message)) {
    return renderLegacyTextMessageNode(message, {
      groupIncomingMeta: item.groupIncomingMeta,
      outgoingSeqMeta: item.outgoingSeqMeta
    });
  }

  if (message && isLegacyMediaMessage(message)) {
    return renderLegacyMediaMessageNode(message, {
      groupIncomingMeta: item.groupIncomingMeta,
      outgoingSeqMeta: item.outgoingSeqMeta
    });
  }

  if (message && isLegacySystemRowMessage(message)) {
    return renderLegacySystemRowNode(message);
  }

  if (message && isLegacyCallBubbleMessage(message)) {
    return renderLegacyCallBubbleNode(message, {
      groupIncomingMeta: item.groupIncomingMeta,
      outgoingSeqMeta: item.outgoingSeqMeta
    });
  }

  return htmlToFirstElement(renderSingleMessage(message, {
    groupIncomingMeta: item.groupIncomingMeta,
    outgoingSeqMeta: item.outgoingSeqMeta
  }));
};

const reconcileSequenceTailDom = (allItems: any[]) => {
  const list = getWin().messageList;
  if (!list || !Array.isArray(allItems) || allItems.length < 2) {
    return;
  }

  let lastIndex = -1;
  let previousIndex = -1;
  for (let index = allItems.length - 1; index >= 0; index -= 1) {
    if (!isRenderableBubbleItem(allItems[index])) {
      continue;
    }
    if (lastIndex === -1) {
      lastIndex = index;
      continue;
    }
    previousIndex = index;
    break;
  }
  if (previousIndex < 0 || lastIndex < 0) {
    return;
  }

  const previousItem = allItems[previousIndex];
  const lastItem = allItems[lastIndex];
  const sameIncoming = isIncomingPeerBubbleItem(previousItem) && isIncomingPeerBubbleItem(lastItem);
  const sameOutgoing = isOutgoingBubbleItem(previousItem) && isOutgoingBubbleItem(lastItem);
  const continues = sameIncoming
    ? continuesIncomingSequence(previousItem, lastItem)
    : sameOutgoing
      ? continuesOutgoingSequence(previousItem, lastItem)
      : false;
  if (!continues) {
    return;
  }

  const previousTail = getRenderableItemTailMessage(previousItem);
  if (!previousTail?.id) {
    return;
  }

  const selector = '[data-message-id="' + CSS.escape(String(previousTail.id)) + '"]';
  const existingNode = list.querySelector(selector);
  if (!existingNode) {
    return;
  }

  const rowNode = existingNode.closest(".group-incoming-row") || existingNode;
  const replacementNode = renderRenderableItemDom(previousItem);
  if (replacementNode && rowNode.parentNode) {
    rowNode.replaceWith(replacementNode);
  }
};

const reconcileSequenceHeadDom = (allItems: any[]) => {
  const list = getWin().messageList;
  if (!list || !Array.isArray(allItems) || allItems.length < 2) {
    return;
  }

  let firstIndex = -1;
  let secondIndex = -1;
  for (let index = 0; index < allItems.length; index += 1) {
    if (!isRenderableBubbleItem(allItems[index])) {
      continue;
    }
    if (firstIndex === -1) {
      firstIndex = index;
      continue;
    }
    secondIndex = index;
    break;
  }
  if (firstIndex < 0 || secondIndex < 0) {
    return;
  }

  const firstItem = allItems[firstIndex];
  const secondItem = allItems[secondIndex];
  const sameIncoming = isIncomingPeerBubbleItem(firstItem) && isIncomingPeerBubbleItem(secondItem);
  const sameOutgoing = isOutgoingBubbleItem(firstItem) && isOutgoingBubbleItem(secondItem);
  const continues = sameIncoming
    ? continuesIncomingSequence(firstItem, secondItem)
    : sameOutgoing
      ? continuesOutgoingSequence(firstItem, secondItem)
      : false;
  if (!continues) {
    return;
  }

  const secondTail = getRenderableItemTailMessage(secondItem);
  if (!secondTail?.id) {
    return;
  }

  const selector = '[data-message-id="' + CSS.escape(String(secondTail.id)) + '"]';
  const existingNode = list.querySelector(selector);
  if (!existingNode) {
    return;
  }

  const rowNode = existingNode.closest(".group-incoming-row") || existingNode;
  const replacementNode = renderRenderableItemDom(secondItem);
  if (replacementNode && rowNode.parentNode) {
    rowNode.replaceWith(replacementNode);
  }
};

const applySequenceMetaFromSnapshot = (items: any[]) => {
  if (!Array.isArray(items) || !items.length) {
    return items;
  }

  const snapshot = getWin().currentMessagesSnapshot;
  if (!Array.isArray(snapshot) || !snapshot.length) {
    return annotateMessageSequences(items);
  }

  const allItems = annotateMessageSequences(buildRenderableMessageItems(snapshot));
  reconcileSequenceTailDom(allItems);

  const metaByTailId = new Map<string, any>();
  allItems.forEach((item) => {
    const tailMessage = getRenderableItemTailMessage(item);
    if (tailMessage?.id) {
      metaByTailId.set(String(tailMessage.id), item);
    }
  });

  items.forEach((item) => {
    const tailMessage = getRenderableItemTailMessage(item);
    const annotatedItem = tailMessage?.id ? metaByTailId.get(String(tailMessage.id)) : null;
    if (annotatedItem) {
      item.groupIncomingMeta = annotatedItem.groupIncomingMeta;
      item.outgoingSeqMeta = annotatedItem.outgoingSeqMeta;
    }
  });

  return items;
};

function appendRenderableItemsToMessageList(items: any[], options: any = {}) {
  if (!Array.isArray(items) || !items.length) {
    return false;
  }

  const normalizedItems = applySequenceMetaFromSnapshot(items);
  const nodes = normalizedItems.flatMap((item) => {
    const node = renderRenderableItemDom(item);
    return node ? [node] : [];
  });

  if (!nodes.length) {
    return false;
  }

  let hadReplacement = false;
  if (options.replaceMessageId) {
    const selector = '[data-message-id="' + CSS.escape(String(options.replaceMessageId)) + '"]';
    const previousNode = getWin().messageList.querySelector(selector);
    hadReplacement = Boolean(previousNode);
    if (previousNode instanceof HTMLElement && nodes.length > 0) {
      const primaryNewNode = nodes.shift();
      if (primaryNewNode instanceof HTMLElement) {
        const nextId = primaryNewNode.getAttribute("data-message-id") || "";
        if (nextId) {
          previousNode.setAttribute("data-message-id", nextId);
        }
        previousNode.classList.remove("message-status-pending", "sending");
        const prevStatus = previousNode.querySelector(STATUS_ICON_SELECTOR);
        const nextStatus = primaryNewNode.querySelector(STATUS_ICON_SELECTOR);
        if (prevStatus instanceof HTMLElement && nextStatus instanceof HTMLElement) {
          syncStatusNode(prevStatus, nextStatus);
        } else if (nextStatus) {
          previousNode.querySelector(".message-meta")?.appendChild(nextStatus);
        } else {
          previousNode.replaceWith(primaryNewNode);
        }
      }
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
    return !getWin().messageList.querySelector(selector);
  });

  if (!dedupedNodes.length) {
    if (hadReplacement) {
      normalizeMessageDaySeparators();
    }
    return hadReplacement;
  }

  const firstIncomingDayNode = dedupedNodes.find((node) => (
    node instanceof HTMLElement && node.classList.contains("message-day-separator")
  ));
  const existingDayNodes = getWin().messageList.querySelectorAll(".message-day-separator[data-day-ts]");
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
  getWin().messageList.appendChild(fragment);
  normalizeMessageDaySeparators();
  if (getWin().hydrateMessageImages) {
    getWin().hydrateMessageImages({ lockToken: 0 });
  }
  return true;
}

function appendLocalOutgoingMessageToCurrentDialog(localMessage: any, options: any = {}) {
  if (!getWin().currentDialogSnapshot || !localMessage || localMessage.dialogPublicId !== getWin().currentDialogSnapshot.publicId) {
    return false;
  }

  const emptyStateVisible = Boolean(
    getWin().messageList.querySelector(".empty-chat-state, .saved-empty-state, .direct-empty-state")
  );

  if (emptyStateVisible) {
    renderMessages(getWin().currentDialogSnapshot, getWin().currentMessagesSnapshot, {
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

  if (options.forceScrollBottom) {
    scrollMessagesToBottom(options.scrollBehavior || "auto");
  } else {
    syncChatScrollBottomButton();
  }

  if (typeof getWin().refreshCurrentDialogChrome === "function") {
    getWin().refreshCurrentDialogChrome();
  }

  return true;
}

function updateRenderedMessageStatus(messageId: string, status: string) {
  if (!messageId) {
    return;
  }

  const selector = '[data-message-id="' + CSS.escape(String(messageId)) + '"]';
  const node = getWin().messageList.querySelector(selector);
  if (!node) {
    return;
  }

  node.classList.remove("message-status-pending", "message-status-failed");
  if (status) {
    node.classList.add("message-status-" + status);
  }
}

const rerenderCurrentDialog = (options: any = {}) => {
  if (!getWin().currentDialogSnapshot) {
    return;
  }

  renderMessages(getWin().currentDialogSnapshot, getWin().currentMessagesSnapshot, options);
};

const refreshOutgoingReadReceiptsInPlace = () => {
  if (!getWin().currentDialogSnapshot || !getWin().currentDialogPublicId) {
    return;
  }

  const messagesById = new Map<string, any>();
  if (Array.isArray(getWin().currentMessagesSnapshot)) {
    getWin().currentMessagesSnapshot.forEach((message: any) => {
      if (message?.id) {
        messagesById.set(String(message.id), message);
      }
    });
  }
  if (getWin().currentDialogPublicId && typeof getLocalMessagesForDialog === "function") {
    getLocalMessagesForDialog(getWin().currentDialogPublicId).forEach((message: any) => {
      if (message?.id) {
        messagesById.set(String(message.id), message);
      }
    });
  }

  getWin().messageList.querySelectorAll(".message[data-message-id]").forEach((node: Element) => {
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
    const statusNode = metaNode.querySelector(STATUS_ICON_SELECTOR);
    if (statusNode instanceof HTMLElement && nextStatusMarkup) {
      const temp = document.createElement("span");
      temp.innerHTML = nextStatusMarkup;
      const nextStatus = temp.firstElementChild;
      if (nextStatus instanceof HTMLElement) {
        syncStatusNode(statusNode, nextStatus);
      }
      return;
    }
    if (nextStatusMarkup) {
      metaNode.insertAdjacentHTML("beforeend", nextStatusMarkup);
    }
  });
};

const purgeStaleClientCaches = () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  void navigator.serviceWorker.getRegistrations().then((regs) => (
    Promise.all(regs.map((reg) => reg.unregister()))
  )).then(() => (
    typeof caches === "undefined" ? [] : caches.keys()
  )).then((keys) => Promise.all((keys || []).map((key) => caches.delete(key)))).catch(() => undefined);
};

purgeStaleClientCaches();

getWin().normalizeMessageDaySeparators = normalizeMessageDaySeparators;
getWin().buildRenderableMessageItems = buildRenderableMessageItems;
getWin().rerenderCurrentDialog = rerenderCurrentDialog;
getWin().appendLocalOutgoingMessageToCurrentDialog = appendLocalOutgoingMessageToCurrentDialog;
getWin().appendRenderableItemsToMessageList = appendRenderableItemsToMessageList;
getWin().updateRenderedMessageStatus = updateRenderedMessageStatus;
getWin().refreshOutgoingReadReceiptsInPlace = refreshOutgoingReadReceiptsInPlace;
getWin().renderSingleMessage = renderSingleMessage;
getWin().renderRenderableItemDom = renderRenderableItemDom;
getWin().renderAlbumMessage = renderAlbumMessage;
getWin().annotateGroupIncomingSequences = annotateGroupIncomingSequences;
getWin().annotateMessageSequences = annotateMessageSequences;
getWin().applySequenceMetaFromSnapshot = applySequenceMetaFromSnapshot;
getWin().reconcileSequenceHeadDom = reconcileSequenceHeadDom;
getWin().formatAudioMetaLabel = formatAudioMetaLabel;
