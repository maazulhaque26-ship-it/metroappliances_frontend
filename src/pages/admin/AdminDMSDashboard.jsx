import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchDMSDashboard } from '../../services/documentAPI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function AdminDMSDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDMSDashboard()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center text-gray-400">Loading…</div></AdminLayout>;
  if (!data) return <AdminLayout><div className="p-8 text-center text-gray-400">No data available.</div></AdminLayout>;

  const kpis = [
    { label: 'Total Documents', value: data.totalDocuments, border: 'border-indigo-500' },
    { label: 'Published', value: data.publishedDocs, border: 'border-green-500' },
    { label: 'Drafts', value: data.draftDocs, border: 'border-amber-500' },
    { label: 'Expiring (30d)', value: data.expiringDocs, border: 'border-red-500' },
    { label: 'Pending Approvals', value: data.pendingApprovals, border: 'border-purple-500' },
    { label: 'Overdue Reviews', value: data.overdueReviews, border: 'border-orange-500' },
    { label: 'Checked Out', value: data.checkedOutDocs, border: 'border-blue-500' },
    { label: 'KB Articles', value: data.totalKBArticles, border: 'border-teal-500' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">DMS Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className={`bg-white rounded-xl p-4 border-l-4 ${k.border} shadow-sm`}>
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{k.value ?? 0}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.byModule && data.byModule.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents by Module</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.byModule}>
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {data.byType && data.byType.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents by Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.byType} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id }) => _id}>
                    {data.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Knowledge Base</h3>
          <div className="flex gap-6">
            <div><p className="text-3xl font-bold text-indigo-600">{data.publishedKBArticles}</p><p className="text-xs text-gray-500 mt-1">Published Articles</p></div>
            <div><p className="text-3xl font-bold text-gray-700">{data.totalKBArticles}</p><p className="text-xs text-gray-500 mt-1">Total Articles</p></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
