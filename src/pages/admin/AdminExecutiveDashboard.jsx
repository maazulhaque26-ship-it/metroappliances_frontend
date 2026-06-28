import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FiTrendingUp, FiDollarSign, FiTarget, FiActivity, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { fetchExecutiveDashboard } from '../../services/portfolioAPI';

const HEALTH_COLORS = { on_track: '#10b981', at_risk: '#f59e0b', off_track: '#ef4444', not_started: '#9ca3af' };
const fmtCur = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

function Gauge({ label, value, color }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{pct(v)}</p>
      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2 rounded-full" style={{ width: `${v}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AdminExecutiveDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveDashboard().then(r => setData(r.data.data || r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center text-gray-400">Loading...</div></AdminLayout>;

  const k = data?.kpiCards || {};
  const health = data?.healthBreakdown || [];
  const portfolioHealth = data?.portfolioHealth || [];

  const kpiCards = [
    { label: 'Total Budget', value: fmtCur(k.totalBudget), icon: FiDollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Actual Spend', value: fmtCur(k.actualSpend), icon: FiBarChart2, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Target Benefit', value: fmtCur(k.targetBenefit), icon: FiTarget, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Realized Benefit', value: fmtCur(k.realizedBenefit), icon: FiTrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Portfolios', value: k.activePortfolios ?? 0, icon: FiActivity, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg Health Score', value: k.avgHealthScore ?? 0, icon: FiPieChart, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Strategic portfolio health, budget and benefits at a glance</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-2`}><c.icon size={18} className={c.color} /></div>
              <p className="text-lg font-bold text-gray-900 truncate">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Gauge label="Budget Burn" value={data?.budgetBurn} color="#f97316" />
          <Gauge label="Resource Utilization" value={data?.resourceUtilization} color="#6366f1" />
          <Gauge label="Benefits Progress" value={data?.benefitsProgress} color="#10b981" />
          <Gauge label="Strategic Alignment" value={data?.strategicAlignment} color="#8b5cf6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900">Portfolio Health Distribution</h2></div>
            {health.length === 0 ? <div className="px-5 py-8 text-center text-gray-400 text-sm">No items found.</div> : (
              <div className="flex items-center gap-6 p-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={health} dataKey="count" nameKey="health" cx="50%" cy="50%" outerRadius={85} label={({ health: h, count }) => `${(h || '').replace(/_/g, ' ')}: ${count}`}>
                      {health.map((h, i) => <Cell key={i} fill={HEALTH_COLORS[h.health] || '#9ca3af'} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {health.map(h => (
                    <div key={h.health} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: HEALTH_COLORS[h.health] || '#9ca3af' }} />
                      <span className="capitalize text-gray-700">{(h.health || '').replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-gray-900">{h.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900">Strategic Alignment by Portfolio</h2></div>
            {portfolioHealth.length === 0 ? <div className="px-5 py-8 text-center text-gray-400 text-sm">No items found.</div> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={portfolioHealth.slice(0, 8).map(p => ({ name: (p.name || '').slice(0, 12), alignment: p.strategicAlignment || 0, score: p.healthScore || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="alignment" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Alignment" />
                  <Bar dataKey="score" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Health Score" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
