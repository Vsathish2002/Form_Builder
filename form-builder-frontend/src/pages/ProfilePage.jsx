import React, { useState } from "react";
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
  });

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
        // `http://192.168.0.105:4000/users/update/${user.id}`,
        { name: formData.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
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
    });
    setEditMode(false);
  };


  const updateField = (key, value) =>
    setFormData({ ...formData, [key]: value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 flex justify-center items-center px-4 py-12">

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-xl rounded-3xl p-10 max-w-3xl w-full border border-indigo-100"
      >
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex justify-center items-center shadow-md">
            <User size={42} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-indigo-700">My Profile</h2>
            <p className="text-gray-500 text-sm">Manage your personal details</p>
          </div>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="ml-auto flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <Edit3 size={18} /> Edit
            </button>
          )}
        </div>

  
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
            <div>
              <label className="text-gray-500 text-sm font-medium">Full Name</label>
              <input
                type="text"
                readOnly={!editMode}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                  editMode
                    ? "bg-white border-gray-300 focus:ring-indigo-500"
                    : "bg-gray-100 text-gray-600 cursor-not-allowed"
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
                className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

    
        {editMode && (
          <div className="flex justify-end gap-4 mt-10">
            <button
              onClick={cancelEditing}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
            >
              <X size={18} className="inline mr-1" /> Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
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
