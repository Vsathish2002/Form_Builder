import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Menu } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* === Sidebar === */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-0 left-0 z-50 h-full w-64"
          >
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Main Content Area === */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
        {/* === Navbar === */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200">
          {/* ✅ No mx-auto — just padding inside shifted area */}
          <div className="w-full flex items-center justify-between px-4 sm:px-8 py-3">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100 focus:outline-none lg:hidden"
              >
                <Menu className="text-indigo-600" size={22} />
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
                FormBuilder
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full shadow-sm">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name || "Admin"}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">
                    {user?.role || "ADMIN"}
                  </span>
                </div>
              </div>
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

        {/* === Main Page Content === */}
        <motion.main
          key="admin-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
