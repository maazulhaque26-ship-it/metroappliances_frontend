import React, { useEffect, useState, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Pagination from '../../components/shared/Pagination';
import { fetchLeaveRequests } from '../../services/attendanceAPI';

export default function AdminLeaveApprovals() {
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchLeaveRequests({ page, limit: 25, status: 'approved' })
      .then(r => { setItems(r.data.data); setTotal(r.data.pagination?.total || 0); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Approvals</h1>
            <p className="text-sm text-gray-500 mt-1">{total} approved leaves</p>
          </div>
          <button onClick={load} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><FiRefreshCw size={14} /></button>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Request #','Employee','Leave Type','From','To','Days','Approved By','Approved On'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No approved leaves</td></tr>
                  ) : items.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{item.requestNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.employee?.displayName}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {item.leaveType?.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.leaveType.color }} />}
                          {item.leaveType?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fmt(item.startDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmt(item.endDate)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.totalDays}</td>
                      <td className="px-4 py-3 text-gray-600">{item.approvedBy?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(item.approvedAt)}</td>
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
