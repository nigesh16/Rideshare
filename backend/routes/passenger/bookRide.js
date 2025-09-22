const express = require("express");
const router = express.Router();
const Ride = require("../../models/RideModel");
const verifyPassenger = require("../middleware/verifyPassenger");
const Chat = require("../../models/ChatModel"); // import Chat model

// Passenger books a ride
router.post("/book", verifyPassenger, async (req, res) => {
  try {
    const { rideId, seatsBooked } = req.body;
    const passengerId = req.user.id;

    if (!rideId) {
      return res.status(400).json({ success: false, message: "rideId is required" });
    }

    const seatsToBook = Number(seatsBooked);
    if (!seatsToBook || seatsToBook <= 0) {
      return res.status(400).json({ success: false, message: "Invalid seats count" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    if (seatsToBook > ride.availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Not enough seats available. Only ${ride.availableSeats} left.`,
      });
    }

    // calculate fare
    const farePaid = ride.fare * seatsToBook;

    // **updated: check existing passenger**
    const existingPassenger = ride.passengers.find(p => p.passengerId.toString() === passengerId);

    if (existingPassenger) {
      existingPassenger.seatsBooked += seatsToBook;
      existingPassenger.farePaid += farePaid;
    } else {
      ride.passengers.push({
        passengerId,
        seatsBooked: seatsToBook,
        farePaid,
      });
    }

    // update available seats
    ride.availableSeats -= seatsToBook;

    // if no seats left → mark unavailable
    if (ride.availableSeats <= 0) ride.status = "unavailable";

    try {
      await ride.save();

      // ✅ Create chat automatically if not exists
      const driverId = ride.driverId;
      let chat = await Chat.findOne({ driverId, passengerId });
      if (!chat) {
        chat = new Chat({ driverId, passengerId, messages: [] });
        await chat.save();
      }

    } catch (saveErr) {
      console.error("rides.save() error:", saveErr);
      return res.status(500).json({ success: false, message: "Ride save failed", error: saveErr.message });
    }

    res.status(200).json({
      success: true,
      message: "Ride booked successfully",
      ride,
    });
  } catch (err) {
    console.error("Error booking ride:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const Ride = require("../../models/RideModel");
// const verifyPassenger = require("../middleware/verifyPassenger");

// // Passenger books a ride
// router.post("/book", verifyPassenger, async (req, res) => {
//   try {
//     const { rideId, seatsBooked } = req.body;
//     const passengerId = req.user.id;

//     if (!rideId) {
//       return res.status(400).json({ success: false, message: "rideId is required" });
//     }

//     const seatsToBook = Number(seatsBooked);
//     if (!seatsToBook || seatsToBook <= 0) {
//       return res.status(400).json({ success: false, message: "Invalid seats count" });
//     }

//     const ride = await Ride.findById(rideId);
//     if (!ride) {
//       return res.status(404).json({ success: false, message: "Ride not found" });
//     }

//     if (seatsToBook > ride.availableSeats) {
//       return res.status(400).json({
//         success: false,
//         message: `Not enough seats available. Only ${ride.availableSeats} left.`,
//       });
//     }

//     // calculate fare
//     const farePaid = ride.fare * seatsToBook;

//     // **updated: check existing passenger**
//     const existingPassenger = ride.passengers.find(p => p.passengerId.toString() === passengerId);

//     if (existingPassenger) {
//       existingPassenger.seatsBooked += seatsToBook;
//       existingPassenger.farePaid += farePaid;
//     } else {
//       ride.passengers.push({
//         passengerId,
//         seatsBooked: seatsToBook,
//         farePaid,
//       });
//     }

//     // update available seats
//     ride.availableSeats -= seatsToBook;

//     // if no seats left → mark unavailable
//     if (ride.availableSeats <= 0) ride.status = "unavailable";

//     try {
//       await ride.save();
//     } catch (saveErr) {
//       console.error("rides.save() error:", saveErr);
//       return res.status(500).json({ success: false, message: "Ride save failed", error: saveErr.message });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Ride booked successfully",
//       ride,
//     });
//   } catch (err) {
//     console.error("Error booking ride:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// });


// module.exports = router;
