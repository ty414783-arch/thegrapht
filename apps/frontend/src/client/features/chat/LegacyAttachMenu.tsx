const getAttachMenuIcon = (name: string) => {
  const getIcon = (window as any).getIcon;
  if (typeof getIcon !== "function") {
    return "";
  }
  return getIcon(name, "", 'aria-hidden="true"');
};

export function LegacyAttachMenu() {
  return (
    <>
      <button
        class="attach-menu-item"
        type="button"
        aria-label="Photo or Video"
        title="Photo or Video"
        data-attach-action="media"
      >
        <span dangerouslySetInnerHTML={{ __html: getAttachMenuIcon("photo_library") }} />
        <span data-i18n="media.photoOrVideo">Photo or Video</span>
      </button>
      <button
        class="attach-menu-item"
        type="button"
        aria-label="File"
        title="File"
        data-attach-action="file"
      >
        <span dangerouslySetInnerHTML={{ __html: getAttachMenuIcon("draft") }} />
        <span data-i18n="media.file">File</span>
      </button>
    </>
  );
}
