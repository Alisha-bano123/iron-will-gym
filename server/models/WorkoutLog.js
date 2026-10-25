const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:       { type: Date, default: Date.now },
  dayName:    { type: String },   // e.g. "Monday"
  focus:      { type: String },   // e.g. "Push - Chest + Shoulders"
  exercises: [{
    name:       String,
    targetSets: String,
    targetReps: String,
    actualSets: Number,
    actualReps: Number,
    weight:     Number,   // kg
    completed:  { type: Boolean, default: false },
    isPR:       { type: Boolean, default: false },  // personal record
  }],
  notes:      { type: String },
  feeling:    { type: String, enum: ['great', 'good', 'okay', 'bad'], default: 'good' },
});

workoutLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);