import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer";

function App() {
  const location = useLocation();

  // ✅ Hide Navbar and Footer on /public/* routes
  const isPublicFormPage = location.pathname.startsWith("/public/");

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      {!isPublicFormPage && <Navbar />}
      <main className="flex-1 w-full pt-16 sm:pt-18">
        <AppRoutes />
      </main>
      {!isPublicFormPage && <Footer />}
    </div>
  );
}

export default App;
