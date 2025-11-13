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
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("joinFormRoom", form.id);
    });

    socket.on("formFilling", (data) => {
      if (data.formId === form.id) {
        setIsLoading(true);
        setStatusMessage("Someone is filling the form...");
      }
    });

    socket.on("formSubmitted", (data) => {
      if (data.formId === form.id) {
        toast.success(`New response received for "${form.title}"`);
        setIsLoading(false);
        setStatusMessage("Form submitted!");
        setSubmittedData(data.answers || []);
      }
    });

    return () => {
      socket.disconnect();
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
      toast.error("Form is inactive. Activate it to share.");
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
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        formUrl
      )}`,
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
    {/* ===================== Form Card (Redesigned Dark Theme) ===================== */}
<motion.div
  whileHover={{ scale: 1.03, rotate: 0.5 }}
  transition={{ type: "spring", stiffness: 200, damping: 10 }}
  className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
             border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.4)]
             backdrop-blur-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]
             transition-all duration-300 flex flex-col justify-between 
             w-full max-w-sm sm:max-w-md mx-auto overflow-hidden"
>
  {/* Neon Border Effect */}
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-transparent opacity-40 blur-3xl pointer-events-none"></div>

  {/* Header */}
  <div className="flex justify-between items-start mb-3 relative z-10">
    <h3 className="text-lg md:text-xl font-semibold text-white line-clamp-1 drop-shadow">
      {form.title}
    </h3>
    <span
      className={`px-3 py-1 text-xs md:text-sm rounded-full shadow font-semibold ${
        isActive
          ? "bg-green-600/30 text-green-300 border border-green-500/30"
          : "bg-gray-600/30 text-gray-300 border border-gray-500/30"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  </div>

  {/* Description */}
  <p className="text-gray-300 mb-5 text-sm md:text-base leading-relaxed line-clamp-3 relative z-10">
    {form.description || "No description provided."}
  </p>

  {/* Buttons */}
 {/* Action Buttons (Futuristic Style) */}
<div className="flex flex-wrap gap-2 mt-auto justify-center md:justify-start relative z-10">

  {/* Responses */}
  <Link
    to={`/forms/${form.id}/responses`}
    className="group flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-full 
               bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 
               border border-blue-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(37,99,235,0.3)]
               hover:from-blue-500/40 hover:to-blue-600/40 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]
               transition-all duration-300"
  >
    <FiEye className="group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
    Responses
  </Link>

  {/* Edit */}
  <Link
    to={`/edit/${form.id}`}
    className="group flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-full 
               bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 
               border border-green-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]
               hover:from-green-500/40 hover:to-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]
               transition-all duration-300"
  >
    <FiEdit className="group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />
    Edit
  </Link>

  {/* Delete */}
  <button
    onClick={() => onDelete(form.id)}
    className="group flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-full 
               bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 
               border border-red-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(239,68,68,0.3)]
               hover:from-red-500/40 hover:to-rose-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]
               transition-all duration-300"
  >
    <FiTrash2 className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
    Delete
  </button>

  {/* Activate / Deactivate */}
  <button
    onClick={handleToggleStatus}
    className={`group flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-full 
                border backdrop-blur-sm transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-yellow-400/20 to-amber-500/20 text-yellow-300 border-yellow-500/30 hover:from-yellow-400/40 hover:to-amber-500/40 hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]"
        : "bg-gradient-to-r from-green-400/20 to-emerald-500/20 text-green-300 border-green-500/30 hover:from-green-400/40 hover:to-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
    }`}
  >
    <FiPower className="group-hover:scale-110 transition-transform duration-300" />
    {isActive ? "Deactivate" : "Activate"}
  </button>

  {/* QR */}
  <button
    onClick={handleGenerateQr}
    className="group flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-full 
               bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 
               border border-purple-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(168,85,247,0.3)]
               hover:from-purple-500/40 hover:to-violet-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]
               transition-all duration-300"
  >
    <BsQrCode className="group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300" />
    QR
  </button>

  {/* Share */}
  <button
    onClick={() => {
      if (!isActive) {
        toast.error("Form is inactive. Activate it to share.");
        return;
      }
      setShowShareModal(true);
    }}
    className="group flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-full 
               bg-gradient-to-r from-indigo-500/20 to-blue-600/20 text-indigo-300 
               border border-indigo-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(99,102,241,0.3)]
               hover:from-indigo-500/40 hover:to-blue-600/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]
               transition-all duration-300"
  >
    <FiLink className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
    Share
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
                  <div className="text-green-500 text-5xl mb-3">✅</div>
                  <p className="text-gray-800 font-semibold text-lg mb-3">
                    Form Submitted Successfully!
                  </p>
                  <div className="w-full max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-inner p-3">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="text-left px-3 py-2 border">
                            Responses
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {submittedData
                          .filter(
                            (field) =>
                              field.type !== "header" &&
                              field.type !== "paragraph" &&
                              field.value
                          )
                          .map((a, i) => {
                            let displayValue = a.value;

                            // ✅ If it's an array (checkbox or multi-select)
                            if (Array.isArray(displayValue)) {
                              displayValue = displayValue.join(", ");
                            }

                            // ✅ If it's a stringified array like '["indoor","cricket"]'
                            if (
                              typeof displayValue === "string" &&
                              displayValue.startsWith("[")
                            ) {
                              try {
                                const parsed = JSON.parse(displayValue);
                                if (Array.isArray(parsed))
                                  displayValue = parsed.join(", ");
                              } catch {
                                // ignore parsing error
                              }
                            }

                            // ✅ If it's an uploaded file — show only filename as clickable link
                            if (
                              typeof displayValue === "string" &&
                              displayValue.startsWith("/uploads/")
                            ) {
                              const filename = displayValue.split("/").pop();
                              displayValue = (
                                <a
                                  href={`http://localhost:4000${displayValue}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  {filename}
                                </a>
                              );
                            }

                            return (
                              <tr
                                key={i}
                                className="hover:bg-gray-50 transition"
                              >
                                <td className="border px-3 py-2 text-gray-700">
                                  {displayValue}
                                </td>
                              </tr>
                            );
                          })}
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
