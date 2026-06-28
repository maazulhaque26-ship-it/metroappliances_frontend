const mongoose = require('mongoose');
const { ok, notFound, serverError } = require('../utils/response');

const tryM = (name) => { try { return mongoose.model(name); } catch { return null; } };
const safeCount = async (model, filter = {}) => {
  const M = tryM(model);
  if (!M) return 0;
  try { return await M.countDocuments(filter); } catch { return 0; }
};
const safeAgg = async (model, pipeline, fallback = []) => {
  const M = tryM(model);
  if (!M) return fallback;
  try { return await M.aggregate(pipeline); } catch { return fallback; }
};

const AIForecast         = () => mongoose.model('AIForecast');
const AIRecommendation   = () => mongoose.model('AIRecommendation');
const AnomalyDetection   = () => mongoose.model('AnomalyDetection');
const PredictionScenario = () => mongoose.model('PredictionScenario');
const PredictionHistory  = () => mongoose.model('PredictionHistory');
const AIForecastModel    = () => mongoose.model('AIForecastModel');

exports.getAIDashboard = async (req, res) => {
  try {
    const [
      totalForecasts, recentForecasts,
      openAnomalies, criticalAnomalies,
      pendingRecs, criticalRecs,
      scenarios,
    ] = await Promise.all([
      AIForecast().countDocuments({}),
      AIForecast().find({}).sort({ createdAt: -1 }).limit(5).lean(),
      AnomalyDetection().countDocuments({ isResolved: false }),
      AnomalyDetection().countDocuments({ isResolved: false, severity: 'critical' }),
      AIRecommendation().countDocuments({ status: 'pending' }),
      AIRecommendation().countDocuments({ status: 'pending', priority: 'critical' }),
      PredictionScenario().find({ status: 'active' }).limit(3).lean(),
    ]);

    const [anomalyBySeverity, recByPriority, forecastByType] = await Promise.all([
      AnomalyDetection().aggregate([
        { $match: { isResolved: false } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      AIRecommendation().aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      AIForecast().aggregate([
        { $group: { _id: '$forecastType', count: { $sum: 1 }, avgConfidence: { $avg: '$confidence' } } },
      ]),
    ]);

    const aiHealthScore = Math.max(0, 100
      - criticalAnomalies * 10
      - criticalRecs * 5
      - Math.min(20, openAnomalies * 2));

    ok(res, {
      summary: { totalForecasts, openAnomalies, criticalAnomalies, pendingRecs, criticalRecs, aiHealthScore },
      recentForecasts,
      activeScenarios: scenarios,
      anomalyBySeverity,
      recByPriority,
      forecastByType,
    });
  } catch (e) { serverError(res, e); }
};

exports.getForecastAccuracy = async (req, res) => {
  try {
    const { forecastType, limit = 50 } = req.query;
    const filter = { isActualized: true };
    if (forecastType) filter.forecastType = forecastType;

    const history = await PredictionHistory().find(filter)
      .sort({ createdAt: -1 }).limit(Number(limit)).lean();

    const models = await AIForecastModel().find({ isActive: true }).lean();

    const byType = {};
    history.forEach(h => {
      if (!byType[h.forecastType]) byType[h.forecastType] = { errors: [], count: 0 };
      byType[h.forecastType].errors.push(Math.abs(h.errorPct || 0));
      byType[h.forecastType].count++;
    });

    const accuracyByType = Object.entries(byType).map(([type, data]) => ({
      forecastType: type,
      count: data.count,
      avgMAPE: Math.round(data.errors.reduce((a, b) => a + b, 0) / data.count * 100) / 100,
      avgAccuracy: Math.round((100 - (data.errors.reduce((a, b) => a + b, 0) / data.count)) * 100) / 100,
    }));

    ok(res, { accuracyByType, models, totalActualized: history.length });
  } catch (e) { serverError(res, e); }
};

exports.getScenarios = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      PredictionScenario().find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      PredictionScenario().countDocuments(filter),
    ]);
    ok(res, { data, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { serverError(res, e); }
};

exports.createScenario = async (req, res) => {
  try {
    const { name, description, baselineId, assumptions, adjustments } = req.body || {};
    const s = await PredictionScenario().create({
      name, description, baselineId, assumptions, adjustments,
      createdBy: req.user?._id,
    });
    ok(res, s);
  } catch (e) { serverError(res, e); }
};

exports.deleteScenario = async (req, res) => {
  try {
    await PredictionScenario().findByIdAndDelete(req.params.id);
    ok(res, { deleted: true });
  } catch (e) { serverError(res, e); }
};

exports.getPredictionHistory = async (req, res) => {
  try {
    const { forecastType, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (forecastType) filter.forecastType = forecastType;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      PredictionHistory().find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      PredictionHistory().countDocuments(filter),
    ]);
    ok(res, { data, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { serverError(res, e); }
};

exports.getAIInsights = async (req, res) => {
  try {
    const [
      forecastStats, anomalyStats, recStats,
      orderRevenue, headcount, inventoryHealth,
    ] = await Promise.all([
      AIForecast().aggregate([
        { $group: { _id: '$forecastType', count: { $sum: 1 }, avgConfidence: { $avg: '$confidence' }, latestDate: { $max: '$createdAt' } } },
        { $sort: { latestDate: -1 } },
      ]),
      AnomalyDetection().aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 }, unresolved: { $sum: { $cond: ['$isResolved', 0, 1] } } } },
      ]),
      AIRecommendation().aggregate([
        { $group: { _id: '$type', count: { $sum: 1 }, implemented: { $sum: { $cond: [{ $eq: ['$status', 'implemented'] }, 1, 0] } } } },
      ]),
      safeAgg('Order', [
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      safeCount('Employee', { isActive: true }),
      safeAgg('Inventory', [{ $group: { _id: null, total: { $sum: 1 }, lowStock: { $sum: { $cond: [{ $lte: ['$quantity', 5] }, 1, 0] } } } }]),
    ]);

    const rev      = orderRevenue[0]   || { revenue: 0, count: 0 };
    const invStats = inventoryHealth[0] || { total: 0, lowStock: 0 };
    const inventoryHealthPct = invStats.total > 0 ? Math.round(((invStats.total - invStats.lowStock) / invStats.total) * 100) : 100;

    const insights = [];
    const criticalAnomalies = anomalyStats.filter(a => a._id === 'critical' && a.unresolved > 0);
    if (criticalAnomalies.length > 0) {
      insights.push({ level: 'critical', area: 'anomalies', message: `${criticalAnomalies[0].unresolved} critical anomalies require immediate attention` });
    }
    if (invStats.lowStock > invStats.total * 0.2) {
      insights.push({ level: 'warning', area: 'inventory', message: `${invStats.lowStock} SKUs at critically low stock (${Math.round(invStats.lowStock/invStats.total*100)}%)` });
    }
    const highConfForecasts = forecastStats.filter(f => f.avgConfidence >= 80);
    if (highConfForecasts.length > 0) {
      insights.push({ level: 'info', area: 'forecasting', message: `${highConfForecasts.length} forecast type(s) operating at high confidence (≥80%)` });
    }

    ok(res, {
      forecastStats, anomalyStats, recStats,
      businessMetrics: { monthlyRevenue: rev.revenue, monthlyOrders: rev.count, headcount, inventoryHealthPct },
      insights,
    });
  } catch (e) { serverError(res, e); }
};

exports.compareScenarios = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return ok(res, []);
    const idArr = ids.split(',').filter(Boolean);
    const scenarios = await PredictionScenario().find({ _id: { $in: idArr } }).lean();
    ok(res, { scenarios, comparison: scenarios.map(s => ({ id: s._id, name: s.name, assumptions: s.assumptions, results: s.results })) });
  } catch (e) { serverError(res, e); }
};
