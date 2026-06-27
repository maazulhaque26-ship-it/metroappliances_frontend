'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentTemplateSchema = new Schema({
  templateCode:  { type: String, unique: true },
  name:          { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  documentType:  { type: String, enum: ['policy','procedure','form','template','report','contract','invoice','manual','specification','certificate','drawing','other'], default: 'template' },
  module:        { type: String, default: 'general' },
  // Template file
  fileUrl:       { type: String, default: '' },
  fileName:      { type: String, default: '' },
  fileSize:      { type: Number, default: 0 },
  mimeType:      { type: String, default: '' },
  // Metadata
  fields:        [{
    fieldName:    String,
    fieldLabel:   String,
    fieldType:    { type: String, enum: ['text','number','date','select','checkbox','signature'], default: 'text' },
    required:     { type: Boolean, default: false },
    options:      [String],
  }],
  version:       { type: String, default: '1.0' },
  isPublic:      { type: Boolean, default: true },
  isActive:      { type: Boolean, default: true },
  usageCount:    { type: Number, default: 0 },
  createdBy:     { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

documentTemplateSchema.index({ documentType: 1, module: 1 });

documentTemplateSchema.pre('validate', async function (next) {
  if (this.isNew && !this.templateCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentTemplate').countDocuments();
    this.templateCode = `DTPL-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentTemplate', documentTemplateSchema);
