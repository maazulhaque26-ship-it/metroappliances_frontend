import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchEnterpriseHealth, fetchCrossModuleAnalytics, fetchHeatmap } from '../../services/biAPI';

const MODULE_ICONS = {
  sales: '🛒', finance: '💰', hr: '👥', manufacturing: '🏭', procurement: '📦',
  service: '🔧', projects: '📋', assets: '⚙️', platform: '🖥️', crm: '🎯',
};

function HealthCard({ module, data }) {
  const numericKpis = data && typeof data === 'object'
    ? Object.entries(data).filter(([, v]) => typeof v === 'number').slice(0, 4)
    : [];

  const hasData = numericKpis.some(([, v]) => v > 0);
  const statusColor = hasData ? '#10B981' : '#9CA3AF';
  const status      = hasData ? 'Active'   : 'No data';

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{MODULE_ICONS[module] || '📊'}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#111', textTransform: 'capitalize' }}>
            {module.replace(/_/g, ' ')}
          </span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor, background: statusColor + '1A', padding: '2px 8px', borderRadius: '99px' }}>
          {status}
        </span>
      </div>
      {numericKpis.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {numericKpis.map(([k, v]) => (
            <div key={k} style={{ background: '#F9FAFB', borderRadius: '6px', padding: '6px 8px' }}>
              <div style={{ fontSize: '9px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>{k.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#111' }}>{v > 9999 ? `${(v/1000).toFixed(0)}K` : v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBIEnterpriseHealth() {
  const [health,       setHealth]      = useState(null);
  const [crossModule,  setCrossModule] = useState(null);
  const [activeHeatmap, setHeatmap]   = useState('sales');
  const [heatData,     setHeatData]   = useState([]);
  const [loading,      setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([fetchEnterpriseHealth(), fetchCrossModuleAnalytics()])
      .then(([h, c]) => {
        setHealth(h.data?.data || h.data || {});
        setCrossModule(c.data?.data || c.data || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadHeatmap = async (module) => {
    setHeatmap(module);
    try {
      const r = await fetchHeatmap(module);
      setHeatData(r.data?.data || r.data || []);
    } catch { setHeatData([]); }
  };

  const SKIP = new Set(['generatedAt', 'type', '_id', 'period']);
  const modules = health ? Object.entries(health).filter(([k]) => !SKIP.has(k)) : [];

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>Enterprise Health</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>Cross-module activity and platform health</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading enterprise health…</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {modules.map(([k, v]) => <HealthCard key={k} module={k} data={v} />)}
            </div>

            {crossModule && (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Cross-Module Overview</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {Object.entries(crossModule)
                    .filter(([, v]) => typeof v === 'number')
                    .slice(0, 10)
                    .map(([k, v]) => (
                      <div key={k} style={{ background: '#F9FAFB', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '4px' }}>{k.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#111' }}>{v > 9999 ? `${(v/1000).toFixed(0)}K` : v}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>Activity Heatmap (90 days)</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['sales','service','manufacturing'].map(m => (
                    <button key={m} onClick={() => loadHeatmap(m)}
                      style={{ padding: '5px 10px', borderRadius: '6px', border: activeHeatmap === m ? 'none' : '1px solid #E5E7EB', background: activeHeatmap === m ? '#FF7A00' : '#fff', color: activeHeatmap === m ? '#fff' : '#374151', fontWeight: 600, fontSize: '11px', cursor: 'pointer', textTransform: 'capitalize' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              {heatData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: '13px' }}>
                  No heatmap data. Click a module above to load.
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                  {heatData.map((d, i) => {
                    const max = Math.max(...heatData.map(x => x.count || 0), 1);
                    const opacity = ((d.count || 0) / max) * 0.9 + 0.1;
                    return (
                      <div
                        key={i}
                        title={`${d._id || d.date}: ${d.count || 0}`}
                        style={{ width: '12px', height: '12px', borderRadius: '2px', background: `rgba(255,122,0,${opacity})` }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
