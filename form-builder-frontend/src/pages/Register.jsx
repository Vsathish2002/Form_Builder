import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const data = await registerUser(name, email, password);
    if (data.access_token) {
      navigate('/login');
    } else {
      alert(data.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full space-y-6"
        aria-label="registration form"
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold py-3 transition focus:outline-none focus:ring-4 focus:ring-blue-300 shadow"
        >
          Register
        </button>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Already have an account?</span>
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
        <div className="text-center mt-2">
          <Link to="/forgot-password" className="text-gray-500 hover:text-blue-500">
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
