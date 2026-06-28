import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchForecasts, deleteForecast,
  generateSalesForecast, generateDemandForecast, generateInventoryForecast,
  generateProductionForecast, generateCashFlowForecast, generateRevenueForecast,
  generateExpenseForecast, generateWorkforceForecast, generateMaintenanceForecast,
  generateWarrantyForecast, generateProjectForecast,
} from '../../services/aiAPI';

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 };
const btn  = (color = '#3B82F6') => ({ background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 });

const FORECAST_TYPES = [
  { key: 'sales',       label: 'Sales',        fn: generateSalesForecast,       icon: '📈', color: '#3B82F6' },
  { key: 'demand',      label: 'Demand',       fn: generateDemandForecast,      icon: '🛒', color: '#7C3AED' },
  { key: 'inventory',   label: 'Inventory',    fn: generateInventoryForecast,   icon: '📦', color: '#EA580C' },
  { key: 'production',  label: 'Production',   fn: generateProductionForecast,  icon: '🏭', color: '#059669' },
  { key: 'cashflow',    label: 'Cash Flow',    fn: generateCashFlowForecast,    icon: '💰', color: '#D97706' },
  { key: 'revenue',     label: 'Revenue',      fn: generateRevenueForecast,     icon: '💵', color: '#16A34A' },
  { key: 'expense',     label: 'Expense',      fn: generateExpenseForecast,     icon: '📉', color: '#DC2626' },
  { key: 'workforce',   label: 'Workforce',    fn: generateWorkforceForecast,   icon: '👥', color: '#0891B2' },
  { key: 'maintenance', label: 'Maintenance',  fn: generateMaintenanceForecast, icon: '🔧', color: '#7C3AED' },
  { key: 'warranty',    label: 'Warranty',     fn: generateWarrantyForecast,    icon: '🛡', color: '#B45309' },
  { key: 'projects',    label: 'Projects',     fn: generateProjectForecast,     icon: '📋', color: '#6D28D9' },
];

export default function AdminAIForecastCenter() {
  const [forecasts, setForecasts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [running,   setRunning]   = useState(null);
  const [msg,       setMsg]       = useState('');
  const [filter,    setFilter]    = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    const params = filter !== 'all' ? { type: filter } : {};
    fetchForecasts(params)
      .then(r => setForecasts(r.data.data?.data || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const run = async (ft) => {
    setRunning(ft.key);
    setMsg('');
    try {
      const r = await ft.fn({ horizon: 6 });
      setMsg(`✓ ${ft.label} forecast generated (confidence: ${r.data.data?.confidence ?? '--'}%)`);
      load();
    } catch {
      setMsg(`✗ Failed to generate ${ft.label} forecast`);
    } finally {
      setRunning(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this forecast?')) return;
    await deleteForecast(id).catch(() => {});
    load();
  };

  return (
    <AdminLayout>
      <div style={{ padding: '28px 32px', fontFamily: 'Poppins, sans-serif', maxWidth: 1400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>AI Forecast Center</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Generate AI-powered forecasts across all ERP modules</p>

        {msg && (
          <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', color: msg.startsWith('✓') ? '#16A34A' : '#DC2626', marginBottom: 16, fontSize: 13 }}>
            {msg}
          </div>
        )}

        {/* Generate Panel */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Generate Forecast</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {FORECAST_TYPES.map(ft => (
              <button
                key={ft.key}
                onClick={() => run(ft)}
                disabled={running === ft.key}
                style={{ ...btn(ft.color), opacity: running === ft.key ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>{ft.icon}</span>
                <span>{running === ft.key ? 'Running...' : ft.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', ...FORECAST_TYPES.map(f => f.key)].map(k => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${filter === k ? '#3B82F6' : '#E5E7EB'}`, background: filter === k ? '#EFF6FF' : '#fff', color: filter === k ? '#2563EB' : '#6B7280', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Forecasts Table */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>All Forecasts ({forecasts.length})</h3>
          {loading ? (
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading...</p>
          ) : forecasts.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>No forecasts found. Click a button above to generate one.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Code','Type','Algorithm','Horizon','Confidence','Status','Periods','Created',''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map(f => (
                    <tr key={f._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 14px', color: '#6B7280', fontFamily: 'monospace', fontSize: 11 }}>{f.forecastCode}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, textTransform: 'capitalize' }}>{f.forecastType}</td>
                      <td style={{ padding: '10px 14px', color: '#6B7280' }}>{f.algorithm?.replace(/_/g,' ')}</td>
                      <td style={{ padding: '10px 14px' }}>{f.horizon} mo</td>
                      <td style={{ padding: '10px 14px', color: f.confidence >= 80 ? '#16A34A' : f.confidence >= 65 ? '#D97706' : '#DC2626', fontWeight: 700 }}>{f.confidence}%</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: f.status === 'completed' ? '#DCFCE7' : '#FEF9C3', color: f.status === 'completed' ? '#16A34A' : '#92400E', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>{f.status}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{f.predictions?.length ?? 0}</td>
                      <td style={{ padding: '10px 14px', color: '#9CA3AF' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => remove(f._id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
