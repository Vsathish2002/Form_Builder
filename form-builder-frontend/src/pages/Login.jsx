import React, { useState } from 'react';
import { loginUser } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const data = await loginUser(email, password);
    setLoading(false);
    if (data.access_token) {
      login(data.user, data.access_token);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } else {
      alert(data.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md space-y-6"
        aria-label="login form"
      >
        <h2 className="text-3xl font-extrabold text-green-700 text-center">Welcome Back</h2>
        <p className="text-center text-gray-500">Sign in to access your dashboard</p>

        <div className="relative">
          <EnvelopeIcon className="w-5 h-5 text-green-400 absolute left-3 top-3.5 pointer-events-none" />
          <input
            type="email"
            className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <LockClosedIcon className="w-5 h-5 text-green-400 absolute left-3 top-3.5 pointer-events-none" />
          <input
            type="password"
            className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="flex items-center text-gray-600 text-sm">
              <input type="checkbox" className="mr-2 accent-green-600" />
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="text-green-500 hover:text-green-600 text-sm">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold py-3 transition focus:outline-none focus:ring-4 focus:ring-green-300 shadow"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-gray-600 text-sm pt-1">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-green-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
