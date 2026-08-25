import { useEffect, useState } from "preact/hooks";
import styles from "./ImageViewer.module.css";
import { loadMediaFeatures } from "./index.ts";

type ImageViewerProps = {
  url: string;
  onClose: () => void;
};

export function ImageViewer({ url, onClose }: ImageViewerProps) {
  useEffect(() => {
    void loadMediaFeatures();
  }, []);

  return (
    <div class={styles.overlay} role="dialog" aria-modal="true">
      <button type="button" class={styles.close} onClick={onClose}>×</button>
      <img src={url} alt="" class={styles.image} />
    </div>
  );
}

export function useImageViewer() {
  const [url, setUrl] = useState("");
  return {
    open: (nextUrl: string) => setUrl(nextUrl),
    viewer: url ? <ImageViewer url={url} onClose={() => setUrl("")} /> : null
  };
}
