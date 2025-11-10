  import React, { useState } from "react";
  import axios from "axios";
  import toast, { Toaster } from "react-hot-toast";
  import { useAuth } from "../context/AuthContext";
  import { requestEmailOtp, verifyEmailOtp } from "../api/users";
  import OtpModal from "../components/OtpModal";

  export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);
    const [otpModal, setOtpModal] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");

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
      if (!name.trim() || !email.trim()) {
        toast.error("Name and email cannot be empty!");
        return;
      }

      const token = localStorage.getItem("token");

      // ✅ If email changed → OTP flow
      if (email !== user.email) {
        try {
          await requestEmailOtp(user.id, email, token);
          toast.success("OTP sent to new email!");
          setPendingEmail(email);
          setOtpModal(true);
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to send OTP");
        }
        return;
      }

      // ✅ Name-only update
      try {
        const res = await axios.put(
          `http://localhost:4000/users/update/${user.id}`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data.user);
        toast.success("Profile updated successfully!");
      } catch {
        toast.error("Something went wrong while updating profile.");
      }
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex justify-center items-center px-4 py-10">
  <Toaster position="top-center" />
  <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full transition-all hover:shadow-blue-200">
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
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="text-gray-500 text-sm">Gender</label>
        <select
          value={user.gender || ""}
          onChange={(e) => setUser({ ...user, gender: e.target.value })}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Address */}
      <div>
        <label className="text-gray-500 text-sm">Address</label>
        <textarea
          rows="2"
          value={user.address || ""}
          onChange={(e) => setUser({ ...user, address: e.target.value })}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        ></textarea>
      </div>

      {/* Phone */}
      <div>
        <label className="text-gray-500 text-sm">Phone</label>
        <input
          type="text"
          value={user.phone || ""}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="text-gray-500 text-sm">Bio</label>
        <textarea
          rows="2"
          value={user.bio || ""}
          onChange={(e) => setUser({ ...user, bio: e.target.value })}
          placeholder="Write a short description about yourself..."
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        ></textarea>
      </div>

      {/* Role */}
      <div>
        <label className="text-gray-500 text-sm">Role</label>
        <input
          type="text"
          value={
            typeof user.role === "object"
              ? user.role.name || "User"
              : user.role || "User"
          }
          readOnly
          className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>
    </div>

    {/* Save Button */}
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
    </div>
  </div>
</div>

    );
  }
