const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventoryPredictionSchema = new Schema({
  predCode:         { type: String, unique: true },
  period:           { type: String, required: true },
  predictedStockouts: { type: Number, default: 0 },
  predictedOverstock: { type: Number, default: 0 },
  avgDaysOfStock:   Number,
  reorderRecommendations: Schema.Types.Mixed,
  confidence:       { type: Number, default: 0, min: 0, max: 100 },
  riskLevel:        { type: String, enum: ['low','medium','high','critical'], default: 'low' },
  historicalData:   Schema.Types.Mixed,
  forecastId:       { type: Schema.Types.ObjectId, ref: 'AIForecast' },
}, { timestamps: true });

inventoryPredictionSchema.index({ period: 1 });

inventoryPredictionSchema.pre('validate', async function (next) {
  if (!this.predCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('InventoryPrediction').countDocuments({ predCode: new RegExp(`^IPR-${y}-`) });
    this.predCode = `IPR-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('InventoryPrediction', inventoryPredictionSchema);
