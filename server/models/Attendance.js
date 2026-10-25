const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:    { type: Date, required: true },
  present: { type: Boolean, default: true }
});

// Ek user ek din mein sirf ek baar mark kar sake
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);