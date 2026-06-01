import { WebSocket, WebSocketServer } from "ws";

import { hasTrustedBrowserOrigin } from "../utils/http.js";
import {
  createCallInviteEvent,
  createDialogCreatedEvent,
  createDialogPresenceEvent,
  createDialogReadEvent,
  createDialogTypingEvent,
  createMessageCreatedEvent,
  createMessageDeletedEvent,
  createPresenceSnapshotEvent,
  createUserPresenceEvent
} from "../contracts/realtime.js";
import { typingEventSchema } from "../validation/schemas.js";

export const createRealtimeHub = ({
  createMessageForDialog,
  getDialogByIdForUser,
  getUserFromRequest,
  getUserIdsForDialog,
  getRelatedUserIdsForUser,
  touchUserLastSeen
}) => {
  const websocketServer = new WebSocketServer({
    noServer: true,
    // Prevent oversized WS payload abuse (ws default is 100 MiB).
    maxPayload: 64 * 1024
  });
  const realtimeClients = new Map();
  const socketPresence = new Map();
  const activeDialogUsers = new Map();
  const connectedUsers = new Map();
  const postedCallSummaryKeys = new Map();
  const socketActiveStates = new Map();

  const sendRealtimeEvent = (userId, event) => {
    const sockets = realtimeClients.get(userId);

    if (!sockets || sockets.size === 0) {
      return;
    }

    const payload = JSON.stringify(event);

    for (const socket of sockets) {
      if (socket.readyState !== WebSocket.OPEN) {
        sockets.delete(socket);
        socket.terminate();
        continue;
      }

      socket.send(payload);
    }

    if (sockets.size === 0) {
      realtimeClients.delete(userId);
    }
  };

  const rememberPostedCallSummary = (summaryKey) => {
    postedCallSummaryKeys.set(summaryKey, Date.now());
    if (postedCallSummaryKeys.size > 4000) {
      const firstKey = postedCallSummaryKeys.keys().next().value;
      if (firstKey !== undefined) {
        postedCallSummaryKeys.delete(firstKey);
      }
    }
  };

  const incrementConnectedUser = (userId) => {
    const nextCount = (connectedUsers.get(userId) || 0) + 1;
    connectedUsers.set(userId, nextCount);
    return nextCount === 1;
  };

  const decrementConnectedUser = (userId) => {
    const nextCount = (connectedUsers.get(userId) || 0) - 1;

    if (nextCount > 0) {
      connectedUsers.set(userId, nextCount);
      return false;
    }

    connectedUsers.delete(userId);
    return true;
  };

  const isUserOnline = (userId) => {
    const isConnected = (connectedUsers.get(userId) || 0) > 0;
    if (!isConnected) {
      return false;
    }
    const sockets = realtimeClients.get(userId);
    if (!sockets || sockets.size === 0) {
      return false;
    }
    for (const socket of sockets) {
      if (socketActiveStates.get(socket) !== false) {
        return true;
      }
    }
    return false;
  };

  const decrementDialogPresence = (dialogId, userId) => {
    const dialogMap = activeDialogUsers.get(dialogId);

    if (!dialogMap) {
      return;
    }

    const nextCount = (dialogMap.get(userId) || 0) - 1;

    if (nextCount > 0) {
      dialogMap.set(userId, nextCount);
      return;
    }

    dialogMap.delete(userId);

    if (dialogMap.size === 0) {
      activeDialogUsers.delete(dialogId);
    }
  };

  const incrementDialogPresence = (dialogId, userId) => {
    let dialogMap = activeDialogUsers.get(dialogId);

    if (!dialogMap) {
      dialogMap = new Map();
      activeDialogUsers.set(dialogId, dialogMap);
    }

    dialogMap.set(userId, (dialogMap.get(userId) || 0) + 1);
  };

  const getParticipantUserIds = async (dialogId) => {
    if (!dialogId) {
      return [];
    }

    return getUserIdsForDialog(dialogId);
  };

  const userHasDialogAccess = async (dialogId, userId) => {
    const participantUserIds = await getParticipantUserIds(dialogId);
    return participantUserIds.includes(userId);
  };

  const broadcastDialogPresence = async (dialogId) => {
    if (!dialogId) {
      return;
    }

    const userIds = await getParticipantUserIds(dialogId);
    const activeUsersMap = activeDialogUsers.get(dialogId);
    const activeUserIds = activeUsersMap
      ? Array.from(activeUsersMap.entries())
          .filter(([, count]) => count > 0)
          .map(([userId]) => userId)
      : [];

    for (const userId of userIds) {
      sendRealtimeEvent(userId, createDialogPresenceEvent({
        dialogId,
        activeUserIds
      }));
    }
  };

  const updateSocketPresence = async (socket, userId, nextDialogId) => {
    const current = socketPresence.get(socket) || { userId, dialogId: null };
    const previousDialogId = current.dialogId || null;
    const normalizedNextDialogId = nextDialogId || null;

    if (normalizedNextDialogId && !(await userHasDialogAccess(normalizedNextDialogId, userId))) {
      return;
    }

    if (previousDialogId === normalizedNextDialogId) {
      return;
    }

    if (previousDialogId) {
      decrementDialogPresence(previousDialogId, userId);
    }

    if (normalizedNextDialogId) {
      incrementDialogPresence(normalizedNextDialogId, userId);
    }

    socketPresence.set(socket, {
      userId,
      dialogId: normalizedNextDialogId
    });

    if (previousDialogId) {
      await broadcastDialogPresence(previousDialogId);
    }

    if (normalizedNextDialogId) {
      await broadcastDialogPresence(normalizedNextDialogId);
    }
  };

  const sendPresenceSnapshot = async (userId) => {
    const relatedUserIds = await getRelatedUserIdsForUser(userId);
    const onlineUserIds = relatedUserIds.filter((relatedUserId) => isUserOnline(relatedUserId));

    sendRealtimeEvent(userId, createPresenceSnapshotEvent(onlineUserIds));
  };

  const broadcastUserPresence = async ({ userId, isOnline, lastSeenAt = null }) => {
    const relatedUserIds = await getRelatedUserIdsForUser(userId);

    for (const relatedUserId of relatedUserIds) {
      sendRealtimeEvent(relatedUserId, createUserPresenceEvent({
        userId,
        isOnline,
        lastSeenAt
      }));
    }
  };

  const broadcastMessageCreated = async ({ dialog, message }) => {
    const userIds = await getParticipantUserIds(dialog.id);

    for (const userId of userIds) {
      let recipientDialog = dialog;
      if (userId !== message.senderId) {
        recipientDialog = await getDialogByIdForUser(userId, dialog.id);
      }
      if (recipientDialog) {
        sendRealtimeEvent(userId, createMessageCreatedEvent({ dialog: recipientDialog, message }));
      }
    }
  };

  const broadcastDialogCreated = async ({ dialogId, actorUserId }) => {
    const userIds = await getParticipantUserIds(dialogId);
    for (const userId of userIds) {
      const recipientDialog = await getDialogByIdForUser(userId, dialogId);
      if (!recipientDialog) {
        continue;
      }
      sendRealtimeEvent(userId, createDialogCreatedEvent({
        dialog: recipientDialog,
        actorUserId
      }));
    }
  };

  const broadcastMessageDeleted = async ({
    dialog,
    messageId,
    deletedForEveryone = false,
    actorUserId,
    targetUserIds = []
  }) => {
    const userIds = deletedForEveryone
      ? await getParticipantUserIds(dialog.id)
      : targetUserIds;

    for (const userId of userIds) {
      let recipientDialog = dialog;
      if (userId !== actorUserId) {
        recipientDialog = await getDialogByIdForUser(userId, dialog.id);
      }
      if (recipientDialog) {
        sendRealtimeEvent(userId, createMessageDeletedEvent({
          dialog: recipientDialog,
          messageId,
          deletedForEveryone,
          actorUserId
        }));
      }
    }
  };

  const broadcastDialogRead = async ({ dialogId, readerUserId, readAt }) => {
    const userIds = await getParticipantUserIds(dialogId);

    for (const userId of userIds) {
      if (userId === readerUserId) {
        continue;
      }

      sendRealtimeEvent(userId, createDialogReadEvent({
        dialogId,
        userId: readerUserId,
        readAt
      }));
    }
  };

  const broadcastTyping = async ({ dialogId, userId, isTyping }) => {
    let participantUserIds = [];
    try {
      participantUserIds = await getParticipantUserIds(dialogId);
    } catch (error) {
      // Keep realtime hub alive on transient DB/DNS issues.
      console.error("[realtime] broadcastTyping failed to resolve participants", {
        dialogId,
        userId,
        error: error instanceof Error ? error.message : String(error || "")
      });
      return;
    }

    if (!participantUserIds.includes(userId)) {
      return;
    }

    for (const participantUserId of participantUserIds) {
      if (participantUserId === userId) {
        continue;
      }

      sendRealtimeEvent(participantUserId, createDialogTypingEvent({
        dialogId,
        userId,
        isTyping
      }));
    }
  };

  const relayCallEvent = async ({ senderUserId, payload }) => {
    const dialogId = typeof payload?.dialogId === "string" && payload.dialogId ? payload.dialogId : null;

    if (!dialogId) {
      return;
    }

    const participantUserIds = await getParticipantUserIds(dialogId);

    if (!participantUserIds.includes(senderUserId)) {
      return;
    }

    const callId = typeof payload?.callId === "string" ? payload.callId : "";
    const summaryBody = typeof payload?.summaryBody === "string" ? payload.summaryBody : "";

    const summaryKey = callId && summaryBody
      ? callId + "|" + String(payload.type || "") + "|" + summaryBody
      : "";

    if (
      callId
      && summaryBody
      && summaryKey
      && !postedCallSummaryKeys.has(summaryKey)
      && (payload.type === "call_end" || payload.type === "call_reject" || payload.type === "call_invite")
    ) {
      try {
        const summarySenderId = typeof payload?.summarySenderUserId === "string" && participantUserIds.includes(payload.summarySenderUserId)
          ? payload.summarySenderUserId
          : senderUserId;
        const message = await createMessageForDialog({
          dialogId,
          senderId: summarySenderId,
          body: summaryBody
        });
        const dialog = await getDialogByIdForUser(summarySenderId, dialogId);

        if (message && dialog) {
          rememberPostedCallSummary(summaryKey);
          await broadcastMessageCreated({ dialog, message });
        }
      } catch {
        // ignore call summary persistence failures
      }
    }

    for (const participantUserId of participantUserIds) {
      if (participantUserId === senderUserId) {
        continue;
      }

      try {
        sendRealtimeEvent(participantUserId, createCallInviteEvent({
          ...payload,
          senderUserId
        }));
      } catch {
        // ignore validation errors for malformed call payloads
      }
    }
  };

  const handleUpgrade = async (request, socket, head = Buffer.alloc(0)) => {
    try {
      if (!request.url) {
        socket.destroy();
        return;
      }

      const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

      if (url.pathname !== "/ws") {
        socket.destroy();
        return;
      }

      if (!hasTrustedBrowserOrigin(request)) {
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
        socket.destroy();
        return;
      }

      const user = await getUserFromRequest(request);

      if (!user) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      websocketServer.handleUpgrade(request, socket, head, (websocket) => {
        websocketServer.emit("connection", websocket, request, user);
      });
    } catch {
      socket.destroy();
    }
  };

  websocketServer.on("connection", (socket, request, user) => {
    try {
      let sockets = realtimeClients.get(user.id);

      if (!sockets) {
        sockets = new Set();
        realtimeClients.set(user.id, sockets);
      }

      sockets.add(socket);
      socketPresence.set(socket, { userId: user.id, dialogId: null });
      const becameOnline = incrementConnectedUser(user.id);

      void sendPresenceSnapshot(user.id);

      if (becameOnline) {
        void broadcastUserPresence({
          userId: user.id,
          isOnline: true,
          lastSeenAt: new Date().toISOString()
        });
      }

      socket.on("message", async (data) => {
        try {
          const payload = JSON.parse(data.toString("utf8"));

          if (payload.type === "active_state") {
            const isActive = Boolean(payload.isActive);
            const wasOnlineBefore = isUserOnline(user.id);
            socketActiveStates.set(socket, isActive);
            const isOnlineNow = isUserOnline(user.id);

            if (wasOnlineBefore !== isOnlineNow) {
              if (!isOnlineNow) {
                const touchedUser = await touchUserLastSeen(user.id);
                await broadcastUserPresence({
                  userId: user.id,
                  isOnline: false,
                  lastSeenAt: touchedUser?.lastSeenAt || new Date().toISOString()
                });
              } else {
                await broadcastUserPresence({
                  userId: user.id,
                  isOnline: true,
                  lastSeenAt: new Date().toISOString()
                });
              }
            }
            return;
          }

          if (payload.type === "presence") {
            const nextDialogId = typeof payload.dialogId === "string" && payload.dialogId ? payload.dialogId : null;
            void updateSocketPresence(socket, user.id, nextDialogId);
            return;
          }

          if (payload.type === "typing") {
            const parsed = typingEventSchema.safeParse({
              dialogId: typeof payload.dialogId === "string" && payload.dialogId ? payload.dialogId : null,
              isTyping: Boolean(payload.isTyping)
            });

            if (parsed.success && parsed.data.dialogId) {
              void broadcastTyping({
                dialogId: parsed.data.dialogId,
                userId: user.id,
                isTyping: parsed.data.isTyping
              });
            }

            return;
          }

          if (payload.type === "ping") {
            try {
              socket.send(JSON.stringify({
                type: "pong",
                ts: Date.now()
              }));
            } catch {}
            return;
          }

          if (
            payload.type === "call_invite"
            || payload.type === "call_accept"
            || payload.type === "call_reject"
            || payload.type === "call_end"
            || payload.type === "call_candidate"
            || payload.type === "call_presence"
            || payload.type === "call_leave"
            || payload.type === "call_screen_state"
            || payload.type === "call_mute_state"
          ) {
            void relayCallEvent({
              senderUserId: user.id,
              payload
            }).catch(() => {});
          }
        } catch {
          // Ignore malformed realtime payloads from clients.
        }
      });

      const cleanup = () => {
        const currentPresence = socketPresence.get(socket);

        if (!currentPresence) {
          return;
        }

        const wasOnlineBefore = isUserOnline(user.id);
        socketActiveStates.delete(socket);

        const userSockets = realtimeClients.get(user.id);

        if (currentPresence.dialogId) {
          decrementDialogPresence(currentPresence.dialogId, user.id);
          void broadcastDialogPresence(currentPresence.dialogId);
        }

        socketPresence.delete(socket);

        if (userSockets) {
          userSockets.delete(socket);

          if (userSockets.size === 0) {
            realtimeClients.delete(user.id);
          }
        }

        decrementConnectedUser(user.id);
        const isOnlineNow = isUserOnline(user.id);

        if (wasOnlineBefore && !isOnlineNow) {
          void (async () => {
            const touchedUser = await touchUserLastSeen(user.id);

            await broadcastUserPresence({
              userId: user.id,
              isOnline: false,
              lastSeenAt: touchedUser?.lastSeenAt || new Date().toISOString()
            });
          })();
        }
      };

      socket.on("close", cleanup);
      socket.on("error", () => {
        cleanup();
        socket.terminate();
      });
    } catch {
      socket.terminate();
    }
  });

  return {
    broadcastDialogCreated,
    broadcastDialogRead,
    broadcastMessageCreated,
    broadcastMessageDeleted,
    broadcastTyping,
    handleUpgrade
  };
};
