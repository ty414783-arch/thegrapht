import { useEffect, useState } from "preact/hooks";
import { appStore, type AppState } from "../../store/index.ts";

export const useAppStore = <T,>(selector: (state: AppState) => T): T => {
  const [value, setValue] = useState(() => selector(appStore.getState()));

  useEffect(() => {
    return appStore.subscribe((state) => {
      setValue(selector(state));
    });
  }, []);

  return value;
};

export const useUiFlags = () => {
  const win = window as any;
  return win.__THEGRAPHT_CONFIG__?.uiFlags || win.__THEGRAPHT_UI_FLAGS__ || {};
};
