import { useEffect, useState } from "preact/hooks";

const dictionaries: Record<string, Record<string, string>> = {
  en: {
    settings: "Settings",
    logout: "Log out"
  },
  ru: {
    settings: "Настройки",
    logout: "Выйти"
  }
};

export const useI18n = () => {
  const [locale, setLocaleState] = useState(() => localStorage.getItem("tg_locale") || "en");

  useEffect(() => {
    localStorage.setItem("tg_locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string) => dictionaries[locale]?.[key] || dictionaries.en[key] || key;

  return {
    locale,
    setLocale: setLocaleState,
    t
  };
};

export const useDesktopNotifications = () => {
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);
};
