// group-call-state.ts — ported from calls/group-call-state.js
// Group call state maps, presence heartbeat timer, and banner/strip sync.

import { warnCall } from "./call-debug";

export interface GroupCallState {
  callId: string;
  dialogId: string;
  title: string;
  status: string;
  starterUserId: string;
  startedAtMs: number;
  participantLastSeenAtMap: Map<string, number>;
  participantIds: Set<string>;
  participantCount: number;
}

export const groupCallStateByDialog = new Map<string, GroupCallState>();
export const postedGroupStartByDialog = new Map<string, string>();

let groupCallPresenceHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
let groupCallPresencePruneTimer: ReturnType<typeof setInterval> | null = null;
let groupCallJoinStripHideTimer: ReturnType<typeof setTimeout> | null = null;

const GROUP_CALL_PRESENCE_STALE_MS = 14000;

// ── Duration / marker helpers ──────────────────────────────────────────────

export function getGroupCallSummaryDuration(seconds: number): number {
  return Math.max(0, Math.floor(Number(seconds) || 0));
}

export function buildGroupCallMarker(kind: string, durationSeconds: number = 0): string {
  return kind === "ended_video"
    ? "[[call:" + kind + ":" + getGroupCallSummaryDuration(durationSeconds) + "]]"
    : "[[call:" + kind + "]]";
}

export function isInGroupCallForDialog(
  activeCallVal: Record<string, any> | null,
  dialogId: string
): boolean {
  return Boolean(
    activeCallVal &&
      activeCallVal.mode === "group" &&
      activeCallVal.dialogId === dialogId
  );
}

export function getGroupCallMembersCount(state: GroupCallState | undefined): number {
  if (!state) return 0;
  if (state.participantIds instanceof Set && state.participantIds.size > 0)
    return state.participantIds.size;
  return Math.max(0, Number(state.participantCount) || 0);
}

export function resolveGroupCallStartedAtMs(call: Record<string, any> | null): number {
  if (!call || call.mode !== "group") return Number(call?.connectedAt) || 0;
  const state = call?.dialogId ? groupCallStateByDialog.get(call.dialogId) : null;
  const fromState = Number(state?.startedAtMs) || 0;
  const fromCall = Number(call.groupStartedAtMs) || 0;
  const fromConnectedAt = Number(call.connectedAt) || 0;
  return fromState || fromCall || fromConnectedAt || 0;
}

export function getGroupCallElapsedSecondsForCall(call: Record<string, any>): number {
  const startedAtMs = resolveGroupCallStartedAtMs(call);
  if (!startedAtMs) return 0;
  return Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
}

// ── Prune stale participants ───────────────────────────────────────────────

export function pruneStaleGroupCallParticipants(
  activeCallVal: Record<string, any> | null
): void {
  const nowTs = Date.now();
  let hasAnyState = false;
  for (const [dialogId, state] of groupCallStateByDialog.entries()) {
    if (!state || !(state.participantIds instanceof Set)) continue;
    hasAnyState = true;
    const seenAtMap =
      state.participantLastSeenAtMap instanceof Map
        ? state.participantLastSeenAtMap
        : new Map<string, number>();
    state.participantLastSeenAtMap = seenAtMap;
    for (const participantUserId of Array.from(state.participantIds.values())) {
      const seenAt = Number(seenAtMap.get(participantUserId) || 0);
      if (!seenAt || nowTs - seenAt > GROUP_CALL_PRESENCE_STALE_MS) {
        state.participantIds.delete(participantUserId);
        seenAtMap.delete(participantUserId);
      }
    }
    state.participantCount = state.participantIds.size;
    groupCallStateByDialog.set(dialogId, state);
  }
  if (!hasAnyState && !activeCallVal && groupCallPresencePruneTimer) {
    window.clearInterval(groupCallPresencePruneTimer);
    groupCallPresencePruneTimer = null;
  }
}

export function ensureGroupCallPresencePruneTimer(
  activeCallVal: () => Record<string, any> | null,
  syncGroupCallBanner: () => void
): void {
  if (groupCallPresencePruneTimer) return;
  groupCallPresencePruneTimer = window.setInterval(() => {
    pruneStaleGroupCallParticipants(activeCallVal());
    syncGroupCallBanner();
  }, 3000);
}

