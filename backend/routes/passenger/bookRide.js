const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyPassenger = require("../middleware/verifyPassenger");
const verifyDriver = require("../middleware/verifyDriver");
const Chat = require("../../models/ChatModel");

// ========================
// Passenger sends ride request
// ========================
router.post("/request", verifyPassenger, async (req, res) => {
  try {
    const { rideId, seatsRequested } = req.body;
    const passengerId = req.user.id;

    if (!rideId) return res.status(400).json({ success: false, message: "rideId is required" });
    const seats = Number(seatsRequested);
    if (!seats || seats <= 0) return res.status(400).json({ success: false, message: "Invalid seats count" });

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    // Push as "pending" request
    ride.passengers.push({
      passengerId,
      seatsBooked: seats,
      farePaid: 0,         // ⚡ fare will be paid later
      status: "pending",   // pending until driver accepts
    });

    await ride.save();

    // ✅ Create chat automatically if not exists
    const driverId = ride.driverId;
    let chat = await Chat.findOne({ driverId, passengerId });
    if (!chat) {
      chat = new Chat({ driverId, passengerId, messages: [] });
      await chat.save();
    }

    res.status(200).json({ success: true, message: "Ride request sent", ride });

  } catch (err) {
    console.error("Error sending ride request:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ========================
// Driver accepts or rejects request
// ========================
router.post("/respond", verifyDriver, async (req, res) => {
  try {
    const { rideId, passengerId, action } = req.body;
    if (!rideId || !passengerId || !action) 
      return res.status(400).json({ success: false, message: "rideId, passengerId and action are required" });

    const ride = await Ride.findById(rideId);
    if (!ride) 
      return res.status(404).json({ success: false, message: "Ride not found" });

    // Find the passenger request that is still pending
    const passengerRequest = ride.passengers.find(
      p => p.passengerId.toString() === passengerId && p.status === "pending"
    );

    if (!passengerRequest) 
      return res.status(404).json({ success: false, message: "Passenger request not found or already responded" });

    const now = new Date();

    if (action === "accept") {
      if (passengerRequest.seatsBooked > ride.availableSeats) {
        return res.status(400).json({ success: false, message: "Not enough seats available to accept" });
      }

      passengerRequest.status = "accepted";
      passengerRequest.farePaid = 0; // Paid later 
      passengerRequest.bookedAt = now; // ✅ set bookedAt timestamp
      ride.availableSeats -= passengerRequest.seatsBooked;
      if (ride.availableSeats <= 0) ride.status = "unavailable";

    } else if (action === "reject") {
      passengerRequest.status = "rejected";
      passengerRequest.rejectedAt = now; // ✅ set rejectedAt timestamp
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await ride.save();
    res.status(200).json({ success: true, message: `Request ${action}ed`, ride });

  } catch (err) {
    console.error("Error responding to request:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});


module.exports = router;
