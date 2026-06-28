import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchCompliance, createCompliance, updateCompliance, deleteCompliance, fetchComplianceSummary } from '../../services/pmoAPI';

const STATUSES   = ['compliant', 'non_compliant', 'partially_compliant', 'under_review', 'not_applicable'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const CATEGORIES = ['regulatory', 'policy', 'standard', 'methodology', 'process', 'reporting', 'other'];

const statusColor = { compliant: 'bg-green-100 text-green-800', non_compliant: 'bg-red-100 text-red-800', partially_compliant: 'bg-amber-100 text-amber-700', under_review: 'bg-blue-100 text-blue-800', not_applicable: 'bg-gray-100 text-gray-600' };
const sevColor    = { low: 'bg-gray-100 text-gray-700', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800' };

const emptyForm = { title: '', description: '', category: 'policy', framework: '', status: 'under_review', severity: 'medium', remediationPlan: '', notes: '' };

export default function AdminPMOCompliance() {
  const [items, setItems]     = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter]   = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    const params = filter ? { status: filter } : {};
    fetchCompliance(params).then(r => setItems(r.data.data || [])).catch(() => {});
    fetchComplianceSummary().then(r => setSummary(r.data.data || r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateCompliance(editing, form);
      else await createCompliance(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Compliance Tracking</h1><p className="text-sm text-gray-500 mt-1">PMO compliance register</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Item</button>
        </div>

        {summary && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {(summary.byStatus || []).map(s => (
              <div key={s._id} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{s.count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{(s._id || '').replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>{['Code', 'Title', 'Category', 'Framework', 'Severity', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.complianceCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.framework}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sevColor[item.severity]}`}>{item.severity}</span></td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[item.status]}`}>{(item.status || '').replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                    <button onClick={async () => { await deleteCompliance(item._id); load(); }} className="text-red-500 hover:underline text-xs">Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No compliance items.</td></tr>}
            </tbody>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Compliance Item' : 'New Compliance Item'}</h2>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Framework</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.framework} onChange={e => setForm(p => ({ ...p, framework: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-3">
                {[['Category', 'category', CATEGORIES], ['Severity', 'severity', SEVERITIES], ['Status', 'status', STATUSES]].map(([l, k, opts]) => (
                  <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}>
                      {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Remediation Plan</label>
                <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.remediationPlan} onChange={e => setForm(p => ({ ...p, remediationPlan: e.target.value }))} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving || !form.title} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
