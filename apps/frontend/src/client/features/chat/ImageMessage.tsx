import styles from "./ImageMessage.module.css";
import type { Message } from "../../store/types.ts";

type ImageMessageProps = {
  message: Message;
  onOpen?: () => void;
};

export function ImageMessage({ message, onOpen }: ImageMessageProps) {
  const url = String(message.mediaUrl || message.thumbnailUrl || "");
  if (!url) return <span>{message.body || "Photo"}</span>;

  return (
    <button type="button" class={styles.imageButton} onClick={onOpen}>
      <img src={url} alt={message.body || "Image"} class={styles.image} loading="lazy" />
      {message.body ? <span class={styles.caption}>{message.body}</span> : null}
    </button>
  );
}
