import { useState } from "preact/hooks";
import { MessageList } from "./MessageList.tsx";
import { Composer } from "./Composer.tsx";
import styles from "./ChatWindow.module.css";
import { useAppStore } from "../../shared/hooks/useStore.ts";
import { ChatHeader } from "../profile/ChatHeader.tsx";
import { ProfilePanel } from "../profile/ProfilePanel.tsx";
import { ConnectionBanner } from "../realtime/ConnectionBanner.tsx";
import { MentionHoverCard } from "../profile/MentionHoverCard.tsx";
import { InChatSearch } from "../profile/InChatSearch.tsx";

export function NewChatShell() {
  const dialog = useAppStore((state) => state.dialogs.current);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  if (!dialog) {
    return (
      <section class={styles.empty}>
        <p>Select a chat to start messaging</p>
      </section>
    );
  }

  return (
    <section class={styles.window}>
      <ConnectionBanner />
      <ChatHeader
        onOpenProfile={() => setProfileOpen(true)}
        onToggleSearch={() => setSearchOpen((value) => !value)}
        searchOpen={searchOpen}
      />
      {searchOpen ? <InChatSearch /> : null}
      <div class={styles.messages}>
        <MessageList />
      </div>
      <Composer />
      {profileOpen ? <ProfilePanel onClose={() => setProfileOpen(false)} /> : null}
      <MentionHoverCard />
    </section>
  );
}
