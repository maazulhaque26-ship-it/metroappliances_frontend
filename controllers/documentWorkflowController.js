'use strict';
const mongoose = require('mongoose');
const { ok, created, notFound, serverError, fail } = require('../utils/response');
const { emit } = require('../utils/socket');

const Doc   = () => mongoose.model('Document');
const Appr  = () => mongoose.model('DocumentApproval');
const Rev   = () => mongoose.model('DocumentReview');
const Ret   = () => mongoose.model('DocumentRetention');
const Arc   = () => mongoose.model('DocumentArchive');
const Sig   = () => mongoose.model('DocumentSignature');
const DAudit= () => mongoose.model('DocumentAudit');

async function logAudit(documentId, action, userId, details = {}, fromStatus = '', toStatus = '', req = null) {
  try {
    await DAudit().create({ document: documentId, action, performedBy: userId, performedAt: new Date(), ipAddress: req?.ip || '', details, fromStatus, toStatus });
  } catch (_) {}
}

// ── Approvals ─────────────────────────────────────────────────────────────────

exports.listApprovals = async (req, res) => {
  try {
    const { document, status, approver } = req.query;
    const q = {};
    if (document) q.document = document;
    if (status) q.status = status;
    if (approver) q.approver = approver;
    const approvals = await Appr().find(q)
      .sort({ stepOrder: 1, createdAt: -1 })
      .populate('document', 'title documentCode status')
      .populate('approver', 'name email')
      .populate('delegatedTo', 'name email');
    return ok(res, approvals);
  } catch (e) { return serverError(res, e); }
};

exports.createApproval = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.body.document, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    const appr = await Appr().create(req.body);
    // Move document to under_review
    const from = doc.status;
    doc.status = 'under_review';
    await doc.save();
    await logAudit(doc._id, 'approval_requested', req.user._id, {}, from, 'under_review', req);
    return created(res, appr, 'Approval request created');
  } catch (e) { return serverError(res, e); }
};

exports.approveDocument = async (req, res) => {
  try {
    const appr = await Appr().findById(req.params.id).populate('document');
    if (!appr) return notFound(res, 'Approval');
    if (appr.status !== 'pending') return fail(res, 'Approval already decided');
    appr.status = 'approved';
    appr.decidedAt = new Date();
    appr.remarks = req.body.remarks || '';
    await appr.save();
    // Check if all approvals for doc are done
    const pendingCount = await Appr().countDocuments({ document: appr.document._id, status: 'pending', isCurrent: true });
    if (pendingCount === 0) {
      const doc = await Doc().findById(appr.document._id);
      const from = doc.status;
      doc.status = 'approved';
      await doc.save();
      emit(req.app.locals.io, 'document:approved', { documentId: doc._id, title: doc.title });
      await logAudit(doc._id, 'approved', req.user._id, {}, from, 'approved', req);
    }
    return ok(res, appr, 'Document approved');
  } catch (e) { return serverError(res, e); }
};

exports.rejectDocument = async (req, res) => {
  try {
    const appr = await Appr().findById(req.params.id).populate('document');
    if (!appr) return notFound(res, 'Approval');
    appr.status = 'rejected';
    appr.decidedAt = new Date();
    appr.remarks = req.body.remarks || '';
    await appr.save();
    // Move doc back to draft
    const doc = await Doc().findById(appr.document._id);
    const from = doc.status;
    doc.status = 'draft';
    await doc.save();
    await logAudit(doc._id, 'rejected', req.user._id, { remarks: req.body.remarks }, from, 'draft', req);
    return ok(res, appr, 'Document rejected');
  } catch (e) { return serverError(res, e); }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const approvals = await Appr().find({ approver: req.user._id, status: 'pending' })
      .populate('document', 'title documentCode status documentType module')
      .sort({ createdAt: -1 });
    return ok(res, approvals);
  } catch (e) { return serverError(res, e); }
};

