'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentSignatureSchema = new Schema({
  signatureCode: { type: String, unique: true },
  document:      { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  signer:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  signerName:    { type: String, default: '' },
  signerEmail:   { type: String, default: '' },
  signerRole:    { type: String, default: '' },
  // Signature
  status:        { type: String, enum: ['pending','signed','declined','expired'], default: 'pending' },
  signatureImageUrl: { type: String, default: '' },
  signedAt:      { type: Date },
  declinedAt:    { type: Date },
  declineReason: { type: String, default: '' },
  // Verification
  ipAddress:     { type: String, default: '' },
  userAgent:     { type: String, default: '' },
  verificationToken: { type: String, default: '' },
  // Sequencing
  stepOrder:     { type: Number, default: 1 },
  dueDate:       { type: Date },
  // Metadata
  remarks:       { type: String, default: '' },
}, { timestamps: true });

documentSignatureSchema.index({ document: 1, status: 1 });
documentSignatureSchema.index({ signer: 1, status: 1 });

documentSignatureSchema.pre('validate', async function (next) {
  if (this.isNew && !this.signatureCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentSignature').countDocuments();
    this.signatureCode = `DSIG-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentSignature', documentSignatureSchema);
