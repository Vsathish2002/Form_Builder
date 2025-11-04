// src/pages/Forms/MyForms.jsx
import React, { useEffect, useState } from 'react';
import { getUserForms, deleteForm, updateForm } from '../../api/forms';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FormCard from '../../components/FormCard';

export default function MyForms() {
  const [forms, setForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await getUserForms(token);
      setForms(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await deleteForm(token, id);
      setForms(forms.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete form:', err);
      alert('Delete failed');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateForm(token, id, { status: newStatus });
      setForms(forms.map(f => f.id === id ? { ...f, status: newStatus } : f));
    } catch (err) {
      console.error('Failed to update form status:', err);
      alert('Status update failed');
    }
  };

  // Filtered forms based on search query
  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 md:p-10">
      
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-center mb-8"
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
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
          >
            + Create New Form
          </Link>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
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

      {/* Info / Subtitle */}
      <motion.p
        className="text-center text-indigo-700 mb-8 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        Manage your forms easily, update them, or delete any outdated ones. Keep your workflow organized!
      </motion.p>

      {/* Forms Grid */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading forms...</p>
      ) : (
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {filteredForms.length > 0 ? (
              filteredForms.map((form) => (
                <motion.div
                  key={form.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <FormCard form={form} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                </motion.div>
              ))
            ) : (
              <motion.p
                className="text-center text-gray-500 col-span-full mt-10 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {searchQuery ? 'No forms match your search.' : 'No forms created yet. Click "Create New Form" to start your first one!'}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
