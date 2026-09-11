const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const getJwtSecret = () => process.env.JWT_SECRET || '';

const safeEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string' || !left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

// Middleware: Verify JWT token and attach user to request
const auth = (req, res, next) => {
  // Support both Authorization header (Bearer token) and x-auth-token header
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No authentication token, access denied.' });
  }

  if (!getJwtSecret()) {
    return res.status(503).json({ message: 'Authentication is not configured on the server.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid or has expired.' });
  }
};

// Middleware: Require Admin role (via JWT)
const authAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === 'Admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
  });
};

// Middleware: Require Agent or Admin role
const requireAgent = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && (req.user.role === 'Agent' || req.user.role === 'Admin')) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Agent or Admin role required.' });
    }
  });
};

// Middleware: Accept Admin password (legacy) OR valid Admin JWT — supports both flows
const checkAdmin = (req, res, next) => {
  if (!process.env.ADMIN_PASSWORD || !getJwtSecret()) {
    return res.status(503).json({ message: 'Admin authentication is not configured on the server.' });
  }

  // Compatibility path for the existing admin console. The password is only
  // accepted from the deployment environment; there is no bundled fallback.
  const adminPassword = req.headers['x-admin-password'];
  if (safeEqual(adminPassword, process.env.ADMIN_PASSWORD)) {
    return next();
  }

  // Try JWT token
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      if (decoded.user && decoded.user.role === 'Admin') {
        req.user = decoded.user;
        return next();
      }
    } catch (err) {
      // fall through to error below
    }
  }

  return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
};

module.exports = { auth, authAdmin, requireAgent, checkAdmin };
