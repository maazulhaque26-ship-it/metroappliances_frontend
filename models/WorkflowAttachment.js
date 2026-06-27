'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowAttachmentSchema = new Schema({
  attachmentCode: { type: String, unique: true },
  instance:       { type: Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true },
  stage:          { type: Schema.Types.ObjectId, ref: 'WorkflowStage' },
  uploadedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  fileName:       { type: String, required: true },
  fileUrl:        { type: String, required: true },
  fileSize:       { type: Number },
  mimeType:       { type: String },
  description:    { type: String },
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true });

workflowAttachmentSchema.index({ instance: 1 });

workflowAttachmentSchema.pre('validate', async function (next) {
  if (!this.attachmentCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowAttachment').countDocuments();
    this.attachmentCode = `WAT-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowAttachment', workflowAttachmentSchema);
