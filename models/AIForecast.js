const mongoose = require('mongoose');
const { Schema } = mongoose;

const predPointSchema = new Schema({
  period:     { type: String, required: true },
  value:      { type: Number, required: true },
  lowerBound: Number,
  upperBound: Number,
}, { _id: false });

const aiForecastSchema = new Schema({
  forecastCode: { type: String, unique: true },
  forecastType: { type: String, enum: ['sales','demand','inventory','production','cashflow','revenue','expense','workforce','maintenance','warranty','project'], required: true },
  module:       String,
  period:       String,
  periodType:   { type: String, enum: ['monthly','quarterly','annual'], default: 'monthly' },
  horizon:      { type: Number, default: 6 },
  algorithm:    { type: String, enum: ['linear_regression','moving_average','exponential_smoothing','arima','ml_hybrid'], default: 'linear_regression' },
  status:       { type: String, enum: ['pending','processing','completed','failed'], default: 'pending' },
  confidence:   { type: Number, default: 0, min: 0, max: 100 },
  predictions:  [predPointSchema],
  metadata:     Schema.Types.Mixed,
  generatedAt:  Date,
  completedAt:  Date,
  createdBy:    { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

aiForecastSchema.index({ forecastType: 1, status: 1 });
aiForecastSchema.index({ createdAt: -1 });

aiForecastSchema.pre('validate', async function (next) {
  if (!this.forecastCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('AIForecast').countDocuments({ forecastCode: new RegExp(`^AIF-${y}-`) });
    this.forecastCode = `AIF-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('AIForecast', aiForecastSchema);
