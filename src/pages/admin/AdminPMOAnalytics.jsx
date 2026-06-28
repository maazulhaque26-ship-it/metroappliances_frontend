import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchEVMAnalytics, fetchRiskHeatmap, fetchBudgetAnalytics,
  fetchResourceForecast, fetchBenefitRealization, fetchStrategicAlignment,
} from '../../services/pmoAPI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

const fmtC = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#8b5cf6'];

const RISK_HEAT_COLORS = {
  low: '#dcfce7', moderate: '#fef9c3', high: '#fed7aa', very_high: '#fecaca', critical: '#dc2626',
};

function heatColor(count) {
  if (count === 0) return '#f9fafb';
  if (count === 1) return '#dcfce7';
  if (count === 2) return '#fef9c3';
  if (count <= 4)  return '#fed7aa';
  return '#fecaca';
}

const TABS = [
  { id: 'evm',       label: 'EV / SPI / CPI' },
  { id: 'risk',      label: 'Risk Heatmap' },
  { id: 'budget',    label: 'Budget Analysis' },
  { id: 'resource',  label: 'Resource Forecast' },
  { id: 'benefits',  label: 'Benefits' },
  { id: 'alignment', label: 'Strategic Alignment' },
];

function Stat({ label, value, sub }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminPMOAnalytics() {
  const [tab, setTab]       = useState('evm');
  const [loading, setLoading] = useState(false);

  const [evmData, setEvmData]     = useState(null);
  const [riskData, setRiskData]   = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [resData, setResData]     = useState(null);
  const [benData, setBenData]     = useState(null);
  const [alignData, setAlignData] = useState(null);

  const loaders = {
    evm:       () => fetchEVMAnalytics().then(r => setEvmData(r.data.data || r.data)),
    risk:      () => fetchRiskHeatmap().then(r => setRiskData(r.data.data || r.data)),
    budget:    () => fetchBudgetAnalytics().then(r => setBudgetData(r.data.data || r.data)),
    resource:  () => fetchResourceForecast().then(r => setResData(r.data.data || r.data)),
    benefits:  () => fetchBenefitRealization().then(r => setBenData(r.data.data || r.data)),
    alignment: () => fetchStrategicAlignment().then(r => setAlignData(r.data.data || r.data)),
  };

  useEffect(() => {
    setLoading(true);
    loaders[tab]().catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  const probabilities = ['very_low', 'low', 'medium', 'high', 'very_high'];
  const impacts       = ['very_low', 'low', 'medium', 'high', 'very_high'];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PMO Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Executive analytics — EV, risk heatmaps, budget & benefits</p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}>{t.label}</button>
          ))}
        </div>

        {loading && <p className="text-gray-400 text-center py-10">Loading analytics…</p>}

        {/* EV / SPI / CPI */}
        {!loading && tab === 'evm' && evmData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat label="Avg SPI" value={evmData.aggregates?.avgSPI} sub="Schedule Performance Index" />
              <Stat label="Avg CPI" value={evmData.aggregates?.avgCPI} sub="Cost Performance Index" />
              <Stat label="Total EV" value={fmtC(evmData.aggregates?.totalEV)} />
              <Stat label="Total PV" value={fmtC(evmData.aggregates?.totalPV)} />
              <Stat label="Total AC" value={fmtC(evmData.aggregates?.totalAC)} />
              <Stat label="Projects" value={evmData.summary?.length || 0} />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>{['Project', 'Health', 'SPI', 'CPI', 'EV', 'PV', 'AC', 'BAC', 'EAC'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(evmData.summary || []).map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.project}</td>
                      <td className="px-4 py-3"><span className={`inline-block w-2 h-2 rounded-full ${p.health === 'green' ? 'bg-green-500' : p.health === 'amber' ? 'bg-amber-500' : p.health === 'red' ? 'bg-red-500' : 'bg-gray-400'}`} /></td>
                      <td className="px-4 py-3 text-xs font-medium">{p.spi?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-medium">{p.cpi?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs">{fmtC(p.ev)}</td>
                      <td className="px-4 py-3 text-xs">{fmtC(p.pv)}</td>
                      <td className="px-4 py-3 text-xs">{fmtC(p.ac)}</td>
                      <td className="px-4 py-3 text-xs">{fmtC(p.bac)}</td>
                      <td className="px-4 py-3 text-xs">{fmtC(p.eac)}</td>
                    </tr>
                  ))}
                  {(evmData.summary || []).length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No scorecard data.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Risk Heatmap */}
        {!loading && tab === 'risk' && riskData && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Total Open Risks" value={riskData.total} />
              {(riskData.byStatus || []).slice(0, 2).map(s => <Stat key={s._id} label={s._id?.replace(/_/g, ' ')} value={s.count} />)}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Risk Probability × Impact Heatmap</h2>
              <div className="overflow-x-auto">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-gray-500 text-left">P → / I ↓</th>
                      {probabilities.map(p => <th key={p} className="p-2 text-gray-500 text-center">{p.replace(/_/g, ' ')}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {impacts.map(impact => (
                      <tr key={impact}>
                        <td className="p-2 font-medium text-gray-600">{impact.replace(/_/g, ' ')}</td>
                        {probabilities.map(prob => {
                          const cell = riskData.matrix?.[prob]?.[impact];
                          return (
                            <td key={prob} className="p-2 text-center border border-gray-100 rounded" style={{ backgroundColor: heatColor(cell?.count || 0), minWidth: 60 }}>
                              {cell?.count > 0 ? <span className="font-bold">{cell.count}</span> : <span className="text-gray-300">0</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {(riskData.topRisks || []).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Top 10 Risks by Score</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={riskData.topRisks} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="title" type="category" tick={{ fontSize: 9 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="riskScore" name="Risk Score" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Budget Analysis */}
        {!loading && tab === 'budget' && budgetData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat label="Total Budget" value={fmtC(budgetData.summary?.totalBudget)} />
              <Stat label="Actual Spend" value={fmtC(budgetData.summary?.actualSpend)} />
              <Stat label="Budget Burn" value={`${budgetData.summary?.budgetBurn}%`} />
              <Stat label="Cost Variance" value={fmtC(budgetData.summary?.costVariance)} sub={budgetData.summary?.costVariance >= 0 ? 'Under budget' : 'Over budget'} />
              <Stat label="CapEx" value={fmtC(budgetData.summary?.capexBudget)} />
              <Stat label="OpEx" value={fmtC(budgetData.summary?.opexBudget)} />
            </div>
            {(budgetData.forecastTrend || []).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Forecast Trend</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={budgetData.forecastTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => fmtC(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="plannedCost" name="Planned" stroke="#6366f1" dot={false} />
                    <Line type="monotone" dataKey="forecastCost" name="Forecast" stroke="#f97316" strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="forecastBenefit" name="Benefit" stroke="#22c55e" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Resource Forecast */}
        {!loading && tab === 'resource' && resData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Total Available" value={`${resData.summary?.totalAvailable}h`} />
              <Stat label="Total Demand" value={`${resData.summary?.totalDemand}h`} />
              <Stat label="Utilization" value={`${resData.summary?.utilization}%`} />
              <Stat label="Gap" value={`${resData.summary?.gap}h`} sub={resData.summary?.gap >= 0 ? 'Capacity headroom' : 'Overallocated'} />
            </div>
            {(resData.trend || []).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Capacity vs Demand by Period</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={resData.trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `${v}h`} />
                    <Legend />
                    <Bar dataKey="availableHours" name="Available" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="demandHours" name="Demand" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Benefits Realization */}
        {!loading && tab === 'benefits' && benData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Total Benefits" value={benData.summary?.total} />
              <Stat label="Target" value={fmtC(benData.summary?.targetTotal)} />
              <Stat label="Realized" value={fmtC(benData.summary?.realizedTotal)} />
              <Stat label="Realization" value={`${benData.summary?.realization}%`} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">By Type</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={benData.byType}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => fmtC(v)} />
                    <Legend />
                    <Bar dataKey="target" name="Target" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="realized" name="Realized" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">By Portfolio</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={benData.byPortfolio} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="portfolio" type="category" tick={{ fontSize: 9 }} width={80} />
                    <Tooltip formatter={(v, n) => n === 'realization' ? `${v}%` : fmtC(v)} />
                    <Legend />
                    <Bar dataKey="realization" name="Realization %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Strategic Alignment */}
        {!loading && tab === 'alignment' && alignData && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Avg Alignment" value={`${alignData.summary?.avgAlignment}%`} />
              <Stat label="High Alignment (≥75%)" value={alignData.summary?.highAlignment} />
              <Stat label="Low Alignment (<50%)" value={alignData.summary?.lowAlignment} />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Portfolio Strategic Alignment</h2>
              <div className="space-y-3">
                {(alignData.portfolios || []).sort((a, b) => b.alignment - a.alignment).map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-32 text-xs text-gray-700 truncate">{p.name}</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full">
                      <div className={`h-3 rounded-full ${p.alignment >= 75 ? 'bg-green-500' : p.alignment >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p.alignment}%` }} />
                    </div>
                    <span className="text-xs font-medium w-10 text-right">{p.alignment}%</span>
                    <span className={`inline-block w-2 h-2 rounded-full ${p.health === 'on_track' ? 'bg-green-500' : p.health === 'at_risk' ? 'bg-amber-500' : p.health === 'critical' ? 'bg-red-500' : 'bg-gray-400'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
