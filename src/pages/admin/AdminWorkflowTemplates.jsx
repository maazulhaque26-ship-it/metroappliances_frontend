import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchWorkflowTemplates, createWorkflowTemplate, updateWorkflowTemplate, deleteWorkflowTemplate } from '../../services/workflowAPI';

const MODULES = ['hr', 'procurement', 'finance', 'projects', 'manufacturing', 'service', 'inventory', 'general'];
const CATEGORIES = ['approval', 'onboarding', 'offboarding', 'purchase', 'expense', 'leave', 'recruitment', 'quality', 'maintenance', 'change_request', 'general'];
const STEP_TYPES = ['approval', 'task', 'notification', 'condition', 'auto', 'parallel', 'review'];

const empty = { name: '', description: '', module: 'hr', category: 'approval', isPublic: true, defaultSteps: [] };

export default function AdminWorkflowTemplates() {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filterModule, setFilterModule] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchWorkflowTemplates({ module: filterModule || undefined })
      .then(r => setTemplates(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterModule]);

  const openModal = (t = null) => {
    setEditing(t);
    setForm(t ? { name: t.name, description: t.description || '', module: t.module, category: t.category, isPublic: t.isPublic, defaultSteps: t.defaultSteps || [] } : empty);
    setShowModal(true);
  };

  const addStep = () => {
    setForm(p => ({
      ...p,
      defaultSteps: [...p.defaultSteps, { name: '', stepOrder: p.defaultSteps.length + 1, stepType: 'approval', slaHours: 24 }],
    }));
  };

  const updateStep = (idx, field, val) => {
    setForm(p => {
      const steps = [...p.defaultSteps];
      steps[idx] = { ...steps[idx], [field]: val };
      return { ...p, defaultSteps: steps };
    });
  };

  const removeStep = (idx) => {
    setForm(p => ({ ...p, defaultSteps: p.defaultSteps.filter((_, i) => i !== idx) }));
  };

  const save = async () => {
    try {
      if (editing) await updateWorkflowTemplate(editing._id, form);
      else await createWorkflowTemplate(form);
      setShowModal(false);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    await deleteWorkflowTemplate(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Workflow Templates</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Template</button>
        </div>

        <div className="flex gap-2">
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">All Modules</option>
            {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {loading ? <p className="text-center text-gray-400 py-10">Loading…</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{t.templateCode}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                {t.description && <p className="text-xs text-gray-500 mb-2">{t.description}</p>}
                <div className="flex gap-2 text-xs mb-3">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{t.module}</span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{t.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{t.defaultSteps?.length || 0} steps · Used {t.usageCount || 0}×</span>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(t)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && templates.length === 0 && (
              <p className="col-span-3 text-center text-gray-400 py-10">No templates yet.</p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Template' : 'New Template'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Template Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                  {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} />
                Public Template
              </label>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Default Steps</p>
                  <button onClick={addStep} className="text-xs text-indigo-600 hover:underline">+ Add Step</button>
                </div>
                {form.defaultSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
                    <input value={step.name} onChange={e => updateStep(idx, 'name', e.target.value)} placeholder="Step name" className="flex-1 border rounded px-2 py-1 text-xs" />
                    <select value={step.stepType} onChange={e => updateStep(idx, 'stepType', e.target.value)} className="border rounded px-2 py-1 text-xs">
                      {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="number" value={step.slaHours} onChange={e => updateStep(idx, 'slaHours', +e.target.value)} placeholder="SLA h" className="w-14 border rounded px-2 py-1 text-xs" />
                    <button onClick={() => removeStep(idx)} className="text-red-400 text-xs hover:text-red-600">×</button>
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
