import mongoose from "mongoose";

const UserRoles = ['user', 'super admin', 'admin', 'guest'];

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: UserRoles,
    default: 'user',  // Default role is regular user
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetCode: {
    type: String
  },
  resetCodeExpiration: {
    type: Date
  },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
