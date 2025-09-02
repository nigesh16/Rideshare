const mongoose = require('mongoose')

// User schema
const User = mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 }, 
  otp: Number,
  verified: { type: Boolean, default: false }
}));

module.exports = mongoose.model('Users',User)