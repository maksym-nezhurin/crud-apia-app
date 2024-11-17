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
  const accesstoken = jwt.sign(
      { _id: this._id, role: this.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
  );
  const refreshtoken = jwt.sign(
      { _id: this._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
  );

  const tokens = { accesstoken: accesstoken, refreshtoken: refreshtoken };
  return tokens;
};

export default mongoose.model('User', UserSchema);
