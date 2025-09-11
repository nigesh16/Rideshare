import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Main App component that manages the application's state and views.
const App = () => {
    // State to manage the current view, user data, and the selected ride for chat.
    const [currentView, setCurrentView] = useState('home');
    const [user, setUser] = useState(null);
    const [selectedRide, setSelectedRide] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Mock user ID. In a real application, this would come from an authentication service.
    // We use a random UUID to simulate a unique user ID for each session.
    const MOCK_USER_ID = localStorage.getItem('mockUserId') || crypto.randomUUID();
    const MOCK_USER_NAME = 'Passenger User';

    // Persist the mock user ID for this session
    useEffect(() => {
        localStorage.setItem('mockUserId', MOCK_USER_ID);
    }, []);

    // Mock authentication check and user data fetching
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch the user profile from the backend
                const response = await axios.get(`http://localhost:3000/api/profile/${MOCK_USER_ID}`);
                if (response.status === 200) {
                    setUser(response.data);
                }
            } catch (err) {
                console.error("No existing profile found. Creating a new one.");
                // If no profile exists, create a new one.
                const newProfile = {
                    userId: MOCK_USER_ID,
                    name: MOCK_USER_NAME,
                    email: `user_${MOCK_USER_ID.substring(0, 0)}@example.com`,
                    phoneNumber: '123-456-7890',
                    dob: '1990-01-01', // Default values
                    gender: 'Other',
                    profileImageUrl: 'https://placehold.co/128x128/e0e7ff/4338ca?text=User'
                };
                await axios.put(`http://localhost:3000/api/profile/${MOCK_USER_ID}`, newProfile);
                setUser(newProfile);
            } finally {
                setIsAuthReady(true);
            }
        };

        fetchUserData();
    }, []);

    // Handle navigation between different views
    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    // Render the appropriate component based on the current view
    const renderView = () => {
        if (!isAuthReady) {
            return (
                <div className="loading-container">
                    <div className="loading-card">
                        <p className="loading-text">Loading user profile...</p>
                    </div>
                </div>
            );
        }

        switch (currentView) {
            case 'home':
                return <PassengerHome user={user} setCurrentView={setCurrentView} setSelectedRide={setSelectedRide} />;
            case 'profile':
                return <UserProfile user={user} onUpdateProfile={setUser} />;
            case 'chat':
                return <RideChat user={user} ride={selectedRide} />;
            case 'help':
                return <HelpAndFeedback />;
            default:
                return <PassengerHome user={user} setCurrentView={setCurrentView} setSelectedRide={setSelectedRide} />;
        }
    };

    // UserProfile Component
    const UserProfile = ({ user, onUpdateProfile }) => {
        const [formData, setFormData] = useState({
            name: '', email: '', phoneNumber: '', dob: '', gender: ''
        });
        const [isEditing, setIsEditing] = useState(false);
        const [loading, setLoading] = useState(false);
        const [status, setStatus] = useState({ message: '', type: '' });
        const [profileImageFile, setProfileImageFile] = useState(null);
        const [profileImageUrl, setProfileImageUrl] = useState('');

        useEffect(() => {
            if (user) {
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    dob: user.dob || '',
                    gender: user.gender || ''
                });
                setProfileImageUrl(user.profileImageUrl || 'https://placehold.co/128x128/e0e7ff/4338ca?text=User');
            }
        }, [user]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setProfileImageFile(file);
                setProfileImageUrl(URL.createObjectURL(file));
            }
        };

        const handleSave = async (e) => {
            e.preventDefault();
            setLoading(true);
            setStatus({ message: '', type: '' });

            // Simulate a new image URL on save since we can't upload to a real server.
            const updatedProfileImageUrl = profileImageFile
                ? `https://placehold.co/128x128/e0e7ff/4338ca?text=Updated`
                : profileImageUrl;

            const updatedData = {
                ...formData,
                profileImageUrl: updatedProfileImageUrl
            };

            try {
                const response = await axios.put(`http://localhost:3000/api/profile/${user.userId}`, updatedData);
                if (response.status === 200) {
                    onUpdateProfile(response.data);
                    setStatus({ message: 'Profile updated successfully!', type: 'success' });
                    setIsEditing(false);
                }
            } catch (err) {
                setStatus({ message: 'Failed to update profile. Please try again.', type: 'error' });
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="profile-container">
                <div className="profile-card">
                    <h1 className="profile-title">User Profile</h1>
                    <div className="profile-image-container">
                        <img src={profileImageUrl} alt="Profile Picture" className="profile-image" />
                        <p className="user-id">Your User ID: {user?.userId}</p>
                    </div>
                    {isEditing ? (
                        <form onSubmit={handleSave} className="profile-form">
                            <div className="form-group">
                                <label className="form-label">Profile Picture</label>
                                <input type="file" onChange={handleImageChange} className="form-input-file" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="button-group">
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-info-container">
                            <p className="profile-info"><span className="profile-info-label">Name:</span> {user?.name}</p>
                            <p className="profile-info"><span className="profile-info-label">Email:</span> {user?.email}</p>
                            <p className="profile-info"><span className="profile-info-label">Phone:</span> {user?.phoneNumber}</p>
                            <p className="profile-info"><span className="profile-info-label">Date of Birth:</span> {user?.dob || 'Not provided'}</p>
                            <p className="profile-info"><span className="profile-info-label">Gender:</span> {user?.gender || 'Not provided'}</p>
                            <button onClick={() => setIsEditing(true)} className="btn btn-primary-full-width">
                                Edit Profile
                            </button>
                        </div>
                    )}
                    {status.message && (
                        <p className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>{status.message}</p>
                    )}
                </div>
            </div>
        );
    };

    // HelpAndFeedback Component
    const HelpAndFeedback = () => {
        const [email, setEmail] = useState('');
        const [message, setMessage] = useState('');
        const [status, setStatus] = useState({ message: '', type: '' });

        const handleSubmit = (e) => {
            e.preventDefault();
            // This is a placeholder for sending feedback.
            // In a real application, you would send this data to a backend API.
            console.log("Feedback submitted:", { email, message });
            setStatus({ message: 'Thank you for your feedback! We will get back to you soon.', type: 'success' });
            setEmail('');
            setMessage('');
        };

        return (
            <div className="container">
                <div className="card">
                    <h1 className="card-title">Help & Feedback</h1>
                    <p className="card-subtitle">Need assistance or have feedback for us? Let us know!</p>
                    <form onSubmit={handleSubmit} className="form-container">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Your Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message" className="form-label">Your Message</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="5"
                                className="form-input"
                                placeholder="Tell us how we can help..."
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary-full-width">
                            Submit
                        </button>
                    </form>
                    {status.message && (
                        <p className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>{status.message}</p>
                    )}
                </div>
            </div>
        );
    };

    // RideChat Component for chatting with a booked driver
    const RideChat = ({ user, ride }) => {
        const [messages, setMessages] = useState([]);
        const [newMessage, setNewMessage] = useState('');
        const [loading, setLoading] = useState(true);

        const fetchMessages = async () => {
            if (!ride || !ride._id) {
                console.error("Ride object or ID is missing.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:3000/api/rides/${ride._id}/chat`);
                setMessages(response.data);
            } catch (err) {
                console.error("Failed to fetch chat messages:", err);
            } finally {
                setLoading(false);
            }
        };

        const sendMessage = async () => {
            if (!newMessage.trim() || !user || !user.userId || !ride || !ride._id) return;
            try {
                await axios.post(`http://34.16.142.126:3000/api/rides/${ride._id}/chat`, {
                    senderId: user.userId,
                    senderName: user.name,
                    text: newMessage,
                });
                setNewMessage('');
                fetchMessages(); // Refresh messages after sending
            } catch (err) {
                console.error("Failed to send message:", err);
            }
        };

        useEffect(() => {
            if (ride) {
                fetchMessages();
            }
        }, [ride]);

        if (!ride) {
            return <div className="chat-placeholder">No ride selected.</div>;
        }

        return (
            <div className="container">
                <div className="chat-card">
                    <h1 className="chat-title">Chat with Driver</h1>
                    <div className="message-list">
                        {loading ? (
                            <p className="loading-chat-message">Loading chat...</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`message-container ${msg.senderId === user.userId ? 'message-sent' : 'message-received'}`}>
                                    <div className="message-bubble">
                                        <p className="message-sender">{msg.senderName}</p>
                                        <p className="message-text">{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="message-input-container">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                            placeholder="Type a message..."
                            className="message-input"
                        />
                        <button onClick={sendMessage} className="send-button">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="send-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    // PassengerHome Component
    const PassengerHome = ({ user, setCurrentView, setSelectedRide }) => {
        // State for search form inputs
        const [searchQuery, setSearchQuery] = useState({
            pickup: '',
            drop: '',
            date: ''
        });
        // State to manage search results, loading status, and errors
        const [searchResults, setSearchResults] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const [bookingStatus, setBookingStatus] = useState({ message: '', type: '' });

        const handleChange = (e) => {
            const { name, value } = e.target;
            setSearchQuery(prevQuery => ({
                ...prevQuery,
                [name]: value
            }));
        };

        const handleSearch = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setBookingStatus({ message: '', type: '' });
            setSearchResults([]);
            try {
                // Correct API call to the backend search endpoint
                const response = await axios.get('http://34.16.142.126:3000/api/rides', {
                    params: {
                        pickup: searchQuery.pickup,
                        drop: searchQuery.drop,
                        date: searchQuery.date
                    }
                });
                setSearchResults(response.data);
            } catch (err) {
                setError('Network error. Could not connect to the server.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const handleBookRide = async (rideId) => {
            if (!user) {
                setError('User not authenticated.');
                return;
            }
            try {
                await axios.post('http://34.16.142.126:3000/api/rides/book', {
                    rideId: rideId,
                    userId: user.userId
                });
                setBookingStatus({ message: 'Ride booked successfully!', type: 'success' });
                // After booking, find the booked ride and go to the chat view
                const rideToChat = searchResults.find(r => r._id === rideId);
                if (rideToChat) {
                    setSelectedRide(rideToChat);
                    setCurrentView('chat');
                }
            } catch (err) {
                setBookingStatus({ message: 'Failed to book ride. It might be full.', type: 'error' });
                console.error(err);
            }
        };

        return (
            <div className="container">
                <div className="header-container">
                    <h1 className="header-title">Find a Ride</h1>
                    <p className="header-subtitle">Search for available rides and book your seat.</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        name="pickup"
                        value={searchQuery.pickup}
                        onChange={handleChange}
                        placeholder="Pickup Location"
                        className="search-input"
                        required
                    />
                    <input
                        type="text"
                        name="drop"
                        value={searchQuery.drop}
                        onChange={handleChange}
                        placeholder="Drop-off Location"
                        className="search-input"
                        required
                    />
                    <input
                        type="date"
                        name="date"
                        value={searchQuery.date}
                        onChange={handleChange}
                        className="search-input"
                        required
                    />
                    <button type="submit" className="search-button" disabled={loading}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="search-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <span>{loading ? 'Searching...' : 'Search'}</span>
                    </button>
                </form>

                {error && <p className="error-message">{error}</p>}
                {bookingStatus.message && (
                    <p className={`status-message ${bookingStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
                        {bookingStatus.message}
                    </p>
                )}

                {/* Search Results */}
                <div className="search-results-grid">
                    {searchResults.length > 0 ? (
                        searchResults.map(ride => (
                            <div key={ride._id} className="ride-card">
                                <h3 className="ride-card-title">{ride.pickupLocation} to {ride.dropLocation}</h3>
                                <p className="ride-card-text">Date: <span className="ride-card-highlight">{ride.date}</span></p>
                                <p className="ride-card-text">Time: <span className="ride-card-highlight">{ride.time}</span></p>
                                <p className="ride-card-text">Price: <span className="ride-card-highlight">₹{ride.price}</span></p>
                                <p className="ride-card-text ride-card-text-last">Seats: <span className="ride-card-highlight">{ride.availableSeats} / {ride.totalSeats} available</span></p>
                                <button
                                    onClick={() => handleBookRide(ride._id)}
                                    className="book-button"
                                    disabled={ride.availableSeats <= 0}
                                >
                                    {ride.availableSeats > 0 ? 'Book Ride' : 'Sold Out'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-rides-message">
                            {loading ? 'Searching for rides...' : 'No rides found. Try a different search.'}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                    :root {
                        --primary-color: #4f46e5;
                        --primary-hover: #4338ca;
                        --secondary-color: #6b7280;
                        --background-color: #f3f4f6;
                        --card-bg: #ffffff;
                        --text-color: #111827;
                        --secondary-text-color: #6b7280;
                        --success-color: #10b981;
                        --error-color: #ef4444;
                        --border-color: #d1d5db;
                        --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                        --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                    }

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Inter', sans-serif;
                    }

                    .app-container {
                        background-color: var(--background-color);
                        min-height: 100vh;
                        font-family: 'Inter', sans-serif;
                    }

                    /* Utility Classes */
                    .container {
                        max-width: 1280px;
                        margin-left: auto;
                        margin-right: auto;
                        padding-left: 1rem;
                        padding-right: 1rem;
                        padding-top: 2rem;
                        padding-bottom: 2rem;
                    }

                    .flex-center {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .shadow-md {
                        box-shadow: var(--shadow-md);
                    }

                    .card {
                        max-width: 512px;
                        margin-left: auto;
                        margin-right: auto;
                        background-color: var(--card-bg);
                        padding: 2rem;
                        border-radius: 0.75rem;
                        box-shadow: var(--shadow-lg);
                    }

                    .card-title {
                        font-size: 1.875rem;
                        font-weight: 700;
                        text-align: center;
                        color: var(--text-color);
                        margin-bottom: 1.5rem;
                    }

                    .card-subtitle {
                        text-align: center;
                        color: var(--secondary-text-color);
                        margin-bottom: 1.5rem;
                    }

                    .form-container {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .form-group {
                        display: flex;
                        flex-direction: column;
                    }

                    .form-label {
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: var(--secondary-text-color);
                    }
                    
                    .form-input, .form-input-file, .form-select {
                        display: block;
                        width: 100%;
                        padding: 0.5rem 0.75rem;
                        border: 1px solid var(--border-color);
                        border-radius: 0.375rem;
                        box-shadow: var(--shadow-sm);
                    }
                    
                    .form-input:focus, .form-select:focus {
                        outline: none;
                        border-color: var(--primary-color);
                        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
                    }

                    .form-input-file {
                        font-size: 0.875rem;
                        color: #6b7280;
                    }

                    .form-input-file::-webkit-file-upload-button {
                        margin-right: 1rem;
                        padding: 0.5rem 1rem;
                        border: 0;
                        border-radius: 9999px;
                        font-weight: 600;
                        background-color: #e0e7ff;
                        color: #4338ca;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                    }
                    
                    .form-input-file::-webkit-file-upload-button:hover {
                        background-color: #c7d2fe;
                    }

                    .btn {
                        padding: 0.5rem 1rem;
                        border-radius: 0.375rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background-color 0.2s ease, box-shadow 0.2s ease;
                    }

                    .btn-primary {
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                    }

                    .btn-primary:hover {
                        background-color: var(--primary-hover);
                    }
                    
                    .btn-primary-full-width {
                        width: 100%;
                        padding: 0.5rem 1rem;
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 0.375rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background-color 0.2s ease, box-shadow 0.2s ease;
                    }

                    .btn-primary-full-width:hover {
                        background-color: var(--primary-hover);
                    }

                    .btn-secondary {
                        background-color: white;
                        color: var(--secondary-color);
                        border: 1px solid var(--border-color);
                    }

                    .btn-secondary:hover {
                        background-color: #f9fafb;
                    }

                    .status-message {
                        margin-top: 1rem;
                        text-align: center;
                        font-weight: 500;
                    }

                    .status-success {
                        color: var(--success-color);
                    }

                    .status-error {
                        color: var(--error-color);
                    }
                    
                    /* Header & Navigation */
                    .header {
                        background-color: var(--card-bg);
                        box-shadow: var(--shadow-md);
                    }
                    
                    .navbar {
                        max-width: 1280px;
                        margin-left: auto;
                        margin-right: auto;
                        padding: 0.75rem 1rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .logo {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--primary-color);
                    }

                    .nav-links {
                        display: flex;
                        gap: 1rem;
                    }

                    .nav-link {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: var(--secondary-color);
                        font-weight: 500;
                        transition: color 0.2s ease;
                        text-decoration: none;
                        background: none;
                        border: none;
                        cursor: pointer;
                    }
                    
                    .nav-link:hover {
                        color: var(--primary-color);
                    }

                    .nav-link svg {
                        width: 1.25rem;
                        height: 1.25rem;
                    }

                    /* Loading View */
                    .loading-container {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: var(--background-color);
                    }

                    .loading-card {
                        text-align: center;
                        padding: 2rem;
                        background-color: var(--card-bg);
                        border-radius: 0.5rem;
                        box-shadow: var(--shadow-lg);
                    }

                    .loading-text {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #4b5563;
                    }

                    /* Profile Page */
                    .profile-container {
                        padding: 2rem 1rem;
                    }

                    .profile-card {
                        max-width: 512px;
                        margin-left: auto;
                        margin-right: auto;
                        background-color: var(--card-bg);
                        padding: 2rem;
                        border-radius: 0.75rem;
                        box-shadow: var(--shadow-lg);
                    }

                    .profile-title {
                        font-size: 1.875rem;
                        font-weight: 700;
                        text-align: center;
                        color: var(--text-color);
                        margin-bottom: 1.5rem;
                    }

                    .profile-image-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-bottom: 1.5rem;
                    }

                    .profile-image {
                        width: 8rem;
                        height: 8rem;
                        border-radius: 9999px;
                        margin-bottom: 1rem;
                        border: 4px solid #c7d2fe;
                        object-fit: cover;
                    }

                    .user-id {
                        font-size: 0.75rem;
                        color: #6b7280;
                    }

                    .profile-form {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }
                    
                    .profile-info-container {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    .profile-info {
                        font-size: 1.125rem;
                        color: #1f2937;
                    }
                    
                    .profile-info-label {
                        font-weight: 600;
                    }
                    
                    .button-group {
                        display: flex;
                        justify-content: flex-end;
                        gap: 1rem;
                    }
                    
                    /* Help and Feedback Page */
                    .help-title {
                        font-size: 1.875rem;
                        font-weight: 700;
                        text-align: center;
                        color: var(--text-color);
                        margin-bottom: 1.5rem;
                    }
                    
                    /* Chat Page */
                    .chat-placeholder {
                        padding: 2rem;
                        text-align: center;
                        color: var(--secondary-text-color);
                    }

                    .chat-card {
                        max-width: 768px;
                        margin-left: auto;
                        margin-right: auto;
                        background-color: var(--card-bg);
                        padding: 1.5rem;
                        border-radius: 0.75rem;
                        box-shadow: var(--shadow-lg);
                    }
                    
                    .chat-title {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin-bottom: 1rem;
                    }
                    
                    .message-list {
                        border: 1px solid var(--border-color);
                        border-radius: 0.5rem;
                        padding: 1rem;
                        height: 24rem;
                        overflow-y: auto;
                        margin-bottom: 1rem;
                    }
                    
                    .loading-chat-message {
                        text-align: center;
                        color: var(--secondary-text-color);
                    }

                    .message-container {
                        display: flex;
                        margin-bottom: 0.5rem;
                    }
                    
                    .message-sent {
                        justify-content: flex-end;
                    }
                    
                    .message-received {
                        justify-content: flex-start;
                    }
                    
                    .message-bubble {
                        padding: 0.75rem;
                        border-radius: 0.5rem;
                        max-width: 80%;
                    }
                    
                    .message-sent .message-bubble {
                        background-color: var(--primary-color);
                        color: white;
                    }
                    
                    .message-received .message-bubble {
                        background-color: #e5e7eb;
                        color: #1f2937;
                    }
                    
                    .message-sender {
                        font-weight: 600;
                        font-size: 0.875rem;
                        margin-bottom: 0.25rem;
                    }
                    
                    .message-text {
                        margin: 0;
                    }
                    
                    .message-input-container {
                        display: flex;
                        gap: 0.5rem;
                    }
                    
                    .message-input {
                        flex-grow: 1;
                        padding: 0.5rem 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 0.5rem;
                    }
                    
                    .message-input:focus {
                        outline: none;
                        border-color: var(--primary-color);
                    }
                    
                    .send-button {
                        padding: 0.5rem 1rem;
                        background-color: var(--primary-color);
                        color: white;
                        font-weight: 600;
                        border-radius: 0.5rem;
                        transition: background-color 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.25rem;
                    }
                    
                    .send-button:hover {
                        background-color: var(--primary-hover);
                    }
                    
                    .send-icon {
                        width: 1.25rem;
                        height: 1.25rem;
                        transform: rotate(-45deg);
                    }

                    /* Home Page */
                    .header-container {
                        text-align: center;
                        margin-bottom: 2rem;
                    }
                    
                    .header-title {
                        font-size: 2.25rem;
                        font-weight: 800;
                        color: var(--text-color);
                    }

                    .header-subtitle {
                        margin-top: 0.5rem;
                        font-size: 1.125rem;
                        color: var(--secondary-text-color);
                    }
                    
                    .search-form {
                        max-width: 768px;
                        margin-left: auto;
                        margin-right: auto;
                        padding: 1.5rem;
                        background-color: var(--card-bg);
                        border-radius: 0.75rem;
                        box-shadow: var(--shadow-lg);
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        margin-bottom: 2rem;
                    }
                    
                    .search-input {
                        flex-grow: 1;
                        padding: 0.5rem 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 0.375rem;
                    }
                    
                    .search-input:focus {
                        outline: none;
                        border-color: var(--primary-color);
                    }
                    
                    .search-button {
                        padding: 0.5rem 1.5rem;
                        background-color: var(--primary-color);
                        color: white;
                        font-weight: 600;
                        border-radius: 0.375rem;
                        box-shadow: var(--shadow-md);
                        transition: background-color 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    }
                    
                    .search-button:hover {
                        background-color: var(--primary-hover);
                    }
                    
                    .search-button:disabled {
                        background-color: #9ca3af;
                        cursor: not-allowed;
                    }
                    
                    .search-icon {
                        width: 1.25rem;
                        height: 1.25rem;
                    }

                    .error-message {
                        color: var(--error-color);
                        text-align: center;
                        margin-bottom: 1rem;
                    }
                    
                    .search-results-grid {
                        display: grid;
                        grid-template-columns: repeat(1, minmax(0, 1fr));
                        gap: 1.5rem;
                    }

                    .ride-card {
                        background-color: var(--card-bg);
                        padding: 1.5rem;
                        border-radius: 0.75rem;
                        box-shadow: var(--shadow-lg);
                        transition: box-shadow 0.3s ease;
                    }
                    
                    .ride-card:hover {
                        box-shadow: var(--shadow-xl);
                    }
                    
                    .ride-card-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: var(--text-color);
                        margin-bottom: 0.5rem;
                    }
                    
                    .ride-card-text {
                        color: #4b5563;
                        font-size: 0.875rem;
                    }
                    
                    .ride-card-highlight {
                        font-weight: 600;
                    }
                    
                    .ride-card-text-last {
                        margin-bottom: 1rem;
                    }

                    .book-button {
                        width: 100%;
                        padding: 0.5rem;
                        background-color: #22c55e;
                        color: white;
                        font-weight: 600;
                        border-radius: 0.5rem;
                        box-shadow: var(--shadow-md);
                        transition: background-color 0.2s ease;
                        border: none;
                        cursor: pointer;
                    }
                    
                    .book-button:hover {
                        background-color: #16a34a;
                    }

                    .book-button:disabled {
                        background-color: #9ca3af;
                        cursor: not-allowed;
                    }
                    
                    .no-rides-message {
                        grid-column: span 1 / span 1;
                        text-align: center;
                        color: var(--secondary-text-color);
                        font-size: 1.125rem;
                    }


                    @media (min-width: 640px) {
                        .search-form {
                            flex-direction: row;
                        }

                        .search-button {
                            padding: 0.5rem 1.5rem;
                        }
                    }

                    @media (min-width: 768px) {
                        .search-results-grid {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }
                        
                        .no-rides-message {
                            grid-column: span 2 / span 2;
                        }
                    }

                    @media (min-width: 1024px) {
                        .search-results-grid {
                            grid-template-columns: repeat(3, minmax(0, 1fr));
                        }

                        .no-rides-message {
                            grid-column: span 3 / span 3;
                        }
                    }
                `}
            </style>
            <header className="header">
                <nav className="navbar">
                    <h1 className="logo">RideShare</h1>
                    <div className="nav-links">
                        <button
                            onClick={() => handleViewChange('home')}
                            className="nav-link"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            <span>Home</span>
                        </button>
                        <button
                            onClick={() => handleViewChange('profile')}
                            className="nav-link"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            <span>Profile</span>
                        </button>
                        <button
                            onClick={() => handleViewChange('help')}
                            className="nav-link"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.996-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                            </svg>
                            <span>Help & Feedback</span>
                        </button>
                        <button
                            // This is a placeholder for sign-out logic.
                            onClick={() => {
                                console.log("User signed out.");
                                localStorage.removeItem('mockUserId');
                                window.location.reload(); // Simple reload to simulate a full logout
                            }}
                            className="nav-link"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V7.5a2.25 2.25 0 0 1 2.25-2.25h4.5a2.25 2.25 0 0 1 2.25 2.25V9m-12 5.25h12m-2.25 1.5H10.5m-3.75 2.25v-2.25m4.5-4.5H12m1.5-1.5V15h2.25v-2.25zM12 9V7.5a2.25 2.25 0 0 1 2.25-2.25h4.5a2.25 2.25 0 0 1 2.25 2.25V9m-12 5.25h12m-2.25 1.5H10.5m-3.75 2.25v-2.25m4.5-4.5H12m1.5-1.5V15h2.25v-2.25z" />
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </nav>
            </header>
            <main>
                {renderView()}
            </main>
        </div>
    );
};

export default App;
