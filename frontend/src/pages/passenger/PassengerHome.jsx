import React, {useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { toast,ToastContainer } from "react-toastify";
import axios from "axios";
import io from "socket.io-client";
import { TbArrowRight } from "react-icons/tb"; 
import { FaTrash } from "react-icons/fa"; 

const PassengerHome = () => {
  const navigate = useNavigate(); 

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for mobile menu
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // New state for logout confirmation modal

      // Verify Token
      useEffect(() => {
          // Get token from localStorage
          const token = localStorage.getItem("passengerToken");
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
            localStorage.removeItem("passengerToken");
            navigate("/passenger"); // token invalid or expired
          });

        }, [navigate]);

      // Upcoming Rides
      const [upcomingRides, setUpcomingRides] = useState([]);//NOTED! HERE WE DID'nt pass the token!
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
            const token = localStorage.getItem("passengerToken");
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
              const token = localStorage.getItem("passengerToken");
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


  // Inline SVG Icons from the PassengerHome file
  const ChatIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm4 6h-2v-2h2v2zm0-3h-2V9h2v2zm0-3h-2V6h2v2zm4 6h-2v-2h2v2zm0-3h-2V9h2v2zm0-3h-2V6h2v2z" />
    </svg>
  );
  const HistoryIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.42C9.17 20.37 10.59 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.07V8H12z" />
    </svg>
  );
  const BookedIcon = ({ className = "w-6 h-6", ...props }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
  const UpcomingIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
  );

  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

 // -------------------- Socket Setup --------------------
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("passengerToken");
    if (!token) return;

    const newSocket = io("http://localhost:3000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => console.log("✅ Connected to Socket.IO server:", newSocket.id));
    newSocket.on("connect_error", (err) => console.error("❌ Socket.IO connection error:", err.message));

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

// -------------------- Chat state --------------------
const [chats, setChats] = useState([]);
const [chatToView, setChatToView] = useState(null);
const [messageText, setMessageText] = useState("");


  // ref to avoid stale closures
  const chatToViewRef = useRef(chatToView);
  useEffect(() => {
    chatToViewRef.current = chatToView;
  }, [chatToView]);

  // fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/chat", {
          headers: { Authorization: `Bearer ${localStorage.getItem("passengerToken")}` },
        });
        const chatsWithUnread = res.data.map((c) => ({ ...c, unread: false }));
        setChats(chatsWithUnread);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };
    if (!chatToView) fetchChats();
  }, [chatToView]);

  // join rooms for chats once socket and chats are available
  useEffect(() => {
    if (!socket || !chats || chats.length === 0) return;
    chats.forEach((c) => {
      const otherId = c.driver?._id;
      if (otherId) socket.emit("joinChat", { otherUserId: otherId });
    });
  }, [socket, chats]);

  // socket listener
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (msg) => {
  const currentChat = chatToViewRef.current;

  // If viewing this chat, no unread
  const isUnread = currentChat?.driver?._id !== msg.senderId;

  setChats(prevChats =>
    prevChats.map(c =>
      c.driver?._id === msg.senderId
        ? {
            ...c,
            lastMessage: msg.text,
            lastMessageTime: msg.time,
            unreadCount: isUnread ? (c.unreadCount || 0) + 1 : 0,
          }
        : c
    )
  );

  // Append to messages if this chat is open
  if (!isUnread) {
    setChatToView(prev => ({
      ...prev,
      messages: [...(prev?.messages || []), msg],
    }));
  }
};

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [socket]);

  // send message
  const sendMessage = () => {
    if (!messageText.trim() || !chatToView?.driver?._id || !socket) return;
    const newMsg = { text: messageText, sender: "passenger", time: new Date().toISOString(), _id: Date.now(), senderId: userId };
    setChatToView((prev) => ({ ...prev, messages: [...(prev?.messages || []), newMsg] }));
    setChats((prevChats) =>
      prevChats.map((c) =>
        c.driver?._id === chatToView.driver._id ? { ...c, lastMessage: newMsg.text, lastMessageTime: newMsg.time, unread: false } : c
      )
    );
    socket.emit("sendMessage", { text: messageText, otherUserId: chatToView.driver._id });
    setMessageText("");
  };
