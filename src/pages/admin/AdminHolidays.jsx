import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import Pagination from '../../components/shared/Pagination';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday } from '../../services/attendanceAPI';

const BLANK = { name: '', date: '', holidayType: 'company', isOptional: false, description: '', applicableTo: 'all' };
const TYPE_COLORS = { national: 'text-red-700 bg-red-100', regional: 'text-orange-700 bg-orange-100', optional: 'text-blue-700 bg-blue-100', restricted: 'text-yellow-700 bg-yellow-100', company: 'text-indigo-700 bg-indigo-100' };

export default function AdminHolidays() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const load = useCallback(() => {
    setLoading(true);
    fetchHolidays({ page, limit: 30, year: yearFilter })
      .then(r => { setItems(r.data.data); setTotal(r.data.pagination?.total || 0); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, yearFilter]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name || !form.date) return alert('Name and Date are required');
    setSaving(true);
    try {
      if (modal === 'create') await createHoliday(form);
      else await updateHoliday(form._id, form);
      setModal(null); load();
    } catch (e) {
      alert(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const doDelete = async () => {
    try { await deleteHoliday(delTarget._id); setDelTarget(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Holidays</h1>
            <p className="text-sm text-gray-500 mt-1">{total} holidays</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={yearFilter} onChange={e => { setYearFilter(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={() => { setForm(BLANK); setModal('create'); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              <FiPlus size={14} /> Add Holiday
            </button>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Code','Name','Date','Day','Type','Optional','Description','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No holidays yet</td></tr>
                  ) : items.map(h => (
                    <tr key={h._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{h.holidayCode}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <span className="flex items-center gap-2"><FiCalendar size={13} className="text-gray-400" />{h.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(h.date).toLocaleDateString('en-IN', { weekday: 'long' })}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[h.holidayType] || 'bg-gray-100 text-gray-600'}`}>
                          {h.holidayType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{h.isOptional ? '✓' : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">{h.description || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setForm({ ...h, date: h.date?.slice(0,10) }); setModal('edit'); }} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><FiEdit2 size={13} /></button>
                          <button onClick={() => setDelTarget(h)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><FiTrash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination page={page} total={total} limit={30} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">{modal === 'create' ? 'Add Holiday' : 'Edit Holiday'}</h2>
            <div className="space-y-3">
              {[
                { label: 'Holiday Name', key: 'name', type: 'text' },
                { label: 'Date', key: 'date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600">{f.label}</label>
                  <input type={f.type} value={form[f.key] ?? ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600">Type</label>
                <select value={form.holidayType} onChange={e => setForm(p => ({ ...p, holidayType: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {['national','regional','optional','restricted','company'].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Description</label>
                <input type="text" value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={!!form.isOptional} onChange={e => setForm(p => ({ ...p, isOptional: e.target.checked }))} />
                Optional Holiday
              </label>
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
          title="Delete Holiday"
          message={`Delete "${delTarget.name}"?`}
          confirmLabel="Delete"
          confirmClassName="bg-red-600 hover:bg-red-700"
          onConfirm={doDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
