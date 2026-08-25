import { useEffect, useState } from "preact/hooks";
import styles from "./ConnectionBanner.module.css";
import type { ConnectionState } from "../../services/connection-status.ts";

const mapConnectionState = (state: ConnectionState): "online" | "offline" | "reconnecting" => {
  if (state === "connected") return "online";
  if (state === "reconnecting" || state === "syncing" || state === "weak_signal") return "reconnecting";
  return "offline";
};

export function ConnectionBanner() {
  const [status, setStatus] = useState<"online" | "offline" | "reconnecting">("online");

  useEffect(() => {
    const manager = (window as any).connectionStatusManager;
    if (!manager?.subscribe) return;
    return manager.subscribe((next: ConnectionState) => {
      setStatus(mapConnectionState(next));
    });
  }, []);

  if (status === "online") return null;

  return (
    <div class={styles.banner} role="status">
      {status === "offline"
        ? "You are offline. Messages will sync when connection returns."
        : "Reconnecting…"}
    </div>
  );
}
