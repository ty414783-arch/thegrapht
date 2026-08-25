export function getLegacyReplyPreviewCopy(message: any): string {
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
}

export function buildLegacyComposerReplyPreviewHtml(message: any): string {
  const copy = getLegacyReplyPreviewCopy(message) || "Message";
  const renderEmojiAwareTextHtml = (window as any).renderEmojiAwareTextHtml;
  if (typeof renderEmojiAwareTextHtml === "function") {
    return renderEmojiAwareTextHtml(copy);
  }
  return copy;
}

export type LegacyComposerReplyPreviewState = {
  visible: boolean;
  author: string;
  textHtml: string;
};

export function buildLegacyComposerReplyPreviewState(
  pendingReplyMessage: any
): LegacyComposerReplyPreviewState {
  if (!pendingReplyMessage) {
    return {
      visible: false,
      author: "",
      textHtml: ""
    };
  }

  return {
    visible: true,
    author: pendingReplyMessage.senderName || "Message",
    textHtml: buildLegacyComposerReplyPreviewHtml(pendingReplyMessage)
  };
}
