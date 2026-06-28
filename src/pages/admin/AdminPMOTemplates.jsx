import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../services/pmoAPI';

const CATEGORIES    = ['project_charter', 'risk_register', 'status_report', 'business_case', 'lessons_learned', 'project_plan', 'communication_plan', 'change_request', 'test_plan', 'quality_plan', 'other'];
const METHODOLOGIES = ['waterfall', 'agile', 'hybrid', 'prince2', 'pmbok', 'lean', 'six_sigma', 'kanban', 'safe', 'other'];
const statusColor   = { draft: 'bg-gray-100 text-gray-700', active: 'bg-green-100 text-green-800', deprecated: 'bg-orange-100 text-orange-800', archived: 'bg-gray-100 text-gray-500' };

const emptyForm = { name: '', description: '', category: 'other', methodology: 'pmbok', version: '1.0', status: 'active', content: '', isPublic: true };

export default function AdminPMOTemplates() {
  const [items, setItems]   = useState([]);
  const [filter, setFilter] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filter ? { methodology: filter } : {};
    fetchTemplates(params).then(r => setItems(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit   = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = ()     => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateTemplate(editing, form);
      else await createTemplate(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Template Library</h1><p className="text-sm text-gray-500 mt-1">Project templates & methodology library</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Template</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          {METHODOLOGIES.map(m => (
            <button key={m} onClick={() => setFilter(m)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{m.toUpperCase()}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-mono text-xs text-gray-400">{item.templateCode}</span>
                  <h3 className="font-semibold text-gray-900 mt-0.5">{item.name}</h3>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[item.status]}`}>{item.status}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{(item.category || '').replace(/_/g, ' ')}</span>
                <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">{item.methodology?.toUpperCase()}</span>
                <span className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded-full">v{item.version}</span>
              </div>
              {item.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{item.usageCount} uses</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="text-indigo-600 text-xs hover:underline">Edit</button>
                  <button onClick={async () => { await deleteTemplate(item._id); load(); }} className="text-red-500 text-xs hover:underline">Del</button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-3 text-gray-400 text-center py-10">No templates.</div>}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Template' : 'New Template'}</h2>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                {[['Category', 'category', CATEGORIES], ['Methodology', 'methodology', METHODOLOGIES], ['Status', 'status', ['draft', 'active', 'deprecated', 'archived']]].map(([l, k, opts]) => (
                  <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}>
                      {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ').toUpperCase()}</option>)}
                    </select>
                  </div>
                ))}
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Version</label>
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Content / Body</label>
                <textarea rows={6} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full font-mono" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving || !form.name} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
