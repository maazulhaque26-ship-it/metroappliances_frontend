import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiArchive, FiX } from 'react-icons/fi';
import { CATEGORIES, PRIORITIES } from './notificationData';

function relativeTime(at) {
  const diff = Date.now() - at;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24);
  if (dy === 1) return 'Yesterday';
  return `${dy}d ago`;
}

export default function NotificationItem({ notification: n, onMarkRead, onArchive, onDismiss }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const cat = CATEGORIES[n.category] || CATEGORIES.system;
  const pri = PRIORITIES[n.priority] || PRIORITIES.low;
  const Icon = cat.icon;

  const handleClick = () => {
    if (!n.isRead) onMarkRead(n.id);
    if (n.path) navigate(n.path);
  };

  return (
    <div
      className="relative flex items-start gap-3 px-5 py-3.5 transition-colors"
      style={{
        borderBottom: '1px solid var(--border)',
        background: hovered
          ? 'var(--bg)'
          : !n.isRead
          ? 'rgba(255,122,0,0.025)'
          : 'transparent',
        cursor: n.path ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="article"
      aria-label={`${n.title}: ${n.body}`}
    >
      {/* Unread indicator */}
      {!n.isRead && (
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'var(--accent)' }}
          aria-label="Unread"
        />
      )}

      {/* Category icon */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
        style={{
          background: `color-mix(in srgb, ${cat.color} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${cat.color} 22%, transparent)`,
        }}
        aria-hidden="true"
      >
        <Icon size={13} style={{ color: cat.color }} />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[12.5px] leading-snug"
            style={{
              color: 'var(--text)',
              fontFamily: 'var(--font-display)',
              fontWeight: n.isRead ? 500 : 600,
            }}
          >
            {n.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
            {(n.priority === 'critical' || n.priority === 'high') && (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5"
                style={{
                  color: pri.color,
                  background: pri.bg,
                  border: `1px solid ${pri.border}`,
                  borderRadius: 3,
                }}
              >
                {pri.label}
              </span>
            )}
            <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-5)' }}>
              {relativeTime(n.at)}
            </span>
          </div>
        </div>
        <p className="text-[11.5px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-3)' }}>
          {n.body}
        </p>
      </div>

      {/* Hover action buttons */}
      {hovered && (
        <div
          className="absolute right-3 top-2 flex items-center gap-0.5"
          onClick={e => e.stopPropagation()}
        >
          {!n.isRead && (
            <button
              onClick={() => onMarkRead(n.id)}
              className="p-1.5 rounded transition-colors"
              style={{ color: 'var(--text-4)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(22,163,74,0.10)'; e.currentTarget.style.color = '#16A34A'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}
              title="Mark as read"
              aria-label="Mark as read"
            >
              <FiCheck size={13} strokeWidth={2.5} />
            </button>
          )}
          <button
            onClick={() => onArchive(n.id)}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.10)'; e.currentTarget.style.color = '#6366F1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}
            title="Archive"
            aria-label="Archive notification"
          >
            <FiArchive size={12} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => onDismiss(n.id)}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}
            title="Dismiss"
            aria-label="Dismiss notification"
          >
            <FiX size={12} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
