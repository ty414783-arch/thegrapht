export {};

declare const apiBase: string;
declare const currentUserId: string;
declare const fetchJson: (url: string, options?: any) => Promise<any>;

interface SecureFeatureState {
  identityPromise: Promise<any> | null;
  publishPromise: Promise<any> | null;
  dialogKeys: Map<string, any>;
  keyBundles: Map<string, any>;
}

const secureFeatureState: SecureFeatureState = {
  identityPromise: null,
  publishPromise: null,
  dialogKeys: new Map(),
  keyBundles: new Map()
};

const SECURE_LOG_PREFIX = "[TheGraphT Secure]";
const logSecure = (event: string, details: any = {}) => {
  try {
    console.info(SECURE_LOG_PREFIX, event, details);
  } catch {}
};
const warnSecure = (event: string, details: any = {}) => {
  try {
    console.warn(SECURE_LOG_PREFIX, event, details);
  } catch {}
};
const getSecureDialogsDirectApiUrl = () => apiBase + "/v1/dialogs/direct/secure";
const getSecureKeyBundleApiUrl = () => apiBase + "/v1/e2e/key-bundle";
const secureKeyStoragePrefix = "thegrapht_secure_identity_v1:";
const secureDialogKeyStoragePrefix = "thegrapht_secure_dialog_key_v2:";

const isSecureDialog = (dialog: any) => dialog?.encryptionMode === "e2e_v1";
const hasSecureCrypto = () => Boolean(window.crypto?.subtle && window.TextEncoder && window.TextDecoder);

const toBase64 = (bytes: Uint8Array | ArrayBuffer) => {
  let binary = "";
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let index = 0; index < view.length; index += 1) {
    binary += String.fromCharCode(view[index]);
  }
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(String(value || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const encodeUtf8 = (value: string) => new TextEncoder().encode(String(value || ""));
const decodeUtf8 = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

const hashSecureKeyId = async (text: string) => {
  const digest = await window.crypto.subtle.digest("SHA-256", encodeUtf8(text));
  return toBase64(new Uint8Array(digest)).replace(/=+$/g, "").slice(0, 24);
};

const importSecurePublicJwk = (jwk: JsonWebKey) => window.crypto.subtle.importKey(
  "jwk",
  jwk,
  {
    name: "ECDH",
    namedCurve: "P-256"
  },
  true,
  []
);

const importSecurePrivateJwk = (jwk: JsonWebKey) => window.crypto.subtle.importKey(
  "jwk",
  jwk,
  {
    name: "ECDH",
    namedCurve: "P-256"
  },
  true,
  ["deriveBits"]
);

const importDialogKey = (rawKey: any) => window.crypto.subtle.importKey(
  "raw",
  rawKey,
  {
    name: "AES-GCM"
  },
  true,
  ["encrypt", "decrypt"]
);

const deriveWrappingKey = async (privateKey: CryptoKey, peerPublicJwk: JsonWebKey) => {
  const peerPublicKey = await importSecurePublicJwk(peerPublicJwk);
  const rawBits = await window.crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: peerPublicKey
    },
    privateKey,
    256
  );
  return importDialogKey(rawBits);
};

const loadStoredSecureIdentity = async (userId: string) => {
  const raw = window.localStorage.getItem(secureKeyStoragePrefix + userId);
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw);
  if (!parsed?.publicJwk || !parsed?.privateJwk || parsed.algorithm !== "P-256") {
    return null;
  }

  const [publicKey, privateKey] = await Promise.all([
    importSecurePublicJwk(parsed.publicJwk),
    importSecurePrivateJwk(parsed.privateJwk)
  ]);

  return {
    algorithm: "P-256",
    keyId: parsed.keyId,
    publicKey,
    privateKey,
    publicJwk: parsed.publicJwk,
    privateJwk: parsed.privateJwk,
    publicKeyPayload: parsed.publicKeyPayload
  };
};

