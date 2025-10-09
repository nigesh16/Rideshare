import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FaRoute,
  FaCar,
  FaUser,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaCheckCircle,
} from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";

const CancelRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ride, booking } = location.state;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myBooking, setMyBooking] = useState(booking);

  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  // Cancel booking
  const handleCancelRide = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("passengerToken");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/p/cancel`,
        { rideId: ride._id, bookingId: myBooking._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMyBooking({ ...myBooking, status: "canceled" });
      toast.success("Booking canceled successfully!");
      setShowCancelModal(false);
    } catch (err) {
      console.error("❌ Cancel failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayFare = () => {
    toast.info("Redirecting to payment gateway...");
  };

  // Status
  let statusText = "Unknown";
  let statusColor = "text-gray-500";
  let statusIcon = <FaHourglassHalf className="inline mr-2 text-yellow-500" />;

  if (ride.status === "canceled") {
    // Driver canceled ride
    statusText = "Driver Canceled Ride";
    statusColor = "text-red-500";
    statusIcon = <FaRoute className="inline mr-2 text-red-500" />;
  } else if (myBooking) {
    switch (myBooking.status) {
      case "pending":
        statusText = "Pending";
        statusColor = "text-yellow-500";
        statusIcon = <FaHourglassHalf className="inline mr-2 text-yellow-500" />;
        break;
      case "accepted":
        statusText = "Accepted";
        statusColor = "text-green-500";
        statusIcon = <FaCheckCircle className="inline mr-2 text-green-500" />;
        break;
      case "rejected":
        statusText = "Rejected";
        statusColor = "text-red-500";
        statusIcon = <FaRoute className="inline mr-2 text-red-500" />;
        break;
      case "canceled":
        statusText = "Canceled";
        statusColor = "text-gray-400";
        statusIcon = <FaRoute className="inline mr-2 text-gray-400" />;
        break;
      default:
        break;
    }
  }

  const totalFare = (ride.fare || 0) * (myBooking?.seatsBooked || 0);
  const isPaid = myBooking?.farePaid > 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6">
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel this booking?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleCancelRide}
                disabled={loading || myBooking.status === "canceled"}
                className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Canceling..." : "Yes, Cancel Booking"}
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

      {/* Ride & Booking Details */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-lg">
        <div className="mb-6 text-xl font-bold flex items-center justify-center gap-2">
          {statusIcon}
          <span className={statusColor}>{statusText}</span>
        </div>

        <div className="space-y-4 text-left">
          {/* Ride Details */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <FaRoute /> Ride Details
            </h3>
            <p><span className="font-semibold">Route:</span> {ride.from} → {ride.to}</p>
            <p>
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
            </p>
            <p>
              <span className="font-semibold">Seats Booked:</span>{" "}
              {myBooking?.seatsBooked}
            </p>

            {/* Status with time */}
            <div>
              {ride.status === "canceled" && ride.updatedAt && (
                <p>
                  <span className="font-semibold ">
                    Driver canceled on:
                  </span>{" "}
                  {new Date(ride.updatedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(ride.updatedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              {myBooking.status === "accepted" && myBooking.bookedAt && ride.status !== "canceled" && (
                <p>
                  <span className="font-semibold">Accepted on:</span>{" "}
                  {new Date(myBooking.bookedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(myBooking.bookedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              {myBooking.status === "rejected" && myBooking.rejectedAt && (
                <p>
                  <span className="font-semibold">Rejected on:</span>{" "}
                  {new Date(myBooking.rejectedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(myBooking.rejectedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              {myBooking.status === "pending" && myBooking.requestedAt && (
                <p>
                  <span className="font-semibold">Requested on:</span>{" "}
                  {new Date(myBooking.requestedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(myBooking.requestedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              {myBooking.status === "canceled" && myBooking.canceledAt && (
                <p>
                  <span className="font-semibold">Canceled on:</span>{" "}
                  {new Date(myBooking.canceledAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(myBooking.canceledAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>

            <p>
              <span className="font-semibold">Distance:</span>{" "}
              {ride.distanceKm
                ?.toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
              km
            </p>

            {/* Total Fare */}
            {myBooking.status !== "pending" && (
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">Total Fare:</span>
                <span className="flex items-center gap-1">
                  ₹{totalFare.toFixed(2)}
                  {ride.status === "canceled" ? (
                    <span className="text-gray-400 font-bold">Canceled</span>
                  ) : isPaid ? (
                    <>
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-green-600 font-bold">Paid</span>
                    </>
                  ) : myBooking.status === "accepted" ? (
                    <>
                      <FaHourglassHalf className="text-red-500" />
                      <span className="text-red-500 font-bold">Unpaid</span>
                    </>
                  ) : null}
                </span>
              </p>
            )}

            {/* Pay button */}
            {myBooking?.status === "accepted" &&
              !isPaid &&
              ride.status !== "canceled" && (
                <button
                  onClick={handlePayFare}
                  className="text-xs font-semibold mt-3 flex items-center gap-1 px-3 py-2 text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-700 shadow-md hover:from-blue-600 hover:to-blue-800 transition-all"
                >
                  <FaMoneyBillWave className="w-4 h-4" /> Pay Now
                </button>
              )}
          </div>

          {/* Driver Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <FaUser /> Driver & Vehicle
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={
                  ride.driverId?.profilePicture?.data &&
                  ride.driverId?.profilePicture?.contentType
                    ? `data:${ride.driverId.profilePicture.contentType};base64,${ride.driverId.profilePicture.data}`
                    : defaultProfilePic
                }
                alt={`${ride.driverId.name}'s profile`}
                className="w-20 h-20 rounded-full border-2 border-[#04007f] dark:border-[#2fff75] object-cover"
              />
              <div className="text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-semibold">Driver:</span>{" "}
                  {ride.driverId.name}
                </p>
                <p>
                  <span className="font-semibold">Age:</span>{" "}
                  {new Date().getFullYear() -
                    new Date(ride.driverId.dob).getFullYear()}
                </p>
                <p>
                  <span className="font-semibold">Gender:</span>{" "}
                  {ride.driverId.gender}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/passenger-home", {
                  state: { openTab: "chats", driverId: ride.driverId._id },
                })
              }
              className="text-xs font-semibold mb-3 flex items-center gap-1 px-3 py-2 text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-700 shadow-md hover:from-blue-600 hover:to-blue-800 transition-all"
            >
              <FaRegCommentDots className="w-4 h-4" /> Message
            </button>

            <p>
              <FaCar className="inline mr-2" />
              <span className="font-semibold">Vehicle:</span> {ride.carModel}
            </p>
            <p>
              <span className="font-semibold">Color:</span> {ride.carColor}
            </p>
            <p>
              <span className="font-semibold">Car Number:</span>{" "}
              {ride.carNumber}
            </p>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-1/2 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 transition-colors"
          >
            Go Back
          </button>

          {(myBooking.status === "pending" || myBooking.status === "accepted") &&
            ride.status !== "canceled" && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={myBooking.status === "canceled"}
                className="w-full sm:w-1/2 px-6 py-3 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Cancel Booking
              </button>
            )}
        </div>

        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar
          toastStyle={{ width: "350px" }}
        />
      </div>
    </div>
  );
};

export default CancelRide;
