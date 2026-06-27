'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentSchema = new Schema({
  documentCode:      { type: String, unique: true },
  title:             { type: String, required: true, trim: true },
  description:       { type: String, default: '' },
  folder:            { type: Schema.Types.ObjectId, ref: 'DocumentFolder' },
  category:          { type: Schema.Types.ObjectId, ref: 'DocumentCategory' },
  documentType:      { type: String, enum: ['policy','procedure','form','template','report','contract','invoice','manual','specification','certificate','drawing','other'], default: 'other' },
  module:            { type: String, enum: ['hr','finance','projects','manufacturing','procurement','warehouse','service','qms','eam','crm','general'], default: 'general' },
  entityType:        { type: String, default: '' },
  entityId:          { type: Schema.Types.ObjectId },
  // File
  fileUrl:           { type: String, default: '' },
  fileName:          { type: String, default: '' },
  fileSize:          { type: Number, default: 0 },
  mimeType:          { type: String, default: '' },
  thumbnailUrl:      { type: String, default: '' },
  // Version control
  currentVersion:    { type: Number, default: 1 },
  versionLabel:      { type: String, default: '1.0' },
  // Status
  status:            { type: String, enum: ['draft','under_review','approved','published','archived','obsolete','expired'], default: 'draft' },
  // Check-in / check-out
  isCheckedOut:      { type: Boolean, default: false },
  checkedOutBy:      { type: Schema.Types.ObjectId, ref: 'User' },
  checkedOutAt:      { type: Date },
  // Ownership
  owner:             { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy:         { type: Schema.Types.ObjectId, ref: 'User' },
  // Dates
  effectiveDate:     { type: Date },
  expiryDate:        { type: Date },
  reviewDate:        { type: Date },
  isExpired:         { type: Boolean, default: false },
  // Tags & search
  tags:              [{ type: String }],
  searchKeywords:    [{ type: String }],
  ocrText:           { type: String, default: '' },
  ocrProcessed:      { type: Boolean, default: false },
  // Engagement
  favoritedBy:       [{ type: Schema.Types.ObjectId, ref: 'User' }],
  viewCount:         { type: Number, default: 0 },
  downloadCount:     { type: Number, default: 0 },
  // Signature & retention
  requiresSignature: { type: Boolean, default: false },
  retentionPolicy:   { type: Schema.Types.ObjectId, ref: 'DocumentRetention' },
  isDeleted:         { type: Boolean, default: false },
}, { timestamps: true });

documentSchema.index({ folder: 1, status: 1 });
documentSchema.index({ module: 1, entityType: 1, entityId: 1 });
documentSchema.index({ owner: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ expiryDate: 1 });
documentSchema.index({ reviewDate: 1 });
documentSchema.index({ title: 'text', description: 'text', ocrText: 'text' });

documentSchema.pre('validate', async function (next) {
  if (this.isNew && !this.documentCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('Document').countDocuments();
    this.documentCode = `DMS-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);
