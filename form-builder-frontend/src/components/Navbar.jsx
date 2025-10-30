import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false); // close mobile menu
    navigate('/');
  };

  const handleLinkClick = () => setIsOpen(false); // close mobile menu on link click
  const toggleMenu = () => setIsOpen(!isOpen);

  const linkClass = (path) =>
    `block px-4 py-2 rounded-md text-base font-medium transition ${
      location.pathname === path
        ? 'bg-indigo-600 text-white'
        : 'text-gray-200 hover:bg-indigo-500 hover:text-white'
    }`;

  return (
    <nav className="bg-indigo-900 shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-extrabold text-indigo-400 cursor-default select-none">
              FormBuilder
            </h1>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" onClick={handleLinkClick} className={linkClass('/')}>
              Home
            </Link>
            {user && (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                  onClick={handleLinkClick}
                  className={linkClass(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')}
                >
                  Dashboard
                </Link>
                <Link to="/my-forms" onClick={handleLinkClick} className={linkClass('/my-forms')}>
                  My Forms
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={handleLinkClick} className={linkClass('/login')}>
                  Login
                </Link>
                <Link to="/register" onClick={handleLinkClick} className={linkClass('/register')}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-200 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-indigo-800 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-screen py-2' : 'max-h-0'
        }`}
      >
        <Link to="/" onClick={handleLinkClick} className={linkClass('/')}>
          Home
        </Link>
        {user && (
          <>
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
              onClick={handleLinkClick}
              className={linkClass(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')}
            >
              Dashboard
            </Link>
            <Link to="/my-forms" onClick={handleLinkClick} className={linkClass('/my-forms')}>
              My Forms
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200"
            >
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" onClick={handleLinkClick} className={linkClass('/login')}>
              Login
            </Link>
            <Link to="/register" onClick={handleLinkClick} className={linkClass('/register')}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
