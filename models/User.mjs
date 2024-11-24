import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import {roles} from "../constants/auth.mjs";

// export enum Role
const UserRoles = Object.values(roles);

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
    default: roles.USER,  // Default role is regular user
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
  refreshtoken: [String],
}, { timestamps: true });

UserSchema.methods.generateAuthToken = function () {
  const payload = {
    _id: this._id,
    role: this.role,
    iat: Math.floor(Date.now() / 1000), // Current time in seconds
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // Expire in 1 week
  };

  const secret = process.env.JWT_SECRET;
  const secret2 = process.env.JWT_REFRESH_SECRET;
  const options = {
    // expiresIn: "2h",
    algorithm: 'HS256'
  }
  const accesstoken = jwt.sign(
      payload,
      secret,
      options
  );
  const refreshtoken = jwt.sign(
      payload,
      secret2,
      {
        algorithm: 'HS256',
        // expiresIn: "1d"
      }
  );
  const tokens = {
    token: accesstoken,
    refreshtoken:
        refreshtoken ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzQwY2ZlZjQ2NjA5NjM2MjNkODEzMWQiLCJyb2xlIjoidXNlciIsImlhdCI6MTczMjMwMjQyMSwiZXhwIjoxNzMyOTA3MjIxfQ.fNpULu9tt0kvbei--d7S3DbiqEJNhD0pX5Wg44exZGQ'
  };

  return tokens;
};

export default mongoose.model('User', UserSchema);
