import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchDocTemplates, createDocTemplate, updateDocTemplate, deleteDocTemplate, uploadTemplateFile, createFromTemplate } from '../../services/documentAPI';

const TYPES = ['policy', 'procedure', 'form', 'template', 'report', 'contract', 'invoice', 'manual', 'specification', 'certificate', 'drawing', 'other'];
const MODULES = ['hr', 'finance', 'projects', 'manufacturing', 'procurement', 'warehouse', 'service', 'qms', 'eam', 'crm', 'general'];
const empty = { name: '', description: '', documentType: 'form', module: 'general', isPublic: true, isActive: true };

export default function AdminDocumentTemplates() {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchDocTemplates().then(r => setTemplates(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openModal = (t = null) => {
    setEditing(t);
    setForm(t ? { name: t.name, description: t.description || '', documentType: t.documentType, module: t.module, isPublic: t.isPublic, isActive: t.isActive } : empty);
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await updateDocTemplate(editing._id, form);
      else await createDocTemplate(form);
      setShowModal(false);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete template?')) return;
    await deleteDocTemplate(id);
    load();
  };

  const handleFileUpload = async (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    await uploadTemplateFile(id, fd).catch(e => alert(e.response?.data?.message || 'Error'));
    load();
  };

  const handleUse = async (id) => {
    const title = window.prompt('New document title:');
    if (!title) return;
    await createFromTemplate(id, { title }).catch(e => alert(e.response?.data?.message || 'Error'));
    alert('Document created from template!');
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Document Templates</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Template</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <p className="col-span-3 text-center text-gray-400 py-8">Loading…</p>
            : templates.length === 0 ? <p className="col-span-3 text-center text-gray-400 py-8">No templates yet.</p>
              : templates.map(t => (
                <div key={t._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{t.templateCode}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap text-xs mb-2">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{t.documentType}</span>
                    <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded">{t.module}</span>
                    {t.isPublic && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Public</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Used {t.usageCount || 0} times</p>
                  {t.fileName && <p className="text-xs text-gray-400 mb-2 truncate">📄 {t.fileName}</p>}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleUse(t._id)} className="text-xs text-green-600 hover:underline">Use</button>
                    <label className="text-xs text-indigo-600 hover:underline cursor-pointer">
                      Upload File
                      <input type="file" className="hidden" onChange={e => handleFileUpload(t._id, e.target.files[0])} />
                    </label>
                    <button onClick={() => openModal(t)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(t._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Template' : 'New Template'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Template Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.documentType} onChange={e => setForm(p => ({ ...p, documentType: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                  {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} />Public</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />Active</label>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
