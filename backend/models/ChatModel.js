const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Drivers",
    required: true
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Passengers",
    required: true
  },
  messages: [
    {
      sender: { type: String, enum: ["driver", "passenger"], required: true }, // singular
      text: { type: String, required: true },
      time: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);