exports.publishDocument = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    if (!['approved', 'draft'].includes(doc.status)) return fail(res, 'Document cannot be published from current status');
    const from = doc.status;
    doc.status = 'published';
    doc.effectiveDate = req.body.effectiveDate || new Date();
    await doc.save();
    await logAudit(doc._id, 'published', req.user._id, {}, from, 'published', req);
    return ok(res, doc, 'Document published');
  } catch (e) { return serverError(res, e); }
};

// ── Reviews ───────────────────────────────────────────────────────────────────

exports.listReviews = async (req, res) => {
  try {
    const { document, status, reviewer } = req.query;
    const q = {};
    if (document) q.document = document;
    if (status) q.status = status;
    if (reviewer) q.reviewer = reviewer;
    const reviews = await Rev().find(q)
      .sort({ dueDate: 1 })
      .populate('document', 'title documentCode')
      .populate('reviewer', 'name email');
    return ok(res, reviews);
  } catch (e) { return serverError(res, e); }
};

exports.createReview = async (req, res) => {
  try {
    const review = await Rev().create(req.body);
    // Set reviewDate on document
    await Doc().updateOne({ _id: req.body.document }, { reviewDate: req.body.dueDate });
    emit(req.app.locals.io, 'document:review_due', { reviewId: review._id, documentId: req.body.document, dueDate: req.body.dueDate });
    return created(res, review, 'Review scheduled');
  } catch (e) { return serverError(res, e); }
};

exports.completeReview = async (req, res) => {
  try {
    const review = await Rev().findById(req.params.id);
    if (!review) return notFound(res, 'Review');
    review.status = 'completed';
    review.completedAt = new Date();
    review.outcome = req.body.outcome || 'approved';
    review.remarks = req.body.remarks || '';
    review.nextReviewDate = req.body.nextReviewDate;
    await review.save();
    // If next review date set, update document
    if (req.body.nextReviewDate) {
      await Doc().updateOne({ _id: review.document }, { reviewDate: req.body.nextReviewDate });
    }
    return ok(res, review, 'Review completed');
  } catch (e) { return serverError(res, e); }
};

exports.getOverdueReviews = async (req, res) => {
  try {
    const now = new Date();
    const reviews = await Rev().find({ dueDate: { $lt: now }, status: { $in: ['scheduled', 'in_progress'] } })
      .populate('document', 'title documentCode module')
      .populate('reviewer', 'name email')
      .sort({ dueDate: 1 });
    return ok(res, reviews);
  } catch (e) { return serverError(res, e); }
};

// ── Retention ─────────────────────────────────────────────────────────────────

exports.listRetentionPolicies = async (req, res) => {
  try {
    const policies = await Ret().find({ isActive: true }).sort({ name: 1 });
    return ok(res, policies);
  } catch (e) { return serverError(res, e); }
};

exports.createRetentionPolicy = async (req, res) => {
  try {
    const policy = await Ret().create(req.body);
    return created(res, policy, 'Retention policy created');
  } catch (e) { return serverError(res, e); }
};

exports.updateRetentionPolicy = async (req, res) => {
  try {
    const policy = await Ret().findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policy) return notFound(res, 'Retention policy');
    return ok(res, policy, 'Retention policy updated');
  } catch (e) { return serverError(res, e); }
};

exports.deleteRetentionPolicy = async (req, res) => {
  try {
    await Ret().findByIdAndUpdate(req.params.id, { isActive: false });
    return ok(res, null, 'Retention policy deactivated');
  } catch (e) { return serverError(res, e); }
};

exports.applyRetentionPolicy = async (req, res) => {
  try {
    const policy = await Ret().findById(req.params.id);
    if (!policy) return notFound(res, 'Retention policy');
    const { documentIds } = req.body;
    if (!documentIds || !documentIds.length) return fail(res, 'No documents specified');
    await Doc().updateMany({ _id: { $in: documentIds } }, { retentionPolicy: policy._id });
    await Ret().updateOne({ _id: policy._id }, { $inc: { appliedCount: documentIds.length } });
    return ok(res, { applied: documentIds.length }, 'Retention policy applied');
  } catch (e) { return serverError(res, e); }
};

