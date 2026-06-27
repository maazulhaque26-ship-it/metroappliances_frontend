import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchScorecards, createScorecard, updateScorecard, deleteScorecard, fetchScorecardHealthReport } from '../../services/pmoAPI';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const healthColor = { green: 'text-green-600 bg-green-50', amber: 'text-amber-600 bg-amber-50', red: 'text-red-600 bg-red-50', not_assessed: 'text-gray-500 bg-gray-50' };
const healthDot   = { green: 'bg-green-500', amber: 'bg-amber-500', red: 'bg-red-500', not_assessed: 'bg-gray-400' };
const PERIOD_TYPES = ['weekly', 'monthly', 'quarterly'];

const emptyForm = { period: '', periodType: 'monthly', overallScore: 50, spi: 1, cpi: 1, ev: 0, pv: 0, ac: 0, bac: 0, eac: 0, etc: 0, scheduleVariance: 0, costVariance: 0, narrative: '', keyAchievements: '', keyRisks: '', nextSteps: '' };

export default function AdminPMOScorecard() {
  const [items, setItems]   = useState([]);
  const [report, setReport] = useState(null);
  const [filter, setFilter] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab]       = useState('list');

  const load = () => {
    const params = filter ? { periodType: filter } : {};
    fetchScorecards(params).then(r => setItems(r.data.data || [])).catch(() => {});
    fetchScorecardHealthReport().then(r => setReport(r.data.data || r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit   = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = ()     => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateScorecard(editing, form);
      else await createScorecard(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  const numFld = (l, k) => (
    <div key={k}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
      <input type="number" step="0.01" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: Number(e.target.value) }))} />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Project Scorecards</h1><p className="text-sm text-gray-500 mt-1">EV / SPI / CPI health tracking</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Scorecard</button>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[{ id: 'list', label: 'Scorecards' }, { id: 'health', label: 'Health Report' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'list' && (
          <>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
              {PERIOD_TYPES.map(t => (
                <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t}</button>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>{['Code', 'Project', 'Period', 'Score', 'Health', 'SPI', 'CPI', 'EV', 'AC', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.scorecardCode}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.project?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.period} ({item.periodType})</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full"><div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${item.overallScore}%` }} /></div>
                          <span className="text-xs font-medium">{item.overallScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${healthColor[item.overallHealth]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${healthDot[item.overallHealth]}`} />{item.overallHealth?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">{item.spi?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-medium">{item.cpi?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs">{Number(item.ev || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-xs">{Number(item.ac || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => openEdit(item)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                        <button onClick={async () => { await deleteScorecard(item._id); load(); }} className="text-red-500 hover:underline text-xs">Del</button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No scorecards.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'health' && report && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center"><p className="text-2xl font-bold">{report.total}</p><p className="text-sm text-gray-500">Projects Assessed</p></div>
              <div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-700">{report.byHealth?.green || 0}</p><p className="text-sm text-gray-600">Green</p></div>
              <div className="bg-amber-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-amber-700">{report.byHealth?.amber || 0}</p><p className="text-sm text-gray-600">Amber</p></div>
              <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-red-700">{report.byHealth?.red || 0}</p><p className="text-sm text-gray-600">Red</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">Average SPI</p>
                <p className={`text-4xl font-bold ${report.avgSPI >= 1 ? 'text-green-600' : 'text-red-600'}`}>{report.avgSPI}</p>
                <p className="text-xs text-gray-400 mt-1">{report.avgSPI >= 1 ? 'Ahead of Schedule' : 'Behind Schedule'}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">Average CPI</p>
                <p className={`text-4xl font-bold ${report.avgCPI >= 1 ? 'text-green-600' : 'text-red-600'}`}>{report.avgCPI}</p>
                <p className="text-xs text-gray-400 mt-1">{report.avgCPI >= 1 ? 'Under Budget' : 'Over Budget'}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>{['Project', 'Health', 'Score', 'SPI', 'CPI', 'Period'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(report.scorecards || []).map((sc, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{sc.project}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${healthColor[sc.overallHealth]}`}><span className={`w-1.5 h-1.5 rounded-full ${healthDot[sc.overallHealth]}`} />{sc.overallHealth?.replace(/_/g, ' ')}</span></td>
                      <td className="px-4 py-3 text-xs">{sc.overallScore}</td>
                      <td className="px-4 py-3 text-xs font-medium">{sc.spi?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-medium">{sc.cpi?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{sc.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Scorecard' : 'New Scorecard'}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Period *</label>
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" placeholder="2026-06" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Period Type</label>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.periodType} onChange={e => setForm(p => ({ ...p, periodType: e.target.value }))}>
                    {PERIOD_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {numFld('SPI', 'spi')}{numFld('CPI', 'cpi')}{numFld('Overall Score (0-100)', 'overallScore')}
                {numFld('EV (Earned Value)', 'ev')}{numFld('PV (Planned Value)', 'pv')}{numFld('AC (Actual Cost)', 'ac')}
                {numFld('BAC (Budget at Completion)', 'bac')}{numFld('EAC (Estimate at Completion)', 'eac')}{numFld('ETC (Estimate to Complete)', 'etc')}
              </div>
              {[['Narrative', 'narrative'], ['Key Achievements', 'keyAchievements'], ['Key Risks', 'keyRisks'], ['Next Steps', 'nextSteps']].map(([l, k]) => (
                <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                  <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving || !form.period} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
