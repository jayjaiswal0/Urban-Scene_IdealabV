import mongoose from 'mongoose';

const reportStatusHistorySchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncidentReport',
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
      required: true,
    },
    toStatus: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    evidence: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
  },
  {
    timestamps: true,
  }
);

reportStatusHistorySchema.index({ report: 1, createdAt: -1 });

export const ReportStatusHistory = mongoose.model('ReportStatusHistory', reportStatusHistorySchema);
export default ReportStatusHistory;
