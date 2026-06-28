'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentCommentSchema = new Schema({
  commentCode: { type: String, unique: true },
  document:    { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  author:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName:  { type: String, default: '' },
  comment:     { type: String, required: true },
  parentComment:{ type: Schema.Types.ObjectId, ref: 'DocumentComment', default: null },
  isInternal:  { type: Boolean, default: false },
  isPinned:    { type: Boolean, default: false },
  editedAt:    { type: Date },
  isDeleted:   { type: Boolean, default: false },
  attachments: [{
    fileName: String,
    fileUrl:  String,
    fileSize: Number,
  }],
}, { timestamps: true });

documentCommentSchema.index({ document: 1, createdAt: -1 });
documentCommentSchema.index({ author: 1 });

documentCommentSchema.pre('validate', async function (next) {
  if (this.isNew && !this.commentCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentComment').countDocuments();
    this.commentCode = `DCMT-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentComment', documentCommentSchema);
