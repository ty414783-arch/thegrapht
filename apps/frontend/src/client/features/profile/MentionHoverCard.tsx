import { useEffect, useState } from "preact/hooks";
import styles from "./MentionHoverCard.module.css";
import { openWorkspaceDialog } from "../workspace/workspace-actions.ts";
import { fetchUserDataByUsername } from "../../services/mentions.ts";

type MentionUser = {
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  publicId?: string;
};

export function MentionHoverCard() {
  const [user, setUser] = useState<MentionUser | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onHover = async (event: Event) => {
      const custom = event as CustomEvent<{ username?: string; rect?: DOMRect }>;
      const username = custom.detail?.username;
      if (!username) return;
      const fetchUser = fetchUserDataByUsername;
      const data = await fetchUser(username);
      if (!data) return;
      const rect = custom.detail?.rect;
      setUser(data);
      setAnchor(rect ? { x: rect.left, y: rect.bottom + 6 } : { x: 16, y: 16 });
    };

    const onClear = () => {
      setUser(null);
      setAnchor(null);
    };

    window.addEventListener("thegrapht:mention-hover", onHover as EventListener);
    window.addEventListener("thegrapht:mention-clear", onClear);
    return () => {
      window.removeEventListener("thegrapht:mention-hover", onHover as EventListener);
      window.removeEventListener("thegrapht:mention-clear", onClear);
    };
  }, []);

  if (!user || !anchor) return null;

  return (
    <div class={styles.card} style={{ top: `${anchor.y}px`, left: `${anchor.x}px` }}>
      <strong>{user.displayName || user.username}</strong>
      {user.username ? <span>@{user.username}</span> : null}
      {user.publicId ? (
        <button type="button" onClick={() => void openWorkspaceDialog(user.publicId!)}>
          Open chat
        </button>
      ) : null}
    </div>
  );
}

export const dispatchMentionHover = (username: string, target: HTMLElement) => {
  const rect = target.getBoundingClientRect();
  window.dispatchEvent(new CustomEvent("thegrapht:mention-hover", {
    detail: { username, rect }
  }));
};

export const dispatchMentionClear = () => {
  window.dispatchEvent(new Event("thegrapht:mention-clear"));
};
