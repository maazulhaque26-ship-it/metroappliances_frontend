import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchAllKPIs, fetchKPITrend, fetchKPITargets, checkAlerts } from '../../services/biAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SEVERITY_COLOR = { info: '#3B82F6', warning: '#F59E0B', critical: '#EF4444' };

function TrafficLight({ value, target, minimum, stretch }) {
  if (!target) return <span style={{ color: '#9CA3AF' }}>—</span>;
  if (value >= (stretch || target * 1.1)) return <span title="Exceeds stretch" style={{ fontSize: '18px' }}>🟢</span>;
  if (value >= target) return <span title="On target" style={{ fontSize: '18px' }}>🟡</span>;
  if (value >= (minimum || target * 0.8)) return <span title="Below target" style={{ fontSize: '18px' }}>🟠</span>;
  return <span title="Critical" style={{ fontSize: '18px' }}>🔴</span>;
}

export default function AdminBIKPIExplorer() {
  const [kpis, setKpis]       = useState([]);
  const [targets, setTargets] = useState([]);
  const [alerts, setAlerts]   = useState([]);
  const [trend, setTrend]     = useState(null);
  const [trendKpi, setTrendKpi] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    Promise.all([fetchAllKPIs(), fetchKPITargets()])
      .then(([k, t]) => {
        setKpis(k.data?.data || k.data?.kpis || []);
        setTargets(t.data?.data || t.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadTrend = async (name) => {
    setTrendKpi(name);
    try {
      const r = await fetchKPITrend(name);
      setTrend(r.data?.data || r.data || []);
    } catch { setTrend([]); }
  };

  const runAlertCheck = async () => {
    setChecking(true);
    try {
      const r = await checkAlerts();
      setAlerts(r.data?.data || r.data?.triggered || []);
    } catch { setAlerts([]); }
    finally { setChecking(false); }
  };

  const getTarget = (name) => targets.find(t => t.kpiName === name);

  if (loading) return <AdminLayout><div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>Loading KPIs…</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>KPI Explorer</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>20 enterprise KPIs with targets & trends</p>
          </div>
          <button
            onClick={runAlertCheck}
            disabled={checking}
            style={{ padding: '9px 18px', background: '#FF7A00', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            {checking ? 'Checking…' : 'Check Alerts'}
          </button>
        </div>

        {alerts.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', background: SEVERITY_COLOR[a.severity] + '1A', border: `1px solid ${SEVERITY_COLOR[a.severity]}40`, fontSize: '13px', color: '#111' }}>
                <strong style={{ color: SEVERITY_COLOR[a.severity] }}>[{a.severity?.toUpperCase()}]</strong>{' '}
                {a.name}: {a.kpiName} is {a.condition} {a.threshold} (actual: {a.lastValue ?? '—'})
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: trend ? '2fr 1fr' : '1fr', gap: '20px' }}>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['KPI','Label','Value','Unit','Target','Status','Trend'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi, i) => {
                  const tgt = getTarget(kpi.name || kpi.kpiName);
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{kpi.name || kpi.kpiName}</td>
                      <td style={{ padding: '10px 12px', color: '#111' }}>{kpi.label || '—'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111' }}>{kpi.value ?? '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#6B7280' }}>{kpi.unit || tgt?.unit || ''}</td>
                      <td style={{ padding: '10px 12px', color: '#6B7280' }}>{tgt?.targetValue ?? '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <TrafficLight value={kpi.value} target={tgt?.targetValue} minimum={tgt?.minimumTarget} stretch={tgt?.stretchTarget} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={() => loadTrend(kpi.name || kpi.kpiName)}
                          style={{ fontSize: '11px', color: '#FF7A00', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Trend →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {trend && (
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>
                Trend: {trendKpi}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={Array.isArray(trend) ? trend : trend.trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#FF7A00" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="total" stroke="#FF7A00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <button onClick={() => setTrend(null)} style={{ fontSize: '11px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px' }}>Close</button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
