'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowEscalationSchema = new Schema({
  escalationCode:  { type: String, unique: true },
  instance:        { type: Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true },
  stage:           { type: Schema.Types.ObjectId, ref: 'WorkflowStage' },
  assignment:      { type: Schema.Types.ObjectId, ref: 'WorkflowAssignment' },
  escalatedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  escalatedTo:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  escalationLevel: { type: Number, default: 1 },
  reason:          { type: String, enum: ['overdue_sla','manual','rule_triggered','repeated_reminder'], default: 'overdue_sla' },
  status:          { type: String, enum: ['open','acknowledged','resolved','ignored'], default: 'open' },
  escalatedAt:     { type: Date, default: Date.now },
  acknowledgedAt:  { type: Date },
  resolvedAt:      { type: Date },
  response:        { type: String },
}, { timestamps: true });

workflowEscalationSchema.index({ instance: 1 });
workflowEscalationSchema.index({ status: 1, escalationLevel: 1 });
workflowEscalationSchema.index({ escalatedTo: 1, status: 1 });

workflowEscalationSchema.pre('validate', async function (next) {
  if (!this.escalationCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowEscalation').countDocuments();
    this.escalationCode = `ESC-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowEscalation', workflowEscalationSchema);
