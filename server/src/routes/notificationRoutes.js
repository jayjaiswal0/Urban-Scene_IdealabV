import express from 'express';
import { Notification } from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get Notifications for Logged-in User
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        items: notifications,
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Mark All Notifications as Read
router.patch('/mark-all-read', authenticateToken, async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
});

// Mark Single Notification as Read
router.patch('/:id/read', authenticateToken, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Notification not found' },
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
