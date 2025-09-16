import React from 'react';
import { useNavigate } from 'react-router-dom';

const DriverProfile = () => {
  const navigate = useNavigate();

  // Mock data for the driver's profile
  const driver = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 987-6543',
    gender: 'Male',
    age: 35,
    profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=facearea&face=80%2C80',
  };

  const CameraIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-2 2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM21 4H8.5l-1.41-1.41L5.66 4H3c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 17H3V6h18v15z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center">
      {/* Navbar Section */}
      <div className="flex justify-between items-center w-full px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-[#04007f] dark:text-[#2fff75]">Driver Dashboard</h1>
        <nav className="flex items-center space-x-4">
          <button onClick={() => navigate('/driver-home')} className="text-sm font-medium hover:text-[#5252c3] dark:hover:text-[#2fff75] transition-colors">Back to Dashboard</button>
        </nav>
      </div>

      <div className="container mx-auto p-6 md:p-10 w-full max-w-5xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-extrabold text-center mb-6">My Profile</h2>
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="relative w-32 h-32 mb-6">
              <img
                src={driver.profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-[#04007f] dark:border-[#2fff75] shadow-lg"
              />
              <button className="absolute bottom-0 right-0 bg-[#04007f] dark:bg-[#2fff75] text-white p-2 rounded-full shadow-md">
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Information */}
            <div className="w-full max-w-md space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Full Name</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{driver.name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Email</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{driver.email}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Phone Number</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{driver.phone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm flex justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Gender</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{driver.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Age</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{driver.age}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-md mt-6 space-y-4">
              <button
                onClick={() => console.log('Editing profile...')}
                className="w-full py-3 bg-[#04007f] text-white font-bold rounded-full shadow-lg hover:bg-[#5252c3] transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/driver-home')}
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

export default DriverProfile;
