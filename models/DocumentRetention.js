'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentRetentionSchema = new Schema({
  retentionCode:    { type: String, unique: true },
  name:             { type: String, required: true, trim: true },
  description:      { type: String, default: '' },
  documentType:     { type: String, default: '' },
  module:           { type: String, default: 'general' },
  // Retention period
  retentionYears:   { type: Number, required: true, default: 7 },
  retentionMonths:  { type: Number, default: 0 },
  // Action after retention
  postRetentionAction: { type: String, enum: ['delete','archive','review','legal_hold'], default: 'archive' },
  // Legal / regulatory
  legalBasis:       { type: String, default: '' },
  regulatoryRef:    { type: String, default: '' },
  // Review
  reviewRequired:   { type: Boolean, default: false },
  reviewPeriodDays: { type: Number, default: 365 },
  // Notifications
  notifyDaysBefore: { type: Number, default: 30 },
  isActive:         { type: Boolean, default: true },
  appliedCount:     { type: Number, default: 0 },
}, { timestamps: true });

documentRetentionSchema.index({ documentType: 1, module: 1 });

documentRetentionSchema.pre('validate', async function (next) {
  if (this.isNew && !this.retentionCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentRetention').countDocuments();
    this.retentionCode = `RET-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentRetention', documentRetentionSchema);
