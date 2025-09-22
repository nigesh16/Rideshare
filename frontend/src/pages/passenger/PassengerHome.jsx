import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { toast,ToastContainer } from "react-toastify";
import axios from "axios";
import io from "socket.io-client";

const PassengerHome = () => {
  const navigate = useNavigate(); 

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for mobile menu
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // New state for logout confirmation modal

  const [socket, setSocket] = useState(null);
  // setup socket connection
      useEffect(() => {
        const newSocket = io("http://localhost:3000", {
          auth: { token: localStorage.getItem("token") },
          transports: ["websocket", "polling"], // fallback
        });

        newSocket.on("connect", () => {
          console.log("✅ Connected to Socket.IO server:", newSocket.id);
        });

        newSocket.on("connect_error", (err) => {
          console.error("❌ Socket.IO connection error:", err.message);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => newSocket.disconnect();
      }, []);

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

  // Upcoming Rides
  const [upcomingRides, setUpcomingRides] = useState([]);
    useEffect(() => {
      const fetchRides = async () => {
        try {
          const res = await axios.get("http://localhost:3000/p/available");
          if (res.data.success) {
            setUpcomingRides(res.data.rides);
          }
        } catch (err) {
          console.error("Error fetching rides:", err);
        }
      };

      fetchRides();
    }, []);

  // Booked Rides
  const [myBookedRides, setMyBookedRides] = useState([]);
      useEffect(() => {
    const fetchBookedRides = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/p/bookedrides", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setMyBookedRides(res.data.rides);
        }
      } catch (err) {
        console.error("Error fetching booked rides:", err.response?.data || err.message);
      }
    };

    fetchBookedRides();
  }, []);

  // History Rides
  const [rideHistory, setRideHistory] = useState([]);
    useEffect(() => {
      const fetchRideHistory = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:3000/p/ride-history", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) {
            setRideHistory(res.data.rides);
          }
        } catch (err) {
          console.error("Error fetching ride history:", err.response?.data || err.message);
        }
      };

      fetchRideHistory();
    }, []);


  // Mock chat data
  const [chatToView, setChatToView] = useState(null);
  const [chats, setChats] = useState([]);
  const [messageText, setMessageText] = useState("");

      // Fetch drivers for rides booked by passenger
      useEffect(() => {
          if (!chatToView) {
            axios.get("http://localhost:3000/chat", {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })
            .then(res => setChats(res.data))
            .catch(err => console.error(err));
          }
        }, [chatToView]);

      useEffect(() => {
        if (!chatToView) return;
        const otherUserId = chatToView.driver._id;
        socket.emit("joinChat", { otherUserId });

        socket.on("receiveMessage", (msg) => {
          if (msg.senderId === otherUserId || msg.sender === "driver") {
            setChatToView(prev => ({ ...prev, messages: [...prev.messages, msg] }));
            setChats(prev => prev.map(c => c.driver._id === otherUserId ? { ...c, lastMessage: msg.text, lastMessageTime: msg.time } : c));
          }
        });

        return () => socket.off("receiveMessage");
      }, [chatToView]);

      const sendMessage = () => {
        if (!messageText.trim()) return;

        const msg = {
          text: messageText,
          otherUserId: chatToView.driver._id
        };

        socket.emit("sendMessage", msg);

        const newMsg = {
          text: messageText,
          sender: "passenger",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          _id: Date.now(), // temporary unique ID
          senderId: userId
        };

        // Update messages in current chat view
        setChatToView(prev => ({ 
          ...prev, 
          messages: [...prev.messages, newMsg] 
        }));

        // Update last message in chats preview
        setChats(prev => prev.map(c => 
          c.driver._id === chatToView.driver._id 
            ? { ...c, lastMessage: newMsg.text, lastMessageTime: newMsg.time } 
            : c
        ));

        setMessageText("");
      };

  




  //for ConfirmRide.jsx
  const handleRideSelect = (ride) => {
    navigate('/passenger/confirm-ride', { state: { ride } });
  };
  //for CancelRide.jsx
  const handleCancelRide = (ride) => {
    navigate('/passenger/cancel-ride', { state: { ride, passengerId: userId  } });
  };
  //for HistoryRide.jsx
  const handleViewHistory = (ride) => {
    navigate("/passenger/ride-history", { state: { ride, passengerId:userId } });
  };
  
  const handleScrollToSupport = () => {
    document.getElementById('support-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
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


  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Upcoming Rides</h3>
            {upcomingRides.length > 0 ? (
              <ul className="space-y-4">
                {upcomingRides.map(ride => (
                  <li key={ride._id}>
                    <button onClick={() => handleRideSelect(ride)} className="w-full text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                          <span className="font-semibold">{ride.from}</span> to <span className="font-semibold">{ride.to}</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                          Driver: {ride.driverId.name} | {new Date(ride.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })} at {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                        <i className="fas fa-couch mr-1"></i> {ride.totalSeats - ride.availableSeats} of {ride.totalSeats} seats booked
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
                  <li key={ride._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center">
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">{ride.from}</span> to <span className="font-semibold">{ride.to}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                      Driver: {ride.driverId.name} | {new Date(ride.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })} at {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <button
                      onClick={() => handleCancelRide(ride)}
                      className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white font-bold rounded-full text-sm shadow-lg hover:bg-green-700 transition-colors"
                    >
                      View Ride
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
      <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">
        Ride History
      </h3>

      {rideHistory.length > 0 ? (
        <ul className="space-y-4">
          {rideHistory.map((ride) => (
            <li
              key={ride._id}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => handleViewHistory(ride)}
            >
              <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                <span className="font-semibold">{ride.from}</span> to{" "}
                <span className="font-semibold">{ride.to}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                Driver: {ride.driverId.name} |  {new Date(ride.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })} at {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} |{" "}
                <span className="font-bold text-[#04007f] dark:text-[#2fff75]">
                  ₹{ride.passengers.find(p => p.passengerId === userId)?.farePaid.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
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
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button onClick={() => setChatToView(null)} className="text-[#04007f] dark:text-[#2fff75] text-xl">
                      <i className="fas fa-arrow-left"></i>
                    </button>
                    <h3 className="text-xl font-bold text-[#04007f] dark:text-[#2fff75]">{chatToView.driver.name}</h3>
                    <div className="w-8 h-8"></div>
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
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5252c3] dark:focus:ring-[#2fff75] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors"
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Messages</h3>
                  {chats.length > 0 ? (
                    <ul className="space-y-4">
                      {chats.map((chat, index)=> (
                        <li key={index}>
                          <button onClick={() => handleChatSelect(chat)} className="w-full text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-4">
                            <img src={defaultProfilePic} alt={chat.driver.name} className="w-12 h-12 rounded-full object-cover" />
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
            <ToastContainer position="top-center" autoClose={2000} hideProgressBar toastStyle={{width: "350px"}}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerHome;
