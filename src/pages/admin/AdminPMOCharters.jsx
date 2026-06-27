import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchCharters, createCharter, updateCharter, deleteCharter, approveCharter } from '../../services/pmoAPI';

const fmtC = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const STATUSES = ['draft', 'under_review', 'approved', 'rejected', 'superseded'];
const statusColor = { draft: 'bg-gray-100 text-gray-700', under_review: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', superseded: 'bg-gray-100 text-gray-500' };

const emptyForm = { projectObjectives: '', projectScope: '', outOfScope: '', deliverables: '', assumptions: '', constraints: '', risks: '', successCriteria: '', budget: 0, version: '1.0', status: 'draft' };

export default function AdminPMOCharters() {
  const [items, setItems]     = useState([]);
  const [filter, setFilter]   = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    const params = filter ? { status: filter } : {};
    fetchCharters(params).then(r => setItems(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit   = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = ()     => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateCharter(editing, form);
      else await createCharter(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  const decide = async (id, status) => {
    try { await approveCharter(id, { status }); load(); } catch { }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Project Charters</h1><p className="text-sm text-gray-500 mt-1">Formal project authorization documents</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Charter</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{s.replace(/_/g, ' ')}</button>
          ))}
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{item.charterCode}</span>
                    <span className="text-xs text-gray-500">v{item.version}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[item.status]}`}>{item.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-1">{item.project?.name || 'No Project'}</h3>
                  {item.projectObjectives && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.projectObjectives}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{fmtC(item.budget)}</p>
                  <p className="text-xs text-gray-500">Budget</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(item)} className="text-indigo-600 text-xs hover:underline">Edit</button>
                {item.status === 'under_review' && (
                  <>
                    <button onClick={() => decide(item._id, 'approved')} className="text-green-600 text-xs hover:underline">Approve</button>
                    <button onClick={() => decide(item._id, 'rejected')} className="text-red-500 text-xs hover:underline">Reject</button>
                  </>
                )}
                {item.status === 'draft' && (
                  <button onClick={() => updateCharter(item._id, { status: 'under_review' }).then(load)} className="text-blue-600 text-xs hover:underline">Submit</button>
                )}
                <button onClick={async () => { await deleteCharter(item._id); load(); }} className="text-red-500 text-xs hover:underline ml-auto">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-10">No project charters.</p>}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Charter' : 'New Project Charter'}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Version</label>
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Budget (₹)</label>
                  <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: Number(e.target.value) }))} /></div>
              </div>
              {[['Project Objectives', 'projectObjectives'], ['Project Scope', 'projectScope'], ['Out of Scope', 'outOfScope'], ['Deliverables', 'deliverables'], ['Assumptions', 'assumptions'], ['Constraints', 'constraints'], ['Risks', 'risks'], ['Success Criteria', 'successCriteria']].map(([l, k]) => (
                <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                  <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
