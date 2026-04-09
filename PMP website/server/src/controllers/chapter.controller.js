const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');

exports.getChapters = async (req, res, next) => {
  try {
    const chapters = await Chapter.find({ isPublished: true })
      .sort({ order: 1 })
      .populate({
        path: 'topics',
        select: 'title slug order estimatedReadTime',
        match: { isPublished: true },
        options: { sort: { order: 1 } },
      });

    const completedTopics = req.user.progress?.completedTopics || [];
    const completedSet = new Set(completedTopics.map((id) => id.toString()));

    const chaptersWithProgress = chapters.map((ch) => {
      const chObj = ch.toObject();
      const topicCount = chObj.topics.length;
      const completedCount = chObj.topics.filter((t) => completedSet.has(t._id.toString())).length;

      chObj.topics = chObj.topics.map((t) => ({
        ...t,
        isCompleted: completedSet.has(t._id.toString()),
      }));
      chObj.topicCount = topicCount;
      chObj.completedTopics = completedCount;

      return chObj;
    });

    res.json({ chapters: chaptersWithProgress });
  } catch (error) {
    next(error);
  }
};

exports.getChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate({
      path: 'topics',
      select: 'title slug order estimatedReadTime',
      match: { isPublished: true },
      options: { sort: { order: 1 } },
    });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const completedTopics = req.user.progress?.completedTopics || [];
    const completedSet = new Set(completedTopics.map((id) => id.toString()));

    const chObj = chapter.toObject();
    chObj.topics = chObj.topics.map((t) => ({
      ...t,
      isCompleted: completedSet.has(t._id.toString()),
    }));

    res.json({ chapter: chObj });
  } catch (error) {
    next(error);
  }
};
