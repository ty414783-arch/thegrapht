import type { LegacyDialogContextMenuAction } from "./legacyDialogContextMenuSync.ts";

type LegacyDialogContextMenuBodyProps = {
  actions: LegacyDialogContextMenuAction[];
  onAction: (actionKey: string) => void;
};

export function LegacyDialogContextMenuBody({
  actions,
  onAction
}: LegacyDialogContextMenuBodyProps) {
  return (
    <>
      {actions.map((action) => (
        <button
          key={action.key}
          class="dialog-context-menu-item"
          type="button"
          data-action={action.key}
          onClick={() => onAction(action.key)}
        >
          {action.iconHtml ? (
            <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: action.iconHtml }} />
          ) : null}
          <span>{action.label}</span>
        </button>
      ))}
    </>
  );
}
