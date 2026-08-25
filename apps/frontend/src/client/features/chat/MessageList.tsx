import { useMemo, useRef } from "preact/hooks";
import { MessageBubble } from "./MessageBubble.tsx";
import { DaySeparator } from "./DaySeparator.tsx";
import styles from "./MessageList.module.css";
import { useAppStore } from "../../shared/hooks/useStore.ts";
import { useMessagePagination } from "../../shared/hooks/useMessagePagination.ts";
import { formatDayLabel } from "../../shared/lib/message-day.ts";
import { useRetryMessage } from "./useRetryMessage.ts";
import { useMessageContextMenu } from "../profile/MessageContextMenu.tsx";
import type { Message } from "../../store/types.ts";

type RenderItem =
  | { kind: "day"; id: string; label: string }
  | { kind: "message"; id: string; message: Message };

export function MessageList() {
  const listRef = useRef<HTMLDivElement>(null);
  const messages = useAppStore((state) => state.messages.current);
  const currentDialog = useAppStore((state) => state.dialogs.current);
  const peerReadAt = useAppStore((state) => state.presence.peerReadAt);
  const userId = useAppStore((state) => state.auth.userId);
  const pendingReply = useAppStore((state) => state.ui.pendingReplyMessage);
  const { loadingOlder } = useMessagePagination(listRef);
  const retryMessage = useRetryMessage(currentDialog?.publicId, pendingReply?.id);
  const { openMenu, menu } = useMessageContextMenu();

  const items = useMemo(() => {
    const renderItems: RenderItem[] = [];
    let previousDay = "";

    for (const message of messages) {
      const dayLabel = formatDayLabel(message.createdAt);
      if (dayLabel && dayLabel !== previousDay) {
        renderItems.push({ kind: "day", id: "day-" + dayLabel + "-" + message.id, label: dayLabel });
        previousDay = dayLabel;
      }
      renderItems.push({ kind: "message", id: message.id, message });
    }

    return renderItems;
  }, [messages]);

  return (
    <div ref={listRef} class={styles.list}>
      {loadingOlder ? <div class={styles.loadingOlder}>Loading older messages…</div> : null}
      {items.map((item) => {
        if (item.kind === "day") {
          return <DaySeparator key={item.id} label={item.label} />;
        }

        const isOutgoing = item.message.senderId === userId;
        return (
          <MessageBubble
            key={item.id}
            message={item.message}
            isOutgoing={isOutgoing}
            peerReadAt={peerReadAt}
            dialogType={currentDialog?.type}
            dialog={currentDialog}
            onRetry={(message) => void retryMessage(message)}
            onContextMenu={openMenu}
          />
        );
      })}
      {menu}
    </div>
  );
}
