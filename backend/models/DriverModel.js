const mongoose = require('mongoose')

// User schema
const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  dob: { type: String, required: true},
  gender: { type: String, required: true},
  license: { type: String, required: true},
  adminverification: {type: Boolean , default:false},
  profilePicture: {
    data: Buffer,
    contentType: String
  },
  rides: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Ride" }
  ]
});

module.exports = mongoose.model('Drivers',User)