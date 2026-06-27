import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchWorkflowTriggers, createWorkflowTrigger, updateWorkflowTrigger, deleteWorkflowTrigger, fireWorkflowTrigger, fetchWorkflows } from '../../services/workflowAPI';

const TRIGGER_TYPES = ['event', 'schedule', 'manual', 'webhook'];
const MODULES = ['hr', 'procurement', 'finance', 'projects', 'manufacturing', 'service', 'inventory', 'general'];

const TYPE_ICONS = { event: '⚡', schedule: '⏰', manual: '👆', webhook: '🔗' };
const TYPE_COLORS = { event: 'bg-blue-100 text-blue-700', schedule: 'bg-amber-100 text-amber-700', manual: 'bg-purple-100 text-purple-700', webhook: 'bg-green-100 text-green-700' };

const empty = { name: '', description: '', workflow: '', triggerType: 'event', event: '', module: '', entityType: '', schedule: '', webhookUrl: '', isActive: true };

export default function AdminWorkflowTriggers() {
  const [triggers, setTriggers] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchWorkflowTriggers({ triggerType: filterType || undefined })
      .then(r => setTriggers(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
    fetchWorkflows({ status: 'active', limit: 100 }).then(r => setWorkflows(r.data.data || [])).catch(console.error);
  };

  useEffect(load, [filterType]);

  const openModal = (t = null) => {
    setEditing(t);
    setForm(t ? { name: t.name, description: t.description || '', workflow: t.workflow || '', triggerType: t.triggerType, event: t.event || '', module: t.module || '', entityType: t.entityType || '', schedule: t.schedule || '', webhookUrl: t.webhookUrl || '', isActive: t.isActive } : empty);
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await updateWorkflowTrigger(editing._id, form);
      else await createWorkflowTrigger(form);
      setShowModal(false);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete trigger?')) return;
    await deleteWorkflowTrigger(id);
    load();
  };

  const handleFire = async (id) => {
    if (!window.confirm('Manually fire this trigger?')) return;
    await fireWorkflowTrigger(id).catch(e => alert(e.response?.data?.message || 'Error'));
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Workflow Triggers</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Trigger</button>
        </div>

        <div className="flex gap-2">
          {['', ...TRIGGER_TYPES].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {t ? `${TYPE_ICONS[t]} ${t}` : 'All'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <p className="text-gray-400 col-span-3 text-center py-8">Loading…</p>
            : triggers.length === 0 ? <p className="text-gray-400 col-span-3 text-center py-8">No triggers yet.</p>
              : triggers.map(t => (
                <div key={t._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{t.triggerCode}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs mb-2">
                    <span className={`px-2 py-0.5 rounded font-medium ${TYPE_COLORS[t.triggerType]}`}>{TYPE_ICONS[t.triggerType]} {t.triggerType}</span>
                    {t.module && <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded">{t.module}</span>}
                  </div>
                  {t.event && <p className="text-xs text-gray-500 mb-1">Event: <span className="font-mono text-indigo-600">{t.event}</span></p>}
                  {t.schedule && <p className="text-xs text-gray-500 mb-1">Schedule: <span className="font-mono">{t.schedule}</span></p>}
                  <p className="text-xs text-gray-400 mb-3">Fired {t.fireCount || 0}× {t.lastFiredAt ? `· Last: ${new Date(t.lastFiredAt).toLocaleDateString()}` : ''}</p>
                  <div className="flex gap-2">
                    {t.isActive && t.triggerType === 'manual' && (
                      <button onClick={() => handleFire(t._id)} className="text-xs text-green-600 hover:underline">Fire</button>
                    )}
                    <button onClick={() => openModal(t)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(t._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Trigger' : 'New Trigger'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Trigger Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <select value={form.workflow} onChange={e => setForm(p => ({ ...p, workflow: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Select Workflow *</option>
                {workflows.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
              <select value={form.triggerType} onChange={e => setForm(p => ({ ...p, triggerType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {TRIGGER_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
              </select>
              {form.triggerType === 'event' && (
                <>
                  <input value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))} placeholder="Event name (e.g. leave_request_submitted)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <select value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Select Module</option>
                    {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input value={form.entityType} onChange={e => setForm(p => ({ ...p, entityType: e.target.value }))} placeholder="Entity Type (e.g. LeaveRequest)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                </>
              )}
              {form.triggerType === 'schedule' && (
                <input value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} placeholder="Cron expression (e.g. 0 9 * * 1)" className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
              )}
              {form.triggerType === 'webhook' && (
                <input value={form.webhookUrl} onChange={e => setForm(p => ({ ...p, webhookUrl: e.target.value }))} placeholder="Webhook URL" className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-14 resize-none" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />Active</label>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
