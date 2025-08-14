const Alert = require('../models/Alert');

// Create new alert
exports.createAlert = async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.status(201).json({ message: 'Alert created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
};

// Get all alerts
exports.getAlerts = async (req, res) => {
  try {
    const { severity, from, to, search = '', page = 1, limit = 6 } = req.query;
    const filter = {
      incident: { $regex: search, $options: 'i' },
    };

    if (severity) filter.severity = severity;
    if (from && to) filter.createdAt = { $gte: new Date(from), $lte: new Date(to) };

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
};

// Assign responder to alert (admin-only)
exports.assignResponder = async (req, res) => {
  const { alertId } = req.params;
  const { responderId } = req.body;

  try {
    const alert = await Alert.findById(alertId);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    if (alert.assignedResponder) {
      return res.status(400).json({ message: 'Responder already assigned' });
    }

    alert.assignedResponder = responderId;
    await alert.save();

    res.status(200).json({ message: 'Responder assigned successfully' });
  } catch (err) {
    console.error('Error assigning responder:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
