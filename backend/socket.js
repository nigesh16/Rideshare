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

    socket.on("joinChat", ({ otherUserId }) => {
      const room = [socket.user.id, otherUserId].sort().join("_");
      socket.join(room);
    });

    socket.on("sendMessage", async ({ otherUserId, text }) => {
      const senderRole = socket.user.role; // 'driver' or 'passenger'
      const time = new Date();

      const driverId = senderRole === "driver" ? socket.user.id : otherUserId;
      const passengerId = senderRole === "passenger" ? socket.user.id : otherUserId;

      const room = [driverId, passengerId].sort().join("_");

      // Save message in DB
      let chat = await Chat.findOne({ driverId, passengerId });
      if (!chat) chat = new Chat({ driverId, passengerId, messages: [] });

      chat.messages.push({ sender: senderRole, text, time });
      await chat.save();

      // Emit to room
      io.to(room).emit("receiveMessage", { sender: senderRole, text, time });
    });

    socket.on("disconnect", () => console.log("❌ User disconnected:", socket.user.id));
  });
}

module.exports = { initSocket };
