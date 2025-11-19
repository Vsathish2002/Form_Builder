import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import OtpModal from "../components/OtpModal";
import { requestRegisterOtp, verifyRegisterOtp } from "../api/auth";

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

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must include uppercase, lowercase, and a number or special character."
      );
      return;
    }

    try {
      setLoading(true);
      await requestRegisterOtp(name, email, password);
      toast.success("✅ OTP sent to your email!");
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
      toast.success("🔁 OTP resent!");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-700">
            Create Your Account
          </h2>
          <p className="text-gray-500 mt-2">Join us and get started instantly</p>
        </div>

  
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <UserIcon className="w-5 h-5 text-blue-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Full Name"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-blue-500 absolute left-3 top-3.5" />
            <input
              type="email"
              placeholder="Email Address"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-blue-500 absolute left-3 top-3.5" />
            <input
              type="password"
              placeholder="Password (Min 6 chars, 1 uppercase, 1 symbol)"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:opacity-90 transition"
          >
            {loading ? "Sending OTP..." : "Register"}
          </motion.button>
        </form>

      
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium hover:underline"
          >
            Login here
          </button>
        </p>
      </motion.div>

   
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
