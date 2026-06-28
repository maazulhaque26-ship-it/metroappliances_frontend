'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowSLASchema = new Schema({
  slaCode:           { type: String, unique: true },
  name:              { type: String, required: true, trim: true },
  description:       { type: String },
  workflow:          { type: Schema.Types.ObjectId, ref: 'Workflow' },
  step:              { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  resolutionHours:   { type: Number, required: true, default: 24 },
  warningHours:      { type: Number, default: 4 },
  escalateHours:     { type: Number, default: 8 },
  workingHoursOnly:  { type: Boolean, default: false },
  workingHoursStart: { type: String, default: '09:00' },
  workingHoursEnd:   { type: String, default: '18:00' },
  workingDays:       { type: [String], default: ['Mon','Tue','Wed','Thu','Fri'] },
  isActive:          { type: Boolean, default: true },
  isDeleted:         { type: Boolean, default: false },
}, { timestamps: true });

workflowSLASchema.index({ workflow: 1, isActive: 1 });

workflowSLASchema.pre('validate', async function (next) {
  if (!this.slaCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowSLA').countDocuments();
    this.slaCode = `SLA-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowSLA', workflowSLASchema);
