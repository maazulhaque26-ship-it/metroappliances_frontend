import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { fetchInstances, createInstance, cancelInstance, fetchWorkflows, startInstance } from '../../services/workflowAPI';

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-400',
  completed: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-amber-100 text-amber-700',
};
const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-600',
};

const empty = { workflow: '', title: '', description: '', module: 'general', entityType: '', priority: 'medium', dueDate: '' };

export default function AdminWorkflowInstances() {
  const [instances, setInstances] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchInstances({ status: filterStatus || undefined, module: filterModule || undefined, page, limit: 20 })
      .then(r => { setInstances(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus, filterModule, page]);

  useEffect(load, [load]);
  useEffect(() => {
    fetchWorkflows({ status: 'active', limit: 100 }).then(r => setWorkflows(r.data.data || [])).catch(console.error);
  }, []);

  const save = async () => {
    try {
      await createInstance(form);
      setShowModal(false);
      setForm(empty);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this instance?')) return;
    await cancelInstance(id, { reason: 'Admin cancelled' });
    load();
  };

  const handleStart = async (id) => {
    await startInstance(id).catch(e => alert(e.response?.data?.message || 'Error'));
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Workflow Instances</h1>
          <button onClick={() => { setForm(empty); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ Create Instance</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'in_progress', 'completed', 'rejected', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Code', 'Title', 'Module', 'Priority', 'Status', 'Current Step', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading…</td></tr>
              ) : instances.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No instances found.</td></tr>
              ) : instances.map(inst => (
                <tr key={inst._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{inst.instanceCode}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800">{inst.title}</div>
                    <div className="text-xs text-gray-400">{inst.workflow?.name}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{inst.module}</td>
                  <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[inst.priority]}`}>{inst.priority}</span></td>
                  <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inst.status]}`}>{inst.status}</span></td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{inst.currentStep}/{inst.totalSteps}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-400">{new Date(inst.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      {inst.status === 'pending' && (
                        <button onClick={() => handleStart(inst._id)} className="text-xs text-green-600 hover:underline">Start</button>
                      )}
                      {!['completed', 'cancelled', 'rejected'].includes(inst.status) && (
                        <button onClick={() => handleCancel(inst._id)} className="text-xs text-red-500 hover:underline">Cancel</button>
                      )}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Create Instance</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <select value={form.workflow} onChange={e => setForm(p => ({ ...p, workflow: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Select Workflow *</option>
                {workflows.map(w => <option key={w._id} value={w._id}>{w.name} ({w.module})</option>)}
              </select>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                  {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm" />
              </div>
              <input value={form.entityType} onChange={e => setForm(p => ({ ...p, entityType: e.target.value }))} placeholder="Entity Type (e.g. LeaveRequest)" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
