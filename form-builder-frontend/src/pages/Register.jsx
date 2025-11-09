import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import OtpModal from "../components/OtpModal";
import {
  requestRegisterOtp,
  verifyRegisterOtp,
} from "../api/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name.trim() || !email.trim() || !password.trim()) {
    toast.error("All fields are required!");
    return;
  }

  // ✅ Password strength check
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  if (!passwordRegex.test(password)) {
    toast.error(
      "Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, and a number or special character."
    );
    return;
  }

  try {
    setLoading(true);
    await requestRegisterOtp(name, email, password);
    toast.success("OTP sent to your email!");
    setOtpModal(true);
  } catch (err) {
    toast.error(err.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async (otp) => {
    try {
      setLoading(true);
      await verifyRegisterOtp(name, email, password, otp);
      toast.success("🎉 Registration successful!");
      setOtpModal(false);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await requestRegisterOtp(name, email, password);
      toast.success("OTP resent!");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center px-4 py-8">
      <Toaster position="top-right" />
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-black text-blue-700 text-center">Create an Account</h2>
        <p className="text-center text-gray-500">Get started for free</p>

        <div className="relative">
          <UserIcon className="w-5 h-5 text-blue-400 absolute left-3 top-3.5" />
          <input
            type="text"
            className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="relative">
          <EnvelopeIcon className="w-5 h-5 text-blue-400 absolute left-3 top-3.5" />
          <input
            type="email"
            className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <LockClosedIcon className="w-5 h-5 text-blue-400 absolute left-3 top-3.5" />
          <input
  type="password"
  className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
  placeholder="Password (min 6 chars, 1 uppercase, 1 lowercase, 1 number or symbol)"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  autoComplete="new-password"
/>

        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md"
          whileHover={{ scale: 1.05 }}
        >
          {loading ? "Sending OTP..." : "Register"}
        </motion.button>
      </motion.form>

      <OtpModal
        email={email}
        open={otpModal}
        onClose={() => setOtpModal(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}
