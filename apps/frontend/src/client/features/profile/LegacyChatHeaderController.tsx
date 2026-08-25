import { useEffect, useRef } from "preact/hooks";
import { appStore } from "../../store/index.ts";
import { useUiFlags } from "../../shared/hooks/useStore.ts";
import { selectLegacyChatChromeKey, syncLegacyChatChromeFromStore } from "./legacyChatHeaderSync.ts";

export function LegacyChatHeaderController() {
  const flags = useUiFlags();
  const lastKeyRef = useRef("");

  useEffect(() => {
    if (flags.newChatUi) {
      return;
    }

    const syncIfChanged = (key: string) => {
      if (key === lastKeyRef.current) {
        return;
      }
      lastKeyRef.current = key;
      syncLegacyChatChromeFromStore();
    };

    syncIfChanged(selectLegacyChatChromeKey(appStore.getState()));

    return appStore.subscribe((state) => {
      syncIfChanged(selectLegacyChatChromeKey(state));
    });
  }, [flags.newChatUi]);

  return null;
}
