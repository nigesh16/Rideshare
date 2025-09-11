const express = require('express');
const cors = require("cors");
const db = require('./db');
const driverRoutes = require('./routes/driverRoutes')
const passengerRoutes = require('./routes/passengerRoutes')
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json())
app.use("/p",passengerRoutes)
app.use("/d",driverRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
});