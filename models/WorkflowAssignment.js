'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowAssignmentSchema = new Schema({
  assignmentCode: { type: String, unique: true },
  instance:       { type: Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true },
  stage:          { type: Schema.Types.ObjectId, ref: 'WorkflowStage' },
  step:           { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  assignee:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assigneeType:   { type: String, enum: ['user','role','department'], default: 'user' },
  role:           { type: String },
  department:     { type: Schema.Types.ObjectId, ref: 'Department' },
  status:         { type: String, enum: ['pending','accepted','completed','delegated','reassigned','skipped'], default: 'pending' },
  assignedAt:     { type: Date, default: Date.now },
  acceptedAt:     { type: Date },
  completedAt:    { type: Date },
  dueDate:        { type: Date },
  delegatedTo:    { type: Schema.Types.ObjectId, ref: 'User' },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

workflowAssignmentSchema.index({ instance: 1 });
workflowAssignmentSchema.index({ assignee: 1, status: 1, isActive: 1 });

workflowAssignmentSchema.pre('validate', async function (next) {
  if (!this.assignmentCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowAssignment').countDocuments();
    this.assignmentCode = `ASN-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowAssignment', workflowAssignmentSchema);
