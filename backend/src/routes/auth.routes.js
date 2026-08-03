const { Router } = require('express');
const { login, registerVolunteer } = require('../controllers/auth.controller');

const router = Router();

router.post('/login', login);
router.post('/register-volunteer', registerVolunteer);

module.exports = router;
