const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyDriver = require("../middleware/verifyDriver"); // middleware to get driverId

// POST /d/post-ride
router.post("/post-ride", verifyDriver, async (req, res) => {
  try {
    const { from, to, date, time, totalSeats, fare, distanceKm, carModel, carNumber } = req.body;

    // Check required fields
    if (!from || !to || !date || !time || !totalSeats || !fare || !carModel || !carNumber) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const ride = new Ride({
      driverId: req.user.id, // from verifyDriver middleware
      from,
      to,
      date: new Date(date),
      time,
      carModel,
      carNumber,
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats), // initially all seats available
      fare: Number(fare),
      distanceKm: Number(distanceKm),
      status: "available",
    });

    await ride.save();

    res.status(201).json({
      success: true,
      message: "Ride posted successfully",
      ride,
    });
  } catch (err) {
    console.error("Error posting ride:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
