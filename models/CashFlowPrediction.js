const mongoose = require('mongoose');
const { Schema } = mongoose;

const cashFlowPredictionSchema = new Schema({
  predCode:          { type: String, unique: true },
  period:            { type: String, required: true },
  predictedInflow:   { type: Number, required: true },
  predictedOutflow:  { type: Number, required: true },
  netCashFlow:       Number,
  openingBalance:    Number,
  closingBalance:    Number,
  confidence:        { type: Number, default: 0, min: 0, max: 100 },
  riskFactors:       [String],
  cashPosition:      { type: String, enum: ['healthy','tight','critical'], default: 'healthy' },
  historicalData:    Schema.Types.Mixed,
  forecastId:        { type: Schema.Types.ObjectId, ref: 'AIForecast' },
}, { timestamps: true });

cashFlowPredictionSchema.pre('validate', async function (next) {
  if (!this.predCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('CashFlowPrediction').countDocuments({ predCode: new RegExp(`^CFP-${y}-`) });
    this.predCode = `CFP-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('CashFlowPrediction', cashFlowPredictionSchema);
