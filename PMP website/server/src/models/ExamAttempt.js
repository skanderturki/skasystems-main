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
        // The shuffled options as the student saw them on this attempt. Stored
        // so the attempt can be resumed (e.g. after a refresh) with the same
        // option order, so the persisted selectedOption stays meaningful.
        options: [
          {
            label: String, // 'A' / 'B' / ...
            text: String,
          },
        ],
        correctOption: String, // post-shuffle label (A/B/C/D) of the correct answer
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
    // Proctoring: each entry records a cheating signal observed in the browser
    // (tab visibility change, window blur, fullscreen exit, forbidden key).
    violations: [
      {
        type: { type: String },
        at: Date,
      },
    ],
    cheatingFlagged: { type: Boolean, default: false },
    // Flagged when a non-instructor-led submission lands under the
    // MIN_FORMAL_EXAM_SECONDS threshold. No automatic ban — the admin
    // reviews these manually from the Exam Attempts tab.
    fastFinishFlagged: { type: Boolean, default: false },
    // Per-attempt mode. Standard = full anti-cheat (cooldown, 20-min flag,
    // 3-violation rule). Instructor-led = instructor was physically present
    // and entered the exam password, so cooldown, maxAttempts and 20-min
    // rule are all skipped. The 3-violation rule still applies.
    mode: {
      type: String,
      enum: ['standard', 'instructor-led'],
      default: 'standard',
    },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

examAttemptSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