// -------------------- Handle Chat Select -------------------- 
    const handleChatSelect = (chat) =>
      { 
        setChatToView(chat); // Reset unread when opening a chat
        setIsMenuOpen(false); 
        setChats((prevChats) => prevChats.map((c) => 
          c.driver._id === chat.driver._id ? { ...c,  unreadCount: 0  } : c ) ); 
      };
//-----------------------------------------------------------

//------------------This All for inside messages-------------
    const messagesRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);

    // Scroll handler to track user position
    const handleScroll = () => {
      const container = messagesRef.current;
      if (!container) return;
      const threshold = 50; // px from bottom
      setIsAtBottom(container.scrollHeight - container.scrollTop - container.clientHeight < threshold);
    };

    // Scroll to bottom effect
    useEffect(() => {
      const container = messagesRef.current;
      if (!container) return;

      // Force scroll to bottom on first render
      if (!container.dataset.initialScrollDone) {
        container.scrollTop = container.scrollHeight;
        container.dataset.initialScrollDone = "true";
      } else if (isAtBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    }, [chatToView?.messages, isAtBottom]);

    // Delete chat only for the passenger
    const handleDeleteChat = async () => {
      if (!chatToView?._id) return; // safety check

      try {
        const res = await fetch(`http://localhost:3000/chat/${chatToView._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("passengerToken")}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          // Remove the chat from local state for the passenger
          setChats(prev => prev.filter(chat => chat.driver?._id !== chatToView.driver?._id));

          setChatToView(null); // Close chat view
          toast.success("Chat deleted successfully for you!");
        } else {
          toast.error(data.message || "Failed to delete chat");
        }
      } catch (err) {
        console.error("Delete chat error:", err);
        toast.error("Server error while deleting chat");
      }
    };

    // Used to comeback from another page intothis message page!
    useEffect(() => {
            if (location.state?.openTab) {
              setActiveTab(location.state.openTab);
            }
      }, [location.state]);

    useEffect(() => {
        if (location.state?.driverId && chats.length > 0) {
          const chatWithDriver = chats.find(
            c => c.driver._id === location.state.driverId
          );
          if (chatWithDriver) {
            setChatToView(chatWithDriver);
            setActiveTab("chats");
          }

          // ✅ clear state so clicking tab later won’t trigger
          navigate(location.pathname, { replace: true });
        }
      }, [location.state, chats]); 


//------------------------------------------------------------


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
                        <div className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                          <span className="font-semibold">{ride.from}</span>
                          <TbArrowRight className="text-lg text-gray-500" />
                          <span className="font-semibold">{ride.to}</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                          <span className="hidden md:inline">
                            Driver: {ride.driverId?.name || "Unknown Driver"} |{" "}
                          </span>
                          {new Date(ride.date).toLocaleDateString("en-GB", {
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
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                      <span className="font-semibold">{ride.from}</span> 
                      <TbArrowRight className="text-lg text-gray-500" />
                      <span className="font-semibold">{ride.to}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                      <span className="hidden md:inline">
                        Driver: {ride.driverId?.name || "Unknown Driver"} |{" "}
                      </span>
                      {new Date(ride.date).toLocaleDateString("en-GB", {
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
              <div className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <span className="font-semibold">{ride.from}</span>
                <TbArrowRight className="text-lg text-gray-500" />
                <span className="font-semibold">{ride.to}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                <span className="hidden md:inline">
                  Driver: {ride.driverId?.name || "Unknown Driver"} |{" "}
                </span>
                {new Date(ride.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })} at {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} |{" "}
                <span className="font-bold text-[#04007f] dark:text-[#2fff75]">
                  ₹{ride.passengers
                      .find(p => p.passengerId === userId)
                      ?.farePaid.toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 h-[600px] overflow-y-auto">
            {chatToView ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                  <button onClick={() => setChatToView(null)} className="text-[#04007f] dark:text-[#2fff75] text-xl">
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h3 className="text-xl font-bold text-[#04007f] dark:text-[#2fff75]">{chatToView.driver?.name || "Unknown"}</h3>
                  <button onClick={() => setShowDeleteModal(true)} className="text-red-500 hover:text-red-700 text-xl">
                    <FaTrash />
                  </button>
                </div>

                {/* Messages */}
                <div ref={messagesRef} onScroll={handleScroll} className="flex-1 overflow-y-auto space-y-4">
                  {chatToView.messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'passenger' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <span className="block text-xs text-right mt-1 opacity-75">
                          {new Date(msg.time).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
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

                {/* Delete Modal */}
                {showDeleteModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-80">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Delete Chat</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this chat?</p>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                        <button onClick={() => { handleDeleteChat(); setShowDeleteModal(false); }} className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-700">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Messages</h3>
                {chats.length > 0 ? (
                  <ul className="space-y-4">
                    {chats.map((chat, index) => (
                      <li key={index}>
                        <button onClick={() => handleChatSelect(chat)} className="w-full text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-4">
                          <img src={defaultProfilePic} alt={chat.driver.name} className="w-12 h-12 rounded-full object-cover" />
                          <div className="flex-1">
                            <div className="text-lg font-medium text-gray-800 dark:text-gray-200 flex justify-between items-center">
                              <span>{chat.driver.name}</span>
                              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
                                {(() => {
                                  if(!chat.lastMessageTime) return "";
                                  const msgDate = new Date(chat.lastMessageTime);
                                  const today = new Date();
                                  const yesterday = new Date();
                                  yesterday.setDate(today.getDate() - 1);

                                  const isToday = msgDate.toDateString() === today.toDateString();
                                  const isYesterday = msgDate.toDateString() === yesterday.toDateString();

                                  const time = msgDate.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  });

                                  if (isToday) {
                                    return `Today, ${time}`;
                                  } else if (isYesterday) {
                                    return `Yesterday, ${time}`;
                                  } else {
                                    return `${msgDate.toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}, ${time}`;
                                  }
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center w-full">
                              <span className={`hidden sm:inline text-sm truncate mt-1 
                                ${chat.unreadCount > 0 ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                                {chat.lastMessage?.length > 30 ? chat.lastMessage.substring(0, 30) + "....." : chat.lastMessage}
                                </span>
                              <span className={`sm:hidden text-sm truncate mt-1 
                                ${chat.unreadCount > 0 ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                                {chat.lastMessage?.length > 10 ? chat.lastMessage.substring(0, 10) + "....." : chat.lastMessage}
                                </span>
                               <span className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                                {(() => {
                                  if(!chat.lastMessageTime) return "";
                                  const msgDate = new Date(chat.lastMessageTime);
                                  const today = new Date();
                                  const yesterday = new Date();
                                  yesterday.setDate(today.getDate() - 1);

                                  const isToday = msgDate.toDateString() === today.toDateString();
                                  const isYesterday = msgDate.toDateString() === yesterday.toDateString();

                                  if (isToday) {
                                    return msgDate.toLocaleTimeString("en-IN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    });
                                  } else if (isYesterday) {
                                    return "Yesterday";
                                  } else {
                                    return msgDate.toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "numeric",
                                      year: "2-digit",
                                    });
                                  }
                                })()}
                              </span>
                              {/* ✅ Unread badge */} 
                              {chat.unreadCount > 0 && ( 
                                <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-bold text-white bg-green-500 rounded-full"> 
                                  {chat.unreadCount} 
                                </span> 
                              )}
                            </div>
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
           <UpcomingIcon className="w-6 h-6 inline-block mr-2" /> Upcoming Rides
          </button>
          <button
            onClick={() => { setActiveTab('booked'); setChatToView(null); }}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'booked' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            <BookedIcon className="w-6 h-6 inline-block mr-2" /> My Booked Rides
          </button>
          <button
            onClick={() => { setActiveTab('history'); setChatToView(null); }}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'history' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            <HistoryIcon className="w-6 h-6 inline-block mr-2" /> Ride History
          </button>
          <button
            onClick={() => { setActiveTab('chats'); }}
            className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'chats' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            <ChatIcon className="w-6 h-6 inline-block mr-2" /> Chats
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
