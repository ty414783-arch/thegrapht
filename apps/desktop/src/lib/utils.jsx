import React from 'react';

// Stable SVG avatar generator — same colours as web app
const AVATAR_GRADIENTS = [
  ['#6cb5ff','#4a8fe9'],['#e17474','#c44a4a'],['#74c981','#3ea853'],
  ['#e1a474','#c47a3a'],['#a474e1','#7a4ac4'],['#74c8e1','#3aaab8'],
  ['#e174b8','#c4488e'],['#74e1d4','#3ab8a8'],['#e1d474','#b8a83a'],
  ['#96cdf7','#5a9fdc'],
];

export function getAvatarGradient(id) {
  const idx = Math.abs(Number(String(id || '0').split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length);
  return AVATAR_GRADIENTS[idx];
}

export function GeneratedAvatar({ name = '', id = '', size = 50 }) {
  const [start, end] = getAvatarGradient(id || name);
  const initials = String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';
  const uid = `av-${String(id || name).replace(/[^a-z0-9]/gi, '')}-${size}`;
  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className="generated-avatar-svg"
      aria-label={name}
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${uid})`} />
      <text
        x="50%" y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#ffffff"
        fontSize={size * 0.38}
        fontWeight="700"
        fontFamily="Segoe UI, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {initials}
      </text>
    </svg>
  );
}

export function Avatar({ src, name, id, size = 50 }) {
  const [broken, setBroken] = React.useState(false);
  React.useEffect(() => { setBroken(false); }, [src]);
  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name || ''}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        onError={() => setBroken(true)}
      />
    );
  }
  return <GeneratedAvatar name={name} id={id} size={size} />;
}

export function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const daysDiff = Math.floor((now - d) / 86400000);
  if (daysDiff < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export function formatDateLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ripple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const el = document.createElement('span');
  el.className = 'tg-ripple';
  el.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}
