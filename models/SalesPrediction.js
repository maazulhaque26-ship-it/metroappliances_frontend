const mongoose = require('mongoose');
const { Schema } = mongoose;

const salesPredictionSchema = new Schema({
  predCode:        { type: String, unique: true },
  period:          { type: String, required: true },
  channel:         { type: String, enum: ['b2c','b2b','dealer','agent','all'], default: 'all' },
  predictedRevenue:{ type: Number, required: true },
  predictedOrders: Number,
  confidence:      { type: Number, default: 0, min: 0, max: 100 },
  algorithm:       { type: String, default: 'linear_regression' },
  historicalData:  Schema.Types.Mixed,
  breakdown:       Schema.Types.Mixed,
  forecastId:      { type: Schema.Types.ObjectId, ref: 'AIForecast' },
}, { timestamps: true });

salesPredictionSchema.index({ period: 1, channel: 1 });

salesPredictionSchema.pre('validate', async function (next) {
  if (!this.predCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('SalesPrediction').countDocuments({ predCode: new RegExp(`^SPR-${y}-`) });
    this.predCode = `SPR-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('SalesPrediction', salesPredictionSchema);
