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

  const showToast = (type, message, opts = {}) => {
    const config = { duration: 2500, position: "top-right", ...opts };
    switch (type) {
      case "success":
        return toast.success(message, config);
      case "error":
        return toast.error(message, config);
      case "loading":
        return toast.loading(message, config);
      default:
        return toast(message, config);
    }
  };

  useEffect(() => {
    setIsActive(form.status !== "Inactive");
  }, [form.status]);

  useEffect(() => {
    // const socket = io("http://localhost:4000", {
    const socket = io("http://192.168.0.105:4000", {
      transports: ["websocket"],
      reconnection: true,
    }); 

    socket.on("connect", () => {
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

  const handleGenerateQr = async () => {
    if (!isActive) {
      showToast("error", "Form is inactive. Activate it to generate QR.");
      return;
    }
    const toastId = showToast("loading", "Generating QR code...");
    try {
      const qr = await generateFormQrCode(token, form.id);
      setQrCode(qr);
      setShowQrModal(true);
      setSubmittedData(null);
      setIsLoading(false);
      toast.dismiss(toastId);
      showToast("success", "QR code ready!", { id: toastId });
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error generating QR code:", error);
      showToast("error", "Failed to generate QR. Please try again.");
    }
  };

  const handleDownloadQr = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${form.title}-QR.png`;
    link.click();
  };

  const handleCopyLink = async () => {
    if (!isActive) {
      showToast("error", "Form is inactive. Activate it to share.");
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = formUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setShowShareModal(false);
      showToast("success", "Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link to clipboard:", error);
      showToast("error", "Failed to copy link. Please try again.");
    }
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
      <motion.div
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
             border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.4)]
             backdrop-blur-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]
             transition-all duration-300 flex flex-col justify-between
             w-full max-w-sm sm:max-w-md mx-auto overflow-hidden"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-transparent opacity-40 blur-3xl pointer-events-none"></div>

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

        <p className="text-gray-300 mb-5 text-sm md:text-base leading-relaxed line-clamp-3 relative z-10">
          {form.description || "No description provided."}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto justify-center md:justify-start relative z-10">
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
            <FiLink className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-100" />
            Share
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showQrModal && qrCode && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQrModal(false)}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl animate-ping"></div>
            </div>

            <motion.div
              className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                         border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)]
                         backdrop-blur-xl p-8 w-[95%] sm:w-[480px] flex flex-col items-center text-center
                         overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-blue-500/20 opacity-60 blur-xl pointer-events-none"></div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-transparent opacity-40 pointer-events-none"></div>

              <motion.div
                className="relative z-10 mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-2">
                  {isLoading
                    ? " Form Activity"
                    : submittedData
                    ? " Response Received!"
                    : "Scan QR Code"}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto"></div>
              </motion.div>

              {!isLoading && !submittedData && (
                <motion.div
                  className="flex flex-col items-center relative z-10"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-xl scale-110 animate-pulse"></div>
                    <motion.img
                      src={qrCode}
                      alt="QR Code"
                      className="relative w-56 h-56 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.4)]
                                 border-2 border-white/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />

                    <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-indigo-400 rounded-tl-lg"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-purple-400 rounded-tr-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-blue-400 rounded-bl-lg"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-cyan-400 rounded-br-lg"></div>
                  </div>

                  <motion.p
                    className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed max-w-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Scan this QR code with any device to instantly access and
                    fill out your form
                  </motion.p>

                  <motion.button
                    onClick={handleDownloadQr}
                    className="group relative px-8 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20
                               text-green-300 border border-green-500/30 rounded-full font-semibold
                               shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-sm
                               hover:from-green-500/40 hover:to-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]
                               transition-all duration-300 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-2">
                      <BsQrCode className="group-hover:rotate-12 transition-transform duration-300" />
                      Download QR
                    </span>
                  </motion.button>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  className="flex flex-col items-center relative z-10"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animation-delay-300"></div>
                  </div>
                  <motion.p
                    className="text-white font-semibold text-lg md:text-xl"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {statusMessage}
                  </motion.p>
                </motion.div>
              )}

              {submittedData && (
                <motion.div
                  className="w-full flex flex-col items-center relative z-10"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.8 }}
                  ></motion.div>
                  <h3 className="text-white font-bold text-xl md:text-2xl mb-4">
                    Form Submitted Successfully!
                  </h3>

                  <motion.div
                    className="w-full max-h-[300px] overflow-y-auto border border-white/10 rounded-2xl
                               bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-inner p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white">
                        <tr>
                          <th className="text-left px-4 py-3 border-b border-white/10 font-semibold">
                            📝 Form Responses
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

                            if (Array.isArray(displayValue)) {
                              displayValue = displayValue.join(", ");
                            }

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

                            if (
                              typeof displayValue === "string" &&
                              displayValue.startsWith("/uploads/")
                            ) {
                              const filename = displayValue.split("/").pop();
                              displayValue = (
                                <a
                                  href={`http://localhost:4000${displayValue}`}
                                  // href={`http://192.168.0.105:4000${displayValue}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
                                >
                                  📎 {filename}
                                </a>
                              );
                            }
                            return (
                              <motion.tr
                                key={i}
                                className="hover:bg-white/5 transition-colors border-b border-white/5"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                              >
                                <td className="px-4 py-3 text-gray-300 text-left">
                                  {displayValue}
                                </td>
                              </motion.tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </motion.div>
                </motion.div>
              )}

              <motion.button
                onClick={() => {
                  setShowQrModal(false);
                  setIsLoading(false);
                  setSubmittedData(null);
                }}
                className="relative mt-8 px-8 py-3 bg-gradient-to-r from-indigo-500/20 to-blue-600/20
                           text-indigo-300 border border-indigo-500/30 rounded-full font-semibold
                           shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm
                           hover:from-indigo-500/40 hover:to-blue-600/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]
                           transition-all duration-300 group overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="relative">✕ Close</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-blue-500/5 rounded-full blur-2xl animate-ping"></div>
            </div>

            <motion.div
              className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                         border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)]
                         backdrop-blur-xl p-8 w-[95%] sm:w-[400px] flex flex-col items-center text-center
                         overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-blue-500/20 opacity-60 blur-xl pointer-events-none"></div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-transparent opacity-40 pointer-events-none"></div>

              <motion.div
                className="relative z-10 mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-2">
                  🚀 Share Your Form
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto"></div>
              </motion.div>

              <motion.div
                className="flex flex-col gap-4 w-full relative z-10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  onClick={handleCopyLink}
                  className="group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
                             bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-white font-semibold
                             border border-gray-600/30 backdrop-blur-sm shadow-[0_0_20px_rgba(75,85,99,0.3)]
                             hover:from-gray-600/60 hover:to-gray-700/60 hover:shadow-[0_0_30px_rgba(75,85,99,0.5)]
                             transition-all duration-300 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <FiCopy className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative">📋 Copy Link</span>
                </motion.button>

                {socialButtons.map((btn, index) => (
                  <motion.a
                    key={btn.name}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
                               text-white font-semibold border backdrop-blur-sm transition-all duration-300 overflow-hidden
                               ${btn.bg} hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)]`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                      {btn.icon}
                    </span>
                    <span className="relative">{btn.name}</span>
                  </motion.a>
                ))}
              </motion.div>

              <motion.button
                onClick={() => setShowShareModal(false)}
                className="relative mt-8 px-8 py-3 bg-gradient-to-r from-indigo-500/20 to-blue-600/20
                           text-indigo-300 border border-indigo-500/30 rounded-full font-semibold
                           shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm
                           hover:from-indigo-500/40 hover:to-blue-600/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]
                           transition-all duration-300 group overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="relative">✕ Close</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
