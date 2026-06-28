'use strict';
const mongoose = require('mongoose');
const { ok, serverError } = require('../utils/response');

const WFInstance    = () => mongoose.model('WorkflowInstance');
const WFApproval    = () => mongoose.model('WorkflowApproval');
const WFEscalation  = () => mongoose.model('WorkflowEscalation');
const WFStage       = () => mongoose.model('WorkflowStage');
const WFHistory     = () => mongoose.model('WorkflowHistory');
const WFNotif       = () => mongoose.model('WorkflowNotification');
const Workflow      = () => mongoose.model('Workflow');

exports.getBPMDashboard = async (req, res) => {
  try {
    const now = new Date();
    const [
      totalWorkflows,
      activeWorkflows,
      totalInstances,
      activeInstances,
      pendingInstances,
      completedInstances,
      rejectedInstances,
      pendingApprovals,
      openEscalations,
      slaBreachedInstances,
      byModule,
      byPriority,
      completionTrend,
    ] = await Promise.all([
      Workflow().countDocuments({ isDeleted: false }),
      Workflow().countDocuments({ status: 'active', isDeleted: false }),
      WFInstance().countDocuments({ isDeleted: false }),
      WFInstance().countDocuments({ status: 'in_progress', isDeleted: false }),
      WFInstance().countDocuments({ status: 'pending', isDeleted: false }),
      WFInstance().countDocuments({ status: 'completed', isDeleted: false }),
      WFInstance().countDocuments({ status: 'rejected', isDeleted: false }),
      WFApproval().countDocuments({ status: 'pending' }),
      WFEscalation().countDocuments({ status: { $in: ['open', 'acknowledged'] } }),
      WFInstance().countDocuments({ slaBreached: true, isDeleted: false }),
      WFInstance().aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$module', count: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } } } },
      ]),
      WFInstance().aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      WFInstance().aggregate([
        { $match: { status: 'completed', completedAt: { $gte: new Date(now - 30 * 86400000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const completionRate = totalInstances > 0
      ? ((completedInstances / totalInstances) * 100).toFixed(1)
      : 0;

    return ok(res, {
      totalWorkflows,
      activeWorkflows,
      totalInstances,
      activeInstances,
      pendingInstances,
      completedInstances,
      rejectedInstances,
      pendingApprovals,
      openEscalations,
      slaBreachedInstances,
      completionRate: +completionRate,
      byModule,
      byPriority,
      completionTrend,
    });
  } catch (e) { return serverError(res, e); }
};

exports.getWorkflowPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = { isDeleted: false };
    if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;

    const [byWorkflow, avgDuration, statusBreakdown] = await Promise.all([
      WFInstance().aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$workflow',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            slaBreached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
          },
        },
        {
          $lookup: { from: 'workflows', localField: '_id', foreignField: '_id', as: 'workflow' },
        },
        { $unwind: { path: '$workflow', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            workflowName: '$workflow.name',
            module: '$workflow.module',
            total: 1, completed: 1, rejected: 1, slaBreached: 1,
            completionRate: {
              $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 0],
            },
          },
        },
        { $sort: { total: -1 } },
      ]),
      WFInstance().aggregate([
        { $match: { ...filter, status: 'completed', completedAt: { $exists: true }, startedAt: { $exists: true } } },
        {
          $group: {
            _id: '$workflow',
            avgHours: { $avg: { $divide: [{ $subtract: ['$completedAt', '$startedAt'] }, 3600000] } },
          },
        },
        { $lookup: { from: 'workflows', localField: '_id', foreignField: '_id', as: 'workflow' } },
        { $unwind: { path: '$workflow', preserveNullAndEmptyArrays: true } },
        { $project: { workflowName: '$workflow.name', avgHours: { $round: ['$avgHours', 1] } } },
      ]),
      WFInstance().aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return ok(res, { byWorkflow, avgDuration, statusBreakdown });
  } catch (e) { return serverError(res, e); }
};

exports.getApprovalAnalytics = async (req, res) => {
  try {
    const [
      totalApprovals,
      pendingApprovals,
      approvedCount,
      rejectedCount,
      delegatedCount,
      byApprover,
      turnaroundAvg,
      monthlyTrend,
    ] = await Promise.all([
      WFApproval().countDocuments(),
      WFApproval().countDocuments({ status: 'pending' }),
      WFApproval().countDocuments({ status: 'approved' }),
      WFApproval().countDocuments({ status: 'rejected' }),
      WFApproval().countDocuments({ status: 'delegated' }),
      WFApproval().aggregate([
        { $match: { status: { $in: ['approved', 'rejected'] } } },
        {
          $group: {
            _id: '$approver',
            total: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            avgHours: {
              $avg: {
                $cond: [
                  { $and: ['$decidedAt', '$createdAt'] },
                  { $divide: [{ $subtract: ['$decidedAt', '$createdAt'] }, 3600000] },
                  null,
                ],
              },
            },
          },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            approverName: '$user.name',
            total: 1, approved: 1, rejected: 1,
            avgHours: { $round: ['$avgHours', 1] },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
      WFApproval().aggregate([
        { $match: { status: { $in: ['approved', 'rejected'] }, decidedAt: { $exists: true } } },
        {
          $group: {
            _id: null,
            avgTurnaroundHours: {
              $avg: { $divide: [{ $subtract: ['$decidedAt', '$createdAt'] }, 3600000] },
            },
          },
        },
      ]),
      WFApproval().aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 12 },
      ]),
    ]);

    return ok(res, {
      totalApprovals,
      pendingApprovals,
      approvedCount,
      rejectedCount,
      delegatedCount,
      approvalRate: totalApprovals > 0 ? +((approvedCount / totalApprovals) * 100).toFixed(1) : 0,
      avgTurnaroundHours: turnaroundAvg[0] ? +turnaroundAvg[0].avgTurnaroundHours.toFixed(1) : 0,
      byApprover,
      monthlyTrend,
    });
  } catch (e) { return serverError(res, e); }
};

exports.getSLACompliance = async (req, res) => {
  try {
    const [
      totalInstances,
      breachedInstances,
      byModule,
      breachedByModule,
      stageSLABreaches,
    ] = await Promise.all([
      WFInstance().countDocuments({ isDeleted: false }),
      WFInstance().countDocuments({ slaBreached: true, isDeleted: false }),
      WFInstance().aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$module', total: { $sum: 1 }, breached: { $sum: { $cond: ['$slaBreached', 1, 0] } } } },
        {
          $project: {
            total: 1, breached: 1,
            complianceRate: {
              $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: [{ $subtract: ['$total', '$breached'] }, '$total'] }, 100] }, 100],
            },
          },
        },
      ]),
      WFInstance().aggregate([
        { $match: { slaBreached: true, isDeleted: false } },
        { $group: { _id: '$module', count: { $sum: 1 } } },
      ]),
      WFStage().aggregate([
        { $match: { slaBreached: true } },
        { $group: { _id: '$instance', count: { $sum: 1 } } },
        { $count: 'totalStagesBreached' },
      ]),
    ]);

    const complianceRate = totalInstances > 0
      ? +(((totalInstances - breachedInstances) / totalInstances) * 100).toFixed(1)
      : 100;

    return ok(res, {
      totalInstances,
      breachedInstances,
      complianceRate,
      byModule,
      stageSLABreaches: stageSLABreaches[0]?.totalStagesBreached || 0,
    });
  } catch (e) { return serverError(res, e); }
};

