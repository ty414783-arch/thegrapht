export {};

declare const currentDialogId: string | null;
declare const currentDialogPublicId: string | null;
declare const currentDialogSnapshot: any;
declare let currentMessagesSnapshot: any[] | null;
declare const currentUserId: string;
declare const apiBase: string;
declare const fetchJson: (url: string, options?: any) => Promise<any>;
declare const prepareDialogPayloadForDisplay: (dialog: any, messages: any[]) => Promise<any>;
declare const isMessageDeletedLocally: (id: string) => boolean;
declare const findMatchingPendingLocalMessageId: (dialogPublicId: string, message: any) => string;
declare const removeLocalOutgoingMessage: (id: string) => void;
declare const getMessagePreviewText: (message: any) => string;
declare const allDialogs: any[];
declare const updateDialogInState: (dialog: any, patches: any) => any;
declare const renderDialogs: (dialogs: any[]) => void;
declare const showIncomingDesktopNotification: (message: any, dialog: any) => Promise<void>;
declare const readCachedImageDimensions: (url: string) => any;
declare const measureImageUrl: (url: string) => Promise<any>;
declare const appendConfirmedMessageToCurrentDialog: (dialog: any, message: any, options?: any) => void;
declare const loadWorkspace: (options?: any) => Promise<void>;
declare const syncVisibleDialogsRealtimeState: () => void;
declare const refreshCurrentDialogChrome: () => void;
declare const applyPresenceStateToDialogs: (options: any) => void;
declare const ensureNotificationPermission: () => Promise<string>;
declare const isWindowInactive: () => boolean;
declare const isNotificationOwner: () => boolean;
declare const buildNotificationAvatarUrl: (dialog: any, title: string) => string;
declare const applyRoute: (route: string) => void;
declare const loadDialog: (publicId: string, options?: any) => Promise<void>;
declare const refreshOutgoingReadReceiptsInPlace: () => void;
declare const handleMessageDeletedEvent: (payload: any) => void;
declare const updateTypingState: (dialogId: string, userId: string, isTyping: boolean) => void;
declare const handleCallInvite: (payload: any) => Promise<void>;
declare const handleCallAccept: (payload: any) => Promise<void>;
declare const handleCallReject: (payload: any) => Promise<void>;
declare const handleCallEnd: (payload: any) => Promise<void>;
declare const handleCallCandidate: (payload: any) => Promise<void>;
declare const handleCallPresence: (payload: any) => Promise<void>;
declare const handleCallLeave: (payload: any) => Promise<void>;
declare const handleCallScreenState: (payload: any) => Promise<void>;
declare const handleCallMuteState: ((payload: any) => void) | undefined;
declare const clearTypingIndicators: () => void;
declare const setDialogPayloadCache: (publicId: string, payload: any) => void;
declare const renderMessages: (dialog: any, messages: any[], options?: any) => void;
declare const getMessageEpochSeconds: (message: any) => number;
const REALTIME_HEARTBEAT_INTERVAL_MS = 12000;
const REALTIME_STALE_TIMEOUT_MS = 35000;
const REALTIME_WATCHDOG_INTERVAL_MS = 5000;

const wsInfo = (event: string, details: any = {}) => {
  try {
    console.info("[TheGraphT WS]", event, details);
  } catch {}
};

const wsWarn = (event: string, details: any = {}) => {
  try {
    console.warn("[TheGraphT WS]", event, details);
  } catch {}
};

const touchRealtimeActivity = () => {
  (window as any).realtimeLastActivityAt = Date.now();
};

