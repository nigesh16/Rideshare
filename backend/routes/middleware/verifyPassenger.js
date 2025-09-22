const jwt = require("jsonwebtoken");

const verifyPassenger = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach passenger info to request
    req.user = {
      id: decoded.id,   // passengerId
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyPassenger;

