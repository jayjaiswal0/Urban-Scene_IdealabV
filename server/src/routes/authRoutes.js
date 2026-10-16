import express from 'express';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Register a new citizen
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, phone, ward, password, confirmPassword, agreeTerms, urgentAlerts } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name, email, phone, and password are required' },
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' },
      });
    }

    if (!agreeTerms) {
      return res.status(400).json({
        success: false,
        error: { code: 'TERMS_REQUIRED', message: 'You must agree to the Terms of Service' },
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' },
      });
    }

    // Force public registrants to CITIZEN role
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      ward: Number(ward) || 14,
      password,
      role: 'CITIZEN',
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          sms: true,
          whatsapp: Boolean(urgentAlerts),
          email: true,
          inApp: true,
        },
      },
    });

    const token = generateToken(newUser);

    // Write audit log
    await AuditLog.create({
      actor: newUser._id,
      actorRole: 'CITIZEN',
      action: 'USER_REGISTERED',
      targetEntity: 'User',
      targetId: newUser._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully',
      data: {
        token,
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          ward: newUser.ward,
          phone: newUser.phone,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required' },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials or account deactivated' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    // Audit log
    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      targetEntity: 'User',
      targetId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          ward: user.ward,
          employeeId: user.employeeId,
          department: user.department,
          avatarUrl: user.avatarUrl,
          trustScore: user.trustScore,
          badges: user.badges,
          preferences: user.preferences,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Verify OTP (Development simulation)
router.post('/verify-otp', async (req, res) => {
  const { otp, email } = req.body;
  if (!otp || otp.length !== 6) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_OTP', message: 'Please provide a valid 6-digit OTP' },
    });
  }
  // In development, accept valid 6-digit string
  res.json({
    success: true,
    message: 'Mobile OTP verified successfully',
  });
});

// Forgot Password (simulation with real token persistence)
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMAIL_REQUIRED', message: 'Email address is required' },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Security: return success anyway to prevent user enumeration
      return res.json({
        success: true,
        message: 'If the account exists, password reset instructions have been dispatched',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    res.json({
      success: true,
      message: 'Password reset link generated (Development simulation)',
      simulationToken: resetToken,
      simulationUrl: `/forgot-password?token=${resetToken}`,
    });
  } catch (err) {
    next(err);
  }
});

// Reset Password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Token and new password are required' },
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Password reset token is invalid or has expired' },
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login.',
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
