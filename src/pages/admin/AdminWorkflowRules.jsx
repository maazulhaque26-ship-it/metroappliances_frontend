import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchWorkflowRules, createWorkflowRule, updateWorkflowRule, deleteWorkflowRule, fetchWorkflows } from '../../services/workflowAPI';

const RULE_TYPES = ['auto_approve', 'auto_reject', 'auto_assign', 'skip_step', 'notify', 'escalate', 'route'];
const OPERATORS = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'not_in', 'between', 'is_null', 'is_not_null'];
const ACTION_TYPES = ['auto_approve', 'auto_reject', 'auto_assign', 'skip_step', 'notify', 'escalate', 'set_field', 'route_to'];

const empty = { name: '', description: '', workflow: '', ruleType: 'notify', priority: 0, isActive: true, conditions: [], actions: [] };

export default function AdminWorkflowRules() {
  const [rules, setRules] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchWorkflowRules().then(r => setRules(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
    fetchWorkflows({ limit: 100 }).then(r => setWorkflows(r.data.data || [])).catch(console.error);
  };

  useEffect(load, []);

  const openModal = (r = null) => {
    setEditing(r);
    setForm(r ? { name: r.name, description: r.description || '', workflow: r.workflow || '', ruleType: r.ruleType, priority: r.priority, isActive: r.isActive, conditions: r.conditions || [], actions: r.actions || [] } : empty);
    setShowModal(true);
  };

  const addCondition = () => setForm(p => ({ ...p, conditions: [...p.conditions, { field: '', operator: 'equals', value: '', logicalOperator: 'AND' }] }));
  const updateCond = (idx, k, v) => setForm(p => { const c = [...p.conditions]; c[idx] = { ...c[idx], [k]: v }; return { ...p, conditions: c }; });
  const removeCond = (idx) => setForm(p => ({ ...p, conditions: p.conditions.filter((_, i) => i !== idx) }));

  const addAction = () => setForm(p => ({ ...p, actions: [...p.actions, { type: 'notify', config: {} }] }));
  const removeAction = (idx) => setForm(p => ({ ...p, actions: p.actions.filter((_, i) => i !== idx) }));

  const save = async () => {
    try {
      if (editing) await updateWorkflowRule(editing._id, form);
      else await createWorkflowRule(form);
      setShowModal(false);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete rule?')) return;
    await deleteWorkflowRule(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Workflow Rules</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Rule</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <p className="text-gray-400 col-span-3 text-center py-8">Loading…</p>
            : rules.length === 0 ? <p className="text-gray-400 col-span-3 text-center py-8">No rules yet.</p>
              : rules.map(r => (
                <div key={r._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.ruleCode}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs mb-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{r.ruleType}</span>
                    <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded">Priority {r.priority}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{r.conditions?.length || 0} conditions · {r.actions?.length || 0} actions · Fired {r.fireCount || 0}×</p>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(r)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(r._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Rule' : 'New Rule'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Rule Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <select value={form.workflow} onChange={e => setForm(p => ({ ...p, workflow: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">All Workflows (Global Rule)</option>
                {workflows.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.ruleType} onChange={e => setForm(p => ({ ...p, ruleType: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                  {RULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="number" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: +e.target.value }))} placeholder="Priority" className="border rounded-lg px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />Active</label>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Conditions</p>
                  <button onClick={addCondition} className="text-xs text-indigo-600 hover:underline">+ Add</button>
                </div>
                {form.conditions.map((c, idx) => (
                  <div key={idx} className="flex gap-1 items-center mb-2">
                    <input value={c.field} onChange={e => updateCond(idx, 'field', e.target.value)} placeholder="field" className="flex-1 border rounded px-2 py-1 text-xs" />
                    <select value={c.operator} onChange={e => updateCond(idx, 'operator', e.target.value)} className="border rounded px-2 py-1 text-xs">
                      {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <input value={c.value} onChange={e => updateCond(idx, 'value', e.target.value)} placeholder="value" className="flex-1 border rounded px-2 py-1 text-xs" />
                    <button onClick={() => removeCond(idx)} className="text-red-400 text-xs hover:text-red-600">×</button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Actions</p>
                  <button onClick={addAction} className="text-xs text-indigo-600 hover:underline">+ Add</button>
                </div>
                {form.actions.map((a, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <select value={a.type} onChange={e => { const actions = [...form.actions]; actions[idx] = { ...actions[idx], type: e.target.value }; setForm(p => ({ ...p, actions })); }} className="border rounded px-2 py-1 text-xs flex-1">
                      {ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => removeAction(idx)} className="text-red-400 text-xs hover:text-red-600">×</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
