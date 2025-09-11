const express = require('express');
const User = require('../models/passengerModel')
const Otp = require('../models/P-otpVerification')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

//Email check & sent otp
router.post("/check-email", async (req, res) => {
  const {name, email } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.json({ success: false ,message: "User already exists"});
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  try{
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP Verification",
        text: `Hi ${name}, your OTP is ${otp}`
      });
      // Remove old OTP if exists
      await Otp.deleteMany({ email });

      // Save new OTP
      const newOtp = new Otp({ email, otp });
      await newOtp.save();
      return res.json({ success: true });
    }
    catch(err){
      console.error("SendMail error:", err);
      return res.json({ success: false ,message: "Server busy - sending OTP email"});
    }
});

//verify OTP
router.post("/verify-otp", async (req, res) => {
  const {name,email,password,dob,gender,otp} = req.body;
  if (isNaN(otp))
    return res.json({ success: false, message: "Invalid OTP format" });

  try{
      const _otp = await Otp.findOne({ email, otp: Number(otp)});
      if(_otp){
          const hashed = await bcrypt.hash(password, 10);
          const user = new User({ name, email, password: hashed,dob,gender});
          await user.save();
          return res.json({ success: true});
      }
      return res.json({ success: false });
  }catch(err){
    console.error("Error checking OTP:", err.message);
    return res.status(500).json({ success: false});
  }
})

// ✅ Login with JWT (updated)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ success: false, message: "Invalid password" });
  }
  
  // --- START: Added JWT Generation ---
  const token = jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET || 'your_jwt_secret', 
    { expiresIn: '1h' }
  );
  
  // Send the token and user ID back to the front end
  res.json({ success: true, token, userId: user._id });
  // --- END: Added JWT Generation ---
});

module.exports = router