'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentTagSchema = new Schema({
  tagCode:    { type: String, unique: true },
  name:       { type: String, required: true, trim: true, unique: true },
  slug:       { type: String, unique: true },
  color:      { type: String, default: '#6366f1' },
  module:     { type: String, default: 'general' },
  usageCount: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

documentTagSchema.index({ slug: 1 });
documentTagSchema.index({ usageCount: -1 });

documentTagSchema.pre('validate', async function (next) {
  if (this.isNew && !this.tagCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentTag').countDocuments();
    this.tagCode = `DTAG-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('DocumentTag', documentTagSchema);
