const mongoose = require('mongoose');
const { ok, notFound, serverError } = require('../utils/response');
const { emit } = require('../utils/socket');

const tryM = (name) => { try { return mongoose.model(name); } catch { return null; } };
const safeAgg = async (model, pipeline, fallback = []) => {
  const M = tryM(model);
  if (!M) return fallback;
  try { return await M.aggregate(pipeline); } catch { return fallback; }
};
const safeCount = async (model, filter = {}) => {
  const M = tryM(model);
  if (!M) return 0;
  try { return await M.countDocuments(filter); } catch { return 0; }
};

const AnomalyDetection = () => mongoose.model('AnomalyDetection');
const AIRecommendation = () => mongoose.model('AIRecommendation');

// ── Demand Anomalies ──────────────────────────────────────────────────────────
exports.detectDemandAnomalies = async (req, res) => {
  try {
    const recent30 = new Date(Date.now() - 30 * 86400000);
    const prev30   = new Date(Date.now() - 60 * 86400000);

    const [recentOrders, prevOrders] = await Promise.all([
      safeAgg('Order', [
        { $match: { createdAt: { $gte: recent30 } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      ]),
      safeAgg('Order', [
        { $match: { createdAt: { $gte: prev30, $lt: recent30 } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const anomalies = [];
    const recent = recentOrders[0] || { count: 0, revenue: 0 };
    const prev   = prevOrders[0]   || { count: 0, revenue: 0 };

    if (prev.count > 0) {
      const deviation = ((recent.count - prev.count) / prev.count) * 100;
      if (Math.abs(deviation) > 20) {
        const type = deviation > 0 ? 'demand_spike' : 'sales_drop';
        const severity = Math.abs(deviation) > 50 ? 'critical' : Math.abs(deviation) > 30 ? 'high' : 'medium';
        const a = await AnomalyDetection().create({
          type, module: 'orders', metric: 'order_count',
          actualValue: recent.count, expectedValue: prev.count,
          deviation: Math.round(deviation * 100) / 100,
          deviationPct: Math.round(Math.abs(deviation) * 100) / 100,
          severity,
          description: `Order count ${deviation > 0 ? 'surged' : 'dropped'} by ${Math.abs(deviation).toFixed(1)}% vs previous 30 days`,
        });
        anomalies.push(a);
        emit(req.app?.locals?.io, 'ai:anomaly_detected', { type, severity, anomalyId: a._id });
      }
    }

    ok(res, { detected: anomalies.length, anomalies });
  } catch (e) { serverError(res, e); }
};

// ── Inventory Anomalies ───────────────────────────────────────────────────────
exports.detectInventoryAnomalies = async (req, res) => {
  try {
    const [lowStock, overstock, totalItems] = await Promise.all([
      safeCount('Inventory', { quantity: { $lte: 5, $gt: 0 } }),
      safeAgg('Inventory', [
        { $group: { _id: null, total: { $sum: 1 }, highStock: { $sum: { $cond: [{ $gt: ['$quantity', 500] }, 1, 0] } } } },
      ]),
      safeCount('Inventory', {}),
    ]);

    const anomalies = [];
    const inv = overstock[0] || { total: 0, highStock: 0 };

    if (lowStock > totalItems * 0.25) {
      const severity = lowStock > totalItems * 0.5 ? 'critical' : 'high';
      const a = await AnomalyDetection().create({
        type: 'inventory_shortage', module: 'inventory', metric: 'low_stock_count',
        actualValue: lowStock, expectedValue: Math.round(totalItems * 0.05),
        deviation: lowStock - Math.round(totalItems * 0.05),
        deviationPct: Math.round(((lowStock - Math.round(totalItems * 0.05)) / Math.max(1, totalItems)) * 100),
        severity,
        description: `${lowStock} SKUs at critically low stock (${Math.round(lowStock/totalItems*100)}% of inventory)`,
      });
      anomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'inventory_shortage', severity, anomalyId: a._id });
    }

    if (inv.highStock > totalItems * 0.2) {
      const a = await AnomalyDetection().create({
        type: 'overstock', module: 'inventory', metric: 'overstock_count',
        actualValue: inv.highStock, expectedValue: Math.round(totalItems * 0.05),
        deviation: inv.highStock - Math.round(totalItems * 0.05),
        deviationPct: Math.round(((inv.highStock / totalItems) * 100)),
        severity: 'medium',
        description: `${inv.highStock} SKUs in overstock condition`,
      });
      anomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'overstock', severity: 'medium', anomalyId: a._id });
    }

    ok(res, { detected: anomalies.length, anomalies });
  } catch (e) { serverError(res, e); }
};

// ── Cash Flow Anomalies ───────────────────────────────────────────────────────
exports.detectCashAnomalies = async (req, res) => {
  try {
    const [arOverdue, bankLow] = await Promise.all([
      safeAgg('CustomerInvoice', [
        { $match: { status: 'overdue' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
      ]),
      safeAgg('BankAccount', [
        { $group: { _id: null, minBalance: { $min: '$currentBalance' }, avgBalance: { $avg: '$currentBalance' } } },
      ]),
    ]);

    const anomalies = [];
    const ar   = arOverdue[0] || { count: 0, total: 0 };
    const bank = bankLow[0]   || { minBalance: 999999, avgBalance: 999999 };

    if (ar.count > 5 || ar.total > 100000) {
      const severity = ar.total > 500000 ? 'critical' : ar.total > 200000 ? 'high' : 'medium';
      const a = await AnomalyDetection().create({
        type: 'cash_shortage', module: 'finance', metric: 'overdue_ar',
        actualValue: ar.total, expectedValue: 0,
        deviation: ar.total, deviationPct: 100,
        severity,
        description: `${ar.count} overdue invoices totalling ₹${ar.total.toLocaleString()}`,
      });
      anomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'cash_shortage', severity, anomalyId: a._id });
    }

    if (bank.minBalance < bank.avgBalance * 0.2 && bank.minBalance < 50000) {
      const a = await AnomalyDetection().create({
        type: 'cash_shortage', module: 'banking', metric: 'low_bank_balance',
        actualValue: bank.minBalance, expectedValue: Math.round(bank.avgBalance * 0.3),
        deviation: bank.minBalance - Math.round(bank.avgBalance * 0.3),
        deviationPct: Math.round(((bank.avgBalance * 0.3 - bank.minBalance) / bank.avgBalance) * 100),
        severity: 'high',
        description: `Bank balance critically low: ₹${bank.minBalance.toLocaleString()}`,
      });
      anomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'cash_shortage', severity: 'high', anomalyId: a._id });
    }

    ok(res, { detected: anomalies.length, anomalies });
  } catch (e) { serverError(res, e); }
};

// ── Production Anomalies ──────────────────────────────────────────────────────
exports.detectProductionAnomalies = async (req, res) => {
  try {
    const [machineDown, delayedOrders] = await Promise.all([
      safeCount('Machine', { status: 'breakdown' }),
      safeCount('ProductionOrder', { status: 'delayed' }),
    ]);

    const anomalies = [];

    if (machineDown > 0) {
      const severity = machineDown > 5 ? 'critical' : machineDown > 2 ? 'high' : 'medium';
      const a = await AnomalyDetection().create({
        type: 'machine_downtime', module: 'manufacturing', metric: 'machine_breakdown_count',
        actualValue: machineDown, expectedValue: 0,
        deviation: machineDown, deviationPct: 100,
        severity,
        description: `${machineDown} machine(s) currently in breakdown state`,
      });
      anomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'machine_downtime', severity, anomalyId: a._id });
    }

    if (delayedOrders > 0) {
      const severity = delayedOrders > 10 ? 'high' : 'medium';
      const a = await AnomalyDetection().create({
        type: 'project_delay', module: 'manufacturing', metric: 'delayed_production_orders',
        actualValue: delayedOrders, expectedValue: 0,
        deviation: delayedOrders, deviationPct: 100,
        severity,
        description: `${delayedOrders} production orders are delayed`,
      });
      anomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'project_delay', severity, anomalyId: a._id });
    }

    ok(res, { detected: anomalies.length, anomalies });
  } catch (e) { serverError(res, e); }
};

