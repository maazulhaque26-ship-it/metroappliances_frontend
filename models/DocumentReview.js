'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentReviewSchema = new Schema({
  reviewCode:    { type: String, unique: true },
  document:      { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  reviewer:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerName:  { type: String, default: '' },
  reviewType:    { type: String, enum: ['periodic','triggered','ad_hoc','compliance'], default: 'periodic' },
  status:        { type: String, enum: ['scheduled','in_progress','completed','overdue','cancelled'], default: 'scheduled' },
  dueDate:       { type: Date, required: true },
  completedAt:   { type: Date },
  outcome:       { type: String, enum: ['approved','needs_update','obsolete','extend'], default: 'approved' },
  remarks:       { type: String, default: '' },
  nextReviewDate:{ type: Date },
  reminderSent:  { type: Boolean, default: false },
}, { timestamps: true });

documentReviewSchema.index({ document: 1, status: 1 });
documentReviewSchema.index({ reviewer: 1, status: 1 });
documentReviewSchema.index({ dueDate: 1, status: 1 });

documentReviewSchema.pre('validate', async function (next) {
  if (this.isNew && !this.reviewCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentReview').countDocuments();
    this.reviewCode = `DRVW-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentReview', documentReviewSchema);
