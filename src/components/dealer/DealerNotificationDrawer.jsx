import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBell, FiX, FiPackage, FiDollarSign, FiCheckCircle,
  FiShield, FiRadio, FiSettings,
} from 'react-icons/fi';
import dealerAPI from '../../services/dealerAPI';

const TYPE_ICONS = {
  order:        FiPackage,
  pricing:      FiDollarSign,
  approval:     FiCheckCircle,
  kyc:          FiShield,
  announcement: FiRadio,
  admin:        FiSettings,
  system:       FiBell,
};

export default function DealerNotificationDrawer({ open, onClose, onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [tab,           setTab]           = useState('unread');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    dealerAPI.get('/dealer/notifications?page=1&limit=20')
      .then(r => setNotifications(r.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const markRead = useCallback(async (id) => {
    try {
      await dealerAPI.put(`/dealer/notifications/${id}/read`);
      setNotifications(prev => {
        const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
        onCountChange?.(updated.filter(n => !n.isRead).length);
        return updated;
      });
    } catch { /* ignore */ }
  }, [onCountChange]);

  const markAllRead = useCallback(async () => {
    try {
      await dealerAPI.put('/dealer/notifications/mark-all-read');
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, isRead: true }));
        onCountChange?.(0);
        return updated;
      });
    } catch { /* ignore */ }
  }, [onCountChange]);

  const visible     = tab === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 59, background: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 60,
          width: '400px', maxWidth: '100vw',
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          fontFamily: 'var(--font-body, Poppins, sans-serif)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <FiBell size={16} style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', flex: 1 }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--accent)', color: '#fff',
              borderRadius: '100px', padding: '1px 7px', fontSize: '10px', fontWeight: 700,
            }}>
              {unreadCount}
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: 'var(--text-3)' }}
            aria-label="Close notifications"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {[['unread', `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`], ['all', 'All']].map(([id, lbl]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '10px 0', marginRight: '20px', fontSize: '13px', fontWeight: 600,
                color: tab === id ? 'var(--accent)' : 'var(--text-4)',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color 0.12s, border-color 0.12s',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '70px', borderRadius: '8px', background: 'var(--border)' }} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiBell size={20} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                {tab === 'unread' ? 'All caught up!' : 'No notifications'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-4)' }}>
                {tab === 'unread' ? 'No unread notifications' : 'Check back later'}
              </div>
            </div>
          ) : visible.map(n => {
            const Icon = TYPE_ICONS[n.type] || FiBell;
            return (
              <div
                key={n._id}
                role={!n.isRead ? 'button' : undefined}
                tabIndex={!n.isRead ? 0 : undefined}
                onClick={() => !n.isRead && markRead(n._id)}
                onKeyDown={e => e.key === 'Enter' && !n.isRead && markRead(n._id)}
                style={{
                  display: 'flex', gap: '12px', padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: !n.isRead ? 'rgba(255,122,0,0.025)' : 'transparent',
                  cursor: !n.isRead ? 'pointer' : 'default',
                  transition: 'background 0.12s',
                  outline: 'none',
                }}
                onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = 'rgba(255,122,0,0.055)'; }}
                onMouseLeave={e => { if (!n.isRead) e.currentTarget.style.background = 'rgba(255,122,0,0.025)'; }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
                  background: !n.isRead ? 'rgba(255,122,0,0.1)' : 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '2px',
                }}>
                  <Icon size={15} style={{ color: !n.isRead ? 'var(--accent)' : 'var(--text-4)' }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: n.isRead ? 500 : 700, color: 'var(--text)', lineHeight: 1.35 }}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span
                        style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '4px' }}
                        aria-label="Unread"
                      />
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '3px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-5, var(--text-4))', marginTop: '5px' }}>
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {n.isBroadcast && (
                      <span style={{ marginLeft: '8px', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '100px', background: '#EFF6FF', color: '#2563EB' }}>
                        Broadcast
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <Link
            to="/dealer/notifications"
            onClick={onClose}
            style={{
              display: 'block', textAlign: 'center', padding: '9px',
              borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', fontSize: '12px', fontWeight: 600,
              color: 'var(--text-2)', textDecoration: 'none',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
          >
            View All Notifications
          </Link>
        </div>
      </div>
    </>
  );
}
