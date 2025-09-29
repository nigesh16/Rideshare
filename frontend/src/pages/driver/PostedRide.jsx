import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Clock, Car, Users, Ticket, CheckCircle, X } from "lucide-react";
import { FaRegCommentDots } from "react-icons/fa";

const PostedRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ride } = location.state || {};
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        <p>No ride details available.</p>
      </div>
    );
  }

  // Format date
  const formattedDate = new Date(ride.date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Friendly status message
  const statusMessage = ride.status === "available" ? "Seats Available" : "Fully Booked";
  const statusColor = ride.status === "available"
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
        {/* Title */}
        <h2 className="text-3xl font-bold text-[#04007f] dark:text-[#2fff75] mb-8 text-center">
          Ride Details
        </h2>

        {/* Ride Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md space-y-2">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Trip Info
            </h3>
            <p><span className="font-semibold">From:</span> {ride.from}</p>
            <p><span className="font-semibold">To:</span> {ride.to}</p>
            <p><span className="font-semibold">Date:</span> {formattedDate}</p>
            <p className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="flex items-center gap-1">
              <Ticket className="w-4 h-4" /> Fare per Seat: ₹{ride.fare.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </p>
            <p className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Booking Status:{" "}
              <span className={`font-bold ${statusColor}`}>{statusMessage}</span>
            </p>
          </div>

          {/* Car Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md space-y-2">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Car className="w-5 h-5" /> Car Details
            </h3>
            <p><span className="font-semibold">Model:</span> {ride.carModel}</p>
            <p><span className="font-semibold">Number:</span> {ride.carNumber}</p>
            <p><span className="font-semibold">Color:</span> {ride.carColor}</p>
            <p><span className="font-semibold">Seats Booked:</span> {ride.totalSeats - ride.availableSeats} / {ride.totalSeats}</p>
          </div>
        </div>

        {/* Passenger Section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" /> Passengers
          </h3>
          {ride.passengers && ride.passengers.length > 0 ? (
            <ul className="space-y-2">
              {ride.passengers.map((p) => (
                <li
                  key={p.passengerId}
                  onClick={() => setSelectedPassenger(p)}
                  className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="font-medium">{p.passengerId.name || "Unknown"}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {p.seatsBooked} seat(s) • ₹{p.farePaid.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
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
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={selectedPassenger.profilePicture || defaultProfilePic}
                  alt={selectedPassenger.passengerId.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <h3 className="text-xl font-bold">{selectedPassenger.passengerId.name}</h3>
                <p>Age: {new Date().getFullYear() -
                    new Date(selectedPassenger.passengerId.dob).getFullYear()}</p>
                <p>Seats Booked: {selectedPassenger.seatsBooked}</p>
                <p>Paid: ₹{selectedPassenger.farePaid.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                <button
                  onClick={() => {
                    navigate("/driver-home", {
                      state: { openTab: "chats", passengerId: selectedPassenger.passengerId._id}
                    });
                  }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#04007f] text-white rounded-full shadow-md hover:bg-[#5252c3]"
                >
                  <FaRegCommentDots className="w-5 h-5" />
                  Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-all"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostedRide;
