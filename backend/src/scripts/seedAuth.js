/**
 * seedAuth.js — clears the User collection and injects exactly 1 Admin + 1 Volunteer
 * for immediate testing of the hidden login routes.
 *
 * Usage:
 *   node src/scripts/seedAuth.js
 *
 * Admin login:      admin@sra.gov        / SRA-Admin-2025!
 * Volunteer login:  volunteer@sra.gov    / SRA-Volunteer-2025!
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const SEEDS = [
  {
    name: 'Command Administrator',
    email: 'admin@sra.gov',
    password: 'SRA-Admin-2025!',
    role: 'admin',
  },
  {
    name: 'Field Volunteer',
    email: 'volunteer@sra.gov',
    password: 'SRA-Volunteer-2025!',
    role: 'volunteer',
    address: '12 Relief Camp Road, Jaipur, Rajasthan',
    phone: '+91-9876543210',
    domain_knowledge: 'Medical',
  },
];

async function seed() {
  await connectDB();

  await User.deleteMany({});
  console.log('[seedAuth] Cleared User collection.\n');

  for (const seed of SEEDS) {
    const { password, ...rest } = seed;
    const password_hash = await bcrypt.hash(password, 12);
    await User.create({ ...rest, password_hash });
    console.log(`[seedAuth] Created ${seed.role.padEnd(9)} → ${seed.email} / ${password}`);
  }

  console.log('\n[seedAuth] Done. You can now log in at:');
  console.log('  Admin    → /command-admin');
  console.log('  Volunteer → /command-volunteer\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seedAuth] Fatal error:', err.message);
  process.exit(1);
});
