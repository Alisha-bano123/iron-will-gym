const express = require('express');
const router  = express.Router();
const Payment = require('../models/Payment');
const User    = require('../models/User');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

router.use(protect, ownerOnly);

// POST /api/payments — record a new physical payment
router.post('/', async (req, res) => {
  try {
    const { userId, amount, plan, paymentMode, note } = req.body;
    if (!userId || !amount) return res.status(400).json({ message: 'userId and amount required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Member not found' });

    const payment = await Payment.create({
      userId,
      memberName:  user.name,
      amount:      Number(amount),
      plan:        plan || user.selectedPlan,
      paymentMode: paymentMode || 'cash',
      note:        note || '',
      recordedBy:  req.user._id,
    });

    // Plan extend karo agar plan field hai
    if (plan) {
      const planDays = { '1_month': 30, '3_month': 90, '6_month': 180 };
      const days     = planDays[plan] || 30;
      const start    = new Date();
      const end      = new Date();
      end.setDate(end.getDate() + days);

      user.selectedPlan  = plan;
      user.planStartDate = start;
      user.planEndDate   = end;
      user.status        = 'approved';
      await user.save();
    }

    res.status(201).json({ message: 'Payment recorded successfully!', payment });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/payments — all payments list
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email phone')
      .sort({ paidAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/payments/member/:userId — payments of one member
router.get('/member/:userId', async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId }).sort({ paidAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/payments/stats — total revenue stats
router.get('/stats', async (req, res) => {
  try {
    const all       = await Payment.find();
    const total     = all.reduce((s, p) => s + p.amount, 0);
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
    const monthly   = all.filter(p => new Date(p.paidAt) >= thisMonth).reduce((s,p) => s + p.amount, 0);
    res.json({ totalRevenue: total, thisMonthRevenue: monthly, totalPayments: all.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/payments/:id — delete a payment record
router.delete('/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;