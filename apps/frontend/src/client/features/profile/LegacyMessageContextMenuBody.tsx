import type { LegacyContextMenuAction } from "./legacyMessageContextMenuSync.ts";

type LegacyMessageContextMenuBodyProps = {
  actions: LegacyContextMenuAction[];
  onAction: (actionKey: string) => void;
};

export function LegacyMessageContextMenuBody({
  actions,
  onAction
}: LegacyMessageContextMenuBodyProps) {
  return (
    <>
      {actions.map((action) => (
        <button
          key={action.key}
          class={"message-context-menu-item" + (action.danger ? " danger" : "")}
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
