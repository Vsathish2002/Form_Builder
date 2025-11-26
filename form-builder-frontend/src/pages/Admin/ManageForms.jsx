import React, { useEffect, useState } from "react";
import { getForms, deleteForm } from "../../api/forms";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, FileText, User, Search } from "lucide-react";

export default function ManageForms() {
  const { token } = useAuth();
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getForms(token);
        const arr = Array.isArray(res) ? res : [];
        setForms(arr);
        setFilteredForms(arr);
      } catch (err) {
        console.error(err);
        setForms([]);
        setFilteredForms([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) {
      setFilteredForms(forms);
      return;
    }
    const filtered = forms.filter(
      (f) =>
        (f.title || "").toLowerCase().includes(q) ||
        (f.owner?.email || "").toLowerCase().includes(q)
    );
    setFilteredForms(filtered);
  }, [forms, searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    try {
      setDeletingId(id);
      await deleteForm(token, id);
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      // optionally show toast here
    } finally {
      setDeletingId(null);
    }
  };

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
          Manage Forms
        </h2>
        <p className="text-gray-500 text-sm">
          Total Forms:{" "}
          <span className="font-semibold text-indigo-600">
            {filteredForms.length}
          </span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            aria-label="Search forms by title or owner email"
            placeholder="Search by title or owner email..."
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
            Loading forms...
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? "No forms match your search." : "No forms found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm sm:text-base md:text-base">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left w-[40%] md:w-[35%]">Title</th>
                  <th className="p-3 text-left w-[30%] md:w-[25%]">Owner</th>
                  <th className="p-3 text-center w-[15%] md:w-[20%]">
                    Created
                  </th>
                  <th className="p-3 text-center w-[15%] md:w-[20%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredForms.map((f, index) => (
                    <motion.tr
                      key={f.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-t hover:bg-indigo-50 transition-colors duration-200`}
                    >
                      {/* Title */}
                      <td className="p-3 truncate">
                        <div className="flex items-center gap-2">
                          <FileText
                            size={18}
                            className="text-indigo-600 flex-shrink-0"
                          />
                          <span className="font-semibold text-gray-800 truncate">
                            {f.title}
                          </span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="p-3 truncate">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User
                            size={16}
                            className="text-gray-500 flex-shrink-0"
                          />
                          <span className="truncate">
                            {f.owner?.email || "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="p-3 text-center text-gray-600 whitespace-nowrap">
                        {f.createdAt
                          ? new Date(f.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(f.id)}
                          disabled={deletingId === f.id}
                          className={`${
                            deletingId === f.id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          } text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1 mx-auto shadow transition`}
                        >
                          <Trash2 size={14} />
                          {deletingId === f.id ? "Deleting..." : "Delete"}
                        </motion.button>
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
        {filteredForms.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-white rounded-lg shadow-md border border-gray-100 p-4 space-y-2"
          >
            <div className="font-semibold text-indigo-700 flex items-center gap-2">
              <FileText size={16} /> {f.title}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <User size={14} /> {f.owner?.email || "Unknown"}
            </div>
            <div className="text-xs text-gray-500">
              Created:{" "}
              {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "N/A"}
            </div>
            <button
              onClick={() => handleDelete(f.id)}
              disabled={deletingId === f.id}
              className={`${
                deletingId === f.id
                  ? "bg-gray-400"
                  : "bg-red-500 hover:bg-red-600"
              } text-white text-sm rounded-md px-3 py-1 mt-2 w-full`}
            >
              {deletingId === f.id ? "Deleting..." : "Delete"}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
