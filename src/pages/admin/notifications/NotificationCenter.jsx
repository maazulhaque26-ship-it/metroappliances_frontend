import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';
import NotificationGroup from './NotificationGroup';
import NotificationItem from './NotificationItem';
import NotificationFilters from './NotificationFilters';
import NotificationEmptyState from './NotificationEmptyState';
import ActionCenter from './ActionCenter';

function midnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function applyFilters(notifications, { filter, category, search }) {
  let items = notifications.filter(n => !n.isArchived);

  if (category) items = items.filter(n => n.category === category);

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q)
    );
  }

  const mn = midnight();
  const weekAgo = Date.now() - 7 * 86_400_000;

  switch (filter) {
    case 'unread': return items.filter(n => !n.isRead);
    case 'today':  return items.filter(n => n.at >= mn);
    case 'week':   return items.filter(n => n.at >= weekAgo);
    default:       return items;
  }
}

function groupByTime(items) {
  const mn = midnight();
  const yesterdayStart = mn - 86_400_000;
  return {
    unread:    items.filter(n => !n.isRead),
    today:     items.filter(n => n.isRead && n.at >= mn),
    yesterday: items.filter(n => n.at >= yesterdayStart && n.at < mn),
    earlier:   items.filter(n => n.at < yesterdayStart),
  };
}

export default function NotificationCenter({
  open, onClose,
  notifications, unseenCount,
  onMarkRead, onMarkAllRead, onArchive, onDismiss,
}) {
  const [tab,      setTab]      = useState('notifications');
  const [filter,   setFilter]   = useState('all');
  const [category, setCategory] = useState(null);
  const [search,   setSearch]   = useState('');
  const panelRef     = useRef(null);
  const prevFocusRef = useRef(null);

  // Save focus + initial focus + restore on close
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement;
    const id = setTimeout(() => {
      panelRef.current?.querySelector('button')?.focus();
    }, 0);
    return () => { clearTimeout(id); prevFocusRef.current?.focus(); };
  }, [open]);

  // Focus trap + Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab') {
        const focusable = Array.from(
          panelRef.current?.querySelectorAll('button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])') || []
        );
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Reset search on close
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const filtered = useMemo(
    () => applyFilters(notifications, { filter, category, search }),
    [notifications, filter, category, search]
  );

  const counts = useMemo(() => {
    const active = notifications.filter(n => !n.isArchived);
    const mn = midnight();
    const weekAgo = Date.now() - 7 * 86_400_000;
    return {
      all:    active.length,
      unread: active.filter(n => !n.isRead).length,
      today:  active.filter(n => n.at >= mn).length,
      week:   active.filter(n => n.at >= weekAgo).length,
    };
  }, [notifications]);

  const grouped = useMemo(() => {
    if (filter !== 'all') return null;
    return groupByTime(filtered);
  }, [filtered, filter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 60 }}
      role="dialog"
      aria-modal="true"
      aria-label="Notification Center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        ref={panelRef}
        className="absolute right-0 inset-y-0 flex flex-col w-full max-w-[480px]"
        style={{
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.20)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.16)' }}
              aria-hidden="true"
            >
              <FiBell size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p
                className="text-[14px] font-bold leading-tight"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
              >
                Notification Center
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>
                {unseenCount > 0 ? `${unseenCount} unread notification${unseenCount !== 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unseenCount > 0 && tab === 'notifications' && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold mr-1 transition-colors"
                style={{
                  color: 'var(--accent)',
                  background: 'rgba(255,122,0,0.06)',
                  border: '1px solid rgba(255,122,0,0.18)',
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,0,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,122,0,0.06)'}
                aria-label="Mark all notifications as read"
              >
                <FiCheck size={12} strokeWidth={2.5} aria-hidden="true" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded transition-colors"
              style={{ color: 'var(--text-4)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}
              aria-label="Close notification center"
            >
              <FiX size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div
          className="flex items-center px-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
          role="tablist"
        >
          {[
            { key: 'notifications', label: 'Notifications', badge: unseenCount },
            { key: 'actions',       label: 'Action Center', badge: 0 },
          ].map(t => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-1 py-3.5 mr-6 text-[12.5px] font-semibold transition-colors"
              style={{
                color: tab === t.key ? 'var(--text)' : 'var(--text-4)',
                borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {t.label}
              {t.badge > 0 && (
                <span
                  className="text-[9px] font-bold leading-none"
                  style={{
                    padding: '2px 5px',
                    background: 'var(--accent)',
                    color: '#fff',
                    borderRadius: 9,
                    minWidth: 16,
                    textAlign: 'center',
                  }}
                  aria-label={`${t.badge} unread`}
                >
                  {t.badge > 99 ? '99+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        {tab === 'actions' ? (
          <div className="flex-1 overflow-hidden">
            <ActionCenter />
          </div>
        ) : (
          <>
            <NotificationFilters
              filter={filter}
              onFilterChange={setFilter}
              category={category}
              onCategoryChange={setCategory}
              search={search}
              onSearchChange={setSearch}
              counts={counts}
            />

            <div
              className="flex-1 overflow-y-auto"
              role="feed"
              aria-label="Notifications"
              aria-live="polite"
            >
              {filtered.length === 0 ? (
                <NotificationEmptyState
                  title={search ? 'No results found' : 'No notifications'}
                  body={
                    search
                      ? `No notifications match "${search}"`
                      : filter === 'unread'
                      ? 'You have no unread notifications.'
                      : 'No notifications match your current filter.'
                  }
                />
              ) : filter === 'all' && grouped ? (
                <>
                  {grouped.unread.length > 0 && (
                    <NotificationGroup
                      title="Unread"
                      notifications={grouped.unread}
                      onMarkRead={onMarkRead}
                      onArchive={onArchive}
                      onDismiss={onDismiss}
                      defaultExpanded
                    />
                  )}
                  {grouped.today.length > 0 && (
                    <NotificationGroup
                      title="Today"
                      notifications={grouped.today}
                      onMarkRead={onMarkRead}
                      onArchive={onArchive}
                      onDismiss={onDismiss}
                      defaultExpanded
                    />
                  )}
                  {grouped.yesterday.length > 0 && (
                    <NotificationGroup
                      title="Yesterday"
                      notifications={grouped.yesterday}
                      onMarkRead={onMarkRead}
                      onArchive={onArchive}
                      onDismiss={onDismiss}
                      defaultExpanded
                    />
                  )}
                  {grouped.earlier.length > 0 && (
                    <NotificationGroup
                      title="Earlier"
                      notifications={grouped.earlier}
                      onMarkRead={onMarkRead}
                      onArchive={onArchive}
                      onDismiss={onDismiss}
                      defaultExpanded={false}
                    />
                  )}
                </>
              ) : (
                filtered.map(n => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={onMarkRead}
                    onArchive={onArchive}
                    onDismiss={onDismiss}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
