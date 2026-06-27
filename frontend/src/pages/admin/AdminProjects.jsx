import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { FiPlus, FiX, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchProjects, createProject, updateProject, deleteProject } from '../../services/projectAPI';

const STATUS_COLORS = {
  planning: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const BLANK = { name: '', description: '', type: 'internal', priority: 'medium', startDate: '', endDate: '', budget: '' };
const STATUSES = ['all', 'planning', 'active', 'on_hold', 'completed'];
const LIMIT = 15;

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (statusFilter !== 'all') params.status = statusFilter;
    fetchProjects(params)
      .then(r => { setProjects(r.data.data || r.data.projects || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ ...BLANK }); setModal(true); };
  const openEdit = (p) => { setEditing(p._id); setForm({ name: p.name || '', description: p.description || '', type: p.type || 'internal', priority: p.priority || 'medium', startDate: p.startDate?.slice(0, 10) || '', endDate: p.endDate?.slice(0, 10) || '', budget: p.budget || '' }); setModal(true); };

  const set = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) await updateProject(editing, form);
      else await createProject(form);
      setModal(false);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error saving project'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await deleteProject(id); load(); } catch { alert('Failed to delete'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-500 mt-1">{total} projects total</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <FiPlus size={15} /> New Project
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Code', 'Name', 'Status', 'Priority', 'Manager', 'Progress', 'Start', 'End', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No items found.</td></tr>
                ) : projects.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.code || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {(p.status || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[p.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {p.priority || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.manager?.name || '—'}</td>
                    <td className="px-4 py-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-7 text-right">{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded" title="Edit"><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><FiChevronLeft size={14} /></button>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><FiChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setModal(false)}><FiX size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Project Name *</label>
                <input required value={form.name} onChange={set('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Enter project name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={set('description')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Project description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={set('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {['internal', 'external', 'research', 'maintenance'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={set('priority')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {['low', 'medium', 'high', 'critical'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={set('startDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={set('endDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Budget (₹)</label>
                <input type="number" value={form.budget} onChange={set('budget')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                  {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
