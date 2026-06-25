import React, { useEffect, useState, useCallback } from 'react';
import { FiCheck, FiX, FiRefreshCw, FiEye } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Pagination from '../../components/shared/Pagination';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { fetchLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '../../services/attendanceAPI';

const STATUS_COLORS = {
  pending: 'yellow', approved: 'green', rejected: 'red',
  cancelled: 'gray', withdrawn: 'gray', draft: 'gray',
};

export default function AdminLeaveRequests() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [status, setStatus]     = useState('pending');
  const [confirm, setConfirm]   = useState(null);
  const [processing, setProcessing] = useState(false);
  const [detail, setDetail]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchLeaveRequests({ page, limit: 20, status: status || undefined })
      .then(r => { setItems(r.data.data); setTotal(r.data.pagination?.total || 0); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action, id) => {
    setProcessing(true);
    try {
      if (action === 'approve') await approveLeaveRequest(id, {});
      else await rejectLeaveRequest(id, { reason: 'Not approved' });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally { setProcessing(false); setConfirm(null); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-sm text-gray-500 mt-1">{total} requests</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All</option>
              {['pending','approved','rejected','cancelled','draft'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button onClick={load} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><FiRefreshCw size={14} /></button>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['#','Employee','Leave Type','From','To','Days','Applied On','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No requests found</td></tr>
                  ) : items.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{item.requestNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.employee?.displayName}
                        <span className="block text-xs text-gray-400">{item.employee?.employeeCode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {item.leaveType?.color && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.leaveType.color }} />}
                          {item.leaveType?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fmt(item.startDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmt(item.endDate)}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {item.totalDays}{item.isHalfDay ? ' (½)' : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(item.appliedOn)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} color={STATUS_COLORS[item.status]} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetail(item)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded" title="View"><FiEye size={13} /></button>
                          {item.status === 'pending' && (
                            <>
                              <button onClick={() => setConfirm({ action: 'approve', id: item._id })} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><FiCheck size={13} /></button>
                              <button onClick={() => setConfirm({ action: 'reject',  id: item._id })} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><FiX size={13} /></button>
                            </>
                          )}
                        </div>
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

      {/* Detail slide-over */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-end">
          <div className="bg-white w-full md:w-[480px] h-full md:h-auto md:rounded-2xl p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Leave Request Details</h2>
              <button onClick={() => setDetail(null)} className="p-2 text-gray-400 hover:text-gray-600"><FiX size={16} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Request #</span><span className="font-medium">{detail.requestNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Employee</span><span>{detail.employee?.displayName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Leave Type</span><span>{detail.leaveType?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">From</span><span>{fmt(detail.startDate)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">To</span><span>{fmt(detail.endDate)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Days</span><span className="font-medium">{detail.totalDays}{detail.isHalfDay ? ' (Half Day)' : ''}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={detail.status} color={STATUS_COLORS[detail.status]} /></div>
              <div>
                <span className="text-gray-500">Reason</span>
                <p className="mt-1 text-gray-800 bg-gray-50 rounded-lg p-3">{detail.reason}</p>
              </div>
              {detail.rejectionReason && (
                <div>
                  <span className="text-gray-500">Rejection Reason</span>
                  <p className="mt-1 text-red-700 bg-red-50 rounded-lg p-3">{detail.rejectionReason}</p>
                </div>
              )}
            </div>
            {detail.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setConfirm({ action: 'approve', id: detail._id }); setDetail(null); }}
                  className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Approve</button>
                <button onClick={() => { setConfirm({ action: 'reject', id: detail._id }); setDetail(null); }}
                  className="flex-1 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Reject</button>
              </div>
            )}
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.action === 'approve' ? 'Approve Leave' : 'Reject Leave'}
          message={`Are you sure you want to ${confirm.action} this leave request?`}
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
