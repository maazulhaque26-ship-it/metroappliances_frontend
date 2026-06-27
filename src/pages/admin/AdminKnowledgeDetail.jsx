import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { fetchKBArticle, updateKBArticle, publishKBArticle, fetchKBRevisions, fetchKBFeedback, addKBFeedback, toggleKBBookmark, fetchRelatedArticles } from '../../services/documentAPI';

const TABS = ['Content', 'Revisions', 'Feedback', 'Related'];

export default function AdminKnowledgeDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [tab, setTab] = useState('Content');
  const [revisions, setRevisions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [related, setRelated] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const load = () => {
    fetchKBArticle(id).then(r => {
      const a = r.data.data;
      setArticle(a);
      setEditContent(a.content || '');
      setEditSummary(a.summary || '');
    }).catch(console.error);
  };

  useEffect(() => {
    load();
    fetchKBRevisions(id).then(r => setRevisions(r.data.data || [])).catch(console.error);
    fetchKBFeedback(id).then(r => setFeedback(r.data.data || [])).catch(console.error);
    fetchRelatedArticles(id).then(r => setRelated(r.data.data || [])).catch(console.error);
  }, [id]);

  const handleSave = async () => {
    await updateKBArticle(id, { content: editContent, summary: editSummary });
    setEditing(false);
    load();
  };

  const handlePublish = async () => {
    await publishKBArticle(id);
    load();
  };

  if (!article) return <AdminLayout><div className="p-8 text-center text-gray-400">Loading…</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{article.title}</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">{article.articleCode} · v{article.version || 1} · {article.module}</p>
          </div>
          <div className="flex gap-2">
            {article.status !== 'published' && (
              <button onClick={handlePublish} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Publish</button>
            )}
            <button onClick={() => setEditing(e => !e)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">{editing ? 'Cancel Edit' : 'Edit'}</button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>👁 {article.viewCount || 0}</span>
              <span>👍 {article.likeCount || 0}</span>
              <span>🔖 {article.bookmarkCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Content' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            {editing ? (
              <>
                <textarea value={editSummary} onChange={e => setEditSummary(e.target.value)} placeholder="Summary" className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)} placeholder="Content (Markdown supported)" className="w-full border rounded-lg px-3 py-2 text-sm h-64 resize-none font-mono" />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Save</button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 border text-sm rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                </div>
              </>
            ) : (
              <>
                {article.summary && <p className="text-sm text-gray-600 italic border-l-4 border-indigo-200 pl-3">{article.summary}</p>}
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{article.content}</div>
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t">
                    {article.tags.map(t => <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{t}</span>)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'Revisions' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                {['Code', 'Version', 'Summary', 'By', 'Date'].map(h =>
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y">
                {revisions.length === 0
                  ? <tr><td colSpan={5} className="text-center py-6 text-gray-400">No revisions yet.</td></tr>
                  : revisions.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs">{r.revisionCode}</td>
                      <td className="px-4 py-2.5 text-sm font-medium">v{r.version}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{r.changeSummary || '—'}</td>
                      <td className="px-4 py-2.5 text-xs">{r.revisedBy?.name || 'System'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Feedback' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              {[{ label: 'Total', v: feedback.length }, { label: 'Helpful', v: feedback.filter(f => f.reaction === 'helpful').length }, { label: 'Avg Rating', v: feedback.length ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.filter(f => f.rating).length).toFixed(1) : '-' }].map(k => (
                <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{k.v}</p>
                  <p className="text-xs text-gray-500 mt-1">{k.label}</p>
                </div>
              ))}
            </div>
            {feedback.map(f => (
              <div key={f._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-700">{f.user?.name || 'Anonymous'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.reaction === 'helpful' ? 'bg-green-100 text-green-700' : f.reaction === 'like' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>{f.reaction}</span>
                  {f.rating && <span className="text-xs text-amber-500">{'★'.repeat(f.rating)}</span>}
                </div>
                {f.comment && <p className="text-sm text-gray-600">{f.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'Related' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.length === 0
              ? <p className="col-span-2 text-center text-gray-400 py-6">No related articles found.</p>
              : related.map(a => (
                <div key={a._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className="font-semibold text-gray-800 text-sm">{a.title}</p>
                  <p className="text-xs text-gray-400 font-mono">{a.articleCode}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.summary}</p>
                  <a href={`/admin/dms/knowledge/${a._id}`} className="text-xs text-blue-600 hover:underline mt-2 block">View →</a>
                </div>
              ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
