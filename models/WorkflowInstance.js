'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowInstanceSchema = new Schema({
  instanceCode:   { type: String, unique: true },
  workflow:       { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  title:          { type: String, required: true, trim: true },
  description:    { type: String },
  module:         { type: String, enum: ['hr','procurement','finance','projects','manufacturing','service','inventory','general'] },
  entityType:     { type: String },
  entityId:       { type: Schema.Types.ObjectId },
  status:         { type: String, enum: ['pending','in_progress','approved','rejected','cancelled','completed','on_hold'], default: 'pending' },
  priority:       { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  currentStep:    { type: Number, default: 0 },
  totalSteps:     { type: Number, default: 0 },
  initiatedBy:    { type: Schema.Types.ObjectId, ref: 'User' },
  dueDate:        { type: Date },
  startedAt:      { type: Date },
  completedAt:    { type: Date },
  cancelledAt:    { type: Date },
  slaBreached:    { type: Boolean, default: false },
  escalated:      { type: Boolean, default: false },
  metadata:       { type: Schema.Types.Mixed, default: {} },
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true });

workflowInstanceSchema.index({ status: 1, isDeleted: 1 });
workflowInstanceSchema.index({ initiatedBy: 1 });
workflowInstanceSchema.index({ workflow: 1, status: 1 });
workflowInstanceSchema.index({ module: 1, entityType: 1 });

workflowInstanceSchema.pre('validate', async function (next) {
  if (!this.instanceCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowInstance').countDocuments();
    this.instanceCode = `WFI-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowInstance', workflowInstanceSchema);
