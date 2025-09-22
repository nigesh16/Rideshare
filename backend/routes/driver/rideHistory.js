const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyDriver = require("../middleware/verifyDriver");

router.get("/ride-history", verifyDriver, async (req, res) => {
  try {
    const driverId = req.user.id;

    const rides = await Ride.find({ driverId, status: "completed" })
      .populate("passengers.passengerId", "name email dob profilePicture")
      .sort({ date: -1 });

    res.status(200).json({ success: true, rides });
  } catch (err) {
    console.error("Error fetching ride history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
