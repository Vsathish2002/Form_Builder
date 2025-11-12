import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminSidebar({ onClose, isOpen }) {
  const { logout } = useAuth();

  return (
    <aside className={`fixed left-0 top-0 z-50 w-64 h-full bg-gradient-to-b from-indigo-900 via-indigo-800 to-blue-700 text-white flex flex-col shadow-xl transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-indigo-700">
        <h1 className="text-xl font-bold tracking-wide">Admin Panel</h1>
        <button
          onClick={onClose}
          className="lg:hidden text-white hover:text-gray-300 p-1 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-2">
        <NavLink
          to="/admin/dashboard"
          onClick={() => { if (window.innerWidth < 1024) onClose(); }}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-indigo-700 shadow-md"
                : "hover:bg-indigo-700 hover:shadow"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/forms"
          onClick={() => { if (window.innerWidth < 1024) onClose(); }}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-indigo-700 shadow-md"
                : "hover:bg-indigo-700 hover:shadow"
            }`
          }
        >
          <FileText size={18} />
          Manage Forms
        </NavLink>

        <NavLink
          to="/admin/users"
          onClick={() => { if (window.innerWidth < 1024) onClose(); }}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-indigo-700 shadow-md"
                : "hover:bg-indigo-700 hover:shadow"
            }`
          }
        >
          <Users size={18} />
          Manage Users
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-indigo-700">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 rounded-md py-2 flex items-center justify-center gap-2 font-semibold text-sm shadow-md transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
