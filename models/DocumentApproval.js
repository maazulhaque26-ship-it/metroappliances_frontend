'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentApprovalSchema = new Schema({
  approvalCode: { type: String, unique: true },
  document:     { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  approver:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approverName: { type: String, default: '' },
  status:       { type: String, enum: ['pending','approved','rejected','recalled','delegated'], default: 'pending' },
  stepOrder:    { type: Number, default: 1 },
  approvalMode: { type: String, enum: ['sequential','parallel','any_one'], default: 'sequential' },
  remarks:      { type: String, default: '' },
  decidedAt:    { type: Date },
  dueDate:      { type: Date },
  delegatedTo:  { type: Schema.Types.ObjectId, ref: 'User' },
  isCurrent:    { type: Boolean, default: true },
}, { timestamps: true });

documentApprovalSchema.index({ document: 1, status: 1 });
documentApprovalSchema.index({ approver: 1, status: 1 });

documentApprovalSchema.pre('validate', async function (next) {
  if (this.isNew && !this.approvalCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentApproval').countDocuments();
    this.approvalCode = `DAPR-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentApproval', documentApprovalSchema);
