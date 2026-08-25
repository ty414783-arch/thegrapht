import { useState } from "preact/hooks";
import styles from "./QrSharePanel.module.css";
import { useAppStore } from "../../shared/hooks/useStore.ts";
import { uiActions } from "../../store/index.ts";
import { useI18n } from "../../shared/hooks/useI18n.ts";

export function QrSharePanel() {
  const [open, setOpen] = useState(false);
  const dialog = useAppStore((state) => state.dialogs.current);
  const { t } = useI18n();

  const showQr = async () => {
    await import("../../services/qr-share.ts");
    const openQr = (window as any).openQrShareForDialog;
    if (typeof openQr === "function" && dialog) {
      openQr(dialog);
      return;
    }
    uiActions.showToast("QR share is unavailable for this chat.", "info");
  };

  if (!dialog) return null;

  return (
    <div class={styles.shell}>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        {t("qr.show")}
      </button>
      {open ? (
        <div class={styles.panel}>
          <p>{dialog.title || dialog.publicId}</p>
          <button type="button" onClick={() => void showQr()}>{t("qr.show")}</button>
        </div>
      ) : null}
    </div>
  );
}
