import { useLegacyUiToggle } from "./useLegacyUiToggle.ts";
import { useUiFlags } from "../../shared/hooks/useStore.ts";
import { NewChatShell } from "../chat/ChatWindow.tsx";
import { NewSidebar } from "../sidebar/DialogList.tsx";
import { WorkspaceRouter } from "./WorkspaceRouter.tsx";

type AppShellProps = {
  children?: preact.ComponentChildren;
};

/** Preact workspace shell — activated via feature flags. */
export function AppShell({ children }: AppShellProps) {
  const flags = useUiFlags();
  useLegacyUiToggle();

  if (!flags.newChatUi && !flags.newSidebar) {
    return <>{children}</>;
  }

  return (
    <div class="tg-app-shell">
      <WorkspaceRouter />
      {flags.newSidebar ? (
        <div class="tg-new-sidebar">
          <NewSidebar />
        </div>
      ) : null}
      {flags.newChatUi ? (
        <div class="tg-new-chat">
          <NewChatShell />
        </div>
      ) : null}
      {children}
    </div>
  );
}
