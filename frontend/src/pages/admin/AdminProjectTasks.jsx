import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { fetchTasks, createTask, updateTask, deleteTask, updateTaskStatus } from '../../services/projectAPI';

const TASK_COLORS = {
  todo: 'bg-gray-100 text-gray-600', in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700', done: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};
const PRI_COLORS = {
  low: 'text-gray-500', medium: 'text-yellow-600', high: 'text-orange-600', critical: 'text-red-600',
};
const BLANK = { title: '', type: 'task', priority: 'medium', estimatedHours: '', dueDate: '', description: '' };

export default function AdminProjectTasks() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(BLANK);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    // fetch tasks across all projects
    fetchTasks('all', statusFilter !== 'all' ? { status: statusFilter } : {})
      .then(r => setTasks(r.data.data || r.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const openCreate = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit   = t => { setForm({ title: t.title, type: t.type, priority: t.priority, estimatedHours: t.estimatedHours || '', dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '', description: t.description || '' }); setEditId(t._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) await updateTask(editId, form);
      else await createTask('all', form);
      setModal(false); load();
    } catch (_) {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await deleteTask(id); load(); } catch (_) {}
  };

  const handleStatusChange = async (id, status) => {
    try { await updateTaskStatus(id, status); load(); } catch (_) {}
  };

  const STATUSES = ['all', 'todo', 'in_progress', 'review', 'done', 'cancelled'];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">All tasks across projects</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <FiPlus size={16} /> New Task
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-10">Loading...</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Code', 'Title', 'Type', 'Priority', 'Assignee', 'Est. Hours', 'Status', 'Due Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No tasks found.</td></tr>
                ) : tasks.map(t => (
                  <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{t.taskCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{t.title}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{t.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold capitalize ${PRI_COLORS[t.priority] || ''}`}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.assignee?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{t.estimatedHours ? `${t.estimatedHours}h` : '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={t.status}
                        onChange={e => handleStatusChange(t._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border-none outline-none cursor-pointer ${TASK_COLORS[t.status] || 'bg-gray-100'}`}
                      >
                        {['todo', 'in_progress', 'review', 'done', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(t)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDelete(t._id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit' : 'New'} Task</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      {['task', 'bug', 'feature', 'improvement'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      {['low', 'medium', 'high', 'critical'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours</label>
                    <input type="number" value={form.estimatedHours} onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
