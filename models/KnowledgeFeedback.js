'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const knowledgeFeedbackSchema = new Schema({
  feedbackCode: { type: String, unique: true },
  article:      { type: Schema.Types.ObjectId, ref: 'KnowledgeArticle', required: true },
  user:         { type: Schema.Types.ObjectId, ref: 'User' },
  rating:       { type: Number, min: 1, max: 5 },
  reaction:     { type: String, enum: ['like','dislike','helpful','not_helpful'], default: 'helpful' },
  comment:      { type: String, default: '' },
  isAnonymous:  { type: Boolean, default: false },
}, { timestamps: true });

knowledgeFeedbackSchema.index({ article: 1 });
knowledgeFeedbackSchema.index({ user: 1, article: 1 });

knowledgeFeedbackSchema.pre('validate', async function (next) {
  if (this.isNew && !this.feedbackCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('KnowledgeFeedback').countDocuments();
    this.feedbackCode = `KBFB-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('KnowledgeFeedback', knowledgeFeedbackSchema);
