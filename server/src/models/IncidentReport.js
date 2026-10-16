import mongoose from 'mongoose';

const incidentReportSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['POTHOLE', 'TRAFFIC_SIGNAL', 'GARBAGE', 'WATERLOGGING', 'STREETLIGHT', 'ROAD_HAZARD', 'OTHER'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    severity: {
      type: String,
      enum: ['LOW', 'NORMAL', 'URGENT'],
      default: 'NORMAL',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'REJECTED',
        'REQUESTED_INFORMATION',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    ward: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
      index: true,
    },
    evidence: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    assignedDepartment: {
      type: String,
      enum: ['PUBLIC_WORKS', 'TRAFFIC_POLICE', 'DRAINAGE', 'ELECTRICAL', 'SOLID_WASTE', 'UNASSIGNED'],
      default: 'UNASSIGNED',
    },
    activeTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceTask',
      default: null,
    },
    citizenFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      submittedAt: Date,
    },
    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

incidentReportSchema.index({ location: '2dsphere' });
incidentReportSchema.index({ status: 1, ward: 1, severity: 1 });
incidentReportSchema.index({ reporter: 1, createdAt: -1 });

export const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);
export default IncidentReport;
