'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentArchiveSchema = new Schema({
  archiveCode:    { type: String, unique: true },
  document:       { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  archivedBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  archiveReason:  { type: String, enum: ['retention_policy','obsolete','superseded','manual','compliance'], default: 'manual' },
  reason:         { type: String, default: '' },
  // Snapshot at archive time
  titleSnapshot:  { type: String, default: '' },
  fileUrlSnapshot:{ type: String, default: '' },
  statusSnapshot: { type: String, default: '' },
  // Restore
  isRestored:     { type: Boolean, default: false },
  restoredBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  restoredAt:     { type: Date },
  restoreReason:  { type: String, default: '' },
  // Scheduled deletion
  scheduledDeletion: { type: Date },
}, { timestamps: true });

documentArchiveSchema.index({ document: 1 });
documentArchiveSchema.index({ archivedBy: 1 });
documentArchiveSchema.index({ isRestored: 1 });

documentArchiveSchema.pre('validate', async function (next) {
  if (this.isNew && !this.archiveCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentArchive').countDocuments();
    this.archiveCode = `ARC-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentArchive', documentArchiveSchema);
