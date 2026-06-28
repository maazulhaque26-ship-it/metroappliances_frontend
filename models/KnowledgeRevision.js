'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const knowledgeRevisionSchema = new Schema({
  revisionCode:   { type: String, unique: true },
  article:        { type: Schema.Types.ObjectId, ref: 'KnowledgeArticle', required: true },
  version:        { type: Number, required: true },
  title:          { type: String, default: '' },
  content:        { type: String, default: '' },
  summary:        { type: String, default: '' },
  changeSummary:  { type: String, default: '' },
  revisedBy:      { type: Schema.Types.ObjectId, ref: 'User' },
  isCurrent:      { type: Boolean, default: false },
}, { timestamps: true });

knowledgeRevisionSchema.index({ article: 1, version: -1 });

knowledgeRevisionSchema.pre('validate', async function (next) {
  if (this.isNew && !this.revisionCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('KnowledgeRevision').countDocuments();
    this.revisionCode = `KBVR-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('KnowledgeRevision', knowledgeRevisionSchema);
