const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: String,
  username: String,
  name: String,
  email: { type: String, unique: true, sparse: true },
  password: String,
  profileImage: String,
  authType: { type: String, enum: ['google', 'manual'], default: 'manual' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
