// src/pages/Forms/MyForms.jsx
import React, { useEffect, useState } from "react";
import { getUserForms, deleteForm, updateForm } from "../../api/forms";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FormCard from "../../components/FormCard";
import toast from "react-hot-toast";
import {
  LayoutGrid,
  List,
  ArrowDownAZ,
  ArrowUpZA,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function MyForms() {
  const [forms, setForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await getUserForms(token);
      setForms(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch forms:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
    window.scrollTo(0, 0);
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    try {
      await deleteForm(token, id);
      setForms(forms.filter((f) => f.id !== id));
      toast.success("Form deleted successfully!");
    } catch (err) {
      console.error("Failed to delete form:", err);
      toast.error("Failed to delete form. Please try again.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Get the full form data with fields to preserve them
      const response = await fetch(`http://localhost:4000/forms/id/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fullFormData = await response.json();

      await updateForm(token, id, {
        status: newStatus,
        title: fullFormData.title,
        description: fullFormData.description,
        isPublic: fullFormData.isPublic,
        fields: fullFormData.fields?.[0]?.fields || [], // Preserve existing fields
      });

      setForms(
        forms.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
      );
      toast.success(
        `Form ${
          newStatus === "Active" ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (err) {
      console.error("Failed to update form status:", err);
      toast.error("Failed to update form status. Please try again.");
    }
  };

  const filteredForms = forms
    .filter((form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      if (titleA < titleB) return sortOrder === "asc" ? -1 : 1;
      if (titleA > titleB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredForms.length / pageSize));
  const paginatedForms = filteredForms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder, pageSize]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 md:p-10">
      <motion.div
        className="flex flex-col gap-4 md:flex-row md:gap-0 justify-between items-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl md:text-4xl font-extrabold text-indigo-800 mb-4 md:mb-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          My Forms
        </motion.h1>
        <motion.div
          className="flex items-center gap-3 flex-wrap justify-center md:justify-end"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="hidden md:flex items-center bg-white/70 rounded-full shadow-inner p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              <List size={16} /> List
            </button>
          </div>
          <div className="flex items-center bg-white/70 rounded-full shadow-inner p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setSortOrder("asc")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition ${
                sortOrder === "asc"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              <ArrowDownAZ size={16} /> A-Z
            </button>
            <button
              type="button"
              onClick={() => setSortOrder("desc")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition ${
                sortOrder === "desc"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              <ArrowUpZA size={16} /> Z-A
            </button>
          </div>
          <div className="bg-white/80 rounded-full shadow-inner px-3 py-1 text-sm">
            <label className="mr-2 text-indigo-700 font-semibold">Show</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent font-semibold text-indigo-700 focus:outline-none"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size} className="text-black">
                  {size}
                </option>
              ))}
            </select>
          </div>
          <Link
            to="/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
          >
            + Create New Form
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <input
          type="text"
          placeholder="Search forms by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md mx-auto block px-4 py-2 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </motion.div>

      <motion.p
        className="text-center text-indigo-700 mb-8 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        Manage your forms easily, update them, or delete any outdated ones. Keep
        your workflow organized!
      </motion.p>

      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading forms...</p>
      ) : (
        <AnimatePresence>
          <motion.div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
            layout
          >
            {paginatedForms.length > 0 ? (
              paginatedForms.map((form) => (
                <motion.div
                  key={form.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <FormCard
                    form={form}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                </motion.div>
              ))
            ) : (
              <motion.p
                className="text-center text-gray-500 col-span-full mt-10 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {searchQuery
                  ? "No forms match your search."
                  : 'No forms created yet. Click "Create New Form" to start your first one!'}
              </motion.p>
            )}
          </motion.div>
          {filteredForms.length > 0 && (
            <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-indigo-700">
              <p className="text-sm">
                Showing {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, filteredForms.length)} of{" "}
                {filteredForms.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 shadow-inner text-indigo-700 disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-sm font-semibold">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 shadow-inner text-indigo-700 disabled:opacity-50"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
