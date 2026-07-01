import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { essGetAnnouncements } from '../../services/employeeSelfServiceAPI';

const PRIORITY_STYLE = {
  urgent: { bg: '#FEE2E2', color: '#991B1B', label: 'URGENT' },
  high:   { bg: '#FEF3C7', color: '#92400E', label: 'HIGH' },
  normal: { bg: '#EFF6FF', color: '#1D4ED8', label: 'NORMAL' },
  low:    { bg: '#F3F4F6', color: '#374151', label: 'LOW' },
};

export default function ESSAnnouncements() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.employeeAuth);
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) { navigate('/employee/login'); return; }
    essGetAnnouncements()
      .then(r => setItems(r.data.data || r.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load announcements'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4,#9CA3AF)', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px', color: '#EF4444', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>{error}</div>;

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>Announcements</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', marginBottom: 0 }}>
          Company-wide and department announcements.
        </p>
      </div>

      {items.length === 0 ? (
        <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <FiBell size={22} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text,#111)', marginBottom: '6px' }}>No announcements</div>
          <div style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)' }}>Check back later for company updates.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {items.map(a => {
            const ps = PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.normal;
            return (
              <div key={a._id} style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--text,#111)', margin: 0, fontSize: '15px' }}>{a.title}</h3>
                  <span style={{ background: ps.bg, color: ps.color, padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                    {ps.label}
                  </span>
                </div>
                {a.content && (
                  <p style={{ color: 'var(--text-2,#4B5563)', fontSize: '14px', lineHeight: 1.7, margin: '0 0 12px' }}>{a.content}</p>
                )}
                <div style={{ fontSize: '12px', color: 'var(--text-4,#9CA3AF)' }}>
                  {a.annCode && <span>{a.annCode} · </span>}
                  {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                  {a.targetAudience && a.targetAudience !== 'all' && <span> · {a.targetAudience}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
