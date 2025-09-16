import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

function Home() {
  const handleScrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      {/* Font Awesome for Icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Header and Call-to-Action Section */}
      <div className="relative flex flex-col items-center justify-center w-full bg-indigo-900 dark:bg-gray-800 text-white py-24 px-4 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 animate-slide-in-down">
            Welcome to <span className="text-emerald-400">RideShare</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 dark:text-gray-300 mb-8 max-w-3xl animate-slide-in-up">
            Your trusted platform for seamless ride sharing and carpooling. Find or offer a ride with ease and security.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 mt-12 w-full max-w-xl">
            {/* Driver Card */}
            <Link
              to="/driver"
              className="flex-1 flex flex-col items-center justify-center p-8 bg-emerald-500 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-emerald-600 transform hover:scale-105 transition-all duration-300"
            >
              <i className="fas fa-car text-white text-5xl mb-4"></i>
              <h3 className="text-white text-2xl font-bold">I'm a Driver</h3>
            </Link>
            
            {/* Passenger Card */}
            <Link
              to="/passenger"
              className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-indigo-900 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-200"
            >
              <i className="fas fa-user-friends text-indigo-900 text-5xl mb-4"></i>
              <h3 className="text-2xl font-bold">I'm a Passenger</h3>
            </Link>
          </div>
          <button
            onClick={() => handleScrollToSection('how-it-works-section')}
            className="bg-transparent text-white font-bold py-3 px-8 rounded-full shadow-lg border-2 border-white hover:bg-white hover:text-indigo-900 transform hover:scale-105 transition-all duration-300 mt-8"
          >
            How it Works
          </button>
        </div>
      </div>

      {/* Why Choose Us Section with Image */}
      <div id="about-section" className="w-full max-w-7xl px-4 py-12 md:py-24 text-center">
        <h2 className="text-4xl font-extrabold text-indigo-900 dark:text-teal-400 mb-12">Why should I Carpool?</h2>
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="w-full md:w-1/2 text-left space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex items-start">
                <div className="bg-indigo-900 dark:bg-teal-400 text-white p-3 rounded-full flex-shrink-0 mr-4">
                  <i className="fas fa-dollar-sign text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Save up to 80% on Commute Cost</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    RideShare users save up to 80% of travel costs per month on commute costs compared to people who opt for cabs/autos.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex items-start">
                <div className="bg-indigo-900 dark:bg-teal-400 text-white p-3 rounded-full flex-shrink-0 mr-4">
                  <i className="fas fa-user-friends text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Expand your Professional Network</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Carpool with professionals from different domains and expand your professional network while commuting.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex items-start">
                <div className="bg-indigo-900 dark:bg-teal-400 text-white p-3 rounded-full flex-shrink-0 mr-4">
                  <i className="fas fa-leaf text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Reduce Pollution & Save Environment</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Carpool and reduce traffic and pollution.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* SVG Illustration */}
          <div className="w-full md:w-1/2 flex justify-center p-4">
            <svg className="w-full max-w-xl h-auto text-blue-500 dark:text-blue-400" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
              {/* Car body */}
              <path d="M475 180H25C11.1929 180 0 191.193 0 205V280H500V205C500 191.193 488.807 180 475 180Z" className="fill-gray-300 dark:fill-gray-700"/>
              <rect x="50" y="100" width="400" height="100" rx="25" className="fill-teal-500"/>
              <rect x="60" y="110" width="380" height="80" rx="20" className="fill-teal-400"/>
              {/* Roof and windows */}
              <path d="M120 100L140 50L360 50L380 100L120 100Z" className="fill-gray-400 dark:fill-gray-600"/>
              <path d="M140 60L160 55L340 55L360 60L140 60Z" className="fill-gray-300 dark:fill-gray-500"/>
              {/* Wheels */}
              <circle cx="150" cy="210" r="25" className="fill-gray-800 dark:fill-gray-900"/>
              <circle cx="350" cy="210" r="25" className="fill-gray-800 dark:fill-gray-900"/>
              <circle cx="150" cy="210" r="15" className="fill-gray-200 dark:fill-gray-800"/>
              <circle cx="350" cy="210" r="15" className="fill-gray-200 dark:fill-gray-800"/>
              {/* Details */}
              <path d="M150 100L170 140L140 140L120 100Z" className="fill-teal-400"/>
              <path d="M350 100L330 140L360 140L380 100Z" className="fill-teal-400"/>
              <rect x="230" y="150" width="40" height="50" className="fill-gray-400 dark:fill-gray-600"/>
              <path d="M175 105C175 105 185 115 200 115C215 115 225 105 225 105C225 105 235 115 250 115C265 115 275 105 275 105Z" className="fill-gray-500 dark:fill-gray-800" />
            </svg>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div id="how-it-works-section" className="w-full max-w-7xl px-4 py-12 md:py-24 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-8">
        <h2 className="text-4xl font-extrabold text-indigo-900 dark:text-teal-400 mb-12">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="bg-indigo-900 dark:bg-teal-400 text-white p-4 rounded-full inline-block mb-4">
              <i className="fas fa-map-marker-alt text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">1. Find a Ride</h3>
            <p className="text-gray-600 dark:text-gray-400">Enter your pickup and destination to find available rides instantly.</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="bg-indigo-900 dark:bg-teal-400 text-white p-4 rounded-full inline-block mb-4">
              <i className="fas fa-car text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">2. Book & Go</h3>
            <p className="text-gray-600 dark:text-gray-400">Book your preferred ride and get real-time updates from your driver.</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="bg-indigo-900 dark:bg-teal-400 text-white p-4 rounded-full inline-block mb-4">
              <i className="fas fa-check-circle text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">3. Arrive Safely</h3>
            <p className="text-gray-600 dark:text-gray-400">Enjoy your ride and reach your destination safely and on time.</p>
          </div>
        </div>
      </div>

      {/* Help & Support Section */}
      <div id="support-section" className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-center">
        <h3 className="text-2xl font-bold text-indigo-900 dark:text-teal-400 mb-4">Help & Support</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">If you have any issues or need assistance, please reach out to us:</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-envelope text-indigo-900 dark:text-teal-400"></i>
            <a href="mailto:rideshare@gmail.com" className="text-lg font-medium hover:underline">Email: rideshare@gmail.com</a>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-phone-alt text-indigo-900 dark:text-teal-400"></i>
            <a href="tel:3784972692" className="text-lg font-medium hover:underline">Phone: 3784972692</a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full p-6 text-center text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700">
        <p>&copy; 2024 RideShare. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Home;