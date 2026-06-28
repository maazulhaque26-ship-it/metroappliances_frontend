import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import { fetchMilestones, createMilestone, updateMilestone, completeMilestone } from '../../services/projectAPI';

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-600', at_risk: 'bg-yellow-100 text-yellow-700',
  achieved: 'bg-green-100 text-green-700', missed: 'bg-red-100 text-red-700',
};
const BLANK = { name: '', description: '', dueDate: '' };

export default function AdminMilestones() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    // fetch all milestones — use a placeholder projectId that returns all
    setLoading(true);
    fetchMilestones('all', filter !== 'all' ? { status: filter } : {})
      .then(r => setItems(r.data.data || r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const openCreate = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit   = m => { setForm({ name: m.name, description: m.description || '', dueDate: m.dueDate ? m.dueDate.slice(0, 10) : '' }); setEditId(m._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) await updateMilestone(editId, form);
      else await createMilestone('all', form);
      setModal(false); load();
    } catch (_) {} finally { setSaving(false); }
  };

  const handleComplete = async (id) => {
    try { await completeMilestone(id); load(); } catch (_) {}
  };

  const FILTERS = ['all', 'pending', 'at_risk', 'achieved', 'missed'];

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
            <p className="text-sm text-gray-500 mt-1">Track key project milestones</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <FiPlus size={16} /> New Milestone
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-10">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No milestones found.</p>
        ) : (
          <div className="space-y-3">
            {items.map(m => (
              <div key={m._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[m.status] || 'bg-gray-100'}`}>{m.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{m.milestoneCode} · Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '—'}</p>
                  {m.description && <p className="text-sm text-gray-600 mt-1">{m.description}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  {m.status !== 'achieved' && (
                    <button onClick={() => handleComplete(m._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Mark as achieved">
                      <FiCheck size={16} />
                    </button>
                  )}
                  <button onClick={() => openEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit' : 'New'} Milestone</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
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
