const mongoose = require('mongoose');
const { ok, notFound, serverError, fail } = require('../utils/response');
const { emit } = require('../utils/socket');

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

const AIRecommendation = () => mongoose.model('AIRecommendation');

// ── Inventory Recommendations ─────────────────────────────────────────────────
exports.generateInventoryRecommendations = async (req, res) => {
  try {
    const [lowStock, overstock] = await Promise.all([
      safeCount('Inventory', { quantity: { $lte: 10, $gt: 0 } }),
      safeAgg('Inventory', [{ $group: { _id: null, overstock: { $sum: { $cond: [{ $gt: ['$quantity', 200] }, 1, 0] } } } }]),
    ]);

    const recs = [];
    const over = overstock[0]?.overstock || 0;

    if (lowStock > 5) {
      const r = await AIRecommendation().create({
        type: 'inventory', module: 'inventory',
        title: 'Replenish Low Stock Items',
        description: `${lowStock} SKUs are below minimum stock threshold. Initiate purchase orders immediately to prevent stockouts.`,
        priority: lowStock > 20 ? 'critical' : 'high',
        confidence: 85,
        estimatedImpact: { type: 'risk_reduction', value: lowStock, unit: 'stockouts_prevented' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'inventory', recId: r._id, priority: r.priority });
    }

    if (over > 10) {
      const r = await AIRecommendation().create({
        type: 'inventory', module: 'inventory',
        title: 'Reduce Overstock to Free Working Capital',
        description: `${over} SKUs have excess inventory. Consider promotions or redistribution to free up capital.`,
        priority: 'medium',
        confidence: 75,
        estimatedImpact: { type: 'cost_reduction', value: over * 1000, unit: 'INR' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'inventory', recId: r._id, priority: r.priority });
    }

    ok(res, { generated: recs.length, recommendations: recs });
  } catch (e) { serverError(res, e); }
};

// ── Production Recommendations ────────────────────────────────────────────────
exports.generateProductionRecommendations = async (req, res) => {
  try {
    const [machineDown, delayedOrders, qualityIssues] = await Promise.all([
      safeCount('Machine', { status: 'breakdown' }),
      safeCount('ProductionOrder', { status: 'delayed' }),
      safeCount('QualityCheck', { status: 'failed', createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
    ]);

    const recs = [];

    if (machineDown > 0) {
      const r = await AIRecommendation().create({
        type: 'maintenance', module: 'manufacturing',
        title: 'Emergency Machine Maintenance Required',
        description: `${machineDown} machine(s) are currently in breakdown state. Schedule immediate maintenance to restore production capacity.`,
        priority: 'critical',
        confidence: 95,
        estimatedImpact: { type: 'production_recovery', value: machineDown, unit: 'machines' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'maintenance', recId: r._id, priority: 'critical' });
    }

    if (delayedOrders > 3) {
      const r = await AIRecommendation().create({
        type: 'production', module: 'manufacturing',
        title: 'Production Schedule Realignment Needed',
        description: `${delayedOrders} production orders are delayed. Review and realign production schedule, prioritize urgent orders.`,
        priority: 'high',
        confidence: 80,
        estimatedImpact: { type: 'delivery_improvement', value: delayedOrders, unit: 'orders' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'production', recId: r._id, priority: 'high' });
    }

    if (qualityIssues > 5) {
      const r = await AIRecommendation().create({
        type: 'production', module: 'manufacturing',
        title: 'Quality Control Process Review',
        description: `${qualityIssues} quality checks failed in the last 30 days. Review QC processes and retrain staff.`,
        priority: 'medium',
        confidence: 78,
        estimatedImpact: { type: 'quality_improvement', value: qualityIssues, unit: 'defects_reduced' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'production', recId: r._id, priority: 'medium' });
    }

    ok(res, { generated: recs.length, recommendations: recs });
  } catch (e) { serverError(res, e); }
};

// ── HR Recommendations ────────────────────────────────────────────────────────
exports.generateHRRecommendations = async (req, res) => {
  try {
    const [headcount, openPositions, pendingLeaves, expiredTrainings] = await Promise.all([
      safeCount('Employee', { isActive: true }),
      safeCount('JobOpening', { status: 'open' }),
      safeCount('LeaveRequest', { status: 'pending' }),
      safeCount('TrainingEnrollment', { status: 'enrolled', dueDate: { $lt: new Date() } }),
    ]);

    const recs = [];

    if (openPositions > headcount * 0.1) {
      const r = await AIRecommendation().create({
        type: 'hiring', module: 'hrms',
        title: 'Accelerate Recruitment for Open Positions',
        description: `${openPositions} positions remain open (${Math.round(openPositions/headcount*100)}% of workforce). Talent gap may impact productivity.`,
        priority: openPositions > headcount * 0.2 ? 'high' : 'medium',
        confidence: 82,
        estimatedImpact: { type: 'capacity_increase', value: openPositions, unit: 'headcount' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'hiring', recId: r._id, priority: r.priority });
    }

    if (pendingLeaves > 20) {
      const r = await AIRecommendation().create({
        type: 'training', module: 'hrms',
        title: 'Clear Leave Approval Backlog',
        description: `${pendingLeaves} leave requests are pending approval. Delays impact employee morale and planning.`,
        priority: 'medium',
        confidence: 90,
        estimatedImpact: { type: 'morale_improvement', value: pendingLeaves, unit: 'employees' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'training', recId: r._id, priority: 'medium' });
    }

    if (expiredTrainings > 0) {
      const r = await AIRecommendation().create({
        type: 'training', module: 'hrms',
        title: 'Complete Overdue Training Enrollments',
        description: `${expiredTrainings} training enrollments are past due date. Risk of compliance and skill gaps.`,
        priority: 'medium',
        confidence: 85,
        estimatedImpact: { type: 'compliance', value: expiredTrainings, unit: 'overdue_trainings' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'training', recId: r._id, priority: 'medium' });
    }

    ok(res, { generated: recs.length, recommendations: recs });
  } catch (e) { serverError(res, e); }
};

// ── Maintenance Recommendations ───────────────────────────────────────────────
exports.generateMaintenanceRecommendations = async (req, res) => {
  try {
    const [openWO, overdueWO, assetsHighRisk] = await Promise.all([
      safeCount('MaintenanceWorkOrder', { status: 'open' }),
      safeCount('MaintenanceWorkOrder', { status: 'open', dueDate: { $lt: new Date() } }),
      safeCount('Asset', { riskScore: { $gte: 70 } }),
    ]);

    const recs = [];

    if (overdueWO > 0) {
      const r = await AIRecommendation().create({
        type: 'maintenance', module: 'eam',
        title: 'Address Overdue Maintenance Work Orders',
        description: `${overdueWO} maintenance work orders are past due. Deferred maintenance increases failure risk.`,
        priority: overdueWO > 5 ? 'critical' : 'high',
        confidence: 90,
        estimatedImpact: { type: 'risk_reduction', value: overdueWO, unit: 'overdue_orders' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'maintenance', recId: r._id, priority: r.priority });
    }

    if (assetsHighRisk > 0) {
      const r = await AIRecommendation().create({
        type: 'maintenance', module: 'eam',
        title: 'Schedule Preventive Maintenance for High-Risk Assets',
        description: `${assetsHighRisk} assets have risk score ≥70. Preventive maintenance now can avoid costly breakdowns.`,
        priority: 'high',
        confidence: 80,
        estimatedImpact: { type: 'downtime_prevention', value: assetsHighRisk, unit: 'assets' },
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'maintenance', recId: r._id, priority: 'high' });
    }

    ok(res, { generated: recs.length, recommendations: recs });
  } catch (e) { serverError(res, e); }
};

// ── Generate All Recommendations ──────────────────────────────────────────────
exports.generateAllRecommendations = async (req, res) => {
  try {
    const [lowStock, machineDown, openPositions, overdueWO, arOverdue] = await Promise.all([
      safeCount('Inventory', { quantity: { $lte: 10, $gt: 0 } }),
      safeCount('Machine', { status: 'breakdown' }),
      safeCount('JobOpening', { status: 'open' }),
      safeCount('MaintenanceWorkOrder', { status: 'open', dueDate: { $lt: new Date() } }),
      safeAgg('CustomerInvoice', [{ $match: { status: 'overdue' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);

    const recs = [];
    const ar = arOverdue[0] || { total: 0 };

    if (lowStock > 5) {
      const r = await AIRecommendation().create({
        type: 'inventory', module: 'inventory',
        title: 'Replenish Low Stock Items',
        description: `${lowStock} SKUs are below minimum threshold. Initiate purchase orders to prevent stockouts.`,
        priority: lowStock > 20 ? 'critical' : 'high', confidence: 85,
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'inventory', recId: r._id, priority: r.priority });
    }

    if (machineDown > 0) {
      const r = await AIRecommendation().create({
        type: 'maintenance', module: 'manufacturing',
        title: 'Emergency Machine Maintenance Required',
        description: `${machineDown} machine(s) are in breakdown. Restore production capacity immediately.`,
        priority: 'critical', confidence: 95,
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'maintenance', recId: r._id, priority: 'critical' });
    }

    if (ar.total > 200000) {
      const r = await AIRecommendation().create({
        type: 'cashflow', module: 'finance',
        title: 'Expedite Overdue Invoice Collections',
        description: `₹${ar.total.toLocaleString()} in overdue AR. Initiate collections process to improve cash position.`,
        priority: ar.total > 500000 ? 'critical' : 'high', confidence: 88,
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'cashflow', recId: r._id, priority: r.priority });
    }

    if (openPositions > 5) {
      const r = await AIRecommendation().create({
        type: 'hiring', module: 'hrms',
        title: 'Accelerate Open Position Recruitment',
        description: `${openPositions} roles remain unfilled. Productivity and delivery risk increasing.`,
        priority: 'medium', confidence: 80,
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'hiring', recId: r._id, priority: 'medium' });
    }

    if (overdueWO > 0) {
      const r = await AIRecommendation().create({
        type: 'maintenance', module: 'eam',
        title: 'Address Overdue Maintenance Work Orders',
        description: `${overdueWO} maintenance WOs are past due. Deferred maintenance increases failure risk.`,
        priority: overdueWO > 5 ? 'high' : 'medium', confidence: 90,
      });
      recs.push(r);
      emit(req.app?.locals?.io, 'ai:recommendation_created', { type: 'maintenance', recId: r._id, priority: r.priority });
    }

    ok(res, { generated: recs.length, recommendations: recs, scannedModules: ['inventory','manufacturing','finance','hrms','eam'] });
  } catch (e) { serverError(res, e); }
};

// ── List & CRUD ───────────────────────────────────────────────────────────────
exports.listRecommendations = async (req, res) => {
  try {
    const { type, priority, status, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (type)     filter.type = type;
    if (priority) filter.priority = priority;
    if (status)   filter.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      AIRecommendation().find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      AIRecommendation().countDocuments(filter),
    ]);
    ok(res, { data, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { serverError(res, e); }
};

exports.updateRecommendationStatus = async (req, res) => {
  try {
    const { status, note } = req.body || {};
    const allowed = ['pending','accepted','rejected','implemented','dismissed'];
    if (!allowed.includes(status)) return fail(res, 'Invalid status');
    const update = { status };
    if (status === 'implemented') { update.implementedAt = new Date(); update.implementedBy = req.user?._id; }
    const r = await AIRecommendation().findByIdAndUpdate(req.params.id, update, { new: true });
    if (!r) return notFound(res, 'Recommendation not found');
    ok(res, r);
  } catch (e) { serverError(res, e); }
};

exports.getRecommendationStats = async (req, res) => {
  try {
    const [byType, byPriority, byStatus, total] = await Promise.all([
      AIRecommendation().aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      AIRecommendation().aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      AIRecommendation().aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      AIRecommendation().countDocuments({}),
    ]);
    const implementedCount = byStatus.find(s => s._id === 'implemented')?.count || 0;
    const implementationRate = total > 0 ? Math.round((implementedCount / total) * 100) : 0;
    ok(res, { byType, byPriority, byStatus, total, implementedCount, implementationRate });
  } catch (e) { serverError(res, e); }
};
