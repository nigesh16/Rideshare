const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyPassenger = require("../middleware/verifyPassenger");

router.post("/cancel", verifyPassenger, async (req, res) => {
  try {
    const { rideId, bookingId } = req.body;
    const passengerId = req.user.id;

    console.log("Cancel request received:", { rideId, bookingId, passengerId });

    const ride = await Ride.findById(rideId);
    if (!ride) {
      console.log("Ride not found");
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    if (!ride.passengers || !Array.isArray(ride.passengers)) {
      console.log("No passengers array");
      return res.status(400).json({ success: false, message: "No passengers found for this ride" });
    }

    const passengerBookingIndex = ride.passengers.findIndex(
      (p) =>
        p._id?.toString() === bookingId?.toString() &&
        p.passengerId?.toString() === passengerId.toString()
    );

    if (passengerBookingIndex === -1) {
      console.log("Passenger booking not found");
      return res.status(400).json({ success: false, message: "Booking not found" });
    }

    const passengerBooking = ride.passengers[passengerBookingIndex];

    if (passengerBooking.status === "rejected") {
      console.log("Booking already rejected");
      return res.status(400).json({ success: false, message: "Cannot cancel a rejected booking" });
    }

    if (passengerBooking.status === "pending") {
      // ❌ Remove booking from array
      ride.passengers.splice(passengerBookingIndex, 1);
      console.log("Pending booking removed completely");
    } else if (passengerBooking.status === "accepted") {
      // ✅ Mark as canceled + restore seats
      passengerBooking.status = "canceled";
      passengerBooking.canceledAt = new Date();

      ride.availableSeats = (ride.availableSeats || 0) + (passengerBooking.seatsBooked || 0);
      if (ride.availableSeats > 0) ride.status = "available";

      console.log("Booking marked as canceled & seats updated:", ride.availableSeats);
    }

    console.log("Saving ride...");
    await ride.save();
    console.log("Ride saved successfully");

    res.status(200).json({ success: true, message: "Booking canceled successfully", ride });
  } catch (err) {
    console.error("Error canceling booking:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
