import { useEffect, useState } from "preact/hooks";
import { loadCallFeatures } from "./index.ts";
import styles from "./CallShell.module.css";

export function CallMiniCard() {
  const [activeCall, setActiveCall] = useState<any>(null);

  useEffect(() => {
    void loadCallFeatures();
    const timer = window.setInterval(() => {
      setActiveCall((window as any).__THEGRAPHT_ACTIVE_CALL__ || null);
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  if (!activeCall) return null;

  return (
    <div class={styles.miniCard}>
      <strong>{activeCall.title || "Call"}</strong>
      <span>{activeCall.state || "active"}</span>
    </div>
  );
}

export function CallModalHost() {
  useEffect(() => {
    void loadCallFeatures();
  }, []);
  return <div id="tg-preact-call-host" class={styles.modalHost} />;
}

export function GroupCallGrid() {
  useEffect(() => {
    void loadCallFeatures();
  }, []);
  return <div id="tg-preact-group-call-grid" class={styles.groupGrid} />;
}
