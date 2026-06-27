import React, { useEffect, useState, useCallback } from 'react';
import { FiRefreshCw, FiPlus } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Pagination from '../../components/shared/Pagination';
import { fetchLeaveBalances, upsertLeaveBalance, fetchLeaveTypes } from '../../services/attendanceAPI';

const BLANK = { employee: '', leaveType: '', year: new Date().getFullYear(), openingBalance: 0, accrued: 0 };

export default function AdminLeaveBalances() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const load = useCallback(() => {
    setLoading(true);
    fetchLeaveBalances({ page, limit: 25, year: yearFilter })
      .then(r => { setItems(r.data.data); setTotal(r.data.pagination?.total || 0); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, yearFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetchLeaveTypes().then(r => setLeaveTypes(r.data.data)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await upsertLeaveBalance(form);
      setModal(false); load();
    } catch (e) {
      alert(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Balances</h1>
            <p className="text-sm text-gray-500 mt-1">{total} records</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={yearFilter} onChange={e => { setYearFilter(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={load} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><FiRefreshCw size={14} /></button>
            <button onClick={() => { setForm(BLANK); setModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              <FiPlus size={14} /> Add Balance
            </button>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Employee','Leave Type','Year','Opening','Accrued','Taken','Pending','Encashed','Closing Balance'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No balances found</td></tr>
                  ) : items.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {b.employee?.displayName}<br/>
                        <span className="text-xs text-gray-400">{b.employee?.employeeCode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {b.leaveType?.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.leaveType.color }} />}
                          {b.leaveType?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{b.year}</td>
                      <td className="px-4 py-3 text-gray-600">{b.openingBalance}</td>
                      <td className="px-4 py-3 text-gray-600">{b.accrued}</td>
                      <td className="px-4 py-3 text-gray-600">{b.taken}</td>
                      <td className="px-4 py-3 text-yellow-600">{b.pending || 0}</td>
                      <td className="px-4 py-3 text-gray-600">{b.encashed || 0}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-700">{b.closingBalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination page={page} total={total} limit={25} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Add / Update Leave Balance</h2>
            <div className="space-y-3">
              {[
                { label: 'Employee ID', key: 'employee', type: 'text', placeholder: 'MongoDB ObjectId' },
                { label: 'Year', key: 'year', type: 'number' },
                { label: 'Opening Balance (days)', key: 'openingBalance', type: 'number' },
                { label: 'Accrued (days)', key: 'accrued', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600">{f.label}</label>
                  <input type={f.type} value={form[f.key] ?? ''} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600">Leave Type</label>
                <select value={form.leaveType} onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select leave type</option>
                  {leaveTypes.map(lt => <option key={lt._id} value={lt._id}>{lt.name} ({lt.code})</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
