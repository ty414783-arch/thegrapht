import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { WebSocket } from "ws";

import {
  createDialogTypingEvent,
  createMessageCreatedEvent,
  createMessageDeletedEvent,
  createPresenceSnapshotEvent,
  createUserPresenceEvent,
  realtimeEventTypes
} from "../src/contracts/realtime.js";
import { createRealtimeHub } from "../src/realtime/index.js";

test("realtime contract builders emit stable event shapes", () => {
  const dialog = {
    id: "dlg_1",
    publicId: "-1001234567",
    title: "Dialog",
    type: "direct",
    subtitle: "@peer"
  };
  const message = {
    id: "msg_1",
    body: "hello",
    type: "text",
    createdAt: new Date().toISOString(),
    senderId: "u_1",
    senderName: "User"
  };

  assert.equal(createPresenceSnapshotEvent(["u_2"]).type, "presence_snapshot");
  assert.deepEqual(createUserPresenceEvent({
    userId: "u_2",
    isOnline: true,
    lastSeenAt: null
  }), {
    type: "user_presence",
    userId: "u_2",
    isOnline: true,
    lastSeenAt: null
  });
  assert.equal(createDialogTypingEvent({
    dialogId: dialog.id,
    userId: "u_2",
    isTyping: true
  }).type, "dialog_typing");
  assert.equal(createMessageCreatedEvent({ dialog, message }).message.id, "msg_1");
  assert.equal(createMessageDeletedEvent({
    dialog,
    messageId: "msg_1",
    deletedForEveryone: false,
    actorUserId: "u_1"
  }).type, "message_deleted");
  assert.ok(realtimeEventTypes.includes("dialog_read"));
});

test("realtime hub accepts ws upgrade and sends events through ws", async () => {
  const hub = createRealtimeHub({
    getUserFromRequest: async (request) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const userId = url.searchParams.get("user");
      return userId ? { id: userId } : null;
    },
    getUserIdsForDialog: async () => ["u_1", "u_2"],
    getRelatedUserIdsForUser: async () => ["u_2"],
    touchUserLastSeen: async (userId) => ({ id: userId, lastSeenAt: new Date().toISOString() }),
    getDialogByIdForUser: async (userId, dialogId) => ({ id: dialogId, publicId: "-1001234567", type: "direct", title: "Dialog" })
  });
  const server = http.createServer();

  server.on("upgrade", (request, socket, head) => {
    void hub.handleUpgrade(request, socket, head);
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const client = new WebSocket(`ws://127.0.0.1:${address.port}/ws?user=u_1`);

  try {
    const [rawMessage] = await once(client, "message");
    const event = JSON.parse(rawMessage.toString("utf8"));

    assert.equal(event.type, "presence_snapshot");
    assert.deepEqual(event.userIds, []);
  } finally {
    client.close();
    server.close();
    await once(server, "close");
  }
});

test("realtime hub broadcasts created messages to dialog participants", async () => {
  const hub = createRealtimeHub({
    getUserFromRequest: async (request) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const userId = url.searchParams.get("user");
      return userId ? { id: userId } : null;
    },
    getUserIdsForDialog: async () => ["u_1", "u_2"],
    getRelatedUserIdsForUser: async () => ["u_1", "u_2"],
    touchUserLastSeen: async (userId) => ({ id: userId, lastSeenAt: new Date().toISOString() }),
    getDialogByIdForUser: async (userId, dialogId) => ({ id: dialogId, publicId: "-1001234567", type: "direct", title: "Dialog" })
  });
  const server = http.createServer();

  server.on("upgrade", (request, socket, head) => {
    void hub.handleUpgrade(request, socket, head);
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const clientA = new WebSocket(`ws://127.0.0.1:${address.port}/ws?user=u_1`);
  const clientB = new WebSocket(`ws://127.0.0.1:${address.port}/ws?user=u_2`);

  try {
    await once(clientA, "message");
    await once(clientB, "message");

    const messageEventPromise = once(clientB, "message");
    await hub.broadcastMessageCreated({
      dialog: {
        id: "dlg_direct_u_1_u_2",
        publicId: "-1001234567",
        type: "direct",
        title: "Dialog",
        subtitle: "@peer"
      },
      message: {
        id: "msg_2",
        body: "secure hello",
        type: "text",
        createdAt: new Date().toISOString(),
        senderId: "u_1",
        senderName: "User 1"
      }
    });

    const [rawEvent] = await messageEventPromise;
    const event = JSON.parse(rawEvent.toString("utf8"));
    assert.equal(event.type, "message_created");
    assert.equal(event.message.id, "msg_2");
    assert.equal(event.dialog.id, "dlg_direct_u_1_u_2");
  } finally {
    clientA.close();
    clientB.close();
    server.close();
    await once(server, "close");
  }
});
