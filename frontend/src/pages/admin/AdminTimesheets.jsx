import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiPlus, FiClock, FiCheckCircle, FiSend } from 'react-icons/fi';
import { fetchTimesheets, createTimesheet, submitTimesheet, approveTimesheet } from '../../services/projectAPI';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600', submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
};
const BLANK = { weekStart: '', weekEnd: '' };

export default function AdminTimesheets() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchTimesheets('all', filter !== 'all' ? { status: filter } : {})
      .then(r => setItems(r.data.data || r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createTimesheet('all', form); setModal(false); load(); } catch (_) {} finally { setSaving(false); }
  };

  const handleSubmit = async (id) => {
    try { await submitTimesheet(id); load(); } catch (_) {}
  };

  const handleApprove = async (id) => {
    try { await approveTimesheet(id); load(); } catch (_) {}
  };

  const totalHours = items.reduce((s, i) => s + (i.totalHours || 0), 0);
  const billableHours = items.reduce((s, i) => s + (i.billableHours || 0), 0);
  const pendingCount = items.filter(i => i.status === 'submitted').length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
            <p className="text-sm text-gray-500 mt-1">Employee time tracking and approvals</p>
          </div>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <FiPlus size={16} /> New Timesheet
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Hours', value: totalHours.toFixed(1), icon: FiClock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Billable Hours', value: billableHours.toFixed(1), icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending Approval', value: pendingCount, icon: FiSend, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(card => (
            <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <div className={`${card.bg} p-3 rounded-lg`}><card.icon className={card.color} size={20} /></div>
              <div>
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-sm text-gray-500">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'draft', 'submitted', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <p className="text-gray-400 text-center py-10">Loading...</p> : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Code', 'Employee', 'Week', 'Total Hrs', 'Billable Hrs', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No timesheets found.</td></tr>
                ) : items.map(ts => (
                  <tr key={ts._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{ts.timesheetCode}</td>
                    <td className="px-4 py-3 font-medium">{ts.employee?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{ts.weekStart ? new Date(ts.weekStart).toLocaleDateString() : '—'} – {ts.weekEnd ? new Date(ts.weekEnd).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{ts.totalHours || 0}h</td>
                    <td className="px-4 py-3 text-gray-600">{ts.billableHours || 0}h</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[ts.status] || 'bg-gray-100'}`}>{ts.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {ts.status === 'draft' && (
                          <button onClick={() => handleSubmit(ts._id)} className="text-xs text-blue-600 hover:underline">Submit</button>
                        )}
                        {ts.status === 'submitted' && (
                          <button onClick={() => handleApprove(ts._id)} className="text-xs text-green-600 hover:underline">Approve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">New Timesheet</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Week Start *</label>
                  <input type="date" value={form.weekStart} onChange={e => setForm(f => ({ ...f, weekStart: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Week End *</label>
                  <input type="date" value={form.weekEnd} onChange={e => setForm(f => ({ ...f, weekEnd: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
