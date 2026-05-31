import test from "node:test";
import assert from "node:assert/strict";

import { dialogDtoSchema, messageDtoSchema, userDtoSchema } from "../src/contracts/client.js";

test("client contracts accept secure dialog and message fields", () => {
  const user = userDtoSchema.parse({
    id: "u_1",
    displayName: "User",
    username: "user",
    email: "user@example.com",
    isSecureSupported: true
  });

  const dialog = dialogDtoSchema.parse({
    id: "dlg_secure_u_1_u_2",
    publicId: "-1001234567",
    type: "direct",
    title: "Peer User",
    subtitle: "@peer",
    encryptionMode: "e2e_v1",
    encryptionVersion: 1,
    isSecureSupported: true
  });

  const message = messageDtoSchema.parse({
    id: "msg_1",
    body: null,
    ciphertext: "ciphertext_payload",
    nonce: "nonce_payload",
    envelopeVersion: 1,
    senderKeyId: "key_1",
    type: "text",
    createdAt: new Date().toISOString(),
    senderId: "u_1",
    senderName: "User"
  });

  assert.equal(user.isSecureSupported, true);
  assert.equal(dialog.encryptionMode, "e2e_v1");
  assert.equal(message.ciphertext, "ciphertext_payload");
});
