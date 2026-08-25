import { useState } from "preact/hooks";
import styles from "./InChatSearch.module.css";
import { thgApi } from "../../api/thg-client.ts";
import { useAppStore } from "../../shared/hooks/useStore.ts";

export function InChatSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; body?: string }>>([]);
  const dialog = useAppStore((state) => state.dialogs.current);

  const search = async (value: string) => {
    setQuery(value);
    if (!dialog?.publicId || value.trim().length < 2) {
      setResults([]);
      return;
    }
    const payload = await thgApi.fetchJson<{ messages?: Array<{ id: string; body?: string }> }>(
      `/v1/dialogs/by-public-id/${encodeURIComponent(dialog.publicId)}/messages/search?q=${encodeURIComponent(value.trim())}`
    );
    setResults(Array.isArray(payload.messages) ? payload.messages : []);
  };

  return (
    <div class={styles.shell}>
      <input class={styles.input} placeholder="Search in chat" value={query} onInput={(event) => void search((event.currentTarget as HTMLInputElement).value)} />
      {results.map((message) => (
        <button
          key={message.id}
          type="button"
          class={styles.result}
          onClick={() => document.getElementById(`message-${message.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
        >
          {message.body}
        </button>
      ))}
    </div>
  );
}

export default InChatSearch;