// ── Group call marker body parser ──────────────────────────────────────────

export function parseGroupCallMarkerBody(
  rawBody: unknown
): { kind: string; durationSeconds: number } | null {
  const body = String(rawBody || "").trim();
  if (!body.startsWith("[[call:") || !body.endsWith("]]")) return null;
  const inner = body.slice(7, -2);
  const parts = inner.split(":");
  const kind = String(parts[0] || "").trim();
  if (kind !== "started_video" && kind !== "ended_video") return null;
  const durationSeconds = parts.length > 1 ? Math.max(0, Number(parts[1] || 0) || 0) : 0;
  return { kind, durationSeconds };
}

export function buildRecoveredGroupCallId(dialogId: string): string {
  return "group_call_recovered_" + String(dialogId || "");
}

// ── Sync group call state from messages ───────────────────────────────────

export function syncGroupCallStateFromMessages(
  dialog: { id: string; type: string; title?: string } | null,
  messages: Array<{
    body?: unknown;
    createdAt?: string;
    senderId?: string;
    senderName?: string;
  }>,
  activeCallVal: Record<string, any> | null,
  currentUserId: string,
  syncGroupCallBanner: () => void
): void {
  if (!dialog || dialog.type !== "group" || !Array.isArray(messages)) return;
  const dialogId = String(dialog.id || "");
  if (!dialogId) return;

  let latestStarted: { ts: number; senderUserId: string; senderName: string } | null = null;
  let latestEnded: { ts: number } | null = null;

  for (const message of messages) {
    const marker = parseGroupCallMarkerBody(message?.body);
    if (!marker) continue;
    const ts = new Date(message?.createdAt || 0).getTime();
    const sortTs = Number.isFinite(ts) ? ts : 0;
    if (marker.kind === "started_video") {
      latestStarted = {
        ts: sortTs,
        senderUserId: String(message?.senderId || ""),
        senderName: String(message?.senderName || "").trim(),
      };
    } else if (marker.kind === "ended_video") {
      latestEnded = { ts: sortTs };
    }
  }

  const hasActiveStartedMarker = Boolean(
    latestStarted && (!latestEnded || latestStarted.ts > latestEnded.ts)
  );
  const hasLocalActiveGroupCall = Boolean(
    activeCallVal && activeCallVal.mode === "group" && activeCallVal.dialogId === dialogId
  );

  if (!hasActiveStartedMarker && !hasLocalActiveGroupCall) {
    groupCallStateByDialog.delete(dialogId);
    postedGroupStartByDialog.delete(dialogId);
    syncGroupCallBanner();
    return;
  }

  const prevState = groupCallStateByDialog.get(dialogId) || null;
  const starterUserId =
    latestStarted?.senderUserId || prevState?.starterUserId || activeCallVal?.startedByUserId || "";
  const participantIds =
    prevState?.participantIds instanceof Set ? new Set(prevState.participantIds) : new Set<string>();
  const participantLastSeenAtMap =
    prevState?.participantLastSeenAtMap instanceof Map
      ? new Map(prevState.participantLastSeenAtMap)
      : new Map<string, number>();
  if (hasLocalActiveGroupCall) {
    participantIds.add(currentUserId);
    participantLastSeenAtMap.set(currentUserId, Date.now());
  }
  groupCallStateByDialog.set(dialogId, {
    callId:
      activeCallVal?.callId || prevState?.callId || buildRecoveredGroupCallId(dialogId),
    dialogId,
    title: String(dialog.title || prevState?.title || "Group video chat"),
    status: "active",
    starterUserId,
    startedAtMs:
      Number(latestStarted?.ts) ||
      Number(prevState?.startedAtMs) ||
      Number(resolveGroupCallStartedAtMs(activeCallVal)) ||
      Date.now(),
    participantLastSeenAtMap,
    participantIds,
    participantCount: participantIds.size,
  });
  syncGroupCallBanner();
}

// ── Group join strip ───────────────────────────────────────────────────────

