const express       = require('express');
const router        = express.Router();
const Announcement  = require('../models/Announcement');
const { protect, ownerOnly, approvedClientOnly } = require('../middleware/authMiddleware');

// ── OWNER: Create announcement ─────────────────────────────────────────────
router.post('/', protect, ownerOnly, async (req, res) => {
  try {
    const { title, message, important, expiresAt } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message required' });
    const ann = await Announcement.create({
      title, message,
      important: important || false,
      expiresAt: expiresAt || null,
      createdBy: req.user._id,
    });
    res.status(201).json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── OWNER: Get all announcements ───────────────────────────────────────────
router.get('/all', protect, ownerOnly, async (req, res) => {
  try {
    const anns = await Announcement.find().sort({ createdAt: -1 });
    res.json(anns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── OWNER: Delete announcement ─────────────────────────────────────────────
router.delete('/:id', protect, ownerOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── CLIENT + OWNER: Get active announcements ───────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const now  = new Date();
    const anns = await Announcement.find({
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    }).sort({ important: -1, createdAt: -1 }).limit(10);
    res.json(anns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;