import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// axios base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // backend URL
});

const DriverProfile = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const defaultProfilePic =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  // Fetch driver details
  const fetchDriver = async () => {
    try {
      const token = localStorage.getItem("driverToken");
      if (!token) throw new Error("No token found");

      const res = await api.get("/d/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDriver(res.data);
      console.log("Driver found:", res.data);
    } catch (err) {
      console.error("Fetch driver error:", err);
      setDriver(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, []);

  // Handle file select
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload profile picture
  const handleUpload = async () => {
    if (!selectedFile) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("driverToken");
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      await api.post("/d/profile/picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedFile(null);
      fetchDriver();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading profile...</p>;

  const profilePic = driver?.profilePicture || defaultProfilePic;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      {/* Header */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/driver-home")}
          className="bg-[#04007f] dark:bg-[#2fff75] text-white dark:text-gray-900 px-4 py-2 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
        >
          ← Back
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-[#04007f] dark:text-[#2fff75]">
          Driver Profile
        </h2>

        {/* Profile Picture */}
        <div className="relative mb-6">
          <img
            src={profilePic}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#04007f] dark:border-[#2fff75] shadow-lg"
          />
          <label className="absolute bottom-0 right-0 bg-[#04007f] dark:bg-[#2fff75] text-white dark:text-gray-900 p-2 rounded-full shadow-md cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <i className="fas fa-camera"></i>
          </label>
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={updating}
              className="mt-3 w-full bg-[#04007f] dark:bg-[#2fff75] text-white dark:text-gray-900 py-2 rounded-full font-semibold hover:opacity-90 transition"
            >
              {updating ? "Uploading..." : "Upload Picture"}
            </button>
          )}
        </div>

        {/* Driver Info */}
        <div className="w-full space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
            <p className="text-lg font-semibold">{driver?.name || "Not provided"}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-lg font-semibold">{driver?.email || "Not provided"}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
            <p className="text-lg font-semibold">{driver?.dob || "Not provided"}</p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
              <p className="text-lg font-semibold">{driver?.gender || "Not provided"}</p>
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">License</p>
              <p className="text-lg font-semibold">{driver?.license || "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
