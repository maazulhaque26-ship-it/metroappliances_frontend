import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, activateWorkflow, deactivateWorkflow,
  fetchWorkflowSteps, createWorkflowStep, updateWorkflowStep, deleteWorkflowStep,
  fetchWorkflowTemplates,
} from '../../services/workflowAPI';

const MODULES = ['hr', 'procurement', 'finance', 'projects', 'manufacturing', 'service', 'inventory', 'general'];
const CATEGORIES = ['approval', 'onboarding', 'offboarding', 'purchase', 'expense', 'leave', 'recruitment', 'quality', 'maintenance', 'change_request', 'general'];
const STEP_TYPES = ['approval', 'task', 'notification', 'condition', 'auto', 'parallel', 'review'];
const ASSIGNEE_TYPES = ['user', 'role', 'department', 'manager', 'initiator', 'dynamic'];
const APPROVAL_MODES = ['sequential', 'parallel', 'any_one', 'majority'];

const statusBadge = (s) => {
  const map = { draft: 'bg-gray-100 text-gray-600', active: 'bg-green-100 text-green-700', inactive: 'bg-amber-100 text-amber-700', archived: 'bg-red-100 text-red-600' };
  return `text-xs px-2 py-0.5 rounded-full font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`;
};

export default function AdminWorkflowDesigner() {
  const [workflows, setWorkflows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [steps, setSteps] = useState([]);
  const [showWFModal, setShowWFModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingWF, setEditingWF] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [wfForm, setWfForm] = useState({ name: '', description: '', module: 'hr', category: 'approval' });
  const [stepForm, setStepForm] = useState({ name: '', stepOrder: 1, stepType: 'approval', assigneeType: 'role', approvalMode: 'sequential', slaHours: 24, escalateAfterHours: 48 });
  const [filterModule, setFilterModule] = useState('');
  const [loading, setLoading] = useState(false);

  const loadWorkflows = useCallback(() => {
    setLoading(true);
    fetchWorkflows({ module: filterModule || undefined })
      .then(r => setWorkflows(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterModule]);

  useEffect(() => { loadWorkflows(); }, [loadWorkflows]);

  const loadSteps = (wfId) => {
    fetchWorkflowSteps(wfId).then(r => setSteps(r.data.data || [])).catch(console.error);
  };

  const selectWorkflow = (wf) => {
    setSelected(wf);
    loadSteps(wf._id);
  };

  const saveWorkflow = async () => {
    try {
      if (editingWF) await updateWorkflow(editingWF._id, wfForm);
      else await createWorkflow(wfForm);
      setShowWFModal(false);
      setEditingWF(null);
      setWfForm({ name: '', description: '', module: 'hr', category: 'approval' });
      loadWorkflows();
    } catch (e) { alert(e.response?.data?.message || 'Error saving workflow'); }
  };

  const saveStep = async () => {
    try {
      if (editingStep) await updateWorkflowStep(editingStep._id, stepForm);
      else await createWorkflowStep(selected._id, stepForm);
      setShowStepModal(false);
      setEditingStep(null);
      setStepForm({ name: '', stepOrder: steps.length + 1, stepType: 'approval', assigneeType: 'role', approvalMode: 'sequential', slaHours: 24, escalateAfterHours: 48 });
      loadSteps(selected._id);
    } catch (e) { alert(e.response?.data?.message || 'Error saving step'); }
  };

  const handleDeleteWF = async (id) => {
    if (!window.confirm('Delete this workflow?')) return;
    await deleteWorkflow(id);
    if (selected?._id === id) setSelected(null);
    loadWorkflows();
  };

  const handleDeleteStep = async (id) => {
    if (!window.confirm('Delete this step?')) return;
    await deleteWorkflowStep(id);
    loadSteps(selected._id);
  };

  const toggleStatus = async (wf) => {
    if (wf.status === 'active') await deactivateWorkflow(wf._id);
    else await activateWorkflow(wf._id);
    loadWorkflows();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Workflow Designer</h1>
          <button onClick={() => { setEditingWF(null); setWfForm({ name: '', description: '', module: 'hr', category: 'approval' }); setShowWFModal(true); }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Workflow</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">All Modules</option>
            {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Workflow List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Workflows ({workflows.length})</h2>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {loading ? <p className="p-4 text-sm text-gray-400">Loading…</p> : workflows.length === 0 ? <p className="p-4 text-sm text-gray-400">No workflows yet.</p> : null}
              {workflows.map(wf => (
                <div key={wf._id} onClick={() => selectWorkflow(wf)}
                  className={`p-3 cursor-pointer hover:bg-indigo-50 transition-colors ${selected?._id === wf._id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{wf.name}</p>
                      <p className="text-xs text-gray-500">{wf.workflowCode} · {wf.module} · {wf.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(wf.status)}>{wf.status}</span>
                      <button onClick={e => { e.stopPropagation(); toggleStatus(wf); }} className="text-xs text-indigo-600 hover:underline">
                        {wf.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={e => { e.stopPropagation(); setEditingWF(wf); setWfForm({ name: wf.name, description: wf.description || '', module: wf.module, category: wf.category }); setShowWFModal(true); }} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={e => { e.stopPropagation(); handleDeleteWF(wf._id); }} className="text-xs text-red-500 hover:underline">Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Designer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">{selected ? `Steps: ${selected.name}` : 'Select a workflow to see steps'}</h2>
              {selected && (
                <button onClick={() => { setEditingStep(null); setStepForm({ name: '', stepOrder: steps.length + 1, stepType: 'approval', assigneeType: 'role', approvalMode: 'sequential', slaHours: 24, escalateAfterHours: 48 }); setShowStepModal(true); }}
                  className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Add Step</button>
              )}
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {!selected && <p className="p-4 text-sm text-gray-400">Click a workflow on the left to view and edit its steps.</p>}
              {selected && steps.length === 0 && <p className="p-4 text-sm text-gray-400">No steps yet. Add a step to build the workflow.</p>}
              {steps.map((step, idx) => (
                <div key={step._id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">{step.stepOrder}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{step.name}</p>
                        <p className="text-xs text-gray-500">{step.stepType} · {step.assigneeType} · SLA {step.slaHours}h</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingStep(step); setStepForm({ name: step.name, stepOrder: step.stepOrder, stepType: step.stepType, assigneeType: step.assigneeType, approvalMode: step.approvalMode, slaHours: step.slaHours, escalateAfterHours: step.escalateAfterHours }); setShowStepModal(true); }} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteStep(step._id)} className="text-xs text-red-500 hover:underline">Del</button>
                    </div>
                  </div>
                  {idx < steps.length - 1 && <div className="ml-3 mt-1 h-4 border-l-2 border-dashed border-indigo-200" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Modal */}
      {showWFModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editingWF ? 'Edit Workflow' : 'New Workflow'}</h3>
              <button onClick={() => setShowWFModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={wfForm.name} onChange={e => setWfForm(p => ({ ...p, name: e.target.value }))} placeholder="Workflow Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={wfForm.description} onChange={e => setWfForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none" />
              <select value={wfForm.module} onChange={e => setWfForm(p => ({ ...p, module: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={wfForm.category} onChange={e => setWfForm(p => ({ ...p, category: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowWFModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveWorkflow} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editingStep ? 'Edit Step' : 'Add Step'}</h3>
              <button onClick={() => setShowStepModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={stepForm.name} onChange={e => setStepForm(p => ({ ...p, name: e.target.value }))} placeholder="Step Name *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Step Order</label>
                  <input type="number" value={stepForm.stepOrder} onChange={e => setStepForm(p => ({ ...p, stepOrder: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">SLA Hours</label>
                  <input type="number" value={stepForm.slaHours} onChange={e => setStepForm(p => ({ ...p, slaHours: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <select value={stepForm.stepType} onChange={e => setStepForm(p => ({ ...p, stepType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={stepForm.assigneeType} onChange={e => setStepForm(p => ({ ...p, assigneeType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {ASSIGNEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={stepForm.approvalMode} onChange={e => setStepForm(p => ({ ...p, approvalMode: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {APPROVAL_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div>
                <label className="text-xs text-gray-500">Escalate After (Hours)</label>
                <input type="number" value={stepForm.escalateAfterHours} onChange={e => setStepForm(p => ({ ...p, escalateAfterHours: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex gap-2 justify-end">
              <button onClick={() => setShowStepModal(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveStep} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
