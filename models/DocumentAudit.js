'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentAuditSchema = new Schema({
  auditCode:  { type: String, unique: true },
  document:   { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  action:     { type: String, required: true },
  // action examples: upload, download, view, checkout, checkin, approve, reject,
  //   archive, restore, share, delete, version_create, comment_add, permission_change
  performedBy:{ type: Schema.Types.ObjectId, ref: 'User' },
  performedAt:{ type: Date, default: Date.now },
  ipAddress:  { type: String, default: '' },
  userAgent:  { type: String, default: '' },
  details:    { type: mongoose.Schema.Types.Mixed, default: {} },
  // Snapshot
  fromStatus: { type: String, default: '' },
  toStatus:   { type: String, default: '' },
  versionAt:  { type: Number },
}, { timestamps: false });

documentAuditSchema.index({ document: 1, performedAt: -1 });
documentAuditSchema.index({ performedBy: 1 });
documentAuditSchema.index({ action: 1 });

documentAuditSchema.pre('validate', async function (next) {
  if (this.isNew && !this.auditCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentAudit').countDocuments();
    this.auditCode = `DAUD-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentAudit', documentAuditSchema);
