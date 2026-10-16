import mongoose from 'mongoose';

const trafficObservationSchema = new mongoose.Schema(
  {
    corridorName: {
      type: String,
      required: true,
      index: true,
    },
    corridorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    speedIndexKmH: {
      type: Number,
      required: true,
    },
    baselineSpeedKmH: {
      type: Number,
      required: true,
      default: 45,
    },
    congestionLevel: {
      type: String,
      enum: ['FREE_FLOW', 'MODERATE', 'HEAVY', 'STANDSTILL'],
      required: true,
      default: 'MODERATE',
    },
    isSimulated: {
      type: Boolean,
      default: true,
    },
    activeAdvisory: {
      title: String,
      description: String,
      detourRoute: [
        {
          latitude: Number,
          longitude: Number,
        },
      ],
      issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      issuedAt: Date,
      expiresAt: Date,
    },
    relatedReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncidentReport',
      },
    ],
    cctvStreamUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const TrafficObservation = mongoose.model('TrafficObservation', trafficObservationSchema);
export default TrafficObservation;
