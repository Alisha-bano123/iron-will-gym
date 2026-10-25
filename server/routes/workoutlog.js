const express    = require('express');
const router     = express.Router();
const WorkoutLog = require('../models/WorkoutLog');
const { protect, approvedClientOnly } = require('../middleware/authMiddleware');

router.use(protect, approvedClientOnly);

// POST /api/workoutlog — save a workout session
router.post('/', async (req, res) => {
  try {
    const { dayName, focus, exercises, notes, feeling } = req.body;

    // Check for PRs — compare with previous logs
    const previousLogs = await WorkoutLog.find({ userId: req.user._id });
    const prMap = {};
    previousLogs.forEach(log => {
      log.exercises.forEach(ex => {
        if (!prMap[ex.name] || ex.weight > prMap[ex.name]) {
          prMap[ex.name] = ex.weight || 0;
        }
      });
    });

    // Mark PRs
    const processedExercises = (exercises || []).map(ex => ({
      ...ex,
      isPR: ex.weight && prMap[ex.name] !== undefined && ex.weight > prMap[ex.name],
    }));

    const log = await WorkoutLog.create({
      userId: req.user._id,
      dayName, focus,
      exercises: processedExercises,
      notes, feeling,
    });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/workoutlog — get all workout logs
router.get('/', async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user._id }).sort({ date: -1 }).limit(30);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/workoutlog/prs — get personal records
router.get('/prs', async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user._id });
    const prMap = {};
    logs.forEach(log => {
      log.exercises.forEach(ex => {
        if (ex.weight && (!prMap[ex.name] || ex.weight > prMap[ex.name].weight)) {
          prMap[ex.name] = { weight: ex.weight, date: log.date };
        }
      });
    });
    res.json(prMap);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;