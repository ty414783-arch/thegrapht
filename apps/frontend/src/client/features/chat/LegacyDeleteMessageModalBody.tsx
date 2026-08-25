import type { LegacyDeleteMessageModalState } from "./legacyDeleteMessageModalSync.ts";

type LegacyDeleteMessageModalBodyProps = LegacyDeleteMessageModalState & {
  onCancel: () => void;
  onConfirm: () => void;
  onDeleteForEveryoneChange: (checked: boolean) => void;
};

export function LegacyDeleteMessageModalBody({
  canDeleteForEveryone,
  deleteForEveryoneChecked,
  onCancel,
  onConfirm,
  onDeleteForEveryoneChange
}: LegacyDeleteMessageModalBodyProps) {
  return (
    <>
      <h2 class="delete-message-title">Delete message</h2>
      <p class="delete-message-copy">Are you sure you want to delete this message?</p>
      <label
        id="delete-message-for-everyone-wrap"
        class="delete-message-checkbox"
        hidden={!canDeleteForEveryone}
        style={canDeleteForEveryone ? undefined : { display: "none" }}
      >
        <input
          id="delete-message-for-everyone"
          type="checkbox"
          checked={deleteForEveryoneChecked}
          disabled={!canDeleteForEveryone}
          onChange={(event) => onDeleteForEveryoneChange((event.currentTarget as HTMLInputElement).checked)}
        />
        <span id="delete-message-for-everyone-label">Also delete for everyone</span>
      </label>
      <div class="delete-message-actions">
        <button
          id="delete-message-cancel"
          class="delete-message-button"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          id="delete-message-confirm"
          class="delete-message-button danger"
          type="button"
          onClick={onConfirm}
        >
          Delete
        </button>
      </div>
    </>
  );
}
