const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:         String,
  email:        String,
  phone:        String,
  gender:       String,
  age:          Number,
  goal:         String,
  selectedPlan: String,
  message:      String,
  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('JoinRequest', joinRequestSchema);