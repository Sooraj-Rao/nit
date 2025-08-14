const mongoose = require('mongoose');

const userAlertSchema = new mongoose.Schema({
  incident: { type: String, required: true },
  location: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Moderate', 'High','Critical'], required: true },
  description: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedResponder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   // 🔽 Add this field
  progressStatus: {
    type: String,
    enum: ['Dispatched',
    'On the Way',
    'Arrived',
    'Handling Incident',
    'Resolved'],
    default: 'Dispatched'
  },
  users: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      respondedAt: { type: Date, default: Date.now },
    }
  ]
}, { timestamps: true }

);


module.exports = mongoose.model('UserAlert', userAlertSchema);
