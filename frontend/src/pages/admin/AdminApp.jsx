import React, { useState, useEffect, useCallback } from 'react';

// --- CONFIGURATION ---
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`; // Your backend port

// --- ICON COMPONENTS (Inline SVG) ---
const UserIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12s-3.5-1.57-3.5-3.5S10.07 5 12 5zm0 14.2c-2.67 0-5.33-1.34-5.33-4s2.67-4 5.33-4c2.67 0 5.33 1.34 5.33 4s-2.66 4-5.33 4z" />
    </svg>
);
const VerifiedIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
);
const CarIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.92 6.01C18.72 5.67 18.23 5.4 17.5 5.4h-11c-.73 0-1.22.27-1.42.61L3 10.48V20h18v-9.52L18.92 6.01zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm9 0c-.83 0-1.5-.67-1.5-1.5S15.67 15 16.5 15s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM4.5 11h15l-1.42-2.5-12.16.01L4.5 11z" />
    </svg>
);
const CloseIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- UTILITY COMPONENT: AdminHome (The main dashboard view) ---
const AdminHome = ({ setIsLoggedIn }) => {
    const [activeTab, setActiveTab] = useState('verification');
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [driverToVerify, setDriverToVerify] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Data States
    const [pendingDrivers, setPendingDrivers] = useState([]);
    const [allUsers, setAllUsers] = useState({ drivers: [], passengers: [] });
    const [allRides, setAllRides] = useState([]);

    // UI/API States
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const getToken = () => localStorage.getItem('adminToken');

    // --- Protected Fetch Utility ---
    // Handles API calls, token inclusion, and automatic logout on 401
    const protectedFetch = useCallback(async (endpoint, method = 'GET', body = null) => {
        setLoading(true);
        setFetchError(null);
        const token = getToken();

        if (!token) {
            // No token found, force logout
            setIsLoggedIn(false);
            setLoading(false);
            return { success: false, message: 'Authentication required.' };
        }

        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Include JWT
                },
            };
            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                setIsLoggedIn(false);
                setFetchError('Session expired. Please log in again.');
                return { success: false, message: 'Session expired.' };
            }

            if (!data.success) {
                setFetchError(data.message || `Failed to fetch data from ${endpoint}`);
            }
            return data;

        } catch (error) {
            console.error('API Call Error:', endpoint, error);
            setFetchError('Network error or server unreachable.');
            return { success: false, message: 'Network error.' };
        } finally {
            setLoading(false);
        }
    }, [setIsLoggedIn]);

    // --- Data Fetchers ---

    const fetchPendingDrivers = useCallback(async () => {
        const data = await protectedFetch('/pending-drivers');
        if (data.success) {
            // Map the fetched data to include a placeholder profile pic and use _id
            setPendingDrivers(data.drivers.map(d => ({
                ...d,
                id: d._id,
                profilePic: `https://placehold.co/100x100/4f46e5/ffffff?text=${d.name.split(' ').map(n => n[0]).join('')}`
            })));
        }
    }, [protectedFetch]);

    const fetchUsers = useCallback(async () => {
        const data = await protectedFetch('/users');
        if (data.success) {
            const drivers = data.drivers.map(d => ({
                ...d,
                id: d._id,
                status: d.adminverification ? 'Verified' : 'Pending Verification',
                type: 'Driver'
            }));
            const passengers = data.passengers.map(p => ({
                ...p,
                id: p._id,
                status: 'N/A',
                type: 'Passenger'
            }));
            setAllUsers({ drivers, passengers });
        }
    }, [protectedFetch]);

    const fetchRides = useCallback(async () => {
        const data = await protectedFetch('/rides');
        if (data.success) {
            // Map the populated ride data structure for simpler display
            const formattedRides = data.rides.map(ride => ({
                id: ride._id.substring(0, 8),
                driverName: ride.driverId?.name || 'Unknown Driver',
                passengerName: ride.passengers?.length || 0,
                from: ride.from || 'Unknown Start',
                to: ride.to || 'Unknown End',
            }));
            setAllRides(formattedRides);
        }
    }, [protectedFetch]);

    // --- useEffect Hooks to Fetch Data on Tab Change ---
    useEffect(() => {
        if (activeTab === 'verification') {
            fetchPendingDrivers();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'rides') {
            fetchRides();
        }
    }, [activeTab, fetchPendingDrivers, fetchUsers, fetchRides]);

    // --- Action Handlers ---

    const handleVerifyClick = (driver) => {
        setDriverToVerify(driver);
        setIsVerifyModalOpen(true);
    };

    const confirmVerification = async () => {
        if (!driverToVerify) return;

        // API call to verify the driver
        const data = await protectedFetch(`/verify-driver/${driverToVerify.id}`, 'PUT');

        if (data.success) {
            // Refetch data to instantly update both tabs
            fetchPendingDrivers();
            fetchUsers();
        }
        // Always close the modal after action attempt
        setIsVerifyModalOpen(false);
    };

    const handleRejectClick = () => {
        // NOTE: Your backend did not include a specific rejection endpoint.
        // For now, we only close the modal. You'd implement a DELETE/PUT call here.
        // For simplicity, we just close the modal.
        setIsVerifyModalOpen(false);
        setFetchError('Rejection endpoint not yet implemented on the server side.');
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsLoggedIn(false);
        setIsLogoutModalOpen(false);
    };

    // --- Content Renderer ---

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center p-12">
                    <div className="w-8 h-8 border-4 border-t-4 border-[#04007f] border-t-transparent rounded-full animate-spin inline-block"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading data...</p>
                </div>
            );
        }
        if (fetchError) {
            return (
                <div className="text-center p-12 bg-red-100 dark:bg-red-900 rounded-xl">
                    <p className="text-red-700 dark:text-red-300 font-semibold">Error: {fetchError}</p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2">Check the console for more details or try logging in again.</p>
                </div>
            );
        }

          const defaultProfilePic =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";


        switch (activeTab) {
            case 'verification':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                        <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-6">Driver Verification Queue</h3>
                        {pendingDrivers.length > 0 ? (
                            <ul className="space-y-4">
                                {pendingDrivers.map(driver => (
                                    <li key={driver.id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between">
                                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                                            <img src={defaultProfilePic} alt={driver.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" />
                                            <div className="text-gray-800 dark:text-gray-200">
                                                <p className="text-lg font-semibold">{driver.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{driver.email}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">License: {driver.license}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVerifyClick(driver)}
                                                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">No new drivers to verify.</p>
                        )}
                    </div>
                );
            case 'users':
                const { drivers, passengers } = allUsers;
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                        <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-6">All Users</h3>
                        
                        {/* Drivers Section */}
                        <div className="mb-8">
                            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Drivers ({drivers.length})</h4>
                            <div className="overflow-x-auto rounded-lg shadow-md">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tl-lg">Name</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tr-lg">license No.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drivers.map(user => (
                                            <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 text-sm font-medium">{user.name}</td>
                                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 text-sm">{user.email}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        user.status === 'Verified' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{user.license}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Passengers Section */}
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Passengers ({passengers.length})</h4>
                            <div className="overflow-x-auto rounded-lg shadow-md">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tl-lg">Name</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Gender</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tr-lg">DOB</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {passengers.map(user => (
                                            <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 text-sm font-medium">{user.name}</td>
                                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 text-sm">{user.email}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{user.gender || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{user.dob || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'rides':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                        <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-6">All Rides ({allRides.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tl-xl">Ride ID</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Driver</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Passengers</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Route</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allRides.map(ride => (
                                        <tr key={ride.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 text-sm">{ride.id}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm font-medium">{ride.driverName}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm font-medium">{ride.passengerName}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{ride.from} to {ride.to}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center">
            {/* Verify Confirmation Modal */}
            {isVerifyModalOpen && driverToVerify && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-left max-w-lg w-full relative">
                        <button
                            onClick={() => setIsVerifyModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Verify Driver: {driverToVerify.name}</h3>
                        <div className="space-y-3 text-gray-800 dark:text-gray-200">
                            <p><strong>ID:</strong> {driverToVerify.id}</p>
                            <p><strong>Email:</strong> {driverToVerify.email}</p>
                            <p><strong>Age:</strong> {new Date().getFullYear() - new Date(driverToVerify.dob).getFullYear()}</p>
                            <p><strong>Gender:</strong> {driverToVerify.gender}</p>
                            <p><strong>License Number:</strong> {driverToVerify.license}</p>
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={confirmVerification}
                                disabled={loading}
                                className="px-6 py-2 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Verifying...' : 'Confirm Verify'}
                            </button>
                            <button
                                onClick={handleRejectClick}
                                disabled={loading}
                                className="px-6 py-2 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center max-w-sm w-full relative">
                        <button
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Confirm Logout</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to log out?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            >
                                Confirm Logout
                            </button>
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="px-6 py-2 bg-gray-300 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar Section */}
            <div className="flex flex-wrap justify-between items-center w-full px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
                <h1 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75]">Admin Dashboard</h1>
                <nav className="flex items-center space-x-4">
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors"
                    >
                        Logout
                    </button>
                </nav>
            </div>

            <div className="container mx-auto p-6 md:p-10 w-full max-w-5xl">
                {/* Navigation Tabs - Updated to 3 tabs, using w-1/3 */}
                <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={() => setActiveTab('verification')}
                        className={`w-full sm:w-1/3 py-3 text-lg font-semibold rounded-full transition-colors ${activeTab === 'verification' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                    >
                        <VerifiedIcon className="w-6 h-6 inline-block mr-2" /> Verification
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full sm:w-1/3 py-3 text-lg font-semibold rounded-full transition-colors ${activeTab === 'users' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                    >
                        <UserIcon className="w-6 h-6 inline-block mr-2" /> All Users
                    </button>
                    <button
                        onClick={() => setActiveTab('rides')}
                        className={`w-full sm:w-1/3 py-3 text-lg font-semibold rounded-full transition-colors ${activeTab === 'rides' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                    >
                        <CarIcon className="w-6 h-6 inline-block mr-2" /> All Rides
                    </button>
                </div>
                
                {renderContent()}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: AdminApp (Handles login state) ---
const AdminApp = () => {
    // Check for existing token in localStorage on mount
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.success && data.token) {
                // Store token and switch to home view
                localStorage.setItem('adminToken', data.token);
                setIsLoggedIn(true);
            } else {
                setLoginError(data.message || 'Invalid email or password.');
            }
        } catch (err) {
            console.error('Login API Error:', err);
            setLoginError('Failed to connect to server. Ensure your backend is running on port 3000.');
        } finally {
            setLoading(false);
        }
    };

    if (isLoggedIn) {
        return <AdminHome setIsLoggedIn={setIsLoggedIn} />;
    } else {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
                <div className="w-full max-w-sm p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold text-[#04007f] dark:text-[#2fff75]">
                            Admin Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Sign in to your account
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm">
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full px-3 py-3 border-b-2 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-xl focus:outline-none focus:ring-[#04007f] focus:border-[#04007f] focus:z-10 sm:text-sm bg-transparent mb-3"
                                placeholder="Email address"
                                disabled={loading}
                            />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full px-3 py-3 border-b-2 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-xl focus:outline-none focus:ring-[#04007f] focus:border-[#04007f] focus:z-10 sm:text-sm bg-transparent"
                                placeholder="Password"
                                disabled={loading}
                            />
                        </div>
                        {loginError && <p className="text-sm text-center text-red-500">{loginError}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-full text-white bg-[#04007f] hover:bg-[#5252c3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#04007f] transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
};

export default AdminApp;
