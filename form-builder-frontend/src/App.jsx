// import React from "react";
// import { useLocation } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import AppRoutes from "./routes/AppRoutes";
// import Footer from "./components/Footer";
// import { Toaster } from "react-hot-toast";

// function App() {
//   const location = useLocation();

//   // ✅ Hide Navbar and Footer on /public/* routes
//   const isPublicFormPage = location.pathname.startsWith("/public/");

//   return (
//     <div className="w-full min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
//       <Toaster position="top-right" />
//       {!isPublicFormPage && <Navbar />}
//       <main className="flex-1 w-full pt-16 sm:pt-18">
//         <AppRoutes />
//       </main> 
//       {!isPublicFormPage && <Footer />}
//     </div>
//   );
// }

// export default App;
import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();

  // ✅ Hide Navbar and Footer on /public/* and /admin/* routes
  const isPublicFormPage = location.pathname.startsWith("/public/");
  const isAdminPage = location.pathname.startsWith("/admin/");

  const hideNavbarAndFooter = isPublicFormPage || isAdminPage;

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Toaster position="top-right" />
      {!hideNavbarAndFooter && <Navbar />}

      {/* ✅ Remove padding if on admin page */}
      <main className={`flex-1 w-full ${!isAdminPage ? "pt-16 sm:pt-18" : ""}`}>
        <AppRoutes />
      </main>

      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
}

export default App;
