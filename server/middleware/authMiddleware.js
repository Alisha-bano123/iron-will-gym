const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token check karo — login hai ya nahi
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Sirf owner access kar sake
const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'owner') return next();
  return res.status(403).json({ message: 'Access denied: Owner only' });
};

// Sirf approved member access kar sake
const approvedClientOnly = (req, res, next) => {
  if (req.user && req.user.status === 'approved') return next();
  return res.status(403).json({ message: 'Access denied: Awaiting owner approval' });
};

module.exports = { protect, ownerOnly, approvedClientOnly };