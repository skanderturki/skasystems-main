const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    questionText: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false'],
      default: 'multiple-choice',
    },
    options: [
      {
        label: { type: String, required: true },
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    explanation: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    usedIn: {
      type: String,
      enum: ['practice', 'exam', 'both'],
      default: 'both',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

questionSchema.index({ chapter: 1 });
questionSchema.index({ usedIn: 1 });

module.exports = mongoose.model('Question', questionSchema);
