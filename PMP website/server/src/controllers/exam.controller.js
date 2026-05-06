const Question = require('../models/Question');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Anti-cheat: minimum acceptable elapsed time on a formal exam, in seconds.
// Below this threshold the submission is treated as suspicious — the attempt
// is failed, all the user's existing certificates are revoked, and the user
// is banned. Configurable via env so the threshold can be tuned without code.
const MIN_FORMAL_EXAM_SECONDS =
  parseInt(process.env.MIN_FORMAL_EXAM_SECONDS, 10) || 20 * 60;

// Proctoring: number of cheating signals (tab switch, fullscreen exit, etc.)
// at or above which the submission is treated as cheating.
const MAX_EXAM_VIOLATIONS = parseInt(process.env.MAX_EXAM_VIOLATIONS, 10) || 3;

const ALLOWED_VIOLATION_TYPES = [
  'tab-hidden',
  'window-blur',
  'fullscreen-exit',
  'blocked-key',
];

const banUserAndRevokeCerts = async (userId) => {
  await Certificate.updateMany(
    { user: userId, isRevoked: false },
    { $set: { isRevoked: true } }
  );
  await User.findByIdAndUpdate(userId, { $set: { isActive: false } });
};

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
    const exams = await Exam.find({ examType: 'formal', isPublished: true })
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
    if (!exam || exam.examType !== 'formal') {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check max attempts
    if (exam.maxAttempts) {
      const attemptCount = await ExamAttempt.countDocuments({
        user: req.user._id,
        exam: exam._id,
        completedAt: { $ne: null },
      });
      if (attemptCount >= exam.maxAttempts) {
        return res.status(400).json({ message: `Maximum ${exam.maxAttempts} attempts reached for this exam` });
      }
    }

    // Get questions
    let questions = await Question.find({
      chapter: { $in: exam.chapters },
      usedIn: { $in: ['exam', 'both'] },
      isActive: true,
    });

    questions = shuffleArray(questions).slice(0, exam.questionCount);

    // Always shuffle + relabel options so display is A, B, C, D in order.
    questions = questions.map((q) => {
      const qObj = q.toObject();
      qObj.options = shuffleAndRelabel(qObj.options);
      return qObj;
    });

    // Create attempt — store the post-shuffle correct label per question
    // so grading on submit doesn't need to reconstruct the shuffle order.
    const attempt = await ExamAttempt.create({
      user: req.user._id,
      exam: exam._id,
      examTitle: exam.title,
      questions: questions.map((q) => ({
        question: q._id,
        correctOption: q.options.find((o) => o.isCorrect)?.label,
        selectedOption: null,
        isCorrect: false,
      })),
      totalQuestions: questions.length,
      startedAt: new Date(),
    });

    // Strip answers
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
    const { attemptId, answers, violations: clientViolations } = req.body;

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.completedAt) {
      return res.status(400).json({ message: 'This exam has already been submitted' });
    }

    // Server-authoritative time-taken — never trust the client value.
    const serverTimeTaken = Math.max(
      0,
      Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)
    );

    // Sanitise the client-supplied violations array: keep only known types and
    // valid timestamps. We trust the *count* (the client cannot pretend to have
    // fewer violations than threshold without losing the submission anyway,
    // because we additionally enforce time-taken below) but we sanitise to
    // avoid storing arbitrary payloads.
    const violations = Array.isArray(clientViolations)
      ? clientViolations
          .filter((v) => v && ALLOWED_VIOLATION_TYPES.includes(v.type))
          .map((v) => ({ type: v.type, at: v.at ? new Date(v.at) : new Date() }))
          .slice(0, 100) // hard cap to bound DB row size
      : [];

    // Anti-cheat #1: too many proctoring violations during the attempt.
    if (req.user.role !== 'admin' && violations.length >= MAX_EXAM_VIOLATIONS) {
      attempt.completedAt = new Date();
      attempt.timeTaken = serverTimeTaken;
      attempt.passed = false;
      attempt.score = 0;
      attempt.correctCount = 0;
      attempt.violations = violations;
      attempt.cheatingFlagged = true;
      await attempt.save();

      await banUserAndRevokeCerts(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { 'progress.examAttempts': attempt._id },
      });

      console.warn(
        `[anti-cheat] banned user ${req.user.email} — ${violations.length} violations during exam ${attempt.examTitle}`
      );

      return res.status(403).json({
        banned: true,
        message:
          'Your account has been suspended because too many proctoring violations were recorded during the exam. All certificates linked to your account have been revoked.',
      });
    }

    // Anti-cheat #2: a formal-exam submission below the minimum elapsed time
    // bans the user and revokes every certificate they hold. Admins exempt.
    if (req.user.role !== 'admin' && serverTimeTaken < MIN_FORMAL_EXAM_SECONDS) {
      attempt.completedAt = new Date();
      attempt.timeTaken = serverTimeTaken;
      attempt.passed = false;
      attempt.score = 0;
      attempt.correctCount = 0;
      attempt.violations = violations;
      await attempt.save();

      await banUserAndRevokeCerts(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { 'progress.examAttempts': attempt._id },
      });

      console.warn(
        `[anti-cheat] banned user ${req.user.email} — submitted exam ${attempt.examTitle} after ${serverTimeTaken}s (min ${MIN_FORMAL_EXAM_SECONDS}s)`
      );

      return res.status(403).json({
        banned: true,
        message:
          'Your account has been suspended due to suspicious activity during the exam. All certificates linked to your account have been revoked. Contact your instructor if you believe this is an error.',
      });
    }

    const answerMap = {};
    if (answers) {
      answers.forEach((a) => {
        answerMap[a.questionId] = a.selectedOption;
      });
    }

    // Grade using the per-attempt correctOption stored at start time
    // (the shuffled+relabeled correct answer).
    let correctCount = 0;
    attempt.questions = attempt.questions.map((aq) => {
      const selected = answerMap[aq.question.toString()] || null;
      const isCorrect = selected != null && selected === aq.correctOption;
      if (isCorrect) correctCount++;

      return {
        question: aq.question,
        correctOption: aq.correctOption,
        selectedOption: selected,
        isCorrect,
      };
    });

    const exam = await Exam.findById(attempt.exam);
    attempt.correctCount = correctCount;
    attempt.score = Math.round((correctCount / attempt.totalQuestions) * 100);
    attempt.passed = attempt.score >= (exam?.passingScore || 80);
    attempt.timeTaken = serverTimeTaken;
    attempt.violations = violations;
    attempt.completedAt = new Date();

    // Generate certificate if passed
    if (attempt.passed) {
      const certCount = await Certificate.countDocuments();
      const certNumber = `PMP-${new Date().getFullYear()}-${String(certCount + 1).padStart(4, '0')}`;

      const certificate = await Certificate.create({
        user: req.user._id,
        examAttempt: attempt._id,
        certificateNumber: certNumber,
        verificationToken: uuidv4(),
        recipientName: `${req.user.firstName} ${req.user.lastName}`,
        examTitle: attempt.examTitle,
        score: attempt.score,
        issuedAt: new Date(),
      });

      attempt.certificate = certificate._id;

      // Update user progress
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          'progress.certificates': certificate._id,
          'progress.examAttempts': attempt._id,
        },
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { 'progress.examAttempts': attempt._id },
      });
    }

    await attempt.save();

    res.json({
      attemptId: attempt._id,
      score: attempt.score,
      passed: attempt.passed,
      certificate: attempt.certificate,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const attempts = await ExamAttempt.find({
      user: req.user._id,
      completedAt: { $ne: null },
    })
      .select('examTitle score passed totalQuestions correctCount timeTaken certificate createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ attempts });
  } catch (error) {
    next(error);
  }
};

exports.getAttempt = async (req, res, next) => {
  try {
    const attempt = await ExamAttempt.findOne({
      _id: req.params.attemptId,
      user: req.user._id,
    }).select('examTitle score passed totalQuestions correctCount timeTaken certificate createdAt');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json({ attempt });
  } catch (error) {
    next(error);
  }
};
