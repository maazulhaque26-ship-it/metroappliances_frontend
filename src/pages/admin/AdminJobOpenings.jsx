import React, { useEffect, useState } from 'react';
import { FiPlus, FiSend, FiX, FiPause, FiTrash2 } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchJobs, createJob, deleteJob, postJob, closeJob, holdJob } from '../../services/recruitmentAPI';

const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing', 'IT', 'Legal', 'Admin'];

const STATUS_COLORS = {
  open:      'bg-green-100 text-green-700',
  draft:     'bg-gray-100 text-gray-600',
  on_hold:   'bg-yellow-100 text-yellow-700',
  closed:    'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PRIORITY_COLORS = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-gray-100 text-gray-600',
};

const BLANK = {
  title: '', department: '', jobType: 'full_time', workMode: 'on_site',
  openings: 1, experienceMin: 0, salaryMin: '', salaryMax: '', description: '', status: 'draft',
};

export default function AdminJobOpenings() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    fetchJobs({ limit: 100 })
      .then(r => setItems(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createJob(form);
      setShowModal(false);
      setForm(BLANK);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Create failed'); }
    finally { setSaving(false); }
  };

  const act = async (fn, id) => {
    setActionId(id);
    try { await fn(id); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job opening?')) return;
    act(deleteJob, id);
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Openings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage open positions and requisitions</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <FiPlus size={16} /> Add Job Opening
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Job #', 'Title', 'Department', 'Type', 'Mode', 'Openings', 'Filled', 'Status', 'Priority', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(j => (
                <tr key={j._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{j.jobNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{j.title}</td>
                  <td className="px-4 py-3 text-gray-600">{j.department}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{j.jobType?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{j.workMode?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{j.openings}</td>
                  <td className="px-4 py-3 text-gray-600">{j.filledCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[j.status] || 'bg-gray-100 text-gray-600'}`}>
                      {j.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${PRIORITY_COLORS[j.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {j.priority || 'medium'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {(j.status === 'draft' || j.status === 'on_hold') && (
                        <button disabled={actionId === j._id} onClick={() => act(postJob, j._id)}
                          title="Post" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                          <FiSend size={14} />
                        </button>
                      )}
                      {j.status === 'open' && (
                        <>
                          <button disabled={actionId === j._id} onClick={() => act(closeJob, j._id)}
                            title="Close" className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <FiX size={14} />
                          </button>
                          <button disabled={actionId === j._id} onClick={() => act(holdJob, j._id)}
                            title="Hold" className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded">
                            <FiPause size={14} />
                          </button>
                        </>
                      )}
                      <button disabled={actionId === j._id} onClick={() => handleDelete(j._id)}
                        title="Delete" className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No job openings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Add Job Opening</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Job Title</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Department</label>
                <select value={form.department} onChange={e => set('department', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Job Type</label>
                <select value={form.jobType} onChange={e => set('jobType', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Work Mode</label>
                <select value={form.workMode} onChange={e => set('workMode', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="on_site">On Site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Number of Openings</label>
                <input type="number" min={1} value={form.openings} onChange={e => set('openings', Number(e.target.value))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Min Experience (yrs)</label>
                <input type="number" min={0} value={form.experienceMin} onChange={e => set('experienceMin', Number(e.target.value))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Min Salary (₹)</label>
                <input type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Max Salary (₹)</label>
                <input type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Description</label>
                <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setShowModal(false); setForm(BLANK); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title || !form.department}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
