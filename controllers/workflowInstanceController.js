'use strict';
const mongoose = require('mongoose');
const { ok, created, notFound, serverError, paginated } = require('../utils/response');
const { emit } = require('../utils/socket');

const WFInstance   = () => mongoose.model('WorkflowInstance');
const WFStage      = () => mongoose.model('WorkflowStage');
const WFStep       = () => mongoose.model('WorkflowStep');
const WFHistory    = () => mongoose.model('WorkflowHistory');
const WFComment    = () => mongoose.model('WorkflowComment');
const WFAttachment = () => mongoose.model('WorkflowAttachment');
const WFApproval   = () => mongoose.model('WorkflowApproval');

async function logHistory(instanceId, action, userId, fromStatus, toStatus, remarks) {
  await mongoose.model('WorkflowHistory').create({
    instance: instanceId,
    action,
    performedBy: userId,
    fromStatus,
    toStatus,
    remarks,
    timestamp: new Date(),
  });
}

// ── Instances ─────────────────────────────────────────────────────────────────
exports.listInstances = async (req, res) => {
  try {
    const { status, module: mod, priority, page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (mod) filter.module = mod;
    if (priority) filter.priority = priority;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      WFInstance().find(filter)
        .populate('workflow', 'name module category')
        .populate('initiatedBy', 'name email')
        .sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
      WFInstance().countDocuments(filter),
    ]);
    return paginated(res, data, +page, +limit, total);
  } catch (e) { return serverError(res, e); }
};

exports.createInstance = async (req, res) => {
  try {
    const { workflow: workflowId, title, description, module: mod, entityType, entityId, priority, dueDate, metadata } = req.body;
    const steps = await WFStep().find({ workflow: workflowId, isDeleted: false }).sort({ stepOrder: 1 }).lean();
    const inst = await WFInstance().create({
      workflow: workflowId,
      title,
      description,
      module: mod,
      entityType,
      entityId,
      priority,
      dueDate,
      metadata: metadata || {},
      initiatedBy: req.user._id,
      totalSteps: steps.length,
      status: 'pending',
    });

    // Create stages for each step
    for (const step of steps) {
      const slaDeadline = step.slaHours
        ? new Date(Date.now() + step.slaHours * 3600000)
        : null;
      await WFStage().create({
        instance: inst._id,
        step: step._id,
        name: step.name,
        order: step.stepOrder,
        slaDeadline,
      });
    }

    await logHistory(inst._id, 'instance_created', req.user._id, null, 'pending', 'Instance created');
    emit(req.app.locals.io, 'workflow:instance_created', { instanceCode: inst.instanceCode, title: inst.title });
    return created(res, inst);
  } catch (e) { return serverError(res, e); }
};

exports.getInstance = async (req, res) => {
  try {
    const inst = await WFInstance().findOne({ _id: req.params.id, isDeleted: false })
      .populate('workflow', 'name module category')
      .populate('initiatedBy', 'name email')
      .lean();
    if (!inst) return notFound(res, 'WorkflowInstance');
    const stages = await WFStage().find({ instance: req.params.id })
      .populate('step', 'name stepType assigneeType approvalMode slaHours')
      .sort({ order: 1 }).lean();
    return ok(res, { ...inst, stages });
  } catch (e) { return serverError(res, e); }
};

exports.updateInstance = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'priority', 'dueDate', 'metadata'];
    const update = {};
    for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
    const doc = await WFInstance().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, update, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowInstance');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.startInstance = async (req, res) => {
  try {
    const inst = await WFInstance().findOneAndUpdate(
      { _id: req.params.id, status: 'pending', isDeleted: false },
      { status: 'in_progress', startedAt: new Date() },
      { new: true }
    );
    if (!inst) return notFound(res, 'WorkflowInstance');

    // Activate first stage
    const firstStage = await WFStage().findOneAndUpdate(
      { instance: inst._id, order: 1 },
      { status: 'in_progress', startedAt: new Date() },
      { new: true }
    );

    if (firstStage) {
      // Create approval record for the first stage
      const step = firstStage.step
        ? await WFStep().findById(firstStage.step).lean()
        : null;
      if (step && step.assignees && step.assignees.length > 0) {
        for (const a of step.assignees) {
          if (a.user) {
            await WFApproval().create({
              instance: inst._id,
              stage: firstStage._id,
              step: step._id,
              approver: a.user,
              approvalMode: step.approvalMode || 'sequential',
              dueDate: firstStage.slaDeadline,
            });
          }
        }
      }
    }

    await logHistory(inst._id, 'instance_started', req.user._id, 'pending', 'in_progress', 'Instance started');
    emit(req.app.locals.io, 'workflow:instance_started', { instanceCode: inst.instanceCode });
    return ok(res, inst);
  } catch (e) { return serverError(res, e); }
};

exports.cancelInstance = async (req, res) => {
  try {
    const inst = await WFInstance().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false, status: { $nin: ['completed', 'cancelled'] } },
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true }
    );
    if (!inst) return notFound(res, 'WorkflowInstance');
    await logHistory(inst._id, 'instance_cancelled', req.user._id, inst.status, 'cancelled', req.body.reason || '');
    emit(req.app.locals.io, 'workflow:instance_cancelled', { instanceCode: inst.instanceCode });
    return ok(res, inst);
  } catch (e) { return serverError(res, e); }
};

exports.getMyPendingInstances = async (req, res) => {
  try {
    const approvals = await WFApproval().find({ approver: req.user._id, status: 'pending' })
      .distinct('instance');
    const data = await WFInstance().find({
      _id: { $in: approvals }, status: 'in_progress', isDeleted: false,
    }).populate('workflow', 'name module').populate('initiatedBy', 'name').lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.getMyInitiatedInstances = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { initiatedBy: req.user._id, isDeleted: false };
    if (status) filter.status = status;
    const data = await WFInstance().find(filter)
      .populate('workflow', 'name module')
      .sort({ createdAt: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.getInstanceHistory = async (req, res) => {
  try {
    const data = await WFHistory().find({ instance: req.params.id })
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

// ── Comments ──────────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const doc = await WFComment().create({
      ...req.body,
      instance: req.params.id,
      author: req.user._id,
    });
    emit(req.app.locals.io, 'workflow:comment_added', { instance: req.params.id, author: req.user.name });
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getComments = async (req, res) => {
  try {
    const data = await WFComment().find({ instance: req.params.id, isDeleted: false })
      .populate('author', 'name email')
      .sort({ createdAt: 1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

// ── Attachments ───────────────────────────────────────────────────────────────
exports.addAttachment = async (req, res) => {
  try {
    const doc = await WFAttachment().create({
      ...req.body,
      instance: req.params.id,
      uploadedBy: req.user._id,
    });
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getAttachments = async (req, res) => {
  try {
    const data = await WFAttachment().find({ instance: req.params.id, isDeleted: false })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};
