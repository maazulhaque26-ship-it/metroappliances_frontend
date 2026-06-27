import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchApplications, shortlistApplication, rejectApplication, moveApplicationStage, bulkApplicationAction } from '../../services/recruitmentAPI';

const STATUS_COLORS = {
  applied:      'bg-gray-100 text-gray-600',
  shortlisted:  'bg-blue-100 text-blue-700',
  interview:    'bg-purple-100 text-purple-700',
  hr_interview: 'bg-indigo-100 text-indigo-700',
  offer:        'bg-orange-100 text-orange-700',
  hired:        'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
  withdrawn:    'bg-red-100 text-red-700',
};

const STAGES = ['applied', 'shortlisted', 'interview', 'hr_interview', 'offer', 'hired', 'rejected'];
const STATUSES = ['', 'applied', 'shortlisted', 'interview', 'hr_interview', 'offer', 'hired', 'rejected', 'withdrawn'];

export default function AdminApplications() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState([]);
  const [actionId, setActionId]   = useState(null);
  const [moveModal, setMoveModal] = useState(null);
  const [moveForm, setMoveForm]   = useState({ status: 'shortlisted', notes: '' });
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    fetchApplications(params)
      .then(r => setItems(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter]);

  const act = async (fn, id, ...args) => {
    setActionId(id);
    try { await fn(id, ...args); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (reason == null) return;
    act(rejectApplication, id, { reason });
  };

  const handleMove = async () => {
    setSaving(true);
    try { await moveApplicationStage(moveModal, moveForm); setMoveModal(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setSaving(false); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === items.length ? [] : items.map(i => i._id));

  const handleBulk = async (action) => {
    if (!selected.length) return;
    try { await bulkApplicationAction({ ids: selected, action }); setSelected([]); load(); }
    catch (e) { alert(e.response?.data?.message || 'Bulk action failed'); }
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-sm text-gray-500 mt-1">All job applications pipeline</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => (
              <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
            ))}
          </select>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">{selected.length} selected</span>
              <button onClick={() => handleBulk('shortlist')}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Bulk Shortlist</button>
              <button onClick={() => handleBulk('reject')}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Bulk Reject</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selected.length === items.length && items.length > 0}
                    onChange={toggleAll} className="rounded" />
                </th>
                {['App #', 'Candidate', 'Job Title', 'Status', 'Stage', 'Applied', 'Rating', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(a => (
                <tr key={a._id} className={`hover:bg-gray-50 ${selected.includes(a._id) ? 'bg-indigo-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(a._id)} onChange={() => toggleSelect(a._id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{a.applicationNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.candidate?.firstName} {a.candidate?.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{a.job?.title || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                      {a.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{a.currentStage?.replace('_', ' ') || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3 text-yellow-500">{'★'.repeat(a.rating || 0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {a.status !== 'shortlisted' && a.status !== 'hired' && a.status !== 'rejected' && (
                        <button disabled={actionId === a._id} onClick={() => act(shortlistApplication, a._id)}
                          title="Shortlist" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                          <FiCheckCircle size={14} />
                        </button>
                      )}
                      {a.status !== 'rejected' && (
                        <button disabled={actionId === a._id} onClick={() => handleReject(a._id)}
                          title="Reject" className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                          <FiXCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => { setMoveModal(a._id); setMoveForm({ status: 'shortlisted', notes: '' }); }}
                        title="Move Stage" className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded">
                        <FiArrowRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No applications found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button disabled={items.length < 20} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      </div>

      {moveModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Move Application Stage</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">New Stage / Status</label>
                <select value={moveForm.status} onChange={e => setMoveForm(f => ({ ...f, status: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {STAGES.map(s => (
                    <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Notes</label>
                <textarea rows={3} value={moveForm.notes} onChange={e => setMoveForm(f => ({ ...f, notes: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setMoveModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleMove} disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Moving…' : 'Move'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
