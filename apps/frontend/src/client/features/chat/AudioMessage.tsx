import { useRef } from "preact/hooks";
import styles from "./AudioMessage.module.css";
import type { Message } from "../../store/types.ts";

type AudioMessageProps = {
  message: Message;
};

export function AudioMessage({ message }: AudioMessageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const url = String(message.mediaUrl || "");

  return (
    <div class={styles.shell}>
      <button
        type="button"
        class={styles.play}
        onClick={() => {
          const node = audioRef.current;
          if (!node) return;
          if (node.paused) void node.play();
          else node.pause();
        }}
      >
        Play
      </button>
      <span class={styles.label}>{message.body || "Voice message"}</span>
      {url ? <audio ref={audioRef} src={url} preload="metadata" /> : null}
    </div>
  );
}
