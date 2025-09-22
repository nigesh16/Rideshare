const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyPassenger = require("../middleware/verifyPassenger");


router.get("/ride-history", verifyPassenger, async (req, res) => {
  try {
    const passengerId = req.user.id;

    const rides = await Ride.find({
      "passengers.passengerId": passengerId,
      status: "completed"
    })
    .populate("driverId", "name dob gender license profilePicture")
    .sort({ date: -1 });

    res.status(200).json({ success: true, rides });
  } catch (err) {
    console.error("Error fetching ride history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
