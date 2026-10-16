import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. 'USER_ROLE_UPDATED', 'REPORT_STATUS_CHANGED'
      index: true,
    },
    targetEntity: {
      type: String,
      required: true, // e.g. 'IncidentReport', 'User', 'MaintenanceTask'
    },
    targetId: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: null,
    },
    changes: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
