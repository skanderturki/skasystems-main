const Certificate = require('../models/Certificate');
const ExamAttempt = require('../models/ExamAttempt');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const csvEscape = (v) => {
  if (v === null || v === undefined) return '';
  const s = v instanceof Date ? v.toISOString() : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

const parseDateRange = (req, field) => {
  const range = {};
  if (req.query.from) range.$gte = new Date(req.query.from);
  if (req.query.to) {
    const to = new Date(req.query.to);
    to.setHours(23, 59, 59, 999);
    range.$lte = to;
  }
  return Object.keys(range).length ? { [field]: range } : {};
};

// ─── Certificates ──────────────────────────────────────────────────────────

const buildCertificatePipeline = (req) => {
  const { q, examTitle, status, sortBy = 'issuedAt', sortDir = 'desc' } = req.query;
  const pipeline = [];

  const initialMatch = { ...parseDateRange(req, 'issuedAt') };
  if (status === 'active') initialMatch.isRevoked = false;
  else if (status === 'revoked') initialMatch.isRevoked = true;
  if (examTitle) initialMatch.examTitle = examTitle;
  if (Object.keys(initialMatch).length) pipeline.push({ $match: initialMatch });

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDoc',
      },
    },
    { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'examattempts',
        localField: 'examAttempt',
        foreignField: '_id',
        as: 'attemptDoc',
      },
    },
    { $unwind: { path: '$attemptDoc', preserveNullAndEmptyArrays: true } }
  );

  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    pipeline.push({
      $match: {
        $or: [
          { recipientName: rx },
          { certificateNumber: rx },
          { examTitle: rx },
          { 'userDoc.email': rx },
          { 'userDoc.firstName': rx },
          { 'userDoc.lastName': rx },
        ],
      },
    });
  }

  const sortField = ['issuedAt', 'score', 'recipientName', 'examTitle'].includes(sortBy)
    ? sortBy
    : 'issuedAt';
  pipeline.push({ $sort: { [sortField]: sortDir === 'asc' ? 1 : -1 } });

  pipeline.push({
    $project: {
      certificateNumber: 1,
      recipientName: 1,
      examTitle: 1,
      score: 1,
      issuedAt: 1,
      isRevoked: 1,
      verificationToken: 1,
      email: '$userDoc.email',
      firstName: '$userDoc.firstName',
      lastName: '$userDoc.lastName',
      timeTaken: '$attemptDoc.timeTaken',
      startedAt: '$attemptDoc.startedAt',
      completedAt: '$attemptDoc.completedAt',
    },
  });

  return pipeline;
};

exports.listCertificates = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const basePipeline = buildCertificatePipeline(req);

    const [result] = await Certificate.aggregate([
      ...basePipeline,
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
          examTitles: [{ $group: { _id: '$examTitle' } }, { $sort: { _id: 1 } }],
        },
      },
    ]);

    const total = result.totalCount[0]?.count || 0;
    res.json({
      items: result.items,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
      examTitles: result.examTitles.map((e) => e._id).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

exports.exportCertificatesCsv = async (req, res, next) => {
  try {
    const items = await Certificate.aggregate(buildCertificatePipeline(req));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificates-${new Date().toISOString().slice(0, 10)}.csv"`
    );

    const header = [
      'Certificate Number',
      'Recipient Name',
      'First Name',
      'Last Name',
      'Email',
      'Exam',
      'Score (%)',
      'Issued At',
      'Started At',
      'Completed At',
      'Duration (s)',
      'Status',
    ];
    res.write(header.join(',') + '\n');

    for (const it of items) {
      const row = [
        it.certificateNumber,
        it.recipientName,
        it.firstName,
        it.lastName,
        it.email,
        it.examTitle,
        it.score,
        it.issuedAt,
        it.startedAt,
        it.completedAt,
        it.timeTaken,
        it.isRevoked ? 'Revoked' : 'Active',
      ].map(csvEscape);
      res.write(row.join(',') + '\n');
    }
    res.end();
  } catch (error) {
    next(error);
  }
};

exports.revokeCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(
      req.params.id,
      { isRevoked: true },
      { new: true }
    );
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json({ certificate: cert });
  } catch (error) {
    next(error);
  }
};

exports.reactivateCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(
      req.params.id,
      { isRevoked: false },
      { new: true }
    );
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json({ certificate: cert });
  } catch (error) {
    next(error);
  }
};

// ─── Exam attempts ─────────────────────────────────────────────────────────

const buildExamAttemptPipeline = (req) => {
  const { q, examTitle, status, sortBy = 'completedAt', sortDir = 'desc' } = req.query;
  const pipeline = [];

  const initialMatch = {
    completedAt: { $ne: null },
    ...parseDateRange(req, 'completedAt'),
  };
  if (status === 'passed') initialMatch.passed = true;
  else if (status === 'failed') initialMatch.passed = false;
  if (examTitle) initialMatch.examTitle = examTitle;
  pipeline.push({ $match: initialMatch });

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDoc',
      },
    },
    { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } }
  );

  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    pipeline.push({
      $match: {
        $or: [
          { examTitle: rx },
          { 'userDoc.email': rx },
          { 'userDoc.firstName': rx },
          { 'userDoc.lastName': rx },
        ],
      },
    });
  }

  const sortField = ['completedAt', 'startedAt', 'score'].includes(sortBy)
    ? sortBy
    : 'completedAt';
  pipeline.push({ $sort: { [sortField]: sortDir === 'asc' ? 1 : -1 } });

  pipeline.push({
    $project: {
      examTitle: 1,
      score: 1,
      totalQuestions: 1,
      correctCount: 1,
      passed: 1,
      timeTaken: 1,
      startedAt: 1,
      completedAt: 1,
      hasCertificate: { $cond: [{ $ifNull: ['$certificate', false] }, true, false] },
      email: '$userDoc.email',
      firstName: '$userDoc.firstName',
      lastName: '$userDoc.lastName',
    },
  });

  return pipeline;
};

exports.listExamAttempts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const basePipeline = buildExamAttemptPipeline(req);

    const [result] = await ExamAttempt.aggregate([
      ...basePipeline,
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
          examTitles: [{ $group: { _id: '$examTitle' } }, { $sort: { _id: 1 } }],
        },
      },
    ]);

    const total = result.totalCount[0]?.count || 0;
    res.json({
      items: result.items,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
      examTitles: result.examTitles.map((e) => e._id).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

exports.exportExamAttemptsCsv = async (req, res, next) => {
  try {
    const items = await ExamAttempt.aggregate(buildExamAttemptPipeline(req));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="exam-attempts-${new Date().toISOString().slice(0, 10)}.csv"`
    );

    const header = [
      'First Name',
      'Last Name',
      'Email',
      'Exam',
      'Score (%)',
      'Correct',
      'Total',
      'Passed',
      'Started At',
      'Completed At',
      'Duration (s)',
      'Has Certificate',
    ];
    res.write(header.join(',') + '\n');

    for (const it of items) {
      const row = [
        it.firstName,
        it.lastName,
        it.email,
        it.examTitle,
        it.score,
        it.correctCount,
        it.totalQuestions,
        it.passed ? 'Yes' : 'No',
        it.startedAt,
        it.completedAt,
        it.timeTaken,
        it.hasCertificate ? 'Yes' : 'No',
      ].map(csvEscape);
      res.write(row.join(',') + '\n');
    }
    res.end();
  } catch (error) {
    next(error);
  }
};
