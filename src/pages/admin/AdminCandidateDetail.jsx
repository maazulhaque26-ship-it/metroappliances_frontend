import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiUpload, FiUserCheck, FiCheckCircle } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchCandidate, fetchCandidateApps, fetchCandidateDocs, addCandidateDocument, convertToEmployee } from '../../services/recruitmentAPI';

const APP_STATUS_COLORS = {
  applied:     'bg-gray-100 text-gray-600',
  shortlisted: 'bg-blue-100 text-blue-700',
  interview:   'bg-purple-100 text-purple-700',
  hr_interview:'bg-indigo-100 text-indigo-700',
  offer:       'bg-orange-100 text-orange-700',
  hired:       'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
  withdrawn:   'bg-red-100 text-red-700',
};

const DOC_TYPE_COLORS = {
  resume:          'bg-blue-100 text-blue-700',
  cover_letter:    'bg-purple-100 text-purple-700',
  id_proof:        'bg-yellow-100 text-yellow-700',
  address_proof:   'bg-orange-100 text-orange-700',
  degree:          'bg-green-100 text-green-700',
  experience_letter:'bg-indigo-100 text-indigo-700',
  other:           'bg-gray-100 text-gray-600',
};

const DOC_TYPES = ['resume', 'cover_letter', 'id_proof', 'address_proof', 'degree', 'experience_letter', 'other'];

export default function AdminCandidateDetail() {
  const { id }              = useParams();
  const [candidate, setCand] = useState(null);
  const [apps, setApps]     = useState([]);
  const [docs, setDocs]     = useState([]);
  const [tab, setTab]       = useState('applications');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ docType: 'resume', filename: '', url: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([fetchCandidate(id), fetchCandidateApps(id), fetchCandidateDocs(id)])
      .then(([c, a, d]) => { setCand(c.data.data); setApps(a.data.data || []); setDocs(d.data.data || []); })
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleAddDoc = async () => {
    setSaving(true);
    try { await addCandidateDocument(id, docForm); setShowDocModal(false); setDocForm({ docType: 'resume', filename: '', url: '' }); load(); }
    catch (e) { alert(e.response?.data?.message || 'Upload failed'); }
    finally { setSaving(false); }
  };

  const handleConvert = async () => {
    if (!window.confirm('Convert this candidate to an employee? This will create an employee record.')) return;
    try { await convertToEmployee(id, {}); alert('Converted to employee successfully.'); }
    catch (e) { alert(e.response?.data?.message || 'Conversion failed'); }
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;
  if (!candidate) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.firstName} {candidate.lastName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{candidate.currentDesignation || 'Candidate'} {candidate.currentCompany ? `at ${candidate.currentCompany}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowDocModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
              <FiUpload size={14} /> Add Document
            </button>
            <button onClick={handleConvert}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
              <FiUserCheck size={14} /> Convert to Employee
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 text-sm">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Contact Info</h3>
              {[['Email', candidate.email], ['Phone', candidate.phone], ['Notice Period', candidate.noticePeriod ? `${candidate.noticePeriod} days` : '—'], ['Expected CTC', candidate.expectedCTC ? `₹${candidate.expectedCTC}` : '—'], ['Current CTC', candidate.currentCTC ? `₹${candidate.currentCTC}` : '—'], ['Experience', candidate.totalExperience != null ? `${candidate.totalExperience} yrs` : '—']].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-gray-500">{l}</span>
                  <span className="text-gray-900 font-medium">{v || '—'}</span>
                </div>
              ))}
            </div>
            {candidate.skills?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {candidate.education?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Education</h3>
                <div className="space-y-2">
                  {candidate.education.map((e, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-gray-900">{e.degree}</p>
                      <p className="text-gray-500">{e.institution} · {e.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex">
                  {[['applications', 'Applications'], ['documents', 'Documents'], ['timeline', 'Timeline']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                      className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {tab === 'applications' && (
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Job Title', 'Status', 'Applied', 'Rating'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {apps.map(a => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{a.job?.title || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${APP_STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-4 py-3 text-yellow-500">{'★'.repeat(a.rating || 0)}</td>
                      </tr>
                    ))}
                    {!apps.length && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No applications</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {tab === 'documents' && (
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Type', 'Filename', 'Uploaded', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {docs.map(d => (
                      <tr key={d._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${DOC_TYPE_COLORS[d.docType] || 'bg-gray-100 text-gray-600'}`}>
                            {d.docType?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{d.filename}</td>
                        <td className="px-4 py-3 text-gray-500">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {d.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!d.verified && (
                            <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                              <FiCheckCircle size={12} /> Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!docs.length && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No documents uploaded</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {tab === 'timeline' && (
                <div className="p-5">
                  <div className="space-y-4">
                    {(candidate.timeline || []).map((t, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="text-gray-900">{t.action}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{t.date ? new Date(t.date).toLocaleString('en-IN') : ''}</p>
                        </div>
                      </div>
                    ))}
                    {!candidate.timeline?.length && (
                      <p className="text-center text-gray-400 py-8">No timeline events</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDocModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Document</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Document Type</label>
                <select value={docForm.docType} onChange={e => setDocForm(f => ({ ...f, docType: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {DOC_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Filename</label>
                <input value={docForm.filename} onChange={e => setDocForm(f => ({ ...f, filename: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">URL / Path</label>
                <input value={docForm.url} onChange={e => setDocForm(f => ({ ...f, url: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowDocModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleAddDoc} disabled={saving || !docForm.filename}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
