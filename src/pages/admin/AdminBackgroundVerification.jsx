import React, { useEffect, useState } from 'react';
import { FiPlus, FiCheckCircle, FiEye } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchBGVs, initiateBGV, completeBGV, fetchOnboardings, fetchCandidates } from '../../services/recruitmentAPI';

const RESULT_COLORS = {
  clear:   'bg-green-100 text-green-700',
  adverse: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-600',
};

const BGV_STATUS_COLORS = {
  initiated:   'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed:   'bg-green-100 text-green-700',
  failed:      'bg-red-100 text-red-700',
};

const ONBOARDING_STATUS_COLORS = {
  pending:    'bg-gray-100 text-gray-600',
  in_progress:'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
};

const ALL_CHECKS = ['address', 'criminal', 'education', 'employment', 'credit'];

const BLANK_BGV = { candidate: '', vendor: '', checks: [] };

export default function AdminBackgroundVerification() {
  const [bgvs, setBGVs]           = useState([]);
  const [onboardings, setOnbs]    = useState([]);
  const [candidates, setCands]    = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showBGVModal, setShowBGVModal] = useState(false);
  const [bgvForm, setBGVForm]     = useState(BLANK_BGV);
  const [saving, setSaving]       = useState(false);
  const [actionId, setActionId]   = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([fetchBGVs({ limit: 50 }), fetchOnboardings({ limit: 50 })])
      .then(([b, o]) => { setBGVs(b.data.data || []); setOnbs(o.data.data || []); })
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    fetchCandidates({ limit: 100 }).then(r => setCands(r.data.data || [])).catch(() => {});
  }, []);

  const toggleCheck = (c) => setBGVForm(f => ({
    ...f,
    checks: f.checks.includes(c) ? f.checks.filter(x => x !== c) : [...f.checks, c],
  }));

  const handleInitiateBGV = async () => {
    setSaving(true);
    try { await initiateBGV(bgvForm); setShowBGVModal(false); setBGVForm(BLANK_BGV); load(); }
    catch (e) { alert(e.response?.data?.message || 'Initiate failed'); }
    finally { setSaving(false); }
  };

  const handleComplete = async (id) => {
    setActionId(id);
    try { await completeBGV(id); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionId(null); }
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Background Verification</h1>
              <p className="text-sm text-gray-500 mt-1">Pre-employment background checks</p>
            </div>
            <button onClick={() => setShowBGVModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              <FiPlus size={16} /> Initiate BGV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Candidate', 'Status', 'Result', 'Vendor', 'Checks', 'Completed', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bgvs.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {b.candidate?.firstName} {b.candidate?.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${BGV_STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${RESULT_COLORS[b.overallResult] || 'bg-gray-100 text-gray-600'}`}>
                        {b.overallResult || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.vendor || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{b.checks?.length ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {b.completedAt ? new Date(b.completedAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {b.status !== 'completed' && (
                          <button disabled={actionId === b._id} onClick={() => handleComplete(b._id)}
                            title="Mark Complete" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                            <FiCheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!bgvs.length && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No BGV records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Onboarding</h2>
            <p className="text-sm text-gray-500 mt-1">New hire onboarding progress</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Candidate', 'Joining Date', 'Tasks', 'Completion', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {onboardings.map(o => {
                  const total = o.tasks?.length || 0;
                  const done  = o.tasks?.filter(t => t.completed).length || 0;
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {o.candidate?.firstName} {o.candidate?.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {o.joiningDate ? new Date(o.joiningDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{done}/{total}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-600 w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${ONBOARDING_STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                          {o.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="View">
                          <FiEye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!onboardings.length && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No onboarding records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showBGVModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Initiate Background Verification</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Candidate</label>
                <select value={bgvForm.candidate} onChange={e => setBGVForm(f => ({ ...f, candidate: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select candidate</option>
                  {candidates.map(c => (
                    <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Vendor</label>
                <input value={bgvForm.vendor} onChange={e => setBGVForm(f => ({ ...f, vendor: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Checks Required</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ALL_CHECKS.map(c => (
                    <label key={c} className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                      <input type="checkbox" checked={bgvForm.checks.includes(c)} onChange={() => toggleCheck(c)} className="rounded" />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowBGVModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleInitiateBGV} disabled={saving || !bgvForm.candidate || !bgvForm.checks.length}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Initiating…' : 'Initiate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
