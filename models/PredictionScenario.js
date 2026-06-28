const mongoose = require('mongoose');
const { Schema } = mongoose;

const predictionScenarioSchema = new Schema({
  scenarioCode: { type: String, unique: true },
  name:         { type: String, required: true, trim: true },
  description:  String,
  forecastType: { type: String, enum: ['sales','demand','inventory','production','cashflow','revenue','expense','workforce','maintenance','warranty','project'] },
  baselineId:   { type: Schema.Types.ObjectId, ref: 'AIForecast' },
  assumptions:  Schema.Types.Mixed,
  adjustments:  Schema.Types.Mixed,
  results:      Schema.Types.Mixed,
  status:       { type: String, enum: ['draft','active','archived'], default: 'draft' },
  createdBy:    { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

predictionScenarioSchema.pre('validate', async function (next) {
  if (!this.scenarioCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('PredictionScenario').countDocuments({ scenarioCode: new RegExp(`^PSC-${y}-`) });
    this.scenarioCode = `PSC-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PredictionScenario', predictionScenarioSchema);
