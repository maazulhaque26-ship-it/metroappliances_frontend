import React, { useEffect, useState } from 'react';
import { FiPlus, FiSend, FiCheck, FiEye } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchOffers, createOffer, sendOffer, approveOffer, recordAcceptance, fetchApplications } from '../../services/recruitmentAPI';

const STATUS_COLORS = {
  draft:            'bg-gray-100 text-gray-600',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  approved:         'bg-green-100 text-green-700',
  sent:             'bg-blue-100 text-blue-700',
  accepted:         'bg-emerald-100 text-emerald-700',
  rejected:         'bg-red-100 text-red-700',
  withdrawn:        'bg-red-100 text-red-700',
  expired:          'bg-gray-100 text-gray-500',
};

const fmt = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const BLANK = {
  application: '', ctc: '', joiningDate: '', offerValidTill: '',
  designation: '', department: '', location: '', basicSalary: '',
};

export default function AdminOfferLetters() {
  const [offers, setOffers]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]         = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [apps, setApps]         = useState([]);
  const [saving, setSaving]     = useState(false);
  const [actionId, setActionId] = useState(null);
  const [viewModal, setViewModal] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    fetchOffers(params)
      .then(r => setOffers(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter]);
  useEffect(() => {
    fetchApplications({ limit: 100 }).then(r => setApps(r.data.data || [])).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    setSaving(true);
    try { await createOffer(form); setShowModal(false); setForm(BLANK); load(); }
    catch (e) { alert(e.response?.data?.message || 'Create failed'); }
    finally { setSaving(false); }
  };

  const act = async (fn, id, ...args) => {
    setActionId(id);
    try { await fn(id, ...args); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionId(null); }
  };

  const handleAcceptance = async (id, accepted) => {
    const notes = accepted ? 'Candidate accepted offer.' : window.prompt('Rejection reason:');
    if (!accepted && notes == null) return;
    act(recordAcceptance, id, { accepted, notes });
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offer Letters</h1>
            <p className="text-sm text-gray-500 mt-1">Manage job offers and acceptances</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <FiPlus size={16} /> Create Offer
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(s => (
              <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Offer #', 'Candidate', 'Job', 'CTC (₹)', 'Joining Date', 'Valid Till', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.offerNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {o.application?.candidate?.firstName} {o.application?.candidate?.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.application?.job?.title || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{fmt(o.ctc)}</td>
                  <td className="px-4 py-3 text-gray-500">{o.joiningDate ? new Date(o.joiningDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{o.offerValidTill ? new Date(o.offerValidTill).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                      {o.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewModal(o)}
                        title="View" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded">
                        <FiEye size={14} />
                      </button>
                      {o.status === 'pending_approval' && (
                        <button disabled={actionId === o._id} onClick={() => act(approveOffer, o._id, {})}
                          title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                          <FiCheck size={14} />
                        </button>
                      )}
                      {o.status === 'approved' && (
                        <button disabled={actionId === o._id} onClick={() => act(sendOffer, o._id)}
                          title="Send" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <FiSend size={14} />
                        </button>
                      )}
                      {o.status === 'sent' && (
                        <>
                          <button disabled={actionId === o._id} onClick={() => handleAcceptance(o._id, true)}
                            className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">Accept</button>
                          <button disabled={actionId === o._id} onClick={() => handleAcceptance(o._id, false)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!offers.length && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No offers found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button disabled={offers.length < 20} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Create Offer Letter</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Application</label>
                <select value={form.application} onChange={e => set('application', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select application</option>
                  {apps.map(a => (
                    <option key={a._id} value={a._id}>{a.candidate?.firstName} {a.candidate?.lastName} — {a.job?.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Designation</label>
                <input value={form.designation} onChange={e => set('designation', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Department</label>
                <input value={form.department} onChange={e => set('department', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Location</label>
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">CTC (₹)</label>
                <input type="number" value={form.ctc} onChange={e => set('ctc', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Basic Salary (₹)</label>
                <input type="number" value={form.basicSalary} onChange={e => set('basicSalary', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Joining Date</label>
                <input type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Offer Valid Till</label>
                <input type="date" value={form.offerValidTill} onChange={e => set('offerValidTill', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setShowModal(false); setForm(BLANK); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.application || !form.ctc}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Offer Details — {viewModal.offerNumber}</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Candidate', `${viewModal.application?.candidate?.firstName} ${viewModal.application?.candidate?.lastName}`],
                ['Job', viewModal.application?.job?.title],
                ['Designation', viewModal.designation],
                ['Department', viewModal.department],
                ['Location', viewModal.location],
                ['CTC', `₹${fmt(viewModal.ctc)}`],
                ['Basic Salary', `₹${fmt(viewModal.basicSalary)}`],
                ['Joining Date', viewModal.joiningDate ? new Date(viewModal.joiningDate).toLocaleDateString('en-IN') : '—'],
                ['Valid Till', viewModal.offerValidTill ? new Date(viewModal.offerValidTill).toLocaleDateString('en-IN') : '—'],
                ['Status', viewModal.status?.replace('_', ' ')],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between border-b border-gray-50 pb-1.5">
                  <span className="text-gray-500">{l}</span>
                  <span className="font-medium text-gray-900 capitalize">{v || '—'}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setViewModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
