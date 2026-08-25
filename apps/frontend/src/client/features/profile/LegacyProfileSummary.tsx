type LegacyProfileSummaryProps = {
  dialogKey: string;
  avatarHtml: string;
  name: string;
  status: string;
};

export function LegacyProfileSummary({
  dialogKey,
  avatarHtml,
  name,
  status
}: LegacyProfileSummaryProps) {
  return (
    <>
      <div
        id="chat-profile-avatar"
        class="chat-profile-avatar"
        role="button"
        tabindex="0"
        data-rendered-dialog-id={dialogKey}
      >
        <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: avatarHtml }} />
      </div>
      <div id="chat-profile-name" class="chat-profile-name">{name}</div>
      <div id="chat-profile-status" class="chat-profile-status">{status}</div>
    </>
  );
}
