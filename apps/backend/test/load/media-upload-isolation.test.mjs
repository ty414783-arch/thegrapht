#!/usr/bin/env node
/**
 * Media Upload Isolation Test
 * ───────────────────────────
 * Verifies that heavy file uploads don't block text message processing.
 * Runs parallel "heavy" multipart uploads alongside rapid text messages
 * and compares text message latency under load vs baseline.
 *
 * Usage: node apps/backend/test/load/media-upload-isolation.test.mjs [uploaders] [textSenders]
 */
import http from "node:http";
import crypto from "node:crypto";
import {
  registerUsers,
  createDirectDialog,
  sendMessage,
  Metrics,
  runConcurrent,
  API_BASE,
  getOriginHeader
} from "./helpers.js";

const UPLOADER_COUNT = Number(process.argv[2]) || 10;
const TEXT_SENDER_COUNT = Number(process.argv[3]) || 30;
const TEXT_MESSAGES_PER_SENDER = 10;
const UPLOAD_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB per upload

/**
 * Upload a synthetic image (random bytes) as multipart/form-data.
 */
const uploadFakeImage = (cookie, dialogPublicId, sizeBytes) =>
  new Promise((resolve, reject) => {
    const boundary = "----LoadTestBoundary" + crypto.randomBytes(8).toString("hex");
    const fileContent = crypto.randomBytes(sizeBytes);
    // Write JPEG magic signature to satisfy the server's validation
    fileContent[0] = 0xff;
    fileContent[1] = 0xd8;
    fileContent[fileContent.length - 2] = 0xff;
    fileContent[fileContent.length - 1] = 0xd9;

    const fileName = `loadtest_${Date.now()}.jpg`;

    const bodyPrefix = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n`
    );

    const bodyCaption = Buffer.from(
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="body"\r\n\r\n` +
      `Load test image upload`
    );

    const bodySuffix = Buffer.from(`\r\n--${boundary}--\r\n`);
    const fullBody = Buffer.concat([bodyPrefix, fileContent, bodyCaption, bodySuffix]);

    const url = new URL(
      `/api/v1/dialogs/by-public-id/${encodeURIComponent(dialogPublicId)}/messages`,
      API_BASE
    );

    const request = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        cookie,
        origin: getOriginHeader(),
        "content-type": `multipart/form-data; boundary=${boundary}`,
        "content-length": fullBody.length
      }
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({ status: response.statusCode, body: raw });
        } else {
          reject(new Error(`Upload failed (${response.statusCode}): ${raw.slice(0, 200)}`));
        }
      });
    });

    request.on("error", reject);
    request.setTimeout(60000, () => {
      request.destroy(new Error("Upload timeout"));
    });

    request.write(fullBody);
    request.end();
  });

