'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowConditionSchema = new Schema({
  conditionCode:  { type: String, unique: true },
  name:           { type: String, required: true, trim: true },
  description:    { type: String },
  workflow:       { type: Schema.Types.ObjectId, ref: 'Workflow' },
  step:           { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  conditionType:  { type: String, enum: ['field_value','date_range','amount_threshold','role_match','department_match','custom_expression'], default: 'field_value' },
  field:          { type: String },
  operator:       { type: String, enum: ['equals','not_equals','greater_than','less_than','contains','in','not_in','between'], default: 'equals' },
  value:          { type: Schema.Types.Mixed },
  action:         { type: String, enum: ['skip','route_to','notify','escalate','approve','reject'], default: 'skip' },
  targetStep:     { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  priority:       { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true });

workflowConditionSchema.index({ workflow: 1, isActive: 1, isDeleted: 1 });

workflowConditionSchema.pre('validate', async function (next) {
  if (!this.conditionCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowCondition').countDocuments();
    this.conditionCode = `WFC-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowCondition', workflowConditionSchema);
