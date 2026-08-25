import { useRef, useState } from "preact/hooks";
import styles from "./Composer.module.css";
import { messageActions, uiActions, uploadActions } from "../../store/index.ts";
import { thgApi } from "../../api/thg-client.ts";
import { useAppStore } from "../../shared/hooks/useStore.ts";
import { loadAttachmentModal } from "../media/index.ts";

export function Composer() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialog = useAppStore((state) => state.dialogs.current);
  const pendingReply = useAppStore((state) => state.ui.pendingReplyMessage);
  const uploads = useAppStore((state) => state.uploads.items.filter((item) => item.dialogPublicId === dialog?.publicId));

  const handleSend = async () => {
    const body = text.trim();
    const publicId = dialog?.publicId;
    if (!body || !publicId || sending) return;

    const localId = "local_" + Date.now();
    const optimistic = {
      id: localId,
      type: "text",
      body,
      createdAt: new Date().toISOString(),
      senderId: (window as any).currentUserId || "",
      localStatus: "pending" as const,
      replyToMessageId: pendingReply?.id || null
    };

    messageActions.append(optimistic);
    setText("");
    setSending(true);

    try {
      const response = await thgApi.sendTextMessage(publicId, body, pendingReply?.id) as any;
      const confirmed = response?.message || response;
      messageActions.replaceLocal(localId, {
        ...optimistic,
        ...confirmed,
        localStatus: undefined
      });
      uiActions.setPendingReply(null);
    } catch {
      messageActions.replaceLocal(localId, { ...optimistic, localStatus: "failed" });
      uiActions.showToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const handleAttach = async () => {
    await loadAttachmentModal();
    fileInputRef.current?.click();
  };

  const uploadFiles = async (files: FileList | null) => {
    const publicId = dialog?.publicId;
    if (!publicId || !files?.length) return;

    for (const file of Array.from(files)) {
      const uploadId = "upload_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      uploadActions.upsert({
        id: uploadId,
        dialogPublicId: publicId,
        fileName: file.name,
        progress: 0,
        status: "uploading"
      });

      try {
        const formData = new FormData();
        formData.append("file", file);
        await thgApi.fetchJson(`/v1/dialogs/by-public-id/${encodeURIComponent(publicId)}/attachments`, {
          method: "POST",
          body: formData
        });
        uploadActions.upsert({
          id: uploadId,
          dialogPublicId: publicId,
          fileName: file.name,
          progress: 100,
          status: "done"
        });
      } catch (error) {
        uploadActions.upsert({
          id: uploadId,
          dialogPublicId: publicId,
          fileName: file.name,
          progress: 0,
          status: "failed",
          error: error instanceof Error ? error.message : "Upload failed"
        });
      }
    }
  };

  return (
    <div class={styles.shell}>
      {pendingReply ? (
        <div class={styles.replyPreview}>
          <span>{pendingReply.body || "Reply"}</span>
          <button type="button" onClick={() => uiActions.setPendingReply(null)}>×</button>
        </div>
      ) : null}
      {uploads.map((upload) => (
        <div key={upload.id} class={styles.uploadRow}>
          <span>{upload.fileName}</span>
          <span>{upload.status === "failed" ? "Failed" : `${upload.progress}%`}</span>
          {upload.status === "failed" ? (
            <button type="button" onClick={() => fileInputRef.current?.click()}>Retry</button>
          ) : null}
        </div>
      ))}
      <div class={styles.row}>
        <button type="button" class={styles.attach} aria-label="Attach" onClick={() => void handleAttach()}>+</button>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          onChange={(event) => void uploadFiles((event.currentTarget as HTMLInputElement).files)}
        />
        <textarea
          class={styles.input}
          value={text}
          rows={1}
          placeholder="Message"
          onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
        />
        <button type="button" class={styles.send} disabled={sending || !text.trim()} onClick={() => void handleSend()}>
          Send
        </button>
      </div>
    </div>
  );
}
