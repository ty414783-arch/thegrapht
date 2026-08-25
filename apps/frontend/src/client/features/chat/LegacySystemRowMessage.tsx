export type LegacySystemRowMessageProps = {
  rowClassName: string;
  messageId: string;
  senderId: string;
  messageType: string;
  attachmentName: string;
  mediaUrl: string;
  pillText: string;
};

export function LegacySystemRowMessage({
  rowClassName,
  messageId,
  senderId,
  messageType,
  attachmentName,
  mediaUrl,
  pillText
}: LegacySystemRowMessageProps) {
  return (
    <div
      class={rowClassName}
      data-message-id={messageId}
      data-sender-id={senderId}
      data-message-type={messageType}
      data-attachment-name={attachmentName}
      data-media-url={mediaUrl}
    >
      <div class="message-system-pill">{pillText}</div>
    </div>
  );
}
