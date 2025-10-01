// initSocket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Chat = require("./models/ChatModel");

let io;

function initSocket(server) {
  io = new Server(server, { cors: { origin: "*" } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.user);

    // join chat room between socket.user.id and otherUserId
    socket.on("joinChat", ({ otherUserId }) => {
      if (!otherUserId) return;
      const room = [socket.user.id, otherUserId].sort().join("_");
      socket.join(room);
      // optional: console.log(`socket ${socket.id} joined room ${room}`);
    });

    socket.on("sendMessage", async ({ otherUserId, text }) => {
      try {
        const senderRole = socket.user.role; // 'driver' or 'passenger'
        const senderId = socket.user.id;
        const time = new Date();

        const driverId = senderRole === "driver" ? senderId : otherUserId;
        const passengerId = senderRole === "passenger" ? senderId : otherUserId;

        const room = [driverId, passengerId].sort().join("_");

        // Save message in DB (including senderId)
        let chat = await Chat.findOne({ driverId, passengerId });
        if (!chat) chat = new Chat({ driverId, passengerId, messages: [] });

        chat.messages.push({ sender: senderRole, senderId, text, time });
        await chat.save();

        // Emit to room and include senderId so client can match the chat
        io.to(room).emit("receiveMessage", { sender: senderRole, senderId, text, time });
      } catch (err) {
        console.error("Error in sendMessage socket handler:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.user?.id || socket.id);
    });
  });
}

module.exports = { initSocket };
