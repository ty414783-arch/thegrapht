#!/usr/bin/env node
/**
 * Message Throughput Test
 * ───────────────────────
 * N users send messages simultaneously to individual direct chats.
 * Measures send latency and verifies WebSocket delivery to recipients.
 *
 * Usage: node apps/backend/test/load/message-throughput.test.mjs [userCount]
 */
import {
  registerUsers,
  createDirectDialog,
  sendMessage,
  connectWebSocket,
  waitForEvent,
  Metrics,
  runConcurrent
} from "./helpers.js";

const USER_COUNT = Number(process.argv[2]) || 100;
const MESSAGES_PER_USER = 5;

const main = async () => {
  console.log("═══════════════════════════════════════════════");
  console.log("  TheGraphT Message Throughput Load Test       ");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Users: ${USER_COUNT} | Messages/user: ${MESSAGES_PER_USER}`);
  console.log(`  Total messages: ${USER_COUNT * MESSAGES_PER_USER}`);

  // Register 2x users: senders and receivers
  const totalUsers = USER_COUNT * 2;
  const users = await registerUsers(totalUsers, 30);

  if (users.length < totalUsers) {
    console.error(`❌ Need ${totalUsers} users, only got ${users.length}`);
    process.exit(1);
  }

  const senders = users.slice(0, USER_COUNT);
  const receivers = users.slice(USER_COUNT);

  // Create direct dialogs between each sender-receiver pair
  console.log(`\n💬 Creating ${USER_COUNT} direct dialogs...`);
  const dialogs = await runConcurrent(USER_COUNT, 20, async (i) => {
    const result = await createDirectDialog(senders[i].cookie, receivers[i].userId);
    return {
      index: i,
      publicId: result.dialog?.publicId || result.publicId || "",
      senderCookie: senders[i].cookie,
      receiverCookie: receivers[i].cookie
    };
  });

  const validDialogs = dialogs.filter((d) => d.publicId);
  console.log(`   ✅ ${validDialogs.length} dialogs created`);

  // Connect receivers via WebSocket
  console.log(`\n🔌 Connecting ${validDialogs.length} receiver WebSockets...`);
  const wsConnections = [];
  const wsMetrics = new Metrics("WebSocket connect time");

  for (const dialog of validDialogs) {
    try {
      const start = Date.now();
      const { ws } = await connectWebSocket(dialog.receiverCookie);
      wsMetrics.record(Date.now() - start);
      wsConnections.push({ ws, dialogIndex: dialog.index });
    } catch (error) {
      wsMetrics.recordError();
    }
  }
  console.log(`   ✅ ${wsConnections.length} WebSockets connected`);

  // Send messages from all senders simultaneously
  console.log(`\n📤 Sending ${validDialogs.length * MESSAGES_PER_USER} messages...`);
  const sendMetrics = new Metrics("Message send latency");
  const deliveryMetrics = new Metrics("WebSocket delivery (total, send to WS receive)");

  // Set up WS message counters per receiver
  const receivedCounts = new Map();
  const deliveryTimes = [];

  for (const conn of wsConnections) {
    receivedCounts.set(conn.dialogIndex, 0);
    conn.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "message_created") {
          const current = receivedCounts.get(conn.dialogIndex) || 0;
          receivedCounts.set(conn.dialogIndex, current + 1);
        }
      } catch {}
    });
  }

  // Fire messages
  const sendStart = Date.now();
  await runConcurrent(validDialogs.length, 30, async (i) => {
    const dialog = validDialogs[i];
    for (let m = 0; m < MESSAGES_PER_USER; m++) {
      const msgStart = Date.now();
      try {
        await sendMessage(
          dialog.senderCookie,
          dialog.publicId,
          `Load test message ${m + 1}/${MESSAGES_PER_USER} from user ${i}`
        );
        sendMetrics.record(Date.now() - msgStart);
      } catch (error) {
        sendMetrics.recordError();
      }
    }
  });

  const sendDuration = Date.now() - sendStart;
  const totalSent = sendMetrics.values.length;

  // Wait for WebSocket deliveries
  console.log("   ⏳ Waiting for WebSocket delivery (3s)...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  let totalDelivered = 0;
  for (const count of receivedCounts.values()) {
    totalDelivered += count;
  }

  // Cleanup
  for (const conn of wsConnections) {
    try { conn.ws.close(); } catch {}
  }

  // Results
  console.log("\n\n═══════════════════════════════════════════════");
  console.log("  RESULTS SUMMARY");
  console.log("═══════════════════════════════════════════════");

  sendMetrics.print();

  const expectedTotal = validDialogs.length * MESSAGES_PER_USER;
  const deliveryRate = expectedTotal > 0
    ? ((totalDelivered / expectedTotal) * 100).toFixed(1)
    : "0";
  const throughput = sendDuration > 0
    ? Math.round((totalSent / sendDuration) * 1000)
    : 0;

  console.log(`\n📊 Throughput`);
  console.log(`   Total sent: ${totalSent} messages in ${sendDuration}ms`);
  console.log(`   Rate: ${throughput} msg/sec`);
  console.log(`   Send errors: ${sendMetrics.errors}`);

  console.log(`\n📡 WebSocket Delivery`);
  console.log(`   Expected: ${expectedTotal} | Delivered: ${totalDelivered} | Rate: ${deliveryRate}%`);

  const success = sendMetrics.errors === 0 && Number(deliveryRate) >= 95;
  console.log(success
    ? "\n✅ Message throughput test PASSED"
    : "\n⚠️  Message throughput test has issues — check metrics above"
  );

  process.exit(success ? 0 : 1);
};

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
