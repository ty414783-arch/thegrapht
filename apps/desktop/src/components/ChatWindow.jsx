import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, formatDateLabel, ripple } from '../lib/utils.jsx';

const EMOJIS = ['😀','😂','🥰','😍','🤔','😅','😭','🥺','😎','🤩','👍','👎','❤️','🔥','💯','🎉','😮','😡','💀','🙏','✨','🤣','😊','😢','😤','🫡'];

function SendIcon() {
  return (
    <svg className="composer-send-icon send" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ transform: 'translateX(1px)' }}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  );
}

function MessageBubble({ msg, myUserId, isGroup, senderName, senderAvatar, senderPublicId, showAvatar }) {
  const isMe = msg.sender_id === myUserId || msg.is_out;
  const timeStr = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const singleCheckIcon = (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5.1 10.5 2.4 2.4 5-5.8"></path>
    </svg>
  );

  const doubleChecksIcon = (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m3.8 10.6 2.3 2.3 4.4-5.1"></path>
      <path d="m8.7 10.6 2.3 2.3 4.4-5.1"></path>
    </svg>
  );

  if (isGroup && !isMe) {
    return (
      <div className="group-incoming-row" role="listitem">
        <div className="group-incoming-avatar" style={{ opacity: showAvatar ? 1 : 0, width: 32, height: 32 }}>
          {showAvatar && <Avatar src={senderAvatar} name={senderName} id={senderPublicId} size={32} />}
        </div>
        <div className="group-incoming-main" style={{ display: 'flex', flexDirection: 'column' }}>
          {senderName && showAvatar && (
            <div className="group-incoming-sender" style={{ fontSize: '13px', fontWeight: '800', color: '#8774e1', marginBottom: '3px' }}>{senderName}</div>
          )}
          <div className="message incoming">
            <div className="message-body">{msg.text || msg.body || ''}</div>
            <div className="message-meta">
              <span>{timeStr}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`message${isMe ? '' : ' incoming'}`} role="listitem">
      <div className="message-body">{msg.text || msg.body || ''}</div>
      <div className="message-meta">
        <span>{timeStr}</span>
        {isMe && (
          <span className="message-checks">
            {doubleChecksIcon}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ChatWindow({ dialog, messages, myUserId, wsStatus, onSendMessage, messagesLoading }) {
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef(null);
  const listRef = useRef(null);
  const fileRef = useRef(null);

  const peer = dialog?.peer || {};
  const name = peer.name || peer.title || 'Unknown';
  const avatarSrc = peer.photo_url || null;
  const avatarId = peer.public_id || peer.id || '';
  const isGroup = dialog?.type === 'group' || dialog?.is_group;

  const statusLabel = wsStatus === 'open'
    ? (isGroup ? `${dialog.members_count || ''} members` : 'online')
    : wsStatus === 'connecting' ? 'connecting…' : 'offline';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-grow textarea
  const handleTextInput = (e) => {
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    setText(ta.value);
  };

  const handleSend = useCallback((e) => {
    if (e) ripple(e);
    const body = text.trim();
    if (!body) return;
    onSendMessage(body);
    setText('');
    setEmojiOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, onSendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmoji = (emoji) => {
    setText(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups = [];
    let lastDate = null;
    (messages || []).forEach(msg => {
      const d = msg.created_at ? new Date(msg.created_at).toDateString() : null;
      if (d && d !== lastDate) {
        groups.push({ type: 'divider', key: `divider-${d}`, label: formatDateLabel(msg.created_at) });
        lastDate = d;
      }
      groups.push({ type: 'msg', msg, key: msg.id || msg.local_id || Math.random() });
    });
    return groups;
  }, [messages]);

  return (
    <div className="workspace-main open-chat">
      <div id="chat-window" className="chat-window">
        {/* Glassmorphic Chat Island Header */}
        <div id="chat-island" className="chat-island">
          <div className="chat-island-copy" role="button" tabIndex={0} aria-label="Open profile info" onClick={ripple}>
            <div id="chat-header-avatar" className="chat-header-avatar">
              <Avatar src={avatarSrc} name={name} id={avatarId} size={40} />
            </div>
            <div className="chat-island-text">
              <strong id="chat-title">{name}</strong>
              <span id="chat-subtitle">{statusLabel}</span>
            </div>
          </div>
          <div className="chat-island-actions">
            <button className="chat-island-action" type="button" aria-label="Group video chat" onClick={ripple}>
              <span className="material-symbols-rounded">videocam</span>
            </button>
            <button className="chat-island-action" type="button" aria-label="Search messages" onClick={ripple}>
              <span className="material-symbols-rounded">search</span>
            </button>
            <button className="chat-island-action" type="button" aria-label="Call" onClick={ripple}>
              <span className="material-symbols-rounded">call</span>
            </button>
          </div>
        </div>

        {/* Messages / Chat Stage */}
        <div id="chat-stage" className="chat-stage">
          {messagesLoading ? (
            <div id="chat-loading-overlay" className="chat-loading-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="search-spinner" />
            </div>
          ) : (messages || []).length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: 'rgba(255,255,255,0.25)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px' }}>chat_bubble</span>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>No messages yet</div>
              <div style={{ fontSize: '13px' }}>Send the first message!</div>
            </div>
          ) : (
            <div
              id="message-list"
              className="message-list"
              ref={listRef}
              role="list"
              aria-label={`Messages with ${name}`}
              aria-live="polite"
            >
              {groupedMessages.map(item => {
                if (item.type === 'divider') {
                  return (
                    <div key={item.key} className="message-day-separator" role="separator" aria-label={item.label}>
                      <span>{item.label}</span>
                    </div>
                  );
                }
                const { msg } = item;
                const isMe = msg.sender_id === myUserId || msg.is_out;
                return (
                  <MessageBubble
                    key={item.key}
                    msg={msg}
                    myUserId={myUserId}
                    isGroup={isGroup}
                    showAvatar={!isMe}
                    senderName={msg.sender_name}
                    senderAvatar={msg.sender_photo}
                    senderPublicId={msg.sender_public_id || msg.sender_id}
                  />
                );
              })}
            </div>
          )}

          {/* Composer Shell */}
          <div className={`composer${text.trim() ? ' send-active' : ''}`} role="form" aria-label="Message composer">
            <div className="composer-stack">
              {/* Emojis pick popover card */}
              <div id="emoji-picker" className={`emoji-picker${emojiOpen ? ' open' : ''}`}>
                <div className="emoji-picker-head">
                  <span className="emoji-picker-tab" style={{ padding: 0, fontSize: 19, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>😃</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: '600' }}>Smileys</span>
                </div>
                <div className="emoji-picker-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', padding: '10px 0', overflowY: 'auto', maxHeight: '200px' }}>
                  {EMOJIS.map(em => (
                    <button
                      key={em}
                      onClick={() => handleEmoji(em)}
                      style={{ background: 'transparent', border: 0, fontSize: '24px', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}
                      type="button"
                      title={em}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="composer-shell">
                <button
                  className="composer-icon"
                  id="composer-emoji-button"
                  type="button"
                  aria-label="Choose emoji"
                  onClick={(e) => { ripple(e); setEmojiOpen(o => !o); }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>mood</span>
                </button>

                <div className="composer-input-wrap">
                  <textarea
                    ref={textareaRef}
                    id="composer-input"
                    className="composer-input"
                    placeholder="Message"
                    value={text}
                    onChange={handleTextInput}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    aria-label="Message text"
                    autoComplete="off"
                    spellCheck="true"
                  />
                </div>

                <button
                  className="composer-icon"
                  id="composer-attach-button"
                  type="button"
                  aria-label="Attach files"
                  onClick={(e) => { ripple(e); fileRef.current?.click(); }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>attach_file</span>
                </button>
                <input ref={fileRef} type="file" style={{ display: 'none' }} aria-hidden="true" />

                <button
                  className="composer-send"
                  id="composer-send"
                  type="button"
                  aria-label="Send message"
                  onClick={handleSend}
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
