'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentShareSchema = new Schema({
  shareCode:    { type: String, unique: true },
  document:     { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  sharedBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Recipients
  sharedWithUser:  { type: Schema.Types.ObjectId, ref: 'User' },
  sharedWithEmail: { type: String, default: '' },
  // Share settings
  shareType:    { type: String, enum: ['internal','external','link'], default: 'internal' },
  accessType:   { type: String, enum: ['view','download'], default: 'view' },
  shareLink:    { type: String, default: '' },
  linkToken:    { type: String, default: '' },
  // Expiry
  expiresAt:    { type: Date },
  isActive:     { type: Boolean, default: true },
  // Tracking
  viewCount:    { type: Number, default: 0 },
  lastViewedAt: { type: Date },
  message:      { type: String, default: '' },
}, { timestamps: true });

documentShareSchema.index({ document: 1 });
documentShareSchema.index({ sharedBy: 1 });
documentShareSchema.index({ linkToken: 1 });

documentShareSchema.pre('validate', async function (next) {
  if (this.isNew && !this.shareCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentShare').countDocuments();
    this.shareCode = `DSHR-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentShare', documentShareSchema);
