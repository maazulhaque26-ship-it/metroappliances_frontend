'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentCategorySchema = new Schema({
  categoryCode: { type: String, unique: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  parent:       { type: Schema.Types.ObjectId, ref: 'DocumentCategory', default: null },
  module:       { type: String, default: 'general' },
  color:        { type: String, default: '#10b981' },
  icon:         { type: String, default: 'tag' },
  sortOrder:    { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  documentCount:{ type: Number, default: 0 },
}, { timestamps: true });

documentCategorySchema.index({ parent: 1 });
documentCategorySchema.index({ module: 1 });

documentCategorySchema.pre('validate', async function (next) {
  if (this.isNew && !this.categoryCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentCategory').countDocuments();
    this.categoryCode = `DCAT-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentCategory', documentCategorySchema);
