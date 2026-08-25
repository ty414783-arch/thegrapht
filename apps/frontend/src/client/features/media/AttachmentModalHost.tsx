import { useEffect } from "preact/hooks";
import { loadAttachmentModal } from "./index.ts";

/** Host node for legacy attachment modal when new UI is active. */
export function AttachmentModalHost() {
  useEffect(() => {
    void loadAttachmentModal();
  }, []);
  return <div id="tg-preact-attachment-host" />;
}
