/**
 * admin.routes.js — admin-only endpoints for managing the volunteer roster.
 *
 * Mounted at /api/admin (see app.js).
 *
 * Auth: every route here is wrapped in requireRole('admin'), which:
 *   1. verifies a valid Bearer JWT  → 401 on missing/expired/invalid token
 *   2. checks req.user.role === 'admin' → 403 on volunteer/other roles
 */

const { Router } = require('express');
const User = require('../models/User');
const { requireRole } = require('../middleware/requireRole');

const router = Router();

/**
 * GET /api/admin/volunteers
 * Returns every active volunteer in the system, newest first.
 * Strips password_hash via .select('-password_hash') so secrets never leave the server.
 */
router.get('/volunteers', requireRole('admin'), async (req, res, next) => {
  try {
    const volunteers = await User.find({ role: 'volunteer', is_active: true })
      .select('-password_hash')           // never ship hashes to the client
      .sort({ created_at: -1 })           // newest registrations first
      .lean();                            // plain JS objects, faster serialization

    res.json({ count: volunteers.length, volunteers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
