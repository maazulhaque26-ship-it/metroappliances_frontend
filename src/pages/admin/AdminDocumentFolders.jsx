import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchFolders, createFolder, updateFolder, deleteFolder } from '../../services/documentAPI';

const MODULES = ['all', 'hr', 'finance', 'projects', 'manufacturing', 'procurement', 'warehouse', 'service', 'qms', 'eam', 'crm', 'general'];
const empty = { name: '', description: '', module: 'all', color: '#6366f1', parent: '' };

export default function AdminDocumentFolders() {
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filterMod, setFilterMod] = useState('');

  const load = () => {
    const p = {};
    if (filterMod) p.module = filterMod;
    fetchFolders(p).then(r => setFolders(r.data.data || [])).catch(console.error);
  };

  useEffect(load, [filterMod]);

  const openModal = (f = null) => {
    setEditing(f);
    setForm(f ? { name: f.name, description: f.description || '', module: f.module, color: f.color, parent: f.parent || '' } : empty);
    setShowModal(true);
  };

  const save = async () => {
    try {
      const body = { ...form, parent: form.parent || null };
      if (editing) await updateFolder(editing._id, body);
      else await createFolder(body);
      setShowModal(false);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete folder?')) return;
    await deleteFolder(id).catch(e => alert(e.response?.data?.message || 'Error'));
    load();
  };

  const rootFolders = folders.filter(f => !f.parent);
  const childMap = {};
  folders.forEach(f => { if (f.parent) { const k = String(f.parent); childMap[k] = [...(childMap[k] || []), f]; } });

  const FolderRow = ({ folder, depth = 0 }) => (
    <>
      <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg" style={{ paddingLeft: `${12 + depth * 20}px` }}>
        <div className="flex items-center gap-2">
          <span style={{ color: folder.color }} className="text-lg">📁</span>
          <div>
            <p className="text-sm font-medium text-gray-800">{folder.name}</p>
            <p className="text-xs text-gray-400">{folder.folderCode} · {folder.module} · {folder.documentCount || 0} docs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openModal(folder)} className="text-xs text-blue-600 hover:underline">Edit</button>
          <button onClick={() => handleDelete(folder._id)} className="text-xs text-red-500 hover:underline">Delete</button>
        </div>
      </div>
      {(childMap[String(folder._id)] || []).map(c => <FolderRow key={c._id} folder={c} depth={depth + 1} />)}
    </>
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Document Folders</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Folder</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', ...MODULES].map(m => (
            <button key={m} onClick={() => setFilterMod(m)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterMod === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {m || 'All Modules'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
          {folders.length === 0
            ? <p className="text-center text-gray-400 py-8">No folders found.</p>
            : rootFolders.map(f => <FolderRow key={f._id} folder={f} />)}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Folder' : 'New Folder'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Folder Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                  {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Color</label>
                  <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-10 h-8 border rounded cursor-pointer" />
                </div>
              </div>
              <select value={form.parent} onChange={e => setForm(p => ({ ...p, parent: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">No parent (root folder)</option>
                {folders.filter(f => f._id !== editing?._id).map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
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
