import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiPlus, FiUsers, FiClock } from 'react-icons/fi';
import { fetchResources, createResource, fetchTimeEntries, createTimeEntry } from '../../services/projectAPI';

const BLANK_RES  = { role: '', availability: 100, plannedHours: 0, startDate: '', endDate: '' };
const BLANK_TIME = { hours: '', description: '', date: '', billable: true };

export default function AdminProjectResources() {
  const [resources, setResources] = useState([]);
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [resModal, setResModal]   = useState(false);
  const [timeModal, setTimeModal] = useState(false);
  const [form, setForm]           = useState(BLANK_RES);
  const [timeForm, setTimeForm]   = useState(BLANK_TIME);
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchResources('all'),
      fetchTimeEntries('all'),
    ]).then(([r, t]) => {
      setResources(r.data.data || r.data || []);
      setEntries(t.data.data || t.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreateResource = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createResource('all', form); setResModal(false); load(); } catch (_) {} finally { setSaving(false); }
  };

  const handleCreateTimeEntry = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createTimeEntry('all', timeForm); setTimeModal(false); load(); } catch (_) {} finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Resources</h1>
            <p className="text-sm text-gray-500 mt-1">Manage team allocation and time entries</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setTimeModal(true)} className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium">
              <FiClock size={16} /> Log Time
            </button>
            <button onClick={() => setResModal(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <FiPlus size={16} /> Add Resource
            </button>
          </div>
        </div>

        {loading ? <p className="text-gray-400 text-center py-10">Loading...</p> : (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Resource Allocation</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Employee', 'Role', 'Allocation', 'Planned Hrs', 'Actual Hrs', 'Utilization', 'Period'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No resources assigned.</td></tr>
                  ) : resources.map(r => {
                    const util = r.plannedHours ? Math.min(100, Math.round((r.actualHours / r.plannedHours) * 100)) : 0;
                    return (
                      <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{r.employee?.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{r.role || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.availability || 0}%` }} /></div>
                            <span className="text-sm">{r.availability || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.plannedHours || 0}h</td>
                        <td className="px-4 py-3 text-gray-600">{r.actualHours || 0}h</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full"><div className={`h-full rounded-full ${util > 100 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(util, 100)}%` }} /></div>
                            <span className={`text-sm font-medium ${util > 100 ? 'text-red-600' : 'text-green-600'}`}>{util}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '—'} – {r.endDate ? new Date(r.endDate).toLocaleDateString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Time Entries</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Employee', 'Date', 'Hours', 'Task', 'Billable', 'Description'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {entries.slice(0, 20).map(e => (
                    <tr key={e._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{e.employee?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{e.date ? new Date(e.date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 font-medium text-blue-600">{e.hours}h</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{e.task?.taskCode || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.billable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{e.billable ? 'Billable' : 'Non-billable'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{e.description || '—'}</td>
                    </tr>
                  ))}
                  {entries.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No time entries.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {resModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add Resource</h2>
              <form onSubmit={handleCreateResource} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Availability (%)</label>
                    <input type="number" value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Planned Hours</label>
                    <input type="number" value={form.plannedHours} onChange={e => setForm(f => ({ ...f, plannedHours: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setResModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {timeModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Log Time</h2>
              <form onSubmit={handleCreateTimeEntry} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={timeForm.date} onChange={e => setTimeForm(f => ({ ...f, date: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Hours *</label>
                  <input type="number" step="0.25" min="0.25" max="24" value={timeForm.hours} onChange={e => setTimeForm(f => ({ ...f, hours: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input value={timeForm.description} onChange={e => setTimeForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setTimeModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : 'Log'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
