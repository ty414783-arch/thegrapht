export {};

declare const localOutgoingMessages: any[];
declare const renderEmojiAwareTextHtml: (value: string) => string;

const getWin = () => window as any;

const getLocalMessagesForDialog = (dialogPublicId: string) => localOutgoingMessages.filter((message) => message.dialogPublicId === dialogPublicId);

const releaseLocalMessageMediaUrls = () => {
  for (const message of localOutgoingMessages) {
    if (message?.mediaUrl && String(message.mediaUrl).startsWith("blob:")) {
      URL.revokeObjectURL(message.mediaUrl);
    }
  }
};

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + " MB";
  }

  return Math.max(1, Math.round(bytes / 1024)) + " KB";
};

const formatPhotoCount = (count: number) => count === 1 ? "Send Photo" : ("Send " + count + " Photos");
const formatFileCount = (count: number) => count === 1 ? "Send File" : ("Send " + count + " Files");
const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remSeconds = total % 60;
  return minutes + ":" + String(remSeconds).padStart(2, "0");
};

const measureAudioDuration = (src: string) => new Promise<number>((resolve) => {
  if (!src) {
    resolve(0);
    return;
  }
  const audio = document.createElement("audio");
  let settled = false;
  const finish = (value: number) => {
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

const chunkItems = (items: any[], size: number) => {
  const result: any[][] = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
};

const toEpochMs = (value: any) => {
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

  if (/^\d+$/.test(raw)) {
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

const startOfDayTs = (value: any) => {
  const date = new Date(toEpochMs(value));
  if (Number.isNaN(date.getTime())) {
    return 0;
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const formatDaySeparatorLabel = (value: any) => {
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

const escapeHtml = (value: any) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const avatarPalettes = [
  ["#ffa48c", "#ff7870"],  // soft orange-red
  ["#8cd8ff", "#5cb5ff"],  // soft sky blue
  ["#7be3e3", "#45b0b0"],  // soft cyan teal
  ["#a4f08c", "#6dbd59"],  // soft green
  ["#e8a8ff", "#b07bf0"],  // soft violet/purple
  ["#ff9dbb", "#eb608f"],  // soft pink
  ["#ffb77c", "#ff8a7a"],  // soft sunset orange
  ["#93a5ff", "#637ce6"],  // soft indigo
  ["#6beed1", "#33be9e"],  // soft teal
  ["#ffd954", "#ffa726"],  // soft amber/gold
  ["#d7ccc8", "#a1887f"],  // soft warm brown
  ["#b0bec5", "#78909c"],  // soft slate blue-grey
];

const hashSeed = (seed: string) => {
  const text = String(seed || "?");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const buildGeneratedAvatarUrl = (seedSource: any, labelSource: any) => {
  const seed = String(seedSource || labelSource || "?");
  const hash = hashSeed(seed);
  const palette = avatarPalettes[hash % avatarPalettes.length];
  const rawLabel = String(labelSource || seedSource || "?").trim();
  const words = rawLabel.split(/\s+/);
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
    '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-family="Inter, Roboto, Segoe UI, sans-serif" font-size="64" font-weight="500">',
    letter,
    '</text></svg>'
  ].join("");
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
};

const getAvatarMeta = (seedSource: any, labelSource: any) => {
  const seed = String(seedSource || labelSource || "?");
  const hash = hashSeed(seed);
  const palette = avatarPalettes[Math.abs(hash) % avatarPalettes.length];
  const rawLabel = String(labelSource || seedSource || "?").trim();
  const words = rawLabel.split(/\s+/);
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

const isUndecryptableSecurePlaceholder = (value: string) => {
  const normalized = String(value || "").trim();
  return normalized === "Encrypted message unavailable on this device"
    || normalized === "New encrypted message"
    || normalized === "Encrypted message";
};

const parseCallSummaryMessage = (message: any) => {
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

const formatCallDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
};

const getCallSummaryPresentation = (message: any) => {
  const parsed = parseCallSummaryMessage(message);

  if (!parsed) {
    return null;
  }

  const currentUserId = getWin().currentUserId;
  const isOutgoing = message.senderId === currentUserId;
  const formatVideoChatDuration = (totalSeconds: number) => {
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

const getMessagePreviewText = (message: any) => {
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

const getReplyPreviewText = (message: any) => {
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

const renderReplyPreviewHtml = (message: any) => {
  if (!message?.replyToMessageId) {
    return "";
  }

  return '<div class="message-reply" data-reply-target-id="' + escapeHtml(message.replyToMessageId) + '">' +
    '<span class="message-reply-author">' + escapeHtml(message.replyToSenderName || "Message") + '</span>' +
    '<span class="message-reply-text">' + renderEmojiAwareTextHtml(getReplyPreviewText(message) || "Message") + '</span>' +
  '</div>';
};

const formatDialogListTime = (value: any) => {
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

const formatDialogPreview = (dialog: any) => {
  const typingPreview = getWin().getTypingPreview?.(dialog);
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

  const currentUserId = getWin().currentUserId;
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

const renderTypingPreviewHtml = (label: string) => (
  '<span class="typing-preview" aria-label="' + escapeHtml(label) + '">' +
    '<span class="typing-preview-text">' + escapeHtml(label.replace(/\.\.\.$/, "")) + '</span>' +
    '<span class="typing-preview-dots" aria-hidden="true">' +
      '<span class="typing-preview-dot"></span>' +
      '<span class="typing-preview-dot"></span>' +
      '<span class="typing-preview-dot"></span>' +
    '</span>' +
  '</span>'
);

const renderDialogPreviewHtml = (dialog: any) => {
  const typingPreview = getWin().getTypingPreview?.(dialog);

  if (typingPreview) {
    return renderTypingPreviewHtml(typingPreview);
  }

  return renderEmojiAwareTextHtml(formatDialogPreview(dialog));
};

const renderDialogSubtitleHtml = (dialog: any) => {
  const typingPreview = getWin().getTypingPreview?.(dialog);

  if (typingPreview) {
    return renderTypingPreviewHtml(typingPreview);
  }

  return escapeHtml(getWin().formatDialogSubtitle?.(dialog));
};

// Bind to window object
(window as any).getLocalMessagesForDialog = getLocalMessagesForDialog;
(window as any).releaseLocalMessageMediaUrls = releaseLocalMessageMediaUrls;
(window as any).formatBytes = formatBytes;
(window as any).formatPhotoCount = formatPhotoCount;
(window as any).formatFileCount = formatFileCount;
(window as any).formatDuration = formatDuration;
(window as any).measureAudioDuration = measureAudioDuration;
(window as any).chunkItems = chunkItems;
(window as any).toEpochMs = toEpochMs;
(window as any).startOfDayTs = startOfDayTs;
(window as any).formatDaySeparatorLabel = formatDaySeparatorLabel;
(window as any).escapeHtml = escapeHtml;
(window as any).hashSeed = hashSeed;
(window as any).buildGeneratedAvatarUrl = buildGeneratedAvatarUrl;
(window as any).getAvatarMeta = getAvatarMeta;
(window as any).isUndecryptableSecurePlaceholder = isUndecryptableSecurePlaceholder;
(window as any).parseCallSummaryMessage = parseCallSummaryMessage;
(window as any).formatCallDuration = formatCallDuration;
(window as any).getCallSummaryPresentation = getCallSummaryPresentation;
(window as any).getMessagePreviewText = getMessagePreviewText;
(window as any).getReplyPreviewText = getReplyPreviewText;
(window as any).renderReplyPreviewHtml = renderReplyPreviewHtml;
(window as any).formatDialogListTime = formatDialogListTime;
(window as any).formatDialogPreview = formatDialogPreview;
(window as any).renderTypingPreviewHtml = renderTypingPreviewHtml;
(window as any).renderDialogPreviewHtml = renderDialogPreviewHtml;
(window as any).renderDialogSubtitleHtml = renderDialogSubtitleHtml;
