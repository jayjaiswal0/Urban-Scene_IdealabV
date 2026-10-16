import express from 'express';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// Update current user profile
router.patch('/me', authenticateToken, async (req, res, next) => {
  try {
    const { phone, ward, preferences, language } = req.body;
    const user = await User.findById(req.user._id);

    if (phone) user.phone = phone;
    if (ward) user.ward = Number(ward);
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }
    if (language) {
      user.preferences.language = language;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// Upload profile avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No image file uploaded' },
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatarUrl },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
