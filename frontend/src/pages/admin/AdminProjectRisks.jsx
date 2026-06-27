import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { fetchRisks, createRisk, updateRisk, deleteRisk } from '../../services/projectAPI';

const BLANK = { title: '', category: 'technical', probability: 'medium', impact: 'medium', mitigation: '', contingency: '' };
const SCORE_COLOR = s => s >= 7 ? 'bg-red-100 text-red-700' : s >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
const SCORE_LABEL = s => s >= 7 ? 'High' : s >= 4 ? 'Medium' : 'Low';
const STATUS_COLORS = {
  identified: 'bg-blue-100 text-blue-700', assessed: 'bg-yellow-100 text-yellow-700',
  mitigated: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600',
};

export default function AdminProjectRisks() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchRisks('all', filter !== 'all' ? { status: filter } : {})
      .then(r => setItems(r.data.data || r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const openCreate = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit   = r => { setForm({ title: r.title, category: r.category, probability: r.probability, impact: r.impact, mitigation: r.mitigation || '', contingency: r.contingency || '' }); setEditId(r._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) await updateRisk(editId, form);
      else await createRisk('all', form);
      setModal(false); load();
    } catch (_) {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this risk?')) return;
    try { await deleteRisk(id); load(); } catch (_) {}
  };

  const openCount   = items.filter(i => ['identified', 'assessed'].includes(i.status)).length;
  const highCount   = items.filter(i => (i.riskScore || 0) >= 7).length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Risks</h1>
            <p className="text-sm text-gray-500 mt-1">Identify and mitigate project risks</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <FiPlus size={16} /> New Risk
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Risks', value: items.length, color: 'text-gray-700', bg: 'bg-gray-50' },
            { label: 'Open Risks', value: openCount, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'High Risk', value: highCount, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(c => (
            <div key={c.label} className={`${c.bg} border border-gray-200 rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-sm text-gray-500 mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'identified', 'assessed', 'mitigated', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <p className="text-gray-400 text-center py-10">Loading...</p> : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Code', 'Title', 'Category', 'Probability', 'Impact', 'Score', 'Status', 'Owner', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No risks found.</td></tr>
                ) : items.map(r => (
                  <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.riskCode}</td>
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{r.title}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{r.category}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{r.probability}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{r.impact}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SCORE_COLOR(r.riskScore || 0)}`}>{r.riskScore || 0} — {SCORE_LABEL(r.riskScore || 0)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.owner?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(r)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDelete(r._id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit' : 'New'} Risk</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      {['technical', 'resource', 'financial', 'external', 'organizational'].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Probability</label>
                    <select value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      {['low', 'medium', 'high'].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                    <select value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      {['low', 'medium', 'high', 'critical'].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mitigation Plan</label>
                  <textarea value={form.mitigation} onChange={e => setForm(f => ({ ...f, mitigation: e.target.value }))} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Contingency Plan</label>
                  <textarea value={form.contingency} onChange={e => setForm(f => ({ ...f, contingency: e.target.value }))} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" /></div>
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
