import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const PassengerHome = () => {
  const navigate = useNavigate(); 

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for mobile menu
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // New state for logout confirmation modal
  const [chatToView, setChatToView] = useState(null); // New state to handle viewing a specific chat

useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/passenger");
      return;
    }

    // Call backend to verify token and get userId
    axios.get("http://localhost:3000/p/user-info", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUserId(res.data.userId);
      setUserName(res.data.name);
    })
    .catch(err => {
      localStorage.removeItem("token");
      navigate("/passenger"); // token invalid or expired
    });

  }, [navigate]);

  // Mock data for upcoming rides with seats and vehicle details
  const [upcomingRides, setUpcomingRides] = useState([
    {
      id: 1,
      driver: { name: 'John Doe', age: 35, gender: 'Male', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=facearea&face=80%2C80' },
      date: 'Oct 26, 2025',
      from: 'Main Street',
      to: 'University Campus',
      time: '8:00 AM',
      seats: { available: 2, total: 4 },
      vehicle: { model: 'Toyota Camry', license: 'TX-12345', color: 'White' }
    },
    {
      id: 2,
      driver: { name: 'Jane Smith', age: 28, gender: 'Female', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=facearea&face=80%2C80' },
      date: 'Oct 28, 2025',
      from: 'Downtown',
      to: 'Tech Park',
      time: '5:30 PM',
      seats: { available: 3, total: 4 },
      vehicle: { model: 'Honda Civic', license: 'CA-98765', color: 'Black' }
    },
  ]);

  // State for rides that the passenger has booked
  const [myBookedRides, setMyBookedRides] = useState([
    {
      id: 5,
      driver: { name: 'Emily White', age: 31, gender: 'Female', profilePic: 'https://images.unsplash.com/photo-1579783483458-1328d0859663?fit=facearea&face=80%2C80' },
      date: 'Nov 1, 2025',
      from: 'Library',
      to: 'Main Plaza',
      time: '1:00 PM',
      seats: { available: 1, total: 3 },
      vehicle: { model: 'Ford Focus', license: 'WA-55555', color: 'Silver' }
    }
  ]);
  const [rideToCancel, setRideToCancel] = useState(null);

  // Mock data for ride history with fare
  const [rideHistory, setRideHistory] = useState([
    { id: 3, driver: 'Mike Johnson', date: 'Oct 15, 2025', from: 'Home', to: 'Airport', time: '10:00 AM', fare: 25.50 },
    { id: 4, driver: 'Emily Davis', date: 'Oct 10, 2025', from: 'City Center', to: 'Museum', time: '2:00 PM', fare: 15.75 },
  ]);

  // Mock chat data
  const [chats, setChats] = useState([
    {
      id: 1,
      driver: { name: 'Emily White', profilePic: 'https://images.unsplash.com/photo-1579783483458-1328d0859663?fit=facearea&face=80%2C80' },
      lastMessage: "See you at 1pm, I'm running a little early.",
      lastMessageTime: '12:55 PM',
      messages: [
        { sender: 'driver', text: "I'll be there in 5 minutes.", time: '12:55 PM' },
        { sender: 'passenger', text: "Great, thanks for the update!", time: '12:56 PM' }
      ]
    },
    {
      id: 2,
      driver: { name: 'John Doe', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=facearea&face=80%2C80' },
      lastMessage: "My car is a white Toyota Camry.",
      lastMessageTime: '7:30 AM',
      messages: [
        { sender: 'driver', text: "My car is a white Toyota Camry.", time: '7:30 AM' },
        { sender: 'passenger', text: "Got it. I'm wearing a red jacket.", time: '7:31 AM' }
      ]
    }
  ]);

  // Check for newly booked rides from the navigation state and add them.
  // useEffect(() => {
  //   if (location.state && location.state.bookedRide) {
  //     const { bookedRide } = location.state;
  //     setMyBookedRides(prevRides => [...prevRides, bookedRide]);
  //     // Optional: Remove the booked ride from the upcoming list
  //     setUpcomingRides(prevRides => prevRides.filter(ride => ride.id !== bookedRide.id));
  //     // Clear the state to prevent duplicate additions on re-render.
  //     window.history.replaceState({}, document.title, location.pathname);
  //   }
  // }, [location.state, navigate, location.pathname]);

  const handleRideSelect = (ride) => {
    // Navigate to a new confirmation page and pass the ride data
    navigate('/passenger/confirm-ride', { state: { ride } });
  };

  const handleCancelRide = (ride) => {
    setRideToCancel(ride);
  };

  const confirmCancel = () => {
    setMyBookedRides(prevRides => prevRides.filter(ride => ride.id !== rideToCancel.id));
    // In a real app, you would also send a request to your server to update the booking status
    console.log("Ride cancelled:", rideToCancel);
    setRideToCancel(null); // Close the modal
  };

  const cancelConfirmation = () => {
    setRideToCancel(null); // Close the modal without cancelling
  };

  const handleScrollToSupport = () => {
    document.getElementById('support-section').scroll-into-view({ behavior: 'smooth' });
    setIsMenuOpen(false); // Close menu after navigation
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLogoutModalOpen(false);
    setIsMenuOpen(false); // Close menu after logout
    navigate('/');
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const handleChatSelect = (chat) => {
    setChatToView(chat);
    setIsMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Upcoming Rides</h3>
            {upcomingRides.length > 0 ? (
              <ul className="space-y-4">
                {upcomingRides.map(ride => (
                  <li key={ride.id}>
                    <button onClick={() => handleRideSelect(ride)} className="w-full text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                          <span className="font-semibold">{ride.from}</span> to <span className="font-semibold">{ride.to}</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                          Driver: {ride.driver.name} | {ride.date} at {ride.time}
                        </div>
                      </div>
                      <div className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                        <i className="fas fa-couch mr-1"></i> {ride.seats.available} of {ride.seats.total} seats available
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">There are no upcoming rides available at this time.</p>
            )}
          </div>
        );
      case 'booked':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">My Booked Rides</h3>
            {myBookedRides.length > 0 ? (
              <ul className="space-y-4">
                {myBookedRides.map(ride => (
                  <li key={ride.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center">
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">{ride.from}</span> to <span className="font-semibold">{ride.to}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                      Driver: {ride.driver.name} | {ride.date} at {ride.time}
                    </div>
                    <button
                      onClick={() => handleCancelRide(ride)}
                      className="mt-4 md:mt-0 px-4 py-2 bg-red-500 text-white font-bold rounded-full text-sm shadow-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel Ride
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">You have no booked rides yet.</p>
            )}
          </div>
        );
      case 'history':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Ride History</h3>
            {rideHistory.length > 0 ? (
              <ul className="space-y-4">
                {rideHistory.map(ride => (
                  <li key={ride.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center">
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">{ride.from}</span> to <span className="font-semibold">{ride.to}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                      Driver: {ride.driver} | {ride.date} at {ride.time} | <span className="font-bold text-[#04007f] dark:text-[#2fff75]">${ride.fare.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">You have no ride history.</p>
            )}
          </div>
        );
      case 'chats':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            {chatToView ? (
              // Individual Chat View
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                  <button onClick={() => setChatToView(null)} className="text-[#04007f] dark:text-[#2fff75] text-xl">
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h3 className="text-xl font-bold text-[#04007f] dark:text-[#2fff75]">{chatToView.driver.name}</h3>
                  <div className="w-8 h-8"></div> {/* Spacer for alignment */}
                </div>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {chatToView.messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'passenger' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <span className="block text-xs text-right mt-1 opacity-75">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Input area for sending messages */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5252c3] dark:focus:ring-[#2fff75] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button className="px-4 py-2 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Chat List View
              <>
                <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Messages</h3>
                {chats.length > 0 ? (
                  <ul className="space-y-4">
                    {chats.map(chat => (
                      <li key={chat.id}>
                        <button onClick={() => handleChatSelect(chat)} className="w-full text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-4">
                          <img src={chat.driver.profilePic} alt={chat.driver.name} className="w-12 h-12 rounded-full object-cover" />
                          <div className="flex-1">
                            <div className="text-lg font-medium text-gray-800 dark:text-gray-200 flex justify-between items-center">
                              <span>{chat.driver.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{chat.lastMessageTime}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">{chat.lastMessage}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">You have no active chats.</p>
                )}
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center">
      {/* Cancellation Confirmation Modal */}
      {rideToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Are you sure?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Do you really want to cancel this ride?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmCancel}
                className="px-6 py-2 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
              <button
                onClick={cancelConfirmation}
                className="px-6 py-2 bg-gray-300 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-400 transition-colors"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="px-6 py-2 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors"
              >
                Yes, Logout
              </button>
              <button
                onClick={cancelLogout}
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
        <h1 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75]">RideShare</h1>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-800 dark:text-gray-200 text-2xl sm:hidden focus:outline-none"
        >
          <i className="fas fa-bars"></i>
        </button>
        <nav
          className={`${isMenuOpen ? 'flex' : 'hidden'} flex-col sm:flex sm:flex-row items-start sm:items-center w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0 transition-all duration-300 ease-in-out`}
        >
          <button onClick={() => { navigate('/passenger/profile'); setIsMenuOpen(false); }} className="text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors flex items-center mr-3">
            <i className="fas fa-user-circle mr-1"></i> Profile
          </button>
          <button onClick={handleScrollToSupport} className="pr-2 text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors flex items-center ">
            <i className="fas fa-question-circle mr-1"></i> Help & Support
          </button>
          <button onClick={handleLogout} className="text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors flex items-center">
            <i className="fas fa-sign-out-alt mr-1"></i> Logout
          </button>
        </nav>
      </div>

      <div className="container mx-auto p-6 md:p-10 w-full max-w-5xl">
        {/* Welcome and Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-extrabold text-center mb-2">Welcome aboard, {userName}!</h2>
          <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-6">Find your next ride easily.</p>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Enter pick-up location..."
              className="w-full md:flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5252c3] dark:focus:ring-[#2fff75] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              placeholder="Enter destination..."
              className="w-full md:flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5252c3] dark:focus:ring-[#2fff75] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button className="w-full md:w-auto px-6 py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors flex items-center justify-center">
              <i className="fas fa-search mr-2"></i> Find Ride
            </button>
          </div>
        </div>
        
        {/* Tabbed Navigation */}
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => { setActiveTab('upcoming'); setChatToView(null); }}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'upcoming' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            Upcoming Rides
          </button>
          <button
            onClick={() => { setActiveTab('booked'); setChatToView(null); }}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'booked' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            My Booked Rides
          </button>
          <button
            onClick={() => { setActiveTab('history'); setChatToView(null); }}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'history' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            Ride History
          </button>
          <button
            onClick={() => { setActiveTab('chats'); }}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'chats' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            Chats
          </button>
        </div>
        
        {/* Render content based on active tab */}
        {renderContent()}
      </div>

      {/* Help & Support Section */}
      <div id="support-section" className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-center">
        <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Help & Support</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">If you have any issues or need to report a problem, please contact us:</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-envelope text-[#04007f] dark:text-[#2fff75]"></i>
            <span className="text-lg font-medium">Email: constackrideshare@gmail.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-phone-alt text-[#04007f] dark:text-[#2fff75]"></i>
            <span className="text-lg font-medium">Phone: 3453427529</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerHome;
