import axios from 'axios';

const BASE = '/api/admin/bi';
const cfg  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

// ── Executive Dashboards ─────────────────────────────────────────────────────
export const fetchCEODashboard           = ()       => axios.get(`${BASE}/executive/ceo`, cfg());
export const fetchCOODashboard           = ()       => axios.get(`${BASE}/executive/coo`, cfg());
export const fetchCFODashboard           = ()       => axios.get(`${BASE}/executive/cfo`, cfg());
export const fetchCHRODashboard          = ()       => axios.get(`${BASE}/executive/chro`, cfg());
export const fetchOperationsDashboard    = ()       => axios.get(`${BASE}/executive/operations`, cfg());
export const fetchManufacturingDashboard = ()       => axios.get(`${BASE}/executive/manufacturing`, cfg());
export const fetchSupplyChainDashboard   = ()       => axios.get(`${BASE}/executive/supply-chain`, cfg());
export const fetchSalesDashboard         = ()       => axios.get(`${BASE}/executive/sales`, cfg());
export const fetchCustomerDashboard      = ()       => axios.get(`${BASE}/executive/customer`, cfg());
export const fetchProjectsDashboard      = ()       => axios.get(`${BASE}/executive/projects`, cfg());
export const fetchEnterpriseHealth       = ()       => axios.get(`${BASE}/executive/enterprise`, cfg());

// ── KPI Engine ───────────────────────────────────────────────────────────────
export const fetchAllKPIs    = (p = {}) => axios.get(`${BASE}/kpis`, { ...cfg(), params: p });
export const fetchKPI        = (name)   => axios.get(`${BASE}/kpis/${name}`, cfg());
export const fetchKPITrend   = (name, p = {}) => axios.get(`${BASE}/kpis/${name}/trend`, { ...cfg(), params: p });
export const checkAlerts     = ()       => axios.get(`${BASE}/kpis/check-alerts`, cfg());

// ── KPI Targets ──────────────────────────────────────────────────────────────
export const fetchKPITargets   = (p = {}) => axios.get(`${BASE}/kpi-targets`, { ...cfg(), params: p });
export const createKPITarget   = (d)      => axios.post(`${BASE}/kpi-targets`, d, cfg());
export const updateKPITarget   = (id, d)  => axios.put(`${BASE}/kpi-targets/${id}`, d, cfg());
export const deleteKPITarget   = (id)     => axios.delete(`${BASE}/kpi-targets/${id}`, cfg());

// ── Analytics ────────────────────────────────────────────────────────────────
export const fetchCrossModuleAnalytics = (p = {}) => axios.get(`${BASE}/analytics/cross-module`, { ...cfg(), params: p });
export const fetchDrillDown            = (p = {}) => axios.get(`${BASE}/analytics/drilldown`, { ...cfg(), params: p });
export const fetchTrendAnalysis        = (p = {}) => axios.get(`${BASE}/analytics/trends`, { ...cfg(), params: p });
export const fetchYoYComparison        = (p = {}) => axios.get(`${BASE}/analytics/yoy`, { ...cfg(), params: p });
export const fetchMoMComparison        = (p = {}) => axios.get(`${BASE}/analytics/mom`, { ...cfg(), params: p });
export const fetchQoQComparison        = (p = {}) => axios.get(`${BASE}/analytics/qoq`, { ...cfg(), params: p });
export const fetchHeatmap              = (module, p = {}) => axios.get(`${BASE}/analytics/heatmap/${module}`, { ...cfg(), params: p });
export const fetchForecast             = (p = {}) => axios.get(`${BASE}/analytics/forecast`, { ...cfg(), params: p });
export const fetchVarianceAnalysis     = (p = {}) => axios.get(`${BASE}/analytics/variance`, { ...cfg(), params: p });
export const fetchBenchmarks           = (p = {}) => axios.get(`${BASE}/analytics/benchmarks`, { ...cfg(), params: p });

// ── Board Pack & Reports ──────────────────────────────────────────────────────
export const fetchBoardPack         = ()         => axios.get(`${BASE}/board-pack`, cfg());
export const fetchManagementSummary = ()         => axios.get(`${BASE}/management-summary`, cfg());
export const fetchDeptScorecard     = (dept)     => axios.get(`${BASE}/scorecards/${dept}`, cfg());
export const exportBoardPack        = (format)   => axios.get(`${BASE}/reports/export/${format}`, cfg());

// ── Report Config CRUD ────────────────────────────────────────────────────────
export const fetchReports    = (p = {}) => axios.get(`${BASE}/reports`, { ...cfg(), params: p });
export const createReport    = (d)      => axios.post(`${BASE}/reports`, d, cfg());
export const fetchReport     = (id)     => axios.get(`${BASE}/reports/${id}`, cfg());
export const updateReport    = (id, d)  => axios.put(`${BASE}/reports/${id}`, d, cfg());
export const deleteReport    = (id)     => axios.delete(`${BASE}/reports/${id}`, cfg());
export const generateReport  = (id)    => axios.get(`${BASE}/reports/${id}/generate`, cfg());

// ── Dashboard Config ─────────────────────────────────────────────────────────
export const fetchDashboards    = (p = {}) => axios.get(`${BASE}/dashboards`, { ...cfg(), params: p });
export const createDashboard    = (d)      => axios.post(`${BASE}/dashboards`, d, cfg());
export const fetchDashboard     = (id)     => axios.get(`${BASE}/dashboards/${id}`, cfg());
export const updateDashboard    = (id, d)  => axios.put(`${BASE}/dashboards/${id}`, d, cfg());
export const deleteDashboard    = (id)     => axios.delete(`${BASE}/dashboards/${id}`, cfg());

// ── Alert Config ─────────────────────────────────────────────────────────────
export const fetchAlerts    = (p = {}) => axios.get(`${BASE}/alerts`, { ...cfg(), params: p });
export const createAlert    = (d)      => axios.post(`${BASE}/alerts`, d, cfg());
export const fetchAlert     = (id)     => axios.get(`${BASE}/alerts/${id}`, cfg());
export const updateAlert    = (id, d)  => axios.put(`${BASE}/alerts/${id}`, d, cfg());
export const deleteAlert    = (id)     => axios.delete(`${BASE}/alerts/${id}`, cfg());
export const toggleAlert    = (id)     => axios.patch(`${BASE}/alerts/${id}/toggle`, {}, cfg());

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const fetchBookmarks      = ()    => axios.get(`${BASE}/bookmarks`, cfg());
export const createBookmark      = (d)   => axios.post(`${BASE}/bookmarks`, d, cfg());
export const deleteBookmark      = (id)  => axios.delete(`${BASE}/bookmarks/${id}`, cfg());
export const setDefaultBookmark  = (id)  => axios.patch(`${BASE}/bookmarks/${id}/default`, {}, cfg());
