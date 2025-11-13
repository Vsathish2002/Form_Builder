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

  // detect pages
  const isPublicFormPage = location.pathname.startsWith("/public/");
  const isAdminPage = location.pathname.startsWith("/admin/");

  /* 
     HIDE NAVBAR + FOOTER IF:
     ✔ on public form
     ✔ on admin dashboard
  */
  const hideNavbar = isPublicFormPage || isAdminPage;
  const hideFooter = isPublicFormPage || isAdminPage;

  /*
     Remove padding on pages:
     ✔ admin (because AdminLayout already has its own padding)
     ✔ public form (because you want full-screen design)
  */
  const removePadding = isPublicFormPage || isAdminPage;

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Toaster position="top-right" />

      {/* SHOW NAVBAR ONLY ON USER PAGES */}
      {!hideNavbar && <Navbar />}

      {/* REMOVE TOP SPACING ON ADMIN + PUBLIC */}
      <main className={`flex-1 w-full ${removePadding ? "" : "pt-16 sm:pt-18"}`}>
        <AppRoutes />
      </main>

      {/* SHOW FOOTER ONLY ON USER PAGES */}
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
