'use strict';
const mongoose = require('mongoose');
const { ok, created, notFound, serverError, fail, paginated } = require('../utils/response');
const { emit } = require('../utils/socket');

const KBA  = () => mongoose.model('KnowledgeArticle');
const KBC  = () => mongoose.model('KnowledgeCategory');
const KBR  = () => mongoose.model('KnowledgeRevision');
const KBF  = () => mongoose.model('KnowledgeFeedback');
const KBBm = () => mongoose.model('KnowledgeBookmark');

// ── Articles ──────────────────────────────────────────────────────────────────

exports.listArticles = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, module: mod, search, tags } = req.query;
    const q = { isDeleted: false };
    if (status) q.status = status;
    if (category) q.category = category;
    if (mod) q.module = mod;
    if (tags) q.tags = { $in: tags.split(',') };
    if (search) q.$text = { $search: search };
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      KBA().find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('category', 'name color icon')
        .populate('author', 'name email')
        .select('-content'),
      KBA().countDocuments(q),
    ]);
    return paginated(res, data, total, page, limit);
  } catch (e) { return serverError(res, e); }
};

exports.createArticle = async (req, res) => {
  try {
    const article = await KBA().create({ ...req.body, author: req.user._id });
    return created(res, article, 'Article created');
  } catch (e) { return serverError(res, e); }
};

exports.getArticle = async (req, res) => {
  try {
    const article = await KBA().findOne({ _id: req.params.id, isDeleted: false })
      .populate('category', 'name color icon')
      .populate('author', 'name email')
      .populate('reviewedBy', 'name')
      .populate('publishedBy', 'name');
    if (!article) return notFound(res, 'Article');
    await KBA().updateOne({ _id: article._id }, { $inc: { viewCount: 1 } });
    return ok(res, article);
  } catch (e) { return serverError(res, e); }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await KBA().findOne({ _id: req.params.id, isDeleted: false });
    if (!article) return notFound(res, 'Article');
    // Save revision before update if content changes
    if (req.body.content && req.body.content !== article.content) {
      await KBR().create({
        article: article._id,
        version: article.version,
        title: article.title,
        content: article.content,
        summary: article.summary,
        changeSummary: req.body.changeSummary || 'Content updated',
        revisedBy: req.user._id,
        isCurrent: false,
      });
      req.body.version = (article.version || 1) + 1;
    }
    Object.assign(article, req.body);
    await article.save();
    return ok(res, article, 'Article updated');
  } catch (e) { return serverError(res, e); }
};

exports.deleteArticle = async (req, res) => {
  try {
    await KBA().findByIdAndUpdate(req.params.id, { isDeleted: true });
    return ok(res, null, 'Article deleted');
  } catch (e) { return serverError(res, e); }
};

exports.publishArticle = async (req, res) => {
  try {
    const article = await KBA().findOne({ _id: req.params.id, isDeleted: false });
    if (!article) return notFound(res, 'Article');
    article.status = 'published';
    article.publishedAt = new Date();
    article.publishedBy = req.user._id;
    await article.save();
    emit(req.app.locals.io, 'knowledge:published', { articleId: article._id, title: article.title });
    return ok(res, article, 'Article published');
  } catch (e) { return serverError(res, e); }
};

exports.archiveArticle = async (req, res) => {
  try {
    const article = await KBA().findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!article) return notFound(res, 'Article');
    return ok(res, article, 'Article archived');
  } catch (e) { return serverError(res, e); }
};

exports.searchArticles = async (req, res) => {
  try {
    const { q, module: mod, category, page = 1, limit = 20 } = req.query;
    if (!q) return fail(res, 'Search query required');
    const query = { isDeleted: false, status: 'published', $text: { $search: q } };
    if (mod) query.module = mod;
    if (category) query.category = category;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      KBA().find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip).limit(Number(limit))
        .populate('category', 'name').select('-content'),
      KBA().countDocuments(query),
    ]);
    return paginated(res, data, total, page, limit);
  } catch (e) { return serverError(res, e); }
};

// ── Revisions ─────────────────────────────────────────────────────────────────

exports.listRevisions = async (req, res) => {
  try {
    const revisions = await KBR().find({ article: req.params.id })
      .sort({ version: -1 })
      .populate('revisedBy', 'name');
    return ok(res, revisions);
  } catch (e) { return serverError(res, e); }
};

exports.getRevision = async (req, res) => {
  try {
    const revision = await KBR().findById(req.params.revId).populate('revisedBy', 'name');
    if (!revision) return notFound(res, 'Revision');
    return ok(res, revision);
  } catch (e) { return serverError(res, e); }
};