// ── Detect All Anomalies ──────────────────────────────────────────────────────
exports.detectAllAnomalies = async (req, res) => {
  try {
    const invoke = async (handler) => {
      try {
        const r = await new Promise((resolve) => {
          const mock = { json: resolve };
          handler(req, mock);
        });
        return r?.data?.anomalies || [];
      } catch { return []; }
    };

    const recent30 = new Date(Date.now() - 30 * 86400000);
    const prev30   = new Date(Date.now() - 60 * 86400000);

    const [recentOrders, prevOrders, lowStock, arOverdue, machineDown, delayedOrders] = await Promise.all([
      safeAgg('Order', [{ $match: { createdAt: { $gte: recent30 } } }, { $group: { _id: null, count: { $sum: 1 } } }]),
      safeAgg('Order', [{ $match: { createdAt: { $gte: prev30, $lt: recent30 } } }, { $group: { _id: null, count: { $sum: 1 } } }]),
      safeCount('Inventory', { quantity: { $lte: 5, $gt: 0 } }),
      safeAgg('CustomerInvoice', [{ $match: { status: 'overdue' } }, { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }]),
      safeCount('Machine', { status: 'breakdown' }),
      safeCount('ProductionOrder', { status: 'delayed' }),
    ]);

    const recent = recentOrders[0] || { count: 0 };
    const prev   = prevOrders[0]   || { count: 0 };
    const ar     = arOverdue[0]    || { count: 0, total: 0 };

    const allAnomalies = [];

    if (prev.count > 0 && Math.abs(((recent.count - prev.count) / prev.count) * 100) > 20) {
      const deviation = ((recent.count - prev.count) / prev.count) * 100;
      const type = deviation > 0 ? 'demand_spike' : 'sales_drop';
      const severity = Math.abs(deviation) > 50 ? 'critical' : Math.abs(deviation) > 30 ? 'high' : 'medium';
      const a = await AnomalyDetection().create({
        type, module: 'orders', metric: 'order_count',
        actualValue: recent.count, expectedValue: prev.count,
        deviation: Math.round(deviation * 100) / 100,
        deviationPct: Math.round(Math.abs(deviation) * 100) / 100,
        severity,
        description: `Order count ${deviation > 0 ? 'surged' : 'dropped'} by ${Math.abs(deviation).toFixed(1)}% vs prior 30 days`,
      });
      allAnomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type, severity, anomalyId: a._id });
    }

    if (lowStock > 10) {
      const a = await AnomalyDetection().create({
        type: 'inventory_shortage', module: 'inventory', metric: 'low_stock_count',
        actualValue: lowStock, expectedValue: 0, deviation: lowStock, deviationPct: 100,
        severity: lowStock > 30 ? 'critical' : 'high',
        description: `${lowStock} SKUs at critically low stock`,
      });
      allAnomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'inventory_shortage', severity: a.severity, anomalyId: a._id });
    }

    if (ar.total > 100000) {
      const severity = ar.total > 500000 ? 'critical' : 'high';
      const a = await AnomalyDetection().create({
        type: 'cash_shortage', module: 'finance', metric: 'overdue_ar',
        actualValue: ar.total, expectedValue: 0, deviation: ar.total, deviationPct: 100,
        severity,
        description: `${ar.count} overdue invoices totalling ₹${ar.total.toLocaleString()}`,
      });
      allAnomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'cash_shortage', severity, anomalyId: a._id });
    }

    if (machineDown > 0) {
      const severity = machineDown > 3 ? 'critical' : 'high';
      const a = await AnomalyDetection().create({
        type: 'machine_downtime', module: 'manufacturing', metric: 'machine_breakdown_count',
        actualValue: machineDown, expectedValue: 0, deviation: machineDown, deviationPct: 100,
        severity,
        description: `${machineDown} machine(s) in breakdown`,
      });
      allAnomalies.push(a);
      emit(req.app?.locals?.io, 'ai:anomaly_detected', { type: 'machine_downtime', severity, anomalyId: a._id });
    }

    ok(res, { detected: allAnomalies.length, anomalies: allAnomalies, scannedModules: ['orders','inventory','finance','manufacturing'] });
  } catch (e) { serverError(res, e); }
};

