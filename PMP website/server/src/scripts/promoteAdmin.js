require('../config/env');
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node src/scripts/promoteAdmin.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { role: 'admin' } },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`OK: ${user.email} (${user.firstName} ${user.lastName}) is now an admin.`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
