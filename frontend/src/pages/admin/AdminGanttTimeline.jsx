import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { FiCalendar } from 'react-icons/fi';
import { fetchTasks, fetchMilestones } from '../../services/projectAPI';

const STATUS_COLORS = {
  todo: '#6b7280', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981', cancelled: '#ef4444',
};

function ProgressBar({ pct, color }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">{Math.round(pct)}%</span>
    </div>
  );
}

export default function AdminGanttTimeline() {
  const { id: projectId } = useParams();
  const [tasks, setTasks]   = useState([]);
  const [miles, setMiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([fetchTasks(projectId), fetchMilestones(projectId)])
      .then(([t, m]) => {
        setTasks(t.data.data || t.data || []);
        setMiles(m.data.data || m.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const today = new Date();
  const minDate = (() => {
    const dates = tasks.filter(t => t.startDate).map(t => new Date(t.startDate));
    return dates.length ? new Date(Math.min(...dates)) : new Date(today.getFullYear(), today.getMonth(), 1);
  })();
  const maxDate = (() => {
    const dates = tasks.filter(t => t.dueDate).map(t => new Date(t.dueDate));
    return dates.length ? new Date(Math.max(...dates)) : new Date(today.getFullYear(), today.getMonth() + 3, 1);
  })();
  const totalDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));

  const getBarStyle = (start, end) => {
    if (!start) return { display: 'none' };
    const s = new Date(start);
    const e = end ? new Date(end) : new Date(s.getTime() + 7 * 24 * 60 * 60 * 1000);
    const left = Math.max(0, (s - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
    const width = Math.max(1, (e - s) / (1000 * 60 * 60 * 24)) / totalDays * 100;
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gantt Timeline</h1>
            <p className="text-sm text-gray-500 mt-1">Project task schedule</p>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-10">Loading...</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[300px_1fr] border-b border-gray-200">
              <div className="px-4 py-3 font-semibold text-xs text-gray-500 uppercase bg-gray-50">Task</div>
              <div className="px-4 py-3 font-semibold text-xs text-gray-500 uppercase bg-gray-50 relative">
                Timeline ({minDate.toLocaleDateString()} – {maxDate.toLocaleDateString()})
              </div>
            </div>

            {/* Milestones */}
            {miles.filter(m => m.dueDate).map(m => {
              const pos = ((new Date(m.dueDate) - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
              return (
                <div key={m._id} className="grid grid-cols-[300px_1fr] border-b border-gray-100 hover:bg-gray-50">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <FiCalendar size={14} className="text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">{m.name}</span>
                    <span className="text-xs text-gray-400">Milestone</span>
                  </div>
                  <div className="relative h-8">
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-orange-500 rotate-45"
                      style={{ left: `${Math.max(0, Math.min(pos, 99))}%` }}
                      title={new Date(m.dueDate).toLocaleDateString()}
                    />
                  </div>
                </div>
              );
            })}

            {/* Tasks */}
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No tasks to display.</div>
            ) : filtered.map(task => (
              <div key={task._id} className="grid grid-cols-[300px_1fr] border-b border-gray-100 hover:bg-gray-50">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400">{task.taskCode} · {task.assignee?.name || 'Unassigned'}</p>
                </div>
                <div className="relative h-10 flex items-center px-2">
                  {task.startDate || task.dueDate ? (
                    <div
                      className="absolute h-6 rounded-full flex items-center px-2"
                      style={{ ...getBarStyle(task.startDate || task.dueDate, task.dueDate), backgroundColor: STATUS_COLORS[task.status] || '#6b7280' }}
                      title={`${task.startDate ? new Date(task.startDate).toLocaleDateString() : '—'} → ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}`}
                    >
                      <span className="text-white text-xs truncate">{task.estimatedHours ? `${task.estimatedHours}h` : ''}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300 px-2">No dates set</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress Summary */}
        <div className="mt-4 grid grid-cols-5 gap-3">
          {['todo', 'in_progress', 'review', 'done', 'cancelled'].map(s => {
            const count = tasks.filter(t => t.status === s).length;
            const pct = tasks.length ? (count / tasks.length) * 100 : 0;
            return (
              <div key={s} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-lg font-bold" style={{ color: STATUS_COLORS[s] }}>{count}</div>
                <div className="text-xs text-gray-500 capitalize mt-1">{s.replace('_', ' ')}</div>
                <div className="mt-1">
                  <ProgressBar pct={pct} color={STATUS_COLORS[s]} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
