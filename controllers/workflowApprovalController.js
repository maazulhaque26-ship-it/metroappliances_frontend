'use strict';
const mongoose = require('mongoose');
const { ok, created, notFound, serverError, paginated } = require('../utils/response');
const { emit } = require('../utils/socket');

const WFApproval = () => mongoose.model('WorkflowApproval');
const WFInstance = () => mongoose.model('WorkflowInstance');
const WFStage    = () => mongoose.model('WorkflowStage');
const WFAction   = () => mongoose.model('WorkflowAction');

async function logAction(instanceId, stageId, stepId, actionType, performedBy, targetUser, remarks) {
  await mongoose.model('WorkflowAction').create({
    instance: instanceId,
    stage: stageId,
    step: stepId,
    actionType,
    performedBy,
    targetUser,
    remarks,
  });
  await mongoose.model('WorkflowHistory').create({
    instance: instanceId,
    stage: stageId,
    action: actionType,
    performedBy,
    remarks,
    timestamp: new Date(),
  });
}

async function checkAndAdvanceInstance(instanceId, io) {
  const inst = await mongoose.model('WorkflowInstance').findById(instanceId).lean();
  if (!inst || inst.status === 'completed' || inst.status === 'rejected') return;

  const currentStage = await mongoose.model('WorkflowStage').findOne({
    instance: instanceId, status: 'in_progress',
  }).lean();

  if (!currentStage) {
    // All stages done
    const pendingStage = await mongoose.model('WorkflowStage').findOne({
      instance: instanceId, status: 'pending',
    }).sort({ order: 1 });

    if (!pendingStage) {
      // Workflow complete
      await mongoose.model('WorkflowInstance').findByIdAndUpdate(instanceId, {
        status: 'completed', completedAt: new Date(),
      });
      emit(io, 'workflow:instance_completed', { instanceId, instanceCode: inst.instanceCode });
    } else {
      // Advance to next stage
      await pendingStage.updateOne({ status: 'in_progress', startedAt: new Date() });
      await mongoose.model('WorkflowInstance').findByIdAndUpdate(instanceId, {
        currentStep: pendingStage.order,
      });
      emit(io, 'workflow:stage_assigned', { instanceId, stageId: pendingStage._id });
    }
  }
}

