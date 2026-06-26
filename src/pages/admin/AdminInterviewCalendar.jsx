import React, { useEffect, useState } from 'react';
import { FiPlus, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchInterviews, scheduleInterview, completeInterview, cancelInterview, rescheduleInterview, fetchApplications } from '../../services/recruitmentAPI';

const TYPE_COLORS = {
  screening:  'bg-gray-100 text-gray-600',
  technical:  'bg-blue-100 text-blue-700',
  hr:         'bg-purple-100 text-purple-700',
  final:      'bg-indigo-100 text-indigo-700',
  culture_fit:'bg-pink-100 text-pink-700',
};

const MODE_COLORS = {
  video:     'bg-blue-100 text-blue-700',
  in_person: 'bg-gray-100 text-gray-600',
  phone:     'bg-yellow-100 text-yellow-700',
};

const STATUS_COLORS = {
  scheduled:  'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  rescheduled:'bg-yellow-100 text-yellow-700',
  no_show:    'bg-orange-100 text-orange-700',
};

const today = () => new Date().toISOString().slice(0, 10);
const weekLater = () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); };

const BLANK_SCHED = { application: '', type: 'technical', scheduledAt: '', duration: 60, mode: 'video', meetLink: '', interviewers: '' };
const BLANK_COMPLETE = { result: 'next_round', notes: '' };
const BLANK_CANCEL = { cancelReason: '' };
const BLANK_RESCHEDULE = { scheduledAt: '' };

