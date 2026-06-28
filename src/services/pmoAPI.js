import axios from 'axios';

const BASE = '/api/admin/pmo';
const cfg  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

// ── Analytics / Dashboard ─────────────────────────────────────────────────────
export const fetchPMODashboard        = ()       => axios.get(`${BASE}/dashboard`, cfg());
export const fetchEVMAnalytics        = (params) => axios.get(`${BASE}/analytics/evm`, { ...cfg(), params });
export const fetchRiskHeatmap         = (params) => axios.get(`${BASE}/analytics/risk-heatmap`, { ...cfg(), params });
export const fetchBudgetAnalytics     = (params) => axios.get(`${BASE}/analytics/budget`, { ...cfg(), params });
export const fetchResourceForecast    = (params) => axios.get(`${BASE}/analytics/resource-forecast`, { ...cfg(), params });
export const fetchBenefitRealization  = (params) => axios.get(`${BASE}/analytics/benefits`, { ...cfg(), params });
export const fetchStrategicAlignment  = (params) => axios.get(`${BASE}/analytics/alignment`, { ...cfg(), params });
export const fetchGovernanceReport    = (params) => axios.get(`${BASE}/analytics/governance-report`, { ...cfg(), params });
export const fetchIssueTrend          = (params) => axios.get(`${BASE}/analytics/issue-trend`, { ...cfg(), params });

// ── Governance Boards ─────────────────────────────────────────────────────────
export const fetchBoards       = (params) => axios.get(`${BASE}/boards`, { ...cfg(), params });
export const createBoard       = (data)   => axios.post(`${BASE}/boards`, data, cfg());
export const fetchBoard        = (id)     => axios.get(`${BASE}/boards/${id}`, cfg());
export const updateBoard       = (id, d)  => axios.put(`${BASE}/boards/${id}`, d, cfg());
export const deleteBoard       = (id)     => axios.delete(`${BASE}/boards/${id}`, cfg());

// ── Decision Log ──────────────────────────────────────────────────────────────
export const fetchDecisions    = (params) => axios.get(`${BASE}/decisions`, { ...cfg(), params });
export const createDecision    = (data)   => axios.post(`${BASE}/decisions`, data, cfg());
export const fetchDecision     = (id)     => axios.get(`${BASE}/decisions/${id}`, cfg());
export const updateDecision    = (id, d)  => axios.put(`${BASE}/decisions/${id}`, d, cfg());
export const deleteDecision    = (id)     => axios.delete(`${BASE}/decisions/${id}`, cfg());

// ── Steering Committees ───────────────────────────────────────────────────────
export const fetchCommittees   = (params) => axios.get(`${BASE}/committees`, { ...cfg(), params });
export const createCommittee   = (data)   => axios.post(`${BASE}/committees`, data, cfg());
export const fetchCommittee    = (id)     => axios.get(`${BASE}/committees/${id}`, cfg());
export const updateCommittee   = (id, d)  => axios.put(`${BASE}/committees/${id}`, d, cfg());
export const deleteCommittee   = (id)     => axios.delete(`${BASE}/committees/${id}`, cfg());
export const addMeeting        = (id, d)  => axios.post(`${BASE}/committees/${id}/meetings`, d, cfg());

// ── Compliance Tracking ───────────────────────────────────────────────────────
export const fetchComplianceSummary = ()       => axios.get(`${BASE}/compliance/summary`, cfg());
export const fetchCompliance        = (params) => axios.get(`${BASE}/compliance`, { ...cfg(), params });
export const createCompliance       = (data)   => axios.post(`${BASE}/compliance`, data, cfg());
export const fetchComplianceItem    = (id)     => axios.get(`${BASE}/compliance/${id}`, cfg());
export const updateCompliance       = (id, d)  => axios.put(`${BASE}/compliance/${id}`, d, cfg());
export const deleteCompliance       = (id)     => axios.delete(`${BASE}/compliance/${id}`, cfg());

// ── Business Cases ────────────────────────────────────────────────────────────
export const fetchBusinessCases    = (params) => axios.get(`${BASE}/business-cases`, { ...cfg(), params });
export const createBusinessCase    = (data)   => axios.post(`${BASE}/business-cases`, data, cfg());
export const fetchBusinessCase     = (id)     => axios.get(`${BASE}/business-cases/${id}`, cfg());
export const updateBusinessCase    = (id, d)  => axios.put(`${BASE}/business-cases/${id}`, d, cfg());
export const deleteBusinessCase    = (id)     => axios.delete(`${BASE}/business-cases/${id}`, cfg());
export const approveBusinessCase   = (id, d)  => axios.patch(`${BASE}/business-cases/${id}/approve`, d, cfg());

