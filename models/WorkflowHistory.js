'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowHistorySchema = new Schema({
  historyCode:  { type: String, unique: true },
  instance:     { type: Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true },
  stage:        { type: Schema.Types.ObjectId, ref: 'WorkflowStage' },
  action:       { type: String, required: true },
  performedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  fromStatus:   { type: String },
  toStatus:     { type: String },
  remarks:      { type: String },
  metadata:     { type: Schema.Types.Mixed, default: {} },
  timestamp:    { type: Date, default: Date.now },
}, { timestamps: false });

workflowHistorySchema.index({ instance: 1, timestamp: -1 });
workflowHistorySchema.index({ performedBy: 1 });

workflowHistorySchema.pre('validate', async function (next) {
  if (!this.historyCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowHistory').countDocuments();
    this.historyCode = `WHT-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowHistory', workflowHistorySchema);
