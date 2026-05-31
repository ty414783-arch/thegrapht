import React from 'react';
import { Avatar, formatTime, ripple } from '../lib/utils.jsx';

function DialogItem({ dialog, isActive, onClick }) {
  const { peer, lastMsg, unreadCount } = dialog;
  const name = peer?.name || peer?.title || 'Unknown';
  const avatarSrc = peer?.photo_url || null;
  const avatarId = peer?.public_id || peer?.id || '';
  const preview = lastMsg?.text || (lastMsg ? '📎 Attachment' : 'No messages yet');
  const time = formatTime(lastMsg?.created_at);

  return (
    <button
      className={`dialog-item${isActive ? ' active' : ''}`}
      onClick={(e) => { ripple(e); onClick(dialog); }}
      type="button"
      title={name}
      aria-label={`Chat with ${name}`}
      aria-pressed={isActive}
    >
      <div className="dialog-avatar">
        <Avatar src={avatarSrc} name={name} id={avatarId} size={50} />
      </div>
      <div className="dialog-body">
        <div className="dialog-line">
          <span className="dialog-name">{name}</span>
          {time && <span className="dialog-time">{time}</span>}
        </div>
        <div className="dialog-preview-row">
          <span className="dialog-preview-copy">{preview}</span>
          {unreadCount > 0 && (
            <span className="dialog-unread-badge" aria-label={`${unreadCount} unread messages`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function Sidebar({ dialogs = [], activeDialogId, onSelectDialog, currentUser, onLogout, searchQuery, onSearchChange }) {
  return (
    <aside className="workspace-sidebar" aria-label="Chats sidebar">
      {/* Brand Header */}
      <div className="workspace-brand">
        <div className="workspace-brand-leading">
          <button id="sidebar-menu-button" className="workspace-brand-menu" type="button" aria-label="Sidebar menu" onClick={ripple}>
            <span className="material-symbols-rounded" aria-hidden="true">menu</span>
          </button>
          <h1>TheGrapht</h1>
        </div>
        <button id="sidebar-compose-fab" className="workspace-brand-menu" type="button" aria-label="Open compose menu" onClick={ripple}>
          <span className="material-symbols-rounded" aria-hidden="true">edit</span>
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <input
          id="sidebar-search"
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          aria-label="Search chats"
          autoComplete="off"
        />
      </div>

      {/* Dialog list */}
      <div id="dialog-list" className="dialog-list" role="list" aria-label="Chat list">
        {dialogs.length === 0 ? (
          <div className="dialog-list-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', gap: '8px', color: 'rgba(255,255,255,0.35)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>forum</span>
            <span style={{ fontSize: '13px' }}>No chats yet</span>
          </div>
        ) : (
          dialogs.map(d => (
            <DialogItem
              key={d.public_id || d.id}
              dialog={d}
              isActive={(d.public_id || d.id) === activeDialogId}
              onClick={onSelectDialog}
            />
          ))
        )}
      </div>

      {/* Footer / Account card */}
      {currentUser && (
        <div className="workspace-account">
          <div className="workspace-account-copy">
            <span className="workspace-account-label">Account</span>
            <strong id="workspace-user-name" className="workspace-account-name">{currentUser.name}</strong>
          </div>
          <button
            id="logout-button"
            className="workspace-account-logout"
            type="button"
            onClick={(e) => { ripple(e); onLogout(); }}
          >
            Log out
          </button>
        </div>
      )}
    </aside>
  );
}
