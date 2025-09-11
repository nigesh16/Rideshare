import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PostRide from '../../components/PostRide.jsx';

const DriverHome = () => {
    // State to manage the list of rides, loading status, and errors
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPostForm, setShowPostForm] = useState(false);

    // Placeholder for the logged-in driver's ID
    // In a real app, this would come from a global state or context after login.
    const driverId = '60c72b2f9b1d8e001c8e4a9e';

    // Function to fetch rides from the backend API, using useCallback for stability
    const fetchRides = useCallback(async () => {
        if (!driverId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:3000/d/rides/driver/${driverId}`);
            if (response.data.success) {
                setRides(response.data.rides);
            } else {
                setError(response.data.message || 'Failed to fetch rides.');
            }
        } catch (err) {
            setError('Network error. Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    }, [driverId]);

    // useEffect hook to fetch rides when the component mounts
    useEffect(() => {
        fetchRides();
    }, [fetchRides]);

    // Handler to refresh the ride list after a new ride is posted
    const handleRidePosted = () => {
        setShowPostForm(false);
        fetchRides();
    };

    if (showPostForm) {
        return <PostRide driverId={driverId} onRidePosted={handleRidePosted} />;
    }

    return (
        <div className="container">
            <style>
                {`
                .container {
                    min-height: 100vh;
                    background-color: #f3f4f6;
                    padding: 2rem;
                }
                .header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 0.5rem;
                }
                .subtitle {
                    color: #4a5568;
                }
                .button-container {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .action-button {
                    padding: 0.75rem 1.5rem;
                    border-radius: 9999px;
                    background-color: #4f46e5;
                    color: white;
                    font-weight: 600;
                    transition: background-color 0.2s, transform 0.2s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .action-button:hover {
                    background-color: #4338ca;
                    transform: translateY(-2px);
                }
                .ride-list {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                }
                .ride-card {
                    background-color: white;
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }
                .ride-card:hover {
                    transform: translateY(-5px);
                }
                .location-text {
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: #1a202c;
                }
                .detail-text {
                    font-size: 0.875rem;
                    color: #4a5568;
                    margin-top: 0.5rem;
                }
                .detail-text span {
                    font-weight: 600;
                }
                .status-message {
                    text-align: center;
                    color: #4a5568;
                    margin-top: 2rem;
                }
                .error-message {
                    text-align: center;
                    color: #e53e3e;
                    margin-top: 2rem;
                    font-weight: 600;
                }
                `}
            </style>
            <div className="header">
                <h1 className="title">Your Dashboard</h1>
                <p className="subtitle">View and manage your posted rides.</p>
            </div>

            <div className="button-container">
                <button 
                    onClick={() => setShowPostForm(true)}
                    className="action-button"
                >
                    Post a New Ride
                </button>
            </div>

            {loading && <p className="status-message">Loading your rides...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {!loading && !error && (
                rides.length > 0 ? (
                    <div className="ride-list">
                        {rides.map(ride => (
                            <div key={ride._id} className="ride-card">
                                <p className="location-text">{ride.pickupAddress} to {ride.dropAddress}</p>
                                <p className="detail-text"><span>Date:</span> {ride.date}</p>
                                <p className="detail-text"><span>Time:</span> {ride.time}</p>
                                <p className="detail-text"><span>Seats:</span> {ride.availableSeats} of {ride.totalSeats}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="status-message">You have not posted any rides yet.</p>
                )
            )}
        </div>
    );
};

export default DriverHome;