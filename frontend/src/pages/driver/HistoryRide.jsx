import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Clock, Car, Users, Ticket, CheckCircle, Award, X, Ruler } from "lucide-react";
import { FaRegCommentDots } from "react-icons/fa";

const defaultProfilePic =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const calculateAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob)) return null;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

const formatCurrency = (n) =>
  typeof n === "number" ? n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : n;

const getProfilePicSrc = (pic) => {
  try {
    if (!pic) return defaultProfilePic;
    const { data, contentType } = pic;
    if (!data) return defaultProfilePic;

    if (typeof data === "string") {
      return `data:${contentType || "image/jpeg"};base64,${data}`;
    }

    const arr = data.data ? data.data : data;
    if (!arr || !arr.length) return defaultProfilePic;

    let binary = "";
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    const base64 =
      typeof btoa === "function"
        ? btoa(binary)
        : Buffer.from(binary, "binary").toString("base64");
    return `data:${contentType || "image/jpeg"};base64,${base64}`;
  } catch {
    return defaultProfilePic;
  }
};

const HistoryRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ride } = location.state || {};
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300 p-6">
        <p>No ride details available.</p>
      </div>
    );
  }

  const formattedDate = new Date(ride.date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const totalSeatsBooked = (ride.passengers || []).reduce(
    (s, p) => s + (Number(p.seatsBooked) || 0),
    0
  );
  const passengerCount = ride.passengers ? ride.passengers.length : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-3xl w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#04007f] dark:text-[#2fff75]">
            Completed Ride
          </h2>

          <div className="flex flex-wrap sm:flex-row items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
            <div className="flex items-center gap-1 sm:gap-2 bg-green-50 dark:bg-green-900/20 px-2 sm:px-3 py-1 rounded-full">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">
                Completed
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-2 sm:px-3 py-1 rounded-full">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
              <div className="text-right">
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  Earnings
                </div>
                <div className="font-bold text-sm sm:text-base">
                  ₹{formatCurrency(ride.fare * (ride.totalSeats - ride.availableSeats))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip & Car Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md space-y-2">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Trip Info
            </h3>
            <p><span className="font-semibold">From:</span> {ride.from}</p>
            <p><span className="font-semibold">To:</span> {ride.to}</p>
            <p><span className="font-semibold">Date:</span> {formattedDate}</p>
            <p className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="flex items-center gap-1"><Ruler className="w-4 h-4" /> Distance: {formatCurrency(ride.distanceKm)} km</p>
            <p className="flex items-center gap-1"><Ticket className="w-4 h-4" /> Fare per Seat: ₹{formatCurrency(ride.fare)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <strong>Passengers:</strong> {passengerCount} • <strong>Seats:</strong> {totalSeatsBooked}/{ride.totalSeats}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md space-y-2">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Car className="w-5 h-5" /> Car Details
            </h3>
            <p><span className="font-semibold">Model:</span> {ride.carModel}</p>
            <p><span className="font-semibold">Number:</span> {ride.carNumber}</p>
            <p><span className="font-semibold">Color:</span> {ride.carColor}</p>
            <p><span className="font-semibold">Seats (total):</span> {ride.totalSeats}</p>
          </div>
        </div>

        {/* Passengers list */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" /> Passengers
          </h3>

          {ride.passengers && ride.passengers.length > 0 ? (
            <ul className="space-y-2">
              {ride.passengers.map((p) => {
                const person = p.passengerId || p;
                const name = person?.name || p.name || "Unknown";
                const seats = p.seatsBooked ?? person?.seatsBooked ?? 0;
                const farePaid = p.farePaid ?? person?.farePaid ?? 0;
                const imgSrc = person?.profilePicture?.data && person?.profilePicture?.contentType
                  ? `data:${person.profilePicture.contentType};base64,${person.profilePicture.data}`
                  : defaultProfilePic;

                return (
                  <li
                    key={p.passengerId?._id || p._id}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    onClick={() => setSelectedPassenger(p)}
                  >
                    <img src={imgSrc} alt={name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-semibold truncate">{name}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{formatCurrency(ride.fare * p.seatsBooked)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{seats} seat(s)</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No passengers booked.</p>
          )}
        </div>

        {/* Passenger modal with review & rating */}
        {selectedPassenger && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full relative">
              <button
                onClick={() => setSelectedPassenger(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>

              {(() => {
                const p = selectedPassenger;
                const person = p.passengerId || p;
                const imgSrc = person?.profilePicture
                  ? getProfilePicSrc(person.profilePicture)
                  : defaultProfilePic;
                const name = person?.name || p.name || "Unknown";
                const age = calculateAge(person?.dob) ?? "N/A";
                const seats = p.seatsBooked ?? person?.seatsBooked ?? 0;
                const farePaid = seats;
                const rating = p.rating || 0;
                const review = p.review || "No review provided.";

                return (
                  <div className="flex flex-col items-center space-y-4">
                    <img src={imgSrc} alt={name} className="w-24 h-24 rounded-full object-cover" />
                    <h3 className="text-xl font-bold">{name}</h3>
                    <p className="text-sm">Age: {age}</p>
                    <p className="text-sm">Seats Booked: {seats}</p>
                    <p className="text-sm">Fare Paid: ₹{formatCurrency(Number(ride.fare * seats) || 0)}</p>

                    {/* Review & Rating */}
                    <div className="w-full mt-2 text-center">
                      <div className="flex justify-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-400 dark:text-gray-500"}`}>★</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{review}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/driver-home", {
                          state: { openTab: "chats", passengerId: person._id }
                        });
                      }}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#04007f] text-white rounded-full shadow-md hover:bg-[#4747b3]"
                    >
                      <FaRegCommentDots className="w-5 h-5" />
                      Message
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="flex justify-center mt-8">
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

export default HistoryRide;
