import React, {useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { toast,ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import { TbArrowRight } from "react-icons/tb"; 
import { FaTrash } from "react-icons/fa"; 
//for dropdownlist
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const DriverHome = () => {
    const navigate = useNavigate(); 
    const location = useLocation(); 

    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carNumber, setCarNumber] = useState("");
    const [carColor, setCarColor] = useState("");
    const [totalSeats, setTotalSeats] = useState("");
    const farePerKm = 10; 

    const [calculatedDistance, setCalculatedDistance] = useState(0);
    const [calculatedFare, setCalculatedFare] = useState(0);

    const [activeTab, setActiveTab] = useState('posted');
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    //for posted ride dropdown
    const [psortOrder, setPSortOrder] = useState("newest");
    //for history ride dropdown
    const [HsortOrder, setHSortOrder] = useState("newest"); 



      //Token Verify
      useEffect(() => {
          // Get token from localStorage
          const token = localStorage.getItem("driverToken");
          if (!token) {
            navigate("/driver");
            return;
          }
      
          // Call backend to verify token and get userId
          axios.get(`${process.env.REACT_APP_API_URL}/d/user-info', {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => {
            setUserId(res.data.userId);
            setUserName(res.data.name); 
          })
          .catch(err => {
            localStorage.removeItem("token");
            navigate("/driver"); // token invalid or expired
          });
      
        }, [navigate]);

      //Show driver posted rides
      const [postedRides, setPostedRides] = useState([]);
      const fetchDriverRides = async () => {
          try {
            const token = localStorage.getItem("driverToken");
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/d/posted-rides', {
              headers: { Authorization: `Bearer ${token}` },
            });

            setPostedRides(res.data.rides);
            setUserId(res.data.driverId);
          } catch (err) {
            console.error(
              "Error fetching posted rides:",
              err.response?.data || err.message
            );
          }
        };
        useEffect(() => {
          fetchDriverRides();
        }, []);

      //Validation for Posting New Ride
      const handleSubmit = async (e) => {
        e.preventDefault();

        // Check date-time: must be at least 1 day ahead
        const rideDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        if (rideDateTime - now < 24 * 60 * 60 * 1000) {
          alert("Ride must be at least 24 hours from now!");
          return;
        }

        // 1️⃣ Validate places using OpenStreetMap Nominatim API (free)
        const fetchPlace = async (place) => {
          try{const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            place
          )}`;
          const res = await axios.get(url);
          if (res.data.length === 0) return null;
          return {
            lat: parseFloat(res.data[0].lat),
            lon: parseFloat(res.data[0].lon),
          };
        }catch(e){
          alert("Please check internet connection!");
        }
        };

        const fromLocation = await fetchPlace(from);
        if (!fromLocation) {
          alert("Pick-up location not found!");
          return;
        }

        const toLocation = await fetchPlace(to);
        if (!toLocation) {
          alert("Destination location not found!");
          return;
        }

        // 2️⃣ Calculate distance using Haversine formula
        const toRad = (x) => (x * Math.PI) / 180;
        const R = 6371; // km
        const dLat = toRad(toLocation.lat - fromLocation.lat);
        const dLon = toRad(toLocation.lon - fromLocation.lon);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(fromLocation.lat)) *
            Math.cos(toRad(toLocation.lat)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;

        setCalculatedDistance(distanceKm.toFixed(2));

        // 3️⃣ Calculate fare
        const fare = distanceKm * farePerKm;
        setCalculatedFare(fare.toFixed(2));
        setIsConfirmModalOpen(true);
      };

      //Posting New Rides
      const postRide = async () => {
          try {
            const token = localStorage.getItem("driverToken");
            const postData = {
              from,
              to,
              date: new Date(date),
              time,
              carModel,
              carNumber,
              carColor,
              totalSeats,
              availableSeats: totalSeats,
              distanceKm: calculatedDistance,
              fare: calculatedFare,        
            };
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/d/post-ride', postData, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
              toast.success("Ride posted successfully!");
              // Clear form
              setFrom(""); setTo(""); setDate(""); setTime("");
              setCarModel(""); setCarNumber(""); setTotalSeats("");
              setCarColor("");
              setCalculatedDistance(0); // reset distance
              setCalculatedFare(0);     // reset fare
            } else {
              toast.error(res.data.message || "Failed to post ride.");
            }
          } catch (err) {
            toast.error("Server error!");
          }
      };

      //view specific posted rides - Navigate
      const handleRideClick = (ride) => {
        navigate("/driver/posted-ride", { state: { ride, driverId: userId } });
      };

      // Driver ride history
      const [rideHistory, setRideHistory] = useState([]);
      useEffect(() => {
        const fetchRideHistory = async () => {
          try {
            const token = localStorage.getItem("driverToken");
            const res = await fetch(`${process.env.REACT_APP_API_URL}/d/ride-history', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setRideHistory(data.rides);
          } catch (err) {
            console.error("Error fetching ride history:", err);
          }
        };

        fetchRideHistory();
      }, []);

      const handleLogout = () => {
        setIsLogoutModalOpen(true);
      };

      const confirmLogout = () => {
        localStorage.removeItem("driverToken");
        setIsLogoutModalOpen(false);
        setIsMenuOpen(false); // Close menu after logout
        navigate('/');
      };
      // for scroll to support-help section
      const handleScrollToSupport = () => {
        document.getElementById('support-section').scrollIntoView({ behavior: 'smooth' });
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

  const PostIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );

  const PhoneIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.34 1.05-.18.89.44 1.97.7 3.11.7.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.14.26 2.22.7 3.11.16.38.09.78-.18 1.05l-2.2 2.2z" />
    </svg>
  );

  const EnvelopeIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );

  const PostedIcon = ({ className = "w-6 h-6", ...props }) => (
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h8M8 8h8" />
  </svg>
  );

  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";


// -------------------- Socket Setup --------------------
    const [socket, setSocket] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem("driverToken");
      if (!token) return;

      const newSocket = io(`${process.env.REACT_APP_API_URL}`, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("✅ Driver connected to Socket.IO:", newSocket.id);
      });

      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket.IO connection error:", err.message);
      });

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

// ref to avoid stale closure in socket listener
    const chatToViewRef = useRef(chatToView);
    useEffect(() => {
      chatToViewRef.current = chatToView;
    }, [chatToView]);

// Fetch chats
    useEffect(() => {
      const fetchChats = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/chat`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("driverToken")}` },
          });
          // add unread false by default
          const chatsWithUnread = res.data.map((c) => ({ ...c, unread: false }));
          setChats(chatsWithUnread);
        } catch (err) {
          console.error("Error fetching chats:", err);
        }
      };

      // only fetch when not viewing a single chat
      if (!chatToView) fetchChats();
    }, [chatToView]);

// When socket & chats are ready, join rooms for all chat partners so driver receives messages even if the chat isn't open
    useEffect(() => {
      if (!socket || !chats || chats.length === 0) return;
      chats.forEach((c) => {
        const otherId = c.passenger?._id;
        if (otherId) socket.emit("joinChat", { otherUserId: otherId });
      });
    }, [socket, chats]);

// socket listener for incoming messages
    useEffect(() => {
      if (!socket) return;

      const handleReceiveMessage = (msg) => {
    const currentChat = chatToViewRef.current;

    // If viewing this chat, no unread
    const isUnread = currentChat?.passenger?._id !== msg.senderId;

    setChats(prevChats =>
      prevChats.map(c =>
        c.passenger?._id === msg.senderId
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
      if (!messageText.trim() || !chatToView?.passenger?._id || !socket) return;

      const newMsg = {
        text: messageText,
        sender: "driver",
        time: new Date().toISOString(),
        _id: Date.now(),
        senderId: userId,
      };

      // append locally
      setChatToView((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), newMsg],
      }));

      // update preview
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.passenger?._id === chatToView.passenger._id
            ? { ...c, lastMessage: newMsg.text, lastMessageTime: newMsg.time, unread: false }
            : c
        )
      );

      // emit to server (server will compute room and broadcast)
      socket.emit("sendMessage", {
        text: messageText,
        otherUserId: chatToView.passenger._id,
      });

      setMessageText("");
    };
// -------------------- Handle Chat Select -------------------- 
    const handleChatSelect = async (chat) => {
  try {
    // Fetch full chat from backend
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/chat/${chat._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("driverToken")}` },
    });

    setChatToView(res.data); // set full chat with messages
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

//---------------------------------------------------------

//------------------ This All for messages -----------------
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

      // Delete chat only for the driver
      const handleDeleteChat = async () => {
        console.log(chatToView._id)
        if (!chatToView?._id) return; // safety check

        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/chat/delete/${chatToView._id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("driverToken")}`,
            },
          });

          const data = await res.json();

          if (data.success) {
            // Remove the chat from local state for the driver
            setChats(prev => prev.filter(chat => chat.passenger?._id !== chatToView.passenger?._id));

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
        if (location.state?.passengerId && chats.length > 0) {
          const chatWithPassenger = chats.find(
            c => c.passenger._id === location.state.passengerId
          );
          if (chatWithPassenger) {
            setChatToView(chatWithPassenger);
            setActiveTab("chats");
          }

          // ✅ clear state so clicking tab later won’t trigger
          navigate(location.pathname, { replace: true });
        }
      }, [location.state, chats]); 
//-----------------------------------------------------------


    const renderContent = () => {
      switch (activeTab) {
        case 'posted': {
        // 🔥 Sort posted rides by createdAt (from backend timestamps)
        const sortedPosted = [...postedRides].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return psortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            {/* Header + Sort Dropdown */}
          <div className="flex justify-between items-center mb-4 flex-nowrap">
            <h3 className="text-lg sm:text-2xl font-bold text-[#04007f] dark:text-[#2fff75] truncate">
              My Posted Rides
            </h3>

            {/* Sort Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex justify-between items-center w-auto rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                Sort: {psortOrder === "newest" ? "Newest" : "Oldest"}
                <ChevronDownIcon className="w-4 h-4 ml-1 sm:ml-2" />
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
                          } w-full text-left px-3 py-1 text-sm text-gray-800 dark:text-gray-200 rounded-lg`}
                          onClick={() => setPSortOrder(option.value)}
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
            {sortedPosted.length > 0 ? (
              <ul className="space-y-4">
                {sortedPosted.map((ride) => {
                  const isCanceled = ride.status === "canceled";

                  return (
                    <li
                      key={ride._id}
                      onClick={() => handleRideClick(ride)}
                      className={`cursor-pointer p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center transition-colors 
                        ${
                          isCanceled
                            ? "bg-gray-50 dark:bg-gray-700/30"
                            : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                    >
                      {/* From - To */}
                      <div className="flex flex-col space-y-2 mb-4 md:mb-0">
                        <div className="text-lg font-medium flex items-center space-x-2">
                          <span
                            className={`${
                              isCanceled
                                ? "text-gray-500 dark:text-gray-400 line-through"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {ride.from}
                          </span>
                          <TbArrowRight
                            className={`text-lg ${
                              isCanceled ? "text-gray-500/70" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`${
                              isCanceled
                                ? "text-gray-500 dark:text-gray-400 line-through"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {ride.to}
                          </span>
                        </div>

                        {/* Date/Time */}
                        <div className="text-sm">
                          <span
                            className={`${
                              isCanceled
                                ? "text-gray-500 dark:text-gray-400 line-through"
                                : "text-gray-600 dark:text-gray-400 font-semibold"
                            }`}
                          >
                            {new Date(ride.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Seats & Passengers */}
                      <div className="flex flex-col items-end">
                        {isCanceled ? (
                          <span className="text-gray-500 dark:text-gray-400 font-bold text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full ">
                            Ride Canceled
                          </span>
                        ) : (
                          <>
                            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              <i className="fas fa-couch mr-1 text-gray-700 text-base"></i>
                              {ride.totalSeats - ride.availableSeats} of{" "}
                              {ride.totalSeats} seats booked
                            </span>

                            {ride.passengers?.length > 0 && (
                              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 hidden md:inline">
                                Passengers:{" "}
                                {ride.passengers
                                  ?.filter((p) => p.status === "accepted")
                                  .map((p) => p?.passengerId?.name ?? "Unknown")
                                  .join(", ")}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                You haven't posted any rides yet.
              </p>
            )}
          </div>
        );
        }
        case 'post':
          return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Post a New Ride</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pick-up Location</label>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#5252c3] focus:border-[#5252c3] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Downtown"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#5252c3] focus:border-[#5252c3] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., University Campus"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#5252c3] focus:border-[#5252c3] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#5252c3] focus:border-[#5252c3] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Car Model</label>
                  <input
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#5252c3] focus:border-[#5252c3] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Toyota Camry"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Car Number</label>
                  <input
                    type="text"
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#5252c3] focus:border-[#5252c3] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., AB 1234"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Car Color</label>
                  <input
                    type="text"
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#5252c3] focus:border-[#5252c3] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., silver"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Seats</label>
                  <input
                    type="number"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#5252c3] focus:border-[#5252c3] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., 4"
                    min="1"
                    max="4" // Restrict max seats to a reasonable number
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors"
                >
                  Post Ride
                </button>
              </form>
            </div>
          );
        case 'history': {
          // Sort rides based on date + time
          const sortedHistory = [...rideHistory].sort((a, b) => {
            const [hourA, minA] = a.time.split(":").map(Number);
            const [hourB, minB] = b.time.split(":").map(Number);

            const dateTimeA = new Date(a.date);
            dateTimeA.setHours(hourA, minA, 0, 0);

            const dateTimeB = new Date(b.date);
            dateTimeB.setHours(hourB, minB, 0, 0);

            return HsortOrder === "newest" ? dateTimeB - dateTimeA : dateTimeA - dateTimeB;
          });

          return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              {/* Header + Sort Dropdown */}
          <div className="flex justify-between items-center mb-4 flex-nowrap">
            <h3 className="text-xl sm:text-2xl font-bold text-[#04007f] dark:text-[#2fff75] truncate">
              Ride History
            </h3>

            {/* Sort Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex justify-between items-center w-auto rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 sm:px-4 sm:py-1 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                Sort: {HsortOrder === "newest" ? "Newest" : "Oldest"}
                <ChevronDownIcon className="w-3 sm:w-4 h-3 sm:h-4 ml-2" />
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
                  {sortedHistory.map((ride) => (
                    <li
                      key={ride._id}
                      onClick={() => navigate("/driver/history-ride", { state: { ride } })}
                      className="cursor-pointer bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center hover:shadow-lg transition"
                    >
                      <div className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                        <span className="font-semibold">{ride.from}</span>
                        <TbArrowRight className="text-lg text-gray-500" />
                        <span className="font-semibold">{ride.to}</span>
                      </div>

                      <div className="text-gray-600 dark:text-gray-400 text-sm mt-2 md:mt-0">
                        {new Date(ride.date).toLocaleDateString()} |{" "}
                        <span className="font-bold text-[#04007f] dark:text-[#2fff75]">
                          ₹{ride.fare * (ride.totalSeats - ride.availableSeats)} 
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-bold text-[#04007f] dark:text-[#2fff75]">{chatToView.passenger.name}</h3>
                    <button onClick={() => setShowDeleteModal(true)} className="text-red-500 hover:text-red-700 text-xl">
                      <FaTrash />
                    </button>
                  </div>

                  {/* Messages */}
                  <div ref={messagesRef} onScroll={handleScroll} className="flex-1 overflow-y-auto space-y-4">
                    {chatToView.messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'driver' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
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
                            <img src={chat.passenger?.profilePicture?.data
                            ? `data:${chat.passenger.profilePicture.contentType};base64,${chat.passenger.profilePicture.data}`: defaultProfilePic} className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex-1">
                              <div className="text-lg font-medium text-gray-800 dark:text-gray-200 flex justify-between items-center">
                                <span>{chat.passenger.name}</span>
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
        
        {/* Confirmation for logout */}
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
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation for post ride */}
        {isConfirmModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center max-w-sm w-full">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Confirm Ride Posting</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Distance: {calculatedDistance} km <br />
          Fare per seat: ₹{calculatedFare} <br />
          Total seats: {totalSeats} <br />
          Are you sure you want to post this ride?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              postRide();
              fetchDriverRides();
              setIsConfirmModalOpen(false);
            }}
            className="px-6 py-2 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => setIsConfirmModalOpen(false)}
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
            <button onClick={() => { navigate('/driver/profile'); setIsMenuOpen(false); }} className="text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors flex items-center mr-3">
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

        {/* Main content */}
        <div className="container mx-auto p-6 md:p-10 w-full max-w-5xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-extrabold text-center mb-2">Welcome aboard, {userName}!</h2>
            <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-6">Manage your rides and connect with passengers.</p>
          </div>

          <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setActiveTab('posted')}
              className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'posted' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              <PostedIcon className="w-6 h-6 inline-block mr-2" /> Posted Rides
            </button>
            <button
              onClick={() => setActiveTab('post')}
              className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'post' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              <PostIcon className="w-6 h-6 inline-block mr-2" /> Post a Ride
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'history' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              <HistoryIcon className="w-6 h-6 inline-block mr-2" /> Ride History
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`w-full sm:w-1/4 py-2 text-lg font-semibold rounded-full transition-colors ${activeTab === 'chats' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              <ChatIcon className="w-6 h-6 inline-block mr-2" /> Chats
            </button>
          </div>
          
          {renderContent()}
        </div>
        
        {/* Support-section */}
        <div id="support-section" className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-center">
          <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Help & Support</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">If you have any issues or need to report a problem, please contact us:</p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="w-6 h-6 text-[#04007f] dark:text-[#2fff75]" />
              <span className="text-lg font-medium">Email: contact.rideshare.app@gmail.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon className="w-6 h-6 text-[#04007f] dark:text-[#2fff75]" />
              <span className="text-lg font-medium">Phone: 9876543210</span>
              <ToastContainer position="top-center" autoClose={2000} hideProgressBar toastStyle={{width: "350px"}}/>
            </div>
          </div>
        </div>

      </div>
    );
};

export default DriverHome;
