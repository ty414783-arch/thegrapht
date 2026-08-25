import { h, render } from "preact";
import {
  getLegacyViewerAuthorAvatarStyle,
  LegacyViewerAuthorAvatar
} from "./LegacyViewerAuthorAvatar.tsx";
import { LegacyViewerModalShell } from "./LegacyViewerModalShell.tsx";
import {
  buildLegacyViewerAuthorInfo,
  type LegacyViewerAuthorInfo
} from "./legacyViewerModalSync.ts";

export function mountLegacyViewerModalShell() {
  const viewerModal = document.getElementById("viewer-modal");
  if (!viewerModal) {
    return;
  }

  render(h(LegacyViewerModalShell, {}), viewerModal);
}

export function renderLegacyViewerAuthor(params: {
  senderName?: string;
  senderId?: string;
  createdAt?: string;
  realAvatarUrl?: string;
}) {
  const info = buildLegacyViewerAuthorInfo(params);
  const avatarEl = document.getElementById("viewer-author-avatar");
  const nameEl = document.getElementById("viewer-author-name");
  const metaEl = document.getElementById("viewer-author-meta");

  if (avatarEl instanceof HTMLElement) {
    renderLegacyViewerAuthorAvatar(avatarEl, info);
  }
  if (nameEl) {
    nameEl.textContent = info.senderName;
  }
  if (metaEl) {
    metaEl.textContent = info.senderMeta;
  }
}

export function renderLegacyViewerAuthorAvatar(
  avatarEl: HTMLElement,
  info: Pick<LegacyViewerAuthorInfo, "avatar">
) {
  const avatarStyle = getLegacyViewerAuthorAvatarStyle(info.avatar);
  if (avatarStyle) {
    avatarEl.setAttribute("style", avatarStyle);
  } else {
    avatarEl.removeAttribute("style");
  }

  render(h(LegacyViewerAuthorAvatar, { avatar: info.avatar }), avatarEl);
}
