import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchInvestmentRequests, createInvestmentRequest, updateInvestmentRequest, deleteInvestmentRequest, decideInvestmentRequest } from '../../services/pmoAPI';

const fmtC = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const STATUSES  = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'deferred', 'implemented'];
const REQ_TYPES = ['capex', 'opex', 'headcount', 'technology', 'infrastructure', 'training', 'other'];
const QUARTERS  = ['Q1', 'Q2', 'Q3', 'Q4'];

const statusColor = { draft: 'bg-gray-100 text-gray-700', submitted: 'bg-blue-100 text-blue-800', under_review: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', deferred: 'bg-orange-100 text-orange-800', implemented: 'bg-purple-100 text-purple-800' };

const emptyForm = { title: '', description: '', requestType: 'capex', status: 'draft', priority: 'medium', requestedAmount: 0, fiscalYear: new Date().getFullYear(), quarter: 'Q1', justification: '', expectedRoi: 0 };

export default function AdminPMOInvestmentRequests() {
  const [items, setItems]   = useState([]);
  const [filter, setFilter] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [decideModal, setDecideModal] = useState(null);
  const [decideForm, setDecideForm]   = useState({ status: 'approved', approvedAmount: 0 });

  const load = () => {
    const params = filter ? { status: filter } : {};
    fetchInvestmentRequests(params).then(r => setItems(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit   = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = ()     => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateInvestmentRequest(editing, form);
      else await createInvestmentRequest(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  const decide = async () => {
    try { await decideInvestmentRequest(decideModal, decideForm); load(); setDecideModal(null); } catch { }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Investment Requests</h1><p className="text-sm text-gray-500 mt-1">CapEx / OpEx investment pipeline</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Request</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{s.replace(/_/g, ' ')}</button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>{['Code', 'Title', 'Type', 'FY', 'Q', 'Requested', 'Approved', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.requestCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 uppercase">{item.requestType}</td>
                  <td className="px-4 py-3 text-gray-600">{item.fiscalYear}</td>
                  <td className="px-4 py-3 text-gray-600">{item.quarter}</td>
                  <td className="px-4 py-3 font-medium">{fmtC(item.requestedAmount)}</td>
                  <td className="px-4 py-3 text-green-700">{item.approvedAmount > 0 ? fmtC(item.approvedAmount) : '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[item.status]}`}>{(item.status || '').replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                    {['submitted', 'under_review'].includes(item.status) && (
                      <button onClick={() => { setDecideModal(item._id); setDecideForm({ status: 'approved', approvedAmount: item.requestedAmount }); }} className="text-green-600 hover:underline text-xs">Decide</button>
                    )}
                    <button onClick={async () => { await deleteInvestmentRequest(item._id); load(); }} className="text-red-500 hover:underline text-xs">Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No investment requests.</td></tr>}
            </tbody>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Request' : 'New Investment Request'}</h2>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                {[['Type', 'requestType', REQ_TYPES], ['Priority', 'priority', ['low', 'medium', 'high', 'critical']], ['Quarter', 'quarter', QUARTERS]].map(([l, k, opts]) => (
                  <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}>
                      {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                ))}
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Fiscal Year</label>
                  <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.fiscalYear} onChange={e => setForm(p => ({ ...p, fiscalYear: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Requested Amount (₹)</label>
                  <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.requestedAmount} onChange={e => setForm(p => ({ ...p, requestedAmount: Number(e.target.value) }))} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Expected ROI (%)</label>
                  <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.expectedRoi} onChange={e => setForm(p => ({ ...p, expectedRoi: Number(e.target.value) }))} /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Justification</label>
                <textarea rows={3} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.justification} onChange={e => setForm(p => ({ ...p, justification: e.target.value }))} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving || !form.title} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {decideModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
              <h2 className="text-lg font-bold">Decision</h2>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Decision</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={decideForm.status} onChange={e => setDecideForm(p => ({ ...p, status: e.target.value }))}>
                  {['approved', 'rejected', 'deferred'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {decideForm.status === 'approved' && (
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Approved Amount (₹)</label>
                  <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={decideForm.approvedAmount} onChange={e => setDecideForm(p => ({ ...p, approvedAmount: Number(e.target.value) }))} /></div>
              )}
              <div className="flex gap-3">
                <button onClick={decide} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium">Confirm</button>
                <button onClick={() => setDecideModal(null)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
