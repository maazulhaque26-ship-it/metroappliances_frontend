import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchDocTags, createDocTag, deleteDocTag,
  fetchDocCategories, createDocCategory, updateDocCategory, deleteDocCategory,
  fetchKBCategories, createKBCategory, updateKBCategory, deleteKBCategory
} from '../../services/documentAPI';

const TABS = ['Document Tags', 'Document Categories', 'KB Categories'];

export default function AdminDocumentSettings() {
  const [tab, setTab] = useState('Document Tags');

  // Tags
  const [tags, setTags] = useState([]);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#6366f1');

  // Doc Categories
  const [docCats, setDocCats] = useState([]);
  const [showDocCatModal, setShowDocCatModal] = useState(false);
  const [editingDocCat, setEditingDocCat] = useState(null);
  const [docCatForm, setDocCatForm] = useState({ name: '', description: '', parentCategory: '', allowedTypes: [] });

  // KB Categories
  const [kbCats, setKbCats] = useState([]);
  const [showKbCatModal, setShowKbCatModal] = useState(false);
  const [editingKbCat, setEditingKbCat] = useState(null);
  const [kbCatForm, setKbCatForm] = useState({ name: '', description: '', parentCategory: '', isActive: true });

  const loadTags = () => fetchDocTags().then(r => setTags(r.data.data || [])).catch(console.error);
  const loadDocCats = () => fetchDocCategories().then(r => setDocCats(r.data.data || [])).catch(console.error);
  const loadKbCats = () => fetchKBCategories().then(r => setKbCats(r.data.data || [])).catch(console.error);

  useEffect(() => { loadTags(); loadDocCats(); loadKbCats(); }, []);

  // Tag handlers
  const handleAddTag = async () => {
    if (!tagName.trim()) return;
    await createDocTag({ name: tagName.trim(), color: tagColor }).catch(e => alert(e.response?.data?.message || 'Error'));
    setTagName('');
    loadTags();
  };
  const handleDeleteTag = async (id) => {
    if (!window.confirm('Delete tag?')) return;
    await deleteDocTag(id);
    loadTags();
  };

  // Doc cat handlers
  const openDocCatModal = (c = null) => {
    setEditingDocCat(c);
    setDocCatForm(c ? { name: c.name, description: c.description || '', parentCategory: c.parentCategory || '', allowedTypes: c.allowedTypes || [] } : { name: '', description: '', parentCategory: '', allowedTypes: [] });
    setShowDocCatModal(true);
  };
  const saveDocCat = async () => {
    try {
      if (editingDocCat) await updateDocCategory(editingDocCat._id, docCatForm);
      else await createDocCategory(docCatForm);
      setShowDocCatModal(false);
      loadDocCats();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };
  const handleDeleteDocCat = async (id) => {
    if (!window.confirm('Delete category?')) return;
    await deleteDocCategory(id);
    loadDocCats();
  };

  // KB cat handlers
  const openKbCatModal = (c = null) => {
    setEditingKbCat(c);
    setKbCatForm(c ? { name: c.name, description: c.description || '', parentCategory: c.parentCategory || '', isActive: c.isActive } : { name: '', description: '', parentCategory: '', isActive: true });
    setShowKbCatModal(true);
  };
  const saveKbCat = async () => {
    try {
      if (editingKbCat) await updateKBCategory(editingKbCat._id, kbCatForm);
      else await createKBCategory(kbCatForm);
      setShowKbCatModal(false);
      loadKbCats();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };
  const handleDeleteKbCat = async (id) => {
    if (!window.confirm('Delete KB category?')) return;
    await deleteKBCategory(id);
    loadKbCats();
  };

  const DOC_TYPES = ['policy', 'procedure', 'form', 'template', 'report', 'contract', 'invoice', 'manual', 'specification', 'certificate', 'drawing', 'other'];

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Document Settings</h1>

        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Document Tags' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Tag</h3>
              <div className="flex gap-2">
                <input value={tagName} onChange={e => setTagName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder="Tag name" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <input type="color" value={tagColor} onChange={e => setTagColor(e.target.value)} className="w-10 h-9 border rounded-lg cursor-pointer" title="Tag color" />
                <button onClick={handleAddTag} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0
                ? <p className="text-gray-400 text-sm py-4">No tags yet.</p>
                : tags.map(t => (
                  <div key={t._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm" style={{ backgroundColor: t.color || '#6366f1' }}>
                    <span>{t.name}</span>
                    {t.usageCount > 0 && <span className="bg-white/30 rounded-full px-1.5">{t.usageCount}</span>}
                    <button onClick={() => handleDeleteTag(t._id)} className="hover:opacity-70 ml-1 text-white/80">×</button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'Document Categories' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => openDocCatModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Category</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docCats.length === 0
                ? <p className="col-span-3 text-center text-gray-400 py-8">No document categories yet.</p>
                : docCats.map(c => (
                  <div key={c._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.categoryCode}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </div>
                    {c.description && <p className="text-xs text-gray-500 mb-2">{c.description}</p>}
                    {c.parentCategory && <p className="text-xs text-gray-400 mb-2">Parent: {c.parentCategory?.name || c.parentCategory}</p>}
                    <p className="text-xs text-gray-400 mb-2">Documents: {c.documentCount || 0}</p>
                    {c.allowedTypes?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {c.allowedTypes.map(t => <span key={t} className="text-xs bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>)}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => openDocCatModal(c)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteDocCat(c._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'KB Categories' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => openKbCatModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New KB Category</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kbCats.length === 0
                ? <p className="col-span-3 text-center text-gray-400 py-8">No KB categories yet.</p>
                : kbCats.map(c => (
                  <div key={c._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.categoryCode} · /{c.slug}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    {c.description && <p className="text-xs text-gray-500 mb-2">{c.description}</p>}
                    <p className="text-xs text-gray-400 mb-2">Articles: {c.articleCount || 0}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openKbCatModal(c)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteKbCat(c._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {showDocCatModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{editingDocCat ? 'Edit Category' : 'New Document Category'}</h3>
              <button onClick={() => setShowDocCatModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={docCatForm.name} onChange={e => setDocCatForm(p => ({ ...p, name: e.target.value }))} placeholder="Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={docCatForm.description} onChange={e => setDocCatForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-14 resize-none" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Allowed Document Types</p>
                <div className="flex flex-wrap gap-2">
                  {DOC_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-1 text-xs cursor-pointer">
                      <input type="checkbox" checked={docCatForm.allowedTypes.includes(t)}
                        onChange={e => setDocCatForm(p => ({ ...p, allowedTypes: e.target.checked ? [...p.allowedTypes, t] : p.allowedTypes.filter(x => x !== t) }))} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowDocCatModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveDocCat} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {showKbCatModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{editingKbCat ? 'Edit KB Category' : 'New KB Category'}</h3>
              <button onClick={() => setShowKbCatModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={kbCatForm.name} onChange={e => setKbCatForm(p => ({ ...p, name: e.target.value }))} placeholder="Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={kbCatForm.description} onChange={e => setKbCatForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-14 resize-none" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={kbCatForm.isActive} onChange={e => setKbCatForm(p => ({ ...p, isActive: e.target.checked }))} />Active</label>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowKbCatModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveKbCat} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
