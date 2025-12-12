import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";


function App() {
  const location = useLocation();

  const isPublicFormPage = location.pathname.startsWith("/public/");
  const isAdminPage = location.pathname.startsWith("/admin/");
  const isEditPage = location.pathname.startsWith("/edit/");

  const hideNavbar = isPublicFormPage || isAdminPage || isEditPage;
  const hideFooter = isPublicFormPage || isAdminPage || isEditPage;
  const removePadding = isPublicFormPage || isAdminPage || isEditPage;

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Toaster position="top-right" />

      {!hideNavbar && <Navbar />}

      <main
        className={`flex-1 w-full ${removePadding ? "" : "pt-14 sm:pt-12"}`}
      >
        <AppRoutes />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
