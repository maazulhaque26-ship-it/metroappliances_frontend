import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiPlus, FiX } from 'react-icons/fi';
import { essGetLeaveBalance, essGetMyLeaves } from '../../services/employeeSelfServiceAPI';

const STATUS_STYLE = {
  approved:  { background: '#D1FAE5', color: '#065F46' },
  pending:   { background: '#FEF3C7', color: '#92400E' },
  rejected:  { background: '#FEE2E2', color: '#991B1B' },
  cancelled: { background: '#F3F4F6', color: '#374151' },
};

const LEAVE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

function LeaveCard({ type, total, used, pending, color = '#6366F1' }) {
  const available = (total || 0) - (used || 0);
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{type}</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color, lineHeight: 1 }}>{available}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px' }}>available of {total}</div>
        </div>
        {pending > 0 && (
          <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
            {pending} pending
          </span>
        )}
      </div>
      <div style={{ height: '5px', background: 'var(--border,#E5E7EB)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '6px' }}>
        <div style={{ height: '5px', background: color, width: `${pct}%`, borderRadius: '9999px', transition: 'width 0.4s' }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)' }}>{used || 0} used</div>
    </div>
  );
}

function ApplyLeavePanel({ onClose }) {
  return (
    <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text,#111)', margin: 0 }}>Apply for Leave</h2>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-4,#9CA3AF)', display: 'flex', alignItems: 'center' }} aria-label="Close apply leave panel">
          <FiX size={18} aria-hidden="true" />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label htmlFor="apply-leave-type" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2,#374151)', marginBottom: '6px' }}>Leave Type</label>
          <select id="apply-leave-type" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', background: 'var(--card,#fff)', fontFamily: 'inherit', color: 'var(--text,#111)', outline: 'none', boxSizing: 'border-box' }}>
            <option>Annual Leave</option>
            <option>Sick Leave</option>
            <option>Casual Leave</option>
          </select>
        </div>
        <div>
          <label htmlFor="apply-leave-days" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2,#374151)', marginBottom: '6px' }}>Days</label>
          <input id="apply-leave-days" type="number" min="0.5" step="0.5" defaultValue="1"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--text,#111)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label htmlFor="apply-leave-from" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2,#374151)', marginBottom: '6px' }}>From Date</label>
          <input id="apply-leave-from" type="date"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--text,#111)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label htmlFor="apply-leave-to" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2,#374151)', marginBottom: '6px' }}>To Date</label>
          <input id="apply-leave-to" type="date"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--text,#111)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="apply-leave-reason" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2,#374151)', marginBottom: '6px' }}>Reason</label>
        <textarea id="apply-leave-reason" rows={3} placeholder="Reason for leave…"
          style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', color: 'var(--text,#111)', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => alert('Leave application submitted! (Contact HR for processing in this demo)')}
          style={{ padding: '9px 20px', background: 'var(--accent,#FF7A00)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Submit Application
        </button>
        <button onClick={onClose}
          style={{ padding: '9px 20px', background: 'var(--bg,#F9FAFB)', color: 'var(--text-2,#374151)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ESSMyLeave() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.employeeAuth);
  const [balance, setBalance]     = useState([]);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showApply, setShowApply] = useState(false);

  const load = useCallback(() => {
    if (!token) { navigate('/employee/login'); return; }
    setLoading(true);
    Promise.all([essGetLeaveBalance(), essGetMyLeaves({ limit: 20 })])
      .then(([br, rr]) => {
        const bd = br.data.data || br.data;
        setBalance(Array.isArray(bd) ? bd : (bd?.balances || Object.entries(bd || {}).map(([type, v]) => ({ type, ...v }))));
        setRequests(rr.data.data || rr.data.requests || rr.data.leaves || []);
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to load leave data'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>My Leave</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', marginBottom: 0 }}>Leave balances and request history</p>
        </div>
        <button
          onClick={() => setShowApply(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'var(--accent,#FF7A00)', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <FiPlus size={15} aria-hidden="true" />
          Apply Leave
        </button>
      </div>

      {/* Apply Leave panel */}
      {showApply && <ApplyLeavePanel onClose={() => setShowApply(false)} />}

      {loading && <div role="status" aria-label="Loading leave data" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-4,#9CA3AF)' }}>Loading…</div>}
      {error   && <div role="alert" style={{ color: '#EF4444', fontSize: '13px', padding: '12px 16px', background: '#FEF2F2', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

      {!loading && !error && (
        <>
          {/* Balance cards */}
          {balance.length > 0 && (
            <>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Leave Balances
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                {balance.map((b, i) => (
                  <LeaveCard
                    key={i}
                    type={b.type || b.leaveType || `Leave ${i + 1}`}
                    total={b.total || b.allocated || 0}
                    used={b.used || b.consumed || 0}
                    pending={b.pending || 0}
                    color={LEAVE_COLORS[i % LEAVE_COLORS.length]}
                  />
                ))}
              </div>
            </>
          )}

          {/* Leave Requests table */}
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Leave Requests
          </div>
          <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table aria-label="Leave requests" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ background: 'var(--bg,#F9FAFB)' }}>
                  <tr>
                    {['Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Applied On'].map(h => (
                      <th key={h} scope="col" style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border,#E5E7EB)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-4,#9CA3AF)' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                          <FiCalendar size={18} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
                        </div>
                        No leave requests found
                      </td>
                    </tr>
                  ) : requests.map((r, i) => {
                    const st = (r.status || 'pending').toLowerCase();
                    const sty = STATUS_STYLE[st] || { background: '#F3F4F6', color: '#374151' };
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border,#E5E7EB)' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text,#111)' }}>{r.leaveType || r.type || '—'}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-2,#374151)' }}>{r.startDate ? new Date(r.startDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-2,#374151)' }}>{r.endDate ? new Date(r.endDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-2,#374151)' }}>{r.numberOfDays || r.days || '—'}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-4,#9CA3AF)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reason || '—'}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ ...sty, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{r.status || 'pending'}</span>
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-4,#9CA3AF)', fontSize: '12px' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
