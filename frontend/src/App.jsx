
import './App.css'
import { Routes, Route } from "react-router-dom";
import Driver from './pages/driver/Driver'
import DriverHome from './pages/driver/DriverHome'
import Passenger from './pages/passenger/Passenger'
import Home from './Home'
import PassengerHome from './pages/passenger/PassengerHome';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';


function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/driver" element={<Driver/>} />
      <Route path="/passenger" element={<Passenger/>} />
      <Route path="/driverHome" element={<DriverHome/>} />
      <Route path="/passengerHome" element={<PassengerHome/>} />
      <Route path="/adminDashboard" element={<AdminDashboard/>} />
    </Routes>
    </>
  )
}

export default App
