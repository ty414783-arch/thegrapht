export type LegacyViewerAuthorAvatarState =
  | {
      kind: "image";
      url: string;
      alt: string;
    }
  | {
      kind: "letter";
      letter: string;
      style: string;
    };

export function formatLegacyViewerTimestamp(value: unknown): string {
  const getToEpochMs = (window as any).toEpochMs;
  let ms = typeof getToEpochMs === "function"
    ? getToEpochMs(value)
    : (typeof value === "number"
        ? (value > 1000000000000 ? Math.floor(value) : Math.floor(value * 1000))
        : (typeof value === "string" && /^\d+$/.test(value.trim())
            ? (Number(value.trim()) > 1000000000000
                ? Math.floor(Number(value.trim()))
                : Math.floor(Number(value.trim()) * 1000))
            : Date.parse(String(value || ""))));

  if (!ms || Number.isNaN(ms) || ms <= 0) {
    return "";
  }

  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();
  const sameYear = now.getFullYear() === date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const timeStr = hours + ":" + minutes;

  if (sameDay) {
    return `Today at ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return `Yesterday at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" })
  });

  return `${dateStr}, ${timeStr}`;
}

export function resolveLegacyViewerAuthorAvatar(params: {
  senderId?: string;
  senderName?: string;
  realAvatarUrl?: string;
}): LegacyViewerAuthorAvatarState {
  const win = window as any;
  const senderId = params.senderId || "";
  const senderName = params.senderName || "?";
  const currentUserId = win.currentUserId;
  const isOwn = senderId && currentUserId && String(senderId) === String(currentUserId);
  const currentUserAvatarUrl = win.currentUserAvatarUrl;
  const currentDialogSnapshot = win.currentDialogSnapshot;

  let resolvedAvatarUrl = params.realAvatarUrl || "";
  if (!resolvedAvatarUrl && isOwn && currentUserAvatarUrl) {
    resolvedAvatarUrl = currentUserAvatarUrl;
  }
  if (
    !resolvedAvatarUrl
    && currentDialogSnapshot?.avatarUrl
    && String(currentDialogSnapshot.peerUserId || "") === String(senderId)
  ) {
    resolvedAvatarUrl = currentDialogSnapshot.avatarUrl;
  }

  if (resolvedAvatarUrl) {
    return {
      kind: "image",
      url: resolvedAvatarUrl,
      alt: senderName
    };
  }

  const getAvatarMeta = win.getAvatarMeta;
  if (typeof getAvatarMeta === "function") {
    const avatar = getAvatarMeta(senderId || senderName || "?", senderName || "?");
    if (avatar.avatarUrl && !avatar.avatarUrl.startsWith("data:image/svg+xml")) {
      return {
        kind: "image",
        url: avatar.avatarUrl,
        alt: avatar.letter || senderName
      };
    }
    return {
      kind: "letter",
      letter: avatar.letter || "?",
      style: avatar.style || ""
    };
  }

  return {
    kind: "letter",
    letter: senderName.slice(0, 1).toUpperCase() || "?",
    style: ""
  };
}

export type LegacyViewerAuthorInfo = {
  senderName: string;
  senderMeta: string;
  avatar: LegacyViewerAuthorAvatarState;
};

export function buildLegacyViewerAuthorInfo(params: {
  senderName?: string;
  senderId?: string;
  createdAt?: string;
  realAvatarUrl?: string;
}): LegacyViewerAuthorInfo {
  return {
    senderName: params.senderName || "TheGraphT",
    senderMeta: formatLegacyViewerTimestamp(params.createdAt),
    avatar: resolveLegacyViewerAuthorAvatar({
      senderId: params.senderId,
      senderName: params.senderName,
      realAvatarUrl: params.realAvatarUrl
    })
  };
}
