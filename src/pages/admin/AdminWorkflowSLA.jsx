import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchSLAs, createSLA, updateSLA, deleteSLA, fetchSLABreaches } from '../../services/workflowAPI';

const empty = { name: '', description: '', resolutionHours: 24, warningHours: 4, escalateHours: 8, workingHoursOnly: false, workingHoursStart: '09:00', workingHoursEnd: '18:00', isActive: true };

export default function AdminWorkflowSLA() {
  const [slas, setSLAs] = useState([]);
  const [breaches, setBreaches] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [activeTab, setActiveTab] = useState('slas');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchSLAs().then(r => setSLAs(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  const loadBreaches = () => {
    fetchSLABreaches().then(r => setBreaches(r.data.data)).catch(console.error);
  };

  useEffect(() => { load(); loadBreaches(); }, []);

  const openModal = (s = null) => {
    setEditing(s);
    setForm(s ? { name: s.name, description: s.description || '', resolutionHours: s.resolutionHours, warningHours: s.warningHours, escalateHours: s.escalateHours, workingHoursOnly: s.workingHoursOnly, workingHoursStart: s.workingHoursStart, workingHoursEnd: s.workingHoursEnd, isActive: s.isActive } : empty);
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await updateSLA(editing._id, form);
      else await createSLA(form);
      setShowModal(false);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete SLA?')) return;
    await deleteSLA(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">SLA Management</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New SLA</button>
        </div>

        <div className="flex gap-2">
          {['slas', 'breaches'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm rounded-lg font-medium ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t === 'slas' ? 'SLA Definitions' : 'SLA Breaches'}
            </button>
          ))}
        </div>

        {activeTab === 'slas' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Code', 'Name', 'Resolution (h)', 'Warning (h)', 'Escalate (h)', 'Working Hours Only', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading…</td></tr>
                  : slas.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">No SLAs yet.</td></tr>
                    : slas.map(s => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{s.slaCode}</td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-gray-800 text-sm">{s.name}</div>
                          {s.description && <div className="text-xs text-gray-400">{s.description}</div>}
                        </td>
                        <td className="px-4 py-2.5 text-sm font-semibold text-gray-800">{s.resolutionHours}h</td>
                        <td className="px-4 py-2.5 text-xs text-amber-600">{s.warningHours}h</td>
                        <td className="px-4 py-2.5 text-xs text-red-500">{s.escalateHours}h</td>
                        <td className="px-4 py-2.5 text-xs">{s.workingHoursOnly ? `Yes (${s.workingHoursStart}–${s.workingHoursEnd})` : 'No'}</td>
                        <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-2">
                            <button onClick={() => openModal(s)} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(s._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'breaches' && breaches && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm">
                <p className="text-xs text-gray-500">Breached Instances</p>
                <p className="text-2xl font-bold text-red-600">{breaches.summary?.breachedInstances || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
                <p className="text-xs text-gray-500">Total Active</p>
                <p className="text-2xl font-bold text-blue-600">{breaches.summary?.totalActive || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-sm">
                <p className="text-xs text-gray-500">Breach Rate</p>
                <p className="text-2xl font-bold text-amber-600">{breaches.summary?.breachRate || 0}%</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">Breached Stages</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Stage Code', 'Stage Name', 'Instance', 'SLA Deadline', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(breaches.breachedStages || []).length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-6 text-green-600 text-sm">No SLA breaches — all good!</td></tr>
                  ) : (breaches.breachedStages || []).map(s => (
                    <tr key={s._id} className="hover:bg-red-50">
                      <td className="px-4 py-2 font-mono text-xs">{s.stageCode}</td>
                      <td className="px-4 py-2 text-xs font-medium text-gray-800">{s.name}</td>
                      <td className="px-4 py-2 text-xs text-gray-500">{s.instance?.title || '-'}</td>
                      <td className="px-4 py-2 text-xs text-red-600">{s.slaDeadline ? new Date(s.slaDeadline).toLocaleString() : '-'}</td>
                      <td className="px-4 py-2"><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit SLA' : 'New SLA'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="SLA Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-14 resize-none" />
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs text-gray-500">Resolution (h)</label><input type="number" value={form.resolutionHours} onChange={e => setForm(p => ({ ...p, resolutionHours: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-gray-500">Warning (h)</label><input type="number" value={form.warningHours} onChange={e => setForm(p => ({ ...p, warningHours: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-gray-500">Escalate (h)</label><input type="number" value={form.escalateHours} onChange={e => setForm(p => ({ ...p, escalateHours: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.workingHoursOnly} onChange={e => setForm(p => ({ ...p, workingHoursOnly: e.target.checked }))} />
                Working Hours Only
              </label>
              {form.workingHoursOnly && (
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500">Start</label><input type="time" value={form.workingHoursStart} onChange={e => setForm(p => ({ ...p, workingHoursStart: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500">End</label><input type="time" value={form.workingHoursEnd} onChange={e => setForm(p => ({ ...p, workingHoursEnd: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
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
