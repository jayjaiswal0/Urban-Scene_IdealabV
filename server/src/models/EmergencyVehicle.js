import mongoose from 'mongoose';

const emergencyVehicleSchema = new mongoose.Schema(
  {
    vehicleCallSign: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: ['AMBULANCE', 'FIRE_TENDER', 'DISASTER_RESCUE'],
      required: true,
      default: 'AMBULANCE',
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['IDLE', 'EN_ROUTE', 'ON_SCENE', 'TRANSPORTING'],
      default: 'IDLE',
    },
    assignedCorridor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emergencyVehicleSchema.index({ currentLocation: '2dsphere' });

export const EmergencyVehicle = mongoose.model('EmergencyVehicle', emergencyVehicleSchema);
export default EmergencyVehicle;
