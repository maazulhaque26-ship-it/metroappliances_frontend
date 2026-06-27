import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { fetchAuditTrail } from '../../services/workflowAPI';

const ACTION_COLORS = {
  instance_created: 'bg-blue-100 text-blue-700',
  instance_started: 'bg-indigo-100 text-indigo-700',
  instance_completed: 'bg-green-100 text-green-700',
  instance_cancelled: 'bg-gray-100 text-gray-600',
  approve: 'bg-emerald-100 text-emerald-700',
  reject: 'bg-red-100 text-red-600',
  delegate: 'bg-purple-100 text-purple-700',
  escalate: 'bg-amber-100 text-amber-700',
  override: 'bg-orange-100 text-orange-700',
  cancel: 'bg-gray-100 text-gray-500',
};

export default function AdminWorkflowHistory() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ action: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 50 };
    if (filters.action) params.action = filters.action;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    fetchAuditTrail(params)
      .then(r => { setHistory(r.data.data?.data || []); setTotal(r.data.data?.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(load, [load]);

  const actionBadge = (action) => {
    const color = ACTION_COLORS[action] || 'bg-gray-100 text-gray-600';
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{action}</span>;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Workflow Audit Trail</h1>

        <div className="flex gap-2 flex-wrap items-center">
          <input value={filters.action} onChange={e => setFilters(p => ({ ...p, action: e.target.value }))} placeholder="Filter by action…" className="border rounded-lg px-3 py-1.5 text-sm" />
          <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} className="border rounded-lg px-3 py-1.5 text-sm" />
          <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} className="border rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={() => { setPage(1); load(); }} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Search</button>
          <button onClick={() => { setFilters({ action: '', startDate: '', endDate: '' }); setPage(1); }} className="px-4 py-1.5 border text-sm rounded-lg text-gray-600 hover:bg-gray-50">Clear</button>
          <span className="text-xs text-gray-400 ml-2">{total} records</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Time', 'Code', 'Instance', 'Action', 'Performed By', 'From Status', 'To Status', 'Remarks'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading…</td></tr>
                : history.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">No history records found.</td></tr>
                  : history.map(h => (
                    <tr key={h._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{h.historyCode}</td>
                      <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{h.instance?.title || h.instance?.instanceCode || '-'}</td>
                      <td className="px-4 py-2.5">{actionBadge(h.action)}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-700">{h.performedBy?.name || 'System'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{h.fromStatus || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{h.toStatus || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 max-w-xs truncate">{h.remarks || '—'}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {total > 50 && (
          <div className="flex gap-2 justify-center">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-gray-500 px-2 py-1">Page {page}</span>
            <button disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
