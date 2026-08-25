import styles from "./ToastStack.module.css";
import { uiActions } from "../../store/index.ts";
import { useAppStore } from "../hooks/useStore.ts";

export function ToastStack() {
  const toasts = useAppStore((state) => state.ui.toasts);

  if (!toasts.length) {
    return null;
  }

  return (
    <div class={styles.stack} aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          class={`${styles.toast} ${styles[toast.type || "info"]}`}
          onClick={() => uiActions.dismissToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
