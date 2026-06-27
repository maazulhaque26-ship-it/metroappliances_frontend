import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { FiArrowLeft, FiLayout, FiFlag, FiUsers, FiDollarSign, FiList } from 'react-icons/fi';
import {
  fetchProject, fetchTasks, fetchMilestones, fetchMembers,
  fetchProjectBudget, fetchProjectCosts, updateProjectStatus,
} from '../../services/projectAPI';

const STATUS_COLORS = {
  planning: 'bg-gray-100 text-gray-700', active: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-yellow-100 text-yellow-800', completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};
const TASK_COLORS = {
  todo: 'bg-gray-100 text-gray-600', in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700', done: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [miles, setMiles]     = useState([]);
  const [members, setMembers] = useState([]);
  const [budget, setBudget]   = useState(null);
  const [costs, setCosts]     = useState([]);
  const [tab, setTab]         = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProject(id),
      fetchTasks(id),
      fetchMilestones(id),
      fetchMembers(id),
      fetchProjectBudget(id),
      fetchProjectCosts(id),
    ]).then(([p, t, m, mem, b, c]) => {
      setProject(p.data.data || p.data);
      setTasks((t.data.data || t.data || []));
      setMiles((m.data.data || m.data || []));
      setMembers(mem.data.data || mem.data || []);
      setBudget(b.data.data || b.data || null);
      setCosts(c.data.data || c.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const totalCost = costs.reduce((s, c) => s + (c.amount || 0), 0);

  const TABS = [
    { key: 'overview', label: 'Overview', icon: FiLayout },
    { key: 'tasks',    label: 'Tasks',    icon: FiList },
    { key: 'milestones', label: 'Milestones', icon: FiFlag },
    { key: 'members',  label: 'Members',  icon: FiUsers },
    { key: 'budget',   label: 'Budget',   icon: FiDollarSign },
  ];

  if (loading) return <AdminLayout><div className="p-8 text-gray-400 text-center">Loading project...</div></AdminLayout>;
  if (!project) return <AdminLayout><div className="p-8 text-red-500 text-center">Project not found.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/projects" className="text-gray-400 hover:text-gray-600"><FiArrowLeft size={20} /></Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status] || 'bg-gray-100'}`}>{project.status}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{project.projectCode} · {project.type}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Completion</div>
            <div className="text-xl font-bold text-orange-500">{project.completionPercent || 0}%</div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">Project Info</h3>
              {[
                ['Manager', project.projectManager?.name || '—'],
                ['Client', project.client || '—'],
                ['Priority', project.priority],
                ['Start Date', project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'],
                ['End Date', project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'],
                ['Budget', project.budget ? `₹${project.budget?.toLocaleString()}` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600">{project.description || 'No description provided.'}</p>
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Code', 'Title', 'Assignee', 'Priority', 'Status', 'Due'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No tasks found.</td></tr>
                ) : tasks.map(t => (
                  <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.taskCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                    <td className="px-4 py-3 text-gray-600">{t.assignee?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{t.priority}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TASK_COLORS[t.status] || 'bg-gray-100'}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'milestones' && (
          <div className="space-y-3">
            {miles.length === 0 ? <p className="text-gray-400 text-center py-10">No milestones.</p> : miles.map(m => (
              <div key={m._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.milestoneCode} · Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '—'}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-700'}`}>{m.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'members' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Employee', 'Role', 'Allocation', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No members.</td></tr>
                ) : members.map(m => (
                  <tr key={m._id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">{m.employee?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{m.role?.name || '—'}</td>
                    <td className="px-4 py-3"><span className="text-sm font-medium">{m.allocation}%</span></td>
                    <td className="px-4 py-3 text-gray-500">{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'budget' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Budget Allocation</h3>
              {budget ? (
                <div className="space-y-3">
                  {[['Total Budget', budget.totalBudget], ['Labor', budget.laborBudget], ['Material', budget.materialBudget], ['Overhead', budget.overheadBudget], ['Contingency', budget.contingencyBudget]].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium">₹{(v || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Actual Spent</span>
                    <span className={`font-bold ${totalCost > budget.totalBudget ? 'text-red-600' : 'text-green-600'}`}>₹{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              ) : <p className="text-gray-400 text-sm">No budget set.</p>}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Costs</h3>
              <div className="space-y-2">
                {costs.slice(0, 8).map(c => (
                  <div key={c._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{c.description}</span>
                    <span className="font-medium">₹{(c.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
                {costs.length === 0 && <p className="text-gray-400 text-sm">No costs recorded.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