exports.getEscalationReport = async (req, res) => {
  try {
    const [total, open, acknowledged, resolved, byLevel, byReason, byModule] = await Promise.all([
      WFEscalation().countDocuments(),
      WFEscalation().countDocuments({ status: 'open' }),
      WFEscalation().countDocuments({ status: 'acknowledged' }),
      WFEscalation().countDocuments({ status: 'resolved' }),
      WFEscalation().aggregate([
        { $group: { _id: '$escalationLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      WFEscalation().aggregate([
        { $group: { _id: '$reason', count: { $sum: 1 } } },
      ]),
      WFEscalation().aggregate([
        {
          $lookup: {
            from: 'workflowinstances',
            localField: 'instance',
            foreignField: '_id',
            as: 'inst',
          },
        },
        { $unwind: { path: '$inst', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$inst.module', count: { $sum: 1 } } },
      ]),
    ]);
    return ok(res, { total, open, acknowledged, resolved, byLevel, byReason, byModule });
  } catch (e) { return serverError(res, e); }
};

exports.getAutomationReport = async (req, res) => {
  try {
    const WFRule = mongoose.model('WorkflowRule');
    const WFTrigger = mongoose.model('WorkflowTrigger');
    const [
      totalRules, activeRules, totalTriggers, activeTriggers,
      rulesByType, triggersByType, topFiredTriggers,
    ] = await Promise.all([
      WFRule.countDocuments({ isDeleted: false }),
      WFRule.countDocuments({ isActive: true, isDeleted: false }),
      WFTrigger.countDocuments({ isDeleted: false }),
      WFTrigger.countDocuments({ isActive: true, isDeleted: false }),
      WFRule.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$ruleType', count: { $sum: 1 }, totalFires: { $sum: '$fireCount' } } },
      ]),
      WFTrigger.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$triggerType', count: { $sum: 1 } } },
      ]),
      WFTrigger.find({ isDeleted: false }).sort({ fireCount: -1 }).limit(5)
        .populate('workflow', 'name').lean(),
    ]);
    return ok(res, { totalRules, activeRules, totalTriggers, activeTriggers, rulesByType, triggersByType, topFiredTriggers });
  } catch (e) { return serverError(res, e); }
};

exports.getAuditTrail = async (req, res) => {
  try {
    const { instance, performedBy, action, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (instance) filter.instance = instance;
    if (performedBy) filter.performedBy = performedBy;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      WFHistory().find(filter)
        .populate('instance', 'instanceCode title')
        .populate('performedBy', 'name email')
        .sort({ timestamp: -1 }).skip(skip).limit(+limit).lean(),
      WFHistory().countDocuments(filter),
    ]);
    return ok(res, { data, total, page: +page, limit: +limit });
  } catch (e) { return serverError(res, e); }
};

exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const byDept = await WFInstance().aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'workflowapprovals',
          localField: '_id',
          foreignField: 'instance',
          as: 'approvals',
        },
      },
      {
        $unwind: { path: '$approvals', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'approvals.approver',
          foreignField: '_id',
          as: 'approverUser',
        },
      },
      { $unwind: { path: '$approverUser', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$module',
          totalInstances: { $addToSet: '$_id' },
          pendingApprovals: { $sum: { $cond: [{ $eq: ['$approvals.status', 'pending'] }, 1, 0] } },
          completedApprovals: { $sum: { $cond: [{ $eq: ['$approvals.status', 'approved'] }, 1, 0] } },
        },
      },
      {
        $project: {
          module: '$_id',
          totalInstances: { $size: '$totalInstances' },
          pendingApprovals: 1,
          completedApprovals: 1,
        },
      },
      { $sort: { totalInstances: -1 } },
    ]);
    return ok(res, { byDept });
  } catch (e) { return serverError(res, e); }
};