const reconcileCurrentDialogMessages = async (reason = "unspecified", options: any = {}) => {
  const force = Boolean(options.force);
  if (!currentDialogPublicId || !currentDialogSnapshot) {
    return;
  }
  if ((window as any).realtimeDialogResyncInFlight) {
    return;
  }

  const nowTs = Date.now();
  if (!force && (window as any).realtimeDialogResyncLastDialogId === currentDialogPublicId && (nowTs - ((window as any).realtimeDialogResyncLastAt || 0)) < 1800) {
    return;
  }

  (window as any).realtimeDialogResyncInFlight = true;
  (window as any).realtimeDialogResyncLastAt = nowTs;
  (window as any).realtimeDialogResyncLastDialogId = currentDialogPublicId;

  try {
    const messageList = document.getElementById("message-list");
    const scrollTopBefore = messageList?.scrollTop || 0;
    const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages");
    const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.messages || []);
    if (!preparedPayload?.dialog || preparedPayload.dialog.publicId !== currentDialogPublicId) {
      return;
    }

    const serverMessages = (Array.isArray(preparedPayload.messages) ? preparedPayload.messages : [])
      .filter((message) => !isMessageDeletedLocally(message?.id));
    const currentMessages = (Array.isArray(currentMessagesSnapshot) ? currentMessagesSnapshot : [])
      .filter((message) => !isMessageDeletedLocally(message?.id));
    const serverIds = new Set(serverMessages.map((message) => String(message?.id || "")));
    const currentIds = new Set(currentMessages.map((message) => String(message?.id || "")));
    const missingInCurrent = serverMessages.filter((message) => !currentIds.has(String(message?.id || ""))).length;
    const localPendingInCurrent = currentMessages.filter((message) => String(message?.id || "").startsWith("local_")).length;

    // Reliability-first merge:
    // - keep all currently visible messages (prevents "message disappeared then reappeared")
    // - overlay with canonical server versions by id
    // - include local pending drafts until matched/replaced
    const mergedMap = new Map();
    currentMessages.forEach((message) => {
      const id = String(message?.id || "");
      if (!id) {
        return;
      }
      mergedMap.set(id, message);
    });
    serverMessages.forEach((message) => {
      const id = String(message?.id || "");
      if (!id) {
        return;
      }
      const prev = mergedMap.get(id);
      mergedMap.set(id, prev ? { ...prev, ...message } : message);
    });

    const mergedMessages = Array.from(mergedMap.values()).sort((a, b) => {
      const aTs = getMessageEpochSeconds(a) * 1000;
      const bTs = getMessageEpochSeconds(b) * 1000;
      if (aTs !== bTs) {
        return aTs - bTs;
      }
      return String(a?.id || "").localeCompare(String(b?.id || ""));
    });

    const signaturesDiffer = (
      mergedMessages.map((message) => String(message?.id || "")).join("|")
      !== currentMessages.map((message) => String(message?.id || "")).join("|")
    );

    wsInfo("dialog_resync_checked", {
      reason,
      dialogPublicId: currentDialogPublicId,
      currentCount: currentMessages.length,
      serverCount: serverMessages.length,
      missingInCurrent,
      localPendingInCurrent,
      mergedCount: mergedMessages.length,
      signaturesDiffer
    });

    if (!signaturesDiffer && missingInCurrent === 0) {
      return;
    }

    const mergedPayload = {
      dialog: preparedPayload.dialog,
      messages: mergedMessages
    };
    setDialogPayloadCache(currentDialogPublicId, mergedPayload);
    
    if (messageList) {
      const shouldStickBottom = (messageList.scrollHeight - (messageList.scrollTop + messageList.clientHeight)) < 56;
      renderMessages(preparedPayload.dialog, mergedMessages, {
        scrollBehavior: "none",
        openingDialog: false,
        animateList: false,
        forceScrollBottom: shouldStickBottom,
        restoreScrollTop: shouldStickBottom ? null : scrollTopBefore
      });
    }
    wsWarn("dialog_resync_applied", {
      reason,
      dialogPublicId: currentDialogPublicId,
      missingInCurrent,
      localPendingInCurrent,
      serverCount: serverMessages.length,
      mergedCount: mergedMessages.length
    });
  } catch (error) {
    wsWarn("dialog_resync_failed", {
      reason,
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    (window as any).realtimeDialogResyncInFlight = false;
  }
};

const startRealtimeHealthChecks = () => {
  const socket = (window as any).realtimeSocket;
  if ((window as any).realtimeHeartbeatTimer) {
    window.clearInterval((window as any).realtimeHeartbeatTimer);
    (window as any).realtimeHeartbeatTimer = null;
  }
  if ((window as any).realtimeWatchdogTimer) {
    window.clearInterval((window as any).realtimeWatchdogTimer);
    (window as any).realtimeWatchdogTimer = null;
  }

  touchRealtimeActivity();

  (window as any).realtimeHeartbeatTimer = window.setInterval(() => {
    const currentSocket = (window as any).realtimeSocket;
    if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      currentSocket.send(JSON.stringify({
        type: "ping",
        ts: Date.now()
      }));
      wsInfo("ping_sent", {
        ts: Date.now()
      });
    } catch {}
  }, REALTIME_HEARTBEAT_INTERVAL_MS);

  (window as any).realtimeWatchdogTimer = window.setInterval(() => {
    const currentSocket = (window as any).realtimeSocket;
    if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const staleForMs = Date.now() - ((window as any).realtimeLastActivityAt || 0);
    if (staleForMs <= REALTIME_STALE_TIMEOUT_MS) {
      return;
    }

    wsWarn("stale_socket_detected_forcing_reconnect", {
      staleForMs
    });
    try {
      currentSocket.close();
    } catch {}
  }, REALTIME_WATCHDOG_INTERVAL_MS);

  if ((window as any).realtimeDialogResyncTimer) {
    window.clearInterval((window as any).realtimeDialogResyncTimer);
    (window as any).realtimeDialogResyncTimer = null;
  }
};

