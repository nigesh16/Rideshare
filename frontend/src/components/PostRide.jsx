import React, { useState } from 'react';
import axios from 'axios';

const PostRide = ({ driverId, onRidePosted }) => {
    // State to manage the form inputs
    const [formData, setFormData] = useState({
        pickupAddress: '',
        dropAddress: '',
        availableSeats: '',
        date: '',
        time: '',
    });

    // State for form status messages
    const [status, setStatus] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    // Handle input changes and update state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ message: '', type: '' });

        try {
            // Include the driverId in the form data before sending
            const postData = { ...formData, driver: driverId };
            const response = await axios.post('http://localhost:5000/d/rides', postData);

            if (response.data.success) {
                setStatus({ message: 'Ride posted successfully!', type: 'success' });
                // Reset form fields
                setFormData({
                    pickupAddress: '',
                    dropAddress: '',
                    availableSeats: '',
                    date: '',
                    time: '',
                });
                // Call the parent component's handler to refresh the ride list
                if (onRidePosted) onRidePosted();
            } else {
                setStatus({ message: response.data.message || 'Failed to post ride.', type: 'error' });
            }
        } catch (err) {
            setStatus({ message: 'Network error. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <style>
                {`
                .form-container {
                    max-width: 600px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background-color: #fff;
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .form-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .form-title {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #1a202c;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-label {
                    display: block;
                    font-weight: 600;
                    color: #4a5568;
                    margin-bottom: 0.5rem;
                }
                .form-input, .form-button {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e2e8f0;
                    font-size: 1rem;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25);
                }
                .form-button {
                    background-color: #4f46e5;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s, transform 0.2s;
                }
                .form-button:hover {
                    background-color: #4338ca;
                    transform: translateY(-2px);
                }
                .status-message {
                    margin-top: 1rem;
                    text-align: center;
                    font-weight: bold;
                }
                .status-success {
                    color: #10b981;
                }
                .status-error {
                    color: #ef4444;
                }
                `}
            </style>
            <div className="form-header">
                <h2 className="form-title">Post a New Ride</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="pickupAddress">Pickup Address</label>
                    <input
                        type="text"
                        name="pickupAddress"
                        id="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="dropAddress">Drop-off Address</label>
                    <input
                        type="text"
                        name="dropAddress"
                        id="dropAddress"
                        value={formData.dropAddress}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="availableSeats">Available Seats</label>
                    <input
                        type="number"
                        name="availableSeats"
                        id="availableSeats"
                        value={formData.availableSeats}
                        onChange={handleChange}
                        className="form-input"
                        min="1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="date">Date</label>
                    <input
                        type="date"
                        name="date"
                        id="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="time">Time</label>
                    <input
                        type="time"
                        name="time"
                        id="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="form-button" 
                    disabled={loading}
                >
                    {loading ? 'Posting...' : 'Post Ride'}
                </button>
            </form>

            {status.message && (
                <p className={`status-message status-${status.type}`}>
                    {status.message}
                </p>
            )}
        </div>
    );
};

export default PostRide;
