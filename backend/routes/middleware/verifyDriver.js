const jwt = require("jsonwebtoken");

const verifyDriver = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");

    if (decoded.role !== "driver") {
      return res.status(403).json({ success: false, message: "Forbidden: Not a driver" });
    }

    // attach driver info to request
    req.user = {
      id: decoded.id,   // driverId
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyDriver;
