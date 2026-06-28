const mongoose = require('mongoose');
const { Schema } = mongoose;

const predictionHistorySchema = new Schema({
  historyCode:     { type: String, unique: true },
  forecastId:      { type: Schema.Types.ObjectId, ref: 'AIForecast' },
  forecastType:    { type: String, required: true },
  period:          { type: String, required: true },
  predictedValue:  { type: Number, required: true },
  actualValue:     Number,
  error:           Number,
  errorPct:        Number,
  mape:            Number,
  isActualized:    { type: Boolean, default: false },
  actualizedAt:    Date,
}, { timestamps: true });

predictionHistorySchema.index({ forecastType: 1, period: 1 });
predictionHistorySchema.index({ forecastId: 1 });

predictionHistorySchema.pre('validate', async function (next) {
  if (!this.historyCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('PredictionHistory').countDocuments({ historyCode: new RegExp(`^PHT-${y}-`) });
    this.historyCode = `PHT-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PredictionHistory', predictionHistorySchema);