// ── Approvals ─────────────────────────────────────────────────────────────────
exports.listApprovals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      WFApproval().find(filter)
        .populate('instance', 'instanceCode title status module priority')
        .populate('approver', 'name email')
        .populate('delegatedTo', 'name email')
        .sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
      WFApproval().countDocuments(filter),
    ]);
    return paginated(res, data, +page, +limit, total);
  } catch (e) { return serverError(res, e); }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const data = await WFApproval().find({ approver: req.user._id, status: 'pending' })
      .populate('instance', 'instanceCode title module priority dueDate')
      .populate('stage', 'name order')
      .sort({ createdAt: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.getApproval = async (req, res) => {
  try {
    const doc = await WFApproval().findById(req.params.id)
      .populate('instance', 'instanceCode title module priority')
      .populate('approver', 'name email')
      .populate('stage', 'name order')
      .lean();
    if (!doc) return notFound(res, 'WorkflowApproval');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.approveStep = async (req, res) => {
  try {
    const { remarks } = req.body;
    const approval = await WFApproval().findOneAndUpdate(
      { _id: req.params.id, approver: req.user._id, status: 'pending' },
      { status: 'approved', decidedAt: new Date(), remarks },
      { new: true }
    );
    if (!approval) return notFound(res, 'WorkflowApproval');

    // Update stage assignee status
    await mongoose.model('WorkflowStage').updateOne(
      { _id: approval.stage, 'assignees.user': req.user._id },
      { $set: { 'assignees.$.status': 'approved', 'assignees.$.decidedAt': new Date(), 'assignees.$.remarks': remarks } }
    );

    // Check if all required approvals in stage are done
    const pendingApprovals = await WFApproval().countDocuments({
      stage: approval.stage, status: 'pending',
    });

    if (pendingApprovals === 0) {
      await mongoose.model('WorkflowStage').findByIdAndUpdate(approval.stage, {
        status: 'completed', completedAt: new Date(),
      });
      await checkAndAdvanceInstance(approval.instance, req.app.locals.io);
    }

    await logAction(approval.instance, approval.stage, approval.step, 'approve', req.user._id, null, remarks);
    emit(req.app.locals.io, 'workflow:step_approved', { instance: approval.instance, approver: req.user.name });
    return ok(res, approval);
  } catch (e) { return serverError(res, e); }
};

exports.rejectStep = async (req, res) => {
  try {
    const { remarks } = req.body;
    const approval = await WFApproval().findOneAndUpdate(
      { _id: req.params.id, approver: req.user._id, status: 'pending' },
      { status: 'rejected', decidedAt: new Date(), remarks },
      { new: true }
    );
    if (!approval) return notFound(res, 'WorkflowApproval');

    await mongoose.model('WorkflowStage').findByIdAndUpdate(approval.stage, {
      status: 'rejected', completedAt: new Date(),
    });
    await mongoose.model('WorkflowInstance').findByIdAndUpdate(approval.instance, {
      status: 'rejected',
    });

    await logAction(approval.instance, approval.stage, approval.step, 'reject', req.user._id, null, remarks);
    emit(req.app.locals.io, 'workflow:step_rejected', { instance: approval.instance, rejectedBy: req.user.name });
    return ok(res, approval);
  } catch (e) { return serverError(res, e); }
};

exports.delegateApproval = async (req, res) => {
  try {
    const { delegateTo, remarks } = req.body;
    const approval = await WFApproval().findOneAndUpdate(
      { _id: req.params.id, approver: req.user._id, status: 'pending' },
      { status: 'delegated', delegatedTo: delegateTo, remarks },
      { new: true }
    );
    if (!approval) return notFound(res, 'WorkflowApproval');

    // Create new approval for delegate
    await WFApproval().create({
      instance: approval.instance,
      stage: approval.stage,
      step: approval.step,
      approver: delegateTo,
      approvalMode: approval.approvalMode,
      dueDate: approval.dueDate,
    });

    await logAction(approval.instance, approval.stage, approval.step, 'delegate', req.user._id, delegateTo, remarks);
    emit(req.app.locals.io, 'workflow:approval_delegated', { instance: approval.instance, delegatedTo });
    return ok(res, approval);
  } catch (e) { return serverError(res, e); }
};

exports.recallApproval = async (req, res) => {
  try {
    const approval = await WFApproval().findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'recalled' },
      { new: true }
    );
    if (!approval) return notFound(res, 'WorkflowApproval');
    await logAction(approval.instance, approval.stage, approval.step, 'return', req.user._id, null, 'Approval recalled');
    return ok(res, approval);
  } catch (e) { return serverError(res, e); }
};

exports.bulkApprove = async (req, res) => {
  try {
    const { approvalIds, remarks } = req.body;
    const results = [];
    for (const id of approvalIds) {
      const approval = await WFApproval().findOneAndUpdate(
        { _id: id, approver: req.user._id, status: 'pending' },
        { status: 'approved', decidedAt: new Date(), remarks: remarks || 'Bulk approved' },
        { new: true }
      );
      if (approval) {
        const pendingApprovals = await WFApproval().countDocuments({ stage: approval.stage, status: 'pending' });
        if (pendingApprovals === 0) {
          await mongoose.model('WorkflowStage').findByIdAndUpdate(approval.stage, { status: 'completed', completedAt: new Date() });
          await checkAndAdvanceInstance(approval.instance, req.app.locals.io);
        }
        results.push(approval);
      }
    }
    return ok(res, { approved: results.length, results });
  } catch (e) { return serverError(res, e); }
};

exports.overrideApproval = async (req, res) => {
  try {
    const { decision, remarks } = req.body;
    const approval = await WFApproval().findByIdAndUpdate(
      req.params.id,
      { status: decision, isOverridden: true, overriddenBy: req.user._id, remarks, decidedAt: new Date() },
      { new: true }
    );
    if (!approval) return notFound(res, 'WorkflowApproval');
    if (decision === 'approved') {
      const pendingApprovals = await WFApproval().countDocuments({ stage: approval.stage, status: 'pending' });
      if (pendingApprovals === 0) {
        await mongoose.model('WorkflowStage').findByIdAndUpdate(approval.stage, { status: 'completed', completedAt: new Date() });
        await checkAndAdvanceInstance(approval.instance, req.app.locals.io);
      }
    } else if (decision === 'rejected') {
      await mongoose.model('WorkflowInstance').findByIdAndUpdate(approval.instance, { status: 'rejected' });
    }
    await logAction(approval.instance, approval.stage, approval.step, 'override', req.user._id, null, remarks);
    return ok(res, approval);
  } catch (e) { return serverError(res, e); }
};

exports.getApprovalHistory = async (req, res) => {
  try {
    const data = await WFAction().find({ instance: req.params.instanceId, actionType: { $in: ['approve','reject','delegate','override','return'] } })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};
