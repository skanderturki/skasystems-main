const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamAttempt',
      required: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    verificationToken: {
      type: String,
      required: true,
      unique: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    examTitle: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
