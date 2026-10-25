const express     = require('express');
const router      = express.Router();
const jwt         = require('jsonwebtoken');
const User        = require('../models/User');
const JoinRequest = require('../models/JoinRequest');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Saare important user fields return karo — fitnessLevel bhi include hai
const userPayload = (user) => ({
  _id:           user._id,
  name:          user.name,
  email:         user.email,
  phone:         user.phone,
  age:           user.age,
  weight:        user.weight,
  gender:        user.gender,
  goal:          user.goal,
  fitnessLevel:  user.fitnessLevel,
  selectedPlan:  user.selectedPlan,
  role:          user.role,
  status:        user.status,
  planStartDate: user.planStartDate,
  planEndDate:   user.planEndDate,
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, phone, age, weight,
      gender, goal, fitnessLevel, selectedPlan, message
    } = req.body;

    // Basic validation
    if (!name || !email || !phone || !gender || !goal || !fitnessLevel || !selectedPlan) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Duplicate email check
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please login instead.' });
    }

    // User object banao
    // Password = phone number (plain string) — pre-save hook hash karega
    const userData = {
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      password:     String(phone).trim(),   // plain — mongoose hook hash karega
      phone:        String(phone).trim(),
      gender,
      goal,
      fitnessLevel,
      selectedPlan,
      role:   'client',
      status: 'pending',
    };

    // Optional numeric fields — parse karo sirf agar valid number hain
    if (age   && !isNaN(Number(age)))    userData.age    = Number(age);
    if (weight && !isNaN(Number(weight))) userData.weight = Number(weight);

    // new User() + save() use karo taaki pre-save hook properly chale
    const user = new User(userData);
    await user.save();   // yahan hook chalega aur password hash hoga

    // Join request owner ke liye
    await JoinRequest.create({
      userId:       user._id,
      name:         userData.name,
      email:        userData.email,
      phone:        userData.phone,
      age:          userData.age,
      gender:       userData.gender,
      goal:         userData.goal,
      fitnessLevel: userData.fitnessLevel,
      selectedPlan: userData.selectedPlan,
      message:      message ? message.trim() : '',
      status:       'pending',
    });

    return res.status(201).json({
      message: 'Join request sent successfully! Login with your email & phone number as password. Access will be granted after owner approval.'
    });

  } catch (err) {
    console.error('Register error:', err.message);
    // Mongoose duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(String(password).trim());
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: userPayload(user),
    });

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;