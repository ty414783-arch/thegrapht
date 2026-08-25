import styles from "./SidebarEmpty.module.css";

export function SidebarEmpty() {
  return (
    <div class={styles.empty}>
      <strong>No chats yet</strong>
      <p>Groups can have up to 200 members. Channels can broadcast to unlimited subscribers.</p>
    </div>
  );
}
