import { useCallback } from "preact/hooks";
import { messageActions, uiActions } from "../../store/index.ts";
import { thgApi } from "../../api/thg-client.ts";
import type { Message } from "../../store/types.ts";

export const useRetryMessage = (publicId?: string, pendingReplyId?: string | null) => {
  return useCallback(async (message: Message) => {
    if (!publicId || !message.body) return;

    messageActions.updateById(message.id, { localStatus: "pending" });
    try {
      const response = await thgApi.sendTextMessage(publicId, message.body, pendingReplyId || message.replyToMessageId) as any;
      const confirmed = response?.message || response;
      messageActions.replaceLocal(message.id, {
        ...message,
        ...confirmed,
        localStatus: undefined
      });
    } catch {
      messageActions.markFailed(message.id);
      uiActions.showToast("Failed to send message", "error");
    }
  }, [publicId, pendingReplyId]);
};
