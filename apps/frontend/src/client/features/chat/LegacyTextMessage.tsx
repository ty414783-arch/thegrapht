import { MessageStatusIcon } from "./MessageStatusIcon.tsx";

const BUBBLE_TAIL_SVG = '<svg class="tg-bubble-tail-svg" viewBox="0 0 8 17" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path fill="currentColor" d="M1 17H8V0H7C6.807 2.8393 6.1238 5.7667 4.9504 8.7824 4.04603 11.1066 2.5041 13.2667.3247 15.2625c-.40731.373-.43513 1.0056-.06213 1.4129.18943.20685.45702.32465.7375.32465z"/></svg>';

export type LegacyTextMessageShellProps = {
  rowClassName: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  showAvatar: boolean;
  showAvatarSpacer: boolean;
  showName: boolean;
  avatarHtml: string;
};

export type LegacyTextMessageProps = {
  messageId: string;
  senderId: string;
  messageType: string;
  attachmentName: string;
  mediaUrl: string;
  articleClassName: string;
  timeLabel: string;
  replyPreviewHtml: string;
  bodyHtml: string;
  showTail: boolean;
  statusState: "pending" | "failed" | "sent" | "read" | "none";
  shell?: LegacyTextMessageShellProps | null;
};

function LegacyTextArticle({
  messageId,
  senderId,
  messageType,
  attachmentName,
  mediaUrl,
  articleClassName,
  timeLabel,
  replyPreviewHtml,
  bodyHtml,
  showTail,
  statusState
}: Omit<LegacyTextMessageProps, "shell">) {
  return (
    <article
      class={articleClassName}
      data-message-id={messageId}
      data-sender-id={senderId}
      data-message-type={messageType}
      data-attachment-name={attachmentName}
      data-media-url={mediaUrl}
    >
      {replyPreviewHtml ? (
        <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: replyPreviewHtml }} />
      ) : null}
      <div class="message-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <div class="message-meta">
        <span class="message-meta-time">{timeLabel}</span>
        <MessageStatusIcon state={statusState} />
      </div>
      {showTail ? (
        <span class="tg-bubble-tail" aria-hidden="true" dangerouslySetInnerHTML={{ __html: BUBBLE_TAIL_SVG }} />
      ) : null}
    </article>
  );
}

export function LegacyTextMessage({ shell, ...articleProps }: LegacyTextMessageProps) {
  const article = <LegacyTextArticle {...articleProps} />;

  if (!shell) {
    return article;
  }

  return (
    <div
      class={shell.rowClassName}
      data-message-id={shell.messageId}
      data-sender-id={shell.senderId}
    >
      {shell.showAvatar ? (
        <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: shell.avatarHtml }} />
      ) : shell.showAvatarSpacer ? (
        <div class="group-incoming-avatar placeholder" aria-hidden="true" />
      ) : null}
      <div class="group-incoming-main">
        {shell.showName ? (
          <div class="group-incoming-sender" style={{ color: shell.senderColor }}>
            {shell.senderName}
          </div>
        ) : null}
        {article}
      </div>
    </div>
  );
}
