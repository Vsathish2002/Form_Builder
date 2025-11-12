import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Menu, User, X } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSave = () => {
    if (newName.trim() === "") return alert("Name cannot be empty.");
    user.name = newName; // local update
    setEditOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 relative overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isDesktop ? "lg:ml-64" : ""
        }`}
      >
        {/* === Navbar === */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Left */}
            <div className="flex items-center gap-3">
              {!isDesktop && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <Menu className="text-indigo-600" size={22} />
                </button>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
                FormBuilder
              </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              {/* Profile Button */}
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full shadow-sm hover:bg-indigo-100 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="hidden sm:flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name || "Admin"}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">
                    {user?.role || "ADMIN"}
                  </span>
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-md flex items-center gap-1 text-sm font-semibold shadow-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* === Page Content === */}
        <motion.main
          key="admin-content"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>

      {/* === Profile Edit Modal === */}
      <AnimatePresence>
        {editOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditOpen(false)}
            />
            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                    <User className="w-5 h-5" /> Edit Profile
                  </h2>
                  <button
                    onClick={() => setEditOpen(false)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditOpen(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
