const mongoose = require('mongoose')

// User schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 5 min expiry
});

module.exports = mongoose.model("P-Otp",otpSchema)