const main = async () => {
  console.log("═══════════════════════════════════════════════");
  console.log("  TheGraphT Media Upload Isolation Test        ");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Uploaders: ${UPLOADER_COUNT} (${(UPLOAD_SIZE_BYTES / 1024 / 1024).toFixed(0)}MB each)`);
  console.log(`  Text senders: ${TEXT_SENDER_COUNT} × ${TEXT_MESSAGES_PER_SENDER} messages`);

  const totalUsers = (UPLOADER_COUNT + TEXT_SENDER_COUNT) * 2;
  const users = await registerUsers(totalUsers, 30);

  if (users.length < totalUsers) {
    console.error(`❌ Need ${totalUsers} users, got ${users.length}`);
    process.exit(1);
  }

  // Split into uploaders and text senders
  const uploaderSenders = users.slice(0, UPLOADER_COUNT);
  const uploaderReceivers = users.slice(UPLOADER_COUNT, UPLOADER_COUNT * 2);
  const textSenders = users.slice(UPLOADER_COUNT * 2, UPLOADER_COUNT * 2 + TEXT_SENDER_COUNT);
  const textReceivers = users.slice(UPLOADER_COUNT * 2 + TEXT_SENDER_COUNT);

  // Create dialogs
  console.log("\n💬 Creating dialogs...");
  const uploadDialogs = await runConcurrent(UPLOADER_COUNT, 20, async (i) => {
    const result = await createDirectDialog(uploaderSenders[i].cookie, uploaderReceivers[i].userId);
    return {
      publicId: result.dialog?.publicId || result.publicId || "",
      senderCookie: uploaderSenders[i].cookie
    };
  });

  const textDialogs = await runConcurrent(TEXT_SENDER_COUNT, 20, async (i) => {
    const result = await createDirectDialog(textSenders[i].cookie, textReceivers[i].userId);
    return {
      publicId: result.dialog?.publicId || result.publicId || "",
      senderCookie: textSenders[i].cookie
    };
  });

  console.log(`   ✅ ${uploadDialogs.filter((d) => d.publicId).length} upload dialogs`);
  console.log(`   ✅ ${textDialogs.filter((d) => d.publicId).length} text dialogs`);

  // Phase 1: Baseline text message latency (no uploads)
  console.log("\n📊 Phase 1: Baseline text message latency (no uploads)...");
  const baselineMetrics = new Metrics("Baseline text send");

  await runConcurrent(TEXT_SENDER_COUNT, 20, async (i) => {
    const dialog = textDialogs[i];
    if (!dialog?.publicId) return;
    for (let m = 0; m < 3; m++) {
      const start = Date.now();
      try {
        await sendMessage(dialog.senderCookie, dialog.publicId, `baseline_${m}`);
        baselineMetrics.record(Date.now() - start);
      } catch {
        baselineMetrics.recordError();
      }
    }
  });

  baselineMetrics.print();

  // Phase 2: text messages WHILE uploads are running
  console.log("\n📊 Phase 2: Text messages DURING heavy uploads...");

  const uploadMetrics = new Metrics("Upload latency (2MB)");
  const underLoadMetrics = new Metrics("Text send (under upload load)");

  // Start uploads in background
  const uploadPromise = runConcurrent(UPLOADER_COUNT, UPLOADER_COUNT, async (i) => {
    const dialog = uploadDialogs[i];
    if (!dialog?.publicId) return;
    const start = Date.now();
    try {
      await uploadFakeImage(dialog.senderCookie, dialog.publicId, UPLOAD_SIZE_BYTES);
      uploadMetrics.record(Date.now() - start);
    } catch (error) {
      uploadMetrics.recordError();
    }
  });

  // Small delay to ensure uploads are in-flight
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Send text messages while uploads are running
  const textPromise = runConcurrent(TEXT_SENDER_COUNT, 20, async (i) => {
    const dialog = textDialogs[i];
    if (!dialog?.publicId) return;
    for (let m = 0; m < TEXT_MESSAGES_PER_SENDER; m++) {
      const start = Date.now();
      try {
        await sendMessage(dialog.senderCookie, dialog.publicId, `underload_${m}`);
        underLoadMetrics.record(Date.now() - start);
      } catch {
        underLoadMetrics.recordError();
      }
    }
  });

  await Promise.all([uploadPromise, textPromise]);

  uploadMetrics.print();
  underLoadMetrics.print();

  // Results
  console.log("\n\n═══════════════════════════════════════════════");
  console.log("  RESULTS SUMMARY");
  console.log("═══════════════════════════════════════════════");

  const baselineP95 = baselineMetrics.percentile(95);
  const underLoadP95 = underLoadMetrics.percentile(95);
  const degradation = baselineP95 > 0
    ? ((underLoadP95 / baselineP95 - 1) * 100).toFixed(0)
    : "N/A";

  console.log(`\n  📨 Text baseline p95: ${baselineP95}ms`);
  console.log(`  📨 Text under load p95: ${underLoadP95}ms`);
  console.log(`  📈 Degradation: ${degradation}%`);
  console.log(`  📤 Upload p95: ${uploadMetrics.percentile(95)}ms`);
  console.log(`  ❌ Upload errors: ${uploadMetrics.errors}`);
  console.log(`  ❌ Text errors (baseline): ${baselineMetrics.errors}`);
  console.log(`  ❌ Text errors (under load): ${underLoadMetrics.errors}`);

  // Text messages should not degrade more than 5x under upload pressure
  const degradationRatio = baselineP95 > 0 ? underLoadP95 / baselineP95 : 1;
  const success = degradationRatio < 5 && underLoadMetrics.errors === 0;
  console.log(success
    ? "\n✅ Media upload isolation test PASSED — text messages not blocked"
    : "\n⚠️  Text messages degraded significantly under upload load"
  );

  process.exit(success ? 0 : 1);
};

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
