import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['CITIZEN', 'MUNICIPAL_AUTHORITY', 'TRAFFIC_AUTHORITY', 'EMERGENCY_SERVICE', 'ADMIN'],
      default: 'CITIZEN',
      index: true,
    },
    ward: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
      default: 14,
    },
    employeeId: {
      type: String,
      trim: true,
      sparse: true,
    },
    department: {
      type: String,
      enum: ['PUBLIC_WORKS', 'TRAFFIC_POLICE', 'DRAINAGE', 'ELECTRICAL', 'SOLID_WASTE', 'EMERGENCY_OPS', 'NONE'],
      default: 'NONE',
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    trustScore: {
      type: Number,
      min: 0,
      max: 1000,
      default: 750,
    },
    badges: {
      type: [String],
      default: ['Civic Champion', 'Verified Resident'],
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      language: {
        type: String,
        enum: ['en', 'mr', 'hi'],
        default: 'en',
      },
      notifications: {
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false },
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, ward: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
