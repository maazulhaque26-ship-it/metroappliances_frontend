'use strict';
const mongoose = require('mongoose');
const { ok, created, notFound, serverError, paginated } = require('../utils/response');
const { emit } = require('../utils/socket');

const WFEscalation   = () => mongoose.model('WorkflowEscalation');
const WFSLA          = () => mongoose.model('WorkflowSLA');
const WFNotification = () => mongoose.model('WorkflowNotification');
const WFInstance     = () => mongoose.model('WorkflowInstance');
const WFStage        = () => mongoose.model('WorkflowStage');

// ── Escalations ───────────────────────────────────────────────────────────────
exports.listEscalations = async (req, res) => {
  try {
    const { status, level, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (level) filter.escalationLevel = +level;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      WFEscalation().find(filter)
        .populate('instance', 'instanceCode title module priority')
        .populate('escalatedTo', 'name email')
        .populate('escalatedBy', 'name email')
        .sort({ escalatedAt: -1 }).skip(skip).limit(+limit).lean(),
      WFEscalation().countDocuments(filter),
    ]);
    return paginated(res, data, +page, +limit, total);
  } catch (e) { return serverError(res, e); }
};

exports.getEscalation = async (req, res) => {
  try {
    const doc = await WFEscalation().findById(req.params.id)
      .populate('instance', 'instanceCode title')
      .populate('escalatedTo', 'name email')
      .lean();
    if (!doc) return notFound(res, 'WorkflowEscalation');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.createEscalation = async (req, res) => {
  try {
    const doc = await WFEscalation().create(req.body);
    await WFInstance().findByIdAndUpdate(doc.instance, { escalated: true });
    emit(req.app.locals.io, 'workflow:escalation_triggered', { escalationCode: doc.escalationCode });
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.acknowledgeEscalation = async (req, res) => {
  try {
    const doc = await WFEscalation().findByIdAndUpdate(
      req.params.id,
      { status: 'acknowledged', acknowledgedAt: new Date() },
      { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowEscalation');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.resolveEscalation = async (req, res) => {
  try {
    const doc = await WFEscalation().findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date(), response: req.body.response },
      { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowEscalation');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

// ── SLAs ──────────────────────────────────────────────────────────────────────
exports.listSLAs = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.workflow) filter.workflow = req.query.workflow;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const data = await WFSLA().find(filter)
      .populate('workflow', 'name module')
      .sort({ createdAt: -1 }).lean();
    return ok(res, data);
  } catch (e) { return serverError(res, e); }
};

exports.createSLA = async (req, res) => {
  try {
    const doc = await WFSLA().create(req.body);
    return created(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.getSLA = async (req, res) => {
  try {
    const doc = await WFSLA().findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!doc) return notFound(res, 'WorkflowSLA');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateSLA = async (req, res) => {
  try {
    const doc = await WFSLA().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, req.body, { new: true, runValidators: true }
    );
    if (!doc) return notFound(res, 'WorkflowSLA');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.deleteSLA = async (req, res) => {
  try {
    const doc = await WFSLA().findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowSLA');
    return ok(res, { message: 'Deleted' });
  } catch (e) { return serverError(res, e); }
};

exports.getSLABreaches = async (req, res) => {
  try {
    const now = new Date();
    const breachedStages = await WFStage().find({
      slaDeadline: { $lt: now },
      status: { $in: ['pending', 'in_progress'] },
    }).populate('instance', 'instanceCode title module priority').lean();

    const [breachedInstances, totalActive] = await Promise.all([
      WFInstance().countDocuments({ slaBreached: true, isDeleted: false }),
      WFInstance().countDocuments({ status: 'in_progress', isDeleted: false }),
    ]);

    return ok(res, {
      breachedStages,
      summary: { breachedInstances, totalActive, breachRate: totalActive ? ((breachedInstances / totalActive) * 100).toFixed(1) : 0 },
    });
  } catch (e) { return serverError(res, e); }
};

// ── Notifications ─────────────────────────────────────────────────────────────
exports.listNotifications = async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const filter = { recipient: req.user._id };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      WFNotification().find(filter)
        .populate('instance', 'instanceCode title')
        .sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
      WFNotification().countDocuments(filter),
    ]);
    return paginated(res, data, +page, +limit, total);
  } catch (e) { return serverError(res, e); }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const doc = await WFNotification().findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { status: 'read', readAt: new Date() },
      { new: true }
    );
    if (!doc) return notFound(res, 'WorkflowNotification');
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const result = await WFNotification().updateMany(
      { recipient: req.user._id, status: { $ne: 'read' } },
      { status: 'read', readAt: new Date() }
    );
    return ok(res, { updated: result.modifiedCount });
  } catch (e) { return serverError(res, e); }
};
