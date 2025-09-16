import React, { useState } from 'react';

const AdminApp = () => {
  // Simple state to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Conditional rendering based on login state
  if (isLoggedIn) {
    return <AdminHome setIsLoggedIn={setIsLoggedIn} />;
  } else {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-sm p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-[#04007f] dark:text-[#2fff75]">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={(e) => {
            e.preventDefault();
            // Simple mock authentication logic
            if (email === 'admin@example.com' && password === 'password123') {
              setIsLoggedIn(true);
              setLoginError('');
            } else {
              setLoginError('Invalid email or password.');
            }
          }}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full px-3 py-3 border-b-2 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-xl focus:outline-none focus:ring-[#04007f] focus:border-[#04007f] focus:z-10 sm:text-sm bg-transparent"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full px-3 py-3 border-b-2 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-xl focus:outline-none focus:ring-[#04007f] focus:border-[#04007f] focus:z-10 sm:text-sm bg-transparent"
                  placeholder="Password"
                />
              </div>
            </div>
            {loginError && <p className="text-sm text-center text-red-500">{loginError}</p>}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-full text-white bg-[#04007f] hover:bg-[#5252c3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#04007f] transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};

const AdminHome = ({ setIsLoggedIn }) => {
  const [activeTab, setActiveTab] = useState('verification');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [driverToVerify, setDriverToVerify] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Mock data for pending driver verifications with more details
  const [pendingDrivers, setPendingDrivers] = useState([
    { id: 1, name: 'Alice Smith', email: 'alice.smith@example.com', password: 'password123', age: 28, phone: '555-1234', gender: 'Female', licenseNumber: 'A1234567', carModel: 'Honda Civic', carNo: 'XY 5678', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=facearea&face=80%2C80' },
    { id: 2, name: 'Bob Johnson', email: 'bob.j@example.com', password: 'password456', age: 35, phone: '555-5678', gender: 'Male', licenseNumber: 'B9876543', carModel: 'Toyota Corolla', carNo: 'YZ 9012', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=facearea&face=80%2C80' },
  ]);

  // Mock data for all users, now with more details
  const [allUsers, setAllUsers] = useState([
    { id: 1, name: 'Alice Smith', type: 'Driver', status: 'Pending Verification', age: 28, phone: '555-1234', gender: 'Female', licenseNumber: 'A1234567' },
    { id: 2, name: 'Bob Johnson', type: 'Driver', status: 'Pending Verification', age: 35, phone: '555-5678', gender: 'Male', licenseNumber: 'B9876543' },
    { id: 3, name: 'John Doe', type: 'Driver', status: 'Verified', age: 41, phone: '555-9999', gender: 'Male', licenseNumber: 'C1122334' },
    { id: 4, name: 'Jane Doe', type: 'Passenger', status: 'N/A', age: 22, phone: '555-0000', gender: 'Female' },
    { id: 5, name: 'Mike Johnson', type: 'Passenger', status: 'N/A', age: 30, phone: '555-8888', gender: 'Male' },
  ]);

  // Mock data for all rides
  const [allRides, setAllRides] = useState([
    { id: 101, driver: 'John Doe', passenger: 'Jane Doe', from: 'Downtown', to: 'University' },
    { id: 102, driver: 'Bob Johnson', passenger: 'Mike Johnson', from: 'Airport', to: 'City Center' },
  ]);

  // Mock data for support tickets
  const [supportTickets, setSupportTickets] = useState([
    { id: 201, user: 'Jane Doe', subject: 'Problem with booking', status: 'Open' },
    { id: 202, user: 'John Doe', subject: 'Incorrect fare', status: 'Closed' },
  ]);

  const handleVerifyClick = (driver) => {
    setDriverToVerify(driver);
    setIsVerifyModalOpen(true);
  };

  const confirmVerification = () => {
    setPendingDrivers(pendingDrivers.filter(d => d.id !== driverToVerify.id));
    setAllUsers(allUsers.map(user => 
      user.id === driverToVerify.id ? { ...user, status: 'Verified' } : user
    ));
    setIsVerifyModalOpen(false);
  };

  const handleRejectClick = (driverId) => {
    setPendingDrivers(pendingDrivers.filter(d => d.id !== driverId));
    setAllUsers(allUsers.map(user => 
      user.id === driverId ? { ...user, status: 'Rejected' } : user
    ));
    setIsVerifyModalOpen(false);
  };

  const handleLogout = () => {
    // This now changes the state of the parent component to log out
    setIsLoggedIn(false);
    setIsLogoutModalOpen(false);
  };

  // Inline SVG Icons
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

  const ClipboardIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 1.01L7 1c-1.11 0-2 .89-2 2v18c0 1.11.89 2 2 2h10c1.11 0 2-.89 2-2V3c0-1.11-.89-1.99-2-1.99zM16 21H7V3h9v18z" />
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

  const renderContent = () => {
    switch (activeTab) {
      case 'verification':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-6">Driver Verification</h3>
            {pendingDrivers.length > 0 ? (
              <ul className="space-y-4">
                {pendingDrivers.map(driver => (
                  <li key={driver.id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <img src={driver.profilePic} alt={driver.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" />
                      <div className="text-gray-800 dark:text-gray-200">
                        <p className="text-lg font-semibold">{driver.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{driver.email}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Car: {driver.carModel} ({driver.carNo})</p>
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
        const drivers = allUsers.filter(user => user.type === 'Driver');
        const passengers = allUsers.filter(user => user.type === 'Passenger');

        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-6">All Users</h3>
            
            {/* Drivers Section */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Drivers</h4>
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tl-lg">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tr-lg">License No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(user => (
                      <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 text-sm font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'Verified' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' :
                            user.status === 'Pending Verification' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{user.licenseNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Passengers Section */}
            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Passengers</h4>
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tl-lg">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tr-lg">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers.map(user => (
                      <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 text-sm font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{user.phone || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{user.age || 'N/A'}</td>
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
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-6">All Rides</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-tl-xl">Ride ID</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Driver</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Passenger</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Route</th>
                  </tr>
                </thead>
                <tbody>
                  {allRides.map(ride => (
                    <tr key={ride.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 text-sm">{ride.id}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm font-medium">{ride.driver}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm font-medium">{ride.passenger}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{ride.from} to {ride.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-6">Support Tickets</h3>
            {supportTickets.length > 0 ? (
              <ul className="space-y-4">
                {supportTickets.map(ticket => (
                  <li key={ticket.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1 mb-2 md:mb-0">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Subject: {ticket.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">User: {ticket.user}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'Open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                      }`}>
                        {ticket.status}
                      </span>
                      <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#04007f] dark:hover:text-[#2fff75] transition-colors">
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">No support tickets found.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center">
      {/* Verify Confirmation Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-left max-w-lg w-full relative">
            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Driver Details: {driverToVerify.name}</h3>
            <div className="space-y-3 text-gray-800 dark:text-gray-200">
              <p><strong>Email:</strong> {driverToVerify.email}</p>
              <p><strong>Age:</strong> {driverToVerify.age}</p>
              <p><strong>Phone:</strong> {driverToVerify.phone}</p>
              <p><strong>Gender:</strong> {driverToVerify.gender}</p>
              <p><strong>License Number:</strong> {driverToVerify.licenseNumber}</p>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={confirmVerification}
                className="px-6 py-2 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors"
              >
                Verify
              </button>
              <button
                onClick={() => handleRejectClick(driverToVerify.id)}
                className="px-6 py-2 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors"
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
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setActiveTab('verification')}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'verification' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            <VerifiedIcon className="w-6 h-6 inline-block mr-2" /> Verification
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'users' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            <UserIcon className="w-6 h-6 inline-block mr-2" /> All Users
          </button>
          <button
            onClick={() => setActiveTab('rides')}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'rides' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            <CarIcon className="w-6 h-6 inline-block mr-2" /> All Rides
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'support' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            <ClipboardIcon className="w-6 h-6 inline-block mr-2" /> Support
          </button>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminApp;