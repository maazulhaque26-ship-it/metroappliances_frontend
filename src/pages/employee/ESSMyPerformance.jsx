import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiTarget, FiStar } from 'react-icons/fi';
import { essGetPerformance } from '../../services/employeeSelfServiceAPI';

function ProgressBar({ value = 0, color = 'var(--accent,#FF7A00)' }) {
  return (
    <div style={{ background: 'var(--border,#E5E7EB)', borderRadius: '6px', height: '7px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, value)}%`, background: color, height: '100%', borderRadius: '6px', transition: 'width 0.4s' }} />
    </div>
  );
}

export default function ESSMyPerformance() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.employeeAuth);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) { navigate('/employee/login'); return; }
    essGetPerformance()
      .then(r => setData(r.data.data || r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load performance data'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4,#9CA3AF)', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px', color: '#EF4444', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>{error}</div>;

  const goals  = data?.goals  || [];
  const review = data?.review || null;
  const kpis   = data?.kpis   || [];

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>My Performance</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', marginBottom: 0 }}>
          Track your goals, KPIs, and current review status.
        </p>
      </div>

      {/* Active Review card */}
      {review && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '9px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiStar size={17} style={{ color: '#D97706' }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E', marginBottom: '6px' }}>
                Active Review: {review.reviewCode}
              </div>
              <div style={{ fontSize: '13px', color: '#78350F', marginBottom: '4px' }}>
                Status: <strong>{review.status}</strong> · Type: {review.reviewType}
              </div>
              {review.selfScore != null && (
                <div style={{ fontSize: '13px', color: '#78350F' }}>Self Score: {review.selfScore}</div>
              )}
              {review.finalScore != null && (
                <div style={{ fontSize: '13px', color: '#78350F' }}>
                  Final Score: {review.finalScore} — Rating: {review.overallRating}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goals */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <FiTrendingUp size={15} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>My Goals ({goals.length})</span>
        </div>

        {goals.length === 0 ? (
          <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '36px', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <FiTrendingUp size={18} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-4,#9CA3AF)' }}>No active goals found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {goals.map(g => (
              <div key={g._id} style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text,#111)', marginBottom: '3px' }}>{g.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)' }}>{g.goalCode} · {g.status}</div>
                  </div>
                  <span style={{
                    background: (g.progress ?? 0) >= 100 ? '#D1FAE5' : '#FEF3C7',
                    color:      (g.progress ?? 0) >= 100 ? '#065F46' : '#92400E',
                    padding: '2px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, flexShrink: 0,
                  }}>
                    {g.progress ?? 0}%
                  </span>
                </div>
                <ProgressBar value={g.progress ?? 0} color={(g.progress ?? 0) >= 100 ? '#10B981' : 'var(--accent,#FF7A00)'} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPIs */}
      {kpis.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <FiTarget size={15} style={{ color: '#8B5CF6' }} aria-hidden="true" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>My KPIs</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {kpis.map(k => (
              <div key={k._id} style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>KPI</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text,#111)', marginBottom: '4px' }}>{k.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-4,#9CA3AF)' }}>Target: {k.targetValue} {k.unit}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
