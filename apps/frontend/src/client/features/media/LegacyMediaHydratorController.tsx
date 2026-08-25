import { useEffect, useRef } from "preact/hooks";
import { appStore } from "../../store/index.ts";
import { useUiFlags } from "../../shared/hooks/useStore.ts";

const getWin = () => window as any;

export function LegacyMediaHydratorController() {
  const flags = useUiFlags();
  const lastCountRef = useRef(-1);

  useEffect(() => {
    if (flags.newChatUi) {
      return;
    }

    const hydrate = () => {
      const state = appStore.getState();
      const count = state.messages.current.length;
      const localCount = state.messages.localOutgoing.length;
      const nextKey = count + localCount * 100000;
      if (nextKey === lastCountRef.current) {
        return;
      }
      lastCountRef.current = nextKey;

      const hydrateMessageImages = getWin().hydrateMessageImages;
      if (typeof hydrateMessageImages === "function") {
        hydrateMessageImages({ lockToken: getWin().bottomLockToken || 0 });
      }
    };

    hydrate();

    return appStore.subscribe(() => {
      hydrate();
    });
  }, [flags.newChatUi]);

  return null;
}
