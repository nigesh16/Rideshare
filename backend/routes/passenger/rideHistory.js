const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyPassenger = require("../middleware/verifyPassenger");


router.post("/rides/:rideId/review/:passengerId",verifyPassenger, async (req, res) => {
  const { rideId, passengerId } = req.params;
  const { rating, review } = req.body;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    const passengerEntry = ride.passengers.find(p => p.passengerId.toString() === passengerId);
    if (!passengerEntry) return res.status(404).json({ success: false, message: "Passenger not found in this ride" });

    passengerEntry.rating = rating;
    passengerEntry.review = review; 

    await ride.save();

    res.json({ success: true, message: "Review submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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
