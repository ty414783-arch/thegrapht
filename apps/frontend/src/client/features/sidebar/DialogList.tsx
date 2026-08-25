import styles from "./DialogList.module.css";
import { useAppStore } from "../../shared/hooks/useStore.ts";
import { openWorkspaceDialog } from "../workspace/workspace-actions.ts";
import { DialogItem } from "./DialogItem.tsx";
import { SidebarSearch } from "./SidebarSearch.tsx";
import { SidebarEmpty } from "./SidebarEmpty.tsx";
import { ComposeMenu } from "./ComposeMenu.tsx";

export function NewSidebar() {
  const dialogs = useAppStore((state) => state.dialogs.all);
  const currentPublicId = useAppStore((state) => state.dialogs.currentPublicId);
  const typingByDialog = useAppStore((state) => state.presence.typingByDialog);

  return (
    <aside class={styles.sidebar}>
      <ComposeMenu />
      <SidebarSearch />
      <div class={styles.list}>
        {!dialogs.length ? <SidebarEmpty /> : null}
        {dialogs.map((dialog) => {
          const typing = typingByDialog[dialog.id] || [];
          const typingLabel = typing.length ? "typing…" : "";
          return (
            <DialogItem
              key={dialog.id}
              dialog={dialog}
              isActive={dialog.publicId === currentPublicId}
              typingLabel={typingLabel}
              onOpen={() => void openWorkspaceDialog(dialog.publicId)}
            />
          );
        })}
      </div>
    </aside>
  );
}
