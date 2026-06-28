'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const attachmentSchema = new Schema({
  fileName: { type: String },
  fileUrl:  { type: String },
  fileSize: { type: Number },
}, { _id: false });

const workflowCommentSchema = new Schema({
  commentCode: { type: String, unique: true },
  instance:    { type: Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true },
  stage:       { type: Schema.Types.ObjectId, ref: 'WorkflowStage' },
  author:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment:     { type: String, required: true },
  isInternal:  { type: Boolean, default: false },
  attachments: [attachmentSchema],
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true });

workflowCommentSchema.index({ instance: 1, createdAt: -1 });

workflowCommentSchema.pre('validate', async function (next) {
  if (!this.commentCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowComment').countDocuments();
    this.commentCode = `WCM-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowComment', workflowCommentSchema);
