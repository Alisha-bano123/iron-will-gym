const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
dotenv.config();

const authRoutes         = require('./routes/auth');
const ownerRoutes        = require('./routes/owner');
const clientRoutes       = require('./routes/client');
const announcementRoutes = require('./routes/announcements');
const paymentRoutes      = require('./routes/payments');
const weightRoutes       = require('./routes/weight');
const workoutLogRoutes   = require('./routes/workoutlog');
const Feedback           = require('./models/Feedback');
const Attendance         = require('./models/Attendance');
const User               = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });

app.use('/api/auth',          authRoutes);
app.use('/api/owner',         ownerRoutes);
app.use('/api/client',        clientRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/weight',        weightRoutes);
app.use('/api/workoutlog',    workoutLogRoutes);

app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ isApproved: true }).sort({ createdAt: -1 }).limit(10);
    res.json(feedbacks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const records = await Attendance.aggregate([
      { $match: { date: { $gte: monthStart, $lte: monthEnd }, present: true } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { count: 1, name: '$user.name', _id: 1 } },
    ]);
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/', (req, res) => res.json({ message: 'Iron Will Gym API running!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server on http://localhost:' + PORT));