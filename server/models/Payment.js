const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberName:  { type: String },
  amount:      { type: Number, required: true },
  plan:        { type: String, enum: ['1_month', '3_month', '6_month'] },
  paymentMode: { type: String, enum: ['cash', 'upi', 'card', 'other'], default: 'cash' },
  note:        { type: String, trim: true },
  paidAt:      { type: Date, default: Date.now },
  recordedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // owner
});

paymentSchema.index({ userId: 1, paidAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);