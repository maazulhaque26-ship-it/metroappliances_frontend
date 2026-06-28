'use strict';
const mongoose = require('mongoose');
const { ok, created, notFound, serverError, fail, paginated } = require('../utils/response');
const { emit } = require('../utils/socket');

const Doc      = () => mongoose.model('Document');
const Folder   = () => mongoose.model('DocumentFolder');
const Cat      = () => mongoose.model('DocumentCategory');
const Ver      = () => mongoose.model('DocumentVersion');
const Tag      = () => mongoose.model('DocumentTag');
const Cmt      = () => mongoose.model('DocumentComment');
const Perm     = () => mongoose.model('DocumentPermission');
const Share    = () => mongoose.model('DocumentShare');
const Tmpl     = () => mongoose.model('DocumentTemplate');
const DAudit   = () => mongoose.model('DocumentAudit');

async function logAudit(documentId, action, userId, details = {}, fromStatus = '', toStatus = '', req = null) {
  try {
    await DAudit().create({
      document: documentId,
      action,
      performedBy: userId,
      performedAt: new Date(),
      ipAddress: req?.ip || '',
      userAgent: req?.headers?.['user-agent'] || '',
      details,
      fromStatus,
      toStatus,
    });
  } catch (_) {}
}

// ── Documents ──────────────────────────────────────────────────────────────

exports.listDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 20, folder, category, module: mod, status, search, tags, documentType } = req.query;
    const q = { isDeleted: false };
    if (folder) q.folder = folder;
    if (category) q.category = category;
    if (mod) q.module = mod;
    if (status) q.status = status;
    if (documentType) q.documentType = documentType;
    if (tags) q.tags = { $in: tags.split(',') };
    if (search) q.$text = { $search: search };
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Doc().find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('folder', 'name folderCode')
        .populate('category', 'name')
        .populate('owner', 'name email')
        .populate('createdBy', 'name'),
      Doc().countDocuments(q),
    ]);
    return paginated(res, data, total, page, limit);
  } catch (e) { return serverError(res, e); }
};

exports.createDocument = async (req, res) => {
  try {
    const body = { ...req.body, createdBy: req.user._id, owner: req.body.owner || req.user._id };
    const doc = await Doc().create(body);
    await logAudit(doc._id, 'create', req.user._id, {}, '', 'draft', req);
    emit(req.app.locals.io, 'document:uploaded', { documentId: doc._id, title: doc.title, createdBy: req.user.name });
    return created(res, doc, 'Document created');
  } catch (e) { return serverError(res, e); }
};

exports.getDocument = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false })
      .populate('folder', 'name folderCode path')
      .populate('category', 'name color')
      .populate('owner', 'name email')
      .populate('createdBy', 'name')
      .populate('checkedOutBy', 'name email')
      .populate('retentionPolicy', 'name retentionYears');
    if (!doc) return notFound(res, 'Document');
    // Increment view count
    await Doc().updateOne({ _id: doc._id }, { $inc: { viewCount: 1 } });
    await logAudit(doc._id, 'view', req.user?._id, {}, '', '', req);
    return ok(res, doc);
  } catch (e) { return serverError(res, e); }
};

exports.updateDocument = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    if (doc.isCheckedOut && String(doc.checkedOutBy) !== String(req.user._id)) {
      return fail(res, 'Document is checked out by another user');
    }
    const from = doc.status;
    Object.assign(doc, req.body);
    await doc.save();
    await logAudit(doc._id, 'update', req.user._id, { changes: req.body }, from, doc.status, req);
    return ok(res, doc, 'Document updated');
  } catch (e) { return serverError(res, e); }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    await Doc().updateOne({ _id: doc._id }, { isDeleted: true });
    await logAudit(doc._id, 'delete', req.user._id, {}, doc.status, 'deleted', req);
    return ok(res, null, 'Document deleted');
  } catch (e) { return serverError(res, e); }
};

