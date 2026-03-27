const jwt = require('jsonwebtoken');

// 🛡️ Middleware 1: Verify JWT and attach user to request
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scope_secure_jwt_key');

    // Attach user ID and role to the request object
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token is invalid or expired' });
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