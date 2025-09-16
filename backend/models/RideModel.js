const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Drivers", required: true },
  passengers: [
    {
      passengerId: { type: mongoose.Schema.Types.ObjectId, ref: "Passengers", required: true },
      seatsBooked: { type: Number, required: true },
      farePaid: { type: Number } 
    }
  ],
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  status: { type: String, default: "available" },
  distanceKm: { type: Number },
  fare: { type: Number } 
}, { timestamps: true });

module.exports = mongoose.model("Ride", RideSchema);
