import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { fetchForecasts, fetchForecast } from '../../services/aiAPI';

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 };

const TYPE_COLORS = {
  sales: '#3B82F6', demand: '#7C3AED', inventory: '#EA580C', production: '#059669',
  cashflow: '#D97706', revenue: '#16A34A', expense: '#DC2626', workforce: '#0891B2',
  maintenance: '#7C3AED', warranty: '#B45309', project: '#6D28D9',
};

export default function AdminAIPredictions() {
  const [forecasts, setForecasts] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [detail,    setDetail]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    fetchForecasts({ status: 'completed', limit: 50 })
      .then(r => {
        const list = r.data.data?.data || r.data.data || [];
        setForecasts(list);
        if (list.length > 0) loadDetail(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadDetail = (f) => {
    setSelected(f);
    setDetail(null);
    fetchForecast(f._id)
      .then(r => setDetail(r.data.data || r.data))
      .catch(() => {});
  };

  const filtered = activeType === 'all' ? forecasts : forecasts.filter(f => f.forecastType === activeType);
  const chartData = (detail?.predictions || selected?.predictions || []).map(p => ({
    period:     p.period,
    value:      p.value,
    lowerBound: p.lowerBound,
    upperBound: p.upperBound,
  }));
  const forecastTypes = [...new Set(forecasts.map(f => f.forecastType))];

  return (
    <AdminLayout>
      <div style={{ padding: '28px 32px', fontFamily: 'Poppins, sans-serif', maxWidth: 1400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>AI Predictions</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>View and analyze prediction results by forecast type</p>

        {/* Type Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', ...forecastTypes].map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${activeType === t ? '#3B82F6' : '#E5E7EB'}`, background: activeType === t ? '#EFF6FF' : '#fff', color: activeType === t ? '#2563EB' : '#6B7280', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* Sidebar */}
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Forecasts</h3>
            {loading
              ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading...</p>
              : filtered.length === 0
              ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>No completed forecasts.</p>
              : filtered.map(f => (
                <div
                  key={f._id}
                  onClick={() => loadDetail(f)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                    background: selected?._id === f._id ? '#EFF6FF' : '#F9FAFB',
                    border: `1.5px solid ${selected?._id === f._id ? '#BFDBFE' : 'transparent'}`,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize', color: TYPE_COLORS[f.forecastType] || '#1F2937' }}>{f.forecastType}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                    {f.confidence}% · {f.horizon}m · {new Date(f.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            }
          </div>

          {/* Detail */}
          <div>
            {!selected ? (
              <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <p style={{ color: '#9CA3AF', fontSize: 14 }}>Select a forecast to view predictions</p>
              </div>
            ) : (
              <>
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'capitalize', color: TYPE_COLORS[selected.forecastType] || '#1F2937', margin: 0 }}>{selected.forecastType} Forecast</h3>
                      <p style={{ color: '#6B7280', fontSize: 12, margin: '4px 0 0' }}>{selected.forecastCode} · {selected.algorithm?.replace(/_/g,' ')} · {selected.horizon}-month horizon</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: selected.confidence >= 80 ? '#16A34A' : selected.confidence >= 65 ? '#D97706' : '#DC2626' }}>{selected.confidence}%</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>Confidence</div>
                    </div>
                  </div>

                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                        <Tooltip formatter={(v) => v?.toLocaleString()} />
                        <Legend />
                        <Line type="monotone" dataKey="value"      stroke={TYPE_COLORS[selected.forecastType] || '#3B82F6'} strokeWidth={2.5} dot={{ r: 4 }} name="Predicted" />
                        <Line type="monotone" dataKey="upperBound" stroke="#9CA3AF" strokeWidth={1} strokeDasharray="4 2" dot={false} name="Upper Bound" />
                        <Line type="monotone" dataKey="lowerBound" stroke="#9CA3AF" strokeWidth={1} strokeDasharray="4 2" dot={false} name="Lower Bound" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRadius: 8 }}>
                      <p style={{ color: '#9CA3AF', fontSize: 13 }}>No period-level predictions available for this forecast type.</p>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                  <div style={card}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Forecast Details</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {Object.entries(selected.metadata).map(([k, v]) => (
                        <div key={k} style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 14px', minWidth: 140 }}>
                          <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g,' $1')}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginTop: 2 }}>{typeof v === 'number' ? v.toLocaleString() : String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
