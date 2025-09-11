const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const Ride = require('../models/Ride'); // Assuming you have a Ride model

// @route   GET /api/admin/drivers
// @desc    Get all drivers
// @access  Private (Admin only)
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' });
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/passengers
// @desc    Get all passengers
// @access  Private (Admin only)
router.get('/passengers', async (req, res) => {
  try {
    const passengers = await User.find({ role: 'passenger' });
    res.json(passengers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/rides
// @desc    Get all rides
// @access  Private (Admin only)
router.get('/rides', async (req, res) => {
  try {
    const rides = await Ride.find().populate('driver', 'name');
    res.json(rides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/drivers/:driverId/verify
// @desc    Toggle a driver's verification status
// @access  Private (Admin only)
router.put('/drivers/:driverId/verify', async (req, res) => {
  try {
    const driver = await User.findById(req.params.driverId);

    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    driver.adminverification = !driver.adminverification;
    await driver.save();

    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;