import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchRetentionPolicies, createRetentionPolicy, updateRetentionPolicy, deleteRetentionPolicy, fetchExpiringDocuments } from '../../services/documentAPI';

const empty = { name: '', description: '', documentType: '', module: 'general', retentionYears: 7, retentionMonths: 0, postRetentionAction: 'archive', legalBasis: '', regulatoryRef: '', notifyDaysBefore: 30, isActive: true };

export default function AdminDocumentRetention() {
  const [policies, setPolicies] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [activeTab, setActiveTab] = useState('policies');

  const load = () => {
    fetchRetentionPolicies().then(r => setPolicies(r.data.data || [])).catch(console.error);
    fetchExpiringDocuments({ days: 60 }).then(r => setExpiring(r.data.data || [])).catch(console.error);
  };

  useEffect(load, []);

  const openModal = (p = null) => {
    setEditing(p);
    setForm(p ? { name: p.name, description: p.description || '', documentType: p.documentType || '', module: p.module, retentionYears: p.retentionYears, retentionMonths: p.retentionMonths || 0, postRetentionAction: p.postRetentionAction, legalBasis: p.legalBasis || '', regulatoryRef: p.regulatoryRef || '', notifyDaysBefore: p.notifyDaysBefore || 30, isActive: p.isActive } : empty);
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await updateRetentionPolicy(editing._id, form);
      else await createRetentionPolicy(form);
      setShowModal(false);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate retention policy?')) return;
    await deleteRetentionPolicy(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Document Retention</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Policy</button>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {['policies', 'expiring'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${activeTab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'policies' ? 'Retention Policies' : `Expiring Documents (${expiring.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'policies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.length === 0
              ? <p className="col-span-2 text-center text-gray-400 py-8">No policies yet.</p>
              : policies.map(p => (
                <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.retentionCode}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <p>Retention: <span className="font-medium">{p.retentionYears}y {p.retentionMonths}m</span></p>
                    <p>After: <span className="font-medium capitalize">{p.postRetentionAction?.replace('_', ' ')}</span></p>
                    {p.module && <p>Module: <span className="capitalize">{p.module}</span></p>}
                    {p.legalBasis && <p>Legal: {p.legalBasis}</p>}
                    <p>Notify: {p.notifyDaysBefore} days before</p>
                    <p>Applied to: {p.appliedCount || 0} documents</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(p)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-xs text-red-500 hover:underline">Deactivate</button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'expiring' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                {['Code', 'Title', 'Module', 'Status', 'Expiry Date', 'Owner', 'Days Left'].map(h =>
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y">
                {expiring.length === 0
                  ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No expiring documents.</td></tr>
                  : expiring.map(d => {
                    const daysLeft = Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={d._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono text-xs">{d.documentCode}</td>
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{d.title}</td>
                        <td className="px-4 py-2.5 text-xs capitalize">{d.module}</td>
                        <td className="px-4 py-2.5"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{d.status}</span></td>
                        <td className="px-4 py-2.5 text-xs">{new Date(d.expiryDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5 text-xs">{d.owner?.name || '-'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-semibold ${daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-gray-600'}`}>{daysLeft}d</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold">{editing ? 'Edit Policy' : 'New Retention Policy'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Policy Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500 block mb-1">Retention Years</label><input type="number" min="0" value={form.retentionYears} onChange={e => setForm(p => ({ ...p, retentionYears: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Additional Months</label><input type="number" min="0" max="11" value={form.retentionMonths} onChange={e => setForm(p => ({ ...p, retentionMonths: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <select value={form.postRetentionAction} onChange={e => setForm(p => ({ ...p, postRetentionAction: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {['delete', 'archive', 'review', 'legal_hold'].map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
              </select>
              <input value={form.legalBasis} onChange={e => setForm(p => ({ ...p, legalBasis: e.target.value }))} placeholder="Legal Basis" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input value={form.regulatoryRef} onChange={e => setForm(p => ({ ...p, regulatoryRef: e.target.value }))} placeholder="Regulatory Reference" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <div><label className="text-xs text-gray-500 block mb-1">Notify Days Before Expiry</label><input type="number" value={form.notifyDaysBefore} onChange={e => setForm(p => ({ ...p, notifyDaysBefore: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />Active</label>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