const createSecureIdentity = async (userId: string) => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256"
    },
    true,
    ["deriveBits"]
  );
  const [publicJwk, privateJwk] = await Promise.all([
    window.crypto.subtle.exportKey("jwk", keyPair.publicKey),
    window.crypto.subtle.exportKey("jwk", keyPair.privateKey)
  ]);
  const publicKeyPayload = JSON.stringify(publicJwk);
  const keyId = await hashSecureKeyId(publicKeyPayload);
  const identity = {
    algorithm: "P-256",
    keyId,
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicJwk,
    privateJwk,
    publicKeyPayload
  };
  window.localStorage.setItem(secureKeyStoragePrefix + userId, JSON.stringify({
    algorithm: identity.algorithm,
    keyId: identity.keyId,
    publicJwk,
    privateJwk,
    publicKeyPayload
  }));
  return identity;
};

const ensureSecureIdentity = async () => {
  if (!currentUserId || !hasSecureCrypto()) {
    return null;
  }

  if (!secureFeatureState.identityPromise) {
    secureFeatureState.identityPromise = (async () => {
      const stored = await loadStoredSecureIdentity(currentUserId);
      return stored || createSecureIdentity(currentUserId);
    })().catch((error) => {
      secureFeatureState.identityPromise = null;
      throw error;
    });
  }

  return secureFeatureState.identityPromise;
};

const getSecureDialogStorageKey = (dialogPublicId: string) => secureDialogKeyStoragePrefix + currentUserId + ":" + dialogPublicId;

const persistDialogKey = (dialogPublicId: string, rawKey: Uint8Array, keyId: string) => {
  const serialized = JSON.stringify({
    keyId,
    rawKey: toBase64(new Uint8Array(rawKey))
  });
  secureFeatureState.dialogKeys.set(dialogPublicId, {
    keyId,
    rawKey,
    cryptoKeyPromise: Promise.resolve(importDialogKey(rawKey))
  });
  window.localStorage.setItem(getSecureDialogStorageKey(dialogPublicId), serialized);
};

const loadPersistedDialogKey = async (dialogPublicId: string) => {
  const raw = window.localStorage.getItem(getSecureDialogStorageKey(dialogPublicId));
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw);
  const rawKey = fromBase64(parsed.rawKey);
  const entry = {
    keyId: parsed.keyId || "",
    rawKey,
    cryptoKeyPromise: importDialogKey(rawKey)
  };
  secureFeatureState.dialogKeys.set(dialogPublicId, entry);
  return entry;
};
const invalidateDialogKeyCache = (dialogPublicId: string) => {
  if (!dialogPublicId) {
    return;
  }
  secureFeatureState.dialogKeys.delete(dialogPublicId);
  try {
    window.localStorage.removeItem(getSecureDialogStorageKey(dialogPublicId));
  } catch {}
};

const fetchJsonWithStatus = async (url: string, options: any = {}) => {
  const headers = {
    ...(options.headers || {})
  };
  const host = String(window.location.hostname || "").toLowerCase();
  const isDesktop = host === "" || (typeof window !== "undefined" && (!!(window as any).tgDesktop || !!(window as any).__TAURI_INTERNALS__));
  const canUseLegacyAuthorizationHeader = host === "localhost"
    || host === "127.0.0.1"
    || host.endsWith(".local")
    || isDesktop;
  if (canUseLegacyAuthorizationHeader && (window as any).legacySessionToken && !headers.Authorization) {
    headers.Authorization = "Bearer " + (window as any).legacySessionToken;
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers
  });
  const rawBody = await response.text();
  const payload = rawBody ? JSON.parse(rawBody) : {};
  return {
    ok: response.ok,
    status: response.status,
    payload
  };
};

const ensureOwnSecureKeyBundlePublished = async () => {
  if (!currentUserId || !hasSecureCrypto()) {
    return null;
  }

  if (!secureFeatureState.publishPromise) {
    secureFeatureState.publishPromise = (async () => {
      const identity = await ensureSecureIdentity();
      if (!identity) {
        return null;
      }

      await fetchJson(getSecureKeyBundleApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          publicKey: identity.publicKeyPayload,
          algorithm: identity.algorithm
        })
      });

      return identity;
    })().catch((error) => {
      secureFeatureState.publishPromise = null;
      throw error;
    });
  }

  return secureFeatureState.publishPromise;
};

