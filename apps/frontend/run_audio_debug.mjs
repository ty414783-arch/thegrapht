import { chromium } from "playwright";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

async function main() {
  console.log("Launching browser in headless mode...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--host-resolver-rules=MAP web.thegrapht.su 127.0.0.1"]
  });
  const context = await browser.newContext({
    bypassCSP: true,
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Print all page console logs
  page.on("console", msg => {
    console.log(`[PAGE CONSOLE] [${msg.type().toUpperCase()}]:`, msg.text());
  });

  page.on("pageerror", err => {
    console.error("PAGE ERROR:", err.message);
  });

  // Track network requests and responses
  page.on("request", req => {
    console.log(`[NETWORK REQ]: ${req.method()} ${req.url()}`);
  });
  page.on("response", res => {
    console.log(`[NETWORK RES]: ${res.status()} ${res.url()}`);
  });

  console.log("Navigating to https://web.thegrapht.su/ ...");
  await page.goto("https://web.thegrapht.su/");
  
  // Wait for login screen
  console.log("Waiting for auth view...");
  await page.waitForSelector("#auth-view", { state: "visible" });

  // Switch to registration mode
  console.log("Switching to Create Account...");
  await page.click("#toggle-mode");
  await page.waitForSelector("#name", { state: "visible" });

  // Fill in register info (random email to prevent conflict)
  const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
  console.log(`Registering new user with email: ${uniqueEmail}`);
  await page.fill("#name", "Tester User");
  await page.fill("#email", uniqueEmail);
  await page.fill("#password", "password123");

  // Submit and wait for workspace to load
  console.log("Clicking submit...");
  await page.click("#submit-button");
  
  console.log("Waiting for workspace to load...");
  await page.waitForSelector("#workspace-view", { state: "visible", timeout: 15000 });

  // Run DB inserts to add an audio track in Saved Messages and join the group chat
  const msgUuid = crypto.randomUUID();
  const memUuid = crypto.randomUUID();
  console.log("Inserting audio message and joining group chat in DB...");
  const sqlInsertMsg = `INSERT INTO messages (id, dialog_id, sender_id, body, type, attachment_path, attachment_mime, attachment_name, attachment_size, attachment_duration_seconds) SELECT 'msg_${msgUuid}', 'dlg_saved_' || id, id, '', 'audio', 'audios/2026/05/30/af/af2dd17e89e4979ed645897abd7b21f2bf3cc76027bea9b8ea954550f70810f8.mp3', 'audio/mpeg', 'Its_Okay_To_Cry_-_SOPHIE.mp3', 9266199, 222 FROM users WHERE email = '${uniqueEmail}';`;
  const sqlInsertMem = `INSERT INTO memberships (id, dialog_id, user_id, role) SELECT 'mem_${memUuid}', 'dlg_group_1781948153297_9fd7c2050d29', id, 'member' FROM users WHERE email = '${uniqueEmail}';`;
  
  execSync(`docker exec thegrapht-postgres-1 psql -U thegrapht_app -d thegrapht -c "${sqlInsertMsg}"`);
  execSync(`docker exec thegrapht-postgres-1 psql -U thegrapht_app -d thegrapht -c "${sqlInsertMem}"`);
  
  console.log("Database entries inserted. Reloading page...");
  await page.reload();

  await page.waitForSelector("#workspace-view", { state: "visible", timeout: 15000 });
  await page.waitForSelector("#dialog-list", { state: "visible" });

  // Wait a moment for chats to render
  await page.waitForTimeout(1000);

  // Click on the Saved Messages chat
  console.log("Selecting 'Saved Messages'...");
  const savedMessagesLocator = page.locator('.dialog-item:has-text("Saved Messages")');
  await savedMessagesLocator.click();

  // Wait for the message list to load the audio card
  console.log("Waiting for audio message to load...");
  await page.waitForSelector("[data-audio-card]", { state: "visible" });
  
  // Click play
  console.log("Clicking PLAY on the audio track...");
  await page.click(".message-audio-toggle");

  // Let the audio play for 3 seconds
  console.log("Letting audio play for 3 seconds...");
  await page.waitForTimeout(3000);

  // Capture screenshot while playing in Saved Messages
  console.log("Capturing screenshot of playing audio in Saved Messages...");
  await page.screenshot({ path: "/root/.gemini/antigravity-ide/brain/38850204-684b-4d49-ab67-54a23893c621/playing_saved.png" });

  // Click on the group chat to switch chat
  console.log("Switching chat to 'musthaweee & nadyasalatik'...");
  const groupChatLocator = page.locator('.dialog-item:has-text("musthaweee & nadyasalatik")');
  await groupChatLocator.click();

  // Wait 3 seconds to see if audio stays active or triggers pause
  console.log("Waiting 3 seconds after chat switch...");
  await page.waitForTimeout(3000);

  // Capture screenshot while playing in group chat
  console.log("Capturing screenshot of playing audio in group chat...");
  await page.screenshot({ path: "/root/.gemini/antigravity-ide/brain/38850204-684b-4d49-ab67-54a23893c621/playing_group.png" });

  // Exit/close the active dialog
  console.log("Closing/exiting active dialog...");
  await page.evaluate(() => {
    if (typeof window.closeDialog === "function") {
      window.closeDialog();
    } else {
      window.location.hash = "";
    }
  });
  await page.waitForTimeout(1000);

  // Capture screenshot in empty state (exited chat)
  console.log("Capturing screenshot of playing audio after exiting chat...");
  await page.screenshot({ path: "/root/.gemini/antigravity-ide/brain/38850204-684b-4d49-ab67-54a23893c621/playing_closed.png" });

  // Get playing state
  const isPaused = await page.evaluate(() => {
    const activeAudio = window.activeAudioElement;
    return activeAudio ? activeAudio.paused : "null";
  });
  console.log(`\nFINAL STATE: activeAudio.paused = ${isPaused}`);

  await browser.close();
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
