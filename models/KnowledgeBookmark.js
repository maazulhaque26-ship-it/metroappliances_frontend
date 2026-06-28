'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const knowledgeBookmarkSchema = new Schema({
  bookmarkCode: { type: String, unique: true },
  user:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  article:      { type: Schema.Types.ObjectId, ref: 'KnowledgeArticle', required: true },
  notes:        { type: String, default: '' },
  collection:   { type: String, default: 'default' },
}, { timestamps: true });

knowledgeBookmarkSchema.index({ user: 1, article: 1 }, { unique: true });
knowledgeBookmarkSchema.index({ user: 1 });

knowledgeBookmarkSchema.pre('validate', async function (next) {
  if (this.isNew && !this.bookmarkCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('KnowledgeBookmark').countDocuments();
    this.bookmarkCode = `KBBM-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('KnowledgeBookmark', knowledgeBookmarkSchema);
