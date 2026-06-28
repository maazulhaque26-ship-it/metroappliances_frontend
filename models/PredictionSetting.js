const mongoose = require('mongoose');
const { Schema } = mongoose;

const predictionSettingSchema = new Schema({
  settingKey:   { type: String, required: true, unique: true, trim: true },
  settingValue: { type: Schema.Types.Mixed, required: true },
  category:     { type: String, enum: ['algorithm','threshold','schedule','notification','general'], default: 'general' },
  description:  String,
  isActive:     { type: Boolean, default: true },
  updatedBy:    { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

predictionSettingSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('PredictionSetting', predictionSettingSchema);
