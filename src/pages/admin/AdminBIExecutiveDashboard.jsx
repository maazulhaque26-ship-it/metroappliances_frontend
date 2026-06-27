import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchCEODashboard, fetchCOODashboard, fetchCFODashboard, fetchCHRODashboard,
  fetchOperationsDashboard, fetchManufacturingDashboard, fetchSupplyChainDashboard,
  fetchSalesDashboard, fetchCustomerDashboard, fetchProjectsDashboard, fetchEnterpriseHealth,
} from '../../services/biAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = [
  { key: 'ceo',           label: 'CEO',           fetch: fetchCEODashboard },
  { key: 'coo',           label: 'COO',           fetch: fetchCOODashboard },
  { key: 'cfo',           label: 'CFO',           fetch: fetchCFODashboard },
  { key: 'chro',          label: 'CHRO',          fetch: fetchCHRODashboard },
  { key: 'operations',    label: 'Operations',    fetch: fetchOperationsDashboard },
  { key: 'manufacturing', label: 'Manufacturing', fetch: fetchManufacturingDashboard },
  { key: 'supply_chain',  label: 'Supply Chain',  fetch: fetchSupplyChainDashboard },
  { key: 'sales',         label: 'Sales',         fetch: fetchSalesDashboard },
  { key: 'customer',      label: 'Customer',      fetch: fetchCustomerDashboard },
  { key: 'projects',      label: 'Projects',      fetch: fetchProjectsDashboard },
  { key: 'enterprise',    label: 'Enterprise',    fetch: fetchEnterpriseHealth },
];

const fmtVal = (v) => {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (v >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `₹${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
};

function MetricCard({ label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 900, color: '#111' }}>{fmtVal(value)}</div>
    </div>
  );
}

function SectionBlock({ name, val }) {
  if (!val || typeof val !== 'object') return null;

  const numerics = Object.entries(val).filter(([, v]) => typeof v === 'number');
  const arrays   = Object.entries(val).filter(([, v]) => Array.isArray(v) && v.length > 0);

  if (!numerics.length && !arrays.length) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280', marginBottom: '12px' }}>
        {name.replace(/_/g, ' ')}
      </h3>
      {numerics.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          {numerics.slice(0, 8).map(([k, v]) => (
            <MetricCard key={k} label={k.replace(/_/g, ' ')} value={v > 9999 ? v : v} />
          ))}
        </div>
      )}
      {arrays.slice(0, 1).map(([k, arr]) => (
        <div key={k} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '12px', textTransform: 'capitalize' }}>
            {k.replace(/_/g, ' ')}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={arr}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF7A00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}

function TabContent({ data }) {
  if (!data) return null;
  const SKIP = new Set(['generatedAt', 'period', 'type', '_id']);
  const sections = Object.entries(data).filter(([k]) => !SKIP.has(k));
  return (
    <div>
      {data.period && (
        <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '16px' }}>
          MTD from {data.period?.mtd} · YTD from {data.period?.ytd}
        </p>
      )}
      {sections.map(([k, v]) => <SectionBlock key={k} name={k} val={v} />)}
    </div>
  );
}

export default function AdminBIExecutiveDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [cache, setCache]         = useState({});
  const [loading, setLoading]     = useState(false);

  const loadTab = useCallback(async (idx) => {
    const tab = TABS[idx];
    if (cache[tab.key] !== undefined) return;
    setLoading(true);
    try {
      const res = await tab.fetch();
      setCache(prev => ({ ...prev, [tab.key]: res.data?.data || res.data || {} }));
    } catch {
      setCache(prev => ({ ...prev, [tab.key]: {} }));
    } finally {
      setLoading(false);
    }
  }, [cache]);

  useEffect(() => { loadTab(activeTab); }, [activeTab]);

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>
            Executive BI Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>
            Cross-module analytics · 11 executive views
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
                background: activeTab === i ? '#FF7A00' : '#fff',
                color:      activeTab === i ? '#fff'    : '#374151',
                border:     activeTab === i ? 'none'    : '1px solid #E5E7EB',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', fontSize: '14px' }}>
            Loading {TABS[activeTab].label} dashboard…
          </div>
        ) : (
          <TabContent data={cache[TABS[activeTab].key]} />
        )}
      </div>
    </AdminLayout>
  );
}
