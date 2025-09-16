import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

const ConfirmRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ride } = location.state || {}; // Get ride data from navigation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!ride) {
    // If no ride data is found (e.g., user navigates here directly), redirect to home
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-lg w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Ride Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">It looks like you accessed this page without selecting a ride. Please go back and select a ride to view its details.</p>
          <button
            onClick={() => navigate('/passenger/home')}
            className="w-full px-6 py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmRide = () => {
    // Now this function just shows the modal, it doesn't navigate directly
    setShowConfirmModal(true);
  };

  const finalizeBooking = () => {
    // This is where you would send a request to your server to book the ride.
    // In a real application, you'd perform a fetch() call here.
    console.log("Confirming ride:", ride);
    
    // After a successful booking, navigate to the passenger home and pass the booked ride data.
    setShowConfirmModal(false);
    navigate('/passenger-home', { state: { bookedRide: ride } });
  };

  // Generic user silhouette SVG data URL for a cleaner look
  const defaultProfilePic = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      {/* The single confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Final Confirmation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to confirm this ride?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={finalizeBooking}
                className="px-6 py-2 bg-[#2fff75] text-[#04007f] font-bold rounded-lg hover:bg-[#13d463] transition-colors"
              >
                Yes, Confirm
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-lg w-full">
        <h2 className="text-3xl font-extrabold text-[#04007f] dark:text-[#2fff75] mb-4">Confirm Your Ride</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Please review the details below before you confirm.</p>
        
        <div className="space-y-4 text-left">
          {/* Ride Details Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Ride Details</h3>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Route:</span> {ride.from} to {ride.to}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Date & Time:</span> {ride.date} at {ride.time}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Seats Available:</span> {ride.seats.available} of {ride.seats.total}
            </p>
          </div>

          {/* Driver & Vehicle Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Driver & Vehicle</h3>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={ride.driver.profilePic || defaultProfilePic}
                alt={`${ride.driver.name}'s profile`}
                className="w-20 h-20 rounded-full border-2 border-[#04007f] dark:border-[#2fff75] object-cover"
              />
              <div className="text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-semibold">Driver:</span> {ride.driver.name}
                </p>
                <p>
                  <span className="font-semibold">Age:</span> {ride.driver.age}
                </p>
                <p>
                  <span className="font-semibold">Gender:</span> {ride.driver.gender}
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Vehicle:</span> {ride.vehicle.color} {ride.vehicle.model}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">License Plate:</span> {ride.vehicle.license}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="w-full md:w-1/2 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmRide}
            className="w-full md:w-1/2 px-6 py-3 bg-[#2fff75] text-[#04007f] font-bold rounded-full shadow-lg hover:bg-[#13d463] transition-colors"
          >
            Confirm Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRide;