const express = require('express');
const { seedVolunteers, getMatches, confirmAssignment, listVolunteers, geoCheckin, completeTask } = require('../controllers/volunteers.controller');
const { requireRole } = require('../middleware/requireRole');
const User = require('../models/User');

const router = express.Router();

router.get('/', listVolunteers);
router.post('/seed', seedVolunteers);
router.post('/checkin', geoCheckin);
router.post('/complete-task', completeTask);

/**
 * GET /api/volunteers/directory
 * Privacy-safe roster of registered volunteers visible to authenticated volunteers.
 * CRITICAL: email, phone, location (GPS), and password_hash are NEVER returned.
 * Only name, domain, address (text), and join date are exposed.
 */
router.get('/directory', requireRole('volunteer'), async (req, res, next) => {
  try {
    const volunteers = await User.find({ role: 'volunteer', is_active: true })
      .select('name domain_knowledge address created_at -_id')
      .sort({ created_at: -1 })
      .lean();
    res.json({ count: volunteers.length, volunteers });
  } catch (err) {
    next(err);
  }
});

module.exports = { router, getMatches, confirmAssignment };
