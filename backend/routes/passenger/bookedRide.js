// passengerRoutes/bookedRides.js
const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyPassenger = require("../middleware/verifyPassenger");

// routes/bookRide.js (or wherever you keep passenger APIs)
router.get("/bookedrides", verifyPassenger, async (req, res) => {
  try {
    const passengerId = req.user.id;

    // Find all rides where this passenger has booked seats and ride is not completed
    const rides = await Ride.find({
      "passengers.passengerId": passengerId,
      status: { $ne: "completed" } // not completed
    }).populate("driverId", "name dob gender license profilePicture"); // populate driver info

    res.status(200).json({ success: true, rides });
  } catch (err) {
    console.error("Error fetching booked rides:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
