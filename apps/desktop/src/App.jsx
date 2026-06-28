import React, { useState, useEffect, useRef, useCallback } from 'react';
import Titlebar from './components/Titlebar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import { authApi, chatApi, tokenApi } from './lib/api.js';
import { createRealtimeClient } from './lib/realtime.js';
import { ripple } from './lib/utils.jsx';

/* ===================== TYPEWRITER HOOK ===================== */

function useTypewriter(words, speed = 150, delay = 2000) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const activeWord = words[currentWordIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(prev => prev.slice(0, -1));
      }, speed / 2);
    } else {
      timer = setTimeout(() => {
        setCurrentText(prev => activeWord.slice(0, prev.length + 1));
      }, speed);
    }

    if (!isDeleting && currentText === activeWord) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex(prev => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, speed, delay]);

  return currentText;
}

/* ===================== AUTH COMPONENT ===================== */

export default function App() {
  const [authStage, setAuthStage] = useState('loading'); // loading | welcome | login | register | verify | app
  const [verifyEmail, setVerifyEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [dialogs, setDialogs] = useState([]);
  const [activeDialogId, setActiveDialogId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wsStatus, setWsStatus] = useState('connecting');
  const [bannerState, setBannerState] = useState('hidden'); // hidden | offline | connected
  const [updateState, setUpdateState] = useState({ status: 'idle', progress: 0, version: '' });
  const prevWsRef = useRef('connecting');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const wsRef = useRef(null);
  const pollRef = useRef(null);

  // Typewriter effect
  const words = ["messenger", "platform", "workspace", "community"];
  const typingWord = useTypewriter(words, 120, 2500);

  /* ---------- Start WS immediately on mount for continuous status tracking ---------- */
  useEffect(() => {
    startWebSocket();
    return () => {
      wsRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!window.tgDesktop) return;
    const handleUpdateState = (nextState) => {
      setUpdateState(prev => ({ ...prev, ...(nextState || {}) }));
    };
    const handleUpdateProgress = (progress) => {
      setUpdateState(prev => ({ ...prev, status: 'downloading', progress: Number(progress || 0) }));
    };
    const handleUpdateError = (message) => {
      setUpdateState(prev => ({ ...prev, status: 'error', message: String(message || 'Update failed.') }));
    };
    const handleUpdateCancelled = () => {
      setUpdateState(prev => ({ ...prev, status: 'available', progress: 0 }));
    };
    window.tgDesktop.onUpdateState?.(handleUpdateState);
    window.tgDesktop.onUpdateProgress?.(handleUpdateProgress);
    window.tgDesktop.onUpdateError?.(handleUpdateError);
    window.tgDesktop.onUpdateCancelled?.(handleUpdateCancelled);
    return undefined;
  }, []);

  useEffect(() => {
    const blockRefresh = (event) => {
      const key = String(event.key || '').toLowerCase();
      if (key === 'f5' || ((event.ctrlKey || event.metaKey) && key === 'r') || ((event.ctrlKey || event.metaKey) && key === 'f5')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('keydown', blockRefresh, true);
    return () => window.removeEventListener('keydown', blockRefresh, true);
  }, []);

  /* ---------- Connection banner state machine ---------- */
  useEffect(() => {
    const prev = prevWsRef.current;
    prevWsRef.current = wsStatus;
    if (wsStatus === 'open') {
      if (prev !== 'open' && prev !== 'connecting') {
        // Was offline, now reconnected → show green banner briefly
        setBannerState('connected');
        const timer = setTimeout(() => setBannerState('hidden'), 2500);
        return () => clearTimeout(timer);
      } else {
        setBannerState('hidden');
      }
    } else {
      setBannerState('offline');
    }
  }, [wsStatus]);

  /* ---------- Init: check session ---------- */
  useEffect(() => {
    const token = tokenApi.get();
    if (!token) { setAuthStage('welcome'); return; }
    chatApi.getClientState()
      .then(res => {
        setCurrentUser(res?.current_user || null);
        setDialogs(normalizeDialogs(res?.dialogs || []));
        setAuthStage('app');
      })
      .catch((err) => {
        // If it's a network/offline error (status 0), do not boot to welcome.
        // Instead, stay in 'app' stage to let the user see their cached main workspace.
        if (err?.status === 0 || err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('fetch')) {
          setAuthStage('app');
        } else {
          setAuthStage('welcome');
        }
      });
  }, []);

  /* ---------- WebSocket and Polling initialization when in 'app' stage ---------- */
  useEffect(() => {
    if (authStage === 'app') {
      startPolling();
      startWebSocket(); // Reconnect WebSocket with the newly obtained token!
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [authStage]);

  const startWebSocket = () => {
    wsRef.current?.disconnect();
    wsRef.current = createRealtimeClient(
      (event) => handleWsEvent(event),
      (state) => setWsStatus(state?.status || '')
    );
  };

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => refreshDialogs(), 8000);
  };

  const refreshDialogs = useCallback(async () => {
    try {
      const res = await chatApi.getClientState();
      if (res?.dialogs) setDialogs(normalizeDialogs(res.dialogs));
      if (res?.current_user) setCurrentUser(res.current_user);
    } catch {/* ignore */}
  }, []);

  const handleWsEvent = useCallback((event) => {
    if (!event?.type) return;
    if (event.type === 'new_message') {
      // Update dialog list
      setDialogs(prev => {
        const idx = prev.findIndex(d => d.public_id === event.dialog_id || d.id === event.dialog_id);
        if (idx === -1) { refreshDialogs(); return prev; }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMsg: event.message, unreadCount: (updated[idx].unreadCount || 0) + 1 };
        // Move to top
        const item = updated.splice(idx, 1)[0];
        return [item, ...updated];
      });
      // Append to open chat
      setActiveDialogId(id => {
        if (id === event.dialog_id) {
          setMessages(prev => [...prev, event.message]);
          chatApi.markRead(event.dialog_id).catch(() => {});
        }
        return id;
      });
    } else if (event.type === 'dialogs_update') {
      refreshDialogs();
    }
  }, [refreshDialogs]);

  /* ---------- Select dialog ---------- */
  const selectDialog = useCallback(async (dialog) => {
    const id = dialog.public_id || dialog.id;
    setActiveDialogId(id);
    setMessages([]);
    setMessagesLoading(true);
    try {
      const res = await chatApi.getDialogMessages(id);
      setMessages(res?.messages || res || []);
      await chatApi.markRead(id).catch(() => {});
      setDialogs(prev => prev.map(d => ((d.public_id || d.id) === id) ? { ...d, unreadCount: 0 } : d));
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  /* ---------- Send message ---------- */
  const sendMessage = useCallback(async (body) => {
    if (!activeDialogId || !body.trim()) return;
    const tmpMsg = {
      id: `tmp-${Date.now()}`,
      text: body,
      body,
      is_out: true,
      sender_id: currentUser?.id,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tmpMsg]);
    try {
      const res = await chatApi.sendMessage(activeDialogId, body);
      const serverMsg = res?.message || res;
      setMessages(prev => prev.map(m => m.id === tmpMsg.id ? (serverMsg || m) : m));
      refreshDialogs();
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tmpMsg.id));
    }
  }, [activeDialogId, currentUser, refreshDialogs]);

  /* ---------- Logout ---------- */
  const logout = async () => {
    wsRef.current?.disconnect();
    if (pollRef.current) clearInterval(pollRef.current);
    tokenApi.clear();
    try { await authApi.logout(); } catch {/* ignore */}
    setDialogs([]); setMessages([]); setActiveDialogId(null); setCurrentUser(null);
    setAuthStage('welcome');
    setAuthError('');
  };

  /* ---------- Auth Actions ---------- */

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    if (!loginEmail || !loginPassword) { setAuthError('Enter email and password.'); return; }
    setLoading(true); setAuthError('');
    try {
      const payload = await authApi.login(loginEmail, loginPassword);
      if (payload?.status === 'verification_required') {
        setVerifyEmail(loginEmail);
        setAuthStage('verify');
      } else {
        // Fallback or direct login if token is somehow returned directly
        const res = await chatApi.getClientState();
        setCurrentUser(res?.current_user || null);
        setDialogs(normalizeDialogs(res?.dialogs || []));
        setAuthStage('app');
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();
    if (!regName || !regEmail || !regPassword) { setAuthError('Please fill in all fields.'); return; }
    if (regPassword.length < 6) { setAuthError('Password must be at least 6 characters.'); return; }
    setLoading(true); setAuthError('');
    try {
      await authApi.register(regName, regEmail, regPassword);
      setVerifyEmail(regEmail);
      setAuthStage('verify');
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e?.preventDefault();
    if (verifyCode.length < 6) { setAuthError('Enter the full 6-digit verification code.'); return; }
    setLoading(true); setAuthError('');
    try {
      await authApi.verify(verifyEmail, verifyCode);
      const res = await chatApi.getClientState();
      setCurrentUser(res?.current_user || null);
      setDialogs(normalizeDialogs(res?.dialogs || []));
      setAuthStage('app');
    } catch (err) {
      setAuthError(err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true); setAuthError('');
    try {
      await authApi.resend(verifyEmail);
    } catch (err) {
      setAuthError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Filter dialogs ---------- */
  const filteredDialogs = searchQuery.trim()
    ? dialogs.filter(d => {
        const n = (d.peer?.name || d.peer?.title || '').toLowerCase();
        return n.includes(searchQuery.toLowerCase());
      })
    : dialogs;

  const activeDialog = dialogs.find(d => (d.public_id || d.id) === activeDialogId) || null;

  /* ---------- Renders ---------- */

  if (authStage === 'loading') {
    return (
      <div className="app-root">
        <Titlebar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#171b22' }}>
          <div className="search-spinner" />
        </div>
      </div>
    );
  }

  if (authStage !== 'app') {
    return (
      <div className="app-root">
        <Titlebar />
        {bannerState !== 'hidden' && (
          <div className={`connection-status-banner ${bannerState === 'connected' ? 'banner-connected' : 'banner-offline'}`}>
            {bannerState === 'offline' && (
              <>
                <div className="search-spinner" style={{ width: 14, height: 14, borderWidth: '2px', borderTopColor: '#fff', animation: 'spin 1s linear infinite', marginRight: 8 }} />
                <span>Connecting to server...</span>
              </>
            )}
            {bannerState === 'connected' && (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}><path d="M3 8.5L6.5 12L13 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Connected</span>
              </>
            )}
          </div>
        )}
        <main id="page-root" className={`page fonts-loaded ui-legacy-chat-island ui-system-font ui-full-bleed-shell${wsStatus !== 'open' ? ' is-offline' : ''}`}>
          <section id="auth-view" className="view">
            <div className="auth-shell">
              {/* BRAND PANEL */}
              <article className="panel brand-panel">
                <div className="brand-stack">
                  <div className="logo-mark">
                    <img className="logo-image" src="https://web.thegrapht.su/assets/logo.jpg" alt="TheGraphT logo" />
                  </div>
                  <p className="overline">Thegrapht Messenger</p>
                  <div className="brand-chip">Thegrapht</div>
                  <h1 className="brand-title">
                    Your new<br />
                    <span className="brand-title-dynamic-line">
                      <span className="brand-title-dynamic-placeholder">messenger</span>
                      <span className="brand-title-dynamic-wrap">
                        <span id="brand-title-dynamic" className="brand-title-dynamic">{typingWord}</span>
                        <span id="brand-title-cursor" className="brand-title-cursor" aria-hidden="true" />
                      </span>
                    </span>
                  </h1>
                </div>
              </article>

              {/* FORM PANEL */}
              <article className="panel auth-panel">
                <div className="auth-card">

                  {authStage === 'welcome' && (
                    <div className="auth-inner">
                      <div className="auth-copy-block">
                        <p className="auth-kicker">Welcome</p>
                        <h2 className="auth-title">TheGraphT</h2>
                        <p className="auth-copy">Fast and highly secure web and desktop messenger. Connect securely with anyone, anywhere.</p>
                      </div>
                      <button className="submit" style={{ marginBottom: 12 }} type="button" onClick={() => setAuthStage('login')}>
                        Sign In
                      </button>
                      <div className="meta-row">
                        <span>New here?</span>
                        <button type="button" onClick={() => setAuthStage('register')}>Create account</button>
                      </div>
                    </div>
                  )}

                  {authStage === 'login' && (
                    <div className="auth-inner">
                      <div className="auth-copy-block">
                        <p className="auth-kicker">Sign in</p>
                        <h2 className="auth-title">Log In</h2>
                        <p className="auth-copy">Enter your email and password to continue to Thegrapht.</p>
                      </div>
                      <form onSubmit={handleLoginSubmit} noValidate>
                        <div className="field">
                          <label htmlFor="email">Email</label>
                          <input id="email" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} disabled={loading} required />
                        </div>
                        <div className="field">
                          <label htmlFor="password">Password</label>
                          <input id="password" type="password" placeholder="••••••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} disabled={loading} required />
                        </div>
                        {authError && <div className="status" style={{ background: 'rgba(232, 17, 35, 0.12)', color: '#f85149', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px', marginBottom: '16px', fontWeight: '500' }}>{authError}</div>}
                        <button className="submit" type="submit" disabled={loading}>
                          {loading ? 'Logging in…' : 'Log In'}
                        </button>
                      </form>
                      <div className="meta-row">
                        <span>No account?</span>
                        <button type="button" onClick={() => setAuthStage('register')}>Create account</button>
                      </div>
                    </div>
                  )}

                  {authStage === 'register' && (
                    <div className="auth-inner">
                      <div className="auth-copy-block">
                        <p className="auth-kicker">Welcome</p>
                        <h2 className="auth-title">Sign Up</h2>
                        <p className="auth-copy">Create a secure monorepo account to begin chatting.</p>
                      </div>
                      <form onSubmit={handleRegisterSubmit} noValidate>
                        <div className="field">
                          <label htmlFor="name">Name</label>
                          <input id="name" type="text" placeholder="galyachupachups" value={regName} onChange={e => setRegName(e.target.value)} disabled={loading} required />
                        </div>
                        <div className="field">
                          <label htmlFor="reg-email">Email</label>
                          <input id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} disabled={loading} required />
                        </div>
                        <div className="field">
                          <label htmlFor="reg-password">Password</label>
                          <input id="reg-password" type="password" placeholder="••••••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} disabled={loading} required />
                        </div>
                        {authError && <div className="status" style={{ background: 'rgba(232, 17, 35, 0.12)', color: '#f85149', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px', marginBottom: '16px', fontWeight: '500' }}>{authError}</div>}
                        <button className="submit" type="submit" disabled={loading}>
                          {loading ? 'Creating…' : 'Create Account'}
                        </button>
                      </form>
                      <div className="meta-row">
                        <span>Have an account?</span>
                        <button type="button" onClick={() => setAuthStage('login')}>Log In</button>
                      </div>
                    </div>
                  )}

                  {authStage === 'verify' && (
                    <div className="auth-inner">
                      <div className="auth-copy-block">
                        <p className="auth-kicker">Security Code</p>
                        <h2 className="auth-title">Verify Email</h2>
                        <p className="auth-copy">To get your 6-digit verification code, please open our <a href="https://t.me/thegrapht_verification_bot" target="_blank" rel="noopener noreferrer" style={{ color: '#8774e1', textDecoration: 'underline', fontWeight: '500' }}>Telegram Bot</a> and send your email <strong>{verifyEmail}</strong> to it.</p>
                      </div>
                      <form onSubmit={handleVerifySubmit} noValidate>
                        <div className="field">
                          <label htmlFor="verify-code">Verification Code</label>
                          <input id="verify-code" type="text" maxLength="6" placeholder="000000" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))} disabled={loading} required />
                        </div>
                        {authError && <div className="status" style={{ background: 'rgba(232, 17, 35, 0.12)', color: '#f85149', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px', marginBottom: '16px', fontWeight: '500' }}>{authError}</div>}
                        <button className="submit" type="submit" disabled={loading}>
                          {loading ? 'Verifying…' : 'Verify'}
                        </button>
                      </form>
                      <div className="resend-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px', gap: '8px' }}>
                        <button className="resend-btn" style={{ background: 'none', border: 0, color: '#8774e1', fontSize: '13.5px', cursor: 'pointer', textDecoration: 'underline' }} type="button" onClick={handleResendCode} disabled={loading}>
                          Resend Code
                        </button>
                        <button className="resend-btn" style={{ background: 'none', border: 0, color: 'rgba(255, 255, 255, 0.4)', fontSize: '13.5px', cursor: 'pointer', marginTop: '4px' }} type="button" onClick={() => setAuthStage('welcome')}>
                          Back to login
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Titlebar />
      {bannerState !== 'hidden' && (
        <div className={`connection-status-banner ${bannerState === 'connected' ? 'banner-connected' : 'banner-offline'}`}>
          {bannerState === 'offline' && (
            <>
              <div className="search-spinner" style={{ width: 14, height: 14, borderWidth: '2px', borderTopColor: '#fff', animation: 'spin 1s linear infinite', marginRight: 8 }} />
              <span>Connecting to server...</span>
            </>
          )}
          {bannerState === 'connected' && (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}><path d="M3 8.5L6.5 12L13 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Connected</span>
            </>
          )}
        </div>
      )}
      <main id="page-root" className={`page fonts-loaded workspace-mode ui-legacy-chat-island ui-system-font ui-full-bleed-shell`}>
        <section id="workspace-view" className="view">
          <div className={`workspace-shell${wsStatus !== 'open' ? ' is-offline' : ''}`}>
            <Sidebar
              dialogs={filteredDialogs}
              activeDialogId={activeDialogId}
              onSelectDialog={selectDialog}
              currentUser={currentUser}
              onLogout={logout}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              updateState={updateState}
              onUpdateClick={() => window.tgDesktop?.window?.updateApp?.()}
              onCancelUpdate={() => window.tgDesktop?.window?.cancelUpdate?.()}
            />
            {activeDialog ? (
              <ChatWindow
                dialog={activeDialog}
                messages={messages}
                myUserId={currentUser?.id}
                wsStatus={wsStatus}
                onSendMessage={sendMessage}
                messagesLoading={messagesLoading}
              />
            ) : (
              <div className="workspace-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#171b22' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'rgba(255,255,255,0.2)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '64px' }}>chat_bubble</span>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>Select a chat</div>
                  <div style={{ fontSize: '13px' }}>Choose a conversation from the sidebar to start messaging</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- Helpers ---------- */
function normalizeDialogs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(d => {
    const peerObj = d.peer || d.with_user || d.group || {};
    return {
      ...d,
      public_id: d.public_id || d.id,
      peer: {
        ...peerObj,
        name: peerObj.name || peerObj.title || d.title || 'Unknown',
        title: peerObj.title || peerObj.name || d.title || 'Unknown',
        photo_url: peerObj.photo_url || d.avatarUrl || null,
        public_id: peerObj.public_id || peerObj.id || d.peerUserId || d.publicId || d.id || '',
        id: peerObj.id || peerObj.public_id || d.peerUserId || d.id || ''
      },
      lastMsg: d.lastMsg || d.last_message || (d.lastMessagePreview ? {
        text: d.lastMessagePreview,
        created_at: d.lastMessageCreatedAt,
        sender_id: d.peerUserId
      } : null),
      unreadCount: d.unreadCount || d.unread_count || 0
    };
  }).sort((a, b) => {
    const ta = a.lastMsg?.created_at ? new Date(a.lastMsg.created_at).getTime() : 0;
    const tb = b.lastMsg?.created_at ? new Date(b.lastMsg.created_at).getTime() : 0;
    return tb - ta;
  });
}
