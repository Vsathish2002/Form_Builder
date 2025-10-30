import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { generateFormQrCode } from "../api/forms";
import { useAuth } from "../context/AuthContext";
import { FiLink, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { BsQrCode } from "react-icons/bs";

export default function FormCard({ form, onDelete }) {
  const [qrCode, setQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const { token } = useAuth();

  // Generate QR
  const handleGenerateQr = async () => {
    try {
      const qr = await generateFormQrCode(token, form.id);
      setQrCode(qr);
      setShowQrModal(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  // Download QR
  const handleDownloadQr = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${form.title}-QR.png`;
    link.click();
  };

  return (
    <>
      {/* Card */}
      <motion.div
        className="bg-white/40 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col justify-between w-full sm:w-[350px] md:w-[400px]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-gray-900">{form.title}</h3>
          <span className="px-3 py-1 bg-gradient-to-r from-indigo-400 to-purple-500 text-white text-sm rounded-full shadow">
            {form.status || "Active"}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">{form.description}</p>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-2">
          <Link
            to={`/forms/${form.id}/responses`}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 hover:scale-105 transition transform shadow-sm"
          >
            <FiEye /> Responses
          </Link>
          <Link
            to={`/edit/${form.id}`}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold hover:bg-green-200 hover:scale-105 transition transform shadow-sm"
          >
            <FiEdit /> Edit
          </Link>
          <button
            onClick={() => onDelete(form.id)}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold hover:bg-red-200 hover:scale-105 transition transform shadow-sm"
          >
            <FiTrash2 /> Delete
          </button>
          <button
            onClick={handleGenerateQr}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 hover:scale-105 transition transform shadow-sm"
          >
            <BsQrCode /> QR
          </button>
          <Link
            to={`/public/${form.slug}`}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 hover:scale-105 transition transform shadow-sm"
          >
            <FiLink /> Share
          </Link>
        </div>
      </motion.div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQrModal && qrCode && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={qrCode}
                alt="QR Code"
                className="w-48 h-48 rounded-xl shadow-lg mb-4"
              />
              {/* Download button only visible after QR is generated */}
              <button
                onClick={handleDownloadQr}
                className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition mb-2"
              >
                Download QR
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
