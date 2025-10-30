// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const location = useLocation();

//   const linkClass = (path) =>
//     `px-3 py-2 rounded-md text-sm font-medium ${
//       location.pathname === path
//         ? 'bg-blue-600 text-white'
//         : 'text-gray-300 hover:bg-gray-700 hover:text-white'
//     }`;

//   return (
//     <nav className="bg-gray-900 shadow-md p-4 fixed w-full top-0 z-50">
//       <div className="max-w-7xl mx-auto flex justify-between items-center">
//         <h1 className="text-2xl font-extrabold text-blue-500 cursor-default select-none">MyApp</h1>
//         <div className="flex items-center space-x-6">
//           <Link to="/" className={linkClass('/')}>Home</Link>

//           {user ? (
//             <>
//               {/* Dashboard link */}
//               {user.role === 'admin' && (
//                 <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
//                   Dashboard
//                 </Link>
//               )}
//               {user.role === 'user' && (
//                 <Link to="/user/dashboard" className={linkClass('/user/dashboard')}>
//                   Dashboard
//                 </Link>
//               )}

//               {/* My Forms link */}
//               <Link to="/my-forms" className={linkClass('/my-forms')}>
//                 My Forms
//               </Link>

//               {/* Welcome message */}
//               <span className="text-gray-200 px-3 py-2 rounded-md text-sm font-medium cursor-default">
//                 Welcome, <strong>{user.name}</strong>
//               </span>

//               {/* Logout button */}
//               <button
//                 onClick={logout}
//                 className="bg-red-600 hover:bg-red-700 transition duration-200 text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-400"
//                 aria-label="Logout"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" className={linkClass('/login')}>Login</Link>
//               <Link to="/register" className={linkClass('/register')}>Register</Link>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // 👈 Always go to home page after logout
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-900 shadow-md p-4 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-blue-500 cursor-default select-none">MyApp</h1>
        <div className="flex items-center space-x-6">
          <Link to="/" className={linkClass('/')}>Home</Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                  Dashboard
                </Link>
              )}
              {user.role === 'user' && (
                <Link to="/user/dashboard" className={linkClass('/user/dashboard')}>
                  Dashboard
                </Link>
              )}

              <Link to="/my-forms" className={linkClass('/my-forms')}>
                My Forms
              </Link>

              <span className="text-gray-200 px-3 py-2 rounded-md text-sm font-medium cursor-default">
                Welcome, <strong>{user.name}</strong>
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 transition duration-200 text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass('/login')}>Login</Link>
              <Link to="/register" className={linkClass('/register')}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