exports.uploadDocumentFile = async (req, res) => {
  try {
    if (!req.file) return fail(res, 'No file uploaded');
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    // Save previous version
    if (doc.fileUrl) {
      const verCount = await Ver().countDocuments({ document: doc._id });
      await Ver().create({
        document: doc._id,
        versionNumber: doc.currentVersion,
        versionLabel: doc.versionLabel,
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        createdBy: req.user._id,
        changeSummary: req.body.changeSummary || 'File updated',
        changeType: req.body.changeType || 'minor',
        isCurrent: false,
      });
      // Mark old versions as not current
      await Ver().updateMany({ document: doc._id }, { isCurrent: false });
    }
    const newVersion = doc.currentVersion + (doc.fileUrl ? 1 : 0);
    const newLabel = `${newVersion}.0`;
    doc.fileUrl = req.file.path;
    doc.fileName = req.file.originalname;
    doc.fileSize = req.file.size;
    doc.mimeType = req.file.mimetype;
    doc.currentVersion = newVersion;
    doc.versionLabel = newLabel;
    await doc.save();
    // Create current version record
    await Ver().create({
      document: doc._id,
      versionNumber: newVersion,
      versionLabel: newLabel,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      createdBy: req.user._id,
      changeSummary: req.body.changeSummary || 'New upload',
      changeType: req.body.changeType || 'major',
      isCurrent: true,
    });
    await logAudit(doc._id, 'upload', req.user._id, { fileName: doc.fileName, version: newVersion }, '', '', req);
    emit(req.app.locals.io, 'document:uploaded', { documentId: doc._id, title: doc.title, version: newVersion });
    return ok(res, { fileUrl: doc.fileUrl, version: newVersion, versionLabel: newLabel }, 'File uploaded');
  } catch (e) { return serverError(res, e); }
};

exports.checkOutDocument = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    if (doc.isCheckedOut) return fail(res, `Document already checked out by another user`);
    doc.isCheckedOut = true;
    doc.checkedOutBy = req.user._id;
    doc.checkedOutAt = new Date();
    await doc.save();
    await logAudit(doc._id, 'checkout', req.user._id, {}, '', '', req);
    return ok(res, doc, 'Document checked out');
  } catch (e) { return serverError(res, e); }
};

exports.checkInDocument = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    if (!doc.isCheckedOut) return fail(res, 'Document is not checked out');
    if (String(doc.checkedOutBy) !== String(req.user._id)) return fail(res, 'Only the person who checked out can check in');
    doc.isCheckedOut = false;
    doc.checkedOutBy = null;
    doc.checkedOutAt = null;
    await doc.save();
    await logAudit(doc._id, 'checkin', req.user._id, {}, '', '', req);
    return ok(res, doc, 'Document checked in');
  } catch (e) { return serverError(res, e); }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    const isFav = doc.favoritedBy.includes(req.user._id);
    if (isFav) {
      await Doc().updateOne({ _id: doc._id }, { $pull: { favoritedBy: req.user._id } });
    } else {
      await Doc().updateOne({ _id: doc._id }, { $addToSet: { favoritedBy: req.user._id } });
    }
    return ok(res, { favorited: !isFav }, isFav ? 'Removed from favorites' : 'Added to favorites');
  } catch (e) { return serverError(res, e); }
};

exports.downloadDocument = async (req, res) => {
  try {
    const doc = await Doc().findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    await Doc().updateOne({ _id: doc._id }, { $inc: { downloadCount: 1 } });
    await logAudit(doc._id, 'download', req.user._id, {}, '', '', req);
    return ok(res, { fileUrl: doc.fileUrl, fileName: doc.fileName });
  } catch (e) { return serverError(res, e); }
};

// ── Versions ────────────────────────────────────────────────────────────────

