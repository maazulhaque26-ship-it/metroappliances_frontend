'use strict';
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
const TEST_DB = 'mongodb://localhost:27017/metro_test_dms';

beforeAll(async () => {
  try {
    await mongoose.connect(TEST_DB, { serverSelectionTimeoutMS: 5000 });
  } catch {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }

  require('../models/Document');
  require('../models/DocumentFolder');
  require('../models/DocumentCategory');
  require('../models/DocumentVersion');
  require('../models/DocumentApproval');
  require('../models/DocumentReview');
  require('../models/DocumentRetention');
  require('../models/DocumentArchive');
  require('../models/DocumentTag');
  require('../models/DocumentComment');
  require('../models/DocumentPermission');
  require('../models/DocumentShare');
  require('../models/DocumentTemplate');
  require('../models/DocumentSignature');
  require('../models/DocumentAudit');
  require('../models/KnowledgeArticle');
  require('../models/KnowledgeCategory');
  require('../models/KnowledgeRevision');
  require('../models/KnowledgeFeedback');
  require('../models/KnowledgeBookmark');
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  const cols = Object.values(mongoose.connection.collections);
  for (const col of cols) await col.deleteMany({});
});

const uid = () => new mongoose.Types.ObjectId();

// ─────────────────────────────────────────────────────────────────────────────
// Document model
// ─────────────────────────────────────────────────────────────────────────────
describe('Document model', () => {
  const M = () => mongoose.model('Document');

  it('auto-generates documentCode with DMS- prefix', async () => {
    const doc = await M().create({ title: 'Test Policy', owner: uid() });
    expect(doc.documentCode).toMatch(/^DMS-\d{4}-\d{5}$/);
  });

  it('requires title', async () => {
    await expect(M().create({ owner: uid() })).rejects.toThrow();
  });

  it('defaults status to draft', async () => {
    const doc = await M().create({ title: 'Draft Doc', owner: uid() });
    expect(doc.status).toBe('draft');
  });

  it('defaults isCheckedOut to false', async () => {
    const doc = await M().create({ title: 'Checkout Test', owner: uid() });
    expect(doc.isCheckedOut).toBe(false);
  });

  it('defaults viewCount and downloadCount to 0', async () => {
    const doc = await M().create({ title: 'Counter Test', owner: uid() });
    expect(doc.viewCount).toBe(0);
    expect(doc.downloadCount).toBe(0);
  });

  it('accepts all valid status values', async () => {
    const statuses = ['draft', 'under_review', 'approved', 'published', 'archived', 'obsolete', 'expired'];
    for (const status of statuses) {
      const doc = await M().create({ title: `Doc-${status}`, owner: uid(), status });
      expect(doc.status).toBe(status);
    }
  });

  it('rejects invalid status', async () => {
    await expect(M().create({ title: 'Bad Status', owner: uid(), status: 'invalid' })).rejects.toThrow();
  });

  it('accepts all valid documentType values', async () => {
    const types = ['policy', 'procedure', 'form', 'template', 'report', 'contract', 'invoice', 'manual', 'specification', 'certificate', 'drawing', 'other'];
    for (const documentType of types) {
      const doc = await M().create({ title: `${documentType} doc`, owner: uid(), documentType });
      expect(doc.documentType).toBe(documentType);
    }
  });

  it('defaults to module general', async () => {
    const doc = await M().create({ title: 'Module Test', owner: uid() });
    expect(doc.module).toBe('general');
  });

  it('stores tags array', async () => {
    const doc = await M().create({ title: 'Tagged Doc', owner: uid(), tags: ['finance', 'audit'] });
    expect(doc.tags).toContain('finance');
    expect(doc.tags).toContain('audit');
  });

  it('stores entityType and entityId for module linking', async () => {
    const eid = uid();
    const doc = await M().create({ title: 'Linked Doc', owner: uid(), entityType: 'LeaveRequest', entityId: eid });
    expect(doc.entityType).toBe('LeaveRequest');
    expect(doc.entityId.toString()).toBe(eid.toString());
  });

  it('defaults ocrProcessed to false', async () => {
    const doc = await M().create({ title: 'OCR Doc', owner: uid() });
    expect(doc.ocrProcessed).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentFolder model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentFolder model', () => {
  const M = () => mongoose.model('DocumentFolder');

  it('auto-generates folderCode with FLD- prefix', async () => {
    const folder = await M().create({ name: 'HR Docs' });
    expect(folder.folderCode).toMatch(/^FLD-\d{4}-\d{5}$/);
  });

  it('requires name', async () => {
    await expect(M().create({})).rejects.toThrow();
  });

  it('defaults depth to 0 and path to /', async () => {
    const folder = await M().create({ name: 'Root Folder' });
    expect(folder.depth).toBe(0);
    expect(folder.path).toBe('/');
  });

  it('defaults module to all', async () => {
    const folder = await M().create({ name: 'All Module Folder' });
    expect(folder.module).toBe('all');
  });

  it('allows nested folder with parent ref', async () => {
    const parent = await M().create({ name: 'Parent' });
    const child = await M().create({ name: 'Child', parent: parent._id, depth: 1 });
    expect(child.parent.toString()).toBe(parent._id.toString());
    expect(child.depth).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentCategory model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentCategory model', () => {
  const M = () => mongoose.model('DocumentCategory');

  it('auto-generates categoryCode with DCAT- prefix', async () => {
    const cat = await M().create({ name: 'Finance' });
    expect(cat.categoryCode).toMatch(/^DCAT-\d{4}-\d{5}$/);
  });

  it('requires name', async () => {
    await expect(M().create({})).rejects.toThrow();
  });

  it('defaults isActive to true', async () => {
    const cat = await M().create({ name: 'Active Cat' });
    expect(cat.isActive).toBe(true);
  });

  it('defaults documentCount to 0', async () => {
    const cat = await M().create({ name: 'Empty Cat' });
    expect(cat.documentCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentVersion model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentVersion model', () => {
  const M = () => mongoose.model('DocumentVersion');

  it('auto-generates versionCode with DVER- prefix', async () => {
    const ver = await M().create({ document: uid(), versionNumber: 1 });
    expect(ver.versionCode).toMatch(/^DVER-\d{4}-\d{5}$/);
  });

  it('requires document and versionNumber', async () => {
    await expect(M().create({ versionNumber: 1 })).rejects.toThrow();
    await expect(M().create({ document: uid() })).rejects.toThrow();
  });

  it('defaults isCurrent to false', async () => {
    const ver = await M().create({ document: uid(), versionNumber: 1 });
    expect(ver.isCurrent).toBe(false);
  });

  it('accepts changeType enum values', async () => {
    for (const t of ['major', 'minor', 'patch', 'initial']) {
      const ver = await M().create({ document: uid(), versionNumber: 1, changeType: t });
      expect(ver.changeType).toBe(t);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentApproval model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentApproval model', () => {
  const M = () => mongoose.model('DocumentApproval');

  it('auto-generates approvalCode with DAPR- prefix', async () => {
    const appr = await M().create({ document: uid(), approver: uid() });
    expect(appr.approvalCode).toMatch(/^DAPR-\d{4}-\d{5}$/);
  });

  it('requires document and approver', async () => {
    await expect(M().create({ document: uid() })).rejects.toThrow();
    await expect(M().create({ approver: uid() })).rejects.toThrow();
  });

  it('defaults status to pending', async () => {
    const appr = await M().create({ document: uid(), approver: uid() });
    expect(appr.status).toBe('pending');
  });

  it('accepts all status values', async () => {
    for (const status of ['pending', 'approved', 'rejected', 'recalled', 'delegated']) {
      const appr = await M().create({ document: uid(), approver: uid(), status });
      expect(appr.status).toBe(status);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentReview model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentReview model', () => {
  const M = () => mongoose.model('DocumentReview');

  it('auto-generates reviewCode with DRVW- prefix', async () => {
    const rev = await M().create({ document: uid(), reviewer: uid(), dueDate: new Date() });
    expect(rev.reviewCode).toMatch(/^DRVW-\d{4}-\d{5}$/);
  });

  it('requires document, reviewer, dueDate', async () => {
    await expect(M().create({ reviewer: uid(), dueDate: new Date() })).rejects.toThrow();
  });

  it('defaults status to scheduled', async () => {
    const rev = await M().create({ document: uid(), reviewer: uid(), dueDate: new Date() });
    expect(rev.status).toBe('scheduled');
  });

  it('accepts all reviewType values', async () => {
    for (const reviewType of ['periodic', 'triggered', 'ad_hoc', 'compliance']) {
      const rev = await M().create({ document: uid(), reviewer: uid(), dueDate: new Date(), reviewType });
      expect(rev.reviewType).toBe(reviewType);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentRetention model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentRetention model', () => {
  const M = () => mongoose.model('DocumentRetention');

  it('auto-generates retentionCode with RET- prefix', async () => {
    const pol = await M().create({ name: 'Finance 7 Year' });
    expect(pol.retentionCode).toMatch(/^RET-\d{4}-\d{5}$/);
  });

  it('requires name', async () => {
    await expect(M().create({})).rejects.toThrow();
  });

  it('defaults retentionYears to 7', async () => {
    const pol = await M().create({ name: 'Default Retention' });
    expect(pol.retentionYears).toBe(7);
  });

  it('defaults postRetentionAction to archive', async () => {
    const pol = await M().create({ name: 'Archive Policy' });
    expect(pol.postRetentionAction).toBe('archive');
  });

  it('accepts all postRetentionAction values', async () => {
    for (const action of ['delete', 'archive', 'review', 'legal_hold']) {
      const pol = await M().create({ name: `Policy-${action}`, postRetentionAction: action });
      expect(pol.postRetentionAction).toBe(action);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentArchive model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentArchive model', () => {
  const M = () => mongoose.model('DocumentArchive');

  it('auto-generates archiveCode with ARC- prefix', async () => {
    const arc = await M().create({ document: uid(), archivedBy: uid() });
    expect(arc.archiveCode).toMatch(/^ARC-\d{4}-\d{5}$/);
  });

  it('requires document and archivedBy', async () => {
    await expect(M().create({ document: uid() })).rejects.toThrow();
    await expect(M().create({ archivedBy: uid() })).rejects.toThrow();
  });

  it('defaults isRestored to false', async () => {
    const arc = await M().create({ document: uid(), archivedBy: uid() });
    expect(arc.isRestored).toBe(false);
  });

  it('accepts all archiveReason values', async () => {
    for (const reason of ['retention_policy', 'obsolete', 'superseded', 'manual', 'compliance']) {
      const arc = await M().create({ document: uid(), archivedBy: uid(), archiveReason: reason });
      expect(arc.archiveReason).toBe(reason);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentTag model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentTag model', () => {
  const M = () => mongoose.model('DocumentTag');

  it('auto-generates tagCode with DTAG- prefix', async () => {
    const tag = await M().create({ name: 'Finance Tag' });
    expect(tag.tagCode).toMatch(/^DTAG-\d{4}-\d{5}$/);
  });

  it('requires name', async () => {
    await expect(M().create({})).rejects.toThrow();
  });

  it('auto-generates slug from name', async () => {
    const tag = await M().create({ name: 'My Cool Tag' });
    expect(tag.slug).toBe('my-cool-tag');
  });

  it('defaults usageCount to 0', async () => {
    const tag = await M().create({ name: 'Usage Tag' });
    expect(tag.usageCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentComment model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentComment model', () => {
  const M = () => mongoose.model('DocumentComment');

  it('auto-generates commentCode with DCMT- prefix', async () => {
    const cmt = await M().create({ document: uid(), author: uid(), comment: 'Test comment' });
    expect(cmt.commentCode).toMatch(/^DCMT-\d{4}-\d{5}$/);
  });

  it('requires document, author, comment', async () => {
    await expect(M().create({ author: uid(), comment: 'Hi' })).rejects.toThrow();
    await expect(M().create({ document: uid(), comment: 'Hi' })).rejects.toThrow();
  });

  it('defaults isInternal and isPinned to false', async () => {
    const cmt = await M().create({ document: uid(), author: uid(), comment: 'Hello' });
    expect(cmt.isInternal).toBe(false);
    expect(cmt.isPinned).toBe(false);
  });

  it('supports threaded comments via parentComment', async () => {
    const parent = await M().create({ document: uid(), author: uid(), comment: 'Parent' });
    const reply = await M().create({ document: uid(), author: uid(), comment: 'Reply', parentComment: parent._id });
    expect(reply.parentComment.toString()).toBe(parent._id.toString());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentPermission model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentPermission model', () => {
  const M = () => mongoose.model('DocumentPermission');

  it('auto-generates permissionCode with DPRM- prefix', async () => {
    const perm = await M().create({ document: uid() });
    expect(perm.permissionCode).toMatch(/^DPRM-\d{4}-\d{5}$/);
  });

  it('requires document', async () => {
    await expect(M().create({})).rejects.toThrow();
  });

  it('defaults accessType to view', async () => {
    const perm = await M().create({ document: uid() });
    expect(perm.accessType).toBe('view');
  });

  it('defaults scope to user', async () => {
    const perm = await M().create({ document: uid() });
    expect(perm.scope).toBe('user');
  });

  it('accepts all accessType values', async () => {
    for (const at of ['view', 'download', 'edit', 'approve', 'admin']) {
      const perm = await M().create({ document: uid(), accessType: at });
      expect(perm.accessType).toBe(at);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentShare model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentShare model', () => {
  const M = () => mongoose.model('DocumentShare');

  it('auto-generates shareCode with DSHR- prefix', async () => {
    const share = await M().create({ document: uid(), sharedBy: uid() });
    expect(share.shareCode).toMatch(/^DSHR-\d{4}-\d{5}$/);
  });

  it('requires document and sharedBy', async () => {
    await expect(M().create({ document: uid() })).rejects.toThrow();
  });

  it('defaults shareType to internal', async () => {
    const share = await M().create({ document: uid(), sharedBy: uid() });
    expect(share.shareType).toBe('internal');
  });

  it('defaults viewCount to 0', async () => {
    const share = await M().create({ document: uid(), sharedBy: uid() });
    expect(share.viewCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentTemplate model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentTemplate model', () => {
  const M = () => mongoose.model('DocumentTemplate');

  it('auto-generates templateCode with DTPL- prefix', async () => {
    const tmpl = await M().create({ name: 'Leave Form Template' });
    expect(tmpl.templateCode).toMatch(/^DTPL-\d{4}-\d{5}$/);
  });

  it('requires name', async () => {
    await expect(M().create({})).rejects.toThrow();
  });

  it('defaults isPublic and isActive to true', async () => {
    const tmpl = await M().create({ name: 'Public Template' });
    expect(tmpl.isPublic).toBe(true);
    expect(tmpl.isActive).toBe(true);
  });

  it('defaults usageCount to 0', async () => {
    const tmpl = await M().create({ name: 'Usage Count Test' });
    expect(tmpl.usageCount).toBe(0);
  });

  it('stores template fields with fieldType', async () => {
    const tmpl = await M().create({
      name: 'With Fields',
      fields: [{ fieldName: 'name', fieldLabel: 'Full Name', fieldType: 'text', required: true }],
    });
    expect(tmpl.fields[0].fieldType).toBe('text');
    expect(tmpl.fields[0].required).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentSignature model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentSignature model', () => {
  const M = () => mongoose.model('DocumentSignature');

  it('auto-generates signatureCode with DSIG- prefix', async () => {
    const sig = await M().create({ document: uid(), signer: uid() });
    expect(sig.signatureCode).toMatch(/^DSIG-\d{4}-\d{5}$/);
  });

  it('requires document and signer', async () => {
    await expect(M().create({ document: uid() })).rejects.toThrow();
    await expect(M().create({ signer: uid() })).rejects.toThrow();
  });

  it('defaults status to pending', async () => {
    const sig = await M().create({ document: uid(), signer: uid() });
    expect(sig.status).toBe('pending');
  });

  it('accepts all status values', async () => {
    for (const status of ['pending', 'signed', 'declined', 'expired']) {
      const sig = await M().create({ document: uid(), signer: uid(), status });
      expect(sig.status).toBe(status);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DocumentAudit model
// ─────────────────────────────────────────────────────────────────────────────
describe('DocumentAudit model', () => {
  const M = () => mongoose.model('DocumentAudit');

  it('auto-generates auditCode with DAUD- prefix', async () => {
    const audit = await M().create({ document: uid(), action: 'upload' });
    expect(audit.auditCode).toMatch(/^DAUD-\d{4}-\d{5}$/);
  });

  it('requires document and action', async () => {
    await expect(M().create({ document: uid() })).rejects.toThrow();
    await expect(M().create({ action: 'upload' })).rejects.toThrow();
  });

  it('defaults performedAt to now', async () => {
    const before = Date.now();
    const audit = await M().create({ document: uid(), action: 'view' });
    expect(audit.performedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeArticle model
// ─────────────────────────────────────────────────────────────────────────────
describe('KnowledgeArticle model', () => {
  const M = () => mongoose.model('KnowledgeArticle');

  it('auto-generates articleCode with KBA- prefix', async () => {
    const art = await M().create({ title: 'How to file a leave', content: 'Go to ESS portal...' });
    expect(art.articleCode).toMatch(/^KBA-\d{4}-\d{5}$/);
  });

  it('requires title and content', async () => {
    await expect(M().create({ title: 'No Content' })).rejects.toThrow();
    await expect(M().create({ content: 'No Title' })).rejects.toThrow();
  });

  it('auto-generates slug from title', async () => {
    const art = await M().create({ title: 'My Knowledge Article', content: 'Content here' });
    expect(art.slug).toMatch(/^my-knowledge-article-\d+$/);
  });

  it('defaults status to draft', async () => {
    const art = await M().create({ title: 'Draft Article', content: 'Content' });
    expect(art.status).toBe('draft');
  });

  it('defaults viewCount, likeCount, dislikeCount, bookmarkCount to 0', async () => {
    const art = await M().create({ title: 'Counter Test', content: 'Content' });
    expect(art.viewCount).toBe(0);
    expect(art.likeCount).toBe(0);
    expect(art.dislikeCount).toBe(0);
    expect(art.bookmarkCount).toBe(0);
  });

  it('accepts all status values', async () => {
    for (const status of ['draft', 'under_review', 'published', 'archived']) {
      const art = await M().create({ title: `Article-${status}`, content: 'Content', status });
      expect(art.status).toBe(status);
    }
  });

  it('stores tags array', async () => {
    const art = await M().create({ title: 'Tagged Article', content: 'Content', tags: ['hr', 'leave'] });
    expect(art.tags).toContain('hr');
    expect(art.tags).toContain('leave');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeCategory model
// ─────────────────────────────────────────────────────────────────────────────
describe('KnowledgeCategory model', () => {
  const M = () => mongoose.model('KnowledgeCategory');

  it('auto-generates categoryCode with KBC- prefix', async () => {
    const cat = await M().create({ name: 'HR Policies' });
    expect(cat.categoryCode).toMatch(/^KBC-\d{4}-\d{5}$/);
  });

  it('requires name', async () => {
    await expect(M().create({})).rejects.toThrow();
  });

  it('auto-generates slug from name', async () => {
    const cat = await M().create({ name: 'HR Policies Category' });
    expect(cat.slug).toMatch(/^hr-policies-category-\d+$/);
  });

  it('defaults isActive to true and articleCount to 0', async () => {
    const cat = await M().create({ name: 'Default Cat' });
    expect(cat.isActive).toBe(true);
    expect(cat.articleCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeRevision model
// ─────────────────────────────────────────────────────────────────────────────
describe('KnowledgeRevision model', () => {
  const M = () => mongoose.model('KnowledgeRevision');

  it('auto-generates revisionCode with KBVR- prefix', async () => {
    const rev = await M().create({ article: uid(), version: 1 });
    expect(rev.revisionCode).toMatch(/^KBVR-\d{4}-\d{5}$/);
  });

  it('requires article and version', async () => {
    await expect(M().create({ article: uid() })).rejects.toThrow();
    await expect(M().create({ version: 1 })).rejects.toThrow();
  });

  it('defaults isCurrent to false', async () => {
    const rev = await M().create({ article: uid(), version: 1 });
    expect(rev.isCurrent).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeFeedback model
// ─────────────────────────────────────────────────────────────────────────────
describe('KnowledgeFeedback model', () => {
  const M = () => mongoose.model('KnowledgeFeedback');

  it('auto-generates feedbackCode with KBFB- prefix', async () => {
    const fb = await M().create({ article: uid(), reaction: 'helpful' });
    expect(fb.feedbackCode).toMatch(/^KBFB-\d{4}-\d{5}$/);
  });

  it('requires article', async () => {
    await expect(M().create({ reaction: 'helpful' })).rejects.toThrow();
  });

  it('accepts all reaction values', async () => {
    for (const reaction of ['like', 'dislike', 'helpful', 'not_helpful']) {
      const fb = await M().create({ article: uid(), reaction });
      expect(fb.reaction).toBe(reaction);
    }
  });

  it('allows rating 1-5', async () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      const fb = await M().create({ article: uid(), rating });
      expect(fb.rating).toBe(rating);
    }
  });

  it('rejects rating outside 1-5', async () => {
    await expect(M().create({ article: uid(), rating: 6 })).rejects.toThrow();
    await expect(M().create({ article: uid(), rating: 0 })).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeBookmark model
// ─────────────────────────────────────────────────────────────────────────────
describe('KnowledgeBookmark model', () => {
  const M = () => mongoose.model('KnowledgeBookmark');

  it('auto-generates bookmarkCode with KBBM- prefix', async () => {
    const bm = await M().create({ user: uid(), article: uid() });
    expect(bm.bookmarkCode).toMatch(/^KBBM-\d{4}-\d{5}$/);
  });

  it('requires user and article', async () => {
    await expect(M().create({ user: uid() })).rejects.toThrow();
    await expect(M().create({ article: uid() })).rejects.toThrow();
  });

  it('defaults collection to default', async () => {
    const bm = await M().create({ user: uid(), article: uid() });
    expect(bm.collection).toBe('default');
  });

  it('enforces unique user+article combination', async () => {
    const u = uid();
    const a = uid();
    await M().create({ user: u, article: a });
    await expect(M().create({ user: u, article: a })).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-model integration tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Cross-model: Document + Folder + Category', () => {
  it('links document to folder and category', async () => {
    const folder = await mongoose.model('DocumentFolder').create({ name: 'Finance Folder' });
    const cat = await mongoose.model('DocumentCategory').create({ name: 'Finance Cat' });
    const doc = await mongoose.model('Document').create({
      title: 'Finance Report Q1',
      owner: uid(),
      folder: folder._id,
      category: cat._id,
      module: 'finance',
    });
    const loaded = await mongoose.model('Document').findById(doc._id)
      .populate('folder', 'name').populate('category', 'name');
    expect(loaded.folder.name).toBe('Finance Folder');
    expect(loaded.category.name).toBe('Finance Cat');
  });
});

describe('Cross-model: Document versioning', () => {
  it('creates version records for document', async () => {
    const doc = await mongoose.model('Document').create({ title: 'Versioned Doc', owner: uid() });
    const ver1 = await mongoose.model('DocumentVersion').create({ document: doc._id, versionNumber: 1, isCurrent: false });
    const ver2 = await mongoose.model('DocumentVersion').create({ document: doc._id, versionNumber: 2, isCurrent: true });
    const versions = await mongoose.model('DocumentVersion').find({ document: doc._id }).sort({ versionNumber: -1 });
    expect(versions).toHaveLength(2);
    expect(versions[0].versionNumber).toBe(2);
    expect(versions[0].isCurrent).toBe(true);
  });
});

describe('Cross-model: Document approval chain', () => {
  it('creates approval and links to document', async () => {
    const doc = await mongoose.model('Document').create({ title: 'Approval Doc', owner: uid() });
    const approver = uid();
    const appr = await mongoose.model('DocumentApproval').create({ document: doc._id, approver });
    expect(appr.document.toString()).toBe(doc._id.toString());
    expect(appr.status).toBe('pending');
  });
});

describe('Cross-model: Document retention + archive', () => {
  it('applies retention policy and archives document', async () => {
    const policy = await mongoose.model('DocumentRetention').create({ name: 'Test Policy', retentionYears: 5 });
    const doc = await mongoose.model('Document').create({ title: 'Retained Doc', owner: uid(), retentionPolicy: policy._id });
    const archive = await mongoose.model('DocumentArchive').create({
      document: doc._id,
      archivedBy: uid(),
      archiveReason: 'retention_policy',
      titleSnapshot: doc.title,
    });
    expect(archive.archiveReason).toBe('retention_policy');
    const loaded = await mongoose.model('Document').findById(doc._id).populate('retentionPolicy', 'name retentionYears');
    expect(loaded.retentionPolicy.name).toBe('Test Policy');
    expect(loaded.retentionPolicy.retentionYears).toBe(5);
  });
});

describe('Cross-model: Knowledge article + feedback + bookmark', () => {
  it('creates article, adds feedback, and bookmarks it', async () => {
    const art = await mongoose.model('KnowledgeArticle').create({ title: 'ESS Guide', content: 'How to use ESS portal.' });
    const user = uid();
    const fb = await mongoose.model('KnowledgeFeedback').create({ article: art._id, user, reaction: 'helpful', rating: 5 });
    const bm = await mongoose.model('KnowledgeBookmark').create({ user, article: art._id });
    expect(fb.article.toString()).toBe(art._id.toString());
    expect(bm.article.toString()).toBe(art._id.toString());
  });

  it('prevents duplicate bookmarks', async () => {
    const art = await mongoose.model('KnowledgeArticle').create({ title: 'Unique Bookmark Test', content: 'Content' });
    const user = uid();
    await mongoose.model('KnowledgeBookmark').create({ user, article: art._id });
    await expect(mongoose.model('KnowledgeBookmark').create({ user, article: art._id })).rejects.toThrow();
  });
});

describe('Cross-model: Document audit trail', () => {
  it('logs multiple actions for a document', async () => {
    const doc = await mongoose.model('Document').create({ title: 'Audited Doc', owner: uid() });
    const user = uid();
    await mongoose.model('DocumentAudit').create({ document: doc._id, action: 'upload', performedBy: user });
    await mongoose.model('DocumentAudit').create({ document: doc._id, action: 'view', performedBy: user });
    await mongoose.model('DocumentAudit').create({ document: doc._id, action: 'download', performedBy: user });
    const trail = await mongoose.model('DocumentAudit').find({ document: doc._id }).sort({ performedAt: -1 });
    expect(trail).toHaveLength(3);
    const actions = trail.map(t => t.action);
    expect(actions).toContain('upload');
    expect(actions).toContain('view');
    expect(actions).toContain('download');
  });
});

describe('Cross-model: Knowledge revision history', () => {
  it('tracks article revisions', async () => {
    const art = await mongoose.model('KnowledgeArticle').create({ title: 'Revised Article', content: 'Version 1 content' });
    const rev = await mongoose.model('KnowledgeRevision').create({
      article: art._id,
      version: 1,
      content: art.content,
      changeSummary: 'Initial version',
      revisedBy: uid(),
    });
    expect(rev.article.toString()).toBe(art._id.toString());
    expect(rev.version).toBe(1);
  });
});

describe('Cross-model: Document signature workflow', () => {
  it('creates signature request and signs document', async () => {
    const doc = await mongoose.model('Document').create({ title: 'Contract', owner: uid(), requiresSignature: true });
    const signer = uid();
    const sig = await mongoose.model('DocumentSignature').create({ document: doc._id, signer, signerName: 'John Doe', stepOrder: 1 });
    expect(sig.status).toBe('pending');
    sig.status = 'signed';
    sig.signedAt = new Date();
    await sig.save();
    const loaded = await mongoose.model('DocumentSignature').findById(sig._id);
    expect(loaded.status).toBe('signed');
    expect(loaded.signedAt).toBeTruthy();
  });
});
