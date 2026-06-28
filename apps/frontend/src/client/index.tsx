import './services/bootstrap.ts';
import './services/secure.ts';
import './services/format-utils.ts';
import './services/scroll-pagination.ts';
import './services/realtime-connection.ts';
import './services/notifications.ts';
import './services/workspace-state.ts';
import './services/message-actions.ts';
import './services/auth.ts';
import './services/message-rendering.ts';
import './services/ui-controls.ts';
import './services/sidebar.ts';
import { render } from 'preact';

// Defer loading of heavy non-critical services to prevent browser thread freezing on startup
const deferNonCriticalServices = () => {
  void import('./services/search.ts');
  void import('./services/viewer-modal.ts');
  void import('./services/attachment-modal.ts');
  void import('./services/audio-player.ts');
  void import('./services/profile-panel.ts');

  // Calling & WebRTC services
  void import('./services/calls/call-utils.ts');
  void import('./services/calls/call-debug.ts');
  void import('./services/calls/call-webrtc.ts');
  void import('./services/calls/group-call-state.ts');
  void import('./services/calls/call-ui.ts');
  void import('./services/calls/call-signaling.ts');
  void import('./services/calls/livekit-service.ts');
};

if (document.readyState === 'complete') {
  window.setTimeout(deferNonCriticalServices, 200);
} else {
  window.addEventListener('load', () => window.setTimeout(deferNonCriticalServices, 200));
}

function App() {
  return (
    <div style={{ padding: '20px', color: '#fff', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>TheGraphT Messenger (Preact + TS Dev)</h2>
      <p>Hello from the new compiled front-end!</p>
    </div>
  );
}

// Hook into preact-root if it exists
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('preact-root');
  if (root) {
    render(<App />, root);
  }
});
