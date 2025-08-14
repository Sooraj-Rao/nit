const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  place: { type: String, required: true },
  date: { type: Date, required: true },
  poster: {
    data: Buffer,
    contentType: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
