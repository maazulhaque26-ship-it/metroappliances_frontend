'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowActionSchema = new Schema({
  actionCode:  { type: String, unique: true },
  instance:    { type: Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true },
  stage:       { type: Schema.Types.ObjectId, ref: 'WorkflowStage' },
  step:        { type: Schema.Types.ObjectId, ref: 'WorkflowStep' },
  actionType:  { type: String, enum: ['approve','reject','delegate','reassign','comment','attach','escalate','request_info','return','withdraw','override','cancel'], required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  targetUser:  { type: Schema.Types.ObjectId, ref: 'User' },
  remarks:     { type: String },
  metadata:    { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

workflowActionSchema.index({ instance: 1, createdAt: -1 });
workflowActionSchema.index({ performedBy: 1 });

workflowActionSchema.pre('validate', async function (next) {
  if (!this.actionCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowAction').countDocuments();
    this.actionCode = `WFA-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowAction', workflowActionSchema);
