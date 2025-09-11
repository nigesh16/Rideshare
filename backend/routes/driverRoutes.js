const express = require('express');
const router = express.Router();
const User = require('../models/DriverModel'); // User model for driver registration
const Ride = require('../models/Ride'); // Ride model for ride-related data
const Otp = require('../models/d-otpVerification');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Middleware to protect routes by verifying JWT token
const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// @route   POST /driver/check-email
// @desc    Check if a driver email exists and send OTP
// @access  Public
router.post("/check-email", async (req, res) => {
  const { name, email } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.json({ success: false, message: "User already exists" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  try {
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
  } catch (err) {
    console.error("SendMail error:", err);
    return res.json({ success: false, message: "Error sending OTP email:" });
  }
});

// @route   POST /driver/verify-otp
// @desc    Verify OTP and register new driver
// @access  Public
router.post("/verify-otp", async (req, res) => {
  const { name, email, password, dob, gender, license, otp } = req.body;
  if (isNaN(otp))
    return res.json({ success: false, message: "Invalid OTP format" });

  try {
    const _otp = await Otp.findOne({ email, otp: Number(otp) });
    if (_otp) {
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashed, dob, gender, license, role: 'driver' });
      await user.save();
      return res.json({ success: true });
    }
    return res.json({ success: false, message: "Invalid OTP" });
  } catch (err) {
    console.error("Error checking OTP:", err.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   POST /driver/login
// @desc    Authenticate driver & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: "User not found!" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: "Invalid Password!" });

  const payload = {
    user: {
      id: user._id,
      email: user.email,
      role: user.role, // Added role to the token payload
    },
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
  );
  res.json({ success: true, token, userId: user._id });
});

// @route   POST /driver/rides
// @desc    Create a new ride
// @access  Private (Driver only)
router.post('/rides', authMiddleware, async (req, res) => {
  const { pickupLocation, dropLocation, date, time, totalSeats, price } = req.body;
  const driverId = req.user.id;

  try {
    const newRide = new Ride({
      driver: driverId,
      pickupLocation,
      dropLocation,
      date,
      time,
      totalSeats,
      availableSeats: totalSeats,
      price,
    });

    const ride = await newRide.save();
    res.status(201).json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /driver/my-rides
// @desc    Get all rides posted by the authenticated driver
// @access  Private (Driver only)
router.get('/my-rides', authMiddleware, async (req, res) => {
  const driverId = req.user.id;
  try {
    const rides = await Ride.find({ driver: driverId }).sort({ date: 1, time: 1 });
    res.json(rides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;