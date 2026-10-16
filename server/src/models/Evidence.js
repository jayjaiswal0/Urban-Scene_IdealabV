import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncidentReport',
      index: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceTask',
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    evidenceType: {
      type: String,
      enum: ['CITIZEN_PHOTO', 'OFFICER_INSPECTION', 'COMPLETION_VERIFICATION', 'DOCUMENT'],
      default: 'CITIZEN_PHOTO',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    geotag: {
      latitude: Number,
      longitude: Number,
      capturedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

export const Evidence = mongoose.model('Evidence', evidenceSchema);
export default Evidence;
