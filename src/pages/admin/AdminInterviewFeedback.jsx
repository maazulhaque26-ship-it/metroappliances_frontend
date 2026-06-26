import React, { useEffect, useState } from 'react';
import { FiPlus, FiEye } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchInterviews, fetchFeedback, submitFeedback } from '../../services/recruitmentAPI';

const RECO_COLORS = {
  hire:       'bg-green-100 text-green-700',
  reject:     'bg-red-100 text-red-700',
  hold:       'bg-yellow-100 text-yellow-700',
  next_round: 'bg-blue-100 text-blue-700',
};

const BLANK = {
  overallRating: 0,
  recommendation: 'next_round',
  strengths: '',
  weaknesses: '',
  comments: '',
  skillRatings: [],
};

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className={`text-xl ${n <= value ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
    ))}
  </div>
);

export default function AdminInterviewFeedback() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState('');
  const [viewFeedback, setViewFeedback] = useState(null);
  const [viewData, setViewData]     = useState(null);
  const [submitModal, setSubmitModal] = useState(null);
  const [form, setForm]             = useState(BLANK);
  const [newSkill, setNewSkill]     = useState({ skill: '', rating: 3 });
  const [saving, setSaving]         = useState(false);

  const load = () => {
    setLoading(true);
    fetchInterviews({ limit: 100 })
      .then(r => setInterviews(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openView = async (id) => {
    setViewFeedback(id);
    try {
      const r = await fetchFeedback(id);
      setViewData(r.data.data);
    } catch { setViewData(null); }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try { await submitFeedback(submitModal, form); setSubmitModal(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Submit failed'); }
    finally { setSaving(false); }
  };

  const addSkillRating = () => {
    if (!newSkill.skill.trim()) return;
    setForm(f => ({ ...f, skillRatings: [...f.skillRatings, { ...newSkill }] }));
    setNewSkill({ skill: '', rating: 3 });
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = interviews.filter(iv => {
    if (!filter) return true;
    if (filter === 'submitted') return iv.feedbackSubmitted;
    if (filter === 'pending')   return !iv.feedbackSubmitted;
    return true;
  });

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
            <p className="text-sm text-gray-500 mt-1">Feedback and assessments for all interviews</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Interview #', 'Candidate', 'Job', 'Interviewer', 'Rating', 'Recommendation', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(iv => (
                <tr key={iv._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{iv.interviewNumber || iv._id?.slice(-6)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {iv.application?.candidate?.firstName} {iv.application?.candidate?.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{iv.application?.job?.title || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{(iv.interviewers || []).join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    {iv.feedback?.overallRating
                      ? <span className="text-yellow-400">{'★'.repeat(iv.feedback.overallRating)}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {iv.feedback?.recommendation
                      ? <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${RECO_COLORS[iv.feedback.recommendation] || 'bg-gray-100 text-gray-600'}`}>
                          {iv.feedback.recommendation.replace('_', ' ')}
                        </span>
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${iv.feedbackSubmitted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {iv.feedbackSubmitted ? 'Submitted' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {iv.feedbackSubmitted && (
                        <button onClick={() => openView(iv._id)}
                          title="View feedback" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded">
                          <FiEye size={14} />
                        </button>
                      )}
                      {!iv.feedbackSubmitted && (
                        <button onClick={() => { setSubmitModal(iv._id); setForm(BLANK); }}
                          title="Submit feedback" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                          <FiPlus size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No interviews found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewFeedback && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Feedback Details</h2>
            {viewData ? (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">Overall Rating:</span>
                  <span className="text-yellow-400 text-lg">{'★'.repeat(viewData.overallRating || 0)}</span>
                </div>
                {viewData.recommendation && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">Recommendation:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${RECO_COLORS[viewData.recommendation] || 'bg-gray-100 text-gray-600'}`}>
                      {viewData.recommendation.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {viewData.skillRatings?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Skill Ratings</p>
                    <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Skill</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewData.skillRatings.map((sr, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-gray-700">{sr.skill}</td>
                            <td className="px-3 py-2 text-yellow-400">{'★'.repeat(sr.rating || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {viewData.strengths && <div><p className="font-medium text-gray-700">Strengths</p><p className="text-gray-600 mt-1">{viewData.strengths}</p></div>}
                {viewData.weaknesses && <div><p className="font-medium text-gray-700">Weaknesses</p><p className="text-gray-600 mt-1">{viewData.weaknesses}</p></div>}
                {viewData.comments && <div><p className="font-medium text-gray-700">Comments</p><p className="text-gray-600 mt-1">{viewData.comments}</p></div>}
              </div>
            ) : <p className="text-gray-400 text-center py-4">No feedback data available</p>}
            <div className="flex justify-end mt-5">
              <button onClick={() => { setViewFeedback(null); setViewData(null); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {submitModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Submit Feedback</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Overall Rating</label>
                <div className="mt-1"><StarRating value={form.overallRating} onChange={v => set('overallRating', v)} /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Recommendation</label>
                <select value={form.recommendation} onChange={e => set('recommendation', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {['hire', 'reject', 'hold', 'next_round'].map(r => (
                    <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Strengths</label>
                <textarea rows={2} value={form.strengths} onChange={e => set('strengths', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Weaknesses</label>
                <textarea rows={2} value={form.weaknesses} onChange={e => set('weaknesses', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Comments</label>
                <textarea rows={2} value={form.comments} onChange={e => set('comments', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Skill Ratings</label>
                <div className="flex gap-2 mt-1">
                  <input value={newSkill.skill} onChange={e => setNewSkill(s => ({ ...s, skill: e.target.value }))}
                    placeholder="Skill name" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input type="number" min={1} max={5} value={newSkill.rating} onChange={e => setNewSkill(s => ({ ...s, rating: Number(e.target.value) }))}
                    className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <button type="button" onClick={addSkillRating}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Add</button>
                </div>
                {form.skillRatings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {form.skillRatings.map((sr, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="flex-1">{sr.skill}</span>
                        <span className="text-yellow-400">{'★'.repeat(sr.rating)}</span>
                        <button type="button" onClick={() => setForm(f => ({ ...f, skillRatings: f.skillRatings.filter((_, j) => j !== i) }))}
                          className="text-xs text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setSubmitModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleSubmit} disabled={saving || !form.overallRating}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
