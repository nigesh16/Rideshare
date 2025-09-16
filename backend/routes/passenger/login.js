const express = require('express');
const User = require('../../models/PassengerModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, message: "Successfully login!", token});
});

module.exports = router;
