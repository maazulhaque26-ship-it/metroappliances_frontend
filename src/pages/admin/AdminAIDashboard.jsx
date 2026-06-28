import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchAIDashboard, fetchAIInsights } from '../../services/aiAPI';

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 };
const metricBox = { background: '#F8F9FC', borderRadius: 10, padding: '18px 22px', textAlign: 'center', flex: 1, minWidth: 140 };

const sev = { critical: '#DC2626', high: '#EA580C', medium: '#D97706', low: '#16A34A' };

function HealthMeter({ score }) {
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 52, fontWeight: 800, color }}>{score}</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>AI Health Score</div>
      <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4, transition: 'width 0.6s' }} />
      </div>
    </div>
  );
}

export default function AdminAIDashboard() {
  const [dash, setDash]     = useState(null);
  const [insights, setIns]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAIDashboard(), fetchAIInsights()])
      .then(([d, i]) => { setDash(d.data.data || d.data); setIns(i.data.data || i.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div style={{ padding: 40, color: '#6B7280' }}>Loading AI Dashboard...</div></AdminLayout>;

  const s = dash?.summary || {};
  const fts = dash?.forecastByType || [];

  return (
    <AdminLayout>
      <div style={{ padding: '28px 32px', fontFamily: 'Poppins, sans-serif', maxWidth: 1400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>AI Forecasting Dashboard</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Predictive intelligence across all ERP modules</p>

        {/* Summary Row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { label: 'Total Forecasts',      value: s.totalForecasts   ?? 0, color: '#3B82F6' },
            { label: 'Open Anomalies',        value: s.openAnomalies    ?? 0, color: '#EA580C' },
            { label: 'Critical Anomalies',    value: s.criticalAnomalies?? 0, color: '#DC2626' },
            { label: 'Pending Recommendations', value: s.pendingRecs    ?? 0, color: '#7C3AED' },
            { label: 'Critical Actions',      value: s.criticalRecs     ?? 0, color: '#DC2626' },
          ].map(m => (
            <div key={m.label} style={metricBox}>
              <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
          {/* Health Score */}
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 20 }}>AI System Health</h3>
            <HealthMeter score={s.aiHealthScore ?? 85} />
          </div>

          {/* Recent Forecasts */}
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Recent Forecasts</h3>
            {(dash?.recentForecasts || []).length === 0
              ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>No forecasts yet. Use Forecast Center to generate.</p>
              : (dash.recentForecasts || []).map(f => (
                <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize', color: '#1F2937' }}>{f.forecastType}</span>
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#6B7280' }}>{f.algorithm?.replace(/_/g,' ')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>{f.confidence}% conf.</span>
                    <span style={{ fontSize: 11, background: f.status === 'completed' ? '#DCFCE7' : '#FEF9C3', color: f.status === 'completed' ? '#16A34A' : '#92400E', padding: '2px 8px', borderRadius: 20 }}>{f.status}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Forecast Coverage */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Forecast Coverage by Type</h3>
            {fts.length === 0
              ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>No forecasts generated yet.</p>
              : fts.map(f => (
                <div key={f._id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>{f._id}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{Math.round(f.avgConfidence ?? 0)}%</span>
                  </div>
                  <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.avgConfidence ?? 0}%`, background: '#3B82F6', borderRadius: 3 }} />
                  </div>
                </div>
              ))
            }
          </div>

          {/* AI Insights */}
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>AI Insights</h3>
            {(insights?.insights || []).length === 0
              ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>System is healthy. No action required.</p>
              : (insights.insights || []).map((ins, i) => {
                const bgMap = { critical: '#FEF2F2', warning: '#FFFBEB', info: '#EFF6FF' };
                const colMap = { critical: '#DC2626', warning: '#D97706', info: '#2563EB' };
                return (
                  <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: bgMap[ins.level] || '#F9FAFB', marginBottom: 8, borderLeft: `3px solid ${colMap[ins.level] || '#9CA3AF'}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: colMap[ins.level], textTransform: 'uppercase' }}>{ins.level} · {ins.area}</span>
                    <p style={{ fontSize: 13, color: '#374151', margin: '4px 0 0' }}>{ins.message}</p>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Active Scenarios */}
        {(dash?.activeScenarios || []).length > 0 && (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Active Scenarios</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {dash.activeScenarios.map(sc => (
                <div key={sc._id} style={{ background: '#F5F3FF', borderRadius: 8, padding: '10px 16px', border: '1px solid #DDD6FE' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#5B21B6' }}>{sc.name}</div>
                  <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 2 }}>{sc.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
