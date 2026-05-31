#!/usr/bin/env node
/**
 * Group Broadcast Spike Test
 * ──────────────────────────
 * Simulates 1 user rapidly sending messages to a group with M members.
 * All M-1 members listen on WebSocket. Verifies full fan-out delivery.
 *
 * Usage: node apps/backend/test/load/group-broadcast-spike.test.mjs [memberCount] [messageCount]
 */
import {
  registerUsers,
  createGroupDialog,
  sendMessage,
  connectWebSocket,
  Metrics
} from "./helpers.js";

const MEMBER_COUNT = Number(process.argv[2]) || 50;
const MESSAGE_COUNT = Number(process.argv[3]) || 20;

const main = async () => {
  console.log("═══════════════════════════════════════════════");
  console.log("  TheGraphT Group Broadcast Spike Test         ");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Group size: ${MEMBER_COUNT} members`);
  console.log(`  Burst: ${MESSAGE_COUNT} rapid messages from 1 sender`);
  console.log(`  Expected deliveries: ${(MEMBER_COUNT - 1) * MESSAGE_COUNT}`);

  // Register users: 1 sender + (MEMBER_COUNT - 1) receivers
  const users = await registerUsers(MEMBER_COUNT, 30);

  if (users.length < MEMBER_COUNT) {
    console.error(`❌ Need ${MEMBER_COUNT} users, got ${users.length}`);
    process.exit(1);
  }

  const sender = users[0];
  const receivers = users.slice(1);

  // Create group
  console.log(`\n👥 Creating group with ${MEMBER_COUNT} members...`);
  const groupResult = await createGroupDialog(
    sender.cookie,
    `Load Test Group ${Date.now()}`,
    receivers.map((u) => u.userId)
  );
  const groupPublicId = groupResult.dialog?.publicId || groupResult.publicId || "";
  if (!groupPublicId) {
    console.error("❌ Failed to create group dialog");
    process.exit(1);
  }
  console.log(`   ✅ Group created: ${groupPublicId}`);

  // Connect all receivers via WebSocket
  console.log(`\n🔌 Connecting ${receivers.length} receiver WebSockets...`);
  const connections = [];
  const receivedByUser = new Map(); // userId -> Set of message bodies
  const firstReceiveTime = new Map(); // userId -> timestamp of first message received

  for (const user of receivers) {
    try {
      const { ws } = await connectWebSocket(user.cookie);
      receivedByUser.set(user.userId, new Set());

      ws.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === "message_created" && msg.message?.body?.startsWith("SPIKE_")) {
            const set = receivedByUser.get(user.userId);
            if (set && !set.size) {
              firstReceiveTime.set(user.userId, Date.now());
            }
            set?.add(msg.message.body);
          }
        } catch {}
      });

      connections.push({ ws, userId: user.userId });
    } catch (error) {
      console.log(`   ⚠️ WS connect failed for user ${user.userId}: ${error.message}`);
    }
  }
  console.log(`   ✅ ${connections.length} WebSockets connected`);

  // Brief settle
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Fire burst of messages from sender
  console.log(`\n🔥 Firing ${MESSAGE_COUNT} messages from sender...`);
  const sendMetrics = new Metrics("Group message send");
  const burstStart = Date.now();

  for (let i = 0; i < MESSAGE_COUNT; i++) {
    const start = Date.now();
    try {
      await sendMessage(sender.cookie, groupPublicId, `SPIKE_${i}_${Date.now()}`);
      sendMetrics.record(Date.now() - start);
    } catch (error) {
      sendMetrics.recordError();
      console.log(`   ❌ Send error at message ${i}: ${error.message}`);
    }
  }

  const burstDuration = Date.now() - burstStart;
  console.log(`   ✅ Burst sent in ${burstDuration}ms`);

  // Wait for fan-out delivery
  console.log(`\n⏳ Waiting for fan-out delivery (5s)...`);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Analyze results
  const totalExpected = connections.length * MESSAGE_COUNT;
  let totalReceived = 0;
  let fullDeliveryCount = 0;
  let partialDeliveryCount = 0;
  let zeroDeliveryCount = 0;
  const perUserCounts = [];

  for (const conn of connections) {
    const received = receivedByUser.get(conn.userId)?.size || 0;
    totalReceived += received;
    perUserCounts.push(received);

    if (received === MESSAGE_COUNT) {
      fullDeliveryCount++;
    } else if (received > 0) {
      partialDeliveryCount++;
    } else {
      zeroDeliveryCount++;
    }
  }

  // Cleanup
  for (const conn of connections) {
    try { conn.ws.close(); } catch {}
  }

  // Report
  sendMetrics.print();

  const deliveryRate = totalExpected > 0
    ? ((totalReceived / totalExpected) * 100).toFixed(1)
    : "0";

  console.log("\n\n═══════════════════════════════════════════════");
  console.log("  RESULTS SUMMARY");
  console.log("═══════════════════════════════════════════════");
  console.log(`  📤 Burst: ${MESSAGE_COUNT} messages in ${burstDuration}ms (${Math.round(MESSAGE_COUNT / (burstDuration / 1000))} msg/sec)`);
  console.log(`  📡 Fan-out delivery:`);
  console.log(`     Expected: ${totalExpected} | Received: ${totalReceived} | Rate: ${deliveryRate}%`);
  console.log(`     Full delivery: ${fullDeliveryCount}/${connections.length} receivers`);
  console.log(`     Partial delivery: ${partialDeliveryCount}`);
  console.log(`     Zero delivery: ${zeroDeliveryCount}`);

  if (perUserCounts.length) {
    const sorted = [...perUserCounts].sort((a, b) => a - b);
    console.log(`     Per-user min: ${sorted[0]} | max: ${sorted[sorted.length - 1]}`);
  }

  const success = Number(deliveryRate) >= 90 && zeroDeliveryCount === 0;
  console.log(success
    ? "\n✅ Group broadcast spike test PASSED"
    : "\n⚠️  Group broadcast has delivery issues — check metrics above"
  );

  process.exit(success ? 0 : 1);
};

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
