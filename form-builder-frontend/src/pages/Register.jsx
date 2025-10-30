import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      return alert('All fields are required!');
    }

    setLoading(true);
    try {
      const registerRes = await registerUser(name, email, password);
      if (registerRes?.user?.id) {
        setSuccessMessage('Registration Successful!');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        alert(registerRes.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center px-4 py-8">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full space-y-6"
        aria-label="registration form"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-black text-blue-700 text-center">Create an Account</h2>
        <p className="text-center text-gray-500">Get started for free</p>

        <div className="relative">
          <UserIcon className="w-5 h-5 text-blue-400 absolute left-3 top-3.5 pointer-events-none" />
          <input
            type="text"
            className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="relative">
          <EnvelopeIcon className="w-5 h-5 text-blue-400 absolute left-3 top-3.5 pointer-events-none" />
          <input
            type="email"
            className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <LockClosedIcon className="w-5 h-5 text-blue-400 absolute left-3 top-3.5 pointer-events-none" />
          <input
            type="password"
            className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold py-3 transition focus:outline-none focus:ring-4 focus:ring-blue-300 shadow"
          whileHover={{ scale: 1.05 }}
        >
          {loading ? 'Registering...' : 'Register'}
        </motion.button>

        {successMessage && (
          <motion.p
            className="text-green-600 font-semibold text-center mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {successMessage}
          </motion.p>
        )}

        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Already have an account?</span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </div>
      </motion.form>
    </div>
  );
}
