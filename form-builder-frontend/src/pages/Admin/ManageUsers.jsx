// src/pages/Admin/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import { getUsers } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Search } from "lucide-react";

export default function ManageUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getUsers(token);
        const arr = Array.isArray(res) ? res : [];
        setUsers(arr);
        setFilteredUsers(arr);
      } catch (err) {
        console.error(err);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // 🔍 Filter search
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role?.name || u.role || "").toLowerCase().includes(q)
    );
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-2 sm:mb-0">
          Manage Users
        </h2>
        <p className="text-gray-500 text-sm">
          Total Users:{" "}
          <span className="font-semibold text-indigo-600">
            {filteredUsers.length}
          </span>
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hidden sm:block">
        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? "No users match your search." : "No users found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm sm:text-base">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left w-[35%] md:w-[30%]">Name</th>
                  <th className="p-3 text-left w-[35%] md:w-[35%]">Email</th>
                  <th className="p-3 text-left w-[30%] md:w-[35%]">Role</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((u, index) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-t hover:bg-indigo-50 transition-colors duration-200`}
                    >
                      {/* Name */}
                      <td className="p-3 truncate">
                        <div className="flex items-center gap-2">
                          <User
                            size={18}
                            className="text-indigo-600 flex-shrink-0"
                          />
                          <span className="font-semibold text-gray-800 truncate">
                            {u.name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-3 truncate">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail
                            size={16}
                            className="text-gray-500 flex-shrink-0"
                          />
                          <span className="truncate">{u.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3 truncate">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Shield
                            size={16}
                            className="text-gray-500 flex-shrink-0"
                          />
                          <span className="truncate">
                            {u.role?.name || u.role || "—"}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="block sm:hidden mt-4 gap-4">
        {filteredUsers.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-white rounded-lg shadow-md border border-gray-100 p-4 space-y-2"
          >
            <div className="font-semibold text-indigo-700 flex items-center gap-2">
              <User size={16} /> {u.name || "—"}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Mail size={14} /> {u.email}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Shield size={14} /> {u.role?.name || u.role || "—"}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
