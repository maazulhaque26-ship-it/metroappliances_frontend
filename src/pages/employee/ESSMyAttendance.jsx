import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiCalendar, FiSun, FiFilter } from 'react-icons/fi';
import { essGetAttendance } from '../../services/employeeSelfServiceAPI';
import PortalKPICard from '../../components/shared/PortalKPICard';

const STATUS_STYLE = {
  present:  { background: '#D1FAE5', color: '#065F46' },
  absent:   { background: '#FEE2E2', color: '#991B1B' },
  late:     { background: '#FEF3C7', color: '#92400E' },
  half_day: { background: '#DBEAFE', color: '#1E40AF' },
  on_leave: { background: '#EDE9FE', color: '#5B21B6' },
  holiday:  { background: '#F3F4F6', color: '#374151' },
};

function fmtTime(t) {
  if (!t) return '—';
  try { return new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); } catch { return t; }
}

export default function ESSMyAttendance() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.employeeAuth);

  const now = new Date();
  const [month, setMonth]     = useState(now.getMonth() + 1);
  const [year, setYear]       = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(() => {
    if (!token) { navigate('/employee/login'); return; }
    setLoading(true);
    essGetAttendance({ month, year, limit: 31 })
      .then(r => {
        const d = r.data.data || r.data;
        setRecords(Array.isArray(d) ? d : (d?.records || d?.attendance || []));
        setSummary(d?.summary || {});
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [token, navigate, month, year]);

  useEffect(() => { load(); }, [load]);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years  = [now.getFullYear() - 1, now.getFullYear()];

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>My Attendance</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', marginBottom: 0 }}>Monthly attendance record</p>
        </div>
        <div style={{ display: 'flex', align: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', background: 'var(--card,#fff)' }}>
            <FiFilter size={13} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              style={{ border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text,#111)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
              aria-label="Select month"
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', background: 'var(--card,#fff)', color: 'var(--text,#111)', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
            aria-label="Select year"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary KPI cards */}
      {Object.keys(summary).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <PortalKPICard label="Present"  value={summary.present  ?? 0} icon={FiCheckCircle}  color="#10B981" />
          <PortalKPICard label="Absent"   value={summary.absent   ?? 0} icon={FiXCircle}      color="#EF4444" />
          <PortalKPICard label="Late"     value={summary.late     ?? 0} icon={FiAlertCircle}  color="#F59E0B" />
          <PortalKPICard label="On Leave" value={summary.onLeave  ?? 0} icon={FiCalendar}     color="#8B5CF6" />
          <PortalKPICard label="Holidays" value={summary.holidays ?? 0} icon={FiSun}          color="#6B7280" />
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-4,#9CA3AF)' }}>Loading…</div>}
      {error   && <div style={{ color: '#EF4444', fontSize: '13px', padding: '12px 16px', background: '#FEF2F2', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px', borderBottom: '1px solid var(--border,#E5E7EB)' }}>
            <FiClock size={15} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>
              {MONTHS[month - 1]} {year} — Attendance Log
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: 'var(--bg,#F9FAFB)' }}>
                <tr>
                  {['Date', 'Day', 'Check In', 'Check Out', 'Hours', 'Status', 'Remarks'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border,#E5E7EB)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-4,#9CA3AF)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <FiClock size={18} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
                      </div>
                      No attendance records for this period
                    </td>
                  </tr>
                ) : records.map((r, i) => {
                  const st = (r.status || '').toLowerCase().replace(/ /g, '_');
                  const sty = STATUS_STYLE[st] || { background: '#F3F4F6', color: '#374151' };
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border,#E5E7EB)' }}>
                      <td style={{ padding: '10px 16px', color: 'var(--text,#111)', fontWeight: 500 }}>
                        {r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-4,#9CA3AF)' }}>
                        {r.date ? new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short' }) : '—'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-2,#374151)' }}>{fmtTime(r.checkIn)}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-2,#374151)' }}>{fmtTime(r.checkOut)}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-2,#374151)' }}>{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ ...sty, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                          {r.status || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-4,#9CA3AF)', fontSize: '12px' }}>
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
