const express = require("express");
const Chat = require("../models/ChatModel");
const Driver = require("../models/DriverModel");       // <-- ADD THIS
const Passenger = require("../models/PassengerModel"); // <-- ADD THIS
const verifyUser = require("./middleware/verifyUser"); // works for both roles

const router = express.Router();

router.get("/", verifyUser, async (req, res) => {
  const { id, role } = req.user;

  try {
    let chats;

    if (role === "driver") {
      chats = await Chat.find({ driverId: id })
        .populate("passengerId", "name profilePic") // populate works now
        .lean();

      chats = chats.map(c => ({
        passenger: c.passengerId || {},
        messages: c.messages || [],
        lastMessage: c.messages?.[c.messages.length - 1]?.text || "",
        lastMessageTime: c.messages?.[c.messages.length - 1]?.time || ""
      }));
    } else {
      chats = await Chat.find({ passengerId: id })
        .populate("driverId", "name profilePic") // populate works now
        .lean();

      chats = chats.map(c => ({
        driver: c.driverId || {},
        messages: c.messages || [],
        lastMessage: c.messages?.[c.messages.length - 1]?.text || "",
        lastMessageTime: c.messages?.[c.messages.length - 1]?.time || ""
      }));
    }

    return res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
