const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// ✅ Get all messages for a specific alert
router.get('/:alertId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ alertId: req.params.alertId })
      .populate('sender', 'name') // populate sender name
      .sort({ createdAt: 1 }); // sort by time (oldest first)
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Optional: Delete all messages for a specific alert
router.delete('/:alertId', async (req, res) => {
  try {
    await ChatMessage.deleteMany({ alertId: req.params.alertId });
    res.status(200).json({ message: 'Messages deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting messages' });
  }
});

module.exports = router;
