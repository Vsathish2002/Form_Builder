// src/pages/Forms/CreateForm.jsx
import React, { useState } from 'react';
import { createForm } from '../../api/forms';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormEditor from '../../components/FormEditor';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // optional icon for back button

export default function CreateForm() {
  const [form, setForm] = useState({ title: '', description: '', fields: [] });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert('Form title is required.');
      return;
    }
    setLoading(true);

    try {
      const newForm = await createForm(token, {
        title: form.title,
        description: form.description,
        fields: [],
        isPublic: false,
      });
      navigate(`/edit/${newForm.id}`);
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Failed to create form. Please try again.');
      setLoading(false);
    }
  };

  // Animations
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-purple-50 to-pink-50 relative flex flex-col items-center justify-start py-12 px-4 md:px-8 overflow-hidden">

      {/* Decorative floating circles */}
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-purple-200 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10 md:p-12 relative z-10"
      >
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)} // goes back to previous page
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center mb-6 text-indigo-600 font-semibold hover:text-indigo-800"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </motion.button>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          className="text-4xl md:text-5xl font-extrabold text-center text-blue-700 mb-4"
        >
          Create a New Form
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-center text-gray-500 mb-8"
        >
          Add a title and description, then start building your custom form using the editor below. It's fast, responsive, and flexible!
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormEditor form={form} setForm={setForm} />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-300"
          >
            {loading ? 'Creating...' : 'Create Form & Add Fields'}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
          className="mt-6 text-center text-gray-500 text-sm"
        >
          Need help? <span className="text-blue-600 font-semibold cursor-pointer hover:underline">See documentation</span> for tips on creating effective forms.
        </motion.div>
      </motion.div>
    </div>
  );
}
