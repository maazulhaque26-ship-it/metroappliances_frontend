'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowSchema = new Schema({
  workflowCode:  { type: String, unique: true },
  name:          { type: String, required: true, trim: true },
  description:   { type: String },
  module:        { type: String, enum: ['hr','procurement','finance','projects','manufacturing','service','inventory','general'], required: true },
  category:      { type: String, enum: ['approval','onboarding','offboarding','purchase','expense','leave','recruitment','quality','maintenance','change_request','general'], default: 'general' },
  status:        { type: String, enum: ['draft','active','inactive','archived'], default: 'draft' },
  version:       { type: Number, default: 1 },
  template:      { type: Schema.Types.ObjectId, ref: 'WorkflowTemplate' },
  createdBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  tags:          [{ type: String }],
  isDeleted:     { type: Boolean, default: false },
}, { timestamps: true });

workflowSchema.index({ module: 1, status: 1, isDeleted: 1 });
workflowSchema.index({ category: 1 });

workflowSchema.pre('validate', async function (next) {
  if (!this.workflowCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Workflow').countDocuments();
    this.workflowCode = `WF-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Workflow', workflowSchema);
