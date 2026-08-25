export type RealtimeEventHandler = (type: string, payload: Record<string, unknown>) => void;

let handler: RealtimeEventHandler | null = null;

export const setRealtimeEventHandler = (next: RealtimeEventHandler | null) => {
  handler = next;
};

export const dispatchRealtimeEvent = (type: string, payload: Record<string, unknown> = {}) => {
  handler?.(type, payload);
  const bridge = (window as any).__THEGRAPHT_HANDLE_REALTIME_STORE_EVENT__;
  if (typeof bridge === "function") {
    bridge(type, payload);
  }
};

export const connectRealtimeTransport = () => {
  const win = window as any;
  if (typeof win.connectRealtime === "function") {
    win.connectRealtime();
  }
};

export const disconnectRealtimeTransport = () => {
  const win = window as any;
  if (typeof win.disableRealtime === "function") {
    win.disableRealtime();
  }
};
