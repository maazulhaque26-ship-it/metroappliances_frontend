'use strict';
const mongoose = require('mongoose');
const { ok, serverError } = require('../utils/response');

const Doc   = () => mongoose.model('Document');
const Rev   = () => mongoose.model('DocumentReview');
const Arc   = () => mongoose.model('DocumentArchive');
const Appr  = () => mongoose.model('DocumentApproval');
const DAudit= () => mongoose.model('DocumentAudit');
const KBA   = () => mongoose.model('KnowledgeArticle');

exports.getDMSDashboard = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalDocuments,
      draftDocs,
      publishedDocs,
      archivedDocs,
      expiringDocs,
      overdueReviews,
      pendingApprovals,
      recentUploads,
      totalKBArticles,
      publishedKBArticles,
      byModule,
      byType,
      checkedOutDocs,
    ] = await Promise.all([
      Doc().countDocuments({ isDeleted: false }),
      Doc().countDocuments({ status: 'draft', isDeleted: false }),
      Doc().countDocuments({ status: 'published', isDeleted: false }),
      Doc().countDocuments({ status: 'archived', isDeleted: false }),
      Doc().countDocuments({ expiryDate: { $lte: thirtyDaysAhead, $gte: now }, isDeleted: false }),
      Rev().countDocuments({ dueDate: { $lt: now }, status: { $in: ['scheduled', 'in_progress'] } }),
      Appr().countDocuments({ status: 'pending' }),
      Doc().countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isDeleted: false }),
      KBA().countDocuments({ isDeleted: false }),
      KBA().countDocuments({ status: 'published', isDeleted: false }),
      Doc().aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Doc().aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$documentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Doc().countDocuments({ isCheckedOut: true }),
    ]);

    return ok(res, {
      totalDocuments, draftDocs, publishedDocs, archivedDocs,
      expiringDocs, overdueReviews, pendingApprovals, recentUploads,
      totalKBArticles, publishedKBArticles, byModule, byType, checkedOutDocs,
    });
  } catch (e) { return serverError(res, e); }
};

exports.getDocumentActivity = async (req, res) => {
  try {
    const { days = 30, documentId } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    const q = { performedAt: { $gte: since } };
    if (documentId) q.document = documentId;
    const [byAction, timeline, topDocuments] = await Promise.all([
      DAudit().aggregate([
        { $match: q },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      DAudit().aggregate([
        { $match: q },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$performedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      DAudit().aggregate([
        { $match: q },
        { $group: { _id: '$document', actionCount: { $sum: 1 } } },
        { $sort: { actionCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'documents', localField: '_id', foreignField: '_id', as: 'doc' } },
        { $unwind: { path: '$doc', preserveNullAndEmptyArrays: true } },
        { $project: { documentCode: '$doc.documentCode', title: '$doc.title', actionCount: 1 } },
      ]),
    ]);
    return ok(res, { byAction, timeline, topDocuments });
  } catch (e) { return serverError(res, e); }
};

exports.getExpiryReport = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const now = new Date();
    const threshold = new Date(now.getTime() + Number(days) * 24 * 60 * 60 * 1000);
    const [expiring, expired, byModule] = await Promise.all([
      Doc().find({ expiryDate: { $lte: threshold, $gte: now }, isDeleted: false, status: { $nin: ['archived', 'obsolete', 'expired'] } })
        .sort({ expiryDate: 1 }).populate('owner', 'name email').select('title documentCode expiryDate module owner status'),
      Doc().find({ expiryDate: { $lt: now }, isDeleted: false, status: { $nin: ['archived', 'obsolete', 'expired'] } })
        .sort({ expiryDate: 1 }).populate('owner', 'name email').select('title documentCode expiryDate module owner status'),
      Doc().aggregate([
        { $match: { expiryDate: { $lte: threshold }, isDeleted: false } },
        { $group: { _id: '$module', expiring: { $sum: 1 } } },
        { $sort: { expiring: -1 } },
      ]),
    ]);
    return ok(res, { expiring, expired, byModule, threshold });
  } catch (e) { return serverError(res, e); }
};

exports.getRetentionReport = async (req, res) => {
  try {
    const Ret = mongoose.model('DocumentRetention');
    const [policies, byPolicy, withoutPolicy] = await Promise.all([
      Ret.find({ isActive: true }),
      Doc().aggregate([
        { $match: { isDeleted: false, retentionPolicy: { $ne: null } } },
        { $group: { _id: '$retentionPolicy', count: { $sum: 1 } } },
        { $lookup: { from: 'documentretentions', localField: '_id', foreignField: '_id', as: 'policy' } },
        { $unwind: { path: '$policy', preserveNullAndEmptyArrays: true } },
        { $project: { policyName: '$policy.name', retentionYears: '$policy.retentionYears', count: 1 } },
      ]),
      Doc().countDocuments({ isDeleted: false, retentionPolicy: null }),
    ]);
    return ok(res, { policies, byPolicy, withoutPolicy });
  } catch (e) { return serverError(res, e); }
};

exports.getReviewReport = async (req, res) => {
  try {
    const now = new Date();
    const [scheduled, overdue, completed, byOutcome] = await Promise.all([
      Rev().countDocuments({ status: 'scheduled', dueDate: { $gte: now } }),
      Rev().countDocuments({ status: { $in: ['scheduled', 'in_progress'] }, dueDate: { $lt: now } }),
      Rev().countDocuments({ status: 'completed' }),
      Rev().aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$outcome', count: { $sum: 1 } } },
      ]),
    ]);
    return ok(res, { scheduled, overdue, completed, byOutcome });
  } catch (e) { return serverError(res, e); }
};

exports.getDocumentAuditTrail = async (req, res) => {
  try {
    const { documentId, page = 1, limit = 50, action } = req.query;
    const q = {};
    if (documentId) q.document = documentId;
    if (action) q.action = action;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      DAudit().find(q).sort({ performedAt: -1 }).skip(skip).limit(Number(limit))
        .populate('performedBy', 'name email')
        .populate('document', 'title documentCode'),
      DAudit().countDocuments(q),
    ]);
    return ok(res, { data, total, page: Number(page), limit: Number(limit) });
  } catch (e) { return serverError(res, e); }
};

exports.getKnowledgeUsageReport = async (req, res) => {
  try {
    const [totalArticles, publishedArticles, totalViews, topArticles, byModule, avgRating] = await Promise.all([
      KBA().countDocuments({ isDeleted: false }),
      KBA().countDocuments({ status: 'published', isDeleted: false }),
      KBA().aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      KBA().find({ status: 'published', isDeleted: false }).sort({ viewCount: -1 }).limit(10).select('title articleCode viewCount likeCount dislikeCount bookmarkCount module'),
      KBA().aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$module', count: { $sum: 1 }, views: { $sum: '$viewCount' } } },
        { $sort: { views: -1 } },
      ]),
      KBA().aggregate([
        { $group: { _id: null, avgLikes: { $avg: '$likeCount' }, avgViews: { $avg: '$viewCount' } } },
      ]),
    ]);
    return ok(res, {
      totalArticles,
      publishedArticles,
      totalViews: totalViews[0]?.total || 0,
      topArticles,
      byModule,
      avgStats: avgRating[0] || {},
    });
  } catch (e) { return serverError(res, e); }
};
