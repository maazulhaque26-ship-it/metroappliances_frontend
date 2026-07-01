import React, { useState, useEffect } from 'react';
import {
  FiBell, FiPackage, FiDollarSign, FiCheckCircle,
  FiShield, FiRadio, FiSettings,
} from 'react-icons/fi';
import DealerLayout from '../../components/dealer/DealerLayout';
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

export default function DealerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [pagination,    setPagination]    = useState({ page: 1, totalPages: 1 });
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(1);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await dealerAPI.get(`/dealer/notifications?page=${p}&limit=20`);
      setNotifications(data.notifications || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page]); // eslint-disable-line

  const markRead = async (id) => {
    try {
      await dealerAPI.put(`/dealer/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await dealerAPI.put('/dealer/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DealerLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: '0 0 4px' }}>Notifications</h1>
          {unreadCount > 0 && (
            <div style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)' }}>{unreadCount} unread</div>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            style={{ padding: '7px 16px', borderRadius: '8px', border: '1px solid var(--border,#E5E7EB)', background: 'var(--card,#fff)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text,#111)' }}>
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ background: 'var(--border,#E5E7EB)', borderRadius: '10px', height: '72px' }} />)}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-4,#9CA3AF)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <FiBell size={22} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text,#111)', marginBottom: '6px' }}>No notifications</div>
          <div style={{ fontSize: '13px' }}>You're all caught up!</div>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            {notifications.map((n, idx) => (
              <div key={n._id} style={{
                display: 'flex', gap: '14px', padding: '16px 20px',
                borderBottom: idx < notifications.length - 1 ? '1px solid var(--border,#E5E7EB)' : 'none',
                background: !n.isRead ? 'var(--bg,#F9FAFB)' : 'var(--card,#fff)',
                cursor: !n.isRead ? 'pointer' : 'default',
                transition: 'background 0.15s ease',
              }}
                onClick={() => !n.isRead && markRead(n._id)}
              >
                {(() => { const Icon = TYPE_ICONS[n.type] || FiBell; return (
                  <div style={{ width: 34, height: 34, borderRadius: '8px', flexShrink: 0, background: !n.isRead ? 'rgba(255,122,0,0.08)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                    <Icon size={15} style={{ color: !n.isRead ? 'var(--accent)' : 'var(--text-4)' }} aria-hidden="true" />
                  </div>
                ); })()}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: n.isRead ? 500 : 700, color: 'var(--text,#111)' }}>{n.title}</div>
                    {!n.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent,#FF7A00)', flexShrink: 0, marginTop: '4px' }} />}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)' }}>
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.isBroadcast && <span style={{ fontSize: '10px', background: '#EFF6FF', color: '#2563EB', padding: '1px 6px', borderRadius: '100px', fontWeight: 700 }}>Broadcast</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                style={{ padding: '7px 16px', borderRadius: '7px', border: '1px solid var(--border,#E5E7EB)', background: 'var(--card,#fff)', cursor: 'pointer', fontSize: '13px', opacity: page <= 1 ? 0.4 : 1 }}>← Prev</button>
              <span style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)' }}>Page {page} of {pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                style={{ padding: '7px 16px', borderRadius: '7px', border: '1px solid var(--border,#E5E7EB)', background: 'var(--card,#fff)', cursor: 'pointer', fontSize: '13px', opacity: page >= pagination.totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          )}
        </>
      )}
    </DealerLayout>
  );
}
