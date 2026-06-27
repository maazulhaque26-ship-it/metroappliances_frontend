import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchBPMDashboard } from '../../services/workflowAPI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const KPICard = ({ label, value, sub, color }) => (
  <div className={`bg-white rounded-xl p-4 border-l-4 shadow-sm ${color}`}>
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value ?? '-'}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function AdminBPMDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBPMDashboard()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center text-gray-500">Loading BPM Dashboard…</div></AdminLayout>;
  if (!data) return <AdminLayout><div className="p-8 text-center text-red-500">Failed to load dashboard.</div></AdminLayout>;

  const moduleData = (data.byModule || []).map(m => ({ name: m._id || 'unknown', total: m.count || 0, active: m.active || 0 }));
  const priorityData = (data.byPriority || []).map(p => ({ name: p._id || 'none', value: p.count || 0 }));

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BPM Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Enterprise Workflow & Approval Management</p>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">Live</span>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total Workflows" value={data.totalWorkflows} sub={`${data.activeWorkflows} active`} color="border-indigo-500" />
          <KPICard label="Total Instances" value={data.totalInstances} sub={`${data.activeInstances} in progress`} color="border-blue-500" />
          <KPICard label="Pending Approvals" value={data.pendingApprovals} sub="awaiting decision" color={data.pendingApprovals > 10 ? 'border-amber-500' : 'border-green-500'} />
          <KPICard label="Completion Rate" value={`${data.completionRate}%`} sub={`${data.completedInstances} completed`} color={data.completionRate >= 75 ? 'border-green-500' : 'border-amber-500'} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Pending Instances" value={data.pendingInstances} color="border-blue-400" />
          <KPICard label="Rejected Instances" value={data.rejectedInstances} color="border-red-400" />
          <KPICard label="Open Escalations" value={data.openEscalations} color={data.openEscalations > 0 ? 'border-red-500' : 'border-green-500'} />
          <KPICard label="SLA Breaches" value={data.slaBreachedInstances} color={data.slaBreachedInstances > 0 ? 'border-red-600' : 'border-green-500'} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Module */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Instances by Module</h3>
            {moduleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={moduleData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#6366f1" name="Total" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="active" fill="#10b981" name="Active" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-gray-400 text-center py-10">No data yet</p>}
          </div>

          {/* By Priority */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Instances by Priority</h3>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-gray-400 text-center py-10">No data yet</p>}
          </div>
        </div>

        {/* Completion Trend */}
        {data.completionTrend && data.completionTrend.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Completion Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.completionTrend}>
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" name="Completed" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
