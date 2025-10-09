import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaRoute, FaCar, FaUser } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
import axios from "axios";

const RideHistory = () => {
  const navigate = useNavigate();
  const { ride, passengerId } = useLocation().state;

  const passengerData =
    ride.passengers.find((p) => p.passengerId === passengerId) || {};

  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  const [review, setReview] = useState(passengerData.review || "");
  const [rating, setRating] = useState(passengerData.rating || 0);
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (!rating) return alert("Please select a rating!");
    setLoading(true);
    try {
      const token = localStorage.getItem("passengerToken");

    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/p/rides/${ride._id}/review/${passengerId}`,
      { review, rating },
      {
        headers: {
          Authorization: `Bearer ${token}`, // <-- include token
        },
      }
    );
      if (res.data.success) {
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-[#04007f] dark:text-[#2fff75]">
            Ride Completed
          </h2>
          <AiOutlineCheckCircle className="text-green-500 text-4xl" />
        </div>

        {/* Ride Info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <FaRoute /> Ride Info
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-semibold">Route:</span> {ride.from} → {ride.to}
            </li>
            <li>
              <span className="font-semibold">Date & Time:</span>{" "}
              {new Date(ride.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              at{" "}
              {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </li>
            <li>
              <span className="font-semibold">Distance:</span>{" "}
              {ride.distanceKm.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km
            </li>
            <li>
              <span className="font-semibold">Seats Booked:</span> {passengerData.seatsBooked}
            </li>
            <li className="flex items-center">
              <span className="font-semibold mr-2">Fare Paid:</span> ₹
              {ride.fare.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              <AiOutlineCheckCircle className="ml-2 text-green-500" />
            </li>
          </ul>
        </div>

        {/* Driver Info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
            <FaUser /> Driver & Vehicle
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={
                ride.driverId?.profilePicture?.data && ride.driverId?.profilePicture?.contentType
                  ? `data:${ride.driverId.profilePicture.contentType};base64,${ride.driverId.profilePicture.data}`
                  : defaultProfilePic
              }
              alt={`${ride.driverId.name}'s profile`}
              className="w-20 h-20 rounded-full border-4 border-[#04007f] dark:border-[#2fff75] object-cover shadow-md"
            />
            <div className="text-gray-700 dark:text-gray-300 space-y-1">
              <p><span className="font-semibold">Driver:</span> {ride.driverId.name}</p>
              <p><span className="font-semibold">Age:</span> {new Date().getFullYear() - new Date(ride.driverId.dob).getFullYear()}</p>
              <p><span className="font-semibold">Gender:</span> {ride.driverId.gender}</p>
              <p><FaCar className="inline mr-2" /><span className="font-semibold">Vehicle:</span> {ride.carModel}</p>
              <p><span className="font-semibold">Color:</span> {ride.carColor}</p>
              <p><span className="font-semibold">Car Number:</span> {ride.carNumber}</p>
            </div> 
          </div>
        </div>

        {/* Review & Rating */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Give Your Review & Rating
          </h3>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review..."
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#04007f] dark:focus:ring-[#2fff75]"
            rows={3}
          />
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-400 dark:text-gray-500"}`}
              >
                ★
              </button>
            ))}
          </div>
          <button
            onClick={submitReview}
            disabled={loading}
            className="w-full bg-[#04007f] dark:bg-[#2fff75] text-white dark:text-black py-3 rounded-full font-bold shadow-md hover:opacity-90 transition-all"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-all"
        >
          Back to History
        </button>
      </div>
    </div>
  );
};

export default RideHistory;
