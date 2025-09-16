import { Routes, Route } from "react-router-dom";
import Driver from './pages/driver/Driver'
import Passenger from './pages/passenger/Passenger'
import Home from './Home'
import PassengerHome from './pages/passenger/PassengerHome';
import ConfirmRide from './pages/passenger/ConfirmRide';
import PassengerProfile from "./pages/passenger/PassengerProfile";
import DriverHome from "./pages/driver/DriverHome";
import DriverProfile from "./pages/driver/DriverProfile";
import AdminApp from "./pages/admin/AdminApp";


function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/driver" element={<Driver/>} />
      <Route path="/passenger" element={<Passenger/>} />
      <Route path="/passenger-home" element={<PassengerHome/>} />
      <Route path="/passenger/confirm-ride" element={<ConfirmRide/>} />
      <Route path="/passenger/profile" element={<PassengerProfile/>} />
      <Route path="/driver-home" element={<DriverHome/>} />
      <Route path="/driver/profile" element={<DriverProfile/>} />
      <Route path="/admin" element={<AdminApp/>} />
    </Routes>
    </>
  )
}

export default App


