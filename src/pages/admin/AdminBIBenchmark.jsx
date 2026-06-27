import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchBenchmarks, fetchVarianceAnalysis } from '../../services/biAPI';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

function StatusBadge({ actual, target }) {
  if (actual == null || target == null) return <span style={{ color: '#9CA3AF', fontSize: '12px' }}>—</span>;
  const pct = (actual / target) * 100;
  if (pct >= 100) return <span style={{ background: '#D1FAE5', color: '#059669', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>On Target</span>;
  if (pct >= 80)  return <span style={{ background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Near</span>;
  return           <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Below</span>;
}

export default function AdminBIBenchmark() {
  const [benchmarks, setBenchmarks] = useState(null);
  const [variance,   setVariance]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('benchmarks');
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (activeTab === 'benchmarks' && !benchmarks) {
      setLoading(true);
      fetchBenchmarks()
        .then(r => setBenchmarks(r.data?.data || r.data || {}))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    if (activeTab === 'variance' && !variance) {
      setLoading(true);
      fetchVarianceAnalysis()
        .then(r => setVariance(r.data?.data || r.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const kpiList = benchmarks?.kpis || [];
  const radarData = kpiList.filter(k => k.actual != null && k.target != null).slice(0, 8).map(k => ({
    subject: (k.name || k.kpiName || '').replace(/_/g, ' '),
    actual:  Math.min(100, ((k.actual / k.target) * 100).toFixed(1)),
    target:  100,
  }));

  const varianceList = Array.isArray(variance) ? variance : variance?.variances || [];

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>Benchmarks & Variance</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>Target vs actuals across all KPIs</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[{ key: 'benchmarks', label: 'Benchmarks' }, { key: 'variance', label: 'Variance Analysis' }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: activeTab === t.key ? 'none' : '1px solid #E5E7EB', background: activeTab === t.key ? '#FF7A00' : '#fff', color: activeTab === t.key ? '#fff' : '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading…</div>}

        {!loading && activeTab === 'benchmarks' && benchmarks && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>KPI Performance Radar</div>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Actual %" dataKey="actual" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Insufficient data for radar</div>
              )}
            </div>

            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>KPI Status Table</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    <th style={{ padding: '8px', textAlign: 'left', color: '#6B7280', fontWeight: 700, fontSize: '11px' }}>KPI</th>
                    <th style={{ padding: '8px', textAlign: 'right', color: '#6B7280', fontWeight: 700, fontSize: '11px' }}>Actual</th>
                    <th style={{ padding: '8px', textAlign: 'right', color: '#6B7280', fontWeight: 700, fontSize: '11px' }}>Target</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: '#6B7280', fontWeight: 700, fontSize: '11px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiList.slice(0, 12).map((k, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '8px', color: '#374151', textTransform: 'capitalize' }}>{(k.name || k.kpiName || '').replace(/_/g, ' ')}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{k.actual ?? '—'}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#6B7280' }}>{k.target ?? '—'}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <StatusBadge actual={k.actual} target={k.target} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'variance' && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Variance Analysis</div>
            {varianceList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>No variance data (targets may not be set)</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={varianceList} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="kpiName" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="variance">
                    {varianceList.map((entry, i) => (
                      <Cell key={i} fill={entry.variance >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
