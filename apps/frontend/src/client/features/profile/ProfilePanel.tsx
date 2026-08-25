import styles from "./ProfilePanel.module.css";
import { useAppStore } from "../../shared/hooks/useStore.ts";

type ProfilePanelProps = {
  onClose: () => void;
};

export function ProfilePanel({ onClose }: ProfilePanelProps) {
  const dialog = useAppStore((state) => state.dialogs.current);
  if (!dialog) return null;

  return (
    <aside class={styles.panel}>
      <header class={styles.header}>
        <strong>{dialog.title || dialog.publicId}</strong>
        <button type="button" onClick={onClose} aria-label="Close profile">×</button>
      </header>
      <div class={styles.body}>
        {dialog.subtitle ? <p>{dialog.subtitle}</p> : null}
        <p>Type: {dialog.type}</p>
        {dialog.encryptionMode === "e2e_v1" ? <p>End-to-end encrypted</p> : null}
      </div>
    </aside>
  );
}
