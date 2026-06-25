import React, { useEffect, useState, useCallback } from 'react';
import { FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Pagination from '../../components/shared/Pagination';
import StatusBadge from '../../components/shared/StatusBadge';
import { fetchAttendances } from '../../services/attendanceAPI';

const STATUS_COLORS = {
  present: 'green', absent: 'red', half_day: 'yellow', late: 'orange',
  on_leave: 'blue', holiday: 'indigo', weekly_off: 'gray', work_from_home: 'teal',
};

export default function AdminAttendanceRegister() {
  const [records, setRecords]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filters, setFilters]   = useState({
    startDate: new Date().toISOString().slice(0, 10),
    endDate:   new Date().toISOString().slice(0, 10),
    status: '', employee: '',
  });

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 25, ...filters };
    fetchAttendances(params)
      .then(r => { setRecords(r.data.data); setTotal(r.data.pagination?.total || 0); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Register</h1>
            <p className="text-sm text-gray-500 mt-1">{total} records</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">From Date</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">To Date</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Status</label>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All</option>
              {['present','absent','half_day','late','on_leave','holiday','weekly_off','work_from_home'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setPage(1); load(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              <FiFilter size={14} /> Apply
            </button>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Employee','Date','Status','Punch In','Punch Out','Hours','Late','OT Hours'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records found</td></tr>
                  ) : records.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.employee?.displayName}<br/>
                        <span className="text-xs text-gray-400">{r.employee?.employeeCode}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(r.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} color={STATUS_COLORS[r.status]} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.punchIn ? new Date(r.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.punchOut ? new Date(r.punchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.totalHours ? r.totalHours.toFixed(1) : '—'}</td>
                      <td className="px-4 py-3">
                        {r.isLate ? <span className="text-orange-600 text-xs font-medium">{r.lateByMinutes}m</span> : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.overtimeHours ? r.overtimeHours.toFixed(1) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination page={page} total={total} limit={25} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
