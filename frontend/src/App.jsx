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
import CancelRide from "./pages/passenger/CancelRide";
import RideHistory from "./pages/passenger/RideHistory";
import PostedRide from "./pages/driver/PostedRide";
import HistoryRide from "./pages/driver/HistoryRide";


function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Home/>} />
      
      <Route path="/passenger" element={<Passenger/>} />
      <Route path="/passenger-home" element={<PassengerHome/>} />
      <Route path="/passenger/confirm-ride" element={<ConfirmRide/>} />
      <Route path="/passenger/cancel-ride" element={<CancelRide/>} />
      <Route path="/passenger/ride-history" element={<RideHistory/>} />
      <Route path="/passenger/profile" element={<PassengerProfile/>} />

      <Route path="/driver" element={<Driver/>} />
      <Route path="/driver-home" element={<DriverHome/>} />
      <Route path="/driver/profile" element={<DriverProfile/>} />
      <Route path="/driver/posted-ride" element={<PostedRide/>} />
      <Route path="/driver/history-ride" element={<HistoryRide/>} />
      
      <Route path="/admin" element={<AdminApp/>} />
    </Routes>
    </>
  )
}

export default App


