import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchTrendAnalysis, fetchYoYComparison, fetchMoMComparison, fetchQoQComparison, fetchForecast } from '../../services/biAPI';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const METRICS = ['revenue','orders','headcount','production','service_tickets','leads'];
const COMPARE_TYPES = [
  { key: 'trend', label: 'Trend',      fetch: fetchTrendAnalysis },
  { key: 'yoy',   label: 'YoY',        fetch: fetchYoYComparison },
  { key: 'mom',   label: 'MoM',        fetch: fetchMoMComparison },
  { key: 'qoq',   label: 'QoQ',        fetch: fetchQoQComparison },
  { key: 'forecast', label: 'Forecast', fetch: fetchForecast },
];

const COLORS = ['#FF7A00','#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444'];

function flattenToChart(data) {
  if (Array.isArray(data)) return data;
  if (data?.trend)    return data.trend;
  if (data?.current)  return [{ name: 'Current', value: data.current }, { name: 'Previous', value: data.previous }];
  return [];
}

export default function AdminBITrendAnalytics() {
  const [compareType, setCompareType] = useState('trend');
  const [metric,      setMetric]      = useState('revenue');
  const [chartData,   setChartData]   = useState([]);
  const [rawData,     setRawData]     = useState(null);
  const [loading,     setLoading]     = useState(false);

  const load = async (type, m) => {
    setLoading(true);
    try {
      const fn = COMPARE_TYPES.find(c => c.key === type)?.fetch;
      if (!fn) return;
      const r = await fn({ metric: m, months: 12 });
      const d = r.data?.data || r.data || {};
      setRawData(d);
      setChartData(flattenToChart(d));
    } catch { setChartData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(compareType, metric); }, [compareType, metric]);

  const isBar = ['yoy','qoq'].includes(compareType);

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>Trend Analytics</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>YoY · MoM · QoQ comparisons and forecasts</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Metric</label>
            <select
              value={metric}
              onChange={e => setMetric(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#111', background: '#fff' }}
            >
              {METRICS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Analysis Type</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {COMPARE_TYPES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setCompareType(c.key)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: compareType === c.key ? 'none' : '1px solid #E5E7EB', background: compareType === c.key ? '#FF7A00' : '#fff', color: compareType === c.key ? '#fff' : '#374151', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading…</div>
          ) : chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>No data available</div>
          ) : isBar ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                {Object.keys(chartData[0] || {}).filter(k => k !== '_id' && k !== 'name').map((k, i) => (
                  <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                {Object.keys(chartData[0] || {}).filter(k => !['_id','name','month','year'].includes(k)).map((k, i) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {rawData && typeof rawData === 'object' && !Array.isArray(rawData) && (
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {Object.entries(rawData).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
              <div key={k} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '6px' }}>{k.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#111' }}>{typeof v === 'number' ? v.toLocaleString() : v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
