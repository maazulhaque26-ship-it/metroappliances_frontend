'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workflowNotificationSchema = new Schema({
  notifCode:         { type: String, unique: true },
  instance:          { type: Schema.Types.ObjectId, ref: 'WorkflowInstance' },
  recipient:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notificationType:  { type: String, enum: ['assignment','reminder','escalation','completion','rejection','approval','comment','sla_warning','sla_breach','delegation'], required: true },
  subject:           { type: String, required: true },
  body:              { type: String },
  channel:           { type: String, enum: ['email','in_app','both'], default: 'in_app' },
  status:            { type: String, enum: ['pending','sent','failed','read'], default: 'pending' },
  sentAt:            { type: Date },
  readAt:            { type: Date },
  metadata:          { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

workflowNotificationSchema.index({ recipient: 1, status: 1 });
workflowNotificationSchema.index({ instance: 1 });

workflowNotificationSchema.pre('validate', async function (next) {
  if (!this.notifCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowNotification').countDocuments();
    this.notifCode = `WFN-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowNotification', workflowNotificationSchema);
