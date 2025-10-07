const express = require("express");
const router = express.Router();
const Passenger = require("../../models/PassengerModel");
const verifyPassenger = require("../middleware/verifyPassenger");
const multer = require("multer");

// 🔹 Multer setup for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =====================
// ✅ GET Passenger Profile
// =====================
router.get("/", verifyPassenger, async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.user.id).select("-password");
    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    // ✅ Convert stored Base64 image to displayable format
    let profilePicture = null;
    if (passenger.profilePicture?.data && passenger.profilePicture?.contentType) {
      profilePicture = `data:${passenger.profilePicture.contentType};base64,${passenger.profilePicture.data}`;
    }

    res.json({
      name: passenger.name,
      email: passenger.email,
      dob: passenger.dob,
      gender: passenger.gender,
      profilePicture,
    });
  } catch (err) {
    console.error("Error fetching passenger profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// ✅ POST / Update Profile Picture
// =====================
router.post("/picture", verifyPassenger, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const passenger = await Passenger.findById(req.user.id);
    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    // ✅ Convert image buffer → Base64 and store
    passenger.profilePicture = {
      data: req.file.buffer.toString("base64"),
      contentType: req.file.mimetype,
    };

    await passenger.save();

    res.json({ message: "Profile picture updated successfully" });
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
