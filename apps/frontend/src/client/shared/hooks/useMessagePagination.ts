import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { appStore, messageActions } from "../../store/index.ts";
import { thgApi } from "../../api/thg-client.ts";
import { useAppStore } from "./useStore.ts";

export const useMessagePagination = (listRef: { current: HTMLElement | null }) => {
  const dialogPublicId = useAppStore((state) => state.dialogs.current?.publicId || "");
  const [loadingOlder, setLoadingOlder] = useState(false);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    hasMoreRef.current = true;
  }, [dialogPublicId]);

  const loadOlderMessages = useCallback(async () => {
    if (!dialogPublicId || loadingOlder || !hasMoreRef.current) {
      return;
    }

    const messages = appStore.getState().messages.current;
    if (!messages.length) {
      return;
    }

    const oldest = messages[0];
    if (!oldest?.id || !oldest.createdAt) {
      return;
    }

    const listEl = listRef.current;
    const previousScrollHeight = listEl?.scrollHeight || 0;
    setLoadingOlder(true);

    try {
      const payload = await thgApi.getMessages(dialogPublicId, {
        beforeDate: oldest.createdAt,
        beforeId: oldest.id
      });
      const olderMessages = Array.isArray(payload.messages) ? payload.messages : [];
      if (!olderMessages.length) {
        hasMoreRef.current = false;
        return;
      }

      const existingIds = new Set(messages.map((message) => message.id));
      const uniqueOlder = olderMessages.filter((message) => !existingIds.has(message.id));
      if (!uniqueOlder.length) {
        hasMoreRef.current = false;
        return;
      }

      messageActions.setCurrent([...uniqueOlder, ...messages]);

      if (listEl) {
        requestAnimationFrame(() => {
          const nextScrollHeight = listEl.scrollHeight;
          listEl.scrollTop += nextScrollHeight - previousScrollHeight;
        });
      }
    } catch {
      hasMoreRef.current = false;
    } finally {
      setLoadingOlder(false);
    }
  }, [dialogPublicId, listRef, loadingOlder]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl || !dialogPublicId) {
      return;
    }

    const onScroll = () => {
      if (listEl.scrollTop <= 64) {
        void loadOlderMessages();
      }
    };

    listEl.addEventListener("scroll", onScroll, { passive: true });
    return () => listEl.removeEventListener("scroll", onScroll);
  }, [dialogPublicId, listRef, loadOlderMessages]);

  return { loadingOlder, loadOlderMessages };
};
