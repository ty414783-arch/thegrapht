import styles from "./AlbumMessage.module.css";
import type { Message } from "../../store/types.ts";

type AlbumMessageProps = {
  message: Message;
  onOpen?: (index: number) => void;
};

export function AlbumMessage({ message, onOpen }: AlbumMessageProps) {
  const items = Array.isArray(message.albumItems)
    ? message.albumItems
    : message.mediaUrl
      ? [{ mediaUrl: message.mediaUrl }]
      : [];

  return (
    <div class={styles.grid}>
      {items.map((item, index) => (
        <button
          key={String(item.id || index)}
          type="button"
          class={styles.item}
          onClick={() => onOpen?.(index)}
        >
          <img src={String(item.mediaUrl || item.thumbnailUrl || "")} alt="" loading="lazy" />
        </button>
      ))}
      {message.body ? <span class={styles.caption}>{message.body}</span> : null}
    </div>
  );
}
