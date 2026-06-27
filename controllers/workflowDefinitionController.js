'use strict';
const mongoose = require('mongoose');
const { ok, created, notFound, serverError, paginated } = require('../utils/response');
const { emit } = require('../utils/socket');

const Workflow       = () => mongoose.model('Workflow');
const WFTemplate     = () => mongoose.model('WorkflowTemplate');
const WFStep         = () => mongoose.model('WorkflowStep');
const WFTransition   = () => mongoose.model('WorkflowTransition');
const WFRule         = () => mongoose.model('WorkflowRule');
const WFCondition    = () => mongoose.model('WorkflowCondition');
const WFTrigger      = () => mongoose.model('WorkflowTrigger');

// ── Workflows ─────────────────────────────────────────────────────────────────
exports.listWorkflows = async (req, res) => {
  try {
    const { module: mod, status, category, page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: false };
    if (mod) filter.module = mod;
    if (status) filter.status = status;
    if (category) filter.category = category;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Workflow().find(filter).sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
      Workflow().countDocuments(filter),
    ]);
    return paginated(res, data, +page, +limit, total);
  } catch (e) { return serverError(res, e); }
};

exports.createWorkflow = async (req, res) => {
  try {
    const doc = await Workflow().create({ ...req.body, createdBy: req.user._id });
    emit(req.app.locals.io, 'workflow:definition_created', { workflowCode: doc.workflowCode });
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getWorkflow = async (req, res) => {
  try {
    const doc = await Workflow().findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!doc) return notFound(res, 'Workflow');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateWorkflow = async (req, res) => {
  try {
    const doc = await Workflow().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doc) return notFound(res, 'Workflow');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deleteWorkflow = async (req, res) => {
  try {
    const doc = await Workflow().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!doc) return notFound(res, 'Workflow');
    return ok(res, { message: 'Deleted' });
  } catch (e) { return serverError(res, e); }
};

exports.activateWorkflow = async (req, res) => {
  try {
    const doc = await Workflow().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status: 'active' },
      { new: true }
    );
    if (!doc) return notFound(res, 'Workflow');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deactivateWorkflow = async (req, res) => {
  try {
    const doc = await Workflow().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status: 'inactive' },
      { new: true }
    );
    if (!doc) return notFound(res, 'Workflow');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

// ── Templates ─────────────────────────────────────────────────────────────────
exports.listTemplates = async (req, res) => {
  try {
    const { module: mod, category } = req.query;
    const filter = { isDeleted: false };
    if (mod) filter.module = mod;
    if (category) filter.category = category;
    const data = await WFTemplate().find(filter).sort({ createdAt: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.createTemplate = async (req, res) => {
  try {
    const doc = await WFTemplate().create({ ...req.body, createdBy: req.user._id });
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getTemplate = async (req, res) => {
  try {
    const doc = await WFTemplate().findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!doc) return notFound(res, 'WorkflowTemplate');
    await WFTemplate().findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateTemplate = async (req, res) => {
  try {
    const doc = await WFTemplate().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, req.body, { new: true, runValidators: true }
    );
    if (!doc) return notFound(res, 'WorkflowTemplate');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const doc = await WFTemplate().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowTemplate');
    return ok(res, { message: 'Deleted' });
  } catch (e) { return serverError(res, e); }
};

// ── Steps ─────────────────────────────────────────────────────────────────────
exports.listSteps = async (req, res) => {
  try {
    const data = await WFStep().find({ workflow: req.params.workflowId, isDeleted: false })
      .sort({ stepOrder: 1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.createStep = async (req, res) => {
  try {
    const doc = await WFStep().create({ ...req.body, workflow: req.params.workflowId });
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getStep = async (req, res) => {
  try {
    const doc = await WFStep().findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!doc) return notFound(res, 'WorkflowStep');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateStep = async (req, res) => {
  try {
    const doc = await WFStep().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, req.body, { new: true, runValidators: true }
    );
    if (!doc) return notFound(res, 'WorkflowStep');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deleteStep = async (req, res) => {
  try {
    const doc = await WFStep().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowStep');
    return ok(res, { message: 'Deleted' });
  } catch (e) { return serverError(res, e); }
};

// ── Transitions ───────────────────────────────────────────────────────────────
exports.listTransitions = async (req, res) => {
  try {
    const data = await WFTransition().find({ workflow: req.params.workflowId, isDeleted: false })
      .sort({ priority: 1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.createTransition = async (req, res) => {
  try {
    const doc = await WFTransition().create({ ...req.body, workflow: req.params.workflowId });
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateTransition = async (req, res) => {
  try {
    const doc = await WFTransition().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, req.body, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowTransition');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deleteTransition = async (req, res) => {
  try {
    const doc = await WFTransition().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowTransition');
    return ok(res, { message: 'Deleted' });
  } catch (e) { return serverError(res, e); }
};

// ── Rules ─────────────────────────────────────────────────────────────────────
exports.listRules = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.workflow) filter.workflow = req.query.workflow;
    const data = await WFRule().find(filter).sort({ priority: 1, createdAt: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.createRule = async (req, res) => {
  try {
    const doc = await WFRule().create(req.body);
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getRule = async (req, res) => {
  try {
    const doc = await WFRule().findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!doc) return notFound(res, 'WorkflowRule');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateRule = async (req, res) => {
  try {
    const doc = await WFRule().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, req.body, { new: true, runValidators: true }
    );
    if (!doc) return notFound(res, 'WorkflowRule');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deleteRule = async (req, res) => {
  try {
    const doc = await WFRule().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowRule');
    return ok(res, { message: 'Deleted' });
  } catch (e) { return serverError(res, e); }
};

// ── Conditions ────────────────────────────────────────────────────────────────
exports.listConditions = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.workflow) filter.workflow = req.query.workflow;
    const data = await WFCondition().find(filter).sort({ priority: 1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.createCondition = async (req, res) => {
  try {
    const doc = await WFCondition().create(req.body);
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getCondition = async (req, res) => {
  try {
    const doc = await WFCondition().findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!doc) return notFound(res, 'WorkflowCondition');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateCondition = async (req, res) => {
  try {
    const doc = await WFCondition().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, req.body, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowCondition');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deleteCondition = async (req, res) => {
  try {
    const doc = await WFCondition().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowCondition');
    return ok(res, { message: 'Deleted' });
  } catch (e) { return serverError(res, e); }
};

// ── Triggers ──────────────────────────────────────────────────────────────────
exports.listTriggers = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.workflow) filter.workflow = req.query.workflow;
    if (req.query.triggerType) filter.triggerType = req.query.triggerType;
    const data = await WFTrigger().find(filter).sort({ createdAt: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.createTrigger = async (req, res) => {
  try {
    const doc = await WFTrigger().create(req.body);
    emit(req.app.locals.io, 'workflow:trigger_created', { triggerCode: doc.triggerCode });
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getTrigger = async (req, res) => {
  try {
    const doc = await WFTrigger().findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!doc) return notFound(res, 'WorkflowTrigger');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateTrigger = async (req, res) => {
  try {
    const doc = await WFTrigger().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, req.body, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowTrigger');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deleteTrigger = async (req, res) => {
  try {
    const doc = await WFTrigger().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowTrigger');
    return ok(res, { message: 'Deleted' });
  } catch (e) { return serverError(res, e); }
};

exports.fireTrigger = async (req, res) => {
  try {
    const doc = await WFTrigger().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false, isActive: true },
      { $inc: { fireCount: 1 }, lastFiredAt: new Date() },
      { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowTrigger');
    emit(req.app.locals.io, 'workflow:trigger_fired', { triggerCode: doc.triggerCode, workflow: doc.workflow });
    return ok(res, { message: 'Trigger fired', trigger: doc });
  } catch (e) { return serverError(res, e); }
};
