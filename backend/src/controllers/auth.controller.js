const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '24h';

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), is_active: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function registerVolunteer(req, res, next) {
  try {
    const { name, email, password, address, phone, domain_knowledge, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Sanitize GPS coords: only persist when both are finite numbers in valid range.
    let coords;
    if (location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))) {
      const lat = Number(location.lat);
      const lng = Number(location.lng);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        coords = { lat, lng };
      }
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role: 'volunteer',
      address: address?.trim() || undefined,
      location: coords,
      phone: phone?.trim() || undefined,
      domain_knowledge: domain_knowledge || undefined,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, registerVolunteer };
