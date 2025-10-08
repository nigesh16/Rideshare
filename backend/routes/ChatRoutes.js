const express = require("express");
const Chat = require("../models/ChatModel");
const Driver = require("../models/DriverModel");
const Passenger = require("../models/PassengerModel");
const verifyUser = require("./middleware/verifyUser"); // works for both roles
const Booking = require("../models/RideModel");

const router = express.Router();

// -------------------- GET all chats --------------------
router.get("/", verifyUser, async (req, res) => {
  const { id, role } = req.user;

  try {
    let chats = [];

    if (role === "driver") {
      // 1️⃣ Existing chats
      let existingChats = await Chat.find({ driverId: id })
        .populate({
          path: "passengerId",
          select: "name profilePicture",
          strictPopulate: false,
        })
        .lean();

      // Filter messages based on deletion timestamp for driver
      existingChats = existingChats.map((c) => {
        const deletedTime = c.deletedFor?.driver;
        return {
          ...c,
          messages: deletedTime
            ? c.messages.filter(
                (m) => new Date(m.time) > new Date(deletedTime)
              )
            : c.messages,
        };
      });

      // Remove chats with no messages and marked deleted
      existingChats = existingChats.filter(
        (c) => c.messages.length > 0 || !c.deletedFor?.driver
      );

      // 2️⃣ Add booking-based chats (for ongoing rides)
      const rides = await Booking.find({ driverId: id })
        .populate({
          path: "passengers.passengerId",
          select: "name profilePicture",
          strictPopulate: false,
        })
        .lean();

      const bookingChats = [];
      rides.forEach((ride) => {
        if (ride.status !== "completed") {
          ride.passengers.forEach((p) => {
            const existingChat = existingChats.find(
              (c) =>
                c.passengerId?._id.toString() === p.passengerId?._id.toString()
            );
            if (
              !existingChat &&
              !bookingChats.find(
                (bc) => bc.passenger?._id === p.passengerId?._id
              )
            ) {
              bookingChats.push({
                passenger: p.passengerId || {},
                messages: [],
                lastMessage: "",
                lastMessageTime: "",
              });
            }
          });
        }
      });

      // Format existing chats
      const formattedChats = existingChats.map((c) => ({
        _id: c._id,
        passenger: c.passengerId || {},
        messages: c.messages.map((m) => ({
          text: m.text,
          time: m.time,
          sender: m.sender,
          senderId: m.senderId || null, // ✅ Always include senderId
        })),
        lastMessage: c.messages?.[c.messages.length - 1]?.text || "",
        lastMessageTime: c.messages?.[c.messages.length - 1]?.time || "",
      }));

      chats = formattedChats.concat(bookingChats);
    } else {
      // Passenger side
      let existingChats = await Chat.find({ passengerId: id })
        .populate({
          path: "driverId",
          select: "name profilePicture",
          strictPopulate: false,
        })
        .lean();

      // Filter messages based on deletion timestamp for passenger
      existingChats = existingChats.map((c) => {
        const deletedTime = c.deletedFor?.passenger;
        return {
          ...c,
          messages: deletedTime
            ? c.messages.filter(
                (m) => new Date(m.time) > new Date(deletedTime)
              )
            : c.messages,
        };
      });

      // Remove chats with no messages and marked deleted
      existingChats = existingChats.filter(
        (c) => c.messages.length > 0 || !c.deletedFor?.passenger
      );

      const rides = await Booking.find({ "passengers.passengerId": id })
        .populate({
          path: "driverId",
          select: "name profilePicture",
          strictPopulate: false,
        })
        .lean();

      const bookingChats = [];
      rides.forEach((ride) => {
        if (ride.status !== "completed") {
          const driver = ride.driverId;
          const existingChat = existingChats.find(
            (c) => c.driverId?._id.toString() === driver?._id.toString()
          );
          if (
            !existingChat &&
            !bookingChats.find((bc) => bc.driver?._id === driver?._id)
          ) {
            bookingChats.push({
              driver: driver || {},
              messages: [],
              lastMessage: "",
              lastMessageTime: "",
            });
          }
        }
      });

      const formattedChats = existingChats.map((c) => ({
        _id: c._id,
        driver: c.driverId || {},
        messages: c.messages.map((m) => ({
          text: m.text,
          time: m.time,
          sender: m.sender,
          senderId: m.senderId || null, // ✅ Always include senderId
        })),
        lastMessage: c.messages?.[c.messages.length - 1]?.text || "",
        lastMessageTime: c.messages?.[c.messages.length - 1]?.time || "",
      }));

      chats = formattedChats.concat(bookingChats);
    }

    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// -------------------- DELETE messages --------------------
router.delete("/delete/:chatId", verifyUser, async (req, res) => {
  const { id, role } = req.user;
  const { chatId } = req.params;

  try {
    if (!["driver", "passenger"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    if (!chat.deletedFor) chat.deletedFor = {};

    chat.deletedFor[role] = new Date(); // store timestamp
    await chat.save();

    res.json({
      success: true,
      message: "Messages deleted successfully for you",
    });
  } catch (err) {
    console.error("Error deleting messages:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

router.get("/:chatId", verifyUser, async (req, res) => {
  const { id, role } = req.user; // logged-in user
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId)
      .populate("driverId", "name profilePicture")
      .populate("passengerId", "name profilePicture")
      .lean();

    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    // ✅ Check authorization
    if (
      (role === "driver" && chat.driverId?._id.toString() !== id) ||
      (role === "passenger" && chat.passengerId?._id.toString() !== id)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({
      _id: chat._id,
      driver: chat.driverId || {},
      passenger: chat.passengerId || {},
      messages: chat.messages.map(m => ({
        text: m.text,
        time: m.time,
        sender: m.sender,
        senderId: m.senderId || null,
      })),
      lastMessage: chat.messages?.[chat.messages.length - 1]?.text || "",
      lastMessageTime: chat.messages?.[chat.messages.length - 1]?.time || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