const getPeerSecureBundle = async (userId: string) => {
  if (secureFeatureState.keyBundles.has(userId)) {
    return secureFeatureState.keyBundles.get(userId);
  }

  const response = await fetchJsonWithStatus(apiBase + "/v1/e2e/users/" + encodeURIComponent(userId) + "/key-bundle");
  if (!response.ok) {
    return null;
  }

  const bundle = {
    ...response.payload,
    publicJwk: JSON.parse(response.payload.publicKey)
  };
  secureFeatureState.keyBundles.set(userId, bundle);
  return bundle;
};

const wrapDialogKeyForPublicJwk = async ({ rawDialogKey, localIdentity, recipientPublicJwk }: any) => {
  const wrappingKey = await deriveWrappingKey(localIdentity.privateKey, recipientPublicJwk);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const wrappedKey = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    wrappingKey,
    rawDialogKey
  );

  return JSON.stringify({
    version: 1,
    algorithm: "P-256-AES-GCM",
    senderKeyId: localIdentity.keyId,
    iv: toBase64(iv),
    wrappedKey: toBase64(new Uint8Array(wrappedKey))
  });
};

const ensureSecureDialogKey = async (dialog: any) => {
  if (!dialog?.publicId || !isSecureDialog(dialog) || !hasSecureCrypto()) {
    return null;
  }

  const cached = secureFeatureState.dialogKeys.get(dialog.publicId) || await loadPersistedDialogKey(dialog.publicId);
  if (cached) {
    return {
      keyId: cached.keyId,
      cryptoKey: await cached.cryptoKeyPromise
    };
  }

  const identity = await ensureOwnSecureKeyBundlePublished();
  if (!identity) {
    return null;
  }

  const bootstrap = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(dialog.publicId) + "/secure-bootstrap");
  if (!bootstrap?.keyEnvelope || !bootstrap?.peer?.publicKey) {
    return null;
  }

  const peerPublicJwk = JSON.parse(bootstrap.peer.publicKey);
  const envelope = JSON.parse(bootstrap.keyEnvelope);
  const wrappingKey = await deriveWrappingKey(identity.privateKey, peerPublicJwk);
  const rawDialogKey = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: fromBase64(envelope.iv)
    },
    wrappingKey,
    fromBase64(envelope.wrappedKey)
  );
  const rawKey = new Uint8Array(rawDialogKey);
  const keyId = envelope.senderKeyId || identity.keyId;
  persistDialogKey(dialog.publicId, rawKey, keyId);

  return {
    keyId,
    cryptoKey: await importDialogKey(rawKey)
  };
};

const decryptSecureMessage = async (dialog: any, message: any) => {
  if (!isSecureDialog(dialog) || !message?.ciphertext || !message?.nonce) {
    return message;
  }

  try {
    const cached = secureFeatureState.dialogKeys.get(dialog.publicId) || await loadPersistedDialogKey(dialog.publicId);
    if (cached?.keyId && message?.senderKeyId && cached.keyId !== message.senderKeyId) {
      warnSecure("decrypt_key_id_mismatch_refreshing_key", {
        dialogId: dialog.id,
        dialogPublicId: dialog.publicId,
        messageId: message.id,
        cachedKeyId: cached.keyId,
        senderKeyId: message.senderKeyId
      });
      invalidateDialogKeyCache(dialog.publicId);
    }

    const dialogKey = await ensureSecureDialogKey(dialog);
    if (!dialogKey?.cryptoKey) {
      warnSecure("decrypt_skipped_no_key", {
        dialogId: dialog.id,
        dialogPublicId: dialog.publicId,
        messageId: message.id,
        senderId: message.senderId
      });
      return {
        ...message,
        body: "Encrypted message unavailable on this device",
        decryptionFailed: true
      };
    }

    const plaintext = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: fromBase64(message.nonce)
      },
      dialogKey.cryptoKey,
      fromBase64(message.ciphertext)
    );

    return {
      ...message,
      body: decodeUtf8(new Uint8Array(plaintext)),
      decryptionFailed: false
    };
  } catch (error) {
    try {
      invalidateDialogKeyCache(dialog.publicId);
      const refreshedDialogKey = await ensureSecureDialogKey(dialog);
      if (refreshedDialogKey?.cryptoKey) {
        const plaintext = await window.crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: fromBase64(message.nonce)
          },
          refreshedDialogKey.cryptoKey,
          fromBase64(message.ciphertext)
        );
        return {
          ...message,
          body: decodeUtf8(new Uint8Array(plaintext)),
          decryptionFailed: false
        };
      }
    } catch {}

    warnSecure("decrypt_failed", {
      dialogId: dialog.id,
      dialogPublicId: dialog.publicId,
      messageId: message.id,
      senderId: message.senderId,
      senderKeyId: message.senderKeyId || null,
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      ...message,
      body: "Encrypted message unavailable on this device",
      decryptionFailed: true
    };
  }
};

