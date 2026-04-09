const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    order: {
      type: Number,
      required: true,
    },
    content: {
      sections: [
        {
          heading: String,
          body: String,
          keyPoints: [String],
        },
      ],
      learningObjectives: [String],
      keyTerms: [
        {
          term: String,
          definition: String,
        },
      ],
    },
    estimatedReadTime: {
      type: Number,
      default: 5,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

topicSchema.index({ chapter: 1, order: 1 });

module.exports = mongoose.model('Topic', topicSchema);
