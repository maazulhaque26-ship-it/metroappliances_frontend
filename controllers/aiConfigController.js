const mongoose = require('mongoose');
const { ok, notFound, serverError, created } = require('../utils/response');

const PredictionSetting = () => mongoose.model('PredictionSetting');
const AIForecastModel   = () => mongoose.model('AIForecastModel');
const PredictionHistory = () => mongoose.model('PredictionHistory');

const DEFAULT_SETTINGS = [
  { settingKey: 'default_algorithm',        settingValue: 'linear_regression',  category: 'algorithm',     description: 'Default forecasting algorithm' },
  { settingKey: 'forecast_horizon_months',  settingValue: 6,                     category: 'algorithm',     description: 'Default forecast horizon in months' },
  { settingKey: 'smoothing_alpha',          settingValue: 0.3,                   category: 'algorithm',     description: 'Exponential smoothing alpha' },
  { settingKey: 'anomaly_demand_threshold', settingValue: 20,                    category: 'threshold',     description: 'Demand deviation % threshold for anomaly' },
  { settingKey: 'anomaly_cash_threshold',   settingValue: 100000,                category: 'threshold',     description: 'Overdue AR threshold for cash anomaly (INR)' },
  { settingKey: 'low_confidence_threshold', settingValue: 60,                    category: 'threshold',     description: 'Minimum acceptable forecast confidence %' },
  { settingKey: 'forecast_schedule',        settingValue: 'weekly',              category: 'schedule',      description: 'Auto-forecast run schedule' },
  { settingKey: 'anomaly_scan_schedule',    settingValue: 'daily',               category: 'schedule',      description: 'Anomaly detection scan frequency' },
  { settingKey: 'notify_critical_anomaly',  settingValue: true,                  category: 'notification',  description: 'Notify admin on critical anomaly' },
  { settingKey: 'notify_new_recommendation',settingValue: true,                  category: 'notification',  description: 'Notify on new high-priority recommendation' },
  { settingKey: 'training_periods',         settingValue: 12,                    category: 'algorithm',     description: 'Historical months used for model training' },
  { settingKey: 'min_training_periods',     settingValue: 3,                     category: 'algorithm',     description: 'Minimum months required to generate forecast' },
];

exports.seedDefaultSettings = async (req, res) => {
  try {
    const seeded = [];
    for (const s of DEFAULT_SETTINGS) {
      const exists = await PredictionSetting().findOne({ settingKey: s.settingKey });
      if (!exists) {
        const doc = await PredictionSetting().create(s);
        seeded.push(doc);
      }
    }
    ok(res, { seeded: seeded.length, message: `Seeded ${seeded.length} default settings` });
  } catch (e) { serverError(res, e); }
};

exports.listSettings = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const settings = await PredictionSetting().find(filter).sort({ category: 1, settingKey: 1 }).lean();
    ok(res, settings);
  } catch (e) { serverError(res, e); }
};

exports.updateSetting = async (req, res) => {
  try {
    const { settingValue, description } = req.body || {};
    const update = { settingValue, updatedBy: req.user?._id };
    if (description !== undefined) update.description = description;
    const s = await PredictionSetting().findOneAndUpdate(
      { settingKey: req.params.key },
      update,
      { new: true, upsert: false }
    );
    if (!s) return notFound(res, 'Setting not found');
    ok(res, s);
  } catch (e) { serverError(res, e); }
};

exports.getForecastModels = async (req, res) => {
  try {
    const { forecastType, isActive } = req.query;
    const filter = {};
    if (forecastType) filter.forecastType = forecastType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const models = await AIForecastModel().find(filter).sort({ createdAt: -1 }).lean();
    ok(res, models);
  } catch (e) { serverError(res, e); }
};

exports.createForecastModel = async (req, res) => {
  try {
    const { name, forecastType, algorithm, description, trainingPeriods, hyperparameters } = req.body || {};
    const m = await AIForecastModel().create({ name, forecastType, algorithm, description, trainingPeriods, hyperparameters });
    created(res, m);
  } catch (e) { serverError(res, e); }
};

exports.updateForecastModel = async (req, res) => {
  try {
    const m = await AIForecastModel().findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!m) return notFound(res, 'Forecast model not found');
    ok(res, m);
  } catch (e) { serverError(res, e); }
};

exports.deleteForecastModel = async (req, res) => {
  try {
    await AIForecastModel().findByIdAndDelete(req.params.id);
    ok(res, { deleted: true });
  } catch (e) { serverError(res, e); }
};

exports.getModelPerformance = async (req, res) => {
  try {
    const { forecastType } = req.query;
    const filter = { isActualized: true };
    if (forecastType) filter.forecastType = forecastType;

    const history = await PredictionHistory().find(filter).sort({ createdAt: -1 }).limit(100).lean();

    const byType = {};
    history.forEach(h => {
      if (!byType[h.forecastType]) byType[h.forecastType] = { errors: [], count: 0 };
      if (h.mape !== undefined) byType[h.forecastType].errors.push(h.mape);
      byType[h.forecastType].count++;
    });

    const performance = Object.entries(byType).map(([type, data]) => {
      const avgMAPE = data.errors.length > 0
        ? data.errors.reduce((a, b) => a + b, 0) / data.errors.length
        : null;
      return {
        forecastType: type,
        count: data.count,
        avgMAPE: avgMAPE !== null ? Math.round(avgMAPE * 100) / 100 : null,
        accuracy: avgMAPE !== null ? Math.round((100 - avgMAPE) * 100) / 100 : null,
      };
    });

    ok(res, performance);
  } catch (e) { serverError(res, e); }
};