exports.getExpiringDocuments = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const docs = await Doc().find({
      expiryDate: { $lte: threshold, $gte: new Date() },
      isDeleted: false,
      status: { $nin: ['archived', 'obsolete', 'expired'] },
    }).sort({ expiryDate: 1 }).populate('owner', 'name email').populate('folder', 'name');
    emit(req.app.locals.io, 'document:expired', { count: docs.length, threshold });
    return ok(res, docs);
  } catch (e) { return serverError(res, e); }
};

// ── Archive ───────────────────────────────────────────────────────────────────

exports.listArchives = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRestored } = req.query;
    const q = {};
    if (isRestored !== undefined) q.isRestored = isRestored === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Arc().find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('document', 'title documentCode')
        .populate('archivedBy', 'name')
        .populate('restoredBy', 'name'),
      Arc().countDocuments(q),
    ]);
    return ok(res, { data, total });
  } catch (e) { return serverError(res, e); }
};

exports.archiveDocument = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    const from = doc.status;
    doc.status = 'archived';
    await doc.save();
    const archive = await Arc().create({
      document: doc._id,
      archivedBy: req.user._id,
      archiveReason: req.body.archiveReason || 'manual',
      reason: req.body.reason || '',
      titleSnapshot: doc.title,
      fileUrlSnapshot: doc.fileUrl,
      statusSnapshot: from,
      scheduledDeletion: req.body.scheduledDeletion,
    });
    await logAudit(doc._id, 'archived', req.user._id, {}, from, 'archived', req);
    emit(req.app.locals.io, 'document:archived', { documentId: doc._id, title: doc.title });
    return created(res, archive, 'Document archived');
  } catch (e) { return serverError(res, e); }
};

exports.restoreDocument = async (req, res) => {
  try {
    const archive = await Arc().findById(req.params.id);
    if (!archive) return notFound(res, 'Archive record');
    const doc = await Doc().findById(archive.document);
    if (!doc) return notFound(res, 'Document');
    doc.status = 'draft';
    await doc.save();
    archive.isRestored = true;
    archive.restoredBy = req.user._id;
    archive.restoredAt = new Date();
    archive.restoreReason = req.body.restoreReason || '';
    await archive.save();
    await logAudit(doc._id, 'restored', req.user._id, {}, 'archived', 'draft', req);
    return ok(res, doc, 'Document restored');
  } catch (e) { return serverError(res, e); }
};

// ── Signatures ────────────────────────────────────────────────────────────────

exports.listSignatures = async (req, res) => {
  try {
    const sigs = await Sig().find({ document: req.params.id })
      .sort({ stepOrder: 1 })
      .populate('signer', 'name email');
    return ok(res, sigs);
  } catch (e) { return serverError(res, e); }
};

exports.requestSignature = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    const token = require('crypto').randomBytes(24).toString('hex');
    const sig = await Sig().create({
      ...req.body,
      document: doc._id,
      verificationToken: token,
      signerName: req.body.signerName || '',
      signerEmail: req.body.signerEmail || '',
    });
    return created(res, sig, 'Signature requested');
  } catch (e) { return serverError(res, e); }
};

exports.signDocument = async (req, res) => {
  try {
    const sig = await Sig().findById(req.params.sigId);
    if (!sig) return notFound(res, 'Signature request');
    if (sig.status !== 'pending') return fail(res, 'Signature already processed');
    sig.status = 'signed';
    sig.signedAt = new Date();
    sig.signatureImageUrl = req.body.signatureImageUrl || '';
    sig.ipAddress = req.ip;
    sig.userAgent = req.headers['user-agent'];
    sig.remarks = req.body.remarks || '';
    await sig.save();
    await logAudit(sig.document, 'signed', req.user._id, {}, '', '', req);
    return ok(res, sig, 'Document signed');
  } catch (e) { return serverError(res, e); }
};

exports.declineSignature = async (req, res) => {
  try {
    const sig = await Sig().findById(req.params.sigId);
    if (!sig) return notFound(res, 'Signature request');
    sig.status = 'declined';
    sig.declinedAt = new Date();
    sig.declineReason = req.body.declineReason || '';
    await sig.save();
    return ok(res, sig, 'Signature declined');
  } catch (e) { return serverError(res, e); }
};
