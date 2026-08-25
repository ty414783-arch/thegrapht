import { useEffect, useState } from "preact/hooks";
import type { Dialog, Message } from "../../store/types.ts";

export const useSecureMessageBody = (message: Message, dialog: Dialog | null | undefined) => {
  const [body, setBody] = useState(message.body || "");

  useEffect(() => {
    if (dialog?.encryptionMode !== "e2e_v1" || !message.ciphertext) {
      setBody(message.body || "");
      return;
    }

    let cancelled = false;
    void (async () => {
      await import("../../services/secure.ts");
      const decrypt = (window as any).decryptSecureMessage;
      if (typeof decrypt !== "function") return;
      const prepared = await decrypt(dialog, message);
      if (!cancelled) {
        setBody(String(prepared?.body || message.body || "[Encrypted message]"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dialog?.encryptionMode, dialog?.id, message.id, message.body, message.ciphertext]);

  return body;
};
