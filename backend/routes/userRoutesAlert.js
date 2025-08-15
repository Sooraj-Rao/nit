const express = require('express');
const router = express.Router();
const UserAlert = require('../models/UserAlert');
// Add at top
const sendAlertEmail = require('../utils/mailer');
const User = require('../models/User');
const {
  getUserAlerts,
  respondToUserAlert,
  assignUserToUserAlert,
  updateProgressStatus,
} = require('../controllers/userAlertController');
const { authenticate } = require('../middleware/authMiddleware');

// ➕ Create User Alert
router.post('/', authenticate, async (req, res) => {
  try {
    const alert = new UserAlert({ ...req.body, reportedBy: req.user.id });
    await alert.save();

    // Fetch all responders
    const responders = await User.find({ role: 'responder' });
    const emails = responders.map(r => r.email);

    // Send alert email
    const subject = '🚨 New User Alert Created';
    const html = `
      <h3>New User Alert Details</h3>
      <p><strong>Incident:</strong> ${alert.incident}</p>
      <p><strong>Location:</strong> ${alert.location}</p>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Description:</strong> ${alert.description || 'N/A'}</p>
    `;
    await sendAlertEmail(emails, subject, html);

    res.status(201).json({ message: 'User alert created and responders notified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user alert' });
  }
});

// 🔍 Get All Alerts (admin/responder)
router.get('/', authenticate, async (req, res) => {
  try {
    const userAlerts = await UserAlert.find()
      .populate('reportedBy', 'name email')
      .populate('assignedResponder', 'name email')
      .populate('users.user', 'name email')
      .sort({ createdAt: -1 });
    res.json(userAlerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user alerts' });
  }
});

// 👤 Get Logged-in User's Alerts
router.get('/my-alerts', authenticate, getUserAlerts);

// 👤 Update specific user alert
router.put('/:id', authenticate, async (req, res) => {
  try {
    const alert = await UserAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    if (alert.reportedBy.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    alert.incident = req.body.incident || alert.incident;
    alert.place = req.body.location || alert.place;
    alert.severity = req.body.severity || alert.severity;
    alert.description = req.body.description || alert.description;

    await alert.save();
    res.json({ message: 'Alert updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// 🗑️ Delete User Alert
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const alert = await UserAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    if (alert.reportedBy.toString() !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized to delete this alert' });

    await alert.deleteOne();
    res.json({ message: 'Alert deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});



// ✅ New: Responder marks themselves as available for user alert
router.post('/respond/:id', authenticate, respondToUserAlert);

// ✅ New: Admin assigns responder to user alert
router.post('/assign/:id', authenticate, assignUserToUserAlert);

router.put('/:id/progress', updateProgressStatus);
// ✅ Get progress of a specific alert
router.get('/:id/progress', authenticate, async (req, res) => {
  try {
    const alert = await UserAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    return res.json({ progressStatus: alert.progressStatus });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