// ── Categories ────────────────────────────────────────────────────────────────

exports.listCategories = async (req, res) => {
  try {
    const { module: mod } = req.query;
    const q = { isActive: true };
    if (mod) q.module = mod;
    const cats = await KBC().find(q).sort({ sortOrder: 1, name: 1 });
    return ok(res, cats);
  } catch (e) { return serverError(res, e); }
};

exports.createCategory = async (req, res) => {
  try {
    const cat = await KBC().create(req.body);
    return created(res, cat, 'Category created');
  } catch (e) { return serverError(res, e); }
};

exports.updateCategory = async (req, res) => {
  try {
    const cat = await KBC().findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return notFound(res, 'Category');
    return ok(res, cat, 'Category updated');
  } catch (e) { return serverError(res, e); }
};

exports.deleteCategory = async (req, res) => {
  try {
    await KBC().findByIdAndDelete(req.params.id);
    return ok(res, null, 'Category deleted');
  } catch (e) { return serverError(res, e); }
};

// ── Feedback ──────────────────────────────────────────────────────────────────

exports.listFeedback = async (req, res) => {
  try {
    const feedback = await KBF().find({ article: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    return ok(res, feedback);
  } catch (e) { return serverError(res, e); }
};

exports.addFeedback = async (req, res) => {
  try {
    const existing = await KBF().findOne({ article: req.params.id, user: req.user._id });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      // Update article counts
      if (req.body.reaction === 'like') await KBA().updateOne({ _id: req.params.id }, { $inc: { likeCount: 1 } });
      if (req.body.reaction === 'dislike') await KBA().updateOne({ _id: req.params.id }, { $inc: { dislikeCount: 1 } });
      return ok(res, existing, 'Feedback updated');
    }
    const fb = await KBF().create({ ...req.body, article: req.params.id, user: req.user._id });
    if (req.body.reaction === 'like') await KBA().updateOne({ _id: req.params.id }, { $inc: { likeCount: 1 } });
    if (req.body.reaction === 'dislike') await KBA().updateOne({ _id: req.params.id }, { $inc: { dislikeCount: 1 } });
    return created(res, fb, 'Feedback submitted');
  } catch (e) { return serverError(res, e); }
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────

exports.getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await KBBm().find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('article', 'title articleCode category summary status viewCount');
    return ok(res, bookmarks);
  } catch (e) { return serverError(res, e); }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const existing = await KBBm().findOne({ user: req.user._id, article: req.params.id });
    if (existing) {
      await KBBm().deleteOne({ _id: existing._id });
      await KBA().updateOne({ _id: req.params.id }, { $inc: { bookmarkCount: -1 } });
      return ok(res, { bookmarked: false }, 'Bookmark removed');
    }
    const bm = await KBBm().create({
      user: req.user._id,
      article: req.params.id,
      notes: req.body.notes || '',
      collection: req.body.collection || 'default',
    });
    await KBA().updateOne({ _id: req.params.id }, { $inc: { bookmarkCount: 1 } });
    return created(res, bm, 'Bookmarked');
  } catch (e) { return serverError(res, e); }
};

exports.deleteBookmark = async (req, res) => {
  try {
    await KBBm().deleteOne({ _id: req.params.bmId, user: req.user._id });
    return ok(res, null, 'Bookmark deleted');
  } catch (e) { return serverError(res, e); }
};

// ── Popular / Recommended ─────────────────────────────────────────────────────

exports.getPopularArticles = async (req, res) => {
  try {
    const { module: mod, limit = 10 } = req.query;
    const q = { status: 'published', isDeleted: false };
    if (mod) q.module = mod;
    const articles = await KBA().find(q).sort({ viewCount: -1 }).limit(Number(limit))
      .populate('category', 'name').select('title articleCode category viewCount likeCount module summary');
    return ok(res, articles);
  } catch (e) { return serverError(res, e); }
};

exports.getRelatedArticles = async (req, res) => {
  try {
    const article = await KBA().findById(req.params.id);
    if (!article) return notFound(res, 'Article');
    const related = await KBA().find({
      _id: { $ne: article._id },
      status: 'published',
      isDeleted: false,
      $or: [
        { category: article.category },
        { module: article.module },
        { tags: { $in: article.tags } },
      ],
    }).limit(5).select('title articleCode category summary viewCount');
    return ok(res, related);
  } catch (e) { return serverError(res, e); }
};
