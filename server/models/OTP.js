const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  signupData: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now, expires: 600 }
});

module.exports = mongoose.model('OTP', OTPSchema);
