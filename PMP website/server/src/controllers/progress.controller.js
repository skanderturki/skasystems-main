const User = require('../models/User');
const Topic = require('../models/Topic');
const PracticeAttempt = require('../models/PracticeAttempt');
const Certificate = require('../models/Certificate');

exports.getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const totalTopics = await Topic.countDocuments({ isPublished: true });
    const topicsCompleted = user.progress?.completedTopics?.length || 0;

    const practiceAttempts = await PracticeAttempt.find({
      user: req.user._id,
      completedAt: { $ne: null },
    }).select('score');

    const practiceTests = practiceAttempts.length;
    const avgScore = practiceTests > 0
      ? Math.round(practiceAttempts.reduce((sum, a) => sum + a.score, 0) / practiceTests)
      : 0;

    const certificates = await Certificate.countDocuments({
      user: req.user._id,
      isRevoked: false,
    });

    const courseProgress = totalTopics > 0
      ? Math.round((topicsCompleted / totalTopics) * 100)
      : 0;

    res.json({
      topicsCompleted,
      totalTopics,
      practiceTests,
      avgScore,
      certificates,
      courseProgress,
    });
  } catch (error) {
    next(error);
  }
};