const sendCurrentPresence = () => {
  const socket = (window as any).realtimeSocket;
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  wsInfo("presence_send", {
    dialogId: currentDialogId || null
  });
  socket.send(JSON.stringify({
    type: "presence",
    dialogId: currentDialogId || null
  }));
};

const sendActiveState = (isActive: boolean) => {
  const socket = (window as any).realtimeSocket;
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  try {
    socket.send(JSON.stringify({
      type: "active_state",
      isActive: Boolean(isActive)
    }));
  } catch {}
};

const connectRealtime = () => {
  if (!(window as any).realtimeEnabled || !(window as any).isPrimaryActiveTab) {
    return;
  }

  const currentSocket = (window as any).realtimeSocket;
  if (currentSocket && (currentSocket.readyState === WebSocket.OPEN || currentSocket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const explicitWsBase = (window as any).__THEGRAPHT_WS_BASE_URL__;
  const logoDataUrl = (window as any).__THEGRAPHT_LOGO_DATA_URL__;
  let wsUrl;

  if (explicitWsBase) {
    try {
      const resolvedWsUrl = new URL(explicitWsBase, window.location.href);
      const isPublicHost = /^(web\\.thegrapht\\.su|thegrapht\\.su|www\\.thegrapht\\.su|dev\\.thegrapht\\.su)$/i.test(window.location.hostname || "");
      const isLoopbackWsHost = /^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)$/i.test(resolvedWsUrl.hostname || "");

      wsUrl = isPublicHost && isLoopbackWsHost
        ? new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws")
        : resolvedWsUrl;
    } catch {
      wsUrl = new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws");
    }
  } else {
    wsUrl = new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws");
  }

  if (wsUrl.pathname === "/" || wsUrl.pathname === "") {
    wsUrl.pathname = "/ws";
  }

  const token = (window as any).legacySessionToken;
  if (token) {
    wsUrl.searchParams.set("token", token);
  }

  wsInfo("connecting", {
    url: wsUrl.toString(),
    dialogId: currentDialogId || null
  });
  const socket = new WebSocket(wsUrl.toString());
  (window as any).realtimeSocket = socket;

  socket.addEventListener("open", () => {
    if ((window as any).realtimeReconnectTimer) {
      window.clearTimeout((window as any).realtimeReconnectTimer);
      (window as any).realtimeReconnectTimer = null;
    }

    wsInfo("connected", {
      readyState: socket?.readyState
    });
    touchRealtimeActivity();
    startRealtimeHealthChecks();
    sendCurrentPresence();
    sendActiveState(document.visibilityState === "visible");
    if ((window as any).isFirstRealtimeConnection) {
      (window as any).isFirstRealtimeConnection = false;
      wsInfo("ws_open_initial_skip_reconcile");
    } else {
      void reconcileCurrentDialogMessages("ws_open_reconnect", { force: true });
    }
  });

  socket.addEventListener("message", (event) => {
    touchRealtimeActivity();
    void (async () => {
      try {
        const payload = JSON.parse(event.data);
        wsInfo("message_received", {
          type: payload?.type || "unknown",
          dialogId: payload?.dialog?.id || payload?.dialogId || null,
          messageId: payload?.message?.id || payload?.messageId || null,
          callId: payload?.callId || null
        });
        if (payload.type === "pong") {
          return;
        }
        if (payload.type === "message_created") {
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.message ? [payload.message] : []);
          const preparedMessage = preparedPayload.messages[0] || payload.message;
          const preparedMessageId = String(preparedMessage?.id || "");
          if (preparedMessageId && isMessageDeletedLocally(preparedMessageId)) {
            wsInfo("message_created_skipped_tombstoned", {
              messageId: preparedMessageId
            });
            return;
          }
          const nowTs = Date.now();
          if (preparedMessageId) {
            const seenAt = Number((window as any).realtimeMessageSeenAt.get(preparedMessageId) || 0);
            if (seenAt && (nowTs - seenAt) < 6000) {
              wsInfo("message_created_duplicate_skipped", {
                messageId: preparedMessageId,
                ageMs: nowTs - seenAt
              });
              return;
            }
            (window as any).realtimeMessageSeenAt.set(preparedMessageId, nowTs);
            if ((window as any).realtimeMessageSeenAt.size > 1500) {
              const threshold = nowTs - 10 * 60 * 1000;
              (window as any).realtimeMessageSeenAt.forEach((timestamp: number, key: string) => {
                if (!timestamp || timestamp < threshold) {
                  (window as any).realtimeMessageSeenAt.delete(key);
                }
              });
            }
          }
          if (preparedMessage?.decryptionFailed) {
            wsWarn("message_decryption_failed", {
              dialogId: preparedPayload.dialog?.id || preparedPayload.dialog?.publicId || null,
              messageId: preparedMessage.id || null,
              senderId: preparedMessage.senderId || null
            });
          }
          const replaceLocalMessageId = preparedMessage?.senderId === currentUserId
            ? findMatchingPendingLocalMessageId(preparedPayload.dialog?.publicId || "", preparedMessage)
            : "";
          if (replaceLocalMessageId) {
            removeLocalOutgoingMessage(replaceLocalMessageId);
          }
          const preparedMessagePreview = String(getMessagePreviewText(preparedMessage) || "").trim();
          const allDialogsList = (window as any).allDialogs || [];
          const existingDialog = allDialogsList.find((dialog: any) => dialog.id === preparedPayload.dialog?.id) || null;
          const existingUnreadCount = Math.max(0, Number(existingDialog?.unreadCount) || 0);
          const isCurrentDialogMessage = preparedPayload.dialog?.id === currentDialogId;
          const isIncomingMessage = preparedMessage?.senderId !== currentUserId;
          const nextUnreadCount = isCurrentDialogMessage
            ? 0
            : (isIncomingMessage ? (existingUnreadCount + 1) : existingUnreadCount);
          const nextDialog = updateDialogInState(preparedPayload.dialog, {
            lastMessagePreview: preparedMessage?.decryptionFailed ? undefined : preparedMessagePreview,
            lastMessageSenderName: preparedMessage.senderId === currentUserId
              ? "You"
              : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
            lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || "",
            unreadCount: nextUnreadCount
          });

          const sidebarSearchVal = (document.getElementById("sidebar-search") as HTMLInputElement)?.value || "";
          if (!sidebarSearchVal.trim() && nextDialog) {
            const renderDialogsFn = (window as any).renderDialogs;
            if (typeof renderDialogsFn === "function") {
              renderDialogsFn((window as any).allDialogs || []);
            }
          }

          if (preparedMessage?.senderId !== currentUserId) {
            void showIncomingDesktopNotification(preparedMessage, nextDialog || preparedPayload.dialog || null);
          }

          if (isCurrentDialogMessage && preparedMessage) {
            const isIncomingGroupMessage = Boolean(
              preparedPayload.dialog?.type === "group"
              && preparedMessage.senderId !== currentUserId
            );
            let messagePatch = {};
            if (
              preparedMessage?.type === "image"
              && !preparedMessage?.albumId
              && preparedMessage?.mediaUrl
            ) {
              if (!readCachedImageDimensions(preparedMessage.mediaUrl)) {
                await measureImageUrl(preparedMessage.mediaUrl);
              }
              const incomingDimensions = readCachedImageDimensions(preparedMessage.mediaUrl);
              if (incomingDimensions?.naturalWidth > 0 && incomingDimensions?.naturalHeight > 0) {
                messagePatch = {
                  mediaNaturalWidth: incomingDimensions.naturalWidth,
                  mediaNaturalHeight: incomingDimensions.naturalHeight
                };
              }
            }
            appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
              scrollBehavior: "smooth",
              animateMessage: !replaceLocalMessageId,
              replaceMessageId: replaceLocalMessageId,
              forceScrollBottom: isIncomingGroupMessage,
              messagePatch
            });
            if (currentDialogPublicId) {
              void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/read", {
                method: "POST"
              }).catch(() => {});
            }
            void reconcileCurrentDialogMessages("message_created_current_dialog");
            return;
          }

          if (!nextDialog) {
            const loadWorkspaceFn = (window as any).loadWorkspace;
            if (typeof loadWorkspaceFn === "function") {
              void loadWorkspaceFn({ preserveRoute: true });
            }
          }
        } else if (payload.type === "presence_snapshot") {
          (window as any).onlineUserIds.clear();
          (payload.userIds || []).forEach((userId: string) => {
            if (typeof userId === "string" && userId) {
              (window as any).onlineUserIds.add(userId);
            }
          });
          syncVisibleDialogsRealtimeState();
          refreshCurrentDialogChrome();
        } else if (payload.type === "user_presence" && payload.userId) {
          applyPresenceStateToDialogs({
            userId: payload.userId,
            isOnline: Boolean(payload.isOnline),
            lastSeenAt: payload.lastSeenAt || null
          });
          syncVisibleDialogsRealtimeState();
          refreshCurrentDialogChrome();
        } else if (payload.type === "dialog_presence" && payload.dialogId === currentDialogId) {
          const nextPeerActive = Array.isArray(payload.activeUserIds)
            ? payload.activeUserIds.some((userId) => userId !== currentUserId)
            : false;
          if ((window as any).peerActiveInCurrentDialog !== nextPeerActive) {
            (window as any).peerActiveInCurrentDialog = nextPeerActive;
            refreshCurrentDialogChrome();
          }
        } else if (payload.type === "dialog_created" && payload.dialog?.publicId) {
          const createdDialog = payload.dialog;
          const upsertedDialog = updateDialogInState(createdDialog, {
            lastMessagePreview: createdDialog.lastMessagePreview || null,
            lastMessageSenderName: createdDialog.lastMessageSenderName || null,
            lastMessageCreatedAt: createdDialog.lastMessageCreatedAt || new Date().toISOString()
          });
          if (!upsertedDialog) {
            const allDialogsList = (window as any).allDialogs || [];
            allDialogsList.unshift(createdDialog);
          }
          const sidebarSearchVal = (document.getElementById("sidebar-search") as HTMLInputElement)?.value || "";
          if (!sidebarSearchVal.trim()) {
            const renderDialogsFn = (window as any).renderDialogs;
            if (typeof renderDialogsFn === "function") {
              renderDialogsFn((window as any).allDialogs || []);
            }
          }
          if (payload.actorUserId !== currentUserId) {
            const permission = await ensureNotificationPermission();
            if (permission === "granted" && isWindowInactive() && isNotificationOwner()) {
              try {
                const notification = new Notification("TheGraphT", {
                  body: "You were added to group " + String(createdDialog.title || "Group"),
                  icon: buildNotificationAvatarUrl(createdDialog, createdDialog.title || "Group"),
                  badge: logoDataUrl,
                  tag: "group_added_" + String(createdDialog.publicId),
                  renotify: false
                } as any);
                window.setTimeout(() => {
                  try { notification.close(); } catch {}
                }, 8000);
                notification.onclick = () => {
                  window.focus();
                  (window as any).pendingDialogPublicIdFromNotification = createdDialog.publicId;
                  const applyRouteFn = (window as any).applyRoute;
                  if (typeof applyRouteFn === "function") applyRouteFn(createdDialog.publicId);
                  const loadDialogFn = (window as any).loadDialog;
                  if (typeof loadDialogFn === "function") void loadDialogFn(createdDialog.publicId, { scrollBehavior: "auto", forceReload: true });
                  notification.close();
                };
              } catch {}
            }
          }
        } else if (payload.type === "dialog_read" && payload.dialogId === currentDialogId && payload.userId !== currentUserId) {
          try {
            console.log("[TheGraphT UI DEBUG]", "ws:dialog_read", {
              ts: Date.now(),
              payloadDialogId: payload.dialogId,
              currentDialogId,
              payloadUserId: payload.userId,
              currentUserId
            });
          } catch {}
          const nextPeerReadAt = payload.readAt || (window as any).currentPeerReadAt;
          if (nextPeerReadAt !== (window as any).currentPeerReadAt) {
            (window as any).currentPeerReadAt = nextPeerReadAt;
            refreshOutgoingReadReceiptsInPlace();
          }
        } else if (payload.type === "message_deleted") {
          handleMessageDeletedEvent(payload);
        } else if (payload.type === "dialog_typing" && payload.dialogId && payload.userId && payload.userId !== currentUserId) {
          updateTypingState(payload.dialogId, payload.userId, Boolean(payload.isTyping));
        } else if (payload.type === "call_invite") {
          void handleCallInvite(payload);
        } else if (payload.type === "call_accept") {
          void handleCallAccept(payload);
        } else if (payload.type === "call_reject") {
          void handleCallReject(payload);
        } else if (payload.type === "call_end") {
          void handleCallEnd(payload);
        } else if (payload.type === "call_candidate") {
          void handleCallCandidate(payload);
        } else if (payload.type === "call_presence") {
          void handleCallPresence(payload);
        } else if (payload.type === "call_leave") {
          void handleCallLeave(payload);
        } else if (payload.type === "call_screen_state") {
          void handleCallScreenState(payload);
        } else if (payload.type === "call_mute_state") {
          if (typeof handleCallMuteState === "function") {
            handleCallMuteState(payload);
          }
        }
      } catch (error) {
        wsWarn("message_handler_failed", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    })();
  });

  socket.addEventListener("close", (event) => {
    wsWarn("disconnected", {
      code: event?.code,
      reason: event?.reason || "",
      wasClean: Boolean(event?.wasClean),
      willReconnect: Boolean((window as any).realtimeEnabled)
    });
    const hbTimer = (window as any).realtimeHeartbeatTimer;
    if (hbTimer) {
      window.clearInterval(hbTimer);
      (window as any).realtimeHeartbeatTimer = null;
    }
    const wdTimer = (window as any).realtimeWatchdogTimer;
    if (wdTimer) {
      window.clearInterval(wdTimer);
      (window as any).realtimeWatchdogTimer = null;
    }
    (window as any).realtimeLastActivityAt = 0;
    (window as any).realtimeSocket = null;
    (window as any).onlineUserIds.clear();
    clearTypingIndicators();
    syncVisibleDialogsRealtimeState();
    refreshCurrentDialogChrome();
    if ((window as any).realtimeEnabled) {
      wsInfo("reconnect_scheduled", {
        delayMs: 1200
      });
      (window as any).realtimeReconnectTimer = window.setTimeout(() => connectRealtime(), 1200);
    }
  });

  socket.addEventListener("error", () => {
    wsWarn("socket_error", {
      readyState: socket?.readyState
    });
  });
};

(window as any).connectRealtime = connectRealtime;
(window as any).sendActiveState = sendActiveState;
(window as any).sendCurrentPresence = sendCurrentPresence;
(window as any).reconcileCurrentDialogMessages = reconcileCurrentDialogMessages;
(window as any).startRealtimeHealthChecks = startRealtimeHealthChecks;
(window as any).wsInfo = wsInfo;
