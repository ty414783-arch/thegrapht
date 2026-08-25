import { useEffect, useRef, useState } from "preact/hooks";
import styles from "./MessageContextMenu.module.css";
import type { Message } from "../../store/types.ts";
import { messageActions, uiActions } from "../../store/index.ts";
import { thgApi } from "../../api/thg-client.ts";
import { useAppStore } from "../../shared/hooks/useStore.ts";

type MessageContextMenuProps = {
  message: Message;
  anchor: { x: number; y: number };
  onClose: () => void;
};

export function MessageContextMenu({ message, anchor, onClose }: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const dialog = useAppStore((state) => state.dialogs.current);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [onClose]);

  const reply = () => {
    uiActions.setPendingReply(message);
    onClose();
  };

  const remove = async () => {
    if (!dialog?.publicId) return;
    try {
      await thgApi.fetchJson(`/v1/dialogs/by-public-id/${encodeURIComponent(dialog.publicId)}/messages/${encodeURIComponent(message.id)}`, {
        method: "DELETE"
      });
      messageActions.remove(message.id);
    } catch (error) {
      uiActions.showToast(error instanceof Error ? error.message : "Delete failed", "error");
    } finally {
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      class={styles.menu}
      style={{ top: `${anchor.y}px`, left: `${anchor.x}px` }}
      role="menu"
    >
      <button type="button" onClick={reply}>Reply</button>
      <button type="button" onClick={() => void remove()}>Delete</button>
      <button type="button" onClick={() => {
        document.getElementById(`message-${message.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        onClose();
      }}>Jump</button>
    </div>
  );
}

export function useMessageContextMenu() {
  const [state, setState] = useState<{ message: Message; anchor: { x: number; y: number } } | null>(null);
  return {
    openMenu: (message: Message, event: MouseEvent) => {
      event.preventDefault();
      setState({ message, anchor: { x: event.clientX, y: event.clientY } });
    },
    menu: state ? (
      <MessageContextMenu
        message={state.message}
        anchor={state.anchor}
        onClose={() => setState(null)}
      />
    ) : null
  };
}
