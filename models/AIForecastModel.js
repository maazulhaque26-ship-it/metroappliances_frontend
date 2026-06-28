const mongoose = require('mongoose');
const { Schema } = mongoose;

const aiForecastModelSchema = new Schema({
  modelCode:    { type: String, unique: true },
  name:         { type: String, required: true, trim: true },
  forecastType: { type: String, enum: ['sales','demand','inventory','production','cashflow','revenue','expense','workforce','maintenance','warranty','project'], required: true },
  algorithm:    { type: String, enum: ['linear_regression','moving_average','exponential_smoothing','arima','ml_hybrid'], default: 'linear_regression' },
  parameters:   Schema.Types.Mixed,
  accuracy:     { type: Number, default: 0, min: 0, max: 100 },
  mape:         { type: Number, default: 0 },
  lastTrained:  Date,
  trainingPeriods: { type: Number, default: 12 },
  isActive:     { type: Boolean, default: true },
  description:  String,
}, { timestamps: true });

aiForecastModelSchema.index({ forecastType: 1, isActive: 1 });

aiForecastModelSchema.pre('validate', async function (next) {
  if (!this.modelCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('AIForecastModel').countDocuments({ modelCode: new RegExp(`^AFM-${y}-`) });
    this.modelCode = `AFM-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('AIForecastModel', aiForecastModelSchema);
