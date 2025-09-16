import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const PassengerProfile = () => {
  const navigate = useNavigate();

  // Mock data for the passenger's profile
  const passenger = {
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '+1 (555) 123-4567',
    gender: 'Male',
    age: 29,
    profilePic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE3fHx8ZW58MHx8fHx8',
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center">
      {/* Navbar Section */}
      <div className="flex justify-between items-center w-full px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75]">RideShare</h1>
        <nav className="flex items-center space-x-4">
          <button onClick={() => navigate('/passenger-home')} className="text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors">Back to Dashboard</button>
        </nav>
      </div>

      <div className="container mx-auto p-6 md:p-10 w-full max-w-5xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-extrabold text-center mb-6">My Profile</h2>
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="relative w-32 h-32 mb-6">
              <img
                src={passenger.profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-[#04007f] dark:border-[#2fff75] shadow-lg"
              />
              <button className="absolute bottom-0 right-0 bg-[#04007f] dark:bg-[#2fff75] text-white p-2 rounded-full shadow-md">
                <i className="fas fa-camera"></i>
              </button>
            </div>

            {/* Profile Information */}
            <div className="w-full max-w-md space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Full Name</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{passenger.name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Email</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{passenger.email}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Phone Number</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{passenger.phone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Gender</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{passenger.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Age</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{passenger.age}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-md mt-6 space-y-4">
              <button
                onClick={() => alert('Editing profile... (This is a mock action)')}
                className="w-full py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/passenger-home')}
                className="w-full py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-full shadow-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerProfile;