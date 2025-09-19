const express = require('express');
const router = express.Router();

// Import separate route files
const verificationRoutes = require('./verification');
const loginRoutes = require('./login');
const postRideRoutes = require("./postRide");

// Use them
router.use('/', verificationRoutes);
router.use('/', loginRoutes);
router.use("/", postRideRoutes);

module.exports = router;