export default function AdminInterviewCalendar() {
  const [interviews, setInterviews] = useState([]);
  const [grouped, setGrouped]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [from, setFrom]             = useState(today());
  const [to, setTo]                 = useState(weekLater());
  const [apps, setApps]             = useState([]);
  const [showSched, setShowSched]   = useState(false);
  const [schedForm, setSchedForm]   = useState(BLANK_SCHED);
  const [completeModal, setCompleteModal] = useState(null);
  const [completeForm, setCompleteForm]   = useState(BLANK_COMPLETE);
  const [cancelModal, setCancelModal]     = useState(null);
  const [cancelForm, setCancelForm]       = useState(BLANK_CANCEL);
  const [reschedModal, setReschedModal]   = useState(null);
  const [reschedForm, setReschedForm]     = useState(BLANK_RESCHEDULE);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchInterviews({ from, to, status: 'scheduled', limit: 200 })
      .then(r => {
        const data = r.data.data || [];
        setInterviews(data);
        const g = {};
        data.forEach(iv => {
          const day = iv.scheduledAt ? new Date(iv.scheduledAt).toDateString() : 'Unscheduled';
          if (!g[day]) g[day] = [];
          g[day].push(iv);
        });
        setGrouped(g);
      })
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [from, to]);
  useEffect(() => {
    fetchApplications({ limit: 100 }).then(r => setApps(r.data.data || [])).catch(() => {});
  }, []);

  const handleSchedule = async () => {
    setSaving(true);
    try {
      const payload = { ...schedForm, interviewers: schedForm.interviewers.split(',').map(s => s.trim()).filter(Boolean) };
      await scheduleInterview(payload);
      setShowSched(false); setSchedForm(BLANK_SCHED); load();
    } catch (e) { alert(e.response?.data?.message || 'Schedule failed'); }
    finally { setSaving(false); }
  };

  const handleComplete = async () => {
    setSaving(true);
    try { await completeInterview(completeModal, completeForm); setCompleteModal(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setSaving(false); }
  };

  const handleCancel = async () => {
    setSaving(true);
    try { await cancelInterview(cancelModal, cancelForm); setCancelModal(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setSaving(false); }
  };

  const handleReschedule = async () => {
    setSaving(true);
    try { await rescheduleInterview(reschedModal, reschedForm); setReschedModal(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">Scheduled interviews grouped by date</p>
          </div>
          <button onClick={() => setShowSched(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <FiPlus size={16} /> Schedule Interview
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="text-xs font-medium text-gray-600">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        {Object.keys(grouped).length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">No interviews scheduled in this range</div>
        )}

        {Object.entries(grouped).map(([day, ivs]) => (
          <div key={day} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{day}</h2>
            {ivs.map(iv => (
              <div key={iv._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {iv.application?.candidate?.firstName} {iv.application?.candidate?.lastName}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${TYPE_COLORS[iv.type] || 'bg-gray-100 text-gray-600'}`}>
                        {iv.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${MODE_COLORS[iv.mode] || 'bg-gray-100 text-gray-600'}`}>
                        {iv.mode?.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[iv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {iv.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{iv.application?.job?.title}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {iv.scheduledAt && <span>{new Date(iv.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                      {iv.duration && <span>{iv.duration} min</span>}
                      {iv.interviewers?.length > 0 && <span>Interviewers: {iv.interviewers.join(', ')}</span>}
                      {iv.meetLink && <a href={iv.meetLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Join</a>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {iv.status === 'scheduled' && (
                      <>
                        <button onClick={() => { setCompleteModal(iv._id); setCompleteForm(BLANK_COMPLETE); }}
                          title="Complete" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                          <FiCheck size={14} />
                        </button>
                        <button onClick={() => { setReschedModal(iv._id); setReschedForm(BLANK_RESCHEDULE); }}
                          title="Reschedule" className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded">
                          <FiRefreshCw size={14} />
                        </button>
                        <button onClick={() => { setCancelModal(iv._id); setCancelForm(BLANK_CANCEL); }}
                          title="Cancel" className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                          <FiX size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showSched && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Schedule Interview</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Application</label>
                <select value={schedForm.application} onChange={e => setSchedForm(f => ({ ...f, application: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select application</option>
                  {apps.map(a => (
                    <option key={a._id} value={a._id}>{a.candidate?.firstName} {a.candidate?.lastName} — {a.job?.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Interview Type</label>
                <select value={schedForm.type} onChange={e => setSchedForm(f => ({ ...f, type: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {['screening', 'technical', 'hr', 'final', 'culture_fit'].map(t => (
                    <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Scheduled At</label>
                <input type="datetime-local" value={schedForm.scheduledAt} onChange={e => setSchedForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Duration (minutes)</label>
                <input type="number" value={schedForm.duration} onChange={e => setSchedForm(f => ({ ...f, duration: Number(e.target.value) }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Mode</label>
                <select value={schedForm.mode} onChange={e => setSchedForm(f => ({ ...f, mode: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="video">Video</option>
                  <option value="in_person">In Person</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Meet Link</label>
                <input value={schedForm.meetLink} onChange={e => setSchedForm(f => ({ ...f, meetLink: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Interviewers (comma-separated)</label>
                <input value={schedForm.interviewers} onChange={e => setSchedForm(f => ({ ...f, interviewers: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowSched(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleSchedule} disabled={saving || !schedForm.application || !schedForm.scheduledAt}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Scheduling…' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {completeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Complete Interview</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Result</label>
                <select value={completeForm.result} onChange={e => setCompleteForm(f => ({ ...f, result: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {['hire', 'reject', 'hold', 'next_round'].map(r => (
                    <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Notes</label>
                <textarea rows={3} value={completeForm.notes} onChange={e => setCompleteForm(f => ({ ...f, notes: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setCompleteModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleComplete} disabled={saving}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Cancel Interview</h2>
            <div>
              <label className="text-xs font-medium text-gray-600">Cancellation Reason</label>
              <textarea rows={3} value={cancelForm.cancelReason} onChange={e => setCancelForm(f => ({ ...f, cancelReason: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setCancelModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Back</button>
              <button onClick={handleCancel} disabled={saving}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Cancelling…' : 'Cancel Interview'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reschedModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Reschedule Interview</h2>
            <div>
              <label className="text-xs font-medium text-gray-600">New Date & Time</label>
              <input type="datetime-local" value={reschedForm.scheduledAt} onChange={e => setReschedForm(f => ({ ...f, scheduledAt: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setReschedModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleReschedule} disabled={saving || !reschedForm.scheduledAt}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
