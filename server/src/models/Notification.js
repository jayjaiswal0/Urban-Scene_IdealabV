import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['REPORT_UPDATE', 'TASK_ASSIGNED', 'TRAFFIC_ADVISORY', 'EMERGENCY_ALERT', 'SYSTEM'],
      default: 'REPORT_UPDATE',
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'INFO',
    },
    relatedReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncidentReport',
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
