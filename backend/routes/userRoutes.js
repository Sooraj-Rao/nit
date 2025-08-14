// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Make sure path is correct

// ✅ GET /api/users/responders
router.get('/responders', async (req, res) => {
  try {
    const responders = await User.find({ role: 'responder' }).select('-password');
    res.json(responders);
  } catch (err) {
    console.error('Error fetching responders:', err);
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

// ✅ GET /api/users/users (previously volunteers)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
