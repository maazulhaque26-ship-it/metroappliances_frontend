'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const conditionSchema = new Schema({
  field:           { type: String, required: true },
  operator:        { type: String, enum: ['equals','not_equals','greater_than','less_than','contains','in','not_in','between','is_null','is_not_null'], required: true },
  value:           { type: Schema.Types.Mixed },
  logicalOperator: { type: String, enum: ['AND','OR'], default: 'AND' },
}, { _id: false });

const actionConfigSchema = new Schema({
  type:   { type: String, enum: ['auto_approve','auto_reject','auto_assign','skip_step','notify','escalate','set_field','route_to'], required: true },
  config: { type: Schema.Types.Mixed, default: {} },
}, { _id: false });

const workflowRuleSchema = new Schema({
  ruleCode:    { type: String, unique: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String },
  workflow:    { type: Schema.Types.ObjectId, ref: 'Workflow' },
  ruleType:    { type: String, enum: ['auto_approve','auto_reject','auto_assign','skip_step','notify','escalate','route'], default: 'notify' },
  conditions:  [conditionSchema],
  actions:     [actionConfigSchema],
  priority:    { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  fireCount:   { type: Number, default: 0 },
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true });

workflowRuleSchema.index({ workflow: 1, isActive: 1, isDeleted: 1 });

workflowRuleSchema.pre('validate', async function (next) {
  if (!this.ruleCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowRule').countDocuments();
    this.ruleCode = `WFR-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowRule', workflowRuleSchema);
