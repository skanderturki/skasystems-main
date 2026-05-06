require('../config/env');
const mongoose = require('mongoose');
const User = require('../models/User');
const Certificate = require('../models/Certificate');

(async () => {
  const dryRun = process.argv.includes('--dry-run');

  await mongoose.connect(process.env.MONGODB_URI);

  // Distinct users that have at least one revoked certificate.
  const userIds = await Certificate.distinct('user', { isRevoked: true });

  // Don't ban admins, even if they (somehow) have a revoked cert.
  const targets = await User.find({
    _id: { $in: userIds },
    role: { $ne: 'admin' },
  }).select('email firstName lastName isActive');

  if (!targets.length) {
    console.log('No users with revoked certificates to ban.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${targets.length} candidate user(s):`);
  for (const u of targets) {
    const status = u.isActive ? 'currently ACTIVE' : 'already banned';
    console.log(`  - ${u.email}  (${u.firstName} ${u.lastName})  ${status}`);
  }

  if (dryRun) {
    console.log('\n[dry-run] No changes applied. Re-run without --dry-run to ban these users.');
    await mongoose.disconnect();
    return;
  }

  const result = await User.updateMany(
    { _id: { $in: userIds }, role: { $ne: 'admin' }, isActive: true },
    { $set: { isActive: false } }
  );

  console.log(`\nBanned ${result.modifiedCount} user(s).`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
