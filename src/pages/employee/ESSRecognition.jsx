import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiAward } from 'react-icons/fi';
import { essGetRecognitions } from '../../services/employeeSelfServiceAPI';

const TYPE_COLORS = {
  spot:       { bg: '#FEF3C7', color: '#92400E' },
  monthly:    { bg: '#EFF6FF', color: '#1D4ED8' },
  quarterly:  { bg: '#F0FDF4', color: '#14532D' },
  annual:     { bg: '#FAF5FF', color: '#6B21A8' },
  peer:       { bg: '#FFF7ED', color: '#9A3412' },
  innovation: { bg: '#F0FDF4', color: '#064E3B' },
  customer:   { bg: '#EFF6FF', color: '#1E40AF' },
  leadership: { bg: '#FDF2F8', color: '#831843' },
};

export default function ESSRecognition() {
  const navigate = useNavigate();
  const { token, employee } = useSelector(s => s.employeeAuth);
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) { navigate('/employee/login'); return; }
    essGetRecognitions()
      .then(r => setItems(r.data.data || r.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load recognitions'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4,#9CA3AF)', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px', color: '#EF4444', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>{error}</div>;

  const mine    = items.filter(i => i.toEmployee?._id === employee?._id || i.toEmployee === employee?._id);
  const public_ = items.filter(i => i.isPublic && i.toEmployee?._id !== employee?._id && i.toEmployee !== employee?._id);

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>Recognition</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', marginBottom: 0 }}>
          Your recognitions and recent public shoutouts.
        </p>
      </div>

      {/* My Recognitions */}
      {mine.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <FiAward size={15} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>My Recognitions ({mine.length})</span>
          </div>
          <div style={{ display: 'grid', gap: '14px' }}>
            {mine.map(r => {
              const tc = TYPE_COLORS[r.type] || { bg: '#F3F4F6', color: '#374151' };
              return (
                <div key={r._id} style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text,#111)' }}>
                      From: {r.fromEmployee?.firstName || ''} {r.fromEmployee?.lastName || ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {r.points > 0 && (
                        <span style={{ color: 'var(--accent,#FF7A00)', fontWeight: 700, fontSize: '13px' }}>
                          {r.points} pts
                        </span>
                      )}
                      <span style={{ background: tc.bg, color: tc.color, padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>
                        {r.type}
                      </span>
                    </div>
                  </div>
                  {r.message && <p style={{ color: 'var(--text-2,#4B5563)', fontSize: '14px', margin: '0 0 8px', lineHeight: 1.6 }}>{r.message}</p>}
                  <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)' }}>
                    {r.rcgCode && <span>{r.rcgCode} · </span>}
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Public Shoutouts */}
      {public_.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <FiStar size={15} style={{ color: '#F59E0B' }} aria-hidden="true" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>Recent Shoutouts</span>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {public_.slice(0, 10).map(r => {
              const tc = TYPE_COLORS[r.type] || { bg: '#F3F4F6', color: '#374151' };
              return (
                <div key={r._id} style={{ background: 'var(--bg,#F9FAFB)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '10px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-2,#374151)' }}>
                      <strong>{r.fromEmployee?.firstName}</strong> recognized <strong>{r.toEmployee?.firstName} {r.toEmployee?.lastName}</strong>
                    </div>
                    <span style={{ background: tc.bg, color: tc.color, padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                      {r.type}
                    </span>
                  </div>
                  {r.message && <div style={{ color: 'var(--text-4,#9CA3AF)', fontSize: '13px', marginTop: '6px' }}>{r.message}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {mine.length === 0 && public_.length === 0 && (
        <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <FiStar size={22} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text,#111)', marginBottom: '6px' }}>No recognitions yet</div>
          <div style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)' }}>Keep up the great work!</div>
        </div>
      )}
    </div>
  );
}
