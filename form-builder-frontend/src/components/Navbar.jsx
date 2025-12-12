import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  DocumentIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, HelpCircle, Sparkles } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const linkClass = (path) =>
    `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group ${location.pathname === path
      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-4 text-lg font-medium transition-all duration-300 ${location.pathname === path
      ? "text-indigo-400 bg-indigo-500/10 px-4 py-3 rounded-xl border-l-4 border-indigo-400"
      : "text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl"
    }`;

  return (
    <motion.nav
      className={`tailwind-navbar fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50'
          : 'bg-white shadow-sm border-b border-gray-100'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
                FORMIFY
              </span>
              <span className="text-xs text-gray-500 font-medium">Smart Form Builder</span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link to="/" className={linkClass("/")}>
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </Link>

            {user && (
              <>
                {user.role !== "admin" && (
                  <>
                    <Link to="/my-forms" className={linkClass("/my-forms")}>
                      <DocumentIcon className="h-4 w-4" />
                      <span>My Forms</span>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                    </Link>

                    <Link to="/user/dashboard" className={linkClass("/user/dashboard")}>
                      <ChartBarIcon className="h-4 w-4" />
                      <span>Dashboard</span>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                    </Link>
                  </>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Profile</span>
                    <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${profileDropdown ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {profileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">My Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Settings className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Settings</span>
                        </Link>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 w-full"
                          >
                            <LogOut className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-600">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!user && (
              <>
                <Link to="/login" className={linkClass("/login")}>
                  <span>Login</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <motion.button
              onClick={toggleMenu}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {!isOpen ? (
                <Bars3Icon className="h-6 w-6 text-gray-700" />
              ) : (
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU FULLSCREEN PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white z-[9999] lg:hidden"
          >
            {/* Mobile Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">FORMIFY</span>
                  <span className="text-xs text-indigo-200 font-medium">Smart Form Builder</span>
                </div>
              </div>
              <motion.button
                onClick={toggleMenu}
                className="p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </motion.button>
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-2 overflow-y-auto h-full pb-24">
              {/* Home */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  onClick={toggleMenu}
                  to="/"

                  className={mobileLinkClass("/")}
                >
                  <HomeIcon className="h-6 w-6" />
                  <span>Home</span>
                </Link>
              </motion.div>

              {/* USER MENUS */}
              {user && (
                <>
                  {user.role !== "admin" && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          onClick={toggleMenu}
                          to="/my-forms"
                          className={mobileLinkClass("/my-forms")}
                        >
                          <DocumentIcon className="h-6 w-6" />
                          <span>My Forms</span>
                        </Link>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Link
                          onClick={toggleMenu}
                          to="/user/dashboard"
                          className={mobileLinkClass("/user/dashboard")}
                        >
                          <ChartBarIcon className="h-6 w-6" />
                          <span>Dashboard</span>
                        </Link>
                      </motion.div>
                    </>
                  )}

                  {/* Profile */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      onClick={toggleMenu}
                      to="/profile"
                      className={mobileLinkClass("/profile")}
                    >
                      <User className="h-6 w-6" />
                      <span>Profile</span>
                    </Link>
                  </motion.div>

                  {/* Settings */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link
                      onClick={toggleMenu}
                      to="/settings"
                      className={mobileLinkClass("/settings")}
                    >
                      <Settings className="h-6 w-6" />
                      <span>Settings</span>
                    </Link>
                  </motion.div>

                  {/* Logout */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 text-lg font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-3 rounded-xl transition-all duration-300 w-full"
                    >
                      <LogOut className="h-6 w-6" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </>
              )}

              {/* If not logged in */}
              {!user && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/login"
                      onClick={toggleMenu}
                      className={mobileLinkClass("/login")}
                    >
                      <User className="h-6 w-6" />
                      <span>Login</span>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      to="/register"
                      onClick={toggleMenu}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105"
                    >
                      <Sparkles className="h-5 w-5" />
                      <span>Get Started</span>
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
              <div className="flex justify-center space-x-6">
                <button className="text-indigo-300 hover:text-white transition-colors duration-300">
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button className="text-indigo-300 hover:text-white transition-colors duration-300">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
