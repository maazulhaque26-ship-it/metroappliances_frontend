import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchAnomalies, fetchAnomalyStats,
  detectAllAnomalies, detectDemandAnomalies, detectInventoryAnomalies,
  detectCashAnomalies, detectProductionAnomalies, resolveAnomaly,
} from '../../services/aiAPI';

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 };

const SEV_COLOR = { critical: '#DC2626', high: '#EA580C', medium: '#D97706', low: '#16A34A' };
const SEV_BG    = { critical: '#FEF2F2', high: '#FFF7ED', medium: '#FFFBEB', low: '#F0FDF4' };

const SCAN_BUTTONS = [
  { label: 'Scan All',        fn: detectAllAnomalies,        color: '#1F2937' },
  { label: 'Demand',          fn: detectDemandAnomalies,     color: '#7C3AED' },
  { label: 'Inventory',       fn: detectInventoryAnomalies,  color: '#EA580C' },
  { label: 'Cash Flow',       fn: detectCashAnomalies,       color: '#D97706' },
  { label: 'Production',      fn: detectProductionAnomalies, color: '#059669' },
];

export default function AdminAIAnomalyCenter() {
  const [anomalies, setAnomalies] = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [scanning,  setScanning]  = useState(null);
  const [msg,       setMsg]       = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [sevFilter, setSevFilter]  = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = { limit: 50 };
    if (!showResolved) params.isResolved = false;
    if (sevFilter)     params.severity   = sevFilter;
    Promise.all([fetchAnomalies(params), fetchAnomalyStats()])
      .then(([a, s]) => {
        setAnomalies(a.data.data?.data || a.data.data || []);
        setStats(s.data.data || s.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [showResolved, sevFilter]);

  useEffect(() => { load(); }, [load]);

  const scan = async (sb) => {
    setScanning(sb.label);
    setMsg('');
    try {
      const r = await sb.fn();
      const detected = r.data.data?.detected ?? 0;
      setMsg(`✓ ${sb.label} scan complete — ${detected} anomaly(s) detected`);
      load();
    } catch { setMsg(`✗ Scan failed for ${sb.label}`); }
    finally  { setScanning(null); }
  };

  const resolve = async (id) => {
    const note = window.prompt('Resolution note (optional):') || '';
    await resolveAnomaly(id, { resolutionNote: note }).catch(() => {});
    load();
  };

  return (
    <AdminLayout>
      <div style={{ padding: '28px 32px', fontFamily: 'Poppins, sans-serif', maxWidth: 1400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>AI Anomaly Detection Center</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Real-time anomaly detection across all ERP modules</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', color: msg.startsWith('✓') ? '#16A34A' : '#DC2626', marginBottom: 16, fontSize: 13 }}>{msg}</div>}

        {/* Stats Row */}
        {stats && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
            {(stats.bySeverity || []).map(s => (
              <div key={s._id} style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `3px solid ${SEV_COLOR[s._id] || '#9CA3AF'}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: SEV_COLOR[s._id] || '#1F2937' }}>{s.count}</div>
                <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'capitalize' }}>{s._id}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.unresolved} open</div>
              </div>
            ))}
            <div style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: '3px solid #3B82F6' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#3B82F6' }}>{stats.last7Days || 0}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Last 7 Days</div>
            </div>
          </div>
        )}

        {/* Scan Panel */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Run Anomaly Scan</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {SCAN_BUTTONS.map(sb => (
              <button
                key={sb.label}
                onClick={() => scan(sb)}
                disabled={!!scanning}
                style={{ background: sb.color, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: scanning === sb.label ? 0.6 : 1 }}
              >
                {scanning === sb.label ? 'Scanning...' : `Scan ${sb.label}`}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={sevFilter} onChange={e => setSevFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, color: '#374151', background: '#fff' }}>
            <option value="">All Severities</option>
            {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <label style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} />
            Show Resolved
          </label>
        </div>

        {/* Anomaly List */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Anomalies ({anomalies.length})</h3>
          {loading
            ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading...</p>
            : anomalies.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ color: '#16A34A', fontSize: 14, fontWeight: 600 }}>No anomalies found!</p>
                <p style={{ color: '#9CA3AF', fontSize: 13 }}>Run a scan to detect anomalies across modules.</p>
              </div>
            : anomalies.map(a => (
              <div key={a._id} style={{ border: `1px solid ${SEV_COLOR[a.severity]}40`, borderLeft: `4px solid ${SEV_COLOR[a.severity]}`, borderRadius: 10, padding: '14px 18px', marginBottom: 12, background: a.isResolved ? '#F9FAFB' : SEV_BG[a.severity] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'capitalize', color: SEV_COLOR[a.severity] }}>{a.severity?.toUpperCase()}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1F2937', textTransform: 'capitalize' }}>{a.type?.replace(/_/g,' ')}</span>
                      <span style={{ fontSize: 11, color: '#6B7280', background: '#E5E7EB', padding: '1px 8px', borderRadius: 10 }}>{a.module}</span>
                      {a.isResolved && <span style={{ fontSize: 11, background: '#DCFCE7', color: '#16A34A', padding: '1px 8px', borderRadius: 10 }}>Resolved</span>}
                    </div>
                    <p style={{ color: '#374151', fontSize: 13, margin: '0 0 4px' }}>{a.description || `${a.metric}: actual ${a.actualValue?.toLocaleString()} vs expected ${a.expectedValue?.toLocaleString()}`}</p>
                    {a.deviationPct != null && (
                      <p style={{ color: '#9CA3AF', fontSize: 11, margin: 0 }}>Deviation: {a.deviationPct?.toFixed(1)}% · Detected: {new Date(a.detectedAt || a.createdAt).toLocaleDateString()}</p>
                    )}
                    {a.isResolved && a.resolutionNote && (
                      <p style={{ color: '#16A34A', fontSize: 11, margin: '4px 0 0' }}>Resolution: {a.resolutionNote}</p>
                    )}
                  </div>
                  {!a.isResolved && (
                    <button onClick={() => resolve(a._id)} style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Mark Resolved</button>
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
