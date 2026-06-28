import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { fetchDocuments, deleteDocument, archiveDocument, checkOutDocument, checkInDocument, toggleFavorite } from '../../services/documentAPI';

const STATUSES = ['', 'draft', 'under_review', 'approved', 'published', 'archived', 'obsolete', 'expired'];
const TYPES = ['', 'policy', 'procedure', 'form', 'template', 'report', 'contract', 'invoice', 'manual', 'specification', 'certificate', 'drawing', 'other'];
const MODULES = ['', 'hr', 'finance', 'projects', 'manufacturing', 'procurement', 'warehouse', 'service', 'qms', 'eam', 'crm', 'general'];

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-purple-100 text-purple-600',
  obsolete: 'bg-red-100 text-red-600',
  expired: 'bg-rose-100 text-rose-600',
};

export default function AdminDocumentLibrary() {
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', documentType: '', module: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    const p = { page, limit: 20 };
    if (filters.status) p.status = filters.status;
    if (filters.documentType) p.documentType = filters.documentType;
    if (filters.module) p.module = filters.module;
    if (filters.search) p.search = filters.search;
    fetchDocuments(p)
      .then(r => { setDocs(r.data.data || []); setTotal(r.data.pagination?.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(load, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete document?')) return;
    await deleteDocument(id);
    load();
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive document?')) return;
    await archiveDocument(id, { archiveReason: 'manual' });
    load();
  };

  const handleCheckout = async (doc) => {
    if (doc.isCheckedOut) await checkInDocument(doc._id, {});
    else await checkOutDocument(doc._id);
    load();
  };

  const handleFavorite = async (id) => {
    await toggleFavorite(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Document Library</h1>
          <a href="/admin/dms/library/new" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Document</a>
        </div>

        <div className="flex gap-2 flex-wrap items-center bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="Search documents…" className="border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48" />
          <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="border rounded-lg px-3 py-1.5 text-sm">
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          <select value={filters.documentType} onChange={e => setFilters(p => ({ ...p, documentType: e.target.value }))} className="border rounded-lg px-3 py-1.5 text-sm">
            {TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
          <select value={filters.module} onChange={e => setFilters(p => ({ ...p, module: e.target.value }))} className="border rounded-lg px-3 py-1.5 text-sm">
            {MODULES.map(m => <option key={m} value={m}>{m || 'All Modules'}</option>)}
          </select>
          <button onClick={() => { setPage(1); load(); }} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Search</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">{total} documents</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Code', 'Title', 'Type', 'Module', 'Status', 'Version', 'Owner', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading…</td></tr>
                : docs.length === 0
                  ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">No documents found.</td></tr>
                  : docs.map(doc => (
                    <tr key={doc._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{doc.documentCode}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{doc.title}</p>
                        {doc.isCheckedOut && <span className="text-xs text-orange-600">Checked Out</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 capitalize">{doc.documentType}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 capitalize">{doc.module}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>{doc.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">v{doc.versionLabel || doc.currentVersion}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{doc.owner?.name || '-'}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1 flex-wrap">
                          <a href={`/admin/dms/library/${doc._id}`} className="text-xs text-blue-600 hover:underline">View</a>
                          <button onClick={() => handleFavorite(doc._id)} className="text-xs text-amber-500 hover:underline">★</button>
                          <button onClick={() => handleCheckout(doc)} className="text-xs text-indigo-600 hover:underline">
                            {doc.isCheckedOut ? 'Check In' : 'Check Out'}
                          </button>
                          {doc.status !== 'archived' && (
                            <button onClick={() => handleArchive(doc._id)} className="text-xs text-purple-600 hover:underline">Archive</button>
                          )}
                          <button onClick={() => handleDelete(doc._id)} className="text-xs text-red-500 hover:underline">Del</button>
                        </div>
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
    </AdminLayout>
  );
}
