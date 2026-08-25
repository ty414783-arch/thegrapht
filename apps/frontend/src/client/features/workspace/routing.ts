import type { Dialog } from "../../store/types.ts";
import { getAppState } from "../../store/index.ts";

export const encodeSecretRouteToken = (value: unknown): string => {
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

export const decodeSecretRouteToken = (value: unknown): string => {
  try {
    const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    return decodeURIComponent(escape(window.atob(normalized + padding)));
  } catch {
    return "";
  }
};

const getDialogUsername = (dialog: Dialog | null | undefined): string => {
  if (!dialog) return "";
  const peerUsername = String(dialog.peerUsername || "").trim().toLowerCase();
  if (peerUsername) return peerUsername.replace(/^@+/, "");
  const subtitle = String(dialog.subtitle || "").trim();
  if (subtitle.startsWith("@")) {
    return subtitle.replace(/^@+/, "").trim().toLowerCase();
  }
  return "";
};

export const getChannelRouteFromPath = (pathname = window.location.pathname) => {
  const path = String(pathname || "");
  if (!path.startsWith("/c/")) return null;
  const rest = decodeURIComponent(path.slice(3)).trim();
  if (!rest) return null;
  if (rest.startsWith("+")) {
    return { kind: "invite" as const, inviteToken: rest.slice(1) };
  }
  return { kind: "slug" as const, slug: rest.toLowerCase() };
};

export const getRoutedPublicId = (pathname = window.location.pathname): string => {
  const path = String(pathname || "/");
  if (!path || path === "/") return "";
  if (getChannelRouteFromPath(path)) return "";

  const lowerPath = path.toLowerCase();
  if (lowerPath.startsWith("/@") && (lowerPath.endsWith("/sc") || lowerPath.endsWith("/sc/"))) {
    const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
    const parts = trimmed.split("/");
    const usernamePart = parts.length >= 2 ? parts[1] : "";
    const url = new URL(window.location.href);
    const secretToken = url.searchParams.get("s") || "";
    const decodedPublicId = decodeSecretRouteToken(secretToken);
    if (decodedPublicId) return decodedPublicId;
    return "@" + decodeURIComponent(String(usernamePart || "").replace(/^@+/, ""));
  }

  if (path.startsWith("/g/")) {
    return decodeURIComponent(path.slice(3));
  }

  return decodeURIComponent(path.slice(1));
};

export const resolveRoutePathForDialog = (publicId: string, dialogs?: Dialog[]): string => {
  if (!publicId) return "/";

  const allDialogs = dialogs ?? getAppState().dialogs.all;
  const winDialogs = (window as any).allDialogs;
  const dialog = allDialogs.find((item) => item.publicId === publicId)
    ?? (Array.isArray(winDialogs) ? winDialogs.find((item: Dialog) => item.publicId === publicId) : null);

  if (!dialog) return "/" + publicId;

  if (dialog.type === "group") return "/g/" + publicId;

  if (dialog.type === "channel") {
    if (dialog.channelVisibility === "public" && dialog.channelSlug) {
      return "/c/" + dialog.channelSlug;
    }
    if (dialog.channelInviteToken) {
      return "/c/+" + dialog.channelInviteToken;
    }
  }

  const isSecretDialog = Boolean(
    (dialog.type === "secret" || dialog.type === "direct" || dialog.type === "private")
    && dialog.encryptionMode === "e2e_v1"
  );

  if (isSecretDialog) {
    const username = getDialogUsername(dialog);
    const secretToken = encodeSecretRouteToken(publicId);
    if (username && secretToken) {
      return "/@" + encodeURIComponent(username) + "/sc?s=" + encodeURIComponent(secretToken);
    }
    return "/" + publicId;
  }

  if (["direct", "private"].includes(dialog.type)) {
    const username = getDialogUsername(dialog);
    if (username) return "/@" + encodeURIComponent(username);
  }

  if (dialog.type === "saved") return "/saved";
  return "/" + publicId;
};

export const pushWorkspaceRoute = (publicId: string) => {
  const nextPath = resolveRoutePathForDialog(publicId);
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, "", nextPath);
  }
};