const prepareDialogPayloadForDisplay = async (dialog: any, messages: any[] = []) => {
  if (!dialog || !isSecureDialog(dialog) || !messages.length) {
    return {
      dialog,
      messages
    };
  }

  const preparedMessages = [];
  let failedDecryptions = 0;
  for (const message of messages) {
    const preparedMessage = await decryptSecureMessage(dialog, message);
    if (preparedMessage?.decryptionFailed) {
      failedDecryptions += 1;
    }
    preparedMessages.push(preparedMessage);
  }

  if (failedDecryptions > 0) {
    warnSecure("payload_decrypt_partial_failure", {
      dialogId: dialog.id,
      dialogPublicId: dialog.publicId,
      totalMessages: messages.length,
      failedDecryptions
    });
  }

  return {
    dialog,
    messages: preparedMessages
  };
};

const encryptSecureMessageBody = async (dialog: any, body: string) => {
  const dialogKey = await ensureSecureDialogKey(dialog);
  if (!dialogKey?.cryptoKey) {
    throw new Error("Failed to initialize secure dialog key.");
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    dialogKey.cryptoKey,
    encodeUtf8(body)
  );

  logSecure("encrypt_message_ready", {
    dialogId: dialog.id,
    dialogPublicId: dialog.publicId,
    plaintextLength: String(body || "").length
  });

  return {
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    nonce: toBase64(iv),
    senderKeyId: dialogKey.keyId || ""
  };
};

const createPreferredDirectDialog = async (targetUserId: string) => {
  return fetchJson((window as any).createDirectDialogApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ targetUserId })
  });
};

const createSecretDirectDialog = async (targetUserId: string) => {
  if (!targetUserId || !hasSecureCrypto()) {
    throw new Error("Secure chat is not supported in this browser.");
  }

  try {
    const [localIdentity, peerBundle] = await Promise.all([
      ensureOwnSecureKeyBundlePublished(),
      getPeerSecureBundle(targetUserId)
    ]);

    if (!localIdentity || !peerBundle?.publicJwk) {
      throw new Error("SECURE_FALLBACK_REQUIRED");
    }

    const rawDialogKey = window.crypto.getRandomValues(new Uint8Array(32));
    const [creatorKeyEnvelope, recipientKeyEnvelope] = await Promise.all([
      wrapDialogKeyForPublicJwk({
        rawDialogKey,
        localIdentity,
        recipientPublicJwk: localIdentity.publicJwk
      }),
      wrapDialogKeyForPublicJwk({
        rawDialogKey,
        localIdentity,
        recipientPublicJwk: peerBundle.publicJwk
      })
    ]);

    const payload = await fetchJson(getSecureDialogsDirectApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        targetUserId,
        creatorKeyEnvelope,
        recipientKeyEnvelope,
        keyAlgorithm: "P-256-AES-GCM",
        encryptionVersion: 1,
        explicit: true
      })
    });

    if (payload?.dialog?.publicId) {
      persistDialogKey(payload.dialog.publicId, rawDialogKey, localIdentity.keyId);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.message !== "SECURE_FALLBACK_REQUIRED") {
      console.warn("Secure direct dialog bootstrap failed.", error);
    }

    throw new Error("Failed to start secret chat.");
  }
};

(window as any).isSecureDialog = isSecureDialog;
(window as any).hasSecureCrypto = hasSecureCrypto;
(window as any).ensureOwnSecureKeyBundlePublished = ensureOwnSecureKeyBundlePublished;
(window as any).decryptSecureMessage = decryptSecureMessage;
(window as any).prepareDialogPayloadForDisplay = prepareDialogPayloadForDisplay;
(window as any).encryptSecureMessageBody = encryptSecureMessageBody;
(window as any).createPreferredDirectDialog = createPreferredDirectDialog;
(window as any).createSecretDirectDialog = createSecretDirectDialog;
