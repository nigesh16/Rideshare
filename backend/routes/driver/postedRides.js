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
      status: { $in: ["available", "unavailable"] },
    })
      .populate("passengers.passengerId", "name email dob profilePicture") // include passenger info
      .sort({ date: -1 });

    res.status(200).json({ success: true, rides, driverId });
  } catch (err) {
    console.error("Error fetching posted rides:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;