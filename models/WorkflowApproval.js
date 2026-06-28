'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowApprovalSchema = new Schema({
  approvalCode:   { type: String, unique: true },
  instance:       { type: Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true },
  stage:          { type: Schema.Types.ObjectId, ref: 'WorkflowStage' },
  step:           { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  approver:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvalMode:   { type: String, enum: ['sequential','parallel','any_one','majority'], default: 'sequential' },
  status:         { type: String, enum: ['pending','approved','rejected','delegated','on_hold','recalled'], default: 'pending' },
  decidedAt:      { type: Date },
  remarks:        { type: String },
  delegatedTo:    { type: Schema.Types.ObjectId, ref: 'User' },
  isOverridden:   { type: Boolean, default: false },
  overriddenBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  dueDate:        { type: Date },
  reminderSent:   { type: Boolean, default: false },
}, { timestamps: true });

workflowApprovalSchema.index({ approver: 1, status: 1 });
workflowApprovalSchema.index({ instance: 1 });

workflowApprovalSchema.pre('validate', async function (next) {
  if (!this.approvalCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowApproval').countDocuments();
    this.approvalCode = `APR-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowApproval', workflowApprovalSchema);
