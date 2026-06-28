import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { fetchApprovals, fetchPendingApprovals, approveStep, rejectStep, delegateApproval, overrideApproval, bulkApprove } from '../../services/workflowAPI';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  delegated: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-gray-100 text-gray-600',
  recalled: 'bg-purple-100 text-purple-700',
};

export default function AdminWorkflowApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selected, setSelected] = useState([]);
  const [showDecideModal, setShowDecideModal] = useState(false);
  const [decideItem, setDecideItem] = useState(null);
  const [decision, setDecision] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    fetchApprovals({ status: filterStatus || undefined, page, limit: 20 })
      .then(r => { setApprovals(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus, page]);

  useEffect(load, [load]);

  const openDecide = (item, dec) => { setDecideItem(item); setDecision(dec); setRemarks(''); setShowDecideModal(true); };

  const confirmDecide = async () => {
    try {
      if (decision === 'approve') await approveStep(decideItem._id, { remarks });
      else if (decision === 'reject') await rejectStep(decideItem._id, { remarks });
      else if (decision === 'override_approve') await overrideApproval(decideItem._id, { decision: 'approved', remarks });
      else if (decision === 'override_reject') await overrideApproval(decideItem._id, { decision: 'rejected', remarks });
      setShowDecideModal(false);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleBulkApprove = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Bulk approve ${selected.length} items?`)) return;
    await bulkApprove({ approvalIds: selected, remarks: 'Bulk approved by admin' });
    setSelected([]);
    load();
  };

  const toggleSelect = (id) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Approval Management</h1>
          {selected.length > 0 && (
            <button onClick={handleBulkApprove} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
              Bulk Approve ({selected.length})
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected', 'delegated', ''].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); setSelected([]); }}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2.5 w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? approvals.map(a => a._id) : [])} /></th>
                {['Code', 'Instance', 'Approver', 'Mode', 'Status', 'Due Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading…</td></tr>
                : approvals.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">No approvals found.</td></tr>
                  : approvals.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5">
                        {a.status === 'pending' && <input type="checkbox" checked={selected.includes(a._id)} onChange={() => toggleSelect(a._id)} />}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{a.approvalCode}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-gray-800 text-xs">{a.instance?.title || a.instance?.instanceCode || '-'}</div>
                        <div className="text-xs text-gray-400">{a.instance?.module}</div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-700">{a.approver?.name || '-'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{a.approvalMode}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2.5">
                        {a.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => openDecide(a, 'approve')} className="text-xs text-green-600 hover:underline">Approve</button>
                            <button onClick={() => openDecide(a, 'reject')} className="text-xs text-red-500 hover:underline">Reject</button>
                            <button onClick={() => openDecide(a, 'override_approve')} className="text-xs text-blue-600 hover:underline">Override</button>
                          </div>
                        )}
                        {a.status !== 'pending' && <span className="text-xs text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex gap-2 justify-center">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-gray-500 px-2 py-1">{page} of {Math.ceil(total / 20)}</span>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {showDecideModal && decideItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-gray-800 capitalize">{decision.replace('_', ' ')} Approval</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-600">Instance: <span className="font-medium">{decideItem.instance?.title || decideItem.instance?.instanceCode}</span></p>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Remarks (optional)" className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none" />
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowDecideModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDecide}
                className={`px-4 py-2 text-sm text-white rounded-lg ${decision.includes('reject') ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
