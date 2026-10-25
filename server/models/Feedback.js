const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:       String,
  rating:     { type: Number, min: 1, max: 5 },
  comment:    String,
  isApproved: { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);