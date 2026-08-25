import { h, render } from "preact";
import { LegacyProfileSummary } from "./LegacyProfileSummary.tsx";
import { t } from "../../i18n.ts";
import {
  clearLegacyProfileMembersList,
  mountLegacyProfileMembersList
} from "./legacyProfileMembersMount.tsx";
import type { LegacyProfileMemberRowProps } from "./LegacyProfileMemberRow.tsx";

const getWin = () => window as any;

const buildMemberRows = (dialog: any): LegacyProfileMemberRowProps[] => {
  const getGroupMembers = getWin().getGroupMembers;
  if (typeof getGroupMembers !== "function") {
    return [];
  }

  const getAvatarMeta = getWin().getAvatarMeta;
  const formatLastSeen = getWin().formatLastSeen;
  const currentUserId = String(getWin().currentUserId || "").trim();

  return getGroupMembers(dialog).map((member: any) => {
    const role = member.role === "owner"
      ? t("role.owner")
      : (member.role === "admin" ? t("role.admin") : t("role.member"));
    const memberUserId = String(member.userId || "").trim();
    const isSelfMember = memberUserId && memberUserId === currentUserId;
    const onlineUserIds = getWin().onlineUserIds;
    const isOnline = isSelfMember || (onlineUserIds instanceof Set
      ? onlineUserIds.has(memberUserId)
      : Array.isArray(onlineUserIds) && onlineUserIds.includes(memberUserId));
    const statusText = isOnline
      ? t("status.online")
      : (typeof formatLastSeen === "function" ? formatLastSeen(member.lastSeenAt) : "");
    const displayName = String(member.name || member.username || "User");
    const avatar = typeof getAvatarMeta === "function"
      ? getAvatarMeta(member.userId, displayName)
      : { style: "", avatarUrl: "", letter: "?" };

    return {
      userId: memberUserId,
      displayName,
      statusText,
      roleLabel: role,
      avatarStyle: String(avatar.style || ""),
      avatarUrl: String(avatar.avatarUrl || ""),
      avatarLetter: String(avatar.letter || "?")
    };
  });
};

export function renderLegacyProfileMembersList(dialog: any) {
  const membersSection = document.getElementById("chat-profile-members-section");
  const membersList = document.getElementById("chat-profile-members-list");
  if (!membersSection || !membersList) {
    return;
  }

  if (dialog?.type !== "group") {
    membersSection.style.display = "none";
    clearLegacyProfileMembersList(membersList);
    return;
  }

  membersSection.style.display = "block";
  mountLegacyProfileMembersList(membersList, buildMemberRows(dialog));
}

export function renderLegacyProfileSummary(dialog: any) {
  const summaryHost = document.querySelector(".chat-profile-summary");
  const getDetails = getWin().getChatProfileDetails;
  const getAvatarMarkup = getWin().getDialogAvatarMarkup;
  const isDirectDialogOnline = getWin().isDirectDialogOnline;

  if (!(summaryHost instanceof HTMLElement) || !dialog || typeof getDetails !== "function") {
    return false;
  }

  const details = getDetails(dialog);
  if (!details) {
    render(null, summaryHost);
    return false;
  }

  const isDirect = dialog.type === "direct" || dialog.type === "private" || dialog.type === "secret";
  const dialogKey = String(dialog.id || dialog.publicId || "");
  const avatarEl = document.getElementById("chat-profile-avatar");
  const showPresence = Boolean(isDirect);
  const isOnline = showPresence && typeof isDirectDialogOnline === "function" && isDirectDialogOnline(dialog);

  if (
    avatarEl instanceof HTMLElement
    && avatarEl.getAttribute("data-rendered-dialog-id") === dialogKey
    && avatarEl.querySelector(".dialog-avatar-presence")
  ) {
    const profilePresence = avatarEl.querySelector(".dialog-avatar-presence");
    if (profilePresence instanceof HTMLElement) {
      profilePresence.classList.toggle("online", Boolean(isOnline));
      const onlineLabel = t("status.online") || "Online";
      if (isOnline) {
        profilePresence.setAttribute("data-tooltip", onlineLabel);
        profilePresence.removeAttribute("title");
        profilePresence.setAttribute("aria-label", onlineLabel);
      } else {
        profilePresence.removeAttribute("data-tooltip");
        profilePresence.removeAttribute("title");
        profilePresence.removeAttribute("aria-label");
      }
    }

    const nameEl = document.getElementById("chat-profile-name");
    const statusEl = document.getElementById("chat-profile-status");
    if (nameEl) {
      nameEl.textContent = details.name;
    }
    if (statusEl) {
      statusEl.textContent = details.status || "profile";
    }
    return true;
  }

  const avatarHtml = typeof getAvatarMarkup === "function"
    ? getAvatarMarkup(dialog, { showPresence: isDirect })
    : "";

  render(
    h(LegacyProfileSummary, {
      dialogKey,
      avatarHtml,
      name: details.name,
      status: details.status || "profile"
    }),
    summaryHost
  );

  return true;
}

export function renderLegacyProfilePanelContent(dialog: any) {
  renderLegacyProfileSummary(dialog);
  renderLegacyProfileMembersList(dialog);
}
