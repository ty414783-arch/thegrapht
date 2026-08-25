type LegacyComposerReplyPreviewInnerProps = {
  author: string;
  textHtml: string;
  onClose: () => void;
};

export function LegacyComposerReplyPreviewInner({
  author,
  textHtml,
  onClose
}: LegacyComposerReplyPreviewInnerProps) {
  return (
    <>
      <div class="composer-reply-copy">
        <span id="composer-reply-author" class="composer-reply-author">{author}</span>
        <span
          id="composer-reply-text"
          class="composer-reply-text"
          dangerouslySetInnerHTML={{ __html: textHtml }}
        />
      </div>
      <button
        id="composer-reply-close"
        class="composer-reply-close"
        type="button"
        aria-label="Cancel reply"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }}
      >
        &times;
      </button>
    </>
  );
}
