const express = require('express');
const Otp = require('../../models/D-otpVerification');
const User = require('../../models/DriverModel');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email check & send OTP
router.post("/check-email", async (req, res) => {
  const { name, email } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser)
    return res.json({ success: false, message: "User already exists" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_USER, // Must be a verified sender in SendGrid
      subject: "OTP Verification",
      text: `Hi ${name}, your RideShare OTP is ${otp}. Do not share this code with anyone for your account’s safety.`,
    };

    await sgMail.send(msg);

    await Otp.deleteMany({ email });
    await new Otp({ email, otp }).save();

    return res.json({ success: true });
  } catch (err) {
    console.error("SendMail error:", err);      // full error object
    console.error("Error message:", err.message); // just the message
    console.error("Error stack:", err.stack);
    return res.json({ success: false, message: "Server busy - sending OTP email" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { name, email, password, dob, gender,license, otp } = req.body;

  try {
    const _otp = await Otp.findOne({ email, otp: Number(otp) });
    if (_otp) {
      const bcrypt = require("bcryptjs");
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashed, dob, gender,license});
      await user.save();
      return res.json({ success: true });
    }
    return res.json({ success: false });
  } catch (err) {
    console.error("Error checking OTP:", err.message);
    return res.status(500).json({ success: false });
  }
});
//verify token
router.get("/user-info", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name");
    if (!user) return res.sendStatus(404);
    
    res.json({ userId: decoded.id, name: user.name });
  } catch (err) {
    res.sendStatus(403);
  }
});

module.exports = router;