export function syncGroupCallJoinStrip(deps: {
  groupCallJoinStrip: HTMLElement | null;
  groupCallJoinTitle: HTMLElement | null;
  groupCallJoinMeta: HTMLElement | null;
  groupCallJoinButton: HTMLElement | null;
  chatWindow: HTMLElement | null;
  currentDialogSnapshot: { id?: string; type?: string } | null;
  allDialogs: Array<{ id: string; type: string }>;
  activeCallVal: Record<string, any> | null;
}): void {
  const {
    groupCallJoinStrip,
    groupCallJoinTitle,
    groupCallJoinMeta,
    groupCallJoinButton,
    chatWindow,
    currentDialogSnapshot,
    allDialogs,
    activeCallVal,
  } = deps;
  if (!groupCallJoinStrip || !groupCallJoinTitle || !groupCallJoinMeta || !groupCallJoinButton)
    return;
  if (groupCallJoinStripHideTimer) {
    window.clearTimeout(groupCallJoinStripHideTimer);
    groupCallJoinStripHideTimer = null;
  }
  const dialogId = currentDialogSnapshot?.id || "";
  const knownDialog = dialogId
    ? allDialogs.find((d) => d.id === dialogId)
    : null;
  if (dialogId && !knownDialog) {
    groupCallStateByDialog.delete(dialogId);
    postedGroupStartByDialog.delete(dialogId);
  }
  const state = dialogId ? groupCallStateByDialog.get(dialogId) : undefined;
  const membersCount = getGroupCallMembersCount(state);
  const shouldShow = Boolean(
    state &&
      currentDialogSnapshot?.type === "group" &&
      knownDialog?.type === "group" &&
      !isInGroupCallForDialog(activeCallVal, dialogId)
  );
  if (!shouldShow) {
    const switchedToNonGroup =
      currentDialogSnapshot?.type !== "group" || knownDialog?.type !== "group";
    groupCallJoinStrip.classList.remove("visible");
    groupCallJoinStrip.setAttribute("aria-hidden", "true");
    chatWindow?.classList.remove("group-call-join-visible");
    if (switchedToNonGroup) {
      groupCallJoinStrip.hidden = true;
      return;
    }
    groupCallJoinStripHideTimer = window.setTimeout(() => {
      if (groupCallJoinStrip) groupCallJoinStrip.hidden = true;
      groupCallJoinStripHideTimer = null;
    }, 220);
    return;
  }
  groupCallJoinStrip.hidden = false;
  groupCallJoinStrip.classList.add("visible");
  groupCallJoinStrip.setAttribute("aria-hidden", "false");
  if (groupCallJoinTitle)
    groupCallJoinTitle.textContent =
      state?.status === "active" ? "Live stream" : "Connecting stream";
  if (groupCallJoinMeta)
    groupCallJoinMeta.textContent =
      membersCount + " member" + (membersCount === 1 ? "" : "s");
  chatWindow?.classList.add("group-call-join-visible");
}

// ── Presence heartbeat ─────────────────────────────────────────────────────

export function stopGroupCallPresenceHeartbeat(): void {
  if (groupCallPresenceHeartbeatTimer) {
    window.clearInterval(groupCallPresenceHeartbeatTimer);
    groupCallPresenceHeartbeatTimer = null;
  }
}

export function sendGroupCallPresenceHeartbeat(deps: {
  activeCallVal: Record<string, any> | null;
  currentUserId: string;
  getCurrentName: () => string;
  clampVoiceLevel: (v: unknown) => number;
  groupLocalVoiceLastLevel: number;
  sendCallRealtime: (payload: Record<string, unknown>) => void;
}): void {
  const { activeCallVal, currentUserId, getCurrentName, sendCallRealtime } = deps;
  if (!activeCallVal || activeCallVal.mode !== "group") return;
  const state = groupCallStateByDialog.get(activeCallVal.dialogId);
  if (state) {
    if (!(state.participantIds instanceof Set)) state.participantIds = new Set();
    if (!(state.participantLastSeenAtMap instanceof Map)) state.participantLastSeenAtMap = new Map();
    state.participantIds.add(currentUserId);
    state.participantLastSeenAtMap.set(currentUserId, Date.now());
    state.participantCount = state.participantIds.size;
    groupCallStateByDialog.set(activeCallVal.dialogId, state);
  }
  sendCallRealtime({
    type: "call_presence",
    mode: "group",
    callId: activeCallVal.callId,
    dialogId: activeCallVal.dialogId,
    dialogPublicId: activeCallVal.dialogPublicId,
    participantUserId: currentUserId,
    participantName: getCurrentName(),
    isMuted: Boolean(activeCallVal.isMuted),
    isSpeaking: !activeCallVal.isMuted,
    voiceLevel: activeCallVal.isMuted ? 0 : deps.clampVoiceLevel(deps.groupLocalVoiceLastLevel),
  });
}

