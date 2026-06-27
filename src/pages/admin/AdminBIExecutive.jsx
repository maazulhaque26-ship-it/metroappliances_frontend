import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchCEODashboard, fetchCFODashboard, fetchCHRODashboard,
  fetchManufacturingDashboard, fetchSalesDashboard, fetchEnterpriseHealth,
  exportBoardPack, fetchDeptScorecard,
} from '../../services/biAPI';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ROLES = [
  { key: 'ceo',           label: 'CEO — Chief Executive',       fetch: fetchCEODashboard },
  { key: 'cfo',           label: 'CFO — Chief Financial',       fetch: fetchCFODashboard },
  { key: 'chro',          label: 'CHRO — Human Resources',      fetch: fetchCHRODashboard },
  { key: 'manufacturing', label: 'COO — Manufacturing',         fetch: fetchManufacturingDashboard },
  { key: 'sales',         label: 'CSO — Sales Executive',       fetch: fetchSalesDashboard },
  { key: 'enterprise',    label: 'Board — Enterprise Health',   fetch: fetchEnterpriseHealth },
];

const COLORS = ['#FF7A00','#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#D4AF37','#06B6D4'];

function renderValue(v) {
  if (typeof v !== 'number') return v;
  if (v >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

function ChartBlock({ title, data }) {
  if (!Array.isArray(data) || !data.length) return null;
  const keys = Object.keys(data[0]).filter(k => k !== '_id' && k !== 'name' && k !== 'month' && k !== 'year');
  if (!keys.length) return null;

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '12px', textTransform: 'capitalize' }}>
        {title.replace(/_/g, ' ')}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          {keys.map((k, i) => (
            <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MetricGrid({ data }) {
  const SKIP = new Set(['generatedAt', 'period', 'type', '_id']);
  const sections = Object.entries(data || {}).filter(([k]) => !SKIP.has(k));

  return (
    <div>
      {sections.map(([section, val]) => {
        if (!val || typeof val !== 'object') return null;

        const numerics = Object.entries(val).filter(([, v]) => typeof v === 'number');
        const arrays   = Object.entries(val).filter(([, v]) => Array.isArray(v) && v.length > 0);

        if (!numerics.length && !arrays.length) return null;

        return (
          <div key={section} style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280', marginBottom: '10px' }}>
              {section.replace(/_/g, ' ')}
            </div>
            {numerics.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {numerics.slice(0, 6).map(([k, v]) => (
                  <div key={k} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '4px' }}>{k.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#111' }}>{renderValue(v)}</div>
                  </div>
                ))}
              </div>
            )}
            {arrays.slice(0, 1).map(([k, arr]) => <ChartBlock key={k} title={k} data={arr} />)}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminBIExecutive() {
  const [activeRole,  setActiveRole]  = useState(0);
  const [cache,       setCache]       = useState({});
  const [loading,     setLoading]     = useState(false);
  const [exporting,   setExporting]   = useState(false);

  const role = ROLES[activeRole];

  useEffect(() => {
    if (cache[role.key] !== undefined) return;
    setLoading(true);
    role.fetch()
      .then(r => setCache(prev => ({ ...prev, [role.key]: r.data?.data || r.data || {} })))
      .catch(() => setCache(prev => ({ ...prev, [role.key]: {} })))
      .finally(() => setLoading(false));
  }, [activeRole]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const r = await exportBoardPack(format);
      const isCSV = format === 'csv';
      const blob  = new Blob([isCSV ? r.data : JSON.stringify(r.data?.data || r.data, null, 2)], { type: isCSV ? 'text/csv' : 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `executive-report.${format}`;
      a.click();
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>Executive View</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>Role-specific enterprise analytics</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleExport('csv')}  disabled={exporting} style={{ padding: '8px 14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Export CSV</button>
            <button onClick={() => handleExport('json')} disabled={exporting} style={{ padding: '8px 14px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Export JSON</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {ROLES.map((r, i) => (
            <button key={r.key} onClick={() => setActiveRole(i)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: activeRole === i ? 'none' : '1px solid #E5E7EB', background: activeRole === i ? '#FF7A00' : '#fff', color: activeRole === i ? '#fff' : '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              {r.label.split(' — ')[0]}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>{role.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {ROLES.map((r, i) => (
                <button key={r.key} onClick={() => setActiveRole(i)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: 'none', background: activeRole === i ? '#FFF3E8' : 'transparent', color: activeRole === i ? '#FF7A00' : '#374151', fontWeight: activeRole === i ? 700 : 500, fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                Loading {role.label} data…
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
                <MetricGrid data={cache[role.key]} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
