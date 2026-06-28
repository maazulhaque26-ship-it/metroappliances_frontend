import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchLessons, createLesson, updateLesson, deleteLesson, approveLesson, fetchLessonsReport } from '../../services/pmoAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TYPES       = ['success', 'failure', 'improvement', 'warning'];
const CATEGORIES  = ['planning', 'execution', 'monitoring', 'closing', 'stakeholder', 'risk', 'communication', 'technology', 'process', 'people', 'other'];
const PHASES      = ['initiation', 'planning', 'execution', 'monitoring_control', 'closure', 'post_project'];
const typeColor   = { success: 'bg-green-100 text-green-800', failure: 'bg-red-100 text-red-800', improvement: 'bg-blue-100 text-blue-800', warning: 'bg-amber-100 text-amber-800' };
const impactColor = { low: 'bg-gray-100 text-gray-700', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };

const emptyForm = { title: '', description: '', category: 'other', type: 'improvement', phase: 'execution', situation: '', action: '', result: '', recommendation: '', impact: 'medium' };

export default function AdminPMOLessonsLearned() {
  const [items, setItems]   = useState([]);
  const [report, setReport] = useState(null);
  const [filter, setFilter] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab]       = useState('list');

  const load = () => {
    const params = filter ? { type: filter } : {};
    fetchLessons(params).then(r => setItems(r.data.data || [])).catch(() => {});
    fetchLessonsReport().then(r => setReport(r.data.data || r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit   = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = ()     => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateLesson(editing, form);
      else await createLesson(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Lessons Learned</h1><p className="text-sm text-gray-500 mt-1">Knowledge capture from projects</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Lesson</button>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[{ id: 'list', label: 'Repository' }, { id: 'report', label: 'Analytics' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'list' && (
          <>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
              {TYPES.map(t => (
                <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t}</button>
              ))}
            </div>

            <div className="space-y-3">
              {items.map(item => (
                <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-gray-400">{item.lessonCode}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[item.type]}`}>{item.type}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${impactColor[item.impact]}`}>{item.impact} impact</span>
                        {item.isApproved && <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>}
                        <span className="text-xs text-gray-500">{item.category} · {(item.phase || '').replace(/_/g, ' ')}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-1">{item.title}</h3>
                      {item.recommendation && <p className="text-sm text-gray-600 mt-1 line-clamp-2"><span className="font-medium">Recommendation:</span> {item.recommendation}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(item)} className="text-indigo-600 text-xs hover:underline">Edit</button>
                    {!item.isApproved && <button onClick={async () => { await approveLesson(item._id); load(); }} className="text-green-600 text-xs hover:underline">Approve</button>}
                    <button onClick={async () => { await deleteLesson(item._id); load(); }} className="text-red-500 text-xs hover:underline ml-auto">Delete</button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-gray-400 text-center py-10">No lessons learned.</p>}
            </div>
          </>
        )}

        {tab === 'report' && report && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-indigo-700">{report.total}</p><p className="text-sm text-gray-700">Total</p></div>
              <div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-700">{report.approved}</p><p className="text-sm text-gray-700">Approved</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">By Category</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={report.byCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis dataKey="_id" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">By Type</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={report.byType}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Lesson' : 'New Lesson Learned'}</h2>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-3">
                {[['Type', 'type', TYPES], ['Category', 'category', CATEGORIES], ['Phase', 'phase', PHASES], ['Impact', 'impact', ['low', 'medium', 'high']]].map(([l, k, opts]) => (
                  <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}>
                      {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {[['Situation', 'situation'], ['Action Taken', 'action'], ['Result', 'result'], ['Recommendation', 'recommendation']].map(([l, k]) => (
                <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                  <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
              ))}
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
