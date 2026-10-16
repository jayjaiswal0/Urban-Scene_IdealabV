import mongoose from 'mongoose';

const maintenanceTaskSchema = new mongoose.Schema(
  {
    workOrderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncidentReport',
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['PUBLIC_WORKS', 'TRAFFIC_POLICE', 'DRAINAGE', 'ELECTRICAL', 'SOLID_WASTE'],
      default: 'PUBLIC_WORKS',
    },
    assignedSquad: {
      type: String,
      required: true, // e.g. 'MBMC Works Unit B-4'
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_INSPECTION', 'COMPLETED', 'CANCELLED'],
      default: 'ASSIGNED',
      index: true,
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'MEDIUM', 'HIGH', 'EMERGENCY'],
      default: 'MEDIUM',
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    materialsUsed: [
      {
        materialName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true }, // 'kg', 'bags', 'liters', etc.
        loggedAt: { type: Date, default: Date.now },
      },
    ],
    completionNotes: {
      type: String,
      trim: true,
    },
    evidenceBefore: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    evidenceAfter: [
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

export const MaintenanceTask = mongoose.model('MaintenanceTask', maintenanceTaskSchema);
export default MaintenanceTask;
