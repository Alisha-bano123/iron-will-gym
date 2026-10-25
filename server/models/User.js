const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true },
  phone:         { type: String, trim: true },
  age:           { type: Number },
  weight:        { type: Number },
  gender:        { type: String, enum: ['male', 'female'] },
  goal:          { type: String, enum: ['weight_gain', 'weight_loss'] },
  fitnessLevel:  { type: String, enum: ['beginner', 'average', 'expert'] },
  selectedPlan:  { type: String, enum: ['1_month', '3_month', '6_month'] },
  role:          { type: String, enum: ['client', 'owner'], default: 'client' },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  planStartDate: { type: Date },
  planEndDate:   { type: Date },
  progressNotes: [{ text: String, date: { type: Date, default: Date.now } }],
  createdAt:     { type: Date, default: Date.now }
});

// ── FIX: Mongoose 7+ mein async pre-save hook mein next() call mat karo
// Sirf promise return karo — mongoose khud handle karega
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;            // sirf return, next() nahi
  this.password = await bcrypt.hash(this.password, 10);
  // kuch return karne ki zaroorat nahi — mongoose promise resolve hone ka wait karega
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);