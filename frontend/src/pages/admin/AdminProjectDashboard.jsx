import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiFolder, FiCheckCircle, FiAlertCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import { fetchProjectDashboard } from '../../services/projectAPI';

const STATUS_COLORS = {
  planning: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
  overdue: 'bg-red-100 text-red-700',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function AdminProjectDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDashboard()
      .then(r => setData(r.data.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center text-gray-400">Loading...</div></AdminLayout>;

  const kpis = data?.kpis || {};
  const recentProjects = data?.recentProjects || [];
  const upcomingMilestones = data?.upcomingMilestones || [];
  const statusBreakdown = data?.statusBreakdown || [];

  const cards = [
    { label: 'Total Projects', value: fmt(kpis.total), icon: FiFolder, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active', value: fmt(kpis.active), icon: FiTrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Completed', value: fmt(kpis.completed), icon: FiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Overdue', value: fmt(kpis.overdue), icon: FiAlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise project management overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <c.icon size={20} className={c.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Recent Projects</h2>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Status', 'Progress', 'Manager', 'Due'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentProjects.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No items found.</td></tr>
                ) : recentProjects.slice(0, 5).map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {(p.status || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.manager?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Status Breakdown</h2>
            </div>
            {statusBreakdown.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No items found.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusBreakdown} layout="vertical" margin={{ left: 8, right: 16, top: 16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiClock size={16} className="text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-900">Upcoming Milestones</h2>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Milestone', 'Project', 'Due Date', 'Status', 'Owner'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {upcomingMilestones.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No items found.</td></tr>
              ) : upcomingMilestones.slice(0, 5).map(m => (
                <tr key={m._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.project?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-600'}`}>
                      {(m.status || '').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{m.owner?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
