import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchAudits, createAudit, updateAudit, deleteAudit, fetchAuditSummary, addFinding } from '../../services/pmoAPI';

const AUDIT_TYPES = ['schedule', 'budget', 'quality', 'risk', 'process', 'compliance', 'health_check', 'gate_review', 'post_mortem'];
const RATINGS     = ['excellent', 'satisfactory', 'needs_improvement', 'unsatisfactory', 'critical'];
const STATUSES    = ['planned', 'in_progress', 'completed', 'report_issued', 'closed'];

const ratingColor = { excellent: 'bg-green-100 text-green-800', satisfactory: 'bg-blue-100 text-blue-800', needs_improvement: 'bg-amber-100 text-amber-800', unsatisfactory: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800' };
const statusColor = { planned: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', report_issued: 'bg-purple-100 text-purple-800', closed: 'bg-gray-100 text-gray-500' };

const emptyForm = { title: '', auditType: 'health_check', status: 'planned', overallRating: 'satisfactory', summary: '', recommendations: '' };

export default function AdminPMOAudit() {
  const [items, setItems]   = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [findingAuditId, setFindingAuditId] = useState(null);
  const [findingForm, setFindingForm] = useState({ area: '', finding: '', severity: 'medium', recommendation: '' });

  const load = () => {
    const params = filter ? { status: filter } : {};
    fetchAudits(params).then(r => setItems(r.data.data || [])).catch(() => {});
    fetchAuditSummary().then(r => setSummary(r.data.data || r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit   = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = ()     => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateAudit(editing, form);
      else await createAudit(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  const saveFinding = async () => {
    try { await addFinding(findingAuditId, findingForm); load(); setFindingAuditId(null); } catch { }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Project Audits</h1><p className="text-sm text-gray-500 mt-1">Quality gates & project health audits</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Audit</button>
        </div>

        {summary && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center col-span-1"><p className="text-xl font-bold">{summary.total}</p><p className="text-xs text-gray-500">Total</p></div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center col-span-1"><p className="text-xl font-bold text-red-700">{summary.openFindings}</p><p className="text-xs text-gray-500">Open Findings</p></div>
            {(summary.byRating || []).slice(0, 3).map(r => (
              <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{r.count}</p><p className="text-xs text-gray-500">{(r._id || '').replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{s.replace(/_/g, ' ')}</button>
          ))}
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-400">{item.auditCode}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{(item.auditType || '').replace(/_/g, ' ')}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[item.status]}`}>{item.status?.replace(/_/g, ' ')}</span>
                    {item.overallRating && <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ratingColor[item.overallRating]}`}>{item.overallRating?.replace(/_/g, ' ')}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.project?.name || 'No project'} · {item.findings?.length || 0} finding(s)</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(item)} className="text-indigo-600 text-xs hover:underline">Edit</button>
                <button onClick={() => { setFindingAuditId(item._id); setFindingForm({ area: '', finding: '', severity: 'medium', recommendation: '' }); }} className="text-amber-600 text-xs hover:underline">+ Finding</button>
                <button onClick={async () => { await deleteAudit(item._id); load(); }} className="text-red-500 text-xs hover:underline ml-auto">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-10">No audits.</p>}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Audit' : 'New Audit'}</h2>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-3">
                {[['Type', 'auditType', AUDIT_TYPES], ['Status', 'status', STATUSES], ['Rating', 'overallRating', RATINGS]].map(([l, k, opts]) => (
                  <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}>
                      {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Summary</label>
                <textarea rows={3} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Recommendations</label>
                <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.recommendations} onChange={e => setForm(p => ({ ...p, recommendations: e.target.value }))} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving || !form.title} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {findingAuditId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
              <h2 className="text-lg font-bold">Add Finding</h2>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Area *</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={findingForm.area} onChange={e => setFindingForm(p => ({ ...p, area: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Finding *</label>
                <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={findingForm.finding} onChange={e => setFindingForm(p => ({ ...p, finding: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={findingForm.severity} onChange={e => setFindingForm(p => ({ ...p, severity: e.target.value }))}>
                  {['low', 'medium', 'high', 'critical'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Recommendation</label>
                <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={findingForm.recommendation} onChange={e => setFindingForm(p => ({ ...p, recommendation: e.target.value }))} /></div>
              <div className="flex gap-3">
                <button onClick={saveFinding} disabled={!findingForm.area || !findingForm.finding} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">Save</button>
                <button onClick={() => setFindingAuditId(null)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
