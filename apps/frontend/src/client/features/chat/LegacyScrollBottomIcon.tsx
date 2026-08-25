const getScrollBottomIconHtml = () => {
  const getIcon = (window as any).getIcon;
  if (typeof getIcon !== "function") {
    return "";
  }
  return getIcon("south", "", 'aria-hidden="true"');
};

export function LegacyScrollBottomIcon() {
  const iconHtml = getScrollBottomIconHtml();
  if (!iconHtml) {
    return null;
  }

  return (
    <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: iconHtml }} />
  );
}
