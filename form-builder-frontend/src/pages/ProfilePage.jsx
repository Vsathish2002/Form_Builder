import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Edit3, Check, X } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    address: user?.address || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });


  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        dob: user.dob || "",
        gender: user.gender || "",
        address: user.address || "",
        phone: user?.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSave = async () => {
    setLoading(true);

    if (!formData.name.trim()) {
      toast.error("Name cannot be empty!");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:4000/users/update/${user.id}`,
        {
          name: formData.name,
          dob: formData.dob || null,
          gender: formData.gender || null,
          address: formData.address || "",
          bio: formData.bio || "",
          phone: formData.phone || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Profile updated!");

      setEditMode(false);
    } catch (err) {
      toast.error("Error updating profile");
    }

    setLoading(false);
  };


  const cancelEditing = () => {
    setFormData({
      name: user.name,
      email: user.email,
      dob: user.dob || "",
      gender: user.gender || "",
      address: user.address || "",
      bio: user.bio || "",
    });
    setEditMode(false);
  };

  const updateField = (key, value) =>
    setFormData({ ...formData, [key]: value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 flex justify-center items-center px-4 py-6 sm:px-6 sm:py-8 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/60 backdrop-blur-lg shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-2xl xl:max-w-3xl w-full border border-white/20 relative z-10 mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-indigo-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mb-2">
              My Profile
            </h2>
            <p className="text-gray-500 text-sm">
              Manage your personal details
            </p>
          </div>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div>
              <label className="text-gray-500 text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                readOnly={!editMode}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full mt-1 px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
                  editMode
                    ? "bg-white/80 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    : "bg-gray-100/80 text-gray-600 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="text-gray-500 text-sm font-medium flex items-center justify-between">
                Email
                <span className="text-xs text-gray-400">Read only</span>
              </label>
              <input
                type="email"
                readOnly
                value={formData.email}
                className="w-full mt-1 px-3 sm:px-4 py-2 rounded-lg border bg-gray-100/80 text-gray-600 cursor-not-allowed text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="text-gray-500 text-sm font-medium">
                Date of Birth
              </label>
              <input
                type="date"
                readOnly={!editMode}
                value={formData.dob}
                onChange={(e) => updateField("dob", e.target.value)}
                className={`w-full mt-1 px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
                  editMode
                    ? "bg-white/80 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    : "bg-gray-100/80 text-gray-600 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="text-gray-500 text-sm font-medium">
                Gender
              </label>
              <select
                disabled={!editMode}
                value={formData.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                className={`w-full mt-1 px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
                  editMode
                    ? "bg-white/80 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    : "bg-gray-100/80 text-gray-600 cursor-not-allowed"
                }`}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-500 text-sm font-medium">
                Address
              </label>
              <textarea
                rows={2}
                readOnly={!editMode}
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={`w-full mt-1 px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base resize-none ${
                  editMode
                    ? "bg-white/80 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    : "bg-gray-100/80 text-gray-600 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="text-gray-500 text-sm font-medium">Phone</label>
              <input
                type="text"
                readOnly={!editMode}
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={`w-full mt-1 px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
                  editMode
                    ? "bg-white/80 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    : "bg-gray-100/80 text-gray-600 cursor-not-allowed"
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-500 text-sm font-medium">Bio</label>
              <textarea
                rows={3}
                readOnly={!editMode}
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                className={`w-full mt-1 px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base resize-none ${
                  editMode
                    ? "bg-white/80 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    : "bg-gray-100/80 text-gray-600 cursor-not-allowed"
                }`}
                placeholder="Tell us a little about yourself"
              />
            </div>
          </div>
        </div>

        {editMode && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
            <button
              onClick={cancelEditing}
              className="px-5 py-2 rounded-lg bg-gray-200/80 text-gray-700 font-medium hover:bg-gray-300/80 transition text-sm sm:text-base"
            >
              <X size={18} className="inline mr-1" /> Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition text-sm sm:text-base"
            >
              <Check size={18} className="inline mr-1" />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
