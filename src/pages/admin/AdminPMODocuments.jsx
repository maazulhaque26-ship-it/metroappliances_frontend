import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchDocuments, createDocument, updateDocument, deleteDocument } from '../../services/pmoAPI';

const DOC_TYPES  = ['charter', 'plan', 'report', 'policy', 'procedure', 'standard', 'template', 'contract', 'minutes', 'presentation', 'other'];
const CATEGORIES = ['governance', 'planning', 'execution', 'monitoring', 'closure', 'compliance', 'finance', 'hr', 'technical', 'other'];
const ACCESS     = ['public', 'internal', 'restricted', 'confidential'];
const STATUSES   = ['draft', 'under_review', 'approved', 'published', 'archived', 'superseded'];

const statusColor = { draft: 'bg-gray-100 text-gray-700', under_review: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800', published: 'bg-purple-100 text-purple-800', archived: 'bg-gray-100 text-gray-500', superseded: 'bg-orange-100 text-orange-800' };
const accessColor = { public: 'bg-green-50 text-green-700', internal: 'bg-blue-50 text-blue-700', restricted: 'bg-amber-50 text-amber-700', confidential: 'bg-red-50 text-red-700' };

const emptyForm = { title: '', description: '', documentType: 'report', category: 'other', status: 'draft', version: '1.0', fileUrl: '', fileName: '', accessLevel: 'internal' };

export default function AdminPMODocuments() {
  const [items, setItems]   = useState([]);
  const [filter, setFilter] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filter ? { documentType: filter } : {};
    fetchDocuments(params).then(r => setItems(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openEdit   = (item) => { setForm({ ...item }); setEditing(item._id); setModal(true); };
  const openCreate = ()     => { setForm(emptyForm); setEditing(null); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateDocument(editing, form);
      else await createDocument(form);
      load(); setModal(false);
    } catch { } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Document Repository</h1><p className="text-sm text-gray-500 mt-1">PMO document management</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Document</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          {DOC_TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t}</button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>{['Code', 'Title', 'Type', 'Category', 'Version', 'Access', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.documentCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.fileUrl ? <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{item.title}</a> : item.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{item.documentType}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{item.category}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">v{item.version}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${accessColor[item.accessLevel]}`}>{item.accessLevel}</span></td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[item.status]}`}>{(item.status || '').replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                    <button onClick={async () => { await deleteDocument(item._id); load(); }} className="text-red-500 hover:underline text-xs">Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No documents.</td></tr>}
            </tbody>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold">{editing ? 'Edit Document' : 'New Document'}</h2>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                {[['Type', 'documentType', DOC_TYPES], ['Category', 'category', CATEGORIES], ['Status', 'status', STATUSES], ['Access Level', 'accessLevel', ACCESS]].map(([l, k, opts]) => (
                  <div key={k}><label className="block text-xs font-medium text-gray-700 mb-1">{l}</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}>
                      {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Version</label>
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">File Name</label>
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.fileName} onChange={e => setForm(p => ({ ...p, fileName: e.target.value }))} /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">File URL</label>
                <input type="url" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
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