exports.listVersions = async (req, res) => {
  try {
    const versions = await Ver().find({ document: req.params.id })
      .sort({ versionNumber: -1 })
      .populate('createdBy', 'name');
    return ok(res, versions);
  } catch (e) { return serverError(res, e); }
};

exports.restoreVersion = async (req, res) => {
  try {
    const ver = await Ver().findById(req.params.verId);
    if (!ver) return notFound(res, 'Version');
    const doc = await Doc().findOne({ _id: ver.document, isDeleted: false });
    if (!doc) return notFound(res, 'Document');
    // Save current as a version
    await Ver().updateMany({ document: doc._id }, { isCurrent: false });
    doc.fileUrl = ver.fileUrl;
    doc.fileName = ver.fileName;
    doc.fileSize = ver.fileSize;
    doc.mimeType = ver.mimeType;
    doc.currentVersion = doc.currentVersion + 1;
    doc.versionLabel = `${doc.currentVersion}.0`;
    await doc.save();
    ver.isCurrent = true;
    await ver.save();
    await logAudit(doc._id, 'version_restore', req.user._id, { restoredVersion: ver.versionNumber }, '', '', req);
    return ok(res, doc, 'Version restored');
  } catch (e) { return serverError(res, e); }
};

// ── Folders ─────────────────────────────────────────────────────────────────

exports.listFolders = async (req, res) => {
  try {
    const { parent, module: mod } = req.query;
    const q = { isDeleted: false };
    if (parent) q.parent = parent;
    else if (parent === '') q.parent = null;
    if (mod) q.module = { $in: [mod, 'all'] };
    const folders = await Folder().find(q).sort({ name: 1 }).populate('owner', 'name');
    return ok(res, folders);
  } catch (e) { return serverError(res, e); }
};

exports.createFolder = async (req, res) => {
  try {
    const { name, parent, module: mod, color, icon, description } = req.body;
    let path = `/${name}`;
    let depth = 0;
    if (parent) {
      const parentFolder = await Folder().findById(parent);
      if (parentFolder) { path = `${parentFolder.path}/${name}`; depth = parentFolder.depth + 1; }
    }
    const folder = await Folder().create({ name, parent: parent || null, path, depth, module: mod || 'all', color, icon, description, owner: req.user._id });
    return created(res, folder, 'Folder created');
  } catch (e) { return serverError(res, e); }
};

exports.updateFolder = async (req, res) => {
  try {
    const folder = await Folder().findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!folder) return notFound(res, 'Folder');
    return ok(res, folder, 'Folder updated');
  } catch (e) { return serverError(res, e); }
};

exports.deleteFolder = async (req, res) => {
  try {
    const docCount = await Doc().countDocuments({ folder: req.params.id, isDeleted: false });
    if (docCount > 0) return fail(res, `Cannot delete folder with ${docCount} documents`);
    await Folder().findByIdAndUpdate(req.params.id, { isDeleted: true });
    return ok(res, null, 'Folder deleted');
  } catch (e) { return serverError(res, e); }
};

// ── Categories ───────────────────────────────────────────────────────────────

exports.listCategories = async (req, res) => {
  try {
    const cats = await Cat().find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    return ok(res, cats);
  } catch (e) { return serverError(res, e); }
};

exports.createCategory = async (req, res) => {
  try {
    const cat = await Cat().create(req.body);
    return created(res, cat, 'Category created');
  } catch (e) { return serverError(res, e); }
};

exports.updateCategory = async (req, res) => {
  try {
    const cat = await Cat().findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return notFound(res, 'Category');
    return ok(res, cat, 'Category updated');
  } catch (e) { return serverError(res, e); }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Cat().findByIdAndDelete(req.params.id);
    return ok(res, null, 'Category deleted');
  } catch (e) { return serverError(res, e); }
};

// ── Tags ─────────────────────────────────────────────────────────────────────

exports.listTags = async (req, res) => {
  try {
    const tags = await Tag().find({ isActive: true }).sort({ usageCount: -1 });
    return ok(res, tags);
  } catch (e) { return serverError(res, e); }
};

