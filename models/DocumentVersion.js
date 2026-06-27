'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentVersionSchema = new Schema({
  versionCode:    { type: String, unique: true },
  document:       { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  versionNumber:  { type: Number, required: true },
  versionLabel:   { type: String, default: '1.0' },
  // File snapshot
  fileUrl:        { type: String, default: '' },
  fileName:       { type: String, default: '' },
  fileSize:       { type: Number, default: 0 },
  mimeType:       { type: String, default: '' },
  // Change info
  changeSummary:  { type: String, default: '' },
  changeType:     { type: String, enum: ['major','minor','patch','initial'], default: 'minor' },
  createdBy:      { type: Schema.Types.ObjectId, ref: 'User' },
  // Check-in details
  checkedInFrom:  { type: String, default: '' },
  isCurrent:      { type: Boolean, default: false },
}, { timestamps: true });

documentVersionSchema.index({ document: 1, versionNumber: -1 });
documentVersionSchema.index({ document: 1, isCurrent: 1 });

documentVersionSchema.pre('validate', async function (next) {
  if (this.isNew && !this.versionCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentVersion').countDocuments();
    this.versionCode = `DVER-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
