const express = require("express");
const mongoose = require("mongoose");
const Drivers = require('../../models/DriverModel');
const Passengers = require("../../models/passengerModel");
const Rides = require("../../models/RideModel");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* ===================== 🔐 ADMIN LOGIN ===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ success: true, token });
    }

    return res.status(401).json({ success: false, message: "Invalid email or password" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

/* ===================== 👥 FETCH ALL USERS ===================== */
router.get("/users", async (req, res) => {
  try {
    const drivers = await Drivers.find().select("-password").lean();
    const passengers = await Passengers.find().select("-password").lean();

    const formattedDrivers = drivers.map((d) => ({ ...d, type: "Driver" }));
    const formattedPassengers = passengers.map((p) => ({ ...p, type: "Passenger" }));

    res.json({
      success: true,
      drivers: formattedDrivers,
      passengers: formattedPassengers,
      allUsers: [...formattedDrivers, ...formattedPassengers],
    });
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

/* ===================== 🚗 FETCH ALL RIDES ===================== */
router.get("/rides", async (req, res) => {
  try {
    const rides = await Rides.find({ driverId: { $ne: null } })
      .populate("driverId", "name email")
      .populate("passengers.passengerId", "name email")
      .lean();

    res.json({ success: true, rides });
  } catch (err) {
    console.error("Fetch rides error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch rides" });
  }
});

/* ===================== 🕒 FETCH PENDING DRIVERS ===================== */
router.get("/pending-drivers", async (req, res) => {
  try {
    const pendingDrivers = await Drivers.find({ adminverification: false }).select("-password");
    res.json({ success: true, drivers: pendingDrivers });
  } catch (err) {
    console.error("Pending drivers error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch pending drivers" });
  }
});

/* ===================== ✅ VERIFY DRIVER ===================== */
router.put("/verify-driver/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid driver ID" });

    const driver = await Drivers.findByIdAndUpdate(
      id,
      { adminverification: true },
      { new: true }
    ).select("-password");

    if (!driver)
      return res.status(404).json({ success: false, message: "Driver not found" });

    res.json({ success: true, driver });
  } catch (err) {
    console.error("Verify driver error:", err);
    res.status(500).json({ success: false, message: "Failed to verify driver" });
  }
});

module.exports = router;
