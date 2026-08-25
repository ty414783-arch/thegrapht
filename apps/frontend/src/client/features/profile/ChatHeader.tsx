import styles from "./ChatHeader.module.css";
import { closeMobileChat } from "../workspace/workspace-actions.ts";
import { useAppStore } from "../../shared/hooks/useStore.ts";

type ChatHeaderProps = {
  onOpenProfile?: () => void;
  onToggleSearch?: () => void;
  searchOpen?: boolean;
};

export function ChatHeader({ onOpenProfile, onToggleSearch, searchOpen = false }: ChatHeaderProps) {
  const dialog = useAppStore((state) => state.dialogs.current);
  if (!dialog) return null;

  return (
    <header class={styles.header}>
      <button type="button" class={styles.back} aria-label="Back to chats" onClick={closeMobileChat}>←</button>
      <button type="button" class={styles.titleButton} onClick={onOpenProfile}>
        <span class={styles.avatar}>
          {dialog.avatarUrl ? <img src={String(dialog.avatarUrl)} alt="" /> : (dialog.title || "?").slice(0, 1)}
        </span>
        <span class={styles.copy}>
          <strong>{dialog.title || dialog.publicId}</strong>
          {dialog.subtitle ? <span>{dialog.subtitle}</span> : null}
        </span>
      </button>
      {onToggleSearch ? (
        <button
          type="button"
          class={`${styles.action} ${searchOpen ? styles.actionActive : ""}`}
          aria-label="Search messages"
          onClick={onToggleSearch}
        >
          ⌕
        </button>
      ) : null}
    </header>
  );
}
