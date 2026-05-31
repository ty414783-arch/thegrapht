import React from 'react';
import { ripple } from '../lib/utils.jsx';

const isDesktop = typeof window !== 'undefined' && (window.tgDesktop || window.__TAURI_INTERNALS__);

export default function Titlebar() {
  if (!isDesktop) return null;

  const minimize = (e) => {
    ripple(e);
    if (window.tgDesktop?.window?.minimize) {
      window.tgDesktop.window.minimize();
    } else if (window.__TAURI_INTERNALS__) {
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        getCurrentWindow().minimize();
      }).catch(err => console.error('Failed to minimize window:', err));
    }
  };

  const maximize = (e) => {
    ripple(e);
    if (window.tgDesktop?.window?.maximize) {
      window.tgDesktop.window.maximize();
    } else if (window.__TAURI_INTERNALS__) {
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        getCurrentWindow().toggleMaximize();
      }).catch(err => console.error('Failed to maximize window:', err));
    }
  };

  const close = (e) => {
    ripple(e);
    if (window.tgDesktop?.window?.close) {
      window.tgDesktop.window.close();
    } else if (window.__TAURI_INTERNALS__) {
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        getCurrentWindow().close();
      }).catch(err => console.error('Failed to close window:', err));
    }
  };

  return (
    <div className="native-titlebar" role="toolbar" aria-label="Window controls" data-tauri-drag-region="true">
      <div className="titlebar-drag-zone" data-tauri-drag-region="true" />
      <div className="titlebar-controls">
        <button className="titlebar-btn" title="Minimize" onClick={minimize} aria-label="Minimize">
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1" rx="0.5"/></svg>
        </button>
        <button className="titlebar-btn" title="Maximize" onClick={maximize} aria-label="Maximize">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" rx="1"/>
          </svg>
        </button>
        <button className="titlebar-btn close" title="Close" onClick={close} aria-label="Close">
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <line x1="1" y1="1" x2="9" y2="9"/>
            <line x1="9" y1="1" x2="1" y2="9"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
