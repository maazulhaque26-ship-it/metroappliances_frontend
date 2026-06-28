const mongoose = require('mongoose');
const { Schema } = mongoose;

const aiRecommendationSchema = new Schema({
  recCode:        { type: String, unique: true },
  type:           { type: String, enum: ['inventory','production','procurement','hiring','training','project','maintenance','cashflow','portfolio','sales'], required: true },
  title:          { type: String, required: true, trim: true },
  description:    { type: String, required: true },
  priority:       { type: String, enum: ['critical','high','medium','low'], default: 'medium' },
  module:         String,
  entityId:       Schema.Types.ObjectId,
  estimatedImpact:Schema.Types.Mixed,
  status:         { type: String, enum: ['pending','accepted','rejected','implemented','dismissed'], default: 'pending' },
  dueDate:        Date,
  implementedAt:  Date,
  implementedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  confidence:     { type: Number, default: 70, min: 0, max: 100 },
  source:         { type: String, enum: ['ai_engine','anomaly','forecast','manual'], default: 'ai_engine' },
  forecastId:     { type: Schema.Types.ObjectId, ref: 'AIForecast' },
}, { timestamps: true });

aiRecommendationSchema.index({ type: 1, status: 1 });
aiRecommendationSchema.index({ priority: 1, status: 1 });

aiRecommendationSchema.pre('validate', async function (next) {
  if (!this.recCode) {
    const y = new Date().getFullYear();
    const count = await mongoose.model('AIRecommendation').countDocuments({ recCode: new RegExp(`^REC-${y}-`) });
    this.recCode = `REC-${y}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
