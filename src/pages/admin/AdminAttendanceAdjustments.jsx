import React, { useEffect, useState, useCallback } from 'react';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Pagination from '../../components/shared/Pagination';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { fetchAdjustments, approveAdjustment, rejectAdjustment } from '../../services/attendanceAPI';

const STATUS_COLORS = { pending: 'yellow', approved: 'green', rejected: 'red' };

export default function AdminAttendanceAdjustments() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [status, setStatus]     = useState('pending');
  const [confirm, setConfirm]   = useState(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdjustments({ page, limit: 20, status: status || undefined })
      .then(r => { setItems(r.data.data); setTotal(r.data.pagination?.total || 0); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action, id) => {
    setProcessing(true);
    try {
      if (action === 'approve') await approveAdjustment(id, {});
      else await rejectAdjustment(id, { reason: 'Not justified' });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
      setConfirm(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Adjustments</h1>
            <p className="text-sm text-gray-500 mt-1">{total} adjustments</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['#','Employee','Date','Type','Original','Requested','Reason','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No adjustments found</td></tr>
                  ) : items.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.adjustmentNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.employee?.displayName}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.adjustmentType?.replace(/_/g,' ')}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{String(item.originalValue)}</td>
                      <td className="px-4 py-3 text-gray-900 text-xs font-medium">{String(item.requestedValue)}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{item.reason}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} color={STATUS_COLORS[item.status]} />
                      </td>
                      <td className="px-4 py-3">
                        {item.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setConfirm({ action: 'approve', id: item._id })}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve">
                              <FiCheck size={14} />
                            </button>
                            <button onClick={() => setConfirm({ action: 'reject', id: item._id })}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject">
                              <FiX size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination page={page} total={total} limit={20} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.action === 'approve' ? 'Approve Adjustment' : 'Reject Adjustment'}
          message={`Are you sure you want to ${confirm.action} this adjustment?`}
          confirmLabel={confirm.action === 'approve' ? 'Approve' : 'Reject'}
          confirmClassName={confirm.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          onConfirm={() => handleAction(confirm.action, confirm.id)}
          onCancel={() => setConfirm(null)}
          loading={processing}
        />
      )}
    </AdminLayout>
  );
}
