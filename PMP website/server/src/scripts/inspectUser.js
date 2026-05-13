require('../config/env');
const mongoose = require('mongoose');
const User = require('../models/User');
const ExamAttempt = require('../models/ExamAttempt');
const Certificate = require('../models/Certificate');

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node src/scripts/inspectUser.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.log(`No user found with email ${email}`);
    await mongoose.disconnect();
    return;
  }

  console.log('\n=== USER ===');
  console.log({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  });

  const attempts = await ExamAttempt.find({ user: user._id })
    .sort({ createdAt: -1 })
    .select('examTitle score passed timeTaken startedAt completedAt cheatingFlagged violations createdAt');

  console.log(`\n=== EXAM ATTEMPTS (${attempts.length} total, most recent first) ===`);
  for (const a of attempts) {
    const dur = a.timeTaken != null
      ? `${Math.floor(a.timeTaken / 60)}m ${a.timeTaken % 60}s`
      : '(unfinished)';
    console.log('---');
    console.log('  exam:           ', a.examTitle);
    console.log('  startedAt:      ', a.startedAt);
    console.log('  completedAt:    ', a.completedAt);
    console.log('  duration:       ', dur);
    console.log('  score:          ', a.score, ' passed:', a.passed);
    console.log('  cheatingFlagged:', a.cheatingFlagged);
    console.log('  violations:     ', (a.violations || []).length);
    if (a.violations && a.violations.length) {
      for (const v of a.violations) console.log('    -', v.type, 'at', v.at);
    }
  }

  const certs = await Certificate.find({ user: user._id })
    .select('certificateNumber examTitle score issuedAt isRevoked');

  console.log(`\n=== CERTIFICATES (${certs.length}) ===`);
  for (const c of certs) {
    console.log({
      number: c.certificateNumber,
      exam: c.examTitle,
      score: c.score,
      issuedAt: c.issuedAt,
      isRevoked: c.isRevoked,
    });
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
