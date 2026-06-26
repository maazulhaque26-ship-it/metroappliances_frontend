import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiX, FiPause, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchJob, fetchJobApplications, postJob, closeJob, holdJob, shortlistApplication, rejectApplication } from '../../services/recruitmentAPI';

const STATUS_COLORS = {
  open:        'bg-green-100 text-green-700',
  draft:       'bg-gray-100 text-gray-600',
  on_hold:     'bg-yellow-100 text-yellow-700',
  closed:      'bg-red-100 text-red-700',
  applied:     'bg-gray-100 text-gray-600',
  shortlisted: 'bg-blue-100 text-blue-700',
  interview:   'bg-purple-100 text-purple-700',
  offer:       'bg-orange-100 text-orange-700',
  hired:       'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
  withdrawn:   'bg-red-100 text-red-700',
};

const fmt = (n) => n != null ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n) : '—';

export default function AdminJobDetail() {
  const { id }            = useParams();
  const [job, setJob]     = useState(null);
  const [apps, setApps]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([fetchJob(id), fetchJobApplications(id)])
      .then(([j, a]) => { setJob(j.data.data); setApps(a.data.data || []); })
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const act = async (fn, argId) => {
    setActionId(argId);
    try { await fn(argId); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionId(null); }
  };

  const handleReject = async (appId) => {
    const reason = window.prompt('Rejection reason:');
    if (reason == null) return;
    setActionId(appId);
    try { await rejectApplication(appId, { reason }); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionId(null); }
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;
  if (!job)    return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/hr/recruitment/jobs" className="text-gray-400 hover:text-gray-600">
            <FiArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{job.department} · {job.jobType?.replace('_', ' ')} · {job.workMode?.replace('_', ' ')}</p>
          </div>
          <div className="flex items-center gap-2">
            {(job.status === 'draft' || job.status === 'on_hold') && (
              <button onClick={() => act(postJob, job._id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                <FiSend size={14} /> Post
              </button>
            )}
            {job.status === 'open' && (
              <>
                <button onClick={() => act(holdJob, job._id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600">
                  <FiPause size={14} /> Hold
                </button>
                <button onClick={() => act(closeJob, job._id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                  <FiX size={14} /> Close
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Status</span>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                      {job.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div><span className="text-gray-500">Openings</span>
                  <p className="mt-1 font-semibold text-gray-900">{job.openings} ({job.filledCount ?? 0} filled)</p>
                </div>
                <div><span className="text-gray-500">Experience</span>
                  <p className="mt-1 text-gray-900">{job.experienceMin ?? 0}–{job.experienceMax ?? '∞'} years</p>
                </div>
                <div><span className="text-gray-500">Salary Range</span>
                  <p className="mt-1 text-gray-900">₹{fmt(job.salaryMin)} – ₹{fmt(job.salaryMax)}</p>
                </div>
              </div>

              {job.description && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>
              )}
              {job.requirements?.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {job.benefits?.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Benefits</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {job.benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}
              {job.skills?.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Applications</span><span className="font-semibold">{apps.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shortlisted</span><span className="font-semibold">{apps.filter(a => a.status === 'shortlisted').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">In Interview</span><span className="font-semibold">{apps.filter(a => a.status === 'interview').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Offered</span><span className="font-semibold">{apps.filter(a => a.status === 'offer').length}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Applications ({apps.length})</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Candidate', 'Email', 'Status', 'Applied', 'Rating', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.candidate?.firstName} {a.candidate?.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.candidate?.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3 text-yellow-500">{'★'.repeat(a.rating || 0)}{'☆'.repeat(5 - (a.rating || 0))}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {a.status !== 'shortlisted' && a.status !== 'hired' && a.status !== 'rejected' && (
                        <button disabled={actionId === a._id} onClick={() => act(shortlistApplication, a._id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Shortlist">
                          <FiCheckCircle size={14} />
                        </button>
                      )}
                      {a.status !== 'rejected' && (
                        <button disabled={actionId === a._id} onClick={() => handleReject(a._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Reject">
                          <FiXCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!apps.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No applications yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
