import { useState } from "preact/hooks";
import styles from "./SettingsPanel.module.css";
import { useAppStore } from "../../shared/hooks/useStore.ts";
import { thgApi } from "../../api/thg-client.ts";
import { uiActions } from "../../store/index.ts";
import { useI18n } from "../../shared/hooks/useI18n.ts";
import { QrSharePanel } from "./QrSharePanel.tsx";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const user = useAppStore((state) => state.auth.user);
  const { t, locale, setLocale } = useI18n();

  const logout = async () => {
    try {
      await thgApi.fetchJson("/v1/auth/logout", { method: "POST" });
    } catch {}
    window.location.replace("/");
  };

  if (!open) {
    return (
      <button type="button" class={styles.trigger} onClick={() => setOpen(true)}>
        {t("settings")}
      </button>
    );
  }

  return (
    <aside class={styles.panel}>
      <header class={styles.header}>
        <strong>{t("settings")}</strong>
        <button type="button" onClick={() => setOpen(false)}>×</button>
      </header>
      <div class={styles.body}>
        <p>{user?.displayName || user?.email}</p>
        <label class={styles.field}>
          Language
          <select value={locale} onChange={(event) => setLocale((event.currentTarget as HTMLSelectElement).value)}>
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </label>
        <button type="button" class={styles.logout} onClick={() => void logout()}>{t("logout")}</button>
        <button type="button" onClick={() => uiActions.showToast("Notifications use browser permission.", "info")}>
          Enable notifications
        </button>
        <QrSharePanel />
      </div>
    </aside>
  );
}
