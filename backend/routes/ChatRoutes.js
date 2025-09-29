const express = require("express");
const Chat = require("../models/ChatModel");
const Driver = require("../models/DriverModel");
const Passenger = require("../models/PassengerModel");
const verifyUser = require("./middleware/verifyUser"); // works for both roles
const Booking = require("../models/RideModel");

const router = express.Router();
    
    // GET all chats + ready-to-chat for user
    router.get("/", verifyUser, async (req, res) => {
      const { id, role } = req.user;

      try {
        let chats = [];

        if (role === "driver") {
          // 1️⃣ Existing chats
          let existingChats = await Chat.find({ driverId: id })
            .populate({ path: "passengerId", select: "name profilePic", strictPopulate: false })
            .lean();

          // Filter messages based on deletion timestamp for driver
          existingChats = existingChats.map(c => {
            const deletedTime = c.deletedFor?.driver;
            return {
              ...c,
              messages: deletedTime ? c.messages.filter(m => new Date(m.time) > new Date(deletedTime)) : c.messages
            };
          });

          // Remove chats with no messages and marked deleted (optional)
          existingChats = existingChats.filter(c => c.messages.length > 0 || !c.deletedFor?.driver);

          // 2️⃣ Bookings where driver has rides
          const rides = await Booking.find({ driverId: id })
            .populate({ path: "passengers.passengerId", select: "name profilePic", strictPopulate: false })
            .lean();

          const bookingChats = [];
          rides.forEach(ride => {
            if (ride.status !== "completed") {
              ride.passengers.forEach(p => {
                const existingChat = existingChats.find(
                  c => c.passengerId?._id.toString() === p.passengerId?._id.toString()
                );
                if (!existingChat && !bookingChats.find(bc => bc.passenger?._id === p.passengerId?._id)) {
                  bookingChats.push({
                    passenger: p.passengerId || {},
                    messages: [],
                    lastMessage: "",
                    lastMessageTime: ""
                  });
                }
              });
            }
          });

          // Format existing chats
          const formattedChats = existingChats.map(c => ({
            _id: c._id,
            passenger: c.passengerId || {},
            messages: c.messages || [],
            lastMessage: c.messages?.[c.messages.length - 1]?.text || "",
            lastMessageTime: c.messages?.[c.messages.length - 1]?.time || ""
          }));

          chats = formattedChats.concat(bookingChats);

        } else {
          // Passenger
          let existingChats = await Chat.find({ passengerId: id })
            .populate({ path: "driverId", select: "name profilePic", strictPopulate: false })
            .lean();

          // Filter messages based on deletion timestamp for passenger
          existingChats = existingChats.map(c => {
            const deletedTime = c.deletedFor?.passenger;
            return {
              ...c,
              messages: deletedTime ? c.messages.filter(m => new Date(m.time) > new Date(deletedTime)) : c.messages
            };
          });

          // Remove chats with no messages and marked deleted (optional)
          existingChats = existingChats.filter(c => c.messages.length > 0 || !c.deletedFor?.passenger);

          const rides = await Booking.find({ "passengers.passengerId": id })
            .populate({ path: "driverId", select: "name profilePic", strictPopulate: false })
            .lean();

          const bookingChats = [];
          rides.forEach(ride => {
            if (ride.status !== "completed") {
              const driver = ride.driverId;
              const existingChat = existingChats.find(
                c => c.driverId?._id.toString() === driver?._id.toString()
              );
              if (!existingChat && !bookingChats.find(bc => bc.driver?._id === driver?._id)) {
                bookingChats.push({
                  driver: driver || {},
                  messages: [],
                  lastMessage: "",
                  lastMessageTime: ""
                });
              }
            }
          });

          const formattedChats = existingChats.map(c => ({
            _id: c._id,
            driver: c.driverId || {},
            messages: c.messages || [],
            lastMessage: c.messages?.[c.messages.length - 1]?.text || "",
            lastMessageTime: c.messages?.[c.messages.length - 1]?.time || ""
          }));

          chats = formattedChats.concat(bookingChats);
        }

        res.json(chats);
      } catch (err) {
        console.error("Error fetching chats:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
      }
    });


    // DELETE chat messages for a user (soft delete)
    router.delete("/:chatId", verifyUser, async (req, res) => {
      const { id, role } = req.user;
      const { chatId } = req.params;

      try {
        // Validate role
        if (!["driver", "passenger"].includes(role)) {
          return res.status(400).json({ success: false, message: "Invalid role" });
        }

        // Find the chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // Initialize deletedFor if not exists
        if (!chat.deletedFor) chat.deletedFor = {};

        // Mark messages as deleted for this user
        chat.deletedFor[role] = new Date(); // store timestamp

        await chat.save();

        res.json({ success: true, message: "Messages deleted successfully for you" });
      } catch (err) {
        console.error("Error deleting messages:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
      }
    });


module.exports = router;
