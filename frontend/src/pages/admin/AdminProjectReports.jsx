import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  fetchProgressReport, fetchBudgetReport, fetchResourceReport,
  fetchTaskReport, fetchRiskReport, fetchIssueReport,
} from '../../services/projectAPI';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminProjectReports() {
  const [tab, setTab]         = useState('progress');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const loaders = {
    progress:   () => fetchProgressReport(),
    budget:     () => fetchBudgetReport(),
    resources:  () => fetchResourceReport(),
    tasks:      () => fetchTaskReport(),
    risks:      () => fetchRiskReport(),
    issues:     () => fetchIssueReport(),
  };

  useEffect(() => {
    setLoading(true);
    setData(null);
    const fn = loaders[tab];
    if (fn) fn().then(r => setData(r.data.data || r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [tab]);

  const TABS = [
    { key: 'progress', label: 'Progress' },
    { key: 'budget',   label: 'Budget' },
    { key: 'resources', label: 'Resources' },
    { key: 'tasks',    label: 'Tasks' },
    { key: 'risks',    label: 'Risks' },
    { key: 'issues',   label: 'Issues' },
  ];

  const renderContent = () => {
    if (loading) return <p className="text-gray-400 text-center py-10">Loading report...</p>;
    if (!data) return <p className="text-gray-400 text-center py-10">No data available.</p>;

    if (tab === 'progress') {
      const arr = Array.isArray(data) ? data : [];
      return (
        <div className="space-y-6">
          <ChartCard title="Project Completion">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={arr.map(p => ({ name: p.name?.slice(0, 15) || 'Project', completion: p.completionPercent || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip formatter={v => `${v}%`} />
                <Bar dataKey="completion" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>{['Project', 'Status', 'Completion'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>
                {arr.map(p => (
                  <tr key={p._id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{p.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.completionPercent || 0}%` }} /></div>
                        <span className="text-xs font-medium">{p.completionPercent || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (tab === 'budget') {
      const arr = Array.isArray(data) ? data : [];
      return (
        <ChartCard title="Budget vs Actual Cost">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={arr.map((b, i) => ({ name: `Project ${i + 1}`, budget: b.totalBudget || 0, actual: b.actualCost || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Bar dataKey="budget" fill="#10b981" name="Budget" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#ef4444" name="Actual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      );
    }

    if (tab === 'resources') {
      const arr = Array.isArray(data) ? data : [];
      return (
        <ChartCard title="Hours by Employee">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={arr.map(r => ({ name: r.name || 'Unknown', total: r.totalHours || 0, billable: r.billable || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis unit="h" />
              <Tooltip formatter={v => `${v}h`} />
              <Bar dataKey="total" fill="#3b82f6" name="Total Hours" radius={[4, 4, 0, 0]} />
              <Bar dataKey="billable" fill="#10b981" name="Billable Hours" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      );
    }

    if (tab === 'tasks' || tab === 'issues') {
      const arr = Array.isArray(data) ? data : [];
      const pieData = arr.map((r, i) => ({ name: r._id || `Item ${i}`, value: r.count || 0 }));
      return (
        <ChartCard title={tab === 'tasks' ? 'Tasks by Status' : 'Issues by Status'}>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="capitalize text-gray-700">{d.name.replace('_', ' ')}</span>
                  <span className="font-semibold text-gray-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      );
    }

    if (tab === 'risks') {
      const obj = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
      const byCategory = obj.byCategory || [];
      return (
        <div className="grid grid-cols-2 gap-6">
          <ChartCard title="Open Risks">
            <div className="text-4xl font-bold text-red-600 text-center py-4">{obj.openRisks || 0}</div>
            <p className="text-sm text-gray-500 text-center">risks requiring attention</p>
          </ChartCard>
          <ChartCard title="Risks by Category">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCategory}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    return <pre className="text-xs text-gray-500 bg-gray-50 rounded-xl p-4 overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Project Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and insights across all projects</p>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </AdminLayout>
  );
}
