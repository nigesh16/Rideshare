import React, {useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { toast,ToastContainer } from "react-toastify";
import axios from "axios";
import io from "socket.io-client";
import { TbArrowRight } from "react-icons/tb"; 
import { FaTrash } from "react-icons/fa"; 
//for dropdownlist
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
//for reset rotate
import { FiRefreshCw  } from "react-icons/fi";

const PassengerHome = () => {
  const navigate = useNavigate(); 

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for mobile menu
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // New state for logout confirmation modal
  //for history ride (dropdownlist)
  const [UsortOrder, setUSortOrder] = useState("newest");
  //for booked ride (dropdownlist)
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); 
  //for history ride (dropdownlist)
  const [hsortOrder, setHSortOrder] = useState("newest");
  //for searching ride
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchApplied, setSearchApplied] = useState(false);
  const [resetRotating, setResetRotating] = useState(false);

      // Verify Token
      useEffect(() => {
          // Get token from localStorage
          const token = localStorage.getItem("passengerToken");
          if (!token) {
            navigate("/passenger");
            return;
          }

          // Call backend to verify token and get userId
          axios.get(`${process.env.REACT_APP_API_URL}/p/user-info`, {
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
              const res = await axios.get(`${process.env.REACT_APP_API_URL}/p/available`);
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
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/p/bookedrides`, {
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
              const res = await axios.get(`${process.env.REACT_APP_API_URL}/p/ride-history`, {
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
      const handleCancelRide = (ride, booking) => {
        navigate('/passenger/cancel-ride', { 
          state: { 
            ride, 
            passengerId: userId, 
            booking 
          } 
        });
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
        localStorage.removeItem("passengerToken");
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

    const newSocket = io(`${process.env.REACT_APP_API_URL}`, {
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
    const handleChatSelect = async (chat) => {
  try {
    // Fetch the full chat with all messages
    const res = await axios.get(`http://localhost:3000/chat/${chat._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("passengerToken")}` },
    });
    setChatToView(res.data); // full chat messages
    setChats(prevChats =>
      prevChats.map(c =>
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );
    setIsMenuOpen(false);
  } catch (err) {
    console.error("Failed to fetch chat:", err);
  }
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
        const res = await fetch(`http://localhost:3000/chat/delete/${chatToView._id}`, {
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

//----------- for searching rides -------------
    const handleSearch = () => {
      setSearchApplied(true);
    };
    const handleResetSearch = () => {
      setSearchFrom("");
      setSearchTo("");
      setSearchDate("");
      setSearchApplied(false);
        // Trigger rotation animation
      setResetRotating(true);
      setTimeout(() => setResetRotating(false), 500); 
    };
//----------------------------------------------

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming': {
        // 🔥 Sort upcoming rides based on combined date + time
        const sortedUpcoming = [...upcomingRides].sort((a, b) => {
          const [hourA, minA] = a.time.split(":").map(Number);
          const [hourB, minB] = b.time.split(":").map(Number);

          const dateTimeA = new Date(a.date);
          dateTimeA.setHours(hourA, minA, 0, 0);

          const dateTimeB = new Date(b.date);
          dateTimeB.setHours(hourB, minB, 0, 0);

          return UsortOrder === "newest" ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
        });

        // 🔍 Filter only if search is applied
        const filteredUpcoming = searchApplied
  ? sortedUpcoming.filter((ride) => {
      const matchesFrom = searchFrom
        ? ride.from.toLowerCase().includes(searchFrom.toLowerCase())
        : true;
      const matchesTo = searchTo
        ? ride.to.toLowerCase().includes(searchTo.toLowerCase())
        : true;
      const matchesDate = searchDate
        ? new Date(ride.date).toISOString().split("T")[0] === searchDate
        : true;
      return matchesFrom && matchesTo && matchesDate;
    })
  : sortedUpcoming; 

        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8">
            {/* Header + Sort Dropdown */}
            <div className="flex justify-between items-center mb-4 gap-2 flex-wrap md:flex-nowrap">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#04007f] dark:text-[#2fff75]">
                Upcoming Rides
              </h3>

              {/* Sort Dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex justify-between items-center w-auto rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 sm:px-4 sm:py-1 text-xs sm:text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  Date: {UsortOrder === "newest" ? "Nearest" : "Oldest"}
                  <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    {[
                      { value: "newest", label: "Nearest → Oldest" },
                      { value: "oldest", label: "Oldest → Nearest" },
                    ].map((option) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "bg-blue-100 dark:bg-blue-900" : ""
                            } w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-lg`}
                            onClick={() => setUSortOrder(option.value)}
                          >
                            {option.label}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            {/* Ride List */}
            {filteredUpcoming.length > 0 ? (
              <ul className="space-y-4">
                {filteredUpcoming.map((ride) => (
                  <li key={ride._id}>
                    <button
                      onClick={() => handleRideSelect(ride)}
                      className="w-full text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2 w-full md:w-auto">
                          <span className="font-semibold">{ride.from}</span>
                          <TbArrowRight className="text-lg text-gray-500" />
                          <span className="font-semibold">{ride.to}</span>
                        </div>

                        <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base w-full md:w-auto flex flex-wrap gap-1 sm:gap-2 mt-1 md:mt-0">
                          <span className="hidden md:inline">
                            Driver: {ride.driverId?.name || "Unknown Driver"} |
                          </span>
                          <span>
                            {new Date(ride.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span>
                            at{" "}
                            {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Seats booked on next line with color */}
                      <div className="mt-2 font-bold text-[#04007f] dark:text-[#2fff75] text-sm flex items-center">
                        <i className="fas fa-couch mr-1"></i>
                        {ride.totalSeats - ride.availableSeats} of {ride.totalSeats} seats booked
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                {searchApplied ? "No upcoming rides match your search." : "There are no upcoming rides available at this time."}
              </p>
            )}
          </div>
        );
      }
      case "booked": {
      const rideRequests = myBookedRides.flatMap(ride =>
        ride.passengers.map(p => ({
          rideId: ride._id,
          from: ride.from,
          to: ride.to,
          date: ride.date,
          time: ride.time,
          driver: ride.driverId?.name || "Unknown Driver",
          seatsBooked: p.seatsBooked,
          status: p.status,
          booking: p,
          originalRide: ride,
          bookedAt: p.bookedAt || p.requestedAt || ride.createdAt,
        }))
      );

      const sortedRides = [...rideRequests].sort((a, b) =>
        sortOrder === "newest"
          ? new Date(b.bookedAt) - new Date(a.bookedAt)
          : new Date(a.bookedAt) - new Date(b.bookedAt)
      );

      const filteredRides = (() => {
        if (filterStatus === "all") return sortedRides;
        if (filterStatus === "driverCanceled") {
          return sortedRides.filter(
            r => r.originalRide?.status === "canceled" && r.status === "accepted"
          );
        }
        if (filterStatus === "canceled") {
          return sortedRides.filter(
            r => r.status === "canceled" && r.originalRide?.status !== "canceled"
          );
        }
        return sortedRides.filter(
          r => r.status === filterStatus && r.originalRide?.status !== "canceled"
        );
      })();

      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#04007f] dark:text-[#2fff75] text-center md:text-left flex-1">
              My Booked Rides
            </h3>

            {/* Sort + Filter row */}
            <div className="flex justify-center md:justify-end gap-3 flex-wrap">
              {/* Sort Dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex justify-center items-center rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    {[
                      { label: "Newest First", value: "newest" },
                      { label: "Oldest First", value: "oldest" },
                    ].map(option => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "bg-blue-100 dark:bg-blue-900" : ""
                            } w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-lg`}
                            onClick={() => setSortOrder(option.value)}
                          >
                            {option.label}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Filter Dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex justify-center items-center rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  {filterStatus === "driverCanceled"
                    ? "Driver Canceled"
                    : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    {["all", "accepted", "pending", "rejected", "canceled", "driverCanceled"].map(option => (
                      <Menu.Item key={option}>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "bg-blue-100 dark:bg-blue-900" : ""
                            } w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-lg`}
                            onClick={() => setFilterStatus(option)}
                          >
                            {option === "driverCanceled"
                              ? "Driver Canceled"
                              : option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          {/* Rides List */}
          {filteredRides.length > 0 ? (
            <ul className="space-y-4">
              {filteredRides.map((req, index) => {
                const isDriverCanceled = req.originalRide?.status === "canceled";
                const blurClass = isDriverCanceled ? "line-through opacity-80" : "";

                let statusColor = "";
                switch (req.status) {
                  case "accepted":
                    statusColor = "bg-green-100 text-green-800";
                    break;
                  case "rejected":
                    statusColor = "bg-red-100 text-red-800";
                    break;
                  case "pending":
                    statusColor = "bg-yellow-100 text-yellow-800";
                    break;
                  case "canceled":
                    statusColor = "bg-gray-100 text-gray-800";
                    break;
                  default:
                    statusColor = "bg-gray-100 text-gray-800";
                }

                return (
                  <li
                    key={`${req.rideId}-${index}`}
                    className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col sm:flex-col md:flex-row md:justify-between md:items-center gap-3 ${
                      isDriverCanceled ? "opacity-90" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className={`text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2 ${blurClass}`}>
                        <span className="font-semibold">{req.from}</span>
                        <TbArrowRight className="text-lg text-gray-500" />
                        <span className="font-semibold">{req.to}</span>
                      </div>
                      <div className={`text-gray-600 dark:text-gray-400 text-sm ${blurClass}`}>
                        Driver: {req.driver} |{" "}
                        {new Date(req.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(`1970-01-01T${req.time}`).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      {isDriverCanceled ? (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          Driver Canceled Ride ({req.seatsBooked}{" "}
                          {req.seatsBooked > 1 ? "seats" : "seat"})
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)} ({req.seatsBooked}{" "}
                          {req.seatsBooked > 1 ? "seats" : "seat"})
                        </span>
                      )}
                      <button
                        onClick={() => handleCancelRide(req.originalRide, req.booking)}
                        className={`w-full sm:w-auto px-4 py-2 font-bold rounded-full text-sm shadow-lg transition-colors ${
                          isDriverCanceled
                            ? "bg-red-200 text-red-800 hover:bg-red-300"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        View Ride
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              You have no booked rides yet.
            </p>
          )}
        </div>
      );
      }
      case "history": {
      const sortedHistory = [...rideHistory].sort((a, b) => {
        return hsortOrder === "newest"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      });

      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8">
          {/* Header + Sort Dropdown */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-[#04007f] dark:text-[#2fff75]">
              Ride History
            </h3>

            {/* Sort Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex justify-between items-center w-auto rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                Sort: {hsortOrder === "newest" ? "Newest" : "Oldest"}
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  {[
                    { value: "newest", label: "Newest → Oldest" },
                    { value: "oldest", label: "Oldest → Newest" },
                  ].map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? "bg-blue-100 dark:bg-blue-900" : ""
                          } w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-lg`}
                          onClick={() => setHSortOrder(option.value)}
                        >
                          {option.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Ride List */}
          {sortedHistory.length > 0 ? (
            <ul className="space-y-4">
              {sortedHistory.map((ride) => {
                const passenger = ride.passengers.find(p => p.passengerId === userId);
                const fare = passenger?.farePaid || 0;

                return (
                  <li
                    key={ride._id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col sm:flex-col md:flex-row md:justify-between md:items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleViewHistory(ride)}
                  >
                    {/* Route + Driver */}
                    <div className="flex flex-col gap-1">
                      <div className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                        <span className="font-semibold">{ride.from}</span>
                        <TbArrowRight className="text-lg text-gray-500" />
                        <span className="font-semibold">{ride.to}</span>
                      </div>

                      <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base flex flex-wrap gap-1 sm:gap-2">
                        <span className="hidden md:inline">
                          Driver: {ride.driverId?.name || "Unknown Driver"} |
                        </span>
                        <span>
                          {new Date(ride.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>
                          at{" "}
                          {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>|</span>
                        <span className="font-bold text-[#04007f] dark:text-[#2fff75]">
                          ₹{ride.fare.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              You have no ride history.
            </p>
          )}
        </div>
      );
      }
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
                          <img src={
                            chat.driver?.profilePicture?.data && chat.driver?.profilePicture?.contentType
                              ? `data:${chat.driver.profilePicture.contentType};base64,${chat.driver.profilePicture.data}`
                              : defaultProfilePic
                          } alt={chat.driver.name} className="w-12 h-12 rounded-full object-cover" />
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
        <h2 className="text-3xl font-extrabold text-center mb-2">
          Welcome aboard, {userName}!
        </h2>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-6">
          Find your next ride easily.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full">
        <input
          type="text"
          placeholder="Enter pick-up location..."
          value={searchFrom}
          onChange={(e) => setSearchFrom(e.target.value)}
          className="w-full md:flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5252c3] dark:focus:ring-[#2fff75] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        <input
          type="text"
          placeholder="Enter destination..."
          value={searchTo}
          onChange={(e) => setSearchTo(e.target.value)}
          className="w-full md:flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5252c3] dark:focus:ring-[#2fff75] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]} // ✅ prevents past dates
          className="w-full md:w-52 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5252c3] dark:focus:ring-[#2fff75] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* Buttons: Find + Reset */}
        <div className="flex flex-row items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSearch}
            className="flex-1 md:flex-none w-full md:w-auto px-6 py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors flex items-center justify-center"
          >
            <i className="fas fa-search mr-2"></i> Find Ride
          </button>

          <button
            onClick={handleResetSearch}
            className={`p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform ${
              resetRotating ? "animate-spin" : ""
            }`}
          >
            <FiRefreshCw size={20} />
          </button>
        </div>
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
            <span className="text-lg font-medium">Email: contact.rideshare.app@gmail.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-phone-alt text-[#04007f] dark:text-[#2fff75]"></i>
            <span className="text-lg font-medium">Phone: 9876543210</span>
            <ToastContainer position="top-center" autoClose={2000} hideProgressBar toastStyle={{width: "350px"}}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerHome;
