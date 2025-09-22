const express = require("express");
const Ride = require("../../models/RideModel");
const router = express.Router();

// ✅ Get all available rides (with full data)
router.get("/available", async (req, res) => {
  try {
    // Update expired rides before fetching
    await Ride.updateExpiredRides();

    // Fetch rides where status = available
    const rides = await Ride.find({ status: "available" })
      .populate("driverId") // get full driver details (name, age, gender, profilePic, etc.)
      .populate("passengers.passengerId") // also expand passenger details if needed
      .lean();

    res.status(200).json({
      success: true,
      rides, // ✅ all fields from RideSchema + driver details
    });
  } catch (err) {
    console.error("Error fetching rides:", err);
    res.status(500).json({ success: false, message: "Failed to fetch rides" });
  }
});

module.exports = router;
