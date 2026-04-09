const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema(
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
        selectedOption: String,
        isCorrect: Boolean,
      },
    ],
    score: Number,
    totalQuestions: Number,
    correctCount: Number,
    passed: Boolean,
    timeTaken: Number,
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
    },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

examAttemptSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
