import React, { useEffect, useState, useCallback } from 'react';
import { FiX, FiBell, FiAlertCircle, FiInfo, FiRadio, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { essGetAnnouncements } from '../../services/employeeSelfServiceAPI';

const PRIORITY_CONFIG = {
  urgent: { color: '#EF4444', bg: '#FEE2E2', label: 'Urgent' },
  high:   { color: '#F59E0B', bg: '#FEF3C7', label: 'High' },
  normal: { color: '#3B82F6', bg: '#EFF6FF', label: 'Normal' },
  low:    { color: '#6B7280', bg: '#F3F4F6', label: 'Low' },
};

function PriorityIcon({ priority }) {
  if (priority === 'urgent') return <FiAlertCircle size={14} aria-hidden="true" />;
  if (priority === 'high')   return <FiRadio        size={14} aria-hidden="true" />;
  return <FiInfo size={14} aria-hidden="true" />;
}

export default function ESSNotificationDrawer({ open, onClose }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    essGetAnnouncements({ limit: 20 })
      .then(r => setItems(r.data.data || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 8000 }}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Announcements"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 8001,
          width: '400px', maxWidth: '100vw',
          background: 'var(--card,#fff)',
          borderLeft: '1px solid var(--border,#E5E7EB)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border,#E5E7EB)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiBell size={17} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text,#111)' }}>Announcements</span>
            {items.length > 0 && (
              <span style={{ background: 'var(--accent,#FF7A00)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '100px' }}>
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close announcements"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-4,#9CA3AF)', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-4,#9CA3AF)', fontSize: '13px' }}>
              Loading…
            </div>
          )}

          {!loading && items.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <FiBell size={22} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-4,#9CA3AF)' }}>No announcements</div>
            </div>
          )}

          {!loading && items.map(a => {
            const pc = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.normal;
            return (
              <div key={a._id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border,#E5E7EB)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: pc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: pc.color }}>
                    <PriorityIcon priority={a.priority} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text,#111)', marginBottom: '3px' }}>{a.title}</div>
                    {a.content && (
                      <div style={{ fontSize: '12px', color: 'var(--text-2,#374151)', lineHeight: 1.5, marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {a.content}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: pc.color, background: pc.bg, padding: '1px 6px', borderRadius: '4px' }}>
                        {pc.label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)' }}>
                        {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border,#E5E7EB)', flexShrink: 0 }}>
          <Link
            to="/employee/announcements"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent,#FF7A00)', fontWeight: 600, textDecoration: 'none' }}
          >
            View all announcements <FiArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}
