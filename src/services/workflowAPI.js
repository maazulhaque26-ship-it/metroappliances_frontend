import axios from 'axios';

const BASE = '/api/admin/workflows';
const cfg = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

// ── Analytics & Dashboard ─────────────────────────────────────────────────────
export const fetchBPMDashboard          = () => axios.get(`${BASE}/dashboard`, cfg());
export const fetchWorkflowPerformance   = (p) => axios.get(`${BASE}/analytics/performance`, { ...cfg(), params: p });
export const fetchApprovalAnalytics     = () => axios.get(`${BASE}/analytics/approvals`, cfg());
export const fetchSLACompliance         = () => axios.get(`${BASE}/analytics/sla-compliance`, cfg());
export const fetchEscalationReport      = () => axios.get(`${BASE}/analytics/escalations`, cfg());
export const fetchAutomationReport      = () => axios.get(`${BASE}/analytics/automation`, cfg());
export const fetchAuditTrail            = (p) => axios.get(`${BASE}/analytics/audit-trail`, { ...cfg(), params: p });
export const fetchDepartmentAnalytics   = () => axios.get(`${BASE}/analytics/department`, cfg());

// ── Workflow Definitions ──────────────────────────────────────────────────────
export const fetchWorkflows             = (p) => axios.get(`${BASE}`, { ...cfg(), params: p });
export const createWorkflow             = (d) => axios.post(`${BASE}`, d, cfg());
export const fetchWorkflow              = (id) => axios.get(`${BASE}/${id}`, cfg());
export const updateWorkflow             = (id, d) => axios.put(`${BASE}/${id}`, d, cfg());
export const deleteWorkflow             = (id) => axios.delete(`${BASE}/${id}`, cfg());
export const activateWorkflow           = (id) => axios.patch(`${BASE}/${id}/activate`, {}, cfg());
export const deactivateWorkflow         = (id) => axios.patch(`${BASE}/${id}/deactivate`, {}, cfg());

// ── Workflow Templates ────────────────────────────────────────────────────────
export const fetchWorkflowTemplates     = (p) => axios.get(`${BASE}/templates`, { ...cfg(), params: p });
export const createWorkflowTemplate     = (d) => axios.post(`${BASE}/templates`, d, cfg());
export const fetchWorkflowTemplate      = (id) => axios.get(`${BASE}/templates/${id}`, cfg());
export const updateWorkflowTemplate     = (id, d) => axios.put(`${BASE}/templates/${id}`, d, cfg());
export const deleteWorkflowTemplate     = (id) => axios.delete(`${BASE}/templates/${id}`, cfg());

// ── Workflow Steps ────────────────────────────────────────────────────────────
export const fetchWorkflowSteps         = (workflowId) => axios.get(`${BASE}/${workflowId}/steps`, cfg());
export const createWorkflowStep         = (workflowId, d) => axios.post(`${BASE}/${workflowId}/steps`, d, cfg());
export const fetchWorkflowStep          = (id) => axios.get(`${BASE}/steps/${id}`, cfg());
export const updateWorkflowStep         = (id, d) => axios.put(`${BASE}/steps/${id}`, d, cfg());
export const deleteWorkflowStep         = (id) => axios.delete(`${BASE}/steps/${id}`, cfg());

// ── Workflow Transitions ──────────────────────────────────────────────────────
export const fetchWorkflowTransitions   = (workflowId) => axios.get(`${BASE}/${workflowId}/transitions`, cfg());
export const createWorkflowTransition   = (workflowId, d) => axios.post(`${BASE}/${workflowId}/transitions`, d, cfg());
export const updateWorkflowTransition   = (id, d) => axios.put(`${BASE}/transitions/${id}`, d, cfg());
export const deleteWorkflowTransition   = (id) => axios.delete(`${BASE}/transitions/${id}`, cfg());

// ── Workflow Rules ────────────────────────────────────────────────────────────
export const fetchWorkflowRules         = (p) => axios.get(`${BASE}/rules`, { ...cfg(), params: p });
export const createWorkflowRule         = (d) => axios.post(`${BASE}/rules`, d, cfg());
export const fetchWorkflowRule          = (id) => axios.get(`${BASE}/rules/${id}`, cfg());
export const updateWorkflowRule         = (id, d) => axios.put(`${BASE}/rules/${id}`, d, cfg());
export const deleteWorkflowRule         = (id) => axios.delete(`${BASE}/rules/${id}`, cfg());

// ── Workflow Conditions ───────────────────────────────────────────────────────
export const fetchWorkflowConditions    = (p) => axios.get(`${BASE}/conditions`, { ...cfg(), params: p });
export const createWorkflowCondition    = (d) => axios.post(`${BASE}/conditions`, d, cfg());
export const fetchWorkflowCondition     = (id) => axios.get(`${BASE}/conditions/${id}`, cfg());
export const updateWorkflowCondition    = (id, d) => axios.put(`${BASE}/conditions/${id}`, d, cfg());
export const deleteWorkflowCondition    = (id) => axios.delete(`${BASE}/conditions/${id}`, cfg());

