import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import NotificationItem from './NotificationItem';

export default function NotificationGroup({
  title,
  notifications,
  onMarkRead,
  onArchive,
  onDismiss,
  defaultExpanded = true,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <button
        className="w-full flex items-center justify-between px-5 py-2 transition-colors sticky top-0"
        style={{
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          zIndex: 1,
        }}
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-4)' }}
          >
            {title}
          </span>
          {unreadCount > 0 && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 leading-none"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 9,
                minWidth: 16,
                textAlign: 'center',
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <FiChevronDown
          size={12}
          style={{
            color: 'var(--text-5)',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 150ms ease',
          }}
          aria-hidden="true"
        />
      </button>

      {expanded && notifications.map(n => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkRead={onMarkRead}
          onArchive={onArchive}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
