import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchLeaveUtilization, fetchLeaveBalanceReport } from '../../services/attendanceAPI';

const REPORT_TYPES = [
  { key: 'utilization', label: 'Leave Utilization' },
  { key: 'balances',    label: 'Leave Balance' },
];

export default function AdminLeaveReports() {
  const [reportType, setReportType] = useState('utilization');
  const [year, setYear]   = useState(new Date().getFullYear());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      let res;
      if (reportType === 'utilization') res = await fetchLeaveUtilization({ year });
      if (reportType === 'balances')    res = await fetchLeaveBalanceReport({ year });
      setResult(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to generate report');
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Leave utilization and balance analysis</p>
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
          <div className="flex items-end gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Year</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)}
                className="mt-1 w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={run} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <FiSearch size={14} /> Generate
            </button>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : result && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                {reportType === 'utilization' && (
                  <>
                    <thead className="bg-gray-50">
                      <tr>
                        {['Leave Type','Code','Total Requests','Total Days Used'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(result.data || []).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            <span className="flex items-center gap-2">
                              {row.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />}
                              {row.leaveTypeName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{row.leaveTypeCode}</td>
                          <td className="px-4 py-3 text-gray-900">{row.totalRequests}</td>
                          <td className="px-4 py-3 font-semibold text-indigo-700">{row.totalDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
                {reportType === 'balances' && (
                  <>
                    <thead className="bg-gray-50">
                      <tr>
                        {['Employee','Leave Type','Opening','Accrued','Taken','Pending','Encashed','Closing'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(result.balances || []).map(b => (
                        <tr key={b._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{b.employee?.displayName}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5">
                              {b.leaveType?.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.leaveType.color }} />}
                              {b.leaveType?.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{b.openingBalance}</td>
                          <td className="px-4 py-3 text-gray-600">{b.accrued}</td>
                          <td className="px-4 py-3 text-gray-600">{b.taken}</td>
                          <td className="px-4 py-3 text-yellow-600">{b.pending || 0}</td>
                          <td className="px-4 py-3 text-gray-600">{b.encashed || 0}</td>
                          <td className="px-4 py-3 font-semibold text-indigo-700">{b.closingBalance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
