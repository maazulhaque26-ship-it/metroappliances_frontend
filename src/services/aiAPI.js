import axios from 'axios';

const BASE = '/api/admin/ai';
const cfg  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
const qcfg = (params = {}) => ({ ...cfg(), params });

// ── Dashboard & Insights ──────────────────────────────────────────────────────
export const fetchAIDashboard      = ()           => axios.get(`${BASE}/dashboard`, cfg());
export const fetchForecastAccuracy = (p = {})     => axios.get(`${BASE}/dashboard/accuracy`, qcfg(p));
export const fetchAIInsights       = ()           => axios.get(`${BASE}/dashboard/insights`, cfg());

// ── Scenarios ─────────────────────────────────────────────────────────────────
export const fetchScenarios        = (p = {})     => axios.get(`${BASE}/scenarios`, qcfg(p));
export const compareScenarios      = (ids = [])   => axios.get(`${BASE}/scenarios/compare`, qcfg({ ids: ids.join(',') }));
export const createScenario        = (data)       => axios.post(`${BASE}/scenarios`, data, cfg());
export const deleteScenario        = (id)         => axios.delete(`${BASE}/scenarios/${id}`, cfg());

// ── Prediction History ────────────────────────────────────────────────────────
export const fetchPredictionHistory = (p = {})   => axios.get(`${BASE}/history`, qcfg(p));
export const fetchHistoryAccuracy   = (p = {})   => axios.get(`${BASE}/history/accuracy`, qcfg(p));

// ── Forecasts — list & detail ─────────────────────────────────────────────────
export const fetchForecasts        = (p = {})     => axios.get(`${BASE}/forecasts`, qcfg(p));
export const fetchForecast         = (id)         => axios.get(`${BASE}/forecasts/${id}`, cfg());
export const deleteForecast        = (id)         => axios.delete(`${BASE}/forecasts/${id}`, cfg());

// ── Forecasts — generate ──────────────────────────────────────────────────────
export const generateSalesForecast       = (data = {}) => axios.post(`${BASE}/forecasts/sales`,       data, cfg());
export const generateDemandForecast      = (data = {}) => axios.post(`${BASE}/forecasts/demand`,      data, cfg());
export const generateInventoryForecast   = (data = {}) => axios.post(`${BASE}/forecasts/inventory`,   data, cfg());
export const generateProductionForecast  = (data = {}) => axios.post(`${BASE}/forecasts/production`,  data, cfg());
export const generateCashFlowForecast    = (data = {}) => axios.post(`${BASE}/forecasts/cashflow`,    data, cfg());
export const generateRevenueForecast     = (data = {}) => axios.post(`${BASE}/forecasts/revenue`,     data, cfg());
export const generateExpenseForecast     = (data = {}) => axios.post(`${BASE}/forecasts/expense`,     data, cfg());
export const generateWorkforceForecast   = (data = {}) => axios.post(`${BASE}/forecasts/workforce`,   data, cfg());
export const generateMaintenanceForecast = (data = {}) => axios.post(`${BASE}/forecasts/maintenance`, data, cfg());
export const generateWarrantyForecast    = (data = {}) => axios.post(`${BASE}/forecasts/warranty`,    data, cfg());
export const generateProjectForecast     = (data = {}) => axios.post(`${BASE}/forecasts/projects`,    data, cfg());

// ── Anomalies ─────────────────────────────────────────────────────────────────
export const fetchAnomalies           = (p = {}) => axios.get(`${BASE}/anomalies`, qcfg(p));
export const fetchAnomalyStats        = ()       => axios.get(`${BASE}/anomalies/stats`, cfg());
export const detectAllAnomalies       = ()       => axios.post(`${BASE}/anomalies/detect`, {}, cfg());
export const detectDemandAnomalies    = ()       => axios.post(`${BASE}/anomalies/detect/demand`, {}, cfg());
export const detectInventoryAnomalies = ()       => axios.post(`${BASE}/anomalies/detect/inventory`, {}, cfg());
export const detectCashAnomalies      = ()       => axios.post(`${BASE}/anomalies/detect/cash`, {}, cfg());
export const detectProductionAnomalies= ()       => axios.post(`${BASE}/anomalies/detect/production`, {}, cfg());
export const resolveAnomaly           = (id, data = {}) => axios.patch(`${BASE}/anomalies/${id}/resolve`, data, cfg());

// ── Recommendations ───────────────────────────────────────────────────────────
export const fetchRecommendations           = (p = {}) => axios.get(`${BASE}/recommendations`, qcfg(p));
export const fetchRecommendationStats       = ()       => axios.get(`${BASE}/recommendations/stats`, cfg());
export const generateAllRecommendations     = ()       => axios.post(`${BASE}/recommendations/generate`, {}, cfg());
export const generateInventoryRecommendations  = ()   => axios.post(`${BASE}/recommendations/generate/inventory`, {}, cfg());
export const generateProductionRecommendations = ()   => axios.post(`${BASE}/recommendations/generate/production`, {}, cfg());
export const generateHRRecommendations      = ()      => axios.post(`${BASE}/recommendations/generate/hr`, {}, cfg());
export const generateMaintenanceRecommendations = ()  => axios.post(`${BASE}/recommendations/generate/maintenance`, {}, cfg());
export const updateRecommendationStatus     = (id, data) => axios.patch(`${BASE}/recommendations/${id}/status`, data, cfg());

// ── Config — Settings ─────────────────────────────────────────────────────────
export const fetchAISettings   = (p = {}) => axios.get(`${BASE}/settings`, qcfg(p));
export const updateAISetting   = (key, data) => axios.put(`${BASE}/settings/${key}`, data, cfg());
export const seedAISettings    = ()          => axios.post(`${BASE}/settings/seed`, {}, cfg());

// ── Config — Forecast Models ──────────────────────────────────────────────────
export const fetchAIModels        = (p = {})  => axios.get(`${BASE}/models`, qcfg(p));
export const createAIModel        = (data)    => axios.post(`${BASE}/models`, data, cfg());
export const updateAIModel        = (id, data)=> axios.put(`${BASE}/models/${id}`, data, cfg());
export const deleteAIModel        = (id)      => axios.delete(`${BASE}/models/${id}`, cfg());
