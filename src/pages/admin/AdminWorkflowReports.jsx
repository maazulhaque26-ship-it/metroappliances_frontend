import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchBPMDashboard, fetchSLACompliance, fetchEscalationReport, fetchAutomationReport, fetchApprovalAnalytics } from '../../services/workflowAPI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminWorkflowReports() {
  const [activeTab, setActiveTab] = useState('summary');
  const [dashboard, setDashboard] = useState(null);
  const [sla, setSLA] = useState(null);
  const [esc, setEsc] = useState(null);
  const [auto, setAuto] = useState(null);
  const [approval, setApproval] = useState(null);

  useEffect(() => {
    fetchBPMDashboard().then(r => setDashboard(r.data.data)).catch(console.error);
    fetchSLACompliance().then(r => setSLA(r.data.data)).catch(console.error);
    fetchEscalationReport().then(r => setEsc(r.data.data)).catch(console.error);
    fetchAutomationReport().then(r => setAuto(r.data.data)).catch(console.error);
    fetchApprovalAnalytics().then(r => setApproval(r.data.data)).catch(console.error);
  }, []);

  const tabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'sla', label: 'SLA Report' },
    { key: 'escalation', label: 'Escalation Report' },
    { key: 'automation', label: 'Automation Report' },
    { key: 'approval', label: 'Approval Report' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">BPM Reports</h1>
        </div>

        <div className="flex gap-1 flex-wrap border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        {activeTab === 'summary' && dashboard && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Completion Rate', value: `${dashboard.completionRate}%`, border: 'border-green-500' },
                { label: 'Total Instances', value: dashboard.totalInstances, border: 'border-indigo-500' },
                { label: 'Pending Approvals', value: dashboard.pendingApprovals, border: 'border-amber-500' },
                { label: 'SLA Breaches', value: dashboard.slaBreachedInstances, border: 'border-red-500' },
              ].map(k => (
                <div key={k.label} className={`bg-white rounded-xl p-4 border-l-4 ${k.border} shadow-sm`}>
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {dashboard.byModule && dashboard.byModule.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Workflows by Module</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dashboard.byModule}>
                      <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {dashboard.byPriority && dashboard.byPriority.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Instances by Priority</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={dashboard.byPriority} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label={({ _id }) => _id}>
                        {dashboard.byPriority.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SLA Report */}
        {activeTab === 'sla' && sla && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50"><h3 className="text-sm font-semibold text-gray-700">SLA Compliance Report</h3></div>
              <div className="p-4 grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-3xl font-bold text-green-600">{sla.complianceRate}%</p><p className="text-xs text-gray-500 mt-1">Compliance Rate</p></div>
                <div className="text-center"><p className="text-3xl font-bold text-red-600">{sla.breachedInstances}</p><p className="text-xs text-gray-500 mt-1">Breached Instances</p></div>
                <div className="text-center"><p className="text-3xl font-bold text-gray-800">{sla.totalInstances}</p><p className="text-xs text-gray-500 mt-1">Total Instances</p></div>
              </div>
            </div>
            {sla.byModule && sla.byModule.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">SLA by Module</h3>
                <table className="w-full text-sm">
                  <thead><tr>{['Module', 'Total', 'Breached', 'Compliance %'].map(h => <th key={h} className="text-left px-3 py-2 text-xs text-gray-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {sla.byModule.map(m => (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-800 capitalize">{m._id}</td>
                        <td className="px-3 py-2 text-sm">{m.total}</td>
                        <td className="px-3 py-2 text-sm text-red-600">{m.breached}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-green-500" style={{ width: `${m.complianceRate?.toFixed(0) || 100}%` }} /></div>
                            <span className="text-xs font-medium text-gray-700">{m.complianceRate?.toFixed(1) || 100}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Escalation Report */}
        {activeTab === 'escalation' && esc && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total', value: esc.total, color: 'border-indigo-500' },
                { label: 'Open', value: esc.open, color: 'border-red-500' },
                { label: 'Acknowledged', value: esc.acknowledged, color: 'border-amber-500' },
                { label: 'Resolved', value: esc.resolved, color: 'border-green-500' },
              ].map(k => (
                <div key={k.label} className={`bg-white rounded-xl p-4 border-l-4 ${k.color} shadow-sm`}>
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {esc.byModule && esc.byModule.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">By Module</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={esc.byModule}>
                      <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {esc.byLevel && esc.byLevel.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">By Level</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={esc.byLevel}>
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Automation Report */}
        {activeTab === 'automation' && auto && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Rules', value: auto.totalRules, sub: `${auto.activeRules} active`, color: 'border-indigo-500' },
                { label: 'Total Triggers', value: auto.totalTriggers, sub: `${auto.activeTriggers} active`, color: 'border-purple-500' },
              ].map(k => (
                <div key={k.label} className={`bg-white rounded-xl p-4 border-l-4 ${k.color} shadow-sm`}>
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{k.value}</p>
                  {k.sub && <p className="text-xs text-green-600">{k.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Report */}
        {activeTab === 'approval' && approval && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total', value: approval.totalApprovals, color: 'border-indigo-500' },
                { label: 'Approval Rate', value: `${approval.approvalRate}%`, color: 'border-green-500' },
                { label: 'Avg Turnaround', value: `${approval.avgTurnaroundHours}h`, color: 'border-amber-500' },
                { label: 'Delegated', value: approval.delegatedCount, color: 'border-purple-500' },
              ].map(k => (
                <div key={k.label} className={`bg-white rounded-xl p-4 border-l-4 ${k.color} shadow-sm`}>
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{k.value}</p>
                </div>
              ))}
            </div>
            {approval.byApprover && approval.byApprover.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Approvers</h3>
                <table className="w-full text-sm">
                  <thead><tr>{['Approver', 'Total', 'Approved', 'Rejected', 'Avg Hours'].map(h => <th key={h} className="text-left px-3 py-2 text-xs text-gray-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {approval.byApprover.map(a => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-800">{a.approverName || '-'}</td>
                        <td className="px-3 py-2 text-sm">{a.total}</td>
                        <td className="px-3 py-2 text-sm text-green-600">{a.approved}</td>
                        <td className="px-3 py-2 text-sm text-red-500">{a.rejected}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{a.avgHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
