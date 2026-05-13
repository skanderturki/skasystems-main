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
      enum: ['practice', 'formal', 'instructor-led'],
      required: true,
    },
    // Set only for examType='instructor-led'. The admin sees this in the
    // admin console and communicates it (verbally or by typing it in
    // themselves) to the student before they can start the exam. It is
    // NEVER returned by /api/exams/available to students.
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
