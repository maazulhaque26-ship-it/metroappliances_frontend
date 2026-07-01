import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiChevronUp, FiChevronDown, FiDollarSign, FiDownload, FiSearch, FiX } from 'react-icons/fi';
import { essGetPayslips } from '../../services/employeeSelfServiceAPI';

const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);

function PayslipRow({ ps }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid var(--border,#E5E7EB)' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg,#F9FAFB)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text,#111)' }}>
              {ps.period?.name || ps.periodName || ps.period || '—'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-4,#9CA3AF)', marginTop: '2px' }}>
              {ps.payDate ? new Date(ps.payDate).toLocaleDateString('en-IN') : (ps.createdAt ? new Date(ps.createdAt).toLocaleDateString('en-IN') : '—')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-4,#9CA3AF)' }}>Gross: </span>
              <span style={{ fontWeight: 600, color: 'var(--text-2,#374151)' }}>₹{fmt(ps.grossPay || ps.gross)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-4,#9CA3AF)' }}>Deductions: </span>
              <span style={{ fontWeight: 600, color: '#EF4444' }}>₹{fmt(ps.totalDeductions || ps.deductions)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-4,#9CA3AF)' }}>Net: </span>
              <span style={{ fontWeight: 700, color: '#10B981' }}>₹{fmt(ps.netPay)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); alert('Contact HR for a PDF payslip copy.'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '6px', background: 'var(--card,#fff)', fontSize: '12px', color: 'var(--text-2,#374151)', cursor: 'pointer', fontFamily: 'inherit' }}
            aria-label="Download payslip"
          >
            <FiDownload size={12} aria-hidden="true" />
            Download
          </button>
          <span style={{ color: 'var(--text-4,#9CA3AF)', display: 'flex', alignItems: 'center' }}>
            {open ? <FiChevronUp size={16} aria-hidden="true" /> : <FiChevronDown size={16} aria-hidden="true" />}
          </span>
        </div>
      </div>

      {open && (
        <div style={{ padding: '0 20px 16px', background: 'var(--bg,#F9FAFB)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Earnings */}
            <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Earnings</div>
              {(ps.earnings || ps.salaryComponents || []).filter(c => c.type === 'earning' || !c.type).map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--bg,#F9FAFB)' }}>
                  <span style={{ color: 'var(--text-2,#374151)' }}>{c.name || c.component}</span>
                  <span style={{ fontWeight: 500, color: 'var(--text,#111)' }}>₹{fmt(c.amount)}</span>
                </div>
              ))}
              {!(ps.earnings || ps.salaryComponents || []).length && (
                <div style={{ fontSize: '12px', color: 'var(--text-4,#9CA3AF)' }}>Basic: ₹{fmt(ps.basicPay || ps.basic)}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: 'var(--text,#111)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border,#E5E7EB)' }}>
                <span>Total Earnings</span>
                <span>₹{fmt(ps.grossPay || ps.gross)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Deductions</div>
              {(ps.deductionBreakdown || ps.salaryComponents || []).filter(c => c.type === 'deduction').map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--bg,#F9FAFB)' }}>
                  <span style={{ color: 'var(--text-2,#374151)' }}>{c.name || c.component}</span>
                  <span style={{ fontWeight: 500, color: '#EF4444' }}>₹{fmt(c.amount)}</span>
                </div>
              ))}
              {!(ps.deductionBreakdown || []).length && ps.totalDeductions > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-4,#9CA3AF)' }}>Total Deductions: ₹{fmt(ps.totalDeductions)}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#EF4444', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border,#E5E7EB)' }}>
                <span>Total Deductions</span>
                <span>₹{fmt(ps.totalDeductions || ps.deductions)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 20px', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-4,#9CA3AF)' }}>Net Pay</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>₹{fmt(ps.netPay)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ESSMyPayroll() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.employeeAuth);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');

  const load = useCallback(() => {
    if (!token) { navigate('/employee/login'); return; }
    setLoading(true);
    essGetPayslips({ limit: 24 })
      .then(r => setPayslips(r.data.data || r.data.payslips || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load payslips'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? payslips.filter(ps => {
        const period = (ps.period?.name || ps.periodName || ps.period || '').toLowerCase();
        return period.includes(search.toLowerCase());
      })
    : payslips;

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>My Payslips</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', marginBottom: 0 }}>Click a row to expand salary breakdown</p>
        </div>
        <div style={{ position: 'relative', width: '240px' }}>
          <FiSearch size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search period…"
            style={{ width: '100%', padding: '8px 32px 8px 32px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--text,#111)', background: 'var(--card,#fff)', outline: 'none', boxSizing: 'border-box' }}
            aria-label="Search payslips"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-4,#9CA3AF)', display: 'flex', alignItems: 'center', padding: 0 }} aria-label="Clear search">
              <FiX size={13} />
            </button>
          )}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-4,#9CA3AF)' }}>Loading…</div>}
      {error   && <div style={{ color: '#EF4444', fontSize: '13px', padding: '12px 16px', background: '#FEF2F2', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px', borderBottom: '1px solid var(--border,#E5E7EB)' }}>
            <FiDollarSign size={15} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>
              {filtered.length} payslip{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-4,#9CA3AF)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <FiDollarSign size={18} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
              </div>
              {search ? 'No matching payslips' : 'No payslips found'}
            </div>
          ) : filtered.map((ps, i) => <PayslipRow key={ps._id || i} ps={ps} />)}
        </div>
      )}
    </div>
  );
}
