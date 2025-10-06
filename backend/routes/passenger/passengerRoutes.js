const express = require('express');
const router = express.Router();

// Import separate route files
const verificationRoutes = require('./verification');
const loginRoutes = require('./login');
const getRideRoutes = require('./getRide');
const bookRideRoutes = require('./bookRide');
const bookedRideRoutes = require('./bookedRide');
const cancelRideRoutes = require('./cancelRide');
const RideHistoryRoutes = require('./rideHistory');
const profileRoutes = require('./profile')

// Use them
router.use('/', verificationRoutes);
router.use('/', loginRoutes);
router.use('/', getRideRoutes);
router.use('/', bookRideRoutes);
router.use('/', bookedRideRoutes);
router.use('/', cancelRideRoutes);
router.use('/', RideHistoryRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
