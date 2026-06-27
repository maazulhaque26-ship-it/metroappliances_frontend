'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const assigneeSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: 'User' },
  role:       { type: String },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
}, { _id: false });

const workflowStepSchema = new Schema({
  stepCode:          { type: String, unique: true },
  workflow:          { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  name:              { type: String, required: true, trim: true },
  description:       { type: String },
  stepOrder:         { type: Number, required: true },
  stepType:          { type: String, enum: ['approval','task','notification','condition','auto','parallel','review'], default: 'approval' },
  assigneeType:      { type: String, enum: ['user','role','department','manager','initiator','dynamic'], default: 'role' },
  assignees:         [assigneeSchema],
  approvalMode:      { type: String, enum: ['sequential','parallel','any_one','majority'], default: 'sequential' },
  requiredApprovers: { type: Number, default: 1 },
  slaHours:          { type: Number, default: 24 },
  escalateAfterHours:{ type: Number, default: 48 },
  escalateTo:        { type: Schema.Types.ObjectId, ref: 'User' },
  isDeleted:         { type: Boolean, default: false },
}, { timestamps: true });

workflowStepSchema.index({ workflow: 1, stepOrder: 1, isDeleted: 1 });

workflowStepSchema.pre('validate', async function (next) {
  if (!this.stepCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowStep').countDocuments();
    this.stepCode = `WFS-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowStep', workflowStepSchema);
