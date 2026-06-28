const mongoose = require('mongoose');
const { Schema } = mongoose;

const workforcePredictionSchema = new Schema({
  predCode:            { type: String, unique: true },
  period:              { type: String, required: true },
  department:          String,
  predictedHeadcount:  { type: Number, required: true },
  predictedAttrition:  { type: Number, default: 0 },
  recruitmentNeeds:    { type: Number, default: 0 },
  trainingNeeds:       [String],
  confidence:          { type: Number, default: 0, min: 0, max: 100 },
  riskLevel:           { type: String, enum: ['low','medium','high'], default: 'low' },
  historicalData:      Schema.Types.Mixed,
  forecastId:          { type: Schema.Types.ObjectId, ref: 'AIForecast' },
}, { timestamps: true });

workforcePredictionSchema.index({ period: 1, department: 1 });

workforcePredictionSchema.pre('validate', async function (next) {
  if (!this.predCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('WorkforcePrediction').countDocuments({ predCode: new RegExp(`^WFP-${y}-`) });
    this.predCode = `WFP-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkforcePrediction', workforcePredictionSchema);
