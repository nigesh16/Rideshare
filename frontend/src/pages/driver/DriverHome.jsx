import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { toast,ToastContainer } from "react-toastify";

const DriverHome = () => {
  const navigate = useNavigate(); 

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [farePerKm, setFarePerKm] = useState(10); 

  const [calculatedDistance, setCalculatedDistance] = useState(0);
  const [calculatedFare, setCalculatedFare] = useState(0);

  const [activeTab, setActiveTab] = useState('posted');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  // State for the new confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/driver");
        return;
      }
  
      // Call backend to verify token and get userId
      axios.get("http://localhost:3000/d/user-info", {
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

     const handleSubmit = async (e) => {
    e.preventDefault();

    // Check date-time: must be at least 1 day ahead
    const rideDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    if (rideDateTime <= now) {
      alert("Ride must be scheduled at least 1 day ahead!");
      return;
    }

    // 1️⃣ Validate places using OpenStreetMap Nominatim API (free)
    const fetchPlace = async (place) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        place
      )}`;
      const res = await axios.get(url);
      if (res.data.length === 0) return null;
      return {
        lat: parseFloat(res.data[0].lat),
        lon: parseFloat(res.data[0].lon),
      };
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

    const postRide = async (distanceKm, fare) => {
      return console.log("Workking buddy!")
      try {
        const token = localStorage.getItem("token");
        const postData = {
          from,
          to,
          date,
          time,
          carModel,
          carNumber,
          totalSeats,
          availableSeats: totalSeats,
          distanceKm,
          fare,
        };

        const res = await axios.post("http://localhost:3000/d/ride-post", postData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          toast.success("Ride posted successfully!", { containerId: "right" });
          // Clear form
          setFrom(""); setTo(""); setDate(""); setTime("");
          setCarModel(""); setCarNumber(""); setTotalSeats(0);
        } else {
          toast.error(res.data.message || "Failed to post ride.", { containerId: "right" });
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error!", { containerId: "right" });
      }
    };


  // Mock data for a logged-in driver
  const driver = {
    name: 'John Doe',
    profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=facearea&face=80%2C80',
  };

  // Mock data for posted rides
  const [postedRides, setPostedRides] = useState([
    {
      id: 1,
      from: '123 Main St, Anytown',
      to: '456 Oak Ave, Somewhere City',
      date: 'Oct 26, 2025',
      time: '08:00 AM',
      seatsBooked: 2,
      totalSeats: 4,
      passengers: [{ name: 'Jane Doe' }, { name: 'Peter Pan' }]
    },
    {
      id: 2,
      from: '789 Pine Ln, Somewhere City',
      to: '101 Elm Dr, Anytown',
      date: 'Oct 27, 2025',
      time: '06:30 PM',
      seatsBooked: 0,
      totalSeats: 3,
      passengers: []
    },
  ]);

  // Mock data for ride history with fares
  const [rideHistory, setRideHistory] = useState([
    { id: 3, passenger: 'Mike Johnson', date: 'Oct 15, 2025', from: 'Home', to: 'Airport', time: '10:00 AM', fare: 25.50 },
    { id: 4, passenger: 'Emily Davis', date: 'Oct 10, 2025', from: 'City Center', to: 'Museum', time: '2:00 PM', fare: 15.75 },
  ]);

  // Mock chat data with passengers
  const [chats, setChats] = useState([
    {
      id: 1,
      passenger: { name: 'Jane Doe', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=facearea&face=80%2C80' },
      lastMessage: "I'll be there in 5 minutes.",
      lastMessageTime: '12:55 PM',
      messages: [
        { sender: 'driver', text: "Hey Jane, I'll be there in a few minutes.", time: '12:55 PM' },
        { sender: 'passenger', text: "Great, thanks for the update!", time: '12:56 PM' }
      ]
    },
    {
      id: 2,
      passenger: { name: 'Peter Pan', profilePic: 'https://images.unsplash.com/photo-1579783483458-1328d0859663?fit=facearea&face=80%2C80' },
      lastMessage: "My car is a white Toyota Camry.",
      lastMessageTime: '7:30 AM',
      messages: [
        { sender: 'passenger', text: "My car is a white Toyota Camry.", time: '7:30 AM' },
        { sender: 'driver', text: "Got it. I'm wearing a red jacket.", time: '7:31 AM' }
      ]
    }
  ]);

  const [chatToView, setChatToView] = useState(null);
  const [rideToPost, setRideToPost] = useState({ 
    from: '', 
    to: '', 
    date: '', 
    time: '', 
    totalSeats: '',
    carModel: '', // New field for car model
    carNo: '' // New field for car number
  });

  const handlePostRide = (e) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const confirmPostRide = () => {
    setCanPost(true);
    setIsConfirmModalOpen(false); // Close the modal
    setActiveTab('posted'); // Navigate back to the "Posted Rides" tab
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    window.location.href = '/';
  };

  const handleScrollToSupport = () => {
    document.getElementById('support-section').scrollIntoView({ behavior: 'smooth' });
  };

  // Inline SVG Icons from the PassengerHome file
  const UserCircleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12s-3.5-1.57-3.5-3.5S10.07 5 12 5zm0 14.2c-2.67 0-5.33-1.34-5.33-4s2.67-4 5.33-4c2.67 0 5.33 1.34 5.33 4s-2.66 4-5.33 4z" />
    </svg>
  );

  const HelpIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z" />
    </svg>
  );

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

  const LogoutIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
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

  const renderContent = () => {
    switch (activeTab) {
      case 'posted':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">My Posted Rides</h3>
            {postedRides.length > 0 ? (
              <ul className="space-y-4">
                {postedRides.map(ride => (
                  <li key={ride.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex flex-col space-y-2 mb-4 md:mb-0">
                      <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{ride.from}</span> to <span className="font-semibold">{ride.to}</span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        <span>{ride.date} at {ride.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {ride.seatsBooked} of {ride.totalSeats} seats booked
                      </span>
                      {ride.passengers.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Passengers: {ride.passengers.map(p => p.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">You haven't posted any rides yet.</p>
            )}
          </div>
        );
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
                      Passenger: {ride.passenger} | {ride.date} | <span className="font-bold text-[#04007f] dark:text-[#2fff75]">${ride.fare.toFixed(2)}</span>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                  </button>
                  <h3 className="text-xl font-bold text-[#04007f] dark:text-[#2fff75]">{chatToView.passenger.name}</h3>
                  <div className="w-8 h-8"></div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {chatToView.messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'driver' ? 'bg-[#04007f] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
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
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5252c3] dark:focus:ring-[#2fff75] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button className="px-4 py-2 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Messages</h3>
                {chats.length > 0 ? (
                  <ul className="space-y-4">
                    {chats.map(chat => (
                      <li key={chat.id}>
                        <button onClick={() => setChatToView(chat)} className="w-full text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-4">
                          <img src={chat.passenger.profilePic} alt={chat.passenger.name} className="w-12 h-12 rounded-full object-cover" />
                          <div className="flex-1">
                            <div className="text-lg font-medium text-gray-800 dark:text-gray-200 flex justify-between items-center">
                              <span>{chat.passenger.name}</span>
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
        <h1 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75]">Driver Dashboard</h1>
        <nav className="flex items-center space-x-4">
          <button onClick={handleScrollToSupport} className="pr-2 text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors flex items-center">
            <HelpIcon className="w-4 h-4 mr-1" /> Help & Support
          </button>
          <button onClick={handleLogout} className="text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors flex items-center">
            <LogoutIcon className="w-4 h-4 mr-1" /> Logout
          </button>
          <img src={driver.profilePic} alt={driver.name} className="w-10 h-10 rounded-full object-cover" />
        </nav>
      </div>

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
            Posted Rides
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
      <div id="support-section" className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-center">
        <h3 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75] mb-4">Help & Support</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">If you have any issues or need to report a problem, please contact us:</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="w-6 h-6 text-[#04007f] dark:text-[#2fff75]" />
            <span className="text-lg font-medium">Email: constackrideshare@gmail.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <PhoneIcon className="w-6 h-6 text-[#04007f] dark:text-[#2fff75]" />
            <span className="text-lg font-medium">Phone: 3453427529</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverHome;