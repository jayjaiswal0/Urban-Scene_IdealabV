import mongoose from 'mongoose';

const emergencyRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    dispatcher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyVehicle',
    },
    originHospital: {
      type: String,
      required: true,
    },
    destinationHospital: {
      type: String,
      required: true,
    },
    corridorRoute: [
      {
        latitude: Number,
        longitude: Number,
      },
    ],
    status: {
      type: String,
      enum: ['REQUESTED', 'ACTIVE', 'COMPLETED', 'TERMINATED'],
      default: 'ACTIVE',
      index: true,
    },
    signalPriorityLevel: {
      type: String,
      enum: ['LEVEL_I', 'LEVEL_II', 'LEVEL_III'],
      default: 'LEVEL_II',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);
export default EmergencyRequest;
