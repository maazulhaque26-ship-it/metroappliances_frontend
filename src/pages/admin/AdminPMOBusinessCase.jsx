import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchBusinessCases, createBusinessCase, updateBusinessCase, deleteBusinessCase, approveBusinessCase } from '../../services/pmoAPI';

const fmtC = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const STATUSES = ['draft', 'under_review', 'approved', 'rejected', 'on_hold', 'implemented'];
const statusColor = { draft: 'bg-gray-100 text-gray-700', under_review: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', on_hold: 'bg-amber-100 text-amber-800', implemented: 'bg-purple-100 text-purple-800' };

const emptyForm = { title: '', description: '', status: 'draft', priority: 'medium', problemStatement: '', proposedSolution: '', expectedBenefits: '', estimatedCost: 0, estimatedBenefit: 0, roi: 0, paybackPeriod: 0, implementationPlan: '', successCriteria: '' };

export default function AdminPMOBusinessCase() {
  const [items, setItems]   = useState([]);
  const [filter, setFilter] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filter ? { status: filter } : {};
    fetchBusinessCases(params).then(r => setItems(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit   = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = ()     => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateBusinessCase(editing, form);
      else await createBusinessCase(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  const decide = async (id, status) => {
    try { await approveBusinessCase(id, { status }); load(); } catch { }
  };

  const fld = (l, k, t = 'text') => (
    <div key={k}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
      {t === 'textarea'
        ? <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
        : <input type={t} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />}
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Business Cases</h1><p className="text-sm text-gray-500 mt-1">Investment justification & approval</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Business Case</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{s.replace(/_/g, ' ')}</button>
          ))}
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{item.caseCode}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[item.status]}`}>{item.status?.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.priority}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-1">{item.title}</h3>
                  {item.problemStatement && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.problemStatement}</p>}
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="text-xs text-gray-500">Cost vs Benefit</p>
                  <p className="text-sm font-medium">{fmtC(item.estimatedCost)} → {fmtC(item.estimatedBenefit)}</p>
                  {item.roi > 0 && <p className="text-xs text-green-600">ROI: {item.roi}%</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="text-indigo-600 text-xs hover:underline">Edit</button>
                {item.status === 'under_review' && (
                  <>
                    <button onClick={() => decide(item._id, 'approved')} className="text-green-600 text-xs hover:underline">Approve</button>
                    <button onClick={() => decide(item._id, 'rejected')} className="text-red-500 text-xs hover:underline">Reject</button>
                  </>
                )}
                {item.status === 'draft' && <button onClick={() => updateBusinessCase(item._id, { status: 'under_review' }).then(load)} className="text-blue-600 text-xs hover:underline">Submit for Review</button>}
                <button onClick={async () => { await deleteBusinessCase(item._id); load(); }} className="text-red-500 text-xs hover:underline ml-auto">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-10">No business cases.</p>}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Business Case' : 'New Business Case'}</h2>
              {fld('Title *', 'title')}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {STATUSES.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    {['low', 'medium', 'high', 'critical'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              {fld('Problem Statement', 'problemStatement', 'textarea')}
              {fld('Proposed Solution', 'proposedSolution', 'textarea')}
              {fld('Expected Benefits', 'expectedBenefits', 'textarea')}
              <div className="grid grid-cols-3 gap-3">
                {fld('Estimated Cost (₹)', 'estimatedCost', 'number')}
                {fld('Estimated Benefit (₹)', 'estimatedBenefit', 'number')}
                {fld('ROI (%)', 'roi', 'number')}
              </div>
              {fld('Success Criteria', 'successCriteria', 'textarea')}
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
