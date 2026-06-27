import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Pagination from '../../components/shared/Pagination';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import {
  fetchAttendancePolicies, createAttendancePolicy,
  updateAttendancePolicy, deleteAttendancePolicy,
} from '../../services/attendanceAPI';

const BLANK = {
  name: '', shiftStartTime: '09:00', shiftEndTime: '18:00',
  workingHoursPerDay: 8, workingDaysPerWeek: 5, graceMinutes: 15,
  lateMarkAfterMins: 30, halfDayAfterMins: 240, isDefault: false, isActive: true,
};

export default function AdminAttendancePolicies() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAttendancePolicies({ page, limit: 20 })
      .then(r => { setItems(r.data.data); setTotal(r.data.pagination?.total || 0); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(BLANK); setModal('create'); };
  const openEdit   = (p)  => { setForm({ ...p }); setModal('edit'); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await createAttendancePolicy(form);
      else await updateAttendancePolicy(form._id, form);
      setModal(null);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    try {
      await deleteAttendancePolicy(delTarget._id);
      setDelTarget(null);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Policies</h1>
            <p className="text-sm text-gray-500 mt-1">{total} policies</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"><FiRefreshCw size={14} /></button>
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              <FiPlus size={14} /> New Policy
            </button>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Code','Name','Shift','Working Hrs/Day','Working Days/Wk','Grace (min)','Default','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No policies yet</td></tr>
                  ) : items.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.policyCode}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.shiftStartTime} – {p.shiftEndTime}</td>
                      <td className="px-4 py-3 text-gray-600">{p.workingHoursPerDay}h</td>
                      <td className="px-4 py-3 text-gray-600">{p.workingDaysPerWeek}</td>
                      <td className="px-4 py-3 text-gray-600">{p.graceMinutes}m</td>
                      <td className="px-4 py-3">
                        {p.isDefault ? <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Default</span> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${p.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><FiEdit2 size={13} /></button>
                          {!p.isDefault && (
                            <button onClick={() => setDelTarget(p)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><FiTrash2 size={13} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination page={page} total={total} limit={20} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">{modal === 'create' ? 'New Attendance Policy' : 'Edit Policy'}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Policy Name', key: 'name', type: 'text', full: true },
                { label: 'Shift Start', key: 'shiftStartTime', type: 'time' },
                { label: 'Shift End', key: 'shiftEndTime', type: 'time' },
                { label: 'Work Hrs/Day', key: 'workingHoursPerDay', type: 'number' },
                { label: 'Work Days/Week', key: 'workingDaysPerWeek', type: 'number' },
                { label: 'Grace (min)', key: 'graceMinutes', type: 'number' },
                { label: 'Late After (min)', key: 'lateMarkAfterMins', type: 'number' },
                { label: 'Half Day After (min)', key: 'halfDayAfterMins', type: 'number' },
              ].map(f => (
                <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                  <label className="text-xs font-medium text-gray-600">{f.label}</label>
                  <input type={f.type} value={form[f.key] ?? ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
                  Set as Default
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delTarget && (
        <ConfirmDialog
          title="Delete Policy"
          message={`Delete policy "${delTarget.name}"?`}
          confirmLabel="Delete"
          confirmClassName="bg-red-600 hover:bg-red-700"
          onConfirm={doDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
