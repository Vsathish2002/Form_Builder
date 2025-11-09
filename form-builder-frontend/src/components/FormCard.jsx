
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { generateFormQrCode } from "../api/forms";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import toast from "react-hot-toast";
import {
  FiLink,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCopy,
  FiPower,
} from "react-icons/fi";
import { BsQrCode, BsWhatsapp, BsFacebook, BsTwitter } from "react-icons/bs";

export default function FormCard({ form, onDelete, onStatusChange }) {
  const [qrCode, setQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isActive, setIsActive] = useState(form.status !== "Inactive");
  const [statusMessage, setStatusMessage] = useState("Waiting for response...");
  const [submittedData, setSubmittedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const formUrl = `${window.location.origin}/public/${form.slug}`;

  // ✅ WebSocket Setup
  useEffect(() => {
    const socket = io("http://localhost:4000", {
    // const socket = io("http://192.168.0.105:4000", {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("joinFormRoom", form.id);
    });

    socket.on("formFilling", (data) => {
      if (data.formId === form.id) {
        console.log("🟡 Someone started filling this form...");
        // toast.loading("Someone started filling the form...", { id: "filling" });
        setIsLoading(true);
        setStatusMessage("Someone is filling the form...");
      }
    });

    socket.on("formSubmitted", (data) => {
      if (data.formId === form.id) {
        console.log("✅ Form submitted:", data);
        toast.success(`New response received for "${form.title}"`);
        toast.dismiss("filling");
        setIsLoading(false);
        setStatusMessage("Form submitted!");
        setSubmittedData(data.answers || []);
      }
    });

    return () => {
      socket.disconnect();
      toast.dismiss("filling");
    };
  }, [form.id]);

  // ✅ Generate QR
  const handleGenerateQr = async () => {
    if (!isActive) {
      toast.error("Form is inactive. Activate it to generate QR.");
      return;
    }

    try {
      const qr = await generateFormQrCode(token, form.id);
      setQrCode(qr);
      setShowQrModal(true);
      setSubmittedData(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${form.title}-QR.png`;
    link.click();
  };

  const handleCopyLink = () => {
    if (!isActive) {
      alert("Form is inactive. Activate it to share.");
      return;
    }
    navigator.clipboard.writeText(formUrl);
    setShowShareModal(false);
    toast.success("Link copied to clipboard!");
  };

  const handleToggleStatus = () => {
    const newStatus = isActive ? "Inactive" : "Active";
    setIsActive(!isActive);
    if (onStatusChange) onStatusChange(form.id, newStatus);
  };

  const socialButtons = [
    {
      name: "WhatsApp",
      icon: <BsWhatsapp />,
      url: `https://wa.me/?text=${encodeURIComponent(formUrl)}`,
      bg: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Twitter",
      icon: <BsTwitter />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}`,
      bg: "bg-blue-400 hover:bg-blue-500",
    },
    {
      name: "Facebook",
      icon: <BsFacebook />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        formUrl
      )}`,
      bg: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <>
      {/* ===================== Form Card ===================== */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-white/70 to-gray-50/30 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg transition-all duration-300 p-6 flex flex-col justify-between w-full sm:w-[350px] md:w-[400px]"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-semibold text-gray-900">{form.title}</h3>
          <span
            className={`px-3 py-1 text-white text-sm rounded-full shadow font-medium ${
              isActive
                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                : "bg-gradient-to-r from-gray-400 to-gray-600"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
          {form.description || "No description provided."}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <Link
            to={`/forms/${form.id}/responses`}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition"
          >
            <FiEye /> Responses
          </Link>

          <Link
            to={`/edit/${form.id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-green-50 text-green-700 font-medium hover:bg-green-100 transition"
          >
            <FiEdit /> Edit
          </Link>

          <button
            onClick={() => onDelete(form.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-red-50 text-red-700 font-medium hover:bg-red-100 transition"
          >
            <FiTrash2 /> Delete
          </button>

          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full font-medium transition ${
              isActive
                ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            <FiPower /> {isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={handleGenerateQr}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition"
          >
            <BsQrCode /> QR
          </button>

          <button
            onClick={() => {
              if (!isActive) {
                alert("Form is inactive. Activate it to share.");
                return;
              }
              setShowShareModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition"
          >
            <FiLink /> Share
          </button>
        </div>
      </motion.div>

      {/* ===================== QR Modal ===================== */}
      <AnimatePresence>
        {showQrModal && qrCode && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              className="bg-gradient-to-b from-white to-gray-100 rounded-3xl shadow-2xl p-8 w-[90%] sm:w-[420px] flex flex-col items-center text-center relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {isLoading
                  ? "Form is being filled..."
                  : submittedData
                  ? "Response Received!"
                  : "Scan QR to Open Form"}
              </h2>

              {!isLoading && !submittedData && (
                <>
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-52 h-52 rounded-2xl shadow-lg mb-4 border border-gray-300"
                  />
                  <p className="text-gray-600 mb-4">
                    Scan this QR with any device to open your form.
                  </p>
                  <button
                    onClick={handleDownloadQr}
                    className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:opacity-90 transition font-medium shadow-md"
                  >
                    Download QR
                  </button>
                </>
              )}

              {isLoading && (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-500 mb-4"></div>
                  <p className="text-gray-700 font-medium text-lg">
                    {statusMessage}
                  </p>
                </div>
              )}

              {submittedData && (
                <div className="w-full flex flex-col items-center">
                  <div className="text-green-500 text-5xl mb-3 animate-bounce">
                    ✅
                  </div>
                  <p className="text-gray-800 font-semibold text-lg mb-3">
                    Form Submitted Successfully!
                  </p>
                  <div className="w-full max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-inner p-3">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="text-left px-3 py-2 border">Field</th>
                          <th className="text-left px-3 py-2 border">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submittedData.map((a, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="border px-3 py-2">{a.label}</td>
                            <td className="border px-3 py-2">{a.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowQrModal(false);
                  setIsLoading(false);
                  setSubmittedData(null);
                }}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition font-semibold shadow-md"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center space-y-4 w-80"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-2">Share Form</h3>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-white font-semibold hover:bg-gray-900 transition transform shadow-md"
                >
                  <FiCopy /> Copy Link
                </button>

                {socialButtons.map((btn) => (
                  <a
                    key={btn.name}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white font-semibold ${btn.bg} hover:scale-105 transition transform shadow-md`}
                  >
                    {btn.icon} {btn.name}
                  </a>
                ))}
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition mt-4 shadow-md"
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
