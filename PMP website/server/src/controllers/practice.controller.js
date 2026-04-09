const Question = require('../models/Question');
const Exam = require('../models/Exam');
const PracticeAttempt = require('../models/PracticeAttempt');
const User = require('../models/User');

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shuffle options and relabel them A, B, C, D... in their new order so the
// client always displays labels in sequence even though the content is
// randomized. isCorrect stays attached to the same option through the remap.
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
function shuffleAndRelabel(options) {
  return shuffleArray(options).map((o, i) => ({
    label: LABELS[i],
    text: o.text,
    isCorrect: Boolean(o.isCorrect),
  }));
}

exports.getAvailable = async (req, res, next) => {
  try {
    const exams = await Exam.find({ examType: 'practice', isPublished: true })
      .populate('chapters', 'title')
      .sort({ createdAt: 1 });
    res.json({ exams });
  } catch (error) {
    next(error);
  }
};

exports.start = async (req, res, next) => {
  try {
    const { examId } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam || exam.examType !== 'practice') {
      return res.status(404).json({ message: 'Practice test not found' });
    }

    // Get questions for the exam's chapters
    let questions = await Question.find({
      chapter: { $in: exam.chapters },
      usedIn: { $in: ['practice', 'both'] },
      isActive: true,
    });

    // Shuffle and limit
    questions = shuffleArray(questions).slice(0, exam.questionCount);

    // Always shuffle + relabel options so display is A, B, C, D in order
    // but the content at each letter is randomized per attempt.
    questions = questions.map((q) => {
      const qObj = q.toObject();
      qObj.options = shuffleAndRelabel(qObj.options);
      return qObj;
    });

    // Create attempt
    const attempt = await PracticeAttempt.create({
      user: req.user._id,
      exam: exam._id,
      examTitle: exam.title,
      questions: questions.map((q) => ({
        question: q._id,
        questionText: q.questionText,
        options: q.options,
        explanation: q.explanation,
        selectedOption: null,
        isCorrect: false,
      })),
      totalQuestions: questions.length,
    });

    // Strip answers from response
    const sanitizedQuestions = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options.map((o) => ({ label: o.label, text: o.text })),
    }));

    res.json({
      attemptId: attempt._id,
      questions: sanitizedQuestions,
      timeLimit: exam.timeLimit,
    });
  } catch (error) {
    next(error);
  }
};

exports.submit = async (req, res, next) => {
  try {
    const { attemptId, answers, timeTaken } = req.body;

    const attempt = await PracticeAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.completedAt) {
      return res.status(400).json({ message: 'This test has already been submitted' });
    }

    // Grade answers
    const answerMap = {};
    if (answers) {
      answers.forEach((a) => {
        answerMap[a.questionId] = a.selectedOption;
      });
    }

    let correctCount = 0;
    attempt.questions = attempt.questions.map((q) => {
      const selected = answerMap[q.question.toString()] || null;
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = selected === correctOption?.label;
      if (isCorrect) correctCount++;

      return {
        ...q.toObject(),
        selectedOption: selected,
        isCorrect,
      };
    });

    attempt.correctCount = correctCount;
    attempt.score = Math.round((correctCount / attempt.totalQuestions) * 100);
    attempt.timeTaken = timeTaken;
    attempt.completedAt = new Date();
    await attempt.save();

    // Update user progress
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { 'progress.practiceAttempts': attempt._id },
    });

    res.json({ attemptId: attempt._id });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const attempts = await PracticeAttempt.find({
      user: req.user._id,
      completedAt: { $ne: null },
    })
      .select('examTitle score totalQuestions correctCount timeTaken createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ attempts });
  } catch (error) {
    next(error);
  }
};

exports.getAttempt = async (req, res, next) => {
  try {
    const attempt = await PracticeAttempt.findOne({
      _id: req.params.attemptId,
      user: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json({ attempt });
  } catch (error) {
    next(error);
  }
};
