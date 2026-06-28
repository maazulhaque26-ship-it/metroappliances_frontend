'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const defaultStepSchema = new Schema({
  name:           { type: String, required: true },
  stepOrder:      { type: Number, required: true },
  stepType:       { type: String, enum: ['approval','task','notification','condition','auto','parallel','review'], default: 'approval' },
  assigneeType:   { type: String, enum: ['user','role','department','manager','initiator','dynamic'], default: 'role' },
  role:           { type: String },
  slaHours:       { type: Number, default: 24 },
  approvalMode:   { type: String, enum: ['sequential','parallel','any_one','majority'], default: 'sequential' },
  description:    { type: String },
}, { _id: true });

const workflowTemplateSchema = new Schema({
  templateCode:   { type: String, unique: true },
  name:           { type: String, required: true, trim: true },
  description:    { type: String },
  module:         { type: String, enum: ['hr','procurement','finance','projects','manufacturing','service','inventory','general'], required: true },
  category:       { type: String, enum: ['approval','onboarding','offboarding','purchase','expense','leave','recruitment','quality','maintenance','change_request','general'], default: 'general' },
  defaultSteps:   [defaultStepSchema],
  isPublic:       { type: Boolean, default: true },
  usageCount:     { type: Number, default: 0 },
  createdBy:      { type: Schema.Types.ObjectId, ref: 'User' },
  tags:           [{ type: String }],
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true });

workflowTemplateSchema.index({ module: 1, isDeleted: 1 });

workflowTemplateSchema.pre('validate', async function (next) {
  if (!this.templateCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkflowTemplate').countDocuments();
    this.templateCode = `WFT-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowTemplate', workflowTemplateSchema);
