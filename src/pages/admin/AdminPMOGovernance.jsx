import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchBoards, createBoard, updateBoard, deleteBoard, fetchDecisions, createDecision, deleteDecision } from '../../services/pmoAPI';

const BOARD_TYPES = ['portfolio_review', 'program_review', 'project_review', 'investment_committee', 'steering_committee', 'audit_committee', 'risk_committee'];
const DECISION_TYPES = ['investment', 'scope', 'budget', 'resource', 'risk', 'timeline', 'strategic', 'operational', 'other'];

function Badge({ v, map }) {
  const colors = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-700', dissolved: 'bg-red-100 text-red-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', proposed: 'bg-blue-100 text-blue-800', implemented: 'bg-purple-100 text-purple-800', deferred: 'bg-amber-100 text-amber-800', under_review: 'bg-amber-100 text-amber-800' };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[v] || 'bg-gray-100 text-gray-700'}`}>{(v || '').replace(/_/g, ' ')}</span>;
}

const empty = { name: '', description: '', boardType: 'portfolio_review', status: 'active', meetingFrequency: 'monthly', mandate: '', decisionAuthority: '' };

export default function AdminPMOGovernance() {
  const [tab, setTab]           = useState('boards');
  const [boards, setBoards]     = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);

  const load = () => {
    fetchBoards().then(r => setBoards(r.data.data || [])).catch(() => {});
    fetchDecisions().then(r => setDecisions(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setModal('board'); };
  const openEdit   = (b)  => { setForm({ ...b }); setModal('board-edit'); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'board-edit') await updateBoard(form._id, form);
      else await createBoard(form);
      load(); setModal(null);
    } catch { } finally { setSaving(false); }
  };

  const [dForm, setDForm] = useState({ title: '', decisionType: 'other', status: 'proposed', priority: 'medium', rationale: '', impact: '' });

  const saveDecision = async () => {
    setSaving(true);
    try { await createDecision(dForm); load(); setModal(null); } catch { } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">PMO Governance</h1><p className="text-sm text-gray-500 mt-1">Governance Boards & Decision Log</p></div>
          <button onClick={() => setModal(tab === 'boards' ? 'board' : 'decision')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            + {tab === 'boards' ? 'New Board' : 'Log Decision'}
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[{ id: 'boards', label: 'Governance Boards' }, { id: 'decisions', label: 'Decision Log' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'boards' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>{['Code', 'Name', 'Type', 'Status', 'Frequency', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {boards.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.boardCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                    <td className="px-4 py-3 text-gray-600">{(b.boardType || '').replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3"><Badge v={b.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{(b.meetingFrequency || '').replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(b)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={async () => { await deleteBoard(b._id); load(); }} className="text-red-500 hover:underline text-xs">Del</button>
                    </td>
                  </tr>
                ))}
                {boards.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No governance boards yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'decisions' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>{['Code', 'Title', 'Type', 'Priority', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {decisions.map(d => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.decisionCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.title}</td>
                    <td className="px-4 py-3 text-gray-600">{(d.decisionType || '').replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3"><Badge v={d.priority} /></td>
                    <td className="px-4 py-3"><Badge v={d.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={async () => { await deleteDecision(d._id); load(); }} className="text-red-500 hover:underline text-xs">Del</button>
                    </td>
                  </tr>
                ))}
                {decisions.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No decisions logged.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {(modal === 'board' || modal === 'board-edit') && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{modal === 'board-edit' ? 'Edit Board' : 'New Governance Board'}</h2>
              {[['Name *', 'name', 'text'], ['Mandate', 'mandate', 'textarea'], ['Decision Authority', 'decisionAuthority', 'textarea']].map(([l, k, t]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                  {t === 'textarea'
                    ? <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                    : <input type={t} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[['Board Type', 'boardType', BOARD_TYPES], ['Status', 'status', ['active', 'inactive', 'dissolved']], ['Frequency', 'meetingFrequency', ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'ad_hoc']]].map(([l, k, opts]) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}>
                      {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving || !form.name} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {modal === 'decision' && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">Log Decision</h2>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={dForm.title} onChange={e => setDForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={dForm.decisionType} onChange={e => setDForm(p => ({ ...p, decisionType: e.target.value }))}>
                    {DECISION_TYPES.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={dForm.priority} onChange={e => setDForm(p => ({ ...p, priority: e.target.value }))}>
                    {['low', 'medium', 'high', 'critical'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rationale</label>
                <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={dForm.rationale} onChange={e => setDForm(p => ({ ...p, rationale: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Impact</label>
                <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={dForm.impact} onChange={e => setDForm(p => ({ ...p, impact: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveDecision} disabled={saving || !dForm.title} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
