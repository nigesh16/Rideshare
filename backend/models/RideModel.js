const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Drivers", required: true },
  passengers: [
    {
      passengerId: { type: mongoose.Schema.Types.ObjectId, ref: "Passengers", required: true },
      seatsBooked: { type: Number, required: true },
      farePaid: { type: Number, required: true }
    }
  ],
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  carModel: { type: String, required: true },  
  carNumber: { type: String, required: true },
  carColor: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  status: { type: String, default: "available" },
  distanceKm: { type: Number },
  fare: { type: Number }
}, { timestamps: true });

// ✅ Static method to update expired/near rides
RideSchema.statics.updateExpiredRides = async function () {
  const now = new Date();
  const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  await this.updateMany(
    { date: { $lt: sixHoursLater }, status: "available" },
    { $set: { status: "unavailable" } }
  );
};

module.exports = mongoose.model("Ride", RideSchema);

