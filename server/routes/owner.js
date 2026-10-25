const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const JoinRequest = require('../models/JoinRequest');
const Attendance  = require('../models/Attendance');
const Feedback    = require('../models/Feedback');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

// Saare owner routes protected hain
router.use(protect, ownerOnly);

// ── GET /api/owner/dashboard ─────────────────────────────────────────────────
// Dashboard ke liye stats: total members, pending requests, expiring plans, today attendance
router.get('/dashboard', async (req, res) => {
  try {
    const totalMembers    = await User.countDocuments({ role: 'client', status: 'approved' });
    const pendingRequests = await JoinRequest.countDocuments({ status: 'pending' });

    const today   = new Date(); today.setHours(0, 0, 0, 0);
    const in10Days = new Date(today); in10Days.setDate(in10Days.getDate() + 10);
    const expiringCount = await User.countDocuments({
      role: 'client', status: 'approved',
      planEndDate: { $gte: today, $lte: in10Days }
    });

    const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lte: todayEnd }
    });

    res.json({ totalMembers, pendingRequests, expiringCount, todayAttendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/owner/members ───────────────────────────────────────────────────
// Saare approved members ki list
router.get('/members', async (req, res) => {
  try {
    const members = await User.find({ role: 'client', status: 'approved' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/owner/pending ───────────────────────────────────────────────────
// Pending join requests ki list
router.get('/pending', async (req, res) => {
  try {
    const requests = await JoinRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/owner/approve/:userId ───────────────────────────────────────────
// Member ko approve karo — plan dates set karo
router.put('/approve/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const planDays = { '1_month': 30, '3_month': 90, '6_month': 180 };
    const startDate = new Date();
    const endDate   = new Date();
    endDate.setDate(endDate.getDate() + (planDays[user.selectedPlan] || 30));

    user.status        = 'approved';
    user.planStartDate = startDate;
    user.planEndDate   = endDate;
    await user.save();

    await JoinRequest.findOneAndUpdate({ userId: user._id }, { status: 'approved' });

    res.json({ message: 'Member approved successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/owner/reject/:userId ────────────────────────────────────────────
// Member ko reject karo
router.put('/reject/:userId', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { status: 'rejected' });
    await JoinRequest.findOneAndUpdate({ userId: req.params.userId }, { status: 'rejected' });
    res.json({ message: 'Member rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/owner/expiring ──────────────────────────────────────────────────
// Jinke plans 10 din mein expire hone wale hain
router.get('/expiring', async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const in10Days = new Date(today); in10Days.setDate(in10Days.getDate() + 10);
    const members  = await User.find({
      role: 'client', status: 'approved',
      planEndDate: { $gte: today, $lte: in10Days }
    }).select('-password').sort({ planEndDate: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/owner/attendance ────────────────────────────────────────────────
// Saare members ki attendance
router.get('/attendance', async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('userId', 'name email')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/owner/attendance/:userId ────────────────────────────────────────
// Ek specific member ki attendance
router.get('/attendance/:userId', async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.params.userId }).sort({ date: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/owner/feedbacks ─────────────────────────────────────────────────
// Pending feedbacks jo approve nahi hue abhi tak
router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ isApproved: false }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/owner/feedback/approve/:id ─────────────────────────────────────
// Feedback ko approve karo — home page pe dikhega
router.put('/feedback/approve/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ message: 'Feedback approved and published' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/owner/feedback/:id ──────────────────────────────────────────
// Feedback delete karo
router.delete('/feedback/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ── POST /api/owner/attendance/mark ──────────────────────────────────────────
// Owner manually kisi bhi member ki attendance mark kare
router.post('/attendance/mark', async (req, res) => {
  try {
    const { userId, date } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const markDate = date ? new Date(date) : new Date();
    markDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ userId, date: markDate });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this date.' });
    }

    const attendance = await Attendance.create({ userId, date: markDate, present: true });
    res.status(201).json({ message: 'Attendance marked successfully!', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/owner/attendance/mark ──────────────────────────────────────────
// Owner manually kisi bhi member ki attendance mark kare
router.post('/attendance/mark', async (req, res) => {
  try {
    const { userId, date } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const markDate = date ? new Date(date) : new Date();
    markDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ userId, date: markDate });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this date.' });
    }

    const attendance = await Attendance.create({ userId, date: markDate, present: true });
    res.status(201).json({ message: 'Attendance marked successfully!', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/owner/attendance/unmark ──────────────────────────────────────
// Owner attendance unmark kare (galti se mark ho gayi thi)
router.delete('/attendance/unmark', async (req, res) => {
  try {
    const { userId, date } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const markDate = date ? new Date(date) : new Date();
    markDate.setHours(0, 0, 0, 0);

    await Attendance.findOneAndDelete({ userId, date: markDate });
    res.json({ message: 'Attendance removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/owner/member/update/:userId ──────────────────────────────────────
// Owner kisi bhi member ka profile update kare (fitnessLevel, weight, goal etc)
router.put('/member/update/:userId', async (req, res) => {
  try {
    const { gender, goal, fitnessLevel, weight, age, selectedPlan } = req.body;
    const updateFields = {};
    if (gender)       updateFields.gender       = gender;
    if (goal)         updateFields.goal         = goal;
    if (fitnessLevel) updateFields.fitnessLevel = fitnessLevel;
    if (weight)       updateFields.weight       = Number(weight);
    if (age)          updateFields.age          = Number(age);
    if (selectedPlan) updateFields.selectedPlan = selectedPlan;

    const user = await User.findByIdAndUpdate(req.params.userId, updateFields, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;