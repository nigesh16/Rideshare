const express = require("express");
const router = express.Router();
const User = require("../../models/DriverModel");
const verifyDriver = require("../middleware/verifyDriver");
const multer = require("multer");

// 🔹 Multer setup for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =====================
// ✅ GET Driver Profile
// =====================
router.get("/", verifyDriver, async (req, res) => {
  try {
    const driver = await User.findById(req.user.id).select("-password");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // ✅ Convert stored base64 image to data URL
    let profilePicture = null;
    if (driver.profilePicture?.data && driver.profilePicture?.contentType) {
      profilePicture = `data:${driver.profilePicture.contentType};base64,${driver.profilePicture.data}`;
    }

    res.json({
      name: driver.name,
      email: driver.email,
      dob: driver.dob,
      gender: driver.gender,
      license: driver.license,
      profilePicture,
    });
  } catch (err) {
    console.error("Error fetching driver profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// ✅ POST / Update Profile Picture
// =====================
router.post("/picture", verifyDriver, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const driver = await User.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // ✅ Convert buffer → base64 before saving
    driver.profilePicture = {
      data: req.file.buffer.toString("base64"),
      contentType: req.file.mimetype,
    };

    await driver.save();
    res.json({ message: "Profile picture updated successfully" });
  } catch (err) {
    console.error("Error uploading driver picture:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
