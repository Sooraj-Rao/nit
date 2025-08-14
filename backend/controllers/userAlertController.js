const UserAlert = require('../models/UserAlert');

// Track scheduled deletions
const scheduledDeletions = {};

// Get alerts created by the logged-in user
exports.getUserAlerts = async (req, res) => {
  try {
    const alerts = await UserAlert.find({ reportedBy: req.user.id })
      .populate('assignedResponder', 'name email')
      .populate('users.user', 'name email');
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching user alerts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark responder as available for a user alert
exports.respondToUserAlert = async (req, res) => {
  const alertId = req.params.id;
  try {
    const alert = await UserAlert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    const alreadyResponded = alert.users.some(
      (entry) => entry.user.toString() === req.user.id
    );

    if (!alreadyResponded) {
      alert.users.push({ user: req.user.id });
      await alert.save();
    }

    res.status(200).json({ message: 'Marked as available' });
  } catch (err) {
    console.error('Error responding to user alert:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign a responder to a user alert
exports.assignUserToUserAlert = async (req, res) => {
  const alertId = req.params.id;
  try {
    const alert = await UserAlert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (alert.assignedResponder) {
      return res.status(400).json({ message: 'Responder already assigned' });
    }

    alert.assignedResponder = req.body.responderId;
    await alert.save();

    res.status(200).json({ message: 'Responder assigned successfully' });
  } catch (err) {
    console.error('Error assigning responder to user alert:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update progress status for user alert
exports.updateProgressStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressStatus } = req.body;

    const alert = await UserAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.progressStatus = progressStatus;
    await alert.save();

    if (progressStatus === 'Resolved' && !scheduledDeletions[id]) {
      console.log(`⏳ Scheduling deletion for alert ${id} in 10 minutes.`);

      scheduledDeletions[id] = setTimeout(async () => {
        try {
          await UserAlert.findByIdAndDelete(id);
          console.log(`🗑️ Alert ${id} deleted after being resolved.`);
          delete scheduledDeletions[id];
        } catch (error) {
          console.error(`❌ Failed to delete alert ${id}:`, error);
        }
      }, 10 * 60 * 1000);
    }

    res.status(200).json(alert);
  } catch (err) {
    res.status(500).json({ message: "Error updating progress status", error: err.message });
  }
};
