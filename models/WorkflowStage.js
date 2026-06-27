'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const assigneeStatusSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date, default: Date.now },
  status:     { type: String, enum: ['pending','approved','rejected','delegated','skipped'], default: 'pending' },
  decidedAt:  { type: Date },
  remarks:    { type: String },
}, { _id: true });

const workflowStageSchema = new Schema({
  stageCode:   { type: String, unique: true },
  instance:    { type: Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true },
  step:        { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  name:        { type: String, required: true },
  description: { type: String },
  status:      { type: String, enum: ['pending','in_progress','completed','skipped','rejected'], default: 'pending' },
  assignees:   [assigneeStatusSchema],
  order:       { type: Number, default: 0 },
  slaDeadline: { type: Date },
  slaBreached: { type: Boolean, default: false },
  startedAt:   { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

workflowStageSchema.index({ instance: 1, order: 1 });
workflowStageSchema.index({ status: 1 });

workflowStageSchema.pre('validate', async function (next) {
  if (!this.stageCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowStage').countDocuments();
    this.stageCode = `STG-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowStage', workflowStageSchema);
