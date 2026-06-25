import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { fetchLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../../services/attendanceAPI';

const BLANK = {
  code: '', name: '', description: '', isPaid: true, isCarryForward: false,
  maxCarryForward: 0, allowHalfDay: true, requireApproval: true, requireDocuments: false,
  noticeDaysRequired: 0, gender: 'all', encashable: false, maxEncashableDays: 0,
  color: '#4F46E5', isActive: true,
};

export default function AdminLeaveTypes() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchLeaveTypes()
      .then(r => setItems(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.code || !form.name) return alert('Code and Name are required');
    setSaving(true);
    try {
      if (modal === 'create') await createLeaveType(form);
      else await updateLeaveType(form._id, form);
      setModal(null);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await deleteLeaveType(delTarget._id);
      setDelTarget(null); load();
    } catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const field = (key, type = 'text', label) => (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input type={type} value={form[key] ?? ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Types</h1>
            <p className="text-sm text-gray-500 mt-1">{items.length} types</p>
          </div>
          <button onClick={() => { setForm(BLANK); setModal('create'); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <FiPlus size={14} /> New Leave Type
          </button>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">No leave types yet</div>
            ) : items.map(lt => (
              <div key={lt._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: lt.color || '#4F46E5' }} />
                    <div>
                      <p className="font-semibold text-gray-900">{lt.name}</p>
                      <p className="text-xs text-gray-400">{lt.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setForm({ ...lt }); setModal('edit'); }} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><FiEdit2 size={13} /></button>
                    <button onClick={() => setDelTarget(lt)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><FiTrash2 size={13} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${lt.isPaid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {lt.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  {lt.isCarryForward && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Carry Fwd: {lt.maxCarryForward}d</span>}
                  {lt.allowHalfDay  && <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Half Day</span>}
                  {lt.encashable    && <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Encashable</span>}
                  {lt.requireDocuments && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">Docs Required</span>}
                  {lt.gender !== 'all' && <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 capitalize">{lt.gender} only</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">{modal === 'create' ? 'New Leave Type' : 'Edit Leave Type'}</h2>
            <div className="grid grid-cols-2 gap-3">
              {field('code', 'text', 'Code (e.g. AL, SL, CL)')}
              {field('name', 'text', 'Name')}
              <div className="col-span-2">{field('description', 'text', 'Description')}</div>
              {field('noticeDaysRequired', 'number', 'Notice Days Required')}
              {field('maxCarryForward', 'number', 'Max Carry Forward Days')}
              {field('maxEncashableDays', 'number', 'Max Encashable Days')}
              <div>
                <label className="text-xs font-medium text-gray-600">Gender</label>
                <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Color</label>
                <input type="color" value={form.color || '#4F46E5'} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  className="mt-1 w-full h-9 border border-gray-300 rounded-lg px-1" />
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-3">
                {[
                  ['isPaid','Paid'],['isCarryForward','Carry Forward'],['allowHalfDay','Allow Half Day'],
                  ['requireApproval','Require Approval'],['requireDocuments','Require Docs'],
                  ['encashable','Encashable'],['isActive','Active'],
                ].map(([key, lbl]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={!!form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
                    {lbl}
                  </label>
                ))}
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
          title="Delete Leave Type"
          message={`Delete leave type "${delTarget.name}"?`}
          confirmLabel="Delete"
          confirmClassName="bg-red-600 hover:bg-red-700"
          onConfirm={doDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
