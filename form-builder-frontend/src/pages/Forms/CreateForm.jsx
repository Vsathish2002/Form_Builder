
import React, { useState } from "react";
import { createForm } from "../../api/forms";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormEditor from "../../components/FormEditor";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import createPageBg from "../../assets/createbg.png";

export default function CreateForm() {
  const [form, setForm] = useState({ title: "", description: "", fields: [] });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Form title is required!");
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

      toast.success("🎉 Form created successfully!");

      setTimeout(() => navigate(`/edit/${newForm.id}`), 1000);
    } catch (error) {
      console.error("Failed to create form:", error);
      toast.error("Failed to create form. Please try again.");
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-start py-12 px-4 md:px-8 overflow-hidden"
      style={{
        backgroundImage: `url("${createPageBg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background image opacity overlay */}
      <div className="absolute inset-0 bg-blue-900/85"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="w-full max-w-2xl bg-gradient-to-br from-blue-50/95 via-white/95 to-indigo-50/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 md:p-12 relative z-10 border-2 border-blue-300/60"
      >
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="!flex !items-center mb-6 !px-3 !py-2 sm:!px-6 sm:!py-3 !bg-gradient-to-r !from-blue-500 !to-indigo-500 !shadow-xl !rounded-full !border-2 !border-blue-300 hover:!from-blue-600 hover:!to-indigo-600 hover:!shadow-2xl !transition-all !duration-300 !no-underline"
        >
          <ArrowLeftIcon className="!w-4 !h-4 sm:!w-6 sm:!h-6 !mr-1 sm:!mr-2 !text-white !drop-shadow-lg" />
          <span className="!text-white !font-bold !text-sm sm:!text-lg !drop-shadow-lg">Back</span>
        </motion.button>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          className="text-4xl md:text-5xl !font-black text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-6 tracking-wide"
          style={{ fontFamily: 'Playfair Display, Georgia, serif', textShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
        >
          Create a New Form
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-center !text-blue-600/80 mb-10 !text-lg !font-medium"
        >
          Fast, responsive, and professional results.
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormEditor form={form} setForm={setForm} />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="!w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 !text-white !font-bold !py-4 !rounded-2xl !shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:from-gray-400 disabled:to-gray-500 !text-lg !border !border-blue-500/30"
          >
            {loading ? "Creating..." : "Create Form & Add Fields"}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.4 },
          }}
          className="mt-8 text-center !text-blue-600/70 !text-sm"
        >
          Need help?{" "}
          <a
            href="https://formbuilder.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="!text-blue-700 !font-bold hover:!underline transition-colors"
          >
            See documentation
          </a>{" "}
          for tips on creating effective forms.
        </motion.div>
      </motion.div>
    </div>
  );
}
