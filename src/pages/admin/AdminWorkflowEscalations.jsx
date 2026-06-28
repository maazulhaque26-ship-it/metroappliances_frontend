import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { fetchEscalations, acknowledgeEscalation, resolveEscalation, createEscalation } from '../../services/workflowAPI';

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-700',
  acknowledged: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  ignored: 'bg-gray-100 text-gray-500',
};

const REASONS = ['overdue_sla', 'manual', 'rule_triggered', 'repeated_reminder'];

export default function AdminWorkflowEscalations() {
  const [escalations, setEscalations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('open');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveItem, setResolveItem] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    fetchEscalations({ status: filterStatus || undefined, page, limit: 20 })
      .then(r => { setEscalations(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus, page]);

  useEffect(load, [load]);

  const handleAcknowledge = async (id) => {
    await acknowledgeEscalation(id);
    load();
  };

  const openResolve = (item) => { setResolveItem(item); setResponse(''); setShowResolveModal(true); };

  const confirmResolve = async () => {
    await resolveEscalation(resolveItem._id, { response });
    setShowResolveModal(false);
    load();
  };

  const levelColor = (l) => l >= 3 ? 'text-red-600 font-bold' : l === 2 ? 'text-amber-600 font-semibold' : 'text-gray-600';

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Escalation Management</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['open', 'acknowledged', 'resolved', ''].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterStatus === s ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Code', 'Instance', 'Level', 'Reason', 'Escalated To', 'Status', 'Escalated At', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading…</td></tr>
                : escalations.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">No escalations found.</td></tr>
                  : escalations.map(e => (
                    <tr key={e._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{e.escalationCode}</td>
                      <td className="px-4 py-2.5">
                        <div className="text-xs font-medium text-gray-800">{e.instance?.title || e.instance?.instanceCode || '-'}</div>
                        <div className="text-xs text-gray-400">{e.instance?.module}</div>
                      </td>
                      <td className="px-4 py-2.5"><span className={`text-sm ${levelColor(e.escalationLevel)}`}>L{e.escalationLevel}</span></td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{e.reason}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-700">{e.escalatedTo?.name || '-'}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[e.status]}`}>{e.status}</span></td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{new Date(e.escalatedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-2">
                          {e.status === 'open' && <button onClick={() => handleAcknowledge(e._id)} className="text-xs text-amber-600 hover:underline">Ack</button>}
                          {['open', 'acknowledged'].includes(e.status) && <button onClick={() => openResolve(e)} className="text-xs text-green-600 hover:underline">Resolve</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex gap-2 justify-center">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-gray-500 px-2 py-1">{page}</span>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {showResolveModal && resolveItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Resolve Escalation</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-500">{resolveItem.escalationCode}</p>
              <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Resolution response *" className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none" />
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowResolveModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmResolve} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Resolve</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
