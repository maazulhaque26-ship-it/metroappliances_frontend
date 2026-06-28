'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const triggerConditionSchema = new Schema({
  field:    { type: String },
  operator: { type: String },
  value:    { type: Schema.Types.Mixed },
}, { _id: false });

const workflowTriggerSchema = new Schema({
  triggerCode:  { type: String, unique: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String },
  workflow:     { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  triggerType:  { type: String, enum: ['event','schedule','manual','webhook'], required: true },
  event:        { type: String },
  module:       { type: String },
  entityType:   { type: String },
  schedule:     { type: String },
  webhookUrl:   { type: String },
  conditions:   [triggerConditionSchema],
  isActive:     { type: Boolean, default: true },
  lastFiredAt:  { type: Date },
  fireCount:    { type: Number, default: 0 },
  isDeleted:    { type: Boolean, default: false },
}, { timestamps: true });

workflowTriggerSchema.index({ workflow: 1, isActive: 1 });
workflowTriggerSchema.index({ triggerType: 1, event: 1 });

workflowTriggerSchema.pre('validate', async function (next) {
  if (!this.triggerCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowTrigger').countDocuments();
    this.triggerCode = `WTG-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowTrigger', workflowTriggerSchema);