export function ensureGroupCallPresenceHeartbeat(deps: {
  activeCallVal: Record<string, any> | null;
  ensurePresencePruneTimer: () => void;
  sendHeartbeat: () => void;
}): void {
  const { activeCallVal, ensurePresencePruneTimer, sendHeartbeat } = deps;
  const shouldRun = Boolean(activeCallVal && activeCallVal.mode === "group");
  if (!shouldRun) {
    stopGroupCallPresenceHeartbeat();
    return;
  }
  ensurePresencePruneTimer();
  if (groupCallPresenceHeartbeatTimer) return;
  groupCallPresenceHeartbeatTimer = window.setInterval(() => {
    sendHeartbeat();
  }, 6000);
}

// ── Group call banner ──────────────────────────────────────────────────────

export function syncGroupCallBanner(deps: {
  groupCallBanner: HTMLElement | null;
  groupCallBannerState: HTMLElement | null;
  groupCallBannerTitle: HTMLElement | null;
  activeCallVal: Record<string, any> | null;
  currentDialogSnapshot: { id?: string; title?: string } | null;
  syncGroupCallJoinStrip: () => void;
}): void {
  const {
    groupCallBanner,
    groupCallBannerState,
    groupCallBannerTitle,
    activeCallVal,
    currentDialogSnapshot,
    syncGroupCallJoinStrip: syncStrip,
  } = deps;
  if (!groupCallBanner || !groupCallBannerState || !groupCallBannerTitle) {
    syncStrip();
    return;
  }
  const chatWindow = document.getElementById("chat-window");
  const dialogId = currentDialogSnapshot?.id || "";
  const state = dialogId ? groupCallStateByDialog.get(dialogId) : undefined;
  const activeGroupCall =
    activeCallVal && activeCallVal.mode === "group" ? activeCallVal : null;
  const shouldShowBanner = Boolean(
    activeGroupCall || (state && isInGroupCallForDialog(activeCallVal, dialogId))
  );
  if (!shouldShowBanner) {
    groupCallBanner.classList.remove("visible");
    groupCallBanner.setAttribute("aria-hidden", "true");
    groupCallBanner.hidden = true;
    chatWindow?.classList.remove("group-call-banner-visible");
    syncStrip();
    return;
  }
  const bannerCall = activeGroupCall;
  const bannerDialogId = bannerCall?.dialogId || dialogId;
  const bannerState = bannerDialogId ? groupCallStateByDialog.get(bannerDialogId) : state;
  groupCallBanner.hidden = false;
  groupCallBanner.classList.add("visible");
  groupCallBanner.setAttribute("aria-hidden", "false");
  chatWindow?.classList.add("group-call-banner-visible");
  const isBannerActive = Boolean(
    bannerCall?.status === "active" || bannerState?.status === "active"
  );
  groupCallBanner.dataset.callStatus = isBannerActive ? "active" : "connecting";
  groupCallBannerState.textContent = isBannerActive ? "Live" : "Connecting...";
  groupCallBannerTitle.textContent =
    bannerCall?.peerName ||
    bannerState?.title ||
    currentDialogSnapshot?.title ||
    "Group video chat";
  syncStrip();
}

// ── Group leave modal ──────────────────────────────────────────────────────

export function openGroupLeaveModal(
  groupCallLeaveModal: HTMLElement | null,
  groupCallEndForAll: HTMLInputElement | null
): void {
  if (!groupCallLeaveModal) return;
  if (groupCallEndForAll) {
    groupCallEndForAll.checked = false;
    groupCallEndForAll.disabled = false;
  }
  groupCallLeaveModal.classList.add("visible");
  groupCallLeaveModal.setAttribute("aria-hidden", "false");
}

export function closeGroupLeaveModal(groupCallLeaveModal: HTMLElement | null): void {
  if (!groupCallLeaveModal) return;
  groupCallLeaveModal.classList.remove("visible");
  groupCallLeaveModal.setAttribute("aria-hidden", "true");
}
