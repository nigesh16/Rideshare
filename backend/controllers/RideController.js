const Ride = require('../models/Ride');

// Post a new ride
async function postRide(req, res) {
    try {
        const newRide = new Ride(req.body);
        await newRide.save();
        res.json({ success: true, message: 'Ride posted successfully!', ride: newRide });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error posting ride.' });
    }
}

// Fetch rides by driver ID
async function getDriverRides(req, res) {
    try {
        const rides = await Ride.find({ driver: req.params.driverId });
        res.json({ success: true, rides });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching rides.' });
    }
}

// Search for rides
async function searchRides(req, res) {
    const { pickup, drop } = req.query;
    try {
        const query = {
            pickupAddress: new RegExp(pickup, 'i'),
            dropAddress: new RegExp(drop, 'i'),
            // Only show rides with available seats
            availableSeats: { $gt: 0 } 
        };
        const rides = await Ride.find(query);
        res.json({ success: true, rides });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error searching for rides.' });
    }
}

// Book a ride
async function bookRide(req, res) {
    const { rideId } = req.body;
    try {
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found.' });
        }
        if (ride.availableSeats <= 0) {
            return res.status(400).json({ success: false, message: 'No available seats.' });
        }
        ride.availableSeats -= 1;
        await ride.save();
        res.json({ success: true, message: 'Ride booked successfully!', ride });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error booking ride.' });
    }
}

module.exports = {
    postRide,
    getDriverRides,
    searchRides,
    bookRide
};