exports.createTag = async (req, res) => {
  try {
    const tag = await Tag().create(req.body);
    return created(res, tag, 'Tag created');
  } catch (e) { return serverError(res, e); }
};

exports.deleteTag = async (req, res) => {
  try {
    await Tag().findByIdAndDelete(req.params.id);
    return ok(res, null, 'Tag deleted');
  } catch (e) { return serverError(res, e); }
};

// ── Comments ─────────────────────────────────────────────────────────────────

exports.listComments = async (req, res) => {
  try {
    const comments = await Cmt().find({ document: req.params.id, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate('author', 'name email');
    return ok(res, comments);
  } catch (e) { return serverError(res, e); }
};

exports.addComment = async (req, res) => {
  try {
    const cmt = await Cmt().create({
      ...req.body,
      document: req.params.id,
      author: req.user._id,
      authorName: req.user.name,
    });
    await logAudit(req.params.id, 'comment_add', req.user._id, { comment: req.body.comment }, '', '', req);
    return created(res, cmt, 'Comment added');
  } catch (e) { return serverError(res, e); }
};

exports.deleteComment = async (req, res) => {
  try {
    await Cmt().findByIdAndUpdate(req.params.cmtId, { isDeleted: true });
    return ok(res, null, 'Comment deleted');
  } catch (e) { return serverError(res, e); }
};

// ── Permissions ──────────────────────────────────────────────────────────────

exports.listPermissions = async (req, res) => {
  try {
    const perms = await Perm().find({ document: req.params.id, isActive: true })
      .populate('grantedTo', 'name email')
      .populate('grantedBy', 'name');
    return ok(res, perms);
  } catch (e) { return serverError(res, e); }
};

exports.grantPermission = async (req, res) => {
  try {
    const perm = await Perm().create({ ...req.body, document: req.params.id, grantedBy: req.user._id });
    await logAudit(req.params.id, 'permission_change', req.user._id, { granted: req.body }, '', '', req);
    return created(res, perm, 'Permission granted');
  } catch (e) { return serverError(res, e); }
};

exports.revokePermission = async (req, res) => {
  try {
    await Perm().findByIdAndUpdate(req.params.permId, { isActive: false });
    return ok(res, null, 'Permission revoked');
  } catch (e) { return serverError(res, e); }
};

// ── Sharing ──────────────────────────────────────────────────────────────────

exports.shareDocument = async (req, res) => {
  try {
    const token = require('crypto').randomBytes(20).toString('hex');
    const share = await Share().create({
      ...req.body,
      document: req.params.id,
      sharedBy: req.user._id,
      linkToken: token,
      shareLink: `${process.env.FRONTEND_URL || ''}/docs/shared/${token}`,
    });
    await logAudit(req.params.id, 'share', req.user._id, { shareType: req.body.shareType }, '', '', req);
    return created(res, share, 'Document shared');
  } catch (e) { return serverError(res, e); }
};

exports.listShares = async (req, res) => {
  try {
    const shares = await Share().find({ document: req.params.id, isActive: true })
      .populate('sharedWithUser', 'name email')
      .populate('sharedBy', 'name');
    return ok(res, shares);
  } catch (e) { return serverError(res, e); }
};

exports.revokeShare = async (req, res) => {
  try {
    await Share().findByIdAndUpdate(req.params.shareId, { isActive: false });
    return ok(res, null, 'Share revoked');
  } catch (e) { return serverError(res, e); }
};

// ── Templates ────────────────────────────────────────────────────────────────

exports.listTemplates = async (req, res) => {
  try {
    const { module: mod, documentType } = req.query;
    const q = { isActive: true };
    if (mod) q.module = mod;
    if (documentType) q.documentType = documentType;
    const templates = await Tmpl().find(q).sort({ usageCount: -1 })
      .populate('createdBy', 'name');
    return ok(res, templates);
  } catch (e) { return serverError(res, e); }
};

exports.createTemplate = async (req, res) => {
  try {
    const tmpl = await Tmpl().create({ ...req.body, createdBy: req.user._id });
    return created(res, tmpl, 'Template created');
  } catch (e) { return serverError(res, e); }
};

exports.uploadTemplateFile = async (req, res) => {
  try {
    if (!req.file) return fail(res, 'No file uploaded');
    const tmpl = await Tmpl().findByIdAndUpdate(req.params.id, {
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    }, { new: true });
    if (!tmpl) return notFound(res, 'Template');
    return ok(res, tmpl, 'Template file uploaded');
  } catch (e) { return serverError(res, e); }
};

exports.updateTemplate = async (req, res) => {
  try {
    const tmpl = await Tmpl().findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tmpl) return notFound(res, 'Template');
    return ok(res, tmpl, 'Template updated');
  } catch (e) { return serverError(res, e); }
};

exports.deleteTemplate = async (req, res) => {
  try {
    await Tmpl().findByIdAndDelete(req.params.id);
    return ok(res, null, 'Template deleted');
  } catch (e) { return serverError(res, e); }
};

exports.createFromTemplate = async (req, res) => {
  try {
    const tmpl = await Tmpl().findById(req.params.id);
    if (!tmpl) return notFound(res, 'Template');
    const doc = await Doc().create({
      title: req.body.title || `${tmpl.name} - ${new Date().toLocaleDateString()}`,
      documentType: tmpl.documentType,
      module: tmpl.module || req.body.module || 'general',
      description: req.body.description || tmpl.description,
      fileUrl: tmpl.fileUrl,
      fileName: tmpl.fileName,
      fileSize: tmpl.fileSize,
      mimeType: tmpl.mimeType,
      createdBy: req.user._id,
      owner: req.user._id,
      folder: req.body.folder,
      category: req.body.category,
    });
    await Tmpl().updateOne({ _id: tmpl._id }, { $inc: { usageCount: 1 } });
    return created(res, doc, 'Document created from template');
  } catch (e) { return serverError(res, e); }
};

// ── Search ────────────────────────────────────────────────────────────────────

exports.searchDocuments = async (req, res) => {
  try {
    const { q, module: mod, status, documentType, page = 1, limit = 20 } = req.query;
    if (!q) return fail(res, 'Search query required');
    const query = { isDeleted: false, $text: { $search: q } };
    if (mod) query.module = mod;
    if (status) query.status = status;
    if (documentType) query.documentType = documentType;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Doc().find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip).limit(Number(limit))
        .populate('folder', 'name')
        .populate('category', 'name'),
      Doc().countDocuments(query),
    ]);
    return paginated(res, data, total, page, limit);
  } catch (e) { return serverError(res, e); }
};

exports.getMyDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const q = { owner: req.user._id, isDeleted: false };
    if (status) q.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Doc().find(q).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit))
        .populate('folder', 'name').populate('category', 'name'),
      Doc().countDocuments(q),
    ]);
    return paginated(res, data, total, page, limit);
  } catch (e) { return serverError(res, e); }
};

exports.getMyFavorites = async (req, res) => {
  try {
    const docs = await Doc().find({ favoritedBy: req.user._id, isDeleted: false })
      .sort({ updatedAt: -1 })
      .populate('folder', 'name').populate('category', 'name');
    return ok(res, docs);
  } catch (e) { return serverError(res, e); }
};

exports.getRecentDocuments = async (req, res) => {
  try {
    const auditEntries = await DAudit().find({ performedBy: req.user._id, action: 'view' })
      .sort({ performedAt: -1 }).limit(20).distinct('document');
    const docs = await Doc().find({ _id: { $in: auditEntries }, isDeleted: false })
      .populate('folder', 'name');
    return ok(res, docs);
  } catch (e) { return serverError(res, e); }
};
