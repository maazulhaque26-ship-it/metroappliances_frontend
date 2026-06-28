import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { fetchKBArticles, deleteKBArticle, publishKBArticle, archiveKBArticle, fetchKBCategories } from '../../services/documentAPI';

const STATUSES = ['', 'draft', 'under_review', 'published', 'archived'];
const MODULES = ['', 'hr', 'finance', 'projects', 'manufacturing', 'procurement', 'warehouse', 'service', 'qms', 'eam', 'crm', 'general'];

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  under_review: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-purple-100 text-purple-600',
};

export default function AdminKnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ status: '', module: '', category: '', search: '' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const p = { page, limit: 20 };
    if (filters.status) p.status = filters.status;
    if (filters.module) p.module = filters.module;
    if (filters.category) p.category = filters.category;
    if (filters.search) p.search = filters.search;
    fetchKBArticles(p)
      .then(r => { setArticles(r.data.data || []); setTotal(r.data.pagination?.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { load(); fetchKBCategories().then(r => setCategories(r.data.data || [])); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete article?')) return;
    await deleteKBArticle(id);
    load();
  };

  const handlePublish = async (id) => {
    await publishKBArticle(id);
    load();
  };

  const handleArchive = async (id) => {
    await archiveKBArticle(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Knowledge Base</h1>
          <a href="/admin/dms/knowledge/new" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Article</a>
        </div>

        <div className="flex gap-2 flex-wrap items-center bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="Search articles…" className="border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48" />
          <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="border rounded-lg px-3 py-1.5 text-sm">
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          <select value={filters.module} onChange={e => setFilters(p => ({ ...p, module: e.target.value }))} className="border rounded-lg px-3 py-1.5 text-sm">
            {MODULES.map(m => <option key={m} value={m}>{m || 'All Modules'}</option>)}
          </select>
          <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={() => { setPage(1); load(); }} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Search</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? <p className="col-span-3 text-center text-gray-400 py-8">Loading…</p>
            : articles.length === 0
              ? <p className="col-span-3 text-center text-gray-400 py-8">No articles found.</p>
              : articles.map(art => (
                <div key={art._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{art.title}</p>
                      <p className="text-xs text-gray-400 font-mono">{art.articleCode}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 ${STATUS_COLORS[art.status] || 'bg-gray-100 text-gray-600'}`}>{art.status}</span>
                  </div>
                  {art.summary && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{art.summary}</p>}
                  <div className="flex gap-2 text-xs mb-3 flex-wrap">
                    {art.category && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{art.category.name}</span>}
                    <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded">{art.module}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span>👁 {art.viewCount || 0}</span>
                    <span>👍 {art.likeCount || 0}</span>
                    <span>🔖 {art.bookmarkCount || 0}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <a href={`/admin/dms/knowledge/${art._id}`} className="text-xs text-blue-600 hover:underline">View</a>
                    {art.status === 'draft' && <button onClick={() => handlePublish(art._id)} className="text-xs text-green-600 hover:underline">Publish</button>}
                    {art.status === 'published' && <button onClick={() => handleArchive(art._id)} className="text-xs text-purple-600 hover:underline">Archive</button>}
                    <button onClick={() => handleDelete(art._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
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
