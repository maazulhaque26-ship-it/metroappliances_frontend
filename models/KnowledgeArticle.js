'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const knowledgeArticleSchema = new Schema({
  articleCode:    { type: String, unique: true },
  title:          { type: String, required: true, trim: true },
  slug:           { type: String, unique: true },
  summary:        { type: String, default: '' },
  content:        { type: String, required: true },
  category:       { type: Schema.Types.ObjectId, ref: 'KnowledgeCategory' },
  module:         { type: String, enum: ['hr','finance','projects','manufacturing','procurement','warehouse','service','qms','eam','crm','general'], default: 'general' },
  // Status
  status:         { type: String, enum: ['draft','under_review','published','archived'], default: 'draft' },
  // Authoring
  author:         { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  publishedBy:    { type: Schema.Types.ObjectId, ref: 'User' },
  publishedAt:    { type: Date },
  // Version
  version:        { type: Number, default: 1 },
  // Tags
  tags:           [{ type: String }],
  // Attachments
  attachments:    [{
    fileName: String,
    fileUrl:  String,
    fileSize: Number,
    mimeType: String,
  }],
  // Engagement
  viewCount:      { type: Number, default: 0 },
  likeCount:      { type: Number, default: 0 },
  dislikeCount:   { type: Number, default: 0 },
  bookmarkCount:  { type: Number, default: 0 },
  // Search
  searchKeywords: [{ type: String }],
  // Expiry
  expiryDate:     { type: Date },
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true });

knowledgeArticleSchema.index({ category: 1, status: 1 });
knowledgeArticleSchema.index({ module: 1, status: 1 });
knowledgeArticleSchema.index({ author: 1 });
knowledgeArticleSchema.index({ tags: 1 });
knowledgeArticleSchema.index({ title: 'text', content: 'text', summary: 'text' });

knowledgeArticleSchema.pre('validate', async function (next) {
  if (this.isNew && !this.articleCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('KnowledgeArticle').countDocuments();
    this.articleCode = `KBA-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  if (this.title && !this.slug) {
    const base = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    this.slug = `${base}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
