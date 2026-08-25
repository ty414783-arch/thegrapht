import styles from "./DialogItem.module.css";
import type { Dialog } from "../../store/types.ts";

type DialogItemProps = {
  dialog: Dialog;
  isActive: boolean;
  typingLabel?: string;
  onOpen: () => void;
};

const formatLastTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export function DialogItem({ dialog, isActive, typingLabel = "", onOpen }: DialogItemProps) {
  const initials = (dialog.title || dialog.publicId || "?").slice(0, 1).toUpperCase();
  const preview = typingLabel || dialog.lastMessagePreview || "";
  const lastTime = formatLastTime(String(dialog.lastMessageCreatedAt || dialog.updatedAt || ""));

  return (
    <button
      type="button"
      class={`${styles.item} ${isActive ? styles.active : ""}`}
      onClick={onOpen}
    >
      <span class={styles.avatar} aria-hidden="true">
        {dialog.avatarUrl ? (
          <img src={String(dialog.avatarUrl)} alt="" />
        ) : (
          initials
        )}
      </span>
      <span class={styles.body}>
        <span class={styles.topRow}>
          <span class={styles.title}>{dialog.title || dialog.publicId}</span>
          {lastTime ? <span class={styles.time}>{lastTime}</span> : null}
        </span>
        <span class={styles.bottomRow}>
          <span class={styles.preview}>{preview}</span>
          {dialog.unreadCount ? <span class={styles.badge}>{dialog.unreadCount}</span> : null}
        </span>
      </span>
    </button>
  );
}
