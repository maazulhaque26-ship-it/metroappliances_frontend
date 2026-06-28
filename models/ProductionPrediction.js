const mongoose = require('mongoose');
const { Schema } = mongoose;

const productionPredictionSchema = new Schema({
  predCode:           { type: String, unique: true },
  period:             { type: String, required: true },
  predictedCapacity:  { type: Number, required: true },
  predictedUtilization: { type: Number, default: 0, min: 0, max: 100 },
  predictedOutput:    Number,
  bottlenecks:        [String],
  maintenanceRisk:    { type: String, enum: ['low','medium','high'], default: 'low' },
  confidence:         { type: Number, default: 0, min: 0, max: 100 },
  historicalData:     Schema.Types.Mixed,
  forecastId:         { type: Schema.Types.ObjectId, ref: 'AIForecast' },
}, { timestamps: true });

productionPredictionSchema.index({ period: 1 });

productionPredictionSchema.pre('validate', async function (next) {
  if (!this.predCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('ProductionPrediction').countDocuments({ predCode: new RegExp(`^PPR-${y}-`) });
    this.predCode = `PPR-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('ProductionPrediction', productionPredictionSchema);
