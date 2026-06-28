import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchPMODashboard } from '../../services/pmoAPI';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8', '#6366f1', '#14b8a6'];
const fmtC = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function KPI({ label, value, sub, color = 'indigo' }) {
  const colors = { indigo: 'bg-indigo-50 text-indigo-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-red-600', gray: 'bg-gray-50 text-gray-600' };
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-0.5 text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminPMODashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPMODashboard()
      .then(r => setData(r.data.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-6 text-gray-400 text-center">Loading PMO Dashboard…</div></AdminLayout>;
  if (!data)   return <AdminLayout><div className="p-6 text-red-400 text-center">Failed to load dashboard.</div></AdminLayout>;

  const { kpis, portfolioHealthBreakdown, projectStatusBreakdown } = data;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PMO Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise PMO Governance & Analytics</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <KPI label="Total Portfolios"     value={kpis.totalPortfolios}     color="indigo" />
          <KPI label="Active Portfolios"    value={kpis.activePortfolios}     color="green" />
          <KPI label="Programs"             value={kpis.totalPrograms}        color="indigo" />
          <KPI label="Projects"             value={kpis.totalProjects}        color="indigo" />
          <KPI label="Open Risks"           value={kpis.openRisks}            color="red" />
          <KPI label="Non-Compliant Items"  value={kpis.nonCompliant}         color="amber" />
          <KPI label="Open Audits"          value={kpis.openAudits}           color="amber" />
          <KPI label="Avg SPI"              value={kpis.avgSPI}               color={kpis.avgSPI >= 1 ? 'green' : 'red'} sub="Schedule Performance" />
          <KPI label="Avg CPI"              value={kpis.avgCPI}               color={kpis.avgCPI >= 1 ? 'green' : 'red'} sub="Cost Performance" />
          <KPI label="Budget Burn"          value={`${kpis.budgetBurn}%`}     color={kpis.budgetBurn > 90 ? 'red' : kpis.budgetBurn > 75 ? 'amber' : 'green'} sub={fmtC(kpis.actualSpend)} />
          <KPI label="Benefit Realization"  value={`${kpis.benefitRealization}%`} color="green" sub={fmtC(kpis.realizedBenefit)} />
          <KPI label="Resource Utilization" value={`${kpis.resourceUtilization}%`} color={kpis.resourceUtilization > 90 ? 'red' : kpis.resourceUtilization > 75 ? 'amber' : 'green'} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Portfolio Health</h2>
            {(portfolioHealthBreakdown || []).length === 0 ? <p className="text-gray-400 text-center py-6">No data.</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={portfolioHealthBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80}
                    label={({ _id, count }) => `${(_id || 'N/A').replace(/_/g, ' ')} (${count})`}>
                    {(portfolioHealthBreakdown || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Project Status Distribution</h2>
            {(projectStatusBreakdown || []).length === 0 ? <p className="text-gray-400 text-center py-6">No data.</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={projectStatusBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis dataKey="_id" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" name="Projects" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Financial Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center"><p className="text-xl font-bold text-gray-900">{fmtC(kpis.totalBudget)}</p><p className="text-xs text-gray-500">Total Budget</p></div>
            <div className="text-center"><p className="text-xl font-bold text-orange-600">{fmtC(kpis.actualSpend)}</p><p className="text-xs text-gray-500">Actual Spend</p></div>
            <div className="text-center"><p className="text-xl font-bold text-blue-600">{fmtC(kpis.targetBenefit)}</p><p className="text-xs text-gray-500">Target Benefits</p></div>
            <div className="text-center"><p className="text-xl font-bold text-green-600">{fmtC(kpis.realizedBenefit)}</p><p className="text-xs text-gray-500">Realized Benefits</p></div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Budget Burn</span><span>{kpis.budgetBurn}%</span></div>
            <div className="h-3 bg-gray-100 rounded-full">
              <div className={`h-3 rounded-full ${kpis.budgetBurn > 90 ? 'bg-red-500' : kpis.budgetBurn > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(kpis.budgetBurn, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
