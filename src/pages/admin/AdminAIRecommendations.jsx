import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchRecommendations, fetchRecommendationStats,
  generateAllRecommendations, generateInventoryRecommendations,
  generateProductionRecommendations, generateHRRecommendations,
  generateMaintenanceRecommendations, updateRecommendationStatus,
} from '../../services/aiAPI';

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 };

const PRIORITY_COLOR = { critical: '#DC2626', high: '#EA580C', medium: '#D97706', low: '#16A34A' };
const STATUS_COLOR   = { pending: '#D97706', accepted: '#2563EB', rejected: '#DC2626', implemented: '#16A34A', dismissed: '#9CA3AF' };

const GEN_BUTTONS = [
  { label: 'All Modules',  fn: generateAllRecommendations,         color: '#1F2937' },
  { label: 'Inventory',    fn: generateInventoryRecommendations,   color: '#EA580C' },
  { label: 'Production',   fn: generateProductionRecommendations,  color: '#059669' },
  { label: 'HR',           fn: generateHRRecommendations,          color: '#0891B2' },
  { label: 'Maintenance',  fn: generateMaintenanceRecommendations, color: '#7C3AED' },
];

export default function AdminAIRecommendations() {
  const [recs,    setRecs]    = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);
  const [msg,     setMsg]     = useState('');
  const [filter,  setFilter]  = useState({ status: '', priority: '', type: '' });

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filter.status)   params.status   = filter.status;
    if (filter.priority) params.priority = filter.priority;
    if (filter.type)     params.type     = filter.type;
    Promise.all([fetchRecommendations(params), fetchRecommendationStats()])
      .then(([r, s]) => {
        setRecs(r.data.data?.data || r.data.data || []);
        setStats(s.data.data || s.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const generate = async (gb) => {
    setRunning(gb.label);
    setMsg('');
    try {
      const r = await gb.fn();
      const generated = r.data.data?.generated ?? 0;
      setMsg(`✓ Generated ${generated} recommendation(s) for ${gb.label}`);
      load();
    } catch { setMsg(`✗ Failed to generate recommendations for ${gb.label}`); }
    finally { setRunning(null); }
  };

  const updateStatus = async (id, status) => {
    await updateRecommendationStatus(id, { status }).catch(() => {});
    load();
  };

  return (
    <AdminLayout>
      <div style={{ padding: '28px 32px', fontFamily: 'Poppins, sans-serif', maxWidth: 1400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>AI Recommendations</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>AI-generated action recommendations across all ERP modules</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', color: msg.startsWith('✓') ? '#16A34A' : '#DC2626', marginBottom: 16, fontSize: 13 }}>{msg}</div>}

        {/* Stats */}
        {stats && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1F2937' }}>{stats.total || 0}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Total</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A' }}>{stats.implementedCount || 0}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Implemented</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB' }}>{stats.implementationRate || 0}%</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Impl. Rate</div>
            </div>
          </div>
        )}

        {/* Generate */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Generate Recommendations</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {GEN_BUTTONS.map(gb => (
              <button
                key={gb.label}
                onClick={() => generate(gb)}
                disabled={!!running}
                style={{ background: gb.color, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: running === gb.label ? 0.6 : 1 }}
              >
                {running === gb.label ? 'Running...' : gb.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['status', ['','pending','accepted','rejected','implemented','dismissed']],
            ['priority', ['','critical','high','medium','low']],
            ['type', ['','inventory','production','procurement','hiring','training','project','maintenance','cashflow','portfolio','sales']],
          ].map(([key, opts]) => (
            <select key={key} value={filter[key]} onChange={e => setFilter(f => ({ ...f, [key]: e.target.value }))}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, color: '#374151', background: '#fff' }}>
              {opts.map(o => <option key={o} value={o}>{o ? o.charAt(0).toUpperCase() + o.slice(1) : `All ${key}s`}</option>)}
            </select>
          ))}
        </div>

        {/* List */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Recommendations ({recs.length})</h3>
          {loading
            ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading...</p>
            : recs.length === 0
            ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>No recommendations found.</p>
            : recs.map(r => (
              <div key={r._id} style={{ border: `1px solid #E5E7EB`, borderLeft: `4px solid ${PRIORITY_COLOR[r.priority] || '#9CA3AF'}`, borderRadius: 10, padding: '14px 18px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>{r.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: PRIORITY_COLOR[r.priority], background: PRIORITY_COLOR[r.priority] + '18', padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase' }}>{r.priority}</span>
                      <span style={{ fontSize: 10, color: STATUS_COLOR[r.status], background: STATUS_COLOR[r.status] + '18', padding: '2px 8px', borderRadius: 12 }}>{r.status}</span>
                      <span style={{ fontSize: 10, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 12, textTransform: 'capitalize' }}>{r.type}</span>
                    </div>
                    <p style={{ color: '#4B5563', fontSize: 13, margin: 0 }}>{r.description}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 11, margin: '6px 0 0' }}>Confidence: {r.confidence}% · Source: {r.source} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => updateStatus(r._id, 'accepted')}   style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Accept</button>
                      <button onClick={() => updateStatus(r._id, 'dismissed')} style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>Dismiss</button>
                    </div>
                  )}
                  {r.status === 'accepted' && (
                    <button onClick={() => updateStatus(r._id, 'implemented')} style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Mark Done</button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </AdminLayout>
  );
}
