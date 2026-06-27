import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchDocReviews, createDocReview, completeDocReview, fetchOverdueReviews } from '../../services/documentAPI';

const empty = { document: '', reviewer: '', reviewType: 'periodic', dueDate: '' };

export default function AdminDocumentReviewQueue() {
  const [reviews, setReviews] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showComplete, setShowComplete] = useState(null);
  const [form, setForm] = useState(empty);
  const [completeForm, setCompleteForm] = useState({ outcome: 'approved', remarks: '', nextReviewDate: '' });
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    const p = {};
    if (filterStatus) p.status = filterStatus;
    fetchDocReviews(p).then(r => setReviews(r.data.data || [])).catch(console.error);
    fetchOverdueReviews().then(r => setOverdue(r.data.data || [])).catch(console.error);
  };

  useEffect(load, [filterStatus]);

  const handleCreate = async () => {
    await createDocReview(form).catch(e => alert(e.response?.data?.message || 'Error'));
    setShowModal(false);
    load();
  };

  const handleComplete = async () => {
    await completeDocReview(showComplete._id, completeForm).catch(e => alert(e.response?.data?.message || 'Error'));
    setShowComplete(null);
    load();
  };

  const STATUS_COLORS = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-600',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Document Review Queue</h1>
          <button onClick={() => { setForm(empty); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ Schedule Review</button>
        </div>

        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-2">{overdue.length} Overdue Reviews</p>
            <div className="space-y-1">
              {overdue.slice(0, 3).map(r => (
                <div key={r._id} className="flex items-center justify-between text-xs">
                  <span className="text-red-700">{r.document?.title || 'Unknown'}</span>
                  <span className="text-red-500">Due: {new Date(r.dueDate).toLocaleDateString()}</span>
                </div>
              ))}
              {overdue.length > 3 && <p className="text-xs text-red-500">+{overdue.length - 3} more</p>}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {['', 'scheduled', 'in_progress', 'completed', 'overdue', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              {['Code', 'Document', 'Reviewer', 'Type', 'Status', 'Due Date', 'Outcome', 'Actions'].map(h =>
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y">
              {reviews.length === 0
                ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">No reviews found.</td></tr>
                : reviews.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs">{r.reviewCode}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{r.document?.title || '-'}</td>
                    <td className="px-4 py-2.5 text-xs">{r.reviewer?.name || '-'}</td>
                    <td className="px-4 py-2.5 text-xs capitalize">{r.reviewType}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{new Date(r.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-xs capitalize text-gray-500">{r.outcome || '—'}</td>
                    <td className="px-4 py-2.5">
                      {r.status !== 'completed' && r.status !== 'cancelled' && (
                        <button onClick={() => { setShowComplete(r); setCompleteForm({ outcome: 'approved', remarks: '', nextReviewDate: '' }); }}
                          className="text-xs text-green-600 hover:underline">Complete</button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Schedule Review</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={form.document} onChange={e => setForm(p => ({ ...p, document: e.target.value }))} placeholder="Document ID *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input value={form.reviewer} onChange={e => setForm(p => ({ ...p, reviewer: e.target.value }))} placeholder="Reviewer User ID *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <select value={form.reviewType} onChange={e => setForm(p => ({ ...p, reviewType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {['periodic', 'triggered', 'ad_hoc', 'compliance'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Schedule</button>
            </div>
          </div>
        </div>
      )}

      {showComplete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Complete Review</h3>
              <button onClick={() => setShowComplete(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-600">Reviewing: <span className="font-medium">{showComplete.document?.title}</span></p>
              <select value={completeForm.outcome} onChange={e => setCompleteForm(p => ({ ...p, outcome: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {['approved', 'needs_update', 'obsolete', 'extend'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <textarea value={completeForm.remarks} onChange={e => setCompleteForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Remarks" className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              <div>
                <label className="text-xs text-gray-500 block mb-1">Next Review Date</label>
                <input type="date" value={completeForm.nextReviewDate} onChange={e => setCompleteForm(p => ({ ...p, nextReviewDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowComplete(null)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleComplete} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Complete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
