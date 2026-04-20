const User = require('../models/User');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const PracticeAttempt = require('../models/PracticeAttempt');
const ExamAttempt = require('../models/ExamAttempt');
const Certificate = require('../models/Certificate');

// Aggregate platform-wide statistics. No PII is returned — counts and means only,
// safe to expose to any verified learner.
exports.getOverview = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      verifiedUsers,
      totalPractice,
      totalExams,
      passedExams,
      totalCertificates,
      totalChapters,
      totalTopics,
      totalQuestions,
      registrationsByDay,
      practiceByChapter,
      certificatesByMonth,
      examScoreBuckets,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isVerified: true }),
      PracticeAttempt.countDocuments({ completedAt: { $ne: null } }),
      ExamAttempt.countDocuments({ completedAt: { $ne: null } }),
      ExamAttempt.countDocuments({ completedAt: { $ne: null }, passed: true }),
      Certificate.countDocuments({ isRevoked: false }),
      Chapter.countDocuments({ isPublished: true }),
      Topic.countDocuments({ isPublished: true }),
      require('../models/Question').countDocuments(),

      // Daily registrations over the last 30 days (students only).
      User.aggregate([
        { $match: { role: 'student', createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Practice attempts grouped by chapter title (derived from examTitle prefix
      // when possible, else falls back to 'Other'). Also returns mean score.
      PracticeAttempt.aggregate([
        { $match: { completedAt: { $ne: null } } },
        {
          $group: {
            _id: '$examTitle',
            attempts: { $sum: 1 },
            avgScore: { $avg: '$score' },
          },
        },
        { $sort: { attempts: -1 } },
        { $limit: 15 },
      ]),

      // Certificate issuance per calendar month (last 6 months).
      Certificate.aggregate([
        { $match: { isRevoked: false } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$issuedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),

      // Exam score distribution in 10-point buckets.
      ExamAttempt.aggregate([
        { $match: { completedAt: { $ne: null } } },
        {
          $bucket: {
            groupBy: '$score',
            boundaries: [0, 20, 40, 60, 80, 101],
            default: 'other',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ]);

    const passRate =
      totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

    // Build continuous 30-day series so the line chart has no gaps.
    const dayMap = new Map(registrationsByDay.map((d) => [d._id, d.count]));
    const registrations = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      registrations.push({ date: key, count: dayMap.get(key) || 0 });
    }

    res.json({
      totals: {
        users: totalUsers,
        verifiedUsers,
        practiceAttempts: totalPractice,
        examAttempts: totalExams,
        certificates: totalCertificates,
        passRate,
        chapters: totalChapters,
        topics: totalTopics,
        questions: totalQuestions,
      },
      registrations,
      practiceByChapter: practiceByChapter.map((p) => ({
        label: p._id || 'Unknown',
        attempts: p.attempts,
        avgScore: Math.round(p.avgScore || 0),
      })),
      certificatesByMonth: certificatesByMonth.map((c) => ({
        month: c._id,
        count: c.count,
      })),
      examScoreBuckets: examScoreBuckets.map((b) => ({
        range:
          b._id === 0
            ? '0–19'
            : b._id === 20
            ? '20–39'
            : b._id === 40
            ? '40–59'
            : b._id === 60
            ? '60–79'
            : b._id === 80
            ? '80–100'
            : String(b._id),
        count: b.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};
