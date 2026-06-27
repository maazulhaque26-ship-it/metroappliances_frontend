import React, { useState } from 'react';
import { FiSearch, FiDownload } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import StatusBadge from '../../components/shared/StatusBadge';
import {
  fetchDailyAttendance, fetchMonthlyAttendance,
  fetchLateReport, fetchAbsenteeReport,
} from '../../services/attendanceAPI';

const REPORT_TYPES = [
  { key: 'daily',   label: 'Daily Attendance' },
  { key: 'monthly', label: 'Monthly Attendance' },
  { key: 'late',    label: 'Late Report' },
  { key: 'absentee',label: 'Absentee Report' },
];

const STATUS_COLORS = { present: 'green', absent: 'red', late: 'orange', half_day: 'yellow', on_leave: 'blue', holiday: 'indigo', weekly_off: 'gray' };

export default function AdminAttendanceReports() {
  const [reportType, setReportType] = useState('daily');
  const [params, setParams]         = useState({
    date: new Date().toISOString().slice(0, 10),
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    startDate: new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      let res;
      if (reportType === 'daily')    res = await fetchDailyAttendance({ date: params.date });
      if (reportType === 'monthly')  res = await fetchMonthlyAttendance({ year: params.year, month: params.month });
      if (reportType === 'late')     res = await fetchLateReport({ startDate: params.startDate, endDate: params.endDate });
      if (reportType === 'absentee') res = await fetchAbsenteeReport({ startDate: params.startDate, endDate: params.endDate });
      setResult(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to generate report');
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and download attendance reports</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map(r => (
              <button key={r.key} onClick={() => { setReportType(r.key); setResult(null); }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${reportType === r.key ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Params */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reportType === 'daily' && (
              <div>
                <label className="text-xs font-medium text-gray-600">Date</label>
                <input type="date" value={params.date} onChange={e => setParams(p => ({ ...p, date: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            {reportType === 'monthly' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-600">Year</label>
                  <input type="number" value={params.year} onChange={e => setParams(p => ({ ...p, year: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Month</label>
                  <select value={params.month} onChange={e => setParams(p => ({ ...p, month: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {['late','absentee'].includes(reportType) && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-600">From Date</label>
                  <input type="date" value={params.startDate} onChange={e => setParams(p => ({ ...p, startDate: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">To Date</label>
                  <input type="date" value={params.endDate} onChange={e => setParams(p => ({ ...p, endDate: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </>
            )}
            <div className="flex items-end">
              <button onClick={run} disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                <FiSearch size={14} /> Generate
              </button>
            </div>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : result && (
          <div className="space-y-4">
            {/* Summary */}
            {result.summary && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(result.summary).map(([k, v]) => (
                  <div key={k} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-xl font-bold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                  </div>
                ))}
              </div>
            )}
            {result.totals && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(result.totals).map(([k, v]) => (
                  <div key={k} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-xl font-bold text-gray-900">{typeof v === 'number' ? v.toFixed(1) : v}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Records table */}
            {(result.records || result.summaries) && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportType === 'daily' && ['Employee','Code','Status','Punch In','Punch Out','Hours','Late'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                        {reportType === 'monthly' && ['Employee','Present','Absent','Late','Leave','OT Hrs','Attend %'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                        {['late','absentee'].includes(reportType) && ['Employee','Date','Status','Details'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(result.records || result.summaries || []).map((r, i) => (
                        <tr key={r._id || i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{r.employee?.displayName}</td>
                          {reportType === 'daily' && <>
                            <td className="px-4 py-3 text-gray-400 text-xs">{r.employee?.employeeCode}</td>
                            <td className="px-4 py-3"><StatusBadge status={r.status} color={STATUS_COLORS[r.status]} /></td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{r.punchIn ? new Date(r.punchIn).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{r.punchOut ? new Date(r.punchOut).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{r.totalHours?.toFixed(1) || '—'}</td>
                            <td className="px-4 py-3 text-orange-600 text-xs">{r.isLate ? `${r.lateByMinutes}m` : '—'}</td>
                          </>}
                          {reportType === 'monthly' && <>
                            <td className="px-4 py-3 text-green-600 font-medium">{r.presentDays}</td>
                            <td className="px-4 py-3 text-red-600">{r.absentDays}</td>
                            <td className="px-4 py-3 text-orange-600">{r.lateDays}</td>
                            <td className="px-4 py-3 text-blue-600">{r.leaveDays}</td>
                            <td className="px-4 py-3 text-gray-600">{r.overtimeHours?.toFixed(1)}</td>
                            <td className="px-4 py-3">
                              <span className={`font-semibold ${r.attendancePercent >= 90 ? 'text-green-600' : r.attendancePercent >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {r.attendancePercent}%
                              </span>
                            </td>
                          </>}
                          {['late','absentee'].includes(reportType) && <>
                            <td className="px-4 py-3 text-gray-600">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-3"><StatusBadge status={r.status} color={STATUS_COLORS[r.status]} /></td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {reportType === 'late' ? `${r.lateByMinutes}min late` : 'Absent'}
                            </td>
                          </>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
