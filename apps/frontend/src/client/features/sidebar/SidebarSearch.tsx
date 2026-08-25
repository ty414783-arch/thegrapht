import { useState } from "preact/hooks";
import styles from "./SidebarSearch.module.css";
import { thgApi } from "../../api/thg-client.ts";
import { openWorkspaceDialog } from "../workspace/workspace-actions.ts";

type SearchResult = {
  publicId: string;
  title?: string;
  subtitle?: string;
};

export function SidebarSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);

  const runSearch = async (value: string) => {
    const trimmed = value.trim();
    setQuery(value);
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    setBusy(true);
    try {
      const payload = await thgApi.fetchJson<{ results?: SearchResult[] }>(
        `/v1/search?q=${encodeURIComponent(trimmed)}`
      );
      setResults(Array.isArray(payload?.results) ? payload.results : []);
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class={styles.shell}>
      <input
        class={styles.input}
        type="search"
        placeholder="Search users or channels"
        value={query}
        onInput={(event) => void runSearch((event.currentTarget as HTMLInputElement).value)}
      />
      {busy ? <div class={styles.hint}>Searching…</div> : null}
      {results.length ? (
        <div class={styles.results}>
          {results.map((result) => (
            <button
              key={result.publicId}
              type="button"
              class={styles.result}
              onClick={() => void openWorkspaceDialog(result.publicId)}
            >
              <strong>{result.title || result.publicId}</strong>
              {result.subtitle ? <span>{result.subtitle}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
