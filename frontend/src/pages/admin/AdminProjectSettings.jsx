import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi';
import {
  fetchProjectSettings, updateProjectSettings,
  fetchProjectRoles, createProjectRole, updateProjectRole, deleteProjectRole,
} from '../../services/projectAPI';

export default function AdminProjectSettings() {
  const [settings, setSettings] = useState([]);
  const [roles, setRoles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('settings');
  const [editKey, setEditKey]   = useState(null);
  const [editVal, setEditVal]   = useState('');
  const [saving, setSaving]     = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [editRoleId, setEditRoleId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([fetchProjectSettings(), fetchProjectRoles()])
      .then(([s, r]) => {
        setSettings(s.data.data || s.data || []);
        setRoles(r.data.data || r.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaveSetting = async (key) => {
    setSaving(true);
    try { await updateProjectSettings({ key, value: editVal }); setEditKey(null); load(); } catch (_) {} finally { setSaving(false); }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editRoleId) await updateProjectRole(editRoleId, roleForm);
      else await createProjectRole(roleForm);
      setRoleModal(false); setEditRoleId(null); setRoleForm({ name: '', description: '' }); load();
    } catch (_) {} finally { setSaving(false); }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Delete this role?')) return;
    try { await deleteProjectRole(id); load(); } catch (_) {}
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure project management defaults and roles</p>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
          {['settings', 'roles'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? <p className="text-gray-400 text-center py-10">Loading...</p> : (
          <>
            {tab === 'settings' && (
              <div className="space-y-3">
                {settings.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-400">No settings configured yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Settings are created automatically via the API.</p>
                  </div>
                )}
                {settings.map(s => (
                  <div key={s._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900">{s.key}</p>
                        {s.category && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{s.category}</span>}
                      </div>
                      {s.description && <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>}
                      {editKey === s.key ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input value={editVal} onChange={e => setEditVal(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                          <button onClick={() => handleSaveSetting(s.key)} disabled={saving}
                            className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                            <FiSave size={12} /> {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditKey(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 mt-1 font-mono">{String(s.value)}</p>
                      )}
                    </div>
                    {editKey !== s.key && (
                      <button onClick={() => { setEditKey(s.key); setEditVal(String(s.value)); }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg ml-4">
                        <FiEdit2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'roles' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Project Roles</h2>
                  <button onClick={() => { setRoleForm({ name: '', description: '' }); setEditRoleId(null); setRoleModal(true); }}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    <FiPlus size={16} /> New Role
                  </button>
                </div>
                <div className="space-y-3">
                  {roles.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400">No roles defined yet.</div>
                  ) : roles.map(r => (
                    <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{r.name}</p>
                        {r.description && <p className="text-sm text-gray-500 mt-0.5">{r.description}</p>}
                        {r.permissions?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {r.permissions.map(p => <span key={p} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{p}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => { setRoleForm({ name: r.name, description: r.description || '' }); setEditRoleId(r._id); setRoleModal(true); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleDeleteRole(r._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {roleModal && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">{editRoleId ? 'Edit' : 'New'} Role</h2>
                      <form onSubmit={handleSaveRole} className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                          <input value={roleForm.name} onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea value={roleForm.description} onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" /></div>
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setRoleModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                          <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
