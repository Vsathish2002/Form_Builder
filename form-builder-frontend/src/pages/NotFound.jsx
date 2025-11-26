import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-200 flex items-center justify-center px-4">
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-indigo-600 mb-8" />
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-8">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. It might have been moved,
          deleted, or you entered the wrong URL.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
