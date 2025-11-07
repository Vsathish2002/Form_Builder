import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setShowProfile(!showProfile);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setShowProfile(false);
    navigate("/");
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setShowProfile(false);
  };

  const linkClass = (path) =>
    `block px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-indigo-600 text-white shadow-md"
        : "text-gray-200 hover:bg-indigo-500 hover:text-white"
    }`;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav className="bg-indigo-900 shadow-md fixed w-full top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* ---- LOGO ---- */}
          <div
            className="text-2xl font-extrabold text-indigo-400 cursor-pointer select-none hover:text-indigo-300 transition"
            onClick={() => navigate("/")}
          >
            FormBuilder
          </div>

          {/* ---- DESKTOP MENU ---- */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" onClick={handleLinkClick} className={linkClass("/")}>
              Home
            </Link>

            {user && (
              <>
                <Link to="/my-forms" onClick={handleLinkClick} className={linkClass("/my-forms")}>
                  My Forms
                </Link>

                {/* Dashboard — accessible for both Admin & Normal User */}
                <Link
                  to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                  onClick={handleLinkClick}
                  className={linkClass(
                    user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"
                  )}
                >
                  Dashboard
                </Link>

                {/* ---- Profile Dropdown ---- */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center gap-2 text-gray-200 hover:text-white focus:outline-none"
                  >
                    {/* Avatar Circle */}
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                      {userInitial}
                    </div>
                    <span className="font-medium">{user.name || "Profile"}</span>
                  </button>

                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-700">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={handleLinkClick}
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition"
                        >
                          Edit Profile
                        </Link>
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
                <Link to="/login" onClick={handleLinkClick} className={linkClass("/login")}>
                  Login
                </Link>
                <Link to="/register" onClick={handleLinkClick} className={linkClass("/register")}>
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
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ---- MOBILE MENU ---- */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden bg-gradient-to-b from-indigo-800 to-indigo-900 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-indigo-700">
          <Link to="/" onClick={handleLinkClick} className={linkClass("/")}>
            Home
          </Link>
        </div>

        {user && (
          <div className="flex flex-col py-2 space-y-2 px-2">
            <Link to="/my-forms" onClick={handleLinkClick} className={linkClass("/my-forms")}>
              My Forms
            </Link>

            <Link
              to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
              onClick={handleLinkClick}
              className={linkClass(
                user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"
              )}
            >
              Dashboard
            </Link>

            {/* Mobile Profile Card */}
            <div className="mt-4 bg-indigo-950/50 p-4 rounded-lg text-gray-200 border border-indigo-700 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
                  {userInitial}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              <Link
                to="/profile"
                onClick={handleLinkClick}
                className="block w-full text-left px-3 py-2 mb-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm text-center"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm text-center"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {!user && (
          <div className="flex flex-col py-2 space-y-2 px-2">
            <Link to="/login" onClick={handleLinkClick} className={linkClass("/login")}>
              Login
            </Link>
            <Link to="/register" onClick={handleLinkClick} className={linkClass("/register")}>
              Register
            </Link>
          </div>
        )}
      </motion.div>
    </nav>
  );
}
