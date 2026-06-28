import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { fetchPredictionHistory, fetchHistoryAccuracy, fetchForecastAccuracy } from '../../services/aiAPI';

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 };

export default function AdminAIForecastReports() {
  const [tab,       setTab]      = useState('accuracy');
  const [history,   setHistory]  = useState([]);
  const [accuracy,  setAccuracy] = useState([]);
  const [modelPerf, setModelPerf]= useState([]);
  const [loading,   setLoading]  = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchPredictionHistory({ limit: 100, ...(typeFilter ? { forecastType: typeFilter } : {}) }),
      fetchForecastAccuracy(typeFilter ? { forecastType: typeFilter } : {}),
      fetchHistoryAccuracy(typeFilter ? { forecastType: typeFilter } : {}),
    ])
      .then(([h, a, m]) => {
        setHistory(h.data.data?.data || h.data.data || []);
        setAccuracy(a.data.data?.accuracyByType || a.data.data || []);
        setModelPerf(m.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const forecastTypes = [...new Set(history.map(h => h.forecastType))];

  const actualized = history.filter(h => h.isActualized);
  const errorChart  = actualized.slice(0, 20).map(h => ({
    period: h.period,
    actual: h.actualValue,
    predicted: h.predictedValue,
    mape: h.mape,
  }));

  return (
    <AdminLayout>
      <div style={{ padding: '28px 32px', fontFamily: 'Poppins, sans-serif', maxWidth: 1400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Forecast Reports & Accuracy</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Historical performance and accuracy analysis for AI forecasts</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {['accuracy','history','model-performance'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1F2937' : '#6B7280', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', textTransform: 'capitalize' }}>
              {t.replace('-',' ')}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div style={{ marginBottom: 16 }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, color: '#374151', background: '#fff' }}>
            <option value="">All Forecast Types</option>
            {forecastTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
        </div>

        {loading ? (
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading reports...</p>
        ) : tab === 'accuracy' ? (
          <>
            <div style={card}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Accuracy by Forecast Type</h3>
              {accuracy.length === 0
                ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>No actualized predictions yet. Once actual values are recorded, accuracy metrics will appear here.</p>
                : (
                  <>
                    <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#F9FAFB' }}>
                            {['Forecast Type','Actualized Count','Avg MAPE (%)','Avg Accuracy (%)'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {accuracy.map(a => (
                            <tr key={a.forecastType} style={{ borderBottom: '1px solid #F3F4F6' }}>
                              <td style={{ padding: '10px 14px', textTransform: 'capitalize', fontWeight: 600 }}>{a.forecastType}</td>
                              <td style={{ padding: '10px 14px' }}>{a.count}</td>
                              <td style={{ padding: '10px 14px', color: a.avgMAPE > 15 ? '#DC2626' : a.avgMAPE > 8 ? '#D97706' : '#16A34A' }}>{a.avgMAPE?.toFixed(1)}%</td>
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: a.avgAccuracy >= 90 ? '#16A34A' : a.avgAccuracy >= 80 ? '#D97706' : '#DC2626' }}>{a.avgAccuracy?.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={accuracy}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="forecastType" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip formatter={v => `${v?.toFixed(1)}%`} />
                        <Legend />
                        <Bar dataKey="avgAccuracy" fill="#3B82F6" name="Accuracy %" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )
              }
            </div>
          </>
        ) : tab === 'history' ? (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Prediction History ({history.length})</h3>
            {errorChart.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Actual vs Predicted (last 20)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={errorChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip formatter={v => v?.toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="actual"    stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} name="Predicted" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Code','Type','Period','Predicted','Actual','Error %','MAPE','Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 50).map(h => (
                    <tr key={h._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 10, color: '#9CA3AF' }}>{h.historyCode}</td>
                      <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{h.forecastType}</td>
                      <td style={{ padding: '8px 12px' }}>{h.period}</td>
                      <td style={{ padding: '8px 12px' }}>{h.predictedValue?.toLocaleString()}</td>
                      <td style={{ padding: '8px 12px' }}>{h.actualValue?.toLocaleString() ?? '-'}</td>
                      <td style={{ padding: '8px 12px', color: h.errorPct > 15 ? '#DC2626' : '#16A34A' }}>{h.errorPct != null ? `${h.errorPct?.toFixed(1)}%` : '-'}</td>
                      <td style={{ padding: '8px 12px' }}>{h.mape != null ? `${h.mape?.toFixed(1)}%` : '-'}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: 10, background: h.isActualized ? '#DCFCE7' : '#FEF9C3', color: h.isActualized ? '#16A34A' : '#92400E', padding: '2px 6px', borderRadius: 10 }}>{h.isActualized ? 'Actualized' : 'Pending'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Model Performance</h3>
            {modelPerf.length === 0
              ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>No actualized data available to compute model performance.</p>
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Forecast Type','Actualized Count','Avg MAPE (%)','Accuracy (%)'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modelPerf.map(p => (
                        <tr key={p.forecastType} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 14px', textTransform: 'capitalize', fontWeight: 600 }}>{p.forecastType}</td>
                          <td style={{ padding: '10px 14px' }}>{p.count}</td>
                          <td style={{ padding: '10px 14px', color: p.avgMAPE > 15 ? '#DC2626' : '#16A34A' }}>{p.avgMAPE != null ? `${p.avgMAPE?.toFixed(1)}%` : 'N/A'}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#2563EB' }}>{p.accuracy != null ? `${p.accuracy?.toFixed(1)}%` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
