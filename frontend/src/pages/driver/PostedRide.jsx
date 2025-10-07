import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Clock, Car, Users, Ticket, CheckCircle, X, Ruler } from "lucide-react";
import { FaRegCommentDots, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const PostedRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ride } = location.state || {};
  const [rideState, setRideState] = useState(null);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  const fetchRide = async () => {
    if (!ride?._id) return;
    try {
      const token = localStorage.getItem("driverToken");
      const res = await axios.get(`http://localhost:3000/d/posted-ride/${ride._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setRideState(res.data.ride);
    } catch (err) {
      console.error("Failed to fetch ride:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchRide();
  }, []);

  const formattedDate = new Date(rideState?.date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let statusMessage = "";
  let statusColor = "";
  if (rideState?.status === "available") {
    statusMessage = "Available";
    statusColor = "text-green-600 dark:text-green-400";
  } else if (rideState?.status === "unavailable") {
    statusMessage = "Fully Booked";
    statusColor = "text-yellow-600 dark:text-yellow-400";
  } else if (rideState?.status === "canceled") {
    statusMessage = "Canceled";
    statusColor = "text-red-600 dark:text-red-400";
  }

  const handleRespondPassenger = async (passengerId, action) => {
    try {
      const token = localStorage.getItem("driverToken");
      const res = await axios.post(
        "http://localhost:3000/p/respond",
        { rideId: rideState._id, passengerId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Request ${action}ed successfully!`);
        fetchRide();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(`❌ ${action} failed:`, err.response?.data || err.message);
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleCancelRide = async () => {
    try {
      const token = localStorage.getItem("driverToken");
      const res = await axios.post(
        "http://localhost:3000/d/cancel",
        { rideId: rideState._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Ride canceled successfully!");
        setConfirmCancel(false);
        fetchRide();
      } else toast.error(res.data.message);
    } catch (err) {
      console.error("Cancel ride failed:", err.response?.data || err.message);
      toast.error("Failed to cancel ride");
      setConfirmCancel(false);
    }
  };

  if (!rideState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        <p>Loading ride details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-[#04007f] dark:text-[#2fff75] mb-8 text-center">
          Ride Details
        </h2>

        {rideState?.status === "canceled" && (
          <div className="mx-auto w-full max-w-3xl bg-white dark:bg-gray-800 border border-red-600 px-6 py-4 rounded-xl shadow-md mb-6 flex flex-col items-center text-center gap-1">
            <p className="text-red-700 dark:text-red-400 font-semibold text-base sm:text-lg">
              This scheduled ride is no longer available.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Please check other rides or contact support if needed.
            </p>
          </div>
        )}

        {/* Ride Info & Car Info */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${rideState?.status === "canceled" ? "opacity-70 backdrop-blur-sm" : ""}`}>
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md space-y-2">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Trip Info
            </h3>
            <p><span className="font-semibold">From:</span> {rideState.from}</p>
            <p><span className="font-semibold">To:</span> {rideState.to}</p>
            <p><span className="font-semibold">Date:</span> {formattedDate}</p>
            <p className="flex items-center gap-1 text-sm sm:text-base">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> 
              {new Date(`1970-01-01T${rideState.time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="flex items-center gap-1 text-sm sm:text-base">
              <Ruler className="w-3 h-3 sm:w-4 sm:h-4" /> 
              Distance: {rideState.distanceKm?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km
            </p>
            <p className="flex items-center gap-1 text-sm sm:text-base">
              <Ticket className="w-3 h-3 sm:w-4 sm:h-4" /> 
              Fare per Seat: ₹{rideState.fare?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </p>
            <p className="flex items-center gap-1 text-sm sm:text-base">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> 
              Booking Status: <span className={`font-bold ${statusColor}`}>{statusMessage}</span>
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md space-y-2">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Car className="w-5 h-5" /> Car Details
            </h3>
            <p><span className="font-semibold">Model:</span> {rideState.carModel}</p>
            <p><span className="font-semibold">Number:</span> {rideState.carNumber}</p>
            <p><span className="font-semibold">Color:</span> {rideState.carColor}</p>
            <p><span className="font-semibold">Seats Booked:</span> {rideState.totalSeats - rideState.availableSeats} / {rideState.totalSeats}</p>
          </div>
        </div>

        {/* Passengers */}
        <div className={`mt-8 bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md ${rideState?.status === "canceled" ? "opacity-50 backdrop-blur-sm" : ""}`}>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" /> Passengers
          </h3>

          {rideState.passengers && rideState.passengers.length > 0 ? (
            <ul className="space-y-2">
              {rideState.passengers.filter(p => p.status !== "rejected").map((p, index) => (
                <li
                  key={index}
                  onClick={() => setSelectedPassenger(p)}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <span className={`font-medium ${p.status === "canceled" && rideState?.status !== "canceled" ? "text-gray-400" : ""}`}>
                    {p.passengerId?.name || p.name || "Unknown"} ({p.seatsBooked} seat{p.seatsBooked > 1 ? "s" : ""})
                  </span>

                  {p.status === "pending" && (
                    <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                        Seats Requested: {p.seatsBooked}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={async (e) => { e.stopPropagation(); await handleRespondPassenger(p.passengerId._id, "accept"); }}
                          className="flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 text-green-600 border border-green-600 rounded-full text-sm sm:text-base hover:bg-green-50 dark:hover:bg-green-900 transition"
                        >
                          <FaCheckCircle className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={async (e) => { e.stopPropagation(); await handleRespondPassenger(p.passengerId._id, "reject"); }}
                          className="flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 text-red-600 border border-red-600 rounded-full text-sm sm:text-base hover:bg-red-50 dark:hover:bg-red-900 transition"
                        >
                          <FaHourglassHalf className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {p.status !== "pending" && p.status !== "canceled" && (
                    <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        ₹{(Number(p.seatsBooked) * Number(rideState.fare)).toFixed(2)}
                      </span>
                      {p.farePaid > 0 ? (
                        <span className="flex items-center gap-1 text-green-600 font-semibold text-sm sm:text-base">
                          <FaCheckCircle className="w-4 h-4" /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-500 font-semibold text-sm sm:text-base">
                          <FaHourglassHalf className="w-4 h-4" /> Not Paid
                        </span>
                      )}
                    </div>
                  )}

                  {p.status === "canceled" && (
                    <span className={`${rideState?.status === "canceled" ? "" : "text-gray-400"} text-sm`}>
                      Passenger Canceled: {new Date(p.canceledAt).toLocaleString("en-IN", { 
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No passengers booked yet.</p>
          )}
        </div>


        {/* Passenger Modal */}
        {selectedPassenger && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full relative">
              <button
                onClick={() => setSelectedPassenger(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={
                      selectedPassenger.passengerId?.profilePicture?.data &&
                      selectedPassenger.passengerId?.profilePicture?.contentType
                        ? `data:${selectedPassenger.passengerId.profilePicture.contentType};base64,${selectedPassenger.passengerId.profilePicture.data}`
                        : defaultProfilePic
                    }
                  alt={selectedPassenger.passengerId?.name || "Passenger"}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <h3 className="text-xl font-bold">{selectedPassenger.passengerId?.name || "Unknown"}</h3>
                <p>Age: {selectedPassenger.passengerId?.dob ? new Date().getFullYear() - new Date(selectedPassenger.passengerId.dob).getFullYear() : "N/A"}</p>

                {selectedPassenger.status === "pending" ? (
                  <span className="flex flex-col items-center space-y-2">
                    <p>Seats Requested: {selectedPassenger.seatsBooked}</p>
                    <p>Requested: {new Date(selectedPassenger.requestedAt).toLocaleString()}</p>
                  </span>
                ) : selectedPassenger.status === "canceled" ? (
                  <>
                    <p className="text-gray-400 font-semibold">Booking Canceled</p>
                    <p>Booked At: {new Date(selectedPassenger.bookedAt).toLocaleString()}</p>
                    <p>Canceled At: {new Date(selectedPassenger.canceledAt).toLocaleString()}</p>
                  </>
                ) : (
                  <>
                    <p>Seats Booked: {selectedPassenger.seatsBooked}</p>
                    <p>Total Fare: ₹{(Number(selectedPassenger.seatsBooked) * Number(rideState.fare || 0)).toFixed(2)}</p>
                    <p>Booked At: {new Date(selectedPassenger.bookedAt).toLocaleString()}</p>
                    <p className="flex items-center gap-1">
                      {selectedPassenger.farePaid > 0 ? (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <FaCheckCircle /> Paid
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold flex items-center gap-1">
                          <FaHourglassHalf /> Unpaid
                        </span>
                      )}
                    </p>
                  </>
                )}

                <button
                  onClick={() => {
                    navigate("/driver-home", {
                      state: { openTab: "chats", passengerId: selectedPassenger.passengerId?._id },
                    });
                  }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#04007f] text-white rounded-full shadow-md hover:bg-[#4747b3] transition-all duration-200"
                >
                  <FaRegCommentDots className="w-5 h-5" />
                  Message
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-center" autoClose={2000} hideProgressBar />

        {/* Back & Cancel Buttons */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-all"
          >
            Back
          </button>

          {rideState.status !== "canceled" && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition-all"
            >
              Cancel Ride
            </button>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full relative text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Cancel Ride?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to cancel this ride? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="px-5 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  No
                </button>
                <button
                  onClick={handleCancelRide}
                  className="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostedRide;
