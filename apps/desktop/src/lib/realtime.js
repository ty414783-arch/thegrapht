import { WS_BASE } from './api';

const getStoredToken = () => {
  try {
    return String(window.localStorage.getItem('tg_desktop_session_token') || '').trim();
  } catch {
    return '';
  }
};

const resolveWsUrl = () => {
  const token = getStoredToken();
  const suffix = token ? `?token=${encodeURIComponent(token)}` : '';

  try {
    const explicit = String(WS_BASE || '').trim();
    if (explicit) {
      const parsed = new URL(explicit, window.location.href);
      if (parsed.protocol === 'http:') parsed.protocol = 'ws:';
      if (parsed.protocol === 'https:') parsed.protocol = 'wss:';
      parsed.pathname = '/ws';
      return `${parsed.toString()}${suffix}`;
    }
  } catch {
    // fallback below
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws${suffix}`;
};

export function createRealtimeClient(onEvent, onStateChange) {
  let socket = null;
  let reconnectTimer = null;
  let destroyed = false;
  let reconnectDelay = 1200;

  const notifyState = (state) => {
    if (typeof onStateChange === 'function') {
      onStateChange(state);
    }
  };

  const connect = () => {
    if (destroyed) return;
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = resolveWsUrl();
    notifyState({ status: 'connecting', url: wsUrl });

    socket = new WebSocket(wsUrl);

    socket.addEventListener('open', () => {
      reconnectDelay = 1200;
      notifyState({ status: 'open' });
    });

    socket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === 'ping') {
          try {
            socket?.send(JSON.stringify({ type: 'pong' }));
          } catch {
            // ignore
          }
          return;
        }
        if (typeof onEvent === 'function') {
          onEvent(payload);
        }
      } catch {
        // ignore broken event payloads
      }
    });

    socket.addEventListener('close', (event) => {
      notifyState({ status: 'closed', code: event.code, reason: event.reason || '' });
      socket = null;
      if (destroyed) return;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      reconnectTimer = window.setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(5000, reconnectDelay + 350);
    });

    socket.addEventListener('error', () => {
      notifyState({ status: 'error' });
    });
  };

  connect();

  return {
    send(payload) {
      if (!socket || socket.readyState !== WebSocket.OPEN) return false;
      socket.send(JSON.stringify(payload));
      return true;
    },

    disconnect() {
      destroyed = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (socket) {
        socket.close();
        socket = null;
      }
    }
  };
}
