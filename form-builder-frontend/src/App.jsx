import React from "react";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <main className="flex-1 w-full pt-16 sm:pt-18"> 
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
export default App;



