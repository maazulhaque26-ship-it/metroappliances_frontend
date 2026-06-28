import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchArchives, restoreFromArchive } from '../../services/documentAPI';

export default function AdminDocumentArchive() {
  const [archives, setArchives] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterRestored, setFilterRestored] = useState('');
  const [showRestore, setShowRestore] = useState(null);
  const [restoreReason, setRestoreReason] = useState('');

  const load = () => {
    const p = { page, limit: 20 };
    if (filterRestored !== '') p.isRestored = filterRestored;
    fetchArchives(p).then(r => { setArchives(r.data.data?.data || []); setTotal(r.data.data?.total || 0); }).catch(console.error);
  };

  useEffect(load, [page, filterRestored]);

  const handleRestore = async () => {
    await restoreFromArchive(showRestore._id, { restoreReason }).catch(e => alert(e.response?.data?.message || 'Error'));
    setShowRestore(null);
    setRestoreReason('');
    load();
  };

  const REASON_COLORS = {
    retention_policy: 'bg-blue-100 text-blue-700',
    obsolete: 'bg-gray-100 text-gray-600',
    superseded: 'bg-purple-100 text-purple-700',
    manual: 'bg-amber-100 text-amber-700',
    compliance: 'bg-red-100 text-red-600',
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Document Archive</h1>
          <span className="text-sm text-gray-500">{total} archived records</span>
        </div>

        <div className="flex gap-2">
          {[{ v: '', l: 'All' }, { v: 'false', l: 'Archived' }, { v: 'true', l: 'Restored' }].map(f => (
            <button key={f.v} onClick={() => setFilterRestored(f.v)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterRestored === f.v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {f.l}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              {['Code', 'Document', 'Archive Reason', 'Archived By', 'Archived At', 'Status', 'Scheduled Deletion', 'Actions'].map(h =>
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y">
              {archives.length === 0
                ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">No archived documents found.</td></tr>
                : archives.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs">{a.archiveCode}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-medium text-gray-800">{a.titleSnapshot || a.document?.title || '-'}</p>
                      <p className="text-xs text-gray-400 font-mono">{a.document?.documentCode || '-'}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REASON_COLORS[a.archiveReason] || 'bg-gray-100 text-gray-600'}`}>{a.archiveReason?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{a.archivedBy?.name || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      {a.isRestored
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Restored</span>
                        : <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Archived</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-red-500">{a.scheduledDeletion ? new Date(a.scheduledDeletion).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-2.5">
                      {!a.isRestored && (
                        <button onClick={() => setShowRestore(a)} className="text-xs text-blue-600 hover:underline">Restore</button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex gap-2 justify-center">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-gray-500 px-2 py-1">Page {page}</span>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {showRestore && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Restore Document</h3>
              <button onClick={() => setShowRestore(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-600">Restore: <span className="font-medium">{showRestore.titleSnapshot}</span></p>
              <textarea value={restoreReason} onChange={e => setRestoreReason(e.target.value)} placeholder="Reason for restoration" className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowRestore(null)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleRestore} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Restore</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
