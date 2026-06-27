import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchBoardPack, fetchManagementSummary, exportBoardPack } from '../../services/biAPI';

const fmt = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₹${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

function StatCard({ label, value, accent = '#FF7A00' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px', borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 900, color: '#111' }}>{value}</div>
    </div>
  );
}

export default function AdminBIBoardReports() {
  const [boardPack, setBoardPack]   = useState(null);
  const [summary,   setSummary]     = useState(null);
  const [activeTab, setActiveTab]   = useState('board');
  const [loading,   setLoading]     = useState(false);
  const [exporting, setExporting]   = useState(false);

  useEffect(() => {
    if (activeTab === 'board' && !boardPack) {
      setLoading(true);
      fetchBoardPack().then(r => setBoardPack(r.data?.data || r.data)).catch(console.error).finally(() => setLoading(false));
    }
    if (activeTab === 'summary' && !summary) {
      setLoading(true);
      fetchManagementSummary().then(r => setSummary(r.data?.data || r.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const r = await exportBoardPack(format);
      if (format === 'csv') {
        const blob = new Blob([r.data], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'board-pack.csv'; a.click();
      } else {
        const blob = new Blob([JSON.stringify(r.data?.data || r.data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'board-pack.json'; a.click();
      }
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const bp = boardPack;

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>Board Reports</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>Board pack · Management summary · Export</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleExport('csv')}  disabled={exporting} style={{ padding: '8px 14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Export CSV</button>
            <button onClick={() => handleExport('json')} disabled={exporting} style={{ padding: '8px 14px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Export JSON</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { key: 'board',   label: 'Board Pack' },
            { key: 'summary', label: 'Management Summary' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: activeTab === t.key ? 'none' : '1px solid #E5E7EB', background: activeTab === t.key ? '#FF7A00' : '#fff', color: activeTab === t.key ? '#fff' : '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading…</div>}

        {!loading && activeTab === 'board' && bp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px' }}>Executive Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <StatCard label="Revenue YTD"      value={fmt(bp.executive?.revenue?.ytd)}    accent="#FF7A00" />
                <StatCard label="Revenue MTD"      value={fmt(bp.executive?.revenue?.mtd)}    accent="#F59E0B" />
                <StatCard label="Orders YTD"       value={bp.executive?.revenue?.ytdOrders || '—'} accent="#3B82F6" />
                <StatCard label="Headcount"        value={bp.executive?.headcount || '—'}     accent="#10B981" />
                <StatCard label="Active Projects"  value={bp.executive?.activeProjects || '—'} accent="#8B5CF6" />
                <StatCard label="Open Tickets"     value={bp.executive?.openServiceTickets || '—'} accent="#EF4444" />
              </div>
            </div>

            {bp.finance && (
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px' }}>Finance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {['ar','ap'].map(k => (
                    <div key={k} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>{k === 'ar' ? 'Accounts Receivable' : 'Accounts Payable'}</div>
                      {(bp.finance[k] || []).map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F3F4F6', fontSize: '12px' }}>
                          <span style={{ color: '#374151', textTransform: 'capitalize' }}>{s._id}</span>
                          <span style={{ fontWeight: 700 }}>{fmt(s.total)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'right' }}>
              Generated: {bp.generatedAt ? new Date(bp.generatedAt).toLocaleString() : '—'}
            </div>
          </div>
        )}

        {!loading && activeTab === 'summary' && summary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <StatCard label="Revenue MTD"    value={fmt(summary.revenue?.total)}                 accent="#FF7A00" />
              <StatCard label="Orders MTD"     value={summary.revenue?.count || '—'}               accent="#3B82F6" />
              <StatCard label="Headcount"      value={summary.hr?.headcount || '—'}                accent="#10B981" />
              <StatCard label="Pending Orders" value={summary.operations?.pendingOrders || '—'}    accent="#F59E0B" />
              <StatCard label="Open Service"   value={summary.operations?.openService || '—'}      accent="#EF4444" />
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'right' }}>
              Generated: {summary.generatedAt ? new Date(summary.generatedAt).toLocaleString() : '—'}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
