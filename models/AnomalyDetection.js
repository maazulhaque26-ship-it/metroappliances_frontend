const mongoose = require('mongoose');
const { Schema } = mongoose;

const anomalyDetectionSchema = new Schema({
  anomalyCode:    { type: String, unique: true },
  type:           { type: String, enum: ['demand_spike','sales_drop','inventory_shortage','overstock','cash_shortage','cost_overrun','project_delay','machine_downtime','supplier_risk','customer_churn'], required: true },
  module:         { type: String, required: true },
  metric:         { type: String, required: true },
  detectedAt:     { type: Date, default: Date.now },
  severity:       { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  actualValue:    Number,
  expectedValue:  Number,
  deviation:      Number,
  deviationPct:   Number,
  description:    String,
  isResolved:     { type: Boolean, default: false },
  resolvedAt:     Date,
  resolvedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  resolutionNote: String,
  relatedRecords: [Schema.Types.ObjectId],
}, { timestamps: true });

anomalyDetectionSchema.index({ type: 1, isResolved: 1 });
anomalyDetectionSchema.index({ module: 1, detectedAt: -1 });
anomalyDetectionSchema.index({ severity: 1, isResolved: 1 });

anomalyDetectionSchema.pre('validate', async function (next) {
  if (!this.anomalyCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('AnomalyDetection').countDocuments({ anomalyCode: new RegExp(`^ADT-${y}-`) });
    this.anomalyCode = `ADT-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('AnomalyDetection', anomalyDetectionSchema);
