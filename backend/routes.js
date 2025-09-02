const express = require('express');
const User = require('./model')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();


// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// ✅ Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).send("All fields required");

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).send("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000);

  const user = new User({ name, email, password: hashed, otp });
  await user.save();

  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    text: `Hi ${name}, your OTP is ${otp}`
  });

  res.send("Signup successful! Check your email for OTP.");
});

// ✅ Verify OTP
app.post("/verify", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  if (user.otp == otp) {
    user.verified = true;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Email verified!", token });
  } else {
    res.status(400).send("Invalid OTP");
  }
});

// ✅ Login (no OTP needed)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send("Invalid password");
  if (!user.verified) return res.status(400).send("Email not verified");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ message: "Login successful", token });
});

// ✅ Protected route example
app.get("/dashboard", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.send(`Welcome user: ${decoded.id}`);
  } catch {
    res.status(401).send("Invalid or expired token");
  }
});

module.exports = router