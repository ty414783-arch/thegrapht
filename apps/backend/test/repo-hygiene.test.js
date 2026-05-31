import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

test("repo hygiene keeps generated artifacts out of source tree", () => {
  const androidDir = path.join(rootDir, "apps/android");

  if (!fs.existsSync(androidDir)) {
    assert.equal(fs.existsSync(path.join(rootDir, "apps/backend/src")), true);
    return;
  }

  assert.equal(fs.existsSync(path.join(rootDir, "apps/android/build")), false);
  assert.equal(fs.existsSync(path.join(rootDir, "apps/android/src")), false);
  assert.equal(fs.existsSync(path.join(rootDir, "apps/android/src-kotlin")), true);
});

test("dialog list uses database-backed unread counts", () => {
  const dialogsSource = fs.readFileSync(path.join(rootDir, "apps/backend/src/services/dialogs.js"), "utf8");

  assert.doesNotMatch(dialogsSource, /0 AS "unreadCount"/);
  assert.match(dialogsSource, /unread_message\.created_at > self_membership\.last_read_at/);
  assert.match(dialogsSource, /unread_message\.sender_id <> \$1/);
});

test("canonical generated-client checker exists", () => {
  assert.equal(fs.existsSync(path.join(rootDir, "scripts/check-generated-client.mjs")), true);
});
