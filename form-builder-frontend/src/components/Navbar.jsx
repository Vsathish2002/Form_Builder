import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const linkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-xl font-medium border transition-all duration-200 ${
      location.pathname === path
        ? "bg-white/15 text-white border-white/30 shadow-md"
        : "text-indigo-100/80 border-transparent hover:text-white hover:bg-white/10"
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-3 text-lg ${
      location.pathname === path
        ? "text-indigo-300 font-semibold"
        : "text-white hover:text-indigo-300"
    }`;

  return (
    <nav className="tailwind-navbar bg-indigo-900 shadow-md fixed w-full top-0 left-0 z-50">
      {/* Navbar Container */}
      <div className="max-w-7xl mx-auto px-6 h-18 min-h-[4.5rem] flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-3xl font-extrabold text-indigo-100 cursor-pointer flex items-center gap-2"
        >
          {/* <PlusCircleIcon className="h-6 w-6" /> */}
          FORMIFY
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex  items-center space-x-6">
          <Link to="/" className={linkClass("/")}>
            <HomeIcon className="h-5 w-5" /> Home
          </Link>

          {user && (
            <>
              {user.role !== "admin" && (
                <>
                  <Link to="/my-forms" className={linkClass("/my-forms")}>
                    <DocumentIcon className="h-5 w-5" /> My Forms
                  </Link>

                  <Link
                    to="/user/dashboard"
                    className={linkClass("/user/dashboard")}
                  >
                    <ChartBarIcon className="h-5 w-5" /> Dashboard
                  </Link>
                </>
              )}

              {/* Profile Link */}
              <Link to="/profile" className={linkClass("/profile")}>
                <User size={18} /> Profile
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-300 hover:text-red-400"
              >
                <LogOut size={18} /> Logout
              </button>
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

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {!isOpen ? (
              <Bars3Icon className="h-7 w-7 text-gray-200" />
            ) : (
              <XMarkIcon className="h-7 w-7 text-gray-200" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU FULLSCREEN PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="
              fixed inset-0
              bg-indigo-900
              text-white
              z-[9999]
              p-6
              flex flex-col
              space-y-8
              md:hidden
            "
          >
            {/* Mobile Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-3xl font-bold flex items-center gap-2">
                 FORMIFY
              </div>
              <button onClick={toggleMenu}>
                <XMarkIcon className="h-8 w-8 text-gray-200" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col space-y-6 text-lg">
              {/* Home */}
              <Link
                onClick={toggleMenu}
                to="/"
                className={mobileLinkClass("/")}
              >
                <HomeIcon className="h-6 w-6" /> Home
              </Link>

              {/* USER MENUS */}
              {user && (
                <>
                  {user.role !== "admin" && (
                    <>
                      <Link
                        onClick={toggleMenu}
                        to="/my-forms"
                        className={mobileLinkClass("/my-forms")}
                      >
                        <DocumentIcon className="h-6 w-6" /> My Forms
                      </Link>

                      <Link
                        onClick={toggleMenu}
                        to="/user/dashboard"
                        className={mobileLinkClass("/user/dashboard")}
                      >
                        <ChartBarIcon className="h-6 w-6" /> Dashboard
                      </Link>
                    </>
                  )}

                  {/* Profile */}
                  <Link
                    onClick={toggleMenu}
                    to="/profile"
                    className={mobileLinkClass("/profile")}
                  >
                    <User className="h-6 w-6" /> Profile
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-300 hover:text-red-400"
                  >
                    <LogOut className="h-6 w-6" /> Logout
                  </button>
                </>
              )}

              {/* If not logged in */}
              {!user && (
                <>
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className={mobileLinkClass("/login")}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={toggleMenu}
                    className={mobileLinkClass("/register")}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
