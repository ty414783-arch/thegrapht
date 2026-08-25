import { useEffect } from "preact/hooks";
import { installLegacyComposerSend, type LegacyComposerSendContext } from "./legacyComposerSend.ts";

type LegacyComposerControllerProps = {
  context?: LegacyComposerSendContext;
};

export function LegacyComposerController({ context = {} }: LegacyComposerControllerProps) {
  useEffect(() => {
    installLegacyComposerSend(context);
  }, []);

  return null;
}
