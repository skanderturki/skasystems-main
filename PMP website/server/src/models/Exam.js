const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    examType: {
      type: String,
      enum: ['practice', 'formal'],
      required: true,
    },
    // Optional instructor-led password. When set, the admin can share it with
    // a student so they can take this formal exam in 'instructor-led' mode
    // (with the 20-min rule + cooldown + maxAttempts skipped). Without a
    // password, the exam can still be taken normally — every formal exam
    // supports both modes. NEVER returned to /api/exams/available.
    password: {
      type: String,
      default: null,
      select: false,
    },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
    questionCount: {
      type: Number,
      required: true,
    },
    timeLimit: {
      type: Number, // minutes, null = no limit
      default: null,
    },
    passingScore: {
      type: Number,
      default: 80,
    },
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    shuffleOptions: {
      type: Boolean,
      default: true,
    },
    maxAttempts: {
      type: Number,
      default: null, // null = unlimited
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
