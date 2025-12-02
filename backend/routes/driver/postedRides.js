const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyDriver = require("../middleware/verifyDriver"); 

//Get all rides posted by a driver (status: available/unavailable)
router.get("/posted-rides", verifyDriver, async (req, res) => {
  try {
    const driverId = req.user.id;

    // Only fetch rides with status "available" or "unavailable"
    const rides = await Ride.find({
      driverId,
      status: { $in: ["available", "canceled"] },
    })
      .populate("passengers.passengerId", "name email dob profilePicture") // include passenger info
      .sort({ date: -1 });

    res.status(200).json({ success: true, rides, driverId });
  } catch (err) {
    console.error("Error fetching posted rides:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// ✅ Get a single ride by ID (for PostedRide.jsx fetch)
router.get("/posted-ride/:id", verifyDriver, async (req, res) => {
  try {
    const rideId = req.params.id;

    if (!rideId) 
      return res.status(400).json({ success: false, message: "Ride ID is required" });

    const ride = await Ride.findById(rideId)
      .populate("passengers.passengerId", "name email dob profilePicture"); // get passenger info

    if (!ride) 
      return res.status(404).json({ success: false, message: "Ride not found" });

    res.status(200).json({ success: true, ride });
  } catch (err) {
    console.error("Error fetching ride by ID:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});



module.exports = router;
