import React, { useState } from 'react';
import { forgotPassword, verifyOtp, resetPassword } from '../api/auth';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await forgotPassword(email);
    setLoading(false);
    if (data.message === 'OTP sent to your email') {
      setStep(2);
      setMessage('OTP sent to your email. Check your inbox.');
    } else {
      setMessage(data.message || 'Failed to send OTP');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await verifyOtp(email, otp);
    setLoading(false);
    if (data.message === 'OTP verified successfully') {
      setStep(3);
      setMessage('OTP verified. Enter your new password.');
    } else {
      setMessage(data.message || 'Invalid OTP');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    const data = await resetPassword(email, otp, newPassword);
    setLoading(false);
    if (data.message === 'Password reset successfully') {
      setMessage('Password reset successfully. You can now login.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      setMessage(data.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <motion.div
        className="bg-white shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-green-700">Forgot Password</h2>
          <p className="text-gray-500 mt-2">
            {step === 1 && 'Enter your email to receive OTP'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Enter your new password'}
          </p>
        </div>

        {message && (
          <div className={`text-center p-3 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 text-green-400 absolute left-3 top-3.5 pointer-events-none" />
              <input
                type="email"
                className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold py-3 transition focus:outline-none focus:ring-4 focus:ring-green-300 shadow"
              whileHover={{ scale: 1.05 }}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </motion.button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold py-3 transition focus:outline-none focus:ring-4 focus:ring-green-300 shadow"
              whileHover={{ scale: 1.05 }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </motion.button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 text-green-400 absolute left-3 top-3.5 pointer-events-none" />
              <input
                type="password"
                className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                placeholder="New Password (min 6 chars, 1 uppercase, 1 lowercase, 1 number)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 text-green-400 absolute left-3 top-3.5 pointer-events-none" />
              <input
                type="password"
                className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold py-3 transition focus:outline-none focus:ring-4 focus:ring-green-300 shadow"
              whileHover={{ scale: 1.05 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-green-600 hover:underline flex items-center justify-center">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