// ── Investment Requests ───────────────────────────────────────────────────────
export const fetchInvestmentRequests  = (params) => axios.get(`${BASE}/investment-requests`, { ...cfg(), params });
export const createInvestmentRequest  = (data)   => axios.post(`${BASE}/investment-requests`, data, cfg());
export const fetchInvestmentRequest   = (id)     => axios.get(`${BASE}/investment-requests/${id}`, cfg());
export const updateInvestmentRequest  = (id, d)  => axios.put(`${BASE}/investment-requests/${id}`, d, cfg());
export const deleteInvestmentRequest  = (id)     => axios.delete(`${BASE}/investment-requests/${id}`, cfg());
export const decideInvestmentRequest  = (id, d)  => axios.patch(`${BASE}/investment-requests/${id}/decide`, d, cfg());

// ── Project Charters ──────────────────────────────────────────────────────────
export const fetchCharters     = (params) => axios.get(`${BASE}/charters`, { ...cfg(), params });
export const createCharter     = (data)   => axios.post(`${BASE}/charters`, data, cfg());
export const fetchCharter      = (id)     => axios.get(`${BASE}/charters/${id}`, cfg());
export const updateCharter     = (id, d)  => axios.put(`${BASE}/charters/${id}`, d, cfg());
export const deleteCharter     = (id)     => axios.delete(`${BASE}/charters/${id}`, cfg());
export const approveCharter    = (id, d)  => axios.patch(`${BASE}/charters/${id}/approve`, d, cfg());

// ── Lessons Learned ───────────────────────────────────────────────────────────
export const fetchLessonsReport = (params) => axios.get(`${BASE}/lessons/report`, { ...cfg(), params });
export const fetchLessons       = (params) => axios.get(`${BASE}/lessons`, { ...cfg(), params });
export const createLesson       = (data)   => axios.post(`${BASE}/lessons`, data, cfg());
export const fetchLesson        = (id)     => axios.get(`${BASE}/lessons/${id}`, cfg());
export const updateLesson       = (id, d)  => axios.put(`${BASE}/lessons/${id}`, d, cfg());
export const deleteLesson       = (id)     => axios.delete(`${BASE}/lessons/${id}`, cfg());
export const approveLesson      = (id)     => axios.patch(`${BASE}/lessons/${id}/approve`, {}, cfg());

// ── Templates ─────────────────────────────────────────────────────────────────
export const fetchTemplates    = (params) => axios.get(`${BASE}/templates`, { ...cfg(), params });
export const createTemplate    = (data)   => axios.post(`${BASE}/templates`, data, cfg());
export const fetchTemplate     = (id)     => axios.get(`${BASE}/templates/${id}`, cfg());
export const updateTemplate    = (id, d)  => axios.put(`${BASE}/templates/${id}`, d, cfg());
export const deleteTemplate    = (id)     => axios.delete(`${BASE}/templates/${id}`, cfg());

// ── Documents ─────────────────────────────────────────────────────────────────
export const fetchDocuments    = (params) => axios.get(`${BASE}/documents`, { ...cfg(), params });
export const createDocument    = (data)   => axios.post(`${BASE}/documents`, data, cfg());
export const fetchDocument     = (id)     => axios.get(`${BASE}/documents/${id}`, cfg());
export const updateDocument    = (id, d)  => axios.put(`${BASE}/documents/${id}`, d, cfg());
export const deleteDocument    = (id)     => axios.delete(`${BASE}/documents/${id}`, cfg());

// ── Project Audits ────────────────────────────────────────────────────────────
export const fetchAuditSummary = ()       => axios.get(`${BASE}/audits/summary`, cfg());
export const fetchAudits       = (params) => axios.get(`${BASE}/audits`, { ...cfg(), params });
export const createAudit       = (data)   => axios.post(`${BASE}/audits`, data, cfg());
export const fetchAudit        = (id)     => axios.get(`${BASE}/audits/${id}`, cfg());
export const updateAudit       = (id, d)  => axios.put(`${BASE}/audits/${id}`, d, cfg());
export const deleteAudit       = (id)     => axios.delete(`${BASE}/audits/${id}`, cfg());
export const addFinding        = (id, d)  => axios.post(`${BASE}/audits/${id}/findings`, d, cfg());
export const updateFinding     = (id, fid, d) => axios.put(`${BASE}/audits/${id}/findings/${fid}`, d, cfg());

// ── Project Scorecards ─────────────────────────────────────────────────────────
export const fetchScorecardHealthReport = () => axios.get(`${BASE}/scorecards/health-report`, cfg());
export const fetchScorecards   = (params) => axios.get(`${BASE}/scorecards`, { ...cfg(), params });
export const createScorecard   = (data)   => axios.post(`${BASE}/scorecards`, data, cfg());
export const fetchScorecard    = (id)     => axios.get(`${BASE}/scorecards/${id}`, cfg());
export const updateScorecard   = (id, d)  => axios.put(`${BASE}/scorecards/${id}`, d, cfg());
export const deleteScorecard   = (id)     => axios.delete(`${BASE}/scorecards/${id}`, cfg());
