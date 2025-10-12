🚗 RideShare – Ride-Sharing Platform
Live Demo

📌 Project Overview
RideShare is a full-stack ride-sharing web application connecting drivers and passengers.

Drivers can:
• Register (admin approval required) and add car details (model, seats, etc.).
• Post rides with date, time, route, and automatically calculated distance-based fare.

Passengers can:
• Browse available rides matching their route and date.
• Book one or multiple seats in a ride.
• Confirm booking once the driver accept.

The platform also enables real-time communication using Socket.IO chat, and admins can view all users and rides efficiently.

🚀 Key Features:
🔐 User Authentication & Verification – Secure login with JWT; email verification with Nodemailer.
🚌 Driver Ride Management – Post rides with seat/fare info; admin approval for drivers.
🪑 Passenger Seat Booking – Book one or multiple seats; ride confirmed after driver acceptance.
💬 Real-Time Chat – Live chat between driver and passenger with Socket.IO.
🛠️ Admin Dashboard – Manage all users and rides.
💻 Responsive UI – React + Tailwind CSS for clean, intuitive experience.

🛠️ Technologies Used:
💻 Frontend: React.js, Tailwind CSS, Axios, React Router DOM.
🧠 Backend: Node.js, Express.js, Mongoose, bcryptjs, JWT, dotenv, cors.
🗃️ Database: MongoDB Atlas.
💬 Real-Time Communication: Socket.IO.

🚀 Deployment:
Frontend – Vercel | Backend – Render
