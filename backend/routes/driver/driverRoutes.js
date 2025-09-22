const express = require('express');
const router = express.Router();

// Import separate route files
const verificationRoutes = require('./verification');
const loginRoutes = require('./login');
const postRideRoutes = require("./postRide");
const postedRideRoutes = require("./postedRides");
const rideHistoryRoutes = require("./rideHistory")

// Use them
router.use('/', verificationRoutes);
router.use('/', loginRoutes);
router.use("/", postRideRoutes);
router.use("/", postedRideRoutes);
router.use("/", rideHistoryRoutes);

module.exports = router;

