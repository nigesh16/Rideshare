const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyPassenger = require("../middleware/verifyPassenger");

router.post("/cancel", verifyPassenger, async (req, res) => {
  try {
    const { rideId } = req.body;
    const passengerId = req.user.id;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    // Find the passenger's booking
    const passengerBooking = ride.passengers.find(p => p.passengerId.toString() === passengerId);
    if (!passengerBooking) {
      return res.status(400).json({ success: false, message: "You have not booked this ride" });
    }

    // Increase available seats
    ride.availableSeats += passengerBooking.seatsBooked;

    // Remove passenger from ride
    ride.passengers = ride.passengers.filter(p => p.passengerId.toString() !== passengerId);

    // Update status if seats are available
    if (ride.availableSeats > 0) ride.status = "available";

    await ride.save();

    res.status(200).json({ success: true, message: "Ride canceled successfully", ride });
  } catch (err) {
    console.error("Error canceling ride:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;
