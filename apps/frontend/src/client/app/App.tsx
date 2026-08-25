import { AppShell } from "../features/workspace/AppShell.tsx";
import { ToastStack } from "../shared/ui/ToastStack.tsx";
import { AuthView } from "../features/auth/AuthView.tsx";
import { BootSplash } from "../features/auth/BootSplash.tsx";
import { SettingsPanel } from "../features/settings/SettingsPanel.tsx";
import { CallMiniCard, CallModalHost, GroupCallGrid } from "../features/calls/CallShell.tsx";
import { AttachmentModalHost } from "../features/media/AttachmentModalHost.tsx";
import { useUiFlags } from "../shared/hooks/useStore.ts";
import { isNewAuthUiEnabled } from "../store/sync-legacy.ts";

/** Root Preact app — new surfaces stay behind UI_NEW_* flags. Legacy look is default. */
export function App() {
  const flags = useUiFlags();
  const newAuthUi = flags.newAuthUi || isNewAuthUiEnabled();
  const newWorkspace = Boolean(flags.newChatUi || flags.newSidebar);

  return (
    <>
      {newAuthUi ? <BootSplash /> : null}
      {newAuthUi ? <AuthView /> : null}
      <AppShell />
      {newWorkspace ? (
        <>
          <SettingsPanel />
          <CallMiniCard />
          <CallModalHost />
          <GroupCallGrid />
          <AttachmentModalHost />
        </>
      ) : null}
      <ToastStack />
    </>
  );
}
