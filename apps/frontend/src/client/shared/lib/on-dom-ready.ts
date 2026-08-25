/** Run once the document can be queried. Safe if DOMContentLoaded already fired. */
export const onDomReady = (fn: () => void) => {
  if (typeof document === "undefined") {
    return;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
    return;
  }
  fn();
};
