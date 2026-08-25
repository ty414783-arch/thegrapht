import { useState } from "preact/hooks";
import styles from "./ComposeMenu.module.css";
import { thgApi } from "../../api/thg-client.ts";
import { openWorkspaceDialog } from "../workspace/workspace-actions.ts";
import { uiActions } from "../../store/index.ts";

export function ComposeMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const createDialog = async (type: "group" | "channel" | "direct", payload: Record<string, unknown> = {}) => {
    setBusy(true);
    try {
      const response = await thgApi.fetchJson<{ dialog?: { publicId?: string } }>("/v1/dialogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...payload })
      });
      const publicId = response?.dialog?.publicId;
      if (publicId) {
        await openWorkspaceDialog(publicId);
      }
      setOpen(false);
    } catch (error) {
      uiActions.showToast(error instanceof Error ? error.message : "Failed to create chat", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class={styles.shell}>
      <button type="button" class={styles.trigger} disabled={busy} onClick={() => setOpen((value) => !value)}>
        New chat
      </button>
      {open ? (
        <div class={styles.menu}>
          <button type="button" disabled={busy} onClick={() => void createDialog("direct")}>Private chat</button>
          <button type="button" disabled={busy} onClick={() => void createDialog("group", { title: "New group" })}>Group</button>
          <button type="button" disabled={busy} onClick={() => void createDialog("channel", { title: "New channel" })}>Channel</button>
        </div>
      ) : null}
    </div>
  );
}
