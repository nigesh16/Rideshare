const mongoose = require('mongoose')

// Admin schema
const User = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  }
});

module.exports = mongoose.model('Admins', User)