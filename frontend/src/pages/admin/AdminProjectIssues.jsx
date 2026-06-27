import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { fetchIssues, createIssue, updateIssue, deleteIssue } from '../../services/projectAPI';

const SEV_COLORS = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700',
};
const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-700', in_progress: 'bg-indigo-100 text-indigo-700',
  resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500',
  wont_fix: 'bg-red-50 text-red-400',
};
const BLANK = { title: '', type: 'bug', severity: 'medium', description: '' };

export default function AdminProjectIssues() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchIssues('all', filter !== 'all' ? { status: filter } : {})
      .then(r => setItems(r.data.data || r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const openCreate = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit   = i => { setForm({ title: i.title, type: i.type, severity: i.severity, description: i.description || '' }); setEditId(i._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) await updateIssue(editId, form);
      else await createIssue('all', form);
      setModal(false); load();
    } catch (_) {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this issue?')) return;
    try { await deleteIssue(id); load(); } catch (_) {}
  };

  const handleStatusUpdate = async (id, status) => {
    try { await updateIssue(id, { status }); load(); } catch (_) {}
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Issues</h1>
            <p className="text-sm text-gray-500 mt-1">Track and resolve project issues</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <FiPlus size={16} /> New Issue
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? <p className="text-gray-400 text-center py-10">Loading...</p> : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Code', 'Title', 'Type', 'Severity', 'Status', 'Reporter', 'Assignee', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No issues found.</td></tr>
                ) : items.map(i => (
                  <tr key={i._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{i.issueCode}</td>
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{i.title}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{i.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEV_COLORS[i.severity] || 'bg-gray-100'}`}>{i.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={i.status} onChange={e => handleStatusUpdate(i._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border-none outline-none cursor-pointer ${STATUS_COLORS[i.status] || 'bg-gray-100'}`}>
                        {['open', 'in_progress', 'resolved', 'closed', 'wont_fix'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{i.reportedBy?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{i.assignee?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{i.createdAt ? new Date(i.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(i)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDelete(i._id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
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
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit' : 'New'} Issue</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      {['bug', 'blocker', 'question', 'improvement'].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      {['low', 'medium', 'high', 'critical'].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" /></div>
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
