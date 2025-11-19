import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Footer() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.8 },
    }),
  };

  return (
    <footer className="tailwind-footer w-full bg-gray-900 text-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
 
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col space-y-4"
        >
          <h1 className="text-2xl font-bold text-white">Formify</h1>
          <p className="text-gray-400 text-sm">
            Build, share, and analyze forms effortlessly. Modern, fast, and professional.
          </p>
        </motion.div>

      
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="hover:text-indigo-400 transition-colors duration-300 transform hover:translate-x-1"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/admin/dashboard"
                className="hover:text-indigo-400 transition-colors duration-300 transform hover:translate-x-1"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/my-forms"
                className="hover:text-indigo-400 transition-colors duration-300 transform hover:translate-x-1"
              >
                My Forms
              </Link>
            </li>
          </ul>
        </motion.div>

  
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Follow Us</h2>
          <div className="flex space-x-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.2, color: "#6366F1" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
     
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.5.59-2.28.69a4.1 4.1 0 001.8-2.27 8.1 8.1 0 01-2.6 1 4.07 4.07 0 00-7 3.7A11.5 11.5 0 013 4.5a4.07 4.07 0 001.27 5.43 4.06 4.06 0 01-1.84-.5v.05a4.07 4.07 0 003.26 3.98 4.1 4.1 0 01-1.83.07 4.08 4.08 0 003.81 2.83A8.2 8.2 0 012 19.54 11.57 11.57 0 008.29 21c7.55 0 11.68-6.3 11.68-11.76 0-.18-.01-.36-.02-.53A8.36 8.36 0 0024 5.1a8.19 8.19 0 01-2.36.65 4.08 4.08 0 001.8-2.27" />
              </svg>
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.2, color: "#6366F1" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
    
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2c0-2 1.2-3 3-3h2v3h-1c-1 0-1 .5-1 1v1h3l-.5 3h-2.5v7A10 10 0 0022 12z" />
              </svg>
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.2, color: "#6366F1" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
 
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      </div>

 
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="border-t border-gray-800 mt-8 pt-4 text-gray-400 text-sm text-center"
      >
        &copy; {new Date().getFullYear()} FormBuilder. All rights reserved.
      </motion.div>
    </footer>
  );
}
