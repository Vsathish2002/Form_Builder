import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { User, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleProfile = () => setShowProfile((prev) => !prev);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setShowProfile(false);
    navigate("/");
  };

  const handleSave = () => {
    if (newName.trim() === "") return alert("Name cannot be empty.");
    user.name = newName; // Local name update
    setEditOpen(false);
  };

  const linkClass = (path) =>
    `block px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-indigo-600 text-white shadow-md"
        : "text-gray-200 hover:bg-indigo-500 hover:text-white"
    }`;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav className="bg-indigo-900 shadow-md fixed w-full top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* ---- LOGO ---- */}
          <div
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold text-indigo-400 cursor-pointer select-none hover:text-indigo-300 transition"
          >
Formify
          </div>

          {/* ---- DESKTOP MENU ---- */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>

            {user && (
              <>
                {user.role === "admin" ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={linkClass("/admin/dashboard")}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/create-form"
                      className={linkClass("/admin/create-form")}
                    >
                      Create Form
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/my-forms" className={linkClass("/my-forms")}>
                      My Forms
                    </Link>
                    <Link
                      to="/user/dashboard"
                      className={linkClass("/user/dashboard")}
                    >
                      Dashboard
                    </Link>
                  </>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center gap-2 text-gray-200 hover:text-white focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                      {userInitial}
                    </div>
                    <span className="font-medium">
                      {user.name || "Profile"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-700">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>

                        <button
                          onClick={() => {
                            setEditOpen(true);
                            setShowProfile(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 transition"
                        >
                          Edit Profile
                        </button>

                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!user && (
              <>
                <Link to="/login" className={linkClass("/login")}>
                  Login
                </Link>
                <Link to="/register" className={linkClass("/register")}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* ---- MOBILE MENU BUTTON ---- */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-200 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ---- MOBILE MENU ---- */}
      {/* ---- MOBILE MENU ---- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed top-0 left-0 w-full h-full bg-indigo-950/95 backdrop-blur-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-800">
              <h1
                onClick={() => navigate("/")}
                className="text-xl font-extrabold text-indigo-300 cursor-pointer"
              >
                FormBuilder
              </h1>
              <button
                onClick={toggleMenu}
                className="text-gray-200 hover:text-white p-2 rounded-md transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col flex-1 px-6 py-5 space-y-4 overflow-y-auto">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="text-gray-200 text-base font-medium hover:text-white transition"
              >
                Home
              </Link>

              {user ? (
                <>
                  {user.role === "admin" ? (
                    <>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-200 text-base font-medium hover:text-white transition"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/create-form"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-200 text-base font-medium hover:text-white transition"
                      >
                        Create Form
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/my-forms"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-200 text-base font-medium hover:text-white transition"
                      >
                        My Forms
                      </Link>
                      <Link
                        to="/user/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-200 text-base font-medium hover:text-white transition"
                      >
                        Dashboard
                      </Link>
                    </>
                  )}

                  {/* Divider */}
                  <hr className="border-indigo-800 my-3" />

                  <button
                    onClick={() => {
                      setEditOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-center py-2 rounded-md font-medium text-indigo-400 border border-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 rounded-md font-medium text-red-400 border border-red-600 hover:bg-red-600 hover:text-white transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-200 text-base font-medium hover:text-white transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-200 text-base font-medium hover:text-white transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Centered Edit Profile Modal === */}
      {/* === Centered Edit Profile Modal === */}
      <AnimatePresence>
        {editOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditOpen(false)}
            />

            {/* Modal (true mid-center) */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ minHeight: "100vh" }} // ensures full height even if content scrolls
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative mx-4 sm:mx-0">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                    <User className="w-5 h-5" /> Edit Profile
                  </h2>
                  <button
                    onClick={() => setEditOpen(false)}
                    className="text-gray-500 hover:text-red-500 transition"
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

                {/* Buttons */}
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
    </nav>
  );
}
