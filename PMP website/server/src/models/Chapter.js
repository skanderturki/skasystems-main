const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    chapterCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

chapterSchema.index({ order: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
