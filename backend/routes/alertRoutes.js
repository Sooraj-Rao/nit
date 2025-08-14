const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const User = require('../models/User');
// Add at top
const sendAlertEmail = require('../utils/mailer');

const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const {assignResponder,} = require('../controllers/alertcontroller');

// 🚨 CREATE NEW ALERT
router.post('/', authenticate, async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    await newAlert.save();

    // Fetch all responders
    const responders = await User.find({ role: 'responder' });
    const emails = responders.map(r => r.email);

    // Send alert email
    const subject = '🚨 New Admin Alert Created';
    const html = `
      <h3>New Alert Details</h3>
      <p><strong>Incident:</strong> ${newAlert.incident}</p>
      <p><strong>Location:</strong> ${newAlert.place}</p>
      <p><strong>Severity:</strong> ${newAlert.severity}</p>
      <p><strong>Description:</strong> ${newAlert.description || 'N/A'}</p>
    `;
    // await sendAlertEmail(emails, subject, html);

    res.status(201).json({ message: 'Alert created and responders notified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// 🚨 RESPONDER marks availability
router.post('/respond/:alertId', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    const alreadyResponded = alert.responders.some(r => r.user.toString() === req.user.id);
    if (alreadyResponded) {
      return res.status(400).json({ message: 'You have already responded to this alert' });
    }

    alert.responders.push({ user: req.user.id, respondedAt: new Date() });
    await alert.save();

    res.json({ message: 'Responder availability recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update alert response' });
  }
});

// ✅ ADMIN assigns responder
router.post('/assign/:alertId', authenticate, authorizeAdmin, assignResponder);

// ✅ GET all alerts with all relationships populated
router.get('/', authenticate, async (req, res) => {
  try {
    const { severity, from, to, search = '', page = 1, limit = 6 } = req.query;
    const filter = {
      incident: { $regex: search, $options: 'i' },
    };

    if (severity) filter.severity = severity;
    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const total = await Alert.countDocuments(filter);
    const alerts = await Alert.find(filter)
      .populate('responders.user', 'name email')
      .populate('assignedResponder', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ alerts, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// ✅ GET single alert
router.get('/:alertId', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.alertId)
      .populate('responders.user', 'name email')
      .populate('assignedResponder', 'name email');

    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching alert' });
  }
});

// ✅ UPDATE alert
router.put('/:alertId', authenticate, async (req, res) => {
  try {
    const updatedAlert = await Alert.findByIdAndUpdate(req.params.alertId, req.body, { new: true });
    if (!updatedAlert) return res.status(404).json({ message: 'Alert not found' });
    res.json(updatedAlert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// ✅ DELETE alert
router.delete('/:alertId', authenticate, async (req, res) => {
  try {
    const deletedAlert = await Alert.findByIdAndDelete(req.params.alertId);
    if (!deletedAlert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});
const UserAlert = require('../models/UserAlert');

// 🆕 GET all UserAlerts
router.get('/useralerts', authenticate, async (req, res) => {
  try {
    const { severity, search = '', page = 1, limit = 4 } = req.query;
    const filter = {
      incident: { $regex: search, $options: 'i' },
    };
    if (severity) filter.severity = severity;

    const total = await UserAlert.countDocuments(filter);
    const useralerts = await UserAlert.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ useralerts, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user alerts' });
  }
});

module.exports = router;
