export type LegacyDialogItemProps = {
  dialogId: string;
  publicId: string;
  dialogType: string;
  unreadCount: number;
  muted: boolean;
  isActive: boolean;
  avatarHtml: string;
  typeIconHtml: string;
  title: string;
  verifiedHtml: string;
  metaTime: string;
  previewHtml: string;
  openButtonLabel: string;
  showOpenButton: boolean;
  onOpen: () => void;
};

export function LegacyDialogItem({
  dialogId,
  publicId,
  dialogType,
  unreadCount,
  muted,
  isActive,
  avatarHtml,
  typeIconHtml,
  title,
  verifiedHtml,
  metaTime,
  previewHtml,
  openButtonLabel,
  showOpenButton,
  onOpen
}: LegacyDialogItemProps) {
  const unreadBadgeClassName = unreadCount > 0
    ? ("dialog-unread-badge" + (muted ? " is-muted" : ""))
    : "dialog-unread-badge is-hidden";

  return (
    <button
      type="button"
      class={"dialog-item saved-item" + (isActive ? " active" : "")}
      data-dialog-id={dialogId}
      data-public-id={publicId}
      data-dialog-type={dialogType}
      data-dialog-unread={String(unreadCount)}
      data-dialog-muted={String(muted)}
      onClick={onOpen}
    >
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: avatarHtml }} />
      <div class="dialog-body">
        <div class="dialog-line">
          <span class="dialog-title-wrap">
            {typeIconHtml ? (
              <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: typeIconHtml }} />
            ) : null}
            <strong>{title}</strong>
            {verifiedHtml ? (
              <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: verifiedHtml }} />
            ) : null}
          </span>
          <span class="dialog-meta">{metaTime}</span>
        </div>
        <div class="dialog-preview-row">
          <div class="dialog-preview-copy">
            {previewHtml ? (
              <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : null}
          </div>
          {showOpenButton ? <span class="dialog-open-btn">{openButtonLabel}</span> : null}
          <span class={unreadBadgeClassName} aria-hidden={unreadCount > 0 ? "false" : "true"}>
            {String(unreadCount)}
          </span>
        </div>
      </div>
    </button>
  );
}
