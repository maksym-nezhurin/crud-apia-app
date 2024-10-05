const mongoose = require('mongoose');

const UserRoles = ['user', 'super admin'];

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
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
