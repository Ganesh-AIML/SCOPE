const jwt = require('jsonwebtoken');
const prisma = require('../config/db'); // Added DB import for live lookup

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Removed fallback string

    // 🛡️ CRITICAL FIX: Live Database Check
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, status: true } // Only fetch what we need
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: `Account is ${user.status.toLowerCase()}. Contact Admin.` });
    }

    req.user = user; 
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};

// 🛡️ Middleware 2: Restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role (${req.user.role}) is not authorized to access this resource`
      });
    }
    next();
  };
};