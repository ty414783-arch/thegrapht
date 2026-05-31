(() => {
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

  bind('btn-minimize', () => window.desktop?.minimize());
  bind('btn-maximize', () => window.desktop?.toggleMaximize());
  bind('btn-close', () => window.desktop?.close());

  const stage = document.getElementById('telemost-grid');
  const chatList = document.getElementById('chat-list');
  const stageTitle = document.getElementById('stage-title');

  const restartAnimation = (node) => {
    if (!node) return;
    node.classList.remove('animate-in');
    void node.offsetWidth;
    node.classList.add('animate-in');
  };

  chatList?.addEventListener('click', (event) => {
    const row = event.target.closest('.chat-row');
    if (!row) return;
    chatList.querySelectorAll('.chat-row').forEach((r) => r.classList.remove('active'));
    row.classList.add('active');
    const title = row.querySelector('.meta b')?.textContent || 'Dialog';
    if (stageTitle) stageTitle.textContent = title;
    restartAnimation(stage);
  });

  window.TheGraphtDesktop = {
    apiBase: 'https://thegrapht.su/api',
    wsBase: 'wss://web.thegrapht.su/ws',
    integrateLegacyClient(legacy) {
      // Hook for existing livekit/webrtc + fetch layer from web client.
      return legacy;
    }
  };
})();
