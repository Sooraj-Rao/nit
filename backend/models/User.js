const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'responder', 'user'],
    default: 'user'
  },
  place: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
