import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaRoute, FaCar, FaUser } from "react-icons/fa";

const CancelRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ride, passengerId } = location.state; // assume ride always exists

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  const handleCancelRide = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("passengerToken");
      await axios.post(
        "http://localhost:3000/p/cancel",
        { rideId: ride._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Ride canceled successfully!");
      setShowCancelModal(false);

      // Go back to passenger home or refresh booked rides
      navigate("/passenger-home");
    } catch (err) {
      console.error("❌ Cancel failed:", err.response?.data || err.message);
      toast.error("Failed to cancel ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const myBooking = ride.passengers.find(p => p.passengerId === passengerId);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel this ride?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelRide}
                disabled={loading}
                className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Canceling..." : "Yes, Cancel Ride"}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 transition-colors"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ride Details */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-lg w-full">
        <h2 className="text-3xl font-extrabold text-[#04007f] dark:text-[#2fff75] mb-4">
          Cancel Ride
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Review the ride details before canceling.
        </p>

        <div className="space-y-4 text-left">
          {/* Ride Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <FaRoute /> Ride Details
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Route:</span> {ride.from} → {ride.to}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Date & Time:</span> {new Date(ride.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })} at {new Date(`1970-01-01T${ride.time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Seats Booked:</span> {myBooking?.seatsBooked}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Distance:</span> {ride.distanceKm?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Fare:</span> ₹{myBooking?.farePaid.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </p>
          </div>

          {/* Driver Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <FaUser /> Driver & Vehicle
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={ride.driverId.profilePicture || defaultProfilePic}
                alt={`${ride.driverId.name}'s profile`}
                className="w-20 h-20 rounded-full border-2 border-[#04007f] dark:border-[#2fff75] object-cover"
              />
              <div className="text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-semibold">Driver:</span> {ride.driverId.name}
                </p>
                <p>
                  <span className="font-semibold">Age:</span>{" "}
                  {new Date().getFullYear() - new Date(ride.driverId.dob).getFullYear()}
                </p>
                <p>
                  <span className="font-semibold">Gender:</span> {ride.driverId.gender}
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <FaCar className="inline mr-2" />
              <span className="font-semibold">Vehicle:</span> {ride.carModel}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Color:</span> {ride.carColor}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">License Plate:</span> {ride.driverId.license}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full md:w-1/2 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full md:w-1/2 px-6 py-3 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors"
          >
            Cancel Ride
          </button>
          <ToastContainer position="top-center" autoClose={2000} hideProgressBar toastStyle={{ width: "350px" }} />
        </div>
      </div>
    </div>
  );
};

export default CancelRide;
