// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const db = require("./db");
const driverRoutes = require("./routes/driver/driverRoutes");
const passengerRoutes = require("./routes/passenger/passengerRoutes");
const adminRoutes = require("./routes/admin/admin");
const chatRoutes = require("./routes/ChatRoutes");
const { initSocket } = require("./socket");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/p", passengerRoutes);
app.use("/d", driverRoutes);
app.use("/chat", chatRoutes);
app.use("/admin", adminRoutes);

const server = http.createServer(app);
initSocket(server);

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});