// ── Workflow Triggers ─────────────────────────────────────────────────────────
export const fetchWorkflowTriggers      = (p) => axios.get(`${BASE}/triggers`, { ...cfg(), params: p });
export const createWorkflowTrigger      = (d) => axios.post(`${BASE}/triggers`, d, cfg());
export const fetchWorkflowTrigger       = (id) => axios.get(`${BASE}/triggers/${id}`, cfg());
export const updateWorkflowTrigger      = (id, d) => axios.put(`${BASE}/triggers/${id}`, d, cfg());
export const deleteWorkflowTrigger      = (id) => axios.delete(`${BASE}/triggers/${id}`, cfg());
export const fireWorkflowTrigger        = (id) => axios.post(`${BASE}/triggers/${id}/fire`, {}, cfg());

// ── Workflow Instances ────────────────────────────────────────────────────────
export const fetchInstances             = (p) => axios.get(`${BASE}/instances`, { ...cfg(), params: p });
export const createInstance             = (d) => axios.post(`${BASE}/instances`, d, cfg());
export const fetchMyPendingInstances    = () => axios.get(`${BASE}/instances/my-pending`, cfg());
export const fetchMyInitiatedInstances  = (p) => axios.get(`${BASE}/instances/my-initiated`, { ...cfg(), params: p });
export const fetchInstance              = (id) => axios.get(`${BASE}/instances/${id}`, cfg());
export const updateInstance             = (id, d) => axios.put(`${BASE}/instances/${id}`, d, cfg());
export const startInstance              = (id) => axios.patch(`${BASE}/instances/${id}/start`, {}, cfg());
export const cancelInstance             = (id, d) => axios.patch(`${BASE}/instances/${id}/cancel`, d, cfg());
export const fetchInstanceHistory       = (id) => axios.get(`${BASE}/instances/${id}/history`, cfg());
export const addInstanceComment         = (id, d) => axios.post(`${BASE}/instances/${id}/comments`, d, cfg());
export const fetchInstanceComments      = (id) => axios.get(`${BASE}/instances/${id}/comments`, cfg());
export const addInstanceAttachment      = (id, d) => axios.post(`${BASE}/instances/${id}/attachments`, d, cfg());
export const fetchInstanceAttachments   = (id) => axios.get(`${BASE}/instances/${id}/attachments`, cfg());

// ── Approvals ─────────────────────────────────────────────────────────────────
export const fetchApprovals             = (p) => axios.get(`${BASE}/approvals`, { ...cfg(), params: p });
export const fetchPendingApprovals      = () => axios.get(`${BASE}/approvals/pending`, cfg());
export const bulkApprove                = (d) => axios.post(`${BASE}/approvals/bulk-approve`, d, cfg());
export const fetchApprovalHistory       = (instanceId) => axios.get(`${BASE}/approvals/history/${instanceId}`, cfg());
export const fetchApproval              = (id) => axios.get(`${BASE}/approvals/${id}`, cfg());
export const approveStep                = (id, d) => axios.patch(`${BASE}/approvals/${id}/approve`, d, cfg());
export const rejectStep                 = (id, d) => axios.patch(`${BASE}/approvals/${id}/reject`, d, cfg());
export const delegateApproval           = (id, d) => axios.patch(`${BASE}/approvals/${id}/delegate`, d, cfg());
export const recallApproval             = (id) => axios.patch(`${BASE}/approvals/${id}/recall`, {}, cfg());
export const overrideApproval           = (id, d) => axios.patch(`${BASE}/approvals/${id}/override`, d, cfg());

// ── Escalations ───────────────────────────────────────────────────────────────
export const fetchEscalations           = (p) => axios.get(`${BASE}/escalations`, { ...cfg(), params: p });
export const createEscalation           = (d) => axios.post(`${BASE}/escalations`, d, cfg());
export const fetchEscalation            = (id) => axios.get(`${BASE}/escalations/${id}`, cfg());
export const acknowledgeEscalation      = (id) => axios.patch(`${BASE}/escalations/${id}/acknowledge`, {}, cfg());
export const resolveEscalation          = (id, d) => axios.patch(`${BASE}/escalations/${id}/resolve`, d, cfg());

// ── SLAs ──────────────────────────────────────────────────────────────────────
export const fetchSLABreaches           = () => axios.get(`${BASE}/slas/breaches`, cfg());
export const fetchSLAs                  = (p) => axios.get(`${BASE}/slas`, { ...cfg(), params: p });
export const createSLA                  = (d) => axios.post(`${BASE}/slas`, d, cfg());
export const fetchSLA                   = (id) => axios.get(`${BASE}/slas/${id}`, cfg());
export const updateSLA                  = (id, d) => axios.put(`${BASE}/slas/${id}`, d, cfg());
export const deleteSLA                  = (id) => axios.delete(`${BASE}/slas/${id}`, cfg());

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchWorkflowNotifications  = (p) => axios.get(`${BASE}/notifications`, { ...cfg(), params: p });
export const markNotificationRead        = (id) => axios.patch(`${BASE}/notifications/${id}/read`, {}, cfg());
export const markAllNotificationsRead    = () => axios.post(`${BASE}/notifications/mark-all-read`, {}, cfg());
