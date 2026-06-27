import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  fetchDocumentActivity, fetchExpiryReport, fetchRetentionReport,
  fetchReviewReport, fetchKnowledgeUsageReport, fetchDocumentAuditReport
} from '../../services/documentAPI';

const TABS = ['Activity', 'Expiry', 'Retention', 'Reviews', 'Knowledge Usage', 'Audit Trail'];
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDocumentReports() {
  const [tab, setTab] = useState('Activity');
  const [activity, setActivity] = useState(null);
  const [expiry, setExpiry] = useState([]);
  const [retention, setRetention] = useState([]);
  const [reviews, setReviews] = useState(null);
  const [knowledge, setKnowledge] = useState(null);
  const [audit, setAudit] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === 'Activity') fetchDocumentActivity().then(r => setActivity(r.data.data)).catch(console.error).finally(() => setLoading(false));
    else if (tab === 'Expiry') fetchExpiryReport({ days: 90 }).then(r => setExpiry(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
    else if (tab === 'Retention') fetchRetentionReport().then(r => setRetention(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
    else if (tab === 'Reviews') fetchReviewReport().then(r => setReviews(r.data.data)).catch(console.error).finally(() => setLoading(false));
    else if (tab === 'Knowledge Usage') fetchKnowledgeUsageReport().then(r => setKnowledge(r.data.data)).catch(console.error).finally(() => setLoading(false));
    else if (tab === 'Audit Trail') fetchDocumentAuditReport({ page: auditPage, limit: 25 }).then(r => { setAudit(r.data.data?.data || []); setAuditTotal(r.data.data?.total || 0); }).catch(console.error).finally(() => setLoading(false));
  }, [tab, auditPage]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Document Reports</h1>

        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-8 text-gray-400">Loading…</div>}

        {!loading && tab === 'Activity' && activity && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Documents', v: activity.totals?.total || 0, color: 'text-indigo-600' },
                { label: 'Uploaded Today', v: activity.uploadedToday || 0, color: 'text-green-600' },
                { label: 'Downloads Today', v: activity.downloadsToday || 0, color: 'text-amber-600' },
                { label: 'Active Users', v: activity.activeUsers || 0, color: 'text-purple-600' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className={`text-2xl font-bold ${k.color}`}>{k.v}</p>
                  <p className="text-xs text-gray-500 mt-1">{k.label}</p>
                </div>
              ))}
            </div>
            {activity.byModule?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents by Module</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={activity.byModule}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {activity.byStatus?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents by Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={activity.byStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={75}>
                      {activity.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={10} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'Expiry' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
              <p className="text-sm text-amber-700 font-medium">{expiry.length} documents expiring within 90 days</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                {['Code', 'Title', 'Module', 'Owner', 'Expiry Date', 'Days Left', 'Status'].map(h =>
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y">
                {expiry.length === 0
                  ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No expiring documents.</td></tr>
                  : expiry.map(d => {
                    const days = Math.ceil((new Date(d.expiryDate) - new Date()) / 86400000);
                    return (
                      <tr key={d._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono text-xs">{d.documentCode}</td>
                        <td className="px-4 py-2.5 text-xs font-medium">{d.title}</td>
                        <td className="px-4 py-2.5 text-xs capitalize">{d.module}</td>
                        <td className="px-4 py-2.5 text-xs">{d.owner?.name || '-'}</td>
                        <td className="px-4 py-2.5 text-xs">{new Date(d.expiryDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5"><span className={`text-xs font-semibold ${days <= 7 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-gray-600'}`}>{days}d</span></td>
                        <td className="px-4 py-2.5"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{d.status}</span></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'Retention' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                {['Policy', 'Retention', 'Post Action', 'Legal Basis', 'Applied', 'Active'].map(h =>
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y">
                {retention.length === 0
                  ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No retention policies found.</td></tr>
                  : retention.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5"><p className="text-xs font-medium">{r.name}</p><p className="text-xs text-gray-400 font-mono">{r.retentionCode}</p></td>
                      <td className="px-4 py-2.5 text-xs">{r.retentionYears}y {r.retentionMonths || 0}m</td>
                      <td className="px-4 py-2.5 text-xs capitalize">{r.postRetentionAction?.replace('_', ' ')}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{r.legalBasis || '—'}</td>
                      <td className="px-4 py-2.5 text-xs">{r.appliedCount || 0}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.isActive ? 'Yes' : 'No'}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'Reviews' && reviews && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Reviews', v: reviews.total || 0, color: 'text-indigo-600' },
                { label: 'Overdue', v: reviews.overdue || 0, color: 'text-red-600' },
                { label: 'Completed', v: reviews.completed || 0, color: 'text-green-600' },
                { label: 'Scheduled', v: reviews.scheduled || 0, color: 'text-amber-600' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className={`text-2xl font-bold ${k.color}`}>{k.v}</p>
                  <p className="text-xs text-gray-500 mt-1">{k.label}</p>
                </div>
              ))}
            </div>
            {reviews.byType?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Reviews by Type</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={reviews.byType}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'Knowledge Usage' && knowledge && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Articles', v: knowledge.totalArticles || 0, color: 'text-indigo-600' },
                { label: 'Total Views', v: knowledge.totalViews || 0, color: 'text-blue-600' },
                { label: 'Total Likes', v: knowledge.totalLikes || 0, color: 'text-green-600' },
                { label: 'Total Bookmarks', v: knowledge.totalBookmarks || 0, color: 'text-amber-600' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className={`text-2xl font-bold ${k.color}`}>{k.v}</p>
                  <p className="text-xs text-gray-500 mt-1">{k.label}</p>
                </div>
              ))}
            </div>
            {knowledge.topArticles?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b"><h3 className="text-sm font-semibold text-gray-700">Top Articles by Views</h3></div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b"><tr>
                    {['Title', 'Module', 'Views', 'Likes', 'Bookmarks', 'Status'].map(h =>
                      <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y">
                    {knowledge.topArticles.map(a => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs font-medium">{a.title}</td>
                        <td className="px-4 py-2 text-xs capitalize">{a.module}</td>
                        <td className="px-4 py-2 text-xs font-semibold text-blue-600">{a.viewCount}</td>
                        <td className="px-4 py-2 text-xs text-green-600">{a.likeCount}</td>
                        <td className="px-4 py-2 text-xs text-amber-600">{a.bookmarkCount}</td>
                        <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'Audit Trail' && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  {['Code', 'Document', 'Action', 'Performed By', 'Version', 'Status Change', 'Date'].map(h =>
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y">
                  {audit.length === 0
                    ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No audit records found.</td></tr>
                    : audit.map(a => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono text-xs">{a.auditCode}</td>
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{a.document?.title || a.document || '-'}</td>
                        <td className="px-4 py-2.5"><span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">{a.action}</span></td>
                        <td className="px-4 py-2.5 text-xs">{a.performedBy?.name || '-'}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{a.versionAt || '—'}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{a.fromStatus && a.toStatus ? `${a.fromStatus} → ${a.toStatus}` : '—'}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-400">{new Date(a.performedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {auditTotal > 25 && (
              <div className="flex gap-2 justify-center">
                <button disabled={auditPage === 1} onClick={() => setAuditPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
                <span className="text-sm text-gray-500 px-2 py-1">Page {auditPage}</span>
                <button disabled={auditPage * 25 >= auditTotal} onClick={() => setAuditPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
