import mongoose from 'mongoose';

const parkingFacilitySchema = new mongoose.Schema(
  {
    facilityName: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
    },
    facilityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ward: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
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
    totalBays: {
      type: Number,
      required: true,
      min: 1,
    },
    occupiedBays: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    evChargingBays: {
      type: Number,
      default: 0,
    },
    hasFastTag: {
      type: Boolean,
      default: true,
    },
    tariffs: {
      hourlyRate: { type: Number, required: true, default: 40 },
      dailyRate: { type: Number, required: true, default: 250 },
      twoWheelerHourlyRate: { type: Number, required: true, default: 15 },
    },
    isSensorHubConnected: {
      type: Boolean,
      default: true,
    },
    lastSensorHeartbeat: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

parkingFacilitySchema.index({ location: '2dsphere' });
parkingFacilitySchema.virtual('vacantBays').get(function () {
  return Math.max(0, this.totalBays - this.occupiedBays);
});

parkingFacilitySchema.set('toJSON', { virtuals: true });
parkingFacilitySchema.set('toObject', { virtuals: true });

export const ParkingFacility = mongoose.model('ParkingFacility', parkingFacilitySchema);
export default ParkingFacility;
