'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const knowledgeCategorySchema = new Schema({
  categoryCode:  { type: String, unique: true },
  name:          { type: String, required: true, trim: true },
  slug:          { type: String, unique: true },
  description:   { type: String, default: '' },
  parent:        { type: Schema.Types.ObjectId, ref: 'KnowledgeCategory', default: null },
  module:        { type: String, default: 'general' },
  color:         { type: String, default: '#10b981' },
  icon:          { type: String, default: 'book' },
  sortOrder:     { type: Number, default: 0 },
  articleCount:  { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

knowledgeCategorySchema.index({ parent: 1 });
knowledgeCategorySchema.index({ module: 1 });

knowledgeCategorySchema.pre('validate', async function (next) {
  if (this.isNew && !this.categoryCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('KnowledgeCategory').countDocuments();
    this.categoryCode = `KBC-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  if (this.name && !this.slug) {
    const base = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    this.slug = `${base}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('KnowledgeCategory', knowledgeCategorySchema);
