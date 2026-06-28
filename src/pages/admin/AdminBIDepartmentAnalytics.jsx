import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchDeptScorecard } from '../../services/biAPI';

const DEPTS = [
  { key: 'hr',            label: 'HR',            color: '#3B82F6' },
  { key: 'finance',       label: 'Finance',       color: '#10B981' },
  { key: 'operations',    label: 'Operations',    color: '#8B5CF6' },
  { key: 'manufacturing', label: 'Manufacturing', color: '#F59E0B' },
  { key: 'sales',         label: 'Sales',         color: '#FF7A00' },
];

function KpiRow({ label, value }) {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, marginBottom: '4px', textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</div>
          {value.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ color: '#374151', textTransform: 'capitalize' }}>{item._id || '—'}</span>
              <span style={{ fontWeight: 700 }}>{item.count ?? item.total ?? '—'}</span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, marginBottom: '4px', textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</div>
        {Object.entries(value).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
            <span style={{ color: '#374151', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
            <span style={{ fontWeight: 700 }}>{typeof v === 'number' && v > 999 ? v.toLocaleString() : v}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: '13px' }}>
      <span style={{ color: '#374151', textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</span>
      <span style={{ fontWeight: 700, color: '#111' }}>{value ?? '—'}</span>
    </div>
  );
}

export default function AdminBIDepartmentAnalytics() {
  const [activeDept, setActiveDept] = useState('hr');
  const [cache, setCache]           = useState({});
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (cache[activeDept] !== undefined) return;
    setLoading(true);
    fetchDeptScorecard(activeDept)
      .then(r => setCache(prev => ({ ...prev, [activeDept]: r.data?.data || r.data || {} })))
      .catch(() => setCache(prev => ({ ...prev, [activeDept]: {} })))
      .finally(() => setLoading(false));
  }, [activeDept]);

  const data = cache[activeDept];
  const dept = DEPTS.find(d => d.key === activeDept);

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>Department Analytics</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>Per-department KPI scorecards</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {DEPTS.map(d => (
            <button
              key={d.key}
              onClick={() => setActiveDept(d.key)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
                background: activeDept === d.key ? d.color : '#fff',
                color:      activeDept === d.key ? '#fff'  : '#374151',
                border:     activeDept === d.key ? 'none'  : '1px solid #E5E7EB',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading {dept?.label} scorecard…</div>
        ) : data ? (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '8px', height: '32px', borderRadius: '4px', background: dept?.color }} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#111' }}>{dept?.label} Scorecard</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  Generated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}
                </div>
              </div>
            </div>
            {data.kpis && typeof data.kpis === 'object' ? (
              data.kpis.message ? (
                <p style={{ color: '#9CA3AF', fontSize: '13px' }}>{data.kpis.message}</p>
              ) : (
                Object.entries(data.kpis).map(([k, v]) => <KpiRow key={k} label={k} value={v} />)
              )
            ) : (
              <p style={{ color: '#9CA3AF', fontSize: '13px' }}>No scorecard data</p>
            )}
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
