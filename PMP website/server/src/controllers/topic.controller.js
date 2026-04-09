const Topic = require('../models/Topic');
const User = require('../models/User');

exports.getTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOne({ slug: req.params.slug, isPublished: true });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const completedTopics = req.user.progress?.completedTopics || [];
    const isCompleted = completedTopics.some((id) => id.toString() === topic._id.toString());

    res.json({
      topic: {
        ...topic.toObject(),
        isCompleted,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.completeTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const user = await User.findById(req.user._id);
    const already = user.progress.completedTopics.some(
      (id) => id.toString() === topic._id.toString()
    );

    if (!already) {
      user.progress.completedTopics.push(topic._id);
      await user.save();
    }

    res.json({ message: 'Topic marked as complete' });
  } catch (error) {
    next(error);
  }
};
