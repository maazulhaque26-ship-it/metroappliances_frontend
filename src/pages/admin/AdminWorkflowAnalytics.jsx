import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchWorkflowPerformance, fetchApprovalAnalytics, fetchSLACompliance,
  fetchEscalationReport, fetchAutomationReport, fetchDepartmentAnalytics,
} from '../../services/workflowAPI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function AdminWorkflowAnalytics() {
  const [activeTab, setActiveTab] = useState('performance');
  const [perf, setPerf] = useState(null);
  const [approval, setApproval] = useState(null);
  const [sla, setSLA] = useState(null);
  const [esc, setEsc] = useState(null);
  const [auto, setAuto] = useState(null);
  const [dept, setDept] = useState(null);

  useEffect(() => {
    fetchWorkflowPerformance().then(r => setPerf(r.data.data)).catch(console.error);
    fetchApprovalAnalytics().then(r => setApproval(r.data.data)).catch(console.error);
    fetchSLACompliance().then(r => setSLA(r.data.data)).catch(console.error);
    fetchEscalationReport().then(r => setEsc(r.data.data)).catch(console.error);
    fetchAutomationReport().then(r => setAuto(r.data.data)).catch(console.error);
    fetchDepartmentAnalytics().then(r => setDept(r.data.data)).catch(console.error);
  }, []);

  const tabs = [
    { key: 'performance', label: 'Performance' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'sla', label: 'SLA' },
    { key: 'escalations', label: 'Escalations' },
    { key: 'automation', label: 'Automation' },
    { key: 'department', label: 'Department' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Workflow Analytics & Reports</h1>

        <div className="flex gap-1 flex-wrap border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Performance Tab */}
        {activeTab === 'performance' && perf && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(perf.statusBreakdown || []).map(s => (
                <div key={s._id} className="bg-white rounded-xl p-4 border shadow-sm">
                  <p className="text-xs text-gray-500 capitalize">{s._id}</p>
                  <p className="text-2xl font-bold text-gray-800">{s.count}</p>
                </div>
              ))}
            </div>
            {perf.byWorkflow && perf.byWorkflow.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Completion Rate by Workflow</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={perf.byWorkflow.slice(0, 10)}>
                    <XAxis dataKey="workflowName" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#6366f1" name="Total" radius={[3,3,0,0]} />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[3,3,0,0]} />
                    <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {perf.avgDuration && perf.avgDuration.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Avg Completion Duration (Hours)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={perf.avgDuration.slice(0, 10)} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="workflowName" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="avgHours" fill="#6366f1" name="Avg Hours" radius={[0,3,3,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && approval && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border-l-4 border-indigo-500 shadow-sm"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold">{approval.totalApprovals}</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm"><p className="text-xs text-gray-500">Approved</p><p className="text-2xl font-bold text-green-600">{approval.approvedCount}</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm"><p className="text-xs text-gray-500">Rejected</p><p className="text-2xl font-bold text-red-600">{approval.rejectedCount}</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-sm"><p className="text-xs text-gray-500">Avg Turnaround</p><p className="text-2xl font-bold text-amber-600">{approval.avgTurnaroundHours}h</p></div>
            </div>
            {approval.monthlyTrend && approval.monthlyTrend.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Approval Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[...approval.monthlyTrend].reverse()}>
                    <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#6366f1" name="Total" radius={[3,3,0,0]} />
                    <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[3,3,0,0]} />
                    <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* SLA Tab */}
        {activeTab === 'sla' && sla && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm"><p className="text-xs text-gray-500">Compliance Rate</p><p className="text-2xl font-bold text-green-600">{sla.complianceRate}%</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm"><p className="text-xs text-gray-500">Breached</p><p className="text-2xl font-bold text-red-600">{sla.breachedInstances}</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm"><p className="text-xs text-gray-500">Total Instances</p><p className="text-2xl font-bold">{sla.totalInstances}</p></div>
            </div>
            {sla.byModule && sla.byModule.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">SLA Compliance by Module</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sla.byModule}>
                    <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#6366f1" name="Total" radius={[3,3,0,0]} />
                    <Bar dataKey="breached" fill="#ef4444" name="Breached" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Escalations Tab */}
        {activeTab === 'escalations' && esc && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border-l-4 border-indigo-500 shadow-sm"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold">{esc.total}</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm"><p className="text-xs text-gray-500">Open</p><p className="text-2xl font-bold text-red-600">{esc.open}</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-sm"><p className="text-xs text-gray-500">Acknowledged</p><p className="text-2xl font-bold text-amber-600">{esc.acknowledged}</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm"><p className="text-xs text-gray-500">Resolved</p><p className="text-2xl font-bold text-green-600">{esc.resolved}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {esc.byLevel && esc.byLevel.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">By Level</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={esc.byLevel}>
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" name="Count" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {esc.byReason && esc.byReason.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">By Reason</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={esc.byReason} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label={({ _id, percent }) => `${_id} ${(percent*100).toFixed(0)}%`}>
                        {esc.byReason.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && auto && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border-l-4 border-indigo-500 shadow-sm"><p className="text-xs text-gray-500">Total Rules</p><p className="text-2xl font-bold">{auto.totalRules}</p><p className="text-xs text-green-600">{auto.activeRules} active</p></div>
              <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm"><p className="text-xs text-gray-500">Total Triggers</p><p className="text-2xl font-bold">{auto.totalTriggers}</p><p className="text-xs text-green-600">{auto.activeTriggers} active</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {auto.rulesByType && auto.rulesByType.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Rules by Type</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={auto.rulesByType}>
                      <XAxis dataKey="_id" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {auto.triggersByType && auto.triggersByType.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Triggers by Type</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={auto.triggersByType} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label={({ _id }) => _id}>
                        {auto.triggersByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            {auto.topFiredTriggers && auto.topFiredTriggers.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Most Fired Triggers</h3>
                <table className="w-full text-sm">
                  <thead><tr>{['Trigger', 'Workflow', 'Type', 'Fire Count'].map(h => <th key={h} className="text-left py-1.5 px-2 text-xs text-gray-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {auto.topFiredTriggers.map(t => (
                      <tr key={t._id} className="hover:bg-gray-50">
                        <td className="py-1.5 px-2 text-xs font-medium text-gray-800">{t.name}</td>
                        <td className="py-1.5 px-2 text-xs text-gray-500">{t.workflow?.name || '-'}</td>
                        <td className="py-1.5 px-2 text-xs"><span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">{t.triggerType}</span></td>
                        <td className="py-1.5 px-2 text-xs font-bold text-indigo-600">{t.fireCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Department Tab */}
        {activeTab === 'department' && dept && (
          <div className="space-y-4">
            {dept.byDept && dept.byDept.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Instances & Approvals by Module</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dept.byDept}>
                    <XAxis dataKey="module" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalInstances" fill="#6366f1" name="Instances" radius={[3,3,0,0]} />
                    <Bar dataKey="pendingApprovals" fill="#f59e0b" name="Pending Approvals" radius={[3,3,0,0]} />
                    <Bar dataKey="completedApprovals" fill="#10b981" name="Completed Approvals" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-center text-gray-400 py-10">No department data available.</p>}
          </div>
        )}

        {activeTab !== 'performance' && !perf && !approval && !sla && !esc && !auto && !dept && (
          <div className="text-center py-10 text-gray-400">Loading analytics…</div>
        )}
      </div>
    </AdminLayout>
  );
}
