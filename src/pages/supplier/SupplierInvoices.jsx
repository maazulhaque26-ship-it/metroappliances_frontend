import React, { useState } from 'react';
import { FiFile, FiSearch, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import SectionHeader from '../../components/shared/SectionHeader';

const fmtCurrency = v => `₹${(v || 0).toLocaleString('en-IN')}`;

const SEED_INVOICES = [
  { id: 'INV-0031', poNumber: 'PO-2024-0041', amount: 84500,  status: 'pending',  dueDate: '2024-08-15', issuedDate: '2024-07-28' },
  { id: 'INV-0030', poNumber: 'PO-2024-0039', amount: 124500, status: 'paid',     dueDate: '2024-07-20', issuedDate: '2024-07-05' },
  { id: 'INV-0029', poNumber: 'PO-2024-0037', amount: 56000,  status: 'paid',     dueDate: '2024-07-10', issuedDate: '2024-06-25' },
  { id: 'INV-0028', poNumber: 'PO-2024-0035', amount: 200000, status: 'overdue',  dueDate: '2024-07-01', issuedDate: '2024-06-16' },
  { id: 'INV-0027', poNumber: 'PO-2024-0033', amount: 37800,  status: 'pending',  dueDate: '2024-08-05', issuedDate: '2024-07-21' },
  { id: 'INV-0026', poNumber: 'PO-2024-0031', amount: 91200,  status: 'paid',     dueDate: '2024-06-30', issuedDate: '2024-06-15' },
];

const STATUS_CONFIG = {
  paid:    { icon: FiCheckCircle, color: '#10B981', bg: '#D1FAE5', label: 'Paid' },
  pending: { icon: FiClock,       color: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
  overdue: { icon: FiAlertCircle, color: '#EF4444', bg: '#FEE2E2', label: 'Overdue' },
};

const TABS = ['All', 'Pending', 'Paid', 'Overdue'];

export default function SupplierInvoices() {
  const [tab, setTab]       = useState('All');
  const [search, setSearch] = useState('');

  const filtered = SEED_INVOICES.filter(inv => {
    const tabMatch  = tab === 'All' || inv.status === tab.toLowerCase();
    const srchMatch = !search.trim() || inv.id.toLowerCase().includes(search.toLowerCase()) || inv.poNumber.toLowerCase().includes(search.toLowerCase());
    return tabMatch && srchMatch;
  });

  const outstanding = SEED_INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPaid   = SEED_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 space-y-5">
      <SectionHeader title="Invoices" subtitle="Invoice and payment tracking" />

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Outstanding', value: fmtCurrency(outstanding), color: '#F59E0B', bg: '#FEF3C7', icon: FiClock },
          { label: 'Paid (All Time)', value: fmtCurrency(totalPaid), color: '#10B981', bg: '#D1FAE5', icon: FiCheckCircle },
          { label: 'Total Invoices', value: SEED_INVOICES.length, color: '#FF7A00', bg: '#FFF7ED', icon: FiFile },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl p-4" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-4,#6B7280)', marginTop: 4 }}>{c.label}</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={c.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border,#E5E7EB)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '9px 18px', border: 'none', background: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: tab === t ? 700 : 400,
                color:      tab === t ? '#FF7A00' : 'var(--text-4,#6B7280)',
                borderBottom: tab === t ? '2px solid #FF7A00' : '2px solid transparent',
                marginBottom: -2,
              }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FiSearch size={13} color="#9CA3AF" style={{ position: 'absolute', left: 10, pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice / PO…"
            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid var(--border,#E5E7EB)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: 'var(--card,#fff)', color: 'var(--text,#111827)', outline: 'none', width: 210 }} />
        </div>
      </div>

      {/* Invoice cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
          <FiFile size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
          <p style={{ fontSize: 13, color: 'var(--text-4,#9CA3AF)' }}>No invoices found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(inv => {
            const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <div key={inv.id} className="rounded-2xl" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderLeft: `4px solid ${cfg.color}`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#FF7A00' }}>{inv.id}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-4,#6B7280)' }}>·</span>
                    <span style={{ fontSize: 12, color: 'var(--text-4,#6B7280)' }}>PO: {inv.poNumber}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
                      <Icon size={10} />{cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text,#111827)' }}>{fmtCurrency(inv.amount)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-4,#9CA3AF)', marginTop: 3 }}>
                    Issued: {new Date(inv.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    &nbsp;·&nbsp;
                    Due: {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
