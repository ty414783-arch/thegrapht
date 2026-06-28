// call-utils.ts — ported from calls/call-utils.js
// All globals that the legacy code expects are read from window where needed.

declare const activeCall: Record<string, any> | null;
declare const currentUserId: string;
declare const currentUserDisplayName: string;
declare const workspaceUserName: HTMLElement;
declare const callModal: HTMLElement;
declare const callTimeoutTimer: ReturnType<typeof setInterval> | null;

type IceServerEntry = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

// ── helpers exposed to window ──────────────────────────────────────────────

export function createCallId(): string {
  return "call_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}

export const CALL_SETUP_TIMEOUT_MS = 22000;
export const CALL_RECONNECT_GRACE_MS = 8000;

export function formatCallDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
}

// ── ICE servers ────────────────────────────────────────────────────────────

function normalizeUrlsList(value: string | string[]): string[] {
  const list = Array.isArray(value) ? value : [value];
  return list
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function isValidIceUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const raw = value.trim();
  if (!raw) return false;
  return /^(stun|turn|turns):[a-z0-9.-]+(?::\d{1,5})?(?:\?.*)?$/i.test(raw);
}

function hasTurnUrl(value: string | string[]): boolean {
  return normalizeUrlsList(value).some((entry) => /^turns?:/i.test(entry));
}

function isValidTurnAuth(username: string, credential: string): boolean {
  return (
    typeof username === "string" &&
    username.trim().length > 0 &&
    typeof credential === "string" &&
    credential.trim().length > 0
  );
}

function buildFallbackIce(): IceServerEntry[] {
  const defaultTurnHost =
    window.location?.hostname || "89.35.130.157";
  return [
    { urls: "stun:" + defaultTurnHost + ":3478" },
    {
      urls: [
        "turn:" + defaultTurnHost + ":3478?transport=udp",
        "turn:" + defaultTurnHost + ":3478?transport=tcp",
      ],
      username: "thegrapht_turn",
      credential: "thegrapht_turn_pass",
    },
  ];
}

export function parseRtcIceServers(rtcIceServersRaw: string | null): IceServerEntry[] {
  const fallback = buildFallbackIce();
  if (!rtcIceServersRaw) return fallback;

  try {
    const parsed = JSON.parse(rtcIceServersRaw);
    if (!Array.isArray(parsed)) return fallback;

    const normalized = parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const urls = item.urls;
        const username = typeof item.username === "string" ? item.username.trim() : "";
        const credential = typeof item.credential === "string" ? item.credential.trim() : "";

        if (typeof urls === "string" || Array.isArray(urls)) {
          const filteredUrls = normalizeUrlsList(urls).filter((entry) =>
            isValidIceUrl(entry)
          );
          if (!filteredUrls.length) return null;
          if (hasTurnUrl(filteredUrls) && !isValidTurnAuth(username, credential))
            return null;
          return {
            urls: Array.isArray(urls) ? filteredUrls : filteredUrls[0],
            ...(username ? { username } : {}),
            ...(credential ? { credential } : {}),
          };
        }
        return null;
      })
      .filter(Boolean) as IceServerEntry[];

    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}

// ── Animated dots ──────────────────────────────────────────────────────────

export function buildAnimatedDots(): string {
  const phase = (Math.floor(Date.now() / 420) % 3) + 1;
  return ".".repeat(phase);
}

// ── Call elapsed time ──────────────────────────────────────────────────────

export function getCallElapsedSeconds(
  call: Record<string, any> | null,
  getGroupCallElapsed: (call: Record<string, any>) => number
): number {
  if (!call) return 0;
  if (call.mode === "group") return getGroupCallElapsed(call);
  if (!call.connectedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - call.connectedAt) / 1000));
}

// ── Recently-closed calls (stale-rejection) ────────────────────────────────

export const CLOSED_CALL_COOLDOWN_MS = 25000;
export const CALL_ACCEPT_BROADCAST_STORAGE_KEY = "thegrapht_call_accept_broadcast";

const recentlyClosedCalls = new Map<string, number>();

function pruneRecentlyClosedCalls(): void {
  const now = Date.now();
  for (const [key, expiresAt] of recentlyClosedCalls.entries()) {
    if (!Number.isFinite(expiresAt) || expiresAt <= now) {
      recentlyClosedCalls.delete(key);
    }
  }
}

