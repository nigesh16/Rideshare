const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyDriver = require("../middleware/verifyDriver");

router.post("/cancel", verifyDriver, async (req, res) => {
  try {
    const { rideId } = req.body;
    const driverId = req.user.id; // from verifyDriver middleware

    console.log("Driver cancel request:", { rideId, driverId });

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    // Check if this driver owns the ride
    if (ride.driverId.toString() !== driverId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this ride" });
    }

    // If already cancelled or completed
    if (ride.status === "canceled") {
      return res.status(400).json({ success: false, message: "Ride already canceled" });
    }
    if (ride.status === "completed") {
      return res.status(400).json({ success: false, message: "Cannot cancel a completed ride" });
    }

    // Update ride status
    ride.status = "canceled";
    ride.canceledAt = Date.now();
    ride.canceledBy = "driver";

    await ride.save();

    res.status(200).json({
      success: true,
      message: "Ride canceled successfully by driver",
      ride,
    });
  } catch (err) {
    console.error("Error canceling ride by driver:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