// ── List & Stats ──────────────────────────────────────────────────────────────
exports.listAnomalies = async (req, res) => {
  try {
    const { type, severity, module, isResolved, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (type)     filter.type = type;
    if (severity) filter.severity = severity;
    if (module)   filter.module = module;
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      AnomalyDetection().find(filter).sort({ detectedAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      AnomalyDetection().countDocuments(filter),
    ]);
    ok(res, { data, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { serverError(res, e); }
};

exports.resolveAnomaly = async (req, res) => {
  try {
    const { resolutionNote } = req.body || {};
    const a = await AnomalyDetection().findByIdAndUpdate(
      req.params.id,
      { isResolved: true, resolvedAt: new Date(), resolvedBy: req.user?._id, resolutionNote },
      { new: true }
    );
    if (!a) return notFound(res, 'Anomaly not found');
    ok(res, a);
  } catch (e) { serverError(res, e); }
};

exports.getAnomalyStats = async (req, res) => {
  try {
    const [bySeverity, byType, byModule, recentCount] = await Promise.all([
      AnomalyDetection().aggregate([{ $group: { _id: '$severity', count: { $sum: 1 }, unresolved: { $sum: { $cond: ['$isResolved', 0, 1] } } } }]),
      AnomalyDetection().aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      AnomalyDetection().aggregate([{ $group: { _id: '$module', count: { $sum: 1 } } }]),
      AnomalyDetection().countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } }),
    ]);
    ok(res, { bySeverity, byType, byModule, recentCount, last7Days: recentCount });
  } catch (e) { serverError(res, e); }
};
