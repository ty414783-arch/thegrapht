#!/usr/bin/env node
/**
 * WebSocket Concurrency Test
 * ──────────────────────────
 * Opens N WebSocket connections to the backend and verifies all stay open.
 * Tests: 100 → 500 → 1000 concurrent connections.
 *
 * Usage: node apps/backend/test/load/ws-concurrency.test.mjs [maxConnections]
 */
import {
  registerUsers,
  connectWebSocket,
  Metrics,
  runConcurrent
} from "./helpers.js";

const MAX_CONNECTIONS = Number(process.argv[2]) || 500;
const TIERS = [100, 250, 500, 1000].filter((t) => t <= MAX_CONNECTIONS);
const HOLD_DURATION_MS = 5000;

const runTier = async (count, users) => {
  const tierUsers = users.slice(0, count);
  if (tierUsers.length < count) {
    console.log(`  ⚠️  Only ${tierUsers.length} users available for tier ${count}`);
  }

  const metrics = new Metrics(`WS Concurrency: ${tierUsers.length} connections`);
  const connections = [];

  console.log(`\n🔌 Opening ${tierUsers.length} WebSocket connections...`);

  const results = await runConcurrent(tierUsers.length, 50, async (i) => {
    const start = Date.now();
    try {
      const { ws, closePromise } = await connectWebSocket(tierUsers[i].cookie);
      const elapsed = Date.now() - start;
      metrics.record(elapsed);
      connections.push({ ws, closePromise, index: i });
      return { success: true, elapsed };
    } catch (error) {
      metrics.recordError();
      return { success: false, error: error.message };
    }
  });

  const openCount = connections.length;
  const failCount = results.filter((r) => !r.success).length;
  console.log(`   ✅ ${openCount} connected | ❌ ${failCount} failed`);

  // Hold connections open
  console.log(`   ⏳ Holding connections for ${HOLD_DURATION_MS / 1000}s...`);
  await new Promise((resolve) => setTimeout(resolve, HOLD_DURATION_MS));

  // Check which are still open
  let stillAlive = 0;
  let dropped = 0;
  for (const conn of connections) {
    if (conn.ws.readyState === 1 /* OPEN */) {
      stillAlive++;
    } else {
      dropped++;
    }
  }

  console.log(`   🟢 Still alive: ${stillAlive} | 🔴 Dropped: ${dropped}`);

  // Send ping on all connections
  const pingMetrics = new Metrics(`WS Ping latency (${tierUsers.length} connections)`);
  let pingOk = 0;
  for (const conn of connections) {
    if (conn.ws.readyState !== 1) continue;
    const pingStart = Date.now();
    try {
      conn.ws.send(JSON.stringify({ type: "ping" }));
      // Wait for pong
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Ping timeout"));
        }, 5000);
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
      pingMetrics.record(Date.now() - pingStart);
      pingOk++;
    } catch {
      pingMetrics.recordError();
    }
  }
  console.log(`   📡 Ping responses: ${pingOk}/${connections.length}`);

  // Close all connections
  for (const conn of connections) {
    try {
      conn.ws.close();
    } catch {}
  }

  metrics.print();
  pingMetrics.print();

  return {
    tier: tierUsers.length,
    connected: openCount,
    failed: failCount,
    stillAlive,
    dropped,
    connectMetrics: metrics.summary(),
    pingMetrics: pingMetrics.summary()
  };
};

const main = async () => {
  console.log("═══════════════════════════════════════════════");
  console.log("  TheGraphT WebSocket Concurrency Load Test   ");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Target: ${MAX_CONNECTIONS} max connections`);
  console.log(`  Tiers: ${TIERS.join(" → ")}`);

  const users = await registerUsers(MAX_CONNECTIONS, 30);
  const tierResults = [];

  for (const tier of TIERS) {
    if (tier > users.length) break;
    tierResults.push(await runTier(tier, users));
    // Brief pause between tiers for server GC
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n\n═══════════════════════════════════════════════");
  console.log("  RESULTS SUMMARY");
  console.log("═══════════════════════════════════════════════");
  for (const r of tierResults) {
    const dropRate = r.tier > 0 ? ((r.dropped / r.tier) * 100).toFixed(1) : "0";
    console.log(
      `  ${r.tier} conn → ` +
      `${r.connected} ok, ${r.failed} fail, ` +
      `${r.stillAlive} alive after ${HOLD_DURATION_MS / 1000}s ` +
      `(drop: ${dropRate}%)`
    );
    console.log(
      `    connect p50=${r.connectMetrics.p50}ms p95=${r.connectMetrics.p95}ms p99=${r.connectMetrics.p99}ms`
    );
    console.log(
      `    ping    p50=${r.pingMetrics.p50}ms p95=${r.pingMetrics.p95}ms p99=${r.pingMetrics.p99}ms`
    );
  }

  const anyDropped = tierResults.some((r) => r.dropped > 0);
  console.log(anyDropped
    ? "\n⚠️  Some connections were dropped during hold period!"
    : "\n✅  All connections held stable across all tiers."
  );

  process.exit(anyDropped ? 1 : 0);
};

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