function buildClosedCallKey(dialogId: string, callId: string): string {
  const safeDialogId = String(dialogId || "").trim();
  const safeCallId = String(callId || "").trim();
  if (!safeDialogId || !safeCallId) return "";
  return safeDialogId + "|" + safeCallId;
}

export function rememberRecentlyClosedCall(dialogId: string, callId: string): void {
  const key = buildClosedCallKey(dialogId, callId);
  if (!key) return;
  recentlyClosedCalls.set(key, Date.now() + CLOSED_CALL_COOLDOWN_MS);
}

export function isRecentlyClosedCall(dialogId: string, callId: string): boolean {
  pruneRecentlyClosedCalls();
  const key = buildClosedCallKey(dialogId, callId);
  if (!key) return false;
  return recentlyClosedCalls.has(key);
}

export function broadcastCallAcceptedAcrossTabs(
  call: { callId?: string; dialogId?: string } | null
): void {
  if (!call?.callId || !call?.dialogId) return;
  try {
    window.localStorage.setItem(
      CALL_ACCEPT_BROADCAST_STORAGE_KEY,
      JSON.stringify({
        callId: String(call.callId || ""),
        dialogId: String(call.dialogId || ""),
        acceptedAt: Date.now(),
      })
    );
  } catch {}
}

// ── Screen overlay helpers ─────────────────────────────────────────────────

type ScreenOverlayNodes = {
  overlay: HTMLElement;
  stage: HTMLElement;
  title: HTMLElement;
  owner: HTMLElement;
};

export function ensureScreenOverlayNodes(
  callModalEl: HTMLElement,
  getIcon: (name: string, cls: string, extra?: string) => string
): ScreenOverlayNodes | null {
  if (!(callModalEl instanceof HTMLElement)) return null;
  let overlay = callModalEl.querySelector<HTMLElement>(".call-screen-overlay");
  if (!(overlay instanceof HTMLElement)) {
    overlay = document.createElement("div");
    overlay.className = "call-screen-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="call-screen-overlay-backdrop" data-overlay-dismiss="true"></div>' +
      '<div class="call-screen-overlay-content">' +
      '<div class="call-screen-overlay-title"></div>' +
      '<div class="call-screen-overlay-stage" data-overlay-dismiss="true"></div>' +
      '<div class="call-screen-overlay-hud">' +
      getIcon("screen_share", "", 'aria-hidden="true"') +
      '<span class="call-screen-overlay-owner"></span>' +
      "</div>" +
      "</div>";
    callModalEl.appendChild(overlay);
  }
  const stage = overlay.querySelector<HTMLElement>(".call-screen-overlay-stage");
  const title = overlay.querySelector<HTMLElement>(".call-screen-overlay-title");
  const owner = overlay.querySelector<HTMLElement>(".call-screen-overlay-owner");
  if (!(stage instanceof HTMLElement) || !(title instanceof HTMLElement) || !(owner instanceof HTMLElement))
    return null;
  return { overlay, stage, title, owner };
}

export function closeExpandedScreenPreview(
  callModalEl: HTMLElement | null,
  getIcon: (name: string, cls: string, extra?: string) => string
): void {
  if (!(callModalEl instanceof HTMLElement)) return;
  const nodes = ensureScreenOverlayNodes(callModalEl, getIcon);
  if (!nodes) return;
  nodes.overlay.classList.remove("open");
  nodes.overlay.setAttribute("aria-hidden", "true");
  nodes.stage.innerHTML = "";
}

export function openExpandedScreenPreview(
  activeCallVal: Record<string, any> | null,
  callModalEl: HTMLElement | null,
  getIcon: (name: string, cls: string, extra?: string) => string,
  getCallScreenOwnerName: () => string
): void {
  if (!activeCallVal || activeCallVal.mode === "group") return;
  const sourceVideo = document.getElementById("remote-screen-video");
  const sourceStream =
    sourceVideo instanceof HTMLVideoElement ? sourceVideo.srcObject : null;
  if (!(sourceStream instanceof MediaStream)) return;
  if (!(callModalEl instanceof HTMLElement)) return;
  const nodes = ensureScreenOverlayNodes(callModalEl, getIcon);
  if (!nodes) return;
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
    const p = expandedVideo.play();
    if (p?.catch) p.catch(() => {});
  } catch {}
}
