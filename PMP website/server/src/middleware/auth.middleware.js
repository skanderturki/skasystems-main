const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-passwordHash');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ message: 'Account deactivated' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const requireVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    return next();
  }
  return res.status(403).json({ message: 'Please verify your email before accessing this resource', requiresVerification: true });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, requireVerified, adminOnly };
