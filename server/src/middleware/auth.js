import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'umcp_jwt_super_secure_secret_key_2026_mumbai_metro';

export const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.umcp_token) {
      token = req.cookies.umcp_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required',
        },
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User session has expired or account is deactivated',
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
      },
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (e) {
    // Pass without attaching req.user
  }
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Endpoint requires one of: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`,
          currentRole: req.user.role,
          requiredRoles: allowedRoles,
        },
      });
    }

    next();
  };
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      ward: user.ward,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
