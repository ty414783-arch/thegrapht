#!/usr/bin/env node
/**
 * Reconnection Flapping Test
 * ──────────────────────────
 * Connects N WebSocket clients, drops 30%, waits briefly, then
 * reconnects them all simultaneously. Measures server stability
 * under reconnection storm conditions.
 *
 * Usage: node apps/backend/test/load/reconnection-flapping.test.mjs [connectionCount]
 */
import {
  registerUsers,
  connectWebSocket,
  Metrics,
  runConcurrent
} from "./helpers.js";

const CONNECTION_COUNT = Number(process.argv[2]) || 200;
const DROP_PERCENTAGE = 0.30;
const RECONNECT_ROUNDS = 3;

const main = async () => {
  console.log("═══════════════════════════════════════════════");
  console.log("  TheGraphT Reconnection Flapping Test         ");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Connections: ${CONNECTION_COUNT}`);
  console.log(`  Drop %: ${DROP_PERCENTAGE * 100}%`);
  console.log(`  Reconnection rounds: ${RECONNECT_ROUNDS}`);

  const users = await registerUsers(CONNECTION_COUNT, 30);

  if (users.length < CONNECTION_COUNT) {
    console.log(`⚠️ Only ${users.length} users available, adjusting.`);
  }
  const activeUsers = users.slice(0, Math.min(CONNECTION_COUNT, users.length));

  // Phase 1: initial connect all
  console.log(`\n🔌 Phase 1: Connecting all ${activeUsers.length} clients...`);
  const initialMetrics = new Metrics("Initial connect");
  const connections = [];

  await runConcurrent(activeUsers.length, 50, async (i) => {
    const start = Date.now();
    try {
      const { ws, closePromise } = await connectWebSocket(activeUsers[i].cookie);
      initialMetrics.record(Date.now() - start);
      connections.push({ ws, closePromise, userIndex: i, alive: true });
    } catch (error) {
      initialMetrics.recordError();
      connections.push({ ws: null, userIndex: i, alive: false });
    }
  });

  initialMetrics.print();
  const aliveCount = connections.filter((c) => c.alive).length;
  console.log(`   ✅ ${aliveCount}/${activeUsers.length} connected`);

  // Brief stabilization
  await new Promise((resolve) => setTimeout(resolve, 2000));

  for (let round = 1; round <= RECONNECT_ROUNDS; round++) {
    console.log(`\n════════════ Round ${round}/${RECONNECT_ROUNDS} ════════════`);

    // Phase 2: drop 30%
    const aliveConnections = connections.filter((c) => c.alive && c.ws?.readyState === 1);
    const dropCount = Math.floor(aliveConnections.length * DROP_PERCENTAGE);
    const dropTargets = [];

    // Random selection
    const shuffled = [...aliveConnections].sort(() => Math.random() - 0.5);
    for (let i = 0; i < dropCount && i < shuffled.length; i++) {
      dropTargets.push(shuffled[i]);
    }

    console.log(`\n💥 Dropping ${dropTargets.length} connections (${(DROP_PERCENTAGE * 100).toFixed(0)}%)...`);
    for (const conn of dropTargets) {
      try {
        conn.ws.terminate(); // hard kill, no close frame
        conn.alive = false;
      } catch {}
    }

    // Wait 2s to let server process disconnects
    console.log("   ⏳ Waiting 2s for server to process disconnects...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Phase 3: reconnect all dropped simultaneously
    console.log(`\n🔄 Reconnecting ${dropTargets.length} clients simultaneously...`);
    const reconnectMetrics = new Metrics(`Reconnect (round ${round})`);

    await runConcurrent(dropTargets.length, 40, async (i) => {
      const conn = dropTargets[i];
      const start = Date.now();
      try {
        const { ws, closePromise } = await connectWebSocket(activeUsers[conn.userIndex].cookie);
        reconnectMetrics.record(Date.now() - start);
        conn.ws = ws;
        conn.closePromise = closePromise;
        conn.alive = true;
      } catch (error) {
        reconnectMetrics.recordError();
        conn.alive = false;
      }
    });

    reconnectMetrics.print();

    const reconnected = dropTargets.filter((c) => c.alive).length;
    console.log(`   ✅ ${reconnected}/${dropTargets.length} reconnected`);

    // Check overall health
    let totalAlive = 0;
    let totalDead = 0;
    for (const conn of connections) {
      if (conn.alive && conn.ws?.readyState === 1) {
        totalAlive++;
      } else {
        totalDead++;
      }
    }
    console.log(`   📊 Overall: ${totalAlive} alive, ${totalDead} dead`);

    // Stabilize
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  // Final health check
  console.log("\n\n═══════════════════════════════════════════════");
  console.log("  FINAL HEALTH CHECK");
  console.log("═══════════════════════════════════════════════");

  let finalAlive = 0;
  let finalDead = 0;
  const pingMetrics = new Metrics("Final ping latency");

  for (const conn of connections) {
    if (!conn.alive || conn.ws?.readyState !== 1) {
      finalDead++;
      continue;
    }

    const start = Date.now();
    try {
      conn.ws.send(JSON.stringify({ type: "ping" }));
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("timeout")), 3000);
        const handler = (data) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.type === "pong") {
              clearTimeout(timeout);
              conn.ws.off("message", handler);
              resolve();
            }
          } catch {}
        };
        conn.ws.on("message", handler);
      });
      pingMetrics.record(Date.now() - start);
      finalAlive++;
    } catch {
      pingMetrics.recordError();
      finalDead++;
    }
  }

  console.log(`  🟢 Alive & responsive: ${finalAlive}`);
  console.log(`  🔴 Dead / unresponsive: ${finalDead}`);
  pingMetrics.print();

  // Cleanup
  for (const conn of connections) {
    try { conn.ws?.close(); } catch {}
  }

  const survivalRate = ((finalAlive / activeUsers.length) * 100).toFixed(1);
  console.log(`\n  Survival rate: ${survivalRate}%`);

  const success = Number(survivalRate) >= 95;
  console.log(success
    ? "\n✅ Reconnection flapping test PASSED"
    : "\n⚠️  Server struggled under reconnection storm — check metrics"
  );

  process.exit(success ? 0 : 1);
};

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
