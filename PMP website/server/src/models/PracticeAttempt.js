const mongoose = require('mongoose');

const practiceAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    examTitle: String,
    questions: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        questionText: String,
        options: [
          {
            label: String,
            text: String,
            isCorrect: Boolean,
          },
        ],
        explanation: String,
        selectedOption: String,
        isCorrect: Boolean,
      },
    ],
    score: Number,
    totalQuestions: Number,
    correctCount: Number,
    timeTaken: Number, // seconds
    completedAt: Date,
  },
  { timestamps: true }
);

practiceAttemptSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PracticeAttempt', practiceAttemptSchema);
