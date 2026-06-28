const mongoose = require('mongoose');
const { Schema } = mongoose;

const maintenancePredictionSchema = new Schema({
  predCode:             { type: String, unique: true },
  period:               { type: String, required: true },
  predictedFailures:    { type: Number, default: 0 },
  predictedMaintenanceCost: Number,
  criticalAssets:       [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
  avgRiskScore:         { type: Number, default: 0, min: 0, max: 100 },
  recommendedActions:   [String],
  confidence:           { type: Number, default: 0, min: 0, max: 100 },
  historicalData:       Schema.Types.Mixed,
  forecastId:           { type: Schema.Types.ObjectId, ref: 'AIForecast' },
}, { timestamps: true });

maintenancePredictionSchema.index({ period: 1 });

maintenancePredictionSchema.pre('validate', async function (next) {
  if (!this.predCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('MaintenancePrediction').countDocuments({ predCode: new RegExp(`^MPR-${y}-`) });
    this.predCode = `MPR-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('MaintenancePrediction', maintenancePredictionSchema);
