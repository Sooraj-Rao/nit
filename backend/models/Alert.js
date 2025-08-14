const mongoose = require('mongoose');

// Reuse schema for responders
const userResponseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  respondedAt: {
    type: Date,
    default: Date.now,
  },
});

const alertSchema = new mongoose.Schema({
  incident: {
    type: String,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    required: true,
  },
  additionalDetails: {
    type: String,
    default: '',
  },

  responders: [userResponseSchema],
  assignedResponder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },


  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);
