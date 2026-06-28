const mongoose = require('mongoose');
const { Schema } = mongoose;

const demandPredictionSchema = new Schema({
  predCode:        { type: String, unique: true },
  period:          { type: String, required: true },
  category:        String,
  predictedUnits:  { type: Number, required: true },
  predictedValue:  Number,
  confidence:      { type: Number, default: 0, min: 0, max: 100 },
  seasonalityIndex:{ type: Number, default: 1 },
  algorithm:       { type: String, default: 'exponential_smoothing' },
  historicalData:  Schema.Types.Mixed,
  forecastId:      { type: Schema.Types.ObjectId, ref: 'AIForecast' },
}, { timestamps: true });

demandPredictionSchema.index({ period: 1 });

demandPredictionSchema.pre('validate', async function (next) {
  if (!this.predCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('DemandPrediction').countDocuments({ predCode: new RegExp(`^DPR-${y}-`) });
    this.predCode = `DPR-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DemandPrediction', demandPredictionSchema);
