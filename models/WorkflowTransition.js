'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowTransitionSchema = new Schema({
  transitionCode: { type: String, unique: true },
  workflow:       { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  fromStep:       { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  toStep:         { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  label:          { type: String },
  triggerType:    { type: String, enum: ['manual','auto','conditional','timer','on_approve','on_reject'], default: 'on_approve' },
  condition:      { type: Schema.Types.Mixed },
  priority:       { type: Number, default: 0 },
  isDefault:      { type: Boolean, default: false },
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true });

workflowTransitionSchema.index({ workflow: 1, isDeleted: 1 });

workflowTransitionSchema.pre('validate', async function (next) {
  if (!this.transitionCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowTransition').countDocuments();
    this.transitionCode = `TRN-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowTransition', workflowTransitionSchema);
