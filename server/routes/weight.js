const express   = require('express');
const router    = express.Router();
const WeightLog = require('../models/WeightLog');
const { protect, approvedClientOnly } = require('../middleware/authMiddleware');

router.use(protect, approvedClientOnly);

// POST /api/weight — log new weight entry
router.post('/', async (req, res) => {
  try {
    const { weight, note } = req.body;
    if (!weight || isNaN(weight)) return res.status(400).json({ message: 'Valid weight required' });
    const log = await WeightLog.create({ userId: req.user._id, weight: Number(weight), note: note || '' });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/weight — get all weight logs for this user
router.get('/', async (req, res) => {
  try {
    const logs = await WeightLog.find({ userId: req.user._id }).sort({ date: 1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/weight/:id — delete a log entry
router.delete('/:id', async (req, res) => {
  try {
    await WeightLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;