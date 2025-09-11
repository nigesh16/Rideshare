import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
    // State variables to hold data from the backend
    const [drivers, setDrivers] = useState([]);
    const [passengers, setPassengers] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect hook to fetch data from the backend when the component mounts
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Drivers
                const driversResponse = await axios.get('http://localhost:3000/api/admin/drivers');
                setDrivers(driversResponse.data);

                // Fetch Passengers
                const passengersResponse = await axios.get('http://localhost:3000/api/admin/passengers');
                setPassengers(passengersResponse.data);

                // Fetch Rides
                const ridesResponse = await axios.get('http://localhost:3000/api/admin/rides');
                setRides(ridesResponse.data);

                toast.success('Dashboard data loaded successfully!');

            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data. Check your server connection.');
                toast.error('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Empty dependency array ensures this runs once on component mount

    // Function to toggle a driver's verification status
    const toggleVerification = async (driverId) => {
        try {
            // Optimistically update the UI
            setDrivers(prevDrivers => prevDrivers.map(driver =>
                driver._id === driverId ? { ...driver, adminverification: !driver.adminverification } : driver
            ));

            // Send request to the backend to update the verification status
            await axios.put(`http://localhost:3000/api/admin/drivers/${driverId}/verify`);
            toast.success('Driver verification status updated!');

        } catch (err) {
            console.error(err);
            // Revert the optimistic UI update if the request fails
            setDrivers(prevDrivers => prevDrivers.map(driver =>
                driver._id === driverId ? { ...driver, adminverification: !driver.adminverification } : driver
            ));
            toast.error('Failed to update verification status. Please try again.');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="container">
            <Toaster />
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                .container {
                    min-height: 100vh;
                    background-color: #f3f4f6;
                    padding: 2rem;
                    font-family: 'Inter', sans-serif;
                }
                .title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 2rem;
                    text-align: center;
                }
                .section {
                    margin-bottom: 3rem;
                    padding: 2rem;
                    background-color: #fff;
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .section-title {
                    font-size: 1.75rem;
                    font-weight: 600;
                    color: #2d3748;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 0.5rem;
                    margin-bottom: 1.5rem;
                }
                .list {
                    list-style: none;
                    padding: 0;
                    display: grid;
                    gap: 1rem;
                }
                .item-card {
                    background-color: #f7fafc;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .item-card-content p {
                    margin: 0;
                    color: #4a5568;
                }
                .item-card-content .name {
                    font-weight: 600;
                    color: #1a202c;
                }
                .item-card-content .verified {
                    color: #38a169;
                    font-weight: 600;
                    margin-left: 0.5rem;
                }
                .item-card-content .not-verified {
                    color: #e53e3e;
                    font-weight: 600;
                    margin-left: 0.5rem;
                }
                .verify-button {
                    background-color: #4f46e5;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }
                .verify-button:hover {
                    background-color: #4338ca;
                }
                .ride-card {
                    background-color: #f7fafc;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .ride-card p {
                    margin: 0;
                    color: #4a5568;
                }
                .ride-card .ride-location {
                    font-weight: 600;
                    color: #1a202c;
                }
                .loading, .error {
                    text-align: center;
                    padding: 2rem;
                    font-size: 1.5rem;
                }
                `}
            </style>
            <h1 className="title">Admin Dashboard</h1>

            {/* Drivers Section */}
            <div className="section">
                <h2 className="section-title">Drivers</h2>
                <div className="list">
                    {drivers.map(driver => (
                        <div key={driver._id} className="item-card">
                            <div className="item-card-content">
                                <p className="name">{driver.name}</p>
                                <p>Email: {driver.email}</p>
                                <p>License: {driver.licenseNumber || 'N/A'}</p>
                                <p>
                                    Verification Status:
                                    <span className={driver.adminverification ? 'verified' : 'not-verified'}>
                                        {driver.adminverification ? ' Verified' : ' Not Verified'}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => toggleVerification(driver._id)}
                                className="verify-button"
                            >
                                {driver.adminverification ? 'Unverify Driver' : 'Verify Driver'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Passengers Section */}
            <div className="section">
                <h2 className="section-title">Passengers</h2>
                <div className="list">
                    {passengers.map(passenger => (
                        <div key={passenger._id} className="item-card">
                            <div className="item-card-content">
                                <p className="name">{passenger.name}</p>
                                <p>Email: {passenger.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rides Section */}
            <div className="section">
                <h2 className="section-title">All Rides</h2>
                <div className="list">
                    {rides.map(ride => (
                        <div key={ride._id} className="ride-card">
                            <p className="ride-location">From: {ride.pickupAddress} to {ride.dropAddress}</p>
                            <p>Date: {ride.date} | Time: {ride.time}</p>
                            <p>Available Seats: {ride.availableSeats}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;