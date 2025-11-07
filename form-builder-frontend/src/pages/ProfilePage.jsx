import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth(); // ✅ get user + setter from context
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-blue-50">
        <p className="text-lg text-gray-700 font-medium">
          Please login to view your profile.
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:4000/users/update/${user.id}`,
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Update user in AuthContext instantly
      setUser(res.data.user);

      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex justify-center items-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">
          My Profile
        </h2>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="text-gray-500 text-sm">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-500 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="text-gray-500 text-sm">Role</label>
            <input
              type="text"
              value={user.role || "User"}
              readOnly
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {/* <button
            onClick={logout}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            Logout
          </button> */}
        </div>

        {/* Status Message */}
        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("Error") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
