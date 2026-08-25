import { MessageStatusIcon } from "./MessageStatusIcon.tsx";
import { ImageMessage } from "./ImageMessage.tsx";
import { AlbumMessage } from "./AlbumMessage.tsx";
import { AudioMessage } from "./AudioMessage.tsx";
import styles from "./MessageBubble.module.css";
import type { Dialog, Message } from "../../store/types.ts";
import { useSecureMessageBody } from "../secure/useSecureMessageBody.ts";
import { dispatchMentionClear, dispatchMentionHover } from "../profile/MentionHoverCard.tsx";
import { useImageViewer } from "../media/ImageViewer.tsx";

type MessageBubbleProps = {
  message: Message;
  isOutgoing?: boolean;
  peerReadAt?: string | null;
  dialogType?: string;
  dialog?: Dialog | null;
  onRetry?: (message: Message) => void;
  onContextMenu?: (message: Message, event: MouseEvent) => void;
};

const formatTime = (createdAt?: string) => {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const resolveReadState = (
  message: Message,
  isOutgoing: boolean,
  peerReadAt?: string | null
): "pending" | "failed" | "sent" | "read" | "none" => {
  if (!isOutgoing) return "none";
  if (message.localStatus === "pending") return "pending";
  if (message.localStatus === "failed") return "failed";
  const messageTs = message.createdAt ? new Date(message.createdAt).getTime() : 0;
  const readTs = peerReadAt ? new Date(peerReadAt).getTime() : 0;
  if (Number.isFinite(readTs) && readTs > 0 && messageTs <= readTs) return "read";
  return "sent";
};

const renderTextWithMentions = (body: string) => {
  const parts = body.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (!part.startsWith("@")) {
      return part;
    }
    const username = part.slice(1);
    return (
      <button
        key={`${username}-${index}`}
        type="button"
        class={styles.mention}
        onMouseEnter={(event) => dispatchMentionHover(username, event.currentTarget as HTMLElement)}
        onMouseLeave={() => dispatchMentionClear()}
      >
        {part}
      </button>
    );
  });
};

export function MessageBubble({
  message,
  isOutgoing = false,
  peerReadAt = null,
  dialogType = "direct",
  dialog = null,
  onRetry,
  onContextMenu
}: MessageBubbleProps) {
  const secureBody = useSecureMessageBody(message, dialog);
  const body = secureBody || message.body || "";
  const { open: openImage, viewer } = useImageViewer();
  const readState = resolveReadState(message, isOutgoing, peerReadAt);
  const className = [
    styles.bubble,
    isOutgoing ? styles.outgoing : styles.incoming,
    message.localStatus === "pending" ? styles.pending : "",
    message.localStatus === "failed" ? styles.failed : ""
  ].filter(Boolean).join(" ");

  const type = String(message.type || "text");
  let content: preact.ComponentChild;
  if (type === "image" || type === "photo") {
    content = (
      <ImageMessage
        message={message}
        onOpen={() => {
          const url = String(message.mediaUrl || message.thumbnailUrl || "");
          if (url) openImage(url);
        }}
      />
    );
  } else if (type === "album") {
    content = <AlbumMessage message={message} />;
  } else if (type === "audio" || type === "voice") {
    content = <AudioMessage message={message} />;
  } else {
    content = <span class={styles.body}>{renderTextWithMentions(body)}</span>;
  }

  return (
    <>
      <article
        id={`message-${message.id}`}
        class={className}
        data-message-id={message.id}
        onContextMenu={(event) => onContextMenu?.(message, event as unknown as MouseEvent)}
      >
        {content}
        <span class={styles.meta}>
          <time class={styles.time}>{formatTime(message.createdAt)}</time>
          {isOutgoing && message.localStatus === "failed" && onRetry ? (
            <button type="button" class={styles.retry} onClick={() => onRetry(message)}>Retry</button>
          ) : null}
          {isOutgoing ? (
            <MessageStatusIcon state={readState} dialogType={dialogType} />
          ) : null}
        </span>
      </article>
      {viewer}
    </>
  );
}
